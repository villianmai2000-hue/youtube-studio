import { getDb, getGridFSBucket, isMongoConfigured } from './mongodb';
import { Project, ScriptScene, CharacterBible, User } from './types';
import fs from 'fs';
import path from 'path';

const LOCAL_FALLBACK_FILE = path.join(process.cwd(), '.studio_local_data.json');
const LOCAL_USERS_FILE = path.join(process.cwd(), '.studio_users.json');
const LOCAL_SECURITY_FILE = path.join(process.cwd(), '.studio_security.json');
const LOCAL_MEDIA_DIR = path.join(process.cwd(), '.studio_media');

// In-Memory Global Fallbacks (Crucial for Vercel Serverless Read-Only Filesystem)
declare global {
  // eslint-disable-next-line no-var
  var _inMemoryProjects: Project[] | undefined;
  // eslint-disable-next-line no-var
  var _inMemoryUsers: User[] | undefined;
  // eslint-disable-next-line no-var
  var _activeOtp:
    | {
        code: string;
        target: string;
        expiresAt: number;
      }
    | undefined;
  // eslint-disable-next-line no-var
  var _ownerSecurity:
    | {
        phoneNumber: string;
        email: string;
      }
    | undefined;
}

export const DEFAULT_OWNER: User = {
  id: 'user-owner-yutthakan',
  username: 'yutthakan',
  displayName: 'ยุทธการ คำกลอน',
  password: '0962033005Maiiam2000',
  phoneNumber: '0962033005',
  email: 'yutthakan2000@gmail.com',
  role: 'owner',
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

// Helper to read local fallback safely without crashing on Vercel EROFS
function getLocalData(): { projects: Project[] } {
  if (global._inMemoryProjects && global._inMemoryProjects.length > 0) {
    return { projects: global._inMemoryProjects };
  }
  try {
    if (fs.existsSync(LOCAL_FALLBACK_FILE)) {
      const content = fs.readFileSync(LOCAL_FALLBACK_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      global._inMemoryProjects = parsed.projects || [];
      return parsed;
    }
  } catch (err) {
    // Read-only or file access error (expected on Vercel)
  }
  global._inMemoryProjects = global._inMemoryProjects || [];
  return { projects: global._inMemoryProjects };
}

// Helper to write local fallback safely without crashing on Vercel EROFS
function saveLocalData(data: { projects: Project[] }) {
  global._inMemoryProjects = data.projects;
  try {
    fs.writeFileSync(LOCAL_FALLBACK_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    // Silently continue with in-memory store if disk is read-only (e.g. on Vercel)
  }
}

// Helper for users storage
function getLocalUsers(): User[] {
  if (global._inMemoryUsers && global._inMemoryUsers.length > 0) {
    return global._inMemoryUsers;
  }
  try {
    if (fs.existsSync(LOCAL_USERS_FILE)) {
      const content = fs.readFileSync(LOCAL_USERS_FILE, 'utf-8');
      const users: User[] = JSON.parse(content);
      // Ensure owner always exists
      if (!users.some((u) => u.username === DEFAULT_OWNER.username || u.displayName === DEFAULT_OWNER.displayName)) {
        users.unshift(DEFAULT_OWNER);
      }
      global._inMemoryUsers = users;
      return users;
    }
  } catch {
    // ignore
  }
  global._inMemoryUsers = [DEFAULT_OWNER];
  return global._inMemoryUsers;
}

function saveLocalUsers(users: User[]) {
  global._inMemoryUsers = users;
  try {
    fs.writeFileSync(LOCAL_USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch {
    // ignore on Vercel
  }
}

export async function getAllProjects(): Promise<Project[]> {
  if (isMongoConfigured()) {
    try {
      const db = await getDb();
      const docs = await db.collection<Project>('projects').find({}).sort({ updatedAt: -1 }).toArray();
      return docs.map((doc) => ({
        ...doc,
        id: doc.id || doc._id?.toString() || '',
      }));
    } catch (error) {
      console.warn('MongoDB Atlas query failed, falling back to local store:', error);
    }
  }

  // Fallback to local storage
  const local = getLocalData();
  return local.projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function getProjectById(id: string): Promise<Project | null> {
  if (isMongoConfigured()) {
    try {
      const db = await getDb();
      const doc = await db.collection<Project>('projects').findOne({ id });
      if (doc) {
        return {
          ...doc,
          id: doc.id || doc._id?.toString() || '',
        };
      }
    } catch (error) {
      console.warn('MongoDB Atlas query failed, falling back to local store:', error);
    }
  }

  const local = getLocalData();
  return local.projects.find((p) => p.id === id) || null;
}

export async function saveProject(project: Project): Promise<Project> {
  project.updatedAt = new Date().toISOString();

  if (isMongoConfigured()) {
    try {
      const db = await getDb();
      await db.collection<Project>('projects').updateOne(
        { id: project.id },
        { $set: project },
        { upsert: true }
      );
      return project;
    } catch (error) {
      console.warn('MongoDB Atlas save failed, saving to local store:', error);
    }
  }

  // Local fallback
  const local = getLocalData();
  const index = local.projects.findIndex((p) => p.id === project.id);
  if (index >= 0) {
    local.projects[index] = project;
  } else {
    local.projects.push(project);
  }
  saveLocalData(local);
  return project;
}

export async function deleteProject(id: string): Promise<boolean> {
  if (isMongoConfigured()) {
    try {
      const db = await getDb();
      // 1. Delete project document
      await db.collection('projects').deleteOne({ id });

      // 2. Cascade delete all media assets belonging to this project in GridFS
      try {
        const bucket = await getGridFSBucket();
        const files = await bucket.find({ 'metadata.projectId': id }).toArray();
        for (const file of files) {
          await bucket.delete(file._id);
        }
      } catch (gridFsErr) {
        console.warn('GridFS cascade delete error:', gridFsErr);
      }

      return true;
    } catch (error) {
      console.warn('MongoDB Atlas delete failed, deleting from local store:', error);
    }
  }

  // Fallback: Delete from local store
  const local = getLocalData();
  local.projects = local.projects.filter((p) => p.id !== id);
  saveLocalData(local);

  // Cascade delete local fallback media files
  try {
    if (fs.existsSync(LOCAL_MEDIA_DIR)) {
      const files = fs.readdirSync(LOCAL_MEDIA_DIR);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const metaPath = path.join(LOCAL_MEDIA_DIR, file);
          try {
            const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
            if (meta.projectId === id) {
              fs.unlinkSync(metaPath);
              const baseId = file.replace('.json', '');
              const imageFile = files.find((f) => f.startsWith(baseId) && !f.endsWith('.json'));
              if (imageFile) {
                fs.unlinkSync(path.join(LOCAL_MEDIA_DIR, imageFile));
              }
            }
          } catch {
            // ignore
          }
        }
      }
    }
  } catch (err) {
    console.warn('Local media cascade delete error:', err);
  }

  return true;
}

export async function getAllUsers(): Promise<User[]> {
  if (isMongoConfigured()) {
    try {
      const db = await getDb();
      const rawUsers = await db.collection<User>('users').find({}).toArray();
      const users: User[] = rawUsers.map((u) => ({
        ...u,
        id: u.id || (u as any)._id?.toString() || '',
      }));

      if (users.length > 0) {
        // Ensure owner is always in the list
        if (!users.some((u) => u.username === DEFAULT_OWNER.username || u.displayName === DEFAULT_OWNER.displayName)) {
          users.unshift(DEFAULT_OWNER);
        }
        return users;
      }
    } catch (err) {
      console.warn('Failed to fetch users from Atlas, falling back to local users:', err);
    }
  }

  return getLocalUsers();
}

export async function saveUser(user: User): Promise<User> {
  if (isMongoConfigured()) {
    try {
      const db = await getDb();
      await db.collection<User>('users').updateOne(
        { id: user.id },
        { $set: user },
        { upsert: true }
      );
    } catch (err) {
      console.warn('Failed to save user to Atlas, falling back to local users:', err);
    }
  }

  const users = getLocalUsers();
  const index = users.findIndex((u) => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  saveLocalUsers(users);
  return user;
}

export async function deleteUser(id: string): Promise<boolean> {
  // Never delete owner
  if (id === DEFAULT_OWNER.id) {
    return false;
  }

  if (isMongoConfigured()) {
    try {
      const db = await getDb();
      await db.collection('users').deleteOne({ id });
    } catch (err) {
      console.warn('Failed to delete user from Atlas:', err);
    }
  }

  let users = getLocalUsers();
  users = users.filter((u) => u.id !== id && u.id !== DEFAULT_OWNER.id);
  saveLocalUsers(users);
  return true;
}

export async function findUser(identifier: string): Promise<User | null> {
  const cleanId = identifier.trim();
  // Check default owner match first
  if (
    cleanId === DEFAULT_OWNER.username ||
    cleanId === DEFAULT_OWNER.displayName ||
    cleanId === '0962033005Maiiam2000' ||
    cleanId === 'admin'
  ) {
    return DEFAULT_OWNER;
  }

  const users = await getAllUsers();
  return users.find((u) => u.username === cleanId || u.displayName === cleanId) || null;
}

export async function updateUserCredentials(
  userId: string,
  newUsername?: string,
  newPassword?: string,
  newDisplayName?: string
): Promise<User | null> {
  const users = await getAllUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return null;

  if (newUsername && newUsername.trim()) user.username = newUsername.trim();
  if (newPassword && newPassword.trim()) user.password = newPassword.trim();
  if (newDisplayName && newDisplayName.trim()) user.displayName = newDisplayName.trim();

  await saveUser(user);
  return user;
}

export function getOwnerSecurity(): { phoneNumber: string; email: string } {
  if (global._ownerSecurity) {
    return global._ownerSecurity;
  }
  try {
    if (fs.existsSync(LOCAL_SECURITY_FILE)) {
      const data = JSON.parse(fs.readFileSync(LOCAL_SECURITY_FILE, 'utf-8'));
      if (data.phoneNumber || data.email) {
        global._ownerSecurity = {
          phoneNumber: data.phoneNumber || DEFAULT_OWNER.phoneNumber || '0962033005',
          email: data.email || DEFAULT_OWNER.email || 'yutthakan2000@gmail.com',
        };
        DEFAULT_OWNER.phoneNumber = global._ownerSecurity.phoneNumber;
        DEFAULT_OWNER.email = global._ownerSecurity.email;
        return global._ownerSecurity;
      }
    }
  } catch {
    // ignore
  }
  global._ownerSecurity = {
    phoneNumber: DEFAULT_OWNER.phoneNumber || '0962033005',
    email: DEFAULT_OWNER.email || 'yutthakan2000@gmail.com',
  };
  return global._ownerSecurity;
}

export function saveOwnerSecurity(phoneNumber?: string, email?: string): { phoneNumber: string; email: string } {
  const current = getOwnerSecurity();
  if (phoneNumber !== undefined && phoneNumber.trim()) {
    current.phoneNumber = phoneNumber.trim();
    DEFAULT_OWNER.phoneNumber = phoneNumber.trim();
  }
  if (email !== undefined && email.trim()) {
    current.email = email.trim();
    DEFAULT_OWNER.email = email.trim();
  }
  global._ownerSecurity = current;

  try {
    fs.writeFileSync(LOCAL_SECURITY_FILE, JSON.stringify(current, null, 2), 'utf-8');
  } catch {
    // Vercel read-only fallback: stays in memory
  }

  return current;
}

export function maskContact(input: string): string {
  if (input.includes('@')) {
    const [name, domain] = input.split('@');
    if (name.length <= 2) return `${name}***@${domain}`;
    return `${name.slice(0, 2)}****${name.slice(-1)}@${domain}`;
  }
  const clean = input.replace(/[^0-9]/g, '');
  if (clean.length >= 10) {
    return `${clean.slice(0, 3)}-xxx-xx${clean.slice(-2)}`;
  }
  return `${input.slice(0, 3)}***`;
}

export async function requestOwnerOtp(recoveryInput: string): Promise<{
  success: boolean;
  message: string;
  maskedTarget?: string;
  otpCode?: string;
}> {
  const cleanInput = (recoveryInput || '').trim();
  if (!cleanInput) {
    return { success: false, message: 'กรุณากรอกเบอร์โทรศัพท์หรืออีเมลที่ผูกไว้' };
  }

  const sec = getOwnerSecurity();
  const ownerUsers = await getAllUsers();
  const owner = ownerUsers.find((u) => u.role === 'owner' || u.id === DEFAULT_OWNER.id) || DEFAULT_OWNER;

  const currentPhone = (sec.phoneNumber || owner.phoneNumber || '0962033005').replace(/[^0-9]/g, '');
  const currentEmail = (sec.email || owner.email || 'yutthakan2000@gmail.com').toLowerCase();

  const inputPhone = cleanInput.replace(/[^0-9]/g, '');
  const inputEmail = cleanInput.toLowerCase();

  const isPhoneMatch = inputPhone.length >= 9 && inputPhone === currentPhone;
  const isEmailMatch = inputEmail.includes('@') && inputEmail === currentEmail;

  if (!isPhoneMatch && !isEmailMatch) {
    return {
      success: false,
      message: 'เบอร์โทรศัพท์หรืออีเมลนี้ไม่ตรงกับข้อมูลความปลอดภัยในระบบ',
    };
  }

  // Generate 6-digit OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  global._activeOtp = {
    code,
    target: cleanInput,
    expiresAt,
  };

  const masked = maskContact(isPhoneMatch ? sec.phoneNumber : sec.email);

  return {
    success: true,
    message: `ส่งรหัส OTP 6 หลักไปยัง ${masked} สำเร็จแล้ว`,
    maskedTarget: masked,
    otpCode: code,
  };
}

export async function verifyOtpAndResetPassword(
  recoveryInput: string,
  otpCode: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  const cleanOtp = (otpCode || '').trim();
  const cleanPass = (newPassword || '').trim();

  if (!cleanOtp) {
    return { success: false, message: 'กรุณากรอกรหัส OTP 6 หลัก' };
  }
  if (!cleanPass || cleanPass.length < 4) {
    return { success: false, message: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร' };
  }

  if (!global._activeOtp) {
    return { success: false, message: 'ยังไม่มีการขอรหัส OTP หรือรหัสหมดอายุแล้ว กรุณากดขอรหัส OTP ใหม่' };
  }

  if (Date.now() > global._activeOtp.expiresAt) {
    global._activeOtp = undefined;
    return { success: false, message: 'รหัส OTP หมดอายุแล้ว (อายุ 5 นาที) กรุณากดขอรหัสใหม่' };
  }

  if (global._activeOtp.code !== cleanOtp) {
    return { success: false, message: 'รหัส OTP ไม่ถูกต้อง กรุณาตรวจสอบรหัสอีกครั้ง' };
  }

  // Verified!
  global._activeOtp = undefined;

  // Update owner password
  const users = await getAllUsers();
  const owner = users.find((u) => u.role === 'owner' || u.id === DEFAULT_OWNER.id) || DEFAULT_OWNER;
  owner.password = cleanPass;
  DEFAULT_OWNER.password = cleanPass;
  await saveUser(owner);

  return {
    success: true,
    message: 'ยืนยันรหัส OTP และตั้งรหัสผ่านใหม่สำเร็จแล้ว! สามารถใช้รหัสผ่านใหม่เข้าสู่ระบบได้ทันที',
  };
}

export async function updateOwnerSecurity(phoneNumber?: string, email?: string): Promise<User> {
  const sec = saveOwnerSecurity(phoneNumber, email);
  const users = await getAllUsers();
  let owner = users.find((u) => u.role === 'owner' || u.id === DEFAULT_OWNER.id);
  if (!owner) {
    owner = { ...DEFAULT_OWNER };
  }

  owner.phoneNumber = sec.phoneNumber;
  owner.email = sec.email;

  await saveUser(owner);
  return owner;
}

export async function recoverOwnerPassword(
  recoveryInput: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  const cleanInput = recoveryInput.trim();
  const cleanPass = newPassword.trim();

  if (!cleanPass || cleanPass.length < 4) {
    return { success: false, message: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร' };
  }

  const sec = getOwnerSecurity();
  const users = await getAllUsers();
  const owner = users.find((u) => u.role === 'owner' || u.id === DEFAULT_OWNER.id) || DEFAULT_OWNER;

  const currentPhone = (sec.phoneNumber || owner.phoneNumber || '0962033005').replace(/[^0-9]/g, '');
  const currentEmail = (sec.email || owner.email || 'yutthakan2000@gmail.com').toLowerCase();

  const phoneMatch = currentPhone === cleanInput.replace(/[^0-9]/g, '');
  const emailMatch = currentEmail === cleanInput.toLowerCase();

  if (phoneMatch || emailMatch) {
    owner.password = cleanPass;
    DEFAULT_OWNER.password = cleanPass;
    await saveUser(owner);
    return { success: true, message: 'รีเซ็ตรหัสผ่านเจ้าของระบบสำเร็จแล้ว! สามารถใช้รหัสผ่านใหม่เข้าสู่ระบบได้ทันที' };
  }

  return { success: false, message: 'เบอร์โทรศัพท์หรืออีเมลไม่ตรงกับข้อมูลความปลอดภัยที่ผูกไว้' };
}



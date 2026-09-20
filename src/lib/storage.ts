import { getDb, getGridFSBucket, isMongoConfigured } from './mongodb';
import { Project, ScriptScene, CharacterBible, User } from './types';
import fs from 'fs';
import path from 'path';

const LOCAL_FALLBACK_FILE = path.join(process.cwd(), '.studio_local_data.json');
const LOCAL_USERS_FILE = path.join(process.cwd(), '.studio_users.json');
const LOCAL_MEDIA_DIR = path.join(process.cwd(), '.studio_media');

// In-Memory Global Fallbacks (Crucial for Vercel Serverless Read-Only Filesystem)
declare global {
  // eslint-disable-next-line no-var
  var _inMemoryProjects: Project[] | undefined;
  // eslint-disable-next-line no-var
  var _inMemoryUsers: User[] | undefined;
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

export async function updateOwnerSecurity(phoneNumber?: string, email?: string): Promise<User> {
  const users = await getAllUsers();
  let owner = users.find((u) => u.role === 'owner' || u.id === DEFAULT_OWNER.id);
  if (!owner) {
    owner = { ...DEFAULT_OWNER };
  }

  if (phoneNumber !== undefined) owner.phoneNumber = phoneNumber.trim();
  if (email !== undefined) owner.email = email.trim();

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

  const users = await getAllUsers();
  const owner = users.find((u) => u.role === 'owner' || u.id === DEFAULT_OWNER.id) || DEFAULT_OWNER;

  const phoneMatch = owner.phoneNumber && owner.phoneNumber.replace(/[^0-9]/g, '') === cleanInput.replace(/[^0-9]/g, '');
  const emailMatch = owner.email && owner.email.toLowerCase() === cleanInput.toLowerCase();

  // Also allow default phone match
  const defaultPhoneMatch = cleanInput.replace(/[^0-9]/g, '') === '0962033005';

  if (phoneMatch || emailMatch || defaultPhoneMatch) {
    owner.password = cleanPass;
    DEFAULT_OWNER.password = cleanPass;
    await saveUser(owner);
    return { success: true, message: 'รีเซ็ตรหัสผ่านเจ้าของระบบสำเร็จแล้ว! สามารถใช้รหัสผ่านใหม่เข้าสู่ระบบได้ทันที' };
  }

  return { success: false, message: 'เบอร์โทรศัพท์หรืออีเมลไม่ตรงกับข้อมูลความปลอดภัยที่ผูกไว้' };
}



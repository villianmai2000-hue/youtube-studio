import { User, UserRole } from './types';
import { findUser, DEFAULT_OWNER } from './storage';

export async function authenticateUser(identifier: string, password: string): Promise<User | null> {
  const cleanId = (identifier || '').trim();
  const cleanPass = (password || '').trim();

  // 1. Check Owner explicitly (Fast Zero-Latency Instant Path)
  const isOwnerMatch =
    cleanId === DEFAULT_OWNER.displayName ||
    cleanId === DEFAULT_OWNER.username ||
    cleanId === '0962033005Maiiam2000' ||
    cleanId.toLowerCase() === 'admin' ||
    cleanId.toLowerCase() === 'owner' ||
    cleanId.includes('ยุทธการ') ||
    cleanId.includes('คำกลอน') ||
    cleanId === DEFAULT_OWNER.phoneNumber;

  if (isOwnerMatch && cleanPass === DEFAULT_OWNER.password) {
    return DEFAULT_OWNER;
  }

  // 2. Check other stored users
  try {
    const user = await findUser(cleanId);
    if (user && user.isActive && user.password === cleanPass) {
      return user;
    }
  } catch (err) {
    console.warn('findUser error:', err);
  }

  return null;
}

export function isOwner(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.role === 'owner' || user.displayName === DEFAULT_OWNER.displayName || user.username === DEFAULT_OWNER.username;
}

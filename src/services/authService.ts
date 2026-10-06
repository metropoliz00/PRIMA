import { User, UserRole } from '../types/auth';
import { DEMO_USERS } from '../data/initialData';
import { getRemoteUsers, createRemoteUser, updateRemoteUser } from './appscript';

const USERS_KEY = 'prima_registered_users';
const SESSION_KEY = 'prima_current_session';

export function getStoredUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load users from localStorage', e);
  }
  return [];
}

/**
 * Sync users from Google Apps Script Spreadsheet database
 */
export async function syncUsersWithGAS(): Promise<User[]> {
  try {
    const remote = await getRemoteUsers();
    if (remote && Array.isArray(remote)) {
      // Filter out empty rows or test entries without valid role
      const validRemote = remote.filter((u: any) => u && u.username && u.role) as User[];
      
      const local = getStoredUsers();
      const map = new Map<string, User>();
      local.forEach((u) => {
        if (u && u.username) map.set(u.username.toLowerCase(), u);
      });
      
      const syncedUsers: User[] = validRemote.map((u: any) => {
        const key = u.username.toLowerCase();
        const existing = map.get(key);
        const school = typeof u.schoolName === 'string' && u.schoolName.trim().length > 0
          ? u.schoolName
          : typeof u['Nama Sekolah'] === 'string' && u['Nama Sekolah'].trim().length > 0
            ? u['Nama Sekolah']
            : typeof existing?.schoolName === 'string'
              ? existing.schoolName
              : '';

        const rawTeaching = u.teachingClass || u.teaching_class || u['Kelas'] || u.kelas;
        const teaching = typeof rawTeaching === 'string' && rawTeaching.trim().length > 0
          ? rawTeaching
          : Array.isArray(rawTeaching)
            ? rawTeaching.join(', ')
            : typeof existing?.teachingClass === 'string'
              ? existing.teachingClass
              : '';

        const gradeVal = u.grade !== undefined && u.grade !== null && !isNaN(Number(u.grade)) && Number(u.grade) > 0
          ? Number(u.grade)
          : (existing?.grade !== undefined && existing?.grade !== null && !isNaN(Number(existing.grade)) && Number(existing.grade) > 0)
            ? Number(existing.grade)
            : undefined;
        
        return {
          id: u.id || existing?.id || `usr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: u.name || existing?.name || u.username,
          username: u.username,
          passwordHash: u.passwordHash || existing?.passwordHash || u.password || '',
          role: u.role as UserRole,
          status: (u.status as any) || 'ACTIVE',
          email: u.email || existing?.email || '',
          avatar: u.avatar || existing?.avatar || '/prima_avatar_1791033365222.jpg',
          grade: gradeVal,
          studentNumber: u.studentNumber || existing?.studentNumber || '',
          nip: u.nip || existing?.nip || '',
          schoolName: school,
          teachingClass: teaching,
          subjectsHandled: Array.isArray(u.subjectsHandled) ? u.subjectsHandled : existing?.subjectsHandled || [],
          classesHandled: Array.isArray(u.classesHandled) ? u.classesHandled : existing?.classesHandled || [],
          createdAt: u.createdAt || existing?.createdAt || new Date().toISOString(),
          updatedAt: u.updatedAt || new Date().toISOString(),
        };
      });

      saveUsers(syncedUsers);

      // Also refresh active session if logged in
      const current = getCurrentUser();
      if (current) {
        const updatedSession = syncedUsers.find(u => u.username.toLowerCase() === current.username.toLowerCase());
        if (updatedSession) {
          setCurrentUserSession(updatedSession);
        }
      }
      return syncedUsers;
    }
  } catch (err) {
    console.warn('[Sync] Failed to sync users with Google Apps Script', err);
  }
  return getStoredUsers();
}

export function saveUsers(users: User[]): void {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users', e);
  }
}

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse current session', e);
  }
  return null;
}

export function setCurrentUserSession(user: User | null): void {
  if (!user) {
    localStorage.removeItem(SESSION_KEY);
  } else {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }
}

export function authenticateUser(usernameInput: string, passwordInput: string): { user: User | null; error: string | null } {
  const users = getStoredUsers();
  const found = users.find(
    (u) => u.username.toLowerCase() === usernameInput.trim().toLowerCase()
  );

  // Requirement: Generic validation message when username/password fails
  if (!found || found.passwordHash !== passwordInput) {
    return { user: null, error: 'Username atau password tidak sesuai.' };
  }

  if (found.status === 'INACTIVE') {
    return { user: null, error: 'Akun Anda sedang nonaktif. Silakan hubungi administrator.' };
  }

  setCurrentUserSession(found);
  return { user: found, error: null };
}

export function logoutUser(): void {
  setCurrentUserSession(null);
}

export function createUser(newUser: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
  const users = getStoredUsers();
  const created: User = {
    ...newUser,
    id: `usr-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const updated = [created, ...users];
  saveUsers(updated);

  // Push to Google Sheets asynchronously via Google Apps Script
  createRemoteUser(created).catch((err) => {
    console.warn('[AppsScript] Failed to push created user to sheet', err);
  });

  return created;
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  const users = getStoredUsers();
  let updatedUser: User | null = null;
  const updatedList = users.map((u) => {
    if (u.id === id) {
      updatedUser = { ...u, ...updates, updatedAt: new Date().toISOString() };
      return updatedUser;
    }
    return u;
  });
  const targetUser = updatedUser as User | null;
  if (targetUser) {
    saveUsers(updatedList);
    // If updating current active user session, update session too
    const current = getCurrentUser();
    if (current && current.id === id) {
      setCurrentUserSession(targetUser);
    }

    // Push update to Google Sheets via GAS
    const payload = {
      ...targetUser,
      schoolName: targetUser.schoolName || '',
      teachingClass: targetUser.teachingClass || '',
      'Nama Sekolah': targetUser.schoolName || '',
      'Kelas yang Diampu': targetUser.teachingClass || '',
      sekolah: targetUser.schoolName || '',
      kelas: targetUser.teachingClass || '',
    };
    updateRemoteUser(payload).catch((err) => {
      console.warn('[AppsScript] Failed to push updated user to sheet', err);
    });
  }
  return updatedUser;
}

export function deleteUser(id: string): void {
  const users = getStoredUsers();
  const filtered = users.filter((u) => u.id !== id);
  saveUsers(filtered);
}

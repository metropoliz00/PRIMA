import { User, UserRole } from '../types/auth';
import { DEMO_USERS } from '../data/initialData';
import {
  getRemoteUsers,
  createRemoteUser,
  updateRemoteUser,
  deleteRemoteUser,
} from './appscript';
import {
  isRecordDeleted,
  markRecordDeletedClient,
  unmarkRecordDeletedClient,
  syncDeletedRecordsWithServer,
} from './storageService';

const USERS_KEY = 'prima_registered_users';
const SESSION_KEY = 'prima_current_session';

export function getStoredUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (u) =>
            u &&
            u.id &&
            !isRecordDeleted('users', u.id, u.username) &&
            u.status !== 'DELETED' &&
            u.role !== 'DELETED'
        );
      }
    }
  } catch (e) {
    console.error('Failed to load users from localStorage', e);
  }
  return [];
}

/**
 * Sync users from Google Apps Script Spreadsheet database & Server JSON DB
 */
export async function syncUsersWithGAS(): Promise<User[]> {
  try {
    // 1. Sync deleted records with server first to avoid restoring deleted users
    await syncDeletedRecordsWithServer().catch(() => {});

    // 2. Fetch from server DB if available
    const local = getStoredUsers();
    const map = new Map<string, User>();
    local.forEach((u) => {
      if (u && u.username && !isRecordDeleted('users', u.id, u.username)) {
        map.set(u.username.toLowerCase(), u);
      }
    });

    try {
      const sRes = await fetch('/api/users');
      if (sRes.ok) {
        const sData = await sRes.json();
        if (sData.success && Array.isArray(sData.users)) {
          sData.users.forEach((su: any) => {
            if (
              su &&
              su.username &&
              !isRecordDeleted('users', su.id, su.username) &&
              su.status !== 'DELETED' &&
              su.role !== 'DELETED'
            ) {
              map.set(su.username.toLowerCase(), su);
            }
          });
        }
      }
    } catch {}

    // 3. Fetch from Google Apps Script
    const remote = await getRemoteUsers();
    if (remote && Array.isArray(remote)) {
      // Filter out empty rows or test entries without valid role, and filter out any deleted user
      const validRemote = remote.filter(
        (u: any) =>
          u &&
          u.username &&
          u.role &&
          u.status !== 'DELETED' &&
          u.role !== 'DELETED' &&
          !isRecordDeleted('users', u.id, u.username)
      ) as User[];

      validRemote.forEach((u: any) => {
        const key = u.username.toLowerCase();
        if (isRecordDeleted('users', u.id, key)) return;

        const existing = map.get(key);
        const school =
          typeof u.schoolName === 'string' && u.schoolName.trim().length > 0
            ? u.schoolName
            : typeof u['Nama Sekolah'] === 'string' && u['Nama Sekolah'].trim().length > 0
              ? u['Nama Sekolah']
              : typeof existing?.schoolName === 'string'
                ? existing.schoolName
                : '';

        const rawTeaching = u.teachingClass || u.teaching_class || u['Kelas'] || u.kelas;
        const teaching =
          typeof rawTeaching === 'string' && rawTeaching.trim().length > 0
            ? rawTeaching
            : Array.isArray(rawTeaching)
              ? rawTeaching.join(', ')
              : typeof existing?.teachingClass === 'string'
                ? existing.teachingClass
                : '';

        const gradeVal =
          u.grade !== undefined && u.grade !== null && !isNaN(Number(u.grade)) && Number(u.grade) > 0
            ? Number(u.grade)
            : existing?.grade !== undefined && existing?.grade !== null && !isNaN(Number(existing.grade)) && Number(existing.grade) > 0
              ? Number(existing.grade)
              : undefined;

        const mergedUser: User = {
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

        map.set(key, mergedUser);
      });

      // Dedup by username and filter deleted
      const finalUsers: User[] = [];
      const seenUsernames = new Set<string>();
      map.forEach((usr) => {
        if (!usr || !usr.username) return;
        const lower = usr.username.toLowerCase();
        if (seenUsernames.has(lower)) return;
        if (isRecordDeleted('users', usr.id, lower)) return;
        if ((usr.status as any) === 'DELETED' || (usr.role as any) === 'DELETED') return;
        seenUsernames.add(lower);
        finalUsers.push(usr);
      });

      saveUsers(finalUsers);

      // Also refresh active session if logged in
      const current = getCurrentUser();
      if (current) {
        const updatedSession = finalUsers.find(
          (u) => u.username.toLowerCase() === current.username.toLowerCase()
        );
        if (updatedSession) {
          setCurrentUserSession(updatedSession);
        }
      }
      return finalUsers;
    }
  } catch (err) {
    console.warn('[Sync] Failed to sync users with Google Apps Script', err);
  }
  return getStoredUsers();
}

export function saveUsers(users: User[]): void {
  try {
    const cleanUsers = users.filter(
      (u) =>
        u &&
        u.id &&
        !isRecordDeleted('users', u.id, u.username) &&
        (u.status as any) !== 'DELETED' &&
        (u.role as any) !== 'DELETED'
    );
    localStorage.setItem(USERS_KEY, JSON.stringify(cleanUsers));
  } catch (e) {
    console.error('Failed to save users', e);
  }
}

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && !isRecordDeleted('users', parsed.id, parsed.username)) {
        return parsed;
      }
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

  // Unmark tombstone in case a user with this username was previously deleted
  unmarkRecordDeletedClient('users', created.id, created.username);

  const updated = [created, ...users.filter((u) => u.username.toLowerCase() !== created.username.toLowerCase())];
  saveUsers(updated);

  // Persist to Server JSON Database (/api/users)
  fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ users: [created] }),
  }).catch((err) => {
    console.warn('[Server DB] Failed to push created user to server', err);
  });

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

    // Push update to Server JSON Database (/api/users/:id)
    fetch(`/api/users/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(targetUser),
    }).catch((err) => {
      console.warn('[Server DB] Failed to update user on server', err);
    });

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

export function deleteUser(id: string, usernameHint?: string): void {
  const users = getStoredUsers();
  const targetUser = users.find(
    (u) =>
      u.id === id ||
      (usernameHint && u.username.toLowerCase() === usernameHint.trim().toLowerCase())
  );
  const username = (usernameHint || targetUser?.username || '').trim();
  const targetId = targetUser?.id || id;

  // 1. Mark permanently deleted in client tombstone (localStorage) and server
  markRecordDeletedClient('users', targetId, username);
  if (id !== targetId) {
    markRecordDeletedClient('users', id, username);
  }

  // 2. Remove immediately from local storage
  const filtered = users.filter(
    (u) =>
      u.id !== id &&
      u.id !== targetId &&
      (username ? u.username.toLowerCase() !== username.toLowerCase() : true)
  );
  saveUsers(filtered);

  // 3. If currently active user session is deleted, logout immediately
  const current = getCurrentUser();
  if (
    current &&
    (current.id === id ||
      current.id === targetId ||
      (username && current.username.toLowerCase() === username.toLowerCase()))
  ) {
    logoutUser();
  }

  // 4. Send DELETE to backend server (/api/users/:id)
  fetch(`/api/users/${encodeURIComponent(targetId)}?username=${encodeURIComponent(username)}`, {
    method: 'DELETE',
  }).catch((err) => {
    console.warn('[Server DB] Failed to delete user from server:', err);
  });
  if (id !== targetId) {
    fetch(`/api/users/${encodeURIComponent(id)}?username=${encodeURIComponent(username)}`, {
      method: 'DELETE',
    }).catch(() => {});
  }

  // 5. Send delete and update status=DELETED to Google Apps Script
  const deletePayload = {
    id: targetId,
    username,
    status: 'DELETED',
    role: 'DELETED',
    isDeleted: true,
  };
  deleteRemoteUser(deletePayload).catch(() => {});
  updateRemoteUser(deletePayload).catch(() => {});
  if (id !== targetId) {
    deleteRemoteUser({ ...deletePayload, id }).catch(() => {});
  }
}

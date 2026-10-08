/**
 * PRIMA Local & Server Storage Synchronization and Tombstone Management Service
 * Ensures CRUD consistency and prevents resurrection of deleted records across
 * LocalStorage, Server JSON Database, and Google Apps Script Sheets.
 */

export type EntityType =
  | 'users'
  | 'videos'
  | 'materials'
  | 'questions'
  | 'assessments'
  | 'activities'
  | 'coding'
  | 'classes'
  | 'announcements'
  | 'subjects'
  | 'ai_configs';

const DELETED_RECORDS_KEY = 'prima_deleted_records';
const DELETED_USERS_KEY = 'prima_deleted_users';

type DeletedRecordsMap = Record<EntityType, string[]>;

const DEFAULT_DELETED_RECORDS: DeletedRecordsMap = {
  users: [],
  videos: [],
  materials: [],
  questions: [],
  assessments: [],
  activities: [],
  coding: [],
  classes: [],
  announcements: [],
  subjects: [],
  ai_configs: [],
};

/**
 * Retrieve local deleted records map
 */
export function getLocalDeletedRecords(): DeletedRecordsMap {
  try {
    const raw = localStorage.getItem(DELETED_RECORDS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_DELETED_RECORDS, ...parsed };
    }
  } catch (e) {
    console.warn('[StorageService] Failed to read deleted records from localStorage', e);
  }
  return { ...DEFAULT_DELETED_RECORDS };
}

/**
 * Save deleted records map to localStorage
 */
function saveLocalDeletedRecords(records: DeletedRecordsMap): void {
  try {
    localStorage.setItem(DELETED_RECORDS_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('[StorageService] Failed to save deleted records to localStorage', e);
  }
}

/**
 * Check if a record is marked as deleted
 */
export function isRecordDeleted(
  entity: EntityType,
  id?: string | null,
  secondaryKey?: string | null
): boolean {
  if (!id && !secondaryKey) return false;
  const records = getLocalDeletedRecords();
  const rawList = records[entity] || [];
  const list = rawList.map((x) => String(x).trim().toLowerCase());

  const cleanId = id ? String(id).trim().toLowerCase() : '';
  const cleanSec = secondaryKey ? String(secondaryKey).trim().toLowerCase() : '';

  if (cleanId && list.includes(cleanId)) return true;
  if (cleanSec && list.includes(cleanSec)) return true;

  // Extra check for users in dedicated deleted users storage
  if (entity === 'users') {
    try {
      const rawUsers = localStorage.getItem(DELETED_USERS_KEY);
      if (rawUsers) {
        const userList: string[] = JSON.parse(rawUsers).map((x: any) => String(x).trim().toLowerCase());
        if (cleanId && userList.includes(cleanId)) return true;
        if (cleanSec && userList.includes(cleanSec)) return true;
      }
    } catch {}
  }

  return false;
}

/**
 * Mark a record as permanently deleted across client and server
 */
export function markRecordDeletedClient(
  entity: EntityType,
  id: string,
  secondaryKey?: string
): void {
  const current = getLocalDeletedRecords();
  if (!current[entity]) current[entity] = [];

  const cleanId = id ? String(id).trim() : '';
  const cleanSec = secondaryKey ? String(secondaryKey).trim().toLowerCase() : '';

  let changed = false;
  if (cleanId && !current[entity].some((x) => x.toLowerCase() === cleanId.toLowerCase())) {
    current[entity].push(cleanId);
    changed = true;
  }
  if (cleanSec && !current[entity].some((x) => x.toLowerCase() === cleanSec.toLowerCase())) {
    current[entity].push(cleanSec);
    changed = true;
  }

  if (changed) {
    saveLocalDeletedRecords(current);
  }

  // If users, also update legacy/extra key for resilience
  if (entity === 'users') {
    try {
      const raw = localStorage.getItem(DELETED_USERS_KEY);
      const userList: string[] = raw ? JSON.parse(raw) : [];
      if (cleanId && !userList.some((x) => x.toLowerCase() === cleanId.toLowerCase())) userList.push(cleanId);
      if (cleanSec && !userList.some((x) => x.toLowerCase() === cleanSec.toLowerCase())) {
        userList.push(cleanSec);
      }
      localStorage.setItem(DELETED_USERS_KEY, JSON.stringify(userList));
    } catch {}
  }

  // Asynchronously notify backend server
  fetch('/api/deleted-records', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entity, id: cleanId, secondaryKey: cleanSec }),
  }).catch((err) => {
    console.warn(`[StorageService] Failed to notify server of deleted ${entity}:`, err);
  });
}

/**
 * Unmark a record from deletion (e.g. when recreated with same ID or username)
 */
export function unmarkRecordDeletedClient(
  entity: EntityType,
  id: string,
  secondaryKey?: string
): void {
  const current = getLocalDeletedRecords();
  if (!current[entity]) return;

  const initialLen = current[entity].length;
  current[entity] = current[entity].filter(
    (item) => item !== id && (secondaryKey ? item !== secondaryKey.toLowerCase() : true)
  );

  if (current[entity].length !== initialLen) {
    saveLocalDeletedRecords(current);
  }

  if (entity === 'users') {
    try {
      const raw = localStorage.getItem(DELETED_USERS_KEY);
      if (raw) {
        let userList: string[] = JSON.parse(raw);
        userList = userList.filter(
          (item) => item !== id && (secondaryKey ? item !== secondaryKey.toLowerCase() : true)
        );
        localStorage.setItem(DELETED_USERS_KEY, JSON.stringify(userList));
      }
    } catch {}
  }
}

/**
 * Pull deleted records from server and merge with local records
 */
export async function syncDeletedRecordsWithServer(): Promise<DeletedRecordsMap> {
  try {
    const res = await fetch('/api/deleted-records');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.deleted) {
        const local = getLocalDeletedRecords();
        const merged: DeletedRecordsMap = { ...DEFAULT_DELETED_RECORDS };

        (Object.keys(DEFAULT_DELETED_RECORDS) as EntityType[]).forEach((entity) => {
          const localList = local[entity] || [];
          const serverList = (data.deleted[entity] as string[]) || [];
          const set = new Set([...localList, ...serverList]);
          merged[entity] = Array.from(set);
        });

        saveLocalDeletedRecords(merged);
        return merged;
      }
    }
  } catch (err) {
    console.warn('[StorageService] Error syncing deleted records with server:', err);
  }
  return getLocalDeletedRecords();
}

/**
 * Filter an array of items, removing any item marked as deleted or with status 'DELETED'
 */
export function filterActiveRecords<T>(
  entity: EntityType,
  items: T[],
  idSelector: (item: T) => string | undefined,
  secondaryKeySelector?: (item: T) => string | undefined
): T[] {
  if (!Array.isArray(items)) return [];
  const records = getLocalDeletedRecords();
  const deletedSet = new Set(records[entity] || []);

  return items.filter((item) => {
    if (!item) return false;
    const anyItem = item as any;
    if (anyItem.status === 'DELETED' || anyItem.role === 'DELETED' || anyItem.isDeleted === true || anyItem.isDeleted === 'true') {
      return false;
    }
    const id = idSelector(item);
    if (id && deletedSet.has(id)) return false;

    if (secondaryKeySelector) {
      const key = secondaryKeySelector(item);
      if (key && deletedSet.has(key.toLowerCase())) return false;
    }
    return true;
  });
}

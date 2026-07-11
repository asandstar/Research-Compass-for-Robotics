const DB_NAME = 'research-compass';
const DB_VERSION = 1;
const STORE_MAIN = 'data';
const STORE_BACKUPS = 'backups';

let dbInstance: IDBDatabase | null = null;
let initPromise: Promise<IDBDatabase> | null = null;

export function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);
  if (initPromise) return initPromise;

  initPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not available'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
      initPromise = null;
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      dbInstance.onversionchange = () => {
        dbInstance?.close();
        dbInstance = null;
        initPromise = null;
      };
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_MAIN)) {
        const store = db.createObjectStore(STORE_MAIN, { keyPath: 'key' });
        store.createIndex('key', 'key', { unique: true });
      }

      if (!db.objectStoreNames.contains(STORE_BACKUPS)) {
        const store = db.createObjectStore(STORE_BACKUPS, { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp');
      }
    };
  });

  return initPromise;
}

export async function setMainData(data: unknown): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_MAIN, 'readwrite');
    const store = tx.objectStore(STORE_MAIN);
    const request = store.put({ key: 'main', value: data });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getMainData<T = unknown>(): Promise<T | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_MAIN, 'readonly');
    const store = tx.objectStore(STORE_MAIN);
    const request = store.get('main');
    request.onsuccess = () => {
      const result = request.result;
      resolve(result ? (result.value as T) : null);
    };
    request.onerror = () => reject(request.error);
  });
}

export interface BackupEntry {
  id?: number;
  timestamp: number;
  data: unknown;
  label?: string;
}

const MAX_BACKUPS = 10;

export async function addBackup(data: unknown, label?: string): Promise<number> {
  const db = await openDB();
  return new Promise(async (resolve, reject) => {
    const tx = db.transaction(STORE_BACKUPS, 'readwrite');
    const store = tx.objectStore(STORE_BACKUPS);

    const entry: BackupEntry = {
      timestamp: Date.now(),
      data,
      label,
    };

    const request = store.add(entry);
    request.onsuccess = async () => {
      const id = request.result as number;
      try {
        await pruneOldBackups();
      } catch {}
      resolve(id);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getBackups(limit = MAX_BACKUPS): Promise<BackupEntry[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_BACKUPS, 'readonly');
    const store = tx.objectStore(STORE_BACKUPS);
    const index = store.index('timestamp');
    const request = index.openCursor(null, 'prev');
    const results: BackupEntry[] = [];

    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor && results.length < limit) {
        results.push(cursor.value);
        cursor.continue();
      } else {
        resolve(results);
      }
    };

    request.onerror = () => reject(request.error);
  });
}

export async function getBackupById(id: number): Promise<BackupEntry | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_BACKUPS, 'readonly');
    const store = tx.objectStore(STORE_BACKUPS);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteBackup(id: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_BACKUPS, 'readwrite');
    const store = tx.objectStore(STORE_BACKUPS);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function pruneOldBackups(maxCount = MAX_BACKUPS): Promise<void> {
  const db = await openDB();
  const all = await getBackups(maxCount + 50);
  if (all.length <= maxCount) return;

  const toDelete = all.slice(maxCount);
  for (const backup of toDelete) {
    if (backup.id != null) {
      await deleteBackup(backup.id);
    }
  }
}

export async function estimateSize(): Promise<{ main: number; backups: number; total: number }> {
  const db = await openDB();
  let mainSize = 0;
  let backupsSize = 0;

  const mainData = await getMainData();
  if (mainData) {
    mainSize = new Blob([JSON.stringify(mainData)]).size;
  }

  const backups = await getBackups(50);
  for (const b of backups) {
    backupsSize += new Blob([JSON.stringify(b.data)]).size;
  }

  return {
    main: mainSize,
    backups: backupsSize,
    total: mainSize + backupsSize,
  };
}

export function isIndexedDBAvailable(): boolean {
  return typeof window !== 'undefined' && 'indexedDB' in window;
}

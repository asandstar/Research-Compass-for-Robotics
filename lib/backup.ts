import { addBackup, getBackups, getBackupById, deleteBackup, BackupEntry } from './storage/indexedDB';

const BACKUP_DEBOUNCE_MS = 30000;
const MAX_AUTO_BACKUPS = 10;

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let pendingData: unknown = null;

export async function autoBackup(data: unknown, label?: string): Promise<void> {
  pendingData = data;

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(async () => {
    try {
      if (pendingData !== null) {
        await addBackup(pendingData, label || '自动备份');
        pendingData = null;
      }
    } catch (e) {
      console.error('Auto backup failed:', e);
    }
    debounceTimer = null;
  }, BACKUP_DEBOUNCE_MS);
}

export async function listBackups(limit = MAX_AUTO_BACKUPS): Promise<BackupEntry[]> {
  try {
    return await getBackups(limit);
  } catch (e) {
    console.error('Failed to list backups:', e);
    return [];
  }
}

export async function getBackup(id: number): Promise<BackupEntry | null> {
  try {
    return await getBackupById(id);
  } catch (e) {
    console.error('Failed to get backup:', e);
    return null;
  }
}

export async function removeBackup(id: number): Promise<void> {
  try {
    await deleteBackup(id);
  } catch (e) {
    console.error('Failed to delete backup:', e);
  }
}

export function exportBackupAsJson(backup: BackupEntry): void {
  const blob = new Blob([JSON.stringify(backup.data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const date = new Date(backup.timestamp).toISOString().slice(0, 10);
  a.download = `research-compass-backup-${date}-${backup.id}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

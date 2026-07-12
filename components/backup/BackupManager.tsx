'use client';

import { useEffect, useState, useCallback } from 'react';
import { Clock, Plus, Download, RotateCcw, Trash2, ChevronUp, Database, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import type { BackupEntry } from '../../lib/storage/indexedDB';
import { isRepairReportEmpty, formatRepairReport } from '../../lib/storage';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface BackupManagerProps {
  compact?: boolean;
}

function formatBackupTime(timestamp: number): string {
  const d = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return '刚刚';
  if (diffMin < 60) return `${diffMin} 分钟前`;
  if (diffHour < 24) return `${diffHour} 小时前`;
  if (diffDay < 7) return `${diffDay} 天前`;
  return d.toLocaleDateString('zh-CN');
}

export function BackupManager({ compact = false }: BackupManagerProps) {
  const { listBackups, restoreBackup, deleteBackup, exportBackup, createManualBackup } = useApp();
  const { showToast } = useToast();
  const [backups, setBackups] = useState<BackupEntry[]>([]);
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [isLoading, setIsLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<number | null>(null);

  const loadBackups = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await listBackups();
      setBackups(list);
    } catch (e) {
      console.error('Failed to load backups:', e);
    } finally {
      setIsLoading(false);
    }
  }, [listBackups]);

  useEffect(() => {
    loadBackups();
  }, [loadBackups]);

  const handleCreateBackup = async () => {
    try {
      await createManualBackup();
      showToast('备份创建成功', 'success');
      loadBackups();
    } catch (e) {
      showToast('创建备份失败', 'error');
    }
  };

  const handleRestore = async (backup: BackupEntry) => {
    if (!backup.id) return;
    const confirmed = window.confirm(
      `确定要恢复到「${backup.label || formatBackupTime(backup.timestamp)}」的备份吗？\n当前数据将被覆盖。`
    );
    if (!confirmed) return;

    setRestoringId(backup.id);
    try {
      const report = await restoreBackup(backup.id);
      if (!isRepairReportEmpty(report)) {
        const message = formatRepairReport(report);
        showToast(`备份已恢复，${message}`, 'info');
      } else {
        showToast('备份恢复成功', 'success');
      }
      loadBackups();
    } catch (e) {
      showToast('恢复备份失败', 'error');
    } finally {
      setRestoringId(null);
    }
  };

  const handleDelete = async (backup: BackupEntry) => {
    if (!backup.id) return;
    const confirmed = window.confirm('确定要删除这个备份吗？');
    if (!confirmed) return;

    try {
      await deleteBackup(backup.id);
      showToast('备份已删除', 'success');
      loadBackups();
    } catch (e) {
      showToast('删除备份失败', 'error');
    }
  };

  const handleExport = (backup: BackupEntry) => {
    exportBackup(backup);
    showToast('已导出备份文件', 'success');
  };

  if (compact && !isExpanded) {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted">
          <Database className="w-4 h-4" />
          <span>自动备份已开启 · {backups.length} 个历史版本</span>
        </div>
        <button
          onClick={() => setIsExpanded(true)}
          className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
        >
          管理备份
          <ChevronUp className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-accent" />
          <div>
            <h3 className="font-semibold text-ink dark:text-dark-ink text-sm">数据备份</h3>
            <p className="text-xs text-muted">自动保存最近 10 个版本</p>
          </div>
        </div>
        {compact && (
          <button
            onClick={() => setIsExpanded(false)}
            className="p-1 text-muted hover:text-ink dark:hover:text-dark-ink rounded hover:bg-bg2 dark:hover:bg-dark-bg2"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Button variant="secondary" className="text-xs px-3 py-1.5" onClick={handleCreateBackup}>
          <Plus className="w-3.5 h-3.5" />
          立即备份
        </Button>
        <span className="text-xs text-muted">
          共 {backups.length} 个备份
        </span>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {isLoading && backups.length === 0 && (
          <div className="text-center py-8 text-sm text-muted">加载中...</div>
        )}

        {!isLoading && backups.length === 0 && (
          <div className="text-center py-8">
            <Clock className="w-10 h-10 text-muted/30 mx-auto mb-2" />
            <p className="text-sm text-muted">暂无备份记录</p>
            <p className="text-xs text-muted/60 mt-1">修改数据后会自动创建备份</p>
          </div>
        )}

        {backups.map((backup) => (
          <div
            key={backup.id}
            className="flex items-center justify-between p-3 rounded-lg bg-bg2/50 dark:bg-dark-bg2/50 hover:bg-bg2 dark:hover:bg-dark-bg2 transition-fast group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-ink dark:text-dark-ink">
                  {backup.label || formatBackupTime(backup.timestamp)}
                </span>
              </div>
              <p className="text-xs text-muted mt-0.5">
                {new Date(backup.timestamp).toLocaleString('zh-CN')}
              </p>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-fast">
              <button
                onClick={() => handleExport(backup)}
                className="p-1.5 text-muted hover:text-ink dark:hover:text-dark-ink rounded hover:bg-surface dark:hover:bg-dark-surface"
                title="导出备份"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleRestore(backup)}
                disabled={restoringId === backup.id}
                className="p-1.5 text-accent hover:text-accent-hover rounded hover:bg-accent/10 disabled:opacity-50"
                title="恢复此版本"
              >
                <RotateCcw className={`w-4 h-4 ${restoringId === backup.id ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => handleDelete(backup)}
                className="p-1.5 text-red-500 hover:text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-950/30"
                title="删除备份"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-border-subtle dark:border-dark-border-subtle">
        <p className="text-xs text-muted/70">
          💡 数据同时保存在 IndexedDB 和 localStorage 中，自动备份每 30 秒生成一次（如有变更）
        </p>
      </div>
    </Card>
  );
}

'use client';

import { useState } from 'react';
import { Evidence } from '../../lib/types';
import { Plus } from 'lucide-react';

interface EvidenceListProps {
  title: string;
  evidence: Evidence[];
  color: string;
  bgColor: string;
  onRemove?: (id: string) => void;
  onAdd?: (content: string) => void;
}

export function EvidenceList({ title, evidence, color, bgColor, onRemove, onAdd }: EvidenceListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState('');

  const handleAdd = () => {
    if (!newContent.trim() || !onAdd) return;
    onAdd(newContent.trim());
    setNewContent('');
    setIsAdding(false);
  };

  return (
    <div className="rounded-lg p-3" style={{ backgroundColor: bgColor }}>
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-sm" style={{ color }}>{title}</div>
        {onAdd && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="text-xs opacity-60 hover:opacity-100 transition-opacity flex items-center gap-0.5"
            style={{ color }}
          >
            <Plus className="w-3 h-3" />
            添加
          </button>
        )}
      </div>
      <div className="space-y-2">
        {evidence.map((ev) => (
          <div key={ev.id} className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="text-xs text-ink dark:text-dark-ink">{ev.content}</div>
              <div className="text-xs text-muted/60">{ev.source}</div>
              {ev.isAIGenerated && (
                <span className="inline-block ml-1 px-1 py-0.5 rounded text-[10px] bg-surface/50 dark:bg-dark-surface/50 opacity-80">AI</span>
              )}
            </div>
            {onRemove && (
              <button
                onClick={() => onRemove(ev.id)}
                className="text-xs opacity-50 hover:opacity-100 transition-opacity"
                aria-label="删除证据"
              >
                ×
              </button>
            )}
          </div>
        ))}
        {evidence.length === 0 && !isAdding && (
          <div className="text-xs text-muted/60">暂无证据</div>
        )}
      </div>

      {isAdding && (
        <div className="mt-2 space-y-2">
          <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-border-default dark:border-dark-border-default rounded resize-none focus:outline-none focus:ring-1 focus:ring-accent/30 bg-surface dark:bg-dark-surface text-ink dark:text-dark-ink"
              rows={2}
              placeholder="输入证据内容..."
              autoFocus
            />
          <div className="flex gap-1.5">
            <button
              onClick={handleAdd}
              disabled={!newContent.trim()}
              className="px-2 py-1 text-xs text-white bg-accent hover:bg-accent-hover rounded disabled:opacity-40"
            >
              确认
            </button>
            <button
              onClick={() => { setIsAdding(false); setNewContent(''); }}
              className="px-2 py-1 text-xs text-muted hover:text-ink dark:hover:text-dark-ink"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

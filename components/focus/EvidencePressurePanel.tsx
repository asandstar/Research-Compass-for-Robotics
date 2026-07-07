'use client';

import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useActiveIdea } from '../../context/ActiveIdeaContext';
import { useApp } from '../../context/AppContext';
import { Card } from '../ui/Card';
import { Tag } from '../ui/Tag';

interface EvidencePressurePanelProps {
  onAddEvidence?: () => void;
}

export function EvidencePressurePanel({ onAddEvidence }: EvidencePressurePanelProps) {
  const { activeIdeaId } = useActiveIdea();
  const { getIdeaCardById } = useApp();
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!activeIdeaId) return null;

  const idea = getIdeaCardById(activeIdeaId);
  if (!idea) return null;

  const toggleExpand = (key: string) => {
    setExpanded(prev => prev === key ? null : key);
  };

  const evidenceRows = [
    {
      key: 'for',
      arrow: '\u25B2',
      label: '支持',
      count: idea.evidenceForHypothesis.length,
      color: 'text-green-600',
      tagColor: '#065f46',
      tagBg: '#d1fae5',
      items: idea.evidenceForHypothesis,
    },
    {
      key: 'against',
      arrow: '\u25BC',
      label: '反对',
      count: idea.evidenceAgainstHypothesis.length,
      color: 'text-red-500',
      tagColor: '#991b1b',
      tagBg: '#fee2e2',
      items: idea.evidenceAgainstHypothesis,
    },
    {
      key: 'risks',
      arrow: '?',
      label: '缺失',
      count: idea.falsificationRisks.length,
      color: 'text-amber-500',
      tagColor: '#92400e',
      tagBg: '#fef3c7',
      items: idea.falsificationRisks,
    },
  ];

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-ink">证据压力</h3>
        {onAddEvidence && (
          <button
            type="button"
            onClick={onAddEvidence}
            className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover transition-fast transition-colors font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            添加证据
          </button>
        )}
      </div>
      <div className="flex flex-col gap-1">
        {evidenceRows.map((row) => (
          <div key={row.key}>
            <button
              type="button"
              onClick={() => toggleExpand(row.key)}
              className="w-full flex items-center gap-3 p-2 rounded hover:bg-bg2 transition-fast transition-colors text-left cursor-pointer"
            >
              <span className={`text-sm font-bold ${row.color}`}>{row.arrow}</span>
              <span className="text-sm text-ink font-medium">{row.label}</span>
              <Tag color={row.tagColor} bgColor={row.tagBg} size="sm">
                {row.count}
              </Tag>
              <span className="text-sm text-muted line-clamp-1 flex-1">
                {row.items.length > 0 ? row.items[row.items.length - 1].content : '暂无'}
              </span>
              <span className="text-muted/50">
                {expanded === row.key
                  ? <ChevronUp className="w-3.5 h-3.5" />
                  : <ChevronDown className="w-3.5 h-3.5" />
                }
              </span>
            </button>
            {expanded === row.key && row.items.length > 0 && (
              <div className="ml-9 mt-1 mb-2 space-y-1.5">
                {row.items.map((item, i) => (
                  <div key={i} className="text-sm text-ink p-2 bg-bg2 rounded-lg leading-snug">
                    {item.content}
                  </div>
                ))}
              </div>
            )}
            {expanded === row.key && row.items.length === 0 && (
              <div className="ml-9 mt-1 mb-2">
                <p className="text-xs text-muted/60 py-2">暂无{row.label}证据</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

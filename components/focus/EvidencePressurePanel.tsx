'use client';

import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useActiveIdea } from '../../context/ActiveIdeaContext';
import { useApp } from '../../context/AppContext';
import { Card } from '../ui/Card';
import { Tag } from '../ui/Tag';
import { EvidenceList } from '../idea/EvidenceList';
import { EvidencePressureGauge } from './EvidencePressureGauge';

interface EvidencePressurePanelProps {
  onAddEvidence?: () => void;
}

export function EvidencePressurePanel({ onAddEvidence }: EvidencePressurePanelProps) {
  const { activeIdeaId } = useActiveIdea();
  const { getIdeaCardById } = useApp();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showGauge, setShowGauge] = useState(true);

  if (!activeIdeaId) return null;

  const idea = getIdeaCardById(activeIdeaId);
  if (!idea) return null;

  const toggleExpand = (key: string) => {
    setExpanded(prev => prev === key ? null : key);
  };

  const evidenceRows = [
    {
      key: 'for',
      arrow: '▲',
      label: '支持',
      count: idea.evidenceForHypothesis.length,
      color: 'text-green-600',
      tagColor: '#065f46',
      tagBg: '#d1fae5',
      items: idea.evidenceForHypothesis,
    },
    {
      key: 'against',
      arrow: '▼',
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

  const totalEvidence = evidenceRows.reduce((sum, row) => sum + row.count, 0);

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-ink">证据压力</h3>
        <div className="flex items-center gap-2">
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
      </div>

      <div className="mb-4">
        <button
          onClick={() => setShowGauge(!showGauge)}
          className="w-full flex items-center justify-between text-xs text-muted hover:text-ink transition-fast"
        >
          <span>证据影响力</span>
          {showGauge ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showGauge && (
          <div className="mt-3 pt-3 border-t border-border-subtle">
            <EvidencePressureGauge
              survivalScore={idea.survivalScore}
              confidenceScore={idea.confidenceScore}
              falsificationStrength={idea.falsificationStrength}
              forCount={idea.evidenceForHypothesis.length}
              againstCount={idea.evidenceAgainstHypothesis.length}
              missingCount={idea.falsificationRisks.length}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {evidenceRows.map((row) => (
          <EvidenceList
            key={row.key}
            title={`${row.arrow} ${row.label} (${row.count})`}
            evidence={row.items}
            color={row.tagColor}
            bgColor={row.tagBg}
          />
        ))}
      </div>

      {totalEvidence === 0 && (
        <div className="text-center py-6 text-muted text-sm">
          <p>暂无证据记录</p>
          <p className="text-xs text-muted/70 mt-1">添加证据来评估假设的可信度</p>
        </div>
      )}
    </Card>
  );
}

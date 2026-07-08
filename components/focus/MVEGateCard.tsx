'use client';

import Link from 'next/link';
import { FlaskConical, Play } from 'lucide-react';
import { useActiveIdea } from '../../context/ActiveIdeaContext';
import { useApp } from '../../context/AppContext';
import { MVE_RESULT_LABELS, MVE } from '../../lib/types';
import { Card } from '../ui/Card';
import { Tag } from '../ui/Tag';
import { Button } from '../ui/Button';

interface MVEGateCardProps {
  onExecuteMve?: (mveId: string) => void;
  onGenerateMve?: () => void;
}

function getNodeColor(status: MVE['resultStatus']): string {
  switch (status) {
    case 'passed':
      return 'bg-green-500 dark:bg-green-600';
    case 'failed':
      return 'bg-red-500 dark:bg-red-600';
    case 'pending':
      return 'bg-gray-300 dark:bg-gray-600 animate-pulse';
    default:
      return 'bg-gray-300 dark:bg-gray-600';
  }
}

const MVE_TYPE_LABELS: Record<MVE['mveType'], string> = {
  sanity_check: 'Sanity Check',
  ablation: 'Ablation',
  generalization_test: 'Generalization Test',
  stress_test: 'Stress Test',
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
  });
}

export function MVEGateCard({ onExecuteMve, onGenerateMve }: MVEGateCardProps) {
  const { activeIdeaId } = useActiveIdea();
  const { state } = useApp();

  if (!activeIdeaId) return null;

  const mves = state.mves.filter((m) => m.ideaCardId === activeIdeaId);

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-accent" />
          <h3 className="font-semibold text-ink">验证管线</h3>
        </div>
        {onGenerateMve && mves.filter(m => m.resultStatus === 'pending').length === 0 && (
          <button
            type="button"
            onClick={onGenerateMve}
            className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover transition-fast transition-colors font-medium"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            生成实验
          </button>
        )}
      </div>

      {mves.length === 0 ? (
        <div className="text-center py-6">
          <FlaskConical className="w-8 h-8 text-muted/30 mx-auto mb-2" />
          <p className="text-sm text-muted">暂无验证实验</p>
          {onGenerateMve && (
            <Button variant="secondary" className="mt-3" onClick={onGenerateMve}>
              <FlaskConical className="w-3.5 h-3.5" />
              生成第一个实验
            </Button>
          )}
        </div>
      ) : (
        <div className="relative pl-10">
          {/* Vertical timeline line */}
          <div className="absolute left-4 top-2 bottom-2 timeline-line" />

          <div className="flex flex-col gap-4">
            {mves.map((mve) => {
              const statusLabel = MVE_RESULT_LABELS[mve.resultStatus];
              const typeLabel = MVE_TYPE_LABELS[mve.mveType];

              return (
                <div key={mve.id} className="relative flex items-start gap-3">
                  {/* Timeline node */}
                  <div
                    className={`absolute -left-10 top-1 w-8 h-8 rounded-full flex items-center justify-center ${getNodeColor(
                      mve.resultStatus
                    )}`}
                  >
                    <span className="text-white text-xs font-bold">
                      {mve.resultStatus === 'passed'
                        ? '✓'
                        : mve.resultStatus === 'failed'
                          ? '✕'
                          : '…'}
                    </span>
                  </div>

                  {/* MVE info card */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <Tag variant="secondary" size="sm">
                        {typeLabel}
                      </Tag>
                      <Tag
                        color={statusLabel.color}
                        bgColor={statusLabel.bgColor}
                        size="sm"
                      >
                        {statusLabel.label}
                      </Tag>
                      <span className="text-xs text-muted ml-auto">
                        {formatDate(mve.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-ink line-clamp-2">
                      {mve.experimentGoal}
                    </p>
                    {mve.resultStatus === 'failed' && mve.resultNotes && (
                      <p className="text-xs text-red-500 line-clamp-1 mt-1">
                        {mve.resultNotes}
                      </p>
                    )}
                    {mve.resultStatus === 'pending' && onExecuteMve && (
                      <button
                        type="button"
                        onClick={() => onExecuteMve(mve.id)}
                        className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 bg-accent/10 text-accent rounded-md text-xs font-medium hover:bg-accent/20 transition-fast transition-colors"
                      >
                        <Play className="w-3 h-3" />
                        标记结果
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {mves.length > 0 && (
        <div className="mt-4 pt-3 border-t border-rule">
          <Link href="/mves">
            <Button variant="ghost">查看全部</Button>
          </Link>
        </div>
      )}
    </Card>
  );
}

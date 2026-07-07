'use client';

import { useEffect } from 'react';
import { ClipboardCheck, X, Loader2, Check, AlertTriangle, XCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface EvaluationScore {
  criterion: string;
  score: number;
  notes: string;
}

interface EvaluationResult {
  scores: EvaluationScore[];
  recommendation: 'proceed' | 'revise' | 'drop';
  recommendationReason: string;
  revisedHypothesis?: string;
}

interface IdeaEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  result?: EvaluationResult | null;
  onAdoptHypothesis?: (hypothesis: string) => void;
}

const RECOMMENDATION_CONFIG = {
  proceed: {
    label: '建议推进',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: Check,
    iconColor: 'text-green-600',
  },
  revise: {
    label: '建议修订',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: AlertTriangle,
    iconColor: 'text-amber-600',
  },
  drop: {
    label: '建议放弃',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: XCircle,
    iconColor: 'text-red-600',
  },
};

function getScoreColor(score: number): string {
  if (score >= 7) return 'bg-green-500';
  if (score >= 4) return 'bg-amber-500';
  return 'bg-red-500';
}

export function IdeaEvaluationModal({ isOpen, onClose, loading, result, onAdoptHypothesis }: IdeaEvaluationModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const config = result ? RECOMMENDATION_CONFIG[result.recommendation] : null;
  const RecIcon = config?.icon;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-[2px] modal-overlay flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="idea-evaluation-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto modal-content"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 border-b border-border-subtle flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-accent" />
            <h2 id="idea-evaluation-modal-title" className="text-lg font-semibold text-gray-900">Idea AI 评估</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="关闭">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-accent animate-spin mb-3" />
              <p className="text-sm text-gray-500">AI 评估中...</p>
            </div>
          ) : result && config && RecIcon ? (
            <div className="space-y-5">
              {/* 推荐结论 */}
              <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 flex items-start gap-3`}>
                <RecIcon className={`w-6 h-6 ${config.iconColor} flex-shrink-0 mt-0.5`} />
                <div>
                  <p className={`font-semibold ${config.color}`}>{config.label}</p>
                  <p className="text-sm text-gray-600 mt-1">{result.recommendationReason}</p>
                </div>
              </div>

              {/* 评分详情 */}
              <div>
                <p className="text-sm font-semibold text-ink mb-3">8 维度评分</p>
                <div className="space-y-3">
                  {result.scores.map((score, i) => (
                    <div key={i} className="border border-border-subtle rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-gray-800">{score.criterion}</span>
                        <span className="text-sm font-bold text-gray-900">{score.score}/10</span>
                      </div>
                      <div className="w-full bg-bg2 rounded-full h-2 mb-1.5">
                        <div
                          className={`${getScoreColor(score.score)} h-2 rounded-full transition-all`}
                          style={{ width: `${score.score * 10}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted">{score.notes}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 建议修订的假设 */}
              {result.revisedHypothesis && (
                <div className="bg-accent/[0.06] border border-accent/20 rounded-lg p-4">
                  <p className="text-sm font-semibold text-accent mb-2">建议修订的假设</p>
                  <p className="text-sm text-ink mb-3">{result.revisedHypothesis}</p>
                  {onAdoptHypothesis && (
                    <Button
                      className="px-3 py-1 text-xs"
                      onClick={() => {
                        onAdoptHypothesis(result.revisedHypothesis!);
                        onClose();
                      }}
                    >
                      采纳此假设
                    </Button>
                  )}
                </div>
              )}

              <p className="text-xs text-gray-400 text-center pt-1">
                以上内容由 AI 生成，仅供参考。请结合你的研究实际判断。
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">评估失败，请重试</p>
          )}
        </div>

        <div className="p-4 border-t border-border-subtle flex justify-end">
          <Button variant="secondary" onClick={onClose}>关闭</Button>
        </div>
      </div>
    </div>
  );
}

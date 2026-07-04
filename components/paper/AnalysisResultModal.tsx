'use client';

import { useEffect } from 'react';
import { Microscope, Search, X, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface AssumptionResult {
  taskAssumptions: string[];
  sensingAssumptions: string[];
  dataAssumptions: string[];
  robotAssumptions: string[];
  evaluationAssumptions: string[];
  verificationQuestions: string[];
}

interface GapResult {
  gaps: {
    description: string;
    evidenceFor: string;
    whyWeak: string;
  }[];
}

interface AnalysisResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'assumptions' | 'gaps';
  loading: boolean;
  assumptions?: AssumptionResult | null;
  gaps?: GapResult | null;
}

const ASSUMPTION_CATEGORIES: { key: keyof AssumptionResult; label: string; icon: string }[] = [
  { key: 'taskAssumptions', label: '任务假设', icon: 'Target' },
  { key: 'sensingAssumptions', label: '感知假设', icon: 'Eye' },
  { key: 'dataAssumptions', label: '数据假设', icon: 'Database' },
  { key: 'robotAssumptions', label: '机器人假设', icon: 'Cpu' },
  { key: 'evaluationAssumptions', label: '评估假设', icon: 'BarChart3' },
];

export function AnalysisResultModal({ isOpen, onClose, type, loading, assumptions, gaps }: AnalysisResultModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const title = type === 'assumptions' ? '假设提取结果' : '研究缺口分析';
  const Icon = type === 'assumptions' ? Microscope : Search;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="analysis-result-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-indigo-600" />
            <h2 id="analysis-result-modal-title" className="text-lg font-semibold text-gray-900">{title}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="关闭">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
              <p className="text-sm text-gray-500">AI 分析中...</p>
            </div>
          ) : type === 'assumptions' && assumptions ? (
            <div className="space-y-4">
              {ASSUMPTION_CATEGORIES.map(({ key, label }) => {
                const items = assumptions[key];
                if (!items?.length) return null;
                return (
                  <div key={key} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-700 mb-2">{label}</p>
                    <ul className="space-y-1">
                      {items.map((item, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-gray-400 mt-0.5">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}

              {assumptions.verificationQuestions?.length > 0 && (
                <div className="bg-indigo-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-indigo-700 mb-2">验证问题</p>
                  <ul className="space-y-1">
                    {assumptions.verificationQuestions.map((q, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-indigo-400 mt-0.5">?</span>
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-xs text-gray-400 text-center pt-2">
                以上内容由 AI 生成，仅供参考。请结合论文原文判断。
              </p>
            </div>
          ) : type === 'gaps' && gaps ? (
            <div className="space-y-4">
              {gaps.gaps?.length > 0 ? (
                gaps.gaps.map((gap, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-2 mb-3">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        Gap {i + 1}
                      </span>
                      <p className="text-sm font-medium text-gray-900 flex-1">{gap.description}</p>
                    </div>
                    <div className="space-y-2 ml-1">
                      <div>
                        <p className="text-xs text-gray-500 font-medium">支撑证据</p>
                        <p className="text-sm text-gray-600 mt-0.5">{gap.evidenceFor}</p>
                      </div>
                      <div>
                        <p className="text-xs text-amber-600 font-medium">弱点 / 风险</p>
                        <p className="text-sm text-gray-600 mt-0.5">{gap.whyWeak}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">暂无分析结果</p>
              )}

              <p className="text-xs text-gray-400 text-center pt-2">
                以上内容由 AI 生成，仅供参考。请结合论文原文判断。
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">分析失败，请重试</p>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 flex justify-end">
          <Button variant="secondary" onClick={onClose}>关闭</Button>
        </div>
      </div>
    </div>
  );
}

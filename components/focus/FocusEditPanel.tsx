'use client';

import { useState } from 'react';
import { X, Save, Loader2, AlertTriangle, CheckCircle, XCircle, FlaskConical, Lightbulb, Target, Pencil, Plus } from 'lucide-react';
import { useActiveIdea } from '../../context/ActiveIdeaContext';
import { useApp } from '../../context/AppContext';
import { NextAction, NextActionType } from '../../lib/nextActionCalculator';
import { MVE } from '../../lib/types';
import { Button } from '../ui/Button';


interface FocusEditPanelProps {
  isOpen: boolean;
  action: NextAction | null;
  onClose: () => void;
  // Allow opening in a specific mode directly
  directMode?: NextActionType;
  directMveId?: string;
}

export function FocusEditPanel({ isOpen, action, onClose, directMode, directMveId }: FocusEditPanelProps) {
  const { activeIdeaId } = useActiveIdea();
  const { getIdeaCardById, updateIdeaCard, addEvidence, updateMVEResult, generateMVE, state } = useApp();

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const idea = activeIdeaId ? getIdeaCardById(activeIdeaId) : null;
  const type = directMode || action?.type || 'complete_core_fields';

  // Form states
  const [researchQuestion, setResearchQuestion] = useState(idea?.researchQuestion || '');
  const [coreHypothesis, setCoreHypothesis] = useState(idea?.coreHypothesis || '');
  const [whyItMatters, setWhyItMatters] = useState(idea?.whyItMatters || '');
  const [predCondition, setPredCondition] = useState('');
  const [predOutcome, setPredOutcome] = useState('');
  const [failureCondition, setFailureCondition] = useState('');
  const [evidenceText, setEvidenceText] = useState('');
  const [evidenceType, setEvidenceType] = useState<'evidenceForHypothesis' | 'evidenceAgainstHypothesis' | 'falsificationRisks'>('evidenceForHypothesis');
  const [mveResult, setMveResult] = useState<MVE['resultStatus'] | ''>('');
  const [mveNotes, setMveNotes] = useState('');

  // Get MVE for execute/review modes
  const targetMve = directMveId
    ? state.mves.find(m => m.id === directMveId)
    : type === 'execute_pending_mve'
      ? state.mves.filter(m => m.ideaCardId === activeIdeaId && m.resultStatus === 'pending')[0]
      : type === 'review_failure'
        ? state.mves.filter(m => m.ideaCardId === activeIdeaId && m.resultStatus === 'failed').slice(-1)[0]
        : null;

  // Lock body scroll
  if (isOpen) {
    if (typeof document !== 'undefined') document.body.style.overflow = 'hidden';
  }

  const handleClose = () => {
    document.body.style.overflow = '';
    setSaved(false);
    onClose();
  };

  const handleSave = async () => {
    if (!idea) return;
    setSaving(true);

    try {
      switch (type) {
        case 'complete_core_fields': {
          updateIdeaCard({
            ...idea,
            researchQuestion,
            coreHypothesis,
            whyItMatters,
          });
          break;
        }
        case 'add_predictions': {
          if (!predCondition.trim() || !predOutcome.trim()) return;
          const newPrediction = {
            condition: predCondition,
            expectedOutcome: predOutcome,
          };
          updateIdeaCard({
            ...idea,
            predictions: [...idea.predictions, newPrediction],
          });
          setPredCondition('');
          setPredOutcome('');
          break;
        }
        case 'add_failure_conditions':
        case 'strengthen_falsification': {
          if (!failureCondition.trim()) return;
          updateIdeaCard({
            ...idea,
            failureConditions: [...idea.failureConditions, failureCondition],
          });
          setFailureCondition('');
          break;
        }
        case 'add_evidence': {
          if (!evidenceText.trim()) return;
          addEvidence(idea.id, evidenceType, evidenceText);
          setEvidenceText('');
          break;
        }
        case 'execute_pending_mve': {
          if (!targetMve || !mveResult) return;
          await updateMVEResult(targetMve.id, mveResult, mveNotes);
          break;
        }
        case 'generate_mve': {
          await generateMVE(idea.id);
          break;
        }
        case 'review_failure': {
          // Just close after reviewing
          break;
        }
      }
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        handleClose();
      }, 600);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !idea) return null;

  const panelTitle = getPanelTitle(type);
  const panelDescription = getPanelDescription(type);

  return (
    <div className="fixed inset-0 z-[100] flex justify-end" onClick={handleClose}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] modal-overlay" />

      {/* Panel */}
      <div
        className="relative w-full max-w-md bg-surface border-l border-border-subtle shadow-elevated h-full overflow-y-auto modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle sticky top-0 bg-surface z-10">
          <div>
            <h2 className="font-semibold text-ink">{panelTitle}</h2>
            {panelDescription && (
              <p className="text-caption text-muted mt-0.5">{panelDescription}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-ink hover:bg-bg2 transition-fast transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* ── Complete Core Fields ── */}
          {(type === 'complete_core_fields') && (
            <>
              <FormField label="研究问题" hint="你想回答的核心问题是什么？">
                <textarea
                  value={researchQuestion}
                  onChange={(e) => setResearchQuestion(e.target.value)}
                  placeholder="例：如何在动态环境中实现鲁棒的视觉惯性里程计？"
                  rows={3}
                  className="w-full px-3 py-2 border border-border-default rounded-lg bg-surface resize-none focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-fast transition-colors"
                ></textarea>
              </FormField>
              <FormField label="核心假设" hint="你的核心主张/假设是什么？">
                <textarea
                  value={coreHypothesis}
                  onChange={(e) => setCoreHypothesis(e.target.value)}
                  placeholder="例：通过引入动态物体检测模块过滤动态特征点..."
                  rows={3}
                  className="w-full px-3 py-2 border border-border-default rounded-lg bg-surface resize-none focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-fast transition-colors"
                ></textarea>
              </FormField>
              <FormField label="为什么值得做" hint="这个方向的学术和实用价值">
                <textarea
                  value={whyItMatters}
                  onChange={(e) => setWhyItMatters(e.target.value)}
                  placeholder="例：现有方法在动态场景下失效，而机器人常处于动态环境..."
                  rows={3}
                  className="w-full px-3 py-2 border border-border-default rounded-lg bg-surface resize-none focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-fast transition-colors"
                ></textarea>
              </FormField>
            </>
          )}

          {/* ── Add Predictions ── */}
          {type === 'add_predictions' && (
            <>
              <PreviewSection>
                <p className="text-caption text-muted mb-3">当前已有 {idea.predictions.length} 个预测</p>
                {idea.predictions.length > 0 && (
                  <div className="space-y-2">
                    {idea.predictions.map((p, i) => (
                      <div key={i} className="p-2.5 bg-bg2 rounded-lg">
                        <p className="text-xs text-muted mb-1">条件 #{i + 1}</p>
                        <p className="text-sm text-ink">{p.condition}</p>
                        <p className="text-xs text-accent mt-1">→ {p.expectedOutcome}</p>
                      </div>
                    ))}
                  </div>
                )}
              </PreviewSection>
              <FormField label="条件" hint="在什么情况下验证？">
                <textarea
                  value={predCondition}
                  onChange={(e) => setPredCondition(e.target.value)}
                  placeholder="例：在包含动态物体的室内场景中运行 VIO 算法"
                  rows={3}
                  className="w-full px-3 py-2 border border-border-default rounded-lg bg-surface resize-none focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-fast transition-colors"
                ></textarea>
              </FormField>
              <FormField label="预期结果" hint="如果假设成立，预期会观察到什么？">
                <textarea
                  value={predOutcome}
                  onChange={(e) => setPredOutcome(e.target.value)}
                  placeholder="例：轨迹误差应小于 2%，且特征点匹配准确率 > 95%"
                  rows={3}
                  className="w-full px-3 py-2 border border-border-default rounded-lg bg-surface resize-none focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-fast transition-colors"
                ></textarea>
              </FormField>
            </>
          )}

          {/* ── Add Failure Conditions / Strengthen Falsification ── */}
          {(type === 'add_failure_conditions' || type === 'strengthen_falsification') && (
            <>
              <PreviewSection>
                <p className="text-caption text-muted mb-3">当前已有 {idea.failureConditions.length} 个失败条件</p>
                {idea.failureConditions.length > 0 && (
                  <div className="space-y-1.5">
                    {idea.failureConditions.map((fc, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 bg-bg2 rounded-lg">
                        <XCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-ink">{fc}</p>
                      </div>
                    ))}
                  </div>
                )}
              </PreviewSection>
              <FormField label="失败条件" hint="什么实验结果会直接否定这个假设？">
                <textarea
                  value={failureCondition}
                  onChange={(e) => setFailureCondition(e.target.value)}
                  placeholder="例：在 TUM-VI 数据集的动态序列上，轨迹 ATE > 10%"
                  rows={3}
                  className="w-full px-3 py-2 border border-border-default rounded-lg bg-surface resize-none focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-fast transition-colors"
                ></textarea>
              </FormField>
            </>
          )}

          {/* ── Add Evidence ── */}
          {type === 'add_evidence' && (
            <>
              <div className="flex gap-2">
                {([
                  { key: 'evidenceForHypothesis' as const, label: '支持', color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
                  { key: 'evidenceAgainstHypothesis' as const, label: '反对', color: 'text-red-500', bg: 'bg-red-50 border-red-200' },
                  { key: 'falsificationRisks' as const, label: '风险', color: 'text-amber-500', bg: 'bg-amber-50 border-amber-200' },
                ]).map(opt => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setEvidenceType(opt.key)}
                    className={`flex-1 px-3 py-2 rounded-lg border text-xs font-medium transition-fast transition-colors ${
                      evidenceType === opt.key
                        ? `${opt.bg} ${opt.color} border-current`
                        : 'bg-bg2 border-border-subtle text-muted hover:border-border-default'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <PreviewSection>
                <p className="text-caption text-muted mb-3">
                  {evidenceType === 'evidenceForHypothesis' ? `支持证据 (${idea.evidenceForHypothesis.length})` :
                   evidenceType === 'evidenceAgainstHypothesis' ? `反对证据 (${idea.evidenceAgainstHypothesis.length})` :
                   `证伪风险 (${idea.falsificationRisks.length})`}
                </p>
                {(evidenceType === 'evidenceForHypothesis' ? idea.evidenceForHypothesis :
                  evidenceType === 'evidenceAgainstHypothesis' ? idea.evidenceAgainstHypothesis :
                  idea.falsificationRisks).slice(-3).map((e, i) => (
                  <div key={i} className="text-sm text-ink p-2 bg-bg2 rounded-lg mb-1.5">
                    {e.content}
                  </div>
                ))}
              </PreviewSection>
              <FormField label="证据内容" hint="支持或反对你假设的证据">
                <textarea
                  value={evidenceText}
                  onChange={(e) => setEvidenceText(e.target.value)}
                  placeholder="例：论文 X 在实验 3 中验证了类似方法的有效性..."
                  rows={3}
                  className="w-full px-3 py-2 border border-border-default rounded-lg bg-surface resize-none focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-fast transition-colors"
                ></textarea>
              </FormField>
            </>
          )}

          {/* ── Execute Pending MVE ── */}
          {type === 'execute_pending_mve' && targetMve && (
            <>
              <div className="p-4 bg-bg2 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Tag color="#92400e" bgColor="#fef3c7" size="sm">{targetMve.mveType}</Tag>
                  <span className="text-label text-muted">创建于 {new Date(targetMve.createdAt).toLocaleDateString('zh-CN')}</span>
                </div>
                <p className="text-sm font-medium text-ink mb-2">{targetMve.experimentGoal}</p>
                {targetMve.taskDefinition && (
                  <div className="mt-2">
                    <p className="text-label text-muted mb-1">任务定义</p>
                    <p className="text-sm text-ink">{targetMve.taskDefinition}</p>
                  </div>
                )}
                {targetMve.successCriteria && (
                  <div className="mt-2">
                    <p className="text-label text-muted mb-1">成功标准</p>
                    <p className="text-sm text-ink">{targetMve.successCriteria}</p>
                  </div>
                )}
              </div>
              <FormField label="实验结果">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMveResult('passed')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-fast transition-colors ${
                      mveResult === 'passed'
                        ? 'bg-green-50 border-green-300 text-green-700'
                        : 'bg-bg2 border-border-subtle text-muted hover:border-green-300 hover:text-green-600'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    通过
                  </button>
                  <button
                    type="button"
                    onClick={() => setMveResult('failed')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-fast transition-colors ${
                      mveResult === 'failed'
                        ? 'bg-red-50 border-red-300 text-red-700'
                        : 'bg-bg2 border-border-subtle text-muted hover:border-red-300 hover:text-red-600'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    失败
                  </button>
                </div>
              </FormField>
              {mveResult === 'failed' && (
                <FormField label="失败原因" hint="简要说明实验失败的原因">
                  <textarea
                    value={mveNotes}
                    onChange={(e) => setMveNotes(e.target.value)}
                    placeholder="实验结果未达到成功标准，因为..."
                    rows={3}
                    className="w-full px-3 py-2 border border-border-default rounded-lg bg-surface resize-none focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-fast transition-colors"
                  ></textarea>
                </FormField>
              )}
            </>
          )}

          {/* ── Generate MVE ── */}
          {type === 'generate_mve' && (
            <div className="text-center py-6">
              <FlaskConical className="w-10 h-10 text-accent mx-auto mb-3" />
              <p className="text-sm text-ink mb-1">为当前 Idea 生成一个最小可行实验</p>
              <p className="text-caption text-muted mb-4">基于假设内容、预测和已有证据，自动生成实验方案</p>
            </div>
          )}

          {/* ── Review Failure ── */}
          {type === 'review_failure' && targetMve && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-700">实验失败</span>
              </div>
              <p className="text-sm text-ink mb-2">{targetMve.experimentGoal}</p>
              {targetMve.resultNotes && (
                <p className="text-sm text-red-600">{targetMve.resultNotes}</p>
              )}
              {targetMve.failureAnalysis && (
                <div className="mt-3 pt-3 border-t border-red-200">
                  <p className="text-label font-medium text-red-700 mb-1">失败分析</p>
                  {targetMve.failureAnalysis.hypothesisUpdateSuggestion && (
                    <p className="text-sm text-ink mt-1">{targetMve.failureAnalysis.hypothesisUpdateSuggestion}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 px-6 py-4 border-t border-border-subtle bg-surface">
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving || (type === 'execute_pending_mve' && !mveResult)}
            className="w-full"
          >
            {saved ? (
              <>
                <CheckCircle className="w-4 h-4" />
                已保存
              </>
            ) : saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                处理中...
              </>
            ) : type === 'execute_pending_mve' ? (
              '提交结果'
            ) : type === 'generate_mve' ? (
              '生成实验'
            ) : type === 'review_failure' ? (
              '关闭'
            ) : (
              '保存'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Helper Components ── */

function FormField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-1.5">{label}</label>
      {hint && <p className="text-caption text-muted mb-2">{hint}</p>}
      {children}
    </div>
  );
}

function PreviewSection({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-3 bg-bg2/50 rounded-lg border border-border-subtle">
      {children}
    </div>
  );
}

function getPanelTitle(type: NextActionType): string {
  const titles: Record<NextActionType, string> = {
    complete_core_fields: '编辑核心假设',
    review_failure: '查看失败分析',
    execute_pending_mve: '执行实验',
    add_predictions: '添加预测',
    add_failure_conditions: '定义失败条件',
    strengthen_falsification: '增强证伪性',
    add_evidence: '添加证据',
    generate_mve: '生成实验',
    idea_promising: '值得推进',
    idea_unstable: '状态不稳定',
    idea_rejected: '建议放弃',
  };
  return titles[type] || '编辑';
}

function getPanelDescription(type: NextActionType): string {
  const descs: Record<NextActionType, string> = {
    complete_core_fields: '完善研究问题、核心假设和价值说明',
    review_failure: '最近一次实验失败，查看原因和建议',
    execute_pending_mve: '标记实验执行结果',
    add_predictions: '定义"条件 → 预期结果"使假设可证伪',
    add_failure_conditions: '什么结果会直接否定这个假设',
    strengthen_falsification: '补充失败条件或反对证据',
    add_evidence: '添加支持或反对假设的证据',
    generate_mve: '基于假设自动生成最小可行实验',
    idea_promising: '存活度和置信度较高，建议继续推进',
    idea_unstable: '分数偏低，建议补充证据或调整方向',
    idea_rejected: '存活度过低，建议转向其他方向',
  };
  return descs[type] || '';
}

// Inline Tag component to avoid circular import
function Tag({ children, color, bgColor, size }: { children: React.ReactNode; color?: string; bgColor?: string; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs';
  return (
    <span className={`inline-block rounded-full font-medium ${sizeClass}`} style={{ color, backgroundColor: bgColor }}>
      {children}
    </span>
  );
}

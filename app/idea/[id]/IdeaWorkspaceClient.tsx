'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../../context/AppContext';
import { EvidenceList } from '../../../components/idea/EvidenceList';
import { IdeaEvaluationModal } from '../../../components/idea/IdeaEvaluationModal';
import { ObservationCard } from '../../../components/observation/ObservationCard';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Tag } from '../../../components/ui/Tag';
import { IDEA_STATUS_LABELS, READING_STATUS_LABELS, Paper, ResearchArea } from '../../../lib/types';
import { ArrowLeft, Sparkles, FlaskConical, PlusCircle, FileText, ExternalLink, Cpu, Database, Target, BarChart3, ClipboardCheck } from 'lucide-react';

interface IdeaWorkspaceClientProps {
  id: string;
}

export default function IdeaWorkspaceClient({ id }: IdeaWorkspaceClientProps) {
  const router = useRouter();
  const { state, getIdeaCardById, getObservationsByIds, getPaperById, updateIdeaCard, generateMVE, addObservation, getResearchAreaById, evaluateIdea, addEvidence } = useApp();
  const [ideaCard, setIdeaCard] = useState(getIdeaCardById(id));
  const [showAddObservation, setShowAddObservation] = useState(false);
  const [newObservation, setNewObservation] = useState('');
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  // 只在 id 变化或初始化完成时同步,避免其他 dispatch 覆盖本地编辑内容
  useEffect(() => {
    if (state.isInitialized) {
      setIdeaCard(getIdeaCardById(id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, state.isInitialized]);

  // 防抖自动保存:2 秒无操作后保存
  useEffect(() => {
    if (!isDirty || !ideaCard) return;
    const timer = setTimeout(() => {
      updateIdeaCard(ideaCard);
      setIsDirty(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [isDirty, ideaCard, updateIdeaCard]);

  // 路由离开前保存
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isDirty && ideaCard) {
        updateIdeaCard(ideaCard);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, ideaCard, updateIdeaCard]);

  // 补充观察 modal Escape 关闭
  useEffect(() => {
    if (!showAddObservation) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowAddObservation(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showAddObservation]);

  if (!state.isInitialized) {
    return <div className="text-center py-20 text-gray-500">加载中...</div>;
  }

  if (!ideaCard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-6xl mb-4">404</div>
          <div className="text-lg font-semibold text-gray-800">Idea Card 不存在</div>
          <Button onClick={() => router.push('/')} className="mt-4">返回首页</Button>
        </div>
      </div>
    );
  }

  const observations = getObservationsByIds(ideaCard.sourceObservations);
  const sourcePapers = ideaCard.sourcePaperIds.map(id2 => getPaperById(id2)).filter(Boolean) as Paper[];
  const areas = ideaCard.areaIds.map(id2 => getResearchAreaById(id2)).filter(Boolean) as ResearchArea[];
  const label = IDEA_STATUS_LABELS[ideaCard.status];

  const canGenerateMVE = ideaCard.researchQuestion && ideaCard.coreHypothesis && ideaCard.whyItMatters;

  const handleFieldChange = (
    field: 'title' | 'researchQuestion' | 'coreHypothesis' | 'whyItMatters' | 'roboticsTask' | 'datasetOrScenario' | 'baseline' | 'evaluationMetric',
    value: string
  ) => {
    setIdeaCard(prev => prev ? { ...prev, [field]: value } : prev);
    setIsDirty(true);
  };

  const handleSave = () => {
    updateIdeaCard(ideaCard);
  };

  const handleGenerateMVE = async () => {
    try {
      setErrorMessage('');
      // 自动保存未保存的编辑
      if (isDirty) {
        updateIdeaCard(ideaCard);
        setIsDirty(false);
      }
      const mve = await generateMVE(ideaCard.id);
      router.push(`/detail/mve/${mve.id}`);
    } catch (error) {
      console.error('Failed to generate MVE:', error);
      setErrorMessage('生成 MVE 失败,请重试');
    }
  };

  const handleEvaluate = async () => {
    setShowEvaluation(true);
    setEvaluating(true);
    setEvaluationResult(null);
    setErrorMessage('');
    // 自动保存未保存的编辑
    if (isDirty) {
      updateIdeaCard(ideaCard);
      setIsDirty(false);
    }
    try {
      const result = await evaluateIdea({
        title: ideaCard.title,
        researchQuestion: ideaCard.researchQuestion,
        coreHypothesis: ideaCard.coreHypothesis,
        roboticsTask: ideaCard.roboticsTask,
        baseline: ideaCard.baseline,
      });
      setEvaluationResult(result);
    } catch (error) {
      console.error('Failed to evaluate idea:', error);
      setErrorMessage('评估失败,请重试');
    } finally {
      setEvaluating(false);
    }
  };

  const handleAdoptHypothesis = (hypothesis: string) => {
    const updated = { ...ideaCard, coreHypothesis: hypothesis };
    setIdeaCard(updated);
    updateIdeaCard(updated);
  };

  const handleRemoveSupportingEvidence = (eid: string) => {
    const updated = {
      ...ideaCard,
      supportingEvidence: ideaCard.supportingEvidence.filter(e => e.id !== eid),
    };
    setIdeaCard(updated);
    updateIdeaCard(updated);
  };

  const handleRemoveOpposingEvidence = (eid: string) => {
    const updated = {
      ...ideaCard,
      opposingEvidence: ideaCard.opposingEvidence.filter(e => e.id !== eid),
    };
    setIdeaCard(updated);
    updateIdeaCard(updated);
  };

  const handleRemoveMissingEvidence = (eid: string) => {
    const updated = {
      ...ideaCard,
      missingEvidence: ideaCard.missingEvidence.filter(e => e.id !== eid),
    };
    setIdeaCard(updated);
    updateIdeaCard(updated);
  };

  const handleAddObservation = async () => {
    if (!newObservation.trim()) return;
    try {
      const obs = await addObservation(newObservation.trim());
      const updated = {
        ...ideaCard,
        sourceObservations: [...ideaCard.sourceObservations, obs.id],
      };
      setIdeaCard(updated);
      updateIdeaCard(updated);
      setNewObservation('');
      setShowAddObservation(false);
    } catch (error) {
      console.error('Failed to add observation:', error);
      setErrorMessage('添加观察失败,请重试');
    }
  };

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2 flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage('')} className="text-red-500 hover:text-red-700" aria-label="关闭错误提示">×</button>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700" aria-label="返回">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <input
              type="text"
              value={ideaCard.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              className="text-xl font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:underline"
            />
            <div className="flex items-center gap-2 mt-1">
              <Tag color={label.color} bgColor={label.bgColor}>{label.label}</Tag>
              {areas.length > 0 && (
                <div className="flex items-center gap-1">
                  {areas.slice(0, 2).map(area => (
                    <Tag key={area.id} size="sm" variant="secondary">
                      {area.name.split('｜')[0]}
                    </Tag>
                  ))}
                  {areas.length > 2 && (
                    <Tag size="sm" variant="secondary">+{areas.length - 2}</Tag>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleEvaluate} disabled={!canGenerateMVE}>
            <ClipboardCheck className="w-4 h-4 mr-1" />
            AI 评估
          </Button>
          {isDirty && (
            <span className="text-xs text-amber-600 self-center">未保存</span>
          )}
          <Button onClick={handleSave}>保存</Button>
        </div>
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-6">
        <div className="space-y-6">
          <Card>
            <h3 className="font-semibold text-indigo-600 mb-4">核心内容</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  研究问题 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={ideaCard.researchQuestion}
                  onChange={(e) => handleFieldChange('researchQuestion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 resize-none focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
                  rows={3}
                  placeholder="你想回答什么研究问题？"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  核心假设 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={ideaCard.coreHypothesis}
                  onChange={(e) => handleFieldChange('coreHypothesis', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 resize-none focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
                  rows={3}
                  placeholder="用'如果...那么...'表达"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  为什么值得做 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={ideaCard.whyItMatters}
                  onChange={(e) => handleFieldChange('whyItMatters', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 resize-none focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
                  rows={3}
                  placeholder="这个问题为什么值得研究？"
                />
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-indigo-600 mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              机器人实验配置
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" />
                  机器人任务
                </label>
                <input
                  type="text"
                  value={ideaCard.roboticsTask}
                  onChange={(e) => handleFieldChange('roboticsTask', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="如：桌面操作、视觉SLAM"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Database className="w-3.5 h-3.5" />
                  数据集或场景
                </label>
                <input
                  type="text"
                  value={ideaCard.datasetOrScenario}
                  onChange={(e) => handleFieldChange('datasetOrScenario', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="如：TUM数据集、自建模拟场景"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Baseline</label>
                <input
                  type="text"
                  value={ideaCard.baseline}
                  onChange={(e) => handleFieldChange('baseline', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="对比的基线方法"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <BarChart3 className="w-3.5 h-3.5" />
                  评价指标
                </label>
                <input
                  type="text"
                  value={ideaCard.evaluationMetric}
                  onChange={(e) => handleFieldChange('evaluationMetric', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="如：ATE、成功率、F1"
                />
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-3 gap-3">
            <EvidenceList
              title="支持证据"
              evidence={ideaCard.supportingEvidence}
              color="#065f46"
              bgColor="#d1fae5"
              onRemove={handleRemoveSupportingEvidence}
              onAdd={(content) => addEvidence(ideaCard.id, 'supportingEvidence', content)}
            />
            <EvidenceList
              title="反对证据"
              evidence={ideaCard.opposingEvidence}
              color="#991b1b"
              bgColor="#fee2e2"
              onRemove={handleRemoveOpposingEvidence}
              onAdd={(content) => addEvidence(ideaCard.id, 'opposingEvidence', content)}
            />
            <EvidenceList
              title="缺失证据"
              evidence={ideaCard.missingEvidence}
              color="#92400e"
              bgColor="#fef3c7"
              onRemove={handleRemoveMissingEvidence}
              onAdd={(content) => addEvidence(ideaCard.id, 'missingEvidence', content)}
            />
          </div>

          <Card>
            <h3 className="font-semibold text-amber-600 mb-3">最大风险</h3>
            <div className="space-y-2">
              {ideaCard.biggestRisks.map((risk, index) => (
                <div key={index} className="text-sm text-gray-800">
                  {index + 1}. {risk}
                </div>
              ))}
              {ideaCard.biggestRisks.length === 0 && (
                <div className="text-sm text-gray-500">暂无风险记录</div>
              )}
            </div>
          </Card>

          {ideaCard.nextAction && (
            <Card className="border-indigo-200 bg-indigo-50/50">
              <h3 className="font-semibold text-indigo-600 mb-2">下一步行动</h3>
              <div className="text-sm text-gray-800">{ideaCard.nextAction}</div>
            </Card>
          )}
        </div>

        <div className="space-y-5">
          {sourcePapers.length > 0 && (
            <Card>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                来源论文 ({sourcePapers.length})
              </h3>
              <div className="space-y-3">
                {sourcePapers.map(paper => (
                  <div key={paper.id} className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-sm text-gray-900 line-clamp-2">{paper.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {paper.year} · {paper.venue}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Tag
                        size="sm"
                        color={READING_STATUS_LABELS[paper.readingStatus].color}
                        bgColor={READING_STATUS_LABELS[paper.readingStatus].bgColor}
                      >
                        {READING_STATUS_LABELS[paper.readingStatus].label}
                      </Tag>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {paper.arxivUrl && (
                        <a
                          href={paper.arxivUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-600 hover:underline flex items-center gap-0.5"
                        >
                          <ExternalLink className="w-3 h-3" />
                          arXiv
                        </a>
                      )}
                      {paper.feishuNoteUrl && (
                        <a
                          href={paper.feishuNoteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-600 hover:underline flex items-center gap-0.5"
                        >
                          <ExternalLink className="w-3 h-3" />
                          笔记
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card>
            <h3 className="font-semibold text-gray-800 mb-3">来源观察</h3>
            <div className="space-y-3">
              {observations.map(obs => (
                <ObservationCard key={obs.id} observation={obs} />
              ))}
              {observations.length === 0 && (
                <div className="text-sm text-gray-500">暂无关联观察</div>
              )}
            </div>
            <Button variant="secondary" onClick={() => setShowAddObservation(true)} className="mt-3 w-full">
              <PlusCircle className="w-4 h-4 mr-1" />
              补充观察
            </Button>
          </Card>

          <Card className="bg-indigo-50 border-indigo-200">
            <div className="space-y-3">
              <Button
                onClick={handleGenerateMVE}
                disabled={!canGenerateMVE || state.isGeneratingMVE}
                className="w-full"
              >
                {state.isGeneratingMVE ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    AI 生成中...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <FlaskConical className="w-4 h-4" />
                    生成最小可行实验
                  </span>
                )}
              </Button>
              {!canGenerateMVE && (
                <div className="text-xs text-red-500 text-center">
                  请先填写三个必填字段
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {showAddObservation && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-observation-modal-title"
          onClick={() => setShowAddObservation(false)}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
            onClick={e => e.stopPropagation()}
          >
            <h3 id="add-observation-modal-title" className="text-lg font-semibold text-gray-800 mb-4">补充观察</h3>
            <textarea
              value={newObservation}
              onChange={(e) => setNewObservation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-indigo-500 mb-4"
              rows={4}
              placeholder="输入一条新的观察..."
            />
            <div className="flex gap-2">
              <Button onClick={handleAddObservation} disabled={!newObservation.trim()}>
                添加观察
              </Button>
              <Button variant="secondary" onClick={() => setShowAddObservation(false)}>
                取消
              </Button>
            </div>
          </div>
        </div>
      )}

      <IdeaEvaluationModal
        isOpen={showEvaluation}
        onClose={() => setShowEvaluation(false)}
        loading={evaluating}
        result={evaluationResult}
        onAdoptHypothesis={handleAdoptHypothesis}
      />
    </div>
  );
}

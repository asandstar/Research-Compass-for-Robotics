'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../../context/AppContext';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Tag } from '../../../components/ui/Tag';
import { IDEA_STATUS_LABELS, MVE_RESULT_LABELS, MVE, ResearchArea } from '../../../lib/types';
import {
  ArrowLeft, CheckCircle, XCircle, AlertCircle, Target, Database, Cpu, BarChart3,
  Clock, Server, List, Plus, Trash2, FileSpreadsheet
} from 'lucide-react';
import Link from 'next/link';

interface MVEResultClientProps {
  id: string;
}

export default function MVEResultClient({ id }: MVEResultClientProps) {
  const router = useRouter();
  const { state, getMVEById, getIdeaCardById, updateMVEResult, getResearchAreaById } = useApp();
  const [mve, setMve] = useState(() => getMVEById(id));
  const [resultStatus, setResultStatus] = useState<MVE['resultStatus']>(() => getMVEById(id)?.resultStatus || 'pending');
  const [resultNotes, setResultNotes] = useState(() => getMVEById(id)?.resultNotes || '');
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const found = getMVEById(id);
    setMve(found);
    if (found) {
      setResultStatus(found.resultStatus);
      setResultNotes(found.resultNotes);
    }
    // 依赖仅 [id]:避免本组件 updateMVEResult 触发的 state.mves 变化覆盖用户正在输入的本地编辑
    // 与 IdeaWorkspaceClient 保持一致策略
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // 防抖自动保存:2 秒无操作后保存
  useEffect(() => {
    if (!isDirty || !mve) return;
    const timer = setTimeout(() => {
      updateMVEResult(mve.id, resultStatus, resultNotes);
      setIsDirty(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [isDirty, mve, resultStatus, resultNotes, updateMVEResult]);

  // 路由离开前保存
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isDirty && mve) {
        updateMVEResult(mve.id, resultStatus, resultNotes);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, mve, resultStatus, resultNotes, updateMVEResult]);

  // 确认更新 modal Escape 关闭
  useEffect(() => {
    if (!showConfirm) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowConfirm(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showConfirm]);

  if (!state.isInitialized) {
    return <div className="text-center py-20 text-gray-500">加载中...</div>;
  }

  if (!mve) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-6xl mb-4">404</div>
          <div className="text-lg font-semibold text-gray-800">MVE 实验不存在</div>
          <Button onClick={() => router.push('/')} className="mt-4">返回首页</Button>
        </div>
      </div>
    );
  }

  const ideaCard = getIdeaCardById(mve.ideaCardId);
  const areas = (ideaCard?.areaIds.map(aid => getResearchAreaById(aid)).filter(Boolean) as ResearchArea[]) || [];

  const handleStatusChange = (status: MVE['resultStatus']) => {
    setResultStatus(status);
    setIsDirty(true);
  };

  const handleNotesChange = (notes: string) => {
    setResultNotes(notes);
    setIsDirty(true);
  };

  const handleSaveResult = () => {
    if (resultStatus !== 'pending') {
      setShowConfirm(true);
    } else {
      updateMVEResult(mve.id, resultStatus, resultNotes);
      setIsDirty(false);
    }
  };

  const handleConfirm = () => {
    updateMVEResult(mve.id, resultStatus, resultNotes);
    setShowConfirm(false);
    setIsDirty(false);
  };

  const resultLabels = MVE_RESULT_LABELS;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700" aria-label="返回">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">最小可行实验方案</h1>
            {ideaCard && (
              <div className="flex items-center gap-2 mt-1">
                <Link href={`/detail/idea/${ideaCard.id}`} className="text-sm text-indigo-600 hover:underline">
                  来自: {ideaCard.title}
                </Link>
                <Tag color={IDEA_STATUS_LABELS[ideaCard.status].color} bgColor={IDEA_STATUS_LABELS[ideaCard.status].bgColor} size="sm">
                  {IDEA_STATUS_LABELS[ideaCard.status].label}
                </Tag>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isDirty && (
            <span className="text-xs text-amber-600">未保存</span>
          )}
          <Tag color={resultLabels[resultStatus].color} bgColor={resultLabels[resultStatus].bgColor}>
            {resultLabels[resultStatus].label}
          </Tag>
        </div>
      </div>

      {areas.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">子领域:</span>
          {areas.map(area => (
            <Link key={area.id} href={`/areas/${area.id}`} className="text-sm text-indigo-600 hover:underline">
              {area.name.split('｜')[0]}
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold text-gray-800 text-sm mb-2">实验目标</h3>
          <div className="text-sm text-gray-700">{mve.experimentGoal}</div>
        </Card>
        <Card>
          <h3 className="font-semibold text-gray-800 text-sm mb-2">最小实验设计</h3>
          <div className="text-sm text-gray-700">{mve.minimalDesign}</div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold text-indigo-600 mb-4 flex items-center gap-2">
          <Cpu className="w-4 h-4" />
          机器人实验配置
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-1">
              <Target className="w-3.5 h-3.5" />
              机器人任务
            </div>
            <div className="text-sm font-medium text-gray-800">{mve.roboticsTask || '—'}</div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-1">
              <Database className="w-3.5 h-3.5" />
              数据集或场景
            </div>
            <div className="text-sm font-medium text-gray-800">{mve.datasetOrScenario || '—'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Baseline</div>
            <div className="text-sm font-medium text-gray-800">{mve.baseline || '—'}</div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-1">
              <BarChart3 className="w-3.5 h-3.5" />
              评价指标
            </div>
            <div className="text-sm font-medium text-gray-800">{mve.evaluationMetric || '—'}</div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold text-gray-800 text-sm mb-2">关键变量</h3>
          <div className="space-y-2 text-sm">
            <div className="text-gray-700">
              <span className="font-semibold">自变量：</span>{mve.keyVariables.independent}
            </div>
            <div className="text-gray-700">
              <span className="font-semibold">因变量：</span>{mve.keyVariables.dependent}
            </div>
          </div>
        </Card>
        <Card>
          <h3 className="font-semibold text-gray-800 text-sm mb-2">资源估算</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <Server className="w-4 h-4 text-gray-400" />
              <span>算力: {mve.minimalComputeNeed || '—'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>预计时间: {mve.expectedTimeCost || '—'}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold text-gray-800 text-sm mb-3">对照组</h3>
        <div className="flex flex-wrap gap-2">
          {mve.controlGroups.map((group, index) => (
            <Tag
              key={index}
              color={index === 0 ? '#78716c' : index === 1 ? '#065f46' : '#92400e'}
              bgColor={index === 0 ? '#f5f5f4' : index === 1 ? '#d1fae5' : '#fef3c7'}
            >
              {group}
            </Tag>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-emerald-50 border-emerald-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <h3 className="font-semibold text-emerald-700 text-sm">预期结果（通过标准）</h3>
          </div>
          <div className="text-sm text-emerald-800">{mve.successCriteria}</div>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-red-600" />
            <h3 className="font-semibold text-red-700 text-sm">失败信号</h3>
          </div>
          <ul className="text-sm text-red-800 space-y-1">
            {mve.failureSignals.map((signal, index) => (
              <li key={index}>• {signal}</li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold text-gray-800 text-sm mb-2">最小工作量</h3>
          <div className="text-sm text-gray-700">{mve.minimalEffort}</div>
        </Card>
        <Card>
          <h3 className="font-semibold text-gray-800 text-sm mb-2">下一步任务</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">通过 → {mve.nextTasks.onPass}</span>
            </div>
            <div className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">失败 → {mve.nextTasks.onFail}</span>
            </div>
          </div>
        </Card>
      </div>

      {mve.failureAnalysis && (
        <Card className="bg-amber-50 border-amber-200">
          <h3 className="font-semibold text-amber-800 text-sm mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            失败分析
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-amber-700 mb-1">失败原因分类</label>
              <div className="flex flex-wrap gap-1.5">
                {mve.failureAnalysis.failureReasonTaxonomy.map((reason, index) => (
                  <Tag
                    key={index}
                    color="#92400e"
                    bgColor="#fef3c7"
                    size="sm"
                  >
                    {reason}
                  </Tag>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-amber-700 mb-1">假设更新建议</label>
              <div className="text-sm text-amber-900">{mve.failureAnalysis.hypothesisUpdateSuggestion}</div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-amber-700 mb-1">下一步实验建议</label>
              <ul className="text-sm text-amber-900 space-y-1">
                {mve.failureAnalysis.nextMveGeneration.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      <Card className="bg-gray-50 border-gray-200">
        <h3 className="font-semibold text-gray-800 text-sm mb-4">记录实验结果</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-800 mb-2">标记结果</label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="result"
                value="pending"
                checked={resultStatus === 'pending'}
                onChange={(e) => setResultStatus(e.target.value as any)}
                className="accent-indigo-600"
              />
              <Tag color="#78716c" bgColor="#f5f5f4">待实验</Tag>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="result"
                value="passed"
                checked={resultStatus === 'passed'}
                onChange={(e) => handleStatusChange(e.target.value as MVE['resultStatus'])}
                className="accent-emerald-600"
              />
              <Tag color="#065f46" bgColor="#d1fae5">已通过</Tag>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="result"
                value="failed"
                checked={resultStatus === 'failed'}
                onChange={(e) => handleStatusChange(e.target.value as MVE['resultStatus'])}
                className="accent-red-600"
              />
              <Tag color="#991b1b" bgColor="#fee2e2">已失败</Tag>
            </label>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-800 mb-2">记录备注</label>
          <textarea
            value={resultNotes}
            onChange={(e) => handleNotesChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white resize-none focus:outline-none focus:border-indigo-500 text-sm"
            rows={3}
            placeholder="记录实验过程中的实际发现..."
          />
        </div>

        <div className="flex gap-3">
          <Button onClick={handleSaveResult}>保存结果</Button>
          {ideaCard && (
            <Button variant="secondary" onClick={() => router.push(`/detail/idea/${ideaCard.id}`)}>
              返回 Idea Card
            </Button>
          )}
        </div>
      </Card>

      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mve-confirm-modal-title"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-sm mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-amber-500" />
              <h3 id="mve-confirm-modal-title" className="text-lg font-semibold text-gray-800">确认更新状态</h3>
            </div>
            <p className="text-sm text-gray-700 mb-4">
              确定将关联的 Idea Card 状态更新为 "{resultStatus === 'passed' ? '值得推进' : '已放弃'}" 吗？
            </p>
            <div className="flex gap-2">
              <Button onClick={handleConfirm}>{resultStatus === 'passed' ? '确认通过' : '确认失败'}</Button>
              <Button variant="secondary" onClick={() => setShowConfirm(false)}>取消</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

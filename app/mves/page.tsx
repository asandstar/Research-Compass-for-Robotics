'use client';

import { useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FlaskConical, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useActiveIdea } from '../../context/ActiveIdeaContext';
import { MVE_RESULT_LABELS } from '../../lib/types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Tag } from '../../components/ui/Tag';
import MVEHistoryCard from '../../components/mve/MVEHistoryCard';

function MvesContent() {
  const searchParams = useSearchParams();
  const queryIdeaId = searchParams.get('ideaId') || '';

  const { state, getIdeaCardById } = useApp();
  const { activeIdeaId, setActiveIdea } = useActiveIdea();

  // Use query param if provided, otherwise fall back to activeIdeaId
  const filterIdeaId = queryIdeaId || activeIdeaId;

  const filteredMves = useMemo(() => {
    if (!filterIdeaId) return state.mves;
    return state.mves.filter((mve) => mve.ideaCardId === filterIdeaId);
  }, [state.mves, filterIdeaId]);

  // Sort by createdAt desc
  const sortedMves = useMemo(() => {
    return [...filteredMves].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [filteredMves]);

  const stats = {
    total: filteredMves.length,
    pending: filteredMves.filter((m) => m.resultStatus === 'pending').length,
    passed: filteredMves.filter((m) => m.resultStatus === 'passed').length,
    failed: filteredMves.filter((m) => m.resultStatus === 'failed').length,
  };

  const handleOpenInFocus = (ideaId: string) => {
    setActiveIdea(ideaId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">验证记录</h1>
        <p className="page-subtitle">
          {filterIdeaId
            ? '查看聚焦方向的实验验证历史'
            : '所有研究方向的实验验证历史'}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted">
            <div className="w-8 h-8 rounded-lg bg-bg2 flex items-center justify-center">
              <FlaskConical className="w-4 h-4" />
            </div>
            <span className="text-caption font-medium text-muted/70">总计</span>
          </div>
          <p className="stat-number mt-1">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-amber-600">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-caption font-medium text-muted/70">待实验</span>
          </div>
          <p className="stat-number text-amber-600 mt-1">{stats.pending}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-green-600">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
            <span className="text-caption font-medium text-muted/70">通过</span>
          </div>
          <p className="stat-number text-green-600 mt-1">{stats.passed}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-red-600">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
            <span className="text-caption font-medium text-muted/70">失败</span>
          </div>
          <p className="stat-number text-red-600 mt-1">{stats.failed}</p>
        </Card>
      </div>

      {/* Timeline */}
      {sortedMves.length === 0 ? (
        <Card className="py-16 px-8 text-center">
          <FlaskConical className="w-12 h-12 text-muted/40 mx-auto mb-3 empty-state-icon" />
          <p className="text-muted mb-1">暂无验证实验</p>
          <p className="text-sm text-gray-400 mb-4">在聚焦工作区中生成第一个验证实验</p>
          <Link href="/focus" className="no-underline hover:no-underline">
            <Button variant="secondary">返回聚焦工作区</Button>
          </Link>
        </Card>
      ) : (
        <div className="relative">
          {/* Timeline vertical line */}
          <div className="absolute left-4 top-0 bottom-0 timeline-line" />

          <div className="space-y-6">
            {sortedMves.map((mve) => {
              const idea = getIdeaCardById(mve.ideaCardId);
              return (
                <MVEHistoryCard
                  key={mve.id}
                  mve={mve}
                  ideaTitle={idea?.title || '未知 Idea'}
                  onOpenInFocus={handleOpenInFocus}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MvesPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-muted">加载中...</div>}>
      <MvesContent />
    </Suspense>
  );
}

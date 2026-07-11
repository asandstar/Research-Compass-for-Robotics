'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Sparkles, ArrowLeft, Network, List } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useActiveIdea } from '../../context/ActiveIdeaContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { EmptyState } from '../../components/ui/EmptyState';
import IdeaSelectionCard from '../../components/idea/IdeaSelectionCard';
import { CreateIdeaModal } from '../../components/idea/CreateIdeaModal';
import { IdeaGraph } from '../../components/idea/IdeaGraph';

function IdeasContent() {
  const searchParams = useSearchParams();
  const areaFilter = searchParams.get('areaId') || '';

  const { state, getResearchAreaById } = useApp();
  const { activeIdeaId, setActiveIdea, isActive } = useActiveIdea();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateIdea, setShowCreateIdea] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'graph'>('list');

  const statusOptions = [
    { value: 'all', label: '全部状态' },
    { value: 'active', label: '活跃' },
    { value: 'unstable', label: '不稳定' },
    { value: 'promising', label: '值得推进' },
    { value: 'rejected', label: '已拒绝' },
    { value: 'revived', label: '已恢复' },
  ];

  const filteredIdeas = useMemo(() => {
    return state.ideaCards.filter((card) => {
      if (areaFilter && !card.areaIds.includes(areaFilter)) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          card.title.toLowerCase().includes(query) ||
          card.researchQuestion.toLowerCase().includes(query) ||
          card.coreHypothesis.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      if (statusFilter !== 'all' && card.status !== statusFilter) return false;
      return true;
    });
  }, [state.ideaCards, searchQuery, statusFilter, areaFilter]);

  const getAreaNames = (areaIds: string[]): string[] => {
    return areaIds
      .map((id) => getResearchAreaById(id))
      .filter(Boolean)
      .map((a) => a!.name);
  };

  const handleIdeaCreated = (ideaId: string) => {
    setActiveIdea(ideaId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">研究方向</h1>
          <p className="page-subtitle">管理和选择你的研究方向，进入聚焦模式深入探索</p>
        </div>
        <Button onClick={() => setShowCreateIdea(true)}>
          <Sparkles className="w-4 h-4" />
          新建 Idea
        </Button>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="搜索 Idea 标题、研究问题..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(value) => setStatusFilter(value)}
          placeholder="筛选状态"
          width="160px"
        />
        <div className="flex items-center bg-bg2 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('list')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-fast ${
              viewMode === 'list'
                ? 'bg-white text-ink shadow-sm'
                : 'text-muted hover:text-ink'
            }`}
            title="列表视图"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('graph')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-fast ${
              viewMode === 'graph'
                ? 'bg-white text-ink shadow-sm'
                : 'text-muted hover:text-ink'
            }`}
            title="图谱视图"
          >
            <Network className="w-4 h-4" />
          </button>
        </div>
        {isActive && (
          <Link href="/focus" className="no-underline hover:no-underline flex-shrink-0">
            <Button variant="secondary">
              <ArrowLeft className="w-4 h-4" />
              返回聚焦
            </Button>
          </Link>
        )}
      </div>

      {/* Idea content */}
      {viewMode === 'graph' ? (
        <IdeaGraph />
      ) : (
        <div className="space-y-3">
          {filteredIdeas.length === 0 ? (
            <EmptyState
              icon={<Sparkles className="w-8 h-8 text-muted/60" />}
              title="暂无匹配的 Idea"
              description={searchQuery || statusFilter !== 'all' ? '尝试调整筛选条件或搜索关键词' : '创建你的第一个研究方向，开始探索机器人科研领域'}
              action={
                !searchQuery && statusFilter === 'all' ? (
                  <Button onClick={() => setShowCreateIdea(true)}>
                    <Sparkles className="w-4 h-4" />
                    新建 Idea
                  </Button>
                ) : undefined
              }
              tips={
                !searchQuery && statusFilter === 'all'
                  ? [
                      { label: '三维评估体系说明', href: '/learning' },
                      { label: '从论文生成 Idea', href: '/papers' },
                    ]
                  : undefined
              }
            />
          ) : (
            filteredIdeas.map((idea) => (
              <IdeaSelectionCard
                key={idea.id}
                idea={idea}
                isActive={idea.id === activeIdeaId}
                areaNames={getAreaNames(idea.areaIds)}
                onFocus={setActiveIdea}
              />
            ))
          )}
        </div>
      )}

      <CreateIdeaModal
        isOpen={showCreateIdea}
        onClose={() => setShowCreateIdea(false)}
        onCreated={handleIdeaCreated}
      />
    </div>
  );
}

export default function IdeasPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-muted">加载中...</div>}>
      <IdeasContent />
    </Suspense>
  );
}

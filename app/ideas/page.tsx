'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Sparkles, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useActiveIdea } from '../../context/ActiveIdeaContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import IdeaSelectionCard from '../../components/idea/IdeaSelectionCard';
import { CreateIdeaModal } from '../../components/idea/CreateIdeaModal';

function IdeasContent() {
  const searchParams = useSearchParams();
  const areaFilter = searchParams.get('areaId') || '';

  const { state, getResearchAreaById } = useApp();
  const { activeIdeaId, setActiveIdea, isActive } = useActiveIdea();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateIdea, setShowCreateIdea] = useState(false);

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
          <h1 className="page-title">选择研究方向</h1>
          <p className="page-subtitle">选择一个方向进入聚焦模式</p>
        </div>
        <Button onClick={() => setShowCreateIdea(true)}>
          <Sparkles className="w-4 h-4" />
          新建 Idea
        </Button>
      </div>

      {/* Filters row */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
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
          width="180px"
        />
        {isActive && (
          <Link href="/focus" className="no-underline hover:no-underline flex-shrink-0">
            <Button variant="secondary">
              <ArrowLeft className="w-4 h-4" />
              返回聚焦
            </Button>
          </Link>
        )}
      </div>

      {/* Idea list */}
      <div className="space-y-3">
        {filteredIdeas.length === 0 ? (
          <Card className="py-16 px-8 text-center">
            <Sparkles className="w-12 h-12 text-muted/40 mx-auto mb-3 empty-state-icon" />
            <p className="text-muted">暂无匹配的 Idea</p>
          </Card>
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

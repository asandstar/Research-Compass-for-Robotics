'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Tag } from '../../components/ui/Tag';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { CreateIdeaModal } from '../../components/idea/CreateIdeaModal';
import { IDEA_STATUS_LABELS, READING_STATUS_LABELS, ResearchArea } from '../../lib/types';
import { Search, Filter, Lightbulb, ArrowRight, Sparkles } from 'lucide-react';

export default function IdeasPage() {
  const router = useRouter();
  const { state, getResearchAreaById } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [areaFilter, setAreaFilter] = useState<string>('all');
  const [showCreateIdea, setShowCreateIdea] = useState(false);

  const statusOptions = [
    { value: 'all', label: '全部状态' },
    { value: 'active', label: '活跃' },
    { value: 'unstable', label: '不稳定' },
    { value: 'promising', label: '值得推进' },
    { value: 'rejected', label: '已拒绝' },
    { value: 'revived', label: '已恢复' },
  ];

  const visibleAreas = state.researchAreas.filter(a => !a.isHidden);
  const areaOptions = [
    { value: 'all', label: '全部领域' },
    ...visibleAreas.map(area => ({ value: area.id, label: area.name.split('｜')[0] })),
  ];

  const filteredIdeas = useMemo(() => {
    return state.ideaCards.filter(card => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          card.title.toLowerCase().includes(query) ||
          card.researchQuestion.toLowerCase().includes(query) ||
          card.coreHypothesis.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      // Status filter
      if (statusFilter !== 'all' && card.status !== statusFilter) return false;
      // Area filter
      if (areaFilter !== 'all' && !card.areaIds.includes(areaFilter)) return false;
      return true;
    });
  }, [state.ideaCards, searchQuery, statusFilter, areaFilter]);

  const getAreasForCard = (areaIds: string[]): ResearchArea[] => {
    return areaIds.map(id => getResearchAreaById(id)).filter(Boolean) as ResearchArea[];
  };

  const stats = {
    total: state.ideaCards.length,
    active: state.ideaCards.filter(c => c.status === 'active').length,
    unstable: state.ideaCards.filter(c => c.status === 'unstable').length,
    promising: state.ideaCards.filter(c => c.status === 'promising').length,
    revived: state.ideaCards.filter(c => c.status === 'revived').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ideas</h1>
          <p className="text-gray-600 mt-1">管理和追踪你的研究灵感</p>
        </div>
        <Button onClick={() => setShowCreateIdea(true)}>
          <Lightbulb className="w-4 h-4 mr-1" />
          新建 Idea
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Lightbulb className="w-5 h-5" />
            <span className="text-sm">总 Idea</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-indigo-600">
            <Search className="w-5 h-5" />
            <span className="text-sm">活跃</span>
          </div>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.active}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-amber-600">
            <Filter className="w-5 h-5" />
            <span className="text-sm">不稳定</span>
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-1">{stats.unstable}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-green-600">
            <ArrowRight className="w-5 h-5" />
            <span className="text-sm">值得推进</span>
          </div>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.promising}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-purple-600">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm">已恢复</span>
          </div>
          <p className="text-2xl font-bold text-purple-600 mt-1">{stats.revived}</p>
        </Card>
      </div>

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
        <Select
          options={areaOptions}
          value={areaFilter}
          onChange={(value) => setAreaFilter(value)}
          placeholder="筛选领域"
          width="180px"
        />
      </div>

      <div className="space-y-3">
        {filteredIdeas.length === 0 ? (
          <Card className="p-8 text-center">
            <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">暂无 Idea</p>
          </Card>
        ) : (
          filteredIdeas.map((idea) => {
            const label = IDEA_STATUS_LABELS[idea.status];
            const areas = getAreasForCard(idea.areaIds);
            return (
              <Link key={idea.id} href={`/detail/idea/${idea.id}`} className="no-underline hover:no-underline block">
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{idea.title}</h3>
                        <Tag
                          size="sm"
                          color={label.color}
                          bgColor={label.bgColor}
                        >
                          {label.label}
                        </Tag>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{idea.researchQuestion}</p>
                      {areas.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          {areas.slice(0, 3).map(area => (
                            <Tag key={area.id} size="sm" variant="secondary">
                              {area.name.split('｜')[0]}
                            </Tag>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">{new Date(idea.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })
        )}
      </div>

      <CreateIdeaModal
        isOpen={showCreateIdea}
        onClose={() => setShowCreateIdea(false)}
        onCreated={(ideaId) => router.push(`/detail/idea/${ideaId}`)}
      />
    </div>
  );
}

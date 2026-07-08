'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, Flame, Compass, Sparkles, BookOpen, Target, TrendingUp, AlertCircle } from 'lucide-react';
import QuestionCard from '../../components/questions/QuestionCard';
import { researchQuestions, QUESTION_TYPE_LABELS } from '../../lib/questions/researchQuestions';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

type FilterType = 'all' | 'hot' | 'gap' | 'emerging' | 'classic';

export default function QuestionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedArea, setSelectedArea] = useState<string>('all');

  const areas = useMemo(() => {
    const areaMap = new Map<string, string>();
    researchQuestions.forEach(q => {
      areaMap.set(q.areaId, q.areaName);
    });
    return Array.from(areaMap.entries()).map(([id, name]) => ({ id, name }));
  }, []);

  const filteredQuestions = useMemo(() => {
    return researchQuestions.filter(q => {
      if (filterType !== 'all' && q.type !== filterType) return false;
      if (selectedArea !== 'all' && q.areaId !== selectedArea) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          q.text.toLowerCase().includes(query) ||
          q.areaName.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [searchQuery, filterType, selectedArea]);

  const stats = useMemo(() => ({
    total: researchQuestions.length,
    hot: researchQuestions.filter(q => q.type === 'hot').length,
    gap: researchQuestions.filter(q => q.type === 'gap').length,
    emerging: researchQuestions.filter(q => q.type === 'emerging').length,
    classic: researchQuestions.filter(q => q.type === 'classic').length,
  }), []);

  const filterButtons: { type: FilterType; label: string; icon: typeof Flame; color: string; bgColor: string }[] = [
    { type: 'all', label: '全部', icon: Target, color: 'text-ink dark:text-dark-ink', bgColor: 'bg-bg2 dark:bg-dark-bg2' },
    { type: 'hot', label: '热门', icon: Flame, color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-950/30' },
    { type: 'gap', label: '空白', icon: Compass, color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-950/30' },
    { type: 'emerging', label: '新兴', icon: Sparkles, color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-50 dark:bg-green-950/30' },
    { type: 'classic', label: '经典', icon: BookOpen, color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-50 dark:bg-purple-950/30' },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="page-title">研究问题空间</h1>
            <p className="page-subtitle">探索机器人领域的研究问题分布，发现热门方向、研究空白和新兴机会。每个问题标注难度和影响力，帮助你选择合适的研究切入点。</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center">
              <Target className="w-3.5 h-3.5 text-accent" />
            </div>
            <span className="text-caption text-muted">总问题</span>
          </div>
          <p className="stat-number text-ink">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
              <Flame className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-caption text-muted">热门</span>
          </div>
          <p className="stat-number text-red-600 dark:text-red-400">{stats.hot}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
              <Compass className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-caption text-muted">空白</span>
          </div>
          <p className="stat-number text-blue-600 dark:text-blue-400">{stats.gap}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-caption text-muted">新兴</span>
          </div>
          <p className="stat-number text-green-600 dark:text-green-400">{stats.emerging}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-caption text-muted">经典</span>
          </div>
          <p className="stat-number text-purple-600 dark:text-purple-400">{stats.classic}</p>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="搜索研究问题..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {filterButtons.map((btn) => (
              <button
                key={btn.type}
                onClick={() => setFilterType(btn.type)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-fast ${
                  filterType === btn.type
                    ? `${btn.bgColor} ${btn.color}`
                    : 'bg-bg2 text-muted hover:text-ink'
                }`}
              >
                <btn.icon className="w-3 h-3" />
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-muted" />
          <span className="text-caption text-muted">按领域筛选：</span>
          <button
            onClick={() => setSelectedArea('all')}
            className={`px-2 py-1 rounded text-[10px] font-medium transition-fast ${
              selectedArea === 'all' ? 'bg-accent/10 text-accent' : 'bg-bg2 text-muted hover:text-ink'
            }`}
          >
            全部领域
          </button>
          {areas.map((area) => (
            <button
              key={area.id}
              onClick={() => setSelectedArea(area.id)}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-fast truncate max-w-[120px] ${
                selectedArea === area.id ? 'bg-accent/10 text-accent' : 'bg-bg2 text-muted hover:text-ink'
              }`}
              title={area.name}
            >
              {area.name.split('｜')[0]}
            </button>
          ))}
        </div>
      </Card>

      {filteredQuestions.length === 0 ? (
        <Card className="py-16 px-8 text-center">
          <Search className="w-12 h-12 text-muted/40 mx-auto mb-3" />
          <p className="text-muted">未找到匹配的研究问题</p>
          <p className="text-muted/70 mb-4">尝试调整筛选条件或搜索关键词</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuestions.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </div>
      )}

      <Card className="p-5 border-l-4 border-l-accent">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-ink mb-2">如何使用研究问题空间</h3>
            <ul className="space-y-1.5 text-sm text-muted">
              <li className="flex items-start gap-2">
                <span className="text-accent font-semibold flex-shrink-0">1.</span>
                <span>浏览热门问题，了解当前领域的研究焦点</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent font-semibold flex-shrink-0">2.</span>
                <span>关注空白问题，寻找未被充分探索的研究机会</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent font-semibold flex-shrink-0">3.</span>
                <span>追踪新兴问题，把握领域发展趋势</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent font-semibold flex-shrink-0">4.</span>
                <span>结合难度和影响力，选择适合自己的研究切入点</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

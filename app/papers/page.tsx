'use client';

import { useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Tag } from '../../components/ui/Tag';
import { Select } from '../../components/ui/Select';
import { AddPaperModal } from '../../components/paper/AddPaperModal';
import { PaperCard } from '../../components/paper/PaperCard';
import { AnalysisResultModal } from '../../components/paper/AnalysisResultModal';
import { Paper } from '../../lib/types';
import { Plus, Search } from 'lucide-react';

function PaperLibraryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, createIdeaFromPaper, state: { isGeneratingIdeaFromPaper }, extractAssumptions, extractGaps } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPaper, setEditingPaper] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterArea, setFilterArea] = useState<string>(searchParams.get('area') || 'all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterJudgement, setFilterJudgement] = useState<string>('all');

  const [analysisModal, setAnalysisModal] = useState<{
    isOpen: boolean;
    type: 'assumptions' | 'gaps';
    loading: boolean;
    assumptions: any;
    gaps: any;
  }>({ isOpen: false, type: 'assumptions', loading: false, assumptions: null, gaps: null });

  const handleExtractAssumptions = async (paper: Paper) => {
    setAnalysisModal({ isOpen: true, type: 'assumptions', loading: true, assumptions: null, gaps: null });
    try {
      const result = await extractAssumptions(paper);
      setAnalysisModal(prev => ({ ...prev, loading: false, assumptions: result }));
    } catch (error) {
      console.error('Failed to extract assumptions:', error);
      setAnalysisModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleExtractGaps = async (paper: Paper) => {
    setAnalysisModal({ isOpen: true, type: 'gaps', loading: true, assumptions: null, gaps: null });
    try {
      const result = await extractGaps(paper);
      setAnalysisModal(prev => ({ ...prev, loading: false, gaps: result }));
    } catch (error) {
      console.error('Failed to extract gaps:', error);
      setAnalysisModal(prev => ({ ...prev, loading: false }));
    }
  };

  const filteredPapers = useMemo(() => {
    return state.papers.filter(paper => {
      if (filterArea !== 'all' && !paper.areaIds.includes(filterArea)) return false;
      if (filterStatus !== 'all' && paper.readingStatus !== filterStatus) return false;
      if (filterJudgement !== 'all' && paper.judgementLevel !== filterJudgement) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = paper.title.toLowerCase().includes(query);
        const matchesAuthors = paper.authors.toLowerCase().includes(query);
        const matchesKeywords = paper.methodKeywords.some(k => k.toLowerCase().includes(query));
        if (!matchesTitle && !matchesAuthors && !matchesKeywords) return false;
      }
      
      return true;
    });
  }, [state.papers, searchQuery, filterArea, filterStatus, filterJudgement]);

  const visibleAreas = state.researchAreas.filter(a => !a.isHidden);

  const handleEdit = (paper: any) => {
    setEditingPaper(paper);
    setShowAddModal(true);
  };

  const handleGenerateIdea = async (paperId: string) => {
    try {
      const idea = await createIdeaFromPaper(paperId);
      router.push(`/idea/${idea.id}`);
    } catch (error) {
      console.error('Failed to generate idea:', error);
      alert('生成 Idea 失败,请重试');
    }
  };

  const getAreaName = (areaId: string) => {
    const area = state.researchAreas.find(a => a.id === areaId);
    return area ? area.name.split('｜')[0] : areaId;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paper Library</h1>
          <p className="text-gray-600 mt-1">管理你的论文阅读和研究笔记</p>
        </div>
        <Button onClick={() => { setEditingPaper(null); setShowAddModal(true); }}>
          <Plus className="w-4 h-4 mr-1" />
          添加论文
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索标题、作者、关键词..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="flex items-start gap-3">
            <div className="w-48">
              <label className="text-xs text-gray-500 mb-1 block">子领域</label>
              <Select
                value={filterArea}
                onChange={setFilterArea}
                maxHeight="400px"
                options={[
                  { value: 'all', label: '全部' },
                  ...visibleAreas.map(area => ({ value: area.id, label: area.name.split('｜')[0] })),
                ]}
              />
            </div>
            <div className="w-32">
              <label className="text-xs text-gray-500 mb-1 block">阅读状态</label>
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                options={[
                  { value: 'all', label: '全部' },
                  { value: 'to_read', label: '待读' },
                  { value: 'skimmed', label: '泛读' },
                  { value: 'deep_reading', label: '精读中' },
                  { value: 'reviewed', label: '已复盘' },
                  { value: 'paused', label: '暂停' },
                ]}
              />
            </div>
            <div className="w-32">
              <label className="text-xs text-gray-500 mb-1 block">判断级别</label>
              <Select
                value={filterJudgement}
                onChange={setFilterJudgement}
                options={[
                  { value: 'all', label: '全部' },
                  { value: 'background', label: '背景资料' },
                  { value: 'useful', label: '有用' },
                  { value: 'idea_source', label: '灵感来源' },
                  { value: 'must_review', label: '必复盘' },
                ]}
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>共 {filteredPapers.length} 篇论文</span>
      </div>

      <div className="space-y-3">
        {filteredPapers.length === 0 ? (
          <Card className="p-12 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500">暂无匹配的论文</p>
            <Button variant="secondary" className="mt-4" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-1" />
              添加第一篇论文
            </Button>
          </Card>
        ) : (
          filteredPapers.map((paper) => (
            <PaperCard
              key={paper.id}
              paper={paper}
              getAreaName={getAreaName}
              onEdit={handleEdit}
              onGenerateIdea={handleGenerateIdea}
              isGeneratingIdea={isGeneratingIdeaFromPaper}
              onExtractAssumptions={handleExtractAssumptions}
              onExtractGaps={handleExtractGaps}
            />
          ))
        )}
      </div>

      <AddPaperModal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setEditingPaper(null); }}
        editingPaper={editingPaper}
      />

      <AnalysisResultModal
        isOpen={analysisModal.isOpen}
        onClose={() => setAnalysisModal(prev => ({ ...prev, isOpen: false }))}
        type={analysisModal.type}
        loading={analysisModal.loading}
        assumptions={analysisModal.assumptions}
        gaps={analysisModal.gaps}
      />
    </div>
  );
}

export default function PaperLibraryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">加载中...</div>}>
      <PaperLibraryContent />
    </Suspense>
  );
}

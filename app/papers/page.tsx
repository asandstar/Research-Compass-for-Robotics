'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Tag } from '../../components/ui/Tag';
import { AddPaperModal } from '../../components/paper/AddPaperModal';
import { READING_STATUS_LABELS, JUDGEMENT_LABELS } from '../../lib/types';
import { Plus, Search, ExternalLink, FileText, Lightbulb, Edit3, Sparkles } from 'lucide-react';

export default function PaperLibraryPage() {
  const router = useRouter();
  const { state, createIdeaFromPaper, state: { isGeneratingIdeaFromPaper } } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPaper, setEditingPaper] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterArea, setFilterArea] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterJudgement, setFilterJudgement] = useState<string>('all');

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
    const idea = await createIdeaFromPaper(paperId);
    router.push(`/idea/${idea.id}`);
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
          <div className="flex items-center gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">子领域</label>
              <select
                value={filterArea}
                onChange={(e) => setFilterArea(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">全部</option>
                {visibleAreas.map(area => (
                  <option key={area.id} value={area.id}>{area.name.split('｜')[0]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">阅读状态</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">全部</option>
                <option value="to_read">待读</option>
                <option value="skimmed">泛读</option>
                <option value="deep_reading">精读中</option>
                <option value="reviewed">已复盘</option>
                <option value="paused">暂停</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">判断级别</label>
              <select
                value={filterJudgement}
                onChange={(e) => setFilterJudgement(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">全部</option>
                <option value="background">背景资料</option>
                <option value="useful">有用</option>
                <option value="idea_source">灵感来源</option>
                <option value="must_review">必复盘</option>
              </select>
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
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">暂无匹配的论文</p>
            <Button variant="secondary" className="mt-4" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-1" />
              添加第一篇论文
            </Button>
          </Card>
        ) : (
          filteredPapers.map((paper) => (
            <Card key={paper.id} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-base hover:text-indigo-600 cursor-pointer">
                    {paper.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {paper.authors} · {paper.year} · {paper.venue}
                  </p>
                  
                  {paper.oneSentenceSummary && (
                    <p className="text-sm text-gray-700 mt-3 bg-gray-50 p-3 rounded-lg border-l-2 border-indigo-400">
                      {paper.oneSentenceSummary}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {paper.areaIds.map(areaId => (
                      <Tag key={areaId} size="sm" variant="secondary">
                        {getAreaName(areaId)}
                      </Tag>
                    ))}
                    {paper.methodKeywords.slice(0, 4).map((kw, i) => (
                      <Tag key={i} size="sm">
                        {kw}
                      </Tag>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
                    {paper.arxivUrl && (
                      <a
                        href={paper.arxivUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        arXiv
                      </a>
                    )}
                    {paper.pdfUrl && (
                      <a
                        href={paper.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        PDF
                      </a>
                    )}
                    {paper.feishuNoteUrl && (
                      <a
                        href={paper.feishuNoteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        飞书笔记
                      </a>
                    )}
                    {paper.codeUrl && (
                      <a
                        href={paper.codeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        代码
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <div className="flex flex-col items-end gap-1.5">
                    <Tag
                      size="sm"
                      color={READING_STATUS_LABELS[paper.readingStatus].color}
                      bgColor={READING_STATUS_LABELS[paper.readingStatus].bgColor}
                    >
                      {READING_STATUS_LABELS[paper.readingStatus].label}
                    </Tag>
                    <Tag
                      size="sm"
                      color={JUDGEMENT_LABELS[paper.judgementLevel].color}
                      bgColor={JUDGEMENT_LABELS[paper.judgementLevel].bgColor}
                    >
                      {JUDGEMENT_LABELS[paper.judgementLevel].label}
                    </Tag>
                  </div>
                  
                  <div className="text-xs text-gray-400 flex items-center gap-1 mt-2">
                    <Lightbulb className="w-3.5 h-3.5" />
                    {paper.inspiredIdeaIds.length} 个 Idea
                  </div>

                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleEdit(paper)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                      title="编辑"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleGenerateIdea(paper.id)}
                      disabled={isGeneratingIdeaFromPaper}
                      className="px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50 rounded flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="生成 Idea"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      生成 Idea
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <AddPaperModal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setEditingPaper(null); }}
        editingPaper={editingPaper}
      />
    </div>
  );
}

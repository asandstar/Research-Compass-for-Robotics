'use client';

import { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import {
  Plus, Search, Filter, FileText, BookOpen, Sparkles, ExternalLink,
  Edit, Lightbulb, TriangleAlert, ChevronDown, ChevronUp, Target, Eye,
  Database, Cpu, BarChart3, FlaskConical, HelpCircle, AlertCircle,
  Globe, FileDown, Github, Microscope
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useActiveIdea } from '../../context/ActiveIdeaContext';
import { Paper, READING_STATUS_LABELS, JUDGEMENT_LABELS } from '../../lib/types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Tag } from '../../components/ui/Tag';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { AddPaperModal } from '../../components/paper/AddPaperModal';
import { AnalysisResultModal } from '../../components/paper/AnalysisResultModal';

function PapersContent() {
  const {
    state,
    createIdeaFromPaper,
    extractAssumptions,
    extractGaps,
    getResearchAreaById,
  } = useApp();
  const { activeIdeaId, setActiveIdea } = useActiveIdea();

  const activeIdea = activeIdeaId ? state.ideaCards.find((c) => c.id === activeIdeaId) : null;
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPaper, setEditingPaper] = useState<Paper | null>(null);
  const [showRelevantOnly, setShowRelevantOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterReadingStatus, setFilterReadingStatus] = useState('all');
  const [filterJudgement, setFilterJudgement] = useState('all');
  const [filterArea, setFilterArea] = useState('all');
  const [expandedPaperId, setExpandedPaperId] = useState<string | null>(null);

  // Analysis modal state
  const [analysisModal, setAnalysisModal] = useState<{ type: 'assumptions' | 'gaps'; paper: Paper } | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  // Paper-level cached results: paperId -> result
  const [assumptionResults, setAssumptionResults] = useState<Record<string, any>>({});
  const [gapResults, setGapResults] = useState<Record<string, any>>({});

  const filteredPapers = useMemo(() => {
    return state.papers.filter((paper) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !paper.title.toLowerCase().includes(q) &&
          !paper.authors.toLowerCase().includes(q) &&
          !paper.venue?.toLowerCase().includes(q) &&
          !paper.oneSentenceSummary?.toLowerCase().includes(q)
        ) return false;
      }
      if (filterArea !== 'all' && !paper.areaIds.includes(filterArea)) return false;
      if (filterReadingStatus !== 'all' && paper.readingStatus !== filterReadingStatus) return false;
      if (filterJudgement !== 'all' && paper.judgementLevel !== filterJudgement) return false;
      if (showRelevantOnly && activeIdea) {
        if (!paper.areaIds.some((aid) => activeIdea.areaIds.includes(aid))) return false;
      }
      return true;
    });
  }, [state.papers, searchQuery, filterArea, filterReadingStatus, filterJudgement, showRelevantOnly, activeIdea]);

  const stats = useMemo(() => ({
    total: state.papers.length,
    toRead: state.papers.filter(p => p.readingStatus === 'to_read').length,
    deepReading: state.papers.filter(p => p.readingStatus === 'deep_reading').length,
    reviewed: state.papers.filter(p => p.readingStatus === 'reviewed').length,
    ideaSource: state.papers.filter(p => p.judgementLevel === 'idea_source').length,
    mustReview: state.papers.filter(p => p.judgementLevel === 'must_review').length,
  }), [state.papers]);

  const getAreaNames = (areaIds: string[]): string[] => {
    return areaIds.map((id) => getResearchAreaById(id)).filter(Boolean).map((a) => a!.name);
  };

  const handleEdit = (paper: Paper) => {
    setEditingPaper(paper);
    setShowAddModal(true);
  };

  const handleGenerateIdea = async (paperId: string) => {
    try {
      const idea = await createIdeaFromPaper(paperId);
      setActiveIdea(idea.id);
    } catch (error) {
      console.error('Failed to generate idea:', error);
    }
  };

  const handleExtractAssumptions = async (paper: Paper) => {
    setAnalysisModal({ type: 'assumptions', paper });
    setAnalysisLoading(true);
    try {
      const result = await extractAssumptions(paper);
      setAssumptionResults(prev => ({ ...prev, [paper.id]: result }));
    } catch (e) {
      console.error(e);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleExtractGaps = async (paper: Paper) => {
    setAnalysisModal({ type: 'gaps', paper });
    setAnalysisLoading(true);
    try {
      const result = await extractGaps(paper);
      setGapResults(prev => ({ ...prev, [paper.id]: result }));
    } catch (e) {
      console.error(e);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const areaOptions = useMemo(() => {
    return state.researchAreas.filter(a => !a.isHidden).map(a => ({ value: a.id, label: a.name }));
  }, [state.researchAreas]);

  return (
    <div className="space-y-6">
      {/* Active idea context banner */}
      {activeIdea && (
        <div className="flex items-center gap-2 text-sm bg-accent/[0.04] border border-accent/10 rounded-lg px-4 py-2">
          <span className="text-muted">当前聚焦:</span>
          <Link href="/focus" className="no-underline hover:no-underline text-accent font-medium hover:underline">
            {activeIdea.title}
          </Link>
          {activeIdea.areaIds.length > 0 && (
            <button
              onClick={() => setShowRelevantOnly(!showRelevantOnly)}
              className={`ml-auto flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full transition-colors ${
                showRelevantOnly ? 'bg-accent text-white' : 'bg-gray-100 text-muted hover:text-accent hover:bg-accent/10'
              }`}
            >
              <Filter className="w-3 h-3" />
              {showRelevantOnly ? '显示全部' : '仅相关论文'}
            </button>
          )}
        </div>
      )}

      {/* Header */}
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">论文信号流</h1>
          <p className="page-subtitle">从论文中提取研究信号和灵感</p>
        </div>
        <Button onClick={() => { setEditingPaper(null); setShowAddModal(true); }}>
          <Plus className="w-4 h-4" />
          添加论文
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: '总计', value: stats.total, icon: FileText, color: 'text-ink', bg: 'bg-bg2' },
          { label: '待读', value: stats.toRead, icon: BookOpen, color: 'text-muted', bg: 'bg-bg2' },
          { label: '精读中', value: stats.deepReading, icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-50' },
          { label: '已复盘', value: stats.reviewed, icon: BookOpen, color: 'text-green-600', bg: 'bg-green-50' },
          { label: '灵感来源', value: stats.ideaSource, icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-50' },
          { label: '必复盘', value: stats.mustReview, icon: FileText, color: 'text-red-500', bg: 'bg-red-50' },
        ].map((s) => (
          <Card key={s.label} className="p-3">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-md ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <span className="text-label font-medium text-muted/70">{s.label}</span>
            </div>
            <div className={`stat-number mt-1 ${s.color}`}>{s.value}</div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <Input
            placeholder="搜索标题、作者、关键词..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={filterArea}
          onChange={(val) => setFilterArea(val)}
          options={[{ value: 'all', label: '全部领域' }, ...areaOptions]}
        />
        <Select
          value={filterReadingStatus}
          onChange={(val) => setFilterReadingStatus(val)}
          options={[
            { value: 'all', label: '全部阅读状态' },
            ...Object.entries(READING_STATUS_LABELS).map(([k, v]) => ({ value: k, label: v.label })),
          ]}
        />
        <Select
          value={filterJudgement}
          onChange={(val) => setFilterJudgement(val)}
          options={[
            { value: 'all', label: '全部判断' },
            ...Object.entries(JUDGEMENT_LABELS).map(([k, v]) => ({ value: k, label: v.label })),
          ]}
        />
        {(searchQuery || filterArea !== 'all' || filterReadingStatus !== 'all' || filterJudgement !== 'all' || showRelevantOnly) && (
          <button
            onClick={() => { setSearchQuery(''); setFilterArea('all'); setFilterReadingStatus('all'); setFilterJudgement('all'); setShowRelevantOnly(false); }}
            className="text-xs text-muted hover:text-accent transition-colors"
          >
            清除筛选
          </button>
        )}
      </div>

      {/* Result count */}
      <div className="text-sm text-muted">
        共 {filteredPapers.length} 篇论文
        {filteredPapers.length !== state.papers.length && <span> (已筛选，总计 {state.papers.length})</span>}
      </div>

      {/* Paper list */}
      <div className="space-y-3">
        {filteredPapers.length === 0 ? (
          <Card className="py-16 px-8 text-center">
            <FileText className="w-12 h-12 text-muted/40 mx-auto mb-3 empty-state-icon" />
            <p className="text-muted">暂无论文</p>
            <p className="text-sm text-gray-400 mb-4">添加第一篇论文开始研究</p>
            <Button variant="secondary" onClick={() => { setEditingPaper(null); setShowAddModal(true); }}>
              <Plus className="w-4 h-4" />
              添加论文
            </Button>
          </Card>
        ) : (
          filteredPapers.map((paper) => (
            <ExpandablePaperCard
              key={paper.id}
              paper={paper}
              areaNames={getAreaNames(paper.areaIds)}
              isExpanded={expandedPaperId === paper.id}
              onToggle={() => setExpandedPaperId(expandedPaperId === paper.id ? null : paper.id)}
              onEdit={handleEdit}
              onGenerateIdea={handleGenerateIdea}
              isGenerating={state.isGeneratingIdeaFromPaper}
              onExtractAssumptions={handleExtractAssumptions}
              onExtractGaps={handleExtractGaps}
              cachedAssumptions={assumptionResults[paper.id] || null}
              cachedGaps={gapResults[paper.id] || null}
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
        isOpen={!!analysisModal}
        onClose={() => setAnalysisModal(null)}
        type={analysisModal?.type || 'assumptions'}
        loading={analysisLoading}
        assumptions={analysisModal ? assumptionResults[analysisModal.paper.id] || null : null}
        gaps={analysisModal ? gapResults[analysisModal.paper.id] || null : null}
      />
    </div>
  );
}

/* ───────── Expandable Paper Card ───────── */

const ASSUMPTION_STYLES: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  taskAssumptions: { label: '任务假设', icon: Target, color: '#991b1b', bg: '#fee2e2' },
  sensingAssumptions: { label: '感知假设', icon: Eye, color: '#1e40af', bg: '#dbeafe' },
  dataAssumptions: { label: '数据假设', icon: Database, color: '#065f46', bg: '#d1fae5' },
  robotAssumptions: { label: '机器人假设', icon: Cpu, color: '#7c3aed', bg: '#ede9fe' },
  evaluationAssumptions: { label: '评估假设', icon: BarChart3, color: '#92400e', bg: '#fef3c7' },
};

function ExpandablePaperCard({
  paper, areaNames, isExpanded, onToggle,
  onEdit, onGenerateIdea, isGenerating, onExtractAssumptions, onExtractGaps,
  cachedAssumptions, cachedGaps,
}: {
  paper: Paper;
  areaNames: string[];
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: (paper: Paper) => void;
  onGenerateIdea: (paperId: string) => void;
  isGenerating: boolean;
  onExtractAssumptions: (paper: Paper) => void;
  onExtractGaps: (paper: Paper) => void;
  cachedAssumptions: any;
  cachedGaps: any;
}) {
  const readingInfo = READING_STATUS_LABELS[paper.readingStatus];
  const judgementInfo = JUDGEMENT_LABELS[paper.judgementLevel];

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {/* ── Collapsed header ── */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-ink text-sm leading-snug">{paper.title}</h3>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted truncate">
              <span className="truncate">{paper.authors}</span>
              <span className="flex-shrink-0">·</span>
              <span className="flex-shrink-0">{paper.year}</span>
              <span className="flex-shrink-0">·</span>
              <span className="flex-shrink-0">{paper.venue}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Tag color={readingInfo.color} bgColor={readingInfo.bgColor} size="sm">{readingInfo.label}</Tag>
            <Tag color={judgementInfo.color} bgColor={judgementInfo.bgColor} size="sm">{judgementInfo.label}</Tag>
          </div>
        </div>

        {paper.oneSentenceSummary && (
          <p className="text-sm text-gray-600 line-clamp-2 mt-2">{paper.oneSentenceSummary}</p>
        )}

        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {areaNames.slice(0, 4).map((name) => (
            <Tag key={name} variant="secondary" size="sm" className="text-xs">{name}</Tag>
          ))}
          {paper.relevanceToMyResearch && (
            <span className="text-xs text-muted ml-1 line-clamp-1">相关性: {paper.relevanceToMyResearch}</span>
          )}
        </div>

        {/* Action bar */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-rule/50">
          <Button variant="ghost" className="text-xs py-1 px-2" onClick={() => onEdit(paper)}>
            <Edit className="w-3 h-3" />
            编辑
          </Button>
          <Button variant="ghost" className="text-xs py-1 px-2" onClick={() => onGenerateIdea(paper.id)} disabled={isGenerating}>
            <Sparkles className="w-3 h-3" />
            生成想法
          </Button>
          <Button variant="ghost" className="text-xs py-1 px-2" onClick={() => onExtractAssumptions(paper)}>
            <Lightbulb className="w-3 h-3" />
            提取假设
          </Button>
          <Button variant="ghost" className="text-xs py-1 px-2" onClick={() => onExtractGaps(paper)}>
            <TriangleAlert className="w-3 h-3" />
            分析缺口
          </Button>
          <div className="flex-1" />
          {/* External links */}
          {paper.arxivUrl && (
            <a href={paper.arxivUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted hover:text-accent transition-colors">
              <Globe className="w-3.5 h-3.5" />
              arXiv
            </a>
          )}
          {paper.pdfUrl && (
            <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted hover:text-red-500 transition-colors">
              <FileDown className="w-3.5 h-3.5" />
              PDF
            </a>
          )}
          {paper.codeUrl && (
            <a href={paper.codeUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted hover:text-gray-800 transition-colors">
              <Github className="w-3.5 h-3.5" />
              Code
            </a>
          )}
          <button onClick={onToggle}
            className="inline-flex items-center gap-1 text-xs text-muted hover:text-accent transition-colors ml-1">
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {isExpanded ? '收起' : '展开'}
          </button>
        </div>
      </div>

      {/* ── Expanded detail panel ── */}
      {isExpanded && (
        <div className="border-t border-rule bg-bg2 px-5 py-5 space-y-5">
          {/* Core info: problem definition, contributions, method */}
          {(paper.oneSentenceSummary || paper.relevanceToMyResearch) && (
            <Section title="核心信息" icon={FileText} color="#292524">
              <InfoRow label="一句话总结" value={paper.oneSentenceSummary} />
              <InfoRow label="与我的研究相关性" value={paper.relevanceToMyResearch} />
            </Section>
          )}

          {/* Assumptions — colored categories */}
          {paper.assumptions && paper.assumptions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-purple-500" />
                <h4 className="text-sm font-semibold text-ink">假设前提</h4>
                <span className="text-xs text-muted">{paper.assumptions.length} 条</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {paper.assumptions.map((a, i) => (
                  <div key={i} className="bg-white rounded-lg p-3 border border-rule/30 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                      {i + 1}
                    </span>
                    <span className="text-sm text-gray-700 leading-relaxed">{a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Limitations */}
          {paper.limitations && paper.limitations.length > 0 && (
            <Section title="局限与疑问" icon={AlertCircle} color="#b45309">
              {paper.limitations.map((l, i) => (
                <div key={i} className="flex items-start gap-2 mb-2 last:mb-0">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">{l}</span>
                </div>
              ))}
            </Section>
          )}

          {/* Extracted assumptions by category (if assumptionsResult exists from extraction) */}
          {cachedAssumptions && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Microscope className="w-4 h-4 text-accent" />
                <h4 className="text-sm font-semibold text-ink">AI 提取的假设分类</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(ASSUMPTION_STYLES).map(([key, style]) => {
                  const items = (cachedAssumptions as any)?.[key];
                  if (!items?.length) return null;
                  const Icon = style.icon;
                  return (
                    <div key={key} className="rounded-lg p-3 border-l-4" style={{ borderLeftColor: style.color, backgroundColor: style.bg + '44' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-3.5 h-3.5" style={{ color: style.color }} />
                        <span className="text-xs font-bold" style={{ color: style.color }}>{style.label}</span>
                        <span className="text-xs text-muted">({items.length})</span>
                      </div>
                      <ul className="space-y-1">
                        {items.map((item: string, idx: number) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-gray-400 mt-0.5">&#8226;</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
              {/* Verification questions */}
              {(cachedAssumptions as any)?.verificationQuestions?.length > 0 && (
                <div className="mt-3 bg-accent/[0.06] rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <HelpCircle className="w-3.5 h-3.5 text-accent" />
                    <span className="text-xs font-bold text-accent">待验证问题 ({(cachedAssumptions as any).verificationQuestions.length})</span>
                  </div>
                  <ul className="space-y-1">
                    {(cachedAssumptions as any).verificationQuestions.map((q: string, i: number) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <HelpCircle className="w-3.5 h-3.5 text-accent/50 flex-shrink-0 mt-0.5" />
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Gap analysis results */}
          {cachedGaps && (cachedGaps as any)?.gaps?.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-4 h-4 text-red-500" />
                <h4 className="text-sm font-semibold text-ink">研究缺口分析 ({(cachedGaps as any).gaps.length})</h4>
              </div>
              <div className="space-y-3">
                {(cachedGaps as any).gaps.map((gap: any, i: number) => (
                  <div key={i} className="bg-white rounded-lg p-4 border border-red-100">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">Gap {i + 1}</span>
                      <span className="text-sm font-medium text-gray-900">{gap.description}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                      <div className="bg-green-50 rounded p-2">
                        <p className="text-xs text-green-700 font-medium mb-1">支撑证据</p>
                        <p className="text-sm text-gray-600">{gap.evidenceFor}</p>
                      </div>
                      <div className="bg-amber-50 rounded p-2">
                        <p className="text-xs text-amber-700 font-medium mb-1">弱点 / 风险</p>
                        <p className="text-sm text-gray-600">{gap.whyWeak}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* External links detail */}
          {(paper.arxivUrl || paper.pdfUrl || paper.codeUrl) && (
            <Section title="外部资源" icon={ExternalLink} color="#6b7280">
              <div className="flex flex-wrap gap-3">
                {paper.arxivUrl && (
                  <a href={paper.arxivUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-rule rounded-lg text-sm text-gray-700 hover:border-accent hover:text-accent transition-colors">
                    <Globe className="w-4 h-4" />
                    arXiv 页面
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  </a>
                )}
                {paper.pdfUrl && (
                  <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-rule rounded-lg text-sm text-gray-700 hover:border-red-400 hover:text-red-500 transition-colors">
                    <FileDown className="w-4 h-4" />
                    PDF 文件
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  </a>
                )}
                {paper.codeUrl && (
                  <a href={paper.codeUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-rule rounded-lg text-sm text-gray-700 hover:border-gray-600 hover:text-gray-800 transition-colors">
                    <Github className="w-4 h-4" />
                    项目代码
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  </a>
                )}
              </div>
            </Section>
          )}
        </div>
      )}
    </Card>
  );
}

/* ───────── Helper sub-components ───────── */

function Section({ title, icon: Icon, color, children }: { title: string; icon: any; color: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4" style={{ color }} />
        <h4 className="text-sm font-semibold text-ink">{title}</h4>
      </div>
      <div className="ml-6">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="mb-2 last:mb-0">
      <span className="text-xs text-muted">{label}</span>
      <p className="text-sm text-gray-700 mt-0.5">{value}</p>
    </div>
  );
}

export default function PapersPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-muted">加载中...</div>}>
      <PapersContent />
    </Suspense>
  );
}

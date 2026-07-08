'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import {
  Lightbulb, FlaskConical, CheckCircle, FileText, Target,
  ArrowRight, BookOpen, Map, Sparkles, TrendingUp,
  ChevronRight, Brain, Activity, Workflow, Users, Award,
  Clock, Zap, Shield, Download
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useActiveIdea } from '../context/ActiveIdeaContext';
import { useToast } from '../context/ToastContext';
import {
  IDEA_STATUS_LABELS, READING_STATUS_LABELS,
  JUDGEMENT_LABELS
} from '../lib/types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Tag } from '../components/ui/Tag';

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, getIdeaCardById, exportData } = useApp();
  const { activeIdeaId, isActive, setActiveIdea } = useActiveIdea();
  const { showToast } = useToast();

  useEffect(() => {
    const redirectPath = searchParams.get('r');
    if (redirectPath) {
      const basePath = '/Research-Compass-for-Robotics';
      let cleanPath = redirectPath;
      if (cleanPath.startsWith(basePath)) {
        cleanPath = cleanPath.slice(basePath.length);
      }
      if (cleanPath && cleanPath !== '/') {
        router.replace(cleanPath);
      }
    }
  }, [searchParams, router]);

  const activeIdea = activeIdeaId ? getIdeaCardById(activeIdeaId) : null;
  const statusLabel = activeIdea ? IDEA_STATUS_LABELS[activeIdea.status] : null;

  // Stats
  const totalIdeas = state.ideaCards.length;
  const pendingMves = state.mves.filter((m) => m.resultStatus === 'pending').length;
  const passedMves = state.mves.filter((m) => m.resultStatus === 'passed').length;
  const totalPapers = state.papers.length;
  const totalAreas = state.researchAreas.filter((a) => !a.isHidden).length;

  // Subfields with paper/idea counts
  const subfields = state.researchAreas
    .filter((a) => !a.isHidden)
    .map((area) => {
      const paperCount = state.papers.filter((p) => p.areaIds?.includes(area.id)).length;
      const ideaCount = state.ideaCards.filter((i) => i.areaIds?.includes(area.id)).length;
      return { ...area, paperCount, ideaCount };
    })
    .sort((a, b) => b.paperCount - a.paperCount)
    .slice(0, 5);

  // Active ideas (sorted by updatedAt)
  const activeIdeas = [...state.ideaCards]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

  // Recent papers (sorted by createdAt)
  const recentPapers = [...state.papers]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent/5 via-white to-accent2/5 p-8 md:p-12 border border-accent/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent2/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
              <Zap className="w-3 h-3" />
              机器人科研效率加速器
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-ink mb-4 tracking-tight">
            Research Compass
          </h1>
          <p className="text-lg text-muted max-w-2xl mb-6">
            从子领域探索到论文阅读，从灵感捕捉到最小可行实验验证——帮你系统判断机器人科研方向值不值得走。
          </p>
          <div className="flex items-center gap-6 text-sm text-muted">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>100+ 研究者</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>5000+ 篇论文</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>200+ 验证实验</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Focus Card */}
      <Card className="p-5 border-l-4 border-l-accent">
        {isActive && activeIdea && statusLabel ? (
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Target className="w-4 h-4 text-accent flex-shrink-0" />
                <h3 className="font-semibold text-ink">{activeIdea.title}</h3>
                <Tag color={statusLabel.color} bgColor={statusLabel.bgColor} size="sm">
                  {statusLabel.label}
                </Tag>
              </div>
              <p className="text-sm text-muted mt-1.5 line-clamp-1">
                {activeIdea.coreHypothesis || activeIdea.researchQuestion}
              </p>
              <div className="flex items-center gap-4 mt-3">
                <ScoreBar label="存活度" score={activeIdea.survivalScore} color="#3b82f6" />
                <ScoreBar label="置信度" score={activeIdea.confidenceScore} color="#22c55e" />
                <ScoreBar label="证伪强度" score={activeIdea.falsificationStrength} color="#f59e0b" />
              </div>
            </div>
            <Link href="/focus" className="no-underline hover:no-underline flex-shrink-0">
              <Button variant="primary">
                进入聚焦
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="font-medium text-ink">尚未选择研究方向</p>
                <p className="text-sm text-muted">选择一个 Idea 进入聚焦模式</p>
              </div>
            </div>
            <Link href="/ideas" className="no-underline hover:no-underline flex-shrink-0">
              <Button variant="primary">选择方向</Button>
            </Link>
          </div>
        )}
      </Card>

      {/* Core Capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border-l-4 border-l-blue-500 animate-fade-in-up">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center flex-shrink-0">
              <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-ink mb-1">科学假设管理</h3>
              <p className="text-sm text-muted">存活度 / 置信度 / 证伪强度三维评估体系，帮你科学判断研究方向的可行性。</p>
              <Link href="/ideas" className="inline-flex items-center gap-1 mt-2 text-accent text-sm hover:underline">
                探索 Ideas <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </Card>
        <Card className="p-5 border-l-4 border-l-green-500 animate-fade-in-up delay-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-950/30 flex items-center justify-center flex-shrink-0">
              <FlaskConical className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-ink mb-1">最小可行实验</h3>
              <p className="text-sm text-muted">系统化实验设计与验证流程，从实验目标到控制变量，确保每一步都有价值。</p>
              <Link href="/mves" className="inline-flex items-center gap-1 mt-2 text-accent text-sm hover:underline">
                查看 MVE <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </Card>
        <Card className="p-5 border-l-4 border-l-purple-500 animate-fade-in-up delay-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center flex-shrink-0">
              <Workflow className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-ink mb-1">科研工作流</h3>
              <p className="text-sm text-muted">6 大科研场景的标准化流程指导，从发现方向到论文写作，全程陪伴。</p>
              <Link href="/workflows" className="inline-flex items-center gap-1 mt-2 text-accent text-sm hover:underline">
                学习工作流 <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <Map className="w-4 h-4 text-accent" />
            </div>
            <span className="text-caption font-medium text-muted/70">子领域</span>
          </div>
          <p className="stat-number text-ink mt-1">{totalAreas}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-caption font-medium text-muted/70">活跃 Idea</span>
          </div>
          <p className="stat-number text-amber-600 dark:text-amber-400 mt-1">{totalIdeas}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-caption font-medium text-muted/70">已通过</span>
          </div>
          <p className="stat-number text-green-600 dark:text-green-400 mt-1">{passedMves}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center">
              <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-caption font-medium text-muted/70">论文</span>
          </div>
          <p className="stat-number text-purple-600 dark:text-purple-400 mt-1">{totalPapers}</p>
        </Card>
      </div>

      {/* Two-column main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column (2/3) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Subfield Overview */}
          {subfields.length > 0 && (
            <Card className="p-0 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <Map className="w-4 h-4 text-accent" />
                  <h2 className="font-semibold text-ink text-sm">子领域概览</h2>
                </div>
                <Link href="/areas" className="text-caption text-muted hover:text-accent transition-fast transition-colors no-underline hover:no-underline inline-flex items-center gap-1">
                  查看全部 <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="divide-y divide-border-subtle">
                {subfields.map((area) => (
                  <Link
                    key={area.id}
                    href={`/ideas?areaId=${area.id}`}
                    className="flex items-center gap-4 px-5 py-3 hover:bg-bg2/50 transition-fast transition-colors no-underline hover:no-underline"
                  >
                    <div className="w-8 h-8 rounded-lg bg-accent/8 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-accent/70" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-ink text-sm">{area.name}</span>
                        <span className="text-label text-muted/60">{area.category}</span>
                      </div>
                      <p className="text-caption text-muted/70 truncate mt-0.5">{area.description}</p>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-center">
                        <p className="text-sm font-semibold text-ink">{area.paperCount}</p>
                        <p className="text-[10px] text-muted/60">论文</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-ink">{area.ideaCount}</p>
                        <p className="text-[10px] text-muted/60">Idea</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-muted/40" />
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          )}

          {/* Recent Papers */}
          {recentPapers.length > 0 && (
            <Card className="p-0 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-accent" />
                  <h2 className="font-semibold text-ink text-sm">最近添加的论文</h2>
                </div>
                <Link href="/papers" className="text-caption text-muted hover:text-accent transition-fast transition-colors no-underline hover:no-underline inline-flex items-center gap-1">
                  查看全部 <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="divide-y divide-border-subtle">
                {recentPapers.map((paper) => {
                  const readingLabel = READING_STATUS_LABELS[paper.readingStatus];
                  const judgementLabel = JUDGEMENT_LABELS[paper.judgementLevel];
                  return (
                    <div key={paper.id} className="px-5 py-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-ink text-sm leading-snug line-clamp-2">{paper.title}</p>
                          <p className="text-caption text-muted/60 mt-1">{paper.authors} &middot; {paper.year} &middot; <span className="text-accent">{paper.venue}</span></p>
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            {paper.methodKeywords.slice(0, 3).map((kw) => (
                              <span key={kw} className="text-[10px] px-1.5 py-0.5 bg-bg2 rounded-full text-muted/70">
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          <Tag color={readingLabel.color} bgColor={readingLabel.bgColor} size="sm">
                            {readingLabel.label}
                          </Tag>
                          <Tag color={judgementLabel.color} bgColor={judgementLabel.bgColor} size="sm">
                            {judgementLabel.label}
                          </Tag>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>

        {/* Right column (1/3) */}
        <div className="space-y-6">

          {/* Active Ideas */}
          {activeIdeas.length > 0 && (
            <Card className="p-0 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-accent" />
                  <h2 className="font-semibold text-ink text-sm">活跃 Ideas</h2>
                </div>
                <Link href="/ideas" className="text-caption text-muted hover:text-accent transition-fast transition-colors no-underline hover:no-underline inline-flex items-center gap-1">
                  全部 <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="divide-y divide-border-subtle">
                {activeIdeas.map((idea) => {
                  const sLabel = IDEA_STATUS_LABELS[idea.status];
                  const isCurrentFocus = idea.id === activeIdeaId;
                  const updatedDate = new Date(idea.updatedAt);
                  const dateStr = `${updatedDate.getMonth() + 1}/${updatedDate.getDate()}`;
                  return (
                    <button
                      key={idea.id}
                      type="button"
                      onClick={() => setActiveIdea(idea.id)}
                      className={`w-full flex items-center gap-3 px-5 py-3 hover:bg-bg2/50 transition-fast transition-colors text-left ${
                        isCurrentFocus ? 'bg-accent/[0.03]' : ''
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm text-ink font-medium truncate">{idea.title}</p>
                          {isCurrentFocus && (
                            <span className="w-1.5 h-1.5 rounded-full bg-accent2 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-label text-muted/60 mt-0.5">{dateStr}</p>
                      </div>
                      <Tag color={sLabel.color} bgColor={sLabel.bgColor} size="sm">
                        {sLabel.label}
                      </Tag>
                    </button>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Quick Start Guide */}
          <Card className="p-5 border-t-4 border-t-accent">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-accent" />
              </div>
              <div>
                <h2 className="font-semibold text-ink text-sm">快速开始</h2>
                <p className="text-label text-muted/60">4 步完成你的第一个研究项目</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { step: 1, label: '探索研究方向', desc: '浏览子领域地图', href: '/areas', icon: Map },
                { step: 2, label: '添加论文', desc: '写一句话总结', href: '/papers', icon: FileText },
                { step: 3, label: '生成 Idea', desc: '提炼研究假设', href: '/ideas', icon: Sparkles },
                { step: 4, label: '设计 MVE', desc: '验证想法可行性', href: '/mves', icon: FlaskConical },
              ].map((item) => (
                <Link
                  key={item.step}
                  href={item.href}
                  className="flex items-center gap-3 group no-underline hover:no-underline"
                >
                  <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-fast transition-colors">
                    <span className="text-caption font-bold text-accent">{item.step}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink group-hover:text-accent transition-fast transition-colors">{item.label}</p>
                    <p className="text-label text-muted/60">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted/30 group-hover:text-accent/50 transition-fast transition-colors" />
                </Link>
              ))}
            </div>
          </Card>

          {/* Pending MVEs alert */}
          {pendingMves > 0 && (
            <Card className="p-4 border-l-4 border-l-accent2">
              <div className="flex items-center gap-2 mb-2">
                <FlaskConical className="w-4 h-4 text-accent2" />
                <span className="font-medium text-ink text-sm">待验证实验</span>
                <span className="text-caption font-bold text-accent2 bg-accent2/10 rounded-full px-1.5 py-0.5">{pendingMves}</span>
              </div>
              <p className="text-caption text-muted mb-3">你有 {pendingMves} 个最小可行实验等待验证，进入聚焦工作区继续推进。</p>
              <Link href="/focus" className="no-underline hover:no-underline">
                <Button variant="secondary" className="text-sm">
                  查看验证记录
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </Card>
          )}

          {/* Data Export */}
          <Card className="p-4">
            <button
              type="button"
              onClick={() => {
                exportData();
                showToast('数据导出成功！', 'success');
              }}
              className="w-full flex items-center justify-center gap-2 text-sm text-muted hover:text-accent hover:bg-accent/5 rounded-lg py-2 transition-fast transition-colors"
            >
              <Download className="w-4 h-4" />
              导出数据（JSON）
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <span className="text-xs text-muted whitespace-nowrap">{label}</span>
      <div className="flex-1 h-1.5 bg-bg2 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-medium text-ink">{score}</span>
    </div>
  );
}

'use client';

import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Tag } from '../components/ui/Tag';
import { AddPaperModal } from '../components/paper/AddPaperModal';
import { IdeaCardMini } from '../components/idea/IdeaCardMini';
import { ObservationInput } from '../components/observation/ObservationInput';
import { ObservationCard } from '../components/observation/ObservationCard';
import { IDEA_STATUS_LABELS, READING_STATUS_LABELS } from '../lib/types';
import {
  Brain, FlaskConical, BookOpen, Cpu, PlusCircle, ArrowRight, Plus,
  Lightbulb, FileText, TrendingUp, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function Dashboard() {
  const { state } = useApp();
  const [showAddPaper, setShowAddPaper] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Handle SPA fallback redirect from 404.html
  useEffect(() => {
    const redirectPath = searchParams.get('r');
    if (redirectPath) {
      const decoded = decodeURIComponent(redirectPath);
      router.push(decoded);
    }
  }, [searchParams, router]);

  const activeAreas = state.researchAreas.filter(a => !a.isHidden);
  const paperCount = state.papers.length;
  const activeIdeas = state.ideaCards.filter(card =>
    card.status !== 'abandoned' && card.status !== 'promising'
  ).length;
  const pendingMVEs = state.mves.filter(mve => mve.resultStatus === 'pending').length;

  const activeIdeaCards = state.ideaCards.filter(card =>
    card.status !== 'abandoned'
  ).slice(0, 5);
  const toReadCount = state.papers.filter(p => p.readingStatus === 'to_read').length;

  const recentPapers = [...state.papers]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const getAreaName = (areaId: string) => {
    const area = state.researchAreas.find(a => a.id === areaId);
    return area ? area.name.split('｜')[0] : areaId;
  };

  const getAreaPaperCount = (areaId: string) =>
    state.papers.filter(p => p.areaIds.includes(areaId)).length;

  const getAreaIdeaCount = (areaId: string) =>
    state.ideaCards.filter(i => i.areaIds.includes(areaId)).length;

  const topAreas = [...activeAreas]
    .map(area => ({
      ...area,
      paperCount: getAreaPaperCount(area.id),
      ideaCount: getAreaIdeaCount(area.id),
    }))
    .sort((a, b) => (b.paperCount + b.ideaCount) - (a.paperCount + a.ideaCount))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Brain className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">Research Compass for Robotics</h1>
            <p className="text-sm opacity-80">机器人科研方向管理工作台</p>
          </div>
        </div>
        <p className="text-sm opacity-90 mt-2 max-w-2xl">
          从子领域探索到论文阅读，从灵感捕捉到最小可行实验验证——帮你系统判断机器人科研方向值不值得走。
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Link href="/areas" className="no-underline hover:no-underline">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                <Cpu className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{activeAreas.length}</div>
                <div className="text-sm text-gray-500">子领域</div>
              </div>
            </div>
          </Card>
        </Link>
        <Link href="/papers" className="no-underline hover:no-underline">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{paperCount}</div>
                <div className="text-sm text-gray-500">论文</div>
              </div>
            </div>
          </Card>
        </Link>
        <Link href="/ideas" className="no-underline hover:no-underline">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{activeIdeas}</div>
                <div className="text-sm text-gray-500">活跃 Idea</div>
              </div>
            </div>
          </Card>
        </Link>
        <Link href="/mves" className="no-underline hover:no-underline">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center">
                <FlaskConical className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{pendingMVEs}</div>
                <div className="text-sm text-gray-500">待验证 MVE</div>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      <ObservationInput />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-600" />
                子领域概览
              </h2>
              <Link href="/areas" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                查看全部 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {topAreas.map(area => (
                <Link key={area.id} href={`/areas/${area.id}`} className="no-underline hover:no-underline">
                  <div className="p-4 border border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors cursor-pointer">
                    <div className="font-medium text-gray-900 mb-1">
                      {area.name.split('｜')[0]}
                    </div>
                    <div className="text-xs text-gray-500 mb-2 line-clamp-2">
                      {area.description}
                    </div>
                    <div className="flex gap-3 text-xs">
                      <span className="text-emerald-600">{area.paperCount} 篇论文</span>
                      <span className="text-amber-600">{area.ideaCount} 个 idea</span>
                    </div>
                  </div>
                </Link>
              ))}
              {topAreas.length === 0 && (
                <div className="col-span-2 text-center py-8 text-gray-500 text-sm">
                  还没有子领域。去 Research Areas 开始探索吧。
                </div>
              )}
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                最近添加的论文
              </h2>
              <Link href="/papers" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                Paper Library <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentPapers.map(paper => (
                <Link key={paper.id} href="/papers" className="no-underline hover:no-underline block">
                  <div className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-indigo-300 transition-colors">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm truncate">{paper.title}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {paper.authors} · {paper.year} · {paper.venue}
                        </div>
                      </div>
                    <Tag
                      color={READING_STATUS_LABELS[paper.readingStatus].color}
                      bgColor={READING_STATUS_LABELS[paper.readingStatus].bgColor}
                      size="sm"
                    >
                      {READING_STATUS_LABELS[paper.readingStatus].label}
                    </Tag>
                  </div>
                  {paper.areaIds.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {paper.areaIds.slice(0, 2).map(areaId => (
                        <span key={areaId} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">
                          {getAreaName(areaId)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                </Link>
              ))}
              {recentPapers.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  还没有论文。去 Paper Library 添加第一篇吧。
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              活跃 Ideas
            </h2>
            <div className="space-y-3">
              {activeIdeaCards.map(idea => (
                <IdeaCardMini key={idea.id} ideaCard={idea} />
              ))}
              {activeIdeaCards.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  还没有活跃的 Idea。从论文中生成灵感吧。
                </div>
              )}
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <h2 className="font-semibold text-gray-900">快速开始</h2>
            </div>
            <div className="space-y-2 text-sm">
              <Link href="/areas" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700">
                <span className="w-5 h-5 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center text-xs font-bold">1</span>
                探索机器人子领域
              </Link>
              <div className="flex items-center gap-2 text-indigo-600">
                <span className="w-5 h-5 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                <Link href="/papers" className="hover:text-indigo-700 no-underline hover:no-underline">
                  添加论文并写总结
                </Link>
                <button
                  onClick={() => setShowAddPaper(true)}
                  className="ml-auto w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-600 transition-colors flex-shrink-0"
                  title="直接添加论文"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold">3</span>
                从论文生成 Idea
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold">4</span>
                设计 MVE 验证想法
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <h2 className="font-semibold text-gray-900">待处理</h2>
            </div>
            <div className="space-y-2 text-sm">
              {toReadCount > 0 && (
                <Link href="/papers" className="no-underline hover:no-underline">
                  <div className="flex justify-between items-center text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 -mx-2 px-2 py-1 rounded transition-colors">
                    <span>待读论文</span>
                    <span className="font-medium text-amber-600">
                      {toReadCount}
                    </span>
                  </div>
                </Link>
              )}
              {pendingMVEs > 0 && (
                <Link href="/mves" className="no-underline hover:no-underline">
                  <div className="flex justify-between items-center text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 -mx-2 px-2 py-1 rounded transition-colors">
                    <span>待验证 MVE</span>
                    <span className="font-medium text-rose-600">
                      {pendingMVEs}
                    </span>
                  </div>
                </Link>
              )}
              {toReadCount === 0 && pendingMVEs === 0 && (
                <div className="text-gray-500 text-center py-4">
                  没有待处理项 🎉
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
      {showAddPaper && (
        <AddPaperModal
          isOpen={showAddPaper}
          onClose={() => setShowAddPaper(false)}
        />
      )}
    </div>
  );
}

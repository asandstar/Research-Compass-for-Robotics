'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '../../../context/AppContext';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Tag } from '../../../components/ui/Tag';
import { IDEA_STATUS_LABELS } from '../../../lib/types';
import { PaperCard } from '../../../components/paper/PaperCard';
import { AddPaperModal } from '../../../components/paper/AddPaperModal';
import { CreateIdeaModal } from '../../../components/idea/CreateIdeaModal';
import { ArrowLeft, Plus, FileText, Lightbulb, FlaskConical, BookOpen } from 'lucide-react';

export default function AreaDetailClient() {
  const params = useParams();
  const router = useRouter();
  const areaId = params.id as string;
  const { state, getResearchAreaById, getPapersByAreaId, getIdeasByAreaId, getMvesByAreaId, createIdeaFromPaper } = useApp();
  const [showAddPaper, setShowAddPaper] = useState(false);
  const [showCreateIdea, setShowCreateIdea] = useState(false);

  const handleGenerateIdea = async (paperId: string) => {
    const idea = await createIdeaFromPaper(paperId);
    router.push(`/idea/${idea.id}`);
  };

  const area = getResearchAreaById(areaId);
  const papers = getPapersByAreaId(areaId);
  const ideas = getIdeasByAreaId(areaId);
  const mves = getMvesByAreaId(areaId);
  const activeMves = mves.filter(m => m.resultStatus === 'pending');

  if (!area) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">子领域不存在</p>
        <Link href="/areas" className="text-indigo-600 hover:underline mt-2 inline-block">
          返回子领域列表
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/areas" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{area.name}</h1>
          <p className="text-gray-600 mt-1">{area.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowAddPaper(true)}>
            <FileText className="w-4 h-4 mr-1" />
            新增论文
          </Button>
          <Button onClick={() => setShowCreateIdea(true)}>
            <Lightbulb className="w-4 h-4 mr-1" />
            新增 Idea
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-gray-600">
            <FileText className="w-5 h-5" />
            <span className="text-sm">论文总数</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{papers.length}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-gray-600">
            <BookOpen className="w-5 h-5" />
            <span className="text-sm">已读/在读</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {papers.filter(p => p.readingStatus === 'reviewed' || p.readingStatus === 'deep_reading').length}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Lightbulb className="w-5 h-5" />
            <span className="text-sm">活跃 Idea</span>
          </div>
          <p className="text-2xl font-bold text-indigo-600 mt-1">
            {ideas.filter(i => i.status !== 'abandoned' && i.status !== 'promising').length}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-amber-600">
            <FlaskConical className="w-5 h-5" />
            <span className="text-sm">MVE 进行中</span>
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-1">{activeMves.length}</p>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="font-semibold text-gray-900 mb-3">关注问题</h3>
        <ul className="space-y-2">
          {area.focusQuestions.map((q, i) => (
            <li key={i} className="flex items-start gap-2 text-gray-700">
              <span className="text-indigo-500 mt-0.5">Q{i + 1}.</span>
              {q}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-gray-100">
          {area.keywords.map((kw, i) => (
            <Tag key={i} variant="secondary">{kw}</Tag>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-500" />
              相关论文 ({papers.length})
            </h2>
            <Link href="/papers" className="text-sm text-indigo-600 hover:underline">
              查看全部
            </Link>
          </div>
          {papers.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">该子领域暂无论文</p>
              <Button variant="secondary" className="mt-3" onClick={() => setShowAddPaper(true)}>
                <Plus className="w-4 h-4 mr-1" />
                添加第一篇论文
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {papers.slice(0, 5).map((paper) => (
                <PaperCard
                  key={paper.id}
                  paper={paper}
                  getAreaName={(areaId) => {
                    const area = state.researchAreas.find(a => a.id === areaId);
                    return area ? area.name.split('｜')[0] : areaId;
                  }}
                  onGenerateIdea={handleGenerateIdea}
                  isGeneratingIdea={state.isGeneratingIdeaFromPaper}
                  compact
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-gray-500" />
            Idea ({ideas.length})
          </h2>
          {ideas.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-gray-500 text-sm">该子领域暂无 Idea</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {ideas.map((idea) => (
                <Link key={idea.id} href={`/idea/${idea.id}`} className="block no-underline hover:no-underline">
                  <Card className="p-4 hover:shadow-sm transition-shadow cursor-pointer">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-gray-900 text-sm line-clamp-2">{idea.title}</h4>
                    </div>
                    <Tag
                      size="sm"
                      color={IDEA_STATUS_LABELS[idea.status].color}
                      bgColor={IDEA_STATUS_LABELS[idea.status].bgColor}
                      className="mt-2"
                    >
                      {IDEA_STATUS_LABELS[idea.status].label}
                    </Tag>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {activeMves.length > 0 && (
            <>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 pt-2">
                <FlaskConical className="w-5 h-5 text-amber-500" />
                MVE 进行中 ({activeMves.length})
              </h2>
              <div className="space-y-3">
                {activeMves.map((mve) => {
                  const idea = ideas.find(i => i.id === mve.ideaCardId);
                  return (
                    <Link key={mve.id} href={`/mve/${mve.id}`} className="block no-underline hover:no-underline">
                      <Card className="p-4 hover:shadow-sm transition-shadow cursor-pointer border-l-4 border-l-amber-400">
                        <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                          {idea?.title || 'Unknown Idea'}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{mve.experimentGoal}</p>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <AddPaperModal
        isOpen={showAddPaper}
        onClose={() => setShowAddPaper(false)}
        preselectedAreaId={areaId}
      />

      <CreateIdeaModal
        isOpen={showCreateIdea}
        onClose={() => setShowCreateIdea(false)}
        preselectedAreaId={areaId}
        onCreated={(ideaId) => router.push(`/idea/${ideaId}`)}
      />
    </div>
  );
}

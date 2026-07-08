'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { Target, Pencil, Plus, FlaskConical, BookOpen } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useActiveIdea } from '../../context/ActiveIdeaContext';
import { FocusIdeaCard } from '../../components/focus/FocusIdeaCard';
import { ScoreMeter } from '../../components/focus/ScoreMeter';
import { EvidencePressurePanel } from '../../components/focus/EvidencePressurePanel';
import { NextActionCard } from '../../components/focus/NextActionCard';
import { MVEGateCard } from '../../components/focus/MVEGateCard';
import { FocusEditPanel } from '../../components/focus/FocusEditPanel';
import { ResearchTimeline } from '../../components/focus/ResearchTimeline';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { NextAction, NextActionType } from '../../lib/nextActionCalculator';

export default function FocusPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-muted">加载中...</div>}>
      <FocusContent />
    </Suspense>
  );
}

function FocusContent() {
  const { state, getIdeaCardById } = useApp();
  const { activeIdeaId, setActiveIdea, clearActiveIdea, isActive } = useActiveIdea();

  // Edit panel state
  const [editAction, setEditAction] = useState<NextAction | null>(null);
  const [editDirectMode, setEditDirectMode] = useState<NextActionType | undefined>(undefined);
  const [editDirectMveId, setEditDirectMveId] = useState<string | undefined>(undefined);

  // Auto-select most recently updated non-rejected idea if none set
  useEffect(() => {
    if (state.isInitialized && !activeIdeaId && state.ideaCards.length > 0) {
      const nonRejected = state.ideaCards
        .filter((c) => c.status !== 'rejected')
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      if (nonRejected.length > 0) {
        setActiveIdea(nonRejected[0].id);
      }
    }
  }, [state.isInitialized, activeIdeaId, state.ideaCards, setActiveIdea]);

  // Clear active idea if it no longer exists
  useEffect(() => {
    if (state.isInitialized && activeIdeaId && !getIdeaCardById(activeIdeaId)) {
      clearActiveIdea();
    }
  }, [state.isInitialized, activeIdeaId, getIdeaCardById, clearActiveIdea]);

  if (!state.isInitialized) {
    return <div className="text-center py-20 text-muted">加载中...</div>;
  }

  // Empty state: no active idea
  if (!isActive || !activeIdeaId || !getIdeaCardById(activeIdeaId)) {
    return (
      <EmptyState
        icon={<Target className="w-8 h-8 text-muted/60" />}
        title="选择一个研究方向进入聚焦模式"
        description="从你的 Idea 列表中选择一个方向，进入深度聚焦工作区"
        action={
          <Link href="/ideas" className="no-underline hover:no-underline">
            <Button variant="primary">选择研究方向</Button>
          </Link>
        }
      />
    );
  }

  // Handlers for edit panel
  const handleAction = (action: NextAction) => {
    setEditAction(action);
    setEditDirectMode(undefined);
    setEditDirectMveId(undefined);
  };

  const handleOpenEditor = (mode: NextActionType, mveId?: string) => {
    setEditDirectMode(mode);
    setEditDirectMveId(mveId);
    setEditAction(null);
  };

  const handleClosePanel = () => {
    setEditAction(null);
    setEditDirectMode(undefined);
    setEditDirectMveId(undefined);
  };

  const isPanelOpen = !!editAction || !!editDirectMode;

  // Active idea view
  return (
    <div className="space-y-6">
      <FocusIdeaCard onEdit={() => handleOpenEditor('complete_core_fields')} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ScoreMeter />
        <EvidencePressurePanel onAddEvidence={() => handleOpenEditor('add_evidence')} />
      </div>

      <NextActionCard onAction={handleAction} />

      <MVEGateCard
        onExecuteMve={(mveId) => handleOpenEditor('execute_pending_mve', mveId)}
        onGenerateMve={() => handleOpenEditor('generate_mve')}
      />

      {/* Quick Actions Bar */}
      <Card className="p-0 overflow-hidden">
        <div className="px-5 py-3 border-b border-border-subtle">
          <h3 className="text-sm font-medium text-muted">快捷操作</h3>
        </div>
        <div className="px-5 py-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleOpenEditor('complete_core_fields')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted hover:text-accent hover:bg-accent/[0.06] rounded-lg transition-fast transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            编辑假设
          </button>
          <button
            type="button"
            onClick={() => handleOpenEditor('add_predictions')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted hover:text-accent hover:bg-accent/[0.06] rounded-lg transition-fast transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            添加预测
          </button>
          <button
            type="button"
            onClick={() => handleOpenEditor('add_evidence')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted hover:text-accent hover:bg-accent/[0.06] rounded-lg transition-fast transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            添加证据
          </button>
          <button
            type="button"
            onClick={() => handleOpenEditor('add_failure_conditions')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted hover:text-accent hover:bg-accent/[0.06] rounded-lg transition-fast transition-colors"
          >
            <Target className="w-3.5 h-3.5" />
            失败条件
          </button>
          <button
            type="button"
            onClick={() => handleOpenEditor('generate_mve')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted hover:text-accent hover:bg-accent/[0.06] rounded-lg transition-fast transition-colors"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            生成实验
          </button>
        </div>
      </Card>

      {/* Research Timeline */}
      <ResearchTimeline />

      {/* Edit Panel */}
      <FocusEditPanel
        isOpen={isPanelOpen}
        action={editAction}
        directMode={editDirectMode}
        directMveId={editDirectMveId}
        onClose={handleClosePanel}
      />
    </div>
  );
}

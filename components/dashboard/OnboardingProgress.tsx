'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Lightbulb, FlaskConical, CheckCircle2, X, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useActiveIdea } from '../../context/ActiveIdeaContext';
import { Card } from '../ui/Card';

const STORAGE_KEY = 'rc-onboarding-dismissed';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isCompleted: (ctx: {
    papers: any[];
    ideas: any[];
    mves: any[];
    hasActiveIdea: boolean;
  }) => boolean;
}

const steps: OnboardingStep[] = [
  {
    id: 'papers',
    title: '添加第一篇论文',
    description: '从你读过的论文开始，写一句话总结',
    href: '/papers',
    icon: BookOpen,
    isCompleted: ({ papers }) => papers.length > 0,
  },
  {
    id: 'ideas',
    title: '创建第一个 Idea',
    description: '从论文中提炼研究假设，用三维体系评估',
    href: '/ideas',
    icon: Lightbulb,
    isCompleted: ({ ideas }) => ideas.length > 0,
  },
  {
    id: 'focus',
    title: '进入聚焦模式',
    description: '选择一个方向，进入深度工作区',
    href: '/focus',
    icon: ChevronRight,
    isCompleted: ({ hasActiveIdea }) => hasActiveIdea,
  },
  {
    id: 'mves',
    title: '设计第一个 MVE',
    description: '用最小可行实验验证你的想法',
    href: '/mves',
    icon: FlaskConical,
    isCompleted: ({ mves }) => mves.length > 0,
  },
];

export function OnboardingProgress() {
  const { state } = useApp();
  const { isActive } = useActiveIdea();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed === 'true') {
      setIsVisible(false);
    }
  }, []);

  const completedSteps = steps.filter((step) =>
    step.isCompleted({
      papers: state.papers,
      ideas: state.ideaCards,
      mves: state.mves,
      hasActiveIdea: isActive,
    })
  ).length;

  const totalSteps = steps.length;
  const progress = (completedSteps / totalSteps) * 100;
  const allCompleted = completedSteps === totalSteps;

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <Card className="p-5 border-l-4 border-l-accent relative overflow-hidden">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 text-muted hover:text-ink dark:hover:text-dark-ink rounded-md hover:bg-bg2 dark:hover:bg-dark-bg2 transition-fast"
        aria-label="关闭引导"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="pr-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <span className="text-sm font-bold text-accent">{completedSteps}/{totalSteps}</span>
          </div>
          <div>
            <h3 className="font-semibold text-ink dark:text-dark-ink text-sm">快速开始</h3>
            <p className="text-xs text-muted">完成 4 步，开启你的科研加速之旅</p>
          </div>
        </div>

        <div className="w-full h-1.5 bg-bg2 dark:bg-dark-bg2 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="space-y-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isDone = step.isCompleted({
              papers: state.papers,
              ideas: state.ideaCards,
              mves: state.mves,
              hasActiveIdea: isActive,
            });

            return (
              <Link
                key={step.id}
                href={step.href}
                className="flex items-center gap-3 p-2 -mx-2 rounded-lg group no-underline hover:no-underline hover:bg-bg2 dark:hover:bg-dark-bg2 transition-fast"
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-fast ${
                  isDone
                    ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                    : 'bg-bg2 dark:bg-dark-bg2 text-muted'
                }`}>
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium transition-fast ${
                    isDone ? 'text-muted line-through' : 'text-ink dark:text-dark-ink group-hover:text-accent'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted">{step.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted/40 group-hover:text-accent/60 transition-fast flex-shrink-0" />
              </Link>
            );
          })}
        </div>

        {allCompleted && (
          <div className="mt-4 pt-3 border-t border-border-subtle dark:border-dark-border-subtle flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
              太棒了！你已经完成了所有入门步骤
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}

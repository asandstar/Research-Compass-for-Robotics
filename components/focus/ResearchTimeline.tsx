'use client';

import { useMemo } from 'react';
import { Lightbulb, FlaskConical, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useActiveIdea } from '../../context/ActiveIdeaContext';
import { Card } from '../ui/Card';

interface TimelineEvent {
  id: string;
  type: 'idea_created' | 'mve_created' | 'mve_passed' | 'mve_failed';
  title: string;
  description: string;
  timestamp: string;
  icon: typeof Lightbulb;
  iconColor: string;
  iconBg: string;
}

export function ResearchTimeline() {
  const { activeIdeaId } = useActiveIdea();
  const { getIdeaCardById, state } = useApp();

  const events = useMemo(() => {
    if (!activeIdeaId) return [];

    const idea = getIdeaCardById(activeIdeaId);
    if (!idea) return [];

    const timelineEvents: TimelineEvent[] = [];

    // Idea creation event
    timelineEvents.push({
      id: `idea-${idea.id}`,
      type: 'idea_created',
      title: '创建研究方向',
      description: idea.title,
      timestamp: idea.createdAt,
      icon: Lightbulb,
      iconColor: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-50 dark:bg-amber-950/30',
    });

    // MVE events
    const mves = state.mves.filter(m => m.ideaCardId === idea.id);
    for (const mve of mves) {
      timelineEvents.push({
        id: `mve-created-${mve.id}`,
        type: 'mve_created',
        title: '设计实验',
        description: mve.experimentGoal,
        timestamp: mve.createdAt,
        icon: FlaskConical,
        iconColor: 'text-blue-600 dark:text-blue-400',
        iconBg: 'bg-blue-50 dark:bg-blue-950/30',
      });

      if (mve.resultStatus === 'passed') {
        timelineEvents.push({
          id: `mve-passed-${mve.id}`,
          type: 'mve_passed',
          title: '实验通过',
          description: mve.resultNotes || '实验验证成功',
          timestamp: mve.createdAt,
          icon: CheckCircle,
          iconColor: 'text-green-600 dark:text-green-400',
          iconBg: 'bg-green-50 dark:bg-green-950/30',
        });
      } else if (mve.resultStatus === 'failed') {
        timelineEvents.push({
          id: `mve-failed-${mve.id}`,
          type: 'mve_failed',
          title: '实验失败',
          description: mve.resultNotes || '实验验证失败',
          timestamp: mve.createdAt,
          icon: XCircle,
          iconColor: 'text-red-600 dark:text-red-400',
          iconBg: 'bg-red-50 dark:bg-red-950/30',
        });
      }
    }

    // Sort by timestamp (newest first)
    timelineEvents.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return timelineEvents;
  }, [activeIdeaId, getIdeaCardById, state.mves]);

  if (events.length === 0) return null;

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays} 天前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} 周前`;

    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-muted" />
        <h3 className="font-semibold text-ink">研究进度</h3>
        <span className="text-xs text-muted ml-auto">{events.length} 个事件</span>
      </div>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border-subtle" />

        <div className="space-y-0">
          {events.map((event, index) => {
            const Icon = event.icon;
            const isLast = index === events.length - 1;

            return (
              <div key={event.id} className="relative flex items-start gap-3 py-3">
                {/* Icon */}
                <div className={`relative z-10 w-10 h-10 rounded-full ${event.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${event.iconColor}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-ink">{event.title}</span>
                    <span className="text-[11px] text-muted">{formatDate(event.timestamp)}</span>
                  </div>
                  <p className="text-xs text-muted mt-0.5 line-clamp-2">{event.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

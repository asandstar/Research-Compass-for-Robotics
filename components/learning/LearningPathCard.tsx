'use client';

import { FileText, Wrench, Sparkles, Layers, BookOpen } from 'lucide-react';
import { Card } from '../ui/Card';
import { Tag } from '../ui/Tag';
import LevelSection from './LevelSection';
import type { LearningPath } from '../../lib/learning/learningPaths';

interface LearningPathCardProps {
  path: LearningPath;
}

export default function LearningPathCard({ path }: LearningPathCardProps) {
  return (
    <Card className="p-5 h-full flex flex-col">
      {/* Header */}
      <div className="mb-4 pb-3 border-b border-border-subtle">
        <div className="flex items-baseline gap-2 flex-wrap">
          <h3 className="text-h2 font-semibold text-ink">{path.name}</h3>
          <span className="text-caption text-muted">{path.fullName}</span>
        </div>
      </div>

      {/* Why worth learning */}
      <div className="mb-4">
        <p className="text-body text-ink leading-relaxed">{path.whyWorthLearning}</p>
      </div>

      {/* Prerequisites */}
      <div className="mb-4">
        <p className="text-label font-semibold text-muted uppercase tracking-wider mb-2">前置知识</p>
        <div className="flex items-center gap-1.5 flex-wrap">
          {path.prerequisites.map((pre) => (
            <Tag key={pre} variant="secondary" size="sm">
              {pre}
            </Tag>
          ))}
        </div>
      </div>

      {/* Levels */}
      <div className="mb-4">
        <p className="text-label font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" />
          学习阶段（L0 → L4）
        </p>
        <div>
          {path.levels.map((lvl, idx) => (
            <LevelSection key={lvl.level} level={lvl} isLast={idx === path.levels.length - 1} />
          ))}
        </div>
      </div>

      {/* Recommended Papers */}
      <div className="mb-4 pt-3 border-t border-border-subtle">
        <p className="text-label font-semibold text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          推荐论文
        </p>
        <ul className="space-y-1.5">
          {path.recommendedPapers.map((paper) => (
            <li key={paper} className="text-caption text-ink leading-relaxed flex items-start gap-1.5">
              <FileText className="w-3 h-3 text-accent/60 flex-shrink-0 mt-0.5" />
              <span>{paper}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommended Tools */}
      <div className="mb-4">
        <p className="text-label font-semibold text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Wrench className="w-3.5 h-3.5" />
          推荐工具
        </p>
        <div className="flex items-center gap-1.5 flex-wrap">
          {path.recommendedTools.map((tool) => (
            <Tag key={tool} variant="outline" size="sm" color="#0d9488">
              {tool}
            </Tag>
          ))}
        </div>
      </div>

      {/* Suggested Output */}
      <div className="bg-accent/5 rounded-lg p-3 mt-auto">
        <div className="flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-label font-semibold text-accent uppercase tracking-wider mb-1">建议输出物</p>
            <p className="text-caption text-ink leading-relaxed">{path.suggestedOutput}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

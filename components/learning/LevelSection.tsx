'use client';

import { Tag } from '../ui/Tag';
import type { LearningLevel } from '../../lib/learning/learningPaths';

interface LevelSectionProps {
  level: LearningLevel;
  isLast: boolean;
}

export default function LevelSection({ level, isLast }: LevelSectionProps) {
  return (
    <div className="flex items-start gap-3 relative">
      {/* Level circle + connector line */}
      <div className="flex flex-col items-center flex-shrink-0 self-stretch">
        <div className="w-8 h-8 rounded-full bg-accent/10 text-accent font-semibold text-sm flex items-center justify-center">
          L{level.level}
        </div>
        {!isLast && (
          <div className="flex-1 w-px bg-border-subtle my-1 min-h-[1rem]" />
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 min-w-0 ${isLast ? 'pb-0' : 'pb-4'}`}>
        <p className="font-medium text-ink text-sm">{level.title}</p>
        <p className="text-caption text-muted mt-0.5 leading-relaxed">{level.goal}</p>
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {level.topics.map((topic) => (
            <Tag key={topic} variant="soft" size="sm" color="#0d9488">
              {topic}
            </Tag>
          ))}
        </div>
      </div>
    </div>
  );
}

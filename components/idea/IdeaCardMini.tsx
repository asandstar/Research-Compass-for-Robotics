'use client';

import Link from 'next/link';
import { IdeaCard, IDEA_STATUS_LABELS } from '../../lib/types';
import { Tag } from '../ui/Tag';

interface IdeaCardMiniProps {
  ideaCard: IdeaCard;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[10px] text-gray-500 w-8">{score}</span>
    </div>
  );
}

export function IdeaCardMini({ ideaCard }: IdeaCardMiniProps) {
  const label = IDEA_STATUS_LABELS[ideaCard.status];

  return (
    <Link href={`/idea/${ideaCard.id}`} className="no-underline hover:no-underline block">
      <div className="bg-surface border border-border-subtle rounded-lg p-4 hover:border-accent/40 hover:shadow-card-hover transition-fast transition-all cursor-pointer">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-800 text-sm line-clamp-1">{ideaCard.title}</h3>
          <Tag color={label.color} bgColor={label.bgColor}>{label.label}</Tag>
        </div>
        
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500 w-16">存活分数</span>
            <ScoreBar score={ideaCard.survivalScore} color="#1e40af" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500 w-16">置信度</span>
            <ScoreBar score={ideaCard.confidenceScore} color="#065f46" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500 w-16">可证伪性</span>
            <ScoreBar score={ideaCard.falsificationStrength} color="#92400e" />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{ideaCard.sourceObservations.length} 条观察</span>
          <span>{formatDate(ideaCard.updatedAt)}</span>
        </div>
      </div>
    </Link>
  );
}

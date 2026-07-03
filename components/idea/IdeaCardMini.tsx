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

export function IdeaCardMini({ ideaCard }: IdeaCardMiniProps) {
  const label = IDEA_STATUS_LABELS[ideaCard.status];

  return (
    <Link href={`/idea/${ideaCard.id}`}>
      <div className="bg-white border border-rule rounded-lg p-4 hover:border-accent hover:shadow-sm transition-all cursor-pointer">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-ink text-sm">{ideaCard.title}</h3>
          <Tag color={label.color} bgColor={label.bgColor}>{label.label}</Tag>
        </div>
        <div className="text-xs text-muted">
          来源观察: {ideaCard.sourceObservations.length} 条
          {' | '}
          最后更新: {formatDate(ideaCard.updatedAt)}
        </div>
      </div>
    </Link>
  );
}

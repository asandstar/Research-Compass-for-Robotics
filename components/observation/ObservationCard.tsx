import { Observation } from '../../lib/types';
import { TYPE_LABELS } from '../../lib/types';
import { Tag } from '../ui/Tag';
import { Button } from '../ui/Button';

interface ObservationCardProps {
  observation: Observation;
  onGenerateIdea?: () => void;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  
  if (hours < 1) return '刚刚';
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  return `${days} 天前`;
}

export function ObservationCard({ observation, onGenerateIdea }: ObservationCardProps) {
  const label = TYPE_LABELS[observation.type];

  return (
    <div className="bg-bg2 border-l-[3px] border-border-subtle rounded-lg p-3 mb-3" style={{ borderLeftColor: label.color }}>
      <div className="flex justify-between items-start mb-2">
        <Tag color={label.color} bgColor={label.bgColor}>{label.label}</Tag>
        <span className="text-xs text-muted">{formatDate(observation.createdAt)}</span>
      </div>
      <div className="text-sm text-ink dark:text-dark-ink mb-2">{observation.content}</div>
      <div className="text-xs text-muted mb-1">
        关键词: {observation.keywords.join(' / ')}
      </div>
      <div className="text-xs text-accent">
        建议: {observation.suggestedAction}
      </div>
      {onGenerateIdea && (
        <div className="mt-2">
          <Button variant="secondary" onClick={onGenerateIdea} className="text-xs">
            生成 Idea Card
          </Button>
        </div>
      )}
    </div>
  );
}

'use client';

import { Pencil } from 'lucide-react';
import { useActiveIdea } from '../../context/ActiveIdeaContext';
import { useApp } from '../../context/AppContext';
import { IDEA_STATUS_LABELS } from '../../lib/types';
import { Card } from '../ui/Card';
import { Tag } from '../ui/Tag';

interface FocusIdeaCardProps {
  onEdit?: () => void;
}

export function FocusIdeaCard({ onEdit }: FocusIdeaCardProps) {
  const { activeIdeaId } = useActiveIdea();
  const { getIdeaCardById, getResearchAreaById } = useApp();

  if (!activeIdeaId) return null;

  const idea = getIdeaCardById(activeIdeaId);
  if (!idea) return null;

  const statusLabel = IDEA_STATUS_LABELS[idea.status];
  const areaTags = idea.areaIds
    .slice(0, 3)
    .map((id) => getResearchAreaById(id))
    .filter(Boolean);

  return (
    <Card className="border-l-4 border-l-accent">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Tag color={statusLabel.color} bgColor={statusLabel.bgColor} size="sm">
            {statusLabel.label}
          </Tag>
        </div>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-accent hover:bg-accent/10 transition-fast transition-colors"
            title="编辑假设"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <h3 className="font-bold text-lg text-ink">{idea.title}</h3>
      <p className="text-sm text-muted mt-1">{idea.researchQuestion}</p>
      <p className="text-sm text-ink mt-2 line-clamp-2">{idea.coreHypothesis}</p>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {areaTags.map((area) =>
          area ? (
            <Tag key={area.id} variant="secondary" size="sm">
              {area.name}
            </Tag>
          ) : null
        )}
      </div>
    </Card>
  );
}

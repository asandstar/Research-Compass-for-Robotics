'use client';

import { Target } from 'lucide-react';
import { useActiveIdea } from '../../context/ActiveIdeaContext';
import { useApp } from '../../context/AppContext';
import { calculateNextAction, NextAction } from '../../lib/nextActionCalculator';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface NextActionCardProps {
  onAction?: (action: NextAction) => void;
}

export function NextActionCard({ onAction }: NextActionCardProps) {
  const { activeIdeaId } = useActiveIdea();
  const { getIdeaCardById, state } = useApp();

  if (!activeIdeaId) return null;

  const idea = getIdeaCardById(activeIdeaId);
  if (!idea) return null;

  const mves = state.mves.filter((m) => m.ideaCardId === activeIdeaId);
  const nextAction = calculateNextAction(idea, mves);

  const handleClick = () => {
    if (onAction) {
      onAction(nextAction);
    }
  };

  return (
    <Card className="shadow-card border-l-4 border-l-accent bg-accent/[0.04]">
      <div className="flex items-center gap-2 mb-2">
        <Target className="w-4 h-4 text-accent" />
        <span className="text-sm font-medium text-muted">下一步行动</span>
      </div>
      <h3 className="text-lg font-bold text-ink">{nextAction.label}</h3>
      <p className="text-sm text-muted mt-1">{nextAction.description}</p>
      <div className="mt-4">
        <Button
          variant="hero"
          onClick={handleClick}
        >
          {nextAction.actionLabel}
        </Button>
      </div>
    </Card>
  );
}

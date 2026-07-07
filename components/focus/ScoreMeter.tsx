'use client';

import { useActiveIdea } from '../../context/ActiveIdeaContext';
import { useApp } from '../../context/AppContext';
import { Card } from '../ui/Card';

const CIRCUMFERENCE = 2 * Math.PI * 28; // ~175.93

interface GaugeProps {
  score: number;
  label: string;
  color: string;
}

function Gauge({ score, label, color }: GaugeProps) {
  const offset = CIRCUMFERENCE * (1 - score / 100);

  return (
    <div className="flex flex-col items-center">
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle
          cx="32"
          cy="32"
          r="28"
          fill="none"
          stroke="#e7e5e4"
          strokeWidth="4"
        />
        <circle
          cx="32"
          cy="32"
          r="28"
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 32 32)"
        />
      </svg>
      <span className="text-xs text-muted mt-1">{label}</span>
      <span className="font-bold text-lg text-ink">{score}</span>
    </div>
  );
}

export function ScoreMeter() {
  const { activeIdeaId } = useActiveIdea();
  const { getIdeaCardById } = useApp();

  if (!activeIdeaId) return null;

  const idea = getIdeaCardById(activeIdeaId);
  if (!idea) return null;

  return (
    <Card>
      <h3 className="font-semibold text-ink mb-4">Idea 健康度</h3>
      <div className="grid grid-cols-3 gap-4">
        <Gauge score={idea.survivalScore} label="存活度" color="#3b82f6" />
        <Gauge score={idea.confidenceScore} label="置信度" color="#22c55e" />
        <Gauge score={idea.falsificationStrength} label="证伪强度" color="#f59e0b" />
      </div>
      <div className="border-t border-rule mt-4 pt-3">
        <p className="text-label text-muted text-center">
          预测: {idea.predictions.length} | 失败条件: {idea.failureConditions.length} | 支持证据: {idea.evidenceForHypothesis.length} | 反对证据: {idea.evidenceAgainstHypothesis.length}
        </p>
      </div>
    </Card>
  );
}

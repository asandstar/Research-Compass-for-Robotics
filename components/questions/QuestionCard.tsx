'use client';

import { Flame, Compass, Sparkles, BookOpen, ArrowRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Tag } from '../ui/Tag';
import { QUESTION_TYPE_LABELS, DIFFICULTY_LABELS, IMPACT_LABELS, ResearchQuestion } from '../../lib/questions/researchQuestions';

interface QuestionCardProps {
  question: ResearchQuestion;
}

export default function QuestionCard({ question }: QuestionCardProps) {
  const typeLabel = QUESTION_TYPE_LABELS[question.type];
  const difficultyLabel = DIFFICULTY_LABELS[question.difficulty];
  const impactLabel = IMPACT_LABELS[question.impact];

  const getTypeIcon = () => {
    switch (question.type) {
      case 'hot': return Flame;
      case 'gap': return Compass;
      case 'emerging': return Sparkles;
      case 'classic': return BookOpen;
    }
  };

  const TypeIcon = getTypeIcon();

  return (
    <Card interactive className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${typeLabel.bgColor} ${typeLabel.color}`}>
              <TypeIcon className="w-3 h-3" />
              {typeLabel.label}
            </span>
            <span className={`text-[10px] font-medium ${difficultyLabel.color}`}>
              难度: {difficultyLabel.label}
            </span>
            <span className={`text-[10px] font-medium ${impactLabel.color}`}>
              影响: {impactLabel.label}
            </span>
          </div>
          <p className="text-sm font-medium text-ink leading-relaxed mb-3">
            {question.text}
          </p>
          <p className="text-label text-muted">
            {question.areaName}
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-muted/40 flex-shrink-0" />
      </div>
    </Card>
  );
}

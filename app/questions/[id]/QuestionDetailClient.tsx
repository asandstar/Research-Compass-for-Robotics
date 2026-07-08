'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Target, Zap, AlertTriangle, Lightbulb, BookOpen, Flame, Compass, Sparkles } from 'lucide-react';
import { ResearchQuestion, QUESTION_TYPE_LABELS } from '@/lib/questions/researchQuestions';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';

const TYPE_ICONS = {
  hot: Flame,
  gap: Compass,
  emerging: Sparkles,
  classic: BookOpen,
};

interface QuestionDetailClientProps {
  question: ResearchQuestion;
}

export default function QuestionDetailClient({ question }: QuestionDetailClientProps) {
  const router = useRouter();

  const typeLabel = QUESTION_TYPE_LABELS[question.type];
  const TypeIcon = TYPE_ICONS[question.type];

  const difficultyLabel = ['', '低', '中', '高'][question.difficulty];
  const impactLabel = ['', '低', '中', '高'][question.impact];

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <button
          onClick={() => router.push('/questions')}
          className="inline-flex items-center gap-2 text-caption text-muted hover:text-ink dark:hover:text-dark-ink transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          返回问题列表
        </button>

        {/* Type Tag */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${typeLabel.bgColor} ${typeLabel.color}`}>
            <TypeIcon className="w-3.5 h-3.5" />
            {typeLabel.label}
          </span>
          <Tag variant="secondary">{question.areaName}</Tag>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-ink dark:text-dark-ink mb-6 leading-snug">
          {question.text}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-6 text-sm text-muted mb-8">
          <div className="flex items-center gap-1.5">
            <Target className="w-4 h-4" />
            <span>难度: {difficultyLabel}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4" />
            <span>影响力: {impactLabel}</span>
          </div>
        </div>

        {/* Description */}
        {question.description && (
          <Card className="mb-6">
            <h2 className="text-base font-semibold text-ink dark:text-dark-ink mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-accent" />
              问题背景
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              {question.description}
            </p>
          </Card>
        )}

        {/* Key Challenges */}
        {question.keyChallenges && question.keyChallenges.length > 0 && (
          <Card className="mb-6 border-l-4 border-l-red-400">
            <h2 className="text-base font-semibold text-ink dark:text-dark-ink mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400" />
              关键挑战
            </h2>
            <ul className="space-y-2">
              {question.keyChallenges.map((challenge, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 dark:bg-red-500 mt-1.5 flex-shrink-0" />
                  {challenge}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Opportunities */}
        {question.opportunities && question.opportunities.length > 0 && (
          <Card className="mb-6 border-l-4 border-l-green-400">
            <h2 className="text-base font-semibold text-ink dark:text-dark-ink mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-green-500 dark:text-green-400" />
              研究机会
            </h2>
            <ul className="space-y-2">
              {question.opportunities.map((opportunity, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 dark:bg-green-500 mt-1.5 flex-shrink-0" />
                  {opportunity}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Action */}
        <div className="flex justify-center pt-4">
          <button
            onClick={() => router.push('/questions')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            返回问题列表
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { ExternalLink, Edit, Sparkles, Lightbulb, TriangleAlert } from 'lucide-react';
import { Paper, READING_STATUS_LABELS } from '../../lib/types';
import { Card } from '../ui/Card';
import { Tag } from '../ui/Tag';
import { Button } from '../ui/Button';

interface PaperSignalCardProps {
  paper: Paper;
  areaNames: string[];
  onEdit: (paper: Paper) => void;
  onGenerateIdea: (paperId: string) => void;
  isGenerating: boolean;
  onExtractAssumptions: (paper: Paper) => void;
  onExtractGaps: (paper: Paper) => void;
}

const JUDGEMENT_STYLES: Record<string, { label: string; color: string; bgColor: string }> = {
  breakthrough: { label: '突破性', color: '#065f46', bgColor: '#d1fae5' },
  useful: { label: '有用', color: '#1e40af', bgColor: '#dbeafe' },
  mixed: { label: '混合评价', color: '#92400e', bgColor: '#fef3c7' },
  limited: { label: '有限', color: '#6b7280', bgColor: '#f3f4f6' },
};

export default function PaperSignalCard({
  paper,
  areaNames,
  onEdit,
  onGenerateIdea,
  isGenerating,
  onExtractAssumptions,
  onExtractGaps,
}: PaperSignalCardProps) {
  const readingStatusInfo = READING_STATUS_LABELS[paper.readingStatus];
  const judgementStyle = JUDGEMENT_STYLES[paper.judgementLevel] || JUDGEMENT_STYLES.limited;

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      {/* Top row: title + judgement */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-ink text-sm truncate flex-1 min-w-0">
          {paper.title}
        </h3>
        <Tag
          color={judgementStyle.color}
          bgColor={judgementStyle.bgColor}
          size="sm"
          className="flex-shrink-0"
        >
          {judgementStyle.label}
        </Tag>
      </div>

      {/* Meta row: authors + venue */}
      <div className="mt-1 flex items-center gap-2 text-xs text-muted truncate">
        <span className="truncate">{paper.authors}</span>
        <span className="flex-shrink-0">·</span>
        <span className="flex-shrink-0">{paper.venue}</span>
      </div>

      {/* Summary */}
      {paper.oneSentenceSummary && (
        <p className="text-sm text-gray-600 line-clamp-2 mt-2">
          {paper.oneSentenceSummary}
        </p>
      )}

      {/* Tags row: area names + reading status */}
      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
        {areaNames.slice(0, 3).map((name) => (
          <Tag key={name} variant="secondary" size="sm" className="text-xs">
            {name}
          </Tag>
        ))}
        <Tag
          color={readingStatusInfo.color}
          bgColor={readingStatusInfo.bgColor}
          size="sm"
        >
          {readingStatusInfo.label}
        </Tag>
      </div>

      {/* Action row */}
      <div className="flex items-center gap-2 mt-3">
        <Button variant="ghost" className="text-xs py-1 px-2" onClick={() => onEdit(paper)}>
          <Edit className="w-3 h-3" />
          编辑
        </Button>
        <Button
          variant="ghost"
          className="text-xs py-1 px-2"
          onClick={() => onGenerateIdea(paper.id)}
          disabled={isGenerating}
        >
          <Sparkles className="w-3 h-3" />
          生成想法
        </Button>
        <Button variant="ghost" className="text-xs py-1 px-2" onClick={() => onExtractAssumptions(paper)}>
          <Lightbulb className="w-3 h-3" />
          假设
        </Button>
        <Button variant="ghost" className="text-xs py-1 px-2" onClick={() => onExtractGaps(paper)}>
          <TriangleAlert className="w-3 h-3" />
          空白
        </Button>
        {paper.arxivUrl && (
          <a
            href={paper.arxivUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </Card>
  );
}

'use client';

import React from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { MVE, MVE_RESULT_LABELS } from '../../lib/types';
import { Card } from '../ui/Card';
import { Tag } from '../ui/Tag';
import { Button } from '../ui/Button';

interface MVEHistoryCardProps {
  mve: MVE;
  ideaTitle: string;
  onOpenInFocus: (ideaId: string) => void;
}

const MVE_TYPE_LABELS: Record<string, { label: string; color: string; bgColor: string }> = {
  sanity_check: { label: '合理性检查', color: '#1e40af', bgColor: '#dbeafe' },
  ablation: { label: '消融实验', color: '#7c3aed', bgColor: '#ede9fe' },
  generalization_test: { label: '泛化测试', color: '#065f46', bgColor: '#d1fae5' },
  stress_test: { label: '压力测试', color: '#991b1b', bgColor: '#fee2e2' },
};

export default function MVEHistoryCard({ mve, ideaTitle, onOpenInFocus }: MVEHistoryCardProps) {
  const typeInfo = MVE_TYPE_LABELS[mve.mveType] || { label: mve.mveType, color: '#78716c', bgColor: '#f5f5f4' };
  const resultInfo = MVE_RESULT_LABELS[mve.resultStatus];

  const nodeConfig =
    mve.resultStatus === 'passed'
      ? { bg: 'bg-green-500 dark:bg-green-600', Icon: CheckCircle }
      : mve.resultStatus === 'failed'
        ? { bg: 'bg-red-500 dark:bg-red-600', Icon: XCircle }
        : { bg: 'bg-gray-400 dark:bg-gray-600 animate-pulse', Icon: Clock };

  const { bg, Icon } = nodeConfig;

  return (
    <div className="flex items-start gap-4">
      {/* Timeline node */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ring-4 ring-bg timeline-node ${bg}`}
      >
        <Icon className="w-4 h-4 text-white" />
      </div>

      {/* Card body */}
      <Card className="flex-1 p-4">
        {/* Header row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Tag color={typeInfo.color} bgColor={typeInfo.bgColor}>
              {typeInfo.label}
            </Tag>
            <Tag color={resultInfo.color} bgColor={resultInfo.bgColor}>
              {resultInfo.label}
            </Tag>
          </div>
          <span className="text-xs text-gray-400 flex-shrink-0">
            {new Date(mve.createdAt).toLocaleDateString('zh-CN')}
          </span>
        </div>

        {/* Experiment goal */}
        <p className="text-sm text-gray-700 line-clamp-2 mt-2">
          {mve.experimentGoal}
        </p>

        {/* Failed notes */}
        {mve.resultStatus === 'failed' && mve.resultNotes && (
          <div className="flex items-start gap-1 mt-2">
            <AlertCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0 mt-0.5" />
            <span className="text-xs text-red-600 line-clamp-1">
              {mve.resultNotes}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="mt-3">
          <Button
            variant="ghost"
            className="text-xs"
            onClick={() => onOpenInFocus(mve.ideaCardId)}
          >
            在聚焦中查看
          </Button>
        </div>
      </Card>
    </div>
  );
}

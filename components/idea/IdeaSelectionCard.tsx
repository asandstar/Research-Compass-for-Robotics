'use client';

import React from 'react';
import { IdeaCard, IDEA_STATUS_LABELS } from '../../lib/types';
import { Card } from '../ui/Card';
import { Tag } from '../ui/Tag';
import { Button } from '../ui/Button';

interface IdeaSelectionCardProps {
  idea: IdeaCard;
  isActive: boolean;
  areaNames: string[];
  onFocus: (id: string) => void;
}

export default function IdeaSelectionCard({ idea, isActive, areaNames, onFocus }: IdeaSelectionCardProps) {
  const statusInfo = IDEA_STATUS_LABELS[idea.status];

  return (
    <Card
      className={
        isActive
          ? 'ring-2 ring-accent/30 border-accent/50 bg-accent/[0.03]'
          : ''
      }
    >
      <div className="flex flex-row justify-between gap-4">
        {/* Left column */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-ink truncate">{idea.title}</h3>

          {/* Tags row: status + active badge */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <Tag color={statusInfo.color} bgColor={statusInfo.bgColor}>
              {statusInfo.label}
            </Tag>
            {isActive && (
              <Tag color="#0d9488" bgColor="#ccfbf1">
                当前聚焦
              </Tag>
            )}
          </div>

          {/* Hypothesis */}
          <p className="line-clamp-1 text-sm text-muted mt-1.5">
            {idea.hypothesis}
          </p>

          {/* Area tags (up to 3) */}
          {areaNames.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {areaNames.slice(0, 3).map((name) => (
                <Tag key={name} variant="secondary" size="sm">
                  {name}
                </Tag>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col items-end flex-shrink-0">
          {/* Score pills */}
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="bg-bg2 rounded-full px-2 py-0.5">
              存活:{idea.survivalScore}
            </span>
            <span className="bg-bg2 rounded-full px-2 py-0.5">
              置信:{idea.confidenceScore}
            </span>
          </div>

          {/* Action */}
          <div className="mt-3">
            {isActive ? (
              <span className="text-xs text-muted">已聚焦</span>
            ) : (
              <Button
                variant="focus"
                className="text-xs py-1 px-3"
                onClick={() => onFocus(idea.id)}
              >
                聚焦此方向
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

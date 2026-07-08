'use client';

import Link from 'next/link';
import { FileText, Lightbulb, FlaskConical, TrendingUp, TrendingDown, Flame, Minus } from 'lucide-react';
import { ResearchArea } from '../../lib/types';
import { Card } from '../ui/Card';
import { Tag } from '../ui/Tag';

interface AreaMapCardProps {
  area: ResearchArea;
  paperCount: number;
  ideaCount: number;
  mveCount: number;
}

const TREND_CONFIG: Record<NonNullable<ResearchArea['trend']>, { icon: typeof Flame; label: string; bgColor: string; textColor: string }> = {
  hot: { icon: Flame, label: '热门', bgColor: 'bg-red-50 dark:bg-red-950/30', textColor: 'text-red-600 dark:text-red-400' },
  trending: { icon: TrendingUp, label: '上升', bgColor: 'bg-green-50 dark:bg-green-950/30', textColor: 'text-green-600 dark:text-green-400' },
  stable: { icon: Minus, label: '稳定', bgColor: 'bg-gray-50 dark:bg-gray-800/50', textColor: 'text-gray-600 dark:text-gray-400' },
  declining: { icon: TrendingDown, label: '下降', bgColor: 'bg-orange-50 dark:bg-orange-950/30', textColor: 'text-orange-600 dark:text-orange-400' },
};

export default function AreaMapCard({ area, paperCount, ideaCount, mveCount }: AreaMapCardProps) {
  const trendConfig = area.trend ? TREND_CONFIG[area.trend] : null;

  return (
    <Link href={`/ideas?areaId=${area.id}`} className="group no-underline hover:no-underline block">
      <Card interactive className="h-full">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-ink group-hover:text-accent transition-colors truncate flex-1">
            {area.name}
          </h3>
          {trendConfig && (
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${trendConfig.bgColor} ${trendConfig.textColor} flex-shrink-0`}>
              <trendConfig.icon className="w-3 h-3" />
              {trendConfig.label}
            </span>
          )}
        </div>
        <p className="line-clamp-2 text-sm text-muted mt-1">{area.description}</p>

        {area.keywords.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {area.keywords.slice(0, 3).map((kw) => (
              <Tag key={kw} variant="secondary" size="sm" className="text-xs">
                {kw}
              </Tag>
            ))}
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="flex items-center gap-1 text-muted">
            <FileText className="w-3.5 h-3.5" />
            <span className="text-sm">{paperCount}</span>
          </div>
          <div className="flex items-center gap-1 text-muted">
            <Lightbulb className="w-3.5 h-3.5" />
            <span className="text-sm">{ideaCount}</span>
          </div>
          <div className="flex items-center gap-1 text-muted">
            <FlaskConical className="w-3.5 h-3.5" />
            <span className="text-sm">{mveCount}</span>
          </div>
        </div>

        <div className="text-xs text-muted/60 mt-2">
          {new Date(area.updatedAt).toLocaleDateString('zh-CN')}
        </div>
      </Card>
    </Link>
  );
}

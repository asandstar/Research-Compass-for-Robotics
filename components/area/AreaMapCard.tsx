'use client';

import Link from 'next/link';
import { FileText, Lightbulb, FlaskConical } from 'lucide-react';
import { ResearchArea } from '../../lib/types';
import { Card } from '../ui/Card';
import { Tag } from '../ui/Tag';

interface AreaMapCardProps {
  area: ResearchArea;
  paperCount: number;
  ideaCount: number;
  mveCount: number;
}

export default function AreaMapCard({ area, paperCount, ideaCount, mveCount }: AreaMapCardProps) {
  return (
    <Link href={`/ideas?areaId=${area.id}`} className="group no-underline hover:no-underline block">
      <Card interactive className="h-full">
        <h3 className="font-medium text-ink group-hover:text-accent transition-colors truncate">
          {area.name}
        </h3>
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

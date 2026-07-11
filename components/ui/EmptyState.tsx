'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { ExternalLink } from 'lucide-react';
import { Card } from './Card';

interface EmptyStateTip {
  label: string;
  href: string;
  external?: boolean;
}

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  tips?: EmptyStateTip[];
  size?: 'default' | 'sm';
  className?: string;
}

export function EmptyState({ icon, title, description, action, tips, size = 'default', className = '' }: EmptyStateProps) {
  const padding = size === 'sm' ? 'py-10 px-6' : 'py-16 px-8';
  const iconSize = size === 'sm' ? 'w-12 h-12' : 'w-16 h-16';
  const titleSize = size === 'sm' ? 'text-base' : 'text-lg';

  return (
    <Card className={`${padding} text-center ${className}`}>
      <div className={`${iconSize} rounded-2xl bg-bg2 dark:bg-dark-bg2 flex items-center justify-center mx-auto mb-4`}>
        {icon}
      </div>
      <h3 className={`${titleSize} font-semibold text-ink dark:text-dark-ink mb-2`}>{title}</h3>
      <p className="text-sm text-muted mb-6 max-w-sm mx-auto">{description}</p>
      {action && <div className="flex items-center justify-center gap-3 mb-6">{action}</div>}
      {tips && tips.length > 0 && (
        <div className="pt-4 border-t border-border-subtle dark:border-dark-border-subtle">
          <p className="text-xs text-muted/70 mb-3">💡 相关资源</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            {tips.map((tip) =>
              tip.external ? (
                <a
                  key={tip.href}
                  href={tip.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                >
                  {tip.label}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <Link
                  key={tip.href}
                  href={tip.href}
                  className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                >
                  {tip.label}
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

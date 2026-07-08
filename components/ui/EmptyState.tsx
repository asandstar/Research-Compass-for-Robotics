'use client';

import { ReactNode } from 'react';
import { Card } from './Card';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <Card className={`py-16 px-8 text-center ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-bg2 flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-ink mb-2">{title}</h3>
      <p className="text-sm text-muted mb-6 max-w-sm mx-auto">{description}</p>
      {action && <div className="flex items-center justify-center gap-3">{action}</div>}
    </Card>
  );
}

'use client';

import { ReactNode } from 'react';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg dark:bg-dark-bg">
      {children}
    </div>
  );
}

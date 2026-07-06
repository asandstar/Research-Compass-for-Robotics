'use client';

import { Suspense } from 'react';
import { AppProvider } from '../context/AppContext';
import { Navbar } from '../components/Navbar';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Suspense fallback={<div className="text-center py-20 text-gray-500">加载中...</div>}>
          {children}
        </Suspense>
      </main>
    </AppProvider>
  );
}

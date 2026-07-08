'use client';

import { Suspense, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AppProvider } from '../context/AppContext';
import { ActiveIdeaProvider } from '../context/ActiveIdeaContext';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '../context/ToastContext';
import { Navbar } from '../components/Navbar';

function AnimatedContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [key, setKey] = useState(pathname);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 300);
    setKey(pathname);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div
      key={key}
      className={`${isAnimating ? 'route-transition-enter-active' : ''}`}
    >
      {children}
    </div>
  );
}

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppProvider>
          <ActiveIdeaProvider>
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <Suspense fallback={<div className="text-center py-20 text-gray-500 dark:text-gray-400">加载中...</div>}>
                <AnimatedContent>{children}</AnimatedContent>
              </Suspense>
            </main>
          </ActiveIdeaProvider>
        </AppProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

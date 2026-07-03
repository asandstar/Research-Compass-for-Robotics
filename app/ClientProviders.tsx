'use client';

import { AppProvider } from '../context/AppContext';
import { Navbar } from '../components/Navbar';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </AppProvider>
  );
}

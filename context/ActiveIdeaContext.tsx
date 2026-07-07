'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { useRouter } from 'next/navigation';

const OLD_KEY = 'research-compass-active-idea';
const STORAGE_KEY = 'research-compass-active-focus-idea-id';

interface ActiveIdeaContextType {
  activeIdeaId: string | null;
  setActiveIdea: (id: string) => void;
  clearActiveIdea: () => void;
  isActive: boolean;
}

const ActiveIdeaContext = createContext<ActiveIdeaContextType | null>(null);

export function ActiveIdeaProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [activeIdeaId, setActiveIdeaIdState] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const setActiveIdeaIdRef = useRef(setActiveIdeaIdState);
  setActiveIdeaIdRef.current = setActiveIdeaIdState;

  useEffect(() => {
    try {
      let stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Migration from old key
        stored = localStorage.getItem(OLD_KEY);
        if (stored) {
          localStorage.setItem(STORAGE_KEY, stored);
          localStorage.removeItem(OLD_KEY);
        }
      }
      if (stored) {
        setActiveIdeaIdRef.current(stored);
      }
    } catch {
      // localStorage may not be available
    }
    setIsInitialized(true);
  }, []);

  const setActiveIdea = useCallback((id: string) => {
    setActiveIdeaIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // ignore
    }
    router.push('/focus');
  }, [router]);

  const clearActiveIdea = useCallback(() => {
    setActiveIdeaIdState(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return (
    <ActiveIdeaContext.Provider
      value={{
        activeIdeaId: isInitialized ? activeIdeaId : null,
        setActiveIdea,
        clearActiveIdea,
        isActive: isInitialized && activeIdeaId !== null,
      }}
    >
      {children}
    </ActiveIdeaContext.Provider>
  );
}

export function useActiveIdea() {
  const context = useContext(ActiveIdeaContext);
  if (!context) {
    throw new Error('useActiveIdea must be used within an ActiveIdeaProvider');
  }
  return context;
}

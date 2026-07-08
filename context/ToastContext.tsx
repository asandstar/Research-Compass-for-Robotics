'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_CONFIG = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50 dark:bg-green-900/30',
    borderColor: 'border-green-200 dark:border-green-800',
    textColor: 'text-green-800 dark:text-green-200',
    iconColor: 'text-green-500 dark:text-green-400',
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50 dark:bg-red-900/30',
    borderColor: 'border-red-200 dark:border-red-800',
    textColor: 'text-red-800 dark:text-red-200',
    iconColor: 'text-red-500 dark:text-red-400',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50 dark:bg-blue-900/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-800 dark:text-blue-200',
    iconColor: 'text-blue-500 dark:text-blue-400',
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => {
          const config = TOAST_CONFIG[toast.type];
          const Icon = config.icon;

          return (
            <div
              key={toast.id}
              className={`
                pointer-events-auto
                flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg
                ${config.bgColor} ${config.borderColor}
                animate-slide-in-right
                max-w-sm
              `}
              style={{
                animation: 'slideInRight 0.3s ease-out',
              }}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
              <p className={`text-sm flex-1 ${config.textColor}`}>{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className={`flex-shrink-0 p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-fast`}
              >
                <X className={`w-4 h-4 ${config.iconColor}`} />
              </button>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

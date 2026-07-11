'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Download } from 'lucide-react';
import Link from 'next/link';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (typeof window !== 'undefined') {
      console.error('[ErrorBoundary] 捕获到错误:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleRefresh = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDev = process.env.NODE_ENV === 'development';

      return (
        <div className="min-h-[50vh] flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-surface dark:bg-dark-surface border border-border-default dark:border-dark-border-default rounded-2xl p-8 text-center shadow-elevated">
              <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center mx-auto mb-5">
                <AlertTriangle className="w-8 h-8 text-red-500 dark:text-red-400" />
              </div>

              <h2 className="text-xl font-semibold text-ink dark:text-dark-ink mb-2">
                页面遇到了一点问题
              </h2>

              <p className="text-sm text-muted mb-6">
                别担心，你的数据是安全的。试试刷新页面，或者返回首页继续使用。
              </p>

              {isDev && this.state.error && (
                <div className="mb-6 text-left bg-bg2 dark:bg-dark-bg2 rounded-lg p-4 overflow-auto max-h-48">
                  <p className="text-xs font-mono text-red-600 dark:text-red-400 whitespace-pre-wrap break-all">
                    {this.state.error.message}
                  </p>
                  {this.state.error.stack && (
                    <p className="text-[10px] font-mono text-muted/60 mt-2 whitespace-pre-wrap break-all">
                      {this.state.error.stack}
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={this.handleRefresh}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover transition-fast"
                >
                  <RefreshCw className="w-4 h-4" />
                  刷新页面
                </button>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-bg2 dark:bg-dark-bg2 text-ink dark:text-dark-ink rounded-lg text-sm font-medium hover:bg-rule dark:hover:bg-dark-rule transition-fast no-underline"
                >
                  <Home className="w-4 h-4" />
                  返回首页
                </Link>
              </div>

              <div className="mt-6 pt-5 border-t border-border-subtle dark:border-dark-border-subtle">
                <p className="text-xs text-muted/70 mb-3">担心数据丢失？</p>
                <button
                  onClick={() => {
                    try {
                      const data = localStorage.getItem('research-compass-data-v14');
                      if (data) {
                        const blob = new Blob([data], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `research-compass-backup-${Date.now()}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }
                    } catch (e) {
                      console.error('导出失败:', e);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline"
                >
                  <Download className="w-3.5 h-3.5" />
                  导出数据备份
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

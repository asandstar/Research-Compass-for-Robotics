'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Compass, Sparkles, Target, FlaskConical, ArrowRight, X, Check, Moon, Sun, BookOpen } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { useTheme } from '../../context/ThemeContext';

const WIZARD_KEY = 'rc-wizard-completed';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  content?: React.ReactNode;
}

export function WelcomeWizard() {
  const router = useRouter();
  const { resetAllData } = useApp();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(WIZARD_KEY);
    if (!completed) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const completeWizard = () => {
    localStorage.setItem(WIZARD_KEY, '1');
    setIsOpen(false);
  };

  const handleStartFresh = async () => {
    setIsLoading(true);
    try {
      await resetAllData();
      completeWizard();
      router.push('/papers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeepDemo = () => {
    completeWizard();
  };

  const steps: WizardStep[] = [
    {
      id: 'welcome',
      title: '欢迎来到 Research Compass',
      description: '专为机器人研究者打造的科研方向管理工作台',
      icon: Compass,
      content: (
        <div className="space-y-4 text-left">
          <p className="text-sm text-muted">
            这是一个帮你<strong className="text-ink dark:text-dark-ink">系统性判断研究方向值不值得走</strong>的工具。
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg bg-bg2 dark:bg-dark-bg2">
              <BookOpen className="w-6 h-6 mx-auto mb-2 text-accent" />
              <p className="text-xs font-medium text-ink dark:text-dark-ink">论文管理</p>
              <p className="text-[10px] text-muted mt-1">一句话总结</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-bg2 dark:bg-dark-bg2">
              <Sparkles className="w-6 h-6 mx-auto mb-2 text-accent2" />
              <p className="text-xs font-medium text-ink dark:text-dark-ink">Idea 孵化</p>
              <p className="text-[10px] text-muted mt-1">三维评估</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-bg2 dark:bg-dark-bg2">
              <FlaskConical className="w-6 h-6 mx-auto mb-2 text-purple-500" />
              <p className="text-xs font-medium text-ink dark:text-dark-ink">实验验证</p>
              <p className="text-[10px] text-muted mt-1">MVE 框架</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'theme',
      title: '选择你的偏好',
      description: '可以随时在右上角切换',
      icon: theme === 'dark' ? Moon : Sun,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => theme === 'dark' && toggleTheme()}
              className={`p-4 rounded-xl border-2 transition-fast text-left ${
                theme === 'light'
                  ? 'border-accent bg-accent/5'
                  : 'border-border-default dark:border-dark-border-default hover:border-border-strong dark:hover:border-dark-border-strong'
              }`}
            >
              <Sun className="w-6 h-6 mb-2 text-amber-500" />
              <p className="text-sm font-medium text-ink dark:text-dark-ink">浅色模式</p>
              <p className="text-xs text-muted mt-1">清爽明亮</p>
            </button>
            <button
              onClick={() => theme === 'light' && toggleTheme()}
              className={`p-4 rounded-xl border-2 transition-fast text-left ${
                theme === 'dark'
                  ? 'border-accent bg-accent/5'
                  : 'border-border-default dark:border-dark-border-default hover:border-border-strong dark:hover:border-dark-border-strong'
              }`}
            >
              <Moon className="w-6 h-6 mb-2 text-blue-500" />
              <p className="text-sm font-medium text-ink dark:text-dark-ink">深色模式</p>
              <p className="text-xs text-muted mt-1">护眼舒适</p>
            </button>
          </div>
        </div>
      ),
    },
    {
      id: 'data',
      title: '开始你的科研之旅',
      description: '选择适合你的起步方式',
      icon: Target,
      content: (
        <div className="space-y-3">
          <button
            onClick={handleStartFresh}
            disabled={isLoading}
            className="w-full p-4 rounded-xl border-2 border-accent bg-accent/5 hover:bg-accent/10 transition-fast text-left group disabled:opacity-60"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-ink dark:text-dark-ink flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  从零开始
                </p>
                <p className="text-xs text-muted mt-1">清空示例数据，添加你的第一篇论文</p>
              </div>
              <ArrowRight className="w-5 h-5 text-accent group-hover:translate-x-1 transition-transform flex-shrink-0 mt-0.5" />
            </div>
          </button>

          <button
            onClick={handleKeepDemo}
            className="w-full p-4 rounded-xl border border-border-default dark:border-dark-border-default hover:border-border-strong dark:hover:border-dark-border-strong hover:bg-bg2 dark:hover:bg-dark-bg2 transition-fast text-left group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-ink dark:text-dark-ink flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-accent2" />
                  浏览示例数据
                </p>
                <p className="text-xs text-muted mt-1">保留示例论文和 Idea，先熟悉产品</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted/40 group-hover:text-accent/60 transition-all group-hover:translate-x-1 flex-shrink-0 mt-0.5" />
            </div>
          </button>

          <p className="text-[11px] text-muted/60 text-center pt-2">
            💡 所有数据保存在你的浏览器本地，不会上传到任何服务器
          </p>
        </div>
      ),
    },
  ];

  const currentStep = steps[step];
  const StepIcon = currentStep.icon;
  const totalSteps = steps.length;
  const progress = ((step + 1) / totalSteps) * 100;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleKeepDemo}
      />

      <div className="relative w-full max-w-md bg-surface dark:bg-dark-surface rounded-2xl shadow-2xl border border-border-default dark:border-dark-border-default overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-bg2 dark:bg-dark-bg2">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <button
          onClick={handleKeepDemo}
          className="absolute top-4 right-4 z-10 p-1.5 text-muted hover:text-ink dark:hover:text-dark-ink rounded-lg hover:bg-bg2 dark:hover:bg-dark-bg2 transition-fast"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 pt-10">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-5">
            <StepIcon className="w-7 h-7 text-accent" />
          </div>

          <h2 className="text-xl font-bold text-ink dark:text-dark-ink mb-1.5">
            {currentStep.title}
          </h2>
          <p className="text-sm text-muted mb-6">{currentStep.description}</p>

          <div className="mb-6">
            {currentStep.content}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-fast ${
                    i <= step ? 'w-6 bg-accent' : 'w-1.5 bg-bg2 dark:bg-dark-bg2'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {step > 0 && (
                <Button
                  variant="secondary"
                  onClick={() => setStep(step - 1)}
                  className="text-sm"
                >
                  上一步
                </Button>
              )}
              {step < totalSteps - 1 ? (
                <Button onClick={() => setStep(step + 1)} className="text-sm">
                  继续
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button onClick={handleKeepDemo} className="text-sm">
                  <Check className="w-4 h-4" />
                  开始使用
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

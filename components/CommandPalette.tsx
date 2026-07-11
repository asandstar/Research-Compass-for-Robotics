'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, LayoutDashboard, Target, Lightbulb, FileText,
  FlaskConical, LayoutGrid, ArrowRight, Workflow, GraduationCap, BrainCircuit, Gamepad2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useActiveIdea } from '../context/ActiveIdeaContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  label: string;
  group: string;
  icon: any;
  action: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const { state, getIdeaCardById } = useApp();
  const { activeIdeaId, setActiveIdea } = useActiveIdea();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const navCommands: CommandItem[] = useMemo(() => [
    { id: 'nav-overview', label: '概览', group: '导航', icon: LayoutDashboard, action: () => router.push('/') },
    { id: 'nav-focus', label: '聚焦工作区', group: '导航', icon: Target, action: () => router.push('/focus') },
    { id: 'nav-ideas', label: '选择方向', group: '导航', icon: Lightbulb, action: () => router.push('/ideas') },
    { id: 'nav-papers', label: '论文信号流', group: '导航', icon: FileText, action: () => router.push('/papers') },
    { id: 'nav-mves', label: '验证记录', group: '导航', icon: FlaskConical, action: () => router.push('/mves') },
    { id: 'nav-areas', label: '研究领域地图', group: '导航', icon: LayoutGrid, action: () => router.push('/areas') },
    { id: 'nav-questions', label: '研究问题空间', group: '导航', icon: Target, action: () => { router.push('/questions'); onClose(); } },
    { id: 'nav-workflows', label: 'AI Research Workflows · 工作流', group: '导航', icon: Workflow, action: () => { router.push('/workflows'); onClose(); } },
    { id: 'nav-learning', label: 'Learning Paths · 学习路径', group: '导航', icon: GraduationCap, action: () => { router.push('/learning'); onClose(); } },
    { id: 'nav-intelligence', label: 'Paper Intelligence · 论文智识', group: '导航', icon: BrainCircuit, action: () => { router.push('/papers/intelligence'); onClose(); } },
    { id: 'nav-games', label: '科研训练游戏', group: '导航', icon: Gamepad2, action: () => { router.push('/games'); onClose(); } },
  ], [router, onClose]);

  const ideaCommands: CommandItem[] = useMemo(() =>
    state.ideaCards.map(idea => ({
      id: `idea-${idea.id}`,
      label: idea.title,
      group: '研究方向',
      icon: Lightbulb,
      action: () => { setActiveIdea(idea.id); onClose(); },
    })),
  [state.ideaCards, setActiveIdea, onClose]);

  const paperCommands: CommandItem[] = useMemo(() =>
    state.papers.map(paper => ({
      id: `paper-${paper.id}`,
      label: paper.title,
      group: '论文',
      icon: FileText,
      action: () => { router.push('/papers'); onClose(); },
    })),
  [state.papers, router, onClose]);

  const areaCommands: CommandItem[] = useMemo(() =>
    state.researchAreas.filter(a => !a.isHidden).map(area => ({
      id: `area-${area.id}`,
      label: area.name,
      group: '子领域',
      icon: LayoutGrid,
      action: () => { router.push(`/ideas?areaId=${area.id}`); onClose(); },
    })),
  [state.researchAreas, router, onClose]);

  const allCommands = useMemo(() =>
    [...navCommands, ...ideaCommands, ...paperCommands, ...areaCommands],
  [navCommands, ideaCommands, paperCommands, areaCommands]);

  const filtered = useMemo(() => {
    if (!query.trim()) return allCommands;
    const q = query.toLowerCase();
    return allCommands.filter(c => c.label.toLowerCase().includes(q) || c.group.toLowerCase().includes(q));
  }, [allCommands, query]);

  // Group filtered results
  const grouped = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    for (const item of filtered) {
      if (!groups[item.group]) groups[item.group] = [];
      groups[item.group].push(item);
    }
    return groups;
  }, [filtered]);

  const flatFiltered = useMemo(() => Object.values(grouped).flat(), [grouped]);

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard nav
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, flatFiltered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (flatFiltered[selectedIndex]) {
          flatFiltered[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, flatFiltered, selectedIndex, onClose]);

  // Auto-focus input
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Scroll selected into view
  useEffect(() => {
    if (!listRef.current) return;
    const selected = listRef.current.querySelector('[data-selected="true"]');
    if (selected) {
      selected.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  // Track cumulative index across groups
  let cumIndex = 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] modal-overlay" />

      {/* Panel */}
      <div
        className="relative w-full max-w-lg bg-surface dark:bg-dark-surface border border-border-subtle dark:border-dark-border-subtle rounded-xl shadow-elevated overflow-hidden modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 border-b border-border-subtle">
          <Search className="w-[18px] h-[18px] text-muted flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索页面、Idea、论文..."
            className="flex-1 py-3.5 bg-transparent text-sm text-ink placeholder:text-muted/50 outline-none"
          />
          <kbd className="flex-shrink-0 px-1.5 py-0.5 bg-bg2 border border-border-subtle rounded text-[11px] text-muted font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[360px] overflow-y-auto py-2">
          {flatFiltered.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-muted">没有找到匹配结果</p>
              <p className="text-caption text-muted/70 mt-1">试试其他关键词</p>
            </div>
          ) : (
            Object.entries(grouped).map(([group, items]) => {
              const groupItems = (
                <div key={group}>
                  <div className="px-4 py-1.5 text-label font-medium text-muted/70 uppercase tracking-wider">
                    {group}
                  </div>
                  {items.map((item) => {
                    const isSelected = cumIndex === selectedIndex;
                    const isActiveIdea = item.id.startsWith('idea-') && item.id === `idea-${activeIdeaId}`;
                    const currentIndex = cumIndex;
                    cumIndex++;

                    return (
                      <button
                        key={item.id}
                        data-selected={isSelected}
                        onClick={() => item.action()}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-fast transition-colors ${
                          isSelected
                            ? 'bg-accent/10 text-accent'
                            : 'text-ink hover:bg-bg2'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-accent/15' : 'bg-bg2'
                        }`}>
                          <item.icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="flex-1 text-sm truncate">{item.label}</span>
                        {isActiveIdea && (
                          <span className="text-[10px] font-medium text-accent bg-accent/10 rounded-full px-1.5 py-0.5">
                            聚焦中
                          </span>
                        )}
                        {isSelected && (
                          <ArrowRight className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              );
              return groupItems;
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-border-subtle text-label text-muted/60">
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-bg2 border border-border-subtle rounded text-[10px] font-mono">↑↓</kbd>
            导航
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-bg2 border border-border-subtle rounded text-[10px] font-mono">↵</kbd>
            选择
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-bg2 border border-border-subtle rounded text-[10px] font-mono">esc</kbd>
            关闭
          </span>
        </div>
      </div>
    </div>
  );
}

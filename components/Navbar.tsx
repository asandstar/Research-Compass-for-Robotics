'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Target, Lightbulb, FileText, FlaskConical, LayoutGrid, Compass, Search, Workflow, GraduationCap, BrainCircuit, Menu, X, Moon, Sun, Gamepad2 } from 'lucide-react';
import { useActiveIdea } from '../context/ActiveIdeaContext';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { CommandPalette } from './CommandPalette';

const coreNav = [
  { href: '/', label: '概览', icon: LayoutDashboard },
  { href: '/focus', label: '聚焦', icon: Target, primary: true },
];

const workNav = [
  { href: '/ideas', label: '研究方向', icon: Lightbulb },
  { href: '/papers', label: '论文', icon: FileText },
  { href: '/mves', label: '验证记录', icon: FlaskConical },
  { href: '/workflows', label: '工作流', icon: Workflow },
  { href: '/learning', label: '学习路径', icon: GraduationCap },
];

const utilityNav = [
  { href: '/areas', label: '子领域', icon: LayoutGrid, iconOnly: true },
  { href: '/questions', label: '研究问题', icon: BrainCircuit, iconOnly: true },
  { href: '/games', label: '科研游戏', icon: Gamepad2, iconOnly: true },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { activeIdeaId, isActive } = useActiveIdea();
  const { getIdeaCardById } = useApp();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeIdea = activeIdeaId ? getIdeaCardById(activeIdeaId) : null;

  // Scroll shadow enhancement
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Global ⌘K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const checkActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav className={`sticky top-0 z-50 transition-fast transition-shadow bg-surface/80 backdrop-blur-md border-b border-border-subtle ${scrolled ? 'shadow-card' : 'shadow-navbar'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14 gap-4">

            {/* ── Left: Brand + Nav Groups ── */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Brand */}
              <Link href="/" className="flex items-center gap-2 text-ink no-underline hover:no-underline flex-shrink-0">
                <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
                  <Compass className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-sm tracking-tight hidden md:inline">Research Compass</span>
              </Link>

              <div className="w-px h-5 bg-border-subtle hidden md:block" />

              {/* Core Nav Group */}
              <div className="flex items-center gap-0.5">
                {coreNav.map((item) => (
                  <NavLink key={item.href} item={item} active={checkActive(item.href)}>
                    {item.primary && isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent2 ml-0.5" />
                    )}
                  </NavLink>
                ))}
              </div>

              <div className="w-px h-4 bg-border-subtle hidden sm:block" />

              {/* Work Nav Group */}
              <div className="hidden sm:flex items-center gap-0.5">
                {workNav.map((item) => (
                  <NavLink key={item.href} item={item} active={checkActive(item.href)} />
                ))}
              </div>
            </div>

            {/* ── Spacer ── */}
            <div className="flex-1" />

            {/* ── Right: Actions ── */}
            <div className="flex items-center gap-2.5 flex-shrink-0">

              {/* Search Trigger */}
              <button
                type="button"
                onClick={() => setCmdOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-bg2/70 border border-border-subtle rounded-lg text-[13px] text-muted hover:border-border-default hover:text-ink transition-fast transition-colors cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">搜索...</span>
                <kbd className="hidden sm:flex items-center px-1.5 py-0.5 bg-surface border border-border-subtle rounded text-[11px] text-muted/60 font-mono leading-none">
                  ⌘K
                </kbd>
              </button>

              {/* Areas (icon only, always visible) */}
              {utilityNav.map((item) => (
                <NavLink key={item.href} item={item} active={checkActive(item.href)} />
              ))}

              {/* Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                title={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted hover:text-ink hover:bg-bg2 transition-fast transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
              </button>

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden w-10 h-10 flex items-center justify-center rounded-lg text-muted hover:text-ink hover:bg-bg2 transition-fast transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden fixed inset-0 z-40 bg-ink/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute left-0 right-0 top-14 bg-surface border-b border-border-subtle shadow-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 py-3 border-b border-border-subtle">
              <p className="text-xs font-medium text-muted/60 uppercase tracking-wider">工作区</p>
            </div>
            <div className="divide-y divide-border-subtle">
              {workNav.map((item) => {
                const Icon = item.icon;
                const isActive = checkActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-fast transition-colors ${
                      isActive ? 'text-accent bg-accent/5' : 'text-ink hover:bg-bg2'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
            <div className="px-4 py-3 border-t border-border-subtle">
              <p className="text-xs font-medium text-muted/60 uppercase tracking-wider mb-2">其他</p>
              {utilityNav.map((item) => {
                const Icon = item.icon;
                const isActive = checkActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-fast transition-colors ${
                      isActive ? 'text-accent bg-accent/5' : 'text-ink hover:bg-bg2'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Command Palette */}
      <CommandPalette
        isOpen={cmdOpen}
        onClose={() => setCmdOpen(false)}
      />
    </>
  );
}

/* ── NavLink Sub-component ── */

function NavLink({ item, active, children }: { item: { href: string; label: string; icon: any; primary?: boolean; iconOnly?: boolean }; active: boolean; children?: React.ReactNode }) {
  const Icon = item.icon;

  if (item.iconOnly) {
    return (
      <Link
        href={item.href}
        title={item.label}
        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-fast transition-colors ${
          active
            ? 'text-accent bg-accent/10'
            : 'text-muted hover:text-ink hover:bg-bg2'
        }`}
      >
        <Icon className="w-[18px] h-[18px]" />
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      className={`relative inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[13px] font-medium rounded-lg transition-fast transition-colors ${
        active
          ? 'text-accent bg-accent/10'
          : item.primary
            ? 'text-muted hover:text-accent hover:bg-accent/[0.06]'
            : 'text-muted hover:text-ink hover:bg-bg2'
      }`}
    >
      <Icon className="w-[18px] h-[18px]" />
      <span className="hidden md:inline">{item.label}</span>
      {children}
      {active && (
        <span className="absolute -bottom-[9px] left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-accent" />
      )}
    </Link>
  );
}



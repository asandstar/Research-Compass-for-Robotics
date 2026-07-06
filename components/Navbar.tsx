'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, LayoutGrid, FileText, Lightbulb, FlaskConical } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Compass },
  { href: '/areas', label: 'Research Areas', icon: LayoutGrid },
  { href: '/papers', label: 'Paper Library', icon: FileText },
  { href: '/ideas', label: 'Ideas', icon: Lightbulb },
  { href: '/mves', label: 'MVEs', icon: FlaskConical },
];

export function Navbar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          <div className="flex items-center gap-2">
            <Compass className="w-6 h-6 text-indigo-600" />
            <span className="font-semibold text-lg text-gray-900">Research Compass</span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full ml-1">for Robotics</span>
          </div>
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    active
                      ? 'text-indigo-700 bg-indigo-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

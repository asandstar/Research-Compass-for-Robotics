'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Compass, Search, Home, Lightbulb, FileText, FlaskConical, ArrowRight } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useState } from 'react';

export default function NotFound() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const quickLinks = [
    { href: '/', label: '概览', icon: Home },
    { href: '/ideas', label: '选择方向', icon: Lightbulb },
    { href: '/papers', label: '论文库', icon: FileText },
    { href: '/mves', label: '验证记录', icon: FlaskConical },
    { href: '/areas', label: '研究领域', icon: Compass },
    { href: '/workflows', label: '工作流', icon: FlaskConical },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push('/papers');
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center py-16 px-4">
      <div className="text-center mb-10">
        <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
          <Compass className="w-10 h-10 text-accent" />
        </div>
        <h1 className="text-4xl font-bold text-ink mb-3">
          404
        </h1>
        <h2 className="text-xl font-semibold text-ink mb-2">
          页面不存在
        </h2>
        <p className="text-muted max-w-md mx-auto">
          您访问的页面可能已被删除、移动，或者地址有误。让我们帮您找到正确的方向。
        </p>
      </div>

      <Card className="w-full max-w-md p-6 mb-8">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="搜索论文、Idea、研究方向..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">
            <Search className="w-4 h-4" />
          </Button>
        </form>
        <p className="text-caption text-muted/60 mt-2 text-center">
          按 ⌘K 打开全局搜索
        </p>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-lg">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="group no-underline hover:no-underline"
            >
              <Card className="p-4 text-center hover:bg-accent/5 transition-fast transition-colors">
                <div className="w-8 h-8 rounded-lg bg-bg2 flex items-center justify-center mx-auto mb-2 group-hover:bg-accent/10 transition-fast transition-colors">
                  <Icon className="w-4 h-4 text-muted group-hover:text-accent transition-fast transition-colors" />
                </div>
                <p className="text-sm font-medium text-ink group-hover:text-accent transition-fast transition-colors">
                  {link.label}
                </p>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 flex items-center gap-2">
        <Button variant="secondary" onClick={() => router.push('/')}>
          返回首页
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="mt-8 text-caption text-muted/50 text-center">
        <p>如果您认为这是一个错误，请告诉我们</p>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { Sparkles } from 'lucide-react';

export function ObservationInput() {
  const [content, setContent] = useState('');
  const { addObservation, state } = useApp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      await addObservation(content.trim());
      setContent('');
    } catch (error) {
      console.error('Failed to add observation:', error);
      alert('添加观察失败,请重试');
    }
  };

  return (
    <div className="bg-white border border-rule rounded-lg p-4 mb-6">
      <div className="text-sm font-semibold text-muted mb-2">快速记录观察</div>
      <div className="text-xs text-muted mb-3">输入一句话观察，AI 自动结构化...</div>
      <form onSubmit={handleSubmit} className="flex gap-2 items-start">
        <div className="flex-1">
          <Textarea
            label=""
            value={content}
            onChange={setContent}
            placeholder="这篇论文的方法好像有个假设没被验证..."
            className="[&_label]:hidden"
          />
        </div>
        <Button type="submit" disabled={!content.trim() || state.isAnalyzing}>
          {state.isAnalyzing ? (
            <span className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 animate-spin" />
              分析中
            </span>
          ) : (
            '记录'
          )}
        </Button>
      </form>
    </div>
  );
}

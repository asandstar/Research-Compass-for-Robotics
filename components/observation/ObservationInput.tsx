import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Sparkles } from 'lucide-react';

export function ObservationInput() {
  const [content, setContent] = useState('');
  const { addObservation, state } = useApp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    await addObservation(content.trim());
    setContent('');
  };

  return (
    <div className="bg-white border border-rule rounded-lg p-4 mb-6">
      <div className="text-sm font-semibold text-muted mb-2">快速记录观察</div>
      <div className="text-xs text-muted mb-3">输入一句话观察，AI 自动结构化...</div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="这篇论文的方法好像有个假设没被验证..."
          className="flex-1 px-3 py-2 border border-rule rounded-lg bg-bg resize-none focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-sm"
          rows={2}
        />
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

'use client';

import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { X, Loader2 } from 'lucide-react';

interface CreateIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedAreaId?: string;
  onCreated?: (ideaId: string) => void;
}

export function CreateIdeaModal({ isOpen, onClose, preselectedAreaId, onCreated }: CreateIdeaModalProps) {
  const { createIdeaCard, state: { isGeneratingEvidence } } = useApp();
  const [formData, setFormData] = useState({
    title: '',
    researchQuestion: '',
    coreHypothesis: '',
    whyItMatters: '',
  });

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const areaIds = preselectedAreaId ? [preselectedAreaId] : [];
      const idea = await createIdeaCard(
        formData.title,
        formData.researchQuestion,
        formData.coreHypothesis,
        formData.whyItMatters,
        [],
        areaIds,
      );
      setFormData({ title: '', researchQuestion: '', coreHypothesis: '', whyItMatters: '' });
      onClose();
      onCreated?.(idea.id);
    } catch (error) {
      console.error('Failed to create idea:', error);
      alert('创建 Idea 失败,请重试');
    }
  };

  const canSubmit = formData.title.trim() && formData.researchQuestion.trim() && formData.coreHypothesis.trim() && formData.whyItMatters.trim();

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-[2px] modal-overlay flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-idea-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-surface dark:bg-dark-surface rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto modal-content"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 border-b border-border-subtle flex items-center justify-between">
          <h2 id="create-idea-modal-title" className="text-lg font-semibold text-ink dark:text-dark-ink">新增 Idea</h2>
          <button onClick={onClose} className="text-muted hover:text-ink" aria-label="关闭">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">标题 *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-border-default rounded-lg focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-transparent text-sm"
              placeholder="给这个 Idea 起个简短的标题"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">研究问题 *</label>
            <textarea
              value={formData.researchQuestion}
              onChange={(e) => setFormData({ ...formData, researchQuestion: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-border-default rounded-lg focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-transparent text-sm"
              placeholder="你想回答什么研究问题？"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">核心假设 *</label>
            <textarea
              value={formData.coreHypothesis}
              onChange={(e) => setFormData({ ...formData, coreHypothesis: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-border-default rounded-lg focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-transparent text-sm"
              placeholder="用'如果...那么...'表达"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">为什么值得做 *</label>
            <textarea
              value={formData.whyItMatters}
              onChange={(e) => setFormData({ ...formData, whyItMatters: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-border-default rounded-lg focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-transparent text-sm"
              placeholder="这个问题为什么值得研究？"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <Button variant="secondary" type="button" onClick={onClose}>取消</Button>
            <Button type="submit" disabled={!canSubmit || isGeneratingEvidence}>
              {isGeneratingEvidence ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  AI 生成中...
                </span>
              ) : '创建'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

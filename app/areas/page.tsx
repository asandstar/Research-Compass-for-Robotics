'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Plus, FileText, Lightbulb, FlaskConical, Clock, Edit3, Search, Map } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useActiveIdea } from '../../context/ActiveIdeaContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Tag } from '../../components/ui/Tag';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import AreaMapCard from '../../components/area/AreaMapCard';

export default function AreasPage() {
  const { state, addResearchArea, updateResearchArea, getPapersByAreaId, getIdeasByAreaId, getMvesByAreaId } = useApp();
  const { isActive: hasActiveIdea } = useActiveIdea();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingArea, setEditingArea] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '感知',
    keywords: '',
    focusQuestions: '',
  });

  const visibleAreas = useMemo(() => {
    return state.researchAreas.filter((area) => {
      if (area.isHidden) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          area.name.toLowerCase().includes(query) ||
          area.description.toLowerCase().includes(query) ||
          area.keywords.some((kw) => kw.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [state.researchAreas, searchQuery]);

  // Group areas by category
  const groupedAreas = useMemo(() => {
    const categories = Array.from(new Set(visibleAreas.map((a) => a.category))).sort();
    const groups: Record<string, typeof visibleAreas> = {};
    for (const cat of categories) {
      groups[cat] = visibleAreas.filter((a) => a.category === cat);
    }
    return { categories, groups };
  }, [visibleAreas]);

  useEffect(() => {
    if (!showAddModal) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowAddModal(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showAddModal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const keywords = formData.keywords.split(',').map((k) => k.trim()).filter(Boolean);
    const focusQuestions = formData.focusQuestions.split('\n').map((q) => q.trim()).filter(Boolean);

    if (editingArea) {
      updateResearchArea({
        ...editingArea,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        keywords,
        focusQuestions,
      });
    } else {
      addResearchArea(formData.name, formData.description, formData.category, keywords, focusQuestions);
    }

    setShowAddModal(false);
    setEditingArea(null);
    setFormData({ name: '', description: '', category: '感知', keywords: '', focusQuestions: '' });
  };

  const openEdit = (area: any) => {
    setEditingArea(area);
    setFormData({
      name: area.name,
      description: area.description,
      category: area.category,
      keywords: area.keywords.join(', '),
      focusQuestions: area.focusQuestions.join('\n'),
    });
    setShowAddModal(true);
  };

  const getAreaStats = (areaId: string) => ({
    paperCount: state.papers.filter((p) => p.areaIds.includes(areaId)).length,
    ideaCount: state.ideaCards.filter((c) => c.areaIds.includes(areaId)).length,
    mveCount: (() => {
      const ideaIds = state.ideaCards.filter((c) => c.areaIds.includes(areaId)).map((c) => c.id);
      return state.mves.filter((m) => ideaIds.includes(m.ideaCardId)).length;
    })(),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">研究领域地图</h1>
          <p className="page-subtitle">按机器人子领域浏览和管理研究方向</p>
        </div>
        <Button onClick={() => {
          setEditingArea(null);
          setFormData({ name: '', description: '', category: '感知', keywords: '', focusQuestions: '' });
          setShowAddModal(true);
        }}>
          <Plus className="w-4 h-4" />
          新增子领域
        </Button>
      </div>

      {/* Search */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="搜索子领域名称、描述、关键词..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Grouped areas */}
      {visibleAreas.length === 0 ? (
        <EmptyState
          icon={<Map className="w-8 h-8 text-muted/60" />}
          title="暂无研究领域"
          description="创建你的第一个研究领域，开始系统探索机器人科研方向"
          action={
            <Button variant="secondary" onClick={() => {
              setEditingArea(null);
              setFormData({ name: '', description: '', category: '感知', keywords: '', focusQuestions: '' });
              setShowAddModal(true);
            }}>
              <Plus className="w-4 h-4" />
              新增子领域
            </Button>
          }
        />
      ) : (
        groupedAreas.categories.map((category) => (
          <div key={category} className="space-y-4">
            <h2 className="text-lg font-semibold text-ink">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedAreas.groups[category].map((area) => {
                const stats = getAreaStats(area.id);
                return (
                  <div key={area.id} className="relative group">
                    <AreaMapCard
                      area={area}
                      paperCount={stats.paperCount}
                      ideaCount={stats.ideaCount}
                      mveCount={stats.mveCount}
                    />
                    <button
                      onClick={() => openEdit(area)}
                      className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="编辑子领域"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* Add/Edit modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] modal-overlay flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="area-modal-title"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border-subtle">
              <h2 id="area-modal-title" className="text-lg font-semibold text-ink">
                {editingArea ? '编辑子领域' : '新增子领域'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border-default rounded-lg focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-transparent"
                  placeholder="如：Visual SLAM"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">简介</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                    className="w-full px-3 py-2 border border-border-default rounded-lg focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">分类</label>
                <Select
                  value={formData.category}
                  onChange={(val) => setFormData({ ...formData, category: val })}
                  options={[
                    { value: '感知', label: '感知' },
                    { value: '学习', label: '学习' },
                    { value: '控制', label: '控制' },
                    { value: '前沿', label: '前沿' },
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">关键词（逗号分隔）</label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  className="w-full px-3 py-2 border border-border-default rounded-lg focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-transparent"
                    placeholder="SLAM, 视觉, 建图"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">关注问题（每行一个）</label>
                <textarea
                  value={formData.focusQuestions}
                  onChange={(e) => setFormData({ ...formData, focusQuestions: e.target.value })}
                  rows={3}
                    className="w-full px-3 py-2 border border-border-default rounded-lg focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-transparent"
                  placeholder="动态环境下SLAM如何保持鲁棒？"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
                <Button variant="secondary" type="button" onClick={() => { setShowAddModal(false); setEditingArea(null); }}>
                  取消
                </Button>
                <Button type="submit">
                  {editingArea ? '保存' : '创建'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

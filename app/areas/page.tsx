'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Tag } from '../../components/ui/Tag';
import { Plus, FileText, Lightbulb, FlaskConical, Clock, Edit3 } from 'lucide-react';

export default function ResearchAreasPage() {
  const { state, getPapersByAreaId, getIdeasByAreaId, getMvesByAreaId, addResearchArea, updateResearchArea } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingArea, setEditingArea] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '感知',
    keywords: '',
    focusQuestions: '',
  });

  const visibleAreas = state.researchAreas.filter(a => !a.isHidden);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const keywords = formData.keywords.split(',').map(k => k.trim()).filter(Boolean);
    const focusQuestions = formData.focusQuestions.split('\n').map(q => q.trim()).filter(Boolean);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Research Areas</h1>
          <p className="text-gray-600 mt-1">按机器人子领域管理你的研究方向</p>
        </div>
        <Button onClick={() => {
          setEditingArea(null);
          setFormData({ name: '', description: '', category: '感知', keywords: '', focusQuestions: '' });
          setShowAddModal(true);
        }}>
          <Plus className="w-4 h-4 mr-1" />
          新增子领域
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleAreas.map((area) => {
          const papers = getPapersByAreaId(area.id);
          const ideas = getIdeasByAreaId(area.id);
          const mves = getMvesByAreaId(area.id);
          const activeMves = mves.filter(m => m.resultStatus === 'pending');
          const readPapers = papers.filter(p => p.readingStatus === 'reviewed' || p.readingStatus === 'deep_reading');

          return (
            <Link key={area.id} href={`/areas/${area.id}`} className="block group">
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                          {area.name}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{area.description}</p>
                    </div>
                    <button
                      onClick={(e) => { e.preventDefault(); openEdit(area); }}
                      className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {area.keywords.slice(0, 3).map((kw, i) => (
                      <Tag key={i} size="sm" variant="secondary">
                        {kw}
                      </Tag>
                    ))}
                    {area.keywords.length > 3 && (
                      <Tag size="sm" variant="secondary">+{area.keywords.length - 3}</Tag>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-gray-600">
                        <FileText className="w-3.5 h-3.5" />
                        <span className="font-medium text-sm">{papers.length}</span>
                      </div>
                      <div className="text-xs text-gray-400">论文</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-gray-600">
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span className="font-medium text-sm">{ideas.length}</span>
                      </div>
                      <div className="text-xs text-gray-400">Idea</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-amber-600">
                        <FlaskConical className="w-3.5 h-3.5" />
                        <span className="font-medium text-sm">{activeMves.length}</span>
                      </div>
                      <div className="text-xs text-gray-400">MVE</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>更新于 {new Date(area.updatedAt).toLocaleDateString('zh-CN')}</span>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold">
                {editingArea ? '编辑子领域' : '新增子领域'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="如：Visual SLAM｜视觉SLAM"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">简介</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="感知">感知</option>
                  <option value="学习">学习</option>
                  <option value="控制">控制</option>
                  <option value="前沿">前沿</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">关键词（逗号分隔）</label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="SLAM, 视觉, 建图"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">关注问题（每行一个）</label>
                <textarea
                  value={formData.focusQuestions}
                  onChange={(e) => setFormData({ ...formData, focusQuestions: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="动态环境下SLAM如何保持鲁棒？&#10;语义信息如何提升SLAM性能？"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
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

'use client';

import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { detectLinkType, parseArxivUrl } from '../../lib/mockAI';
import { X, Sparkles, Link as LinkIcon, FileText, Code, BookOpen } from 'lucide-react';
import type { Paper } from '../../lib/types';

interface AddPaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedAreaId?: string;
  editingPaper?: Paper | null;
}

export function AddPaperModal({ isOpen, onClose, preselectedAreaId, editingPaper }: AddPaperModalProps) {
  const { state, addPaper, updatePaper, generateOneSentenceSummary, fetchArxivPaper, state: { isGeneratingSummary, isParsingArxiv } } = useApp();
  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    year: new Date().getFullYear(),
    venue: '',
    arxivUrl: '',
    pdfUrl: '',
    htmlUrl: '',
    feishuNoteUrl: '',
    codeUrl: '',
    areaIds: [] as string[],
    readingStatus: 'to_read' as Paper['readingStatus'],
    methodKeywords: '',
    oneSentenceSummary: '',
    relevanceToMyResearch: '',
    limitationsOrQuestions: '',
    judgementLevel: 'background' as Paper['judgementLevel'],
  });

  useEffect(() => {
    if (isOpen) {
      if (editingPaper) {
        setFormData({
          title: editingPaper.title,
          authors: editingPaper.authors,
          year: editingPaper.year,
          venue: editingPaper.venue,
          arxivUrl: editingPaper.arxivUrl,
          pdfUrl: editingPaper.pdfUrl,
          htmlUrl: editingPaper.htmlUrl,
          feishuNoteUrl: editingPaper.feishuNoteUrl,
          codeUrl: editingPaper.codeUrl,
          areaIds: editingPaper.areaIds,
          readingStatus: editingPaper.readingStatus,
          methodKeywords: editingPaper.methodKeywords.join(', '),
          oneSentenceSummary: editingPaper.oneSentenceSummary,
          relevanceToMyResearch: editingPaper.relevanceToMyResearch,
          limitationsOrQuestions: editingPaper.limitationsOrQuestions,
          judgementLevel: editingPaper.judgementLevel,
        });
      } else {
        setFormData({
          title: '',
          authors: '',
          year: new Date().getFullYear(),
          venue: '',
          arxivUrl: '',
          pdfUrl: '',
          htmlUrl: '',
          feishuNoteUrl: '',
          codeUrl: '',
          areaIds: preselectedAreaId ? [preselectedAreaId] : [],
          readingStatus: 'to_read',
          methodKeywords: '',
          oneSentenceSummary: '',
          relevanceToMyResearch: '',
          limitationsOrQuestions: '',
          judgementLevel: 'background',
        });
      }
    }
  }, [isOpen, editingPaper, preselectedAreaId]);

  const handleLinkPaste = (field: string, value: string) => {
    const detection = detectLinkType(value);
    
    let updates: any = { [field]: value };
    
    if (detection.type === 'arxiv') {
      const parsed = parseArxivUrl(value);
      if (parsed.arxivUrl) updates.arxivUrl = parsed.arxivUrl;
      if (parsed.pdfUrl) updates.pdfUrl = parsed.pdfUrl;
    } else if (detection.field === 'codeUrl') {
      updates.codeUrl = value;
    } else if (detection.field === 'feishuNoteUrl') {
      updates.feishuNoteUrl = value;
    }
    
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleParseArxiv = async () => {
    if (!formData.arxivUrl) return;
    const result = await fetchArxivPaper(formData.arxivUrl);
    if (result) {
      setFormData(prev => ({
        ...prev,
        title: result.title,
        authors: result.authors,
        year: result.year,
        venue: result.venue,
        arxivUrl: result.arxivUrl,
        pdfUrl: result.pdfUrl,
        methodKeywords: result.methodKeywords.join(', '),
        oneSentenceSummary: result.oneSentenceSummary,
      }));
    }
  };

  const toggleArea = (areaId: string) => {
    setFormData(prev => ({
      ...prev,
      areaIds: prev.areaIds.includes(areaId)
        ? prev.areaIds.filter(id => id !== areaId)
        : [...prev.areaIds, areaId],
    }));
  };

  const handleGenerateSummary = async () => {
    const summary = await generateOneSentenceSummary({
      title: formData.title,
      methodKeywords: formData.methodKeywords.split(',').map(k => k.trim()).filter(Boolean),
      areaIds: formData.areaIds,
    });
    setFormData(prev => ({ ...prev, oneSentenceSummary: summary }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const paperData = {
      ...formData,
      methodKeywords: formData.methodKeywords.split(',').map(k => k.trim()).filter(Boolean),
    };
    
    if (editingPaper) {
      updatePaper({ ...editingPaper, ...paperData, inspiredIdeaIds: editingPaper.inspiredIdeaIds });
    } else {
      addPaper(paperData);
    }
    onClose();
  };

  if (!isOpen) return null;

  const visibleAreas = state.researchAreas.filter(a => !a.isHidden);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-lg font-semibold">
            {editingPaper ? '编辑论文' : '添加论文'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">论文标题 *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="输入论文标题"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">作者</label>
              <input
                type="text"
                value={formData.authors}
                onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="First Author et al."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">年份</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">会议/期刊</label>
              <input
                type="text"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="ICRA / IROS / arXiv"
              />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <LinkIcon className="w-4 h-4" />
              链接
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs text-gray-500">arXiv 链接</label>
                  <button
                    type="button"
                    onClick={handleParseArxiv}
                    disabled={isParsingArxiv || !formData.arxivUrl}
                    className="text-xs text-indigo-600 hover:text-indigo-700 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {isParsingArxiv ? '解析中...' : '自动解析论文信息'}
                  </button>
                </div>
                <div className="relative">
                  <FileText className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
                  <input
                    type="url"
                    value={formData.arxivUrl}
                    onChange={(e) => handleLinkPaste('arxivUrl', e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    placeholder="https://arxiv.org/abs/xxxx.xxxxx"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">PDF 链接</label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
                  <input
                    type="url"
                    value={formData.pdfUrl}
                    onChange={(e) => handleLinkPaste('pdfUrl', e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    placeholder="https://arxiv.org/pdf/xxxx.xxxxx"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">飞书笔记</label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
                  <input
                    type="url"
                    value={formData.feishuNoteUrl}
                    onChange={(e) => handleLinkPaste('feishuNoteUrl', e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    placeholder="feishu.cn/docx/..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">GitHub 代码</label>
                <div className="relative">
                  <Code className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
                  <input
                    type="url"
                    value={formData.codeUrl}
                    onChange={(e) => handleLinkPaste('codeUrl', e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    placeholder="github.com/..."
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">所属子领域</label>
            <div className="flex flex-wrap gap-2">
              {visibleAreas.map(area => (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => toggleArea(area.id)}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                    formData.areaIds.includes(area.id)
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {area.name.split('｜')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">阅读状态</label>
              <select
                value={formData.readingStatus}
                onChange={(e) => setFormData({ ...formData, readingStatus: e.target.value as Paper['readingStatus'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="to_read">待读</option>
                <option value="skimmed">泛读</option>
                <option value="deep_reading">精读中</option>
                <option value="reviewed">已复盘</option>
                <option value="paused">暂停</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">判断级别</label>
              <select
                value={formData.judgementLevel}
                onChange={(e) => setFormData({ ...formData, judgementLevel: e.target.value as Paper['judgementLevel'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="background">背景资料</option>
                <option value="useful">有用</option>
                <option value="idea_source">灵感来源</option>
                <option value="must_review">必复盘</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">方法关键词（逗号分隔）</label>
            <input
              type="text"
              value={formData.methodKeywords}
              onChange={(e) => setFormData({ ...formData, methodKeywords: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="VIO, 优化, 多传感器融合"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">一句话总结（你的判断）</label>
              <button
                type="button"
                onClick={handleGenerateSummary}
                disabled={isGeneratingSummary || formData.areaIds.length === 0}
                className="text-xs text-indigo-600 hover:text-indigo-700 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isGeneratingSummary ? '生成中...' : 'AI 生成建议'}
              </button>
            </div>
            <textarea
              value={formData.oneSentenceSummary}
              onChange={(e) => setFormData({ ...formData, oneSentenceSummary: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="用一句话写下你对这篇论文的判断和评价"
            />
            <p className="text-xs text-gray-400 mt-1">这是你自己的判断，不是论文摘要。鼓励简短、有观点。</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">和我研究的关系</label>
            <textarea
              value={formData.relevanceToMyResearch}
              onChange={(e) => setFormData({ ...formData, relevanceToMyResearch: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="这篇论文和你当前研究方向的关系"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">局限或疑问</label>
            <textarea
              value={formData.limitationsOrQuestions}
              onChange={(e) => setFormData({ ...formData, limitationsOrQuestions: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="这篇论文的问题、局限，或者你没想清楚的地方"
            />
          </div>
        </form>

        <div className="flex justify-end gap-3 p-5 border-t border-gray-100 flex-shrink-0">
          <Button variant="secondary" type="button" onClick={onClose}>
            取消
          </Button>
          <Button type="submit" onClick={handleSubmit as any}>
            {editingPaper ? '保存修改' : '添加论文'}
          </Button>
        </div>
      </div>
    </div>
  );
}

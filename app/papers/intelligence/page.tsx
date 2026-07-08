'use client';

import { useState, useMemo } from 'react';
import { BrainCircuit, CheckCircle, ArrowLeftRight, X, FileText } from 'lucide-react';
import PaperIntelligenceCard from '../../../components/intelligence/PaperIntelligenceCard';
import { paperIntelligenceList, PaperIntelligence } from '../../../lib/intelligence/paperIntelligence';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export default function PaperIntelligencePage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectedPapers = useMemo(() =>
    paperIntelligenceList.filter(p => selectedIds.includes(p.id)),
    [selectedIds]
  );

  const comparisonFields = [
    { key: 'problem', label: '解决的问题' },
    { key: 'coreIdea', label: '核心思想' },
    { key: 'method', label: '方法概述' },
    { key: 'evidence', label: '实验证据' },
    { key: 'limitations', label: '局限性' },
    { key: 'hiddenAssumptions', label: '隐藏假设' },
    { key: 'whyItMatters', label: '为什么重要' },
    { key: 'possibleExtensions', label: '可能的扩展' },
  ];

  const isSelected = (id: string) => selectedIds.includes(id);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="page-title">Paper Intelligence</h1>
            <p className="page-subtitle">论文理解卡片：用结构化字段拆解 8 篇机器人领域关键论文，从问题到隐藏假设，从证据到可能扩展，深度理解每篇论文。</p>
          </div>
        </div>
      </div>

      {/* Verified notice */}
      <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-3 flex items-start gap-2">
        <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-emerald-800">内容已核验，仅供参考</p>
          <p className="text-caption text-emerald-700 mt-0.5 leading-relaxed">
            以下论文理解卡片已对照 arXiv 原始论文核验标题、链接和关键事实。分析性内容（如局限性、隐藏假设）为作者解读，建议结合原始论文阅读。
          </p>
        </div>
      </div>

      {/* Comparison Banner */}
      {selectedIds.length > 0 && (
        <Card className="p-4 border-l-4 border-l-accent">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ArrowLeftRight className="w-5 h-5 text-accent" />
              <div>
                <p className="text-sm font-medium text-ink">已选择 {selectedIds.length} 篇论文</p>
                <p className="text-caption text-muted">
                  {selectedPapers.map(p => p.title.split('｜')[0] || p.title).join(' · ')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => setSelectedIds([])}
                className="text-sm"
              >
                <X className="w-4 h-4" />
                清除选择
              </Button>
              <Button
                onClick={() => setShowComparison(true)}
                disabled={selectedIds.length < 2}
                className="text-sm"
              >
                <ArrowLeftRight className="w-4 h-4" />
                对比 ({selectedIds.length})
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Comparison Mode */}
      {showComparison && selectedPapers.length >= 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-accent" />
              论文对比
            </h2>
            <Button variant="secondary" onClick={() => setShowComparison(false)} className="text-sm">
              <X className="w-4 h-4" />
              关闭对比
            </Button>
          </div>

          {/* Comparison Table */}
          <Card className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="text-left px-4 py-3 text-label font-semibold text-muted uppercase tracking-wider w-32">
                    对比维度
                  </th>
                  {selectedPapers.map((paper) => (
                    <th key={paper.id} className="px-4 py-3 text-left">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-accent" />
                        <span className="text-sm font-semibold text-ink line-clamp-2 max-w-[200px]">
                          {paper.title}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted mt-1">{paper.area}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonFields.map((field) => (
                  <tr key={field.key} className="border-b border-border-subtle hover:bg-bg2/30">
                    <td className="px-4 py-3 text-caption font-medium text-muted bg-bg2/30">
                      {field.label}
                    </td>
                    {selectedPapers.map((paper) => (
                      <td key={paper.id} className="px-4 py-3">
                        <p className="text-sm text-ink leading-relaxed">
                          {(paper as any)[field.key]}
                        </p>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* Paper Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {paperIntelligenceList.map((p) => (
          <PaperIntelligenceCard
            key={p.id}
            paper={p}
            onSelect={() => toggleSelect(p.id)}
            isSelected={isSelected(p.id)}
          />
        ))}
      </div>

      {/* Comparison Guide */}
      <Card className="p-5 border-l-4 border-l-blue-500">
        <div className="flex items-start gap-3">
          <ArrowLeftRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-ink mb-2">论文对比功能</h3>
            <ul className="space-y-1.5 text-sm text-muted">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-semibold flex-shrink-0">1.</span>
                <span>点击卡片左上角的复选框选择要对比的论文</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-semibold flex-shrink-0">2.</span>
                <span>选择 2-3 篇论文后点击「对比」按钮</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-semibold flex-shrink-0">3.</span>
                <span>在对比表格中并排查看关键维度的差异</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-semibold flex-shrink-0">4.</span>
                <span>重点关注「解决的问题」「核心思想」「局限性」三个维度</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

'use client';

import { BrainCircuit, AlertCircle } from 'lucide-react';
import PaperIntelligenceCard from '../../../components/intelligence/PaperIntelligenceCard';
import { paperIntelligenceList } from '../../../lib/intelligence/paperIntelligence';

export default function PaperIntelligencePage() {
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

      {/* Draft notice */}
      <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amber-800">内容为草稿，尚未完全核验</p>
          <p className="text-caption text-amber-700 mt-0.5 leading-relaxed">
            以下论文理解卡片由作者基于公开资料整理，部分细节可能存在偏差或过时。建议以原始论文为准，将本卡片作为阅读辅助而非权威结论。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {paperIntelligenceList.map((p) => (
          <PaperIntelligenceCard key={p.id} paper={p} />
        ))}
      </div>
    </div>
  );
}

'use client';

import { AlertTriangle, HelpCircle, AlertCircle, Lightbulb, ExternalLink, CheckCircle, BrainCircuit, Compass } from 'lucide-react';
import { Card } from '../ui/Card';
import { Tag } from '../ui/Tag';
import type { PaperIntelligence } from '../../lib/intelligence/paperIntelligence';

interface PaperIntelligenceCardProps {
  paper: PaperIntelligence;
}

interface FieldDef {
  label: string;
  value: string;
}

export default function PaperIntelligenceCard({ paper }: PaperIntelligenceCardProps) {
  // Main fields: 2-column grid
  const mainFields: FieldDef[] = [
    { label: '解决的问题', value: paper.problem },
    { label: '动机', value: paper.motivation },
    { label: '核心思想', value: paper.coreIdea },
    { label: '方法概述', value: paper.method },
    { label: '证据 / 实验结果', value: paper.evidence },
    { label: '为什么重要', value: paper.whyItMatters },
  ];

  return (
    <Card className="p-5 h-full flex flex-col">
      {/* Header */}
      <div className="mb-4 pb-3 border-b border-border-subtle">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <h3 className="text-h2 font-semibold text-ink leading-snug flex-1 min-w-0">{paper.title}</h3>
          {paper.verified ? (
            <Tag variant="soft" size="sm" color="#059669">
              <CheckCircle className="w-3 h-3 inline mr-1" />
              已核验
            </Tag>
          ) : (
            <Tag variant="soft" size="sm" color="#d97706">
              Draft · 待核验
            </Tag>
          )}
        </div>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <Tag variant="soft" size="sm" color="#0d9488">
            {paper.area}
          </Tag>
          {paper.arxivUrl && (
            <a
              href={paper.arxivUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-accent/30 text-caption text-accent hover:text-accent/80 hover:border-accent/50 hover:bg-accent/5 transition-fast transition-colors"
            >
              arXiv
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* Main Fields Grid (2 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4 mb-5">
        {mainFields.map((field) => (
          <div key={field.label} className="min-w-0">
            <p className="text-label font-semibold text-muted uppercase tracking-wider mb-1.5">
              {field.label}
            </p>
            <p className="text-body text-ink leading-relaxed">{field.value}</p>
          </div>
        ))}
      </div>

      {/* Critical Fields (single column with emphasis) */}
      <div className="space-y-3 mb-4">
        {/* Limitations */}
        <div className="bg-red-50/40 border-l-4 border-l-red-400 rounded-r-lg p-3">
          <p className="text-label font-semibold text-red-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            局限性
          </p>
          <p className="text-body text-ink leading-relaxed">{paper.limitations}</p>
        </div>

        {/* Hidden Assumptions */}
        <div className="bg-amber-50/40 border-l-4 border-l-amber-400 rounded-r-lg p-3">
          <p className="text-label font-semibold text-amber-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            隐藏假设
          </p>
          <p className="text-body text-ink leading-relaxed">{paper.hiddenAssumptions}</p>
        </div>

        {/* Possible Extensions */}
        <div className="bg-accent/5 border-l-4 border-l-accent rounded-r-lg p-3">
          <p className="text-label font-semibold text-accent uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5" />
            可能的扩展
          </p>
          <p className="text-body text-ink leading-relaxed">{paper.possibleExtensions}</p>
        </div>
      </div>

      {/* Reading Prompts */}
      <div className="bg-bg2/40 rounded-lg p-3 mt-auto border-t border-border-subtle">
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="w-3.5 h-3.5 text-accent2" />
          <p className="text-label font-semibold text-accent2 uppercase tracking-wider">阅读时思考</p>
        </div>
        <ol className="space-y-1.5">
          {paper.readingPrompts.map((prompt, idx) => (
            <li key={idx} className="text-caption text-ink leading-relaxed flex items-start gap-2">
              <span className="text-accent2 font-semibold flex-shrink-0 mt-0.5">{idx + 1}.</span>
              <span>{prompt}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Assumption Thinking Prompts */}
      {paper.assumptionThinkingPrompts && paper.assumptionThinkingPrompts.length > 0 && (
        <div className="bg-blue-50/40 border-l-4 border-l-blue-400 rounded-r-lg p-3 mt-3">
          <div className="flex items-center gap-2 mb-2">
            <BrainCircuit className="w-3.5 h-3.5 text-blue-600" />
            <p className="text-label font-semibold text-blue-700 uppercase tracking-wider">假设思考引导</p>
          </div>
          <ol className="space-y-1.5">
            {paper.assumptionThinkingPrompts.map((prompt, idx) => (
              <li key={idx} className="text-caption text-ink leading-relaxed flex items-start gap-2">
                <span className="text-blue-600 font-semibold flex-shrink-0 mt-0.5">{idx + 1}.</span>
                <span>{prompt}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Gap Thinking Prompts */}
      {paper.gapThinkingPrompts && paper.gapThinkingPrompts.length > 0 && (
        <div className="bg-purple-50/40 border-l-4 border-l-purple-400 rounded-r-lg p-3 mt-3">
          <div className="flex items-center gap-2 mb-2">
            <Compass className="w-3.5 h-3.5 text-purple-600" />
            <p className="text-label font-semibold text-purple-700 uppercase tracking-wider">缺口探索引导</p>
          </div>
          <ol className="space-y-1.5">
            {paper.gapThinkingPrompts.map((prompt, idx) => (
              <li key={idx} className="text-caption text-ink leading-relaxed flex items-start gap-2">
                <span className="text-purple-600 font-semibold flex-shrink-0 mt-0.5">{idx + 1}.</span>
                <span>{prompt}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </Card>
  );
}

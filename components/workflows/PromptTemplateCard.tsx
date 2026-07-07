'use client';

import { Tag } from '../ui/Tag';
import { Card } from '../ui/Card';
import { Terminal } from 'lucide-react';
import type { PromptTemplate } from '../../lib/workflows/researchWorkflows';

interface PromptTemplateCardProps {
  template: PromptTemplate;
}

export default function PromptTemplateCard({ template }: PromptTemplateCardProps) {
  return (
    <Card className="bg-bg2/50 border-dashed border-border-default">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <Terminal className="w-3.5 h-3.5 text-accent2 flex-shrink-0" />
          <h4 className="font-medium text-ink text-sm truncate">{template.name}</h4>
        </div>
        <Tag variant="soft" size="sm" color="#0d9488" bgColor="#0d9488">
          → {template.outputSink}
        </Tag>
      </div>
      <div className="font-mono text-caption text-ink bg-surface p-3 rounded border border-border-subtle overflow-x-auto whitespace-pre-wrap break-words leading-relaxed" style={{ overflowWrap: 'anywhere' }}>
        {template.prompt}
      </div>
    </Card>
  );
}

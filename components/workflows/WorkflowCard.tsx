'use client';

import { Target, ListChecks, Terminal, Sparkles, ArrowRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Tag } from '../ui/Tag';
import PromptTemplateCard from './PromptTemplateCard';
import type { ResearchWorkflow } from '../../lib/workflows/researchWorkflows';

interface WorkflowCardProps {
  workflow: ResearchWorkflow;
}

export default function WorkflowCard({ workflow }: WorkflowCardProps) {
  return (
    <Card className="p-5">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
          <Target className="w-4.5 h-4.5 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-h2 font-semibold text-ink">{workflow.title}</h3>
          <p className="text-body text-muted mt-1 leading-relaxed">{workflow.scenario}</p>
        </div>
      </div>

      {/* Steps Section */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <ListChecks className="w-4 h-4 text-accent" />
          <h4 className="text-label font-semibold text-muted uppercase tracking-wider">操作步骤</h4>
        </div>
        <div className="divide-y divide-border-subtle">
          {workflow.steps.map((step, idx) => (
            <div key={idx} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-bg2 text-muted text-[10px] font-semibold flex items-center justify-center mt-0.5">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink text-sm">{step.title}</p>
                  <p className="text-caption text-muted mt-1 leading-relaxed">{step.description}</p>
                  <div className="mt-2">
                    <Tag variant="secondary" size="sm">
                      {step.toolCombination}
                    </Tag>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prompt Templates Section */}
      {workflow.promptTemplates.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Terminal className="w-4 h-4 text-accent2" />
            <h4 className="text-label font-semibold text-muted uppercase tracking-wider">Prompt 模板</h4>
          </div>
          <div className="space-y-3">
            {workflow.promptTemplates.map((tpl, idx) => (
              <PromptTemplateCard key={idx} template={tpl} />
            ))}
          </div>
        </div>
      )}

      {/* Robotics Focus */}
      <div className="bg-accent2/5 border-l-4 border-l-accent2 rounded-r-lg p-3 mb-3">
        <div className="flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-accent2 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-label font-semibold text-accent2 uppercase tracking-wider mb-1">机器人研究重点</p>
            <p className="text-caption text-ink leading-relaxed">{workflow.roboticsFocus}</p>
          </div>
        </div>
      </div>

      {/* Output Destination */}
      <div className="bg-accent/5 border-l-4 border-l-accent rounded-r-lg p-3">
        <div className="flex items-start gap-2">
          <ArrowRight className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-label font-semibold text-accent uppercase tracking-wider mb-1">输出物应沉淀到</p>
            <p className="text-caption text-ink leading-relaxed font-medium">{workflow.outputDestination}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

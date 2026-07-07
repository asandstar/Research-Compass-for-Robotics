'use client';

import { Workflow } from 'lucide-react';
import WorkflowCard from '../../components/workflows/WorkflowCard';
import { researchWorkflows } from '../../lib/workflows/researchWorkflows';

export default function WorkflowsPage() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Workflow className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="page-title">AI Research Workflows</h1>
            <p className="page-subtitle">面向机器人 / VLA / 具身智能研究的标准工作流，每个工作流包含推荐工具组合、操作步骤、Prompt 模板与输出沉淀指引。</p>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {researchWorkflows.map((wf) => (
          <WorkflowCard key={wf.id} workflow={wf} />
        ))}
      </div>
    </div>
  );
}

'use client';

import { Lightbulb, Wand2, FileText } from 'lucide-react';

export interface InputTemplate {
  label: string;
  content: string;
}

interface InputTemplatesProps {
  templates: InputTemplate[];
  onSelect: (content: string) => void;
  onAIGenerate?: () => void;
  aiLoading?: boolean;
  showAIGenerate?: boolean;
}

export function InputTemplates({
  templates,
  onSelect,
  onAIGenerate,
  aiLoading,
  showAIGenerate = false,
}: InputTemplatesProps) {
  return (
    <div className="mt-2 space-y-2">
      {/* AI Generate Button */}
      {showAIGenerate && onAIGenerate && (
        <button
          type="button"
          onClick={onAIGenerate}
          disabled={aiLoading}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-accent border border-accent/20 rounded-lg hover:bg-accent/5 transition-fast disabled:opacity-50"
        >
          <Wand2 className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
          {aiLoading ? 'AI 生成中...' : 'AI 辅助生成'}
        </button>
      )}

      {/* Template Buttons */}
      {templates.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[11px] text-muted flex items-center gap-1 mr-1">
            <FileText className="w-3 h-3" />
            快捷模板：
          </span>
          {templates.map((t, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(t.content)}
              className="text-[11px] px-2 py-1 rounded-md bg-bg2 dark:bg-dark-bg2 text-muted hover:text-ink hover:bg-rule dark:hover:bg-dark-rule transition-fast"
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Predefined templates for different input types
export const PREDICTION_TEMPLATES: InputTemplate[] = [
  { label: '条件模板', content: '在 [具体场景/数据集] 上，使用 [方法/模型] 进行测试。' },
  { label: '预期结果', content: '如果假设成立，预期观察到 [具体指标] 提升/下降 [百分比]。' },
];

export const EVIDENCE_TEMPLATES: InputTemplate[] = [
  { label: '文献支持', content: '已有工作证明 [具体结论] ([作者] [年份])' },
  { label: '实验证据', content: '在 [数据集] 上的实验显示 [具体结果]' },
  { label: '理论分析', content: '从理论角度分析，[论点] 因为 [原因]' },
];

export const FAILURE_CONDITION_TEMPLATES: InputTemplate[] = [
  { label: '精度不足', content: '如果 [指标] 提升低于 [阈值]，说明改进幅度不足以支撑独立工作' },
  { label: '泛化失败', content: '如果在 [新场景/数据集] 上性能显著下降，说明方法缺乏泛化能力' },
  { label: '实时性', content: '如果推理延迟增加超过 [阈值]，无法满足实时控制要求' },
];

export const RESEARCH_QUESTION_TEMPLATES: InputTemplate[] = [
  { label: '提升类', content: '如何提升 [现有方法] 在 [具体场景] 上的 [性能指标]？' },
  { label: '泛化类', content: '[方法] 能否泛化到 [新场景/任务]，泛化边界在哪里？' },
  { label: '结合类', content: '如何将 [方法A] 与 [方法B] 有效结合，实现 [目标]？' },
];

export const HYPOTHESIS_TEMPLATES: InputTemplate[] = [
  { label: '核心假设', content: '通过 [改进方案]，可以在 [场景] 上实现 [预期效果]。' },
  { label: '对比假设', content: '[方法A] 在 [指标] 上优于 [方法B]，因为 [原因]。' },
];

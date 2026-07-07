import { IdeaCard, MVE } from './types';

export type NextActionType =
  | 'complete_core_fields'
  | 'review_failure'
  | 'execute_pending_mve'
  | 'add_predictions'
  | 'add_failure_conditions'
  | 'strengthen_falsification'
  | 'add_evidence'
  | 'generate_mve'
  | 'idea_promising'
  | 'idea_unstable'
  | 'idea_rejected';

export interface NextAction {
  type: NextActionType;
  label: string;
  description: string;
  priority: number;
  actionPath: string;
  actionLabel: string;
}

export function calculateNextAction(idea: IdeaCard, mves: MVE[]): NextAction {
  const candidates: NextAction[] = [];

  const ideaMves = mves.filter(m => m.ideaCardId === idea.id);
  const hasCoreFields =
    idea.researchQuestion.trim() !== '' &&
    idea.coreHypothesis.trim() !== '' &&
    idea.whyItMatters.trim() !== '';
  const hasPredictions = idea.predictions.length > 0;
  const hasFailureConditions = idea.failureConditions.length > 0;
  const hasEnoughEvidence = idea.evidenceForHypothesis.length >= 2;
  const pendingMVEs = ideaMves.filter(m => m.resultStatus === 'pending');
  const latestMve = ideaMves.length > 0 ? ideaMves[ideaMves.length - 1] : null;

  // Priority 10: Complete core fields
  if (!hasCoreFields) {
    candidates.push({
      type: 'complete_core_fields',
      label: '完善核心假设',
      description: '请先填写研究问题、核心假设和为什么值得做，才能继续推进验证。',
      priority: 10,
      actionPath: '/focus',
      actionLabel: '编辑假设',
    });
  }

  // Priority 9: Review latest failure
  if (latestMve && latestMve.resultStatus === 'failed') {
    candidates.push({
      type: 'review_failure',
      label: '查看失败分析',
      description: `最近一次实验（${latestMve.mveType}）失败，需要分析原因并更新假设。`,
      priority: 9,
      actionPath: '/focus',
      actionLabel: '查看分析',
    });
  }

  // Priority 8: Execute pending MVE
  if (pendingMVEs.length > 0) {
    const nextPending = pendingMVEs[0];
    candidates.push({
      type: 'execute_pending_mve',
      label: '执行待验证实验',
      description: nextPending.experimentGoal || `有一个 ${nextPending.mveType} 类型的实验等待执行。`,
      priority: 8,
      actionPath: '/focus',
      actionLabel: '执行实验',
    });
  }

  // Priority 7: Add predictions
  if (!hasPredictions && hasCoreFields) {
    candidates.push({
      type: 'add_predictions',
      label: '添加可检验预测',
      description: '定义明确的"条件 → 预期结果"预测，使假设变得可证伪。',
      priority: 7,
      actionPath: '/focus',
      actionLabel: '添加预测',
    });
  }

  // Priority 6: Add failure conditions
  if (!hasFailureConditions && hasCoreFields) {
    candidates.push({
      type: 'add_failure_conditions',
      label: '定义失败条件',
      description: '明确哪些实验结果会直接否定这个假设，增强证伪能力。',
      priority: 6,
      actionPath: '/focus',
      actionLabel: '添加失败条件',
    });
  }

  // Priority 5: Strengthen falsification
  if (idea.falsificationStrength < 30 && hasCoreFields) {
    candidates.push({
      type: 'strengthen_falsification',
      label: '增强证伪性',
      description: '当前证伪强度较低，建议补充失败条件、混淆因素或反对证据。',
      priority: 5,
      actionPath: '/focus',
      actionLabel: '增强证伪',
    });
  }

  // Priority 4: Add supporting evidence
  if (!hasEnoughEvidence && hasCoreFields) {
    candidates.push({
      type: 'add_evidence',
      label: '补充支持证据',
      description: '当前支持证据不足，寻找更多支持你假设的论文或实验数据。',
      priority: 4,
      actionPath: '/papers',
      actionLabel: '查找论文',
    });
  }

  // Priority 3: Generate MVE
  if (ideaMves.length === 0 && hasCoreFields && hasEnoughEvidence) {
    candidates.push({
      type: 'generate_mve',
      label: '生成最小可行实验',
      description: '假设已有足够支持，是时候设计一个最小实验来验证核心假设了。',
      priority: 3,
      actionPath: '/focus',
      actionLabel: '生成实验',
    });
  }

  // Priority 2: Idea unstable (informational)
  if (idea.survivalScore < 50 && idea.confidenceScore < 30 && hasCoreFields) {
    candidates.push({
      type: 'idea_unstable',
      label: 'Idea 状态不稳定',
      description: `存活度 ${idea.survivalScore}，置信度 ${idea.confidenceScore}，建议补充证据或考虑调整方向。`,
      priority: 2,
      actionPath: '/focus',
      actionLabel: '查看详情',
    });
  }

  // Priority 1: Idea promising (informational)
  if (idea.survivalScore >= 70 && idea.confidenceScore >= 60) {
    candidates.push({
      type: 'idea_promising',
      label: 'Idea 值得推进',
      description: `存活度 ${idea.survivalScore}，置信度 ${idea.confidenceScore}，可以考虑扩大验证范围或准备成文。`,
      priority: 1,
      actionPath: '/focus',
      actionLabel: '继续推进',
    });
  }

  // Priority 0: Idea rejected (informational)
  if (idea.survivalScore < 20 && hasCoreFields) {
    candidates.push({
      type: 'idea_rejected',
      label: 'Idea 建议放弃',
      description: `存活度仅 ${idea.survivalScore}，多数实验失败或证据不足，建议转向其他方向。`,
      priority: 0,
      actionPath: '/ideas',
      actionLabel: '选择其他方向',
    });
  }

  // Sort by priority descending, return highest
  candidates.sort((a, b) => b.priority - a.priority);

  if (candidates.length === 0) {
    return {
      type: 'complete_core_fields',
      label: '开始研究',
      description: '选择一个研究方向，填写核心假设开始验证。',
      priority: 0,
      actionPath: '/focus',
      actionLabel: '开始',
    };
  }

  return candidates[0];
}

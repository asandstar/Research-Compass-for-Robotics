export interface Observation {
  id: string;
  content: string;
  type: 'paper' | 'experiment' | 'discussion' | 'question' | 'anomaly';
  keywords: string[];
  potentialIssue: string;
  researchValue: 'high' | 'medium' | 'low';
  researchValueReason: string;
  suggestedAction: string;
  createdAt: string;
  context: string;
  signals: string[];
}

const HYPOTHESIS_KEYWORDS = ['因此', '表明', '说明', '证明', '由此可见', '由此可以', '由此可知', '可见', '可以看出', '说明', '证明', '意味着', '说明', '导致', '造成', '引起', '因为', '由于', '如果', '假如', '假设'];

export function validateNoHypothesisEmbedding(content: string): { hasHypothesis: boolean; matchedKeywords: string[] } {
  const matchedKeywords = HYPOTHESIS_KEYWORDS.filter(keyword => content.includes(keyword));
  return {
    hasHypothesis: matchedKeywords.length > 0,
    matchedKeywords,
  };
}

export interface Evidence {
  id: string;
  content: string;
  source: string;
  isAIGenerated: boolean;
}

export interface ResearchArea {
  id: string;
  name: string;
  description: string;
  category: string;
  keywords: string[];
  focusQuestions: string[];
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaperEvidence {
  tasks: string[];
  baselines: string[];
  metrics: string[];
  keyResults: string[];
}

export interface Paper {
  id: string;
  title: string;
  authors: string;
  year: number;
  venue: string;
  arxivUrl: string;
  pdfUrl: string;
  htmlUrl: string;
  feishuNoteUrl: string;
  codeUrl: string;
  areaIds: string[];
  readingStatus: 'to_read' | 'skimmed' | 'deep_reading' | 'reviewed' | 'paused';
  methodKeywords: string[];
  oneSentenceSummary: string;
  problem: string;
  coreContribution: string;
  methodSketch: string;
  evidence: PaperEvidence;
  assumptions: string[];
  limitations: string[];
  relevanceToMyResearch: string;
  questionsToVerify: string[];
  limitationsOrQuestions: string;
  judgementLevel: 'background' | 'useful' | 'idea_source' | 'must_review';
  inspiredIdeaIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Prediction {
  condition: string;
  expectedOutcome: string;
}

export interface AdversarialReview {
  strongestCounterarguments: string[];
  likelyFailureScenarios: string[];
  falsificationExperiments: string[];
}

export interface IdeaRelationship {
  id: string;
  sourceId: string;
  targetId: string;
  relationshipType: 'refines' | 'contradicts' | 'depends_on' | 'derived_from';
  description?: string;
  createdAt: string;
}

export const RELATIONSHIP_LABELS: Record<IdeaRelationship['relationshipType'], StatusLabel> = {
  refines: { label: '改进', color: '#065f46', bgColor: '#d1fae5' },
  contradicts: { label: '冲突', color: '#dc2626', bgColor: '#fee2e2' },
  depends_on: { label: '依赖', color: '#1e40af', bgColor: '#dbeafe' },
  derived_from: { label: '来源', color: '#7c3aed', bgColor: '#ede9fe' },
};

export interface FailureAnalysis {
  failureReasonTaxonomy: string[];
  hypothesisUpdateSuggestion: string;
  nextMveGeneration: string[];
}

export interface IdeaCard {
  id: string;
  title: string;
  status: 'active' | 'unstable' | 'promising' | 'rejected' | 'revived';

  researchQuestion: string;
  coreHypothesis: string;
  hypothesis: string;
  whyItMatters: string;

  predictions: Prediction[];
  failureConditions: string[];
  confounders: string[];

  evidenceForHypothesis: Evidence[];
  evidenceAgainstHypothesis: Evidence[];
  falsificationRisks: Evidence[];
  biggestRisks: string[];

  survivalScore: number;
  confidenceScore: number;
  falsificationStrength: number;

  sourceObservations: string[];
  sourcePaperIds: string[];
  areaIds: string[];

  roboticsTask: string;
  datasetOrScenario: string;
  baseline: string;
  evaluationMetric: string;

  nextAction: string;
  notes: string;

  createdAt: string;
  updatedAt: string;
}

export interface ExperimentStep {
  id: string;
  description: string;
  completed: boolean;
  completedAt?: string;
}

export interface DataRecord {
  id: string;
  variable: string;
  value: string;
  unit?: string;
  timestamp?: string;
}

export interface FailureMode {
  type: 'performance' | 'robustness' | 'generalization' | 'implementation' | 'theoretical';
  description: string;
  detectionCriteria: string;
}

export interface MVE {
  id: string;
  ideaCardId: string;
  mveType: 'sanity_check' | 'ablation' | 'generalization_test' | 'stress_test';
  experimentGoal: string;
  taskDefinition: string;
  evaluationProtocol: string;
  minimalDesign: string;
  keyVariables: { independent: string; dependent: string };
  controlGroups: string[];
  baselineReferences: string[];
  successCriteria: string;
  failureModes: FailureMode[];
  failureSignals: string[];
  minimalEnvOrDataset: string;
  minimalEffort: string;
  nextTasks: { onPass: string; onFail: string };

  roboticsTask: string;
  datasetOrScenario: string;
  baseline: string;
  evaluationMetric: string;
  minimalComputeNeed: string;
  expectedTimeCost: string;

  steps: ExperimentStep[];
  dataRecords: DataRecord[];
  
  resultStatus: 'pending' | 'passed' | 'failed';
  resultNotes: string;
  failureAnalysis?: FailureAnalysis;
  createdAt: string;
}

export type StatusLabel = {
  label: string;
  color: string;
  bgColor: string;
};

export const IDEA_STATUS_LABELS: Record<IdeaCard['status'], StatusLabel> = {
  active: { label: '活跃', color: '#1e40af', bgColor: '#dbeafe' },
  unstable: { label: '不稳定', color: '#92400e', bgColor: '#fef3c7' },
  promising: { label: '值得推进', color: '#065f46', bgColor: '#d1fae5' },
  rejected: { label: '已拒绝', color: '#991b1b', bgColor: '#fee2e2' },
  revived: { label: '已恢复', color: '#7c3aed', bgColor: '#ede9fe' },
};

export const LEGACY_STATUS_MAP: Record<string, IdeaCard['status']> = {
  observing: 'active',
  collecting: 'active',
  'mve-running': 'active',
  rough: 'active',
  researching: 'active',
  promising: 'promising',
  paused: 'unstable',
  abandoned: 'rejected',
};

export const TYPE_LABELS: Record<Observation['type'], StatusLabel> = {
  paper: { label: '论文洞察', color: '#065f46', bgColor: '#d1fae5' },
  experiment: { label: '实验异常', color: '#92400e', bgColor: '#fef3c7' },
  discussion: { label: '讨论灵感', color: '#1e40af', bgColor: '#dbeafe' },
  question: { label: '开放问题', color: '#78716c', bgColor: '#f5f5f4' },
  anomaly: { label: '异常现象', color: '#dc2626', bgColor: '#fee2e2' },
};

export const READING_STATUS_LABELS: Record<Paper['readingStatus'], StatusLabel> = {
  to_read: { label: '待读', color: '#6b7280', bgColor: '#f3f4f6' },
  skimmed: { label: '泛读', color: '#0891b2', bgColor: '#cffafe' },
  deep_reading: { label: '精读中', color: '#7c3aed', bgColor: '#ede9fe' },
  reviewed: { label: '已复盘', color: '#065f46', bgColor: '#d1fae5' },
  paused: { label: '暂停', color: '#92400e', bgColor: '#fef3c7' },
};

export const JUDGEMENT_LABELS: Record<Paper['judgementLevel'], StatusLabel> = {
  background: { label: '背景资料', color: '#6b7280', bgColor: '#f3f4f6' },
  useful: { label: '有用', color: '#0891b2', bgColor: '#cffafe' },
  idea_source: { label: '灵感来源', color: '#7c3aed', bgColor: '#ede9fe' },
  must_review: { label: '必复盘', color: '#991b1b', bgColor: '#fee2e2' },
};

export const MVE_RESULT_LABELS: Record<MVE['resultStatus'], StatusLabel> = {
  pending: { label: '待实验', color: '#78716c', bgColor: '#f5f5f4' },
  passed: { label: '已通过', color: '#065f46', bgColor: '#d1fae5' },
  failed: { label: '已失败', color: '#991b1b', bgColor: '#fee2e2' },
};

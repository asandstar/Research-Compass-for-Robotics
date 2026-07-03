export interface Observation {
  id: string;
  content: string;
  type: 'paper' | 'experiment' | 'discussion' | 'question';
  keywords: string[];
  potentialIssue: string;
  researchValue: 'high' | 'medium' | 'low';
  researchValueReason: string;
  suggestedAction: string;
  createdAt: string;
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
  relevanceToMyResearch: string;
  limitationsOrQuestions: string;
  judgementLevel: 'background' | 'useful' | 'idea_source' | 'must_review';
  inspiredIdeaIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IdeaCard {
  id: string;
  title: string;
  status: 'rough' | 'researching' | 'mve_running' | 'promising' | 'paused' | 'abandoned';

  researchQuestion: string;
  coreHypothesis: string;
  whyItMatters: string;

  supportingEvidence: Evidence[];
  opposingEvidence: Evidence[];
  missingEvidence: Evidence[];
  biggestRisks: string[];

  sourceObservations: string[];
  sourcePaperIds: string[];
  areaIds: string[];

  roboticsTask: string;
  datasetOrScenario: string;
  baseline: string;
  evaluationMetric: string;

  nextAction: string;

  createdAt: string;
  updatedAt: string;
}

export interface MVE {
  id: string;
  ideaCardId: string;
  experimentGoal: string;
  minimalDesign: string;
  keyVariables: { independent: string; dependent: string };
  controlGroups: string[];
  expectedOutcome: string;
  failureSignals: string[];
  minimalEffort: string;
  nextTasks: { onPass: string; onFail: string };

  roboticsTask: string;
  datasetOrScenario: string;
  baseline: string;
  evaluationMetric: string;
  minimalComputeNeed: string;
  expectedTimeCost: string;

  resultStatus: 'pending' | 'passed' | 'failed';
  resultNotes: string;
  createdAt: string;
}

export type StatusLabel = {
  label: string;
  color: string;
  bgColor: string;
};

export const IDEA_STATUS_LABELS: Record<IdeaCard['status'], StatusLabel> = {
  rough: { label: '初步想法', color: '#78716c', bgColor: '#f5f5f4' },
  researching: { label: '调研中', color: '#1e40af', bgColor: '#dbeafe' },
  mve_running: { label: 'MVE 进行中', color: '#92400e', bgColor: '#fef3c7' },
  promising: { label: '值得推进', color: '#065f46', bgColor: '#d1fae5' },
  paused: { label: '已暂停', color: '#6b7280', bgColor: '#f3f4f6' },
  abandoned: { label: '已放弃', color: '#991b1b', bgColor: '#fee2e2' },
};

export const LEGACY_STATUS_MAP: Record<string, IdeaCard['status']> = {
  observing: 'rough',
  collecting: 'researching',
  'mve-running': 'mve_running',
  promising: 'promising',
  abandoned: 'abandoned',
};

export const TYPE_LABELS: Record<Observation['type'], StatusLabel> = {
  paper: { label: '论文洞察', color: '#065f46', bgColor: '#d1fae5' },
  experiment: { label: '实验异常', color: '#92400e', bgColor: '#fef3c7' },
  discussion: { label: '讨论灵感', color: '#1e40af', bgColor: '#dbeafe' },
  question: { label: '开放问题', color: '#78716c', bgColor: '#f5f5f4' },
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

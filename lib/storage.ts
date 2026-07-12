import { Observation, IdeaCard, MVE, ResearchArea, Paper, IdeaRelationship, LEGACY_STATUS_MAP } from './types';
import { mockObservations, mockIdeaCards, mockMVEs, mockResearchAreas, mockPapers } from './mockData';
import {
  getMainData,
  setMainData,
  addBackup,
  isIndexedDBAvailable,
} from './storage/indexedDB';
import { updateIdeaCardWithCalculatedState } from './stateCalculator';

const STORAGE_KEY = 'research-compass-data-v14';
const MIGRATION_FLAG_KEY = 'rc-migrated-to-idb';

export interface StoredData {
  observations: Observation[];
  ideaCards: IdeaCard[];
  ideaRelationships: IdeaRelationship[];
  mves: MVE[];
  researchAreas: ResearchArea[];
  papers: Paper[];
}

export interface DataRepairReport {
  removedDuplicateIds: number;
  removedOrphanMves: number;
  removedInvalidRelationships: number;
  removedInvalidPaperReferences: number;
  removedInvalidAreaReferences: number;
  addedDefaultFields: number;
  addedPaperMetadataStatus: number;
  detectedLegacyMock: number;
}

export function createEmptyReport(): DataRepairReport {
  return {
    removedDuplicateIds: 0,
    removedOrphanMves: 0,
    removedInvalidRelationships: 0,
    removedInvalidPaperReferences: 0,
    removedInvalidAreaReferences: 0,
    addedDefaultFields: 0,
    addedPaperMetadataStatus: 0,
    detectedLegacyMock: 0,
  };
}

function migrateLegacyIdeaStatus(card: any): IdeaCard['status'] {
  if (LEGACY_STATUS_MAP[card.status]) {
    return LEGACY_STATUS_MAP[card.status];
  }
  return card.status || 'active';
}

function migrateLegacyMVEResultStatus(status: any): MVE['resultStatus'] {
  if (status === 'success' || status === 'succeeded') return 'passed';
  if (status === 'failed' || status === 'failure') return 'failed';
  if (status === 'pending' || status === 'passed' || status === 'failed') return status;
  return 'pending';
}

function addDefaultIdeaFields(card: any, report: DataRepairReport): IdeaCard {
  const hasMissingFields =
    !card.predictions ||
    !card.failureConditions ||
    !card.confounders ||
    !card.evidenceForHypothesis ||
    !card.evidenceAgainstHypothesis ||
    !card.falsificationRisks ||
    card.survivalScore == null ||
    card.confidenceScore == null ||
    card.falsificationStrength == null;
  if (hasMissingFields) report.addedDefaultFields++;

  return {
    ...card,
    status: migrateLegacyIdeaStatus(card),
    hypothesis: card.hypothesis || card.coreHypothesis || '',
    predictions: card.predictions || [],
    failureConditions: card.failureConditions || [],
    confounders: card.confounders || [],
    evidenceForHypothesis: card.evidenceForHypothesis || card.supportingEvidence || [],
    evidenceAgainstHypothesis: card.evidenceAgainstHypothesis || card.opposingEvidence || [],
    falsificationRisks: card.falsificationRisks || card.missingEvidence || [],
    survivalScore: card.survivalScore != null ? card.survivalScore : 50,
    confidenceScore: card.confidenceScore != null ? card.confidenceScore : 50,
    falsificationStrength: card.falsificationStrength != null ? card.falsificationStrength : 0,
    areaIds: card.areaIds || [],
    sourcePaperIds: card.sourcePaperIds || [],
    roboticsTask: card.roboticsTask || '',
    datasetOrScenario: card.datasetOrScenario || '',
    baseline: card.baseline || '',
    evaluationMetric: card.evaluationMetric || '',
    nextAction: card.nextAction || '',
    notes: card.notes || '',
    biggestRisks: card.biggestRisks || [],
    sourceObservations: card.sourceObservations || [],
    researchQuestion: card.researchQuestion || '',
    coreHypothesis: card.coreHypothesis || card.hypothesis || '',
    whyItMatters: card.whyItMatters || '',
    createdAt: card.createdAt || new Date().toISOString(),
    updatedAt: card.updatedAt || new Date().toISOString(),
  };
}

function addDefaultMVEFields(mve: any, report: DataRepairReport): MVE {
  const hasMissingFields =
    !mve.mveType ||
    !mve.steps ||
    !mve.dataRecords ||
    !mve.failureModes ||
    !mve.nextTasks;
  if (hasMissingFields) report.addedDefaultFields++;

  return {
    ...mve,
    mveType: mve.mveType || 'sanity_check',
    experimentGoal: mve.experimentGoal || '',
    taskDefinition: mve.taskDefinition || mve.roboticsTask || '',
    evaluationProtocol: mve.evaluationProtocol || mve.evaluationMetric || '',
    minimalDesign: mve.minimalDesign || '',
    keyVariables: mve.keyVariables || { independent: '', dependent: '' },
    controlGroups: mve.controlGroups || [],
    baselineReferences: mve.baselineReferences || (mve.baseline ? [mve.baseline] : []),
    successCriteria: mve.successCriteria || mve.expectedOutcome || '',
    failureModes: mve.failureModes || [],
    failureSignals: mve.failureSignals || [],
    minimalEnvOrDataset: mve.minimalEnvOrDataset || mve.datasetOrScenario || '',
    minimalEffort: mve.minimalEffort || '',
    nextTasks: mve.nextTasks || { onPass: '', onFail: '' },
    resultStatus: migrateLegacyMVEResultStatus(mve.resultStatus),
    roboticsTask: mve.roboticsTask || '',
    datasetOrScenario: mve.datasetOrScenario || '',
    baseline: mve.baseline || '',
    evaluationMetric: mve.evaluationMetric || '',
    minimalComputeNeed: mve.minimalComputeNeed || '',
    expectedTimeCost: mve.expectedTimeCost || '',
    steps: mve.steps || [],
    dataRecords: mve.dataRecords || [],
    resultNotes: mve.resultNotes || '',
    createdAt: mve.createdAt || new Date().toISOString(),
  };
}

function addDefaultAreaFields(area: any): ResearchArea {
  return {
    ...area,
    isHidden: area.isHidden ?? false,
    keywords: area.keywords || [],
    focusQuestions: area.focusQuestions || [],
    createdAt: area.createdAt || new Date().toISOString(),
    updatedAt: area.updatedAt || new Date().toISOString(),
  };
}

const LEGACY_MOCK_TITLES = new Set([
  'Vision-Language-Action Models via Hierarchical Decoding',
  'Visual SLAM with Dynamic Object Removal',
  'Diffusion Policy for Robotic Manipulation',
  'Multi-Sensor Fusion with Factor Graphs',
  '3D Object Detection from Point Clouds',
  'Visual-Inertial Odometry for Agile Flight',
  'Robotics Foundation Models with 1000 Tasks',
  'Sim-to-Real Transfer with Domain Randomization',
  'Dexterous Manipulation via Tactile Feedback',
  'Embodied AI for Long-Horizon Tasks',
  'Semantic SLAM with Foundation Models',
  'World Models for Model-Based RL',
  'Imitation Learning from Suboptimal Demonstrations',
  'Reinforcement Learning with Sparse Rewards',
  'Offline RL for Robot Navigation',
  'Inverse Reinforcement Learning from Observations',
  'Meta-Learning for Fast Adaptation',
  'Self-Supervised Representation Learning',
]);

const LEGACY_MOCK_KEY_RESULTS = ['性能提升15-20%', '推理速度提升2-3倍', '泛化能力增强'];

export function detectLegacyMockPaper(paper: Partial<Paper>): boolean {
  if (!paper.title || !LEGACY_MOCK_TITLES.has(paper.title)) return false;
  const keyResults = paper.evidence?.keyResults;
  if (!Array.isArray(keyResults)) return false;
  const hasLegacyResults = LEGACY_MOCK_KEY_RESULTS.every(r => keyResults.includes(r));
  return hasLegacyResults;
}

function addDefaultPaperFields(paper: any, report: DataRepairReport): Paper {
  const hasMissingFields =
    !paper.areaIds ||
    !paper.evidence ||
    !paper.assumptions ||
    !paper.limitations ||
    !paper.questionsToVerify;
  if (hasMissingFields) report.addedDefaultFields++;

  if (!paper.metadataStatus || !paper.verificationStatus) {
    report.addedPaperMetadataStatus++;
  }

  const isLegacy = detectLegacyMockPaper(paper);
  if (isLegacy) {
    report.detectedLegacyMock++;
  }

  return {
    ...paper,
    areaIds: paper.areaIds || [],
    methodKeywords: paper.methodKeywords || [],
    evidence: paper.evidence || { tasks: [], baselines: [], metrics: [], keyResults: [] },
    assumptions: paper.assumptions || [],
    limitations: paper.limitations || [],
    questionsToVerify: paper.questionsToVerify || [],
    inspiredIdeaIds: paper.inspiredIdeaIds || [],
    metadataStatus: isLegacy ? 'unavailable' : (paper.metadataStatus || 'manual'),
    verificationStatus: paper.verificationStatus || 'unverified',
    dataProvenance: isLegacy ? 'legacy_mock' : (paper.dataProvenance || (paper.metadataStatus === 'unavailable' ? 'link_only' : 'manual')),
    createdAt: paper.createdAt || new Date().toISOString(),
    updatedAt: paper.updatedAt || new Date().toISOString(),
  };
}

function deduplicateById<T extends { id: string }>(items: T[], report: DataRepairReport): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    if (item.id == null || seen.has(item.id)) {
      report.removedDuplicateIds++;
      continue;
    }
    seen.add(item.id);
    result.push(item);
  }
  return result;
}

export function normalizeStoredData(rawData: unknown): {
  data: StoredData;
  report: DataRepairReport;
} {
  const report = createEmptyReport();
  const parsed: any = rawData && typeof rawData === 'object' ? rawData : {};

  const rawResearchAreas = Array.isArray(parsed.researchAreas) ? parsed.researchAreas : [];
  const rawPapers = Array.isArray(parsed.papers) ? parsed.papers : [];
  const rawObservations = Array.isArray(parsed.observations) ? parsed.observations : [];
  const rawIdeaCards = Array.isArray(parsed.ideaCards) ? parsed.ideaCards : [];
  const rawMves = Array.isArray(parsed.mves) ? parsed.mves : [];
  const rawIdeaRelationships = Array.isArray(parsed.ideaRelationships) ? parsed.ideaRelationships : [];

  const researchAreas: ResearchArea[] = deduplicateById(
    rawResearchAreas.map((a: any) => addDefaultAreaFields(a)),
    report
  );

  let papers: Paper[] = deduplicateById(
    rawPapers.map((p: any) => addDefaultPaperFields(p, report)),
    report
  );

  const observations: Observation[] = deduplicateById(
    rawObservations.filter((o: any) => o && o.id),
    report
  );

  let ideaCards: IdeaCard[] = deduplicateById(
    rawIdeaCards
      .filter((c: any) => c && c.id)
      .map((c: any) => addDefaultIdeaFields(c, report)),
    report
  );

  let mves: MVE[] = deduplicateById(
    rawMves
      .filter((m: any) => m && m.id)
      .map((m: any) => addDefaultMVEFields(m, report)),
    report
  );

  let ideaRelationships: IdeaRelationship[] = deduplicateById(
    rawIdeaRelationships.filter((r: any) => r && r.id),
    report
  );

  const areaIdSet = new Set(researchAreas.map(a => a.id));
  const paperIdSet = new Set(papers.map(p => p.id));
  const ideaIdSet = new Set(ideaCards.map(c => c.id));

  const validMves: MVE[] = [];
  for (const mve of mves) {
    if (!ideaIdSet.has(mve.ideaCardId)) {
      report.removedOrphanMves++;
      continue;
    }
    validMves.push(mve);
  }
  mves = validMves;

  const validRelationships: IdeaRelationship[] = [];
  for (const rel of ideaRelationships) {
    if (!ideaIdSet.has(rel.sourceId) || !ideaIdSet.has(rel.targetId)) {
      report.removedInvalidRelationships++;
      continue;
    }
    validRelationships.push(rel);
  }
  ideaRelationships = validRelationships;

  let paperRefFixes = 0;
  ideaCards = ideaCards.map(card => {
    let changed = false;
    const validSourcePaperIds = card.sourcePaperIds.filter(id => {
      if (!paperIdSet.has(id)) {
        changed = true;
        return false;
      }
      return true;
    });
    if (validSourcePaperIds.length !== card.sourcePaperIds.length) {
      paperRefFixes++;
    }
    const validAreaIds = card.areaIds.filter(id => {
      if (!areaIdSet.has(id)) {
        changed = true;
        return false;
      }
      return true;
    });
    if (validAreaIds.length !== card.areaIds.length) {
      report.removedInvalidAreaReferences++;
    }
    if (changed) {
      return { ...card, sourcePaperIds: validSourcePaperIds, areaIds: validAreaIds };
    }
    return card;
  });
  report.removedInvalidPaperReferences += paperRefFixes;

  papers = papers.map(paper => {
    let changed = false;
    const validInspiredIdeaIds = paper.inspiredIdeaIds.filter(id => {
      if (!ideaIdSet.has(id)) {
        changed = true;
        return false;
      }
      return true;
    });
    const validAreaIds = paper.areaIds.filter(id => {
      if (!areaIdSet.has(id)) {
        changed = true;
        return false;
      }
      return true;
    });
    if (validAreaIds.length !== paper.areaIds.length) {
      report.removedInvalidAreaReferences++;
    }
    if (changed) {
      return { ...paper, inspiredIdeaIds: validInspiredIdeaIds, areaIds: validAreaIds };
    }
    return paper;
  });

  ideaCards = ideaCards.map(card => updateIdeaCardWithCalculatedState(card, mves));

  return {
    data: {
      observations,
      ideaCards,
      ideaRelationships,
      mves,
      researchAreas,
      papers,
    },
    report,
  };
}

export function isRepairReportEmpty(report: DataRepairReport): boolean {
  return (
    report.removedDuplicateIds === 0 &&
    report.removedOrphanMves === 0 &&
    report.removedInvalidRelationships === 0 &&
    report.removedInvalidPaperReferences === 0 &&
    report.removedInvalidAreaReferences === 0 &&
    report.addedDefaultFields === 0 &&
    report.addedPaperMetadataStatus === 0 &&
    report.detectedLegacyMock === 0
  );
}

export function formatRepairReport(report: DataRepairReport): string {
  const parts: string[] = [];
  if (report.removedDuplicateIds > 0) parts.push(`移除 ${report.removedDuplicateIds} 条重复数据`);
  if (report.removedOrphanMves > 0) parts.push(`清理 ${report.removedOrphanMves} 个孤立实验`);
  if (report.removedInvalidRelationships > 0) parts.push(`清理 ${report.removedInvalidRelationships} 条无效关系`);
  if (report.removedInvalidPaperReferences > 0) parts.push(`修复 ${report.removedInvalidPaperReferences} 个论文引用`);
  if (report.removedInvalidAreaReferences > 0) parts.push(`修复 ${report.removedInvalidAreaReferences} 个领域引用`);
  if (report.addedDefaultFields > 0) parts.push(`补充 ${report.addedDefaultFields} 条默认字段`);
  if (report.addedPaperMetadataStatus > 0) parts.push(`补充 ${report.addedPaperMetadataStatus} 条论文元数据状态`);
  if (report.detectedLegacyMock > 0) parts.push(`标记 ${report.detectedLegacyMock} 篇旧版模拟论文`);
  return parts.length > 0 ? parts.join('，') : '';
}

function getInitialMockData(): StoredData {
  return {
    observations: [...mockObservations],
    ideaCards: [...mockIdeaCards],
    ideaRelationships: [],
    mves: [...mockMVEs],
    researchAreas: [...mockResearchAreas],
    papers: [...mockPapers],
  };
}

async function loadFromIDB(): Promise<StoredData | null> {
  if (!isIndexedDBAvailable()) return null;
  try {
    const data = await getMainData<any>();
    if (!data) return null;

    const { data: normalized, report } = normalizeStoredData(data);

    if (!isRepairReportEmpty(report)) {
      console.warn('[storage] IDB data repaired:', report);
      await saveToIDB(normalized);
    }

    return normalized;
  } catch (e) {
    console.error('Failed to load from IndexedDB:', e);
    return null;
  }
}

async function saveToIDB(data: StoredData): Promise<void> {
  if (!isIndexedDBAvailable()) {
    saveToLocalStorage(data);
    return;
  }
  try {
    await setMainData(data);
    saveToLocalStorage(data);
  } catch (e) {
    console.error('Failed to save to IndexedDB, falling back to localStorage:', e);
    saveToLocalStorage(data);
  }
}

function saveToLocalStorage(data: StoredData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

function loadFromLocalStorage(): StoredData {
  const hasUserKey = typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) !== null;
  try {
    const data = hasUserKey ? localStorage.getItem(STORAGE_KEY) : null;
    if (data) {
      const parsed = JSON.parse(data);
      const { data: normalized, report } = normalizeStoredData(parsed);

      if (!isRepairReportEmpty(report)) {
        console.warn('[storage] localStorage data repaired:', report);
        saveToLocalStorage(normalized);
      }

      return normalized;
    }

    const legacyData = localStorage.getItem('research-compass-data');
    if (legacyData) {
      const parsed = JSON.parse(legacyData);
      const { data: migrated } = normalizeStoredData(parsed);
      saveToLocalStorage(migrated);
      return migrated;
    }

    return getInitialMockData();
  } catch (e) {
    console.error('Failed to load from localStorage:', e);
    try {
      const rawData = localStorage.getItem(STORAGE_KEY);
      if (rawData) {
        localStorage.setItem(STORAGE_KEY + '-backup-' + Date.now(), rawData);
      }
    } catch (e) {
      console.warn('Failed to backup localStorage:', e);
    }
    return {
      observations: [],
      ideaCards: [],
      ideaRelationships: [],
      mves: [],
      researchAreas: [...mockResearchAreas],
      papers: [...mockPapers],
    };
  }
}

export async function initializeData(): Promise<StoredData> {
  if (!isIndexedDBAvailable()) {
    return loadFromLocalStorage();
  }

  const idbData = await loadFromIDB();
  if (idbData) {
    localStorage.setItem(MIGRATION_FLAG_KEY, '1');
    return idbData;
  }

  const lsData = loadFromLocalStorage();
  const hasUserKey = localStorage.getItem(STORAGE_KEY) !== null;

  try {
    await setMainData(lsData);
    if (hasUserKey) {
      await addBackup(lsData, '迁移前备份');
    }
    localStorage.setItem(MIGRATION_FLAG_KEY, '1');
  } catch (e) {
    console.error('Migration to IndexedDB failed:', e);
  }

  return lsData;
}

export async function persistData(data: StoredData): Promise<void> {
  await saveToIDB(data);
}

export async function resetDemoData(): Promise<StoredData> {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem('research-compass-data');
  localStorage.removeItem(MIGRATION_FLAG_KEY);

  if (isIndexedDBAvailable()) {
    try {
      const { openDB } = await import('./storage/indexedDB');
      const db = await openDB();
      const tx = db.transaction(['data', 'backups'], 'readwrite');
      tx.objectStore('data').clear();
      tx.objectStore('backups').clear();
    } catch (e) {
      console.error('Failed to clear IndexedDB:', e);
    }
  }

  return initializeData();
}

export function hasMigratedToIDB(): boolean {
  return localStorage.getItem(MIGRATION_FLAG_KEY) === '1';
}

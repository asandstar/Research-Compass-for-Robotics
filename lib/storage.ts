import { Observation, IdeaCard, MVE, ResearchArea, Paper, IdeaRelationship, LEGACY_STATUS_MAP } from './types';
import { mockObservations, mockIdeaCards, mockMVEs, mockResearchAreas, mockPapers } from './mockData';
import {
  getMainData,
  setMainData,
  addBackup,
  isIndexedDBAvailable,
} from './storage/indexedDB';

const STORAGE_KEY = 'research-compass-data-v14';
const MIGRATION_FLAG_KEY = 'rc-migrated-to-idb';

interface StoredData {
  observations: Observation[];
  ideaCards: IdeaCard[];
  ideaRelationships: IdeaRelationship[];
  mves: MVE[];
  researchAreas: ResearchArea[];
  papers: Paper[];
}

function migrateLegacyIdeaStatus(card: any): IdeaCard['status'] {
  if (LEGACY_STATUS_MAP[card.status]) {
    return LEGACY_STATUS_MAP[card.status];
  }
  return card.status || 'rough';
}

function migrateLegacyMVEResultStatus(status: any): MVE['resultStatus'] {
  if (status === 'success' || status === 'succeeded') return 'passed';
  if (status === 'failed' || status === 'failure') return 'failed';
  if (status === 'pending' || status === 'passed' || status === 'failed') return status;
  return 'pending';
}

function addDefaultIdeaFields(card: any): IdeaCard {
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
  };
}

function addDefaultMVEFields(mve: any): MVE {
  return {
    ...mve,
    mveType: mve.mveType || 'sanity_check',
    taskDefinition: mve.taskDefinition || mve.roboticsTask || '',
    evaluationProtocol: mve.evaluationProtocol || mve.evaluationMetric || '',
    baselineReferences: mve.baselineReferences || (mve.baseline ? [mve.baseline] : []),
    successCriteria: mve.successCriteria || mve.expectedOutcome || '',
    failureModes: mve.failureModes || [],
    minimalEnvOrDataset: mve.minimalEnvOrDataset || mve.datasetOrScenario || '',
    resultStatus: migrateLegacyMVEResultStatus(mve.resultStatus),
    roboticsTask: mve.roboticsTask || '',
    datasetOrScenario: mve.datasetOrScenario || '',
    baseline: mve.baseline || '',
    evaluationMetric: mve.evaluationMetric || '',
    minimalComputeNeed: mve.minimalComputeNeed || '',
    expectedTimeCost: mve.expectedTimeCost || '',
  };
}

function addDefaultAreaFields(area: any): ResearchArea {
  return {
    ...area,
    isHidden: area.isHidden ?? false,
  };
}

function deduplicateById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter(item => {
    if (item.id == null || seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
}

function parseStoredData(parsed: any, hasStorageKey: boolean): StoredData {
  const rawResearchAreas = (parsed.researchAreas && Array.isArray(parsed.researchAreas))
    ? parsed.researchAreas as ResearchArea[]
    : [];
  const rawPapers = (parsed.papers && Array.isArray(parsed.papers))
    ? parsed.papers as Paper[]
    : [];
  const rawObservations = (parsed.observations && Array.isArray(parsed.observations))
    ? parsed.observations as Observation[]
    : [];
  const rawIdeaCards = (parsed.ideaCards && Array.isArray(parsed.ideaCards))
    ? parsed.ideaCards as any[]
    : [];
  const rawMves = (parsed.mves && Array.isArray(parsed.mves))
    ? parsed.mves as any[]
    : [];
  const rawIdeaRelationships = (parsed.ideaRelationships && Array.isArray(parsed.ideaRelationships))
    ? parsed.ideaRelationships as IdeaRelationship[]
    : [];

  const researchAreas: ResearchArea[] = hasStorageKey
    ? deduplicateById(rawResearchAreas.map(addDefaultAreaFields))
    : [...mockResearchAreas];
  const papers: Paper[] = hasStorageKey
    ? deduplicateById(rawPapers)
    : [...mockPapers];
  const observations: Observation[] = deduplicateById(rawObservations);
  const ideaCards: IdeaCard[] = deduplicateById(rawIdeaCards.map(addDefaultIdeaFields));
  const mves: MVE[] = deduplicateById(rawMves.map(addDefaultMVEFields));
  const ideaRelationships: IdeaRelationship[] = deduplicateById(rawIdeaRelationships);

  return {
    observations,
    ideaCards,
    ideaRelationships,
    mves,
    researchAreas,
    papers,
  };
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

    const hasStorageKey = true;
    const result = parseStoredData(data, hasStorageKey);

    const needsRepair =
      result.observations.length !== (data.observations?.length ?? 0) ||
      result.ideaCards.length !== (data.ideaCards?.length ?? 0) ||
      result.ideaRelationships.length !== (data.ideaRelationships?.length ?? 0) ||
      result.mves.length !== (data.mves?.length ?? 0) ||
      result.researchAreas.length !== (data.researchAreas?.length ?? 0) ||
      result.papers.length !== (data.papers?.length ?? 0);

    if (needsRepair) {
      await saveToIDB(result);
    }

    return result;
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
      const hasStorageKey = localStorage.getItem(STORAGE_KEY) !== null;
      const result = parseStoredData(parsed, hasStorageKey);

      const needsRepair =
        result.observations.length !== parsed.observations?.length ||
        result.ideaCards.length !== parsed.ideaCards?.length ||
        result.ideaRelationships.length !== parsed.ideaRelationships?.length ||
        result.mves.length !== parsed.mves?.length ||
        result.researchAreas.length !== parsed.researchAreas?.length ||
        result.papers.length !== parsed.papers?.length;

      if (needsRepair) {
        saveToLocalStorage(result);
      }

      return result;
    }

    const legacyData = localStorage.getItem('research-compass-data');
    if (legacyData) {
      const parsed = JSON.parse(legacyData);
      const migrated: StoredData = {
        observations: deduplicateById(((parsed.observations || []) as Observation[]).filter(o => o && o.id)),
        ideaCards: deduplicateById(((parsed.ideaCards || []) as any[]).filter(c => c && c.id).map(addDefaultIdeaFields)),
        ideaRelationships: [],
        mves: deduplicateById(((parsed.mves || []) as any[]).filter(m => m && m.id).map(addDefaultMVEFields)),
        researchAreas: [...mockResearchAreas].map(addDefaultAreaFields),
        papers: [...mockPapers],
      };
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
    } catch {}
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

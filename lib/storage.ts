import { Observation, IdeaCard, MVE, ResearchArea, Paper, LEGACY_STATUS_MAP } from './types';
import { mockObservations, mockIdeaCards, mockMVEs, mockResearchAreas, mockPapers } from './mockData';

const STORAGE_KEY = 'research-compass-data-v13';

interface StoredData {
  observations: Observation[];
  ideaCards: IdeaCard[];
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

function loadFromStorage(): StoredData {
  const hasUserKey = typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) !== null;
  try {
    const data = hasUserKey ? localStorage.getItem(STORAGE_KEY) : null;
    if (data) {
      const parsed = JSON.parse(data);
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

      // 尊重用户的空数组(主动清空),仅在首次访问(STORAGE_KEY 不存在)时回退到 mock
      const hasStorageKey = localStorage.getItem(STORAGE_KEY) !== null;
      const researchAreas: ResearchArea[] = hasStorageKey
        ? deduplicateById(rawResearchAreas.map(addDefaultAreaFields))
        : [...mockResearchAreas];
      const papers: Paper[] = hasStorageKey
        ? deduplicateById(rawPapers)
        : [...mockPapers];
      const observations: Observation[] = deduplicateById(rawObservations);
      const ideaCards: IdeaCard[] = deduplicateById(rawIdeaCards.map(addDefaultIdeaFields));
      const mves: MVE[] = deduplicateById(rawMves.map(addDefaultMVEFields));

      const result: StoredData = {
        observations,
        ideaCards,
        mves,
        researchAreas,
        papers,
      };

      const needsRepair =
        observations.length !== rawObservations.length ||
        ideaCards.length !== rawIdeaCards.length ||
        mves.length !== rawMves.length ||
        researchAreas.length !== rawResearchAreas.length ||
        papers.length !== rawPapers.length;

      if (needsRepair) {
        saveToStorage(result);
      }

      return result;
    }

    // 首次访问:无 STORAGE_KEY,加载 mock 数据并初始化
    const legacyData = localStorage.getItem('research-compass-data');
    if (legacyData) {
      const parsed = JSON.parse(legacyData);
      const migrated: StoredData = {
        observations: deduplicateById(((parsed.observations || []) as Observation[]).filter(o => o && o.id)),
        ideaCards: deduplicateById(((parsed.ideaCards || []) as any[]).filter(c => c && c.id).map(addDefaultIdeaFields)),
        mves: deduplicateById(((parsed.mves || []) as any[]).filter(m => m && m.id).map(addDefaultMVEFields)),
        researchAreas: [...mockResearchAreas].map(addDefaultAreaFields),
        papers: [...mockPapers],
      };
      saveToStorage(migrated);
      return migrated;
    }

    // 完全新用户:加载完整 mock 数据
    return {
      observations: [...mockObservations],
      ideaCards: [...mockIdeaCards],
      mves: [...mockMVEs],
      researchAreas: [...mockResearchAreas],
      papers: [...mockPapers],
    };
  } catch (e) {
    console.error('Failed to load from storage:', e);
    // 备份损坏的原始数据,以便用户后续恢复
    try {
      const rawData = localStorage.getItem(STORAGE_KEY);
      if (rawData) {
        localStorage.setItem(STORAGE_KEY + '-backup-' + Date.now(), rawData);
      }
    } catch {}
    // 返回空数据(observations/ideaCards/mves),避免 mock 覆盖用户可能可恢复的数据
    // researchAreas/papers 返回 mock 作为基础结构
    return {
      observations: [],
      ideaCards: [],
      mves: [],
      researchAreas: [...mockResearchAreas],
      papers: [...mockPapers],
    };
  }
}

function saveToStorage(data: StoredData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to storage:', e);
  }
}

export function initializeData(): StoredData {
  return loadFromStorage();
}

export function persistData(data: StoredData): void {
  saveToStorage(data);
}

export function resetDemoData(): StoredData {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem('research-compass-data');
  return loadFromStorage();
}

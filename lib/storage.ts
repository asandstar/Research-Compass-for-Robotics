import { Observation, IdeaCard, MVE, ResearchArea, Paper, LEGACY_STATUS_MAP } from './types';
import { mockObservations, mockIdeaCards, mockMVEs, mockResearchAreas, mockPapers } from './mockData';

const STORAGE_KEY = 'research-compass-data-v10';

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
    roboticsTask: mve.roboticsTask || '',
    datasetOrScenario: mve.datasetOrScenario || '',
    baseline: mve.baseline || '',
    evaluationMetric: mve.evaluationMetric || '',
    minimalComputeNeed: mve.minimalComputeNeed || '',
    expectedTimeCost: mve.expectedTimeCost || '',
  };
}

function deduplicateById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter(item => {
    if (seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
}

function loadFromStorage(): StoredData {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
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

      const researchAreas: ResearchArea[] = rawResearchAreas.length > 0
        ? deduplicateById(rawResearchAreas)
        : [...mockResearchAreas];
      const papers: Paper[] = rawPapers.length > 0
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

    const legacyData = localStorage.getItem('research-compass-data');
    if (legacyData) {
      const parsed = JSON.parse(legacyData);
      const migrated: StoredData = {
        observations: deduplicateById(((parsed.observations || []) as Observation[]).filter(o => o && o.id)),
        ideaCards: deduplicateById(((parsed.ideaCards || []) as any[]).filter(c => c && c.id).map(addDefaultIdeaFields)),
        mves: deduplicateById(((parsed.mves || []) as any[]).filter(m => m && m.id).map(addDefaultMVEFields)),
        researchAreas: [...mockResearchAreas],
        papers: [...mockPapers],
      };
      saveToStorage(migrated);
      return migrated;
    }
  } catch (e) {
    console.error('Failed to load from storage:', e);
  }
  return {
    observations: [...mockObservations],
    ideaCards: [...mockIdeaCards],
    mves: [...mockMVEs],
    researchAreas: [...mockResearchAreas],
    papers: [...mockPapers],
  };
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

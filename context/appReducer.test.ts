import { describe, it, expect } from 'vitest';
import { appReducer, AppState, deduplicateById } from './appReducer';
import type { IdeaCard, MVE, Paper, ResearchArea, IdeaRelationship, Evidence } from '../lib/types';

function createInitialState(overrides: Partial<AppState> = {}): AppState {
  return {
    observations: [],
    ideaCards: [],
    ideaRelationships: [],
    mves: [],
    researchAreas: [],
    papers: [],
    isAnalyzing: false,
    isGeneratingEvidence: false,
    isGeneratingMVE: false,
    isGeneratingSummary: false,
    isGeneratingIdeaFromPaper: false,
    isParsingArxiv: false,
    isInitialized: true,
    ...overrides,
  };
}

function createMockIdea(overrides: Partial<IdeaCard> = {}): IdeaCard {
  return {
    id: 'idea-1',
    title: 'Test Idea',
    status: 'active',
    researchQuestion: 'Q?',
    coreHypothesis: 'H',
    hypothesis: 'H',
    whyItMatters: 'Because',
    predictions: [],
    failureConditions: [],
    confounders: [],
    evidenceForHypothesis: [],
    evidenceAgainstHypothesis: [],
    falsificationRisks: [],
    biggestRisks: [],
    survivalScore: 50,
    confidenceScore: 50,
    falsificationStrength: 0,
    sourceObservations: [],
    sourcePaperIds: [],
    areaIds: [],
    roboticsTask: '',
    datasetOrScenario: '',
    baseline: '',
    evaluationMetric: '',
    nextAction: '',
    notes: '',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function createMockMVE(overrides: Partial<MVE> = {}): MVE {
  return {
    id: 'mve-1',
    ideaCardId: 'idea-1',
    mveType: 'sanity_check',
    experimentGoal: '',
    taskDefinition: '',
    evaluationProtocol: '',
    minimalDesign: '',
    keyVariables: { independent: '', dependent: '' },
    controlGroups: [],
    baselineReferences: [],
    successCriteria: '',
    failureModes: [],
    failureSignals: [],
    minimalEnvOrDataset: '',
    minimalEffort: '',
    nextTasks: { onPass: '', onFail: '' },
    roboticsTask: '',
    datasetOrScenario: '',
    baseline: '',
    evaluationMetric: '',
    minimalComputeNeed: '',
    expectedTimeCost: '',
    steps: [],
    dataRecords: [],
    resultStatus: 'pending',
    resultNotes: '',
    createdAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function createMockPaper(overrides: Partial<Paper> = {}): Paper {
  return {
    id: 'paper-1',
    title: 'Test Paper',
    authors: 'Author A',
    year: 2025,
    venue: 'ICRA',
    arxivUrl: '',
    pdfUrl: '',
    htmlUrl: '',
    feishuNoteUrl: '',
    codeUrl: '',
    areaIds: [],
    readingStatus: 'to_read',
    methodKeywords: [],
    oneSentenceSummary: '',
    problem: '',
    coreContribution: '',
    methodSketch: '',
    evidence: { tasks: [], baselines: [], metrics: [], keyResults: [] },
    assumptions: [],
    limitations: [],
    relevanceToMyResearch: '',
    questionsToVerify: [],
    limitationsOrQuestions: '',
    judgementLevel: 'background',
    inspiredIdeaIds: [],
    metadataStatus: 'manual',
    verificationStatus: 'unverified',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function createMockArea(overrides: Partial<ResearchArea> = {}): ResearchArea {
  return {
    id: 'area-1',
    name: 'Test Area',
    description: '',
    category: '感知',
    keywords: [],
    focusQuestions: [],
    isHidden: false,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('appReducer — ADD_EVIDENCE', () => {
  it('adds evidence and recalculates score', () => {
    const idea = createMockIdea({ id: 'idea-1', survivalScore: 50, confidenceScore: 50 });
    const state = createInitialState({ ideaCards: [idea] });

    const evidence: Evidence = { id: 'e1', content: 'supports', source: 'exp', isAIGenerated: false };
    const newState = appReducer(state, {
      type: 'ADD_EVIDENCE',
      payload: { ideaId: 'idea-1', evidenceType: 'evidenceForHypothesis', evidence },
    });

    const updatedIdea = newState.ideaCards.find(c => c.id === 'idea-1')!;
    expect(updatedIdea.evidenceForHypothesis).toHaveLength(1);
    expect(updatedIdea.confidenceScore).toBeGreaterThan(50);
    expect(updatedIdea.updatedAt).not.toBe('2025-01-01T00:00:00.000Z');
  });

  it('does not add duplicate evidence', () => {
    const evidence: Evidence = { id: 'e1', content: 'test', source: 'src', isAIGenerated: false };
    const idea = createMockIdea({ id: 'idea-1', evidenceForHypothesis: [evidence] });
    const state = createInitialState({ ideaCards: [idea] });

    const newState = appReducer(state, {
      type: 'ADD_EVIDENCE',
      payload: { ideaId: 'idea-1', evidenceType: 'evidenceForHypothesis', evidence },
    });

    expect(newState.ideaCards[0].evidenceForHypothesis).toHaveLength(1);
  });

  it('recalculates status after adding opposing evidence', () => {
    const idea = createMockIdea({
      id: 'idea-1',
      status: 'promising',
      survivalScore: 80,
      confidenceScore: 80,
    });
    const state = createInitialState({ ideaCards: [idea] });

    // Add multiple opposing evidence to push status down
    let newState = state;
    for (let i = 0; i < 5; i++) {
      newState = appReducer(newState, {
        type: 'ADD_EVIDENCE',
        payload: {
          ideaId: 'idea-1',
          evidenceType: 'evidenceAgainstHypothesis',
          evidence: { id: `against-${i}`, content: `against ${i}`, source: 'exp', isAIGenerated: false },
        },
      });
    }

    const updatedIdea = newState.ideaCards.find(c => c.id === 'idea-1')!;
    expect(updatedIdea.evidenceAgainstHypothesis).toHaveLength(5);
    expect(updatedIdea.survivalScore).toBeLessThan(80);
  });
});

describe('appReducer — UPDATE_IDEA_CARD', () => {
  it('recalculates falsificationStrength after adding failure conditions', () => {
    const idea = createMockIdea({ id: 'idea-1', failureConditions: [], falsificationStrength: 0 });
    const state = createInitialState({ ideaCards: [idea] });

    const updated = { ...idea, failureConditions: ['fail1', 'fail2', 'fail3'] };
    const newState = appReducer(state, { type: 'UPDATE_IDEA_CARD', payload: updated });

    expect(newState.ideaCards[0].failureConditions).toHaveLength(3);
    expect(newState.ideaCards[0].falsificationStrength).toBeGreaterThan(0);
  });

  it('recalculates confidenceScore after adding predictions', () => {
    const idea = createMockIdea({ id: 'idea-1', predictions: [], confidenceScore: 50 });
    const state = createInitialState({ ideaCards: [idea] });

    const updated = {
      ...idea,
      predictions: [
        { condition: 'X', expectedOutcome: 'Y' },
        { condition: 'A', expectedOutcome: 'B' },
      ],
    };
    const newState = appReducer(state, { type: 'UPDATE_IDEA_CARD', payload: updated });

    expect(newState.ideaCards[0].predictions).toHaveLength(2);
    expect(newState.ideaCards[0].confidenceScore).toBeGreaterThan(50);
  });

  it('updates status based on latest data', () => {
    const idea = createMockIdea({ id: 'idea-1', status: 'active' });
    const state = createInitialState({ ideaCards: [idea] });

    // 7 supporting evidence → survivalScore = 50 + 7*3 = 71 >= 70
    const updated = {
      ...idea,
      evidenceForHypothesis: Array.from({ length: 7 }, (_, i) => ({
        id: `e${i}`, content: `evidence ${i}`, source: 's', isAIGenerated: false,
      })),
    };
    const newState = appReducer(state, { type: 'UPDATE_IDEA_CARD', payload: updated });

    expect(newState.ideaCards[0].status).toBe('promising');
  });
});

describe('appReducer — CREATE_MVE', () => {
  it('adds MVE without forcing Idea status to active', () => {
    // Set up idea with enough evidence to be 'promising' after recalculation
    // 7 supporting evidence → survivalScore = 50 + 7*3 = 71 >= 70
    const idea = createMockIdea({
      id: 'idea-1',
      status: 'promising',
      survivalScore: 71,
      evidenceForHypothesis: Array.from({ length: 7 }, (_, i) => ({
        id: `e${i}`, content: `evidence ${i}`, source: 's', isAIGenerated: false,
      })),
    });
    const state = createInitialState({ ideaCards: [idea] });

    const newMve = createMockMVE({ id: 'mve-new', ideaCardId: 'idea-1', resultStatus: 'pending' });
    const newState = appReducer(state, { type: 'CREATE_MVE', payload: newMve });

    expect(newState.mves).toHaveLength(1);
    expect(newState.mves[0].id).toBe('mve-new');
    // Status should come from calculation, not be forced to 'active'
    const updatedIdea = newState.ideaCards.find(c => c.id === 'idea-1')!;
    // With 7 evidence and pending MVE: survivalScore = 50 + 7*3 = 71, confidenceScore high
    expect(updatedIdea.status).toBe('promising');
    expect(updatedIdea.survivalScore).toBe(71); // pending MVE doesn't change score
  });

  it('pending MVE does not increase Survival Score', () => {
    const idea = createMockIdea({ id: 'idea-1', survivalScore: 50 });
    const state = createInitialState({ ideaCards: [idea] });

    const newMve = createMockMVE({ id: 'mve-1', ideaCardId: 'idea-1', resultStatus: 'pending' });
    const newState = appReducer(state, { type: 'CREATE_MVE', payload: newMve });

    const updatedIdea = newState.ideaCards.find(c => c.id === 'idea-1')!;
    expect(updatedIdea.survivalScore).toBe(50);
  });
});

describe('appReducer — UPDATE_MVE_RESULT', () => {
  it('recalculates Idea after MVE changes to passed', () => {
    const idea = createMockIdea({ id: 'idea-1', survivalScore: 50 });
    const mve = createMockMVE({ id: 'mve-1', ideaCardId: 'idea-1', resultStatus: 'pending' });
    const state = createInitialState({ ideaCards: [idea], mves: [mve] });

    const newState = appReducer(state, {
      type: 'UPDATE_MVE_RESULT',
      payload: { id: 'mve-1', resultStatus: 'passed', resultNotes: 'passed' },
    });

    const updatedIdea = newState.ideaCards.find(c => c.id === 'idea-1')!;
    expect(updatedIdea.survivalScore).toBeGreaterThan(50);
  });

  it('recalculates Idea after MVE changes to failed', () => {
    const idea = createMockIdea({ id: 'idea-1', survivalScore: 60 });
    const mve = createMockMVE({ id: 'mve-1', ideaCardId: 'idea-1', resultStatus: 'pending' });
    const state = createInitialState({ ideaCards: [idea], mves: [mve] });

    const newState = appReducer(state, {
      type: 'UPDATE_MVE_RESULT',
      payload: { id: 'mve-1', resultStatus: 'failed', resultNotes: 'failed' },
    });

    const updatedIdea = newState.ideaCards.find(c => c.id === 'idea-1')!;
    expect(updatedIdea.survivalScore).toBeLessThan(60);
  });

  it('updates MVE resultNotes', () => {
    const mve = createMockMVE({ id: 'mve-1', ideaCardId: 'idea-1', resultStatus: 'pending' });
    const state = createInitialState({ ideaCards: [createMockIdea()], mves: [mve] });

    const newState = appReducer(state, {
      type: 'UPDATE_MVE_RESULT',
      payload: { id: 'mve-1', resultStatus: 'passed', resultNotes: 'Great success' },
    });

    expect(newState.mves[0].resultNotes).toBe('Great success');
    expect(newState.mves[0].resultStatus).toBe('passed');
  });
});

describe('appReducer — DELETE_PAPER cascade', () => {
  it('removes paper and cleans Idea.sourcePaperIds', () => {
    const paper = createMockPaper({ id: 'paper-1' });
    const idea = createMockIdea({ id: 'idea-1', sourcePaperIds: ['paper-1', 'paper-2'] });
    const state = createInitialState({ papers: [paper], ideaCards: [idea] });

    const newState = appReducer(state, { type: 'DELETE_PAPER', payload: 'paper-1' });

    expect(newState.papers).toHaveLength(0);
    expect(newState.ideaCards[0].sourcePaperIds).toEqual(['paper-2']);
  });
});

describe('appReducer — DELETE_IDEA_CARD cascade', () => {
  it('removes idea, MVEs, relationships, and cleans Paper.inspiredIdeaIds', () => {
    const idea = createMockIdea({ id: 'idea-1' });
    const mve = createMockMVE({ id: 'mve-1', ideaCardId: 'idea-1' });
    const rel: IdeaRelationship = {
      id: 'rel-1', sourceId: 'idea-1', targetId: 'idea-2',
      relationshipType: 'refines', createdAt: '',
    };
    const paper = createMockPaper({ id: 'paper-1', inspiredIdeaIds: ['idea-1', 'idea-2'] });
    const state = createInitialState({
      ideaCards: [idea],
      mves: [mve],
      ideaRelationships: [rel],
      papers: [paper],
    });

    const newState = appReducer(state, { type: 'DELETE_IDEA_CARD', payload: 'idea-1' });

    expect(newState.ideaCards).toHaveLength(0);
    expect(newState.mves).toHaveLength(0);
    expect(newState.ideaRelationships).toHaveLength(0);
    expect(newState.papers[0].inspiredIdeaIds).toEqual(['idea-2']);
  });
});

describe('appReducer — DELETE_AREA cascade', () => {
  it('hides area and cleans references from Papers and Ideas', () => {
    const area = createMockArea({ id: 'area-1' });
    const paper = createMockPaper({ id: 'paper-1', areaIds: ['area-1', 'area-2'] });
    const idea = createMockIdea({ id: 'idea-1', areaIds: ['area-1', 'area-2'] });
    const state = createInitialState({
      researchAreas: [area],
      papers: [paper],
      ideaCards: [idea],
    });

    const newState = appReducer(state, { type: 'DELETE_AREA', payload: 'area-1' });

    expect(newState.researchAreas[0].isHidden).toBe(true);
    expect(newState.papers[0].areaIds).toEqual(['area-2']);
    expect(newState.ideaCards[0].areaIds).toEqual(['area-2']);
  });
});

describe('deduplicateById', () => {
  it('removes items with duplicate ids', () => {
    const items = [
      { id: '1', name: 'a' },
      { id: '2', name: 'b' },
      { id: '1', name: 'c' },
    ];
    const result = deduplicateById(items);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('a');
    expect(result[1].name).toBe('b');
  });
});

import { describe, it, expect } from 'vitest';
import {
  calculateSurvivalScore,
  calculateConfidenceScore,
  calculateFalsificationStrength,
  calculateIdeaStatus,
  updateIdeaCardWithCalculatedState,
  getLatestMVE,
  getLatestCompletedMVE,
  getNextPendingMVE,
} from './stateCalculator';
import type { IdeaCard, MVE } from './types';

function createMockIdea(overrides: Partial<IdeaCard> = {}): IdeaCard {
  return {
    id: 'idea-1',
    title: 'Test Idea',
    status: 'active',
    researchQuestion: 'Test question?',
    coreHypothesis: 'Test hypothesis',
    hypothesis: 'Test hypothesis',
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
    experimentGoal: 'Test goal',
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

describe('calculateSurvivalScore', () => {
  it('pending MVE does not increase survival score', () => {
    const idea = createMockIdea();
    const mves = [createMockMVE({ resultStatus: 'pending' })];
    const scoreWithPending = calculateSurvivalScore(idea, mves);
    const scoreWithout = calculateSurvivalScore(idea, []);
    expect(scoreWithPending).toBe(scoreWithout);
  });

  it('passed MVE increases survival score', () => {
    const idea = createMockIdea();
    const mves = [createMockMVE({ resultStatus: 'passed' })];
    const score = calculateSurvivalScore(idea, mves);
    expect(score).toBeGreaterThan(50);
  });

  it('failed MVE decreases survival score', () => {
    const idea = createMockIdea();
    const mves = [createMockMVE({ resultStatus: 'failed' })];
    const score = calculateSurvivalScore(idea, mves);
    expect(score).toBeLessThan(50);
  });

  it('supporting evidence increases score', () => {
    const idea = createMockIdea({
      evidenceForHypothesis: [
        { id: 'e1', content: 'test', source: 'paper', isAIGenerated: false },
        { id: 'e2', content: 'test2', source: 'paper', isAIGenerated: false },
      ],
    });
    const score = calculateSurvivalScore(idea, []);
    expect(score).toBeGreaterThan(50);
  });
});

describe('calculateConfidenceScore', () => {
  it('high falsification strength with zero evidence does not push score near 100', () => {
    const idea = createMockIdea({
      failureConditions: ['fail1', 'fail2'],
      confounders: ['c1', 'c2'],
      predictions: [{ condition: 'X', expectedOutcome: 'Y' }],
      evidenceAgainstHypothesis: [
        { id: 'e1', content: 'against', source: 'exp', isAIGenerated: false },
      ],
      evidenceForHypothesis: [],
    });
    const falsStrength = calculateFalsificationStrength(idea);
    expect(falsStrength).toBeGreaterThan(50);

    const confidence = calculateConfidenceScore({ ...idea, falsificationStrength: falsStrength });
    expect(confidence).toBeLessThan(80);
    expect(confidence).toBeLessThan(50 + 10 + 10 + 10 + falsStrength * 0.1 + 1);
  });

  it('more evidence ratio increases confidence', () => {
    const ideaLow = createMockIdea({
      evidenceForHypothesis: [
        { id: 'e1', content: 'a', source: 'x', isAIGenerated: false },
      ],
      evidenceAgainstHypothesis: [
        { id: 'e2', content: 'b', source: 'y', isAIGenerated: false },
        { id: 'e3', content: 'c', source: 'z', isAIGenerated: false },
      ],
    });
    const ideaHigh = createMockIdea({
      evidenceForHypothesis: [
        { id: 'e1', content: 'a', source: 'x', isAIGenerated: false },
        { id: 'e2', content: 'b', source: 'y', isAIGenerated: false },
        { id: 'e3', content: 'c', source: 'z', isAIGenerated: false },
      ],
      evidenceAgainstHypothesis: [],
    });
    const scoreLow = calculateConfidenceScore(ideaLow);
    const scoreHigh = calculateConfidenceScore(ideaHigh);
    expect(scoreHigh).toBeGreaterThan(scoreLow);
  });
});

describe('calculateFalsificationStrength', () => {
  it('zero when no falsification elements', () => {
    const idea = createMockIdea();
    expect(calculateFalsificationStrength(idea)).toBe(0);
  });

  it('increases with failure conditions', () => {
    const idea = createMockIdea({ failureConditions: ['f1'] });
    expect(calculateFalsificationStrength(idea)).toBe(30);
  });

  it('reaches 100 with all four elements', () => {
    const idea = createMockIdea({
      failureConditions: ['f1'],
      confounders: ['c1'],
      predictions: [{ condition: 'X', expectedOutcome: 'Y' }],
      evidenceAgainstHypothesis: [
        { id: 'e1', content: 'a', source: 'x', isAIGenerated: false },
      ],
    });
    expect(calculateFalsificationStrength(idea)).toBe(100);
  });
});

describe('getLatestMVE', () => {
  it('returns null when no MVEs', () => {
    expect(getLatestMVE('idea-1', [])).toBeNull();
  });

  it('returns newest by createdAt regardless of array order', () => {
    const mves = [
      createMockMVE({ id: 'mve-old', createdAt: '2025-01-01T00:00:00.000Z' }),
      createMockMVE({ id: 'mve-new', createdAt: '2025-06-01T00:00:00.000Z' }),
    ];
    const latest = getLatestMVE('idea-1', mves);
    expect(latest!.id).toBe('mve-new');
  });

  it('returns newest even when array is in reverse order', () => {
    const mves = [
      createMockMVE({ id: 'mve-new', createdAt: '2025-06-01T00:00:00.000Z' }),
      createMockMVE({ id: 'mve-old', createdAt: '2025-01-01T00:00:00.000Z' }),
    ];
    const latest = getLatestMVE('idea-1', mves);
    expect(latest!.id).toBe('mve-new');
  });

  it('only considers MVEs for the specified idea', () => {
    const mves = [
      createMockMVE({ id: 'mve-other', ideaCardId: 'idea-2', createdAt: '2025-06-01T00:00:00.000Z' }),
      createMockMVE({ id: 'mve-ours', ideaCardId: 'idea-1', createdAt: '2025-01-01T00:00:00.000Z' }),
    ];
    const latest = getLatestMVE('idea-1', mves);
    expect(latest!.id).toBe('mve-ours');
  });
});

describe('getLatestCompletedMVE', () => {
  it('returns null with only pending MVEs', () => {
    const mves = [createMockMVE({ resultStatus: 'pending' })];
    expect(getLatestCompletedMVE('idea-1', mves)).toBeNull();
  });

  it('returns latest passed MVE when both passed and failed exist', () => {
    const mves = [
      createMockMVE({ id: 'failed-old', resultStatus: 'failed', createdAt: '2025-01-01T00:00:00.000Z' }),
      createMockMVE({ id: 'passed-new', resultStatus: 'passed', createdAt: '2025-06-01T00:00:00.000Z' }),
    ];
    const latest = getLatestCompletedMVE('idea-1', mves);
    expect(latest!.id).toBe('passed-new');
  });
});

describe('getNextPendingMVE', () => {
  it('returns null when no pending MVEs', () => {
    const mves = [createMockMVE({ resultStatus: 'passed' })];
    expect(getNextPendingMVE('idea-1', mves)).toBeNull();
  });

  it('returns earliest pending MVE (oldest first)', () => {
    const mves = [
      createMockMVE({ id: 'mve-new', resultStatus: 'pending', createdAt: '2025-06-01T00:00:00.000Z' }),
      createMockMVE({ id: 'mve-old', resultStatus: 'pending', createdAt: '2025-01-01T00:00:00.000Z' }),
    ];
    const next = getNextPendingMVE('idea-1', mves);
    expect(next!.id).toBe('mve-old');
  });
});

describe('updateIdeaCardWithCalculatedState', () => {
  it('recalculates all scores and status', () => {
    const idea = createMockIdea({
      failureConditions: ['f1'],
      predictions: [{ condition: 'X', expectedOutcome: 'Y' }],
      evidenceForHypothesis: [
        { id: 'e1', content: 'test', source: 'paper', isAIGenerated: false },
        { id: 'e2', content: 'test2', source: 'paper', isAIGenerated: false },
        { id: 'e3', content: 'test3', source: 'paper', isAIGenerated: false },
      ],
    });
    const mves = [createMockMVE({ resultStatus: 'passed' })];
    const updated = updateIdeaCardWithCalculatedState(idea, mves);
    expect(updated.falsificationStrength).toBeGreaterThan(0);
    expect(updated.survivalScore).toBeGreaterThan(50);
    expect(updated.confidenceScore).toBeGreaterThan(50);
    expect(updated.updatedAt).not.toBe(idea.updatedAt);
  });

  it('status is not forced to active after creating MVE', () => {
    const idea = createMockIdea({
      status: 'promising',
      evidenceForHypothesis: [
        { id: 'e1', content: 'a', source: 'x', isAIGenerated: false },
        { id: 'e2', content: 'b', source: 'y', isAIGenerated: false },
        { id: 'e3', content: 'c', source: 'z', isAIGenerated: false },
        { id: 'e4', content: 'd', source: 'w', isAIGenerated: false },
        { id: 'e5', content: 'e', source: 'v', isAIGenerated: false },
      ],
    });
    const mves = [
      createMockMVE({ id: 'm1', resultStatus: 'passed', createdAt: '2025-01-01T00:00:00.000Z' }),
      createMockMVE({ id: 'm2', resultStatus: 'passed', createdAt: '2025-02-01T00:00:00.000Z' }),
    ];
    const updated = updateIdeaCardWithCalculatedState(idea, mves);
    expect(updated.survivalScore).toBeGreaterThanOrEqual(70);
    expect(updated.status).not.toBe('active');
  });
});

describe('calculateIdeaStatus', () => {
  it('returns promising when survival >= 70 and confidence >= 60', () => {
    const idea = createMockIdea({ survivalScore: 75, confidenceScore: 65 });
    expect(calculateIdeaStatus(idea)).toBe('promising');
  });

  it('returns rejected when survival < 20', () => {
    const idea = createMockIdea({ survivalScore: 10, confidenceScore: 50 });
    expect(calculateIdeaStatus(idea)).toBe('rejected');
  });

  it('returns unstable when survival < 50 or confidence < 30', () => {
    const idea = createMockIdea({ survivalScore: 40, confidenceScore: 45 });
    expect(calculateIdeaStatus(idea)).toBe('unstable');
  });
});

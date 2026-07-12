import { describe, it, expect } from 'vitest';
import { normalizeStoredData, formatRepairReport, createEmptyReport, detectLegacyMockPaper } from './storage';
import type { IdeaCard, MVE, Paper, ResearchArea, IdeaRelationship } from './types';

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

describe('normalizeStoredData', () => {
  it('returns valid data for empty input', () => {
    const { data } = normalizeStoredData({});
    expect(data.observations).toEqual([]);
    expect(data.ideaCards).toEqual([]);
    expect(data.mves).toEqual([]);
    expect(data.researchAreas).toEqual([]);
    expect(data.papers).toEqual([]);
    expect(Array.isArray(data.observations)).toBe(true);
    expect(Array.isArray(data.ideaCards)).toBe(true);
  });

  it('removes orphan MVEs (ideaCardId does not exist)', () => {
    const raw = {
      ideaCards: [createMockIdea({ id: 'idea-exists' })],
      mves: [
        createMockMVE({ id: 'mve-orphan', ideaCardId: 'idea-nonexistent' }),
        createMockMVE({ id: 'mve-valid', ideaCardId: 'idea-exists' }),
      ],
      papers: [],
      researchAreas: [],
      observations: [],
      ideaRelationships: [],
    };
    const { data, report } = normalizeStoredData(raw);
    expect(data.mves).toHaveLength(1);
    expect(data.mves[0].id).toBe('mve-valid');
    expect(report.removedOrphanMves).toBe(1);
  });

  it('removes invalid idea relationships', () => {
    const raw = {
      ideaCards: [
        createMockIdea({ id: 'idea-a' }),
        createMockIdea({ id: 'idea-b' }),
      ],
      ideaRelationships: [
        { id: 'rel-1', sourceId: 'idea-a', targetId: 'idea-b', relationshipType: 'refines' as const, createdAt: '' },
        { id: 'rel-2', sourceId: 'idea-a', targetId: 'idea-nonexistent', relationshipType: 'refines' as const, createdAt: '' },
        { id: 'rel-3', sourceId: 'idea-nonexistent', targetId: 'idea-b', relationshipType: 'refines' as const, createdAt: '' },
      ] as IdeaRelationship[],
      mves: [],
      papers: [],
      researchAreas: [],
      observations: [],
    };
    const { data, report } = normalizeStoredData(raw);
    expect(data.ideaRelationships).toHaveLength(1);
    expect(report.removedInvalidRelationships).toBe(2);
  });

  it('removes invalid paper references from Idea.sourcePaperIds', () => {
    const raw = {
      ideaCards: [
        createMockIdea({ id: 'idea-1', sourcePaperIds: ['paper-exists', 'paper-missing'] }),
      ],
      papers: [createMockPaper({ id: 'paper-exists' })],
      researchAreas: [],
      mves: [],
      observations: [],
      ideaRelationships: [],
    };
    const { data, report } = normalizeStoredData(raw);
    expect(data.ideaCards[0].sourcePaperIds).toEqual(['paper-exists']);
    expect(report.removedInvalidPaperReferences).toBeGreaterThanOrEqual(1);
  });

  it('removes invalid area references from Ideas and Papers', () => {
    const raw = {
      researchAreas: [createMockArea({ id: 'area-exists' })],
      ideaCards: [
        createMockIdea({ id: 'idea-1', areaIds: ['area-exists', 'area-missing'] }),
      ],
      papers: [
        createMockPaper({ id: 'paper-1', areaIds: ['area-exists', 'area-missing'] }),
      ],
      mves: [],
      observations: [],
      ideaRelationships: [],
    };
    const { data, report } = normalizeStoredData(raw);
    expect(data.ideaCards[0].areaIds).toEqual(['area-exists']);
    expect(data.papers[0].areaIds).toEqual(['area-exists']);
    expect(report.removedInvalidAreaReferences).toBeGreaterThanOrEqual(2);
  });

  it('removes invalid inspiredIdeaIds from papers', () => {
    const raw = {
      ideaCards: [createMockIdea({ id: 'idea-exists' })],
      papers: [
        createMockPaper({ id: 'paper-1', inspiredIdeaIds: ['idea-exists', 'idea-missing'] }),
      ],
      researchAreas: [],
      mves: [],
      observations: [],
      ideaRelationships: [],
    };
    const { data } = normalizeStoredData(raw);
    expect(data.papers[0].inspiredIdeaIds).toEqual(['idea-exists']);
  });

  it('adds default metadataStatus to old papers', () => {
    const raw = {
      papers: [
        {
          id: 'old-paper',
          title: 'Old Paper',
          authors: 'A',
          year: 2024,
          venue: '',
          arxivUrl: '',
          pdfUrl: '',
          htmlUrl: '',
          feishuNoteUrl: '',
          codeUrl: '',
          readingStatus: 'to_read' as const,
          oneSentenceSummary: '',
          problem: '',
          coreContribution: '',
          methodSketch: '',
          limitationsOrQuestions: '',
          judgementLevel: 'background' as const,
          // missing metadataStatus, verificationStatus, etc.
        },
      ],
      researchAreas: [],
      ideaCards: [],
      mves: [],
      observations: [],
      ideaRelationships: [],
    };
    const { data, report } = normalizeStoredData(raw);
    expect(data.papers[0].metadataStatus).toBe('manual');
    expect(data.papers[0].verificationStatus).toBe('unverified');
    expect(report.addedPaperMetadataStatus).toBeGreaterThanOrEqual(1);
  });

  it('recalculates idea scores after normalization', () => {
    const idea = createMockIdea({
      id: 'idea-1',
      survivalScore: 0,
      confidenceScore: 0,
      falsificationStrength: 0,
      evidenceForHypothesis: [
        { id: 'e1', content: 'a', source: 'x', isAIGenerated: false },
        { id: 'e2', content: 'b', source: 'y', isAIGenerated: false },
        { id: 'e3', content: 'c', source: 'z', isAIGenerated: false },
      ],
    });
    const raw = {
      ideaCards: [idea],
      mves: [createMockMVE({ id: 'm1', resultStatus: 'passed' })],
      papers: [],
      researchAreas: [],
      observations: [],
      ideaRelationships: [],
    };
    const { data } = normalizeStoredData(raw);
    expect(data.ideaCards[0].survivalScore).toBeGreaterThan(50);
    expect(data.ideaCards[0].confidenceScore).toBeGreaterThan(50);
    expect(data.ideaCards[0].falsificationStrength).toBeGreaterThanOrEqual(0);
  });

  it('handles completely valid data with no repairs', () => {
    const area = createMockArea({ id: 'area-1' });
    const paper = createMockPaper({ id: 'paper-1', areaIds: ['area-1'] });
    const idea = createMockIdea({ id: 'idea-1', sourcePaperIds: ['paper-1'], areaIds: ['area-1'] });
    const mve = createMockMVE({ id: 'mve-1', ideaCardId: 'idea-1' });

    const raw = {
      researchAreas: [area],
      papers: [paper],
      ideaCards: [idea],
      mves: [mve],
      observations: [],
      ideaRelationships: [],
    };

    const { report } = normalizeStoredData(raw);
    // Score recalculation doesn't count as repair, but default fields might if types are off
    // The key is no duplicate/orphan/invalid reference fixes
    expect(report.removedDuplicateIds).toBe(0);
    expect(report.removedOrphanMves).toBe(0);
    expect(report.removedInvalidRelationships).toBe(0);
  });

  it('de-duplicates by id', () => {
    const raw = {
      ideaCards: [
        createMockIdea({ id: 'dup-idea' }),
        createMockIdea({ id: 'dup-idea', title: 'Second copy' }),
      ],
      papers: [],
      researchAreas: [],
      mves: [],
      observations: [],
      ideaRelationships: [],
    };
    const { data, report } = normalizeStoredData(raw);
    expect(data.ideaCards).toHaveLength(1);
    expect(report.removedDuplicateIds).toBeGreaterThanOrEqual(1);
  });
});

describe('formatRepairReport', () => {
  it('returns empty string for empty report', () => {
    expect(formatRepairReport(createEmptyReport())).toBe('');
  });

  it('includes non-zero items', () => {
    const msg = formatRepairReport({
      ...createEmptyReport(),
      removedDuplicateIds: 3,
      removedOrphanMves: 2,
    });
    expect(msg).toContain('3');
    expect(msg).toContain('2');
    expect(msg).toContain('重复');
    expect(msg).toContain('孤立');
  });
});

describe('detectLegacyMockPaper', () => {
  it('detects known legacy mock title with matching key results', () => {
    const paper: Partial<Paper> = {
      title: 'Vision-Language-Action Models via Hierarchical Decoding',
      evidence: {
        tasks: [],
        baselines: [],
        metrics: [],
        keyResults: ['性能提升15-20%', '推理速度提升2-3倍', '泛化能力增强'],
      },
    };
    expect(detectLegacyMockPaper(paper)).toBe(true);
  });

  it('does not flag paper with known title but different key results', () => {
    const paper: Partial<Paper> = {
      title: 'Vision-Language-Action Models via Hierarchical Decoding',
      evidence: {
        tasks: [],
        baselines: [],
        metrics: [],
        keyResults: ['actual result 1', 'actual result 2'],
      },
    };
    expect(detectLegacyMockPaper(paper)).toBe(false);
  });

  it('does not flag manually entered paper with unknown title', () => {
    const paper: Partial<Paper> = {
      title: 'My Custom Research Paper',
      evidence: {
        tasks: [],
        baselines: [],
        metrics: [],
        keyResults: ['性能提升15-20%', '推理速度提升2-3倍', '泛化能力增强'],
      },
    };
    expect(detectLegacyMockPaper(paper)).toBe(false);
  });

  it('does not flag paper with no evidence', () => {
    const paper: Partial<Paper> = {
      title: 'Vision-Language-Action Models via Hierarchical Decoding',
    };
    expect(detectLegacyMockPaper(paper)).toBe(false);
  });
});

describe('normalizeStoredData — legacy mock migration', () => {
  it('marks legacy mock papers with dataProvenance = legacy_mock', () => {
    const raw = {
      papers: [{
        id: 'p1',
        title: 'Diffusion Policy for Robotic Manipulation',
        authors: 'Author',
        year: 2024,
        venue: 'ICRA',
        evidence: {
          tasks: [],
          baselines: [],
          metrics: [],
          keyResults: ['性能提升15-20%', '推理速度提升2-3倍', '泛化能力增强'],
        },
      }],
      researchAreas: [],
      ideaCards: [],
      mves: [],
      observations: [],
      ideaRelationships: [],
    };
    const { data, report } = normalizeStoredData(raw);
    expect(data.papers[0].dataProvenance).toBe('legacy_mock');
    expect(data.papers[0].metadataStatus).toBe('unavailable');
    expect(report.detectedLegacyMock).toBe(1);
  });

  it('does not delete content from legacy mock papers', () => {
    const raw = {
      papers: [{
        id: 'p1',
        title: 'Diffusion Policy for Robotic Manipulation',
        authors: 'Author',
        year: 2024,
        venue: 'ICRA',
        oneSentenceSummary: 'test summary',
        coreContribution: 'test contribution',
        evidence: {
          tasks: ['task1'],
          baselines: ['baseline1'],
          metrics: ['metric1'],
          keyResults: ['性能提升15-20%', '推理速度提升2-3倍', '泛化能力增强'],
        },
      }],
      researchAreas: [],
      ideaCards: [],
      mves: [],
      observations: [],
      ideaRelationships: [],
    };
    const { data } = normalizeStoredData(raw);
    expect(data.papers[0].title).toBe('Diffusion Policy for Robotic Manipulation');
    expect(data.papers[0].oneSentenceSummary).toBe('test summary');
    expect(data.papers[0].evidence.keyResults).toHaveLength(3);
  });

  it('produces consistent results on repeated migration', () => {
    const raw = {
      papers: [{
        id: 'p1',
        title: 'Diffusion Policy for Robotic Manipulation',
        authors: 'A',
        year: 2024,
        venue: '',
        evidence: { tasks: [], baselines: [], metrics: [], keyResults: ['性能提升15-20%', '推理速度提升2-3倍', '泛化能力增强'] },
      }],
      researchAreas: [],
      ideaCards: [],
      mves: [],
      observations: [],
      ideaRelationships: [],
    };
    const first = normalizeStoredData(raw);
    const second = normalizeStoredData(first.data);
    expect(second.data.papers[0].dataProvenance).toBe('legacy_mock');
    expect(second.report.detectedLegacyMock).toBe(1);
  });

  it('does not flag normal manual papers as legacy_mock', () => {
    const raw = {
      papers: [{
        id: 'p1',
        title: 'My Real Research',
        authors: 'Me',
        year: 2025,
        venue: 'ICRA',
        evidence: { tasks: [], baselines: [], metrics: [], keyResults: ['custom result'] },
      }],
      researchAreas: [],
      ideaCards: [],
      mves: [],
      observations: [],
      ideaRelationships: [],
    };
    const { data, report } = normalizeStoredData(raw);
    expect(data.papers[0].dataProvenance).not.toBe('legacy_mock');
    expect(report.detectedLegacyMock).toBe(0);
  });
});

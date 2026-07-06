'use client';

import { createContext, useContext, useReducer, useEffect, useRef, useCallback, ReactNode } from 'react';
import { Observation, IdeaCard, MVE, ResearchArea, Paper, Evidence, Prediction, AdversarialReview, IdeaRelationship, FailureAnalysis, FailureMode } from '../lib/types';
import { initializeData, persistData, resetDemoData } from '../lib/storage';
import {
  mockAnalyzeObservation,
  mockGenerateIdeaEvidence,
  mockGenerateMVE,
  mockGenerateOneSentenceSummary,
  mockGenerateIdeaFromPaper,
  mockGenerateRoboticsMVE,
  mockFetchArxivPaper,
  mockExtractAssumptions,
  mockExtractGaps,
  mockEvaluateIdea,
  mockGenerateAdversarialReview,
  mockAnalyzeFailure,
} from '../lib/mockAI';
import { calculateIdeaState, updateIdeaCardWithCalculatedState } from '../lib/stateCalculator';

interface AppState {
  observations: Observation[];
  ideaCards: IdeaCard[];
  ideaRelationships: IdeaRelationship[];
  mves: MVE[];
  researchAreas: ResearchArea[];
  papers: Paper[];
  isAnalyzing: boolean;
  isGeneratingEvidence: boolean;
  isGeneratingMVE: boolean;
  isGeneratingSummary: boolean;
  isGeneratingIdeaFromPaper: boolean;
  isParsingArxiv: boolean;
  isInitialized: boolean;
}

type Action =
  | { type: 'INIT_DATA'; payload: { observations: Observation[]; ideaCards: IdeaCard[]; ideaRelationships: IdeaRelationship[]; mves: MVE[]; researchAreas: ResearchArea[]; papers: Paper[] } }
  | { type: 'ADD_OBSERVATION'; payload: Observation }
  | { type: 'CREATE_IDEA_CARD'; payload: IdeaCard }
  | { type: 'UPDATE_IDEA_CARD'; payload: IdeaCard }
  | { type: 'UPDATE_IDEA_CALCULATED_STATE'; payload: IdeaCard }
  | { type: 'DELETE_IDEA_CARD'; payload: string }
  | { type: 'ADD_EVIDENCE'; payload: { ideaId: string; evidenceType: 'evidenceForHypothesis' | 'evidenceAgainstHypothesis' | 'falsificationRisks'; evidence: Evidence } }
  | { type: 'ADD_IDEA_RELATIONSHIP'; payload: IdeaRelationship }
  | { type: 'REMOVE_IDEA_RELATIONSHIP'; payload: string }
  | { type: 'CREATE_MVE'; payload: MVE }
  | { type: 'UPDATE_MVE_RESULT'; payload: { id: string; resultStatus: MVE['resultStatus']; resultNotes: string; failureAnalysis?: FailureAnalysis } }
  | { type: 'UPDATE_MVE_STEPS'; payload: { id: string; steps: MVE['steps'] } }
  | { type: 'UPDATE_MVE_DATA_RECORDS'; payload: { id: string; dataRecords: MVE['dataRecords'] } }
  | { type: 'ADD_RESEARCH_AREA'; payload: ResearchArea }
  | { type: 'UPDATE_RESEARCH_AREA'; payload: ResearchArea }
  | { type: 'DELETE_AREA'; payload: string }
  | { type: 'ADD_PAPER'; payload: Paper }
  | { type: 'UPDATE_PAPER'; payload: Paper }
  | { type: 'DELETE_PAPER'; payload: string }
  | { type: 'RESET_DATA'; payload: AppState }
  | { type: 'SET_ANALYZING'; payload: boolean }
  | { type: 'SET_GENERATING_EVIDENCE'; payload: boolean }
  | { type: 'SET_GENERATING_MVE'; payload: boolean }
  | { type: 'SET_GENERATING_SUMMARY'; payload: boolean }
  | { type: 'SET_GENERATING_IDEA_FROM_PAPER'; payload: boolean }
  | { type: 'SET_PARSING_ARXIV'; payload: boolean };

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function deduplicateById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'INIT_DATA':
      return {
        ...state,
        observations: deduplicateById(action.payload.observations),
        ideaCards: deduplicateById(action.payload.ideaCards),
        ideaRelationships: deduplicateById(action.payload.ideaRelationships || []),
        mves: deduplicateById(action.payload.mves),
        researchAreas: deduplicateById(action.payload.researchAreas),
        papers: deduplicateById(action.payload.papers),
        isInitialized: true,
      };
    case 'ADD_OBSERVATION':
      return { ...state, observations: deduplicateById([action.payload, ...state.observations]) };
    case 'CREATE_IDEA_CARD': {
      const newCard = action.payload;
      const updatedPapers = state.papers.map(paper => {
        if (newCard.sourcePaperIds.includes(paper.id)) {
          if (!paper.inspiredIdeaIds.includes(newCard.id)) {
            return {
              ...paper,
              inspiredIdeaIds: [...paper.inspiredIdeaIds, newCard.id],
              updatedAt: new Date().toISOString(),
            };
          }
        }
        return paper;
      });
      return { 
        ...state, 
        ideaCards: deduplicateById([newCard, ...state.ideaCards]), 
        papers: deduplicateById(updatedPapers) 
      };
    }
    case 'UPDATE_IDEA_CARD':
      return {
        ...state,
        ideaCards: deduplicateById(state.ideaCards.map(card =>
          card.id === action.payload.id ? action.payload : card
        )),
      };
    case 'UPDATE_IDEA_CALCULATED_STATE':
      return {
        ...state,
        ideaCards: deduplicateById(state.ideaCards.map(card =>
          card.id === action.payload.id ? action.payload : card
        )),
      };
    case 'DELETE_IDEA_CARD': {
      const targetId = action.payload;
      return {
        ...state,
        ideaCards: state.ideaCards.filter(card => card.id !== targetId),
        ideaRelationships: state.ideaRelationships.filter(
          r => r.sourceId !== targetId && r.targetId !== targetId
        ),
        mves: state.mves.filter(m => m.ideaCardId !== targetId),
        papers: state.papers.map(p => ({
          ...p,
          inspiredIdeaIds: p.inspiredIdeaIds.filter(iid => iid !== targetId),
        })),
      };
    }
    case 'ADD_EVIDENCE': {
      const { ideaId, evidenceType, evidence } = action.payload;
      return {
        ...state,
        ideaCards: deduplicateById(state.ideaCards.map(card => {
          if (card.id === ideaId) {
            const existing = card[evidenceType];
            if (existing.some(e => e.id === evidence.id)) return card;
            return {
              ...card,
              [evidenceType]: [...existing, evidence],
              updatedAt: new Date().toISOString(),
            };
          }
          return card;
        })),
      };
    }
    case 'ADD_IDEA_RELATIONSHIP':
      return {
        ...state,
        ideaRelationships: deduplicateById([action.payload, ...state.ideaRelationships]),
      };
    case 'REMOVE_IDEA_RELATIONSHIP':
      return {
        ...state,
        ideaRelationships: state.ideaRelationships.filter(r => r.id !== action.payload),
      };
    case 'CREATE_MVE': {
      const newMve = action.payload;
      const updatedIdeaCards = state.ideaCards.map(card => {
        if (card.id === newMve.ideaCardId) {
          const updatedCard = updateIdeaCardWithCalculatedState(card, [...state.mves, newMve]);
          return { ...updatedCard, status: 'active' as const };
        }
        return card;
      });
      return { 
        ...state, 
        mves: deduplicateById([newMve, ...state.mves]), 
        ideaCards: deduplicateById(updatedIdeaCards) 
      };
    }
    case 'UPDATE_MVE_RESULT': {
      const { id, resultStatus, resultNotes, failureAnalysis } = action.payload;
      const updatedMves = deduplicateById(state.mves.map(mve =>
        mve.id === id
          ? { ...mve, resultStatus, resultNotes, failureAnalysis }
          : mve
      ));
      
      const updatedMve = updatedMves.find(m => m.id === id);
      let updatedIdeaCards = state.ideaCards;
      
      if (updatedMve) {
        updatedIdeaCards = deduplicateById(state.ideaCards.map(card => {
          if (card.id === updatedMve!.ideaCardId) {
            return updateIdeaCardWithCalculatedState(card, updatedMves);
          }
          return card;
        }));
      }
      
      return { ...state, mves: updatedMves, ideaCards: updatedIdeaCards };
    }
    case 'UPDATE_MVE_STEPS':
      return {
        ...state,
        mves: deduplicateById(state.mves.map(mve =>
          mve.id === action.payload.id ? { ...mve, steps: action.payload.steps } : mve
        )),
      };
    case 'UPDATE_MVE_DATA_RECORDS':
      return {
        ...state,
        mves: deduplicateById(state.mves.map(mve =>
          mve.id === action.payload.id ? { ...mve, dataRecords: action.payload.dataRecords } : mve
        )),
      };
    case 'ADD_RESEARCH_AREA':
      return { ...state, researchAreas: deduplicateById([...state.researchAreas, action.payload]) };
    case 'UPDATE_RESEARCH_AREA':
      return {
        ...state,
        researchAreas: deduplicateById(state.researchAreas.map(area =>
          area.id === action.payload.id ? action.payload : area
        )),
      };
    case 'DELETE_AREA': {
      const targetId = action.payload;
      return {
        ...state,
        researchAreas: deduplicateById(state.researchAreas.map(area =>
          area.id === targetId ? { ...area, isHidden: true, updatedAt: new Date().toISOString() } : area
        )),
        papers: deduplicateById(state.papers.map(paper => ({
          ...paper,
          areaIds: paper.areaIds.filter(aid => aid !== targetId),
        }))),
        ideaCards: deduplicateById(state.ideaCards.map(card => ({
          ...card,
          areaIds: card.areaIds.filter(aid => aid !== targetId),
        }))),
      };
    }
    case 'ADD_PAPER':
      return { ...state, papers: deduplicateById([action.payload, ...state.papers]) };
    case 'UPDATE_PAPER':
      return {
        ...state,
        papers: deduplicateById(state.papers.map(paper =>
          paper.id === action.payload.id ? action.payload : paper
        )),
      };
    case 'DELETE_PAPER': {
      const targetId = action.payload;
      return {
        ...state,
        papers: state.papers.filter(paper => paper.id !== targetId),
        ideaCards: deduplicateById(state.ideaCards.map(card => ({
          ...card,
          sourcePaperIds: card.sourcePaperIds.filter(pid => pid !== targetId),
        }))),
      };
    }
    case 'RESET_DATA':
      return {
        ...action.payload,
        observations: deduplicateById(action.payload.observations),
        ideaCards: deduplicateById(action.payload.ideaCards),
        ideaRelationships: deduplicateById(action.payload.ideaRelationships || []),
        mves: deduplicateById(action.payload.mves),
        researchAreas: deduplicateById(action.payload.researchAreas),
        papers: deduplicateById(action.payload.papers),
      };
    case 'SET_ANALYZING':
      return { ...state, isAnalyzing: action.payload };
    case 'SET_GENERATING_EVIDENCE':
      return { ...state, isGeneratingEvidence: action.payload };
    case 'SET_GENERATING_MVE':
      return { ...state, isGeneratingMVE: action.payload };
    case 'SET_GENERATING_SUMMARY':
      return { ...state, isGeneratingSummary: action.payload };
    case 'SET_GENERATING_IDEA_FROM_PAPER':
      return { ...state, isGeneratingIdeaFromPaper: action.payload };
    case 'SET_PARSING_ARXIV':
      return { ...state, isParsingArxiv: action.payload };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  addObservation: (content: string) => Promise<Observation>;
  createIdeaCard: (
    title: string,
    researchQuestion: string,
    coreHypothesis: string,
    whyItMatters: string,
    sourceObservations: string[],
    areaIds?: string[],
    sourcePaperIds?: string[],
    roboticsTask?: string,
    datasetOrScenario?: string,
    baseline?: string,
    evaluationMetric?: string,
  ) => Promise<IdeaCard>;
  updateIdeaCard: (ideaCard: IdeaCard) => void;
  deleteIdeaCard: (id: string) => void;
  addEvidence: (ideaId: string, evidenceType: 'evidenceForHypothesis' | 'evidenceAgainstHypothesis' | 'falsificationRisks', content: string) => void;
  generateMVE: (ideaCardId: string) => Promise<MVE>;
  updateMVEResult: (id: string, resultStatus: MVE['resultStatus'], resultNotes: string) => Promise<void>;
  addIdeaRelationship: (sourceId: string, targetId: string, relationshipType: IdeaRelationship['relationshipType'], description?: string) => IdeaRelationship;
  removeIdeaRelationship: (id: string) => void;
  generateAdversarialReview: (ideaCardId: string) => Promise<AdversarialReview>;
  updateMveSteps: (id: string, steps: MVE['steps']) => void;
  updateMveDataRecords: (id: string, dataRecords: MVE['dataRecords']) => void;
  getIdeaCardById: (id: string) => IdeaCard | undefined;
  getMVEById: (id: string) => MVE | undefined;
  getObservationsByIds: (ids: string[]) => Observation[];
  addResearchArea: (name: string, description: string, category: string, keywords: string[], focusQuestions: string[]) => ResearchArea;
  updateResearchArea: (area: ResearchArea) => void;
  deleteArea: (id: string) => void;
  getResearchAreaById: (id: string) => ResearchArea | undefined;
  addPaper: (paperData: Partial<Paper>) => Paper;
  updatePaper: (paper: Paper) => void;
  deletePaper: (id: string) => void;
  getPaperById: (id: string) => Paper | undefined;
  getPapersByAreaId: (areaId: string) => Paper[];
  getIdeasByAreaId: (areaId: string) => IdeaCard[];
  getMvesByAreaId: (areaId: string) => MVE[];
  generateOneSentenceSummary: (paper: Partial<Paper>) => Promise<string>;
  createIdeaFromPaper: (paperId: string) => Promise<IdeaCard>;
  fetchArxivPaper: (arxivUrl: string) => Promise<{
    title: string;
    authors: string;
    year: number;
    venue: string;
    arxivUrl: string;
    pdfUrl: string;
    methodKeywords: string[];
    oneSentenceSummary: string;
    problem: string;
    coreContribution: string;
    methodSketch: string;
    evidence: {
      tasks: string[];
      baselines: string[];
      metrics: string[];
      keyResults: string[];
    };
    assumptions: string[];
    limitations: string[];
    questionsToVerify: string[];
  } | null>;
  extractAssumptions: (paper: Paper) => Promise<{
    taskAssumptions: string[];
    sensingAssumptions: string[];
    dataAssumptions: string[];
    robotAssumptions: string[];
    evaluationAssumptions: string[];
    verificationQuestions: string[];
  }>;
  extractGaps: (paper: Paper) => Promise<{
    gaps: {
      description: string;
      evidenceFor: string;
      whyWeak: string;
    }[];
  }>;
  evaluateIdea: (idea: {
    title: string;
    researchQuestion: string;
    coreHypothesis: string;
    roboticsTask?: string;
    baseline?: string;
  }) => Promise<{
    scores: {
      criterion: string;
      score: number;
      notes: string;
    }[];
    recommendation: 'proceed' | 'revise' | 'drop';
    recommendationReason: string;
    revisedHypothesis?: string;
  }>;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

let hasInitialized = false;
let initDataCache: ReturnType<typeof initializeData> | null = null;

function assertUniqueIds<T extends { id: string }>(items: T[], label: string) {
  const ids = new Set<string>();
  const duplicates: string[] = [];
  items.forEach(item => {
    if (ids.has(item.id)) {
      duplicates.push(item.id);
    }
    ids.add(item.id);
  });
  if (duplicates.length > 0) {
    console.warn(`[AppContext] Duplicate ${label} IDs found:`, duplicates);
  }
  return duplicates.length === 0;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, {
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
    isInitialized: false,
  });

  const initRef = useRef(false);
  const dispatchRef = useRef(dispatch);
  dispatchRef.current = dispatch;

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    if (hasInitialized && initDataCache) {
      return;
    }

    const data = initializeData();
    
    assertUniqueIds(data.researchAreas, 'researchAreas');
    assertUniqueIds(data.papers, 'papers');
    assertUniqueIds(data.observations, 'observations');
    assertUniqueIds(data.ideaCards, 'ideaCards');
    assertUniqueIds(data.mves, 'mves');

    initDataCache = {
      observations: deduplicateById(data.observations),
      ideaCards: deduplicateById(data.ideaCards),
      ideaRelationships: deduplicateById((data as any).ideaRelationships || []),
      mves: deduplicateById(data.mves),
      researchAreas: deduplicateById(data.researchAreas),
      papers: deduplicateById(data.papers),
    };

    hasInitialized = true;

    dispatchRef.current({
      type: 'INIT_DATA',
      payload: initDataCache,
    });
  }, []);

  useEffect(() => {
    persistData({
      observations: state.observations,
      ideaCards: state.ideaCards,
      ideaRelationships: state.ideaRelationships,
      mves: state.mves,
      researchAreas: state.researchAreas,
      papers: state.papers,
    });
  }, [state.observations, state.ideaCards, state.ideaRelationships, state.mves, state.researchAreas, state.papers]);

  const addObservation = async (content: string): Promise<Observation> => {
    dispatch({ type: 'SET_ANALYZING', payload: true });
    try {
      const analysis = await mockAnalyzeObservation(content);
      const observation: Observation = {
        id: generateId(),
        content,
        ...analysis,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_OBSERVATION', payload: observation });
      return observation;
    } finally {
      dispatch({ type: 'SET_ANALYZING', payload: false });
    }
  };

  const createIdeaCard = async (
    title: string,
    researchQuestion: string,
    coreHypothesis: string,
    whyItMatters: string,
    sourceObservations: string[],
    areaIds: string[] = [],
    sourcePaperIds: string[] = [],
    roboticsTask: string = '',
    datasetOrScenario: string = '',
    baseline: string = '',
    evaluationMetric: string = '',
  ): Promise<IdeaCard> => {
    dispatch({ type: 'SET_GENERATING_EVIDENCE', payload: true });
    try {
      const observations = state.observations.filter(o => sourceObservations.includes(o.id));
      const evidence = await mockGenerateIdeaEvidence(researchQuestion, coreHypothesis, observations);
      
      const ideaCard: IdeaCard = {
        id: generateId(),
        title,
        status: 'active',
        researchQuestion,
        coreHypothesis,
        hypothesis: coreHypothesis,
        whyItMatters,
        predictions: [],
        failureConditions: [],
        confounders: [],
        evidenceForHypothesis: evidence.supportingEvidence,
        evidenceAgainstHypothesis: evidence.opposingEvidence,
        falsificationRisks: evidence.missingEvidence,
        biggestRisks: evidence.biggestRisks,
        survivalScore: 50,
        confidenceScore: 50,
        falsificationStrength: 0,
        sourceObservations,
        sourcePaperIds,
        areaIds,
        roboticsTask,
        datasetOrScenario,
        baseline,
        evaluationMetric,
        nextAction: evidence.nextAction,
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dispatch({ type: 'CREATE_IDEA_CARD', payload: ideaCard });
      return ideaCard;
    } finally {
      dispatch({ type: 'SET_GENERATING_EVIDENCE', payload: false });
    }
  };

  const updateIdeaCard = useCallback((ideaCard: IdeaCard) => {
    dispatch({ type: 'UPDATE_IDEA_CARD', payload: { ...ideaCard, updatedAt: new Date().toISOString() } });
  }, []);

  const deleteIdeaCard = (id: string) => {
    dispatch({ type: 'DELETE_IDEA_CARD', payload: id });
  };

  const addEvidence = (ideaId: string, evidenceType: 'evidenceForHypothesis' | 'evidenceAgainstHypothesis' | 'falsificationRisks', content: string) => {
    const evidence: Evidence = {
      id: generateId(),
      content,
      source: '手动添加',
      isAIGenerated: false,
    };
    dispatch({ type: 'ADD_EVIDENCE', payload: { ideaId, evidenceType, evidence } });
  };

  const generateMVE = async (ideaCardId: string): Promise<MVE> => {
    const ideaCard = state.ideaCards.find(card => card.id === ideaCardId);
    if (!ideaCard) {
      throw new Error('Idea Card not found');
    }
    
    dispatch({ type: 'SET_GENERATING_MVE', payload: true });
    try {
      const sourcePapers = state.papers.filter(p => ideaCard.sourcePaperIds.includes(p.id));
      const mveData = await mockGenerateRoboticsMVE(ideaCard, sourcePapers);
      const mve: MVE = {
        id: generateId(),
        ideaCardId,
        ...mveData,
        resultStatus: 'pending',
        resultNotes: '',
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'CREATE_MVE', payload: mve });
      return mve;
    } finally {
      dispatch({ type: 'SET_GENERATING_MVE', payload: false });
    }
  };

  const updateMVEResult = useCallback(async (id: string, resultStatus: MVE['resultStatus'], resultNotes: string) => {
    const mve = state.mves.find(m => m.id === id);
    if (!mve) return;

    const ideaCard = state.ideaCards.find(c => c.id === mve.ideaCardId);
    if (!ideaCard) return;

    let failureAnalysis: FailureAnalysis | undefined;
    if (resultStatus === 'failed') {
      failureAnalysis = await mockAnalyzeFailure(mve, ideaCard);
    }

    dispatch({ type: 'UPDATE_MVE_RESULT', payload: { id, resultStatus, resultNotes, failureAnalysis } });
  }, [state.mves, state.ideaCards]);

  const updateMveSteps = useCallback((id: string, steps: MVE['steps']) => {
    dispatch({ type: 'UPDATE_MVE_STEPS', payload: { id, steps } });
  }, []);

  const updateMveDataRecords = useCallback((id: string, dataRecords: MVE['dataRecords']) => {
    dispatch({ type: 'UPDATE_MVE_DATA_RECORDS', payload: { id, dataRecords } });
  }, []);

  const addIdeaRelationship = (sourceId: string, targetId: string, relationshipType: IdeaRelationship['relationshipType'], description?: string) => {
    const relationship: IdeaRelationship = {
      id: generateId(),
      sourceId,
      targetId,
      relationshipType,
      description,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_IDEA_RELATIONSHIP', payload: relationship });
    return relationship;
  };

  const removeIdeaRelationship = (id: string) => {
    dispatch({ type: 'REMOVE_IDEA_RELATIONSHIP', payload: id });
  };

  const generateAdversarialReview = async (ideaCardId: string): Promise<AdversarialReview> => {
    const ideaCard = state.ideaCards.find(card => card.id === ideaCardId);
    if (!ideaCard) {
      throw new Error('Idea Card not found');
    }
    return await mockGenerateAdversarialReview(ideaCard);
  };

  const getIdeaCardById = (id: string): IdeaCard | undefined => {
    return state.ideaCards.find(card => card.id === id);
  };

  const getMVEById = (id: string): MVE | undefined => {
    return state.mves.find(mve => mve.id === id);
  };

  const getObservationsByIds = (ids: string[]): Observation[] => {
    return state.observations.filter(o => ids.includes(o.id));
  };

  const addResearchArea = (
    name: string,
    description: string,
    category: string,
    keywords: string[],
    focusQuestions: string[],
  ): ResearchArea => {
    const area: ResearchArea = {
      id: generateId(),
      name,
      description,
      category,
      keywords,
      focusQuestions,
      isHidden: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_RESEARCH_AREA', payload: area });
    return area;
  };

  const updateResearchArea = (area: ResearchArea) => {
    dispatch({ type: 'UPDATE_RESEARCH_AREA', payload: { ...area, updatedAt: new Date().toISOString() } });
  };

  const deleteArea = (id: string) => {
    dispatch({ type: 'DELETE_AREA', payload: id });
  };

  const getResearchAreaById = (id: string): ResearchArea | undefined => {
    return state.researchAreas.find(area => area.id === id && !area.isHidden);
  };

  const addPaper = (paperData: Partial<Paper>): Paper => {
    const now = new Date().toISOString();
    const paper: Paper = {
      id: generateId(),
      title: paperData.title || '',
      authors: paperData.authors || '',
      year: paperData.year || new Date().getFullYear(),
      venue: paperData.venue || '',
      arxivUrl: paperData.arxivUrl || '',
      pdfUrl: paperData.pdfUrl || '',
      htmlUrl: paperData.htmlUrl || '',
      feishuNoteUrl: paperData.feishuNoteUrl || '',
      codeUrl: paperData.codeUrl || '',
      areaIds: paperData.areaIds || [],
      readingStatus: paperData.readingStatus || 'to_read',
      methodKeywords: paperData.methodKeywords || [],
      oneSentenceSummary: paperData.oneSentenceSummary || '',
      problem: paperData.problem || '',
      coreContribution: paperData.coreContribution || '',
      methodSketch: paperData.methodSketch || '',
      evidence: paperData.evidence || { tasks: [], baselines: [], metrics: [], keyResults: [] },
      assumptions: paperData.assumptions || [],
      limitations: paperData.limitations || [],
      relevanceToMyResearch: paperData.relevanceToMyResearch || '',
      questionsToVerify: paperData.questionsToVerify || [],
      limitationsOrQuestions: paperData.limitationsOrQuestions || '',
      judgementLevel: paperData.judgementLevel || 'background',
      inspiredIdeaIds: paperData.inspiredIdeaIds || [],
      createdAt: now,
      updatedAt: now,
    };
    dispatch({ type: 'ADD_PAPER', payload: paper });
    return paper;
  };

  const updatePaper = (paper: Paper) => {
    dispatch({ type: 'UPDATE_PAPER', payload: { ...paper, updatedAt: new Date().toISOString() } });
  };

  const deletePaper = (id: string) => {
    dispatch({ type: 'DELETE_PAPER', payload: id });
  };

  const getPaperById = (id: string): Paper | undefined => {
    return state.papers.find(paper => paper.id === id);
  };

  const getPapersByAreaId = (areaId: string): Paper[] => {
    return state.papers.filter(paper => paper.areaIds.includes(areaId));
  };

  const getIdeasByAreaId = (areaId: string): IdeaCard[] => {
    return state.ideaCards.filter(card => card.areaIds.includes(areaId));
  };

  const getMvesByAreaId = (areaId: string): MVE[] => {
    const ideaIds = state.ideaCards
      .filter(card => card.areaIds.includes(areaId))
      .map(card => card.id);
    return state.mves.filter(mve => ideaIds.includes(mve.ideaCardId));
  };

  const generateOneSentenceSummary = async (paper: Partial<Paper>): Promise<string> => {
    dispatch({ type: 'SET_GENERATING_SUMMARY', payload: true });
    try {
      const areas = state.researchAreas.filter(a => (paper.areaIds || []).includes(a.id));
      return await mockGenerateOneSentenceSummary(paper, areas);
    } finally {
      dispatch({ type: 'SET_GENERATING_SUMMARY', payload: false });
    }
  };

  const createIdeaFromPaper = async (paperId: string): Promise<IdeaCard> => {
    const paper = state.papers.find(p => p.id === paperId);
    if (!paper) {
      throw new Error('Paper not found');
    }
    
    dispatch({ type: 'SET_GENERATING_IDEA_FROM_PAPER', payload: true });
    try {
      const areas = state.researchAreas.filter(a => paper.areaIds.includes(a.id));
      const ideaData = await mockGenerateIdeaFromPaper(paper, areas);
      
      const ideaCard: IdeaCard = {
        id: generateId(),
        title: ideaData.title,
        status: 'active',
        researchQuestion: ideaData.researchQuestion,
        coreHypothesis: ideaData.coreHypothesis,
        hypothesis: ideaData.coreHypothesis,
        whyItMatters: ideaData.whyItMatters,
        predictions: [],
        failureConditions: [],
        confounders: [],
        evidenceForHypothesis: ideaData.supportingEvidence,
        evidenceAgainstHypothesis: ideaData.opposingEvidence,
        falsificationRisks: ideaData.missingEvidence,
        biggestRisks: ideaData.biggestRisks,
        survivalScore: 50,
        confidenceScore: 50,
        falsificationStrength: 0,
        sourceObservations: [],
        sourcePaperIds: [paperId],
        areaIds: paper.areaIds,
        roboticsTask: ideaData.roboticsTask,
        datasetOrScenario: ideaData.datasetOrScenario,
        baseline: ideaData.baseline,
        evaluationMetric: ideaData.evaluationMetric,
        nextAction: ideaData.nextAction,
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      dispatch({ type: 'CREATE_IDEA_CARD', payload: ideaCard });
      return ideaCard;
    } finally {
      dispatch({ type: 'SET_GENERATING_IDEA_FROM_PAPER', payload: false });
    }
  };

  const fetchArxivPaper = async (arxivUrl: string) => {
    dispatch({ type: 'SET_PARSING_ARXIV', payload: true });
    try {
      return await mockFetchArxivPaper(arxivUrl);
    } finally {
      dispatch({ type: 'SET_PARSING_ARXIV', payload: false });
    }
  };

  const extractAssumptions = async (paper: Paper) => {
    return await mockExtractAssumptions(paper);
  };

  const extractGaps = async (paper: Paper) => {
    return await mockExtractGaps(paper);
  };

  const evaluateIdea = async (idea: {
    title: string;
    researchQuestion: string;
    coreHypothesis: string;
    roboticsTask?: string;
    baseline?: string;
  }) => {
    return await mockEvaluateIdea(idea);
  };

  const resetAllData = () => {
    const freshData = resetDemoData();
    dispatch({
      type: 'RESET_DATA',
      payload: {
        observations: freshData.observations,
        ideaCards: freshData.ideaCards,
        ideaRelationships: [],
        mves: freshData.mves,
        researchAreas: freshData.researchAreas,
        papers: freshData.papers,
        isAnalyzing: false,
        isGeneratingEvidence: false,
        isGeneratingMVE: false,
        isGeneratingSummary: false,
        isGeneratingIdeaFromPaper: false,
        isParsingArxiv: false,
        isInitialized: true,
      },
    });
  };

  return (
    <AppContext.Provider
      value={{
        state,
        addObservation,
        createIdeaCard,
        updateIdeaCard,
        deleteIdeaCard,
        addEvidence,
        generateMVE,
        updateMVEResult,
        updateMveSteps,
        updateMveDataRecords,
        addIdeaRelationship,
        removeIdeaRelationship,
        generateAdversarialReview,
        getIdeaCardById,
        getMVEById,
        getObservationsByIds,
        addResearchArea,
        updateResearchArea,
        deleteArea,
        getResearchAreaById,
        addPaper,
        updatePaper,
        deletePaper,
        getPaperById,
        getPapersByAreaId,
        getIdeasByAreaId,
        getMvesByAreaId,
        generateOneSentenceSummary,
        createIdeaFromPaper,
        fetchArxivPaper,
        extractAssumptions,
        extractGaps,
        evaluateIdea,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

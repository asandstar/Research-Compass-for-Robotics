import { Observation, IdeaCard, MVE, ResearchArea, Paper, Evidence, IdeaRelationship, FailureAnalysis } from '../lib/types';
import { updateIdeaCardWithCalculatedState } from '../lib/stateCalculator';

export interface AppState {
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

export type Action =
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

export function deduplicateById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export function appReducer(state: AppState, action: Action): AppState {
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
    case 'UPDATE_IDEA_CARD': {
      const updatedCard = action.payload;
      const recalculated = updateIdeaCardWithCalculatedState(updatedCard, state.mves);
      return {
        ...state,
        ideaCards: deduplicateById(state.ideaCards.map(card =>
          card.id === updatedCard.id ? recalculated : card
        )),
      };
    }
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
      const updatedIdeaCards = state.ideaCards.map(card => {
        if (card.id === ideaId) {
          const existing = card[evidenceType];
          if (existing.some(e => e.id === evidence.id)) return card;
          const updatedCard = {
            ...card,
            [evidenceType]: [...existing, evidence],
          };
          return updateIdeaCardWithCalculatedState(updatedCard, state.mves);
        }
        return card;
      });
      return {
        ...state,
        ideaCards: deduplicateById(updatedIdeaCards),
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
      const allMves = [newMve, ...state.mves];
      const updatedIdeaCards = state.ideaCards.map(card => {
        if (card.id === newMve.ideaCardId) {
          return updateIdeaCardWithCalculatedState(card, allMves);
        }
        return card;
      });
      return {
        ...state,
        mves: deduplicateById(allMves),
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

import { IdeaCard, MVE } from './types';

export type IdeaStatus = IdeaCard['status'];

export function calculateIdeaState(card: IdeaCard): IdeaStatus {
  const { survivalScore, confidenceScore } = card;

  if (survivalScore >= 70 && confidenceScore >= 60) {
    return 'promising';
  }
  if (survivalScore >= 50 && confidenceScore >= 40) {
    return 'active';
  }
  if (survivalScore < 50 || confidenceScore < 30) {
    return 'unstable';
  }
  if (survivalScore < 20) {
    return 'rejected';
  }

  return 'active';
}

export function calculateSurvivalScore(card: IdeaCard, mves: MVE[]): number {
  const ideaMves = mves.filter(m => m.ideaCardId === card.id);
  
  if (ideaMves.length === 0) {
    return Math.min(70, 50 + card.evidenceForHypothesis.length * 5 - card.evidenceAgainstHypothesis.length * 10);
  }

  const passedCount = ideaMves.filter(m => m.resultStatus === 'passed').length;
  const failedCount = ideaMves.filter(m => m.resultStatus === 'failed').length;
  const pendingCount = ideaMves.filter(m => m.resultStatus === 'pending').length;

  let score = 50;
  score += passedCount * 15;
  score -= failedCount * 20;
  score += pendingCount * 5;
  score += card.evidenceForHypothesis.length * 3;
  score -= card.evidenceAgainstHypothesis.length * 5;

  return Math.max(0, Math.min(100, score));
}

export function calculateConfidenceScore(card: IdeaCard): number {
  const evidenceRatio = card.evidenceForHypothesis.length / 
    Math.max(1, card.evidenceForHypothesis.length + card.evidenceAgainstHypothesis.length);
  
  let score = 50;
  score += evidenceRatio * 30;
  score += card.falsificationStrength;
  score += card.predictions.length * 5;
  score += card.failureConditions.length * 5;

  return Math.max(0, Math.min(100, score));
}

export function calculateFalsificationStrength(card: IdeaCard): number {
  const hasFailureConditions = card.failureConditions.length > 0;
  const hasConfounders = card.confounders.length > 0;
  const hasPredictions = card.predictions.length > 0;
  const hasAgainstEvidence = card.evidenceAgainstHypothesis.length > 0;

  let score = 0;
  score += hasFailureConditions ? 30 : 0;
  score += hasConfounders ? 20 : 0;
  score += hasPredictions ? 25 : 0;
  score += hasAgainstEvidence ? 25 : 0;

  return score;
}

export function updateIdeaCardWithCalculatedState(card: IdeaCard, mves: MVE[]): IdeaCard {
  const falsificationStrength = calculateFalsificationStrength(card);
  const confidenceScore = calculateConfidenceScore({ ...card, falsificationStrength });
  const survivalScore = calculateSurvivalScore(card, mves);
  const status = calculateIdeaState({ 
    ...card, 
    survivalScore, 
    confidenceScore,
    falsificationStrength 
  });

  return {
    ...card,
    survivalScore,
    confidenceScore,
    falsificationStrength,
    status,
    updatedAt: new Date().toISOString(),
  };
}

export function calculateMVEImpactOnIdea(card: IdeaCard, mve: MVE): Partial<IdeaCard> {
  if (mve.resultStatus === 'passed') {
    return {
      survivalScore: Math.min(100, card.survivalScore + 15),
      confidenceScore: Math.min(100, card.confidenceScore + 10),
    };
  }
  if (mve.resultStatus === 'failed') {
    return {
      survivalScore: Math.max(0, card.survivalScore - 20),
      confidenceScore: Math.max(0, card.confidenceScore - 15),
    };
  }
  return {};
}

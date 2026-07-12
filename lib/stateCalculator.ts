import { IdeaCard, MVE } from './types';

export function calculateSurvivalScore(card: IdeaCard, mves: MVE[]): number {
  const ideaMves = mves.filter(m => m.ideaCardId === card.id);
  const passedMves = ideaMves.filter(m => m.resultStatus === 'passed');
  const failedMves = ideaMves.filter(m => m.resultStatus === 'failed');

  const supporting = card.evidenceForHypothesis?.length || 0;
  const opposing = card.evidenceAgainstHypothesis?.length || 0;
  const totalEvidence = supporting + opposing;

  let score = 50;

  if (totalEvidence > 0 || ideaMves.length > 0) {
    score += passedMves.length * 15;
    score -= failedMves.length * 20;
    score += supporting * 3;
    score -= opposing * 5;
  } else {
    score = Math.min(70, 50 + supporting * 5 - opposing * 10);
  }

  return Math.max(0, Math.min(100, score));
}

export function calculateConfidenceScore(card: IdeaCard): number {
  const supporting = card.evidenceForHypothesis?.length || 0;
  const opposing = card.evidenceAgainstHypothesis?.length || 0;
  const totalEvidence = supporting + opposing;
  const evidenceRatio = totalEvidence > 0 ? supporting / totalEvidence : 0;

  let score = 50;
  score += evidenceRatio * 40;
  score += Math.min(totalEvidence * 2, 10);
  score += (card.predictions?.length || 0) * 2;
  score += (card.failureConditions?.length || 0) * 2;
  score += card.falsificationStrength * 0.1;

  return Math.max(0, Math.min(100, score));
}

export function calculateFalsificationStrength(card: IdeaCard): number {
  let strength = 0;

  if (card.failureConditions && card.failureConditions.length > 0) {
    strength += 30;
  }
  if (card.confounders && card.confounders.length > 0) {
    strength += 20;
  }
  if (card.predictions && card.predictions.length > 0) {
    strength += 25;
  }
  if (card.evidenceAgainstHypothesis && card.evidenceAgainstHypothesis.length > 0) {
    strength += 25;
  }

  return Math.max(0, Math.min(100, strength));
}

export function getLatestMVE(ideaId: string, mves: MVE[]): MVE | null {
  const ideaMves = mves.filter(m => m.ideaCardId === ideaId);
  if (ideaMves.length === 0) return null;

  const sorted = [...ideaMves].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return sorted[0];
}

export function getLatestCompletedMVE(ideaId: string, mves: MVE[]): MVE | null {
  const ideaMves = mves.filter(
    m => m.ideaCardId === ideaId && (m.resultStatus === 'passed' || m.resultStatus === 'failed')
  );
  if (ideaMves.length === 0) return null;

  const sorted = [...ideaMves].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return sorted[0];
}

export function getNextPendingMVE(ideaId: string, mves: MVE[]): MVE | null {
  const pendingMves = mves.filter(m => m.ideaCardId === ideaId && m.resultStatus === 'pending');
  if (pendingMves.length === 0) return null;

  const sorted = [...pendingMves].sort((a, b) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  return sorted[0];
}

export function getMVEEffectOnSurvival(
  card: IdeaCard,
  mves: MVE[]
): { scoreChange: number; statusEffect: string } {
  const passed = mves.filter(m => m.ideaCardId === card.id && m.resultStatus === 'passed').length;
  const failed = mves.filter(m => m.ideaCardId === card.id && m.resultStatus === 'failed').length;

  const scoreChange = passed * 15 - failed * 20;

  let statusEffect = '实验结果支撑当前假设';
  if (failed > passed) {
    statusEffect = '实验结果对假设构成压力';
  } else if (passed > 0 && failed === 0) {
    statusEffect = '实验通过增强了假设信心';
  } else if (passed === 0 && failed === 0) {
    statusEffect = '尚无实验结果，建议尽快设计 MVE';
  }

  return { scoreChange, statusEffect };
}

export function getLatestMVEResult(card: IdeaCard, mves: MVE[]): MVE | null {
  return getLatestCompletedMVE(card.id, mves);
}

export function calculateIdeaStatus(card: IdeaCard): IdeaCard['status'] {
  const { survivalScore, confidenceScore } = card;

  if (survivalScore >= 70 && confidenceScore >= 60) {
    return 'promising';
  }
  if (survivalScore < 20) {
    return 'rejected';
  }
  if (survivalScore >= 50 && confidenceScore >= 40) {
    return 'active';
  }
  if (survivalScore < 50 || confidenceScore < 30) {
    return 'unstable';
  }
  return 'active';
}

export function updateIdeaCardWithCalculatedState(
  card: IdeaCard,
  mves: MVE[]
): IdeaCard {
  const falsificationStrength = calculateFalsificationStrength(card);
  const survivalScore = calculateSurvivalScore(card, mves);
  const confidenceScore = calculateConfidenceScore({ ...card, falsificationStrength });

  const updatedCard = {
    ...card,
    falsificationStrength,
    survivalScore,
    confidenceScore,
  };

  const status = calculateIdeaStatus(updatedCard);

  return {
    ...updatedCard,
    status,
    updatedAt: new Date().toISOString(),
  };
}

export function recalculateIdea(idea: IdeaCard, allMves: MVE[]): IdeaCard {
  return updateIdeaCardWithCalculatedState(idea, allMves);
}

import type { HigherLowerRound, Side } from './types';

export function scoreSelections(
  round: HigherLowerRound,
  selections: Record<string, Side | null>,
): number {
  return round.rows.reduce((total, row) => total + (selections[row.id] === row.correctSide ? 1 : 0), 0);
}

export function getScoreReaction(score: number): string {
  if (score === 5) {
    return 'Perfect round.';
  }

  if (score === 4) {
    return 'Strong round.';
  }

  if (score === 3) {
    return 'Solid.';
  }

  return 'Rough one.';
}

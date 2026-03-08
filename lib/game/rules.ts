import { formatMetricValue } from './format';
import type {
  CategoryDefinition,
  CountryRecord,
  EligibleRowCandidate,
  MetricFamily,
  Side,
} from './types';

export function relativeDiff(leftValue: number, rightValue: number): number {
  return Math.abs(leftValue - rightValue) / Math.max(Math.abs(leftValue), Math.abs(rightValue));
}

export function buildEligibleRows(
  leftCountry: CountryRecord,
  rightCountry: CountryRecord,
  categories: CategoryDefinition[],
  minRelativeDeltaOffset = 0,
): EligibleRowCandidate[] {
  return categories
    .filter((category) => category.enabled)
    .flatMap((category) => {
      const leftValue = leftCountry.metrics[category.id];
      const rightValue = rightCountry.metrics[category.id];

      if (typeof leftValue !== 'number' || typeof rightValue !== 'number') {
        return [];
      }

      if (leftValue === rightValue) {
        return [];
      }

      const diff = relativeDiff(leftValue, rightValue);
      const minRelativeDelta = Math.max(0.01, category.minRelativeDelta - minRelativeDeltaOffset);

      if (diff < minRelativeDelta) {
        return [];
      }

      const correctSide: Side = leftValue > rightValue ? 'left' : 'right';

      return [
        {
          id: `${leftCountry.slug}-${rightCountry.slug}-${category.id}`,
          metricId: category.id,
          label: category.label,
          unitLabel: category.unitLabel,
          family: category.family,
          leftValue,
          rightValue,
          leftDisplay: formatMetricValue(leftValue, category),
          rightDisplay: formatMetricValue(rightValue, category),
          correctSide,
          relativeDiff: diff,
          sourceYear: category.sourceYear,
          isCloseCall: diff < category.closeCallDelta,
          isObvious: diff >= 0.2,
        },
      ];
    });
}

export function pairIsValid(candidates: EligibleRowCandidate[]): boolean {
  if (candidates.length < 8) {
    return false;
  }

  const families = new Set(candidates.map((candidate) => candidate.family));
  return families.size >= 3;
}

function countByFamily(candidates: EligibleRowCandidate[]): Map<MetricFamily, number> {
  return candidates.reduce((accumulator, candidate) => {
    accumulator.set(candidate.family, (accumulator.get(candidate.family) ?? 0) + 1);
    return accumulator;
  }, new Map<MetricFamily, number>());
}

function answerSplitIsBalanced(candidates: EligibleRowCandidate[]): boolean {
  const leftWins = candidates.filter((candidate) => candidate.correctSide === 'left').length;
  const rightWins = candidates.length - leftWins;
  return (leftWins === 2 && rightWins === 3) || (leftWins === 3 && rightWins === 2);
}

export function comboIsValid(candidates: EligibleRowCandidate[], rowCount: number): boolean {
  if (candidates.length !== rowCount) {
    return false;
  }

  if (!answerSplitIsBalanced(candidates)) {
    return false;
  }

  const familyCounts = [...countByFamily(candidates).values()];
  if (familyCounts.some((count) => count > 2)) {
    return false;
  }

  const closeCalls = candidates.filter((candidate) => candidate.isCloseCall).length;
  if (closeCalls > 1) {
    return false;
  }

  const obviousRows = candidates.filter((candidate) => candidate.isObvious).length;
  return obviousRows >= 1;
}

export function scoreCombo(candidates: EligibleRowCandidate[]): number {
  const familyCounts = countByFamily(candidates);
  const familyDiversity = familyCounts.size;
  const obviousRows = candidates.filter((candidate) => candidate.isObvious).length;
  const mediumRows = candidates.filter(
    (candidate) => candidate.relativeDiff >= 0.08 && candidate.relativeDiff < 0.2,
  ).length;
  const closeCalls = candidates.filter((candidate) => candidate.isCloseCall).length;
  const duplicateFamilyPenalty = [...familyCounts.values()].reduce(
    (total, count) => total + Math.max(0, count - 1),
    0,
  );
  const diffSpread = Math.round(
    candidates.reduce((total, candidate) => total + candidate.relativeDiff, 0) * 100,
  );

  return familyDiversity * 12 + obviousRows * 4 + mediumRows * 3 + diffSpread - closeCalls * 6 - duplicateFamilyPenalty * 5;
}

function buildCombinations<T>(items: T[], take: number, startIndex = 0, prefix: T[] = [], output: T[][] = []): T[][] {
  if (prefix.length === take) {
    output.push(prefix);
    return output;
  }

  for (let index = startIndex; index <= items.length - (take - prefix.length); index += 1) {
    buildCombinations(items, take, index + 1, [...prefix, items[index]], output);
  }

  return output;
}

export function findValidRowCombos(candidates: EligibleRowCandidate[], rowCount: number): EligibleRowCandidate[][] {
  return buildCombinations(candidates, rowCount)
    .filter((combo) => comboIsValid(combo, rowCount))
    .sort((left, right) => scoreCombo(right) - scoreCombo(left));
}

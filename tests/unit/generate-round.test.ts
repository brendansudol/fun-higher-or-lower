import { describe, expect, it } from 'vitest';

import categories from '@/data/generated/categories.world.json';
import countries from '@/data/generated/countries.world.json';
import fallbackRounds from '@/data/generated/fallback-rounds.world.json';
import { generateRound } from '@/lib/game/generate-round';
import type { CategoryDefinition, CountryRecord, FallbackRoundDefinition } from '@/lib/game/types';

const typedCategories = categories as CategoryDefinition[];
const typedCountries = countries as CountryRecord[];
const typedFallbackRounds = fallbackRounds as FallbackRoundDefinition[];

function summarizeRound(seed: string) {
  const round = generateRound({
    seed,
    packId: 'world',
    categories: typedCategories,
    countries: typedCountries,
    fallbackRounds: typedFallbackRounds,
  });

  return {
    left: round.leftCountry.slug,
    right: round.rightCountry.slug,
    rows: round.rows.map((row) => row.metricId),
    winners: round.rows.map((row) => row.correctSide),
  };
}

describe('generateRound', () => {
  it('is deterministic for a given seed and dataset', () => {
    expect(summarizeRound('K7Q2M9')).toEqual(summarizeRound('K7Q2M9'));
  });

  it('usually changes output for different seeds', () => {
    expect(summarizeRound('K7Q2M9')).not.toEqual(summarizeRound('A1B2C3'));
  });

  it('returns a valid five-row round', () => {
    const round = generateRound({
      seed: 'Z9X8C7',
      packId: 'world',
      categories: typedCategories,
      countries: typedCountries,
      fallbackRounds: typedFallbackRounds,
    });

    expect(round.rows).toHaveLength(5);
    expect(round.rows.every((row) => row.leftValue !== row.rightValue)).toBe(true);
    expect(round.rows.every((row) => row.correctSide === 'left' || row.correctSide === 'right')).toBe(true);

    const leftWins = round.rows.filter((row) => row.correctSide === 'left').length;
    const rightWins = round.rows.filter((row) => row.correctSide === 'right').length;
    expect([
      [leftWins, rightWins],
      [rightWins, leftWins],
    ]).toContainEqual([3, 2]);
  });
});

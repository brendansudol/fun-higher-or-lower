import { describe, expect, it } from 'vitest';

import categories from '@/data/generated/categories.world.json';
import countries from '@/data/generated/countries.world.json';
import fallbackRounds from '@/data/generated/fallback-rounds.world.json';
import { generateRound } from '@/lib/game/generate-round';
import { scoreSelections } from '@/lib/game/score-round';
import type { CategoryDefinition, CountryRecord, FallbackRoundDefinition } from '@/lib/game/types';

const typedCategories = categories as CategoryDefinition[];
const typedCountries = countries as CountryRecord[];
const typedFallbackRounds = fallbackRounds as FallbackRoundDefinition[];

describe('scoreSelections', () => {
  it('matches exact player picks to the row winners', () => {
    const round = generateRound({
      seed: 'K7Q2M9',
      packId: 'world',
      categories: typedCategories,
      countries: typedCountries,
      fallbackRounds: typedFallbackRounds,
    });

    const allCorrect = Object.fromEntries(round.rows.map((row) => [row.id, row.correctSide]));
    const oneWrong = Object.fromEntries(
      round.rows.map((row, index) => [row.id, index === 0 ? (row.correctSide === 'left' ? 'right' : 'left') : row.correctSide]),
    );

    expect(scoreSelections(round, allCorrect)).toBe(5);
    expect(scoreSelections(round, oneWrong)).toBe(4);
  });
});

import { describe, expect, it } from 'vitest';

import categories from '@/data/generated/categories.world.json';
import countries from '@/data/generated/countries.world.json';
import { buildEligibleRows, pairIsValid, relativeDiff } from '@/lib/game/rules';
import type { CategoryDefinition, CountryRecord } from '@/lib/game/types';

const typedCategories = categories as CategoryDefinition[];
const typedCountries = countries as CountryRecord[];

describe('round rules', () => {
  it('computes relative difference against the larger value', () => {
    expect(relativeDiff(80, 100)).toBeCloseTo(0.2);
    expect(relativeDiff(100, 80)).toBeCloseTo(0.2);
  });

  it('filters a known pair down to eligible rows only', () => {
    const brazil = typedCountries.find((country) => country.slug === 'brazil');
    const japan = typedCountries.find((country) => country.slug === 'japan');

    expect(brazil).toBeDefined();
    expect(japan).toBeDefined();

    const rows = buildEligibleRows(brazil!, japan!, typedCategories);

    expect(rows.length).toBeGreaterThanOrEqual(8);
    expect(pairIsValid(rows)).toBe(true);
    expect(rows.every((row) => row.leftValue !== row.rightValue)).toBe(true);
  });
});

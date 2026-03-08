import { describe, expect, it } from 'vitest';

import { createRng, deterministicShuffle } from '@/lib/game/rng';
import { sanitizeSeed, seedToInt } from '@/lib/game/seed';

describe('seed utilities', () => {
  it('sanitizes and uppercases valid seeds', () => {
    expect(sanitizeSeed('k7-q2m9')).toBe('K7Q2M9');
    expect(sanitizeSeed('@@a1')).toBeNull();
  });

  it('turns the same seed into the same integer', () => {
    expect(seedToInt('K7Q2M9')).toBe(seedToInt('K7Q2M9'));
    expect(seedToInt('K7Q2M9')).not.toBe(seedToInt('A1B2C3'));
  });

  it('creates deterministic random sequences and shuffles', () => {
    const leftRng = createRng('demo-seed');
    const rightRng = createRng('demo-seed');

    expect(Array.from({ length: 5 }, () => leftRng())).toEqual(Array.from({ length: 5 }, () => rightRng()));
    expect(deterministicShuffle(['a', 'b', 'c', 'd'], createRng('shuffle'))).toEqual(
      deterministicShuffle(['a', 'b', 'c', 'd'], createRng('shuffle')),
    );
  });
});

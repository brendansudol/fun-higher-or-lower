import { describe, expect, it } from 'vitest';

import { WORLD_CATEGORY_DEFINITIONS } from '@/lib/game/catalog';
import { formatByFormatter, formatMetricValue } from '@/lib/game/format';

describe('formatting', () => {
  it('formats compact values consistently', () => {
    expect(formatByFormatter(203_000_000, 'compact-number')).toBe('203M');
    expect(formatByFormatter(1_920_000_000_000, 'compact-currency')).toBe('$1.9T');
    expect(formatByFormatter(33_800, 'currency-per-capita')).toBe('$33.8K');
    expect(formatByFormatter(8_360_000, 'sq-km')).toBe('8.4M sq km');
    expect(formatByFormatter(74.2, 'percent-1')).toBe('74.2%');
  });

  it('adds category-specific suffixes where needed', () => {
    const lifeExpectancy = WORLD_CATEGORY_DEFINITIONS.find((category) => category.id === 'life_expectancy');
    expect(lifeExpectancy).toBeDefined();
    expect(formatMetricValue(82.6, lifeExpectancy!)).toBe('82.6 years');
  });
});

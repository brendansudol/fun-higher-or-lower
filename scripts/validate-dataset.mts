import categories from '../data/generated/categories.world.json';
import countries from '../data/generated/countries.world.json';
import fallbackRounds from '../data/generated/fallback-rounds.world.json';
import * as catalog from '../lib/game/catalog.ts';

const { WORLD_CATEGORY_DEFINITIONS } = catalog;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function main() {
  const enabledCategoryIds = new Set(WORLD_CATEGORY_DEFINITIONS.filter((category) => category.enabled).map((category) => category.id));
  const categoryIds = new Set(categories.map((category) => category.id));

  for (const id of enabledCategoryIds) {
    assert(categoryIds.has(id), `Missing enabled category in generated dataset: ${id}`);
  }

  const iso2s = new Set<string>();
  const slugs = new Set<string>();

  for (const country of countries) {
    assert(!iso2s.has(country.iso2), `Duplicate ISO2 code: ${country.iso2}`);
    assert(!slugs.has(country.slug), `Duplicate slug: ${country.slug}`);
    iso2s.add(country.iso2);
    slugs.add(country.slug);

    if (country.playable) {
      const coverage = Object.keys(country.metrics).length;
      assert(coverage >= 10, `Playable country has low coverage: ${country.name}`);
    }
  }

  for (const round of fallbackRounds) {
    assert(slugs.has(round.leftSlug), `Fallback left country not found: ${round.leftSlug}`);
    assert(slugs.has(round.rightSlug), `Fallback right country not found: ${round.rightSlug}`);
    for (const metricId of round.metricIds) {
      assert(categoryIds.has(metricId), `Fallback metric not found: ${metricId}`);
    }
  }

  console.log('Dataset validation passed.');
}

main();

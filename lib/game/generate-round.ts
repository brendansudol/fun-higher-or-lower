import { deterministicShuffle, createRng } from './rng';
import { buildEligibleRows, findValidRowCombos, pairIsValid } from './rules';
import type {
  CategoryDefinition,
  CountryRecord,
  EligibleRowCandidate,
  FallbackRoundDefinition,
  GenerateRoundInput,
  HigherLowerRound,
  PackId,
} from './types';
import { seedToInt } from './seed';

function buildRound(
  seed: string,
  packId: PackId,
  leftCountry: CountryRecord,
  rightCountry: CountryRecord,
  rows: EligibleRowCandidate[],
): HigherLowerRound {
  return {
    seed,
    packId,
    leftCountry,
    rightCountry,
    rows,
  };
}

function buildFallbackRound(
  seed: string,
  packId: PackId,
  countries: CountryRecord[],
  categories: CategoryDefinition[],
  fallbackRounds: FallbackRoundDefinition[],
): HigherLowerRound | null {
  if (!fallbackRounds.length) {
    return null;
  }

  const ordered = deterministicShuffle(fallbackRounds, createRng(`${seed}:fallbacks:${seedToInt(seed)}`));

  for (const fallback of ordered) {
    const leftCountry = countries.find((country) => country.slug === fallback.leftSlug);
    const rightCountry = countries.find((country) => country.slug === fallback.rightSlug);

    if (!leftCountry || !rightCountry) {
      continue;
    }

    const rows = fallback.metricIds.flatMap((metricId) => {
      const category = categories.find((entry) => entry.id === metricId);
      return category ? buildEligibleRows(leftCountry, rightCountry, [category]) : [];
    });

    if (rows.length === fallback.metricIds.length) {
      return buildRound(seed, packId, leftCountry, rightCountry, rows);
    }
  }

  return null;
}

function buildEmergencyRound(
  seed: string,
  packId: PackId,
  countries: CountryRecord[],
  categories: CategoryDefinition[],
  rowCount: number,
): HigherLowerRound {
  for (let leftIndex = 0; leftIndex < countries.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < countries.length; rightIndex += 1) {
      const leftCountry = countries[leftIndex];
      const rightCountry = countries[rightIndex];
      const rows = buildEligibleRows(leftCountry, rightCountry, categories, 0.03)
        .sort((left, right) => right.relativeDiff - left.relativeDiff)
        .slice(0, rowCount);

      if (rows.length === rowCount) {
        return buildRound(seed, packId, leftCountry, rightCountry, rows);
      }
    }
  }

  throw new Error('Unable to build any playable round from the local dataset.');
}

export function generateRound({
  seed,
  packId,
  countries,
  categories,
  fallbackRounds = [],
  rowCount = 5,
}: GenerateRoundInput): HigherLowerRound {
  const rng = createRng(`${packId}:${seed}`);
  const playableCountries = countries.filter((country) => country.playable);
  const shuffledCountries = deterministicShuffle(playableCountries, rng);
  const relaxedOffsets = [0, 0.015, 0.03];

  for (const minRelativeDeltaOffset of relaxedOffsets) {
    for (let leftIndex = 0; leftIndex < shuffledCountries.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < shuffledCountries.length; rightIndex += 1) {
        const leftCountry = shuffledCountries[leftIndex];
        const rightCountry = shuffledCountries[rightIndex];
        const candidates = buildEligibleRows(leftCountry, rightCountry, categories, minRelativeDeltaOffset);

        if (!pairIsValid(candidates)) {
          continue;
        }

        const combos = findValidRowCombos(candidates, rowCount);
        if (!combos.length) {
          continue;
        }

        return buildRound(seed, packId, leftCountry, rightCountry, combos[0]);
      }
    }
  }

  const fallbackRound = buildFallbackRound(seed, packId, countries, categories, fallbackRounds);
  if (fallbackRound) {
    return fallbackRound;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.warn('[higher-or-lower] Falling back to emergency round generation for seed', seed);
  }

  return buildEmergencyRound(seed, packId, countries, categories, rowCount);
}

import fs from 'node:fs/promises';
import path from 'node:path';

import * as catalog from '../lib/game/catalog.ts';
import type { CountryRecord, FallbackRoundDefinition, MetricId } from '../lib/game/types.ts';
import { fetchRestCountries } from './fetch-restcountries.mts';
import { fetchWorldBankLatestValues } from './fetch-worldbank.mts';

const { WORLD_CATEGORY_DEFINITIONS } = catalog;

const INDICATOR_MAP: Record<MetricId, string> = {
  population: 'SP.POP.TOTL',
  land_area: 'AG.LND.TOTL.K2',
  gdp: 'NY.GDP.MKTP.CD',
  gdp_per_capita: 'NY.GDP.PCAP.CD',
  life_expectancy: 'SP.DYN.LE00.IN',
  urban_population_pct: 'SP.URB.TOTL.IN.ZS',
  internet_users_pct: 'IT.NET.USER.ZS',
  forest_area_pct: 'AG.LND.FRST.ZS',
  co2_per_capita: 'EN.ATM.CO2E.PC',
  fertility_rate: 'SP.DYN.TFRT.IN',
  renewable_electricity_pct: 'EG.ELC.RNEW.ZS',
  exports_total: 'NE.EXP.GNFS.CD',
};

const OUTPUT_DIR = path.join(process.cwd(), 'data', 'generated');

function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  const [restCountries, indicatorResults] = await Promise.all([
    fetchRestCountries(),
    Promise.all(
      WORLD_CATEGORY_DEFINITIONS.map(async (category) => ({
        id: category.id,
        latestValues: await fetchWorldBankLatestValues(INDICATOR_MAP[category.id]),
      })),
    ),
  ]);

  const yearByMetric = new Map<MetricId, number>();
  const metricData = new Map<MetricId, Record<string, number>>();

  for (const result of indicatorResults) {
    const valuesByCountry: Record<string, number> = {};
    const yearFrequency = new Map<number, number>();

    for (const [iso3, payload] of Object.entries(result.latestValues)) {
      valuesByCountry[iso3] = payload.value;
      yearFrequency.set(payload.year, (yearFrequency.get(payload.year) ?? 0) + 1);
    }

    const [topYear] = [...yearFrequency.entries()].sort((left, right) => right[1] - left[1]);
    yearByMetric.set(result.id, topYear?.[0] ?? undefined);
    metricData.set(result.id, valuesByCountry);
  }

  const categories = WORLD_CATEGORY_DEFINITIONS.map((category) => ({
    ...category,
    sourceYear: yearByMetric.get(category.id),
  }));

  const countries: CountryRecord[] = restCountries
    .filter((country) => country.cca2 && country.cca3 && country.name?.common)
    .map((country) => {
      const metrics = categories.reduce<CountryRecord['metrics']>((accumulator, category) => {
        const value = metricData.get(category.id)?.[country.cca3];
        if (typeof value === 'number' && Number.isFinite(value)) {
          accumulator[category.id] = value;
        }
        return accumulator;
      }, {});

      const coverage = Object.keys(metrics).length;
      const population = metrics.population ?? 0;
      const playable = Boolean(country.independent) && Boolean(country.unMember) && coverage >= 10 && population >= 350_000;

      return {
        iso2: country.cca2,
        iso3: country.cca3,
        slug: slugify(country.name.common),
        name: country.name.common,
        flagEmoji: country.flag ?? '',
        region: country.region || 'Other',
        subregion: country.subregion || undefined,
        playable,
        metrics,
      } satisfies CountryRecord;
    })
    .filter((country) => !['antarctica'].includes(country.slug))
    .sort((left, right) => left.name.localeCompare(right.name));

  const fallbackRounds: FallbackRoundDefinition[] = [
    {
      seed: 'ATLAS1',
      leftSlug: 'brazil',
      rightSlug: 'japan',
      metricIds: ['population', 'land_area', 'gdp', 'gdp_per_capita', 'life_expectancy'],
    },
    {
      seed: 'ATLAS2',
      leftSlug: 'canada',
      rightSlug: 'egypt',
      metricIds: ['population', 'land_area', 'internet_users_pct', 'forest_area_pct', 'fertility_rate'],
    },
    {
      seed: 'ATLAS3',
      leftSlug: 'india',
      rightSlug: 'norway',
      metricIds: ['population', 'gdp', 'gdp_per_capita', 'co2_per_capita', 'renewable_electricity_pct'],
    },
  ];

  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await Promise.all([
    fs.writeFile(path.join(OUTPUT_DIR, 'categories.world.json'), `${JSON.stringify(categories, null, 2)}\n`),
    fs.writeFile(path.join(OUTPUT_DIR, 'countries.world.json'), `${JSON.stringify(countries, null, 2)}\n`),
    fs.writeFile(path.join(OUTPUT_DIR, 'fallback-rounds.world.json'), `${JSON.stringify(fallbackRounds, null, 2)}\n`),
  ]);

  const playableCount = countries.filter((country) => country.playable).length;
  console.log(`Wrote ${countries.length} countries, ${playableCount} playable, ${categories.length} categories.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

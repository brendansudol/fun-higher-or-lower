export type PackId = 'world';
export type Side = 'left' | 'right';

export type MetricId =
  | 'population'
  | 'land_area'
  | 'gdp'
  | 'gdp_per_capita'
  | 'life_expectancy'
  | 'urban_population_pct'
  | 'internet_users_pct'
  | 'forest_area_pct'
  | 'co2_per_capita'
  | 'fertility_rate'
  | 'renewable_electricity_pct'
  | 'exports_total';

export type MetricFamily =
  | 'demographics'
  | 'geography'
  | 'economy'
  | 'health'
  | 'technology'
  | 'environment';

export type FormatterId =
  | 'compact-number'
  | 'compact-currency'
  | 'currency-per-capita'
  | 'percent-1'
  | 'decimal-1'
  | 'sq-km';

export interface CategoryDefinition {
  id: MetricId;
  label: string;
  shortLabel?: string;
  family: MetricFamily;
  unitLabel: string;
  formatter: FormatterId;
  sourceYear?: number;
  enabled: boolean;
  minRelativeDelta: number;
  closeCallDelta: number;
}

export interface CountryRecord {
  iso2: string;
  iso3: string;
  slug: string;
  name: string;
  shortName?: string;
  flagEmoji: string;
  region: string;
  subregion?: string;
  playable: boolean;
  metrics: Partial<Record<MetricId, number>>;
}

export interface RoundRow {
  id: string;
  metricId: MetricId;
  label: string;
  unitLabel: string;
  family: MetricFamily;
  leftValue: number;
  rightValue: number;
  leftDisplay: string;
  rightDisplay: string;
  correctSide: Side;
  relativeDiff: number;
  sourceYear?: number;
}

export interface HigherLowerRound {
  seed: string;
  packId: PackId;
  leftCountry: CountryRecord;
  rightCountry: CountryRecord;
  rows: RoundRow[];
}

export interface GameState {
  phase: 'playing' | 'revealed';
  selections: Record<string, Side | null>;
  score: number | null;
}

export interface EligibleRowCandidate extends RoundRow {
  familyCount?: number;
  isCloseCall: boolean;
  isObvious: boolean;
}

export interface FallbackRoundDefinition {
  seed: string;
  leftSlug: string;
  rightSlug: string;
  metricIds: MetricId[];
}

export interface GenerateRoundInput {
  seed: string;
  packId: PackId;
  countries: CountryRecord[];
  categories: CategoryDefinition[];
  fallbackRounds?: FallbackRoundDefinition[];
  rowCount?: number;
}

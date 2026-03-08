# Higher or Lower — Product + Engineering Spec

## 1. Overview

Build a lightweight web game for end-of-meeting play. Each round shows **two countries** and **five categories**. For each category, the player/team chooses which country has the **higher numeric value**. After all five picks are made, the board reveals:

- which side was correct on each row
- the exact values for both countries
- the total score out of 5

This is a **single-page, seedable, no-account, no-database** app intended to run well on a shared screen in meetings.

### Core design goals

1. **Fast to understand**: a host should be able to explain the game in one sentence.
2. **Fast to play**: one round should take 30–90 seconds.
3. **Satisfying reveal**: the reveal is the emotional payoff.
4. **No operational complexity**: no DB, no auth, no admin panel, no live APIs at runtime.
5. **Deterministic sharing**: the same URL should reproduce the same round.
6. **Good screen-share UX**: large text, obvious buttons, no tiny controls, no hover-only interactions.

### Non-goals for MVP

- No real-time multiplayer sync
- No user accounts, profiles, or cloud leaderboards
- No CMS or content admin panel
- No daily puzzle service
- No difficulty-adjusting AI
- No runtime calls to third-party country/stat APIs
- No category packs beyond the default `world` pack

---

## 2. Product definition

### Default round format

- Two countries are shown side by side at the top.
- Five rows appear underneath.
- Each row is a category such as Population, GDP per capita, or Life expectancy.
- The player/team selects **left** or **right** for every row.
- Nothing reveals until all rows are answered and the player presses **Submit**.
- The reveal shows exact values with formatting and simple bars.
- The round ends with a score banner and actions for **New round** and **Copy link**.

### MVP decisions that are already locked in

- **One pair of countries per round**
- **Five rows per round**
- **All answers revealed at once after submit**
- **No timer in MVP** (easy to add later)
- **Only “higher is higher” metrics** in MVP
- **No tie rows** in MVP
- **Random but deterministic rounds** via URL seed
- **One content pack**: `world`
- **Single-device / shared-screen play** as the primary mode

### Why this format

Using the same pair of countries across all rows creates a clean board and makes the reveal feel cohesive. It also helps players form a mental model of each country during the round.

---

## 3. User stories

### Primary user story

As a meeting host, I can open the game, get a round instantly, make five picks with my team, and reveal the answers in under two minutes.

### Supporting user stories

- As a host, I can click **New round** and get another playable round immediately.
- As a host, I can **copy a URL** and share the exact same round with someone else.
- As a player, I can tell which options are selected at a glance.
- As a player, I can understand each category without needing a tooltip.
- As a player, I can see the exact figures after reveal.
- As a developer, I can update the dataset without adding infrastructure.

---

## 4. UX spec

## 4.1 Main page structure

Use one main route (`/`) for MVP.

### Header

- Game title: `Higher or Lower`
- Pack label: `World`
- Secondary actions:
  - `Copy link`
  - `New round`

### Country cards row

Show two large country cards:

- flag emoji or static flag asset
- country name
- optional small sublabel: region

Example:

- `🇧🇷 Brazil` — South America
- `🇯🇵 Japan` — East Asia

### Question rows

Each row contains:

- category label
- optional small unit label in muted text
- two large choice buttons: left country / right country

Example rows:

- Population
- Land area
- GDP (USD)
- GDP per capita (USD)
- Life expectancy (years)

### Footer action area

Before reveal:

- disabled state text until all five rows answered
- primary button: `Submit picks`

After reveal:

- score banner, e.g. `4 / 5 correct`
- primary button: `New round`
- secondary button: `Copy link`

---

## 4.2 Play-state behavior

### Selection behavior

- Clicking a side selects that side for the row.
- Clicking the already selected side does nothing.
- Clicking the opposite side switches the selection.
- Rows can be answered in any order.
- Submit is disabled until all rows have a selection.

### Pre-reveal visuals

- Selected side gets a clear filled state.
- Unselected side remains neutral.
- No correctness cues before submit.

### Reveal behavior

On submit:

- lock the board
- compute score
- reveal each row top-to-bottom over ~400–700ms total, not too slowly
- show exact values for both sides
- highlight correct side in each row
- optionally show a subtle red outline or “wrong” state for an incorrect user choice

### Post-reveal row design

Each revealed row should show:

- left value
- right value
- simple visual comparison bar
- category label and unit
- optional tiny source year badge

Example revealed row:

`GDP per capita (USD)`

- Brazil — `$10.4K`
- Japan — `$33.8K`

Optional bar treatment:

- left bar width relative to larger of the two
- right bar width relative to larger of the two

Do not overdesign the chart. Simple bars are enough.

---

## 4.3 Screen-share UX requirements

This product is primarily for one person sharing a screen to a group.

### Requirements

- Large font sizes
- High contrast
- Buttons at least ~44px tall
- No hover-only information
- No tiny badges that carry critical meaning
- Layout should still read clearly on a 13-inch laptop over Zoom/Meet
- The main game should be understandable from 6–8 feet away in a conference room

### Responsive behavior

#### Desktop / laptop (primary)

- show both country cards side by side
- show all 5 rows at once
- show actions in top-right or footer

#### Narrow screens

- still keep both country names visible
- use tighter row spacing
- allow category labels to wrap to two lines
- preserve large tap targets

MVP does **not** need a separate mobile-first design, but it should remain functional on mobile.

---

## 4.4 Accessibility

### Must-have accessibility requirements

- All controls are real `<button>` elements.
- Keyboard navigation works.
- Every row is understandable with screen readers.
- Selection state is not communicated by color alone.
- Reveal state is not communicated by color alone.
- Respect `prefers-reduced-motion`.

### Recommended semantics

Each row should behave like a two-option choice group. You can implement this with buttons plus accessible labels, or with a radio-group pattern if you prefer.

### Copy requirements

Avoid jargon. Use labels like:

- `GDP per capita (USD)`
- `Internet users (%)`
- `Life expectancy (years)`

not cryptic indicator IDs.

---

## 5. Content/data design

## 5.1 Core content strategy

Do **not** fetch live data in production at runtime.

Instead:

- store a normalized country dataset in the repo
- store category definitions in the repo
- optionally include scripts that rebuild the snapshot offline
- commit the snapshot to git

This keeps the app deterministic, fast, and infra-free.

## 5.2 Recommended starter dataset scope

Start with:

- ~80–150 playable countries
- 10–12 categories
- one pack: `world`

Do **not** auto-include every territory or edge-case geography. Use a curated `playable` boolean.

### Exclude from MVP if they create noise

- territories / non-sovereign regions
- aggregate rows (`World`, `Euro area`, etc.)
- countries missing multiple core metrics
- categories with weak coverage

---

## 5.3 Recommended starter categories

Use only categories where **higher numeric value** is intuitive and where coverage is strong.

Recommended MVP category pool:

1. Population
2. Land area
3. GDP
4. GDP per capita
5. Life expectancy
6. Urban population (%)
7. Internet users (%)
8. Forest area (%)
9. CO2 emissions per capita
10. Fertility rate
11. Renewable electricity output (%)
12. Exports of goods and services

You do **not** need all 12 on day one. Ten good categories is enough.

### Rules for category inclusion

A category should be included only if:

- it is numeric
- larger value = the intended answer
- it is explainable without a paragraph
- it has enough country coverage
- formatted values will fit comfortably in a row

### Avoid in MVP

- categories where “better” and “higher” are different concepts
- categories with confusing definitions
- categories with inconsistent or missing data for many countries
- categories that are too easy to Google from one visual cue

---

## 5.4 Data model

Use three main content structures:

1. `categories`
2. `countries`
3. `round`

### Category definition shape

```ts
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

export interface CategoryDefinition {
  id: MetricId;
  label: string;
  shortLabel?: string;
  family: MetricFamily;
  unitLabel: string;
  formatter:
    | 'compact-number'
    | 'compact-currency'
    | 'currency-per-capita'
    | 'percent-1'
    | 'decimal-1'
    | 'sq-km';
  sourceYear?: number;
  enabled: boolean;
  minRelativeDelta: number; // e.g. 0.03
  closeCallDelta: number;   // e.g. 0.08
}
```

### Country data shape

```ts
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
```

### Round shape

```ts
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
  correctSide: 'left' | 'right';
  relativeDiff: number;
  sourceYear?: number;
}

export interface HigherLowerRound {
  seed: string;
  packId: 'world';
  leftCountry: CountryRecord;
  rightCountry: CountryRecord;
  rows: RoundRow[];
}
```

### UI state shape

```ts
export interface GameState {
  phase: 'playing' | 'revealed';
  selections: Record<string, 'left' | 'right' | null>;
  score: number | null;
}
```

---

## 5.5 Formatting rules

Implement one formatting utility and use it everywhere.

### Examples

- population → `203M`
- GDP → `$1.92T`
- GDP per capita → `$33.8K`
- land area → `8.36M sq km`
- percent values → `74.2%`
- life expectancy → `82.6 years`
- fertility rate → `1.4`

### Rules

- Use compact number formatting where possible.
- Keep decimals to 0–1 places unless precision really matters.
- Do not switch formats between play and reveal.
- Unit label should be visible before the guess.

---

## 6. Round generation spec

This is the most important logic in the app.

## 6.1 Goals of the generator

A good round should:

- be answerable
- have no ties
- include 5 valid categories
- feel balanced (roughly 2–3 or 3–2 split between left/right winners)
- have category variety
- avoid all rows being obvious
- avoid all rows being coin flips

## 6.2 Determinism

Generation must be deterministic from:

- `seed`
- `packId`
- current dataset snapshot

The same seed and dataset should always produce the same round.

## 6.3 Seed behavior

### URL contract

Use query params:

- `seed` — random alphanumeric string, e.g. `K7Q2M9`
- `pack` — `world`

Examples:

- `/`
- `/?seed=K7Q2M9&pack=world`

### Behavior

- If no `seed` is present, generate one client-side on first load.
- Replace the URL with the generated seed without reloading.
- `New round` generates a new seed and updates the URL.
- `Copy link` copies the full current URL.

## 6.4 Pair selection algorithm

Implement a runtime generator that chooses a country pair and then a set of rows.

### Definitions

```ts
relativeDiff = Math.abs(a - b) / Math.max(Math.abs(a), Math.abs(b))
```

### Eligibility rules for a category on a given pair

A category is eligible if:

- both countries have data for that metric
- values are not equal
- `relativeDiff >= minRelativeDelta`

### Pair validity rules

A pair is valid if it has:

- at least 8 eligible categories total
- at least 3 metric families represented among those eligible categories

### Row-combination rules

A 5-row set is valid if:

- exactly 5 rows
- answer split is `2–3` or `3–2`
- no more than 2 rows from the same family
- at most 1 “close call” row (`relativeDiff < closeCallDelta`)
- at least 1 more obvious row (`relativeDiff >= 0.20` recommended)

### Generator process

Recommended algorithm:

1. Build a list of playable countries.
2. Seed a deterministic RNG.
3. Deterministically shuffle countries.
4. Try country pairs in deterministic order until a valid round is found.
5. For each pair:
   - collect eligible categories
   - split them into left-winning and right-winning groups
   - search for valid 5-row combinations
   - score each combination
6. Return the highest-scoring valid combination.
7. If no round is found after N attempts, relax rules slightly or fall back to a precomputed safe round.

## 6.5 Combination scoring

You do not need a fancy ML ranking model. A simple heuristic score is enough.

Example scoring dimensions:

- **Balance**: prefer 2–3 / 3–2 answer split
- **Family diversity**: prefer 4–5 distinct families
- **Diff mix**: prefer a mix of obvious + medium + one close call at most
- **Novelty**: optional later; not needed for MVP

Simple example:

```ts
score =
  familyDiversity * 10 +
  (answerSplitIsBalanced ? 20 : 0) +
  obviousRowCount * 2 -
  tooManyCloseCallsPenalty -
  duplicateFamilyPenalty
```

## 6.6 Tie handling

MVP rule: **do not ship ties**.

If two values are too close, simply make that category ineligible for that pair.

## 6.7 Fallback behavior

If a seed cannot generate a valid round:

- try more pairs first
- then relax `minRelativeDelta` slightly
- if still failing, use a precomputed fallback round list

This ensures the page never breaks.

---

## 7. Recommended technical architecture

## 7.1 Stack

- Next.js
- App Router
- TypeScript
- Tailwind CSS (recommended for speed)
- local JSON data files
- no DB
- no auth
- no global state library required

## 7.2 Rendering strategy

### Recommended approach for MVP

Use a **static-export-friendly app** with **local data** and **client-side seeded round generation**.

That means:

- app can be deployed as static files
- no server is required for gameplay
- no route handlers are needed for v1
- no runtime network requests are required for the game itself

### Why this is the best tradeoff

- simplest deployment
- easiest for code agents to build and reason about
- deterministic and testable
- no infra or secrets
- avoids API rate limits / CORS / outages

## 7.3 Recommended component split

### Server component(s)

Use the route page as a thin wrapper that renders the shell.

### Client component(s)

The actual interactive game should be a Client Component. It is responsible for:

- reading/parsing query params
- generating a round from seed
- managing row selections
- computing score
- handling copy-link / new-round actions

## 7.4 State management

Use `useReducer` or a small collection of `useState` hooks. Do **not** add Zustand/Redux for MVP.

Suggested reducer actions:

```ts
type Action =
  | { type: 'LOAD_ROUND'; round: HigherLowerRound }
  | { type: 'SELECT'; rowId: string; side: 'left' | 'right' }
  | { type: 'SUBMIT' }
  | { type: 'RESET'; round: HigherLowerRound };
```

## 7.5 Assets

Prefer one of these for flags:

1. **flag emoji** derived from ISO2
2. static SVGs in `/public/flags`

Recommendation: use **flag emoji** in MVP to avoid unnecessary image complexity.

---

## 8. Project structure

```text
/app
  layout.tsx
  page.tsx
  globals.css

/components
  game-shell.tsx
  country-card.tsx
  metric-row.tsx
  reveal-bar.tsx
  score-banner.tsx
  header-actions.tsx

/data
  generated/
    countries.world.json
    categories.world.json
    fallback-rounds.world.json

/lib
  game/
    generate-round.ts
    score-round.ts
    seed.ts
    rng.ts
    format.ts
    rules.ts
    types.ts
  utils/
    cn.ts
    copy.ts

/scripts
  validate-dataset.mts
  build-dataset.mts
  fetch-worldbank.mts
  fetch-restcountries.mts

/tests
  unit/
    seed.test.ts
    format.test.ts
    generate-round.test.ts
    scoring.test.ts
  e2e/
    higher-or-lower.spec.ts
```

### Notes

- `build-dataset.mts` is optional for day one, but recommended.
- The app runtime should only use `data/generated/*`.
- The fetch scripts should never run in production.

---

## 9. Page and component spec

## 9.1 `app/page.tsx`

Responsibilities:

- load the local dataset
- render the shell component
- avoid any dynamic server features

Minimal responsibility. Keep business logic out of this file.

## 9.2 `GameShell`

Responsibilities:

- parse current seed/pack
- generate round
- own reducer/state
- render header, cards, rows, and footer actions

### Internal state

- `round`
- `phase`
- `selections`
- `score`
- `isCopying` (optional)
- `error` (if generation fails)

## 9.3 `CountryCard`

Props:

- country name
- flag
- region
- side (`left | right`)

Behavior:

- purely presentational
- should not include interactive logic

## 9.4 `MetricRow`

Props:

- row data
- selected side
- reveal state
- onSelect callback

Behavior before reveal:

- show label + unit
- show two selectable buttons

Behavior after reveal:

- show values
- show correct side
- show reveal bars
- preserve the user's choice indicator

## 9.5 `ScoreBanner`

Show:

- score out of 5
- small reaction copy

Example copy table:

- `5/5` → `Perfect round.`
- `4/5` → `Strong round.`
- `3/5` → `Solid.`
- `0–2/5` → `Rough one.`

Keep copy minimal and not cheesy.

## 9.6 `HeaderActions`

Actions:

- `Copy link`
- `New round`

### Copy behavior

- copy the full current URL
- optimistic toast text: `Link copied`
- fallback to a manual select/copy helper if clipboard API fails

### New round behavior

- generate new seed
- update URL
- regenerate round
- reset selections and phase

---

## 10. Algorithm pseudocode

## 10.1 Seed + RNG

Do not pull in a heavy dependency for seeded randomness unless you want to.

A simple deterministic setup is enough:

- hash string seed → 32-bit integer
- use `mulberry32` or equivalent PRNG

Example structure:

```ts
export function seedToInt(seed: string): number
export function createRng(seed: string): () => number
```

## 10.2 Round generator

```ts
export function generateRound({
  seed,
  packId,
  countries,
  categories,
  rowCount = 5,
}: GenerateRoundInput): HigherLowerRound {
  const rng = createRng(`${packId}:${seed}`);
  const playable = countries.filter((c) => c.playable);
  const shuffled = deterministicShuffle(playable, rng);

  for (let i = 0; i < shuffled.length; i++) {
    for (let j = i + 1; j < shuffled.length; j++) {
      const left = shuffled[i];
      const right = shuffled[j];

      const candidates = getEligibleRows(left, right, categories);
      if (!pairIsValid(candidates)) continue;

      const combos = findValidRowCombos(candidates, rowCount);
      if (!combos.length) continue;

      const best = pickBestCombo(combos);
      return buildRound(seed, packId, left, right, best);
    }
  }

  return getFallbackRound(seed, packId);
}
```

## 10.3 Scoring the player

```ts
export function scoreSelections(
  round: HigherLowerRound,
  selections: Record<string, 'left' | 'right' | null>
): number {
  return round.rows.reduce((acc, row) => {
    return acc + (selections[row.id] === row.correctSide ? 1 : 0);
  }, 0);
}
```

---

## 11. Styling and visual design

## 11.1 Visual direction

Use a clean, modern, slightly game-like UI, but keep it closer to a polished internal tool than an arcade game.

### Recommended baseline

- dark neutral background
- bright, legible surface cards
- one accent color for selections
- green for correct reveal
- red only for wrong state / bust state
- subtle motion only

## 11.2 Layout priorities

In order of importance:

1. country names
2. category labels
3. answer buttons
4. revealed numbers
5. decorative polish

## 11.3 Animation guidance

Use animation sparingly:

- selection: quick background/border transition
- reveal: stagger rows slightly
- score banner: fade/slide in
- perfect score: optional small flourish

No confetti dependency needed for MVP.

---

## 12. Error handling

The app should never land in a broken or blank state.

### Cases to handle

#### Invalid query params

- unknown `pack` → default to `world`
- missing/invalid `seed` → generate a fresh seed

#### No valid round found

- use fallback round
- show small non-blocking console warning in dev only

#### Clipboard failure

- show `Couldn’t copy link`
- optionally reveal the URL in a small input for manual copy

#### Data problems in dev

- validation script should fail fast
- runtime should still show an error box in development

---

## 13. Testing plan

## 13.1 Unit tests

Write tests for:

- `seedToInt`
- deterministic RNG
- number formatting
- relative diff calculation
- eligibility filtering
- valid round generation
- player scoring

### Required assertions

- same seed + same dataset => same round
- different seeds usually => different rounds
- every generated round has exactly 5 rows
- every row has a correct side
- no row has equal values
- submit scoring matches expected answers

## 13.2 Integration / component tests

Test:

- selecting answers updates UI
- submit is disabled until all rows are selected
- reveal state shows exact values
- score banner displays correct total
- new round resets state

## 13.3 End-to-end tests

Use Playwright for at least:

1. page loads
2. seed in URL reproduces same pair + row labels
3. user can answer all rows and reveal score
4. new round updates URL seed
5. copy link button is present

## 13.4 Data validation script

A script should assert:

- all enabled categories exist in dataset
- all playable countries have minimum required coverage
- no duplicate ISO codes
- no duplicate slugs
- fallback rounds reference valid countries/categories

---

## 14. Offline data ingestion plan (recommended, not required for day one)

MVP can launch with hand-authored JSON. However, a basic ingest pipeline is worth adding early.

## 14.1 Goal

Create scripts that fetch external source data and convert it into one normalized, checked-in snapshot.

## 14.2 Suggested pipeline

### Step 1: country metadata fetch

Fetch country metadata such as:

- common name
- ISO2 / ISO3
- region / subregion
- optional flag data

### Step 2: indicator fetch

Fetch selected metrics per country.

### Step 3: normalize

Convert into one stable internal format:

- numeric values only
- one record per playable country
- one `sourceYear` per category if possible

### Step 4: validate

Run coverage checks and write:

- `countries.world.json`
- `categories.world.json`
- optional `fallback-rounds.world.json`

### Step 5: commit snapshot

Do not depend on these fetches in production.

---

## 15. Local storage policy

Use local storage only for non-critical preferences.

Allowed in MVP:

- last selected pack
- reduced-motion override (optional)
- most recent seeds (optional)

Do **not** store gameplay-critical content there.

The game must work fully without local storage.

---

## 16. Performance targets

This is a tiny app. Keep it fast.

### Targets

- first usable render feels instant on desktop
- new round generation under ~50ms on modern laptop
- no layout shift on reveal
- no runtime network dependency for gameplay

### Practical guidance

- avoid heavy chart libraries
- avoid large icon libraries unless tree-shaken
- prefer CSS transitions over animation frameworks
- keep data small and normalized

---

## 17. Security and operational simplicity

### Explicit MVP rules

- no secrets
- no env vars required for basic local development
- no DB
- no external API keys
- no auth middleware
- no user-generated content

This should make the project safe and easy for an agent to build.

---

## 18. Milestone-based implementation plan

## Milestone 1 — App skeleton

Deliver:

- Next.js app bootstrapped
- App Router setup
- Tailwind configured (if using)
- page shell with static mock data

Definition of done:

- page renders a fake round
- responsive layout exists
- buttons are styled and interactive

## Milestone 2 — Core game state

Deliver:

- selection logic
- submit logic
- reveal state
- score banner

Definition of done:

- a hardcoded round is fully playable end-to-end

## Milestone 3 — Seeded round generation

Deliver:

- seed parsing/generation
- deterministic RNG
- runtime round generator
- URL update on new round

Definition of done:

- same seed reproduces same round
- new round changes seed and board

## Milestone 4 — Real dataset integration

Deliver:

- local generated JSON files
- formatting utilities
- actual category definitions
- country cards with real data

Definition of done:

- app works without mock data
- all generated rounds are valid

## Milestone 5 — Polish + a11y + tests

Deliver:

- reduced motion support
- keyboard navigation improvements
- unit tests
- Playwright smoke test
- copy link action

Definition of done:

- product feels handoff-ready

## Milestone 6 — Optional data scripts

Deliver:

- fetch/normalize scripts
- validation script
- fallback rounds generation

Definition of done:

- dataset can be rebuilt offline and committed

---

## 19. Acceptance criteria

The MVP is complete when all of the following are true:

1. The app runs locally with no DB and no external services.
2. Opening `/` shows a playable round.
3. A round contains exactly 5 rows.
4. Users can select answers in any order.
5. Submit is disabled until all 5 rows are answered.
6. Submitting reveals exact figures and the score.
7. Clicking `New round` changes the seed and resets the board.
8. Copying the current URL reproduces the same round elsewhere.
9. The app remains usable on a shared screen.
10. Tests cover determinism, generation, and scoring.

---

## 20. Nice-to-have features after MVP

Do not build these first.

- timer mode
- multiple packs (`US states`, `tech companies`, etc.)
- streak counter in local storage
- “hard mode” with closer matchups
- reveal-by-row mode instead of all-at-once
- tiny trivia card after each round
- precomputed daily round
- head-to-head multiplayer

---

## 21. Strong implementation recommendation

For the very first version, optimize for **clarity and determinism**, not feature count.

That means:

- one route
- one pack
- one game mode
- one dataset snapshot
- no backend
- no real-time features
- no fancy charts

A clean, reliable, static version will be much more useful than an overbuilt version with unnecessary infrastructure.

---

## 22. Suggested handoff prompt for Codex / Claude Code

Use this prompt when handing off:

> Build a Next.js + TypeScript App Router project that implements the attached `Higher or Lower` spec exactly. Keep the MVP fully static-export-friendly, with no database, no auth, and no runtime API dependencies. Store all data in local JSON files inside the repo. Implement deterministic seeded round generation from the URL, a 5-row round format, side-by-side country cards, submit-to-reveal gameplay, exact value formatting, copy-link behavior, and a `New round` action. Use clean accessible React components, Tailwind for styling, and add unit tests for seeding, generation, and scoring plus a small Playwright smoke test. Do not add extra product features unless they are required by the spec.


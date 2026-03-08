# Higher or Lower

Seeded country trivia built as a static-export-friendly Next.js app.

The game shows two countries and five categories. Players pick which side has the higher numeric value on each row, then reveal the full board at once.

The implementation follows the product spec in [docs/001-spec.md](docs/001-spec.md).

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Local JSON data in `data/generated`
- Vitest for unit tests
- Playwright for browser smoke tests

## Product Constraints

- One route: `/`
- One pack: `world`
- No backend
- No auth
- No database
- No runtime API calls for gameplay
- Deterministic rounds from URL seed

Example round URL:

```text
/?seed=K7Q2M9&pack=world
```

## Local Development

Install dependencies:

```bash
pnpm install
```

Start the app:

```bash
pnpm dev
```

Open `http://localhost:3000`.

## Scripts

- `pnpm dev`: run the local Next.js dev server
- `pnpm build`: create the static export in `out/`
- `pnpm start`: serve the built `out/` directory locally
- `pnpm lint`: run ESLint
- `pnpm test`: run unit tests
- `pnpm test:e2e`: run the Playwright smoke test
- `pnpm validate:data`: validate the committed dataset snapshot
- `pnpm build:data`: rebuild `data/generated/*` from source APIs

## Data

Runtime gameplay uses only committed files in `data/generated/`.

- `categories.world.json`
- `countries.world.json`
- `fallback-rounds.world.json`

`pnpm build:data` is an offline maintenance step for refreshing the snapshot. It fetches source data from Rest Countries and the World Bank, normalizes the result, and writes fresh generated JSON back into the repo. It is not used at runtime.

After rebuilding the snapshot, run:

```bash
pnpm validate:data
pnpm test
pnpm build
```

## Testing

Unit coverage includes:

- seed hashing and RNG determinism
- formatting
- eligibility rules
- round generation
- scoring

Browser coverage includes:

- loading a seeded round
- reproducing the same pair and labels from the same URL
- selecting all rows
- revealing the score
- generating a new round

## Project Layout

```text
app/                  Next.js route shell and global styles
components/           Game UI components
data/generated/       Committed runtime dataset snapshot
lib/game/             Seed, formatting, rules, generation, scoring
lib/utils/            Small UI helpers
scripts/              Dataset build and validation scripts
tests/unit/           Vitest coverage
tests/e2e/            Playwright smoke coverage
docs/                 Product spec and deployment notes
```

## Deployment

This project is configured for static export through Next.js.

Build output:

```text
out/
```

Deployment notes are in [docs/deployment.md](docs/deployment.md).

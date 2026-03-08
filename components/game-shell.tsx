'use client';

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';

import { generateRound } from '@/lib/game/generate-round';
import { scoreSelections } from '@/lib/game/score-round';
import { generateSeed, sanitizeSeed } from '@/lib/game/seed';
import type {
  CategoryDefinition,
  CountryRecord,
  FallbackRoundDefinition,
  GameState,
  HigherLowerRound,
  Side,
} from '@/lib/game/types';
import { copyText } from '@/lib/utils/copy';
import { cn } from '@/lib/utils/cn';

import { CountryCard } from './country-card';
import { HeaderActions } from './header-actions';
import { MetricRow } from './metric-row';
import { ScoreBanner } from './score-banner';

interface GameShellProps {
  categories: CategoryDefinition[];
  countries: CountryRecord[];
  fallbackRounds: FallbackRoundDefinition[];
}

type GameAction =
  | { type: 'LOAD_ROUND'; round: HigherLowerRound }
  | { type: 'SELECT'; rowId: string; side: Side }
  | { type: 'SUBMIT'; score: number };

interface GameReducerState extends GameState {
  round: HigherLowerRound | null;
}

function buildSelections(round: HigherLowerRound): Record<string, Side | null> {
  return round.rows.reduce<Record<string, Side | null>>((accumulator, row) => {
    accumulator[row.id] = null;
    return accumulator;
  }, {});
}

function reducer(state: GameReducerState, action: GameAction): GameReducerState {
  switch (action.type) {
    case 'LOAD_ROUND':
      return {
        round: action.round,
        phase: 'playing',
        score: null,
        selections: buildSelections(action.round),
      };
    case 'SELECT':
      if (!state.round || state.phase === 'revealed' || state.selections[action.rowId] === action.side) {
        return state;
      }

      return {
        ...state,
        selections: {
          ...state.selections,
          [action.rowId]: action.side,
        },
      };
    case 'SUBMIT':
      return {
        ...state,
        phase: 'revealed',
        score: action.score,
      };
    default:
      return state;
  }
}

function parseLocationState() {
  if (typeof window === 'undefined') {
    return {
      seed: null,
      packId: 'world' as const,
    };
  }

  const url = new URL(window.location.href);
  return {
    seed: sanitizeSeed(url.searchParams.get('seed')),
    packId: url.searchParams.get('pack') === 'world' ? ('world' as const) : ('world' as const),
  };
}

function buildRoundUrl(seed: string, packId: 'world') {
  const url = new URL(window.location.href);
  url.searchParams.set('seed', seed);
  url.searchParams.set('pack', packId);
  return url.toString();
}

export function GameShell({ categories, countries, fallbackRounds }: GameShellProps) {
  const [{ round, phase, score, selections }, dispatch] = useReducer(reducer, {
    round: null,
    phase: 'playing',
    score: null,
    selections: {},
  });
  const [seed, setSeed] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [manualCopyUrl, setManualCopyUrl] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const manualCopyRef = useRef<HTMLInputElement>(null);

  const loadRound = useCallback(
    (nextSeed: string, historyMode: 'replace' | 'push' | 'none' = 'replace') => {
      try {
        const nextRound = generateRound({
          seed: nextSeed,
          packId: 'world',
          countries,
          categories,
          fallbackRounds,
        });

        dispatch({ type: 'LOAD_ROUND', round: nextRound });
        setSeed(nextSeed);
        setError(null);
        setManualCopyUrl(null);
        setCopyStatus('idle');

        if (historyMode !== 'none') {
          const url = buildRoundUrl(nextSeed, 'world');
          window.history[historyMode === 'push' ? 'pushState' : 'replaceState']({}, '', url);
        }
      } catch (roundError) {
        console.error(roundError);
        setError('Could not generate a valid round from the local dataset.');
      } finally {
        setReady(true);
      }
    },
    [categories, countries, fallbackRounds],
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateReducedMotion = () => setReducedMotion(mediaQuery.matches);

    updateReducedMotion();
    mediaQuery.addEventListener('change', updateReducedMotion);

    const { seed: parsedSeed } = parseLocationState();
    loadRound(parsedSeed ?? generateSeed(), 'replace');

    const onPopState = () => {
      const { seed: popSeed } = parseLocationState();
      loadRound(popSeed ?? generateSeed(), 'none');
    };

    window.addEventListener('popstate', onPopState);
    return () => {
      mediaQuery.removeEventListener('change', updateReducedMotion);
      window.removeEventListener('popstate', onPopState);
    };
  }, [loadRound]);

  useEffect(() => {
    if (copyStatus === 'idle') {
      return undefined;
    }

    const timer = window.setTimeout(() => setCopyStatus('idle'), 1800);
    return () => window.clearTimeout(timer);
  }, [copyStatus]);

  useEffect(() => {
    if (manualCopyUrl && manualCopyRef.current) {
      manualCopyRef.current.focus();
      manualCopyRef.current.select();
    }
  }, [manualCopyUrl]);

  const allAnswered = useMemo(
    () => (round ? round.rows.every((row) => selections[row.id] !== null) : false),
    [round, selections],
  );

  const currentUrl = seed && ready && typeof window !== 'undefined' ? buildRoundUrl(seed, 'world') : null;

  const handleSelect = (rowId: string, side: Side) => {
    dispatch({ type: 'SELECT', rowId, side });
  };

  const handleSubmit = () => {
    if (!round || !allAnswered) {
      return;
    }

    dispatch({ type: 'SUBMIT', score: scoreSelections(round, selections) });
  };

  const handleNewRound = () => {
    loadRound(generateSeed(), 'push');
  };

  const handleCopyLink = async () => {
    const url = currentUrl ?? (typeof window !== 'undefined' ? window.location.href : '');
    if (!url) {
      return;
    }

    const didCopy = await copyText(url);
    if (didCopy) {
      setCopyStatus('success');
      setManualCopyUrl(null);
      return;
    }

    setCopyStatus('error');
    setManualCopyUrl(url);
  };

  if (!ready) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-line bg-panel/80 px-8 py-10 text-center shadow-glow backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-mist/70">Higher or Lower</p>
          <h1 className="mt-3 font-display text-4xl text-ink">Loading round...</h1>
        </div>
      </main>
    );
  }

  if (error || !round) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-xl rounded-[2rem] border border-danger/30 bg-danger/10 p-8 text-center shadow-glow backdrop-blur">
          <p className="text-xs uppercase tracking-[0.28em] text-danger/80">Generation error</p>
          <h1 className="mt-3 font-display text-4xl text-ink">Round unavailable</h1>
          <p className="mt-4 text-base text-ink/85">{error}</p>
          <button
            type="button"
            onClick={handleNewRound}
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-accentDeep bg-accent px-5 py-2 font-medium text-canvas transition hover:bg-[#ffc46a]"
          >
            Try another seed
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="rounded-[2.25rem] border border-white/10 bg-canvas/55 p-5 shadow-glow backdrop-blur sm:p-7 lg:p-8">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.28em] text-mist/80">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">World pack</span>
              <span>Seed {round.seed}</span>
            </div>
            <h1 className="mt-4 font-display text-5xl leading-none text-ink sm:text-6xl">Higher or Lower</h1>
            <p className="mt-4 max-w-xl text-lg text-mist">
              Pick the country with the higher value in each category.
            </p>
          </div>
          <HeaderActions onCopyLink={handleCopyLink} onNewRound={handleNewRound} copyStatus={copyStatus} />
        </header>

        <section className="mt-8 grid gap-4 lg:grid-cols-2" aria-label="Countries in play">
          <CountryCard country={round.leftCountry} side="left" />
          <CountryCard country={round.rightCountry} side="right" />
        </section>

        <section className="mt-8 space-y-4" aria-label="Game rows">
          {round.rows.map((row, index) => (
            <MetricRow
              key={row.id}
              row={row}
              index={index}
              leftCountryName={round.leftCountry.name}
              rightCountryName={round.rightCountry.name}
              selectedSide={selections[row.id]}
              phase={phase}
              onSelect={(side) => handleSelect(row.id, side)}
              reducedMotion={reducedMotion}
            />
          ))}
        </section>

        <footer className="mt-8 border-t border-white/10 pt-6">
          {phase === 'revealed' && score !== null ? (
            <div className="space-y-4">
              <ScoreBanner score={score} total={round.rows.length} />
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleNewRound}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-accentDeep bg-accent px-5 py-2 font-medium text-canvas transition hover:bg-[#ffc46a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  New round
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-2 font-medium text-ink transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {copyStatus === 'success' ? 'Link copied' : copyStatus === 'error' ? "Couldn't copy" : 'Copy link'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-mist">
                {allAnswered ? 'All five rows are locked in. Reveal when ready.' : 'Choose a side on every row to unlock submit.'}
              </p>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!allAnswered}
                className={cn(
                  'inline-flex min-h-12 items-center justify-center rounded-full border px-6 py-3 text-base font-medium transition',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                  allAnswered
                    ? 'border-accentDeep bg-accent text-canvas hover:bg-[#ffc46a]'
                    : 'cursor-not-allowed border-white/10 bg-white/5 text-mist/60',
                )}
              >
                Submit picks
              </button>
            </div>
          )}

          {manualCopyUrl ? (
            <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
              <label htmlFor="manual-copy-url" className="mb-2 block text-sm text-mist">
                Clipboard access failed. Copy this URL manually.
              </label>
              <input
                id="manual-copy-url"
                ref={manualCopyRef}
                readOnly
                value={manualCopyUrl}
                className="w-full rounded-xl border border-white/10 bg-canvas/70 px-4 py-3 text-sm text-ink"
              />
            </div>
          ) : null}
        </footer>
      </div>
    </main>
  );
}

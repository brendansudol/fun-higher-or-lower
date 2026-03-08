import type { RoundRow, Side } from '@/lib/game/types';
import { cn } from '@/lib/utils/cn';

import { RevealBar } from './reveal-bar';

interface MetricRowProps {
  row: RoundRow;
  index: number;
  leftCountryName: string;
  rightCountryName: string;
  selectedSide: Side | null;
  phase: 'playing' | 'revealed';
  onSelect: (side: Side) => void;
  reducedMotion: boolean;
}

function ChoiceCard({
  countryName,
  side,
  selectedSide,
  row,
  phase,
  onSelect,
}: {
  countryName: string;
  side: Side;
  selectedSide: Side | null;
  row: RoundRow;
  phase: 'playing' | 'revealed';
  onSelect: (side: Side) => void;
}) {
  const isSelected = selectedSide === side;
  const isCorrect = phase === 'revealed' && row.correctSide === side;
  const isWrongPick = phase === 'revealed' && isSelected && row.correctSide !== side;
  const displayValue = side === 'left' ? row.leftDisplay : row.rightDisplay;
  const rawValue = side === 'left' ? row.leftValue : row.rightValue;
  const maxValue = Math.max(row.leftValue, row.rightValue);

  return (
    <button
      type="button"
      onClick={() => onSelect(side)}
      disabled={phase === 'revealed'}
      aria-pressed={isSelected}
      aria-label={`Choose ${countryName} for ${row.label}`}
      className={cn(
        'group flex min-h-44 w-full flex-col rounded-[1.5rem] border p-4 text-left transition duration-200',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        phase === 'playing' && 'hover:border-white/25 hover:bg-white/[0.07]',
        isSelected ? 'border-accent bg-accent/10 shadow-[0_0_0_1px_rgba(255,184,77,0.3)]' : 'border-white/10 bg-white/[0.04]',
        isCorrect && 'border-success bg-success/10 shadow-[0_0_0_1px_rgba(67,197,158,0.25)]',
        isWrongPick && 'border-danger bg-danger/10 shadow-[0_0_0_1px_rgba(242,109,109,0.2)]',
        phase === 'revealed' && 'cursor-default',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-lg font-semibold text-ink">{countryName}</span>
        <div className="flex flex-col items-end gap-2 text-xs font-medium uppercase tracking-[0.22em] text-mist/70">
          {isSelected ? <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-1 text-accent">Selected</span> : null}
          {isCorrect ? <span className="rounded-full border border-success/30 bg-success/10 px-2 py-1 text-success">Correct</span> : null}
          {isWrongPick ? <span className="rounded-full border border-danger/30 bg-danger/10 px-2 py-1 text-danger">Wrong pick</span> : null}
        </div>
      </div>

      <div className="mt-auto min-h-20 pt-8">
        <div className={cn('transition-all duration-300', phase === 'revealed' ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0')}>
          <p className="text-2xl font-semibold text-ink sm:text-3xl">{phase === 'revealed' ? displayValue : ' '}</p>
          {phase === 'revealed' ? <RevealBar value={rawValue} maxValue={maxValue} tone={isCorrect ? 'success' : isWrongPick ? 'danger' : 'neutral'} /> : <div className="mt-3 h-2.5" />}
        </div>
      </div>
    </button>
  );
}

export function MetricRow({
  row,
  index,
  leftCountryName,
  rightCountryName,
  selectedSide,
  phase,
  onSelect,
  reducedMotion,
}: MetricRowProps) {
  return (
    <section
      data-testid="metric-row"
      aria-labelledby={`${row.id}-label`}
      className={cn(
        'rounded-[1.85rem] border border-line bg-panel/75 p-4 shadow-glow backdrop-blur transition duration-500 sm:p-5',
        phase === 'revealed' ? 'translate-y-0 opacity-100' : 'translate-y-0 opacity-100',
      )}
      style={
        phase === 'revealed' && !reducedMotion
          ? {
              transitionDelay: `${index * 90}ms`,
            }
          : undefined
      }
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 id={`${row.id}-label`} className="text-xl font-semibold text-ink sm:text-2xl">
            {row.label}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-mist">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{row.unitLabel}</span>
            {row.sourceYear ? <span>Source year {row.sourceYear}</span> : null}
          </div>
        </div>
        <p className="text-sm uppercase tracking-[0.22em] text-mist/70">Pick the higher value</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <ChoiceCard
          countryName={leftCountryName}
          side="left"
          selectedSide={selectedSide}
          row={row}
          phase={phase}
          onSelect={onSelect}
        />
        <ChoiceCard
          countryName={rightCountryName}
          side="right"
          selectedSide={selectedSide}
          row={row}
          phase={phase}
          onSelect={onSelect}
        />
      </div>
    </section>
  );
}

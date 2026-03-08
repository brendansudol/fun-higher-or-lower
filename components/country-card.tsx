import type { CountryRecord } from '@/lib/game/types';

interface CountryCardProps {
  country: CountryRecord;
  side: 'left' | 'right';
}

export function CountryCard({ country, side }: CountryCardProps) {
  return (
    <article
      data-testid={`country-${side}`}
      className="relative overflow-hidden rounded-[2rem] border border-line bg-panel/90 p-6 shadow-glow backdrop-blur"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent/90 via-white/50 to-success/60" />
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-mist/70">{side === 'left' ? 'Left country' : 'Right country'}</p>
          <h2 className="mt-2 font-display text-3xl leading-none text-ink sm:text-4xl">{country.name}</h2>
        </div>
        <span className="text-5xl leading-none" aria-hidden="true">
          {country.flagEmoji}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm text-mist">
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{country.region}</span>
        {country.subregion ? <span>{country.subregion}</span> : null}
      </div>
    </article>
  );
}

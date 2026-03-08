import { getScoreReaction } from '@/lib/game/score-round';

interface ScoreBannerProps {
  score: number;
  total: number;
}

export function ScoreBanner({ score, total }: ScoreBannerProps) {
  return (
    <div data-testid="score-banner" className="rounded-[1.75rem] border border-success/30 bg-success/10 px-5 py-4 shadow-glow">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-success/80">Round score</p>
          <p className="mt-1 font-display text-4xl text-ink sm:text-5xl">
            {score} / {total}
          </p>
        </div>
        <p className="text-lg text-ink/90">{getScoreReaction(score)}</p>
      </div>
    </div>
  );
}

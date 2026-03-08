import { cn } from '@/lib/utils/cn';

interface RevealBarProps {
  value: number;
  maxValue: number;
  tone: 'neutral' | 'success' | 'danger';
}

export function RevealBar({ value, maxValue, tone }: RevealBarProps) {
  const width = maxValue === 0 ? 0 : Math.max(8, Math.round((value / maxValue) * 100));

  return (
    <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/8" aria-hidden="true">
      <div
        className={cn(
          'h-full rounded-full transition-[width] duration-500 ease-out',
          tone === 'success' && 'bg-success',
          tone === 'danger' && 'bg-danger',
          tone === 'neutral' && 'bg-accent',
        )}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

import { cn } from '@/lib/utils/cn';

interface HeaderActionsProps {
  onCopyLink: () => void;
  onNewRound: () => void;
  copyStatus: 'idle' | 'success' | 'error';
}

const buttonClassName =
  'inline-flex min-h-11 items-center justify-center rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

export function HeaderActions({ onCopyLink, onNewRound, copyStatus }: HeaderActionsProps) {
  const copyLabel = copyStatus === 'success' ? 'Link copied' : copyStatus === 'error' ? "Couldn't copy" : 'Copy link';

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <button
        type="button"
        className={cn(buttonClassName, 'border-white/15 bg-white/5 text-ink hover:bg-white/10')}
        onClick={onCopyLink}
      >
        {copyLabel}
      </button>
      <button
        type="button"
        className={cn(buttonClassName, 'border-accentDeep bg-accent text-canvas hover:bg-[#ffc46a]')}
        onClick={onNewRound}
      >
        New round
      </button>
    </div>
  );
}

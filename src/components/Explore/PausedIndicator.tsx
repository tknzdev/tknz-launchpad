import { cn } from '@/lib/utils';

export const PausedIndicator = () => {
  return (
    <div
      className={cn(
        'flex items-center text-xs text-cyber-green-neon gap-1 md:border border-cyber-green-neon/60 md:rounded-none p-0.5 md:px-2 cyber-mono uppercase tracking-wider'
      )}
    >
      <span className="iconify ph--pause-circle-fill w-4 h-4 animate-pulse" />
      <span className="hidden md:block font-semibold">PAUSED</span>
    </div>
  );
};
import { cn } from "@/lib/utils";

export const PausedIndicator = () => {
  return (
    <div
      className={cn(
        "flex items-center text-xs text-black gap-1.5 border-2 border-cyber-green-neon rounded-lg px-3 py-1.5 cyber-mono uppercase tracking-wider bg-cyber-green-neon font-bold shadow-[0_0_15px_rgba(0,255,65,0.6)]",
      )}
    >
      <span className="iconify ph--pause-circle-fill w-5 h-5 animate-pulse" />
      <span className="font-black">PAUSED</span>
    </div>
  );
};

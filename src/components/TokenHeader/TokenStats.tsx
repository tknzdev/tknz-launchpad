import { useTokenInfo } from "@/hooks/queries";
import { formatReadablePercentChange } from "@/lib/format/number";
import { cn } from "@/lib/utils";
import React, { memo, useState } from "react";
import { getNumberColorCn } from "../ui/ReadableNumber";
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";

type TokenStatsProps = {
  className?: string;
};

export const TokenStatsTimeframe = {
  MIN_5: "5m",
  HOUR_1: "1h",
  HOUR_6: "6h",
  HOUR_24: "24h",
} as const;
export type TokenStatsTimeframe =
  (typeof TokenStatsTimeframe)[keyof typeof TokenStatsTimeframe];

export const DEFAULT_TIMEFRAME: TokenStatsTimeframe =
  TokenStatsTimeframe.HOUR_24;

export const TokenStats: React.FC<TokenStatsProps> = memo(({ className }) => {
  const [timeframe, setTimeframe] =
    useState<TokenStatsTimeframe>(DEFAULT_TIMEFRAME);

  return (
    <ToggleGroupPrimitive.Root
      className={cn("mb-2", className)}
      type="single"
      defaultValue={DEFAULT_TIMEFRAME}
      value={timeframe}
      onValueChange={(value) => {
        if (value) {
          setTimeframe(value as TokenStatsTimeframe);
        }
      }}
    >
      <div
        className={cn(
          "grid grid-cols-4 gap-[1px] p-[1px] rounded-lg bg-cyber-green-neon/20",
          "shadow-[0_0_20px_rgba(199,242,132,0.1)]"
        )}
      >
        <ToggleGroupItem value={TokenStatsTimeframe.MIN_5} />
        <ToggleGroupItem value={TokenStatsTimeframe.HOUR_1} />
        <ToggleGroupItem value={TokenStatsTimeframe.HOUR_6} />
        <ToggleGroupItem value={TokenStatsTimeframe.HOUR_24} />
      </div>
    </ToggleGroupPrimitive.Root>
  );
});

TokenStats.displayName = "TokenStats";

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  Omit<
    React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>,
    "children"
  > & {
    value: TokenStatsTimeframe;
  }
>(({ className, value, ...props }, ref) => {
  const { data: stats } = useTokenInfo(
    (data) => data?.baseAsset[`stats${value}`],
  );

  const priceChange =
    stats?.priceChange === undefined ? undefined : stats.priceChange / 100;

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        "flex flex-col items-center justify-center whitespace-nowrap py-3 px-4",
        "bg-black/90 text-cyber-green-neon/60",
        "transition-all duration-300 ease-out",
        "first:rounded-l-md last:rounded-r-md",
        "relative overflow-hidden isolate",
        // Hover state
        "hover:text-cyber-green-neon/80 hover:bg-black/70",
        // Active state
        "data-[state=on]:bg-cyber-green-neon data-[state=on]:text-black",
        "data-[state=on]:font-bold data-[state=on]:shadow-[inset_0_0_20px_rgba(0,0,0,0.3)]",
        // Glow effect for active state
        "data-[state=on]:after:absolute data-[state=on]:after:inset-0",
        "data-[state=on]:after:bg-gradient-to-t data-[state=on]:after:from-transparent data-[state=on]:after:to-white/10",
        "data-[state=on]:after:-z-10",
        // Disabled state
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      value={value}
      {...props}
    >
      <span className={cn(
        "text-xs font-medium tracking-wider uppercase transition-all duration-300",
        "data-[state=on]:text-black"
      )}>
        {value}
      </span>
      <div className={cn(
        "text-sm font-bold mt-0.5 transition-all duration-300",
        "data-[state=off]:opacity-80",
        priceChange !== undefined && priceChange >= 0 
          ? "data-[state=off]:text-cyber-green-terminal data-[state=on]:text-black" 
          : "data-[state=off]:text-red-500 data-[state=on]:text-black/90"
      )}>
        {formatReadablePercentChange(priceChange, { hideSign: "positive" })}
      </div>
    </ToggleGroupPrimitive.Item>
  );
});
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

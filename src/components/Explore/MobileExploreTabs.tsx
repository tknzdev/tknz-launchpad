import React from "react";
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";
import { useExplore } from "@/contexts/ExploreProvider";
import { ExploreTab } from "./types";
import { PausedIndicator } from "./PausedIndicator";
import { cn } from "@/lib/utils";

export const ExploreTabTitleMap: Record<ExploreTab, string> = {
  [ExploreTab.NEW]: `NEW`,
  [ExploreTab.GRADUATING]: `SOON`,
  [ExploreTab.GRADUATED]: `BONDED`,
};

export const MobileExploreTabs = () => {
  const { mobileTab, setMobileTab, pausedTabs } = useExplore();
  return (
    <div className="sticky inset-x-0 top-0 z-20 border-b border-cyber-green-neon/30 shadow-md shadow-cyber-black lg:hidden cyber-bg">
      <div className="px-2 py-1">
        <ToggleGroupPrimitive.Root
          className="flex h-9 w-full min-w-fit items-center gap-1 text-sm"
          type="single"
          value={mobileTab}
          onValueChange={(value) => {
            if (value) {
              setMobileTab(value as ExploreTab);
            }
          }}
        >
          <ToggleGroupItem value={ExploreTab.NEW}>
            {ExploreTabTitleMap[ExploreTab.NEW]}
            {mobileTab === ExploreTab.NEW && pausedTabs[ExploreTab.NEW] && (
              <PausedIndicator />
            )}
          </ToggleGroupItem>
          <ToggleGroupItem value={ExploreTab.GRADUATING}>
            {ExploreTabTitleMap[ExploreTab.GRADUATING]}
            {mobileTab === ExploreTab.GRADUATING &&
              pausedTabs[ExploreTab.GRADUATING] && <PausedIndicator />}
          </ToggleGroupItem>
          <ToggleGroupItem value={ExploreTab.GRADUATED}>
            {ExploreTabTitleMap[ExploreTab.GRADUATED]}
            {mobileTab === ExploreTab.GRADUATED &&
              pausedTabs[ExploreTab.GRADUATED] && <PausedIndicator />}
          </ToggleGroupItem>
        </ToggleGroupPrimitive.Root>
      </div>
    </div>
  );
};

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center gap-1 whitespace-nowrap rounded-none px-3 text-cyber-green-neon/60 transition-all cyber-mono text-xs uppercase tracking-wider",
        "data-[state=off]:hover:text-cyber-green-neon/80 data-[state=off]:hover:bg-cyber-green-neon/10",
        "data-[state=on]:bg-cyber-green-neon/20 data-[state=on]:text-cyber-green-neon data-[state=on]:shadow-inner-neon",
        "disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyber-green-neon",
        className,
      )}
      {...props}
    />
  );
});
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

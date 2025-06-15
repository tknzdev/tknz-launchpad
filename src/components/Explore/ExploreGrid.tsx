import { useDataStream } from "@/contexts/DataStreamProvider";
import { useEffect } from "react";
import { ExploreTab } from "./types";
import { ExploreColumn } from "./ExploreColumn";
import { cn } from "@/lib/utils";
import { MobileExploreTabs } from "./MobileExploreTabs";
import { useExplore } from "@/contexts/ExploreProvider";
import { useBreakpoint } from "@/lib/device";

type ExploreGridProps = {
  className?: string;
};

const ExploreGrid = ({ className }: ExploreGridProps) => {
  const { subscribeRecentTokenList, unsubscribeRecentTokenList } =
    useDataStream();
  const { mobileTab } = useExplore();
  const breakpoint = useBreakpoint();

  useEffect(() => {
    subscribeRecentTokenList();
    return () => {
      unsubscribeRecentTokenList();
    };
  }, [subscribeRecentTokenList, unsubscribeRecentTokenList]);

  const isMobile =
    breakpoint === "md" || breakpoint === "sm" || breakpoint === "xs";

  return (
    <div
      className={cn(
        "grid grid-cols-1 border-cyber-green-neon/30 max-lg:grid-rows-[auto_1fr] lg:grid-cols-3 lg:border xl:overflow-hidden cyber-card",
        className,
      )}
    >
      <MobileExploreTabs />

      <div className="contents divide-x divide-cyber-green-neon/30">
        <ExploreColumn tab={isMobile ? mobileTab : ExploreTab.NEW} />
        {!isMobile && <ExploreColumn tab={ExploreTab.GRADUATING} />}
        {!isMobile && <ExploreColumn tab={ExploreTab.GRADUATED} />}
      </div>
    </div>
  );
};

export default ExploreGrid;

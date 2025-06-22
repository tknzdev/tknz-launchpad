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
        "grid grid-cols-1 border-2 border-cyber-green-neon max-lg:grid-rows-[auto_1fr] lg:grid-cols-3 xl:overflow-hidden bg-black rounded-xl shadow-[0_0_30px_rgba(0,255,65,0.4)] overflow-hidden",
        className,
      )}
    >
      <MobileExploreTabs />

      <div className="contents divide-x-2 divide-cyber-green-neon">
        <ExploreColumn tab={isMobile ? mobileTab : ExploreTab.NEW} />
        {!isMobile && <ExploreColumn tab={ExploreTab.GRADUATING} />}
        {!isMobile && <ExploreColumn tab={ExploreTab.GRADUATED} />}
      </div>
    </div>
  );
};

export default ExploreGrid;

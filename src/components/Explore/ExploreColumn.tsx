import { useQueryClient } from "@tanstack/react-query";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  categorySortBy,
  categorySortDir,
  createPoolSorter,
} from "@/components/Explore/pool-utils";
import {
  ApeQueries,
  GemsTokenListQueryArgs,
  QueryData,
} from "@/components/Explore/queries";
import {
  ExploreTab,
  TokenListSortByField,
  normalizeSortByField,
} from "@/components/Explore/types";
import { TokenCardList } from "@/components/TokenCard/TokenCardList";
import { useExploreGemsTokenList } from "@/hooks/useExploreGemsTokenList";
import {
  EXPLORE_FIXED_TIMEFRAME,
  useExplore,
} from "@/contexts/ExploreProvider";
import { Pool } from "@/contexts/types";
import { isHoverableDevice, useBreakpoint } from "@/lib/device";

 type ExploreColumnProps = {
  tab: ExploreTab;
  /** Optional search query to filter tokens by name or symbol */
  searchQuery?: string;
  /** Optional minimum 24h volume filter (string to parse) */
  minVolume?: string;
  /** Optional creation date filter (ISO date string) */
  createdAfter?: string;
  /** Advanced toggles */
  verifiedOnly?: boolean;
  bondingCurveOnly?: boolean;
  graduatedOnly?: boolean;
};

export const ExploreTabTitleMap: Record<ExploreTab, string> = {
  [ExploreTab.NEW]: `NEW TOKENS`,
  [ExploreTab.GRADUATING]: `GRADUATING`,
  [ExploreTab.GRADUATED]: `GRADUATED`,
};

export const ExploreColumn: React.FC<ExploreColumnProps> = ({
  tab,
  searchQuery,
  minVolume,
  createdAfter,
  verifiedOnly,
  bondingCurveOnly,
  graduatedOnly,
}) => {
  const { pausedTabs, setTabPaused, request } = useExplore();
  const isPaused = pausedTabs[tab];
  const setIsPaused = useCallback(
    (paused: boolean) => setTabPaused(tab, paused),
    [setTabPaused, tab],
  );

  return (
    <div className="flex flex-col h-full lg:h-[calc(100vh-300px)]">
      {/* Desktop Column Header */}
      <div className="flex items-center justify-between p-4 max-lg:hidden border-b-2 border-cyber-green-neon bg-black shadow-[inset_0_0_20px_rgba(0,255,65,0.2)]">
        <h2 className="font-black text-cyber-green-neon cyber-text text-lg tracking-[0.2em] uppercase text-shadow-neon">
          {ExploreTabTitleMap[tab]}
        </h2>
      </div>

      {/* List */}
      <div className="relative flex-1 border-cyber-green-neon/50 text-xs lg:border-t-2 h-full bg-black/80">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-4 bg-gradient-to-b from-black to-transparent" />
        <TokenCardListContainer
          tab={tab}
          request={request}
          isPaused={isPaused}
          setIsPaused={setIsPaused}
          searchQuery={searchQuery}
          minVolume={minVolume}
          createdAfter={createdAfter}
        />
      </div>
    </div>
  );
};

 type TokenCardListContainerProps = {
  tab: ExploreTab;
  request: Required<GemsTokenListQueryArgs>;
  isPaused: boolean;
  setIsPaused: (isPaused: boolean) => void;
  /** Optional search query to filter tokens by name or symbol */
  searchQuery?: string;
  /** Optional minimum 24h volume filter (string to parse) */
  minVolume?: string;
  /** Optional creation date filter (ISO date string) */
  createdAfter?: string;
  /** Advanced toggles */
  verifiedOnly?: boolean;
  bondingCurveOnly?: boolean;
  graduatedOnly?: boolean;
};

const timeframe = EXPLORE_FIXED_TIMEFRAME;

const TokenCardListContainer: React.FC<TokenCardListContainerProps> = memo(
  ({
    tab,
    request,
    isPaused,
    setIsPaused,
    searchQuery,
    minVolume,
    createdAfter,
    verifiedOnly,
    bondingCurveOnly,
    graduatedOnly,
  }) => {
    const queryClient = useQueryClient();
    const breakpoint = useBreakpoint();
    const isMobile =
      breakpoint === "md" || breakpoint === "sm" || breakpoint === "xs";

    const listRef = useRef<HTMLDivElement>(null);

    const { data: currentData, status } = useExploreGemsTokenList(
      (data) => data[tab],
    );

    const [snapshotData, setSnapshotData] = useState<Pool[]>();

    const handleMouseEnter = useCallback(() => {
      if (!isHoverableDevice() || status !== "success") {
        return;
      }

      // When clicking elements (copyable) it triggers mouse enter again
      // We don't want to re-snapshot data if already paused
      if (!isPaused) {
        setSnapshotData(currentData?.pools);
      }
      setIsPaused(true);
    }, [currentData?.pools, isPaused, setIsPaused, status]);

    const handleMouseLeave = useCallback(() => {
      if (!isHoverableDevice()) return;

      setIsPaused(false);
    }, [setIsPaused]);

    // Mutate the args so stream sorts by timeframe
    useEffect(() => {
      queryClient.setQueriesData(
        {
          type: "active",
          queryKey: ApeQueries.gemsTokenList(request).queryKey,
        },
        (prev?: QueryData<typeof ApeQueries.gemsTokenList>) => {
          const prevPools = prev?.[tab]?.pools;
          if (!prevPools) return;

          const pools = [...prevPools];

          // Re-sort
          const sortDir = categorySortDir(tab);
          let sortBy: TokenListSortByField | undefined;
          const defaultSortBy = categorySortBy(tab, timeframe);
          if (defaultSortBy) {
            sortBy = normalizeSortByField(defaultSortBy);
          }
          if (sortBy) {
            const sorter = createPoolSorter(
              {
                sortBy,
                sortDir,
              },
              timeframe,
            );
            pools.sort(sorter);
          }

          return {
            ...prev,
            [tab]: {
              ...prev[tab],
              pools,
            },
            args: {
              ...prev?.args,
              timeframe,
            },
          };
        },
      );
    }, [queryClient, tab, request]);

    const handleScroll = useCallback(() => {
      if (!isMobile || !listRef.current) return;

      const top = listRef.current.getBoundingClientRect().top;

      if (top <= 0) {
        // Only snapshot on initial pause
        if (!isPaused) {
          setSnapshotData(currentData?.pools);
        }
        setIsPaused(true);
      } else {
        setIsPaused(false);
      }
    }, [currentData?.pools, isPaused, setIsPaused, isMobile]);

    // Handle scroll pausing on mobile
    useEffect(() => {
      if (!isMobile) return;

      // Initial check
      handleScroll();

      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => {
        window.removeEventListener("scroll", handleScroll);
        setIsPaused(false);
      };
    }, [isMobile, setIsPaused, handleScroll]);

    // Map snapshot data to current data for most recent updated data
    const displayData = isPaused
      ? snapshotData?.map((snapshotPool) => {
          const current = currentData?.pools.find(
            (p) => p.baseAsset.id === snapshotPool.baseAsset.id,
          );
          if (current) {
            return current;
          }
          return snapshotPool;
        })
      : currentData?.pools;
    // Apply filters: search by name/symbol, min 24h volume, created after date
    const filteredData = displayData?.filter((pool) => {
      // Advanced toggles
      if (verifiedOnly && !pool.baseAsset.isVerified) {
        return false;
      }
      if (bondingCurveOnly && pool.bondingCurve == null) {
        return false;
      }
      if (graduatedOnly && !pool.baseAsset.graduatedAt) {
        return false;
      }
      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const name = pool.baseAsset.name.toLowerCase();
        const symbol = pool.baseAsset.symbol.toLowerCase();
        if (!name.includes(q) && !symbol.includes(q)) {
          return false;
        }
      }
      // Volume filter
      if (minVolume) {
        const minVol = parseFloat(minVolume);
        const vol = pool.volume24h ?? 0;
        if (isNaN(minVol) || vol < minVol) {
          return false;
        }
      }
      // Created date filter
      if (createdAfter) {
        const createdDate = new Date(pool.createdAt);
        const afterDate = new Date(createdAfter);
        if (createdDate < afterDate) {
          return false;
        }
      }
      return true;
    });

    return (
      <TokenCardList
        ref={listRef}
        data={filteredData}
        status={status}
        timeframe={timeframe}
        trackPools
        className="lg:h-0 lg:min-h-full"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
    );
  },
);

TokenCardListContainer.displayName = "TokenCardListContainer";

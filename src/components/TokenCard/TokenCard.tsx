import React from "react";

import { Pool, TokenListTimeframe } from "../Explore/types";

import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/Skeleton";
import { TrenchesPoolTokenIcon } from "../TokenIcon/TokenIcon";
import { Copyable } from "../ui/Copyable";
import CopyIconSVG from "@/icons/CopyIconSVG";
import { TokenAge } from "../TokenAge";
import { TokenSocials } from "../TokenSocials";
import { TokenCardMcapMetric, TokenCardVolumeMetric } from "./TokenCardMetric";
import Link from "next/link";

type TokenCardProps = {
  pool: Pool;
  timeframe: TokenListTimeframe;
  rowRef: (element: HTMLElement | null, poolId: string) => void;
};

export const TokenCard: React.FC<TokenCardProps> = ({
  pool,
  timeframe,
  rowRef,
}) => {
  const stats = pool.baseAsset[`stats${timeframe}`];

  return (
    <div
      ref={(el) => rowRef(el, pool.id)}
      data-pool-id={pool.id}
      className="relative flex cursor-pointer items-center bg-black/90 border border-cyber-green-neon/50 py-4 pl-2 pr-3 text-xs hover:bg-cyber-green-neon/20 hover:border-cyber-green-neon hover:shadow-[0_0_20px_rgba(0,255,65,0.5)] [&:nth-child(n+2)]:border-t transition-all duration-200 group"
    >
      <div className="shrink-0 pl-2 pr-4 transition-transform duration-200 group-hover:scale-110">
        <TrenchesPoolTokenIcon width={54} height={54} pool={pool} />
      </div>

      {/* Info */}
      <div className="flex w-full flex-col gap-1.5 overflow-hidden">
        {/* 1st row */}
        <div className="flex w-full items-center justify-between">
          <div className="overflow-hidden">
            <div className="flex items-center gap-1 xl:gap-1.5">
              <div
                className="whitespace-nowrap text-base font-bold text-cyber-green-neon cyber-mono transition-all duration-200 group-hover:text-white group-hover:text-shadow-neon"
                title={pool.baseAsset.symbol}
              >
                {pool.baseAsset.symbol}
              </div>

              <div className="ml-1 flex items-center gap-1 overflow-hidden z-10">
                <Copyable
                  name="Address"
                  copyText={pool.baseAsset.id}
                  className="z-[1] flex min-w-0 items-center gap-0.5 text-xs leading-none text-cyber-green-neon/80 duration-300 hover:text-white data-[copied=true]:text-white"
                >
                  {(copied) => (
                    <>
                      <div
                        className="truncate text-xs transition-colors duration-200 font-medium"
                        title={pool.baseAsset.name}
                      >
                        {pool.baseAsset.name}
                      </div>
                      {copied ? (
                        <div className="iconify h-3 w-3 shrink-0 text-white ph--check-bold" />
                      ) : (
                        <CopyIconSVG
                          className="h-3 w-3 shrink-0 transition-all duration-200 opacity-80 hover:opacity-100 hover:text-white"
                          width={12}
                          height={12}
                        />
                      )}
                    </>
                  )}
                </Copyable>
              </div>
            </div>
          </div>
        </div>

        {/* 2nd row */}
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <TokenAge
              className="cyber-mono text-cyber-green-neon font-medium transition-colors duration-200 group-hover:text-white"
              date={pool.createdAt}
            />
            <TokenSocials className="z-[1] transition-all duration-200 opacity-90 group-hover:opacity-100" token={pool.baseAsset} />
          </div>

          {/* Token metric */}
          <div className="flex items-center gap-3">
            <TokenCardVolumeMetric
              buyVolume={stats?.buyVolume}
              sellVolume={stats?.sellVolume}
            />
            <TokenCardMcapMetric mcap={pool.baseAsset.mcap} />
          </div>
        </div>
      </div>

      <Link
        className="absolute inset-0 cursor-pointer rounded-none"
        href={`/token/${pool.baseAsset.id}`}
      />
    </div>
  );
};

type TokenCardSkeletonProps = React.ComponentPropsWithoutRef<"div">;

export const TokenCardSkeleton: React.FC<TokenCardSkeletonProps> = ({
  className,
  ...props
}) => (
  <div
    className={cn(
      "border-b border-cyber-green-neon/30 py-3 pl-1.5 pr-2 text-xs",
      className,
    )}
    {...props}
  >
    <div className="flex items-center">
      {/* Icon */}
      <div className="shrink-0 pl-2 pr-4">
        <Skeleton className="h-14 w-14 rounded-full bg-cyber-green-neon/20" />
      </div>

      {/* Info */}
      <div className="flex w-full flex-col gap-2 overflow-hidden">
        {/* 1st row */}
        <div className="flex w-full items-center justify-between gap-1">
          {/* Left side: Symbol, Name, Icons, Metrics */}
          <div className="flex flex-col gap-1 overflow-hidden">
            {/* Symbol/Name/Icons */}
            <div className="flex items-center gap-1">
              <Skeleton className="h-5 w-16 bg-cyber-green-neon/20" />{" "}
              {/* Symbol */}
            </div>
            {/* Metrics */}
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-3 w-24 bg-cyber-green-neon/20" />
            </div>
          </div>

          {/* Right side: Quickbuy */}
          <div className="shrink-0">
            <Skeleton className="h-6 w-6 rounded-full lg:w-12 bg-cyber-green-neon/20" />
          </div>
        </div>

        {/* 2nd row */}
        <div className="flex w-full items-center justify-between">
          {/* Left side: Age, Socials */}
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-3 w-10 bg-cyber-green-neon/20" />
          </div>

          {/* Right side: Volume, MC */}
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-5 w-10 bg-cyber-green-neon/20" /> {/* V */}
            <Skeleton className="h-5 w-10 bg-cyber-green-neon/20" /> {/* MC */}
          </div>
        </div>
      </div>
    </div>
  </div>
);

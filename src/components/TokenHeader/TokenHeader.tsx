import { useMinimalTokenInfo, useTokenInfo } from "@/hooks/queries";
import { cn } from "@/lib/utils";
import { memo } from "react";
import { getNumberColorCn, ReadableNumber } from "../ui/ReadableNumber";
import { formatReadablePercentChange } from "@/lib/format/number";
import { Copyable } from "../ui/Copyable";
import { TruncatedAddress } from "../TruncatedAddress/TruncatedAddress";
import CopyIconSVG from "@/icons/CopyIconSVG";
import { TrenchesTokenIcon, TrenchesTokenIconImage } from "../TokenIcon";

type TokenHeaderProps = {
  className?: string;
};

export const TokenHeader: React.FC<TokenHeaderProps> = memo(({ className }) => {
  const { data: pool } = useTokenInfo();
  const { data: minimalTokenInfo } = useMinimalTokenInfo();

  const pctChange =
    pool?.baseAsset.stats24h?.priceChange === undefined
      ? undefined
      : pool.baseAsset.stats24h.priceChange / 100;

  return (
    <div className={cn("flex items-center overflow-hidden w-full", className)}>
      <div className="relative mr-2 flex shrink-0 items-center rounded-lg bg-neutral-850 transition-transform duration-300 hover:scale-105">
        <TrenchesTokenIcon className="rounded-lg" token={minimalTokenInfo}>
          <TrenchesTokenIconImage className="rounded-lg" />
        </TrenchesTokenIcon>
      </div>

      <div className="flex flex-1 justify-between gap-2.5 overflow-hidden">
        <div className="flex flex-col justify-center gap-0.5">
          <h1 className="cursor-pointer truncate font-medium leading-none tracking-tight text-cyber-green-neon hover:text-cyber-green-terminal transition-colors duration-300">
            {minimalTokenInfo?.symbol}
          </h1>

          {minimalTokenInfo && (
            <Copyable
              name="Address"
              copyText={minimalTokenInfo.address}
              className={cn(
                "flex min-w-0 items-center gap-0.5 text-sm text-neutral-500 duration-500 hover:text-neutral-200 group/copy",
              )}
            >
              {(copied) => (
                <>
                  <TruncatedAddress
                    className={cn(
                      "min-w-0 overflow-hidden text-clip whitespace-nowrap leading-none tracking-tight transition-colors duration-300 group-hover/copy:text-cyber-green-neon/80",
                      {
                        "text-cyber-green-terminal": copied,
                      },
                    )}
                    address={minimalTokenInfo.address}
                  />
                  {copied ? (
                    <span className="iconify shrink-0 text-cyber-green-terminal transition-transform duration-300 scale-110" />
                  ) : (
                    <CopyIconSVG 
                      className="shrink-0 opacity-60 transition-all duration-300 group-hover/copy:opacity-100 group-hover/copy:text-cyber-green-neon" 
                      width={11} 
                      height={11} 
                    />
                  )}
                </>
              )}
            </Copyable>
          )}
        </div>

        <div
          className={cn(
            "flex flex-col items-end justify-center gap-0.5 transition-transform duration-300 hover:scale-105",
            className,
          )}
        >
          <ReadableNumber
            className="leading-none tracking-tight font-semibold text-cyber-green-neon"
            format="price"
            num={pool?.baseAsset.usdPrice}
            prefix="$"
            animated
            showDirection
          />
          <div
            className={cn(
              "text-xs leading-none font-semibold transition-colors duration-300",
              getNumberColorCn(pctChange),
            )}
          >
            {formatReadablePercentChange(pctChange, { hideSign: "positive" })}
          </div>
        </div>
      </div>
    </div>
  );
});

TokenHeader.displayName = "TokenHeader";

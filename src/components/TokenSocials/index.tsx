import { memo, useCallback, useMemo } from "react";
import { Pool } from "../Explore/types";
import { cn } from "@/lib/utils";
import { HoverPopover } from "../ui/HoverPopover";
import { ExternalLink } from "../ui/ExternalLink";
import TelegramIcon from "@/icons/TelegramIcon";
import { WebsiteIcon } from "@/icons/WebsiteIcon";
import SearchIcon from "@/icons/SearchIcon";

type PartialBaseAsset = Pick<
  Pool["baseAsset"],
  "id" | "website" | "twitter" | "telegram" | "launchpad" | "symbol"
>;

type TokenSocialsProps = React.ComponentPropsWithoutRef<"span"> & {
  token: PartialBaseAsset;
};

export const TokenSocials: React.FC<TokenSocialsProps> = memo(
  ({ token, className, ...props }) => {
    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.stopPropagation();
      },
      [],
    );

    return (
      <span
        className={cn(
          "flex items-center gap-[5px] [--icon-color:theme(colors.neutral.700)]",
          className,
        )}
        {...props}
      >
        <HoverPopover content={`Search CA on X`} sideOffset={4}>
          <ExternalLink
            className="group/icon relative"
            onClick={handleClick}
            href={`https://x.com/search?q=${token.id}`}
          >
            <SearchIcon
              className="text-[--icon-color] opacity-60 transition-all duration-300 group-hover/icon:opacity-100 group-hover/icon:text-cyber-green-neon group-hover/icon:scale-110"
              aria-label={`Search CA on X`}
              width={12}
              height={12}
            />
          </ExternalLink>
        </HoverPopover>
        {token.telegram && (
          <ExternalLink
            className="group/icon relative"
            onClick={handleClick}
            href={token.telegram}
          >
            <TelegramIcon 
              className="text-[--icon-color] opacity-60 transition-all duration-300 group-hover/icon:opacity-100 group-hover/icon:text-cyber-green-neon group-hover/icon:scale-110"
              aria-label="Telegram" 
            />
          </ExternalLink>
        )}
        {token.website && (
          <ExternalLink
            className="group/icon relative"
            onClick={handleClick}
            href={token.website}
          >
            <WebsiteIcon 
              className="text-[--icon-color] opacity-60 transition-all duration-300 group-hover/icon:opacity-100 group-hover/icon:text-cyber-green-neon group-hover/icon:scale-110"
              aria-label="Website" 
            />
          </ExternalLink>
        )}
      </span>
    );
  },
);

TokenSocials.displayName = "TokenSocials";

import React from "react";
import { useTokenInfo } from "@/hooks/queries";
import { ExternalLink } from "../ui/ExternalLink";
import { cn } from "@/lib/utils";
import styles from "./index.module.css";

export const TokenMetadata: React.FC<{ className?: string }> = ({ className }) => {
  const { data: baseAsset } = useTokenInfo((data) => data?.baseAsset);
  if (!baseAsset) {
    return null;
  }
  const links: Array<{ label: string; url: string }> = [];
  if (baseAsset.website) {
    links.push({ label: "Website", url: baseAsset.website });
  }
  if (baseAsset.twitter) {
    links.push({ label: "Twitter", url: baseAsset.twitter });
  }
  if (baseAsset.telegram) {
    links.push({ label: "Telegram", url: baseAsset.telegram });
  }
  if (baseAsset.dev) {
    links.push({ label: "Developer", url: `https://solscan.io/account/${baseAsset.dev}` });
  }
  if (links.length === 0) {
    return null;
  }
  return (
    <div className={cn("flex flex-col gap-2 p-2.5", styles.animateIn, className)}>
      <h2 className="text-sm font-semibold">Links</h2>
      <div className="flex flex-col gap-1 text-sm text-neutral-700">
        {links.map(({ label, url }) => (
          <div key={url} className="flex items-center gap-1">
            <span className="font-medium text-neutral-700">{label}:</span>
            <ExternalLink
              href={url}
              className="underline hover:text-neutral-900"
            >
              {url.length > 50 ? url.slice(0, 50) + "..." : url}
            </ExternalLink>
          </div>
        ))}
      </div>
    </div>
  );
};
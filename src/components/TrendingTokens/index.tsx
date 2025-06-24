import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format/number";
import { ArrowUpIcon } from "@/icons/ArrowUpIcon";
import { ArrowDownIcon } from "@/icons/ArrowDownIcon";
import { FireIcon } from "@/icons/FireIcon";
import { TrenchesTokenIcon as TokenIcon } from "@/components/TokenIcon";

interface TrendingToken {
  mint: string;
  symbol: string;
  name: string;
  imageUrl?: string;
  depositLamports: number;
  launchTime: number;
  priceChange24h?: number;
  volume24h?: number;
  marketCap?: number;
  isGraduated?: boolean;
}

const TrendingTokens = () => {
  const router = useRouter();

  // Fetch marketplace data
  const { data: marketplaceData } = useQuery({
    queryKey: ["trending-tokens"],
    queryFn: async () => {
      const res = await fetch("/.netlify/functions/marketplace");
      if (!res.ok) throw new Error("Failed to fetch marketplace data");
      return res.json();
    },
    refetchInterval: 30000,
  });

  // Process and sort tokens by liquidity/volume
  const trendingTokens = marketplaceData?.entries
    ?.slice(0, 12)
    .map((token: any) => ({
      ...token,
      symbol: token.symbol || "???",
      name: token.name || "Unknown Token",
      volume24h: (token.depositLamports || 0) / 1e9 * 150 * 2.5, // Mock volume
      marketCap: (token.depositLamports || 0) / 1e9 * 150 * 10, // Mock market cap
      priceChange24h: Math.random() * 200 - 50, // Mock price change
    })) || [];

  return (
    <div className="w-full py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <FireIcon className="w-8 h-8 text-orange-500" />
            Trending Tokens
          </h2>
          <button
            onClick={() => document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-cyber-green-neon hover:text-cyber-green-neon/80 transition-colors"
          >
            View All →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {trendingTokens.map((token: TrendingToken, index: number) => (
            <TrendingTokenCard
              key={token.mint}
              token={token}
              rank={index + 1}
              onClick={() => router.push(`/token/${token.mint}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface TrendingTokenCardProps {
  token: TrendingToken;
  rank: number;
  onClick: () => void;
}

const TrendingTokenCard = ({ token, rank, onClick }: TrendingTokenCardProps) => {
  const isPositive = (token.priceChange24h || 0) > 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative bg-black/60 border border-gray-700 rounded-xl p-4",
        "hover:border-cyber-green-neon hover:shadow-[0_0_20px_rgba(0,255,65,0.3)]",
        "transition-all duration-300 cursor-pointer group"
      )}
    >
      {/* Rank badge */}
      {rank <= 3 && (
        <div className={cn(
          "absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
          rank === 1 && "bg-yellow-500 text-black",
          rank === 2 && "bg-gray-400 text-black",
          rank === 3 && "bg-orange-600 text-white"
        )}>
          {rank}
        </div>
      )}

      <div className="flex items-start gap-3 mb-3">
        <TokenIcon
          token={{
            logoURI: token.imageUrl,
            symbol: token.symbol,
            name: token.name,
            mint: token.mint,
          }}
          width={40}
          height={40}
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white truncate group-hover:text-cyber-green-neon transition-colors">
            {token.symbol}
          </h3>
          <p className="text-xs text-gray-400 truncate">{token.name}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">Price (24h)</span>
          <div className={cn(
            "flex items-center gap-1 text-sm font-semibold",
            isPositive ? "text-green-400" : "text-red-400"
          )}>
            {isPositive ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
            <span>{Math.abs(token.priceChange24h || 0).toFixed(2)}%</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">Volume (24h)</span>
          <span className="text-sm text-white font-medium">
            ${formatNumber(token.volume24h || 0)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">Market Cap</span>
          <span className="text-sm text-white font-medium">
            ${formatNumber(token.marketCap || 0)}
          </span>
        </div>
      </div>

      {token.isGraduated && (
        <div className="mt-3 text-center">
          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
            🎓 Graduated
          </span>
        </div>
      )}
    </div>
  );
};

export default TrendingTokens; 
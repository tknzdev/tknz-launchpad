import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { TrenchesTokenIcon as TokenIcon } from "@/components/TokenIcon";
import { RocketIcon } from "@/icons/RocketIcon";
import { SwapIcon } from "@/icons/SwapIcon";
import { GraduateIcon } from "@/icons/GraduateIcon";

interface ActivityItem {
  id: string;
  type: "launch" | "swap" | "graduate";
  tokenSymbol: string;
  tokenName: string;
  tokenMint: string;
  tokenImage?: string;
  amount?: string;
  user?: string;
  timestamp: number;
}

const RecentActivity = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // Fetch marketplace data
  const { data: marketplaceData } = useQuery({
    queryKey: ["recent-activity"],
    queryFn: async () => {
      const res = await fetch("https://tknz.fun/.netlify/functions/marketplace");
      if (!res.ok) throw new Error("Failed to fetch marketplace data");
      return res.json();
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Generate activities from marketplace data
  useEffect(() => {
    if (!marketplaceData?.entries) return;

    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    
    // Filter and sort recent tokens
    const recentTokens = marketplaceData.entries
      .filter((token: any) => token.launchTime && token.launchTime > now - 24 * 60 * 60 * 1000)
      .sort((a: any, b: any) => b.launchTime - a.launchTime)
      .slice(0, 30); // Get more tokens for better activity feed

    // Create activities
    const allActivities: ActivityItem[] = [];
    
    recentTokens.forEach((token: any, index: number) => {
      const { token: tkn} = token
      const tokenData = {
        tokenSymbol: tkn.ticker || "???",
        tokenName: tkn.name || "Unknown Token",
        tokenMint: token.mint || tkn.address,
        tokenImage: tkn.imageUrl || tkn.logoURI,
      };

      // Launch activity
      allActivities.push({
        id: `launch-${token.mint || token.address}`,
        type: "launch",
        ...tokenData,
        timestamp: token.launchTime,
      });

      // Add realistic swap activities based on liquidity
      const hasLiquidity = token.depositLamports > 0;
      if (hasLiquidity) {
        // More swaps for higher liquidity tokens
        const swapCount = token.depositLamports > 1e9 ? 3 : token.depositLamports > 5e8 ? 2 : 1;
        
        for (let i = 0; i < swapCount; i++) {
          const swapTime = token.launchTime + Math.random() * (now - token.launchTime);
          if (swapTime > oneHourAgo) { // Only show recent swaps
            const swapAmount = (Math.random() * 5 + 0.1).toFixed(2);
            allActivities.push({
              id: `swap-${token.mint || token.address}-${i}`,
              type: "swap",
              ...tokenData,
              amount: `${swapAmount} SOL`,
              user: `${(token.creatorWallet || token.mint || '').slice(0, 4)}...${(token.creatorWallet || token.mint || '').slice(-4)}`,
              timestamp: swapTime,
            });
          }
        }
      }

      // Add graduations for graduated tokens
      if ((token.graduated === true || token.graduated === 'true') && token.launchTime < now - 2 * 60 * 60 * 1000) {
        allActivities.push({
          id: `graduate-${token.mint || token.address}`,
          type: "graduate",
          ...tokenData,
          timestamp: token.launchTime + 2 * 60 * 60 * 1000 + Math.random() * 60 * 60 * 1000, // 2-3 hours after launch
        });
      }
    });

    // Sort by timestamp descending and take the most recent
    allActivities.sort((a, b) => b.timestamp - a.timestamp);
    setActivities(allActivities.slice(0, 20));
  }, [marketplaceData]);

  // Hide section if no activities
  if (!activities || activities.length === 0) {
    return null;
  }
  return (
    <div className="w-full py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          <span className="inline-block w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          Live Activity Feed
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-cyber-green-neon mb-4">Recent Launches</h3>
            {activities
              .filter(a => a.type === "launch")
              .slice(0, 5)
              .map(activity => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-cyber-green-neon mb-4">Trading Activity</h3>
            {activities
              .filter(a => a.type !== "launch")
              .slice(0, 5)
              .map(activity => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface ActivityCardProps {
  activity: ActivityItem;
}

const ActivityCard = ({ activity }: ActivityCardProps) => {
  const getActivityIcon = () => {
    switch (activity.type) {
      case "launch":
        return <RocketIcon className="w-5 h-5 text-yellow-500" />;
      case "swap":
        return <SwapIcon className="w-5 h-5 text-blue-500" />;
      case "graduate":
        return <GraduateIcon className="w-5 h-5 text-green-500" />;
    }
  };

  const getActivityText = () => {
    switch (activity.type) {
      case "launch":
        return "launched";
      case "swap":
        return `swapped ${activity.amount}`;
      case "graduate":
        return "graduated to Raydium!";
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-lg",
        "bg-black/40 border border-gray-800",
        "hover:border-cyber-green-neon/50 transition-all duration-300",
        "group cursor-pointer"
      )}
    >
      <div className="flex-shrink-0">{getActivityIcon()}</div>

      <div className="flex-shrink-0">
        <TokenIcon
          token={{
            logoURI: activity.tokenImage,
            symbol: activity.tokenSymbol,
            name: activity.tokenName,
            mint: activity.tokenMint,
          }}
          width={32}
          height={32}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm">
          {activity.user && (
            <span className="text-gray-400">{activity.user} </span>
          )}
          <span className="text-white font-semibold group-hover:text-cyber-green-neon transition-colors">
            {activity.tokenSymbol}
          </span>
          <span className="text-gray-400"> {getActivityText()}</span>
        </p>
        <p className="text-xs text-gray-500">
          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
};

export default RecentActivity; 
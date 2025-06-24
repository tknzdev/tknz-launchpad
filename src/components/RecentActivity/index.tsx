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
      const res = await fetch("/.netlify/functions/marketplace");
      if (!res.ok) throw new Error("Failed to fetch marketplace data");
      return res.json();
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Generate mock activities from marketplace data
  useEffect(() => {
    if (!marketplaceData?.entries) return;

    const recentTokens = marketplaceData.entries
      .slice(0, 20)
      .sort((a: any, b: any) => b.launchTime - a.launchTime);

    // Create mock activities
    const mockActivities: ActivityItem[] = [];
    
    recentTokens.forEach((token: any, index: number) => {
      // Launch activity
      mockActivities.push({
        id: `launch-${token.mint}`,
        type: "launch",
        tokenSymbol: token.symbol || "???",
        tokenName: token.name || "Unknown Token",
        tokenMint: token.mint,
        tokenImage: token.imageUrl,
        timestamp: token.launchTime,
      });

      // Add some mock swaps
      if (index % 2 === 0) {
        mockActivities.push({
          id: `swap-${token.mint}-${index}`,
          type: "swap",
          tokenSymbol: token.symbol || "???",
          tokenName: token.name || "Unknown Token",
          tokenMint: token.mint,
          tokenImage: token.imageUrl,
          amount: `${(Math.random() * 10).toFixed(2)} SOL`,
          user: `${token.mint.slice(0, 4)}...${token.mint.slice(-4)}`,
          timestamp: token.launchTime + Math.random() * 3600000, // Random time within 1 hour
        });
      }

      // Add graduations
      if (token.graduated && index % 3 === 0) {
        mockActivities.push({
          id: `graduate-${token.mint}`,
          type: "graduate",
          tokenSymbol: token.symbol || "???",
          tokenName: token.name || "Unknown Token",
          tokenMint: token.mint,
          tokenImage: token.imageUrl,
          timestamp: token.launchTime + 3600000 * 2, // 2 hours after launch
        });
      }
    });

    // Sort by timestamp descending
    mockActivities.sort((a, b) => b.timestamp - a.timestamp);
    setActivities(mockActivities.slice(0, 15));
  }, [marketplaceData]);

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
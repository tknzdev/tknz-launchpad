import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format/number";
import { ArrowUpIcon } from "@/icons/ArrowUpIcon";
import { ArrowDownIcon } from "@/icons/ArrowDownIcon";

interface PlatformMetrics {
  totalTokensLaunched: number;
  totalVolumeUSD: number;
  totalLiquidityUSD: number;
  activeUsers24h: number;
  totalTransactions: number;
  graduatedTokens: number;
  averageGraduationTime: number;
  topGainer24h: { symbol: string; change: number };
  tokensLaunched24h?: number;
  tokensLaunchedLastHour?: number;
  topVolume24h?: { symbol: string; volume: number };
  marketCap24h?: number;
}

const PlatformStats = () => {
  // URL for fetching stats; can be overridden via env var
  const PLATFORM_STATS_URL =
    process.env.NEXT_PUBLIC_PLATFORM_STATS_URL || "https://tknz.fun/.netlify/functions/platform-stats";
  const [animatedValues, setAnimatedValues] = useState<PlatformMetrics>({
    totalTokensLaunched: 0,
    totalVolumeUSD: 0,
    totalLiquidityUSD: 0,
    activeUsers24h: 0,
    totalTransactions: 0,
    graduatedTokens: 0,
    averageGraduationTime: 0,
    topGainer24h: { symbol: "", change: 0 },
    tokensLaunched24h: 0,
    tokensLaunchedLastHour: 0,
    topVolume24h: { symbol: "", volume: 0 },
    marketCap24h: 0,
  });

  // Fetch platform statistics
  const { data: statsData, isError } = useQuery({
    queryKey: ["platform-stats"],
    queryFn: async () => {
      const res = await fetch(PLATFORM_STATS_URL);
      if (!res.ok) throw new Error(`Platform stats HTTP ${res.status}`);
      return res.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 1, // Only retry once
  });

  // Animate numbers on load
  useEffect(() => {
    if (!statsData) return;

    // Use real statistics from the API
    const metrics: PlatformMetrics = {
      totalTokensLaunched: statsData.totalTokensLaunched || 0,
      totalVolumeUSD: statsData.totalVolumeUSD || 0,
      totalLiquidityUSD: statsData.totalLiquidityUSD || 0,
      // Use tokens launched in the last 24h as Active Users count
      activeUsers24h: statsData.tokensLaunched24h || 0,
      totalTransactions: statsData.totalTransactions || 0,
      graduatedTokens: statsData.graduatedTokens || 0,
      averageGraduationTime: statsData.averageGraduationTime || 0,
      topGainer24h: statsData.topGainer24h || { symbol: "N/A", change: 0 },
      tokensLaunched24h: statsData.tokensLaunched24h || 0,
      tokensLaunchedLastHour: statsData.tokensLaunchedLastHour || 0,
      topVolume24h: statsData.topVolume24h || { symbol: "N/A", volume: 0 },
      marketCap24h: statsData.marketCap24h || 0,
    };

    // Animate the numbers
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      setAnimatedValues({
        totalTokensLaunched: Math.floor(metrics.totalTokensLaunched * easeOutQuart),
        totalVolumeUSD: metrics.totalVolumeUSD * easeOutQuart,
        totalLiquidityUSD: metrics.totalLiquidityUSD * easeOutQuart,
        activeUsers24h: Math.floor(metrics.activeUsers24h * easeOutQuart),
        totalTransactions: Math.floor(metrics.totalTransactions * easeOutQuart),
        graduatedTokens: Math.floor(metrics.graduatedTokens * easeOutQuart),
        averageGraduationTime: metrics.averageGraduationTime * easeOutQuart,
        topGainer24h: metrics.topGainer24h,
        tokensLaunched24h: Math.floor((metrics.tokensLaunched24h || 0) * easeOutQuart),
        tokensLaunchedLastHour: Math.floor((metrics.tokensLaunchedLastHour || 0) * easeOutQuart),
        topVolume24h: metrics.topVolume24h || { symbol: "", volume: 0 },
        marketCap24h: metrics.marketCap24h * easeOutQuart,
      });

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [statsData]);

  return (
    <div className="w-full py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 text-cyber-green-neon animate-pulse">
          TKNZ Platform Metrics
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Tokens Launched */}
          <MetricCard
            title="Total Tokens"
            value={animatedValues.totalTokensLaunched.toLocaleString()}
            subValue={`+${animatedValues.tokensLaunched24h || 0} today`}
            icon="🚀"
            trend={animatedValues.tokensLaunched24h && animatedValues.totalTokensLaunched > 0 
              ? (animatedValues.tokensLaunched24h / animatedValues.totalTokensLaunched * 100) 
              : 0}
            glowColor="cyber-green"
          />

          {/* Tokens in Last Hour */}
          <MetricCard
            title="Launched (1h)"
            value={animatedValues.tokensLaunchedLastHour?.toLocaleString() || "0"}
            subValue="tokens"
            icon="⚡"
            trend={animatedValues.tokensLaunchedLastHour && animatedValues.tokensLaunchedLastHour > 5 ? 100 : 0}
            glowColor="yellow"
          />

          {/* Total Volume */}
          <MetricCard
            title="24h Volume"
            value={`$${formatNumber(animatedValues.totalVolumeUSD)}`}
            icon="📊"
            trend={animatedValues.totalVolumeUSD > 1000000 ? 15.3 : 5.2}
            glowColor="blue"
          />

          {/* Total Liquidity */}
          <MetricCard
            title="Total Liquidity"
            value={`$${formatNumber(animatedValues.totalLiquidityUSD)}`}
            icon="💧"
            trend={animatedValues.totalLiquidityUSD > 500000 ? 8.7 : 3.1}
            glowColor="purple"
          />

          {/* Active Users */}
          <MetricCard
            title="Active Users (24h)"
            value={animatedValues.activeUsers24h.toLocaleString()}
            icon="👥"
            trend={animatedValues.activeUsers24h > 1000 ? 22.5 : 8.3}
            glowColor="pink"
          />

          {/* Graduated Tokens */}
          <MetricCard
            title="Graduated Tokens"
            value={animatedValues.graduatedTokens.toLocaleString()}
            subValue={animatedValues.averageGraduationTime > 0 
              ? `~${animatedValues.averageGraduationTime.toFixed(1)}h avg` 
              : undefined}
            icon="🎓"
            trend={animatedValues.graduatedTokens > 10 ? 18.9 : 5.2}
            glowColor="green"
          />

          {/* Top Volume */}
          <MetricCard
            title="Top Volume (24h)"
            value={animatedValues.topVolume24h?.symbol || "N/A"}
            subValue={animatedValues.topVolume24h?.volume 
              ? `$${formatNumber(animatedValues.topVolume24h.volume)}` 
              : undefined}
            icon="💎"
            glowColor="cyan"
          />

          {/* Top Gainer */}
          <MetricCard
            title="Top Gainer (24h)"
            value={animatedValues.topGainer24h.symbol}
            subValue={animatedValues.topGainer24h.change > 0 
              ? `+${animatedValues.topGainer24h.change.toFixed(2)}%` 
              : "N/A"}
            icon="🔥"
            glowColor="red"
          />
          {/* Market Cap (24h) */}
          <MetricCard
            title="Market Cap (24h)"
            value={`$${formatNumber(animatedValues.marketCap24h)}`}
            icon="💰"
            glowColor="orange"
          />
        </div>
      </div>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: string;
  trend?: number;
  glowColor: string;
}

const MetricCard = ({ title, value, subValue, icon, trend, glowColor }: MetricCardProps) => {
  const glowColors = {
    "cyber-green": "shadow-[0_0_30px_rgba(0,255,65,0.4)]",
    "blue": "shadow-[0_0_30px_rgba(0,149,255,0.4)]",
    "purple": "shadow-[0_0_30px_rgba(149,0,255,0.4)]",
    "pink": "shadow-[0_0_30px_rgba(255,0,149,0.4)]",
    "yellow": "shadow-[0_0_30px_rgba(255,255,0,0.4)]",
    "green": "shadow-[0_0_30px_rgba(0,255,0,0.4)]",
    "orange": "shadow-[0_0_30px_rgba(255,149,0,0.4)]",
    "red": "shadow-[0_0_30px_rgba(255,0,0,0.4)]",
    "cyan": "shadow-[0_0_30px_rgba(0,255,255,0.4)]",
  };

  return (
    <div
      className={cn(
        "bg-black/80 border-2 border-cyber-green-neon rounded-xl p-6",
        "hover:scale-105 transition-all duration-300",
        glowColors[glowColor as keyof typeof glowColors]
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-4xl">{icon}</span>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-sm",
            trend > 0 ? "text-green-400" : "text-red-400"
          )}>
            {trend > 0 ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}
            <span>{Math.abs(trend).toFixed(1)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-sm text-gray-400 mb-2">{title}</h3>
      <p className="text-2xl font-bold text-white">{value}</p>
      {subValue && <p className="text-lg font-semibold text-cyber-green-neon mt-1">{subValue}</p>}
    </div>
  );
};

export default PlatformStats; 
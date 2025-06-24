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
}

const PlatformStats = () => {
  const [animatedValues, setAnimatedValues] = useState<PlatformMetrics>({
    totalTokensLaunched: 0,
    totalVolumeUSD: 0,
    totalLiquidityUSD: 0,
    activeUsers24h: 0,
    totalTransactions: 0,
    graduatedTokens: 0,
    averageGraduationTime: 0,
    topGainer24h: { symbol: "", change: 0 },
  });

  // Fetch marketplace data to calculate stats
  const { data: marketplaceData } = useQuery({
    queryKey: ["marketplace-stats"],
    queryFn: async () => {
      const res = await fetch("/.netlify/functions/marketplace");
      if (!res.ok) throw new Error("Failed to fetch marketplace data");
      return res.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Animate numbers on load
  useEffect(() => {
    if (!marketplaceData?.entries) return;

    const entries = marketplaceData.entries;
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    // Calculate metrics
    const totalTokens = entries.length;
    const graduatedTokens = entries.filter((e: any) => e.graduated).length;
    const recentTokens = entries.filter((e: any) => e.launchTime > oneDayAgo);
    
    // Calculate total liquidity (sum of depositLamports converted to USD)
    const totalLiquidityLamports = entries.reduce((sum: number, e: any) => 
      sum + (e.depositLamports || 0), 0
    );
    const totalLiquidityUSD = totalLiquidityLamports / 1e9 * 150; // Assuming $150 SOL price

    // Mock some dynamic values for demo
    const metrics: PlatformMetrics = {
      totalTokensLaunched: totalTokens,
      totalVolumeUSD: totalLiquidityUSD * 3.5, // Mock volume as 3.5x liquidity
      totalLiquidityUSD,
      activeUsers24h: recentTokens.length * 120, // Estimate 120 users per token
      totalTransactions: totalTokens * 850, // Estimate 850 txs per token
      graduatedTokens,
      averageGraduationTime: 4.2, // Mock 4.2 hours average
      topGainer24h: { symbol: "CYBER", change: 420.69 }, // Mock top gainer
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
      });

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [marketplaceData]);

  return (
    <div className="w-full py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 text-cyber-green-neon animate-pulse">
          TKNZ Platform Metrics
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Tokens Launched */}
          <MetricCard
            title="Total Tokens Launched"
            value={animatedValues.totalTokensLaunched.toLocaleString()}
            icon="🚀"
            trend={12.5}
            glowColor="cyber-green"
          />

          {/* Total Volume */}
          <MetricCard
            title="24h Volume"
            value={`$${formatNumber(animatedValues.totalVolumeUSD)}`}
            icon="📊"
            trend={8.3}
            glowColor="blue"
          />

          {/* Total Liquidity */}
          <MetricCard
            title="Total Liquidity"
            value={`$${formatNumber(animatedValues.totalLiquidityUSD)}`}
            icon="💧"
            trend={5.2}
            glowColor="purple"
          />

          {/* Active Users */}
          <MetricCard
            title="Active Users (24h)"
            value={animatedValues.activeUsers24h.toLocaleString()}
            icon="👥"
            trend={15.7}
            glowColor="pink"
          />

          {/* Total Transactions */}
          <MetricCard
            title="Total Transactions"
            value={formatNumber(animatedValues.totalTransactions)}
            icon="⚡"
            trend={18.9}
            glowColor="yellow"
          />

          {/* Graduated Tokens */}
          <MetricCard
            title="Graduated Tokens"
            value={animatedValues.graduatedTokens.toLocaleString()}
            icon="🎓"
            trend={22.3}
            glowColor="green"
          />

          {/* Average Graduation Time */}
          <MetricCard
            title="Avg. Graduation Time"
            value={`${animatedValues.averageGraduationTime.toFixed(1)}h`}
            icon="⏱️"
            trend={-8.5}
            glowColor="orange"
          />

          {/* Top Gainer */}
          <MetricCard
            title="Top Gainer (24h)"
            value={`${animatedValues.topGainer24h.symbol}`}
            subValue={`+${animatedValues.topGainer24h.change.toFixed(2)}%`}
            icon="🔥"
            glowColor="red"
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
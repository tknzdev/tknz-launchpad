import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format/number";

const HeroSection = () => {
  const router = useRouter();
  const [glitchText, setGlitchText] = useState("LAUNCH");
  const glitchWords = ["LAUNCH", "CREATE", "TRADE", "MOON", "PROFIT"];
  
  // Fetch platform statistics
  const { data: statsData } = useQuery({
    queryKey: ["platform-stats-hero"],
    queryFn: async () => {
      const res = await fetch("https://tknz.fun/.netlify/functions/platform-stats");
      if (!res.ok) throw new Error("Failed to fetch platform stats");
      return res.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });
  
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchText(glitchWords[Math.floor(Math.random() * glitchWords.length)]);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          <div className="absolute bottom-0 right-20 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-6000"></div>
        </div>
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <h1 className="text-6xl md:text-8xl font-bold mb-6">
          <span className="text-white">TKNZ</span>
          <span className="text-cyber-green-neon ml-4 glitch-text" data-text={glitchText}>
            {glitchText}
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
          The most advanced token launchpad on Solana.<br />
          Create, launch, and trade tokens with custom bonding curves.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
          <button
            onClick={() => router.push("/create-pool")}
            className={cn(
              "px-8 py-4 text-lg font-bold rounded-xl",
              "bg-cyber-green-neon text-black",
              "hover:bg-cyber-green-neon/80 hover:scale-105",
              "transition-all duration-300",
              "shadow-[0_0_30px_rgba(0,255,65,0.6)]"
            )}
          >
            Launch Your Token
          </button>
          
          <button
            onClick={() => document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' })}
            className={cn(
              "px-8 py-4 text-lg font-bold rounded-xl",
              "border-2 border-cyber-green-neon text-cyber-green-neon",
              "hover:bg-cyber-green-neon/10 hover:scale-105",
              "transition-all duration-300"
            )}
          >
            Explore Tokens
          </button>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
          <QuickStat 
            label="Total Volume" 
            value={statsData ? `$${formatNumber(statsData.totalVolumeUSD)}` : "..."} 
          />
          <QuickStat 
            label="Tokens Launched" 
            value={statsData ? statsData.totalTokensLaunched.toLocaleString() : "..."} 
          />
          <QuickStat 
            label="Active Traders" 
            value={statsData ? statsData.activeUsers24h.toLocaleString() : "..."} 
          />
        </div>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyber-green-neon rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 20}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

const QuickStat = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="text-center">
      <p className="text-3xl font-bold text-cyber-green-neon mb-1">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
};

export default HeroSection; 
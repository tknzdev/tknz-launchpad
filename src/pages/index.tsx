import Page from "../components/ui/Page/Page";
import HeroSection from "../components/HeroSection";
import PlatformStats from "../components/PlatformStats";
import TrendingTokens from "../components/TrendingTokens";
import RecentActivity from "../components/RecentActivity";
import Explore from "../components/Explore";

export default function Index() {
  return (
    <Page>
      {/* Hero Section - Eye-catching intro */}
      <HeroSection />
      
      {/* Platform-wide Statistics */}
      <PlatformStats />
      
      {/* Trending Tokens Grid */}
      <TrendingTokens />
      
      {/* Recent Activity Feed */}
      <RecentActivity />
      
      {/* Original Explore Component with ID for scrolling */}
      <div id="explore" className="pt-16">
        <div className="max-w-7xl mx-auto px-4 mb-8">
          <h2 className="text-3xl font-bold text-white text-center">
            Explore All Tokens
          </h2>
          <p className="text-gray-400 text-center mt-2">
            Discover new launches, graduating tokens, and successful graduates
          </p>
        </div>
        <Explore />
      </div>
    </Page>
  );
}

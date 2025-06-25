import ExploreGrid from "./ExploreGrid";
import { DataStreamProvider } from "@/contexts/DataStreamProvider";
import { ExploreMsgHandler } from "./ExploreMsgHandler";
import { ExploreProvider } from "@/contexts/ExploreProvider";
import { PropsWithChildren, useState } from "react";

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  // Basic filters
  const [minVolume, setMinVolume] = useState<string>("");
  const [createdAfter, setCreatedAfter] = useState<string>("");
  // Advanced filter panel state
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [bondingCurveOnly, setBondingCurveOnly] = useState<boolean>(false);
  const [graduatedOnly, setGraduatedOnly] = useState<boolean>(false);
  return (
    <ExploreContext>
      <div className="py-8">
        {/* Search bar for filtering tokens */}
        <div className="max-w-7xl mx-auto px-4 mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tokens..."
            className="w-full px-4 py-2 bg-black/80 border-2 border-cyber-green-neon rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyber-green-neon"
          />
        </div>
        {/* Filter inputs: Min Volume and Created After */}
        <div className="max-w-7xl mx-auto px-4 mb-6 flex flex-wrap gap-4">
          <div className="flex flex-col">
            <label className="text-gray-400 mb-1">Min 24h Volume</label>
            <input
              type="number"
              value={minVolume}
              onChange={(e) => setMinVolume(e.target.value)}
              placeholder="0"
              className="px-4 py-2 bg-black/80 border-2 border-cyber-green-neon rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyber-green-neon"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-gray-400 mb-1">Created After</label>
            <input
              type="date"
              value={createdAfter}
              onChange={(e) => setCreatedAfter(e.target.value)}
              className="px-4 py-2 bg-black/80 border-2 border-cyber-green-neon rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyber-green-neon"
            />
          </div>
        </div>
        {/* Toggle advanced filters panel */}
        <div className="max-w-7xl mx-auto px-4 mb-4">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-3 py-1 bg-black/80 border-2 border-cyber-green-neon rounded-lg text-cyber-green-neon hover:bg-cyber-green-neon hover:text-black transition"
          >
            Advanced Filters {showAdvanced ? '▲' : '▼'}
          </button>
        </div>
        {showAdvanced && (
          <div className="max-w-7xl mx-auto px-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-black/80 p-4 border-2 border-cyber-green-neon rounded-lg">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="h-4 w-4"
              />
              <span className="text-white">Verified Only</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={bondingCurveOnly}
                onChange={(e) => setBondingCurveOnly(e.target.checked)}
                className="h-4 w-4"
              />
              <span className="text-white">Bonding Curve Only</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={graduatedOnly}
                onChange={(e) => setGraduatedOnly(e.target.checked)}
                className="h-4 w-4"
              />
              <span className="text-white">Graduated Only</span>
            </label>
          </div>
        )}
        <ExploreGrid
          searchQuery={searchQuery}
          minVolume={minVolume}
          createdAfter={createdAfter}
          verifiedOnly={verifiedOnly}
          bondingCurveOnly={bondingCurveOnly}
          graduatedOnly={graduatedOnly}
          className="flex-1"
        />
      </div>
    </ExploreContext>
  );
};

const ExploreContext = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex flex-col h-full">
      <ExploreMsgHandler />

      <ExploreProvider>
        <DataStreamProvider>{children}</DataStreamProvider>
      </ExploreProvider>
    </div>
  );
};

export default Explore;

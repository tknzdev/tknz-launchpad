import React, { useState, useEffect } from "react";
import {
  X,
  Info,
  Settings,
  TrendingUp,
  Percent,
  Clock,
  Shield,
  Coins,
  GitBranch,
} from "lucide-react";

interface CurveConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
  /** Current overrides to prefill fields */
  config: Record<string, any>;
  /** Called when user saves new overrides */
  onChange: (config: Record<string, any>) => void;
}

const CurveConfigPanel: React.FC<CurveConfigPanelProps> = ({
  isOpen,
  onClose,
  config,
  onChange,
}) => {
  const [localConfig, setLocalConfig] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState<
    "fees" | "migration" | "vesting" | "advanced"
  >("fees");

  useEffect(() => {
    if (isOpen) {
      setLocalConfig(config || {});
    }
  }, [isOpen, config]);

  const handleChange = (path: string, value: any) => {
    setLocalConfig((prev) => {
      const next = { ...prev };
      const parts = path.split(".");
      let cursor: any = next;
      for (let i = 0; i < parts.length - 1; i++) {
        const p = parts[i];
        if (cursor[p] == null || typeof cursor[p] !== "object") {
          cursor[p] = {};
        }
        cursor = cursor[p];
      }
      cursor[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const getValue = (path: string, defaultValue: any = "") => {
    const parts = path.split(".");
    let cursor: any = localConfig;
    for (let i = 0; i < parts.length; i++) {
      if (cursor == null || typeof cursor !== "object") return defaultValue;
      cursor = cursor[parts[i]];
    }
    return cursor ?? defaultValue;
  };

  const handleSave = () => {
    onChange(localConfig);
    onClose();
  };

  const handleReset = () => {
    setLocalConfig({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex justify-end">
      <div className="w-full max-w-md bg-white bg-opacity-5 border-l border-gray-700 h-full overflow-hidden flex flex-col">
        <div className="bg-black/50 border-b border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-white" />
            <h2 className="text-lg font-medium text-white uppercase">
              Bonding Curve Config
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="bg-gray-800 p-3 flex items-center space-x-2">
          <Info className="w-4 h-4 text-gray-300" />
          <p className="text-sm text-gray-300">
            Default configuration mimics Pump.fun&apos;s bonding curve. Modify
            settings at your own risk.
          </p>
        </div>

        <div className="flex border-b border-gray-700">
          {[
            { id: "fees", label: "Fees", icon: Percent },
            { id: "migration", label: "Migration", icon: TrendingUp },
            { id: "vesting", label: "Vesting", icon: Clock },
            { id: "advanced", label: "Advanced", icon: Shield },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 px-2 text-sm text-center flex items-center justify-center space-x-1 transition-colors ${
                activeTab === tab.id
                  ? "bg-gray-700 text-white border-b-2 border-indigo-500"
                  : "text-gray-400 hover:bg-gray-700"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {activeTab === "fees" && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-white flex items-center space-x-2">
                <Coins className="w-5 h-5 text-indigo-400" />
                <span>Trading Fees</span>
              </h3>
              <div className="space-y-4 bg-gray-700 p-3 rounded">
                <div>
                  <label className="block text-xs text-gray-300 mb-1">
                    Base Fee (bps)
                  </label>
                  <input
                    type="number"
                    className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white"
                    value={getValue("poolFees.baseFee.cliffFeeNumerator", 30)}
                    onChange={(e) =>
                      handleChange(
                        "poolFees.baseFee.cliffFeeNumerator",
                        Number(e.target.value),
                      )
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-300 mb-1">
                    Dynamic Fee (bps)
                  </label>
                  <input
                    type="number"
                    className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white"
                    value={getValue("poolFees.dynamicFee", 0)}
                    onChange={(e) =>
                      handleChange(
                        "poolFees.dynamicFee",
                        Number(e.target.value),
                      )
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-300 mb-1">
                    Creator Fee %
                  </label>
                  <input
                    type="number"
                    className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white"
                    value={getValue("creatorTradingFeePercentage", 0)}
                    onChange={(e) =>
                      handleChange(
                        "creatorTradingFeePercentage",
                        Number(e.target.value),
                      )
                    }
                  />
                </div>
              </div>
            </div>
          )}
          {activeTab === "migration" && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-white flex items-center space-x-2">
                <GitBranch className="w-5 h-5 text-indigo-400" />
                <span>Migration Settings</span>
              </h3>
              <div className="space-y-4 bg-gray-700 p-3 rounded">
                <div>
                  <label className="block text-xs text-gray-300 mb-1">
                    Migration Threshold (SOL)
                  </label>
                  <input
                    type="number"
                    className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white"
                    value={getValue("migrationThreshold", 0)}
                    onChange={(e) =>
                      handleChange("migrationThreshold", Number(e.target.value))
                    }
                  />
                </div>
              </div>
            </div>
          )}
          {/* Additional tabs can be extended here */}
        </div>

        <div className="p-4 border-t border-gray-700 flex justify-between">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm text-gray-300 hover:text-white"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default CurveConfigPanel;

"use client";

import { useStore } from "@/store/useStore";
import { clearSession } from "@/lib/crypto";

export default function Header() {
  const { activeTab, setActiveTab, setUnlocked, tradeConfig } = useStore();

  const tabs = [
    { id: "dashboard" as const, label: "🚀 Dashboard", shortLabel: "🚀" },
    { id: "settings" as const, label: "⚙️ Settings", shortLabel: "⚙️" },
    { id: "history" as const, label: "📊 History", shortLabel: "📊" },
    { id: "wallets" as const, label: "🔐 Wallets", shortLabel: "🔐" },
  ];

  const handleLock = () => {
    clearSession();
    setUnlocked(false);
  };

  return (
    <header className="border-b border-green-500/20 bg-black/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-xl">🚀</span>
            <h1 className="text-green-400 font-mono font-bold text-sm md:text-base">
              EARLY TOKEN DETECTOR
            </h1>
            <span className="hidden md:inline text-gray-600 text-xs font-mono">
              SOL + BASE
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                  activeTab === tab.id
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "text-gray-500 hover:text-green-400 border border-transparent"
                }`}
              >
                <span className="hidden md:inline">{tab.label}</span>
                <span className="md:hidden">{tab.shortLabel}</span>
              </button>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-mono px-2 py-0.5 rounded ${
                tradeConfig.mode === "simulation"
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
              }`}
            >
              {tradeConfig.mode === "simulation" ? "SIM" : "REAL"}
            </span>
            <button
              onClick={handleLock}
              className="text-gray-600 hover:text-red-400 text-xs font-mono transition-colors"
              title="Lock & Clear Session"
            >
              🔒
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

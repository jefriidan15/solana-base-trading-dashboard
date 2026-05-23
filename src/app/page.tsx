"use client";

import { Toaster } from "react-hot-toast";
import { useStore } from "@/store/useStore";
import UnlockScreen from "@/components/UnlockScreen";
import Header from "@/components/Header";
import TokenScanner from "@/components/TokenScanner";
import PriceChart from "@/components/PriceChart";
import ActiveTrades from "@/components/ActiveTrades";
import AlertsFeed from "@/components/AlertsFeed";
import SettingsPanel from "@/components/SettingsPanel";
import TradeHistory from "@/components/TradeHistory";
import WalletsPanel from "@/components/WalletsPanel";

export default function Home() {
  const { isUnlocked, activeTab } = useStore();

  if (!isUnlocked) {
    return (
      <>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#111827",
              color: "#22c55e",
              border: "1px solid rgba(34, 197, 94, 0.2)",
              fontFamily: "monospace",
              fontSize: "12px",
            },
          }}
        />
        <UnlockScreen />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-black scanlines">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#111827",
            color: "#22c55e",
            border: "1px solid rgba(34, 197, 94, 0.2)",
            fontFamily: "monospace",
            fontSize: "12px",
          },
        }}
      />

      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === "dashboard" && <DashboardView />}
        {activeTab === "settings" && <SettingsPanel />}
        {activeTab === "history" && <TradeHistory />}
        {activeTab === "wallets" && <WalletsPanel />}
      </main>

      {/* Footer Warning */}
      <footer className="border-t border-green-500/10 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-gray-600 text-xs font-mono">
            ⚠️ WARNING: Crypto trading involves substantial risk of loss. This
            bot is for educational purposes. Never trade more than you can afford
            to lose. Always verify contracts manually. Use simulation mode first!
          </p>
        </div>
      </footer>
    </div>
  );
}

function DashboardView() {
  return (
    <div className="space-y-4">
      {/* Token Scanner */}
      <TokenScanner />

      {/* Charts + Indicators */}
      <PriceChart />

      {/* Active Trades + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ActiveTrades />
        <AlertsFeed />
      </div>
    </div>
  );
}

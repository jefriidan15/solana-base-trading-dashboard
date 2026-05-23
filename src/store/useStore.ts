// ═══════════════════════════════════════════════════════════
// GLOBAL STATE - Zustand store
// ═══════════════════════════════════════════════════════════

import { create } from "zustand";
import type {
  TokenAnalysis,
  TechnicalIndicators,
  PricePoint,
  Trade,
  TradeConfig,
  Alert,
  WatchlistItem,
  Chain,
} from "@/types";

interface AppState {
  // Auth
  isUnlocked: boolean;
  setUnlocked: (v: boolean) => void;

  // Token Analysis
  currentToken: TokenAnalysis | null;
  setCurrentToken: (t: TokenAnalysis | null) => void;
  isScanning: boolean;
  setScanning: (v: boolean) => void;

  // Technical Indicators
  indicators: TechnicalIndicators | null;
  setIndicators: (i: TechnicalIndicators | null) => void;
  priceHistory: PricePoint[];
  addPricePoint: (p: PricePoint) => void;
  clearPriceHistory: () => void;

  // Trades
  trades: Trade[];
  setTrades: (t: Trade[]) => void;
  addTrade: (t: Trade) => void;
  updateTrade: (id: string, updates: Partial<Trade>) => void;

  // Config
  tradeConfig: TradeConfig;
  setTradeConfig: (c: Partial<TradeConfig>) => void;

  // Alerts
  alerts: Alert[];
  addAlert: (a: Alert) => void;
  markAlertRead: (id: string) => void;
  clearAlerts: () => void;

  // Watchlist
  watchlist: WatchlistItem[];
  addToWatchlist: (item: WatchlistItem) => void;
  removeFromWatchlist: (address: string) => void;
  setWatchlist: (items: WatchlistItem[]) => void;

  // UI
  activeTab: "dashboard" | "settings" | "history" | "wallets";
  setActiveTab: (tab: "dashboard" | "settings" | "history" | "wallets") => void;
  selectedChain: Chain | "all";
  setSelectedChain: (c: Chain | "all") => void;
}

const DEFAULT_CONFIG: TradeConfig = {
  mode: "simulation",
  buyAmount: 0.1,
  maxSlippage: 5,
  smaEntry: true,
  priceDropEntry: true,
  priceDropPercent: 10,
  earlyEntry: true,
  earlyEntryMinutes: 5,
  takeProfitPercent: 50,
  stopLossPercent: 20,
  trailingStopPercent: 10,
  timeStopHours: 24,
  maxTradesPerDay: 10,
  maxDailyLossPercent: 20,
};

export const useStore = create<AppState>((set) => ({
  // Auth
  isUnlocked: false,
  setUnlocked: (v) => set({ isUnlocked: v }),

  // Token Analysis
  currentToken: null,
  setCurrentToken: (t) => set({ currentToken: t }),
  isScanning: false,
  setScanning: (v) => set({ isScanning: v }),

  // Technical Indicators
  indicators: null,
  setIndicators: (i) => set({ indicators: i }),
  priceHistory: [],
  addPricePoint: (p) =>
    set((state) => ({
      priceHistory: [...state.priceHistory.slice(-200), p],
    })),
  clearPriceHistory: () => set({ priceHistory: [] }),

  // Trades
  trades: [],
  setTrades: (t) => set({ trades: t }),
  addTrade: (t) =>
    set((state) => ({ trades: [t, ...state.trades] })),
  updateTrade: (id, updates) =>
    set((state) => ({
      trades: state.trades.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),

  // Config
  tradeConfig: DEFAULT_CONFIG,
  setTradeConfig: (c) =>
    set((state) => ({
      tradeConfig: { ...state.tradeConfig, ...c },
    })),

  // Alerts
  alerts: [],
  addAlert: (a) =>
    set((state) => ({
      alerts: [a, ...state.alerts].slice(0, 100),
    })),
  markAlertRead: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === id ? { ...a, read: true } : a
      ),
    })),
  clearAlerts: () => set({ alerts: [] }),

  // Watchlist
  watchlist: [],
  addToWatchlist: (item) =>
    set((state) => ({
      watchlist: [...state.watchlist, item],
    })),
  removeFromWatchlist: (address) =>
    set((state) => ({
      watchlist: state.watchlist.filter((w) => w.address !== address),
    })),
  setWatchlist: (items) => set({ watchlist: items }),

  // UI
  activeTab: "dashboard",
  setActiveTab: (tab) => set({ activeTab: tab }),
  selectedChain: "all",
  setSelectedChain: (c) => set({ selectedChain: c }),
}));

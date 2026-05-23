// ═══════════════════════════════════════════════════════════
// TYPES - Solana + Base Early Token Detection Bot
// ═══════════════════════════════════════════════════════════

export type Chain = "solana" | "base";
export type TradingMode = "simulation" | "real";
export type TradeStatus = "pending" | "open" | "tp_hit" | "sl_hit" | "time_stop" | "manual_close" | "emergency_exit";
export type RiskLevel = "low" | "moderate" | "high" | "critical";
export type SignalType = "buy" | "sell" | "hold";

// ─── Token Analysis ───
export interface TokenAnalysis {
  address: string;
  name: string;
  symbol: string;
  chain: Chain;
  lpAge: number; // seconds since LP creation
  liquidity: number; // USD
  marketCap: number;
  holders: number;
  holdersGrowthRate: number; // per minute
  mintAuthority: boolean; // true = still active (unsafe)
  freezeAuthority: boolean; // true = still active (unsafe)
  lpBurnt: boolean;
  contractRenounced: boolean; // Base only
  isHoneypot: boolean;
  topHoldersPercent: number; // top 5 holders %
  riskScore: number; // 1-10
  riskLevel: RiskLevel;
  price: number;
  priceChange24h: number;
  volume24h: number;
  createdAt: number; // timestamp
  dexUrl: string;
  imageUrl?: string;
}

// ─── Technical Indicators ───
export interface TechnicalIndicators {
  sma7: number;
  sma20: number;
  rsi: number;
  volumeAvg: number;
  currentVolume: number;
  volumeSpike: boolean; // >200% avg
  buyPressure: number; // 0-1
  sellPressure: number; // 0-1
  signal: SignalType;
  smaCrossover: "golden" | "death" | "none";
}

export interface PricePoint {
  timestamp: number;
  price: number;
  volume: number;
}

// ─── Trading ───
export interface TradeConfig {
  mode: TradingMode;
  buyAmount: number; // in native token (SOL/ETH)
  maxSlippage: number; // percentage
  // Entry strategy
  smaEntry: boolean;
  priceDropEntry: boolean;
  priceDropPercent: number;
  earlyEntry: boolean;
  earlyEntryMinutes: number;
  // Exit strategy
  takeProfitPercent: number;
  stopLossPercent: number;
  trailingStopPercent: number;
  timeStopHours: number;
  // Safety
  maxTradesPerDay: number;
  maxDailyLossPercent: number;
}

export interface Trade {
  id: string;
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  chain: Chain;
  mode: TradingMode;
  entryPrice: number;
  currentPrice: number;
  amount: number; // native token spent
  tokenAmount: number; // tokens bought
  pnlPercent: number;
  pnlUsd: number;
  status: TradeStatus;
  entryTime: number;
  exitTime?: number;
  exitPrice?: number;
  txHash?: string;
  exitTxHash?: string;
}

// ─── Watchlist ───
export interface WatchlistItem {
  address: string;
  chain: Chain;
  name: string;
  symbol: string;
  addedAt: number;
  priceAtAdd: number;
}

// ─── Alerts ───
export type AlertType = "new_token" | "sma_cross" | "rsi_signal" | "volume_spike" | "lp_drain" | "rug_warning" | "tp_hit" | "sl_hit" | "price_alert";

export interface Alert {
  id: string;
  type: AlertType;
  message: string;
  chain: Chain;
  tokenAddress?: string;
  timestamp: number;
  read: boolean;
}

// ─── Read-only Public Settings ───
export interface StoredKeys {
  watchlistName?: string;
  preferredChain?: Chain;
  themeMode?: "dark" | "light";
}

// ─── Blacklist ───
export interface BlacklistEntry {
  address: string;
  chain: Chain;
  reason: string;
  addedAt: number;
}

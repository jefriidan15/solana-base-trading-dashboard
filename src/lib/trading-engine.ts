// ═══════════════════════════════════════════════════════════
// PUBLIC TRADE ENGINE - sanitized simulation-only workflow
// No live trading, sensitive credential handling, or wallet execution in this build.
// ═══════════════════════════════════════════════════════════

import { v4 as uuidv4 } from "uuid";
import type {
  Trade,
  TradeConfig,
  TokenAnalysis,
  TechnicalIndicators,
  TradeStatus,
  Alert,
} from "@/types";
import { shouldBlockTrade, isBlacklisted } from "./safety";

const TRADES_KEY = "etd_trades";
const DAILY_STATS_KEY = "etd_daily_stats";

export function getStoredTrades(): Trade[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(TRADES_KEY) || "[]");
  } catch {
    return [];
  }
}

export function storeTrade(trade: Trade): void {
  const trades = getStoredTrades();
  const idx = trades.findIndex((t) => t.id === trade.id);
  if (idx >= 0) trades[idx] = trade;
  else trades.push(trade);
  localStorage.setItem(TRADES_KEY, JSON.stringify(trades));
}

export function getActiveTrades(): Trade[] {
  return getStoredTrades().filter(
    (t) => t.status === "open" || t.status === "pending"
  );
}

interface DailyStats {
  date: string;
  tradeCount: number;
  pnlPercent: number;
}

function getDailyStats(): DailyStats {
  const today = new Date().toISOString().split("T")[0];
  try {
    const stats = JSON.parse(localStorage.getItem(DAILY_STATS_KEY) || "{}");
    if (stats.date === today) return stats;
  } catch {
    // ignore
  }
  return { date: today, tradeCount: 0, pnlPercent: 0 };
}

function updateDailyStats(pnl: number): void {
  const stats = getDailyStats();
  stats.tradeCount += 1;
  stats.pnlPercent += pnl;
  localStorage.setItem(DAILY_STATS_KEY, JSON.stringify(stats));
}

export function shouldEnter(
  token: TokenAnalysis,
  indicators: TechnicalIndicators,
  config: TradeConfig
): { enter: boolean; reason: string } {
  if (isBlacklisted(token.address, token.chain)) {
    return { enter: false, reason: "Token is blacklisted" };
  }

  const block = shouldBlockTrade(token);
  if (block.blocked) {
    return { enter: false, reason: block.reason };
  }

  const stats = getDailyStats();
  if (stats.tradeCount >= config.maxTradesPerDay) {
    return { enter: false, reason: "Daily trade limit reached" };
  }
  if (stats.pnlPercent <= -config.maxDailyLossPercent) {
    return { enter: false, reason: "Daily loss limit reached" };
  }

  const activeTrades = getActiveTrades();
  if (activeTrades.some((t) => t.tokenAddress === token.address)) {
    return { enter: false, reason: "Already in a trade for this token" };
  }

  if (config.smaEntry && indicators.smaCrossover === "golden") {
    return { enter: true, reason: "SMA Golden Cross detected" };
  }

  if (config.earlyEntry) {
    const lpAgeMinutes = token.lpAge / 60;
    if (lpAgeMinutes <= config.earlyEntryMinutes) {
      return {
        enter: true,
        reason: `Early entry: LP ${Math.floor(lpAgeMinutes)}min old`,
      };
    }
  }

  if (config.priceDropEntry && indicators.signal === "buy") {
    return { enter: true, reason: "Buy signal from indicators" };
  }

  return { enter: false, reason: "No entry signal" };
}

export function shouldExit(
  trade: Trade,
  config: TradeConfig
): { exit: boolean; reason: string; status: TradeStatus } {
  const pnl = trade.pnlPercent;
  const elapsed = (Date.now() - trade.entryTime) / (1000 * 60 * 60);

  if (pnl >= config.takeProfitPercent) {
    return { exit: true, reason: `Take Profit hit: +${pnl.toFixed(1)}%`, status: "tp_hit" };
  }
  if (pnl <= -config.stopLossPercent) {
    return { exit: true, reason: `Stop Loss hit: ${pnl.toFixed(1)}%`, status: "sl_hit" };
  }
  if (elapsed >= config.timeStopHours) {
    return { exit: true, reason: `Time stop: ${elapsed.toFixed(1)}h elapsed`, status: "time_stop" };
  }

  return { exit: false, reason: "", status: "open" };
}

export async function executeBuy(
  token: TokenAnalysis,
  config: TradeConfig
): Promise<Trade> {
  if (config.mode !== "simulation") {
    throw new Error("Public sanitized build: live trading is disabled");
  }

  const trade: Trade = {
    id: uuidv4(),
    tokenAddress: token.address,
    tokenName: token.name,
    tokenSymbol: token.symbol,
    chain: token.chain,
    mode: config.mode,
    entryPrice: token.price,
    currentPrice: token.price,
    amount: config.buyAmount,
    tokenAmount: 0,
    pnlPercent: 0,
    pnlUsd: 0,
    status: "open",
    entryTime: Date.now(),
  };

  trade.tokenAmount = token.price > 0
    ? (config.buyAmount / token.price) * (1 - config.maxSlippage / 100)
    : 0;
  trade.txHash = `sim_${Date.now().toString(36)}`;

  storeTrade(trade);
  updateDailyStats(0);
  return trade;
}

export async function executeSell(trade: Trade): Promise<Trade> {
  const updatedTrade = { ...trade };
  updatedTrade.exitTxHash = `sim_sell_${Date.now().toString(36)}`;
  updatedTrade.exitTime = Date.now();
  updatedTrade.exitPrice = trade.currentPrice;
  updateDailyStats(trade.pnlPercent);
  storeTrade(updatedTrade);
  return updatedTrade;
}

export function updateTradePrice(tradeId: string, newPrice: number): Trade | null {
  const trades = getStoredTrades();
  const trade = trades.find((t) => t.id === tradeId);
  if (!trade || trade.status !== "open") return null;

  trade.currentPrice = newPrice;
  trade.pnlPercent = ((newPrice - trade.entryPrice) / trade.entryPrice) * 100;
  trade.pnlUsd = trade.amount * (trade.pnlPercent / 100);

  storeTrade(trade);
  return trade;
}

export function generateTradeAlert(
  trade: Trade,
  type: "tp_hit" | "sl_hit" | "price_alert"
): Alert {
  return {
    id: uuidv4(),
    type,
    message:
      type === "tp_hit"
        ? `Take Profit hit on ${trade.tokenSymbol}: +${trade.pnlPercent.toFixed(1)}%`
        : type === "sl_hit"
          ? `Stop Loss hit on ${trade.tokenSymbol}: ${trade.pnlPercent.toFixed(1)}%`
          : `Price alert for ${trade.tokenSymbol}`,
    chain: trade.chain,
    tokenAddress: trade.tokenAddress,
    timestamp: Date.now(),
    read: false,
  };
}

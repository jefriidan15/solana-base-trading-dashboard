// ═══════════════════════════════════════════════════════════
// TECHNICAL INDICATORS - SMA, RSI, Volume Analysis
// ═══════════════════════════════════════════════════════════

import type { PricePoint, TechnicalIndicators, SignalType } from "@/types";

/**
 * Simple Moving Average
 */
export function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0;
  const slice = prices.slice(-period);
  return slice.reduce((sum, p) => sum + p, 0) / period;
}

/**
 * Relative Strength Index (0-100)
 */
export function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50; // neutral default

  let gains = 0;
  let losses = 0;

  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

/**
 * Volume spike detection (>200% of average)
 */
export function detectVolumeSpike(
  volumes: number[],
  currentVolume: number,
  threshold: number = 2.0
): boolean {
  if (volumes.length === 0) return false;
  const avg = volumes.reduce((s, v) => s + v, 0) / volumes.length;
  return currentVolume > avg * threshold;
}

/**
 * Buy/Sell pressure ratio from price movements
 */
export function calculatePressure(prices: number[]): {
  buyPressure: number;
  sellPressure: number;
} {
  if (prices.length < 2) return { buyPressure: 0.5, sellPressure: 0.5 };

  let ups = 0;
  let downs = 0;

  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > prices[i - 1]) ups++;
    else if (prices[i] < prices[i - 1]) downs++;
  }

  const total = ups + downs || 1;
  return {
    buyPressure: ups / total,
    sellPressure: downs / total,
  };
}

/**
 * Determine SMA crossover state
 */
export function getSMACrossover(
  prevSma7: number,
  prevSma20: number,
  currSma7: number,
  currSma20: number
): "golden" | "death" | "none" {
  if (prevSma7 <= prevSma20 && currSma7 > currSma20) return "golden";
  if (prevSma7 >= prevSma20 && currSma7 < currSma20) return "death";
  return "none";
}

/**
 * Generate composite trading signal
 */
export function getSignal(indicators: TechnicalIndicators): SignalType {
  let score = 0;

  // SMA crossover
  if (indicators.smaCrossover === "golden") score += 2;
  if (indicators.smaCrossover === "death") score -= 2;
  if (indicators.sma7 > indicators.sma20) score += 1;
  else score -= 1;

  // RSI
  if (indicators.rsi < 30) score += 2;
  else if (indicators.rsi < 40) score += 1;
  else if (indicators.rsi > 70) score -= 2;
  else if (indicators.rsi > 60) score -= 1;

  // Volume spike + buy pressure
  if (indicators.volumeSpike && indicators.buyPressure > 0.6) score += 1;
  if (indicators.volumeSpike && indicators.sellPressure > 0.6) score -= 1;

  if (score >= 2) return "buy";
  if (score <= -2) return "sell";
  return "hold";
}

/**
 * Compute all technical indicators from price history
 */
export function computeIndicators(
  priceHistory: PricePoint[],
  prevSma7: number = 0,
  prevSma20: number = 0
): TechnicalIndicators {
  const prices = priceHistory.map((p) => p.price);
  const volumes = priceHistory.map((p) => p.volume);
  const currentVolume = volumes[volumes.length - 1] || 0;

  const sma7 = calculateSMA(prices, 7);
  const sma20 = calculateSMA(prices, 20);
  const rsi = calculateRSI(prices);
  const volumeAvg =
    volumes.length > 0
      ? volumes.reduce((s, v) => s + v, 0) / volumes.length
      : 0;
  const volumeSpike = detectVolumeSpike(volumes.slice(0, -1), currentVolume);
  const { buyPressure, sellPressure } = calculatePressure(prices);
  const smaCrossover = getSMACrossover(prevSma7, prevSma20, sma7, sma20);

  const indicators: TechnicalIndicators = {
    sma7,
    sma20,
    rsi,
    volumeAvg,
    currentVolume,
    volumeSpike,
    buyPressure,
    sellPressure,
    signal: "hold",
    smaCrossover,
  };

  indicators.signal = getSignal(indicators);
  return indicators;
}

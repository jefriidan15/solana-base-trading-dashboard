// ═══════════════════════════════════════════════════════════
// SOLANA INTEGRATION - sanitized public read-only token analysis
// No credential or wallet execution flow in this build.
// ═══════════════════════════════════════════════════════════

import { Connection, PublicKey } from "@solana/web3.js";
import type { TokenAnalysis } from "@/types";
import { calculateRiskScore, getRiskLevel } from "./safety";

const DEFAULT_RPC = "https://api.mainnet-beta.solana.com";

export function getConnection(rpcUrl?: string): Connection {
  return new Connection(rpcUrl || DEFAULT_RPC, "confirmed");
}

export function isSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return address.length >= 32 && address.length <= 44;
  } catch {
    return false;
  }
}

export async function fetchSolanaToken(
  address: string,
  rpcUrl?: string
): Promise<TokenAnalysis> {
  const connection = getConnection(rpcUrl);
  const mint = new PublicKey(address);
  const mintInfo = await connection.getParsedAccountInfo(mint);
  const mintData = mintInfo.value?.data;

  let mintAuthority = true;
  let freezeAuthority = true;

  if (mintData && "parsed" in mintData) {
    const info = mintData.parsed?.info;
    mintAuthority = info?.mintAuthority !== null && info?.mintAuthority !== undefined;
    freezeAuthority = info?.freezeAuthority !== null && info?.freezeAuthority !== undefined;
  }

  const tokenData = await fetchDexScreenerData(address);

  const analysis: TokenAnalysis = {
    address,
    name: tokenData?.name || "Unknown Token",
    symbol: tokenData?.symbol || "???",
    chain: "solana",
    lpAge: tokenData?.lpAge || 0,
    liquidity: tokenData?.liquidity || 0,
    marketCap: tokenData?.marketCap || 0,
    holders: tokenData?.holders || 0,
    holdersGrowthRate: tokenData?.holdersGrowthRate || 0,
    mintAuthority,
    freezeAuthority,
    lpBurnt: tokenData?.lpBurnt || false,
    contractRenounced: false,
    isHoneypot: false,
    topHoldersPercent: tokenData?.topHoldersPercent || 0,
    riskScore: 5,
    riskLevel: "moderate",
    price: tokenData?.price || 0,
    priceChange24h: tokenData?.priceChange24h || 0,
    volume24h: tokenData?.volume24h || 0,
    createdAt: tokenData?.createdAt || Date.now(),
    dexUrl: `https://dexscreener.com/solana/${address}`,
    imageUrl: tokenData?.imageUrl,
  };

  const score = calculateRiskScore([
    { name: "mint", passed: !mintAuthority, severity: "critical", message: "" },
    { name: "freeze", passed: !freezeAuthority, severity: "critical", message: "" },
    { name: "lp", passed: analysis.lpBurnt, severity: "critical", message: "" },
    { name: "honeypot", passed: !analysis.isHoneypot, severity: "critical", message: "" },
    { name: "liquidity", passed: analysis.liquidity >= 10000, severity: "warning", message: "" },
    { name: "holders", passed: analysis.topHoldersPercent < 30, severity: "warning", message: "" },
  ]);

  analysis.riskScore = score;
  analysis.riskLevel = getRiskLevel(score);
  return analysis;
}

export async function jupiterSwap(): Promise<string> {
  throw new Error("Public sanitized build: live trading is disabled");
}

export async function jupiterSell(): Promise<string> {
  throw new Error("Public sanitized build: live trading is disabled");
}

export interface TokenDataResult {
  name: string;
  symbol: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  liquidity: number;
  marketCap: number;
  holders: number;
  holdersGrowthRate: number;
  lpAge: number;
  lpBurnt: boolean;
  topHoldersPercent: number;
  createdAt: number;
  imageUrl?: string;
}

export async function fetchDexScreenerData(
  address: string
): Promise<TokenDataResult | null> {
  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
    if (!res.ok) return null;
    const data = await res.json();
    const pair = data?.pairs?.[0];
    if (!pair) return null;

    const createdAt = pair.pairCreatedAt || Date.now();
    return {
      name: pair.baseToken?.name || "Unknown",
      symbol: pair.baseToken?.symbol || "???",
      price: Number(pair.priceUsd || 0),
      priceChange24h: Number(pair.priceChange?.h24 || 0),
      volume24h: Number(pair.volume?.h24 || 0),
      liquidity: Number(pair.liquidity?.usd || 0),
      marketCap: Number(pair.marketCap || pair.fdv || 0),
      holders: 0,
      holdersGrowthRate: 0,
      lpAge: Math.max(0, Math.floor((Date.now() - createdAt) / 1000)),
      lpBurnt: false,
      topHoldersPercent: 0,
      createdAt,
      imageUrl: pair.info?.imageUrl,
    };
  } catch {
    return null;
  }
}

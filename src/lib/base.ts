// ═══════════════════════════════════════════════════════════
// BASE INTEGRATION - sanitized public read-only token analysis
// No wallet import or private RPC management in this build.
// ═══════════════════════════════════════════════════════════

import { ethers } from "ethers";
import type { TokenAnalysis } from "@/types";
import { calculateRiskScore, getRiskLevel } from "./safety";
import { fetchDexScreenerData } from "./solana";

const DEFAULT_BASE_RPC = "https://mainnet.base.org";

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function owner() view returns (address)",
];

export function isBaseAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function getBaseProvider(rpcUrl?: string): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(rpcUrl || DEFAULT_BASE_RPC);
}

export async function fetchBaseToken(
  address: string,
  rpcUrl?: string
): Promise<TokenAnalysis> {
  const provider = getBaseProvider(rpcUrl);
  const contract = new ethers.Contract(address, ERC20_ABI, provider);

  let name = "Unknown Token";
  let symbol = "???";
  let contractRenounced = false;

  try {
    name = await contract.name();
    symbol = await contract.symbol();
  } catch {
    // ignore
  }

  try {
    const owner = await contract.owner();
    contractRenounced = owner === ethers.ZeroAddress;
  } catch {
    contractRenounced = true;
  }

  const isHoneypot = await checkHoneypot(address);
  const marketData = await fetchDexScreenerData(address);

  const analysis: TokenAnalysis = {
    address,
    name,
    symbol,
    chain: "base",
    lpAge: marketData?.lpAge || 0,
    liquidity: marketData?.liquidity || 0,
    marketCap: marketData?.marketCap || 0,
    holders: marketData?.holders || 0,
    holdersGrowthRate: marketData?.holdersGrowthRate || 0,
    mintAuthority: false,
    freezeAuthority: false,
    lpBurnt: marketData?.lpBurnt || false,
    contractRenounced,
    isHoneypot,
    topHoldersPercent: marketData?.topHoldersPercent || 0,
    riskScore: 5,
    riskLevel: "moderate",
    price: marketData?.price || 0,
    priceChange24h: marketData?.priceChange24h || 0,
    volume24h: marketData?.volume24h || 0,
    createdAt: marketData?.createdAt || Date.now(),
    dexUrl: `https://dexscreener.com/base/${address}`,
    imageUrl: marketData?.imageUrl,
  };

  const score = calculateRiskScore([
    { name: "renounced", passed: contractRenounced, severity: "critical", message: "" },
    { name: "lp", passed: analysis.lpBurnt, severity: "critical", message: "" },
    { name: "honeypot", passed: !isHoneypot, severity: "critical", message: "" },
    { name: "liquidity", passed: analysis.liquidity >= 10000, severity: "warning", message: "" },
    { name: "holders", passed: analysis.topHoldersPercent < 30, severity: "warning", message: "" },
  ]);

  analysis.riskScore = score;
  analysis.riskLevel = getRiskLevel(score);
  return analysis;
}

async function checkHoneypot(tokenAddress: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://api.honeypot.is/v2/IsHoneypot?address=${tokenAddress}&chainID=8453`
    );
    if (!res.ok) return false;
    const data = await res.json();
    return data.honeypotResult?.isHoneypot || false;
  } catch {
    return false;
  }
}

export async function uniswapBuy(): Promise<string> {
  throw new Error("Public sanitized build: live trading is disabled");
}

export async function uniswapSell(): Promise<string> {
  throw new Error("Public sanitized build: live trading is disabled");
}

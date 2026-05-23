// ═══════════════════════════════════════════════════════════
// RUG PULL DETECTION & SAFETY CHECKS
// ═══════════════════════════════════════════════════════════

import type { TokenAnalysis, RiskLevel, Chain } from "@/types";

interface SafetyCheck {
  name: string;
  passed: boolean;
  severity: "critical" | "warning" | "info";
  message: string;
}

/**
 * Run all safety checks on a token
 */
export function runSafetyChecks(token: TokenAnalysis): SafetyCheck[] {
  const checks: SafetyCheck[] = [];

  // Mint Authority (Solana)
  if (token.chain === "solana") {
    checks.push({
      name: "Mint Authority",
      passed: !token.mintAuthority,
      severity: "critical",
      message: token.mintAuthority
        ? "Mint authority is ACTIVE - tokens can be minted infinitely"
        : "Mint authority revoked - safe",
    });
  }

  // Freeze Authority (Solana)
  if (token.chain === "solana") {
    checks.push({
      name: "Freeze Authority",
      passed: !token.freezeAuthority,
      severity: "critical",
      message: token.freezeAuthority
        ? "Freeze authority ACTIVE - your tokens can be frozen"
        : "Freeze authority revoked - safe",
    });
  }

  // Contract Renounced (Base)
  if (token.chain === "base") {
    checks.push({
      name: "Contract Ownership",
      passed: token.contractRenounced,
      severity: "critical",
      message: token.contractRenounced
        ? "Contract ownership renounced - safe"
        : "Contract has active owner - risky",
    });
  }

  // LP Tokens Burnt
  checks.push({
    name: "LP Tokens",
    passed: token.lpBurnt,
    severity: "critical",
    message: token.lpBurnt
      ? "LP tokens burnt - rug pull resistant"
      : "LP tokens NOT burnt - rug pull possible",
  });

  // Honeypot Detection
  checks.push({
    name: "Honeypot Check",
    passed: !token.isHoneypot,
    severity: "critical",
    message: token.isHoneypot
      ? "HONEYPOT DETECTED - cannot sell tokens!"
      : "Token is sellable - not a honeypot",
  });

  // Liquidity Level
  checks.push({
    name: "Liquidity",
    passed: token.liquidity >= 10000,
    severity: "warning",
    message:
      token.liquidity >= 10000
        ? `Liquidity $${formatNum(token.liquidity)} - adequate`
        : `Liquidity $${formatNum(token.liquidity)} - LOW (risk of high slippage)`,
  });

  // Top Holder Concentration
  checks.push({
    name: "Holder Concentration",
    passed: token.topHoldersPercent < 30,
    severity: "warning",
    message:
      token.topHoldersPercent < 30
        ? `Top 5 holders: ${token.topHoldersPercent}% - distributed`
        : `Top 5 holders: ${token.topHoldersPercent}% - CONCENTRATED`,
  });

  // LP Age
  const lpAgeMinutes = token.lpAge / 60;
  checks.push({
    name: "LP Age",
    passed: lpAgeMinutes > 5,
    severity: "info",
    message:
      lpAgeMinutes > 60
        ? `LP created ${Math.floor(lpAgeMinutes / 60)}h ago`
        : `LP created ${Math.floor(lpAgeMinutes)}min ago - VERY EARLY`,
  });

  // Holder Count
  checks.push({
    name: "Holders",
    passed: token.holders > 50,
    severity: "info",
    message:
      token.holders > 50
        ? `${token.holders} holders - growing`
        : `${token.holders} holders - very few`,
  });

  return checks;
}

/**
 * Calculate risk score 1-10 from safety checks
 */
export function calculateRiskScore(checks: SafetyCheck[]): number {
  let score = 0;
  const criticalFails = checks.filter(
    (c) => c.severity === "critical" && !c.passed
  ).length;
  const warningFails = checks.filter(
    (c) => c.severity === "warning" && !c.passed
  ).length;

  score += criticalFails * 3;
  score += warningFails * 1.5;

  return Math.min(10, Math.max(1, Math.round(score)));
}

/**
 * Get risk level from score
 */
export function getRiskLevel(score: number): RiskLevel {
  if (score <= 3) return "low";
  if (score <= 5) return "moderate";
  if (score <= 7) return "high";
  return "critical";
}

/**
 * Check if trading should be blocked
 */
export function shouldBlockTrade(token: TokenAnalysis): {
  blocked: boolean;
  reason: string;
} {
  if (token.isHoneypot) {
    return { blocked: true, reason: "Honeypot detected - cannot sell tokens" };
  }
  if (token.riskScore >= 9) {
    return { blocked: true, reason: "Risk score too high (9+/10)" };
  }
  if (token.liquidity < 1000) {
    return {
      blocked: true,
      reason: "Liquidity too low (<$1,000) - high slippage risk",
    };
  }
  return { blocked: false, reason: "" };
}

/**
 * Check known scam blacklist (localStorage-based)
 */
export function isBlacklisted(address: string, chain: Chain): boolean {
  if (typeof window === "undefined") return false;
  try {
    const blacklist = JSON.parse(
      localStorage.getItem("etd_blacklist") || "[]"
    );
    return blacklist.some(
      (e: { address: string; chain: string }) =>
        e.address.toLowerCase() === address.toLowerCase() && e.chain === chain
    );
  } catch {
    return false;
  }
}

export function addToBlacklist(
  address: string,
  chain: Chain,
  reason: string
): void {
  if (typeof window === "undefined") return;
  try {
    const blacklist = JSON.parse(
      localStorage.getItem("etd_blacklist") || "[]"
    );
    blacklist.push({ address, chain, reason, addedAt: Date.now() });
    localStorage.setItem("etd_blacklist", JSON.stringify(blacklist));
  } catch {
    // ignore
  }
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toFixed(0);
}

// ═══════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════

export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}

export function formatUsd(value: number): string {
  if (Math.abs(value) >= 1_000_000)
    return `$${(value / 1_000_000).toFixed(2)}M`;
  if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  if (Math.abs(value) >= 1) return `$${value.toFixed(2)}`;
  if (Math.abs(value) >= 0.001) return `$${value.toFixed(4)}`;
  return `$${value.toFixed(8)}`;
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toFixed(0);
}

export function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.floor(seconds)} seconds`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  const remainingMin = minutes % 60;
  return `${hours}h ${remainingMin}m`;
}

export function shortenAddress(address: string, chars: number = 4): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function getExplorerUrl(address: string, chain: "solana" | "base"): string {
  if (chain === "solana") return `https://solscan.io/token/${address}`;
  return `https://basescan.org/token/${address}`;
}

export function getTxUrl(txHash: string, chain: "solana" | "base"): string {
  if (chain === "solana") return `https://solscan.io/tx/${txHash}`;
  return `https://basescan.org/tx/${txHash}`;
}

export function getLpAgeLabel(seconds: number): { text: string; color: string } {
  const minutes = seconds / 60;
  if (minutes < 5) return { text: `${Math.floor(minutes)}min`, color: "text-green-400" };
  if (minutes < 30) return { text: `${Math.floor(minutes)}min`, color: "text-green-300" };
  if (minutes < 60) return { text: `${Math.floor(minutes)}min`, color: "text-yellow-400" };
  const hours = minutes / 60;
  if (hours < 24) return { text: `${hours.toFixed(1)}h`, color: "text-orange-400" };
  return { text: `${Math.floor(hours / 24)}d`, color: "text-gray-400" };
}

export function getRiskColor(score: number): string {
  if (score <= 3) return "text-green-400";
  if (score <= 5) return "text-yellow-400";
  if (score <= 7) return "text-orange-400";
  return "text-red-400";
}

export function getStatusIcon(status: string): string {
  switch (status) {
    case "tp_hit": return "✅";
    case "sl_hit": return "❌";
    case "open": return "⏳";
    case "time_stop": return "⏰";
    case "emergency_exit": return "🚨";
    case "manual_close": return "🔒";
    default: return "⏳";
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case "tp_hit": return "TP HIT";
    case "sl_hit": return "SL HIT";
    case "open": return "HOLD";
    case "pending": return "PENDING";
    case "time_stop": return "TIME STOP";
    case "emergency_exit": return "EMERGENCY";
    case "manual_close": return "CLOSED";
    default: return status.toUpperCase();
  }
}

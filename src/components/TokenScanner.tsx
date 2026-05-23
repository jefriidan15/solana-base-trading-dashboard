"use client";

import { useState, useCallback } from "react";
import { useStore } from "@/store/useStore";
import { isSolanaAddress, fetchSolanaToken } from "@/lib/solana";
import { isBaseAddress, fetchBaseToken } from "@/lib/base";
import { runSafetyChecks } from "@/lib/safety";
import {
  formatUsd,
  formatNumber,
  getRiskColor,
  shortenAddress,
  getExplorerUrl,
  getLpAgeLabel,
} from "@/lib/utils";
import type { TokenAnalysis } from "@/types";
import toast from "react-hot-toast";

export default function TokenScanner() {
  const [input, setInput] = useState("");
  const {
    currentToken,
    setCurrentToken,
    isScanning,
    setScanning,
    clearPriceHistory,
  } = useStore();

  const handleScan = useCallback(async () => {
    const address = input.trim();
    if (!address) return;

    setScanning(true);
    setCurrentToken(null);
    clearPriceHistory();

    try {
      let token: TokenAnalysis;

      if (isSolanaAddress(address)) {
        toast.loading("Scanning Solana token...", { id: "scan" });
        token = await fetchSolanaToken(address);
      } else if (isBaseAddress(address)) {
        toast.loading("Scanning Base token...", { id: "scan" });
        token = await fetchBaseToken(address);
      } else {
        toast.error("Invalid address. Must be Solana or Base (EVM).", {
          id: "scan",
        });
        setScanning(false);
        return;
      }

      setCurrentToken(token);
      toast.success(`Found: ${token.symbol}`, { id: "scan" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Scan failed";
      toast.error(msg, { id: "scan" });
    }

    setScanning(false);
  }, [input, setCurrentToken, setScanning, clearPriceHistory]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleScan()}
          placeholder="Paste Contract Address (Solana or Base)..."
          className="flex-1 bg-gray-900 border border-green-500/20 rounded-lg px-4 py-3 text-green-400 font-mono text-sm focus:outline-none focus:border-green-400 placeholder-gray-600"
        />
        <button
          onClick={handleScan}
          disabled={isScanning || !input.trim()}
          className="px-6 py-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 font-mono font-bold hover:bg-green-500/30 transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {isScanning ? (
            <span className="animate-pulse">SCANNING...</span>
          ) : (
            "🔍 SCAN"
          )}
        </button>
      </div>

      {currentToken && <TokenAnalysisCard token={currentToken} />}
    </div>
  );
}

function TokenAnalysisCard({ token }: { token: TokenAnalysis }) {
  const safetyChecks = runSafetyChecks(token);
  const lpAge = getLpAgeLabel(token.lpAge);

  return (
    <div className="border border-green-500/20 rounded-lg bg-gray-900/50 overflow-hidden">
      <div className="px-4 py-3 border-b border-green-500/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg">🔍</span>
          <div>
            <h3 className="text-green-400 font-mono font-bold">TOKEN ANALYSIS</h3>
          </div>
        </div>
        <span
          className={`px-2 py-1 rounded text-xs font-mono ${
            token.chain === "solana"
              ? "bg-purple-500/20 text-purple-400"
              : "bg-blue-500/20 text-blue-400"
          }`}
        >
          {token.chain.toUpperCase()}
        </span>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm font-mono">
          <InfoRow label="Name" value={`$${token.symbol} ${token.name}`} />
          <InfoRow
            label="Address"
            value={shortenAddress(token.address)}
            link={getExplorerUrl(token.address, token.chain)}
          />
          <InfoRow label="Price" value={formatUsd(token.price)} />
          <InfoRow
            label="LP Age"
            value={lpAge.text}
            valueClass={lpAge.color}
            suffix={token.lpAge < 300 ? " (🟢 EARLY)" : ""}
          />
          <InfoRow
            label="Liquidity"
            value={formatUsd(token.liquidity)}
            valueClass={
              token.liquidity < 10000 ? "text-yellow-400" : "text-green-400"
            }
            suffix={token.liquidity < 10000 ? " (⚠️ LOW)" : ""}
          />
          <InfoRow label="Market Cap" value={formatUsd(token.marketCap)} />
          <InfoRow
            label="Holders"
            value={`${formatNumber(token.holders)}`}
            suffix={
              token.holdersGrowthRate > 0
                ? ` (+${token.holdersGrowthRate}/min)`
                : ""
            }
          />
          <InfoRow label="24h Volume" value={formatUsd(token.volume24h)} />
          <InfoRow
            label="24h Change"
            value={`${token.priceChange24h >= 0 ? "+" : ""}${token.priceChange24h.toFixed(1)}%`}
            valueClass={
              token.priceChange24h >= 0 ? "text-green-400" : "text-red-400"
            }
          />
        </div>

        <div className="border-t border-green-500/10 pt-3">
          <h4 className="text-green-600 text-xs font-mono mb-2">SAFETY CHECKS</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            {safetyChecks.map((check, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-mono">
                <span>{check.passed ? "✅" : "❌"}</span>
                <span className={check.passed ? "text-green-400" : "text-red-400"}>
                  {check.name}: {check.message}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-green-500/10 pt-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🚩</span>
            <span className="text-gray-400 text-sm font-mono">RISK SCORE:</span>
            <span className={`text-lg font-mono font-bold ${getRiskColor(token.riskScore)}`}>
              {token.riskScore}/10
            </span>
            <span
              className={`text-xs font-mono px-2 py-0.5 rounded ${getRiskColor(token.riskScore)} bg-gray-800`}
            >
              {token.riskLevel.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <a
            href={token.dexUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center py-2 bg-blue-500/10 border border-blue-500/30 rounded text-blue-400 text-sm font-mono hover:bg-blue-500/20 transition-colors"
          >
            📈 CHART
          </a>
          <button
            type="button"
            disabled
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded text-gray-500 text-sm font-mono cursor-not-allowed"
            title="Live trading disabled in public sanitized build"
          >
            READ-ONLY BUILD
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  link,
  suffix,
  valueClass = "text-white",
}: {
  label: string;
  value: string;
  link?: string;
  suffix?: string;
  valueClass?: string;
}) {
  return (
    <div className="bg-black/20 rounded p-2">
      <div className="text-gray-500 text-[10px] uppercase tracking-wide">{label}</div>
      <div className={`text-xs mt-1 ${valueClass}`}>
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" className="hover:underline">
            {value}
          </a>
        ) : (
          value
        )}
        {suffix && <span className="text-gray-500">{suffix}</span>}
      </div>
    </div>
  );
}

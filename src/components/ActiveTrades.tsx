"use client";

import { useStore } from "@/store/useStore";
import {
  formatUsd,
  formatPercent,
  formatTimeAgo,
  getStatusIcon,
  getStatusLabel,
  shortenAddress,
} from "@/lib/utils";
import type { Trade } from "@/types";

export default function ActiveTrades() {
  const { trades } = useStore();
  const activeTrades = trades.filter(
    (t) => t.status === "open" || t.status === "pending"
  );

  return (
    <div className="border border-green-500/20 rounded-lg bg-gray-900/50">
      <div className="px-4 py-3 border-b border-green-500/10 flex items-center justify-between">
        <h3 className="text-green-400 font-mono font-bold text-sm">
          📊 ACTIVE TRADES ({activeTrades.length})
        </h3>
        <span className="text-gray-500 text-xs font-mono">
          {trades.filter((t) => t.mode === "simulation").length > 0 && "SIM MODE"}
        </span>
      </div>

      {activeTrades.length === 0 ? (
        <div className="p-6 text-center text-gray-600 font-mono text-sm">
          No active trades. Scan a token and click Auto-Trade to start.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-green-500/10">
                <th className="text-left px-4 py-2">Token</th>
                <th className="text-right px-4 py-2">Entry</th>
                <th className="text-right px-4 py-2">Current</th>
                <th className="text-right px-4 py-2">PnL</th>
                <th className="text-center px-4 py-2">Status</th>
                <th className="text-right px-4 py-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {activeTrades.map((trade) => (
                <TradeRow key={trade.id} trade={trade} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function TradeRow({ trade }: { trade: Trade }) {
  return (
    <tr className="border-b border-green-500/5 hover:bg-green-500/5 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              trade.chain === "solana" ? "bg-purple-400" : "bg-blue-400"
            }`}
          />
          <div>
            <div className="text-green-300 font-bold">${trade.tokenSymbol}</div>
            <div className="text-gray-600 text-xs">
              {trade.mode === "simulation" && "SIM "}
              {shortenAddress(trade.tokenAddress)}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-right text-gray-300">
        {formatUsd(trade.entryPrice)}
      </td>
      <td className="px-4 py-3 text-right text-gray-300">
        {formatUsd(trade.currentPrice)}
      </td>
      <td
        className={`px-4 py-3 text-right font-bold ${
          trade.pnlPercent >= 0 ? "text-green-400" : "text-red-400"
        }`}
      >
        {formatPercent(trade.pnlPercent)}
      </td>
      <td className="px-4 py-3 text-center">
        <span className="text-xs">
          {getStatusIcon(trade.status)} {getStatusLabel(trade.status)}
        </span>
      </td>
      <td className="px-4 py-3 text-right text-gray-500 text-xs">
        {formatTimeAgo(trade.entryTime)}
      </td>
    </tr>
  );
}

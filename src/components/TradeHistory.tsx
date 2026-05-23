"use client";

import { useStore } from "@/store/useStore";
import {
  formatUsd,
  formatPercent,
  getStatusIcon,
  getStatusLabel,
  getTxUrl,
} from "@/lib/utils";
import type { Trade } from "@/types";

export default function TradeHistory() {
  const { trades, selectedChain, setSelectedChain } = useStore();
  const closedTrades = trades.filter(
    (t) =>
      t.status !== "open" &&
      t.status !== "pending" &&
      (selectedChain === "all" || t.chain === selectedChain)
  );

  const totalPnl = closedTrades.reduce((sum, t) => sum + t.pnlPercent, 0);
  const wins = closedTrades.filter((t) => t.pnlPercent > 0).length;
  const losses = closedTrades.filter((t) => t.pnlPercent < 0).length;
  const winRate =
    closedTrades.length > 0
      ? ((wins / closedTrades.length) * 100).toFixed(0)
      : "0";

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Trades" value={closedTrades.length.toString()} />
        <StatCard
          label="Win Rate"
          value={`${winRate}%`}
          color={parseInt(winRate) >= 50 ? "text-green-400" : "text-red-400"}
        />
        <StatCard
          label="Total PnL"
          value={formatPercent(totalPnl)}
          color={totalPnl >= 0 ? "text-green-400" : "text-red-400"}
        />
        <StatCard
          label="W / L"
          value={`${wins} / ${losses}`}
          color="text-gray-300"
        />
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(["all", "solana", "base"] as const).map((chain) => (
          <button
            key={chain}
            onClick={() => setSelectedChain(chain)}
            className={`px-3 py-1 rounded text-xs font-mono border transition-colors ${
              selectedChain === chain
                ? "bg-green-500/20 border-green-500/50 text-green-400"
                : "bg-gray-800 border-gray-700 text-gray-500 hover:text-gray-300"
            }`}
          >
            {chain.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="border border-green-500/20 rounded-lg bg-gray-900/50 overflow-hidden">
        {closedTrades.length === 0 ? (
          <div className="p-6 text-center text-gray-600 font-mono text-sm">
            No trade history yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="text-gray-500 text-xs border-b border-green-500/10">
                  <th className="text-left px-4 py-2">Token</th>
                  <th className="text-right px-4 py-2">Entry</th>
                  <th className="text-right px-4 py-2">Exit</th>
                  <th className="text-right px-4 py-2">PnL</th>
                  <th className="text-center px-4 py-2">Status</th>
                  <th className="text-right px-4 py-2">Duration</th>
                  <th className="text-center px-4 py-2">TX</th>
                </tr>
              </thead>
              <tbody>
                {closedTrades.map((trade) => (
                  <HistoryRow key={trade.id} trade={trade} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryRow({ trade }: { trade: Trade }) {
  const duration = trade.exitTime
    ? Math.floor((trade.exitTime - trade.entryTime) / 60000)
    : 0;

  return (
    <tr className="border-b border-green-500/5 hover:bg-green-500/5">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              trade.chain === "solana" ? "bg-purple-400" : "bg-blue-400"
            }`}
          />
          <div>
            <span className="text-green-300 font-bold">${trade.tokenSymbol}</span>
            {trade.mode === "simulation" && (
              <span className="text-gray-600 text-xs ml-1">SIM</span>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-right text-gray-300">
        {formatUsd(trade.entryPrice)}
      </td>
      <td className="px-4 py-3 text-right text-gray-300">
        {trade.exitPrice ? formatUsd(trade.exitPrice) : "—"}
      </td>
      <td
        className={`px-4 py-3 text-right font-bold ${
          trade.pnlPercent >= 0 ? "text-green-400" : "text-red-400"
        }`}
      >
        {formatPercent(trade.pnlPercent)}
      </td>
      <td className="px-4 py-3 text-center text-xs">
        {getStatusIcon(trade.status)} {getStatusLabel(trade.status)}
      </td>
      <td className="px-4 py-3 text-right text-gray-500 text-xs">
        {duration}m
      </td>
      <td className="px-4 py-3 text-center">
        {trade.txHash && !trade.txHash.startsWith("sim_") ? (
          <a
            href={getTxUrl(trade.txHash, trade.chain)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 text-xs hover:underline"
          >
            View
          </a>
        ) : (
          <span className="text-gray-600 text-xs">—</span>
        )}
      </td>
    </tr>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="border border-green-500/20 rounded-lg bg-gray-900/50 p-3">
      <div className="text-gray-500 text-xs font-mono">{label}</div>
      <div className={`text-lg font-mono font-bold ${color || "text-green-400"}`}>
        {value}
      </div>
    </div>
  );
}

"use client";

import { useStore } from "@/store/useStore";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { formatUsd } from "@/lib/utils";

export default function PriceChart() {
  const { priceHistory, indicators } = useStore();

  if (priceHistory.length < 2) {
    return (
      <div className="border border-green-500/20 rounded-lg bg-gray-900/50 p-4">
        <h3 className="text-green-400 font-mono font-bold text-sm mb-2">
          📊 PRICE CHART
        </h3>
        <div className="h-48 flex items-center justify-center text-gray-600 font-mono text-sm">
          Scan a token to see price data...
        </div>
      </div>
    );
  }

  const chartData = priceHistory.map((p, i) => ({
    time: new Date(p.timestamp).toLocaleTimeString(),
    price: p.price,
    volume: p.volume,
    index: i,
  }));

  return (
    <div className="border border-green-500/20 rounded-lg bg-gray-900/50 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-green-400 font-mono font-bold text-sm">
          📊 PRICE CHART
        </h3>
        {indicators && (
          <div className="flex gap-3 text-xs font-mono">
            <span className="text-blue-400">
              SMA7: {formatUsd(indicators.sma7)}
            </span>
            <span className="text-orange-400">
              SMA20: {formatUsd(indicators.sma20)}
            </span>
            <span
              className={
                indicators.rsi < 30
                  ? "text-green-400"
                  : indicators.rsi > 70
                    ? "text-red-400"
                    : "text-gray-400"
              }
            >
              RSI: {indicators.rsi.toFixed(0)}
            </span>
          </div>
        )}
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              stroke="#374151"
              tick={{ fill: "#6b7280", fontSize: 10 }}
              tickLine={false}
            />
            <YAxis
              stroke="#374151"
              tick={{ fill: "#6b7280", fontSize: 10 }}
              tickLine={false}
              tickFormatter={(v) => formatUsd(v)}
              width={70}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111827",
                border: "1px solid rgba(34, 197, 94, 0.2)",
                borderRadius: "8px",
                fontFamily: "monospace",
                fontSize: "12px",
              }}
              labelStyle={{ color: "#6b7280" }}
              formatter={(value) => [formatUsd(Number(value)), "Price"]}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#22c55e"
              fill="url(#priceGradient)"
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Indicator Summary */}
      {indicators && (
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
          <IndicatorBadge
            label="SMA Cross"
            value={
              indicators.smaCrossover === "golden"
                ? "🟢 GOLDEN"
                : indicators.smaCrossover === "death"
                  ? "🔴 DEATH"
                  : "— NONE"
            }
            color={
              indicators.smaCrossover === "golden"
                ? "text-green-400"
                : indicators.smaCrossover === "death"
                  ? "text-red-400"
                  : "text-gray-500"
            }
          />
          <IndicatorBadge
            label="Signal"
            value={indicators.signal.toUpperCase()}
            color={
              indicators.signal === "buy"
                ? "text-green-400"
                : indicators.signal === "sell"
                  ? "text-red-400"
                  : "text-yellow-400"
            }
          />
          <IndicatorBadge
            label="Volume"
            value={indicators.volumeSpike ? "🔥 SPIKE" : "Normal"}
            color={indicators.volumeSpike ? "text-orange-400" : "text-gray-500"}
          />
          <IndicatorBadge
            label="Buy Pressure"
            value={`${(indicators.buyPressure * 100).toFixed(0)}%`}
            color={
              indicators.buyPressure > 0.6
                ? "text-green-400"
                : indicators.buyPressure < 0.4
                  ? "text-red-400"
                  : "text-gray-400"
            }
          />
        </div>
      )}
    </div>
  );
}

function IndicatorBadge({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-gray-800/50 rounded px-2 py-1">
      <div className="text-gray-500 text-[10px]">{label}</div>
      <div className={`${color} font-bold`}>{value}</div>
    </div>
  );
}

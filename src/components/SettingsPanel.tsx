"use client";

import { useStore } from "@/store/useStore";
import type { TradeConfig } from "@/types";

export default function SettingsPanel() {
  const { tradeConfig, setTradeConfig } = useStore();

  const update = (key: keyof TradeConfig, value: number | boolean | string) => {
    setTradeConfig({ [key]: value });
  };

  return (
    <div className="space-y-6">
      <div className="border border-green-500/20 rounded-lg bg-gray-900/50 p-6">
        <h2 className="text-green-400 font-mono font-bold text-lg mb-6">
          ⚙️ TRADING CONFIGURATION
        </h2>

        {/* Trading Mode */}
        <Section title="TRADING MODE">
          <div className="flex gap-3">
            <ModeButton
              label="⭕ Simulation"
              active={tradeConfig.mode === "simulation"}
              onClick={() => update("mode", "simulation")}
            />
            <ModeButton
              label="🔴 Real Trading"
              active={tradeConfig.mode === "real"}
              onClick={() => update("mode", "real")}
              danger
            />
          </div>
          {tradeConfig.mode === "real" && (
            <div className="mt-2 bg-red-500/10 border border-red-500/30 rounded p-2">
              <p className="text-red-400 text-xs font-mono">
                ⚠️ REAL MODE: Trades will execute with actual funds!
              </p>
            </div>
          )}
        </Section>

        {/* Buy Settings */}
        <Section title="BUY SETTINGS">
          <div className="grid grid-cols-2 gap-4">
            <NumberInput
              label="Buy Amount (SOL/ETH)"
              value={tradeConfig.buyAmount}
              onChange={(v) => update("buyAmount", v)}
              min={0.001}
              step={0.01}
            />
            <NumberInput
              label="Max Slippage (%)"
              value={tradeConfig.maxSlippage}
              onChange={(v) => update("maxSlippage", v)}
              min={0.1}
              max={50}
              step={0.5}
            />
          </div>
        </Section>

        {/* Entry Strategy */}
        <Section title="ENTRY STRATEGY">
          <div className="space-y-3">
            <Toggle
              label="SMA Crossover: Buy when SMA7 crosses above SMA20"
              checked={tradeConfig.smaEntry}
              onChange={(v) => update("smaEntry", v)}
            />
            <Toggle
              label={`Price Drop: Buy when price drops ${tradeConfig.priceDropPercent}%`}
              checked={tradeConfig.priceDropEntry}
              onChange={(v) => update("priceDropEntry", v)}
            />
            {tradeConfig.priceDropEntry && (
              <NumberInput
                label="Drop threshold (%)"
                value={tradeConfig.priceDropPercent}
                onChange={(v) => update("priceDropPercent", v)}
                min={1}
                max={50}
              />
            )}
            <Toggle
              label={`Early Entry: Buy within ${tradeConfig.earlyEntryMinutes}min of LP creation`}
              checked={tradeConfig.earlyEntry}
              onChange={(v) => update("earlyEntry", v)}
            />
            {tradeConfig.earlyEntry && (
              <NumberInput
                label="Early entry window (minutes)"
                value={tradeConfig.earlyEntryMinutes}
                onChange={(v) => update("earlyEntryMinutes", v)}
                min={1}
                max={60}
              />
            )}
          </div>
        </Section>

        {/* Exit Strategy */}
        <Section title="EXIT STRATEGY">
          <div className="grid grid-cols-2 gap-4">
            <NumberInput
              label="Take Profit (%)"
              value={tradeConfig.takeProfitPercent}
              onChange={(v) => update("takeProfitPercent", v)}
              min={1}
              max={1000}
            />
            <NumberInput
              label="Stop Loss (%)"
              value={tradeConfig.stopLossPercent}
              onChange={(v) => update("stopLossPercent", v)}
              min={1}
              max={100}
            />
            <NumberInput
              label="Trailing Stop (%)"
              value={tradeConfig.trailingStopPercent}
              onChange={(v) => update("trailingStopPercent", v)}
              min={1}
              max={50}
            />
            <NumberInput
              label="Time Stop (hours)"
              value={tradeConfig.timeStopHours}
              onChange={(v) => update("timeStopHours", v)}
              min={1}
              max={168}
            />
          </div>
        </Section>

        {/* Safety Limits */}
        <Section title="SAFETY LIMITS">
          <div className="grid grid-cols-2 gap-4">
            <NumberInput
              label="Max trades per day"
              value={tradeConfig.maxTradesPerDay}
              onChange={(v) => update("maxTradesPerDay", v)}
              min={1}
              max={100}
            />
            <NumberInput
              label="Max daily loss (%)"
              value={tradeConfig.maxDailyLossPercent}
              onChange={(v) => update("maxDailyLossPercent", v)}
              min={1}
              max={100}
            />
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6 last:mb-0">
      <h3 className="text-green-600 text-xs font-mono font-bold mb-3 border-b border-green-500/10 pb-1">
        ─── {title} ───
      </h3>
      {children}
    </div>
  );
}

function ModeButton({
  label,
  active,
  onClick,
  danger,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 rounded font-mono text-sm border transition-colors ${
        active
          ? danger
            ? "bg-red-500/20 border-red-500/50 text-red-400"
            : "bg-green-500/20 border-green-500/50 text-green-400"
          : "bg-gray-800 border-gray-700 text-gray-500 hover:text-gray-300"
      }`}
    >
      {label}
    </button>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div>
      <label className="text-gray-400 text-xs font-mono block mb-1">
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        min={min}
        max={max}
        step={step || 1}
        className="w-full bg-black border border-green-500/20 rounded px-3 py-2 text-green-400 font-mono text-sm focus:outline-none focus:border-green-400"
      />
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div
        className={`w-10 h-5 rounded-full transition-colors relative ${
          checked ? "bg-green-500/30" : "bg-gray-700"
        }`}
        onClick={() => onChange(!checked)}
      >
        <div
          className={`w-4 h-4 rounded-full absolute top-0.5 transition-all ${
            checked
              ? "bg-green-400 left-5"
              : "bg-gray-500 left-0.5"
          }`}
        />
      </div>
      <span className="text-gray-300 text-xs font-mono group-hover:text-green-400 transition-colors">
        {label}
      </span>
    </label>
  );
}

"use client";

import { useStore } from "@/store/useStore";
import { formatTimeAgo, shortenAddress } from "@/lib/utils";

const ALERT_ICONS: Record<string, string> = {
  new_token: "🆕",
  sma_cross: "📈",
  rsi_signal: "📊",
  volume_spike: "🔥",
  lp_drain: "🚨",
  rug_warning: "⚠️",
  tp_hit: "✅",
  sl_hit: "❌",
  price_alert: "💰",
};

export default function AlertsFeed() {
  const { alerts, markAlertRead, clearAlerts } = useStore();
  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <div className="border border-green-500/20 rounded-lg bg-gray-900/50">
      <div className="px-4 py-3 border-b border-green-500/10 flex items-center justify-between">
        <h3 className="text-green-400 font-mono font-bold text-sm">
          🔔 ALERTS{" "}
          {unreadCount > 0 && (
            <span className="bg-red-500/20 text-red-400 text-xs px-1.5 py-0.5 rounded-full ml-1">
              {unreadCount}
            </span>
          )}
        </h3>
        {alerts.length > 0 && (
          <button
            onClick={clearAlerts}
            className="text-gray-600 text-xs font-mono hover:text-gray-400 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="max-h-48 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="p-4 text-center text-gray-600 font-mono text-xs">
            No alerts yet
          </div>
        ) : (
          <div className="divide-y divide-green-500/5">
            {alerts.slice(0, 20).map((alert) => (
              <div
                key={alert.id}
                onClick={() => markAlertRead(alert.id)}
                className={`px-4 py-2 flex items-start gap-2 cursor-pointer hover:bg-green-500/5 transition-colors ${
                  !alert.read ? "bg-green-500/5" : ""
                }`}
              >
                <span className="text-sm mt-0.5">
                  {ALERT_ICONS[alert.type] || "🔔"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-300 text-xs font-mono truncate">
                    {alert.message}
                  </p>
                  <p className="text-gray-600 text-[10px] font-mono mt-0.5">
                    {formatTimeAgo(alert.timestamp)} •{" "}
                    {alert.chain.toUpperCase()}
                    {alert.tokenAddress &&
                      ` • ${shortenAddress(alert.tokenAddress)}`}
                  </p>
                </div>
                {!alert.read && (
                  <span className="w-2 h-2 rounded-full bg-green-400 mt-1 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

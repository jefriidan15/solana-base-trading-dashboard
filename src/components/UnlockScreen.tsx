"use client";

import { useState } from "react";
import { setSessionPassword } from "@/lib/crypto";
import { hasStoredKeys, verifyPassword } from "@/lib/keystore";
import { useStore } from "@/store/useStore";

export default function UnlockScreen() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const setUnlocked = useStore((s) => s.setUnlocked);

  const handleUnlock = async () => {
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (hasStoredKeys()) {
        const valid = await verifyPassword(password);
        if (!valid) {
          setError("Incorrect password");
          setLoading(false);
          return;
        }
      }
      setSessionPassword(password);
      setUnlocked(true);
    } catch {
      setError("Failed to unlock. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="border border-green-500/30 rounded-lg p-8 bg-black/80 backdrop-blur">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-green-400 text-4xl mb-2 font-mono">🚀</div>
            <h1 className="text-green-400 text-xl font-mono font-bold">
              EARLY TOKEN DETECTOR
            </h1>
            <p className="text-green-600 text-sm font-mono mt-1">
              Solana + Base Auto-Trading Bot
            </p>
          </div>

          {/* Warning Banner */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3 mb-6">
            <p className="text-yellow-400 text-xs font-mono text-center">
              ⚠️ Trading crypto involves substantial risk of loss.
              <br />
              Never trade more than you can afford to lose.
            </p>
          </div>

          {/* Password Input */}
          <div className="space-y-4">
            <div>
              <label className="text-green-600 text-xs font-mono block mb-1">
                {hasStoredKeys()
                  ? "🔐 Enter your encryption password"
                  : "🔐 Create an encryption password (min 6 chars)"}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                placeholder="••••••••"
                className="w-full bg-black border border-green-500/30 rounded px-4 py-3 text-green-400 font-mono focus:outline-none focus:border-green-400 placeholder-green-800"
              />
              {error && (
                <p className="text-red-400 text-xs font-mono mt-1">{error}</p>
              )}
            </div>

            <button
              onClick={handleUnlock}
              disabled={loading}
              className="w-full bg-green-500/20 border border-green-500/50 rounded py-3 text-green-400 font-mono font-bold hover:bg-green-500/30 transition-colors disabled:opacity-50"
            >
              {loading ? "Unlocking..." : hasStoredKeys() ? "🔓 UNLOCK" : "🔐 CREATE & ENTER"}
            </button>
          </div>

          {/* Info */}
          <div className="mt-6 text-center">
            <p className="text-green-800 text-xs font-mono">
              Your keys are encrypted with AES-256-GCM
              <br />
              Never stored in plaintext. BYOK Security.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

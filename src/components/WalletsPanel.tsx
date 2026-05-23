"use client";

export default function WalletsPanel() {
  return (
    <div className="space-y-6">
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <h3 className="text-blue-400 font-mono font-bold text-sm mb-1">
          👁️ READ-ONLY MODE
        </h3>
        <p className="text-blue-400/70 text-xs font-mono">
          This public build is configured as a showcase dashboard only. It does
          not request, store, or expose sensitive credentials or private
          infrastructure access.
        </p>
      </div>

      <div className="border border-green-500/20 rounded-lg bg-gray-900/50 p-4">
        <h3 className="text-green-400 font-mono font-bold text-sm mb-3">
          SAFE PROJECT SCOPE
        </h3>
        <ul className="space-y-2 text-xs font-mono text-gray-400 list-disc pl-5">
          <li>Token discovery and watchlist oriented workflow</li>
          <li>Read-only market monitoring UI</li>
          <li>No wallet import flow</li>
          <li>No sensitive credential fields</li>
          <li>No private server configuration</li>
        </ul>
      </div>

      <div className="border border-green-500/20 rounded-lg bg-gray-900/50 p-4">
        <h3 className="text-green-400 font-mono font-bold text-sm mb-3">
          PUBLISHING NOTE
        </h3>
        <p className="text-xs font-mono text-gray-400 leading-6">
          This version is intentionally sanitized for public sharing. Any
          execution logic that needs sensitive credentials should remain private
          and be configured only in a separate local-only environment.
        </p>
      </div>
    </div>
  );
}

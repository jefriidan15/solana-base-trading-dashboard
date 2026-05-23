// ═══════════════════════════════════════════════════════════
// PUBLIC SETTINGS STORE - read-only showcase preferences
// No credential, wallet secret, RPC secret, or server access is
// stored in this public build.
// ═══════════════════════════════════════════════════════════

import type { StoredKeys } from "@/types";

const STORAGE_PREFIX = "etd_public_";

const KEY_NAMES: (keyof StoredKeys)[] = [
  "watchlistName",
  "preferredChain",
  "themeMode",
];

export async function storeKey(
  keyName: keyof StoredKeys,
  value: string
): Promise<void> {
  localStorage.setItem(`${STORAGE_PREFIX}${keyName}`, value);
}

export async function getKey(
  keyName: keyof StoredKeys
): Promise<string | null> {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(`${STORAGE_PREFIX}${keyName}`);
}

export async function getAllKeys(): Promise<StoredKeys> {
  const keys: StoredKeys = {};
  for (const keyName of KEY_NAMES) {
    const value = await getKey(keyName);
    if (value) {
      (keys as Record<string, string>)[keyName] = value;
    }
  }
  return keys;
}

export function removeKey(keyName: keyof StoredKeys): void {
  localStorage.removeItem(`${STORAGE_PREFIX}${keyName}`);
}

export function removeAllKeys(): void {
  for (const keyName of KEY_NAMES) {
    removeKey(keyName);
  }
}

export function hasStoredKeys(): boolean {
  if (typeof window === "undefined") return false;
  return KEY_NAMES.some((k) =>
    localStorage.getItem(`${STORAGE_PREFIX}${k}`)
  );
}

export async function verifyPassword(): Promise<boolean> {
  return true;
}

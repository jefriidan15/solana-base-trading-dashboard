// ═══════════════════════════════════════════════════════════
// BYOK ENCRYPTION - AES-GCM client-side encryption
// ═══════════════════════════════════════════════════════════

const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const KEY_LENGTH = 256;
const ITERATIONS = 100000;

function getPasswordKey(password: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
}

async function deriveKey(
  passwordKey: CryptoKey,
  salt: Uint8Array
): Promise<CryptoKey> {
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt.buffer as ArrayBuffer,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptData(
  data: string,
  password: string
): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const passwordKey = await getPasswordKey(password);
  const aesKey = await deriveKey(passwordKey, salt);

  const encoder = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
    aesKey,
    encoder.encode(data)
  );

  const encryptedArray = new Uint8Array(encrypted);
  const combined = new Uint8Array(
    salt.length + iv.length + encryptedArray.length
  );
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(encryptedArray, salt.length + iv.length);

  return btoa(String.fromCharCode.apply(null, Array.from(combined)));
}

export async function decryptData(
  encryptedBase64: string,
  password: string
): Promise<string> {
  const combined = Uint8Array.from(atob(encryptedBase64), (c) =>
    c.charCodeAt(0)
  );

  const salt = combined.slice(0, SALT_LENGTH);
  const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const encrypted = combined.slice(SALT_LENGTH + IV_LENGTH);

  const passwordKey = await getPasswordKey(password);
  const aesKey = await deriveKey(passwordKey, salt);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
    aesKey,
    encrypted
  );

  return new TextDecoder().decode(decrypted);
}

// Session-based key manager
const SESSION_KEY = "etd_session_key";

export function setSessionPassword(password: string): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(SESSION_KEY, password);
  }
}

export function getSessionPassword(): string | null {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem(SESSION_KEY);
  }
  return null;
}

export function clearSession(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(SESSION_KEY);
  }
}

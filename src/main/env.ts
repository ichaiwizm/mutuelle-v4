import { mkdirSync } from "node:fs";
import { join } from "node:path";

let cachedUserData: string | null = null;

export function getUserDataDir(): string {
  if (cachedUserData) return cachedUserData;
  const fromEnv = process.env.MUTUELLE_USER_DATA;
  if (fromEnv && fromEnv.length > 0) {
    mkdirSync(fromEnv, { recursive: true });
    cachedUserData = fromEnv;
    return cachedUserData;
  }

  // Try to use Electron if available without making it a hard dependency for tests
  try {
    // Dynamic import of electron - works in both ESM and CommonJS contexts
    const electron = require('electron');
    const p = electron?.app?.getPath?.('userData');
    if (p) {
      mkdirSync(p, { recursive: true });
      cachedUserData = p;
      return cachedUserData;
    }
  } catch {
    // ignore, fallback below
  }

  // Last resort: cwd/.userData (useful for dev scripts)
  const fallback = join(process.cwd(), '.userData');
  mkdirSync(fallback, { recursive: true });
  cachedUserData = fallback;
  return cachedUserData;
}

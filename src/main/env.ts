import { mkdirSync } from "node:fs";
import { join } from "node:path";

let cachedUserData: string | null = null;

export function getUserDataDir(): string {
  if (cachedUserData) return cachedUserData;

  // Tests only - allow override via env var
  const fromEnv = process.env.MUTUELLE_USER_DATA;
  if (fromEnv && fromEnv.length > 0) {
    mkdirSync(fromEnv, { recursive: true });
    cachedUserData = fromEnv;
    return cachedUserData;
  }

  // Try to use Electron if available
  try {
    const electron = require('electron');
    const p = electron?.app?.getPath?.('userData') as string | undefined;
    if (p) {
      mkdirSync(p, { recursive: true });
      cachedUserData = p;
      return p;
    }
  } catch {
    // ignore, fallback below
  }

  // Fallback for CLI scripts (drizzle-kit, etc.) - use standard config path
  const home = process.env.HOME || process.env.USERPROFILE || '';
  const fallback = join(home, '.config', 'mutuelle-v4');
  mkdirSync(fallback, { recursive: true });
  cachedUserData = fallback;
  return cachedUserData;
}

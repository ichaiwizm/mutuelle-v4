import { mkdirSync } from "node:fs";
import { join } from "node:path";

let cachedUserData: string | null = null;

export function getUserDataDir(): string {
  if (cachedUserData) return cachedUserData;

  // Override via env var (pour cas spéciaux)
  const fromEnv = process.env.MUTUELLE_USER_DATA;
  if (fromEnv && fromEnv.length > 0) {
    mkdirSync(fromEnv, { recursive: true });
    cachedUserData = fromEnv;
    return cachedUserData;
  }

  // Toujours utiliser ~/.config/Electron/ (même chemin que l'app packagée)
  // Cela garantit que dev, tests e2e et app utilisent la même DB
  const home = process.env.HOME || process.env.USERPROFILE || '';
  const electronPath = join(home, '.config', 'Electron');
  mkdirSync(electronPath, { recursive: true });
  cachedUserData = electronPath;
  return cachedUserData;
}

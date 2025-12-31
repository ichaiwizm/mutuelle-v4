import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync, chmodSync } from "node:fs";
import { join, dirname } from "node:path";
import { getUserDataDir } from "@/main/env";

const KEY_LENGTH = 32;
let cachedMasterKey: Buffer | null = null;

function getKeyPath(): string {
  return join(getUserDataDir(), ".keys", "master.key");
}

function generateMasterKey(): Buffer {
  return randomBytes(KEY_LENGTH);
}

function saveMasterKey(key: Buffer): void {
  const keyPath = getKeyPath();
  const keyDir = dirname(keyPath);
  mkdirSync(keyDir, { recursive: true, mode: 0o700 });
  writeFileSync(keyPath, key.toString("hex"), { encoding: "utf-8", mode: 0o600 });
  try { chmodSync(keyPath, 0o600); chmodSync(keyDir, 0o700); } catch { /* Windows */ }
}

function loadMasterKey(): Buffer | null {
  const keyPath = getKeyPath();
  if (!existsSync(keyPath)) return null;
  return Buffer.from(readFileSync(keyPath, "utf-8").trim(), "hex");
}

export function getMasterKey(): Buffer {
  if (cachedMasterKey) return cachedMasterKey;
  let key = loadMasterKey();
  if (!key) { key = generateMasterKey(); saveMasterKey(key); }
  cachedMasterKey = key;
  return key;
}

export function isReady(): boolean {
  try { getMasterKey(); return true; } catch { return false; }
}

export function clearCache(): void {
  cachedMasterKey = null;
}

export function getKeyPathForTest(): string {
  return getKeyPath();
}

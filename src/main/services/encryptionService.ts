import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  createHash,
} from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync, chmodSync } from "node:fs";
import { join, dirname } from "node:path";
import { getUserDataDir } from "../env";

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits

export type EncryptedData = {
  ciphertext: string; // hex-encoded
  iv: string; // hex-encoded
  authTag: string; // hex-encoded
  version: string; // encryption version for future migrations
};

let cachedMasterKey: Buffer | null = null;

function getKeyPath(): string {
  const userDataDir = getUserDataDir();
  return join(userDataDir, ".keys", "master.key");
}

function generateMasterKey(): Buffer {
  return randomBytes(KEY_LENGTH);
}

function saveMasterKey(key: Buffer): void {
  const keyPath = getKeyPath();
  const keyDir = dirname(keyPath);

  // Create directory with restricted permissions
  mkdirSync(keyDir, { recursive: true, mode: 0o700 });

  // Save key as hex
  writeFileSync(keyPath, key.toString("hex"), { encoding: "utf-8", mode: 0o600 });

  // Ensure file permissions on Unix systems
  try {
    chmodSync(keyPath, 0o600);
    chmodSync(keyDir, 0o700);
  } catch {
    // Ignore on Windows where chmod may not work as expected
  }
}

function loadMasterKey(): Buffer | null {
  const keyPath = getKeyPath();

  if (!existsSync(keyPath)) {
    return null;
  }

  const hexKey = readFileSync(keyPath, "utf-8").trim();
  return Buffer.from(hexKey, "hex");
}

export const EncryptionService = {
  /**
   * Get the master encryption key, creating one if it doesn't exist.
   * The key is cached in memory for performance.
   */
  getMasterKey(): Buffer {
    if (cachedMasterKey) {
      return cachedMasterKey;
    }

    let key = loadMasterKey();

    if (!key) {
      key = generateMasterKey();
      saveMasterKey(key);
    }

    cachedMasterKey = key;
    return key;
  },

  /**
   * Check if encryption is ready (master key exists or can be created).
   */
  isReady(): boolean {
    try {
      this.getMasterKey();
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Encrypt plaintext using AES-256-GCM.
   * Returns an object with ciphertext, IV, and authentication tag.
   * Each encryption uses a unique random IV.
   */
  encrypt(plaintext: string): EncryptedData {
    const key = this.getMasterKey();
    const iv = randomBytes(IV_LENGTH);

    const cipher = createCipheriv(ALGORITHM, key, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });

    let ciphertext = cipher.update(plaintext, "utf8", "hex");
    ciphertext += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    return {
      ciphertext,
      iv: iv.toString("hex"),
      authTag: authTag.toString("hex"),
      version: "1",
    };
  },

  /**
   * Decrypt data that was encrypted with encrypt().
   * Verifies the authentication tag to detect tampering.
   * Throws an error if decryption fails or data was tampered with.
   */
  decrypt(encrypted: EncryptedData): string {
    const key = this.getMasterKey();
    const iv = Buffer.from(encrypted.iv, "hex");
    const authTag = Buffer.from(encrypted.authTag, "hex");

    const decipher = createDecipheriv(ALGORITHM, key, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });

    decipher.setAuthTag(authTag);

    let plaintext = decipher.update(encrypted.ciphertext, "hex", "utf8");
    plaintext += decipher.final("utf8");

    return plaintext;
  },

  /**
   * Serialize encrypted data to a single string for storage.
   * Format: version:iv:authTag:ciphertext
   */
  serialize(encrypted: EncryptedData): string {
    return `${encrypted.version}:${encrypted.iv}:${encrypted.authTag}:${encrypted.ciphertext}`;
  },

  /**
   * Deserialize a string back to EncryptedData.
   * Throws if the format is invalid.
   */
  deserialize(serialized: string): EncryptedData {
    const parts = serialized.split(":");
    if (parts.length !== 4) {
      throw new Error("Invalid encrypted data format");
    }

    const [version, iv, authTag, ciphertext] = parts;

    return { version, iv, authTag, ciphertext };
  },

  /**
   * Convenience method: encrypt and serialize in one call.
   */
  encryptToString(plaintext: string): string {
    return this.serialize(this.encrypt(plaintext));
  },

  /**
   * Convenience method: deserialize and decrypt in one call.
   */
  decryptFromString(serialized: string): string {
    return this.decrypt(this.deserialize(serialized));
  },

  /**
   * Hash a string using SHA-256.
   * Useful for creating non-reversible identifiers.
   */
  hash(data: string): string {
    return createHash("sha256").update(data).digest("hex");
  },

  /**
   * Clear the cached master key (useful for testing).
   */
  _clearCache(): void {
    cachedMasterKey = null;
  },

  /**
   * Get the path to the master key file (useful for testing).
   */
  _getKeyPath(): string {
    return getKeyPath();
  },
};

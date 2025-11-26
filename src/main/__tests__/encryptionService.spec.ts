import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { existsSync, rmSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { EncryptionService } from "../services/encryptionService";

describe("EncryptionService", () => {
  beforeEach(() => {
    // Clear cached key before each test
    EncryptionService._clearCache();
  });

  afterEach(() => {
    // Clean up test key file
    const keyPath = EncryptionService._getKeyPath();
    if (existsSync(keyPath)) {
      rmSync(keyPath);
    }
    const keyDir = dirname(keyPath);
    if (existsSync(keyDir)) {
      rmSync(keyDir, { recursive: true });
    }
    EncryptionService._clearCache();
  });

  describe("getMasterKey", () => {
    it("creates a new key if none exists", () => {
      const key = EncryptionService.getMasterKey();
      expect(key).toBeInstanceOf(Buffer);
      expect(key.length).toBe(32); // 256 bits
    });

    it("returns the same key on subsequent calls", () => {
      const key1 = EncryptionService.getMasterKey();
      const key2 = EncryptionService.getMasterKey();
      expect(key1.equals(key2)).toBe(true);
    });

    it("persists key to disk and reloads it", () => {
      const key1 = EncryptionService.getMasterKey();
      EncryptionService._clearCache();
      const key2 = EncryptionService.getMasterKey();
      expect(key1.equals(key2)).toBe(true);
    });
  });

  describe("isReady", () => {
    it("returns true when encryption is available", () => {
      expect(EncryptionService.isReady()).toBe(true);
    });
  });

  describe("encrypt/decrypt", () => {
    it("encrypts and decrypts plaintext correctly", () => {
      const plaintext = "secret_password_123!@#$%";
      const encrypted = EncryptionService.encrypt(plaintext);
      const decrypted = EncryptionService.decrypt(encrypted);
      expect(decrypted).toBe(plaintext);
    });

    it("handles empty strings", () => {
      const plaintext = "";
      const encrypted = EncryptionService.encrypt(plaintext);
      const decrypted = EncryptionService.decrypt(encrypted);
      expect(decrypted).toBe(plaintext);
    });

    it("handles unicode characters", () => {
      const plaintext = "Mot de passe: café ☕ émojis 🔐";
      const encrypted = EncryptionService.encrypt(plaintext);
      const decrypted = EncryptionService.decrypt(encrypted);
      expect(decrypted).toBe(plaintext);
    });

    it("handles long strings", () => {
      const plaintext = "a".repeat(10000);
      const encrypted = EncryptionService.encrypt(plaintext);
      const decrypted = EncryptionService.decrypt(encrypted);
      expect(decrypted).toBe(plaintext);
    });

    it("produces different ciphertexts for same input (unique IVs)", () => {
      const plaintext = "secret";
      const enc1 = EncryptionService.encrypt(plaintext);
      const enc2 = EncryptionService.encrypt(plaintext);

      expect(enc1.ciphertext).not.toBe(enc2.ciphertext);
      expect(enc1.iv).not.toBe(enc2.iv);
      expect(enc1.authTag).not.toBe(enc2.authTag);
    });

    it("returns version 1 for current encryption", () => {
      const encrypted = EncryptionService.encrypt("test");
      expect(encrypted.version).toBe("1");
    });
  });

  describe("tamper detection", () => {
    it("fails to decrypt with tampered ciphertext", () => {
      const encrypted = EncryptionService.encrypt("secret");
      encrypted.ciphertext = "00" + encrypted.ciphertext.slice(2);

      expect(() => EncryptionService.decrypt(encrypted)).toThrow();
    });

    it("fails to decrypt with tampered IV", () => {
      const encrypted = EncryptionService.encrypt("secret");
      encrypted.iv = "00" + encrypted.iv.slice(2);

      expect(() => EncryptionService.decrypt(encrypted)).toThrow();
    });

    it("fails to decrypt with tampered authTag", () => {
      const encrypted = EncryptionService.encrypt("secret");
      encrypted.authTag = "0".repeat(32);

      expect(() => EncryptionService.decrypt(encrypted)).toThrow();
    });
  });

  describe("serialize/deserialize", () => {
    it("serializes and deserializes correctly", () => {
      const original: Parameters<typeof EncryptionService.encrypt>[0] = "test";
      const encrypted = EncryptionService.encrypt(original);
      const serialized = EncryptionService.serialize(encrypted);
      const deserialized = EncryptionService.deserialize(serialized);

      expect(deserialized).toEqual(encrypted);
    });

    it("throws on invalid format", () => {
      expect(() => EncryptionService.deserialize("invalid")).toThrow(
        "Invalid encrypted data format"
      );
      expect(() => EncryptionService.deserialize("a:b")).toThrow();
      expect(() => EncryptionService.deserialize("a:b:c:d:e")).toThrow();
    });

    it("serialized format is version:iv:authTag:ciphertext", () => {
      const encrypted = EncryptionService.encrypt("test");
      const serialized = EncryptionService.serialize(encrypted);
      const parts = serialized.split(":");

      expect(parts.length).toBe(4);
      expect(parts[0]).toBe(encrypted.version);
      expect(parts[1]).toBe(encrypted.iv);
      expect(parts[2]).toBe(encrypted.authTag);
      expect(parts[3]).toBe(encrypted.ciphertext);
    });
  });

  describe("encryptToString/decryptFromString", () => {
    it("round-trips correctly", () => {
      const plaintext = "my secret password";
      const encrypted = EncryptionService.encryptToString(plaintext);
      const decrypted = EncryptionService.decryptFromString(encrypted);

      expect(typeof encrypted).toBe("string");
      expect(decrypted).toBe(plaintext);
    });
  });

  describe("hash", () => {
    it("produces consistent SHA-256 hash", () => {
      const data = "test data";
      const hash1 = EncryptionService.hash(data);
      const hash2 = EncryptionService.hash(data);

      expect(hash1).toBe(hash2);
      expect(hash1.length).toBe(64); // 256 bits = 64 hex chars
    });

    it("produces different hashes for different inputs", () => {
      const hash1 = EncryptionService.hash("data1");
      const hash2 = EncryptionService.hash("data2");

      expect(hash1).not.toBe(hash2);
    });
  });
});

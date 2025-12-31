import { createCipheriv, createDecipheriv, randomBytes, createHash } from "node:crypto";
import { getMasterKey } from "./keyManager";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

export type EncryptedData = {
  ciphertext: string;
  iv: string;
  authTag: string;
  version: string;
};

export function encrypt(plaintext: string): EncryptedData {
  const key = getMasterKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  let ciphertext = cipher.update(plaintext, "utf8", "hex");
  ciphertext += cipher.final("hex");
  return { ciphertext, iv: iv.toString("hex"), authTag: cipher.getAuthTag().toString("hex"), version: "1" };
}

export function decrypt(encrypted: EncryptedData): string {
  const key = getMasterKey();
  const iv = Buffer.from(encrypted.iv, "hex");
  const authTag = Buffer.from(encrypted.authTag, "hex");
  const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);
  let plaintext = decipher.update(encrypted.ciphertext, "hex", "utf8");
  plaintext += decipher.final("utf8");
  return plaintext;
}

export function serialize(encrypted: EncryptedData): string {
  return `${encrypted.version}:${encrypted.iv}:${encrypted.authTag}:${encrypted.ciphertext}`;
}

export function deserialize(serialized: string): EncryptedData {
  const parts = serialized.split(":");
  if (parts.length !== 4) throw new Error("Invalid encrypted data format");
  const [version, iv, authTag, ciphertext] = parts;
  return { version, iv, authTag, ciphertext };
}

export function encryptToString(plaintext: string): string {
  return serialize(encrypt(plaintext));
}

export function decryptFromString(serialized: string): string {
  return decrypt(deserialize(serialized));
}

export function hash(data: string): string {
  return createHash("sha256").update(data).digest("hex");
}

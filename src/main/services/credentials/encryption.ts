import { EncryptionService } from "../encryptionService";

const ENCRYPTED_PREFIX = "ENC:";

export function encryptValue(plaintext: string): string {
  return ENCRYPTED_PREFIX + EncryptionService.encryptToString(plaintext);
}

export function decryptValue(stored: string): string {
  // Handle legacy unencrypted data
  if (!stored.startsWith(ENCRYPTED_PREFIX)) {
    return stored;
  }
  return EncryptionService.decryptFromString(stored.slice(ENCRYPTED_PREFIX.length));
}

export function isEncrypted(stored: string): boolean {
  return stored.startsWith(ENCRYPTED_PREFIX);
}

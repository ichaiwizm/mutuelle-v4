import { getMasterKey, isReady, clearCache, getKeyPathForTest } from "./keyManager";
import { encrypt, decrypt, serialize, deserialize, encryptToString, decryptFromString, hash, type EncryptedData } from "./crypto";

export type { EncryptedData };

export const EncryptionService = {
  getMasterKey,
  isReady,
  encrypt,
  decrypt,
  serialize,
  deserialize,
  encryptToString,
  decryptFromString,
  hash,
  _clearCache: clearCache,
  _getKeyPath: getKeyPathForTest,
};

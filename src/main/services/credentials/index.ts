/**
 * Credentials Service Module
 *
 * Handles platform credentials management with encryption and testing.
 *
 * Structure:
 * - credentialsService.ts: Main service for CRUD operations
 * - encryption.ts: Encryption/decryption utilities
 * - types.ts: Type definitions
 * - testers/: Platform-specific credential testers
 */

export { CredentialsService } from "./credentialsService";
export type { PlatformCredentials, CredentialsTestResult } from "./types";

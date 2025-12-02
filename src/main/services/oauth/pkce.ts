import { randomBytes, createHash } from "node:crypto";

/**
 * Generate a random code verifier for PKCE (Proof Key for Code Exchange)
 */
export function generateCodeVerifier(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * Generate code challenge from verifier using SHA256
 */
export function generateCodeChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

/**
 * Generate a random state parameter for CSRF protection
 */
export function generateState(): string {
  return randomBytes(16).toString("hex");
}

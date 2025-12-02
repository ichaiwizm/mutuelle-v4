/**
 * OAuth Service Module
 *
 * Handles Google OAuth 2.0 authentication for Gmail access.
 *
 * Structure:
 * - oauthService.ts: Main service with connect/disconnect
 * - constants.ts: OAuth URLs, scopes, and types
 * - pkce.ts: PKCE utilities (code verifier/challenge)
 * - tokenExchange.ts: Token exchange and user info
 */

export { OAuthService } from "./oauthService";
export type { OAuthResult } from "./constants";

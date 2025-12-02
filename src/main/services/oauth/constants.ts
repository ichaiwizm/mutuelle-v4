export const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
export const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
export const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "openid",
  "email",
  "profile",
].join(" ");
export const REDIRECT_PORT = 53682;
export const REDIRECT_URI = `http://127.0.0.1:${REDIRECT_PORT}/oauth2/callback`;
export const OAUTH_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export type OAuthResult =
  | { ok: true; email: string }
  | { ok: false; error: string };

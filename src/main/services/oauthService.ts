/**
 * OAuth Service for Google Gmail authentication
 *
 * Implements the OAuth 2.0 authorization code flow with PKCE for desktop apps.
 * Uses a local HTTP server to capture the callback.
 */

import { createServer, type Server } from "node:http";
import { URL, URLSearchParams } from "node:url";
import { randomBytes, createHash } from "node:crypto";
import { shell } from "electron";
import { MailAuthService } from "./mailAuthService";
import { AuthError, ValidationError, NetworkError } from "@/shared/errors";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";
const REDIRECT_PORT = 8089;
const REDIRECT_URI = `http://127.0.0.1:${REDIRECT_PORT}/callback`;

type OAuthResult = {
  ok: true;
  email: string;
} | {
  ok: false;
  error: string;
};

// Active OAuth flow state
let activeServer: Server | null = null;
let activeTimeout: NodeJS.Timeout | null = null;

/**
 * Generate a random code verifier for PKCE
 */
function generateCodeVerifier(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * Generate code challenge from verifier (SHA256)
 */
function generateCodeChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

/**
 * Get OAuth credentials from environment
 */
function getCredentials() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new ValidationError(
      "Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in environment"
    );
  }

  return { clientId, clientSecret };
}

/**
 * Exchange authorization code for tokens
 */
async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string
): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
}> {
  const { clientId, clientSecret } = getCredentials();

  const params = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: REDIRECT_URI,
    grant_type: "authorization_code",
    code_verifier: codeVerifier,
  });

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.json();
    const message = error.error_description || error.error || "Token exchange failed";
    throw new AuthError(message);
  }

  return response.json();
}

/**
 * Get user email from access token
 */
async function getUserEmail(accessToken: string): Promise<string> {
  const response = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    throw new NetworkError("Failed to get user info");
  }

  const data = await response.json();
  return data.email;
}

/**
 * Cleanup any active OAuth flow
 */
function cleanup() {
  if (activeServer) {
    activeServer.close();
    activeServer = null;
  }
  if (activeTimeout) {
    clearTimeout(activeTimeout);
    activeTimeout = null;
  }
}

export const OAuthService = {
  /**
   * Start the OAuth flow for Gmail
   * Opens the browser for user authorization and waits for callback
   */
  async connect(): Promise<OAuthResult> {
    // Cleanup any previous flow
    cleanup();

    const { clientId } = getCredentials();
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const state = randomBytes(16).toString("hex");

    return new Promise((resolve) => {
      // Create local server to capture callback
      const server = createServer(async (req, res) => {
        const url = new URL(req.url || "/", `http://127.0.0.1:${REDIRECT_PORT}`);

        if (url.pathname !== "/callback") {
          res.writeHead(404);
          res.end("Not Found");
          return;
        }

        const code = url.searchParams.get("code");
        const returnedState = url.searchParams.get("state");
        const error = url.searchParams.get("error");

        // Send response to browser
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });

        if (error) {
          res.end(`
            <html>
              <head><title>Erreur</title></head>
              <body style="font-family: system-ui; padding: 40px; text-align: center;">
                <h1>❌ Erreur d'authentification</h1>
                <p>${error}</p>
                <p>Vous pouvez fermer cette fenêtre.</p>
              </body>
            </html>
          `);
          cleanup();
          resolve({ ok: false, error });
          return;
        }

        if (!code || returnedState !== state) {
          res.end(`
            <html>
              <head><title>Erreur</title></head>
              <body style="font-family: system-ui; padding: 40px; text-align: center;">
                <h1>❌ Erreur</h1>
                <p>Code d'autorisation invalide ou state mismatch.</p>
                <p>Vous pouvez fermer cette fenêtre.</p>
              </body>
            </html>
          `);
          cleanup();
          resolve({ ok: false, error: "Invalid authorization response" });
          return;
        }

        try {
          // Exchange code for tokens
          const tokens = await exchangeCodeForTokens(code, codeVerifier);

          // Get user email
          const email = await getUserEmail(tokens.access_token);

          // Save tokens to database (encrypted)
          await MailAuthService.saveTokens({
            provider: "google",
            accountEmail: email,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiry: new Date(Date.now() + tokens.expires_in * 1000),
            scope: tokens.scope,
          });

          res.end(`
            <html>
              <head><title>Succès</title></head>
              <body style="font-family: system-ui; padding: 40px; text-align: center;">
                <h1>✅ Connexion réussie !</h1>
                <p>Compte connecté : <strong>${email}</strong></p>
                <p>Vous pouvez fermer cette fenêtre et retourner à l'application.</p>
              </body>
            </html>
          `);

          cleanup();
          resolve({ ok: true, email });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Unknown error";
          res.end(`
            <html>
              <head><title>Erreur</title></head>
              <body style="font-family: system-ui; padding: 40px; text-align: center;">
                <h1>❌ Erreur</h1>
                <p>${errorMessage}</p>
                <p>Vous pouvez fermer cette fenêtre.</p>
              </body>
            </html>
          `);
          cleanup();
          resolve({ ok: false, error: errorMessage });
        }
      });

      server.listen(REDIRECT_PORT, "127.0.0.1", () => {
        activeServer = server;

        // Build authorization URL
        const authParams = new URLSearchParams({
          client_id: clientId,
          redirect_uri: REDIRECT_URI,
          response_type: "code",
          scope: GMAIL_SCOPE,
          state,
          code_challenge: codeChallenge,
          code_challenge_method: "S256",
          access_type: "offline",
          prompt: "consent", // Force consent to get refresh token
        });

        const authUrl = `${GOOGLE_AUTH_URL}?${authParams.toString()}`;

        // Open browser
        shell.openExternal(authUrl);

        // Timeout after 5 minutes
        activeTimeout = setTimeout(() => {
          cleanup();
          resolve({ ok: false, error: "OAuth flow timed out" });
        }, 5 * 60 * 1000);
      });

      server.on("error", (err) => {
        cleanup();
        resolve({ ok: false, error: `Server error: ${err.message}` });
      });
    });
  },

  /**
   * Disconnect Gmail - delete tokens
   */
  async disconnect(): Promise<{ ok: boolean }> {
    const token = await MailAuthService.getToken();
    if (token) {
      await MailAuthService.deleteTokens("google", token.accountEmail);
    }
    return { ok: true };
  },

  /**
   * Check if OAuth flow is in progress
   */
  isFlowActive(): boolean {
    return activeServer !== null;
  },

  /**
   * Cancel any active OAuth flow
   */
  cancelFlow(): void {
    cleanup();
  },
};

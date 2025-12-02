/**
 * OAuth Service for Google Gmail authentication
 *
 * Implements the OAuth 2.0 authorization code flow with PKCE for desktop apps.
 * Uses a local HTTP server to capture the callback.
 */

import { createServer, type Server } from "node:http";
import { URL, URLSearchParams } from "node:url";
import { shell } from "electron";
import { MailAuthService } from "../mailAuthService";
import {
  GOOGLE_AUTH_URL,
  GMAIL_SCOPES,
  REDIRECT_PORT,
  REDIRECT_URI,
  OAUTH_TIMEOUT_MS,
  type OAuthResult,
} from "./constants";
import { generateCodeVerifier, generateCodeChallenge, generateState } from "./pkce";
import { getCredentials, exchangeCodeForTokens, getUserEmail } from "./tokenExchange";

// Active OAuth flow state
let activeServer: Server | null = null;
let activeTimeout: NodeJS.Timeout | null = null;

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

/**
 * Generate HTML response for OAuth callback
 */
function generateHtmlResponse(
  type: "success" | "error",
  title: string,
  message: string,
  email?: string
): string {
  const icon = type === "success" ? "✅" : "❌";
  const emailLine = email ? `<p>Compte connecté : <strong>${email}</strong></p>` : "";

  return `
    <html>
      <head><title>${title}</title></head>
      <body style="font-family: system-ui; padding: 40px; text-align: center;">
        <h1>${icon} ${title}</h1>
        ${emailLine}
        <p>${message}</p>
        <p>Vous pouvez fermer cette fenêtre.</p>
      </body>
    </html>
  `;
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
    const state = generateState();

    return new Promise((resolve) => {
      // Create local server to capture callback
      const server = createServer(async (req, res) => {
        const url = new URL(req.url || "/", `http://127.0.0.1:${REDIRECT_PORT}`);

        if (url.pathname !== "/oauth2/callback") {
          res.writeHead(404);
          res.end("Not Found");
          return;
        }

        const code = url.searchParams.get("code");
        const returnedState = url.searchParams.get("state");
        const error = url.searchParams.get("error");

        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });

        if (error) {
          res.end(generateHtmlResponse("error", "Erreur d'authentification", error));
          cleanup();
          resolve({ ok: false, error });
          return;
        }

        if (!code || returnedState !== state) {
          res.end(
            generateHtmlResponse(
              "error",
              "Erreur",
              "Code d'autorisation invalide ou state mismatch."
            )
          );
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

          res.end(
            generateHtmlResponse(
              "success",
              "Connexion réussie !",
              "Vous pouvez fermer cette fenêtre et retourner à l'application.",
              email
            )
          );

          cleanup();
          resolve({ ok: true, email });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Unknown error";
          res.end(generateHtmlResponse("error", "Erreur", errorMessage));
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
          scope: GMAIL_SCOPES,
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
        }, OAUTH_TIMEOUT_MS);
      });

      server.on("error", (err) => {
        console.error("[OAuth] Server error:", err);
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

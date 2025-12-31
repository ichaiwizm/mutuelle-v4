import { URLSearchParams } from "node:url";
import { shell } from "electron";
import type { Server } from "node:http";
import { MailAuthService } from "../mailAuthService";
import { GOOGLE_AUTH_URL, GMAIL_SCOPES, REDIRECT_PORT, REDIRECT_URI, OAUTH_TIMEOUT_MS, type OAuthResult } from "./constants";
import { generateCodeVerifier, generateCodeChallenge, generateState } from "./pkce";
import { getCredentials, exchangeCodeForTokens, getUserEmail } from "./tokenExchange";
import { createOAuthServer, generateHtmlResponse } from "./oauthServer";

let activeServer: Server | null = null;
let activeTimeout: NodeJS.Timeout | null = null;

function cleanup() {
  if (activeServer) { activeServer.close(); activeServer = null; }
  if (activeTimeout) { clearTimeout(activeTimeout); activeTimeout = null; }
}

export const OAuthService = {
  async connect(): Promise<OAuthResult> {
    cleanup();
    const { clientId } = getCredentials();
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const state = generateState();

    return new Promise(resolve => {
      const server = createOAuthServer(state, async result => {
        if ("error" in result) { cleanup(); resolve({ ok: false, error: result.error }); return; }
        try {
          const tokens = await exchangeCodeForTokens(result.code, codeVerifier);
          const email = await getUserEmail(tokens.access_token);
          await MailAuthService.saveTokens({
            provider: "google", accountEmail: email, accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token, expiry: new Date(Date.now() + tokens.expires_in * 1000), scope: tokens.scope,
          });
          server.emit("success", email);
          cleanup();
          resolve({ ok: true, email });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Unknown error";
          cleanup();
          resolve({ ok: false, error: errorMessage });
        }
      });

      server.listen(REDIRECT_PORT, "127.0.0.1", () => {
        activeServer = server;
        const authParams = new URLSearchParams({
          client_id: clientId, redirect_uri: REDIRECT_URI, response_type: "code", scope: GMAIL_SCOPES,
          state, code_challenge: codeChallenge, code_challenge_method: "S256", access_type: "offline", prompt: "consent",
        });
        shell.openExternal(`${GOOGLE_AUTH_URL}?${authParams.toString()}`);
        activeTimeout = setTimeout(() => { cleanup(); resolve({ ok: false, error: "OAuth flow timed out" }); }, OAUTH_TIMEOUT_MS);
      });

      server.on("error", err => { console.error("[OAuth] Server error:", err); cleanup(); resolve({ ok: false, error: `Server error: ${err.message}` }); });
    });
  },

  async disconnect(): Promise<{ ok: boolean }> {
    const token = await MailAuthService.getToken();
    if (token) await MailAuthService.deleteTokens("google", token.accountEmail);
    return { ok: true };
  },

  isFlowActive(): boolean { return activeServer !== null; },
  cancelFlow(): void { cleanup(); },
};

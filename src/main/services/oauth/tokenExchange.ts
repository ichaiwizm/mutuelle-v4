import { URLSearchParams } from "node:url";
import { AuthError, ValidationError, NetworkError } from "@/shared/errors";
import { GOOGLE_TOKEN_URL, REDIRECT_URI } from "./constants";

/**
 * Get OAuth credentials from environment variables
 */
export function getCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new ValidationError(
      "Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in environment"
    );
  }

  return { clientId, clientSecret };
}

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
};

/**
 * Exchange authorization code for tokens using PKCE
 */
export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string
): Promise<TokenResponse> {
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
export async function getUserEmail(accessToken: string): Promise<string> {
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

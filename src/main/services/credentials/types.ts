export type PlatformCredentials = {
  platform: string;
  login: string;
  password: string;
  courtierCode?: string; // Only for Entoria
};

export type CredentialsTestResult =
  | { ok: true }
  | {
      ok: false;
      error: "NO_CREDENTIALS" | "UNKNOWN_PLATFORM" | "LOGIN_FAILED" | "TIMEOUT" | "BROWSER_ERROR";
      message: string;
    };

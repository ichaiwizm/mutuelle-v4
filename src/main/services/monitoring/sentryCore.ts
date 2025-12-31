import * as Sentry from "@sentry/electron/main";
import { app } from "electron";

export const SENTRY_DSN = process.env.SENTRY_DSN || "";
const isDev = process.env.ELECTRON_RENDERER_URL !== undefined;

export function initSentry(): void {
  if (!SENTRY_DSN) {
    console.log("[SENTRY] No DSN configured, skipping initialization");
    return;
  }
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: isDev ? "development" : "production",
    release: `mutuelle@${app.getVersion()}`,
    tracesSampleRate: isDev ? 1.0 : 0.5,
    sampleRate: 1.0,
    beforeSend(event) {
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map(bc => {
          if (bc.message) {
            bc.message = bc.message
              .replace(/password[=:]\s*\S+/gi, "password=[REDACTED]")
              .replace(/login[=:]\s*\S+/gi, "login=[REDACTED]")
              .replace(/email[=:]\s*\S+/gi, "email=[REDACTED]");
          }
          return bc;
        });
      }
      return event;
    },
    ignoreErrors: ["net::ERR_INTERNET_DISCONNECTED", "net::ERR_NETWORK_CHANGED", "User cancelled", "Operation cancelled"],
  });
  console.log("[SENTRY] Initialized for environment:", isDev ? "development" : "production");
}

export function addBreadcrumb(category: string, message: string, data?: Record<string, unknown>, level: Sentry.SeverityLevel = "info"): void {
  if (!SENTRY_DSN) return;
  Sentry.addBreadcrumb({ category, message, data, level, timestamp: Date.now() / 1000 });
}

export function captureException(error: unknown, context?: { tags?: Record<string, string>; extra?: Record<string, unknown> }): void {
  if (!SENTRY_DSN) { console.error("[SENTRY] Would capture:", error); return; }
  Sentry.withScope(scope => {
    if (context?.tags) Object.entries(context.tags).forEach(([k, v]) => scope.setTag(k, v));
    if (context?.extra) Object.entries(context.extra).forEach(([k, v]) => scope.setExtra(k, v));
    Sentry.captureException(error);
  });
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = "info", context?: Record<string, unknown>): void {
  if (!SENTRY_DSN) return;
  Sentry.withScope(scope => {
    if (context) Object.entries(context).forEach(([k, v]) => scope.setExtra(k, v));
    Sentry.captureMessage(message, level);
  });
}

export function setUser(userId: string): void {
  if (!SENTRY_DSN) return;
  Sentry.setUser({ id: userId });
}

export async function flushSentry(): Promise<void> {
  if (!SENTRY_DSN) return;
  try { await Sentry.flush(2000); } catch { /* ignore */ }
}

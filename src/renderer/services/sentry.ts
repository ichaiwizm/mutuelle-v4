import * as Sentry from "@sentry/electron/renderer";

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN || "";

/**
 * Initialize Sentry for the renderer process.
 * Should be called as early as possible.
 */
export function initSentryRenderer(): void {
  if (!SENTRY_DSN) {
    console.log("[SENTRY-RENDERER] No DSN configured, skipping initialization");
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,

    // Integrations for browser environment
    integrations: [
      Sentry.browserTracingIntegration(),
    ],

    // Sampling rates
    tracesSampleRate: 1.0,
    sampleRate: 1.0,

    // Scrub sensitive data from breadcrumbs
    beforeSend(event) {
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
          if (breadcrumb.message) {
            breadcrumb.message = breadcrumb.message
              .replace(/password[=:]\s*\S+/gi, "password=[REDACTED]")
              .replace(/login[=:]\s*\S+/gi, "login=[REDACTED]")
              .replace(/email[=:]\s*\S+/gi, "email=[REDACTED]");
          }
          return breadcrumb;
        });
      }
      return event;
    },

    // Ignore certain errors
    ignoreErrors: [
      "ResizeObserver loop",
      "Non-Error exception captured",
    ],
  });

  console.log("[SENTRY-RENDERER] Initialized");
}

/**
 * Capture an exception with additional context.
 */
export function captureException(
  error: unknown,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  }
): void {
  if (!SENTRY_DSN) {
    console.error("[SENTRY-RENDERER] Would capture:", error);
    return;
  }

  Sentry.withScope((scope) => {
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }
    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    Sentry.captureException(error);
  });
}

/**
 * Capture a message (non-error event).
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = "info"
): void {
  if (!SENTRY_DSN) return;
  Sentry.captureMessage(message, level);
}

import * as Sentry from "@sentry/electron/main";
import { app } from "electron";

/**
 * Sentry configuration for crash reporting and error monitoring.
 *
 * Features:
 * - Automatic crash reporting
 * - Error tracking with context
 * - Breadcrumbs for debugging
 * - Performance monitoring (optional)
 *
 * Privacy:
 * - No PII is sent by default
 * - User ID is anonymized
 * - Sensitive data is scrubbed
 */

// DSN should be set via environment variable for production
// For beta testing, we use a placeholder that can be configured
const SENTRY_DSN = process.env.SENTRY_DSN || "";

const isDev = process.env.ELECTRON_RENDERER_URL !== undefined;

/**
 * Initialize Sentry for the main process.
 * Should be called as early as possible in the app lifecycle.
 */
export function initSentry(): void {
  // Skip if no DSN configured (development without Sentry)
  if (!SENTRY_DSN) {
    console.log("[SENTRY] No DSN configured, skipping initialization");
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,

    // Environment and release info
    environment: isDev ? "development" : "production",
    release: `mutuelle@${app.getVersion()}`,

    // Sampling rates
    tracesSampleRate: isDev ? 1.0 : 0.5, // 50% of transactions in production
    sampleRate: 1.0, // 100% of errors

    // Scrub sensitive data
    beforeSend(event) {
      // Remove any potential PII from breadcrumbs
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
          // Scrub credentials from messages
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
      // Ignore network errors that are expected
      "net::ERR_INTERNET_DISCONNECTED",
      "net::ERR_NETWORK_CHANGED",
      // Ignore user cancellations
      "User cancelled",
      "Operation cancelled",
    ],
  });

  console.log("[SENTRY] Initialized for environment:", isDev ? "development" : "production");
}

/**
 * Add a breadcrumb to help debug issues.
 */
export function addBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, unknown>,
  level: Sentry.SeverityLevel = "info"
): void {
  if (!SENTRY_DSN) return;

  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level,
    timestamp: Date.now() / 1000,
  });
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
    console.error("[SENTRY] Would capture:", error);
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
  level: Sentry.SeverityLevel = "info",
  context?: Record<string, unknown>
): void {
  if (!SENTRY_DSN) return;

  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    Sentry.captureMessage(message, level);
  });
}

/**
 * Set user context for error tracking.
 * Uses anonymized ID, no PII.
 */
export function setUser(userId: string): void {
  if (!SENTRY_DSN) return;

  Sentry.setUser({
    id: userId,
    // No email, username, or other PII
  });
}

/**
 * Add flow-specific context as breadcrumbs.
 */
export function trackFlowStart(flowKey: string, leadId: number, runId: string): void {
  addBreadcrumb("flow", `Flow started: ${flowKey}`, { leadId, runId }, "info");
}

export function trackFlowStep(flowKey: string, stepName: string, status: "start" | "success" | "error"): void {
  const level: Sentry.SeverityLevel = status === "error" ? "error" : "info";
  addBreadcrumb("flow.step", `Step ${status}: ${stepName}`, { flowKey }, level);
}

export function trackFlowComplete(flowKey: string, runId: string, success: boolean): void {
  const level: Sentry.SeverityLevel = success ? "info" : "error";
  addBreadcrumb("flow", `Flow ${success ? "completed" : "failed"}: ${flowKey}`, { runId }, level);
}

/**
 * Capture user feedback via Sentry.
 * Uses captureFeedback from @sentry/node (re-exported by @sentry/electron/main).
 * Returns true if sent, false if Sentry not configured.
 */
export function captureUserFeedback(feedback: {
  message: string;
  email?: string;
  name?: string;
}): boolean {
  if (!SENTRY_DSN) {
    console.log("[SENTRY] Would capture feedback:", feedback.message);
    return false;
  }

  Sentry.captureFeedback({
    message: feedback.message,
    email: feedback.email,
    name: feedback.name,
  });

  console.log("[SENTRY] Captured user feedback");
  return true;
}

/**
 * Flush pending events before app shutdown.
 */
export async function flushSentry(): Promise<void> {
  if (!SENTRY_DSN) return;

  try {
    await Sentry.flush(2000); // 2 second timeout
  } catch {
    // Ignore flush errors
  }
}

/**
 * Send a support request with attachments to Sentry.
 * Uses scope.addAttachment() for file data (screenshots, logs).
 */
export function captureSupportRequest(
  message: string,
  data: {
    runData: Record<string, unknown>;
    systemInfo: Record<string, unknown>;
    userMessage?: string;
  },
  attachments: Array<{
    filename: string;
    data: Buffer;
    contentType?: string;
  }>
): string | undefined {
  if (!SENTRY_DSN) {
    console.log("[SENTRY] Would capture support request:", message);
    return undefined;
  }

  let eventId: string | undefined;

  Sentry.withScope((scope) => {
    // Set tags for filtering in Sentry dashboard
    scope.setTag("type", "support_request");
    scope.setTag("run_status", data.runData.status as string);

    // Add structured data as extras
    scope.setExtra("runData", data.runData);
    scope.setExtra("systemInfo", data.systemInfo);
    if (data.userMessage) {
      scope.setExtra("userMessage", data.userMessage);
    }

    // Add attachments (screenshots, logs)
    for (const attachment of attachments) {
      scope.addAttachment({
        filename: attachment.filename,
        data: attachment.data,
        contentType: attachment.contentType || "application/octet-stream",
      });
    }

    // Capture as a message event (not an error)
    eventId = Sentry.captureMessage(message, "info");
  });

  console.log("[SENTRY] Captured support request, eventId:", eventId);
  return eventId;
}

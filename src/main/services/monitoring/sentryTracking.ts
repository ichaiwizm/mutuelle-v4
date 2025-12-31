import * as Sentry from "@sentry/electron/main";
import { addBreadcrumb, SENTRY_DSN } from "./sentryCore";

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

export function captureUserFeedback(feedback: { message: string; email?: string; name?: string }): boolean {
  if (!SENTRY_DSN) {
    console.log("[SENTRY] Would capture feedback:", feedback.message);
    return false;
  }
  Sentry.captureFeedback({ message: feedback.message, email: feedback.email, name: feedback.name });
  console.log("[SENTRY] Captured user feedback");
  return true;
}

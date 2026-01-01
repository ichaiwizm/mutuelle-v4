/**
 * Types for support log submission feature.
 */

export type SupportLogPayload = {
  runId: string;
  userMessage?: string;
};

export type SupportLogResult = {
  sent: boolean;
  eventId?: string;
  error?: string;
};

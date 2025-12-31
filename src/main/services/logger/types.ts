export interface LogContext {
  service?: string;
  flowKey?: string;
  leadId?: string;
  runId?: string;
  runItemId?: string;
  [key: string]: unknown;
}

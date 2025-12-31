export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

export type LogEntry = {
  timestamp: string;
  level: LogLevel;
  flowKey: string;
  leadId?: string;
  message: string;
  data?: Record<string, any>;
  error?: { message: string; stack?: string; name?: string };
};

export class FlowLogger {
  private flowKey: string;
  private leadId?: string;
  private verbose: boolean;

  constructor(flowKey: string, leadId?: string, verbose: boolean = false) {
    this.flowKey = flowKey;
    this.leadId = leadId;
    this.verbose = verbose;
  }

  info(message: string, data?: Record<string, any>): void {
    if (this.verbose) this.log("INFO", message, data);
  }

  warn(message: string, data?: Record<string, any>): void {
    this.log("WARN", message, data);
  }

  error(message: string, error?: Error, data?: Record<string, any>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: "ERROR",
      flowKey: this.flowKey,
      leadId: this.leadId,
      message,
      ...(data && { data }),
      ...(error && { error: { message: error.message, stack: error.stack, name: error.name } }),
    };
    console.error(JSON.stringify(entry));
  }

  debug(message: string, data?: Record<string, any>): void {
    if (this.verbose) this.log("DEBUG", message, data);
  }

  private log(level: LogLevel, message: string, data?: Record<string, any>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      flowKey: this.flowKey,
      leadId: this.leadId,
      message,
      ...(data && { data }),
    };
    const method = level === "ERROR" ? console.error : level === "WARN" ? console.warn : console.log;
    method(JSON.stringify(entry));
  }

  child(ctx: { stepId?: string; [key: string]: any }): FlowLogger {
    const child = new FlowLogger(this.flowKey, this.leadId, this.verbose);
    const origLog = child.log.bind(child);
    child.log = (level: LogLevel, msg: string, data?: Record<string, any>) => origLog(level, msg, { ...ctx, ...data });
    return child;
  }
}

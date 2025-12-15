/**
 * Custom error types for better error handling across IPC boundaries.
 * Each error has a unique code that can be used by the frontend to handle errors appropriately.
 */

export type ErrorCode =
  | 'VALIDATION'
  | 'AUTH'
  | 'NOT_FOUND'
  | 'ENCRYPTION'
  | 'NETWORK'
  | 'PLATFORM'
  | 'TIMEOUT'
  | 'CONFIG_MISSING'
  | 'UNKNOWN';

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly details?: Record<string, unknown>;

  constructor(code: ErrorCode, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace?.(this, this.constructor);
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

/**
 * Validation error - thrown when input data fails validation
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('VALIDATION', message, details);
    this.name = 'ValidationError';
  }
}

/**
 * Authentication error - thrown when authentication fails
 */
export class AuthError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('AUTH', message, details);
    this.name = 'AuthError';
  }
}

/**
 * Not found error - thrown when a resource is not found
 */
export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} not found: ${identifier}`
      : `${resource} not found`;
    super('NOT_FOUND', message, { resource, identifier });
    this.name = 'NotFoundError';
  }
}

/**
 * Encryption error - thrown when encryption/decryption fails
 */
export class EncryptionError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('ENCRYPTION', message, details);
    this.name = 'EncryptionError';
  }
}

/**
 * Network error - thrown when a network request fails
 */
export class NetworkError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('NETWORK', message, details);
    this.name = 'NetworkError';
  }
}

/**
 * Platform error - thrown when a platform-specific operation fails (Alptis, SwissLife, etc.)
 */
export class PlatformError extends AppError {
  readonly platform: string;

  constructor(platform: string, message: string, details?: Record<string, unknown>) {
    super('PLATFORM', message, { ...details, platform });
    this.name = 'PlatformError';
    this.platform = platform;
  }
}

/**
 * Timeout error - thrown when an operation times out
 */
export class TimeoutError extends AppError {
  constructor(operation: string, timeoutMs: number) {
    super('TIMEOUT', `${operation} timed out after ${timeoutMs}ms`, { operation, timeoutMs });
    this.name = 'TimeoutError';
  }
}

/**
 * Config missing error - thrown when required configuration is missing
 */
export class ConfigMissingError extends AppError {
  readonly configType: 'credentials' | 'settings';
  readonly platforms?: string[];

  constructor(
    configType: 'credentials' | 'settings',
    message: string,
    platforms?: string[]
  ) {
    super('CONFIG_MISSING', message, { configType, platforms });
    this.name = 'ConfigMissingError';
    this.configType = configType;
    this.platforms = platforms;
  }
}

/**
 * Result type for IPC handlers - discriminated union for success/error
 */
export type IpcResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ErrorCode; message: string; details?: Record<string, unknown> };

/**
 * Helper to create a success result
 */
export function success<T>(data: T): IpcResult<T> {
  return { ok: true, data };
}

/**
 * Helper to create an error result from an AppError
 */
export function failure<T>(error: AppError): IpcResult<T> {
  return {
    ok: false,
    error: error.code,
    message: error.message,
    details: error.details,
  };
}

/**
 * Helper to convert any error to an IpcResult
 */
export function toIpcResult<T>(error: unknown): IpcResult<T> {
  if (error instanceof AppError) {
    return failure(error);
  }

  const message = error instanceof Error ? error.message : String(error);
  return {
    ok: false,
    error: 'UNKNOWN',
    message,
  };
}

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Wrap an async handler to catch errors and convert them to IpcResult
 */
export function wrapHandler<T, Args extends unknown[]>(
  handler: (...args: Args) => Promise<T>
): (...args: Args) => Promise<IpcResult<T>> {
  return async (...args: Args) => {
    try {
      const data = await handler(...args);
      return success(data);
    } catch (error) {
      return toIpcResult(error);
    }
  };
}

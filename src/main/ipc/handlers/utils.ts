import { IpcMainInvokeEvent } from "electron";
import { ZodError, ZodSchema } from "zod";
import {
  AppError,
  ValidationError,
  IpcResult,
  success,
  failure,
  toIpcResult,
} from "@/shared/errors";

/**
 * Validate input with a Zod schema and throw ValidationError if invalid.
 */
export function validate<T>(schema: ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (err) {
    if (err instanceof ZodError) {
      const issues = err.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
      throw new ValidationError(`Validation failed: ${issues.join(", ")}`, {
        issues: err.issues,
      });
    }
    throw err;
  }
}

/**
 * Wrap an IPC handler with error handling and optional validation.
 */
export function handler<TInput, TOutput>(
  schema: ZodSchema<TInput> | null,
  fn: (input: TInput) => Promise<TOutput>
): (_event: IpcMainInvokeEvent, input: unknown) => Promise<IpcResult<TOutput>> {
  return async (_event, rawInput) => {
    try {
      const input = schema ? validate(schema, rawInput) : (rawInput as TInput);
      const result = await fn(input);
      return success(result);
    } catch (err) {
      if (err instanceof AppError) {
        return failure(err);
      }
      return toIpcResult(err);
    }
  };
}

/**
 * Simple handler without input validation.
 */
export function simpleHandler<TOutput>(
  fn: () => Promise<TOutput>
): () => Promise<IpcResult<TOutput>> {
  return async () => {
    try {
      const result = await fn();
      return success(result);
    } catch (err) {
      if (err instanceof AppError) {
        return failure(err);
      }
      return toIpcResult(err);
    }
  };
}

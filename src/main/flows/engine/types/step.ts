import type { ExecutionContext } from "./context";
import type { StepResult } from "./result";

/**
 * Interface that all Step implementations must follow
 */
export interface IStep<T = any> {
  execute(context: ExecutionContext<T>): Promise<StepResult>;
  validate?(context: ExecutionContext<T>): boolean;
  cleanup?(context: ExecutionContext<T>): Promise<void>;
}

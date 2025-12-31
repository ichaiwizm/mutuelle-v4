/**
 * Execution context factory for YAML flow engine
 * Creates and manages the execution context throughout flow execution
 */
import { randomUUID } from 'node:crypto';
import type { Page } from 'playwright';
import type { FlowDefinition, ExecutionContext, VariableStore } from './types/index.js';
import type { ResolverContext } from './interpreter/types.js';

/** Credentials for platform authentication */
export interface Credentials {
  username: string;
  password: string;
  [key: string]: string;
}

/** Options for creating execution context */
export interface ContextOptions {
  page: Page;
  lead: Record<string, unknown>;
  flowDef: FlowDefinition;
  credentials?: Credentials;
  metadata?: Record<string, unknown>;
  selectors?: Record<string, string>;
}

/** Creates initial variable store from lead data */
function createVariableStore(lead: Record<string, unknown>): VariableStore {
  return {
    input: { ...lead },
    extracted: {},
    computed: {},
    env: { ...process.env as Record<string, string> },
  };
}

/** Creates execution context for flow execution */
export function createContext(options: ContextOptions): ExecutionContext {
  const { lead, flowDef } = options;
  const executionId = randomUUID();

  return {
    executionId,
    flowId: flowDef.metadata.name,
    status: 'pending',
    variables: createVariableStore(lead),
    startTime: new Date(),
    currentStepIndex: 0,
    stepResults: [],
    logs: [],
    metadata: options.metadata ?? {},
  };
}

/** Creates resolver context from execution context */
export function createResolverContext(
  execCtx: ExecutionContext,
  options: ContextOptions
): ResolverContext {
  return {
    transformedData: execCtx.variables.input,
    credentials: options.credentials,
    metadata: execCtx.metadata,
    selectors: options.selectors,
  };
}

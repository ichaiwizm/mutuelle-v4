/**
 * YAML Engine Adapter - Wraps @mutuelle/engine for use in the main app
 */
import type { Page } from "playwright";
import { YamlFlowEngine, type FlowResult, type FlowDefinition, type Credentials } from "@mutuelle/engine";
import { FlowLoader, flowLoader } from "./flow-loader";
import { CredentialAdapter, credentialAdapter } from "./credential-adapter";
import { logger } from "@/main/services/logger";

export interface ExecuteOptions {
  page: Page;
  lead: Record<string, unknown>;
  platform?: string;
  credentials?: Credentials;
  metadata?: Record<string, unknown>;
  selectors?: Record<string, string>;
}

export interface LoadedFlow {
  flowKey: string;
  definition: FlowDefinition;
}

export class YamlEngineAdapter {
  private readonly engine = new YamlFlowEngine();
  private readonly loader: FlowLoader;
  private readonly credAdapter: CredentialAdapter;

  constructor(loader?: FlowLoader, credAdapter?: CredentialAdapter) {
    this.loader = loader ?? flowLoader;
    this.credAdapter = credAdapter ?? credentialAdapter;
  }

  /** Load a flow definition from the database */
  loadFromDb(flowKey: string): LoadedFlow {
    logger.info("Loading flow from database", { service: "YAML_ENGINE", flowKey });
    return { flowKey, definition: this.loader.loadFlow(flowKey) };
  }

  /** Execute a flow by key */
  async execute(flowKey: string, options: ExecuteOptions): Promise<FlowResult> {
    const { definition } = this.loadFromDb(flowKey);
    const credentials = await this.resolveCredentials(options);

    logger.info("Executing flow", {
      service: "YAML_ENGINE", flowKey, hasCredentials: !!credentials, leadKeys: Object.keys(options.lead),
    });

    const result = await this.engine.execute(definition, {
      page: options.page, lead: options.lead, flowDef: definition,
      credentials, metadata: options.metadata, selectors: options.selectors,
    });

    logger.info("Flow execution completed", {
      service: "YAML_ENGINE", flowKey, status: result.status, durationMs: result.durationMs,
    });
    return result;
  }

  /** Resume a paused flow by state ID */
  async resume(stateId: string, options: ExecuteOptions): Promise<FlowResult | null> {
    const credentials = await this.resolveCredentials(options);
    logger.info("Resuming flow", { service: "YAML_ENGINE", stateId, hasCredentials: !!credentials });

    const result = await this.engine.resume(stateId, {
      page: options.page, lead: options.lead,
      flowDef: { metadata: { name: "resumed", version: "1.0" }, steps: [] },
      credentials, metadata: options.metadata, selectors: options.selectors,
    });

    if (result) {
      logger.info("Flow resume completed", {
        service: "YAML_ENGINE", stateId, status: result.status, durationMs: result.durationMs,
      });
    }
    return result;
  }

  /** Pause the currently running flow */
  pause(): void { this.engine.pause(); }

  /** Clear the flow cache */
  clearCache(): void { this.loader.clearCache(); }

  /** Invalidate a specific flow from cache */
  invalidateCache(flowKey: string): void { this.loader.invalidate(flowKey); }

  /** Resolve credentials from options or fetch from service */
  private async resolveCredentials(options: ExecuteOptions): Promise<Credentials | undefined> {
    if (options.credentials) return options.credentials;
    if (options.platform) {
      return (await this.credAdapter.getCredentials(options.platform)) ?? undefined;
    }
    return undefined;
  }
}

export const yamlEngineAdapter = new YamlEngineAdapter();

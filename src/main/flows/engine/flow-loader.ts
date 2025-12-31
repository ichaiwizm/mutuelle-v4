/**
 * Flow Loader
 * Loads and caches flow definitions from the database
 */
import { FlowRepository, type Flow } from "@/main/db/repositories";
import { YamlParser, type FlowDefinition, type ParseResult } from "@mutuelle/engine";
import { logger } from "@/main/services/logger";

export interface CachedFlow {
  flow: FlowDefinition;
  checksum: string;
  loadedAt: Date;
}

export class FlowLoader {
  private readonly parser = new YamlParser();
  private readonly cache = new Map<string, CachedFlow>();

  /**
   * Load and parse a flow from the database
   * @param flowKey Unique flow identifier
   * @returns Parsed flow definition
   * @throws Error if flow not found or validation fails
   */
  loadFlow(flowKey: string): FlowDefinition {
    // Check cache first
    const cached = this.cache.get(flowKey);
    const dbFlow = FlowRepository.getActiveByFlowKey(flowKey);

    if (!dbFlow) {
      throw new Error(`Flow not found: ${flowKey}`);
    }

    // Return cached if checksum matches
    if (cached && cached.checksum === dbFlow.checksum) {
      logger.debug("Returning cached flow", { service: "FLOW_LOADER", flowKey });
      return cached.flow;
    }

    // Parse and validate
    logger.debug("Parsing flow from database", { service: "FLOW_LOADER", flowKey });
    const result = this.parseAndValidate(dbFlow);

    // Cache the parsed flow
    this.cache.set(flowKey, {
      flow: result.flow,
      checksum: result.checksum,
      loadedAt: new Date(),
    });

    return result.flow;
  }

  /** Clear all cached flows */
  clearCache(): void {
    this.cache.clear();
  }

  /** Invalidate a specific flow from cache */
  invalidate(flowKey: string): void {
    this.cache.delete(flowKey);
  }

  private parseAndValidate(dbFlow: Flow): ParseResult {
    const result = this.parser.parse(dbFlow.yamlContent);

    if (!result.valid) {
      const errorMessages = result.errors.map((e) => `${e.path}: ${e.message}`).join("; ");
      throw new Error(`Flow validation failed for ${dbFlow.flowKey}: ${errorMessages}`);
    }

    return result;
  }
}

export const flowLoader = new FlowLoader();

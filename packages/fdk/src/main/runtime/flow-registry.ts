/**
 * FlowRegistry - Registry for all FDK flow definitions
 * Manages flow registration and lookup
 */
import { entoriaPackFamilleFlow, transformLead as entoriaTransform } from '../flows/entoria-pack-famille';
import { swisslifeOneSLSISFlow } from '../flows/swisslife-one-slsis';
import { alptisSanteProPlusFlow } from '../flows/alptis-sante-pro-plus';
import { alptisSanteSelectFlow } from '../flows/alptis-sante-select';

export interface FlowDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  steps: unknown[];
  metadata?: Record<string, unknown>;
  formUrl?: string;
  platform?: string;
  product?: string;
}

export interface RegisteredFlow {
  definition: FlowDefinition;
  transformer?: (lead: Record<string, unknown>) => Record<string, unknown>;
}

class FlowRegistryImpl {
  private flows = new Map<string, RegisteredFlow>();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults(): void {
    // Register Entoria Pack Famille
    this.register({
      definition: entoriaPackFamilleFlow as unknown as FlowDefinition,
      transformer: (lead) => entoriaTransform(lead) as unknown as Record<string, unknown>,
    });

    // Register SwissLife One SLSIS
    this.register({
      definition: swisslifeOneSLSISFlow as unknown as FlowDefinition,
    });

    // Register Alptis Sante Pro Plus
    this.register({
      definition: alptisSanteProPlusFlow as unknown as FlowDefinition,
    });

    // Register Alptis Sante Select
    this.register({
      definition: alptisSanteSelectFlow as unknown as FlowDefinition,
    });
  }

  register(flow: RegisteredFlow): void {
    this.flows.set(flow.definition.id, flow);
  }

  getFlow(flowKey: string): RegisteredFlow | undefined {
    return this.flows.get(flowKey);
  }

  listFlows(): FlowDefinition[] {
    return Array.from(this.flows.values()).map((f) => f.definition);
  }

  hasFlow(flowKey: string): boolean {
    return this.flows.has(flowKey);
  }
}

export const flowRegistry = new FlowRegistryImpl();

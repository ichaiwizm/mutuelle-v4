/**
 * FlowRunner - Connects FDK flows to @mutuelle/engine for execution
 */
import { EventEmitter } from 'events';
import type { Page } from 'playwright-core';
import { YamlFlowEngine, type FlowResult, type FlowDefinition as EngineFlowDef } from '@mutuelle/engine';
import { BrowserManager, type BrowserConfig } from './browser-manager';
import { flowRegistry, type FlowDefinition } from './flow-registry';
import { LeadTransformerAdapter, type FdkTransformerConfig } from './lead-transformer-adapter';

export type RunnerStatus = 'idle' | 'initializing' | 'running' | 'paused' | 'stopped' | 'completed' | 'failed';

export interface RunnerEvents {
  'step:start': { stepId: string; stepIndex: number };
  'step:complete': { stepId: string; stepIndex: number; durationMs: number };
  'step:error': { stepId: string; stepIndex: number; error: string };
  'flow:complete': { flowId: string; result: FlowResult };
}

export class FlowRunner extends EventEmitter {
  private browserManager: BrowserManager;
  private engine: YamlFlowEngine;
  private status: RunnerStatus = 'idle';
  private currentFlowId: string | null = null;
  private page: Page | null = null;

  constructor(browserConfig?: BrowserConfig) {
    super();
    this.browserManager = new BrowserManager(browserConfig);
    this.engine = new YamlFlowEngine();
  }

  async init(): Promise<void> {
    this.status = 'initializing';
    this.page = await this.browserManager.launch();
    this.status = 'idle';
  }

  async run(flowKey: string, lead: Record<string, unknown>, credentials?: Record<string, string>): Promise<FlowResult> {
    if (!this.page) throw new Error('Browser not initialized. Call init() first.');
    const registeredFlow = flowRegistry.getFlow(flowKey);
    if (!registeredFlow) throw new Error(`Flow not found: ${flowKey}`);

    this.currentFlowId = flowKey;
    this.status = 'running';

    // Transform lead data if transformer exists
    let transformedLead = lead;
    if (registeredFlow.transformer) {
      const adapter = new LeadTransformerAdapter({ transform: registeredFlow.transformer } as FdkTransformerConfig);
      const result = adapter.transform(lead);
      if (!result.success) throw new Error(`Lead validation failed: ${JSON.stringify(result.validation.errors)}`);
      transformedLead = result.data;
    }

    const engineFlow = this.convertToEngineFlow(registeredFlow.definition);
    const result = await this.engine.execute(engineFlow, {
      page: this.page, flowDef: engineFlow, lead: transformedLead, credentials: { username: '', password: '', ...credentials },
    });

    this.status = result.status === 'completed' ? 'completed' : 'failed';
    this.emit('flow:complete', { flowId: flowKey, result });
    return result;
  }

  stop(): void {
    this.engine.pause();
    this.status = 'stopped';
  }

  async close(): Promise<void> {
    await this.browserManager.close();
    this.status = 'idle';
    this.page = null;
  }

  getStatus(): RunnerStatus { return this.status; }
  getCurrentFlowId(): string | null { return this.currentFlowId; }

  private convertToEngineFlow(fdkFlow: FlowDefinition): EngineFlowDef {
    return {
      metadata: { name: fdkFlow.id, version: fdkFlow.version },
      config: { defaultTimeout: 30000, maxRetries: 3, stopOnError: true },
      steps: fdkFlow.steps.map((step: unknown, idx: number) => ({
        id: `step-${idx}`, name: `Step ${idx}`, type: 'custom' as const, actions: [],
        ...(step as Record<string, unknown>),
      })),
    };
  }
}

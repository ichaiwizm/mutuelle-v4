/**
 * Main exports for the flow automation system
 */

// Engine
export { FlowEngine, Engine } from './engine/FlowEngine';
export { QueueManager } from './engine/QueueManager';
export { BrowserPool } from './engine/BrowserPool';
export { ArtifactManager } from './engine/ArtifactManager';

// Core abstractions
export { BaseProduct } from './core/BaseProduct';
export { BaseStep } from './core/BaseStep';
export { BaseTransformer } from './core/BaseTransformer';

// Core utilities
export { IframeNavigator } from './core/IframeNavigator';
export { DelayHandler } from './core/DelayHandler';
export { ConditionalFieldHandler } from './core/ConditionalFieldHandler';
export { FormFieldFiller } from './core/FormFieldFiller';
export { QuoteExtractor } from './core/QuoteExtractor';

// Registry
export { ProductRegistry } from './registry/ProductRegistry';

// Types
export type * from './types/FlowTypes';
export type * from './types/ProductTypes';
export type * from './types/QueueTypes';

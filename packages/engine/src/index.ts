/**
 * YAML Flow Engine - Main package entry point
 * Exports the engine, types, and all sub-modules
 */

// Main engine
export { YamlFlowEngine, type EngineState } from './yaml-flow-engine.js';

// Context factory
export {
  createContext,
  createResolverContext,
  type Credentials,
  type ContextOptions,
} from './execution-context.js';

// Core types
export type {
  // Flow types
  FlowDefinition, FlowResult, FlowConfig, FlowMetadata, FlowError, FlowValidationResult,
  // Step types
  StepDefinition, StepType, FieldDefinition, FieldType, StepCondition,
  AuthStep, NavigationStep, FormFillStep, ExtractionStep, CustomStep,
  // Context types
  ExecutionContext, ExecutionStatus, ExecutionLog, LogLevel,
  StepExecutionResult, VariableStore, BrowserContext, InterpreterContext,
  // Action types
  Action, ActionType, ActionDefinition, ExecutorActionType,
  // Transformer types
  MapperConfig, FieldMapping, TransformerConfig, TransformerPipeline,
  ValidationRule, ValidationResult, ValidationError,
  // Selector types
  Selector, SelectorStrategy, SelectorDefinition, SelectorWithFallback,
} from './types/index.js';

// Parser module
export { YamlParser, yamlParser, type ParseOptions, type ParseResult } from './parser/index.js';

// Interpreter module
export {
  ExpressionResolver,
  ConditionEvaluator,
  StepInterpreter,
  FieldFiller,
  RepeatHandler,
  type StepResult,
  type StepContext,
  type ResolverContext,
  type FieldFillerContext,
  type RepeatConfig,
} from './interpreter/index.js';

// Actions module
export { ActionExecutor, type ExecutionContext as ActionExecutionContext } from './actions/index.js';

// Transformer module
export {
  LeadTransformer,
  validateField,
  applyTransform,
  builtInTransforms,
  type TransformResult,
  type LeadTransformerConfig,
  type TransformFn,
} from './transformer/index.js';

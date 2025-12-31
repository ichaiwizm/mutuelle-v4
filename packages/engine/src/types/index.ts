/**
 * Core type definitions for the YAML flow engine
 */

// Selector types
export type { SelectorStrategy, SelectorDefinition, SelectorWithFallback, Selector, FrameSelector, ResolvedSelector } from './selector.js';
export { hasFallbacks, normalizeSelector } from './selector.js';

// Action types
export type { GotoAction, ClickAction, FillAction, SelectAction, WaitForAction, WaitForNavigationAction, ExtractAction, EvaluateAction, ScreenshotAction, HoverAction, PressAction, Action, ActionType } from './action.js';

// Transformer types
export type { BuiltInTransformer, TransformerConfig, TransformerPipeline, FieldMapping, MapperConfig, ValidationRuleType, ValidationRule, FieldValidation, ValidationResult, ValidationError, ValueResolver } from './transformer.js';

// Step types
export type { StepType, FieldType, FieldDefinition, StepCondition, AuthStep, NavigationStep, FormFillStep, ExtractionStep, CustomStep, StepDefinition } from './step.js';

// Context types
export type { ExecutionStatus, LogLevel, ExecutionLog, StepExecutionResult, VariableStore, ExecutionContext, BrowserContext, InterpreterContext } from './context.js';
export { createVariableStore } from './context.js';

// Flow types
export type { FlowMetadata, BrowserConfig, FlowConfig, FlowDefinition, FlowError, FlowResult, FlowValidationResult } from './flow.js';

// Legacy types (backward compatibility)
export type { ExecutorActionType, WaitUntilState, ElementState, ActionDefinition } from './action-definition.js';

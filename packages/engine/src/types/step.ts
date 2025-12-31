/**
 * Step and Field definition types for flow structure
 */
import type { ActionDefinition } from './action-definition.js';
import type { Selector } from './selector.js';
import type { TransformerPipeline, ValidationRule } from './transformer.js';

/** Step types supported by the engine */
export type StepType = 'auth' | 'navigation' | 'form-fill' | 'extraction' | 'validation' | 'custom';

/** Field input types */
export type FieldType =
  | 'text' | 'email' | 'password' | 'number' | 'date'
  | 'select' | 'checkbox' | 'radio' | 'file' | 'hidden';

/** Field definition for form filling */
export interface FieldDefinition {
  id: string;
  type: FieldType;
  selector: Selector;
  source: string;
  transform?: TransformerPipeline;
  validation?: ValidationRule[];
  optional?: boolean;
  waitFor?: boolean;
  label?: string;
}

/** Condition for conditional execution */
export interface StepCondition {
  expression: string;
  type: 'if' | 'unless' | 'when';
}

/** Base step properties */
interface BaseStep {
  id: string;
  name: string;
  description?: string;
  condition?: StepCondition;
  optional?: boolean;
  timeout?: number;
  retry?: { attempts: number; delayMs: number };
}

/** Authentication step */
export interface AuthStep extends BaseStep {
  type: 'auth';
  credentials: { username: FieldDefinition; password: FieldDefinition };
  submitSelector: Selector;
  successIndicator: Selector;
}

/** Navigation step */
export interface NavigationStep extends BaseStep {
  type: 'navigation';
  actions: ActionDefinition[];
}

/** Form filling step */
export interface FormFillStep extends BaseStep {
  type: 'form-fill';
  fields: FieldDefinition[];
  submitSelector?: Selector;
  beforeFill?: ActionDefinition[];
  afterFill?: ActionDefinition[];
}

/** Data extraction step */
export interface ExtractionStep extends BaseStep {
  type: 'extraction';
  extractions: Array<{
    selector: Selector;
    attribute?: string;
    into: string;
    transform?: TransformerPipeline;
  }>;
}

/** Custom step with raw actions */
export interface CustomStep extends BaseStep {
  type: 'custom';
  actions: ActionDefinition[];
}

/** Union of all step types */
export type StepDefinition =
  | AuthStep
  | NavigationStep
  | FormFillStep
  | ExtractionStep
  | CustomStep;

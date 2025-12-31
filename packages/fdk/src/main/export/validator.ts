/**
 * Flow definition validator
 * Validates flow definitions before export
 */
import type { FlowDefinition, StepDefinition, FieldDefinition, Selector } from '@mutuelle/engine';

export interface ValidationError {
  path: string;
  message: string;
  severity: 'error' | 'warning';
}

const VALID_STEP_TYPES = ['auth', 'navigation', 'form-fill', 'extraction', 'custom'] as const;
const DATA_REF_PATTERN = /\$\{([^}]+)\}/g;

function validateSelector(selector: Selector | undefined, path: string): ValidationError[] {
  if (!selector) return [];
  if (typeof selector === 'string') {
    if (selector.trim() === '') {
      return [{ path, message: 'Selector cannot be empty', severity: 'error' }];
    }
    return [];
  }
  if ('primary' in selector) {
    return validateSelector(selector.primary, `${path}.primary`);
  }
  if (!selector.value || selector.value.trim() === '') {
    return [{ path: `${path}.value`, message: 'Selector value is required', severity: 'error' }];
  }
  return [];
}

function validateField(field: FieldDefinition, path: string): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!field.id) errors.push({ path: `${path}.id`, message: 'Field id is required', severity: 'error' });
  if (!field.type) errors.push({ path: `${path}.type`, message: 'Field type is required', severity: 'error' });
  if (!field.source) errors.push({ path: `${path}.source`, message: 'Field source is required', severity: 'error' });
  errors.push(...validateSelector(field.selector, `${path}.selector`));
  return errors;
}

function validateStep(step: StepDefinition, index: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const path = `steps[${index}]`;

  if (!step.id) errors.push({ path: `${path}.id`, message: 'Step id is required', severity: 'error' });
  if (!step.name) errors.push({ path: `${path}.name`, message: 'Step name is required', severity: 'error' });
  if (!VALID_STEP_TYPES.includes(step.type as typeof VALID_STEP_TYPES[number])) {
    errors.push({ path: `${path}.type`, message: `Invalid step type: ${step.type}`, severity: 'error' });
  }

  if (step.type === 'form-fill' && 'fields' in step) {
    step.fields.forEach((field: FieldDefinition, i: number) => errors.push(...validateField(field, `${path}.fields[${i}]`)));
  }
  if ((step.type === 'navigation' || step.type === 'custom') && 'actions' in step) {
    if (!step.actions || step.actions.length === 0) {
      errors.push({ path: `${path}.actions`, message: 'At least one action is required', severity: 'warning' });
    }
  }
  return errors;
}

function validateDataReferences(flow: FlowDefinition): ValidationError[] {
  const errors: ValidationError[] = [];
  const content = JSON.stringify(flow);
  const matches = content.matchAll(DATA_REF_PATTERN);
  for (const match of matches) {
    const ref = match[1];
    if (!ref.startsWith('input.') && !ref.startsWith('vars.') && !ref.startsWith('env.')) {
      errors.push({ path: 'dataRef', message: `Invalid data reference: \${${ref}}`, severity: 'warning' });
    }
  }
  return errors;
}

export function validate(flowDef: FlowDefinition): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!flowDef.metadata?.name) {
    errors.push({ path: 'metadata.name', message: 'Flow name is required', severity: 'error' });
  }
  if (!flowDef.metadata?.version) {
    errors.push({ path: 'metadata.version', message: 'Flow version is required', severity: 'error' });
  }
  if (!flowDef.steps || flowDef.steps.length === 0) {
    errors.push({ path: 'steps', message: 'Flow must have at least one step', severity: 'error' });
  } else {
    flowDef.steps.forEach((step: StepDefinition, i: number) => errors.push(...validateStep(step, i)));
  }
  errors.push(...validateDataReferences(flowDef));

  return errors;
}

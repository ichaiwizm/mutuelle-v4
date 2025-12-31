/**
 * Flow serializer - Converts TypeScript flow definitions to plain objects for YAML export
 */
import type { FlowDefinition, StepDefinition, ActionDefinition, FieldDefinition, Selector } from '@mutuelle/engine';

function serializeSelector(selector: Selector | undefined): string | undefined {
  if (!selector) return undefined;

  // Si c'est déjà un string, le retourner tel quel
  if (typeof selector === 'string') return selector;

  // Si c'est un objet avec primary (format fallback), extraire la valeur du primary
  if ('primary' in selector) {
    const primary = selector.primary;
    if (typeof primary === 'string') return primary;
    // selectorDefSchema format: { strategy, value }
    if ('value' in primary) return primary.value;
    return undefined;
  }

  // selectorDefSchema format: { strategy, value }
  if ('value' in selector) {
    return selector.value;
  }

  return undefined;
}

function serializeField(field: FieldDefinition): Record<string, unknown> {
  return { id: field.id, type: field.type, selector: serializeSelector(field.selector), source: field.source,
    transform: field.transform, validation: field.validation, optional: field.optional, waitFor: field.waitFor, label: field.label };
}

export function serializeAction(action: ActionDefinition): Record<string, unknown> {
  const r: Record<string, unknown> = { type: action.action };
  if (action.selector) r.selector = action.selector;
  if (action.value !== undefined) r.value = action.value;
  if (action.url) r.url = action.url;
  if (action.timeout) r.timeout = action.timeout;
  if (action.waitBefore) r.waitBefore = action.waitBefore;
  if (action.waitAfter) r.waitAfter = action.waitAfter;
  if (action.waitUntil) r.waitUntil = action.waitUntil;
  if (action.state) r.state = action.state;
  if (action.force) r.force = action.force;
  if (action.key) r.key = action.key;
  if (action.path) r.path = action.path;
  if (action.fullPage) r.fullPage = action.fullPage;
  return r;
}

export function serializeStep(step: StepDefinition): Record<string, unknown> {
  const base: Record<string, unknown> = {
    id: step.id,
    name: step.name,
    type: step.type,
    description: step.description,
    condition: step.condition,
    optional: step.optional,
    timeout: step.timeout,
    retry: step.retry,
  };

  if (step.type === 'form-fill' && 'fields' in step) {
    base.fields = step.fields.map(serializeField);
    base.submitSelector = serializeSelector(step.submitSelector);
    base.beforeFill = step.beforeFill?.map(serializeAction);
    base.afterFill = step.afterFill?.map(serializeAction);
  } else if ((step.type === 'navigation' || step.type === 'custom') && 'actions' in step) {
    base.actions = step.actions.map(serializeAction);
  } else if (step.type === 'auth' && 'credentials' in step) {
    base.credentials = {
      username: serializeField(step.credentials.username),
      password: serializeField(step.credentials.password),
    };
    base.submitSelector = serializeSelector(step.submitSelector);
    base.successIndicator = serializeSelector(step.successIndicator);
  } else if (step.type === 'extraction' && 'extractions' in step) {
    base.extractions = step.extractions.map((ext) => ({
      selector: serializeSelector(ext.selector),
      attribute: ext.attribute,
      into: ext.into,
      transform: ext.transform,
    }));
  }

  return Object.fromEntries(Object.entries(base).filter(([, v]) => v !== undefined));
}

export function serializeFlow(flow: FlowDefinition): Record<string, unknown> {
  return {
    metadata: flow.metadata,
    config: flow.config,
    inputMapper: flow.inputMapper,
    outputMapper: flow.outputMapper,
    steps: flow.steps.map(serializeStep),
  };
}

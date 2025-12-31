/**
 * Zod schemas for YAML flow validation
 */
import { z } from 'zod';

// Selector schemas
const selectorDefSchema = z.object({ strategy: z.enum(['css', 'xpath', 'text', 'label', 'placeholder', 'testId', 'role']), value: z.string(), description: z.string().optional() });
const selectorFallbackSchema = z.object({ primary: selectorDefSchema, fallbacks: z.array(selectorDefSchema).optional(), timeout: z.number().optional() });
export const selectorSchema = z.union([z.string(), selectorDefSchema, selectorFallbackSchema]);

// Transformer schemas
export const transformerConfigSchema = z.object({
  name: z.union([z.string(), z.enum(['uppercase', 'lowercase', 'trim', 'toDate', 'toNumber', 'toBoolean', 'split', 'join', 'replace', 'format', 'default'])]),
  args: z.record(z.unknown()).optional(),
});
export const transformerPipelineSchema = z.array(transformerConfigSchema);

// Action schemas
const baseAction = z.object({ description: z.string().optional(), optional: z.boolean().optional(), retry: z.object({ attempts: z.number(), delayMs: z.number() }).optional() });
export const actionSchema = z.discriminatedUnion('type', [
  baseAction.extend({ type: z.literal('goto'), url: z.string(), waitUntil: z.enum(['load', 'domcontentloaded', 'networkidle']).optional() }),
  baseAction.extend({ type: z.literal('click'), selector: selectorSchema, clickType: z.enum(['single', 'double', 'right']).optional(), force: z.boolean().optional() }),
  baseAction.extend({ type: z.literal('fill'), selector: selectorSchema, value: z.string(), clear: z.boolean().optional() }),
  baseAction.extend({ type: z.literal('select'), selector: selectorSchema, value: z.string(), by: z.enum(['value', 'label', 'index']).optional() }),
  baseAction.extend({ type: z.literal('waitFor'), selector: selectorSchema.optional(), state: z.enum(['visible', 'hidden', 'attached', 'detached']).optional(), timeout: z.number().optional() }),
  baseAction.extend({ type: z.literal('waitForNavigation'), url: z.string().optional(), timeout: z.number().optional() }),
  baseAction.extend({ type: z.literal('extract'), selector: selectorSchema, attribute: z.string().optional(), into: z.string() }),
  baseAction.extend({ type: z.literal('evaluate'), script: z.string(), into: z.string().optional() }),
  baseAction.extend({ type: z.literal('screenshot'), path: z.string().optional(), fullPage: z.boolean().optional() }),
  baseAction.extend({ type: z.literal('hover'), selector: selectorSchema }),
  baseAction.extend({ type: z.literal('press'), key: z.string(), selector: selectorSchema.optional() }),
]);

// Field and validation schemas
const validationRule = z.object({ type: z.enum(['required', 'minLength', 'maxLength', 'pattern', 'email', 'phone', 'date', 'range', 'enum', 'custom']), value: z.unknown().optional(), message: z.string().optional(), optional: z.boolean().optional() });
const fieldDef = z.object({ id: z.string(), type: z.enum(['text', 'email', 'password', 'number', 'date', 'select', 'checkbox', 'radio', 'file', 'hidden']), selector: selectorSchema, source: z.string(), transform: transformerPipelineSchema.optional(), validation: z.array(validationRule).optional(), optional: z.boolean().optional(), waitFor: z.boolean().optional(), label: z.string().optional() });

// Step schemas
const baseStep = z.object({ id: z.string(), name: z.string(), description: z.string().optional(), condition: z.object({ expression: z.string(), type: z.enum(['if', 'unless', 'when']) }).optional(), optional: z.boolean().optional(), timeout: z.number().optional(), retry: z.object({ attempts: z.number(), delayMs: z.number() }).optional() });
export const stepSchema = z.discriminatedUnion('type', [
  baseStep.extend({ type: z.literal('auth'), credentials: z.object({ username: fieldDef, password: fieldDef }), submitSelector: selectorSchema, successIndicator: selectorSchema }),
  baseStep.extend({ type: z.literal('navigation'), actions: z.array(actionSchema) }),
  baseStep.extend({ type: z.literal('form-fill'), fields: z.array(fieldDef), submitSelector: selectorSchema.optional(), beforeFill: z.array(actionSchema).optional(), afterFill: z.array(actionSchema).optional() }),
  baseStep.extend({ type: z.literal('extraction'), extractions: z.array(z.object({ selector: selectorSchema, attribute: z.string().optional(), into: z.string(), transform: transformerPipelineSchema.optional() })) }),
  baseStep.extend({ type: z.literal('custom'), actions: z.array(actionSchema) }),
]);

// Flow schema
const metadataSchema = z.object({ name: z.string(), version: z.string(), description: z.string().optional(), author: z.string().optional(), tags: z.array(z.string()).optional(), createdAt: z.string().optional(), updatedAt: z.string().optional() });
const mapperSchema = z.object({ name: z.string(), mappings: z.array(z.object({ from: z.string(), to: z.string(), transform: transformerPipelineSchema.optional(), default: z.unknown().optional() })), strict: z.boolean().optional() });
const browserConfig = z.object({ headless: z.boolean().optional(), viewportWidth: z.number().optional(), viewportHeight: z.number().optional(), userAgent: z.string().optional(), timeout: z.number().optional(), slowMo: z.number().optional() });
const flowConfig = z.object({ baseUrl: z.string().optional(), browser: browserConfig.optional(), defaultTimeout: z.number().optional(), maxRetries: z.number().optional(), retryDelay: z.number().optional(), stopOnError: z.boolean().optional(), screenshotOnError: z.boolean().optional(), screenshotsDir: z.string().optional(), debug: z.boolean().optional() });

export const flowSchema = z.object({
  metadata: metadataSchema,
  config: flowConfig.optional(),
  inputMapper: mapperSchema.optional(),
  outputMapper: mapperSchema.optional(),
  steps: z.array(stepSchema).min(1),
});

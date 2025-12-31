/**
 * Tests for StepInterpreter - executes step definitions
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  StepInterpreter,
  ExpressionResolver,
  ActionExecutor,
  type ResolverContext,
  type FormFillStep,
  type NavigationStep,
} from '@mutuelle/engine';
import { createMockPage } from '../mocks/playwright-mock.js';

describe('StepInterpreter', () => {
  let mockPage: ReturnType<typeof createMockPage>;
  let resolver: ExpressionResolver;
  let executor: ActionExecutor;
  let interpreter: StepInterpreter;
  let resolverCtx: ResolverContext;

  beforeEach(() => {
    mockPage = createMockPage();
    resolverCtx = {
      transformedData: { firstName: 'John', email: 'john@test.com', hasOption: true },
      selectors: { nameInput: '#name', emailInput: '#email' },
    };
    resolver = new ExpressionResolver(resolverCtx);
    executor = new ActionExecutor(mockPage as any);
    interpreter = new StepInterpreter({ page: mockPage as any, resolver, executor });
  });

  describe('form-fill step execution', () => {
    it('should fill form fields with resolved values', async () => {
      const step: FormFillStep = {
        id: 'fill-form', name: 'Fill Form', type: 'form-fill',
        fields: [
          { id: 'name', type: 'text', selector: '#name', source: '$data.firstName' },
          { id: 'email', type: 'email', selector: '#email', source: '$data.email' },
        ],
      };
      const result = await interpreter.executeStep(step, resolverCtx);
      expect(result.status).toBe('completed');
      expect(mockPage.fill).toHaveBeenCalledWith('#name', 'John', expect.any(Object));
      expect(mockPage.fill).toHaveBeenCalledWith('#email', 'john@test.com', expect.any(Object));
    });

    it('should execute beforeFill and afterFill actions', async () => {
      const step: FormFillStep = {
        id: 'fill-form', name: 'Fill Form', type: 'form-fill',
        fields: [],
        beforeFill: [{ action: 'click', selector: '#expand' }],
        afterFill: [{ action: 'click', selector: '#next' }],
      };
      await interpreter.executeStep(step, resolverCtx);
      expect(mockPage.click).toHaveBeenCalledWith('#expand', expect.any(Object));
      expect(mockPage.click).toHaveBeenCalledWith('#next', expect.any(Object));
    });
  });

  describe('conditional step skipping', () => {
    it('should skip step when condition evaluates to false', async () => {
      const step: NavigationStep = {
        id: 'nav-step', name: 'Nav Step', type: 'navigation',
        condition: { expression: '$data.hasOption == false', type: 'if' },
        actions: [{ action: 'click', selector: '#btn' }],
      };
      const result = await interpreter.executeStep(step, resolverCtx);
      expect(result.status).toBe('completed');
      expect(mockPage.click).not.toHaveBeenCalled();
    });

    it('should execute step when condition evaluates to true', async () => {
      const step: NavigationStep = {
        id: 'nav-step', name: 'Nav Step', type: 'navigation',
        condition: { expression: '$data.hasOption', type: 'if' },
        actions: [{ action: 'click', selector: '#btn' }],
      };
      await interpreter.executeStep(step, resolverCtx);
      expect(mockPage.click).toHaveBeenCalledWith('#btn', expect.any(Object));
    });
  });

  describe('navigation step execution', () => {
    it('should execute multiple navigation actions in sequence', async () => {
      const step: NavigationStep = {
        id: 'nav', name: 'Navigation', type: 'navigation',
        actions: [
          { action: 'goto', url: 'https://example.com' },
          { action: 'click', selector: '#start' },
        ],
      };
      await interpreter.executeStep(step, resolverCtx);
      expect(mockPage.goto).toHaveBeenCalledWith('https://example.com', expect.any(Object));
      expect(mockPage.click).toHaveBeenCalledWith('#start', expect.any(Object));
    });
  });
});

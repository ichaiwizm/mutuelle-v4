/**
 * Tests for ActionExecutor - executes actions with mocked page
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { ActionExecutor, type ActionDefinition } from '@mutuelle/engine';
import { createMockPage } from '../mocks/playwright-mock.js';

describe('ActionExecutor', () => {
  let mockPage: ReturnType<typeof createMockPage>;
  let executor: ActionExecutor;

  beforeEach(() => {
    mockPage = createMockPage();
    executor = new ActionExecutor(mockPage as any);
  });

  describe('click action', () => {
    it('should execute click on selector', async () => {
      const action: ActionDefinition = { action: 'click', selector: '#submit' };
      await executor.execute(action);
      expect(mockPage.click).toHaveBeenCalledWith('#submit', expect.any(Object));
    });
  });

  describe('fill action', () => {
    it('should execute fill on selector with value', async () => {
      const action: ActionDefinition = { action: 'fill', selector: '#email', value: 'test@test.com' };
      await executor.execute(action);
      expect(mockPage.fill).toHaveBeenCalledWith('#email', 'test@test.com', expect.any(Object));
    });
  });

  describe('waitFor action', () => {
    it('should wait for selector visibility', async () => {
      const action: ActionDefinition = { action: 'waitFor', selector: '.loader', state: 'hidden' };
      await executor.execute(action);
      expect(mockPage.waitForSelector).toHaveBeenCalledWith('.loader', expect.objectContaining({ state: 'hidden' }));
    });

    it('should wait for duration when specified', async () => {
      const action: ActionDefinition = { action: 'waitFor', duration: 500 };
      await executor.execute(action);
      expect(mockPage.waitForTimeout).toHaveBeenCalledWith(500);
    });
  });

  describe('goto action', () => {
    it('should navigate to URL', async () => {
      const action: ActionDefinition = { action: 'goto', url: 'https://example.com' };
      await executor.execute(action);
      expect(mockPage.goto).toHaveBeenCalledWith('https://example.com', expect.any(Object));
    });
  });

  describe('iframe switching', () => {
    it('should switch to iframe and get frame context', async () => {
      const action: ActionDefinition = { action: 'switchToIframe', selector: 'iframe#payment' };
      await executor.execute(action);
      expect(mockPage.waitForSelector).toHaveBeenCalledWith('iframe#payment', expect.any(Object));
    });

    it('should switch back to main frame', async () => {
      const action: ActionDefinition = { action: 'switchToMainFrame' };
      await executor.execute(action);
      expect(executor.getContext()).toBe(mockPage);
    });
  });

  describe('waitBefore/waitAfter timing', () => {
    it('should wait before executing action', async () => {
      const action: ActionDefinition = { action: 'click', selector: '#btn', waitBefore: 100 };
      await executor.execute(action);
      expect(mockPage.waitForTimeout).toHaveBeenCalledWith(100);
      expect(mockPage.click).toHaveBeenCalled();
    });
  });
});

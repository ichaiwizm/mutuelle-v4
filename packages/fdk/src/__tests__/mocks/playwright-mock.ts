/**
 * Mock Playwright Page, Locator, and Frame objects for testing
 */
import { vi } from 'vitest';

export function createMockLocator() {
  return {
    click: vi.fn().mockResolvedValue(undefined),
    fill: vi.fn().mockResolvedValue(undefined),
    selectOption: vi.fn().mockResolvedValue(undefined),
    check: vi.fn().mockResolvedValue(undefined),
    contentFrame: vi.fn().mockResolvedValue(null),
    waitFor: vi.fn().mockResolvedValue(undefined),
    textContent: vi.fn().mockResolvedValue(''),
  };
}

export function createMockFrame() {
  return {
    url: vi.fn().mockReturnValue('https://example.com/iframe'),
    click: vi.fn().mockResolvedValue(undefined),
    fill: vi.fn().mockResolvedValue(undefined),
    type: vi.fn().mockResolvedValue(undefined),
    press: vi.fn().mockResolvedValue(undefined),
    selectOption: vi.fn().mockResolvedValue(undefined),
    check: vi.fn().mockResolvedValue(undefined),
    uncheck: vi.fn().mockResolvedValue(undefined),
    waitForSelector: vi.fn().mockResolvedValue(createMockLocator()),
    waitForTimeout: vi.fn().mockResolvedValue(undefined),
  };
}

export function createMockPage() {
  const mockLocator = createMockLocator();
  const mockFrame = createMockFrame();
  mockLocator.contentFrame.mockResolvedValue(mockFrame);

  return {
    goto: vi.fn().mockResolvedValue(undefined),
    goBack: vi.fn().mockResolvedValue(undefined),
    reload: vi.fn().mockResolvedValue(undefined),
    click: vi.fn().mockResolvedValue(undefined),
    fill: vi.fn().mockResolvedValue(undefined),
    type: vi.fn().mockResolvedValue(undefined),
    press: vi.fn().mockResolvedValue(undefined),
    selectOption: vi.fn().mockResolvedValue(undefined),
    check: vi.fn().mockResolvedValue(undefined),
    uncheck: vi.fn().mockResolvedValue(undefined),
    setInputFiles: vi.fn().mockResolvedValue(undefined),
    locator: vi.fn().mockReturnValue(mockLocator),
    waitForSelector: vi.fn().mockResolvedValue(mockLocator),
    waitForTimeout: vi.fn().mockResolvedValue(undefined),
    waitForNavigation: vi.fn().mockResolvedValue(undefined),
    screenshot: vi.fn().mockResolvedValue(Buffer.from('')),
    keyboard: { press: vi.fn().mockResolvedValue(undefined) },
    frame: vi.fn().mockReturnValue(mockFrame),
    evaluate: vi.fn().mockResolvedValue(undefined),
  };
}

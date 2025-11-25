import { expect } from 'vitest';
import type { Lead } from '@/shared/types/lead';

/**
 * Assert that a value is a valid Lead (not null/undefined)
 * @param lead - The value to check
 * @param message - Optional custom error message
 */
export function expectValidLead(lead: Lead | null | undefined, message?: string): asserts lead is Lead {
  expect(lead, message ?? 'Expected lead to be defined').not.toBeNull();
  expect(lead).toBeDefined();
  expect(lead!.id).toBeDefined();
  expect(lead!.subscriber).toBeDefined();
}

/**
 * Assert that a lead has specific subscriber fields
 * @param lead - The lead to check
 * @param expected - Expected subscriber field values
 */
export function expectSubscriber(
  lead: Lead,
  expected: Partial<Record<string, unknown>>
): void {
  for (const [key, value] of Object.entries(expected)) {
    expect(
      (lead.subscriber as Record<string, unknown>)[key],
      `subscriber.${key} should be "${value}"`
    ).toBe(value);
  }
}

/**
 * Assert that a lead has specific project fields
 * @param lead - The lead to check
 * @param expected - Expected project field values
 */
export function expectProject(
  lead: Lead,
  expected: Partial<Record<string, unknown>>
): void {
  expect(lead.project, 'Expected lead to have project').toBeDefined();
  for (const [key, value] of Object.entries(expected)) {
    expect(
      (lead.project as Record<string, unknown>)[key],
      `project.${key} should be "${value}"`
    ).toBe(value);
  }
}

/**
 * Assert that a lead has the expected number of children
 * @param lead - The lead to check
 * @param count - Expected number of children
 */
export function expectChildrenCount(lead: Lead, count: number): void {
  if (count === 0) {
    expect(lead.children ?? []).toHaveLength(0);
  } else {
    expect(lead.children, 'Expected lead to have children').toBeDefined();
    expect(lead.children).toHaveLength(count);
  }
}

/**
 * Assert that a lead's ID is a valid UUID
 * @param lead - The lead to check
 */
export function expectValidUUID(lead: Lead): void {
  expect(lead.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
}

/**
 * Assert that two leads have different UUIDs
 * @param lead1 - First lead
 * @param lead2 - Second lead
 */
export function expectDifferentUUIDs(lead1: Lead, lead2: Lead): void {
  expect(lead1.id).not.toBe(lead2.id);
}

/**
 * Assert that a lead has the same subscriber data as another (ignoring ID)
 * @param actual - The lead to check
 * @param expected - The expected lead data
 */
export function expectSameSubscriberData(actual: Lead, expected: Lead): void {
  expect(actual.subscriber).toEqual(expected.subscriber);
}

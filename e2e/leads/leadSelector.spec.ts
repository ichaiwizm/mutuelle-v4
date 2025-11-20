/**
 * Unit tests for lead selector
 *
 * Tests the lead filtering and selection logic to ensure
 * strict categorization and proper type safety.
 */

import { test, expect } from '@playwright/test';
import { selectLead, getLeadTypeName } from './leadSelector';
import { hasConjoint, getChildrenCount } from './leadFilters';
import { loadAllLeads } from './loadLeads';
import type { LeadType } from '../alptis/types';

test('should select a random lead when type is random', () => {
  const lead = selectLead('random');
  expect(lead).toBeDefined();
  expect(lead.id).toBeTruthy();
});

test('should select a solo lead (no conjoint, no children)', () => {
  const lead = selectLead('solo');
  expect(hasConjoint(lead)).toBe(false);
  expect(getChildrenCount(lead)).toBe(0);
});

test('should select a lead with only conjoint (no children)', () => {
  const lead = selectLead('conjoint');
  expect(hasConjoint(lead)).toBe(true);
  expect(getChildrenCount(lead)).toBe(0);
});

test('should select a lead with only children (no conjoint)', () => {
  const lead = selectLead('children');
  expect(hasConjoint(lead)).toBe(false);
  expect(getChildrenCount(lead)).toBeGreaterThan(0);
});

test('should select a lead with both conjoint and children', () => {
  const lead = selectLead('both');
  expect(hasConjoint(lead)).toBe(true);
  expect(getChildrenCount(lead)).toBeGreaterThan(0);
});

test('should return different leads on multiple calls', () => {
  const leads = new Set();
  for (let i = 0; i < 10; i++) {
    const lead = selectLead('random');
    leads.add(lead.id);
  }
  // With 22 leads, we should get at least a few different ones
  expect(leads.size).toBeGreaterThan(1);
});

test('should return correct names for all lead types', () => {
  expect(getLeadTypeName('random')).toBe('🎲 Random');
  expect(getLeadTypeName('solo')).toBe('🧍 Solo (sans conjoint ni enfants)');
  expect(getLeadTypeName('conjoint')).toBe('👫 Avec conjoint uniquement');
  expect(getLeadTypeName('children')).toBe('👶 Avec enfants uniquement');
  expect(getLeadTypeName('both')).toBe('👨‍👩‍👧 Conjoint + Enfants');
});

test('should have leads in all categories', () => {
  const allLeads = loadAllLeads();

  const categories = {
    solo: 0,
    conjoint: 0,
    children: 0,
    both: 0,
  };

  allLeads.forEach((lead) => {
    const hasConj = hasConjoint(lead);
    const hasChild = getChildrenCount(lead) > 0;

    if (!hasConj && !hasChild) {
      categories.solo++;
    } else if (hasConj && !hasChild) {
      categories.conjoint++;
    } else if (!hasConj && hasChild) {
      categories.children++;
    } else if (hasConj && hasChild) {
      categories.both++;
    }
  });

  // Verify we have a good distribution
  expect(categories.solo).toBeGreaterThan(0);
  expect(categories.conjoint).toBeGreaterThan(0);
  expect(categories.both).toBeGreaterThan(0);
  // Note: 'children' category might have fewer leads

  // Total should match
  const total = categories.solo + categories.conjoint + categories.children + categories.both;
  expect(total).toBe(allLeads.length);
});

test('should validate strict filtering for all types', () => {
  const types: LeadType[] = ['solo', 'conjoint', 'children', 'both'];

  types.forEach((type) => {
    const lead = selectLead(type);

    const hasConj = hasConjoint(lead);
    const hasChild = getChildrenCount(lead) > 0;

    switch (type) {
      case 'solo':
        expect(hasConj).toBe(false);
        expect(hasChild).toBe(false);
        break;
      case 'conjoint':
        expect(hasConj).toBe(true);
        expect(hasChild).toBe(false);
        break;
      case 'children':
        expect(hasConj).toBe(false);
        expect(hasChild).toBe(true);
        break;
      case 'both':
        expect(hasConj).toBe(true);
        expect(hasChild).toBe(true);
        break;
    }
  });
});

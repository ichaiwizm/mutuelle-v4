/**
 * Tests for ExpressionResolver - resolves $variable expressions
 */
import { describe, it, expect } from 'vitest';
import { ExpressionResolver, type ResolverContext } from '@mutuelle/engine';

describe('ExpressionResolver', () => {
  const createContext = (overrides?: Partial<ResolverContext>): ResolverContext => ({
    transformedData: { firstName: 'John', age: 30, nested: { city: 'Paris' } },
    selectors: {
      submitBtn: '#submit',
      nameInput: { primary: 'input[name="name"]', fallback: '#name' },
    },
    credentials: { username: 'user@test.com', password: 'secret123' },
    metadata: { flowId: 'test-flow', version: '1.0' },
    ...overrides,
  });

  describe('$data.path resolution', () => {
    it('should resolve simple data path', () => {
      const resolver = new ExpressionResolver(createContext());
      expect(resolver.resolve('$data.firstName')).toBe('John');
    });

    it('should resolve nested data path', () => {
      const resolver = new ExpressionResolver(createContext());
      expect(resolver.resolve('$data.nested.city')).toBe('Paris');
    });

    it('should return original if path not found', () => {
      const resolver = new ExpressionResolver(createContext());
      expect(resolver.resolve('$data.unknown')).toBe('$data.unknown');
    });
  });

  describe('$selectors.name resolution', () => {
    it('should resolve simple selector string', () => {
      const resolver = new ExpressionResolver(createContext());
      expect(resolver.resolve('$selectors.submitBtn')).toBe('#submit');
    });

    it('should resolve selector object to primary', () => {
      const resolver = new ExpressionResolver(createContext());
      expect(resolver.resolve('$selectors.nameInput')).toBe('input[name="name"]');
    });
  });

  describe('$credentials resolution', () => {
    it('should resolve credentials', () => {
      const resolver = new ExpressionResolver(createContext());
      expect(resolver.resolve('$credentials.username')).toBe('user@test.com');
    });
  });

  describe('condition evaluation context', () => {
    it('should resolve loop index $i', () => {
      const resolver = new ExpressionResolver(createContext({ i: 2 }));
      expect(resolver.resolvePath('i')).toBe(2);
    });

    it('should resolve custom item alias', () => {
      const ctx = createContext({ item: { name: 'Child' }, itemAlias: 'enfant' });
      const resolver = new ExpressionResolver(ctx);
      expect(resolver.resolvePath('enfant.name')).toBe('Child');
    });
  });
});

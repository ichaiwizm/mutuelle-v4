import type { BaseProduct } from '../core/BaseProduct';
import type { ProductConstructor, ProductMetadata } from '../types/ProductTypes';

/**
 * Registry for all product implementations.
 * Products are registered by flow key and can be retrieved for execution.
 */
export class ProductRegistry {
  private static instance: ProductRegistry;
  private products: Map<string, ProductConstructor> = new Map();

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): ProductRegistry {
    if (!ProductRegistry.instance) {
      ProductRegistry.instance = new ProductRegistry();
    }
    return ProductRegistry.instance;
  }

  /**
   * Register a product class
   */
  register(flowKey: string, productClass: ProductConstructor): void {
    if (this.products.has(flowKey)) {
      console.warn(`Product ${flowKey} already registered, overwriting`);
    }
    this.products.set(flowKey, productClass);
  }

  /**
   * Get product instance by flow key
   */
  get(flowKey: string): BaseProduct {
    const ProductClass = this.products.get(flowKey);
    if (!ProductClass) {
      throw new Error(`Product not found for flow key: ${flowKey}`);
    }
    return new ProductClass();
  }

  /**
   * Check if product is registered
   */
  has(flowKey: string): boolean {
    return this.products.has(flowKey);
  }

  /**
   * Get all registered flow keys
   */
  getRegisteredKeys(): string[] {
    return Array.from(this.products.keys());
  }

  /**
   * Get all product metadata
   */
  getAllMetadata(): ProductMetadata[] {
    return Array.from(this.products.values()).map((ProductClass) => {
      return ProductClass.metadata;
    });
  }

  /**
   * Unregister a product
   */
  unregister(flowKey: string): boolean {
    return this.products.delete(flowKey);
  }

  /**
   * Clear all registered products
   */
  clear(): void {
    this.products.clear();
  }

  /**
   * Get number of registered products
   */
  count(): number {
    return this.products.size;
  }
}

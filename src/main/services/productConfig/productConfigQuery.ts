/**
 * Product Configuration Query Service
 * Advanced methods that combine code-based config with database state
 */

import { db, schema } from "../../db";
import { eq, and } from "drizzle-orm";
import type { ProductConfiguration } from "../../../shared/types/product";
import { ProductConfigCore } from "./productConfigCore";

export const ProductConfigQuery = {
  /**
   * Get product configuration with database status (if available)
   * Returns configuration merged with database status information
   */
  async getProductWithStatus(flowKey: string): Promise<(ProductConfiguration & { dbStatus?: string }) | undefined> {
    const config = ProductConfigCore.getProductConfig(flowKey);
    if (!config) return undefined;

    // Try to get status from database
    const [statusRow] = await db
      .select()
      .from(schema.productStatus)
      .where(and(eq(schema.productStatus.platform, config.platform), eq(schema.productStatus.product, config.product)));

    return {
      ...config,
      dbStatus: statusRow?.status || undefined,
    };
  },

  /**
   * List all products with their database status
   * Only returns products that are marked as "active" in the database
   */
  async listActiveProducts(): Promise<ProductConfiguration[]> {
    const allConfigs = ProductConfigCore.listAllProducts();
    const activeConfigs: ProductConfiguration[] = [];

    for (const config of allConfigs) {
      const [statusRow] = await db
        .select()
        .from(schema.productStatus)
        .where(
          and(
            eq(schema.productStatus.platform, config.platform),
            eq(schema.productStatus.product, config.product),
            eq(schema.productStatus.status, "active")
          )
        );

      if (statusRow) {
        activeConfigs.push(config);
      }
    }

    return activeConfigs;
  },
};

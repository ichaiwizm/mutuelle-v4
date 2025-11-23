import { db, schema } from "../db";
import { eq, and } from "drizzle-orm";
import type { ProductStatus, ProductStatusValue } from "../../shared/types/product";

export const ProductStatusService = {
  /**
   * Liste tous les statuts de produits
   */
  async list(): Promise<ProductStatus[]> {
    const rows = await db.select().from(schema.productStatus);
    return rows.map((r) => ({
      platform: r.platform,
      product: r.product,
      status: r.status as ProductStatusValue,
      updatedAt: r.updatedAt.getTime(),
      updatedBy: r.updatedBy ?? undefined,
    }));
  },

  /**
   * Récupère le statut d'un produit spécifique
   */
  async getByProduct(platform: string, product: string): Promise<ProductStatus | null> {
    const [row] = await db
      .select()
      .from(schema.productStatus)
      .where(and(eq(schema.productStatus.platform, platform), eq(schema.productStatus.product, product)));

    if (!row) return null;

    return {
      platform: row.platform,
      product: row.product,
      status: row.status as ProductStatusValue,
      updatedAt: row.updatedAt.getTime(),
      updatedBy: row.updatedBy ?? undefined,
    };
  },

  /**
   * Crée ou met à jour le statut d'un produit
   */
  async upsert(
    platform: string,
    product: string,
    status: ProductStatusValue,
    updatedBy?: string
  ): Promise<ProductStatus> {
    const now = new Date();

    await db
      .insert(schema.productStatus)
      .values({
        platform,
        product,
        status,
        updatedAt: now,
        updatedBy: updatedBy ?? null,
      })
      .onConflictDoUpdate({
        target: [schema.productStatus.platform, schema.productStatus.product],
        set: {
          status,
          updatedAt: now,
          updatedBy: updatedBy ?? null,
        },
      });

    return {
      platform,
      product,
      status,
      updatedAt: now.getTime(),
      updatedBy,
    };
  },

  /**
   * Met à jour uniquement le statut d'un produit existant
   */
  async updateStatus(
    platform: string,
    product: string,
    status: ProductStatusValue,
    updatedBy?: string
  ): Promise<ProductStatus | null> {
    const existing = await this.getByProduct(platform, product);
    if (!existing) return null;

    return this.upsert(platform, product, status, updatedBy);
  },

  /**
   * Liste uniquement les produits actifs
   */
  async listActive(): Promise<ProductStatus[]> {
    const rows = await db
      .select()
      .from(schema.productStatus)
      .where(eq(schema.productStatus.status, "active"));

    return rows.map((r) => ({
      platform: r.platform,
      product: r.product,
      status: r.status as ProductStatusValue,
      updatedAt: r.updatedAt.getTime(),
      updatedBy: r.updatedBy ?? undefined,
    }));
  },
};

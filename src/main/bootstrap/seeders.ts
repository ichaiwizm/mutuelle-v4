import { db } from '../db'
import { flows, productStatus } from '../db/schema'
import { PRODUCT_CONFIGS } from '../flows/config/products'

export async function seedFlows() {
  const values = Object.values(PRODUCT_CONFIGS).map((config) => ({
    key: config.flowKey,
    version: 'v1',
    title: config.displayName,
  }))

  for (const v of values) {
    await db
      .insert(flows)
      .values(v)
      .onConflictDoUpdate({
        target: flows.key,
        set: { version: v.version, title: v.title },
      })
  }
}

export async function seedProductStatus() {
  const existingStatuses = await db
    .select({ platform: productStatus.platform, product: productStatus.product })
    .from(productStatus)

  const existingStatusKeys = new Set(
    existingStatuses.map((s) => `${s.platform}:${s.product}`)
  )

  for (const config of Object.values(PRODUCT_CONFIGS)) {
    const key = `${config.platform}:${config.product}`
    if (existingStatusKeys.has(key)) continue

    await db.insert(productStatus).values({
      platform: config.platform,
      product: config.product,
      status: 'active',
      updatedAt: new Date(),
      updatedBy: null,
    })
  }
}

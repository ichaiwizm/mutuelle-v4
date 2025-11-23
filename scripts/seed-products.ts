/**
 * Seed Products Script
 *
 * Synchronizes product configurations from code to database.
 * Inserts all products from PRODUCT_CONFIGS into product_status table
 * with 'active' status by default.
 *
 * Usage: pnpm seed:products
 */

import { PRODUCT_CONFIGS } from "../src/main/flows/config/products";
import { ProductStatusService } from "../src/main/services/productStatusService";

async function seedProducts() {
  console.log("🔄 Synchronisation des produits en base de données...\n");

  let inserted = 0;
  let existing = 0;

  for (const config of Object.values(PRODUCT_CONFIGS)) {
    const { platform, product } = config;

    // Check if already exists
    const existingProduct = await ProductStatusService.getByProduct(platform, product);

    if (existingProduct) {
      console.log(`⏭️  Déjà existant : ${platform} / ${product} (${existingProduct.status})`);
      existing++;
    } else {
      // Insert with 'active' status
      await ProductStatusService.upsert(platform, product, "active");
      console.log(`✅ Inséré : ${platform} / ${product} (active)`);
      inserted++;
    }
  }

  console.log(`\n📊 Résultat : ${inserted} produit(s) inséré(s), ${existing} déjà existant(s)`);
  process.exit(0);
}

seedProducts().catch((error) => {
  console.error("❌ Erreur lors de la synchronisation :", error);
  process.exit(1);
});

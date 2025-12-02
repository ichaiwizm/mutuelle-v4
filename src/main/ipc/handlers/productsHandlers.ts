import { ipcMain } from "electron";
import { IPC_CHANNEL } from "../channels";
import { ProductStatusService } from "../../services/productStatusService";
import { ProductConfigCore, ProductConfigQuery } from "../../services/productConfig";
import { ValidationError } from "@/shared/errors";
import {
  ProductGetConfigSchema,
  ProductGetStatusSchema,
  ProductSaveStatusSchema,
  ProductUpdateStatusSchema,
} from "@/shared/validation/ipc.zod";
import { handler, simpleHandler } from "./utils";

export function registerProductsHandlers() {
  // Note: ProductConfiguration contains functions (conditionalRules) that cannot be cloned via IPC
  // We must remove them before returning to the renderer process
  ipcMain.handle(
    IPC_CHANNEL.PRODUCTS_LIST_CONFIGS,
    simpleHandler(async () => {
      const products = ProductConfigCore.listAllProducts();
      return products.map((p) => ({ ...p, conditionalRules: undefined }));
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.PRODUCTS_GET_CONFIG,
    handler(ProductGetConfigSchema, async ({ flowKey }) => {
      const config = ProductConfigCore.getProductConfig(flowKey);
      return config ? { ...config, conditionalRules: undefined } : null;
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.PRODUCTS_LIST_ACTIVE_CONFIGS,
    simpleHandler(async () => {
      const products = await ProductConfigQuery.listActiveProducts();
      return products.map((p) => ({ ...p, conditionalRules: undefined }));
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.PRODUCTS_LIST_STATUSES,
    simpleHandler(async () => {
      return ProductStatusService.list();
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.PRODUCTS_GET_STATUS,
    handler(ProductGetStatusSchema, async ({ platform, product }) => {
      return ProductStatusService.getByProduct(platform, product);
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.PRODUCTS_SAVE_STATUS,
    handler(ProductSaveStatusSchema, async ({ platform, product, status, updatedBy }) => {
      return ProductStatusService.upsert(platform, product, status, updatedBy);
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.PRODUCTS_UPDATE_STATUS,
    handler(ProductUpdateStatusSchema, async ({ platform, product, status, updatedBy }) => {
      const result = await ProductStatusService.updateStatus(platform, product, status, updatedBy);
      if (!result) {
        throw new ValidationError(`Product status not found for ${platform}/${product}`);
      }
      return result;
    })
  );
}

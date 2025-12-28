import { ipcMain } from "electron";
import { IPC_CHANNEL } from "../channels";
import { DevisService } from "../../services/devisService";
import {
  DevisListSchema,
  DevisListByLeadSchema,
  DevisGetSchema,
  DevisCreateSchema,
  DevisUpdateSchema,
  DevisDeleteSchema,
  DevisExportPdfSchema,
  DevisDuplicateSchema,
  DevisCountByLeadSchema,
} from "@/shared/validation/ipc.zod";
import { handler, simpleHandler } from "./utils";

export function registerDevisHandlers() {
  ipcMain.handle(
    IPC_CHANNEL.DEVIS_LIST,
    handler(DevisListSchema, async (options) => {
      const [devis, total] = await Promise.all([
        DevisService.list(options ?? undefined),
        DevisService.count(options?.filters),
      ]);
      return { devis, total };
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.DEVIS_LIST_BY_LEAD,
    handler(DevisListByLeadSchema, async ({ leadId }) => {
      const devis = await DevisService.listByLead(leadId);
      return { devis };
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.DEVIS_GET,
    handler(DevisGetSchema, async ({ id }) => {
      return DevisService.get(id);
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.DEVIS_CREATE,
    handler(DevisCreateSchema, async (input) => {
      return DevisService.create(input);
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.DEVIS_UPDATE,
    handler(DevisUpdateSchema, async ({ id, data }) => {
      return DevisService.update(id, data);
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.DEVIS_DELETE,
    handler(DevisDeleteSchema, async ({ id }) => {
      return DevisService.delete(id);
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.DEVIS_EXPORT_PDF,
    handler(DevisExportPdfSchema, async ({ id }) => {
      return DevisService.exportPdf(id);
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.DEVIS_DUPLICATE,
    handler(DevisDuplicateSchema, async ({ id }) => {
      return DevisService.duplicate(id);
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.DEVIS_COUNT_BY_LEAD,
    handler(DevisCountByLeadSchema, async ({ leadIds }) => {
      return DevisService.countByLead(leadIds);
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.DEVIS_STATS,
    simpleHandler(async () => DevisService.stats())
  );
}

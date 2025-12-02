import { ipcMain } from "electron";
import { IPC_CHANNEL } from "../channels";
import { LeadsService } from "../../services/leadsService";
import { LeadFormSchemaService } from "../../services/leadFormSchemaService";
import { parseLeads } from "@/main/leads/parsing/parser";
import {
  LeadsCreateSchema,
  LeadsUpdateSchema,
  LeadsGetSchema,
  LeadsRemoveSchema,
  LeadsListSchema,
  LeadsParseFromTextSchema,
} from "@/shared/validation/ipc.zod";
import { handler, simpleHandler } from "./utils";

export function registerLeadsHandlers() {
  ipcMain.handle(
    IPC_CHANNEL.LEADS_LIST,
    handler(LeadsListSchema, async (options) => {
      const [leads, total] = await Promise.all([
        LeadsService.list(options ?? undefined),
        LeadsService.count(),
      ]);
      return { leads, total };
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.LEADS_GET,
    handler(LeadsGetSchema, async ({ id }) => {
      return LeadsService.get(id);
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.LEADS_CREATE,
    handler(LeadsCreateSchema, async (lead) => {
      return LeadsService.create(lead);
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.LEADS_UPDATE,
    handler(LeadsUpdateSchema, async ({ id, data }) => {
      await LeadsService.update(id, data);
      return { updated: true };
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.LEADS_REMOVE,
    handler(LeadsRemoveSchema, async ({ id }) => {
      await LeadsService.remove(id);
      return { removed: true };
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.LEADS_PARSE_FROM_TEXT,
    handler(LeadsParseFromTextSchema, async ({ text, subject }) => {
      const leads = parseLeads({ text, subject }, { source: "clipboard" });
      return leads;
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.LEADS_PARSE_AND_CREATE_FROM_TEXT,
    handler(LeadsParseFromTextSchema, async ({ text, subject }) => {
      const leads = parseLeads({ text, subject }, { source: "clipboard" });
      const ids: string[] = [];
      for (const lead of leads) {
        const { id } = await LeadsService.create(lead);
        ids.push(id);
      }
      return { created: ids.length, ids };
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.LEADS_GET_FORM_SCHEMA,
    simpleHandler(async () => LeadFormSchemaService.getSchema())
  );
}

import { ipcMain, IpcMainInvokeEvent } from "electron";
import { ZodError, ZodSchema } from "zod";
import { IPC_CHANNEL } from "./channels";
import { LeadsService } from "../services/leadsService";
import { CredentialsService } from "../services/credentialsService";
import { AutomationService } from "../services/automationService";
import { FlowsService } from "../services/flowsService";
import { MailAuthService } from "../services/mailAuthService";
import { MailService } from "../services/mailService";
import { FixtureExporter } from "../services/fixtureExporter";
import { OAuthService } from "../services/oauthService";
import { ProductStatusService } from "../services/productStatusService";
import { ProductConfigCore, ProductConfigQuery } from "../services/productConfig";
import { flowStateService } from "../flows/state";
import { getDashboardOverview } from "../services/dashboardService";
import { resumeFlowState } from "../services/flowResumeService";
import {
  AppError,
  ValidationError,
  IpcResult,
  success,
  failure,
  toIpcResult,
} from "@/shared/errors";
import {
  LeadsCreateSchema,
  LeadsUpdateSchema,
  LeadsGetSchema,
  LeadsRemoveSchema,
  LeadsListSchema,
  CredentialsUpsertSchema,
  CredentialsGetSchema,
  CredentialsDeleteSchema,
  CredentialsTestSchema,
  MailFetchSchema,
  AutomationEnqueueSchema,
  AutomationGetSchema,
  AutomationListSchema,
  AutomationCancelSchema,
  FixturesExportSchema,
  LeadsParseFromTextSchema,
  ProductGetConfigSchema,
  ProductGetStatusSchema,
  ProductSaveStatusSchema,
  ProductUpdateStatusSchema,
  FlowStateIdSchema,
} from "@/shared/validation/ipc.zod";
import { parseLeads } from "@/main/leads/parsing/parser";

/**
 * Validate input with a Zod schema and throw ValidationError if invalid.
 */
function validate<T>(schema: ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (err) {
    if (err instanceof ZodError) {
      const issues = err.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
      throw new ValidationError(`Validation failed: ${issues.join(", ")}`, {
        issues: err.issues,
      });
    }
    throw err;
  }
}

/**
 * Wrap an IPC handler with error handling and optional validation.
 */
function handler<TInput, TOutput>(
  schema: ZodSchema<TInput> | null,
  fn: (input: TInput) => Promise<TOutput>
): (_event: IpcMainInvokeEvent, input: unknown) => Promise<IpcResult<TOutput>> {
  return async (_event, rawInput) => {
    try {
      const input = schema ? validate(schema, rawInput) : (rawInput as TInput);
      const result = await fn(input);
      return success(result);
    } catch (err) {
      if (err instanceof AppError) {
        return failure(err);
      }
      return toIpcResult(err);
    }
  };
}

/**
 * Simple handler without input validation.
 */
function simpleHandler<TOutput>(
  fn: () => Promise<TOutput>
): () => Promise<IpcResult<TOutput>> {
  return async () => {
    try {
      const result = await fn();
      return success(result);
    } catch (err) {
      if (err instanceof AppError) {
        return failure(err);
      }
      return toIpcResult(err);
    }
  };
}

export function registerIpc() {
  // ========== Mail ==========
  ipcMain.handle(
    IPC_CHANNEL.MAIL_STATUS,
    simpleHandler(() => MailAuthService.status())
  );

  ipcMain.handle(IPC_CHANNEL.MAIL_CONNECT, async () => {
    try {
      const result = await OAuthService.connect();
      if (result.ok) {
        return success({ email: result.email });
      }
      return { ok: false as const, error: "AUTH" as const, message: result.error };
    } catch (err) {
      return toIpcResult(err);
    }
  });

  ipcMain.handle(IPC_CHANNEL.MAIL_DISCONNECT, async () => {
    try {
      await OAuthService.disconnect();
      return success({ disconnected: true });
    } catch (err) {
      return toIpcResult(err);
    }
  });

  ipcMain.handle(
    IPC_CHANNEL.MAIL_FETCH,
    handler(MailFetchSchema, async ({ days, verbose, concurrency }) => {
      return MailService.fetch(days, undefined, { verbose, concurrency });
    })
  );

  // ========== Fixtures (dev) ==========
  ipcMain.handle(
    IPC_CHANNEL.FIXTURES_EXPORT,
    handler(FixturesExportSchema, async ({ days }) => {
      return FixtureExporter.exportEmailsToFixtures(days);
    })
  );

  // ========== Flows ==========
  ipcMain.handle(
    IPC_CHANNEL.FLOWS_LIST,
    simpleHandler(() => FlowsService.list())
  );

  // ========== Leads ==========
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

  // ========== Credentials ==========
  ipcMain.handle(
    IPC_CHANNEL.CREDS_UPSERT,
    handler(CredentialsUpsertSchema, async (creds) => {
      await CredentialsService.upsert(creds);
      return { saved: true };
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.CREDS_GET,
    handler(CredentialsGetSchema, async ({ platform }) => {
      const creds = await CredentialsService.getByPlatform(platform);
      // Don't return password to frontend - just confirm it exists
      if (!creds) return null;
      return { platform: creds.platform, login: creds.login, hasPassword: true };
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.CREDS_LIST,
    simpleHandler(async () => {
      return CredentialsService.listPlatforms();
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.CREDS_DELETE,
    handler(CredentialsDeleteSchema, async ({ platform }) => {
      await CredentialsService.delete(platform);
      return { deleted: true };
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.CREDS_TEST,
    handler(CredentialsTestSchema, async ({ platform }) => {
      return CredentialsService.test(platform);
    })
  );

  // ========== Automation ==========
  ipcMain.handle(
    IPC_CHANNEL.AUTO_ENQUEUE,
    handler(AutomationEnqueueSchema, async ({ items }) => {
      return AutomationService.enqueue(items);
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.AUTO_GET,
    handler(AutomationGetSchema, async ({ runId }) => {
      return AutomationService.get(runId);
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.AUTO_LIST,
    handler(AutomationListSchema, async (options) => {
      return AutomationService.list(options ?? undefined);
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.AUTO_CANCEL,
    handler(AutomationCancelSchema, async ({ runId }) => {
      return AutomationService.cancel(runId);
    })
  );

  // ========== Products ==========
  ipcMain.handle(
    IPC_CHANNEL.PRODUCTS_LIST_CONFIGS,
    simpleHandler(async () => {
      return ProductConfigCore.listAllProducts();
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.PRODUCTS_GET_CONFIG,
    handler(ProductGetConfigSchema, async ({ flowKey }) => {
      return ProductConfigCore.getProductConfig(flowKey) ?? null;
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.PRODUCTS_LIST_ACTIVE_CONFIGS,
    simpleHandler(async () => {
      return ProductConfigQuery.listActiveProducts();
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

  // ========== Flow States (pause/resume inspection) ==========
  ipcMain.handle(
    IPC_CHANNEL.FLOW_STATES_LIST_PAUSED,
    simpleHandler(async () => {
      return flowStateService.getPausedFlows();
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.FLOW_STATES_GET,
    handler(FlowStateIdSchema, async ({ id }) => {
      const state = await flowStateService.getState(id);
      return state ?? null;
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.FLOW_STATES_DELETE,
    handler(FlowStateIdSchema, async ({ id }) => {
      await flowStateService.deleteState(id);
      return { deleted: true };
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.FLOW_STATES_RESUME,
    handler(FlowStateIdSchema, async ({ id }) => {
      const result = await resumeFlowState(id);
      return {
        success: result.success,
        flowKey: result.flowKey,
        leadId: result.leadId,
        totalDuration: result.totalDuration,
        paused: result.paused,
        stateId: result.stateId,
        errorMessage: result.error?.message,
      };
    })
  );

  // ========== Dashboard ==========
  ipcMain.handle(
    IPC_CHANNEL.DASHBOARD_OVERVIEW,
    simpleHandler(async () => {
      return getDashboardOverview();
    })
  );
}

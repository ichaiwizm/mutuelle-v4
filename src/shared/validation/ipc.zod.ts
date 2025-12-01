import { z } from "zod";
import { LeadSchema } from "./lead.zod";
import {
  CreateProductStatusSchema,
  UpdateProductStatusSchema,
} from "./product.zod";

// ========== Leads ==========

export const LeadsCreateSchema = LeadSchema;

export const LeadsUpdateSchema = z.object({
  id: z.string().uuid(),
  data: z.object({
    subscriber: z.record(z.string(), z.any()).optional(),
    project: z.record(z.string(), z.any()).optional(),
    children: z.array(z.record(z.string(), z.any())).optional(),
  }),
});

export const LeadsGetSchema = z.object({
  id: z.string().uuid(),
});

export const LeadsRemoveSchema = z.object({
  id: z.string().uuid(),
});

export const LeadsListSchema = z.object({
  limit: z.number().int().positive().max(1000).optional(),
  offset: z.number().int().min(0).optional(),
  search: z.string().optional(),
}).optional();

// Intelligent paste / parsing from raw text
export const LeadsParseFromTextSchema = z.object({
  text: z.string().min(1, "Text is required"),
  subject: z.string().optional(),
});

// ========== Credentials ==========

const PlatformSchema = z.enum(["alptis", "swisslife"]);

export const CredentialsUpsertSchema = z.object({
  platform: PlatformSchema,
  login: z.string().min(1, "Login is required"),
  password: z.string().min(1, "Password is required"),
});

export const CredentialsGetSchema = z.object({
  platform: PlatformSchema,
});

export const CredentialsDeleteSchema = z.object({
  platform: PlatformSchema,
});

export const CredentialsTestSchema = z.object({
  platform: PlatformSchema,
});

// ========== Mail ==========

export const MailFetchSchema = z.object({
  // 0 = pas de filtre de date (tous les messages)
  days: z.number().int().min(0).max(365),
  verbose: z.boolean().optional(),
  concurrency: z.number().int().positive().max(100).optional(),
});

// ========== Automation ==========

export const AutomationEnqueueItemSchema = z.object({
  leadId: z.string().uuid(),
  flowKey: z.string().min(1),
});

export const AutomationEnqueueSchema = z.object({
  items: z.array(AutomationEnqueueItemSchema).min(1),
});

export const AutomationGetSchema = z.object({
  runId: z.string().uuid(),
});

export const AutomationListSchema = z.object({
  limit: z.number().int().positive().max(100).optional().default(20),
  offset: z.number().int().min(0).optional().default(0),
}).optional();

export const AutomationCancelSchema = z.object({
  runId: z.string().uuid(),
});

export const AutomationGetItemSchema = z.object({
  itemId: z.string().uuid(),
});

export const AutomationReadScreenshotSchema = z.object({
  path: z.string().min(1),
});

// ========== Fixtures (dev) ==========

export const FixturesExportSchema = z.object({
  days: z.number().int().positive().max(365),
});

// ========== Products ==========

export const ProductGetConfigSchema = z.object({
  flowKey: z.string().min(1),
});

export const ProductGetStatusSchema = z.object({
  platform: z.string().min(1),
  product: z.string().min(1),
});

export const ProductSaveStatusSchema = CreateProductStatusSchema;

export const ProductUpdateStatusSchema = UpdateProductStatusSchema.extend({
  platform: z.string().min(1),
  product: z.string().min(1),
});

// ========== Flow States (pause/resume) ==========

export const FlowStateIdSchema = z.object({
  id: z.string().uuid(),
});

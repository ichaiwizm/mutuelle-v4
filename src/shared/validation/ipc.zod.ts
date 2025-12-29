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

const PlatformSchema = z.enum(["alptis", "swisslife", "entoria"]);

export const CredentialsUpsertSchema = z.object({
  platform: PlatformSchema,
  login: z.string().min(1, "Login is required"),
  password: z.string().min(1, "Password is required"),
  courtierCode: z.string().optional(), // Only for Entoria
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

export const AutomationRetryItemSchema = z.object({
  itemId: z.string().uuid(),
});

export const AutomationReadScreenshotSchema = z.object({
  path: z.string().min(1),
});

export const AutomationBringToFrontSchema = z.object({
  itemId: z.string().uuid(),
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

// ========== Devis ==========

export const DevisStatusSchema = z.enum(["pending", "completed", "failed", "expired"]);

export const DevisFiltersSchema = z
  .object({
    status: DevisStatusSchema.optional(),
    flowKey: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    search: z.string().optional(),
  })
  .optional();

export const DevisListSchema = z
  .object({
    limit: z.number().int().positive().max(1000).optional(),
    offset: z.number().int().min(0).optional(),
    filters: DevisFiltersSchema,
  })
  .optional();

export const DevisListByLeadSchema = z.object({
  leadId: z.string().uuid(),
});

export const DevisGetSchema = z.object({
  id: z.string().uuid(),
});

export const DevisCreateSchema = z.object({
  leadId: z.string().uuid(),
  flowKey: z.string().min(1),
});

export const DevisUpdateSchema = z.object({
  id: z.string().uuid(),
  data: z.object({
    status: DevisStatusSchema.optional(),
    data: z.record(z.string(), z.unknown()).nullable().optional(),
    pdfPath: z.string().nullable().optional(),
    errorMessage: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    expiresAt: z.string().nullable().optional(),
  }),
});

export const DevisDeleteSchema = z.object({
  id: z.string().uuid(),
});

export const DevisExportPdfSchema = z.object({
  id: z.string().uuid(),
});

export const DevisDuplicateSchema = z.object({
  id: z.string().uuid(),
});

export const DevisCountByLeadSchema = z.object({
  leadIds: z.array(z.string().uuid()),
});

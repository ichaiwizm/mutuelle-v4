import { z } from "zod";

export const ProductStatusValueSchema = z.enum(["active", "inactive", "beta", "deprecated"]);

export const ProductStatusSchema = z.object({
  platform: z.string(),
  product: z.string(),
  status: ProductStatusValueSchema,
  updatedAt: z.number(),
  updatedBy: z.string().optional(),
});

export const CreateProductStatusSchema = z.object({
  platform: z.string(),
  product: z.string(),
  status: ProductStatusValueSchema.default("active"),
  updatedBy: z.string().optional(),
});

export const UpdateProductStatusSchema = z.object({
  status: ProductStatusValueSchema,
  updatedBy: z.string().optional(),
});

export type ProductStatusDTO = z.infer<typeof ProductStatusSchema>;
export type CreateProductStatusDTO = z.infer<typeof CreateProductStatusSchema>;
export type UpdateProductStatusDTO = z.infer<typeof UpdateProductStatusSchema>;

// Product categories
export const ProductCategorySchema = z.enum(["sante", "prevoyance", "retraite", "vie"]);

// Step types
export const StepTypeSchema = z.enum(["auth", "navigation", "form-fill", "validation", "submission"]);

// Step definition
export const StepDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  type: StepTypeSchema,
  required: z.boolean(),
  method: z.string(),
  conditional: z.string().optional(),
  estimatedDuration: z.number().optional(),
});

// Product configuration
export const ProductConfigurationSchema = z.object({
  platform: z.string(),
  product: z.string(),
  flowKey: z.string(),
  category: ProductCategorySchema,
  displayName: z.string(),
  description: z.string().optional(),
  steps: z.array(StepDefinitionSchema),
  metadata: z
    .object({
      formUrl: z.string().optional(),
      totalSections: z.number().optional(),
      supportsPartialFill: z.boolean().optional(),
    })
    .optional(),
});

export type ProductCategoryDTO = z.infer<typeof ProductCategorySchema>;
export type StepTypeDTO = z.infer<typeof StepTypeSchema>;
export type StepDefinitionDTO = z.infer<typeof StepDefinitionSchema>;
export type ProductConfigurationDTO = z.infer<typeof ProductConfigurationSchema>;

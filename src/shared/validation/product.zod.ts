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

import { z } from "zod";

export const LeadSchema = z.object({
  id: z.string().uuid().optional(),
  subscriber: z.record(z.string(), z.any()),
  project: z.record(z.string(), z.any()).optional(),
  children: z.array(z.record(z.string(), z.any())).optional(),
});

export type LeadDTO = z.infer<typeof LeadSchema>;

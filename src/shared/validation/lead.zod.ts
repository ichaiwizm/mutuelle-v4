import { z } from "zod";

export const LeadSchema = z.object({
  id: z.string().uuid(),
  subscriber: z.record(z.any()),
  project: z.record(z.any()).optional(),
  children: z.array(z.record(z.any())).optional(),
});

export type LeadDTO = z.infer<typeof LeadSchema>;

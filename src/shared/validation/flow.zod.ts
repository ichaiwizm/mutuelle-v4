import { z } from "zod";

export const FlowSchema = z.object({
  key: z.string(),
  version: z.string(),
  title: z.string(),
});

export type FlowDTO = z.infer<typeof FlowSchema>;

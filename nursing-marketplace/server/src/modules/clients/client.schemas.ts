import { z } from "zod";

export const upsertClientProfileSchema = z.object({
  displayName: z.string().min(2),
  organization: z.string().optional(),
  city: z.string().optional(),
});
export type UpsertClientProfileInput = z.infer<typeof upsertClientProfileSchema>;

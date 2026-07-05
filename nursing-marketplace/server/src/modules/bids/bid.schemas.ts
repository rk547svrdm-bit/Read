import { z } from "zod";

export const placeBidSchema = z.object({
  amount: z.number().positive(),
});
export type PlaceBidInput = z.infer<typeof placeBidSchema>;

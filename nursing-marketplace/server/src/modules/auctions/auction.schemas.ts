import { z } from "zod";
import { AUCTION_TYPES } from "../../constants.js";

export const createAuctionSchema = z
  .object({
    type: z.enum(AUCTION_TYPES),
    // Richiesto quando type === "SERVICE": la prestazione del proprio catalogo da mettere all'asta.
    serviceId: z.string().optional(),
    // Se omesso: tariffa oraria minima del profilo (HOURLY) o paga minima della prestazione (SERVICE).
    startingPrice: z.number().positive().optional(),
    durationHours: z.number().positive().max(24 * 30).optional(),
  })
  .refine((data) => data.type !== "SERVICE" || !!data.serviceId, {
    message: "serviceId è richiesto per un'asta a prestazione",
    path: ["serviceId"],
  });
export type CreateAuctionInput = z.infer<typeof createAuctionSchema>;

export const searchAuctionsQuerySchema = z.object({
  nurseId: z.string().optional(),
  type: z.enum(AUCTION_TYPES).optional(),
  status: z.string().optional(),
});
export type SearchAuctionsQuery = z.infer<typeof searchAuctionsQuerySchema>;

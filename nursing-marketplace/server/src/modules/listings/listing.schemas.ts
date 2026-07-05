import { z } from "zod";
import { SHIFT_TYPES, CARE_SETTINGS } from "../../constants.js";

export const createListingSchema = z.object({
  title: z.string().min(3).max(140),
  description: z.string().max(4000).default(""),
  careSetting: z.enum(CARE_SETTINGS),
  shiftType: z.enum(SHIFT_TYPES),
  isHoliday: z.boolean().default(false),
  isWeekend: z.boolean().default(false),
  serviceDate: z.coerce.date(),
  durationHours: z.number().positive(),
  city: z.string().min(2),
  // Se omesso, viene usata la paga oraria minima impostata sul profilo dell'infermiere.
  startingPrice: z.number().positive().optional(),
});
export type CreateListingInput = z.infer<typeof createListingSchema>;

export const searchListingsQuerySchema = z.object({
  city: z.string().optional(),
  careSetting: z.enum(CARE_SETTINGS).optional(),
  shiftType: z.enum(SHIFT_TYPES).optional(),
  status: z.string().optional(),
});
export type SearchListingsQuery = z.infer<typeof searchListingsQuerySchema>;

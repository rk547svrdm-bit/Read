import { z } from "zod";
import { SHIFT_TYPES, CARE_SETTINGS } from "../../constants.js";

export const upsertNurseProfileSchema = z.object({
  fullName: z.string().min(2),
  headline: z.string().max(140).optional(),
  bio: z.string().max(4000).default(""),
  licenseNumber: z.string().optional(),
  yearsExperience: z.number().int().min(0).default(0),
  skills: z.array(z.string()).default([]),
  specializations: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([]),
  city: z.string().min(2),
  travelRadiusKm: z.number().int().min(0).default(10),
  minHourlyRate: z.number().min(0),
  acceptsHolidays: z.boolean().default(false),
  acceptsWeekends: z.boolean().default(false),
  acceptsNights: z.boolean().default(false),
  preferredShifts: z.array(z.enum(SHIFT_TYPES)).default([]),
  careSettings: z.array(z.enum(CARE_SETTINGS)).default([]),
  isActive: z.boolean().default(true),
});
export type UpsertNurseProfileInput = z.infer<typeof upsertNurseProfileSchema>;

export const searchNursesQuerySchema = z.object({
  city: z.string().optional(),
  careSetting: z.enum(CARE_SETTINGS).optional(),
  shiftType: z.enum(SHIFT_TYPES).optional(),
  acceptsHolidays: z.coerce.boolean().optional(),
  maxHourlyRate: z.coerce.number().optional(),
  q: z.string().optional(),
});
export type SearchNursesQuery = z.infer<typeof searchNursesQuerySchema>;

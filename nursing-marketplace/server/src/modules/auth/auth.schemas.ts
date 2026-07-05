import { z } from "zod";
import { ROLES } from "../../constants.js";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "La password deve avere almeno 8 caratteri"),
  role: z.enum(["NURSE", "CLIENT"] as [(typeof ROLES)[number], ...(typeof ROLES)[number][]]),
  // Profilo minimo creato in automatico alla registrazione; può essere
  // completato in seguito con PUT /nurses/me o /clients/me.
  displayName: z.string().min(2),
  city: z.string().min(2).optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

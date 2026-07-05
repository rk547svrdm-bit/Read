import { prisma } from "../../lib/prisma.js";
import { hashPassword, comparePassword } from "../../lib/password.js";
import { signAuthToken } from "../../lib/jwt.js";
import { AppError } from "../../utils/AppError.js";
import type { RegisterInput, LoginInput } from "./auth.schemas.js";
import type { Role } from "../../constants.js";

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw AppError.conflict("Esiste già un account con questa email");
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      role: input.role,
      ...(input.role === "NURSE"
        ? {
            nurseProfile: {
              create: {
                fullName: input.displayName,
                bio: "",
                city: input.city ?? "",
                minHourlyRate: 0,
              },
            },
          }
        : {
            clientProfile: {
              create: {
                displayName: input.displayName,
                city: input.city ?? null,
              },
            },
          }),
    },
  });

  const token = signAuthToken({ sub: user.id, role: user.role as Role, email: user.email });
  return { token, user: { id: user.id, email: user.email, role: user.role } };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw AppError.unauthorized("Credenziali non valide");

  const valid = await comparePassword(input.password, user.passwordHash);
  if (!valid) throw AppError.unauthorized("Credenziali non valide");

  const token = signAuthToken({ sub: user.id, role: user.role as Role, email: user.email });
  return { token, user: { id: user.id, email: user.email, role: user.role } };
}

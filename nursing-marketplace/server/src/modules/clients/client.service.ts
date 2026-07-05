import type { ClientProfile } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import type { UpsertClientProfileInput } from "./client.schemas.js";

export function serializeClientProfile(profile: ClientProfile) {
  return {
    id: profile.id,
    userId: profile.userId,
    displayName: profile.displayName,
    organization: profile.organization,
    city: profile.city,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

export async function upsertMyProfile(userId: string, input: UpsertClientProfileInput) {
  const profile = await prisma.clientProfile.upsert({
    where: { userId },
    create: { userId, ...input },
    update: input,
  });
  return serializeClientProfile(profile);
}

export async function getMyProfile(userId: string) {
  const profile = await prisma.clientProfile.findUnique({ where: { userId } });
  if (!profile) throw AppError.notFound("Profilo cliente non trovato");
  return serializeClientProfile(profile);
}

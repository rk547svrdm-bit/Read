import type { NurseProfile } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { fromJsonArray, toJsonArray } from "../../utils/json.js";
import type { UpsertNurseProfileInput, SearchNursesQuery } from "./nurse.schemas.js";

export function serializeNurseProfile(profile: NurseProfile) {
  return {
    id: profile.id,
    userId: profile.userId,
    fullName: profile.fullName,
    headline: profile.headline,
    bio: profile.bio,
    photoUrl: profile.photoUrl,
    licenseNumber: profile.licenseNumber,
    yearsExperience: profile.yearsExperience,
    skills: fromJsonArray(profile.skillsJson),
    specializations: fromJsonArray(profile.specializationsJson),
    certifications: fromJsonArray(profile.certificationsJson),
    city: profile.city,
    travelRadiusKm: profile.travelRadiusKm,
    minHourlyRate: profile.minHourlyRate,
    acceptsHolidays: profile.acceptsHolidays,
    acceptsWeekends: profile.acceptsWeekends,
    acceptsNights: profile.acceptsNights,
    preferredShifts: fromJsonArray(profile.preferredShiftsJson),
    careSettings: fromJsonArray(profile.careSettingsJson),
    isActive: profile.isActive,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

export async function upsertMyProfile(userId: string, input: UpsertNurseProfileInput) {
  const data = {
    fullName: input.fullName,
    headline: input.headline,
    bio: input.bio,
    photoUrl: input.photoUrl,
    licenseNumber: input.licenseNumber,
    yearsExperience: input.yearsExperience,
    skillsJson: toJsonArray(input.skills),
    specializationsJson: toJsonArray(input.specializations),
    certificationsJson: toJsonArray(input.certifications),
    city: input.city,
    travelRadiusKm: input.travelRadiusKm,
    minHourlyRate: input.minHourlyRate,
    acceptsHolidays: input.acceptsHolidays,
    acceptsWeekends: input.acceptsWeekends,
    acceptsNights: input.acceptsNights,
    preferredShiftsJson: toJsonArray(input.preferredShifts),
    careSettingsJson: toJsonArray(input.careSettings),
    isActive: input.isActive,
  };

  const profile = await prisma.nurseProfile.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });

  return serializeNurseProfile(profile);
}

export async function getMyProfile(userId: string) {
  const profile = await prisma.nurseProfile.findUnique({ where: { userId } });
  if (!profile) throw AppError.notFound("Profilo infermiere non trovato");
  return serializeNurseProfile(profile);
}

export async function getProfileById(id: string) {
  const profile = await prisma.nurseProfile.findUnique({ where: { id } });
  if (!profile) throw AppError.notFound("Infermiere non trovato");
  return serializeNurseProfile(profile);
}

/** Directory pubblica degli infermieri, filtrabile (vista "eBay"). */
export async function searchNurses(query: SearchNursesQuery) {
  const profiles = await prisma.nurseProfile.findMany({
    where: {
      isActive: true,
      ...(query.city ? { city: { contains: query.city } } : {}),
      ...(query.acceptsHolidays !== undefined ? { acceptsHolidays: query.acceptsHolidays } : {}),
      ...(query.maxHourlyRate !== undefined ? { minHourlyRate: { lte: query.maxHourlyRate } } : {}),
      ...(query.q
        ? {
            OR: [
              { fullName: { contains: query.q } },
              { headline: { contains: query.q } },
              { bio: { contains: query.q } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
  });

  const serialized = profiles.map(serializeNurseProfile);

  // I filtri su liste JSON (turno, ambiente) vengono applicati in memoria
  // perché SQLite non supporta query su array serializzati.
  return serialized.filter((p) => {
    if (query.careSetting && p.careSettings.length > 0 && !p.careSettings.includes(query.careSetting)) {
      return false;
    }
    if (query.shiftType && p.preferredShifts.length > 0 && !p.preferredShifts.includes(query.shiftType)) {
      return false;
    }
    return true;
  });
}

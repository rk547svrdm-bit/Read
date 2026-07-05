import type { Listing } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { env } from "../../config/env.js";
import { fromJsonArray } from "../../utils/json.js";
import { nurseAcceptsConditions } from "../../utils/matching.js";
import type { CareSetting, ShiftType } from "../../constants.js";
import type { CreateListingInput, SearchListingsQuery } from "./listing.schemas.js";

export function serializeListing(listing: Listing) {
  return {
    id: listing.id,
    nurseId: listing.nurseId,
    title: listing.title,
    description: listing.description,
    careSetting: listing.careSetting,
    shiftType: listing.shiftType,
    isHoliday: listing.isHoliday,
    isWeekend: listing.isWeekend,
    serviceDate: listing.serviceDate,
    durationHours: listing.durationHours,
    city: listing.city,
    startingPrice: listing.startingPrice,
    status: listing.status,
    createdAt: listing.createdAt,
    updatedAt: listing.updatedAt,
  };
}

async function getOwnedNurseProfileOrThrow(userId: string) {
  const profile = await prisma.nurseProfile.findUnique({ where: { userId } });
  if (!profile) throw AppError.notFound("Profilo infermiere non trovato");
  return profile;
}

export async function createListing(userId: string, input: CreateListingInput) {
  const nurse = await getOwnedNurseProfileOrThrow(userId);

  const startingPrice = input.startingPrice ?? nurse.minHourlyRate;
  if (startingPrice < nurse.minHourlyRate) {
    throw AppError.badRequest(
      `Il prezzo di partenza (${startingPrice}) non può essere inferiore alla tua paga oraria minima (${nurse.minHourlyRate})`
    );
  }

  const match = nurseAcceptsConditions(
    {
      minHourlyRate: nurse.minHourlyRate,
      acceptsHolidays: nurse.acceptsHolidays,
      acceptsWeekends: nurse.acceptsWeekends,
      acceptsNights: nurse.acceptsNights,
      preferredShifts: fromJsonArray(nurse.preferredShiftsJson) as ShiftType[],
      careSettings: fromJsonArray(nurse.careSettingsJson) as CareSetting[],
    },
    {
      hourlyRate: startingPrice,
      isHoliday: input.isHoliday,
      isWeekend: input.isWeekend,
      shiftType: input.shiftType,
      careSetting: input.careSetting,
    }
  );

  if (!match.matches) {
    throw AppError.badRequest(
      "Le condizioni dell'inserzione non rispettano i tuoi stessi requisiti di profilo",
      match.reasons
    );
  }

  const listing = await prisma.listing.create({
    data: {
      nurseId: nurse.id,
      title: input.title,
      description: input.description,
      careSetting: input.careSetting,
      shiftType: input.shiftType,
      isHoliday: input.isHoliday,
      isWeekend: input.isWeekend,
      serviceDate: input.serviceDate,
      durationHours: input.durationHours,
      city: input.city,
      startingPrice,
      status: "DRAFT",
    },
  });

  return serializeListing(listing);
}

/** Pubblica il listing e genera l'asta associata, aperta da subito. */
export async function publishListing(userId: string, listingId: string) {
  const nurse = await getOwnedNurseProfileOrThrow(userId);
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });

  if (!listing || listing.nurseId !== nurse.id) {
    throw AppError.notFound("Inserzione non trovata");
  }
  if (listing.status !== "DRAFT") {
    throw AppError.conflict("Solo un'inserzione in bozza può essere pubblicata");
  }

  const now = new Date();
  const endAt = new Date(now.getTime() + env.auctionDefaultDurationHours * 60 * 60 * 1000);

  const [, auction] = await prisma.$transaction([
    prisma.listing.update({ where: { id: listing.id }, data: { status: "PUBLISHED" } }),
    prisma.auction.create({
      data: {
        listingId: listing.id,
        startAt: now,
        endAt,
        minIncrement: env.auctionDefaultMinIncrement,
        startingPrice: listing.startingPrice,
        currentPrice: listing.startingPrice,
        status: "OPEN",
      },
    }),
  ]);

  return auction;
}

export async function getListingById(id: string) {
  const listing = await prisma.listing.findUnique({ where: { id }, include: { auction: true } });
  if (!listing) throw AppError.notFound("Inserzione non trovata");
  return { ...serializeListing(listing), auction: listing.auction };
}

export async function searchListings(query: SearchListingsQuery) {
  const listings = await prisma.listing.findMany({
    where: {
      status: query.status ?? "PUBLISHED",
      ...(query.city ? { city: { contains: query.city } } : {}),
      ...(query.careSetting ? { careSetting: query.careSetting } : {}),
      ...(query.shiftType ? { shiftType: query.shiftType } : {}),
    },
    include: { auction: true },
    orderBy: { serviceDate: "asc" },
  });

  return listings.map((l) => ({ ...serializeListing(l), auction: l.auction }));
}

export async function getMyListings(userId: string) {
  const nurse = await getOwnedNurseProfileOrThrow(userId);
  const listings = await prisma.listing.findMany({
    where: { nurseId: nurse.id },
    include: { auction: true },
    orderBy: { createdAt: "desc" },
  });
  return listings.map((l) => ({ ...serializeListing(l), auction: l.auction }));
}

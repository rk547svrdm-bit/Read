import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { env } from "../../config/env.js";
import type { CreateAuctionInput, SearchAuctionsQuery } from "./auction.schemas.js";

const auctionInclude = {
  nurse: true,
  service: true,
  bids: { orderBy: { amount: "desc" as const } },
  booking: true,
};

async function getOwnedNurseProfileOrThrow(userId: string) {
  const profile = await prisma.nurseProfile.findUnique({ where: { userId } });
  if (!profile) throw AppError.notFound("Profilo infermiere non trovato");
  return profile;
}

/** Apre una nuova asta sul professionista: oraria o su una specifica prestazione del suo catalogo. */
export async function createAuction(userId: string, input: CreateAuctionInput) {
  const nurse = await getOwnedNurseProfileOrThrow(userId);

  let startingPrice: number;
  let serviceId: string | null = null;

  if (input.type === "HOURLY") {
    startingPrice = input.startingPrice ?? nurse.minHourlyRate;
    if (startingPrice < nurse.minHourlyRate) {
      throw AppError.badRequest(
        `Il prezzo di partenza (${startingPrice}) non può essere inferiore alla tua tariffa oraria minima (${nurse.minHourlyRate})`
      );
    }
  } else {
    const service = await prisma.nurseService.findUnique({ where: { id: input.serviceId! } });
    if (!service || service.nurseId !== nurse.id) {
      throw AppError.notFound("Prestazione non trovata nel tuo catalogo");
    }
    if (!service.isActive) {
      throw AppError.conflict("Questa prestazione non è attiva");
    }
    startingPrice = input.startingPrice ?? service.minPrice;
    if (startingPrice < service.minPrice) {
      throw AppError.badRequest(
        `Il prezzo di partenza (${startingPrice}) non può essere inferiore alla paga minima della prestazione (${service.minPrice})`
      );
    }
    serviceId = service.id;
  }

  const existingOpen = await prisma.auction.findFirst({
    where: {
      nurseId: nurse.id,
      status: "OPEN",
      type: input.type,
      serviceId: input.type === "SERVICE" ? serviceId : null,
    },
  });
  if (existingOpen) {
    throw AppError.conflict("Hai già un'asta aperta di questo tipo");
  }

  const now = new Date();
  const durationHours = input.durationHours ?? env.auctionDefaultDurationHours;
  const endAt = new Date(now.getTime() + durationHours * 60 * 60 * 1000);

  const auction = await prisma.auction.create({
    data: {
      nurseId: nurse.id,
      type: input.type,
      serviceId,
      startAt: now,
      endAt,
      minIncrement: env.auctionDefaultMinIncrement,
      startingPrice,
      currentPrice: startingPrice,
      status: "OPEN",
    },
    include: auctionInclude,
  });

  return auction;
}

export async function getAuctionById(id: string) {
  const auction = await prisma.auction.findUnique({ where: { id }, include: auctionInclude });
  if (!auction) throw AppError.notFound("Asta non trovata");
  return auction;
}

/** Aste pubbliche (di default quelle aperte), filtrabili per professionista/tipo. */
export async function searchAuctions(query: SearchAuctionsQuery) {
  return prisma.auction.findMany({
    where: {
      status: query.status ?? "OPEN",
      ...(query.nurseId ? { nurseId: query.nurseId } : {}),
      ...(query.type ? { type: query.type } : {}),
    },
    include: auctionInclude,
    orderBy: { endAt: "asc" },
  });
}

/**
 * Chiude un'asta scaduta: se ci sono offerte, aggiudica al miglior offerente
 * e crea la prenotazione; altrimenti la annulla.
 * Idempotente: un'asta già chiusa non viene ritoccata.
 */
export async function closeAuction(auctionId: string) {
  return prisma.$transaction(async (tx) => {
    const auction = await tx.auction.findUnique({
      where: { id: auctionId },
      include: { bids: { orderBy: { amount: "desc" }, take: 1 } },
    });
    if (!auction || auction.status !== "OPEN") return auction;

    const topBid = auction.bids[0];

    if (!topBid) {
      return tx.auction.update({ where: { id: auction.id }, data: { status: "CANCELLED" } });
    }

    await tx.bid.update({ where: { id: topBid.id }, data: { status: "WINNING" } });
    await tx.booking.create({
      data: {
        auctionId: auction.id,
        nurseId: auction.nurseId,
        clientId: topBid.clientId,
        finalPrice: topBid.amount,
        status: "CONFIRMED",
      },
    });

    return tx.auction.update({ where: { id: auction.id }, data: { status: "AWARDED" } });
  });
}

/** Chiude tutte le aste OPEN la cui finestra temporale è scaduta. */
export async function closeExpiredAuctions(now: Date = new Date()) {
  const expired = await prisma.auction.findMany({
    where: { status: "OPEN", endAt: { lte: now } },
    select: { id: true },
  });

  for (const { id } of expired) {
    await closeAuction(id);
  }

  return expired.length;
}

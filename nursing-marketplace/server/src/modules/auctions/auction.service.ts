import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";

export async function getAuctionById(id: string) {
  const auction = await prisma.auction.findUnique({
    where: { id },
    include: {
      listing: true,
      bids: { orderBy: { amount: "desc" } },
      booking: true,
    },
  });
  if (!auction) throw AppError.notFound("Asta non trovata");
  return auction;
}

export async function listOpenAuctions() {
  return prisma.auction.findMany({
    where: { status: "OPEN" },
    include: { listing: true },
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
      include: { bids: { orderBy: { amount: "desc" }, take: 1 }, listing: true },
    });
    if (!auction || auction.status !== "OPEN") return auction;

    const topBid = auction.bids[0];

    if (!topBid) {
      await tx.auction.update({ where: { id: auction.id }, data: { status: "CANCELLED" } });
      await tx.listing.update({ where: { id: auction.listingId }, data: { status: "CLOSED" } });
      return tx.auction.findUnique({ where: { id: auction.id } });
    }

    await tx.auction.update({ where: { id: auction.id }, data: { status: "AWARDED" } });
    await tx.listing.update({ where: { id: auction.listingId }, data: { status: "CLOSED" } });
    await tx.bid.update({ where: { id: topBid.id }, data: { status: "WINNING" } });
    await tx.booking.create({
      data: {
        auctionId: auction.id,
        nurseId: auction.listing.nurseId,
        clientId: topBid.clientId,
        finalPrice: topBid.amount,
        status: "CONFIRMED",
      },
    });

    return tx.auction.findUnique({ where: { id: auction.id } });
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

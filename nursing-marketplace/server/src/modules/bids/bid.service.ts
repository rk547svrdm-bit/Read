import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { validateBidAmount } from "../../utils/bidRules.js";

export async function placeBid(auctionId: string, clientId: string, amount: number) {
  return prisma.$transaction(async (tx) => {
    const auction = await tx.auction.findUnique({
      where: { id: auctionId },
      include: { bids: true },
    });
    if (!auction) throw AppError.notFound("Asta non trovata");

    const result = validateBidAmount(
      {
        status: auction.status,
        startAt: auction.startAt,
        endAt: auction.endAt,
        startingPrice: auction.startingPrice,
        currentPrice: auction.currentPrice,
        minIncrement: auction.minIncrement,
        bidsCount: auction.bids.length,
      },
      amount
    );

    if (!result.valid) {
      throw AppError.badRequest(result.reason ?? "Offerta non valida", {
        minNextBid: result.minNextBid,
      });
    }

    if (auction.currentHighestBidId) {
      await tx.bid.update({
        where: { id: auction.currentHighestBidId },
        data: { status: "OUTBID" },
      });
    }

    const bid = await tx.bid.create({
      data: { auctionId, clientId, amount, status: "WINNING" },
    });

    await tx.auction.update({
      where: { id: auctionId },
      data: { currentPrice: amount, currentHighestBidId: bid.id },
    });

    return bid;
  });
}

export async function listBidsForAuction(auctionId: string) {
  return prisma.bid.findMany({ where: { auctionId }, orderBy: { amount: "desc" } });
}

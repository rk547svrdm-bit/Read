import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { assertUserPartOfBooking } from "../bookings/booking.service.js";
import type { CreateReviewInput } from "./review.schemas.js";

export async function createReview(bookingId: string, authorId: string, input: CreateReviewInput) {
  const { booking, counterpartUserId } = await assertUserPartOfBooking(bookingId, authorId);

  if (booking.status !== "COMPLETED") {
    throw AppError.conflict("Puoi lasciare una recensione solo a prestazione completata");
  }

  const existing = await prisma.review.findFirst({ where: { bookingId, authorId } });
  if (existing) throw AppError.conflict("Hai già recensito questa prenotazione");

  return prisma.review.create({
    data: {
      bookingId,
      authorId,
      targetId: counterpartUserId,
      rating: input.rating,
      comment: input.comment,
    },
  });
}

export async function getReviewsForUser(userId: string) {
  return prisma.review.findMany({ where: { targetId: userId }, orderBy: { createdAt: "desc" } });
}

import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import type { Role } from "../../constants.js";

export async function getMyBookings(userId: string, role: Role) {
  if (role === "NURSE") {
    const nurse = await prisma.nurseProfile.findUnique({ where: { userId } });
    if (!nurse) throw AppError.notFound("Profilo infermiere non trovato");
    return prisma.booking.findMany({
      where: { nurseId: nurse.id },
      include: { auction: { include: { listing: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  return prisma.booking.findMany({
    where: { clientId: userId },
    include: { auction: { include: { listing: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getBookingById(id: string) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { auction: { include: { listing: true } }, reviews: true },
  });
  if (!booking) throw AppError.notFound("Prenotazione non trovata");
  return booking;
}

export async function assertUserPartOfBooking(bookingId: string, userId: string) {
  const booking = await getBookingById(bookingId);
  const nurse = await prisma.nurseProfile.findUnique({ where: { id: booking.nurseId } });
  const isNurse = nurse?.userId === userId;
  const isClient = booking.clientId === userId;
  if (!isNurse && !isClient) throw AppError.forbidden("Non fai parte di questa prenotazione");
  return { booking, counterpartUserId: isNurse ? booking.clientId : nurse?.userId! };
}

import type { Request, Response } from "express";
import * as bookingService from "./booking.service.js";
import { AppError } from "../../utils/AppError.js";

export async function getMyBookingsHandler(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const bookings = await bookingService.getMyBookings(req.user.id, req.user.role);
  res.json(bookings);
}

export async function getBookingHandler(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const { booking } = await bookingService.assertUserPartOfBooking(req.params.id, req.user.id);
  res.json(booking);
}

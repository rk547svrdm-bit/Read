import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireAuth } from "../../middleware/auth.js";
import { getMyBookingsHandler, getBookingHandler } from "./booking.controller.js";
import { createReviewHandler } from "../reviews/review.controller.js";

export const bookingRouter = Router();

bookingRouter.get("/me", requireAuth, asyncHandler(getMyBookingsHandler));
bookingRouter.get("/:id", requireAuth, asyncHandler(getBookingHandler));
bookingRouter.post("/:id/reviews", requireAuth, asyncHandler(createReviewHandler));

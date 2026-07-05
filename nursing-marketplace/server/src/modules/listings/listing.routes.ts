import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import {
  createListingHandler,
  publishListingHandler,
  getListingHandler,
  searchListingsHandler,
  getMyListingsHandler,
} from "./listing.controller.js";

export const listingRouter = Router();

listingRouter.get("/", asyncHandler(searchListingsHandler));
listingRouter.get("/me", requireAuth, requireRole("NURSE"), asyncHandler(getMyListingsHandler));
listingRouter.post("/", requireAuth, requireRole("NURSE"), asyncHandler(createListingHandler));
listingRouter.post(
  "/:id/publish",
  requireAuth,
  requireRole("NURSE"),
  asyncHandler(publishListingHandler)
);
listingRouter.get("/:id", asyncHandler(getListingHandler));

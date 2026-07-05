import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import {
  createAuctionHandler,
  getAuctionHandler,
  searchAuctionsHandler,
  closeAuctionHandler,
} from "./auction.controller.js";
import { placeBidHandler, listBidsHandler } from "../bids/bid.controller.js";

export const auctionRouter = Router();

auctionRouter.get("/", asyncHandler(searchAuctionsHandler));
auctionRouter.post("/", requireAuth, requireRole("NURSE"), asyncHandler(createAuctionHandler));
auctionRouter.get("/:id", asyncHandler(getAuctionHandler));
auctionRouter.post("/:id/close", requireAuth, requireRole("ADMIN"), asyncHandler(closeAuctionHandler));

auctionRouter.get("/:id/bids", asyncHandler(listBidsHandler));
auctionRouter.post("/:id/bids", requireAuth, requireRole("CLIENT"), asyncHandler(placeBidHandler));

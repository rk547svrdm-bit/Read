import type { Request, Response } from "express";
import { placeBidSchema } from "./bid.schemas.js";
import * as bidService from "./bid.service.js";
import { AppError } from "../../utils/AppError.js";

export async function placeBidHandler(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const { amount } = placeBidSchema.parse(req.body);
  const bid = await bidService.placeBid(req.params.id, req.user.id, amount);
  res.status(201).json(bid);
}

export async function listBidsHandler(req: Request, res: Response) {
  const bids = await bidService.listBidsForAuction(req.params.id);
  res.json(bids);
}

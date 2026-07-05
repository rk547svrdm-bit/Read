import type { Request, Response } from "express";
import * as auctionService from "./auction.service.js";
import { createAuctionSchema, searchAuctionsQuerySchema } from "./auction.schemas.js";
import { AppError } from "../../utils/AppError.js";

export async function createAuctionHandler(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const input = createAuctionSchema.parse(req.body);
  const auction = await auctionService.createAuction(req.user.id, input);
  res.status(201).json(auction);
}

export async function getAuctionHandler(req: Request, res: Response) {
  const auction = await auctionService.getAuctionById(req.params.id);
  res.json(auction);
}

export async function searchAuctionsHandler(req: Request, res: Response) {
  const query = searchAuctionsQuerySchema.parse(req.query);
  const auctions = await auctionService.searchAuctions(query);
  res.json(auctions);
}

/** Endpoint manuale utile in sviluppo/test; in produzione la chiusura
 * avviene automaticamente tramite lo scheduler in-process (vedi index.ts). */
export async function closeAuctionHandler(req: Request, res: Response) {
  const auction = await auctionService.closeAuction(req.params.id);
  res.json(auction);
}

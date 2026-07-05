import type { Request, Response } from "express";
import * as auctionService from "./auction.service.js";

export async function getAuctionHandler(req: Request, res: Response) {
  const auction = await auctionService.getAuctionById(req.params.id);
  res.json(auction);
}

export async function listOpenAuctionsHandler(_req: Request, res: Response) {
  const auctions = await auctionService.listOpenAuctions();
  res.json(auctions);
}

/** Endpoint manuale utile in sviluppo/test; in produzione la chiusura
 * avviene automaticamente tramite lo scheduler in-process (vedi index.ts). */
export async function closeAuctionHandler(req: Request, res: Response) {
  const auction = await auctionService.closeAuction(req.params.id);
  res.json(auction);
}

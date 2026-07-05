import type { Request, Response } from "express";
import { createListingSchema, searchListingsQuerySchema } from "./listing.schemas.js";
import * as listingService from "./listing.service.js";
import { AppError } from "../../utils/AppError.js";

export async function createListingHandler(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const input = createListingSchema.parse(req.body);
  const listing = await listingService.createListing(req.user.id, input);
  res.status(201).json(listing);
}

export async function publishListingHandler(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const auction = await listingService.publishListing(req.user.id, req.params.id);
  res.status(200).json(auction);
}

export async function getListingHandler(req: Request, res: Response) {
  const listing = await listingService.getListingById(req.params.id);
  res.json(listing);
}

export async function searchListingsHandler(req: Request, res: Response) {
  const query = searchListingsQuerySchema.parse(req.query);
  const listings = await listingService.searchListings(query);
  res.json(listings);
}

export async function getMyListingsHandler(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const listings = await listingService.getMyListings(req.user.id);
  res.json(listings);
}

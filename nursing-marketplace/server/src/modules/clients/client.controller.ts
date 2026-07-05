import type { Request, Response } from "express";
import { upsertClientProfileSchema } from "./client.schemas.js";
import * as clientService from "./client.service.js";
import { AppError } from "../../utils/AppError.js";

export async function getMyProfileHandler(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const profile = await clientService.getMyProfile(req.user.id);
  res.json(profile);
}

export async function upsertMyProfileHandler(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const input = upsertClientProfileSchema.parse(req.body);
  const profile = await clientService.upsertMyProfile(req.user.id, input);
  res.json(profile);
}

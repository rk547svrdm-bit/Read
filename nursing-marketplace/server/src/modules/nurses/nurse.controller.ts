import type { Request, Response } from "express";
import { upsertNurseProfileSchema, searchNursesQuerySchema } from "./nurse.schemas.js";
import * as nurseService from "./nurse.service.js";
import { AppError } from "../../utils/AppError.js";

export async function searchNursesHandler(req: Request, res: Response) {
  const query = searchNursesQuerySchema.parse(req.query);
  const nurses = await nurseService.searchNurses(query);
  res.json(nurses);
}

export async function getNurseHandler(req: Request, res: Response) {
  const nurse = await nurseService.getProfileById(req.params.id);
  res.json(nurse);
}

export async function getMyProfileHandler(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const profile = await nurseService.getMyProfile(req.user.id);
  res.json(profile);
}

export async function upsertMyProfileHandler(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const input = upsertNurseProfileSchema.parse(req.body);
  const profile = await nurseService.upsertMyProfile(req.user.id, input);
  res.json(profile);
}

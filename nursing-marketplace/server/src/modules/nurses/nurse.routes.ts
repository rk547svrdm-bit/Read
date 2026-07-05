import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import {
  searchNursesHandler,
  getNurseHandler,
  getMyProfileHandler,
  upsertMyProfileHandler,
} from "./nurse.controller.js";

export const nurseRouter = Router();

// Directory pubblica (nessuna autenticazione richiesta), stile vetrina eBay.
nurseRouter.get("/", asyncHandler(searchNursesHandler));

nurseRouter.get("/me", requireAuth, requireRole("NURSE"), asyncHandler(getMyProfileHandler));
nurseRouter.put("/me", requireAuth, requireRole("NURSE"), asyncHandler(upsertMyProfileHandler));

nurseRouter.get("/:id", asyncHandler(getNurseHandler));

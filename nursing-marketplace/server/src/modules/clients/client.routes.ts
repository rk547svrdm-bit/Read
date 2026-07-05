import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { getMyProfileHandler, upsertMyProfileHandler } from "./client.controller.js";

export const clientRouter = Router();

clientRouter.get("/me", requireAuth, requireRole("CLIENT"), asyncHandler(getMyProfileHandler));
clientRouter.put("/me", requireAuth, requireRole("CLIENT"), asyncHandler(upsertMyProfileHandler));

import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import {
  searchNursesHandler,
  getNurseHandler,
  getMyProfileHandler,
  upsertMyProfileHandler,
} from "./nurse.controller.js";
import {
  listPublicServicesHandler,
  listMyServicesHandler,
  createServiceHandler,
  updateServiceHandler,
  deleteServiceHandler,
} from "../services/service.controller.js";

export const nurseRouter = Router();

// Directory pubblica (nessuna autenticazione richiesta), stile vetrina social.
nurseRouter.get("/", asyncHandler(searchNursesHandler));

nurseRouter.get("/me", requireAuth, requireRole("NURSE"), asyncHandler(getMyProfileHandler));
nurseRouter.put("/me", requireAuth, requireRole("NURSE"), asyncHandler(upsertMyProfileHandler));

// Catalogo prestazioni del professionista autenticato.
nurseRouter.get("/me/services", requireAuth, requireRole("NURSE"), asyncHandler(listMyServicesHandler));
nurseRouter.post("/me/services", requireAuth, requireRole("NURSE"), asyncHandler(createServiceHandler));
nurseRouter.put(
  "/me/services/:serviceId",
  requireAuth,
  requireRole("NURSE"),
  asyncHandler(updateServiceHandler)
);
nurseRouter.delete(
  "/me/services/:serviceId",
  requireAuth,
  requireRole("NURSE"),
  asyncHandler(deleteServiceHandler)
);

nurseRouter.get("/:id", asyncHandler(getNurseHandler));
nurseRouter.get("/:id/services", asyncHandler(listPublicServicesHandler));

import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { updateDocumentStatusHandler } from "./document.controller.js";

export const documentRouter = Router();

// Coda di revisione admin: approva/rifiuta i documenti caricati dagli infermieri.
documentRouter.patch(
  "/:documentId",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(updateDocumentStatusHandler)
);

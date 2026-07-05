import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getUserReviewsHandler } from "./review.controller.js";

export const reviewRouter = Router();

// Le recensioni ricevute da un utente (infermiere o cliente) sono pubbliche.
reviewRouter.get("/users/:userId", asyncHandler(getUserReviewsHandler));

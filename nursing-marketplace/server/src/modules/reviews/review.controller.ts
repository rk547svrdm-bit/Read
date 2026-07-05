import type { Request, Response } from "express";
import { createReviewSchema } from "./review.schemas.js";
import * as reviewService from "./review.service.js";
import { AppError } from "../../utils/AppError.js";

export async function createReviewHandler(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const input = createReviewSchema.parse(req.body);
  const review = await reviewService.createReview(req.params.id, req.user.id, input);
  res.status(201).json(review);
}

export async function getUserReviewsHandler(req: Request, res: Response) {
  const reviews = await reviewService.getReviewsForUser(req.params.userId);
  res.json(reviews);
}

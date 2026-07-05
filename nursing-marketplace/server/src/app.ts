import express from "express";
import cors from "cors";
import { authRouter } from "./modules/auth/auth.routes.js";
import { nurseRouter } from "./modules/nurses/nurse.routes.js";
import { clientRouter } from "./modules/clients/client.routes.js";
import { auctionRouter } from "./modules/auctions/auction.routes.js";
import { bookingRouter } from "./modules/bookings/booking.routes.js";
import { reviewRouter } from "./modules/reviews/review.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  app.use("/auth", authRouter);
  app.use("/nurses", nurseRouter);
  app.use("/clients", clientRouter);
  app.use("/auctions", auctionRouter);
  app.use("/bookings", bookingRouter);
  app.use("/reviews", reviewRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

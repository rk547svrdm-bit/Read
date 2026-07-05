import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { registerHandler, loginHandler } from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/register", asyncHandler(registerHandler));
authRouter.post("/login", asyncHandler(loginHandler));

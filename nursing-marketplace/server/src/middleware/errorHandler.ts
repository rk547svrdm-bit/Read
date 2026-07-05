import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: "Dati non validi", details: err.flatten() });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message, details: err.details });
  }

  console.error(err);
  return res.status(500).json({ error: "Errore interno del server" });
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: "Endpoint non trovato" });
}

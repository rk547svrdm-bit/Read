import type { NextFunction, Request, Response } from "express";
import { verifyAuthToken } from "../lib/jwt.js";
import { AppError } from "../utils/AppError.js";
import type { Role } from "../constants.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string; role: Role; email: string };
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw AppError.unauthorized();
  }

  const token = header.slice("Bearer ".length);
  try {
    const payload = verifyAuthToken(token);
    req.user = { id: payload.sub, role: payload.role, email: payload.email };
    next();
  } catch {
    throw AppError.unauthorized("Token non valido o scaduto");
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw AppError.unauthorized();
    if (!roles.includes(req.user.role)) {
      throw AppError.forbidden(`Richiesto uno dei ruoli: ${roles.join(", ")}`);
    }
    next();
  };
}

/** Popola req.user se presente un token valido, senza richiederlo. */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      const payload = verifyAuthToken(header.slice("Bearer ".length));
      req.user = { id: payload.sub, role: payload.role, email: payload.email };
    } catch {
      // token assente/non valido: si prosegue come utente anonimo
    }
  }
  next();
}

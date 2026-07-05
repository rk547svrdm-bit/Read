import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { Role } from "../constants.js";

export interface AuthTokenPayload {
  sub: string;
  role: Role;
  email: string;
}

export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn as any });
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  return jwt.verify(token, env.jwtSecret) as AuthTokenPayload;
}

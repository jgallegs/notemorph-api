// src/middleware/authApiKey.ts
import { Request, Response, NextFunction } from "express";

const API_KEY = process.env.INTERNAL_API_KEY;

export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  if (!API_KEY) {
    console.warn(
      "[requireApiKey] INTERNAL_API_KEY no está definido. Se permite todo (modo inseguro)."
    );
    return next();
  }

  const incomingKey =
    req.header("x-api-key") || req.header("X-API-Key") || "";

  if (!incomingKey || incomingKey !== API_KEY) {
    return res.status(401).json({ error: "No autorizado" });
  }

  next();
}

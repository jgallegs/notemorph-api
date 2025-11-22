// src/middlewares/billingGuard.ts
import {Request, Response, NextFunction} from "express";

export function billingGuard(req: Request, res: Response, next: NextFunction) {
  // Futuro:
  // - leer usuario desde auth (JWT/cookie)
  // - mirar plan en DB
  // - mirar contador de usos / día
  // De momento, solo logueamos
  console.log("[billingGuard] Uso de endpoint OCR→DOCX (sin limitar aún)");
  next();
}

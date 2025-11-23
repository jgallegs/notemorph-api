// src/middleware/billingGuard.ts
import { Request, Response, NextFunction } from "express";

export function billingGuard(req: Request, res: Response, next: NextFunction) {
  console.log("[billingGuard] Uso de endpoint OCR→DOCX (sin limitar aún)");
  // Aquí en el futuro:
  // - mirar usuario
  // - leer plan
  // - comprobar créditos / cuotas
  next();
}

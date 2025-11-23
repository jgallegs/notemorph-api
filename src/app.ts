// src/app.ts
import express from "express";
import cors from "cors";
import convertRoutes from "./routes/convert.routes";
import notesRoutes from "./routes/notes.routes";

const app = express();

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "*";

app.use(
  cors({
    origin: FRONTEND_ORIGIN === "*" ? "*" : FRONTEND_ORIGIN.split(","),
  })
);

app.use(express.json());

// Healthcheck simple
app.get("/health", (_req, res) => {
  res.json({ status: "ok", env: process.env.NODE_ENV || "dev" });
});

// Prefijo de API (si quieres que sea /api/convert, cambia aquí)
app.use("/convert", convertRoutes);
app.use("/notes", notesRoutes);

export default app;

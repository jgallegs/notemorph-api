import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

//app.use(cors());
app.use(express.json());

// Healthcheck
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", env: process.env.NODE_ENV || "dev" });
});

// Aquí más adelante irán tus endpoints de conversión
// /api/convert/basic
// /api/convert/intelligent

app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});

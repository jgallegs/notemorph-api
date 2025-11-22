import { Router } from "express";
import path from "path";
import fs from "fs/promises";
import { uploadPdf } from "../middleware/upload";
import { pdfToDocx } from "../services/pdfToDock.service";

const router = Router();

/**
 * POST /convert/pdf-to-docx
 * Body: multipart/form-data con campo "file" (PDF)
 */
router.post(
  "/pdf-to-docx",
  uploadPdf.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Falta el archivo PDF (campo 'file')" });
      }

      console.log("Archivo recibido:", {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        path: req.file.path,
        size: req.file.size
      });

      const inputPath = req.file.path;

      const outputPath = await pdfToDocx(inputPath);

      const fileName = path.basename(outputPath);
      const fileBuffer = await fs.readFile(outputPath);

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
      res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

      return res.send(fileBuffer);
    } catch (err: any) {
      console.error("Error en conversión PDF→DOCX:", err);
      return res.status(500).json({ error: "Error durante la conversión" });
    }
  }
);

export default router;

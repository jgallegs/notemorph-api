// src/routes/notes.routes.ts
import { Router, Request, Response } from "express";
import { uploadImages } from "../middleware/upload";
import { processNotesImages } from "../services/notes/processNotesImages";
import { requireApiKey } from "../middleware/authApiKey";

const router = Router();

router.post(
  "/ocr-to-docx",
  requireApiKey,
  uploadImages.array("files", 10),
  async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[] | undefined;

      if (!files || !Array.isArray(files) || files.length === 0) {
        console.error("[/notes/ocr-to-docx] req.files vacío o no es array:", req.files);
        return res.status(400).json({ error: "Faltan imágenes (campo 'files')" });
      }

      console.log("[/notes/ocr-to-docx] Nº de imágenes recibidas:", files.length);

      const filePaths = files.map((f) => f.path);
      console.log("[/notes/ocr-to-docx] Rutas de imágenes:", filePaths);

      const result = await processNotesImages(filePaths);

      return res.json({
        previewHtml: result.previewHtml,
        docxFileName: result.docxFileName,
      });
    } catch (err) {
      console.error("Error en OCR→DOCX:", err);
      return res.status(500).json({ error: "Error procesando los apuntes" });
    }
  }
);

export default router;

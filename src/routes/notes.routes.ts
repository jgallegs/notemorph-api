import { Router } from "express";
import { uploadImages } from "../middleware/upload";
import { processNotesImages } from "../services/notes/processNotesImages";

const router = Router();

router.post(
  "/ocr-to-docx",
  uploadImages.array("files", 10),  // 👈 ahora acepta IMÁGENES
  async (req, res) => {
    try {
      if (!req.files || !(req.files instanceof Array) || req.files.length === 0) {
        return res.status(400).json({ error: "Faltan imágenes (campo 'files')" });
      }

      const filePaths = req.files.map((f: any) => f.path);

      const result = await processNotesImages(filePaths);

      return res.json({
        previewHtml: result.previewHtml,
        docxFileName: result.docxFileName,
      });
    } catch (err: any) {
      console.error("Error en OCR→DOCX:", err);
      return res.status(500).json({ error: "Error procesando los apuntes" });
    }
  }
);

export default router;

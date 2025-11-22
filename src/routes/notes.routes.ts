import { Router } from "express";
import { uploadImages } from "../middleware/upload";
import { processNotesImages } from "../services/notes/processNotesImages";
import { requireApiKey } from "../middleware/authApiKey";

const router = Router();

router.post(
  "/ocr-to-docx",
  requireApiKey,                      // ⬅️ aquí
  uploadImages.array("files", 10),
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
    } catch (err) {
      console.error("Error en OCR→DOCX:", err);
      return res.status(500).json({ error: "Error procesando los apuntes" });
    }
  }
);

export default router;

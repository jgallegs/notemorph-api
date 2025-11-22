// src/services/notes/processNotesImages.ts
import {runOcrOnImages} from "../ocr/ocrProvider";
import {normalizeNotesWithAI} from "./normalizeNotesWithAI";
import {exportNotesToDocx} from "./exportNotesToDocx";
import { generatePreviewHtmlFromStructured } from "./preview";

export async function processNotesImages(imagePaths: string[]) {
  // 1) OCR
  const rawText = await runOcrOnImages(imagePaths);

  // 2) IA: corregir + estructurar
  const structured = await normalizeNotesWithAI(rawText);

  // 3) Export a DOCX
  const {docxPath, docxFileName} = await exportNotesToDocx(structured);

  // 4) Generar preview HTML (o Markdown → HTML)
  const previewHtml = generatePreviewHtmlFromStructured(structured);

  return {
    previewHtml,
    docxPath,
    docxFileName
  };
}

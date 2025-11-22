// src/services/ocr/ocrProvider.ts
import Tesseract from "tesseract.js"; // o node-tesseract-ocr

export async function runOcrOnImages(imagePaths: string[]): Promise<string> {
  let fullText = "";

  for (const [index, imgPath] of imagePaths.entries()) {
    const result = await Tesseract.recognize(imgPath, "spa+eng"); // por ej. español+inglés
    fullText += `\n\n--- PAGE ${index + 1} ---\n\n`;
    fullText += result.data.text;
  }

  return fullText;
}

import path from "path";
import fs from "fs/promises";
import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  TextRun,
} from "docx";
import { randomUUID } from "crypto";
import { NotesDocument } from "./types";

export async function exportNotesToDocx(doc: NotesDocument) {
  const paragraphs: Paragraph[] = [];

  // Título general
  if (doc.title) {
    paragraphs.push(
      new Paragraph({
        text: doc.title,
        heading: HeadingLevel.TITLE,
      })
    );
    paragraphs.push(new Paragraph("")); // espacio
  }

  for (const section of doc.sections) {
    // Encabezado de sección
    if (section.heading) {
      const headingLevel =
        section.level === 1
          ? HeadingLevel.HEADING_1
          : section.level === 2
          ? HeadingLevel.HEADING_2
          : HeadingLevel.HEADING_3;

      paragraphs.push(
        new Paragraph({
          text: section.heading,
          heading: headingLevel,
        })
      );
      paragraphs.push(new Paragraph("")); // un pequeño espacio tras el heading
    }

    // Contenido de la sección: lo convertimos a párrafos y listas
    const contentParagraphs = buildParagraphsFromContent(section.content);
    paragraphs.push(...contentParagraphs);

    // Espacio entre secciones
    paragraphs.push(new Paragraph(""));
  }

  const docx = new Document({
    sections: [{ properties: {}, children: paragraphs }],
  });

  const buffer = await Packer.toBuffer(docx);

  const id = randomUUID();
  const fileName = `notemorph-notes-${id}.docx`;
  const outputDir = path.join(process.cwd(), "uploads", "generated");
  await fs.mkdir(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, fileName);

  await fs.writeFile(outputPath, buffer);

  return { docxPath: outputPath, docxFileName: fileName };
}

/**
 * Convierte el texto de una sección en una lista de Paragraph:
 * - detecta bullets (• o - al inicio)
 * - respeta saltos de línea
 * - separa varias viñetas en una misma línea
 */
function buildParagraphsFromContent(content: string): Paragraph[] {
  const result: Paragraph[] = [];

  if (!content) return result;

  // 1) Separamos por líneas
  const rawLines = content.split(/\r?\n/);

  // 2) También separamos líneas que tienen varias "•" en una sola
  const logicalLines: string[] = [];

  for (const rawLine of rawLines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.includes("•")) {
      // Split conservación de "•" al inicio de cada elemento
      const parts = line
        .split("•")
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      for (const p of parts) {
        logicalLines.push(`• ${p}`);
      }
    } else {
      logicalLines.push(line);
    }
  }

  // 3) Para cada línea lógica, decidimos si es viñeta o párrafo normal
  for (const line of logicalLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // ¿Viñeta? (empieza por • o -)
    if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
      const text = trimmed.replace(/^([•\-])\s*/, ""); // quitamos símbolo y espacio

      result.push(
        new Paragraph({
          children: [new TextRun(text)],
          bullet: {
            level: 0,
          },
        })
      );
    } else {
      // Párrafo normal
      result.push(
        new Paragraph({
          children: [new TextRun(trimmed)],
        })
      );
    }
  }

  return result;
}

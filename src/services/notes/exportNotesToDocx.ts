// src/services/notes/exportNotesToDocx.ts
import path from "path";
import fs from "fs/promises";
import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from "docx";
import { randomUUID } from "crypto";
import { NotesDocument } from "./types";

type Block = Paragraph | Table;

export async function exportNotesToDocx(doc: NotesDocument) {
  const blocks: Block[] = [];

  // Título general
  if (doc.title) {
    blocks.push(
      new Paragraph({
        text: doc.title,
        heading: HeadingLevel.TITLE,
      })
    );
  }

  for (const section of doc.sections) {
    if (section.heading) {
      const level = section.level ?? 1;
      const headingLevel =
        level === 1
          ? HeadingLevel.HEADING_1
          : level === 2
          ? HeadingLevel.HEADING_2
          : HeadingLevel.HEADING_3;

      blocks.push(
        new Paragraph({
          text: section.heading,
          heading: headingLevel,
        })
      );
    }

    const contentBlocks = parseContentToDocxBlocks(section.content ?? "");
    blocks.push(...contentBlocks);
  }

  const docx = new Document({
    sections: [{ children: blocks }],
  });

  const buffer = await Packer.toBuffer(docx);

  const outputDir =
    process.env.NOTES_OUTPUT_DIR || path.join(process.cwd(), "output");
  await fs.mkdir(outputDir, { recursive: true });

  const docxFileName = `notes-${randomUUID()}.docx`;
  const docxPath = path.join(outputDir, docxFileName);

  await fs.writeFile(docxPath, buffer);

  return { docxPath, docxFileName };
}

/**
 * Convierte el contenido plano (con posibles listas/tablas markdown)
 * en bloques de docx (Paragraph y Table).
 */
function parseContentToDocxBlocks(content: string): Block[] {
  const lines = content.split(/\r?\n/);
  const result: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    // Línea vacía → párrafo en blanco
    if (line === "") {
      result.push(new Paragraph({ text: "" }));
      i++;
      continue;
    }

    // Bloque de tabla markdown (líneas con '|')
    if (isTableLine(line)) {
      const tableLines: string[] = [];
      while (i < lines.length && isTableLine(lines[i].trim())) {
        tableLines.push(lines[i].trim());
        i++;
      }
      const table = buildTableFromMarkdown(tableLines);
      result.push(table);
      continue;
    }

    // Lista con viñetas (- o *)
    if (line.match(/^[-*]\s+/)) {
      while (i < lines.length && lines[i].trim().match(/^[-*]\s+/)) {
        const itemText = lines[i].trim().replace(/^[-*]\s+/, "");
        result.push(
          new Paragraph({
            text: itemText,
            bullet: { level: 0 },
          })
        );
        i++;
      }
      continue;
    }

    // Lista numerada simple: "1. algo"
    if (line.match(/^\d+[\.\)]\s+/)) {
      while (i < lines.length && lines[i].trim().match(/^\d+[\.\)]\s+/)) {
        const itemText = lines[i].trim().replace(/^\d+[\.\)]\s+/, "");
        result.push(
          new Paragraph({
            text: itemText,
            bullet: { level: 0 }, // seguimos usando bullet para simplificar
          })
        );
        i++;
      }
      continue;
    }

    // Párrafo normal: podemos juntar líneas consecutivas no vacías
    const paragraphLines = [line];
    i++;
    while (i < lines.length && lines[i].trim() !== "" && !isTableLine(lines[i].trim()) && !lines[i].trim().match(/^[-*]\s+/) && !lines[i].trim().match(/^\d+[\.\)]\s+/)) {
      paragraphLines.push(lines[i].trim());
      i++;
    }

    const paragraphText = paragraphLines.join(" ");
    result.push(
      new Paragraph({
        children: [new TextRun(paragraphText)],
      })
    );
  }

  return result;
}

function isTableLine(line: string): boolean {
  // Consideramos que una línea es de tabla si tiene al menos 2 barras verticales
  const count = (line.match(/\|/g) || []).length;
  return count >= 2;
}

function buildTableFromMarkdown(lines: string[]): Table {
  // Ignoramos la línea de separadores tipo "|---|---|"
  const cleanedLines = lines.filter(
    (l) => !l.match(/^\s*\|?\s*-{2,}.*\|?\s*$/)
  );

  const rows: TableRow[] = cleanedLines.map((line) => {
    // Partimos por "|", quitamos celdas vacías al principio/fin
    const rawCells = line.split("|").map((c) => c.trim());
    const cells = rawCells.filter((c) => c.length > 0);

    const cellNodes = cells.map(
      (cellText) =>
        new TableCell({
          width: { size: 100 / cells.length, type: WidthType.PERCENTAGE },
          children: [new Paragraph(cellText)],
        })
    );

    return new TableRow({ children: cellNodes });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows,
  });
}

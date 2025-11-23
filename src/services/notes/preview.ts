// src/services/notes/preview.ts
import { NotesDocument } from "./types";

export function generatePreviewHtmlFromStructured(doc: NotesDocument): string {
  let html = "";

  if (doc.title) {
    html += `<h1>${escapeHtml(doc.title)}</h1>`;
  }

  for (const section of doc.sections) {
    if (section.heading) {
      const tag =
        section.level === 1 ? "h2" :
        section.level === 2 ? "h3" :
        "h4";
      html += `<${tag}>${escapeHtml(section.heading)}</${tag}>`;
    }

    html += renderContentHtml(section.content ?? "");
  }

  return html;
}

function renderContentHtml(content: string): string {
  const lines = content.split(/\r?\n/);
  let html = "";
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();

    if (line === "") {
      // salto de línea → <br> para no pegar todo
      html += "<br/>";
      i++;
      continue;
    }

    // Tabla markdown
    if (isTableLine(line)) {
      const tableLines: string[] = [];
      while (i < lines.length && isTableLine(lines[i].trim())) {
        tableLines.push(lines[i].trim());
        i++;
      }
      html += buildHtmlTableFromMarkdown(tableLines);
      continue;
    }

    // Lista (- o *)
    if (line.match(/^[-*]\s+/)) {
      html += "<ul>";
      while (i < lines.length && lines[i].trim().match(/^[-*]\s+/)) {
        const itemText = lines[i].trim().replace(/^[-*]\s+/, "");
        html += `<li>${escapeHtml(itemText)}</li>`;
        i++;
      }
      html += "</ul>";
      continue;
    }

    // Lista numerada
    if (line.match(/^\d+[\.\)]\s+/)) {
      html += "<ol>";
      while (i < lines.length && lines[i].trim().match(/^\d+[\.\)]\s+/)) {
        const itemText = lines[i].trim().replace(/^\d+[\.\)]\s+/, "");
        html += `<li>${escapeHtml(itemText)}</li>`;
        i++;
      }
      html += "</ol>";
      continue;
    }

    // Párrafo normal: juntamos líneas
    const paragraphLines = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !isTableLine(lines[i].trim()) &&
      !lines[i].trim().match(/^[-*]\s+/) &&
      !lines[i].trim().match(/^\d+[\.\)]\s+/)
    ) {
      paragraphLines.push(lines[i].trim());
      i++;
    }

    const paragraphText = paragraphLines.join(" ");
    html += `<p>${escapeHtml(paragraphText)}</p>`;
  }

  return html;
}

function isTableLine(line: string): boolean {
  const count = (line.match(/\|/g) || []).length;
  return count >= 2;
}

function buildHtmlTableFromMarkdown(lines: string[]): string {
  const cleanedLines = lines.filter(
    (l) => !l.match(/^\s*\|?\s*-{2,}.*\|?\s*$/)
  );

  if (cleanedLines.length === 0) return "";

  let html = "<table>";

  for (let idx = 0; idx < cleanedLines.length; idx++) {
    const line = cleanedLines[idx];
    const rawCells = line.split("|").map((c) => c.trim());
    const cells = rawCells.filter((c) => c.length > 0);

    if (cells.length === 0) continue;

    html += "<tr>";
    for (const cell of cells) {
      const tag = idx === 0 ? "th" : "td";
      html += `<${tag}>${escapeHtml(cell)}</${tag}>`;
    }
    html += "</tr>";
  }

  html += "</table>";
  return html;
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

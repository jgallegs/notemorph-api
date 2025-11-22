// src/services/notes/preview.ts
import {NotesDocument} from "./types";

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

    // aquí podríamos transformar content en <p>, <ul>, etc.
    const paragraphs = section.content.split("\n");
    for (const p of paragraphs) {
      html += `<p>${escapeHtml(p)}</p>`;
    }
  }

  return html;
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

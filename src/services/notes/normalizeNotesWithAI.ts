import OpenAI from "openai";
import {NotesDocument} from "./types";

export async function normalizeNotesWithAI(rawText: string): Promise<NotesDocument> {
  const apiKey = process.env.OPENAI_API_KEY;

  // Si no hay API key, devolvemos un mock directamente
  if (!apiKey) {
    console.warn("[normalizeNotesWithAI] Sin OPENAI_API_KEY, usando mock.");
    return buildMockNotes(rawText);
  }

  const client = new OpenAI({ apiKey });

  const systemPrompt = `
Eres una IA que limpia y estructura apuntes escaneados desde OCR.

Tienes un texto de entrada con posibles errores, cortes raros, saltos de línea extra, etc.

Tareas:
- Corrige faltas de ortografía y errores obvios de OCR.
- Identifica títulos y subtítulos (niveles 1, 2, 3).
- Agrupa el contenido en secciones coherentes.
- Mantén listas y esquemas (por ejemplo líneas que empiezan por "-" o "•").
- NO inventes contenido nuevo, solo mejora lo que ya está.
- Devuelve SOLO un JSON válido con este formato (sin texto adicional fuera del JSON):

{
  "title": "Título general (si lo hay, si no null)",
  "language": "es" | "en" | null,
  "sections": [
    {
      "heading": "Título sección o null",
      "level": 1,
      "content": "Texto de la sección..."
    }
  ]
}
`.trim();

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Texto OCR:\n"""${rawText}"""` },
      ],
    });

    const message = completion.choices[0]?.message?.content;

    if (!message) {
      console.error("[normalizeNotesWithAI] Respuesta vacía de OpenAI");
      return buildMockNotes(rawText);
    }

    let jsonText: string;

    if (Array.isArray(message)) {
      jsonText = message
        .map((part: any) => (typeof part === "string" ? part : part.text ?? ""))
        .join("");
    } else {
      jsonText = message;
    }

    const parsed = JSON.parse(jsonText) as NotesDocument;
    return parsed;
  } catch (err: any) {
    // 👇 Aquí cazamos el error de cuota / rate limit
    console.error("[normalizeNotesWithAI] Error llamando a OpenAI:", err?.code, err?.status);
    if (err?.status === 429 || err?.code === "insufficient_quota") {
      console.warn("[normalizeNotesWithAI] Sin crédito o rate limited, devolviendo mock.");
      return buildMockNotes(rawText);
    }

    throw err; // otros errores sí que los propagamos
  }
}

function buildMockNotes(rawText: string): NotesDocument {
  return {
    title: null,
    language: "es",
    sections: [
      {
        heading: "Notas sin procesar (mock IA)",
        level: 1,
        content: rawText,
      },
    ],
  };
}

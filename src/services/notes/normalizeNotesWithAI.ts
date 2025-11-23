// src/services/notes/normalizeNotesWithAI.ts
import OpenAI from "openai";
import { NotesDocument } from "./types";

export async function normalizeNotesWithAI(rawText: string): Promise<NotesDocument> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn("[normalizeNotesWithAI] Sin OPENAI_API_KEY, usando mock.");
    return buildMockNotes(rawText);
  }

  const client = new OpenAI({ apiKey });

  const systemPrompt = `
Eres una IA experta en reconstruir apuntes a partir de texto OCR ruidoso.

Objetivo:
- A partir de texto OCR (posiblemente con errores, saltos de línea raros, columnas mezcladas, etc.)
  debes reconstruir unos apuntes LIMPIOS, bien estructurados y legibles.
- Vas a devolver SIEMPRE un JSON con este esquema EXACTO:

{
  "title": string | null,
  "language": "es" | "en" | "mixed" | null,
  "sections": [
    {
      "heading": string | null,
      "level": 1 | 2 | 3 | null,
      "content": string
    },
    ...
  ]
}

Detalles importantes:

1) Páginas:
   - El texto viene con separadores tipo: "--- PAGE 1 ---", "--- PAGE 2 ---".
   - Úsalos sólo para entender el ORDEN, pero NO los incluyas en el contenido final.

2) Limpieza de OCR:
   - Corrige errores evidentes de OCR (palabras cortadas, símbolos raros, espacios en medio de palabras, etc.).
   - Junta líneas que claramente forman una misma frase.
   - Mantén los párrafos razonables, sin cortar cada frase en un párrafo nuevo.

3) Estructura del documento:
   - Detecta títulos y subtítulos y asígnalos a "heading" y "level":
       * level 1 → secciones principales
       * level 2 → subsecciones
       * level 3 → sub-subsecciones
   - Cada sección debe tener su "content" con el texto completo (sin el título dentro del content).

4) Listas:
   - Si detectas puntos tipo:
       - "- algo", "* algo" o "• algo"
     conviértelos en listas usando el prefijo "- " (guion y espacio).
   - Si detectas listas numeradas "1. algo", "2. algo", etc., mantenlas como:
       - "1. algo"
       - "2. algo"
     cada una en su línea.

5) Tablas:
   - Si el contenido sugiere una tabla (por ejemplo, varias líneas con columnas separadas por espacios o alineaciones),
     conviértelas a formato tabla markdown, por ejemplo:

       | Columna 1 | Columna 2 | Columna 3 |
       |-----------|-----------|-----------|
       | Valor 1   | Valor 2   | Valor 3   |

   - No hace falta que la tabla sea perfecta, pero intenta agrupar celdas de forma coherente.

6) Columnas:
   - Si parece que el OCR ha mezclado texto de dos columnas (por ejemplo, repite patrones de encabezados
     o mezcla listas), intenta reordenar y reagrupar el contenido usando el contexto.
   - El objetivo es que el lector humano entienda el contenido en orden lógico.

7) Fórmulas / código:
   - Si hay fórmulas matemáticas o fragmentos de código, respétalos lo máximo posible.
   - Puedes usar \`inline\` o bloques con triple backtick si lo ves útil,
     PERO recuerda que todo debe seguir siendo texto plano dentro de "content".

8) Idioma:
   - En "language" indica "es", "en", "mixed" o null, según predominio del texto.

Muy importante:
- NO devuelvas nada que no sea JSON puro.
- NO incluyas texto explicativo fuera del JSON.
- Si no estás seguro de hacer muchos apartados, es mejor menos secciones pero limpias.
`;

  const userPrompt = `
Este es el texto OCR de varias imágenes de apuntes. Respeta el orden de las páginas,
pero mejora todo lo que puedas para que los apuntes queden claros, ordenados y legibles.

TEXTO_OCR:
"""
${rawText}
"""
`;

  try {
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL_NOTES || "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("Respuesta vacía de la IA");
    }

    const parsed = JSON.parse(content) as NotesDocument;

    // Normalización mínima para evitar undefined
    return {
      title: parsed.title ?? null,
      language: parsed.language ?? null,
      sections: (parsed.sections ?? []).map((s) => ({
        heading: s.heading ?? null,
        level: (s.level as 1 | 2 | 3 | undefined) ?? 1,
        content: s.content ?? "",
      })),
    };
  } catch (err) {
    console.error("[normalizeNotesWithAI] Error llamando a OpenAI:", err);
    return buildMockNotes(rawText);
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

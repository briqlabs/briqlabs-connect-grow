export type DocumentInput = {
  title: string;
  content?: string;
  question?: string;
  answer?: string;
  source_type?: string;
  source_url?: string;
  metadata?: Record<string, unknown>;
};

export type TextChunk = {
  text: string;
  index: number;
  metadata: Record<string, unknown>;
};

const DEFAULT_CHUNK_SIZE = 500;
const DEFAULT_OVERLAP = 100;

export function normalizeDocumentText(input: DocumentInput): string {
  if (input.question || input.answer) {
    return [`Question: ${input.question ?? ""}`, `Answer: ${input.answer ?? ""}`].join("\n").trim();
  }
  return (input.content ?? "").replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();
}

function nextBoundary(text: string, target: number, min: number) {
  const window = text.slice(min, Math.min(text.length, target + 120));
  const boundary = window.search(/(\n\n|\n|[.!?]\s|;\s)/);
  return boundary >= 0 ? min + boundary + 1 : Math.min(text.length, target);
}

export function chunkText(
  text: string,
  metadata: Record<string, unknown> = {},
  chunkSize = DEFAULT_CHUNK_SIZE,
  overlap = DEFAULT_OVERLAP,
): TextChunk[] {
  const cleanText = text.replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (!cleanText) return [];

  const chunks: TextChunk[] = [];
  let start = 0;

  while (start < cleanText.length) {
    const desiredEnd = Math.min(cleanText.length, start + chunkSize);
    const minBoundary = Math.min(cleanText.length, Math.max(start + 250, desiredEnd - 120));
    const end = desiredEnd === cleanText.length ? desiredEnd : nextBoundary(cleanText, desiredEnd, minBoundary);
    const chunk = cleanText.slice(start, end).trim();

    if (chunk) {
      chunks.push({
        text: chunk,
        index: chunks.length,
        metadata: {
          ...metadata,
          chunk_index: chunks.length,
          char_start: start,
          char_end: end,
        },
      });
    }

    if (end >= cleanText.length) break;
    start = Math.max(0, end - overlap);
    while (start > 0 && start < cleanText.length && /\S/.test(cleanText[start - 1]) && /\S/.test(cleanText[start])) {
      start += 1;
      if (start >= end) break;
    }
  }

  return chunks;
}

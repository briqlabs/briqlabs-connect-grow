import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateTextFromParts } from "./llm.ts";

export type BusinessFileRow = {
  id: string;
  file_name: string;
  file_path: string;
  mime_type: string | null;
  file_size: number | null;
  created_at?: string;
};

const TEXT_EXTENSIONS = [".txt", ".md", ".markdown", ".csv", ".json", ".html", ".htm", ".xml", ".yaml", ".yml"];
const GEMINI_EXTRACTION_MAX_BYTES = 18 * 1024 * 1024;

function guessMimeType(fileName: string, fallback?: string | null) {
  if (fallback) return fallback;
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (lower.endsWith(".doc")) return "application/msword";
  if (lower.endsWith(".xlsx")) return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  if (lower.endsWith(".xls")) return "application/vnd.ms-excel";
  if (lower.endsWith(".pptx")) return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".csv")) return "text/csv";
  if (lower.endsWith(".json")) return "application/json";
  if (lower.endsWith(".html") || lower.endsWith(".htm")) return "text/html";
  return "text/plain";
}

function isTextLike(fileName: string, mimeType: string) {
  const lower = fileName.toLowerCase();
  return mimeType.startsWith("text/") ||
    mimeType === "application/json" ||
    mimeType === "application/xml" ||
    TEXT_EXTENSIONS.some((extension) => lower.endsWith(extension));
}

function cleanText(text: string, mimeType: string) {
  const withoutNulls = text.replace(/\u0000/g, " ");
  if (mimeType === "text/html" || mimeType === "application/xhtml+xml") {
    return withoutNulls
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  return withoutNulls.replace(/[ \t]+/g, " ").trim();
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.slice(i, i + chunkSize));
  }
  return btoa(binary);
}

async function extractWithGemini(bytes: Uint8Array, mimeType: string, fileName: string) {
  if (bytes.byteLength > GEMINI_EXTRACTION_MAX_BYTES) {
    throw new Error(`${fileName} is too large for inline AI extraction`);
  }

  return await generateTextFromParts([
    {
      text: [
        "Extract the business knowledge from this uploaded file for a RAG search index.",
        "Return plain text only.",
        "Preserve concrete facts such as prices, services, timings, addresses, policies, contact details, product names, and FAQs.",
        "Do not add explanations, guesses, summaries, or facts that are not present in the file.",
      ].join("\n"),
    },
    {
      inlineData: {
        mimeType,
        data: bytesToBase64(bytes),
      },
    },
  ], { temperature: 0, maxOutputTokens: 8192 });
}

export async function extractBusinessFileText(db: SupabaseClient, row: BusinessFileRow) {
  const { data, error } = await db.storage.from("business-assets").download(row.file_path);
  if (error || !data) throw new Error(`Failed to download ${row.file_name}: ${error?.message ?? "empty file"}`);

  const bytes = new Uint8Array(await data.arrayBuffer());
  const mimeType = guessMimeType(row.file_name, row.mime_type || data.type);
  const text = isTextLike(row.file_name, mimeType)
    ? cleanText(new TextDecoder("utf-8", { fatal: false }).decode(bytes), mimeType)
    : cleanText(await extractWithGemini(bytes, mimeType, row.file_name), "text/plain");

  if (!text || text.length < 10) {
    throw new Error(`No usable text could be extracted from ${row.file_name}`);
  }

  return {
    title: row.file_name,
    content: text,
    source_type: "file",
    source_url: `storage://business-assets/${row.file_path}`,
    metadata: {
      business_file_id: row.id,
      file_name: row.file_name,
      file_path: row.file_path,
      mime_type: mimeType,
      file_size: row.file_size,
      source_table: "business_files",
      created_at: row.created_at ?? null,
    },
  };
}

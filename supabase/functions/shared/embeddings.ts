import { requireEnv, sleep } from "./http.ts";

const DEFAULT_EMBEDDING_MODEL = "gemini-embedding-001";
const DEFAULT_OUTPUT_DIMENSIONS = 768;
const MAX_BATCH_SIZE = 50;

type GeminiEmbeddingResponse = {
  embedding?: { values?: number[] };
  embeddings?: Array<{ values?: number[] }>;
};

function embeddingUrl(model: string, action: "embedContent" | "batchEmbedContents") {
  const apiKey = encodeURIComponent(requireEnv("GEMINI_API_KEY"));
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:${action}?key=${apiKey}`;
}

async function withRetry<T>(operation: () => Promise<T>, label: string, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;
      const delayMs = 250 * 2 ** (attempt - 1);
      console.warn(`${label} failed, retrying`, { attempt, delayMs, error: (error as Error).message });
      await sleep(delayMs);
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

function assertEmbedding(values: unknown, label: string): number[] {
  if (!Array.isArray(values) || values.length !== DEFAULT_OUTPUT_DIMENSIONS) {
    throw new Error(`${label} returned invalid embedding dimensions`);
  }
  return values.map((value) => Number(value));
}

export async function embedText(text: string, taskType = "RETRIEVAL_QUERY"): Promise<number[]> {
  const [embedding] = await embedTexts([text], taskType);
  return embedding;
}

export async function embedTexts(texts: string[], taskType = "RETRIEVAL_DOCUMENT"): Promise<number[][]> {
  const model = Deno.env.get("GEMINI_EMBEDDING_MODEL") ?? DEFAULT_EMBEDDING_MODEL;
  const normalized = texts.map((text) => text.trim()).filter(Boolean);
  if (normalized.length === 0) return [];

  const batches: string[][] = [];
  for (let i = 0; i < normalized.length; i += MAX_BATCH_SIZE) {
    batches.push(normalized.slice(i, i + MAX_BATCH_SIZE));
  }

  const embeddings: number[][] = [];
  for (const batch of batches) {
    const data = await withRetry(async () => {
      const resp = await fetch(embeddingUrl(model, "batchEmbedContents"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: batch.map((text) => ({
            model: `models/${model}`,
            content: { parts: [{ text }] },
            taskType,
            outputDimensionality: DEFAULT_OUTPUT_DIMENSIONS,
          })),
        }),
      });
      if (!resp.ok) {
        throw new Error(`Gemini embeddings error ${resp.status}: ${await resp.text()}`);
      }
      return await resp.json() as GeminiEmbeddingResponse;
    }, "Gemini batch embeddings");

    if (!Array.isArray(data.embeddings) || data.embeddings.length !== batch.length) {
      throw new Error("Gemini batch embeddings returned an unexpected response");
    }
    embeddings.push(...data.embeddings.map((item, index) => assertEmbedding(item.values, `Embedding ${index}`)));
  }

  return embeddings;
}

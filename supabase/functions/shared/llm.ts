import { requireEnv, sleep } from "./http.ts";

const DEFAULT_GENERATION_MODEL = "gemini-1.5-flash";

type GeminiGenerateResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
};

type GeminiPart = {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
};

function generationUrl(model: string) {
  const apiKey = encodeURIComponent(requireEnv("GEMINI_API_KEY"));
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
}

async function withRetry<T>(operation: () => Promise<T>, label: string, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;
      const delayMs = 350 * 2 ** (attempt - 1);
      console.warn(`${label} failed, retrying`, { attempt, delayMs, error: (error as Error).message });
      await sleep(delayMs);
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

export async function generateText(prompt: string, options: { temperature?: number; maxOutputTokens?: number } = {}) {
  return generateTextFromParts([{ text: prompt }], options);
}

export async function generateTextFromParts(parts: GeminiPart[], options: { temperature?: number; maxOutputTokens?: number } = {}) {
  const model = Deno.env.get("GEMINI_MODEL") ?? DEFAULT_GENERATION_MODEL;
  const data = await withRetry(async () => {
    const resp = await fetch(generationUrl(model), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: {
          temperature: options.temperature ?? 0.2,
          maxOutputTokens: options.maxOutputTokens ?? 512,
        },
      }),
    });
    if (!resp.ok) throw new Error(`Gemini generation error ${resp.status}: ${await resp.text()}`);
    return await resp.json() as GeminiGenerateResponse;
  }, "Gemini generation");

  const answer = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
  if (!answer) throw new Error("Gemini returned an empty response");
  return answer;
}

export async function generateJson<T>(prompt: string, fallback: T): Promise<T> {
  const raw = await generateText(prompt, { temperature: 0, maxOutputTokens: 256 });
  const jsonText = raw.match(/\{[\s\S]*\}/)?.[0] ?? raw;
  try {
    return JSON.parse(jsonText) as T;
  } catch (error) {
    console.warn("Failed to parse Gemini JSON response", { raw, error: (error as Error).message });
    return fallback;
  }
}

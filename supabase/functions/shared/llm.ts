import { requireEnv, sleep } from "./http.ts";

const DEFAULT_NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";
const DEFAULT_NVIDIA_MODEL = "nvidia/llama-3.3-nemotron-super-49b-v1.5";
const DEFAULT_GEMINI_EXTRACTION_MODEL = "gemini-1.5-flash";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatContentPart = {
  type?: string;
  text?: string;
};

type NvidiaChoice = {
  text?: string;
  message?: {
    role?: string;
    content?: string | ChatContentPart[] | null;
    reasoning?: string;
    refusal?: string | null;
  };
};

type NvidiaChatResponse = {
  choices?: NvidiaChoice[];
};

type ContentPart = {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
};

type GeminiGenerateResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
};

function nvidiaApiKey() {
  const value = Deno.env.get("NVIDIA_API_KEY") ?? Deno.env.get("NVIDIA_NIM_API_KEY");
  if (!value) {
    console.error("Missing NVIDIA API key - checked NVIDIA_API_KEY and NVIDIA_NIM_API_KEY");
    throw new Error("Missing required environment variable: NVIDIA_API_KEY or NVIDIA_NIM_API_KEY");
  }
  return value;
}

function nvidiaChatUrl() {
  const baseUrl = Deno.env.get("NVIDIA_BASE_URL") ?? DEFAULT_NVIDIA_BASE_URL;
  const url = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;
  console.log("NVIDIA chat endpoint", { url });
  return url;
}

function nvidiaModel() {
  const model = Deno.env.get("NVIDIA_CHAT_MODEL") ?? Deno.env.get("NVIDIA_MODEL") ?? DEFAULT_NVIDIA_MODEL;
  console.log("NVIDIA model", { model });
  return model;
}

function geminiExtractionUrl(model: string) {
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

function extractTextContent(choice: NvidiaChoice) {
  const message = choice.message;
  if (!message) return "";
  
  // First try to get content (normal response)
  const messageContent = message.content;
  if (typeof messageContent === "string" && messageContent) {
    return messageContent.trim();
  }
  if (Array.isArray(messageContent)) {
    const text = messageContent
      .map((part) => part.text ?? "")
      .join("")
      .trim();
    if (text) return text;
  }
  
  // If content is null/empty but reasoning exists, use that
  if (!messageContent && message.reasoning) {
    return message.reasoning.trim();
  }
  
  // Fallback to text field if available
  return choice.text?.trim() ?? "";
}

async function generateNvidiaChat(
  messages: ChatMessage[],
  options: { temperature?: number; maxOutputTokens?: number } = {},
) {
  const model = nvidiaModel();
  const apiUrl = nvidiaChatUrl();
  
  console.log("NVIDIA request", {
    url: apiUrl,
    model,
    messagesCount: messages.length,
    firstMessage: messages[0],
  });

  const data = await withRetry(async () => {
    const resp = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${nvidiaApiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? 0.2,
        max_tokens: options.maxOutputTokens ?? 512,
        stream: false,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("NVIDIA API non-OK response", { status: resp.status, body: text.slice(0, 500) });
      throw new Error(`NVIDIA API error ${resp.status}: ${text.slice(0, 200)}`);
    }
    return await resp.json() as NvidiaChatResponse;
  }, "NVIDIA generation");

  console.log("NVIDIA response received", { 
    choicesLength: data.choices?.length,
    firstChoice: JSON.stringify(data.choices?.[0])?.slice(0, 500),
  });

  const answer = data.choices?.map(extractTextContent).find(Boolean);
  if (!answer) {
    console.error("No answer extracted from NVIDIA response", {
      fullResponse: JSON.stringify(data).slice(0, 500),
    });
    throw new Error(`NVIDIA returned an empty response. Choices: ${data.choices?.length ?? 0}`);
  }
  return answer;
}

async function generateGeminiFromParts(
  parts: ContentPart[],
  options: { temperature?: number; maxOutputTokens?: number } = {},
) {
  const model = Deno.env.get("GEMINI_EXTRACTION_MODEL") ?? Deno.env.get("GEMINI_MODEL") ?? DEFAULT_GEMINI_EXTRACTION_MODEL;
  const data = await withRetry(async () => {
    const resp = await fetch(geminiExtractionUrl(model), {
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
    if (!resp.ok) throw new Error(`Gemini extraction error ${resp.status}: ${await resp.text()}`);
    return await resp.json() as GeminiGenerateResponse;
  }, "Gemini extraction");

  const answer = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
  if (!answer) throw new Error("Gemini extraction returned an empty response");
  return answer;
}

export async function generateText(prompt: string, options: { temperature?: number; maxOutputTokens?: number } = {}) {
  return await generateNvidiaChat([{ role: "user", content: prompt }], options);
}

export async function generateTextFromParts(parts: ContentPart[], options: { temperature?: number; maxOutputTokens?: number } = {}) {
  const hasInlineData = parts.some((part) => part.inlineData);
  if (hasInlineData) {
    return await generateGeminiFromParts(parts, options);
  }

  return await generateText(parts.map((part) => part.text ?? "").join("\n"), options);
}

export async function generateJson<T>(prompt: string, fallback: T): Promise<T> {
  try {
    console.log("Generating JSON with prompt length", { length: prompt.length });
    const raw = await generateText(prompt, { temperature: 0, maxOutputTokens: 256 });
    console.log("Raw JSON generation response", { 
      responseLength: raw.length, 
      firstChars: raw.slice(0, 100),
    });
    const jsonText = raw.match(/\{[\s\S]*\}/)?.[0] ?? raw;
    console.log("Extracted JSON text", {
      extractedLength: jsonText.length,
      hasOpenBrace: jsonText.includes("{"),
      hasCloseBrace: jsonText.includes("}"),
    });
    const parsed = JSON.parse(jsonText) as T;
    console.log("Successfully parsed JSON response");
    return parsed;
  } catch (error) {
    console.warn("Failed to parse NVIDIA JSON response", { 
      error: (error as Error).message,
      fallbackUsed: true,
      fallbackValue: JSON.stringify(fallback),
    });
    return fallback;
  }
}

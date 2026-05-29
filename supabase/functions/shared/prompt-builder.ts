import type { ChatMessage } from "./memory.ts";
import { formatMemory } from "./memory.ts";
import type { RetrievedChunk } from "./vector-search.ts";

const SYSTEM_PROMPT = `You are Briqlabs AI assistant for this business.

Answer ONLY using the provided business context.

If the answer is not found in the context, say:
"I could not find that information."

Do not hallucinate.
Do not invent pricing, policies, timings, or services.`;

export function buildRagPrompt(params: {
  question: string;
  chunks: RetrievedChunk[];
  memory: ChatMessage[];
}) {
  const context = params.chunks
    .map((chunk, index) => {
      const source = typeof chunk.metadata?.title === "string" ? `Source: ${chunk.metadata.title}` : "Source: Business knowledge";
      return `[${index + 1}] ${source}\n${chunk.chunk_text}`;
    })
    .join("\n\n");

  const prompt = [
    SYSTEM_PROMPT,
    "",
    "BUSINESS CONTEXT:",
    context || "No matching business context was found.",
    "",
    "RECENT CONVERSATION:",
    formatMemory(params.memory) || "No previous conversation.",
    "",
    `CUSTOMER QUESTION: ${params.question}`,
    "",
    "Return only the final WhatsApp reply text. Keep it concise, clear, and grounded in the context.",
  ].join("\n");

  console.log("RAG prompt built", {
    promptLength: prompt.length,
    contextLength: context.length,
    chunksCount: params.chunks.length,
    memorySize: params.memory.length,
  });

  return prompt;
}

export const fallbackAnswer = "I could not find that information. Please contact the business directly.";

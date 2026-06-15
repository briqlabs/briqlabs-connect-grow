import type { ChatMessage } from "./memory.ts";
import { formatMemory } from "./memory.ts";
import type { RetrievedChunk } from "./vector-search.ts";

const DEFAULT_SYSTEM_PROMPT = `You are Briqlabs AI assistant for this business.

Answer ONLY using the provided business context.

If the answer is not found in the context, say:
"I could not find that information."

Do not hallucinate.
Do not invent pricing, policies, timings, or services.`;

const DEFAULT_GREETING_SYSTEM_PROMPT = `You are Briqlabs AI assistant for this business.

The customer has sent a greeting. Respond warmly and briefly with a greeting back.
Then offer help - ask how you can assist them today or invite them to ask about the business.

Keep the response concise and friendly (1-2 sentences max).`;

export function isGreeting(message: string): boolean {
  const lowerMessage = message.toLowerCase().trim();
  
  // Common greeting patterns
  const greetingPatterns = [
    /^(hi|hello|hey|greetings|good morning|good afternoon|good evening|what's up|yo|hey there)[\s!?]*$/,
    /^(hi|hello|hey)\s+there[\s!?]*$/,
    /^(howdy|namaste|salaam)[\s!?]*$/,
  ];
  
  return greetingPatterns.some(pattern => pattern.test(lowerMessage));
}

export function buildGreetingPrompt(params: {
  question: string;
  memory: ChatMessage[];
  businessPrompt?: string;
}) {
  const systemPrompt = params.businessPrompt
    ? `${params.businessPrompt}\n\nIMPORTANT: The customer has sent a greeting. Respond warmly and briefly, then offer to help. Keep it concise (1-2 sentences max).`
    : DEFAULT_GREETING_SYSTEM_PROMPT;

  const prompt = [
    systemPrompt,
    "",
    "RECENT CONVERSATION:",
    formatMemory(params.memory) || "No previous conversation.",
    "",
    `CUSTOMER MESSAGE: ${params.question}`,
    "",
    "Respond warmly and offer assistance.",
  ].join("\n");

  console.log("Greeting prompt built", {
    promptLength: prompt.length,
    memorySize: params.memory.length,
    hasBusinessPrompt: Boolean(params.businessPrompt),
  });

  return prompt;
}

export function buildRagPrompt(params: {
  question: string;
  chunks: RetrievedChunk[];
  memory: ChatMessage[];
  businessPrompt?: string;
}) {
  const context = params.chunks
    .map((chunk, index) => {
      const source = typeof chunk.metadata?.title === "string" ? `Source: ${chunk.metadata.title}` : "Source: Business knowledge";
      return `[${index + 1}] ${source}\n${chunk.chunk_text}`;
    })
    .join("\n\n");

  const systemPrompt = params.businessPrompt ?? DEFAULT_SYSTEM_PROMPT;

  const prompt = [
    systemPrompt,
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
    hasBusinessPrompt: Boolean(params.businessPrompt),
  });

  return prompt;
}

export const fallbackAnswer = "I could not find that information. Please contact the business directly.";

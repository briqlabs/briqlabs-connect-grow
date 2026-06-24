import type { ChatMessage } from "./memory.ts";
import { formatMemory } from "./memory.ts";
import type { RetrievedChunk } from "./vector-search.ts";

export interface BusinessProfile {
  business_name: string;
  business_role: string;
  personality: string[];
  customer_interactions: string[];
  answering_guidelines: string[];
  not_available_response: string;
  appointments_info: string;
  products_info: string;
  pricing_info: string;
  communication_style: string[];
  escalation_guidelines: string[];
  business_details: string;
}

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

/**
 * Build comprehensive system prompt from detailed business profile
 * This creates a rich, detailed prompt based on the business configuration
 */
export function buildDetailedSystemPrompt(profile: BusinessProfile): string {
  const sections: string[] = [];

  // Role and business info
  sections.push(`${profile.business_role}\n`);
  
  // Personality section
  if (profile.personality && profile.personality.length > 0) {
    sections.push("PERSONALITY");
    sections.push(profile.personality.map((p) => `• ${p}`).join("\n"));
    sections.push("");
  }

  // Customer interactions
  if (profile.customer_interactions && profile.customer_interactions.length > 0) {
    sections.push("CUSTOMER INTERACTIONS");
    sections.push(profile.customer_interactions.map((ci) => `• ${ci}`).join("\n"));
    sections.push("");
  }

  // Answering guidelines
  if (profile.answering_guidelines && profile.answering_guidelines.length > 0) {
    sections.push("ANSWERING QUESTIONS");
    sections.push(profile.answering_guidelines.map((ag) => `• ${ag}`).join("\n"));
    sections.push("");
  }

  // Not available response
  if (profile.not_available_response) {
    sections.push("WHEN INFORMATION IS NOT AVAILABLE");
    sections.push(`If you do not have enough information to answer a question, respond with:\n"${profile.not_available_response}"\n`);
    sections.push("Do not guess, assume, or make up information.\n");
  }

  // Appointments and bookings
  if (profile.appointments_info) {
    sections.push("APPOINTMENTS AND BOOKINGS");
    sections.push(profile.appointments_info);
    sections.push("");
  }

  // Products and services
  if (profile.products_info) {
    sections.push("PRODUCTS AND SERVICES");
    sections.push(profile.products_info);
    sections.push("");
  }

  // Pricing
  if (profile.pricing_info) {
    sections.push("PRICING");
    sections.push(profile.pricing_info);
    sections.push("");
  }

  // Communication style
  if (profile.communication_style && profile.communication_style.length > 0) {
    sections.push("COMMUNICATION STYLE");
    sections.push(profile.communication_style.map((cs) => `• ${cs}`).join("\n"));
    sections.push("");
  }

  // Escalation guidelines
  if (profile.escalation_guidelines && profile.escalation_guidelines.length > 0) {
    sections.push("ESCALATION");
    sections.push(profile.escalation_guidelines.map((eg) => `• ${eg}`).join("\n"));
    sections.push("");
  }

  // Additional business details
  if (profile.business_details) {
    sections.push("BUSINESS DETAILS");
    sections.push(`Business Name: ${profile.business_name}`);
    sections.push(profile.business_details);
  }

  return sections.join("\n");
}

/**
 * Build greeting prompt with business profile context
 */
export function buildDetailedGreetingPrompt(params: {
  question: string;
  memory: ChatMessage[];
  businessProfile?: BusinessProfile;
}) {
  let systemPrompt = DEFAULT_GREETING_SYSTEM_PROMPT;

  if (params.businessProfile) {
    const profilePrompt = buildDetailedSystemPrompt(params.businessProfile);
    systemPrompt = `${profilePrompt}\n\nIMPORTANT: The customer has sent a greeting. Respond warmly and briefly with a greeting back. Then offer help by asking how you can assist them today. Keep the response concise and friendly (1-2 sentences max).`;
  }

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

  console.log("Detailed greeting prompt built", {
    promptLength: prompt.length,
    memorySize: params.memory.length,
    hasBusinessProfile: Boolean(params.businessProfile),
  });

  return prompt;
}

/**
 * Build RAG prompt with business profile context
 */
export function buildDetailedRagPrompt(params: {
  question: string;
  chunks: RetrievedChunk[];
  memory: ChatMessage[];
  businessProfile?: BusinessProfile;
}) {
  const context = params.chunks
    .map((chunk, index) => {
      const source = typeof chunk.metadata?.title === "string" ? `Source: ${chunk.metadata.title}` : "Source: Business knowledge";
      return `[${index + 1}] ${source}\n${chunk.chunk_text}`;
    })
    .join("\n\n");

  let systemPrompt = DEFAULT_SYSTEM_PROMPT;

  if (params.businessProfile) {
    systemPrompt = buildDetailedSystemPrompt(params.businessProfile);
  }

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

  console.log("Detailed RAG prompt built", {
    promptLength: prompt.length,
    contextLength: context.length,
    chunksCount: params.chunks.length,
    memorySize: params.memory.length,
    hasBusinessProfile: Boolean(params.businessProfile),
  });

  return prompt;
}

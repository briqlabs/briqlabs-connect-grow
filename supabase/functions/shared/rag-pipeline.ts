import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { evaluateFaithfulness, logEvaluation } from "./evaluation.ts";
import { generateText } from "./llm.ts";
import { getConversationMemory, storeChatMessage } from "./memory.ts";
import { buildRagPrompt, fallbackAnswer } from "./prompt-builder.ts";
import { retrieveKnowledgeChunks } from "./vector-search.ts";
import { sendEvolutionReply } from "./whatsapp.ts";

export type RagQueryInput = {
  business_id: string;
  message: string;
  customer_phone: string;
  whatsapp_instance?: string;
  send_whatsapp?: boolean;
  match_count?: number;
  match_threshold?: number;
};

export async function processRagQuery(db: SupabaseClient, input: RagQueryInput) {
  const startedAt = Date.now();
  const businessId = input.business_id;
  const customerPhone = input.customer_phone.replace(/\D/g, "");
  const message = input.message.trim();

  if (!businessId) throw new Error("business_id is required");
  if (!customerPhone) throw new Error("customer_phone is required");
  if (!message) throw new Error("message is required");

  await storeChatMessage(db, businessId, customerPhone, "user", message);

  const memory = await getConversationMemory(db, businessId, customerPhone);
  const { chunks, retrievalScore } = await retrieveKnowledgeChunks(db, businessId, message, {
    matchCount: input.match_count ?? 5,
    matchThreshold: input.match_threshold,
  });

  const minScore = Number(Deno.env.get("RAG_MIN_RETRIEVAL_SCORE") ?? 0.58);
  const hasGrounding = chunks.length > 0 && retrievalScore >= minScore;
  let answer = fallbackAnswer;
  let faithfulnessScore = 1;

  if (hasGrounding) {
    const prompt = buildRagPrompt({ question: message, chunks, memory });
    answer = await generateText(prompt, { temperature: 0.15, maxOutputTokens: 512 });
    faithfulnessScore = await evaluateFaithfulness(message, chunks, answer);

    if (faithfulnessScore < Number(Deno.env.get("RAG_MIN_FAITHFULNESS_SCORE") ?? 0.65)) {
      console.warn("Faithfulness score below threshold; using fallback answer", {
        businessId,
        customerPhone,
        faithfulnessScore,
      });
      answer = fallbackAnswer;
    }
  }

  await storeChatMessage(db, businessId, customerPhone, "assistant", answer);

  if (input.send_whatsapp && input.whatsapp_instance) {
    await sendEvolutionReply(input.whatsapp_instance, customerPhone, answer);
  }

  const latencyMs = Date.now() - startedAt;
  await logEvaluation(db, {
    businessId,
    customerPhone,
    question: message,
    chunks,
    answer,
    faithfulnessScore,
    retrievalScore,
    latencyMs,
  });

  return {
    answer,
    retrieved_chunks: chunks,
    retrieval_score: retrievalScore,
    faithfulness_score: faithfulnessScore,
    latency_ms: latencyMs,
    sent_whatsapp: Boolean(input.send_whatsapp && input.whatsapp_instance),
  };
}

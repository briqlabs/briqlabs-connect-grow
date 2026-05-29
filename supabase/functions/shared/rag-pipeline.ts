import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { evaluateFaithfulness, logEvaluation } from "./evaluation.ts";
import { generateText } from "./llm.ts";
import { getConversationMemory, storeChatMessage } from "./memory.ts";
import { buildRagPrompt, fallbackAnswer } from "./prompt-builder.ts";
import { retrieveKnowledgeChunks } from "./vector-search.ts";
import { sendEvolutionReply } from "./whatsapp.ts";
import { completeRagRun, createRagRun, trackError } from "./langsmith.ts";

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

  console.log("RAG query starting", { businessId, customerPhone, message: message.slice(0, 100) });

  // Track query in LangSmith
  let langsmithRunId: string | null = null;
  try {
    // Store user message
    await storeChatMessage(db, businessId, customerPhone, "user", message);

    const memory = await getConversationMemory(db, businessId, customerPhone);
    console.log("Memory retrieved", { memorySize: memory.length });

    const { chunks, retrievalScore } = await retrieveKnowledgeChunks(db, businessId, message, {
      matchCount: input.match_count ?? 5,
      matchThreshold: input.match_threshold,
    });

    console.log("Knowledge chunks retrieved", { 
      chunksCount: chunks.length, 
      retrievalScore,
      hasGrounding: chunks.length > 0,
    });

    // Start LangSmith tracking
    langsmithRunId = await createRagRun({
      businessId,
      question: message,
      chunkCount: chunks.length,
      metadata: {
        customer_phone: customerPhone,
        memory_size: memory.length,
        retrieval_score: retrievalScore,
      },
    });

    //const minScore = Number(Deno.env.get("RAG_MIN_RETRIEVAL_SCORE") ?? 0.2);
    const hasGrounding = chunks.length > 0 //&& retrievalScore >= minScore;
    let answer = fallbackAnswer;
    let faithfulnessScore = 1;

    if (hasGrounding) {
      try {
        console.log("Starting text generation");
        const prompt = buildRagPrompt({ question: message, chunks, memory });
        answer = await generateText(prompt, { temperature: 0.15, maxOutputTokens: 512 });
        console.log("Text generated", { answerLength: answer.length, answer: answer.slice(0, 150) });

        console.log("Starting faithfulness evaluation");
        faithfulnessScore = await evaluateFaithfulness(message, chunks, answer, langsmithRunId ?? undefined);
        console.log("Faithfulness evaluated", { faithfulnessScore });

        const minFaithfulness = Number(Deno.env.get("RAG_MIN_FAITHFULNESS_SCORE") ?? 0.65);
        if (faithfulnessScore < minFaithfulness) {
          console.warn("Faithfulness score below threshold", {
            businessId,
            customerPhone,
            faithfulnessScore,
            minFaithfulness,
            answerLength: answer.length,
            decision: answer.length > 100 ? "keeping_answer" : "using_fallback",
          });
          // Only use fallback if answer is too short; otherwise keep the model's response
          if (answer.length < 100) {
            answer = fallbackAnswer;
          }
        } else {
          console.log("Faithfulness score acceptable", { faithfulnessScore, minFaithfulness });
        }
      } catch (error) {
        console.error("RAG generation or evaluation failed", { 
          error: (error as Error).message,
          stack: (error as Error).stack?.slice(0, 200),
        });
        
        // Track error in LangSmith
        if (langsmithRunId) {
          await trackError({
            runId: langsmithRunId,
            error: (error as Error).message,
            stage: "generation_or_evaluation",
          });
        }
        
        // Even if generation fails, we have retrieved chunks - provide a basic response
        answer = fallbackAnswer;
        faithfulnessScore = 0;
      }
    }

    await storeChatMessage(db, businessId, customerPhone, "assistant", answer);

    if (input.send_whatsapp && input.whatsapp_instance) {
      await sendEvolutionReply(input.whatsapp_instance, customerPhone, answer);
    }

    const latencyMs = Date.now() - startedAt;
    
    // Log to Supabase
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

    // Update LangSmith with final metrics
    await completeRagRun({
      runId: langsmithRunId,
      answer,
      chunks,
      retrievalScore,
      faithfulnessScore,
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
  } catch (error) {
    const errorMsg = (error as Error).message;
    console.error("RAG query failed", { error: errorMsg });
    
    // Track critical error in LangSmith
    if (langsmithRunId) {
      await trackError({
        runId: langsmithRunId,
        error: errorMsg,
        stage: "query_processing",
      });
    }
    
    throw error;
  }
}

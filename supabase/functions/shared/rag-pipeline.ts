import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { evaluateFaithfulness, logEvaluation } from "./evaluation.ts";
import { generateTextWithUsage, calculateApiCost } from "./llm.ts";
import { getConversationMemory, storeChatMessage } from "./memory.ts";
import { buildRagPrompt, buildGreetingPrompt, isGreeting, fallbackAnswer } from "./prompt-builder.ts";
import { retrieveKnowledgeChunks } from "./vector-search.ts";
import { sendEvolutionReply } from "./whatsapp.ts";
import { 
  completeRagRun, 
  createRagRun, 
  trackError,
  createRetrievalRun,
  completeRetrievalRun,
  createGenerationRun,
  completeGenerationRun,
  createEvaluationRun,
  completeEvaluationRun,
} from "./langsmith.ts";

export type RagQueryInput = {
  business_id: string;
  message: string;
  customer_phone: string;
  whatsapp_instance?: string;
  send_whatsapp?: boolean;
  match_count?: number;
  match_threshold?: number;
};

async function getBusinessBotPrompt(db: SupabaseClient, businessId: string): Promise<string | null> {
  try {
    const { data, error } = await db
      .from("ai_bots")
      .select("prompt")
      .eq("user_id", businessId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned - this is expected if no bot is configured
        console.log("No active AI bot configuration found for business");
        return null;
      }
      throw error;
    }

    console.log("Retrieved business bot prompt");
    return data?.prompt ?? null;
  } catch (error) {
    console.warn("Failed to retrieve business bot prompt", { error: (error as Error).message });
    return null;
  }
}

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

    // Fetch business's configured AI bot prompt
    const businessPrompt = await getBusinessBotPrompt(db, businessId);
    console.log("Business bot prompt retrieved", { hasPrompt: Boolean(businessPrompt) });

    // Check if message is a greeting
    const messageIsGreeting = isGreeting(message);
    if (messageIsGreeting) {
      console.log("Detected greeting message, generating greeting response");
      
      try {
        const greetingPrompt = buildGreetingPrompt({ question: message, memory, businessPrompt });
        const result = await generateTextWithUsage(greetingPrompt, { temperature: 0.3, maxOutputTokens: 256 });
        const answer = result.text;
        
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
          chunks: [],
          answer,
          faithfulnessScore: 1,
          retrievalScore: 0,
          latencyMs,
        });

        return {
          answer,
          retrieved_chunks: [],
          retrieval_score: 0,
          faithfulness_score: 1,
          latency_ms: latencyMs,
          sent_whatsapp: Boolean(input.send_whatsapp && input.whatsapp_instance),
        };
      } catch (error) {
        console.error("Greeting generation failed", { 
          error: (error as Error).message,
          stack: (error as Error).stack?.slice(0, 200),
        });
        // Fall through to RAG pipeline if greeting generation fails
      }
    }

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

    // Track retrieval as a child run
    let retrievalRunId: string | null = null;
    if (langsmithRunId) {
      retrievalRunId = await createRetrievalRun({
        parentRunId: langsmithRunId,
        question: message,
        businessId,
      });

      await completeRetrievalRun({
        runId: retrievalRunId,
        chunkCount: chunks.length,
        retrievalScore,
        chunks,
      });
    }

    //const minScore = Number(Deno.env.get("RAG_MIN_RETRIEVAL_SCORE") ?? 0.2);
    const hasGrounding = chunks.length > 0 //&& retrievalScore >= minScore;
    let answer = fallbackAnswer;
    let faithfulnessScore = 1;
    let model: string | undefined;
    let inputTokens: number | undefined;
    let outputTokens: number | undefined;
    let generationRunId: string | null = null;
    let evaluationRunId: string | null = null;
    let totalTokens: number | undefined;
    let costUsd: number | undefined;

    if (hasGrounding) {
      try {
        // Create generation run (child run)
        if (langsmithRunId) {
          generationRunId = await createGenerationRun({
            parentRunId: langsmithRunId,
            question: message,
            chunks,
            businessId,
          });
        }

        console.log("Starting text generation");
        const prompt = buildRagPrompt({ question: message, chunks, memory, businessPrompt });
        const result = await generateTextWithUsage(prompt, { temperature: 0.15, maxOutputTokens: 512 });
        answer = result.text;
        model = result.model;
        
        if (result.usage) {
          inputTokens = result.usage.inputTokens;
          outputTokens = result.usage.outputTokens;
          totalTokens = result.usage.totalTokens;
          costUsd = calculateApiCost(model || "", result.usage);
          console.log("Token usage tracked", { 
            model, 
            inputTokens, 
            outputTokens, 
            totalTokens,
            costUsd: `$${costUsd.toFixed(6)}`,
          });
        }
        
        // Complete generation run with model and token details
        if (generationRunId && model && inputTokens !== undefined && outputTokens !== undefined && totalTokens !== undefined && costUsd !== undefined) {
          await completeGenerationRun({
            runId: generationRunId,
            answer,
            model,
            inputTokens,
            outputTokens,
            totalTokens,
            costUsd,
          });
        }
        
        console.log("Text generated", { answerLength: answer.length, answer: answer.slice(0, 150) });

        console.log("Starting faithfulness evaluation");
        faithfulnessScore = await evaluateFaithfulness(message, chunks, answer, langsmithRunId ?? undefined);
        console.log("Faithfulness evaluated", { faithfulnessScore });

        // Create evaluation run (child run)
        if (langsmithRunId) {
          evaluationRunId = await createEvaluationRun({
            parentRunId: langsmithRunId,
            businessId,
            evaluationType: "faithfulness",
          });

          await completeEvaluationRun({
            runId: evaluationRunId,
            score: faithfulnessScore,
            reasoning: `Faithfulness score for generated response`,
          });
        }

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
      model,
      inputTokens,
      outputTokens,
      totalTokens,
      costUsd,
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

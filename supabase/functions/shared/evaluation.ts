import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateJson } from "./llm.ts";
import type { RetrievedChunk } from "./vector-search.ts";
import { trackEvaluation } from "./langsmith.ts";

type JudgeResult = {
  score: number;
  reason?: string;
};

export async function evaluateFaithfulness(
  question: string,
  chunks: RetrievedChunk[],
  answer: string,
  langsmithRunId?: string,
) {
  if (chunks.length === 0) return 0;

  try {
    const context = chunks.map((chunk, index) => `[${index + 1}] ${chunk.chunk_text}`).join("\n\n");
    const prompt = [
      "Does the generated answer strictly follow the provided context without hallucinating?",
      "Return JSON only: {\"score\": number, \"reason\": string}. Score must be between 0 and 1.",
      "",
      `Question: ${question}`,
      "",
      `Context:\n${context}`,
      "",
      `Generated answer:\n${answer}`,
    ].join("\n");

    const result = await generateJson<JudgeResult>(prompt, { score: 0.5, reason: "Evaluation fallback" });
    const score = Math.max(0, Math.min(1, Number(result.score) || 0.5));
    console.log("Faithfulness evaluation result", { score, reason: result.reason });

    // Track evaluation in LangSmith
    if (langsmithRunId) {
      await trackEvaluation({
        runId: langsmithRunId,
        evaluationType: "faithfulness",
        score,
        reasoning: result.reason,
      });
    }

    return score;
  } catch (error) {
    console.error("Faithfulness evaluation failed", { error: (error as Error).message });
    // Fallback: return a neutral score if evaluation service is down
    return 0.5;
  }
}

export async function logEvaluation(
  db: SupabaseClient,
  params: {
    businessId: string;
    customerPhone?: string;
    question: string;
    chunks: RetrievedChunk[];
    answer: string;
    faithfulnessScore: number;
    retrievalScore: number;
    latencyMs: number;
  },
) {
  const { error } = await db.from("ai_eval_logs").insert({
    business_id: params.businessId,
    customer_phone: params.customerPhone ?? null,
    question: params.question,
    retrieved_chunks: params.chunks,
    generated_answer: params.answer,
    faithfulness_score: params.faithfulnessScore,
    retrieval_score: params.retrievalScore,
    latency_ms: params.latencyMs,
  });
  if (error) console.error("Failed to write AI evaluation log", { error: error.message });
}

import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { embedText } from "./embeddings.ts";

export type RetrievedChunk = {
  id?: string;
  document_id?: string;
  chunk_text: string;
  similarity: number;
  text_rank?: number;
  combined_score?: number;
  metadata: Record<string, unknown>;
};

const DEFAULT_MATCH_THRESHOLD = 0.2;

const EXACT_BOOST_TERMS = [
  "price",
  "pricing",
  "cost",
  "fee",
  "fees",
  "address",
  "location",
  "timing",
  "timings",
  "hours",
  "open",
  "close",
  "service",
  "services",
  "phone",
  "email",
  "contact",
  "website",
  "support",
  "delivery",
  "refund",
  "payment",
  "subscription",
  "plan",
  "plans",
];

function exactBoost(question: string, chunkText: string) {
  const q = question.toLowerCase();
  const c = chunkText.toLowerCase();

  let boost = 0;

  for (const term of EXACT_BOOST_TERMS) {
    if (q.includes(term) && c.includes(term)) {
      boost += 0.08;
    }
  }

  const quoted =
    q.match(/"([^"]+)"/g)?.map((item) => item.replaceAll('"', "")) ?? [];

  for (const phrase of quoted) {
    if (phrase.length > 2 && c.includes(phrase)) {
      boost += 0.15;
    }
  }

  return Math.min(boost, 0.35);
}

export async function retrieveKnowledgeChunks(
  db: SupabaseClient,
  businessId: string,
  question: string,
  options: { matchCount?: number; matchThreshold?: number } = {},
) {
  const matchCount = options.matchCount ?? 10;

  const matchThreshold =
    options.matchThreshold ??
    Number(
      Deno.env.get("RAG_MATCH_THRESHOLD") ??
        DEFAULT_MATCH_THRESHOLD,
    );

  console.log("RAG retrieval started", {
    businessId,
    question,
    matchCount,
    matchThreshold,
  });

  const queryEmbedding = await embedText(
    question,
    "RETRIEVAL_QUERY",
  );

  console.log("Query embedding length", queryEmbedding?.length);

  const { data, error } = await db.rpc(
    "hybrid_match_knowledge_chunks",
    {
      query_embedding: queryEmbedding,
      query_text: question,
      match_threshold: matchThreshold,
      match_count: matchCount,
      business_id: businessId,
    },
  );

  if (error) {
    console.error("Knowledge retrieval RPC failed", error);

    throw new Error(
      `Knowledge retrieval failed: ${error.message}`,
    );
  }

  console.log("Raw RAG matches", data);

  const ranked = ((data ?? []) as RetrievedChunk[])
    .map((chunk) => ({
      ...chunk,
      metadata: chunk.metadata ?? {},
      combined_score:
        (
          chunk.combined_score ??
          chunk.similarity ??
          0
        ) + exactBoost(question, chunk.chunk_text),
    }))
    .sort(
      (a, b) =>
        (b.combined_score ?? 0) -
        (a.combined_score ?? 0),
    )
    .slice(0, matchCount);

  console.log(
    "Final ranked chunks",
    ranked.map((r) => ({
      similarity: r.similarity,
      combined_score: r.combined_score,
      preview: r.chunk_text?.slice(0, 120),
    })),
  );

  return {
    queryEmbedding,
    chunks: ranked,
    retrievalScore:
      ranked.length > 0
        ? ranked.reduce(
            (sum, item) =>
              sum +
              (
                item.combined_score ??
                item.similarity ??
                0
              ),
            0,
          ) / ranked.length
        : 0,
  };
}
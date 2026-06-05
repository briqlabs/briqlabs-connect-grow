const DEFAULT_LANGSMITH_API_URL = "https://api.smith.langchain.com";

interface LangSmithRun {
  id: string;
  name: string;
  run_type: "llm" | "chain" | "tool" | "retriever" | "embedding";
  inputs: Record<string, unknown>;
  outputs?: Record<string, unknown>;
  error?: string;
  start_time: string;
  end_time?: string;
  session_name?: string;
  parent_run_id?: string;
  extra?: Record<string, unknown>;
}

interface LangSmithFeedback {
  run_id: string;
  key: string;
  score?: number | boolean;
  value?: string | Record<string, unknown>;
  comment?: string;
}

function getLangSmithApiKey(): string | null {
  return Deno.env.get("LANGSMITH_API_KEY");
}

function getLangSmithProject(): string {
  return Deno.env.get("LANGSMITH_PROJECT") ?? "briqlabs-rag";
}

function getLangSmithApiUrl(): string {
  return (Deno.env.get("LANGSMITH_ENDPOINT") ?? DEFAULT_LANGSMITH_API_URL).replace(/\/+$/, "");
}

async function makeRequest<T>(
  method: "GET" | "POST" | "PATCH",
  path: string,
  body?: unknown,
): Promise<T | null> {
  const apiKey = getLangSmithApiKey();
  if (!apiKey) {
    console.log("LangSmith API key not configured, skipping");
    return null;
  }

  try {
    const url = `${getLangSmithApiUrl()}${path}`;
    const headers: Record<string, string> = {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    };
    const workspaceId = Deno.env.get("LANGSMITH_WORKSPACE_ID");
    if (workspaceId) headers["x-tenant-id"] = workspaceId;

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      console.error(`LangSmith API error ${response.status}`, {
        path,
        status: response.status,
        statusText: response.statusText,
      });
      return null;
    }

    const responseText = await response.text();
    if (!responseText) return {} as T;
    return JSON.parse(responseText) as T;
  } catch (error) {
    console.error("LangSmith request failed", { error: (error as Error).message, path });
    return null;
  }
}

export async function createRun(params: {
  name: string;
  runType: "llm" | "chain" | "tool" | "retriever";
  inputs: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  parentRunId?: string;
}): Promise<string | null> {
  const runId = crypto.randomUUID();
  const project = getLangSmithProject();

  const run: LangSmithRun = {
    id: runId,
    name: params.name,
    run_type: params.runType,
    inputs: params.inputs,
    start_time: new Date().toISOString(),
    session_name: project,
    parent_run_id: params.parentRunId,
    extra: {
      metadata: {
        business_id: params.metadata?.business_id,
        ...params.metadata,
      },
      ...params.metadata,
    },
  };

  const result = await makeRequest("POST", "/runs", run);

  if (result) {
    console.log("LangSmith run created", { runId, name: params.name });
    return runId;
  }
  return null;
}

export async function updateRun(params: {
  runId: string;
  outputs: Record<string, unknown>;
  status?: "success" | "error";
  error?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const updates: Partial<LangSmithRun> = {
    outputs: params.outputs,
    end_time: new Date().toISOString(),
  };

  if (params.error) {
    updates.error = params.error;
  }

  if (params.metadata) {
    updates.extra = {
      metadata: params.metadata,
    };
  }

  await makeRequest("PATCH", `/runs/${params.runId}`, updates);
  console.log("LangSmith run updated", { 
    runId: params.runId,
    status: params.status,
    hasError: !!params.error,
  });
}

export async function addFeedback(params: {
  runId: string;
  key: string;
  score?: number;
  value?: string;
  comment?: string;
}): Promise<void> {
  const feedback: LangSmithFeedback = {
    run_id: params.runId,
    key: params.key,
    score: params.score,
    value: params.value,
    comment: params.comment,
  };

  await makeRequest("POST", "/feedback", feedback);
  console.log("LangSmith feedback added", {
    runId: params.runId,
    key: params.key,
    score: params.score,
  });
}

export async function createDatasetExample(params: {
  datasetId: string;
  inputs: Record<string, unknown>;
  outputs?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}): Promise<string | null> {
  const project = getLangSmithProject();

  const example = {
    dataset_id: params.datasetId,
    inputs: params.inputs,
    outputs: params.outputs,
    metadata: params.metadata,
  };

  const result = await makeRequest(
    "POST",
    `/datasets/${params.datasetId}/examples?project_name=${encodeURIComponent(project)}`,
    example,
  ) as { id?: string } | null;

  if (result?.id) {
    console.log("LangSmith dataset example created", { exampleId: result.id });
    return result.id;
  }
  return null;
}

export async function createRagRun(params: {
  businessId: string;
  question: string;
  chunkCount?: number;
  metadata?: Record<string, unknown>;
}): Promise<string | null> {
  return await createRun({
    name: "rag-query",
    runType: "chain",
    inputs: {
      question: params.question,
    },
    metadata: {
      business_id: params.businessId,
      chunk_count: params.chunkCount ?? 0,
      ...params.metadata,
    },
  });
}

export async function completeRagRun(params: {
  runId: string | null;
  answer: string;
  chunks: Array<{ chunk_text: string }>;
  retrievalScore: number;
  faithfulnessScore: number;
  latencyMs: number;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  costUsd?: number;
}): Promise<void> {
  const runId = params.runId;
  if (!runId) return;

  await updateRun({
    runId,
    outputs: {
      answer: params.answer,
      chunks_count: params.chunks.length,
      model: params.model,
      input_tokens: params.inputTokens ?? 0,
      output_tokens: params.outputTokens ?? 0,
      total_tokens: params.totalTokens ?? 0,
      cost_usd: params.costUsd ?? 0,
    },
    status: "success",
    metadata: {
      model: params.model,
    },
  });

  // Add retrieval score as separate column
  await addFeedback({
    runId,
    key: "retrieval_score",
    score: params.retrievalScore,
  });

  // Add retrieved chunks count as separate column
  await addFeedback({
    runId,
    key: "chunks_retrieved",
    value: params.chunks.length.toString(),
    comment: params.chunks.map((c) => c.chunk_text.substring(0, 80)).join(" | "),
  });

  // Add retrieved chunks content as separate column
  await addFeedback({
    runId,
    key: "chunks_content",
    value: params.chunks
      .map((chunk, idx) => `[${idx + 1}] ${chunk.chunk_text.substring(0, 150)}`)
      .join("\n"),
  });

  // Add faithfulness score feedback
  await addFeedback({
    runId,
    key: "faithfulness_score",
    score: params.faithfulnessScore,
  });

  // Add latency feedback
  await addFeedback({
    runId,
    key: "latency_ms",
    score: params.latencyMs,
  });

  // Add model information
  if (params.model) {
    await addFeedback({
      runId,
      key: "model",
      value: params.model,
    });
  }

  // Add token metrics
  if (params.inputTokens !== undefined || params.outputTokens !== undefined) {
    await addFeedback({
      runId,
      key: "input_tokens",
      score: params.inputTokens ?? 0,
      comment: `Input tokens: ${params.inputTokens ?? 0}`,
    });

    await addFeedback({
      runId,
      key: "output_tokens",
      score: params.outputTokens ?? 0,
      comment: `Output tokens: ${params.outputTokens ?? 0}`,
    });

    if (params.totalTokens !== undefined) {
      await addFeedback({
        runId,
        key: "total_tokens",
        score: params.totalTokens,
        comment: `Total tokens: ${params.totalTokens}`,
      });
    }
  }

  // Add cost metric
  if (params.costUsd !== undefined && params.costUsd > 0) {
    await addFeedback({
      runId,
      key: "cost_usd",
      score: params.costUsd,
      comment: `Cost: $${params.costUsd.toFixed(6)}`,
    });
  }
}

export async function trackEvaluation(params: {
  runId: string;
  evaluationType: "faithfulness" | "retrieval" | "relevance";
  score: number;
  reasoning?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await addFeedback({
    runId: params.runId,
    key: params.evaluationType,
    score: params.score,
    comment: params.reasoning,
  });

  console.log("LangSmith evaluation tracked", {
    runId: params.runId,
    type: params.evaluationType,
    score: params.score,
  });
}

export async function trackError(params: {
  runId: string;
  error: string;
  stage: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await updateRun({
    runId: params.runId,
    outputs: { stage: params.stage, error: params.error },
    status: "error",
    error: params.error,
  });

  console.log("LangSmith error tracked", {
    runId: params.runId,
    stage: params.stage,
  });
}

export async function createRetrievalRun(params: {
  parentRunId: string;
  question: string;
  businessId: string;
}): Promise<string | null> {
  return await createRun({
    name: "retrieval",
    runType: "retriever",
    inputs: {
      question: params.question,
    },
    metadata: {
      business_id: params.businessId,
    },
    parentRunId: params.parentRunId,
  });
}

export async function completeRetrievalRun(params: {
  runId: string | null;
  chunkCount: number;
  retrievalScore: number;
  chunks: Array<{ chunk_text: string }>;
}): Promise<void> {
  const runId = params.runId;
  if (!runId) return;

  await updateRun({
    runId,
    outputs: {
      chunk_count: params.chunkCount,
      retrieval_score: params.retrievalScore,
      chunks: params.chunks.map((c, idx) => ({
        id: idx + 1,
        text: c.chunk_text.substring(0, 200),
      })),
    },
    status: "success",
  });

  console.log("LangSmith retrieval run completed", {
    runId,
    chunkCount: params.chunkCount,
    retrievalScore: params.retrievalScore,
  });
}

export async function createGenerationRun(params: {
  parentRunId: string;
  question: string;
  chunks: Array<{ chunk_text: string }>;
  businessId: string;
}): Promise<string | null> {
  return await createRun({
    name: "llm-generation",
    runType: "llm",
    inputs: {
      question: params.question,
      chunk_count: params.chunks.length,
    },
    metadata: {
      business_id: params.businessId,
    },
    parentRunId: params.parentRunId,
  });
}

export async function completeGenerationRun(params: {
  runId: string | null;
  answer: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd: number;
}): Promise<void> {
  const runId = params.runId;
  if (!runId) return;

  await updateRun({
    runId,
    outputs: {
      answer: params.answer,
      model: params.model,
      input_tokens: params.inputTokens,
      output_tokens: params.outputTokens,
      total_tokens: params.totalTokens,
      cost_usd: params.costUsd,
    },
    status: "success",
    metadata: {
      model: params.model,
    },
  });

  // Add individual feedback metrics for generation
  await addFeedback({
    runId,
    key: "model",
    value: params.model,
  });

  await addFeedback({
    runId,
    key: "input_tokens",
    score: params.inputTokens,
  });

  await addFeedback({
    runId,
    key: "output_tokens",
    score: params.outputTokens,
  });

  await addFeedback({
    runId,
    key: "total_tokens",
    score: params.totalTokens,
  });

  await addFeedback({
    runId,
    key: "cost_usd",
    score: params.costUsd,
    comment: `Cost: $${params.costUsd.toFixed(6)}`,
  });

  console.log("LangSmith generation run completed", {
    runId,
    model: params.model,
    totalTokens: params.totalTokens,
    costUsd: `$${params.costUsd.toFixed(6)}`,
  });
}

export async function createEvaluationRun(params: {
  parentRunId: string;
  businessId: string;
  evaluationType: "faithfulness";
}): Promise<string | null> {
  return await createRun({
    name: `evaluation-${params.evaluationType}`,
    runType: "tool",
    inputs: {
      type: params.evaluationType,
    },
    metadata: {
      business_id: params.businessId,
    },
    parentRunId: params.parentRunId,
  });
}

export async function completeEvaluationRun(params: {
  runId: string | null;
  score: number;
  reasoning?: string;
}): Promise<void> {
  const runId = params.runId;
  if (!runId) return;

  await updateRun({
    runId,
    outputs: {
      score: params.score,
      reasoning: params.reasoning,
    },
    status: "success",
  });

  console.log("LangSmith evaluation run completed", {
    runId,
    score: params.score,
  });
}

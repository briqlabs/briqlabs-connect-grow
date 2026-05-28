import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireBusinessAccess } from "../shared/auth.ts";
import { corsHeaders, jsonResponse, requireEnv } from "../shared/http.ts";
import { processRagQuery, type RagQueryInput } from "../shared/rag-pipeline.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json().catch(() => null) as RagQueryInput | null;
    if (!body) return jsonResponse({ error: "Invalid JSON payload" }, 400);

    await requireBusinessAccess(req, body.business_id);

    const db = createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"));
    const result = await processRagQuery(db, body);

    return jsonResponse({ ok: true, ...result });
  } catch (error) {
    console.error("query-rag failed", { error: (error as Error).message });
    return jsonResponse({ error: (error as Error).message }, 500);
  }
});

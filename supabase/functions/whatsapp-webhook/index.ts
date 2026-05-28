import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, jsonResponse, requireEnv } from "../shared/http.ts";
import { processRagQuery } from "../shared/rag-pipeline.ts";

type ExtractedMessage = {
  event: string | null;
  instance: string | null;
  remote_jid: string | null;
  message_id: string | null;
  phone_number: string | null;
  message: string | null;
  push_name: string | null;
  from_me: boolean;
  raw_timestamp: number | null;
};

function getByPath(obj: unknown, path: string[]): unknown {
  let cur: unknown = obj;
  for (const key of path) {
    if (!cur || typeof cur !== "object" || !(key in (cur as Record<string, unknown>))) return undefined;
    cur = (cur as Record<string, unknown>)[key];
  }
  return cur;
}

function firstString(body: unknown, candidates: string[][]): string | null {
  for (const path of candidates) {
    const value = getByPath(body, path);
    if (typeof value === "string" && value.trim().length > 0) return value.trim();
  }
  return null;
}

function firstNumber(body: unknown, candidates: string[][]): number | null {
  for (const path of candidates) {
    const value = getByPath(body, path);
    if (typeof value === "number") return value;
    if (typeof value === "string" && value.trim().length > 0) {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) return parsed;
    }
  }
  return null;
}

function normalizePhone(input: string | null): string | null {
  if (!input) return null;
  const jidBase = input.split("@")[0] ?? "";
  const phonePart = jidBase.split(":")[0] ?? "";
  const digits = phonePart.replace(/\D/g, "");
  return digits.length > 0 ? digits : null;
}

function extractEvolutionMessage(payload: unknown): ExtractedMessage {
  const event = firstString(payload, [["event"], ["type"]]);
  const instance = firstString(payload, [["instance"], ["instanceName"], ["data", "instance"]]);

  const remoteJid = firstString(payload, [
    ["data", "key", "remoteJid"],
    ["data", "from"],
    ["sender"],
    ["from"],
    ["key", "remoteJid"],
  ]);

  const message = firstString(payload, [
    ["data", "message", "conversation"],
    ["data", "message", "extendedTextMessage", "text"],
    ["data", "message", "imageMessage", "caption"],
    ["data", "message", "videoMessage", "caption"],
    ["data", "body"],
    ["message"],
    ["text"],
  ]);

  const messageId = firstString(payload, [["data", "key", "id"], ["data", "id"], ["id"]]);

  const pushName = firstString(payload, [
    ["data", "pushName"],
    ["data", "sender", "pushName"],
    ["pushName"],
  ]);

  const fromMeRaw = getByPath(payload, ["data", "key", "fromMe"]);
  const fromMe = typeof fromMeRaw === "boolean" ? fromMeRaw : false;

  const rawTimestamp = firstNumber(payload, [["data", "messageTimestamp"], ["data", "timestamp"], ["timestamp"]]);

  return {
    event,
    instance,
    remote_jid: remoteJid,
    message_id: messageId,
    phone_number: normalizePhone(remoteJid),
    message,
    push_name: pushName,
    from_me: fromMe,
    raw_timestamp: rawTimestamp,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const payload = await req.json().catch(() => null);
    if (!payload || typeof payload !== "object") return jsonResponse({ error: "Invalid JSON payload" }, 400);

    const admin = createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"));
    const extracted = extractEvolutionMessage(payload);

    await admin.from("whatsapp_webhook_messages").insert({
      event: extracted.event,
      instance: extracted.instance,
      message_id: extracted.message_id,
      phone_number: extracted.phone_number,
      message: extracted.message,
      push_name: extracted.push_name,
      from_me: extracted.from_me,
      raw_timestamp: extracted.raw_timestamp,
      payload,
    });

    if (extracted.from_me || !extracted.message || !extracted.instance || !extracted.phone_number) {
      return jsonResponse({ ok: true, skipped: true, reason: "non-actionable webhook", extracted });
    }

    const { data: instanceRow, error: instanceErr } = await admin
      .from("whatsapp_instances")
      .select("user_id,instance_name,status")
      .eq("instance_name", extracted.instance)
      .limit(1)
      .maybeSingle();

    if (instanceErr || !instanceRow?.user_id) {
      return jsonResponse({
        ok: true,
        skipped: true,
        reason: "instance not mapped to user",
        extracted,
        error: instanceErr?.message ?? null,
      });
    }

    const result = await processRagQuery(admin, {
      business_id: instanceRow.user_id,
      customer_phone: extracted.phone_number,
      message: extracted.message,
      whatsapp_instance: extracted.instance,
      send_whatsapp: true,
      match_count: 5,
    });

    return jsonResponse({
      ok: true,
      processed: true,
      extracted,
      user_id: instanceRow.user_id,
      reply_preview: result.answer.slice(0, 280),
      retrieval_score: result.retrieval_score,
      faithfulness_score: result.faithfulness_score,
      latency_ms: result.latency_ms,
    });
  } catch (error) {
    console.error("whatsapp-webhook failed", { error: (error as Error).message });
    return jsonResponse({ error: (error as Error).message }, 500);
  }
});

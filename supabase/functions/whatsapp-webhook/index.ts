import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const EVOLUTION_URL = Deno.env.get("EVOLUTION_API_URL")!;
const EVOLUTION_KEY = Deno.env.get("EVOLUTION_API_KEY")!;
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
const GEMINI_MODEL = Deno.env.get("GEMINI_MODEL") ?? "gemini-1.5-flash";

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

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function evolutionHeaders() {
  return {
    "Content-Type": "application/json",
    apikey: EVOLUTION_KEY,
  };
}

async function callGemini(prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Gemini error ${resp.status}: ${text}`);
  }

  const data = await resp.json();
  const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!answer || typeof answer !== "string") {
    throw new Error("Gemini returned empty response");
  }
  return answer.trim();
}

async function sendEvolutionReply(instance: string, phone: string, text: string) {
  const cleanPhone = phone.replace(/\D/g, "");
  const body = {
    number: cleanPhone,
    text,
    options: { delay: 500 },
  };

  const endpointVariants = [
    `${EVOLUTION_URL}/message/sendText/${instance}`,
    `${EVOLUTION_URL}/message/sendText`,
  ];

  let lastError: string | null = null;

  for (const endpoint of endpointVariants) {
    const payload = endpoint.endsWith("/sendText")
      ? { ...body, instanceName: instance }
      : body;

    const resp = await fetch(endpoint, {
      method: "POST",
      headers: evolutionHeaders(),
      body: JSON.stringify(payload),
    });

    if (resp.ok) return;
    lastError = `Evolution send failed ${resp.status}: ${await resp.text()}`;
  }

  throw new Error(lastError ?? "Evolution send failed");
}

async function buildPromptForUser(admin: ReturnType<typeof createClient>, userId: string, incomingMessage: string) {
  const [{ data: infos }, { data: files }, { data: bots }] = await Promise.all([
    admin.from("business_information").select("name,description").eq("user_id", userId).order("created_at", { ascending: true }),
    admin.from("business_files").select("file_name").eq("user_id", userId).order("created_at", { ascending: true }),
    admin.from("ai_bots").select("name,prompt,is_active").eq("user_id", userId).order("updated_at", { ascending: false }),
  ]);

  const activeBot = (bots ?? []).find((b) => b.is_active) ?? (bots ?? [])[0] ?? null;
  const botInstruction = activeBot?.prompt ?? "You are a helpful business assistant. Respond politely and clearly.";

  const infoText = (infos ?? [])
    .map((item) => `- ${item.name}: ${item.description}`)
    .join("\n");

  const fileText = (files ?? []).map((f) => `- ${f.file_name}`).join("\n");

  return [
    "You are replying to a WhatsApp customer on behalf of a business.",
    "Follow bot instruction strictly and keep responses concise, polite, and actionable.",
    "If answer is not present in business context, say you will connect them with support.",
    "",
    `Bot Name: ${activeBot?.name ?? "Default Bot"}`,
    `Bot Instruction: ${botInstruction}`,
    "",
    "Business Information:",
    infoText || "- No business information provided.",
    "",
    "Business Files (names only):",
    fileText || "- No files uploaded.",
    "",
    `Customer Message: ${incomingMessage}`,
    "",
    "Return only the final WhatsApp reply text.",
  ].join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return json({ error: "Missing Supabase environment variables" }, 500);
    }

    const payload = await req.json().catch(() => null);
    if (!payload || typeof payload !== "object") return json({ error: "Invalid JSON payload" }, 400);

    const extracted = extractEvolutionMessage(payload);

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Save raw webhook event for observability
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

    // Ignore non-customer/empty messages
    if (extracted.from_me || !extracted.message || !extracted.instance || !extracted.phone_number) {
      return json({ ok: true, skipped: true, reason: "non-actionable webhook", extracted });
    }

    const { data: instanceRow, error: instanceErr } = await admin
      .from("whatsapp_instances")
      .select("user_id,instance_name,status")
      .eq("instance_name", extracted.instance)
      .limit(1)
      .maybeSingle();

    if (instanceErr || !instanceRow?.user_id) {
      return json({ ok: true, skipped: true, reason: "instance not mapped to user", extracted, error: instanceErr?.message ?? null });
    }

    if (!EVOLUTION_URL || !EVOLUTION_KEY) {
      return json({ error: "Missing EVOLUTION_API_URL or EVOLUTION_API_KEY" }, 500);
    }

    if (!GEMINI_API_KEY) {
      return json({ error: "Missing GEMINI_API_KEY" }, 500);
    }

    const prompt = await buildPromptForUser(admin, instanceRow.user_id, extracted.message);
    const aiReply = await callGemini(prompt);

    await sendEvolutionReply(extracted.instance, extracted.phone_number, aiReply);

    return json({
      ok: true,
      processed: true,
      extracted,
      user_id: instanceRow.user_id,
      reply_preview: aiReply.slice(0, 280),
    });
  } catch (e) {
    return json({ error: (e as Error).message ?? "Unexpected error" }, 500);
  }
});

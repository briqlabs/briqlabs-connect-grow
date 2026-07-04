// supabase/functions/evolution-whatsapp/index.ts
// Secure proxy between the frontend and the Evolution API running on Railway.
// The EVOLUTION_API_URL and EVOLUTION_API_KEY secrets never leave the server.
//
// Routes (all POST with JSON body):
//   { action: "create_instance" }             → create instance, return QR base64
//   { action: "get_qr" }                      → fetch fresh QR base64
//   { action: "get_status" }                  → return connection status
//   { action: "delete_instance" }             → logout / remove instance

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { resolveWebhookUrl } from "./webhook-utils.ts";

const EVOLUTION_URL = Deno.env.get("EVOLUTION_API_URL")!;   // e.g. https://your-app.up.railway.app
const EVOLUTION_KEY = Deno.env.get("EVOLUTION_API_KEY")!;   // Global API key set in Evolution
const SUPABASE_URL  = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

if (
  !EVOLUTION_URL ||
  !EVOLUTION_KEY ||
  !SUPABASE_URL ||
  !SUPABASE_SERVICE_KEY ||
  !SUPABASE_ANON_KEY
) {
  throw new Error(
    "Missing required environment variables in Supabase Edge Function"
  );
}

const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ── helpers ───────────────────────────────────────────────────────────────────

function evolutionHeaders() {
  return {
    "Content-Type": "application/json",
    "apikey": EVOLUTION_KEY,
  };
}

/** Derive a stable, URL-safe instance name from the user UUID. */
function instanceName(userId: string) {
  // Evolution instance names must be alphanumeric + underscores only.
  return `user_${userId.replace(/-/g, "_")}`;
}

/** Upsert the DB row for this user's instance. */
async function upsertInstance(
  db: ReturnType<typeof createClient>,
  userId: string,
  name: string,
  status: string,
  connectedAt?: string | null,
) {
  await db.from("whatsapp_instances").upsert(
    { user_id: userId, instance_name: name, status, connected_at: connectedAt ?? null },
    { onConflict: "user_id" },
  );
}

// ── Evolution API calls ───────────────────────────────────────────────────────

/** Build a proper URL, avoiding double slashes. */
function buildUrl(path: string): string {
  const baseUrl = EVOLUTION_URL.endsWith("/") ? EVOLUTION_URL.slice(0, -1) : EVOLUTION_URL;
  const pathUrl = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${pathUrl}`;
}

async function evoPost(path: string, body?: unknown) {
  const url = buildUrl(path);
  const r = await fetch(url, {
    method:  "POST",
    headers: evolutionHeaders(),
    body:    body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`Evolution API ${path} → ${r.status}: ${text}`);
  }
  return r.json();
}

async function evoGet(path: string) {
  const url = buildUrl(path);
  const r = await fetch(url, {
    method:  "GET",
    headers: evolutionHeaders(),
  });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`Evolution API ${path} → ${r.status}: ${text}`);
  }
  return r.json();
}

async function evoDelete(path: string) {
  const url = buildUrl(path);
  const r = await fetch(url, {
    method:  "DELETE",
    headers: evolutionHeaders(),
  });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`Evolution API ${path} → ${r.status}: ${text}`);
  }
  return r.json();
}

async function configureWebhook(instanceName: string) {
  const webhookUrl = resolveWebhookUrl({
    SUPABASE_WEBHOOK_URL: Deno.env.get("SUPABASE_WEBHOOK_URL") ?? undefined,
    WHATSAPP_WEBHOOK_URL: Deno.env.get("WHATSAPP_WEBHOOK_URL") ?? undefined,
    SUPABASE_URL: Deno.env.get("SUPABASE_URL") ?? undefined,
  });

  if (!webhookUrl) {
    throw new Error("Unable to resolve a webhook URL for Evolution API");
  }

  const body = {
    webhook: {
      enabled: true,
      url: webhookUrl,
      byEvents: false,
      events: ["MESSAGES_UPSERT"],
      headers: {},
      base64: false,
    },
  };

  await evoPost(`/webhook/set/${instanceName}`, body);
}

async function handleWebhookHealthCheck(userId: string) {
  const name = instanceName(userId);
  const webhookUrl = resolveWebhookUrl({
    SUPABASE_WEBHOOK_URL: Deno.env.get("SUPABASE_WEBHOOK_URL") ?? undefined,
    WHATSAPP_WEBHOOK_URL: Deno.env.get("WHATSAPP_WEBHOOK_URL") ?? undefined,
    SUPABASE_URL: Deno.env.get("SUPABASE_URL") ?? undefined,
  });

  try {
    const current = await evoGet(`/webhook/find/${name}`);
    return {
      instanceName: name,
      configured: Boolean(current && current.enabled),
      webhookUrl,
      current,
    };
  } catch (err) {
    return {
      instanceName: name,
      configured: false,
      webhookUrl,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ── Action handlers ───────────────────────────────────────────────────────────

/**
 * Creates (or re-creates) the Evolution instance for this user and returns a
 * base64-encoded QR code PNG.
 *
 * Evolution v2 endpoint:  POST /instance/create
 * Response contains: instance.instanceName, qrcode.base64
 */
async function handleCreateInstance(db: ReturnType<typeof createClient>, userId: string) {
  const name = instanceName(userId);

  try {
    const statusData = await evoGet(`/instance/connectionState/${name}`);
    const raw: string = (statusData?.instance?.state ?? statusData?.state ?? "close").toString().trim().toLowerCase();
    const connected = raw === "open";
    const status = connected
      ? "connected"
      : raw === "connecting" || raw === "qr" || raw === "qrcode"
        ? "qr_ready"
        : "reconnecting";

    if (raw === "open" || raw === "connecting" || raw === "qr" || raw === "qrcode" || raw === "close") {
      try {
        const qrData = await evoGet(`/instance/connect/${name}`);
        const qrBase64: string | undefined =
          qrData?.base64 ??
          qrData?.qrcode?.base64 ??
          qrData?.qrCode?.base64;

        try {
          await configureWebhook(name);
        } catch (err) {
          console.warn("Failed to configure Evolution webhook on reused instance", err);
        }

        await upsertInstance(db, userId, name, status === "connected" ? "connected" : status === "qr_ready" ? "qr_ready" : "reconnecting");
        return { instanceName: name, qrBase64, reused: true };
      } catch {
        // fall through to create a fresh instance if the existing one cannot be queried
      }
    }
  } catch {
    // no existing instance found; continue with creation below
  }

  // Try to delete any stale instance first (ignore errors — may not exist yet).
  try {
    await evoDelete(`/instance/delete/${name}`);
  } catch (_) { /* no-op */ }

  const body = {
    instanceName: name,
    qrcode:       true,
    integration:  "WHATSAPP-BAILEYS",
  };

  const data = await evoPost("/instance/create", body);

  // Evolution v2 returns qrcode.base64 (a data-URI string like "data:image/png;base64,...")
  const qrBase64: string | undefined =
    data?.qrcode?.base64 ??
    data?.base64 ??
    data?.qrCode?.base64;

  try {
    await configureWebhook(name);
  } catch (err) {
    console.warn("Failed to configure Evolution webhook", err);
  }

  await upsertInstance(db, userId, name, "qr_ready");

  return { instanceName: name, qrBase64, reused: false };
}

/**
 * Fetch a fresh QR without recreating the instance.
 * Evolution v2:  GET /instance/connect/<name>
 */
async function handleGetQr(db: ReturnType<typeof createClient>, userId: string) {
  const name = instanceName(userId);
  const data = await evoGet(`/instance/connect/${name}`);

  const qrBase64: string | undefined =
    data?.base64 ??
    data?.qrcode?.base64 ??
    data?.qrCode?.base64;

  return { qrBase64 };
}

/**
 * Polls the connection state.
 * Evolution v2:  GET /instance/connectionState/<name>
 * Returns one of: open | close | connecting
 */
async function handleGetStatus(db: ReturnType<typeof createClient>, userId: string) {
  const name = instanceName(userId);
  const data = await evoGet(`/instance/connectionState/${name}`);

  const raw: string = (data?.instance?.state ?? data?.state ?? "close").toString().trim().toLowerCase();
  const connected = raw === "open";
  const status = connected
    ? "connected"
    : raw === "connecting" || raw === "qr" || raw === "qrcode"
      ? "qr_ready"
      : "reconnecting";

  if (connected) {
    await upsertInstance(db, userId, name, "connected", new Date().toISOString());
  } else {
    await upsertInstance(db, userId, name, status === "qr_ready" ? "qr_ready" : "reconnecting");
  }

  return { status, connected, raw };
}

/**
 * Logout + delete the instance.
 * Evolution v2:  DELETE /instance/delete/<name>
 */
async function handleDeleteInstance(db: ReturnType<typeof createClient>, userId: string) {
  const name = instanceName(userId);
  try {
    await evoDelete(`/instance/delete/${name}`);
  } catch (_) { /* instance may not exist */ }

  await upsertInstance(db, userId, name, "disconnected");
  return { deleted: true };
}

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json() as { action: string; user_id?: string };
    let userId = "";

    // Preferred: authenticate the caller via Supabase JWT.
    const authHeader = req.headers.get("authorization") ?? "";
    if (authHeader) {
      const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { authorization: authHeader } },
      });
      const { data: { user }, error: authError } = await userClient.auth.getUser();
      if (!authError && user?.id) {
        userId = user.id;
      }
    }

    // Fallback for environments where auth header is not forwarded reliably.
    if (!userId && body.user_id) userId = body.user_id;
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized: missing user context" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service-role client for DB writes.
    const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { action } = body;

    let result: unknown;
    switch (action) {
      case "create_instance":  result = await handleCreateInstance(db, userId); break;
      case "get_qr":           result = await handleGetQr(db, userId);          break;
      case "get_status":       result = await handleGetStatus(db, userId);      break;
      case "delete_instance":  result = await handleDeleteInstance(db, userId); break;
      case "webhook_health":   result = await handleWebhookHealthCheck(userId); break;
      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[evolution-whatsapp]", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

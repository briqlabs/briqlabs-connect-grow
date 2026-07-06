export const DEFAULT_WEBHOOK_PATH = "/functions/v1/whatsapp-webhook";
export const WEBHOOK_EVENTS = ["MESSAGES_UPSERT"];

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

export function resolveWebhookUrl(env: Record<string, string | undefined> = {}): string | null {
  const explicitUrl = env.SUPABASE_WEBHOOK_URL ?? env.WHATSAPP_WEBHOOK_URL;
  if (explicitUrl) {
    return explicitUrl;
  }

  const supabaseUrl = env.SUPABASE_URL;
  if (!supabaseUrl) {
    return null;
  }

  const normalizedUrl = normalizeBaseUrl(supabaseUrl);
  return `${normalizedUrl}${DEFAULT_WEBHOOK_PATH}`;
}

export function buildWebhookConfig(webhookUrl: string) {
  return {
    enabled: true,
    url: webhookUrl,
    byEvents: true,
    events: WEBHOOK_EVENTS,
    headers: {},
    base64: false,
  };
}

export function buildInstanceCreatePayload(instanceName: string, webhookUrl: string | null) {
  const webhook = webhookUrl ? buildWebhookConfig(webhookUrl) : undefined;

  return {
    instanceName,
    qrcode: true,
    integration: "WHATSAPP-BAILEYS",
    ...(webhook ? { webhook } : {}),
    readMessages: true,
    listenMessages: true,
    sendMessages: true,
    markMessagesAsRead: true,
  };
}

export function isWebhookEnabled(response: unknown): boolean {
  if (!response || typeof response !== "object") {
    return false;
  }

  const record = response as Record<string, unknown>;
  if (record.enabled === true) {
    return true;
  }

  const webhook = record.webhook;
  return Boolean(
    webhook &&
      typeof webhook === "object" &&
      (webhook as Record<string, unknown>).enabled === true,
  );
}

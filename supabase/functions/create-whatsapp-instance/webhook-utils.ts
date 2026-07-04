export const DEFAULT_WEBHOOK_PATH = "/functions/v1/whatsapp-webhook";

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

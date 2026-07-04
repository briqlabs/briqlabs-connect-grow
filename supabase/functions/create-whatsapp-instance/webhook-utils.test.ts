import { describe, expect, it } from "vitest";
import { resolveWebhookUrl } from "./webhook-utils.ts";

describe("resolveWebhookUrl", () => {
  it("uses the explicit webhook URL when provided", () => {
    expect(resolveWebhookUrl({ SUPABASE_WEBHOOK_URL: "https://example.com/webhook" })).toBe("https://example.com/webhook");
  });

  it("falls back to the Supabase functions webhook URL", () => {
    expect(resolveWebhookUrl({ SUPABASE_URL: "https://project.supabase.co" })).toBe("https://project.supabase.co/functions/v1/whatsapp-webhook");
  });

  it("returns null when no webhook or Supabase URL is available", () => {
    expect(resolveWebhookUrl({})).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import { buildInstanceCreatePayload, buildWebhookConfig, isWebhookEnabled, resolveWebhookUrl } from "./webhook-utils.ts";

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

  it("builds an enabled webhook config for message upserts", () => {
    expect(buildWebhookConfig("https://project.supabase.co/functions/v1/whatsapp-webhook")).toEqual({
      enabled: true,
      url: "https://project.supabase.co/functions/v1/whatsapp-webhook",
      byEvents: true,
      events: ["MESSAGES_UPSERT"],
      headers: {},
      base64: false,
    });
  });

  it("detects flat and nested enabled webhook responses", () => {
    expect(isWebhookEnabled({ enabled: true })).toBe(true);
    expect(isWebhookEnabled({ webhook: { enabled: true } })).toBe(true);
    expect(isWebhookEnabled({ webhook: { enabled: false } })).toBe(false);
  });

  it("builds an instance payload that enables inbound and outbound message handling", () => {
    expect(buildInstanceCreatePayload("user_123", "https://project.supabase.co/functions/v1/whatsapp-webhook")).toEqual({
      instanceName: "user_123",
      qrcode: true,
      integration: "WHATSAPP-BAILEYS",
      webhook: {
        enabled: true,
        url: "https://project.supabase.co/functions/v1/whatsapp-webhook",
        byEvents: false,
        events: ["MESSAGES_UPSERT"],
        headers: {},
        base64: false,
      },
      readMessages: true,
      listenMessages: true,
      sendMessages: true,
      markMessagesAsRead: true,
    });
  });
});

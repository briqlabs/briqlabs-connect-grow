import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateText } from "./llm.ts";

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  message: string;
  created_at?: string;
};

export async function storeChatMessage(
  db: SupabaseClient,
  businessId: string,
  customerPhone: string,
  role: ChatMessage["role"],
  message: string,
) {
  const { error } = await db.from("chat_messages").insert({
    business_id: businessId,
    customer_phone: customerPhone,
    role,
    message,
  });
  if (error) throw new Error(`Failed to store chat message: ${error.message}`);
}

export async function getRecentMessages(db: SupabaseClient, businessId: string, customerPhone: string, limit = 10) {
  const { data, error } = await db
    .from("chat_messages")
    .select("role,message,created_at")
    .eq("business_id", businessId)
    .eq("customer_phone", customerPhone)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to retrieve chat memory: ${error.message}`);
  return ((data ?? []) as ChatMessage[]).reverse();
}

export async function getConversationMemory(db: SupabaseClient, businessId: string, customerPhone: string) {
  const messages = await getRecentMessages(db, businessId, customerPhone, 16);
  if (messages.length <= 10) return messages;

  const older = messages.slice(0, messages.length - 10);
  const recent = messages.slice(-10);
  const summaryInput = older.map((item) => `${item.role}: ${item.message}`).join("\n");
  const summary = await generateText([
    "Summarize this older WhatsApp conversation context in under 80 words.",
    "Keep only durable customer preferences, unresolved questions, and facts already stated.",
    "",
    summaryInput,
  ].join("\n"), { temperature: 0, maxOutputTokens: 160 });

  return [{ role: "system" as const, message: `Older conversation summary: ${summary}` }, ...recent];
}

export function formatMemory(messages: ChatMessage[], maxChars = 2500) {
  const formatted = messages.map((item) => `${item.role.toUpperCase()}: ${item.message.trim()}`).join("\n");
  if (formatted.length <= maxChars) return formatted;
  return `Earlier conversation omitted for brevity.\n${formatted.slice(-maxChars)}`;
}

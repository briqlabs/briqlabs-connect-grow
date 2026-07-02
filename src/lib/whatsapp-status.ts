export type EvolutionConnectionState = "connected" | "qr_ready" | "reconnecting" | "error";

export interface NormalizedEvolutionStatus {
  connected: boolean;
  status: EvolutionConnectionState;
  raw: string;
}

export function normalizeEvolutionStatus(rawState: unknown): NormalizedEvolutionStatus {
  const normalized = String(rawState ?? "close").trim().toLowerCase();
  if (normalized === "open") {
    return { connected: true, status: "connected", raw: normalized };
  }

  if (normalized === "connecting" || normalized === "qr" || normalized === "qrcode") {
    return { connected: false, status: "qr_ready", raw: normalized };
  }

  return { connected: false, status: "reconnecting", raw: normalized };
}

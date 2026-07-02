import { describe, expect, it } from "vitest";
import { normalizeEvolutionStatus } from "./whatsapp-status";

describe("normalizeEvolutionStatus", () => {
  it("treats an open state as connected", () => {
    expect(normalizeEvolutionStatus("open")).toEqual({
      connected: true,
      status: "connected",
      raw: "open",
    });
  });

  it("keeps connecting states in a QR flow instead of a hard disconnect", () => {
    expect(normalizeEvolutionStatus("connecting")).toEqual({
      connected: false,
      status: "qr_ready",
      raw: "connecting",
    });
  });

  it("treats close as reconnecting so the UI can recover", () => {
    expect(normalizeEvolutionStatus("close")).toEqual({
      connected: false,
      status: "reconnecting",
      raw: "close",
    });
  });
});

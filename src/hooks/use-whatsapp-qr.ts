// src/hooks/use-whatsapp-qr.ts
// Manages the full lifecycle of connecting a WhatsApp account via Evolution API:
//   1. Create the instance + fetch the initial QR on mount
//   2. Poll connection status every 3 s while waiting for scan
//   3. Expose a refresh() to pull a fresh QR when the old one expires
//   4. Tear down the polling interval on unmount / when connected

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

type ConnectionStatus = "idle" | "loading" | "qr_ready" | "connected" | "error";

interface UseWhatsAppQRResult {
  status: ConnectionStatus;
  /** base64 data-URI of the QR image — e.g. "data:image/png;base64,..." */
  qrBase64: string | null;
  /** True once the phone has scanned and WhatsApp reports state=open */
  connected: boolean;
  error: string | null;
  /** Fetches a fresh QR from Evolution (call when the current one expires) */
  refresh: () => Promise<void>;
}

const POLL_INTERVAL_MS = 3_000;   // check connection status every 3 s
const QR_TTL_MS        = 60_000;  // QR code lifetime before we auto-refresh

async function callEdge(action: string) {
  const res = await supabase.functions.invoke("create-whatsapp-instance", {
    body: { action, userId: "123", },
  });
  if (res.error) throw new Error(res.error.message ?? String(res.error));
  return res.data as Record<string, unknown>;
}

export function useWhatsAppQR(): UseWhatsAppQRResult {
  const [status,    setStatus]    = useState<ConnectionStatus>("idle");
  const [qrBase64,  setQrBase64]  = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const pollRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const qrTimerRef = useRef<ReturnType<typeof setTimeout>  | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current)    { clearInterval(pollRef.current);   pollRef.current    = null; }
    if (qrTimerRef.current) { clearTimeout(qrTimerRef.current); qrTimerRef.current = null; }
  }, []);

  const startPolling = useCallback(() => {
    if (pollRef.current) return;

    pollRef.current = setInterval(async () => {
      try {
        const data = await callEdge("get_status");
        const isConnected  = data.connected as boolean;
        const statusFromApi = data.status as string;

        if (isConnected) {
          setConnected(true);
          setStatus("connected");
          stopPolling();
        } else if (statusFromApi === "disconnected") {
          stopPolling();
          setStatus("error");
          setError("WhatsApp disconnected. Please refresh the QR code.");
        }
      } catch (_) {
        // Network blip — keep polling
      }
    }, POLL_INTERVAL_MS);
  }, [stopPolling]);

 const refresh = useCallback(async () => {
  try {
    setStatus("loading");
    setError(null);
    const data = await callEdge("get_qr");
    const qr = (data.qrBase64 as string) || (data.base64 as string) || null;
    if (qr) {
      setQrBase64(qr);
      setStatus("qr_ready");
      if (qrTimerRef.current) clearTimeout(qrTimerRef.current);
      qrTimerRef.current = setTimeout(() => refresh(), QR_TTL_MS);
    } else {
      setStatus("error");
      setError("QR expired or unavailable. Click refresh to try again.");
    }
  } catch (e) {
    setError(e instanceof Error ? e.message : String(e));
    setStatus("error");
  }
}, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initInstance = useCallback(async () => {
    try {
      setStatus("loading");
      setError(null);
      const data = await callEdge("create_instance");
      const qr = data.qrBase64 as string | undefined;
      if (qr) {
        setQrBase64(qr);
        setStatus("qr_ready");
        if (qrTimerRef.current) clearTimeout(qrTimerRef.current);
        qrTimerRef.current = setTimeout(() => refresh(), QR_TTL_MS);
      } else {
        setStatus("qr_ready");
      }
      startPolling();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus("error");
    }
  }, [startPolling, refresh]);

  useEffect(() => {
    initInstance();
    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { status, qrBase64, connected, error, refresh };
}

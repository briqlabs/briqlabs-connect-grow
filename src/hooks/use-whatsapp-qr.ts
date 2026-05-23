import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

type ConnectionStatus = "idle" | "loading" | "qr_ready" | "connected" | "error";

interface UseWhatsAppQRResult {
  status: ConnectionStatus;
  qrBase64: string | null;
  connected: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const POLL_INTERVAL_MS = 3_000;
const QR_TTL_MS = 60_000;

async function callEdge(action: string) {
  const { data, error } = await supabase.functions.invoke("create-whatsapp-instance", {
    body: { action },
  });

  if (error) {
    const message =
      (error as { context?: { error?: string } })?.context?.error ||
      error.message ||
      "Failed to call create-whatsapp-instance";
    throw new Error(message);
  }

  return (data ?? {}) as Record<string, unknown>;
}

export function useWhatsAppQR(): UseWhatsAppQRResult {
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const qrTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (qrTimerRef.current) {
      clearTimeout(qrTimerRef.current);
      qrTimerRef.current = null;
    }
  }, []);

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

  const startPolling = useCallback(() => {
    if (pollRef.current) return;

    pollRef.current = setInterval(async () => {
      try {
        const data = await callEdge("get_status");
        const isConnected = data.connected as boolean;
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
      } catch {
        // transient network issue, keep polling
      }
    }, POLL_INTERVAL_MS);
  }, [stopPolling]);

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
  }, [refresh, startPolling]);

  useEffect(() => {
    initInstance();
    return () => stopPolling();
  }, [initInstance, stopPolling]);

  return { status, qrBase64, connected, error, refresh };
}
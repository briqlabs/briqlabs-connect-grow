import { useCallback, useEffect, useRef } from "react";

const AI_VOICE_SETTINGS = { pitch: 0.9, rate: 0.95 };
const CUSTOMER_VOICE_SETTINGS = { pitch: 1.1, rate: 1.0 };

export function useSpeech() {
  const utterancesRef = useRef<SpeechSynthesisUtterance[]>([]);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    utterancesRef.current = [];
  }, []);

  const speak = useCallback((text: string, speaker: "AI" | "Customer" = "AI", delay = 0) => {
    if (!window.speechSynthesis) return;

    const clean = text.replace(/[✅📅]/g, "");
    const utter = new SpeechSynthesisUtterance(clean);
    const settings = speaker === "AI" ? AI_VOICE_SETTINGS : CUSTOMER_VOICE_SETTINGS;
    utter.pitch = settings.pitch;
    utter.rate = settings.rate;
    utter.volume = 0.8;

    // Try to pick different voices for AI vs Customer
    const voices = window.speechSynthesis.getVoices();
    const enVoices = voices.filter(v => v.lang.startsWith("en"));
    if (enVoices.length > 1) {
      utter.voice = speaker === "AI" ? enVoices[0] : enVoices[1];
    } else if (enVoices.length === 1) {
      utter.voice = enVoices[0];
    }

    utterancesRef.current.push(utter);

    if (delay > 0) {
      setTimeout(() => window.speechSynthesis.speak(utter), delay);
    } else {
      window.speechSynthesis.speak(utter);
    }
  }, []);

  // Preload voices
  useEffect(() => {
    window.speechSynthesis?.getVoices();
    const handler = () => window.speechSynthesis?.getVoices();
    window.speechSynthesis?.addEventListener?.("voiceschanged", handler);
    return () => {
      window.speechSynthesis?.removeEventListener?.("voiceschanged", handler);
    };
  }, []);

  return { speak, stop };
}

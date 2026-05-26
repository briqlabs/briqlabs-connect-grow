import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type Language = "hinglish" | "en" | "hi";

const LANGUAGE_KEY = "briqlabs-language";

const labels: Record<Language, string> = {
  hinglish: "Hinglish",
  en: "English",
  hi: "हिन्दी",
};

const shortLabels: Record<Language, string> = {
  hinglish: "Hin",
  en: "EN",
  hi: "हिं",
};

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  cycleLanguage: () => void;
  label: string;
  shortLabel: string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const isLanguage = (value: string | null): value is Language =>
  value === "hinglish" || value === "en" || value === "hi";

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === "undefined") return "hinglish";
    const stored = window.localStorage.getItem(LANGUAGE_KEY);
    return isLanguage(stored) ? stored : "hinglish";
  });

  useEffect(() => {
    document.documentElement.lang = language === "hi" ? "hi" : "en";
    window.localStorage.setItem(LANGUAGE_KEY, language);
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => {
    const setLanguage = (next: Language) => setLanguageState(next);
    const cycleLanguage = () => {
      setLanguageState((current) =>
        current === "hinglish" ? "en" : current === "en" ? "hi" : "hinglish",
      );
    };

    return {
      language,
      setLanguage,
      cycleLanguage,
      label: labels[language],
      shortLabel: shortLabels[language],
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};

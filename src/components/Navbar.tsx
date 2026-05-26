import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { LeadFormOpener } from "@/pages/Index";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/hooks/use-language";

const copy = {
  hinglish: {
    useCases: "Use cases",
    faq: "FAQ",
    voiceSoon: "Voice AI · soon",
    cta: "Start free trial",
    languageHint: "Choose your language",
    dismissHint: "Dismiss language hint",
  },
  en: {
    useCases: "Use cases",
    faq: "FAQ",
    voiceSoon: "Voice AI · soon",
    cta: "Start free trial",
    languageHint: "Choose your language",
    dismissHint: "Dismiss language hint",
  },
  hi: {
    useCases: "उपयोग",
    faq: "सवाल-जवाब",
    voiceSoon: "Voice AI · जल्द",
    cta: "फ्री ट्रायल शुरू करें",
    languageHint: "अपनी भाषा चुनें",
    dismissHint: "Language hint बंद करें",
  },
};

const Navbar = ({ openForm }: { openForm: LeadFormOpener }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLanguageHint, setShowLanguageHint] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.localStorage.getItem("briqlabs-language-hint-dismissed") !== "true";
  });
  const location = useLocation();
  const { language } = useLanguage();
  const t = copy[language];
  const showHomepageLanguageHint = location.pathname === "/" && showLanguageHint;

  const dismissLanguageHint = () => {
    setShowLanguageHint(false);
    window.localStorage.setItem("briqlabs-language-hint-dismissed", "true");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto flex items-center justify-between h-16 px-6">
        <a href="/" className="flex items-center gap-2 group">
          <div className="relative px-3 py-1.5 rounded-xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center font-display font-extrabold text-primary-foreground text-base tracking-tight shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow duration-300">
            <span className="relative z-10">Briqlabs</span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <span className="font-display font-extrabold text-xl tracking-tight text-primary">AI</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          <a href="#use-cases" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.useCases}</a>
          <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.faq}</a>
          <span className="text-xs px-2 py-0.5 rounded-full bg-accent/15 text-accent">{t.voiceSoon}</span>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <div className="relative">
            <LanguageToggle />
            <AnimatePresence>
              {showHomepageLanguageHint && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 top-11 w-48 rounded-lg border border-primary/20 bg-popover p-3 text-popover-foreground shadow-xl shadow-primary/10"
                >
                  <div className="absolute -top-1.5 right-5 h-3 w-3 rotate-45 border-l border-t border-primary/20 bg-popover" />
                  <button
                    type="button"
                    aria-label={t.dismissHint}
                    onClick={dismissLanguageHint}
                    className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                  >
                    <X size={13} />
                  </button>
                  <p className="pr-5 text-xs font-medium leading-relaxed">{t.languageHint}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <ThemeToggle />
          <Button variant="hero" size="sm" onClick={() => openForm("Start Free Trial")}>{t.cta}</Button>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-border"
          >
            <div className="flex flex-col gap-4 p-6">
              <a href="#use-cases" className="text-sm text-muted-foreground hover:text-foreground">{t.useCases}</a>
              <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground">{t.faq}</a>
              <div className="flex items-center gap-3">
                <LanguageToggle />
                <ThemeToggle />
                <Button variant="hero" size="sm" onClick={() => { openForm("Start Free Trial"); setMobileOpen(false); }}>{t.cta}</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

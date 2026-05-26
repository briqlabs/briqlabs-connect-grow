import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, ShieldCheck } from "lucide-react";
import type { LeadFormOpener } from "@/pages/Index";
import type { Vertical } from "./ChatMockup";
import ChatMockup from "./ChatMockup";
import { useLanguage } from "@/hooks/use-language";

const copy = {
  hinglish: {
    eyebrow: "WhatsApp AI Agent for Indian SMBs",
    titleStart: "Apne WhatsApp ko bana do",
    titleHighlight: "24×7 sales agent",
    bodyStart: "AI agent chats handle karega, leads qualify karega, aur appointments book karega —",
    bodyStrong: "aap business pe focus karo.",
    cta: "Start 14-day free trial",
    noCard: "No credit card",
    langs: "Hindi · English · Hinglish",
    try: "Try a sample chat for your business",
    verticals: [
      ["coaching", "Coaching & EdTech"],
      ["realestate", "Real Estate"],
      ["clinics", "Clinics & Salons"],
      ["interior", "Interior Designers"],
    ] as Array<[Vertical, string]>,
  },
  en: {
    eyebrow: "WhatsApp AI Agent for Indian SMBs",
    titleStart: "Turn your WhatsApp into a",
    titleHighlight: "24/7 sales agent",
    bodyStart: "Your AI agent handles chats, qualifies leads, and books appointments, so",
    bodyStrong: "you can focus on the business.",
    cta: "Start 14-day free trial",
    noCard: "No credit card",
    langs: "Hindi · English · Hinglish",
    try: "Try a sample chat for your business",
    verticals: [
      ["coaching", "Coaching & EdTech"],
      ["realestate", "Real Estate"],
      ["clinics", "Clinics & Salons"],
      ["interior", "Interior Designers"],
    ] as Array<[Vertical, string]>,
  },
  hi: {
    eyebrow: "भारतीय SMBs के लिए WhatsApp AI एजेंट",
    titleStart: "अपने WhatsApp को बनाइए",
    titleHighlight: "24×7 सेल्स एजेंट",
    bodyStart: "AI एजेंट चैट संभालेगा, लीड्स qualify करेगा और appointments book करेगा —",
    bodyStrong: "आप बिजनेस पर फोकस करें.",
    cta: "14 दिन का फ्री ट्रायल शुरू करें",
    noCard: "क्रेडिट कार्ड नहीं चाहिए",
    langs: "हिन्दी · English · Hinglish",
    try: "अपने बिजनेस के लिए sample chat देखें",
    verticals: [
      ["coaching", "Coaching & EdTech"],
      ["realestate", "Real Estate"],
      ["clinics", "Clinics & Salons"],
      ["interior", "Interior Designers"],
    ] as Array<[Vertical, string]>,
  },
};

export default function HeroSectionV2({
  openForm,
  vertical,
  setVertical,
}: {
  openForm: LeadFormOpener;
  vertical: Vertical;
  setVertical: (v: Vertical) => void;
}) {
  const { language } = useLanguage();
  const t = copy[language];

  return (
    <section className="relative min-h-screen flex items-center hero-glow overflow-hidden pt-24 pb-16">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary/5 blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/5 blur-3xl animate-float" style={{ animationDelay: "3s" }} />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass mb-6 text-xs text-muted-foreground">
              <MessageCircle size={12} className="text-primary" />
              {t.eyebrow}
            </div>

            <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight mb-5">
              {t.titleStart}{" "}
              <span className="gradient-text">{t.titleHighlight}</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">
              {t.bodyStart} <strong className="text-foreground">{t.bodyStrong}</strong>
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-8">
              <Button variant="hero" size="lg" className="text-base px-7 py-6" onClick={() => openForm("Start Free Trial")}>
                {t.cta} <ArrowRight size={18} />
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-primary" /> {t.noCard}</span>
              <span>· {t.langs}</span>
            </div>

            <div className="mt-8">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">{t.try}</p>
              <div className="flex flex-wrap gap-2">
                {t.verticals.map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => setVertical(id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      vertical === id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.15 }}>
            <ChatMockup vertical={vertical} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

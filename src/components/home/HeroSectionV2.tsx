import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, ShieldCheck } from "lucide-react";
import type { LeadFormOpener } from "@/pages/Index";
import type { Vertical } from "./ChatMockup";
import ChatMockup from "./ChatMockup";
import { VERTICALS } from "./VerticalsSection";

export default function HeroSectionV2({
  openForm,
  vertical,
  setVertical,
}: {
  openForm: LeadFormOpener;
  vertical: Vertical;
  setVertical: (v: Vertical) => void;
}) {
  return (
    <section className="relative min-h-screen flex items-center hero-glow overflow-hidden pt-24 pb-16">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary/5 blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/5 blur-3xl animate-float" style={{ animationDelay: "3s" }} />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass mb-6 text-xs text-muted-foreground">
              <MessageCircle size={12} className="text-primary" />
              WhatsApp AI Agent for Indian SMBs
            </div>

            <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight mb-5">
              Apne WhatsApp ko bana do{" "}
              <span className="gradient-text">24×7 sales agent</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">
              AI agent chats handle karega, leads qualify karega, aur appointments book karega — <strong className="text-foreground">aap business pe focus karo.</strong>
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-8">
              <Button variant="hero" size="lg" className="text-base px-7 py-6" onClick={() => openForm("Start Free Trial")}>
                Start 14-day free trial <ArrowRight size={18} />
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-primary" /> No credit card</span>
              <span>· Hindi · English · Hinglish</span>
            </div>

            <div className="mt-8">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Try a sample chat for your business</p>
              <div className="flex flex-wrap gap-2">
                {VERTICALS.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVertical(v.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      vertical === v.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {v.label}
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

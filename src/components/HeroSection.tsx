import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Bot } from "lucide-react";
import { Sparkles } from "lucide-react";
import type { LeadFormOpener } from "@/pages/Index";

const HeroSection = ({ openForm }: { openForm: LeadFormOpener }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center hero-glow overflow-hidden pt-16">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary/5 blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/5 blur-3xl animate-float" style={{ animationDelay: "3s" }} />

      <div className="container mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 text-sm text-muted-foreground">
            <Sparkles size={14} className="text-primary" />
            AI-Powered Business Automation
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6">
            Automate Your Business With{" "}
            <span className="gradient-text">Intelligent AI</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            From WhatsApp lead generation to Voice AI receptionists — Briqlabs AI agents work 24/7 so you never miss an opportunity.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="lg" className="text-base px-8 py-6" onClick={() => openForm("Start Free Trial")}>
              Start Free Trial
              <ArrowRight size={18} />
            </Button>
            <Button variant="hero-outline" size="lg" className="text-base px-8 py-6" onClick={() => openForm("Book a Demo")}>
              <Bot size={18} />
              Watch Demo
            </Button>
          </div>

          <div className="mt-16 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary/80" />
              99.9% Uptime
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              500+ Businesses
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              24/7 Active
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;

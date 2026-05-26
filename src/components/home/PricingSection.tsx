import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import type { LeadFormOpener } from "@/pages/Index";

const FEATURES = [
  "Unlimited WhatsApp chats",
  "AI agent with Hindi/English/Hinglish",
  "Lead qualification + auto follow-ups",
  "Appointment booking + reminders",
  "CRM / Google Sheet sync",
  "GST invoice + priority support",
];

export default function PricingSection({ openForm }: { openForm: LeadFormOpener }) {
  return (
    <section id="pricing" className="py-20 md:py-28 bg-muted/20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">Simple Pricing</p>
          <h2 className="text-3xl md:text-5xl font-display font-bold">
            Ek plan. <span className="gradient-text">Sab kuch included.</span>
          </h2>
          <p className="text-muted-foreground mt-4">14 din free trial — no credit card needed.</p>
        </div>

        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl border-2 border-primary bg-gradient-to-b from-primary/10 to-card p-8 shadow-xl shadow-primary/20"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-semibold">
              Limited Time
            </div>
            <p className="text-sm font-medium text-primary uppercase tracking-wider">Free Trial</p>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-5xl font-display font-extrabold">₹0</span>
              <span className="text-muted-foreground">/ 14 days</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">No credit card. Full features. Cancel anytime.</p>
            <Button variant="hero" size="lg" className="w-full mt-6" onClick={() => openForm("Start Free Trial")}>
              Start 14-day free trial <ArrowRight size={16} />
            </Button>
            <ul className="mt-6 space-y-2 text-sm">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check size={16} className="text-primary mt-0.5 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

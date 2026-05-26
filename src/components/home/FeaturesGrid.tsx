import { motion } from "framer-motion";
import { MessageSquare, Target, Repeat, CalendarCheck, Database, Languages } from "lucide-react";

const FEATURES = [
  { icon: MessageSquare, title: "Instant Auto-Reply", desc: "Har message ka reply 5 second mein — even 2am ko." },
  { icon: Target, title: "Lead Qualification", desc: "Serious buyers ko identify karta hai, time-wasters filter karta hai." },
  { icon: Repeat, title: "Smart Follow-ups", desc: "Bina spam kiye, sahi time pe follow-up bhejta hai." },
  { icon: CalendarCheck, title: "Appointment Booking", desc: "Calendar dekh ke slot book karta hai. Reminder bhi bhejta hai." },
  { icon: Database, title: "CRM / Sheet Sync", desc: "Har lead Google Sheet ya CRM mein automatic save." },
  { icon: Languages, title: "Hindi · English · Hinglish", desc: "Customer jis bhi language mein likhe, agent samjhta hai." },
];

export default function FeaturesGrid() {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">What it does</p>
          <h2 className="text-3xl md:text-5xl font-display font-bold">
            Sab kuch <span className="gradient-text">automatic</span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-border bg-card p-6 hover:border-primary/40 transition-colors"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Icon size={20} />
                </div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
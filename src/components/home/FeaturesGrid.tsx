import { motion } from "framer-motion";
import { MessageSquare, Target, Repeat, CalendarCheck, Database, Languages } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

const icons = [MessageSquare, Target, Repeat, CalendarCheck, Database, Languages];

const copy = {
  hinglish: {
    eyebrow: "What it does",
    titleStart: "Sab kuch",
    titleHighlight: "automatic",
    features: [
      ["Instant Auto-Reply", "Har message ka reply 5 second mein — even 2am ko."],
      ["Lead Qualification", "Serious buyers ko identify karta hai, time-wasters filter karta hai."],
      ["Smart Follow-ups", "Bina spam kiye, sahi time pe follow-up bhejta hai."],
      ["Appointment Booking", "Calendar dekh ke slot book karta hai. Reminder bhi bhejta hai."],
      ["CRM / Sheet Sync", "Har lead Google Sheet ya CRM mein automatic save."],
      ["Hindi · English · Hinglish", "Customer jis bhi language mein likhe, agent samjhta hai."],
    ],
  },
  en: {
    eyebrow: "What it does",
    titleStart: "Everything",
    titleHighlight: "automatic",
    features: [
      ["Instant Auto-Reply", "Every message gets a reply in 5 seconds, even at 2 AM."],
      ["Lead Qualification", "Identifies serious buyers and filters out low-intent leads."],
      ["Smart Follow-ups", "Follows up at the right time without feeling spammy."],
      ["Appointment Booking", "Checks calendar slots, books appointments, and sends reminders."],
      ["CRM / Sheet Sync", "Every lead is automatically saved to Google Sheets or your CRM."],
      ["Hindi · English · Hinglish", "The agent understands the language your customer uses."],
    ],
  },
  hi: {
    eyebrow: "यह क्या करता है",
    titleStart: "सब कुछ",
    titleHighlight: "ऑटोमैटिक",
    features: [
      ["Instant Auto-Reply", "हर message का reply 5 seconds में — रात 2 बजे भी."],
      ["Lead Qualification", "Serious buyers पहचानता है और low-intent leads filter करता है."],
      ["Smart Follow-ups", "सही समय पर follow-up करता है, बिना spam जैसा लगे."],
      ["Appointment Booking", "Calendar slot देखकर appointment book करता है और reminder भेजता है."],
      ["CRM / Sheet Sync", "हर lead Google Sheet या CRM में automatic save होती है."],
      ["Hindi · English · Hinglish", "Customer जिस language में लिखे, agent समझता है."],
    ],
  },
};

export default function FeaturesGrid() {
  const { language } = useLanguage();
  const t = copy[language];

  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">{t.eyebrow}</p>
          <h2 className="text-3xl md:text-5xl font-display font-bold">
            {t.titleStart} <span className="gradient-text">{t.titleHighlight}</span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {t.features.map(([title, desc], i) => {
            const Icon = icons[i];
            return (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-border bg-card p-6 hover:border-primary/40 transition-colors"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Icon size={20} />
                </div>
                <h3 className="font-semibold mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

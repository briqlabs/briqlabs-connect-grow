import { motion } from "framer-motion";
import { Brain, MessageCircle, Smile } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

const icons = [Brain, MessageCircle, Smile];

const copy = {
  hinglish: {
    eyebrow: "3 Steps · 10 Minutes",
    title: "Setup itna easy hai",
    steps: [
      { title: "Train aur test karo", desc: "Business info, PDFs, ya FAQs daalo. AI bot banao aur live jaane se pehle test chat mein check karo." },
      { title: "WhatsApp connect karo", desc: "Bot ready ho jaaye, phir WhatsApp Business number QR scan se link karo." },
      { title: "Relax", desc: "24×7 agent chats handle karta hai. Aap sirf qualified leads dekho." },
    ],
  },
  en: {
    eyebrow: "3 Steps · 10 Minutes",
    title: "Setup is that easy",
    steps: [
      { title: "Train and test", desc: "Add business info, PDFs, or FAQs. Create the AI bot and test it before going live." },
      { title: "Connect WhatsApp", desc: "Once the bot is ready, link your WhatsApp Business number with a QR scan." },
      { title: "Relax", desc: "The 24/7 agent handles chats while you focus on qualified leads." },
    ],
  },
  hi: {
    eyebrow: "3 स्टेप · 10 मिनट",
    title: "सेटअप इतना आसान है",
    steps: [
      { title: "Train और test करें", desc: "Business info, PDFs या FAQs डालें. AI bot बनाकर live जाने से पहले test chat में check करें." },
      { title: "WhatsApp connect करें", desc: "Bot ready होने के बाद QR scan से WhatsApp Business number link करें." },
      { title: "आराम करें", desc: "24×7 agent chats handle करता है. आप qualified leads पर focus करें." },
    ],
  },
};

export default function HowItWorks() {
  const { language } = useLanguage();
  const t = copy[language];

  return (
    <section className="py-20 md:py-28 bg-muted/20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">{t.eyebrow}</p>
          <h2 className="text-3xl md:text-5xl font-display font-bold">{t.title}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {t.steps.map((s, i) => {
            const Icon = icons[i];
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative rounded-2xl border border-border bg-card p-6"
              >
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground font-display font-extrabold flex items-center justify-center shadow-lg">
                  {i + 1}
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Icon size={22} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
                <p className="text-muted-foreground">{s.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

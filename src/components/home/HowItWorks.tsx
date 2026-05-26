import { motion } from "framer-motion";
import { Link2, Brain, Smile } from "lucide-react";

const STEPS = [
  { icon: Link2, title: "Connect karo", desc: "Apna WhatsApp Business number 5 min mein link karo. QR scan — bas." },
  { icon: Brain, title: "Train karo", desc: "Website link, PDF, ya FAQs daalo. Agent aapke business ko seekh leta hai." },
  { icon: Smile, title: "Relax", desc: "24×7 agent chats handle karta hai. Aap sirf qualified leads dekho." },
];

export default function HowItWorks() {
  return (
    <section className="py-20 md:py-28 bg-muted/20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">3 Steps · 10 Minutes</p>
          <h2 className="text-3xl md:text-5xl font-display font-bold">Setup itna easy hai</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
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

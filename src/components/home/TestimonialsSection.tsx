import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

const copy = {
  hinglish: {
    eyebrow: "SMBs ka pyaar",
    title: "500+ businesses already winning",
    quotes: [
      { name: "Rahul Sharma", biz: "Sharma Coaching · Jaipur", text: "Pehle 30% leads miss ho jaate the. Ab agent 24×7 reply karta hai — admissions 2x ho gaye." },
      { name: "Priya Mehta", biz: "Glow Skin Clinic · Mumbai", text: "Receptionist ko 3 din chuti chahiye thi — agent ne sab appointments handle kar liye. Game changer." },
      { name: "Arjun Singh", biz: "Nest Interiors · Bangalore", text: "Har lead ka instant reply + portfolio share — closure rate 40% badh gaya. Worth every rupee." },
    ],
  },
  en: {
    eyebrow: "Loved by SMBs",
    title: "500+ businesses already winning",
    quotes: [
      { name: "Rahul Sharma", biz: "Sharma Coaching · Jaipur", text: "We used to miss 30% of leads. Now the agent replies 24/7, and admissions have doubled." },
      { name: "Priya Mehta", biz: "Glow Skin Clinic · Mumbai", text: "Our receptionist needed time off, and the agent handled every appointment. Game changer." },
      { name: "Arjun Singh", biz: "Nest Interiors · Bangalore", text: "Instant replies plus portfolio sharing improved our close rate by 40%. Worth every rupee." },
    ],
  },
  hi: {
    eyebrow: "SMBs का भरोसा",
    title: "500+ businesses पहले से जीत रहे हैं",
    quotes: [
      { name: "Rahul Sharma", biz: "Sharma Coaching · Jaipur", text: "पहले 30% leads miss हो जाती थीं. अब agent 24×7 reply करता है — admissions 2x हो गए." },
      { name: "Priya Mehta", biz: "Glow Skin Clinic · Mumbai", text: "Receptionist को छुट्टी चाहिए थी, agent ने सारे appointments handle कर लिए. Game changer." },
      { name: "Arjun Singh", biz: "Nest Interiors · Bangalore", text: "Instant reply और portfolio share से closure rate 40% बढ़ गया. पूरा पैसा वसूल." },
    ],
  },
};

export default function TestimonialsSection() {
  const { language } = useLanguage();
  const t = copy[language];

  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">{t.eyebrow}</p>
          <h2 className="text-3xl md:text-5xl font-display font-bold">{t.title}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {t.quotes.map((q, i) => (
            <motion.div
              key={q.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex gap-0.5 mb-3 text-amber-400">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={16} fill="currentColor" />
                ))}
              </div>
              <p className="text-foreground/90 italic">"{q.text}"</p>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="font-semibold">{q.name}</p>
                <p className="text-xs text-muted-foreground">{q.biz}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

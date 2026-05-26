import { motion } from "framer-motion";
import { Star } from "lucide-react";

const QUOTES = [
  { name: "Rahul Sharma", biz: "Sharma Coaching · Jaipur", text: "Pehle 30% leads miss ho jaate the. Ab agent 24×7 reply karta hai — admissions 2x ho gaye." },
  { name: "Priya Mehta", biz: "Glow Skin Clinic · Mumbai", text: "Receptionist ko 3 din chuti chahiye thi — agent ne sab appointments handle kar liye. Game changer." },
  { name: "Arjun Singh", biz: "Nest Interiors · Bangalore", text: "Har lead ka instant reply + portfolio share — closure rate 40% badh gaya. Worth every rupee." },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">SMBs ka pyaar</p>
          <h2 className="text-3xl md:text-5xl font-display font-bold">500+ businesses already winning</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {QUOTES.map((q, i) => (
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

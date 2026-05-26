import { useState } from "react";
import { Phone, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/use-language";

const copy = {
  hinglish: {
    invalid: "Sahi email daaliye",
    success: "Done! Launch hote hi notify karenge 🚀",
    badge: "Coming Soon",
    titleStart: "Voice AI Receptionist —",
    titleHighlight: "jald aa raha hai",
    body: "Calls automatically receive karega, appointments book karega, FAQs answer karega — 24×7.",
    placeholder: "your@email.com",
    cta: "Notify me",
  },
  en: {
    invalid: "Please enter a valid email",
    success: "Done! We will notify you when it launches.",
    badge: "Coming Soon",
    titleStart: "Voice AI Receptionist",
    titleHighlight: "coming soon",
    body: "It will answer calls, book appointments, and respond to FAQs automatically, 24/7.",
    placeholder: "your@email.com",
    cta: "Notify me",
  },
  hi: {
    invalid: "कृपया सही email डालें",
    success: "Done! Launch होते ही notify करेंगे.",
    badge: "जल्द आ रहा है",
    titleStart: "Voice AI Receptionist —",
    titleHighlight: "जल्द आ रहा है",
    body: "Calls automatically receive करेगा, appointments book करेगा और FAQs answer करेगा — 24×7.",
    placeholder: "your@email.com",
    cta: "Notify करें",
  },
};

export default function VoiceAIComingSoon() {
  const [email, setEmail] = useState("");
  const { language } = useLanguage();
  const t = copy[language];
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error(t.invalid);
      return;
    }
    toast.success(t.success);
    setEmail("");
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto rounded-3xl border border-border bg-gradient-to-br from-accent/10 via-card to-primary/10 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
            <Phone size={28} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-semibold mb-3">
              <Bell size={12} /> {t.badge}
            </div>
            <h3 className="text-2xl md:text-3xl font-display font-bold">
              {t.titleStart} <span className="gradient-text">{t.titleHighlight}</span>
            </h3>
            <p className="text-muted-foreground mt-2">
              {t.body}
            </p>
          </div>
          <form onSubmit={submit} className="flex gap-2 w-full md:w-auto">
            <Input
              type="email"
              placeholder={t.placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="md:w-56"
            />
            <Button type="submit" variant="hero">{t.cta}</Button>
          </form>
        </div>
      </div>
    </section>
  );
}

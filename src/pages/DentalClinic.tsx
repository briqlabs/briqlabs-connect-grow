import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CalendarCheck,
  Check,
  CheckCheck,
  ClipboardList,
  Clock3,
  Languages,
  MessageCircle,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserCheck,
  Zap,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LeadFormDialog from "@/components/LeadFormDialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import type { LeadFormOpener } from "@/pages/Index";

type Msg = { from: "lead" | "ai"; text: string };

const chatCopy = {
  hinglish: {
    title: "SmileCare Dental · Mumbai",
    online: "online · AI receptionist",
    input: "Type a message",
    now: "now",
    msgs: [
      { from: "lead", text: "Hi, teeth cleaning ka charge kya hai?" },
      { from: "ai", text: "Hello! Teeth cleaning ₹1,499 se start hai. Dentist consult bhi include hai. Kal 6 PM slot chahiye?" },
      { from: "lead", text: "Haan, book kar do" },
      { from: "ai", text: "Booked. Kal 6 PM appointment confirm hai. Location aur reminder WhatsApp par bhej dunga." },
    ],
  },
  en: {
    title: "SmileCare Dental · Mumbai",
    online: "online · AI receptionist",
    input: "Type a message",
    now: "now",
    msgs: [
      { from: "lead", text: "Hi, what is the charge for teeth cleaning?" },
      { from: "ai", text: "Hello! Teeth cleaning starts at ₹1,499 and includes a dentist consult. Would you like tomorrow's 6 PM slot?" },
      { from: "lead", text: "Yes, please book it" },
      { from: "ai", text: "Booked. Your appointment is confirmed for tomorrow at 6 PM. I will send the location and reminder on WhatsApp." },
    ],
  },
  hi: {
    title: "SmileCare Dental · Mumbai",
    online: "online · AI receptionist",
    input: "Message लिखें",
    now: "अभी",
    msgs: [
      { from: "lead", text: "Hi, teeth cleaning का charge क्या है?" },
      { from: "ai", text: "Hello! Teeth cleaning ₹1,499 से start है और dentist consult include है. कल 6 PM slot चाहिए?" },
      { from: "lead", text: "हाँ, book कर दो" },
      { from: "ai", text: "Booked. कल 6 PM appointment confirm है. Location और reminder WhatsApp पर भेज दूंगा." },
    ],
  },
} satisfies Record<string, { title: string; online: string; input: string; now: string; msgs: Msg[] }>;

const pageCopy = {
  hinglish: {
    eyebrow: "WhatsApp AI Agent for Dental Clinics",
    titleStart: "Dental clinic ka WhatsApp banaiye",
    titleHighlight: "24x7 front desk",
    body: "New patient enquiries, appointment booking, treatment FAQs, reminders, and follow-ups automatically handle hote hain, so your team can focus on patients in the chair.",
    cta: "Start for Free",
    noCard: "No credit card",
    languages: "Hindi · English · Hinglish",
    response: "Replies in under 5 seconds",
    stats: [
      ["24x7", "New patient replies"],
      ["10 min", "WhatsApp setup"],
      ["0", "Missed appointment leads"],
    ],
    painEyebrow: "Built only for dental workflows",
    painTitle: "Capture every dental enquiry before it goes cold",
    painPoints: [
      ["Treatment pricing", "Answer common questions for cleaning, braces, implants, aligners, and root canal consultations."],
      ["Appointment slots", "Offer available slots, confirm bookings, and send reminders without manual back-and-forth."],
      ["Patient details", "Collect name, concern, preferred time, and urgency before your receptionist calls."],
    ],
    featuresEyebrow: "What your AI receptionist handles",
    featuresTitleStart: "Dental growth,",
    featuresTitleHighlight: "on autopilot",
    features: [
      ["Instant patient replies", "Respond to every WhatsApp enquiry when your clinic is busy or closed."],
      ["Smart qualification", "Detect emergency, consultation, follow-up, or cosmetic treatment intent."],
      ["Appointment booking", "Book cleaning, consults, braces, implant, and RCT appointments with reminders."],
      ["Treatment FAQ answers", "Use your own pricing, timings, doctor profiles, and clinic policies."],
      ["Follow-up nudges", "Bring back patients who asked about treatment but never booked."],
      ["Multilingual chat", "Talk naturally in Hindi, English, or Hinglish."],
    ],
    stepsEyebrow: "Go live in 3 steps",
    stepsTitle: "Enable WhatsApp automation for your clinic",
    steps: [
      ["Add clinic info", "Upload treatments, prices, FAQs, doctor timings, address, and booking rules."],
      ["Test the dental chat", "Preview how the AI answers patient questions before switching it on."],
      ["Connect WhatsApp", "Scan the QR for your WhatsApp Business number and start capturing appointments."],
    ],
    ctaTitle: "Ready to automate your dental clinic?",
    ctaBody: "Start free, test with your own treatment FAQs, and connect WhatsApp when you are ready.",
    ctaButton: "Start free trial",
  },
  en: {
    eyebrow: "WhatsApp AI Agent for Dental Clinics",
    titleStart: "Turn your dental clinic WhatsApp into a",
    titleHighlight: "24/7 front desk",
    body: "New patient enquiries, appointment booking, treatment FAQs, reminders, and follow-ups run automatically, so your team can focus on patients in the chair.",
    cta: "Start for Free",
    noCard: "No credit card",
    languages: "Hindi · English · Hinglish",
    response: "Replies in under 5 seconds",
    stats: [
      ["24/7", "New patient replies"],
      ["10 min", "WhatsApp setup"],
      ["0", "Missed appointment leads"],
    ],
    painEyebrow: "Built only for dental workflows",
    painTitle: "Capture every dental enquiry before it goes cold",
    painPoints: [
      ["Treatment pricing", "Answer common questions for cleaning, braces, implants, aligners, and root canal consultations."],
      ["Appointment slots", "Offer available slots, confirm bookings, and send reminders without manual back-and-forth."],
      ["Patient details", "Collect name, concern, preferred time, and urgency before your receptionist calls."],
    ],
    featuresEyebrow: "What your AI receptionist handles",
    featuresTitleStart: "Dental growth,",
    featuresTitleHighlight: "on autopilot",
    features: [
      ["Instant patient replies", "Respond to every WhatsApp enquiry when your clinic is busy or closed."],
      ["Smart qualification", "Detect emergency, consultation, follow-up, or cosmetic treatment intent."],
      ["Appointment booking", "Book cleaning, consults, braces, implant, and RCT appointments with reminders."],
      ["Treatment FAQ answers", "Use your own pricing, timings, doctor profiles, and clinic policies."],
      ["Follow-up nudges", "Bring back patients who asked about treatment but never booked."],
      ["Multilingual chat", "Talk naturally in Hindi, English, or Hinglish."],
    ],
    stepsEyebrow: "Go live in 3 steps",
    stepsTitle: "Enable WhatsApp automation for your clinic",
    steps: [
      ["Add clinic info", "Upload treatments, prices, FAQs, doctor timings, address, and booking rules."],
      ["Test the dental chat", "Preview how the AI answers patient questions before switching it on."],
      ["Connect WhatsApp", "Scan the QR for your WhatsApp Business number and start capturing appointments."],
    ],
    ctaTitle: "Ready to automate your dental clinic?",
    ctaBody: "Start free, test with your own treatment FAQs, and connect WhatsApp when you are ready.",
    ctaButton: "Start free trial",
  },
  hi: {
    eyebrow: "Dental Clinics के लिए WhatsApp AI Agent",
    titleStart: "अपने dental clinic WhatsApp को बनाइए",
    titleHighlight: "24x7 front desk",
    body: "New patient enquiries, appointment booking, treatment FAQs, reminders और follow-ups automatic चलते हैं, ताकि आपकी team patients पर focus कर सके.",
    cta: "Free में शुरू करें",
    noCard: "क्रेडिट कार्ड नहीं चाहिए",
    languages: "हिन्दी · English · Hinglish",
    response: "5 seconds से कम में reply",
    stats: [
      ["24x7", "New patient replies"],
      ["10 min", "WhatsApp setup"],
      ["0", "Missed appointment leads"],
    ],
    painEyebrow: "Dental workflow के लिए बना है",
    painTitle: "हर dental enquiry को cold होने से पहले capture करें",
    painPoints: [
      ["Treatment pricing", "Cleaning, braces, implants, aligners और root canal consultation के common सवालों का जवाब."],
      ["Appointment slots", "Available slots बताएं, bookings confirm करें और reminders भेजें."],
      ["Patient details", "Receptionist के call से पहले name, concern, preferred time और urgency collect करें."],
    ],
    featuresEyebrow: "AI receptionist क्या handle करता है",
    featuresTitleStart: "Dental growth,",
    featuresTitleHighlight: "autopilot पर",
    features: [
      ["Instant patient replies", "Clinic busy या closed हो तब भी हर WhatsApp enquiry का जवाब."],
      ["Smart qualification", "Emergency, consultation, follow-up या cosmetic treatment intent detect करता है."],
      ["Appointment booking", "Cleaning, consults, braces, implant और RCT appointments reminders के साथ book करता है."],
      ["Treatment FAQ answers", "आपके pricing, timings, doctor profiles और clinic policies use करता है."],
      ["Follow-up nudges", "जिन patients ने treatment पूछा लेकिन book नहीं किया, उन्हें वापस लाता है."],
      ["Multilingual chat", "Hindi, English या Hinglish में naturally बात करता है."],
    ],
    stepsEyebrow: "3 steps में live",
    stepsTitle: "अपने clinic के लिए WhatsApp automation enable करें",
    steps: [
      ["Clinic info add करें", "Treatments, prices, FAQs, doctor timings, address और booking rules upload करें."],
      ["Dental chat test करें", "Live करने से पहले देखें AI patient questions का जवाब कैसे देता है."],
      ["WhatsApp connect करें", "WhatsApp Business number का QR scan करें और appointments capture करना शुरू करें."],
    ],
    ctaTitle: "Dental clinic automate करने के लिए ready?",
    ctaBody: "Free start करें, अपने treatment FAQs से test करें, और ready होने पर WhatsApp connect करें.",
    ctaButton: "Free trial शुरू करें",
  },
};

const featureIcons = [MessageSquare, UserCheck, CalendarCheck, ClipboardList, Clock3, Languages];
const stepIcons = [Stethoscope, MessageCircle, Zap];

function DentalChatMockup() {
  const { language } = useLanguage();
  const script = chatCopy[language];
  const [count, setCount] = useState(1);

  useEffect(() => {
    setCount(1);
    const id = window.setInterval(() => {
      setCount((current) => (current >= script.msgs.length ? 1 : current + 1));
    }, 1800);
    return () => window.clearInterval(id);
  }, [script.msgs.length]);

  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="rounded-[2.5rem] bg-[#0b141a] border-[10px] border-neutral-900 shadow-2xl shadow-primary/20 overflow-hidden">
        <div className="bg-[#202c33] px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#25D366]/20 flex items-center justify-center text-[#25D366] font-bold text-sm">
            D
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{script.title}</p>
            <p className="text-[10px] text-emerald-400">{script.online}</p>
          </div>
        </div>

        <div
          className="bg-[#0b141a] px-3 py-4 space-y-2 min-h-[360px]"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        >
          <AnimatePresence initial={false}>
            {script.msgs.slice(0, count).map((message, index) => (
              <motion.div
                key={`${language}-${index}`}
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25 }}
                className={`flex ${message.from === "ai" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-lg text-sm leading-snug ${
                    message.from === "ai"
                      ? "bg-[#005c4b] text-white rounded-br-sm"
                      : "bg-[#202c33] text-white rounded-bl-sm"
                  }`}
                >
                  {message.text}
                  <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-white/60">
                    <span>{script.now}</span>
                    {message.from === "ai" ? <CheckCheck size={12} className="text-sky-400" /> : <Check size={12} />}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="bg-[#202c33] px-3 py-2 flex items-center gap-2">
          <div className="flex-1 bg-[#2a3942] rounded-full px-4 py-2 text-xs text-white/40">
            {script.input}
          </div>
          <div className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center text-white text-lg">
            &gt;
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DentalClinic() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = pageCopy[language];
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("Get Started");

  const openForm: LeadFormOpener = (title = "Get Started") => {
    if (title === "Start Free Trial") {
      navigate("/agent");
      return;
    }
    setDialogTitle(title);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar openForm={openForm} />

      <section className="relative min-h-screen flex items-center hero-glow overflow-hidden pt-24 pb-16">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary/5 blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/5 blur-3xl animate-float" style={{ animationDelay: "3s" }} />

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass mb-6 text-xs text-muted-foreground">
                <Stethoscope size={12} className="text-primary" />
                {t.eyebrow}
              </div>

              <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight mb-5">
                {t.titleStart} <span className="gradient-text">{t.titleHighlight}</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">
                {t.body}
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-8">
                <Button variant="hero" size="lg" className="text-base px-7 py-6" onClick={() => openForm("Start Free Trial")}>
                  {t.cta} <ArrowRight size={18} />
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground mb-8">
                <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-primary" /> {t.noCard}</span>
                <span>· {t.languages}</span>
                <span>· {t.response}</span>
              </div>

              <div className="grid grid-cols-3 gap-3 max-w-lg">
                {t.stats.map(([value, label]) => (
                  <div key={label} className="rounded-2xl border border-border bg-card/80 px-4 py-3">
                    <p className="text-xl font-display font-bold text-foreground">{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.15 }}>
              <DentalChatMockup />
            </motion.div>
          </div>
        </div>
      </section>

      <section id="use-cases" className="py-20 md:py-28 bg-muted/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">{t.painEyebrow}</p>
            <h2 className="text-3xl md:text-5xl font-display font-bold max-w-3xl mx-auto">{t.painTitle}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {t.painPoints.map(([title, desc], index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Sparkles size={22} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-muted-foreground">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">{t.featuresEyebrow}</p>
            <h2 className="text-3xl md:text-5xl font-display font-bold">
              {t.featuresTitleStart} <span className="gradient-text">{t.featuresTitleHighlight}</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {t.features.map(([title, desc], index) => {
              const Icon = featureIcons[index];
              return (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
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

      <section className="py-20 md:py-28 bg-muted/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">{t.stepsEyebrow}</p>
            <h2 className="text-3xl md:text-5xl font-display font-bold">{t.stepsTitle}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {t.steps.map(([title, desc], index) => {
              const Icon = stepIcons[index];
              return (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative rounded-2xl border border-border bg-card p-6"
                >
                  <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground font-display font-extrabold flex items-center justify-center shadow-lg">
                    {index + 1}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{title}</h3>
                  <p className="text-muted-foreground">{desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="contact" className="py-24 md:py-32 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center glass rounded-3xl p-12 md:p-16 glow-border relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-8">
                <Zap size={28} className="text-primary-foreground" />
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                {t.ctaTitle}
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
                {t.ctaBody}
              </p>
              <Button variant="hero" size="lg" className="text-base px-8 py-6" onClick={() => navigate("/agent")}>
                {t.ctaButton}
                <ArrowRight size={18} />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
      <LeadFormDialog open={dialogOpen} onOpenChange={setDialogOpen} title={dialogTitle} />
    </div>
  );
}

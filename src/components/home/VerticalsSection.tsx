import { motion } from "framer-motion";
import { GraduationCap, Home, HeartPulse, Sofa, MessageCircle, CalendarCheck, Users, TrendingUp, type LucideIcon } from "lucide-react";
import type { Vertical } from "./ChatMockup";

export const VERTICALS: Array<{
  id: Vertical;
  icon: LucideIcon;
  label: string;
  tagline: string;
}> = [
  { id: "coaching", icon: GraduationCap, label: "Coaching & EdTech", tagline: "Demo class auto-book karwao" },
  { id: "realestate", icon: Home, label: "Real Estate", tagline: "Site visit + brochure auto-send" },
  { id: "clinics", icon: HeartPulse, label: "Clinics & Salons", tagline: "Appointment + reminder + reschedule" },
  { id: "interior", icon: Sofa, label: "Interior Designers", tagline: "Lead qualify + portfolio share" },
];

const VERTICAL_DETAILS: Record<Vertical, {
  headline: string;
  description: string;
  benefits: Array<{ icon: LucideIcon; title: string; text: string }>;
  example: string;
}> = {
  coaching: {
    headline: "Coaching & EdTech ke liye 24×7 admission counsellor",
    description: "Parents aur students raat 11 baje bhi enquiry karte hain. AI agent fees, batch timings, demo class — sab kuch instantly bata deta hai aur free demo class auto-book kar deta hai.",
    benefits: [
      { icon: CalendarCheck, title: "Demo class booking", text: "Calendar pe slot auto-confirm + reminder" },
      { icon: Users, title: "Lead qualification", text: "Class, board, target exam — sab ask karke filter" },
      { icon: TrendingUp, title: "3× more admissions", text: "No missed enquiries even after office hours" },
    ],
    example: "“NEET batch ka fees kya hai?” → Agent fees, schedule, demo slot — sab share karta hai, parent ka number capture karta hai.",
  },
  realestate: {
    headline: "Real Estate brokers ke liye instant site-visit booking",
    description: "Buyers ko 5 minute mein response nahi mila toh competitor ke paas chale jaate hain. AI agent brochure bhejta hai, budget poochta hai, aur site visit fix kar deta hai.",
    benefits: [
      { icon: MessageCircle, title: "Brochure auto-send", text: "Property PDF + photos turant share" },
      { icon: CalendarCheck, title: "Site visit booking", text: "Weekend slots auto-confirm with reminder" },
      { icon: Users, title: "Budget filtering", text: "Serious buyers ko aap tak, baaki ko nurture" },
    ],
    example: "“2BHK Andheri West mein milega?” → Agent budget, possession date, family size pooch ke matching listings share karta hai.",
  },
  clinics: {
    headline: "Clinics & Salons ke liye appointment receptionist",
    description: "Front desk busy ho ya bandh — patients aur clients WhatsApp pe appointment book kar sakte hain. Reminder + reschedule bhi automatic.",
    benefits: [
      { icon: CalendarCheck, title: "Appointment booking", text: "Available slots dikha ke book + confirm" },
      { icon: MessageCircle, title: "Reminder + reschedule", text: "Day-before reminder, easy reschedule link" },
      { icon: TrendingUp, title: "50% less no-shows", text: "Auto-reminders cancellations kam karte hain" },
    ],
    example: "“Kal dental cleaning ka time milega?” → Agent free slots dikhata hai, book karta hai, reminder set karta hai.",
  },
  interior: {
    headline: "Interior designers ke liye lead qualification agent",
    description: "Har enquiry serious nahi hoti. AI agent budget, timeline, scope (1BHK / 3BHK / villa) poochke sirf qualified leads aap tak forward karta hai.",
    benefits: [
      { icon: Users, title: "Lead qualification", text: "Budget + timeline filter — sirf hot leads" },
      { icon: MessageCircle, title: "Portfolio sharing", text: "Past projects, style preferences auto-share" },
      { icon: CalendarCheck, title: "Consultation booking", text: "Free home visit / video call schedule" },
    ],
    example: "“3BHK ka interior kitna lagega?” → Agent scope, budget, possession date pooch ke estimate + portfolio bhejta hai.",
  },
};

export default function VerticalsSection({
  active,
  onSelect,
}: {
  active: Vertical;
  onSelect: (v: Vertical) => void;
}) {
  const details = VERTICAL_DETAILS[active];

  return (
    <section id="use-cases" className="py-20 md:py-28">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">Built For Indian SMBs</p>
          <h2 className="text-3xl md:text-5xl font-display font-bold">
            Aapka business, <span className="gradient-text">aapka agent</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Vertical select karo — agent uske hisaab se reply karta hai, leads qualify karta hai, aur bookings handle karta hai.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {VERTICALS.map((v) => {
            const Icon = v.icon;
            const isActive = v.id === active;
            return (
              <button
                key={v.id}
                onClick={() => onSelect(v.id)}
                className={`text-left rounded-2xl p-5 border transition-all ${
                  isActive
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${
                  isActive ? "bg-gradient-to-br from-primary to-accent text-primary-foreground" : "bg-muted text-foreground"
                }`}>
                  <Icon size={20} />
                </div>
                <p className="font-semibold">{v.label}</p>
                <p className="text-sm text-muted-foreground mt-1">{v.tagline}</p>
              </button>
            );
          })}
        </div>

        <motion.div
          key={active}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-8 max-w-5xl mx-auto rounded-3xl border border-border bg-card/60 backdrop-blur-sm p-6 md:p-10"
        >
          <div className="grid lg:grid-cols-5 gap-8 items-start">
            <div className="lg:col-span-2">
              <p className="text-xs font-medium text-primary uppercase tracking-wider mb-2">How WhatsApp AI helps</p>
              <h3 className="text-2xl md:text-3xl font-display font-bold leading-tight">{details.headline}</h3>
              <p className="text-muted-foreground mt-4 leading-relaxed">{details.description}</p>
              <div className="mt-6 rounded-xl border border-dashed border-border bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Real example</p>
                <p className="text-sm">{details.example}</p>
              </div>
            </div>

            <div className="lg:col-span-3 grid sm:grid-cols-3 gap-4">
              {details.benefits.map((b) => {
                const Icon = b.icon;
                return (
                  <div key={b.title} className="rounded-2xl border border-border bg-background p-5">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                      <Icon size={18} />
                    </div>
                    <p className="font-semibold text-sm">{b.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{b.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
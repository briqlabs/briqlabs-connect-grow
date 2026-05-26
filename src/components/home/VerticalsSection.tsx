import { motion } from "framer-motion";
import { GraduationCap, Home, HeartPulse, Sofa, MessageCircle, CalendarCheck, Users, TrendingUp, type LucideIcon } from "lucide-react";
import type { Vertical } from "./ChatMockup";
import { useLanguage } from "@/hooks/use-language";

const verticalIcons: Record<Vertical, LucideIcon> = {
  coaching: GraduationCap,
  realestate: Home,
  clinics: HeartPulse,
  interior: Sofa,
};

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

const benefitIcons = [CalendarCheck, Users, TrendingUp];
const alternateBenefitIcons = [MessageCircle, CalendarCheck, Users];

const copy = {
  hinglish: {
    eyebrow: "Built For Indian SMBs",
    titleStart: "Aapka business,",
    titleHighlight: "aapka agent",
    body: "Vertical select karo — agent uske hisaab se reply karta hai, leads qualify karta hai, aur bookings handle karta hai.",
    help: "How WhatsApp AI helps",
    realExample: "Real example",
    verticals: {
      coaching: { label: "Coaching & EdTech", tagline: "Demo class auto-book karwao", headline: "Coaching & EdTech ke liye 24×7 admission counsellor", description: "Parents aur students raat 11 baje bhi enquiry karte hain. AI agent fees, batch timings, demo class — sab kuch instantly bata deta hai aur free demo class auto-book kar deta hai.", benefits: [["Demo class booking", "Calendar pe slot auto-confirm + reminder"], ["Lead qualification", "Class, board, target exam — sab ask karke filter"], ["3× more admissions", "No missed enquiries even after office hours"]], example: "“NEET batch ka fees kya hai?” → Agent fees, schedule, demo slot — sab share karta hai, parent ka number capture karta hai." },
      realestate: { label: "Real Estate", tagline: "Site visit + brochure auto-send", headline: "Real Estate brokers ke liye instant site-visit booking", description: "Buyers ko 5 minute mein response nahi mila toh competitor ke paas chale jaate hain. AI agent brochure bhejta hai, budget poochta hai, aur site visit fix kar deta hai.", benefits: [["Brochure auto-send", "Property PDF + photos turant share"], ["Site visit booking", "Weekend slots auto-confirm with reminder"], ["Budget filtering", "Serious buyers ko aap tak, baaki ko nurture"]], example: "“2BHK Andheri West mein milega?” → Agent budget, possession date, family size pooch ke matching listings share karta hai." },
      clinics: { label: "Clinics & Salons", tagline: "Appointment + reminder + reschedule", headline: "Clinics & Salons ke liye appointment receptionist", description: "Front desk busy ho ya bandh — patients aur clients WhatsApp pe appointment book kar sakte hain. Reminder + reschedule bhi automatic.", benefits: [["Appointment booking", "Available slots dikha ke book + confirm"], ["Reminder + reschedule", "Day-before reminder, easy reschedule link"], ["50% less no-shows", "Auto-reminders cancellations kam karte hain"]], example: "“Kal dental cleaning ka time milega?” → Agent free slots dikhata hai, book karta hai, reminder set karta hai." },
      interior: { label: "Interior Designers", tagline: "Lead qualify + portfolio share", headline: "Interior designers ke liye lead qualification agent", description: "Har enquiry serious nahi hoti. AI agent budget, timeline, scope (1BHK / 3BHK / villa) poochke sirf qualified leads aap tak forward karta hai.", benefits: [["Lead qualification", "Budget + timeline filter — sirf hot leads"], ["Portfolio sharing", "Past projects, style preferences auto-share"], ["Consultation booking", "Free home visit / video call schedule"]], example: "“3BHK ka interior kitna lagega?” → Agent scope, budget, possession date pooch ke estimate + portfolio bhejta hai." },
    },
  },
  en: {
    eyebrow: "Built For Indian SMBs",
    titleStart: "Your business,",
    titleHighlight: "your agent",
    body: "Choose a vertical and the agent adapts its replies, lead qualification, and booking flow to your business.",
    help: "How WhatsApp AI helps",
    realExample: "Real example",
    verticals: {
      coaching: { label: "Coaching & EdTech", tagline: "Auto-book demo classes", headline: "A 24/7 admission counsellor for Coaching & EdTech", description: "Parents and students ask questions late at night too. The AI agent instantly shares fees, batch timings, and demo class slots.", benefits: [["Demo class booking", "Auto-confirms calendar slots and reminders"], ["Lead qualification", "Asks class, board, and target exam"], ["More admissions", "No missed enquiries after office hours"]], example: "“What is the NEET batch fee?” → The agent shares fees, schedule, demo slot, and captures the parent’s number." },
      realestate: { label: "Real Estate", tagline: "Site visits + brochures", headline: "Instant site-visit booking for real estate brokers", description: "If buyers do not hear back quickly, they move to a competitor. The AI agent sends brochures, asks budget, and books visits.", benefits: [["Brochure auto-send", "Shares property PDFs and photos immediately"], ["Site visit booking", "Confirms weekend slots with reminders"], ["Budget filtering", "Routes serious buyers to you"]], example: "“Is there a 2BHK in Andheri West?” → The agent asks budget, possession date, and family size before sharing matching listings." },
      clinics: { label: "Clinics & Salons", tagline: "Appointments + reminders", headline: "An appointment receptionist for clinics and salons", description: "Even when the front desk is busy, patients and clients can book appointments on WhatsApp. Reminders and rescheduling are automatic.", benefits: [["Appointment booking", "Shows free slots and confirms bookings"], ["Reminder + reschedule", "Sends reminders and supports rescheduling"], ["Fewer no-shows", "Auto-reminders reduce cancellations"]], example: "“Is there a dental cleaning slot tomorrow?” → The agent shows slots, books the visit, and sets a reminder." },
      interior: { label: "Interior Designers", tagline: "Qualify leads + share portfolio", headline: "A lead qualification agent for interior designers", description: "Not every enquiry is serious. The AI agent asks budget, timeline, and scope, then forwards qualified leads.", benefits: [["Lead qualification", "Filters by budget and timeline"], ["Portfolio sharing", "Shares past projects and styles"], ["Consultation booking", "Schedules home visits or video calls"]], example: "“What will a 3BHK interior cost?” → The agent asks scope, budget, possession date, and shares an estimate plus portfolio." },
    },
  },
  hi: {
    eyebrow: "भारतीय SMBs के लिए बनाया गया",
    titleStart: "आपका business,",
    titleHighlight: "आपका agent",
    body: "Vertical select करें — agent उसी हिसाब से reply, lead qualification और booking handle करता है.",
    help: "WhatsApp AI कैसे मदद करता है",
    realExample: "Real example",
    verticals: {
      coaching: { label: "Coaching & EdTech", tagline: "Demo class auto-book", headline: "Coaching & EdTech के लिए 24×7 admission counsellor", description: "Parents और students देर रात भी enquiry करते हैं. AI agent fees, batch timings और demo class instantly share करता है.", benefits: [["Demo class booking", "Calendar slot auto-confirm + reminder"], ["Lead qualification", "Class, board और target exam पूछकर filter"], ["ज्यादा admissions", "Office hours के बाद भी enquiry miss नहीं"]], example: "“NEET batch की fees क्या है?” → Agent fees, schedule और demo slot share करता है, parent का number capture करता है." },
      realestate: { label: "Real Estate", tagline: "Site visit + brochure", headline: "Real Estate brokers के लिए instant site-visit booking", description: "Buyer को quick response नहीं मिला तो competitor के पास चला जाता है. AI agent brochure भेजता है, budget पूछता है और site visit fix करता है.", benefits: [["Brochure auto-send", "Property PDF और photos तुरंत share"], ["Site visit booking", "Weekend slots confirm with reminder"], ["Budget filtering", "Serious buyers आपको forward"]], example: "“Andheri West में 2BHK मिलेगा?” → Agent budget, possession date और family size पूछकर matching listings share करता है." },
      clinics: { label: "Clinics & Salons", tagline: "Appointment + reminder", headline: "Clinics & Salons के लिए appointment receptionist", description: "Front desk busy हो या बंद — patients और clients WhatsApp पर appointment book कर सकते हैं. Reminder और reschedule भी automatic.", benefits: [["Appointment booking", "Free slots दिखाकर booking confirm"], ["Reminder + reschedule", "Reminder और easy reschedule"], ["कम no-shows", "Auto-reminders cancellations कम करते हैं"]], example: "“कल dental cleaning का time मिलेगा?” → Agent free slots दिखाता है, book करता है और reminder set करता है." },
      interior: { label: "Interior Designers", tagline: "Lead qualify + portfolio", headline: "Interior designers के लिए lead qualification agent", description: "हर enquiry serious नहीं होती. AI agent budget, timeline और scope पूछकर qualified leads forward करता है.", benefits: [["Lead qualification", "Budget + timeline filter"], ["Portfolio sharing", "Past projects और styles share"], ["Consultation booking", "Home visit या video call schedule"]], example: "“3BHK interior कितना लगेगा?” → Agent scope, budget, possession date पूछकर estimate और portfolio भेजता है." },
    },
  },
};

export default function VerticalsSection({
  active,
  onSelect,
}: {
  active: Vertical;
  onSelect: (v: Vertical) => void;
}) {
  const { language } = useLanguage();
  const t = copy[language];
  const details = t.verticals[active];
  const verticals = (Object.keys(t.verticals) as Vertical[]).map((id) => ({
    id,
    icon: verticalIcons[id],
    label: t.verticals[id].label,
    tagline: t.verticals[id].tagline,
  }));

  return (
    <section id="use-cases" className="py-20 md:py-28">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">{t.eyebrow}</p>
          <h2 className="text-3xl md:text-5xl font-display font-bold">
            {t.titleStart} <span className="gradient-text">{t.titleHighlight}</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            {t.body}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {verticals.map((v) => {
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
              <p className="text-xs font-medium text-primary uppercase tracking-wider mb-2">{t.help}</p>
              <h3 className="text-2xl md:text-3xl font-display font-bold leading-tight">{details.headline}</h3>
              <p className="text-muted-foreground mt-4 leading-relaxed">{details.description}</p>
              <div className="mt-6 rounded-xl border border-dashed border-border bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">{t.realExample}</p>
                <p className="text-sm">{details.example}</p>
              </div>
            </div>

            <div className="lg:col-span-3 grid sm:grid-cols-3 gap-4">
              {details.benefits.map(([title, text], index) => {
                const Icon = active === "realestate" ? alternateBenefitIcons[index] : benefitIcons[index];
                return (
                  <div key={title} className="rounded-2xl border border-border bg-background p-5">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                      <Icon size={18} />
                    </div>
                    <p className="font-semibold text-sm">{title}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{text}</p>
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

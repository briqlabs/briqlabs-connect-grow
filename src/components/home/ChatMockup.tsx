import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, CheckCheck } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export type Vertical = "coaching" | "realestate" | "clinics" | "interior";

type Msg = { from: "lead" | "ai"; text: string };

const SCRIPTS: Record<string, Record<Vertical, { title: string; online: string; input: string; now: string; msgs: Msg[] }>> = {
  hinglish: {
    coaching: { title: "Sharma Coaching · Jaipur", online: "online · AI agent", input: "Type a message", now: "now", msgs: [
      { from: "lead", text: "Hi, NEET batch ki fees kya hai?" },
      { from: "ai", text: "Hello! 🙏 NEET Dropper batch ₹85,000/year hai. Demo class free hai — kal 5pm slot chahiye?" },
      { from: "lead", text: "Haan book kar do" },
      { from: "ai", text: "Done ✅ Kal 5pm Demo Class booked. Reminder bhej dunga 🙂" },
    ] },
    realestate: { title: "Skyline Realty · Gurgaon", online: "online · AI agent", input: "Type a message", now: "now", msgs: [
      { from: "lead", text: "3BHK in Sector 84 available?" },
      { from: "ai", text: "Ji haan! 2 units available — ₹1.85Cr starting. Brochure bhej raha hoon 📄" },
      { from: "lead", text: "Site visit possible Sunday?" },
      { from: "ai", text: "Sunday 11am slot confirm kar diya ✅ Location pin bhej dunga." },
    ] },
    clinics: { title: "Glow Skin Clinic · Mumbai", online: "online · AI agent", input: "Type a message", now: "now", msgs: [
      { from: "lead", text: "Hair treatment ka appointment chahiye" },
      { from: "ai", text: "Sure! Tomorrow 4pm ya Saturday 11am — kaunsa suit karega?" },
      { from: "lead", text: "Saturday 11am" },
      { from: "ai", text: "Booked ✅ Dr. Kapoor ke saath. 1 ghanta pehle reminder aayega." },
    ] },
    interior: { title: "Nest Interiors · Bangalore", online: "online · AI agent", input: "Type a message", now: "now", msgs: [
      { from: "lead", text: "2BHK ka interior budget kya hoga?" },
      { from: "ai", text: "Semi-modular ₹4-6L, full premium ₹8-12L. Portfolio share karu? 🎨" },
      { from: "lead", text: "Haan bhejo" },
      { from: "ai", text: "Sent! Free consultation chahiye? Designer aapko call karega." },
    ] },
  },
  en: {
    coaching: { title: "Sharma Coaching · Jaipur", online: "online · AI agent", input: "Type a message", now: "now", msgs: [
      { from: "lead", text: "Hi, what is the fee for the NEET batch?" },
      { from: "ai", text: "Hello! The NEET Dropper batch is ₹85,000/year. A demo class is free. Would you like tomorrow's 5 PM slot?" },
      { from: "lead", text: "Yes, please book it" },
      { from: "ai", text: "Done. Your demo class is booked for tomorrow at 5 PM. I will send a reminder." },
    ] },
    realestate: { title: "Skyline Realty · Gurgaon", online: "online · AI agent", input: "Type a message", now: "now", msgs: [
      { from: "lead", text: "Is a 3BHK available in Sector 84?" },
      { from: "ai", text: "Yes, 2 units are available, starting at ₹1.85Cr. I am sending the brochure." },
      { from: "lead", text: "Can I visit the site on Sunday?" },
      { from: "ai", text: "Sunday 11 AM is confirmed. I will send the location pin." },
    ] },
    clinics: { title: "Glow Skin Clinic · Mumbai", online: "online · AI agent", input: "Type a message", now: "now", msgs: [
      { from: "lead", text: "I need an appointment for hair treatment" },
      { from: "ai", text: "Sure. Tomorrow 4 PM or Saturday 11 AM. Which works for you?" },
      { from: "lead", text: "Saturday 11 AM" },
      { from: "ai", text: "Booked with Dr. Kapoor. You will get a reminder 1 hour before." },
    ] },
    interior: { title: "Nest Interiors · Bangalore", online: "online · AI agent", input: "Type a message", now: "now", msgs: [
      { from: "lead", text: "What is the budget for a 2BHK interior?" },
      { from: "ai", text: "Semi-modular starts at ₹4-6L, premium full home at ₹8-12L. Should I share our portfolio?" },
      { from: "lead", text: "Yes, send it" },
      { from: "ai", text: "Sent. Would you like a free consultation? A designer can call you." },
    ] },
  },
  hi: {
    coaching: { title: "Sharma Coaching · Jaipur", online: "online · AI agent", input: "Message लिखें", now: "अभी", msgs: [
      { from: "lead", text: "Hi, NEET batch की fees क्या है?" },
      { from: "ai", text: "Hello! NEET Dropper batch ₹85,000/year है. Demo class free है — कल 5 PM slot चाहिए?" },
      { from: "lead", text: "हाँ, book कर दो" },
      { from: "ai", text: "Done. कल 5 PM demo class booked. Reminder भेज दूंगा." },
    ] },
    realestate: { title: "Skyline Realty · Gurgaon", online: "online · AI agent", input: "Message लिखें", now: "अभी", msgs: [
      { from: "lead", text: "Sector 84 में 3BHK available है?" },
      { from: "ai", text: "जी हाँ, 2 units available हैं — ₹1.85Cr starting. Brochure भेज रहा हूँ." },
      { from: "lead", text: "Sunday को site visit हो सकता है?" },
      { from: "ai", text: "Sunday 11 AM slot confirm. Location pin भेज दूंगा." },
    ] },
    clinics: { title: "Glow Skin Clinic · Mumbai", online: "online · AI agent", input: "Message लिखें", now: "अभी", msgs: [
      { from: "lead", text: "Hair treatment का appointment चाहिए" },
      { from: "ai", text: "Sure. Tomorrow 4 PM या Saturday 11 AM — कौन सा suit करेगा?" },
      { from: "lead", text: "Saturday 11 AM" },
      { from: "ai", text: "Booked. Dr. Kapoor के साथ. 1 घंटा पहले reminder आएगा." },
    ] },
    interior: { title: "Nest Interiors · Bangalore", online: "online · AI agent", input: "Message लिखें", now: "अभी", msgs: [
      { from: "lead", text: "2BHK interior का budget क्या होगा?" },
      { from: "ai", text: "Semi-modular ₹4-6L, full premium ₹8-12L. Portfolio share करूँ?" },
      { from: "lead", text: "हाँ भेजो" },
      { from: "ai", text: "Sent. Free consultation चाहिए? Designer आपको call करेगा." },
    ] },
  },
};

export default function ChatMockup({ vertical }: { vertical: Vertical }) {
  const { language } = useLanguage();
  const script = SCRIPTS[language][vertical];
  const [count, setCount] = useState(1);

  useEffect(() => {
    setCount(1);
    const id = setInterval(() => {
      setCount((c) => (c >= script.msgs.length ? 1 : c + 1));
    }, 1800);
    return () => clearInterval(id);
  }, [vertical, script.msgs.length]);

  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="rounded-[2.5rem] bg-[#0b141a] border-[10px] border-neutral-900 shadow-2xl shadow-primary/20 overflow-hidden">
        {/* WA header */}
        <div className="bg-[#202c33] px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#25D366]/20 flex items-center justify-center text-[#25D366] font-bold text-sm">
            B
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{script.title}</p>
            <p className="text-[10px] text-emerald-400">{script.online}</p>
          </div>
        </div>

        {/* Chat body */}
        <div
          className="bg-[#0b141a] px-3 py-4 space-y-2 min-h-[360px]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        >
          <AnimatePresence initial={false}>
            {script.msgs.slice(0, count).map((m, i) => (
              <motion.div
                key={`${vertical}-${i}`}
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25 }}
                className={`flex ${m.from === "ai" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-lg text-sm leading-snug ${
                    m.from === "ai"
                      ? "bg-[#005c4b] text-white rounded-br-sm"
                      : "bg-[#202c33] text-white rounded-bl-sm"
                  }`}
                >
                  {m.text}
                  <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-white/60">
                    <span>{script.now}</span>
                    {m.from === "ai" ? <CheckCheck size={12} className="text-sky-400" /> : <Check size={12} />}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Input */}
        <div className="bg-[#202c33] px-3 py-2 flex items-center gap-2">
          <div className="flex-1 bg-[#2a3942] rounded-full px-4 py-2 text-xs text-white/40">
            {script.input}
          </div>
          <div className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center text-white text-lg">
            ➤
          </div>
        </div>
      </div>
    </div>
  );
}

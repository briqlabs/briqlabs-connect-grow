import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, CheckCheck } from "lucide-react";

export type Vertical = "coaching" | "realestate" | "clinics" | "interior";

type Msg = { from: "lead" | "ai"; text: string };

const SCRIPTS: Record<Vertical, { title: string; msgs: Msg[] }> = {
  coaching: {
    title: "Sharma Coaching · Jaipur",
    msgs: [
      { from: "lead", text: "Hi, NEET batch ki fees kya hai?" },
      { from: "ai", text: "Hello! 🙏 NEET Dropper batch ₹85,000/year hai. Demo class free hai — kal 5pm slot chahiye?" },
      { from: "lead", text: "Haan book kar do" },
      { from: "ai", text: "Done ✅ Kal 5pm Demo Class booked. Reminder bhej dunga 🙂" },
    ],
  },
  realestate: {
    title: "Skyline Realty · Gurgaon",
    msgs: [
      { from: "lead", text: "3BHK in Sector 84 available?" },
      { from: "ai", text: "Ji haan! 2 units available — ₹1.85Cr starting. Brochure bhej raha hoon 📄" },
      { from: "lead", text: "Site visit possible Sunday?" },
      { from: "ai", text: "Sunday 11am slot confirm kar diya ✅ Location pin bhej dunga." },
    ],
  },
  clinics: {
    title: "Glow Skin Clinic · Mumbai",
    msgs: [
      { from: "lead", text: "Hair treatment ka appointment chahiye" },
      { from: "ai", text: "Sure! Tomorrow 4pm ya Saturday 11am — kaunsa suit karega?" },
      { from: "lead", text: "Saturday 11am" },
      { from: "ai", text: "Booked ✅ Dr. Kapoor ke saath. 1 ghanta pehle reminder aayega." },
    ],
  },
  interior: {
    title: "Nest Interiors · Bangalore",
    msgs: [
      { from: "lead", text: "2BHK ka interior budget kya hoga?" },
      { from: "ai", text: "Semi-modular ₹4-6L, full premium ₹8-12L. Portfolio share karu? 🎨" },
      { from: "lead", text: "Haan bhejo" },
      { from: "ai", text: "Sent! Free consultation chahiye? Designer aapko call karega." },
    ],
  },
};

export default function ChatMockup({ vertical }: { vertical: Vertical }) {
  const script = SCRIPTS[vertical];
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
            <p className="text-[10px] text-emerald-400">online · AI agent</p>
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
                    <span>now</span>
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
            Type a message
          </div>
          <div className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center text-white text-lg">
            ➤
          </div>
        </div>
      </div>
    </div>
  );
}
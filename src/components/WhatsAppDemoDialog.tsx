import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Send, Check, CheckCheck, Calendar, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WhatsAppDemoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGetStarted?: () => void;
}

// Chat message type
interface ChatMessage {
  id: number;
  text: string;
  sender: "customer" | "ai";
  time: string;
}

// Scene data
const scenes: { messages: ChatMessage[]; title: string }[] = [
  {
    title: "Instant AI Response",
    messages: [
      { id: 1, text: "Hi! I saw your ad for the CRM software. Can you tell me more about it?", sender: "customer", time: "10:30 AM" },
      { id: 2, text: "Hey there! 👋 Thanks for reaching out. Our CRM helps businesses automate lead tracking, follow-ups, and pipeline management — all from one dashboard.", sender: "ai", time: "10:30 AM" },
      { id: 3, text: "That sounds great! What plans do you offer?", sender: "customer", time: "10:31 AM" },
      { id: 4, text: "We can tailor the automation to your lead volume, team size, and follow-up needs.\n\nWould you like help choosing the right setup?", sender: "ai", time: "10:31 AM" },
    ],
  },
  {
    title: "Lead Qualification",
    messages: [
      { id: 5, text: "The Growth plan looks interesting!", sender: "customer", time: "10:32 AM" },
      { id: 6, text: "Great choice! 🎯 To help you get started, I have a few quick questions:\n\n1️⃣ What's your name?", sender: "ai", time: "10:32 AM" },
      { id: 7, text: "I'm Sarah, from BrightEdge Marketing", sender: "customer", time: "10:33 AM" },
      { id: 8, text: "Nice to meet you, Sarah! 😊\n\n2️⃣ How many team members would be using the CRM?\n3️⃣ What's your approximate monthly budget for tools?", sender: "ai", time: "10:33 AM" },
      { id: 9, text: "About 12 people. Budget is around $100-150/month", sender: "customer", time: "10:34 AM" },
      { id: 10, text: "Perfect! The Growth plan at $79/mo would be ideal for your team. ✅\n\nI've captured your details. Would you like to schedule a quick demo call with our team?", sender: "ai", time: "10:34 AM" },
    ],
  },
  {
    title: "Meeting Scheduling",
    messages: [
      { id: 11, text: "Yes, I'd love a demo!", sender: "customer", time: "10:35 AM" },
      { id: 12, text: "Awesome! 📅 Here are the available slots this week:", sender: "ai", time: "10:35 AM" },
    ],
  },
  {
    title: "Auto-saved to CRM",
    messages: [],
  },
  {
    title: "Ready to Automate",
    messages: [],
  },
];

const TypingIndicator = () => (
  <div className="flex items-center gap-1 px-4 py-3 bg-muted rounded-2xl rounded-tl-sm w-fit">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="w-2 h-2 rounded-full bg-muted-foreground/50"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
      />
    ))}
  </div>
);

const ChatBubble = ({ msg, index }: { msg: ChatMessage; index: number }) => {
  const isCustomer = msg.sender === "customer";
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, delay: index * 0.8 + 0.3 }}
      className={`flex ${isCustomer ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[80%] px-4 py-2.5 text-sm whitespace-pre-line leading-relaxed ${
          isCustomer
            ? "bg-[#dcf8c6] dark:bg-[#005c4b] text-foreground rounded-2xl rounded-tr-sm"
            : "bg-muted text-foreground rounded-2xl rounded-tl-sm"
        }`}
      >
        {msg.text}
        <div className={`flex items-center gap-1 mt-1 text-[10px] text-muted-foreground ${isCustomer ? "justify-end" : ""}`}>
          {msg.time}
          {isCustomer && <CheckCheck size={12} className="text-[#53bdeb]" />}
        </div>
      </div>
    </motion.div>
  );
};

// Calendar slot picker UI
const CalendarUI = () => {
  const [selected, setSelected] = useState<number | null>(null);
  const slots = [
    { day: "Tue, Mar 24", time: "10:00 AM" },
    { day: "Tue, Mar 24", time: "2:00 PM" },
    { day: "Wed, Mar 25", time: "11:00 AM" },
    { day: "Thu, Mar 26", time: "3:00 PM" },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setSelected(1), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.8 }}
      className="mt-3 space-y-2"
    >
      <div className="bg-muted rounded-2xl rounded-tl-sm p-4 max-w-[85%]">
        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-foreground">
          <Calendar size={16} className="text-primary" /> Select a time slot
        </div>
        <div className="grid grid-cols-2 gap-2">
          {slots.map((slot, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2 + i * 0.15 }}
              onClick={() => setSelected(i)}
              className={`p-2.5 rounded-lg text-xs text-left border transition-all ${
                selected === i
                  ? "border-primary bg-primary/10 ring-1 ring-primary"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <div className="font-medium text-foreground">{slot.day}</div>
              <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                <Clock size={10} /> {slot.time}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-end"
          >
            <div className="bg-[#dcf8c6] dark:bg-[#005c4b] text-foreground rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm">
              {slots[selected].day} at {slots[selected].time} works! ✅
              <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground justify-end">
                10:36 AM <CheckCheck size={12} className="text-[#53bdeb]" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-start"
          >
            <div className="bg-muted text-foreground rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm">
              Done! 🎉 Your demo is booked for <strong>{slots[selected].day}</strong> at <strong>{slots[selected].time}</strong>. You'll receive a Google Calendar invite shortly!
              <div className="text-[10px] text-muted-foreground mt-1">10:36 AM</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Spreadsheet UI
const SpreadsheetUI = () => {
  const rows = [
    { name: "Sarah", company: "BrightEdge Marketing", plan: "Growth", budget: "$100-150", status: "Demo Booked" },
    { name: "Mike", company: "TechFlow Inc", plan: "Enterprise", budget: "$300+", status: "Qualified" },
    { name: "Lisa", company: "Starter Studio", plan: "Starter", budget: "$30-50", status: "New Lead" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full"
    >
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0d9b50] dark:bg-[#1a7a42]">
          <div className="w-5 h-5 rounded bg-white/20 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/></svg>
          </div>
          <span className="text-white text-sm font-medium">Lead Tracker — Auto-filled by AI</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground">
                {["Name", "Company", "Plan", "Budget", "Status"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.6 }}
                  className="border-t border-border"
                >
                  <td className="px-3 py-2.5 text-foreground font-medium">{row.name}</td>
                  <td className="px-3 py-2.5 text-foreground">{row.company}</td>
                  <td className="px-3 py-2.5">
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">{row.plan}</span>
                  </td>
                  <td className="px-3 py-2.5 text-foreground">{row.budget}</td>
                  <td className="px-3 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      row.status === "Demo Booked" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                      row.status === "Qualified" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}>{row.status}</span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

// Final branding scene
const BrandingScene = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center text-center py-8 gap-6"
  >
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", damping: 15 }}
      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center"
    >
      <Check size={32} className="text-primary-foreground" />
    </motion.div>
    <div className="space-y-3">
      {["Automate your WhatsApp.", "Capture leads.", "Book meetings.", "24/7."].map((line, i) => (
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.2 }}
          className={`${i === 0 ? "text-xl md:text-2xl font-bold text-foreground" : i === 3 ? "text-2xl md:text-3xl font-bold gradient-text" : "text-lg text-muted-foreground"}`}
        >
          {line}
        </motion.p>
      ))}
    </div>
  </motion.div>
);

const WhatsAppDemoDialog = ({ open, onOpenChange, onGetStarted }: WhatsAppDemoDialogProps) => {
  const [currentScene, setCurrentScene] = useState(0);
  const [showTyping, setShowTyping] = useState(false);
  const totalScenes = scenes.length;

  // Reset on open
  useEffect(() => {
    if (open) setCurrentScene(0);
  }, [open]);

  // Auto-advance scenes
  useEffect(() => {
    if (!open) return;
    const durations = [6000, 8000, 6000, 5000, 0]; // last scene stays
    const d = durations[currentScene];
    if (d === 0) return;
    const t = setTimeout(() => {
      if (currentScene < totalScenes - 1) setCurrentScene((s) => s + 1);
    }, d);
    return () => clearTimeout(t);
  }, [currentScene, open, totalScenes]);

  // Typing indicator for AI messages
  useEffect(() => {
    if (!open) return;
    const msgs = scenes[currentScene]?.messages || [];
    const aiIndices = msgs.map((m, i) => (m.sender === "ai" ? i : -1)).filter((i) => i >= 0);
    const timers: NodeJS.Timeout[] = [];

    aiIndices.forEach((idx) => {
      timers.push(setTimeout(() => setShowTyping(true), idx * 800));
      timers.push(setTimeout(() => setShowTyping(false), idx * 800 + 250));
    });

    return () => timers.forEach(clearTimeout);
  }, [currentScene, open]);

  const goToScene = useCallback((i: number) => setCurrentScene(i), []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0 overflow-hidden border-border bg-background gap-0">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-[#075e54] dark:bg-[#1a3a36]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 01-4.243-1.212L4 20l1.212-3.757A8 8 0 1112 20z"/>
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">AI Sales Agent</p>
              <p className="text-white/70 text-xs">Online • Powered by AI</p>
            </div>
          </div>
          <button onClick={() => onOpenChange(false)} className="text-white/70 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Scene indicator */}
        <div className="flex items-center gap-1.5 px-5 py-2.5 bg-muted/30">
          {scenes.map((s, i) => (
            <button
              key={i}
              onClick={() => goToScene(i)}
              className={`h-1 rounded-full flex-1 transition-all duration-300 ${
                i === currentScene ? "bg-primary" : i < currentScene ? "bg-primary/40" : "bg-border"
              }`}
            />
          ))}
        </div>
        <div className="px-5 pb-1">
          <p className="text-xs text-muted-foreground font-medium">
            Scene {currentScene + 1}: {scenes[currentScene].title}
          </p>
        </div>

        {/* Chat area */}
        <div className="px-5 py-4 min-h-[350px] max-h-[400px] overflow-y-auto flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScene}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-3 flex-1"
            >
              {/* Scenes 0-2: Chat messages */}
              {currentScene <= 2 && (
                <>
                  {scenes[currentScene].messages.map((msg, i) => (
                    <ChatBubble key={msg.id} msg={msg} index={i} />
                  ))}
                  {showTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <TypingIndicator />
                    </motion.div>
                  )}
                  {currentScene === 2 && <CalendarUI />}
                </>
              )}

              {/* Scene 3: Spreadsheet */}
              {currentScene === 3 && <SpreadsheetUI />}

              {/* Scene 4: Branding */}
              {currentScene === 4 && <BrandingScene />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border flex items-center justify-between gap-3 bg-muted/20">
          <div className="flex gap-1.5">
            {Array.from({ length: totalScenes }).map((_, i) => (
              <button
                key={i}
                onClick={() => goToScene(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === currentScene ? "bg-primary scale-125" : "bg-border"}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {currentScene < totalScenes - 1 && (
              <Button variant="ghost" size="sm" onClick={() => setCurrentScene((s) => s + 1)}>
                Skip →
              </Button>
            )}
            <Button
              variant="hero"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onGetStarted?.();
              }}
            >
              Start Free Trial
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsAppDemoDialog;

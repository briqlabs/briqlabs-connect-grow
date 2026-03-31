import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Phone, PhoneOff, Mic, Check, Calendar, Clock, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSpeech } from "@/hooks/use-speech";

interface VoiceAIDemoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGetStarted?: () => void;
}

// Speech context so scenes can speak
const SpeechContext = createContext<{ speak: (text: string, speaker: "AI" | "Customer", delay?: number) => void }>({
  speak: () => {},
});

const scenesMeta = [
  { title: "Incoming Call" },
  { title: "AI Greets Customer" },
  { title: "Lead Qualification" },
  { title: "Meeting Scheduling" },
  { title: "Call Confirmation" },
  { title: "Auto-saved to CRM" },
  { title: "Ready to Automate" },
];

const Waveform = ({ active }: { active: boolean }) => (
  <div className="flex items-center gap-[3px] h-8">
    {Array.from({ length: 24 }).map((_, i) => (
      <motion.div
        key={i}
        className="w-[3px] rounded-full bg-primary"
        animate={active ? {
          height: [4, 12 + Math.random() * 20, 6, 16 + Math.random() * 14, 4],
        } : { height: 4 }}
        transition={active ? {
          duration: 0.6 + Math.random() * 0.4,
          repeat: Infinity,
          repeatType: "reverse",
          delay: i * 0.04,
        } : { duration: 0.3 }}
      />
    ))}
  </div>
);

// Transcript line that speaks when it appears
const TranscriptLine = ({ speaker, text, delay }: { speaker: "AI" | "Customer"; text: string; delay: number }) => {
  const { speak } = useContext(SpeechContext);

  useEffect(() => {
    const t = setTimeout(() => speak(text, speaker), delay * 1000 + 200);
    return () => clearTimeout(t);
  }, [text, speaker, delay, speak]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="flex gap-2 text-sm"
    >
      <span className={`font-semibold shrink-0 ${speaker === "AI" ? "text-primary" : "text-accent"}`}>
        {speaker}:
      </span>
      <span className="text-foreground">{text}</span>
    </motion.div>
  );
};

const IncomingCallScene = () => {
  const [answered, setAnswered] = useState(false);
  const { speak } = useContext(SpeechContext);

  useEffect(() => {
    const t = setTimeout(() => {
      setAnswered(true);
      speak("AI Agent Connected. How can I help you today?", "AI");
    }, 2500);
    return () => clearTimeout(t);
  }, [speak]);

  return (
    <div className="flex flex-col items-center justify-center py-6 gap-6">
      {!answered ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-5">
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center"
          >
            <Phone size={36} className="text-green-500" />
          </motion.div>
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground">Incoming Call</p>
            <p className="text-sm text-muted-foreground">+1 (555) 234-8901</p>
          </div>
          <div className="flex gap-4">
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.8, repeat: Infinity }} className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center cursor-pointer">
              <Phone size={24} className="text-white" />
            </motion.div>
            <div className="w-14 h-14 rounded-full bg-destructive/80 flex items-center justify-center">
              <PhoneOff size={24} className="text-white" />
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4 w-full">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Mic size={28} className="text-primary" />
          </div>
          <p className="text-sm font-medium text-primary">AI Agent Connected</p>
          <Waveform active />
          <p className="text-xs text-muted-foreground">00:01</p>
        </motion.div>
      )}
    </div>
  );
};

const GreetingScene = () => {
  const lines: { speaker: "AI" | "Customer"; text: string }[] = [
    { speaker: "AI", text: "Hello! Thanks for calling TechFlow Solutions. How can I help you today?" },
    { speaker: "Customer", text: "Hi, I'm looking for information about your CRM platform." },
    { speaker: "AI", text: "Great choice! Our CRM helps businesses manage leads, automate follow-ups, and close deals faster. Would you like to hear about our plans?" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Mic size={20} className="text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Live Call</p>
          <p className="text-xs text-muted-foreground">00:15 • Recording</p>
        </div>
      </div>
      <Waveform active />
      <div className="space-y-3 bg-muted/30 rounded-xl p-4 border border-border">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Live Transcript</p>
        {lines.map((l, i) => (
          <TranscriptLine key={i} speaker={l.speaker} text={l.text} delay={i * 1.2} />
        ))}
      </div>
    </div>
  );
};

const QualificationScene = () => {
  const lines: { speaker: "AI" | "Customer"; text: string }[] = [
    { speaker: "AI", text: "Sure! May I have your name please?" },
    { speaker: "Customer", text: "I'm David, from Apex Digital Agency." },
    { speaker: "AI", text: "Nice to meet you, David! How many team members would use the CRM?" },
    { speaker: "Customer", text: "Around 20 people. We need lead tracking and email automation." },
    { speaker: "AI", text: "Perfect! Our Growth plan would be ideal. Would you like to schedule a demo?" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Mic size={20} className="text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Qualifying Lead</p>
          <p className="text-xs text-muted-foreground">00:48 • Active</p>
        </div>
      </div>
      <div className="space-y-3 bg-muted/30 rounded-xl p-4 border border-border">
        {lines.map((l, i) => (
          <TranscriptLine key={i} speaker={l.speaker} text={l.text} delay={i * 0.9} />
        ))}
      </div>
    </div>
  );
};

const SchedulingScene = () => {
  const [selected, setSelected] = useState<number | null>(null);
  const { speak } = useContext(SpeechContext);
  const slots = [
    { day: "Mon, Mar 24", time: "10:00 AM" },
    { day: "Mon, Mar 24", time: "3:00 PM" },
    { day: "Tue, Mar 25", time: "11:00 AM" },
    { day: "Wed, Mar 26", time: "2:00 PM" },
  ];

  useEffect(() => {
    const t = setTimeout(() => {
      setSelected(2);
      speak(`Booked! Tuesday March 25th at 11:00 AM.`, "AI");
    }, 2200);
    return () => clearTimeout(t);
  }, [speak]);

  return (
    <div className="flex flex-col gap-4">
      <TranscriptLine speaker="Customer" text="Yes, I'd love a demo!" delay={0} />
      <TranscriptLine speaker="AI" text="Let me check available slots for you…" delay={0.5} />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="bg-muted/30 rounded-xl p-4 border border-border"
      >
        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-foreground">
          <Calendar size={16} className="text-primary" /> Available Slots
        </div>
        <div className="grid grid-cols-2 gap-2">
          {slots.map((slot, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.4 + i * 0.15 }}
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
      </motion.div>

      <AnimatePresence>
        {selected !== null && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <TranscriptLine speaker="AI" text={`Booked! ${slots[selected].day} at ${slots[selected].time}. ✅`} delay={0} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ConfirmationScene = () => {
  const { speak } = useContext(SpeechContext);

  useEffect(() => {
    speak("Your meeting has been scheduled. You'll receive a confirmation shortly.", "AI");
  }, [speak]);

  return (
    <div className="flex flex-col items-center justify-center py-6 gap-5">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 12 }}
        className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center"
      >
        <Check size={32} className="text-green-500" />
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-center space-y-2">
        <p className="text-lg font-semibold text-foreground">Call Completed</p>
        <p className="text-sm text-muted-foreground">Duration: 2 min 34 sec</p>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="bg-muted/30 rounded-xl p-4 border border-border text-sm text-foreground max-w-sm text-center">
        "Your meeting has been scheduled. You'll receive a confirmation shortly."
      </motion.div>
    </div>
  );
};

const CRMScene = () => {
  const { speak } = useContext(SpeechContext);
  const rows = [
    { name: "David", company: "Apex Digital Agency", plan: "Growth", team: "20", status: "Demo Booked" },
    { name: "Emma", company: "CloudNet Inc", plan: "Enterprise", team: "50+", status: "Qualified" },
    { name: "Jason", company: "LaunchPad Co", plan: "Starter", team: "5", status: "New Lead" },
  ];

  useEffect(() => {
    speak("Lead details have been automatically saved to your CRM.", "AI");
  }, [speak]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0d9b50] dark:bg-[#1a7a42]">
          <div className="w-5 h-5 rounded bg-white/20 flex items-center justify-center">
            <User size={12} className="text-white" />
          </div>
          <span className="text-white text-sm font-medium">CRM — Auto-filled by Voice AI</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground">
                {["Name", "Company", "Plan", "Team", "Status"].map((h) => (
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
                  <td className="px-3 py-2.5 text-foreground">{row.team}</td>
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

const BrandingScene = () => {
  const { speak } = useContext(SpeechContext);

  useEffect(() => {
    speak("Automate calls. Capture leads. Book meetings. 24/7 with Voice AI.", "AI");
  }, [speak]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center text-center py-8 gap-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 15 }}
        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center"
      >
        <Phone size={32} className="text-primary-foreground" />
      </motion.div>
      <div className="space-y-3">
        {["Automate calls.", "Capture leads.", "Book meetings.", "24/7 with Voice AI."].map((line, i) => (
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
};

const VoiceAIDemoDialog = ({ open, onOpenChange, onGetStarted }: VoiceAIDemoDialogProps) => {
  const [currentScene, setCurrentScene] = useState(0);
  const totalScenes = scenesMeta.length;
  const { speak, stop } = useSpeech();

  useEffect(() => {
    if (open) {
      setCurrentScene(0);
    } else {
      stop();
    }
  }, [open, stop]);

  // Stop speech on scene change
  useEffect(() => {
    stop();
  }, [currentScene, stop]);

  // Auto-advance
  useEffect(() => {
    if (!open) return;
    const durations = [5000, 8000, 8000, 7000, 5000, 5000, 0];
    const d = durations[currentScene];
    if (d === 0) return;
    const t = setTimeout(() => {
      if (currentScene < totalScenes - 1) setCurrentScene((s) => s + 1);
    }, d);
    return () => clearTimeout(t);
  }, [currentScene, open, totalScenes]);

  const goToScene = useCallback((i: number) => setCurrentScene(i), []);

  const sceneComponents = [
    <IncomingCallScene />,
    <GreetingScene />,
    <QualificationScene />,
    <SchedulingScene />,
    <ConfirmationScene />,
    <CRMScene />,
    <BrandingScene />,
  ];

  return (
    <SpeechContext.Provider value={{ speak }}>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0 overflow-hidden border-border bg-background gap-0">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-gradient-to-r from-primary/90 to-accent/90">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Phone size={20} className="text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Voice AI Agent</p>
                <p className="text-white/70 text-xs">Live Demo • Powered by AI</p>
              </div>
            </div>
            <button onClick={() => onOpenChange(false)} className="text-white/70 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex items-center gap-1.5 px-5 py-2.5 bg-muted/30">
            {scenesMeta.map((_, i) => (
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
              Scene {currentScene + 1}: {scenesMeta[currentScene].title}
            </p>
          </div>

          <div className="px-5 py-4 min-h-[350px] max-h-[400px] overflow-y-auto flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScene}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex-1"
              >
                {sceneComponents[currentScene]}
              </motion.div>
            </AnimatePresence>
          </div>

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
                  stop();
                  onOpenChange(false);
                  onGetStarted?.();
                }}
              >
                Get Started for Free
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SpeechContext.Provider>
  );
};

export default VoiceAIDemoDialog;

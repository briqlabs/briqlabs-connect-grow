import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, MessageCircle, Check, ArrowRight, ArrowLeft,
  Store, FileText, QrCode, Sparkles, LogOut, LifeBuoy, LayoutDashboard,
  RefreshCw, Smartphone, Loader2, AlertCircle, Trash2, Pencil, Plus,
  GraduationCap, Home, Stethoscope, Sofa, Rocket, Send, Bot, UserRound,
} from "lucide-react";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label }    from "@/components/ui/label";
import { Switch }   from "@/components/ui/switch";
import { toast }    from "sonner";
import { useAuth }  from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { useWhatsAppQR } from "@/hooks/use-whatsapp-qr";
import { supabase } from "@/integrations/supabase/client";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/hooks/use-language";

type Step = 0 | 1 | 2 | 3;
type TestChatMessage = {
  id: string;
  role: "user" | "assistant";
  message: string;
  retrievalScore?: number;
  faithfulnessScore?: number;
};

const TEST_CHAT_HISTORY_KEY_PREFIX = "briqlabs-test-chat-history";

const getTestChatHistoryKey = (userId: string) => `${TEST_CHAT_HISTORY_KEY_PREFIX}:${userId}`;

const isTestChatMessage = (value: unknown): value is TestChatMessage => {
  if (!value || typeof value !== "object") return false;
  const message = value as TestChatMessage;
  return (
    typeof message.id === "string" &&
    (message.role === "user" || message.role === "assistant") &&
    typeof message.message === "string" &&
    (message.retrievalScore === undefined || typeof message.retrievalScore === "number") &&
    (message.faithfulnessScore === undefined || typeof message.faithfulnessScore === "number")
  );
};

const agentCopy = {
  hinglish: {
    connected: "WhatsApp connected",
    linked: "Your account is linked via QR",
    generating: "Generating QR…",
    waiting: "Waiting for QR…",
    retry: "Retry",
    qrRefresh: "QR refreshes automatically every 60 s",
    refreshNow: "Refresh now",
    howScan: "How to scan",
    scanSteps: ["Open WhatsApp on your phone", "Go to Settings → Linked Devices → Link a Device", "Point your camera at the QR code above"],
    steps: [
      { label: "Business", sub: "Details bharo" },
      { label: "AI Bot", sub: "Test karo" },
      { label: "WhatsApp", sub: "Go live" },
    ],
    nav: ["Dashboard", "Business Details", "AI bot", "Whatsapp Integration"],
    help: "Help",
    signOut: "Sign out",
    theme: "Theme",
    step0Title: "Apne business ke baare mein batao",
    step0Desc: "Yeh info se aapka AI agent customers ko reply karega. Jitna detail, utna better.",
    verticalPrompt: "Aap kya karte ho?",
    optional: "(optional — template auto-fill ho jayega)",
    tabs: ["Business Information", "Business Files"],
    labels: { title: "Title", description: "Description", created: "Created At", actions: "Actions", file: "File", size: "Size" },
    placeholders: { businessTitle: "e.g. Store timings", businessDesc: "Write business details your AI should use.", botName: "e.g. Customer Support Bot", botPrompt: "Define how your bot should respond to customers." },
    addBusiness: "Add Business Information",
    noBusiness: "No business information added yet.",
    uploadHelp: "Upload menu / brochure / price list (multiple files supported)",
    chooseFiles: "Choose files",
    readyUpload: "Ready to upload",
    remove: "Remove",
    uploadFiles: "Upload Files",
    noFiles: "No files uploaded yet.",
    next: "Next",
    back: "Back",
    step1Title: "AI bot setup karo",
    step1Desc: "Template choose karo ya apna prompt likho. Test chat se bot ko WhatsApp live karne se pehle check karo.",
    personal: "Personal number",
    personalDesc: "Apna personal WhatsApp use kar sakte ho — alag SIM ki zaroorat nahi.",
    businessNumber: "Business number",
    businessNumberDesc: "WhatsApp Business app ka number bhi link kar sakte ho. Recommended for SMB.",
    step2Title: "WhatsApp connect karo",
    step2Desc: "AI bot test karne ke baad QR scan karo aur WhatsApp pe live deploy karo.",
    templatesTitle: "Templates se shuru karo",
    templatesDesc: "Click karke prefill ho jayega — phir edit kar sakte ho.",
    aiAssistant: "AI Assistant",
    aiOn: "Chalu hai — bot leads ko reply karega",
    aiOff: "Abhi off hai",
    editBot: "Edit Bot",
    yourBot: "Your Bot",
    createBot: "Create Bot",
    cancelEdit: "Cancel Edit",
    oneBot: "Sirf 1 AI bot allowed hai per account. Edit karne ke liye neeche table mein pencil icon dabao, ya delete karke naya banao.",
    botName: "Bot Name",
    botPrompt: "Bot Prompt",
    personality: "Personality:",
    updateBot: "Update Bot",
    table: { bot: "Bot", prompt: "Prompt", status: "Status", active: "Active", inactive: "Inactive", noBots: "No bots created yet." },
    finish: "Deploy to WhatsApp Live",
    dashboardReady: "Welcome back! Aapka agent live hai",
    dashboardTodo: "Chalo, agent ready karte hain — 10 min mein live.",
    manage: "Business knowledge, WhatsApp aur AI bots — sab ek jagah manage karo.",
    progress: (n: number) => `${n} of 3 done. Bas ek-do step aur baaki hai.`,
    checklistTitle: "Setup checklist",
    resume: "Resume Setup",
    stats: ["Business Information", "Business Files", "WhatsApp Connections", "Active AI Bots"],
    quick: "Quick Actions",
    quickCards: [["Add Business Info", "Build your knowledge base"], ["Create AI Bot", "Configure and test prompt automation"], ["Connect WhatsApp", "Deploy messaging channel live"]],
    checklist: ["Business info added", "AI bot active", "WhatsApp connected"],
    support: "Need help? WhatsApp us at",
    supportLink: "support",
  },
  en: {
    connected: "WhatsApp connected",
    linked: "Your account is linked via QR",
    generating: "Generating QR…",
    waiting: "Waiting for QR…",
    retry: "Retry",
    qrRefresh: "QR refreshes automatically every 60 seconds",
    refreshNow: "Refresh now",
    howScan: "How to scan",
    scanSteps: ["Open WhatsApp on your phone", "Go to Settings → Linked Devices → Link a Device", "Point your camera at the QR code above"],
    steps: [
      { label: "Business", sub: "Add details" },
      { label: "AI Bot", sub: "Create and test" },
      { label: "WhatsApp", sub: "Go live" },
    ],
    nav: ["Dashboard", "Business Details", "AI bot", "WhatsApp Integration"],
    help: "Help",
    signOut: "Sign out",
    theme: "Theme",
    step0Title: "Tell us about your business",
    step0Desc: "Your AI agent will use this information to answer customers. More detail means better replies.",
    verticalPrompt: "What type of business do you run?",
    optional: "(optional — this will auto-fill a template)",
    tabs: ["Business Information", "Business Files"],
    labels: { title: "Title", description: "Description", created: "Created At", actions: "Actions", file: "File", size: "Size" },
    placeholders: { businessTitle: "e.g. Store timings", businessDesc: "Write business details your AI should use.", botName: "e.g. Customer Support Bot", botPrompt: "Define how your bot should respond to customers." },
    addBusiness: "Add Business Information",
    noBusiness: "No business information added yet.",
    uploadHelp: "Upload menu, brochure, or price list (multiple files supported)",
    chooseFiles: "Choose files",
    readyUpload: "Ready to upload",
    remove: "Remove",
    uploadFiles: "Upload Files",
    noFiles: "No files uploaded yet.",
    next: "Next",
    back: "Back",
    step1Title: "Set up your AI bot",
    step1Desc: "Choose a template or write your own prompt. Test the bot before deploying it to live WhatsApp.",
    personal: "Personal number",
    personalDesc: "You can use your personal WhatsApp number. No separate SIM is required.",
    businessNumber: "Business number",
    businessNumberDesc: "You can also link a WhatsApp Business app number. Recommended for SMBs.",
    step2Title: "Connect your WhatsApp",
    step2Desc: "After your AI bot is created and tested, scan the QR to deploy it live on WhatsApp.",
    templatesTitle: "Start with a template",
    templatesDesc: "Click to prefill the form, then edit it as needed.",
    aiAssistant: "AI Assistant",
    aiOn: "On — the bot can reply to leads",
    aiOff: "Currently off",
    editBot: "Edit Bot",
    yourBot: "Your Bot",
    createBot: "Create Bot",
    cancelEdit: "Cancel Edit",
    oneBot: "Only 1 AI bot is allowed per account. Use the pencil icon below to edit it, or delete it to create a new one.",
    botName: "Bot Name",
    botPrompt: "Bot Prompt",
    personality: "Personality:",
    updateBot: "Update Bot",
    table: { bot: "Bot", prompt: "Prompt", status: "Status", active: "Active", inactive: "Inactive", noBots: "No bots created yet." },
    finish: "Deploy to WhatsApp Live",
    dashboardReady: "Welcome back! Your agent is live",
    dashboardTodo: "Let’s get your agent ready — live in 10 minutes.",
    manage: "Manage business knowledge, WhatsApp, and AI bots from one place.",
    progress: (n: number) => `${n} of 3 done. Just a few steps left.`,
    checklistTitle: "Setup checklist",
    resume: "Resume Setup",
    stats: ["Business Information", "Business Files", "WhatsApp Connections", "Active AI Bots"],
    quick: "Quick Actions",
    quickCards: [["Add Business Info", "Build your knowledge base"], ["Create AI Bot", "Configure and test prompt automation"], ["Connect WhatsApp", "Deploy messaging channel live"]],
    checklist: ["Business info added", "AI bot active", "WhatsApp connected"],
    support: "Need help? WhatsApp us at",
    supportLink: "support",
  },
  hi: {
    connected: "WhatsApp connected",
    linked: "आपका account QR से link हो गया है",
    generating: "QR generate हो रहा है…",
    waiting: "QR का इंतजार है…",
    retry: "फिर कोशिश करें",
    qrRefresh: "QR हर 60 seconds में automatically refresh होता है",
    refreshNow: "अभी refresh करें",
    howScan: "Scan कैसे करें",
    scanSteps: ["Phone में WhatsApp खोलें", "Settings → Linked Devices → Link a Device पर जाएँ", "Camera को ऊपर दिए QR code पर point करें"],
    steps: [
      { label: "Business", sub: "Details भरें" },
      { label: "AI Bot", sub: "Test करें" },
      { label: "WhatsApp", sub: "Go live" },
    ],
    nav: ["Dashboard", "Business Details", "AI bot", "WhatsApp Integration"],
    help: "Help",
    signOut: "Sign out",
    theme: "Theme",
    step0Title: "अपने business के बारे में बताएं",
    step0Desc: "आपका AI agent इसी info से customers को reply करेगा. जितनी detail, उतना बेहतर.",
    verticalPrompt: "आप क्या करते हैं?",
    optional: "(optional — template auto-fill हो जाएगा)",
    tabs: ["Business Information", "Business Files"],
    labels: { title: "Title", description: "Description", created: "Created At", actions: "Actions", file: "File", size: "Size" },
    placeholders: { businessTitle: "e.g. Store timings", businessDesc: "AI के लिए business details लिखें.", botName: "e.g. Customer Support Bot", botPrompt: "Bot customers को कैसे reply करे, यह define करें." },
    addBusiness: "Business Information जोड़ें",
    noBusiness: "अभी कोई business information add नहीं की गई.",
    uploadHelp: "Menu / brochure / price list upload करें (multiple files supported)",
    chooseFiles: "Files चुनें",
    readyUpload: "Upload के लिए ready",
    remove: "Remove",
    uploadFiles: "Files Upload करें",
    noFiles: "अभी कोई files upload नहीं हुई.",
    next: "Next",
    back: "Back",
    step1Title: "AI bot setup करें",
    step1Desc: "Template चुनें या अपना prompt लिखें. WhatsApp live करने से पहले test chat से bot check करें.",
    personal: "Personal number",
    personalDesc: "आप personal WhatsApp use कर सकते हैं — अलग SIM की जरूरत नहीं.",
    businessNumber: "Business number",
    businessNumberDesc: "WhatsApp Business app का number भी link कर सकते हैं. SMBs के लिए recommended.",
    step2Title: "WhatsApp connect करें",
    step2Desc: "AI bot create और test करने के बाद QR scan करके उसे WhatsApp पर live deploy करें.",
    templatesTitle: "Template से शुरू करें",
    templatesDesc: "Click करने पर prefill होगा — फिर edit कर सकते हैं.",
    aiAssistant: "AI Assistant",
    aiOn: "चालू है — bot leads को reply करेगा",
    aiOff: "अभी off है",
    editBot: "Bot edit करें",
    yourBot: "आपका Bot",
    createBot: "Bot बनाएं",
    cancelEdit: "Edit cancel करें",
    oneBot: "हर account में सिर्फ 1 AI bot allowed है. Edit करने के लिए नीचे pencil icon दबाएँ, या delete करके नया बनाएं.",
    botName: "Bot Name",
    botPrompt: "Bot Prompt",
    personality: "Personality:",
    updateBot: "Bot Update करें",
    table: { bot: "Bot", prompt: "Prompt", status: "Status", active: "Active", inactive: "Inactive", noBots: "अभी कोई bot नहीं बना." },
    finish: "WhatsApp पर Live Deploy करें",
    dashboardReady: "Welcome back! आपका agent live है",
    dashboardTodo: "चलिए, agent ready करते हैं — 10 min में live.",
    manage: "Business knowledge, WhatsApp और AI bots — सब एक जगह manage करें.",
    progress: (n: number) => `${n} of 3 done. बस कुछ steps बाकी हैं.`,
    checklistTitle: "Setup checklist",
    resume: "Setup Resume करें",
    stats: ["Business Information", "Business Files", "WhatsApp Connections", "Active AI Bots"],
    quick: "Quick Actions",
    quickCards: [["Business Info जोड़ें", "Knowledge base बनाएं"], ["AI Bot बनाएं", "Prompt automation configure और test करें"], ["WhatsApp connect करें", "Messaging channel live deploy करें"]],
    checklist: ["Business info add हुआ", "AI bot active", "WhatsApp connected"],
    support: "Help चाहिए? WhatsApp us at",
    supportLink: "support",
  },
};

// ── WhatsApp QR panel (isolated so the hook only runs when the WhatsApp step is active) ────────

function WhatsAppQRPanel({ onConnected }: { onConnected: () => void }) {
  const { status, qrBase64, connected, error, refresh } = useWhatsAppQR();
  const { language } = useLanguage();
  const t = agentCopy[language];

  // Notify parent as soon as we're connected
  useEffect(() => {
    if (connected) onConnected();
  }, [connected, onConnected]);

  if (connected) {
    return (
      <div className="rounded-xl bg-primary/10 border border-primary/30 p-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
          <Check size={20} />
        </div>
        <div>
          <p className="font-semibold">{t.connected}</p>
          <p className="text-sm text-muted-foreground">{t.linked}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* QR Code Box */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-56 h-56 rounded-2xl border-2 border-border bg-white flex items-center justify-center shadow-sm overflow-hidden">

          {/* Loading state */}
          {status === "loading" && (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 size={40} className="animate-spin text-primary" />
              <p className="text-sm">{t.generating}</p>
            </div>
          )}

          {/* Reconnecting state */}
          {status === "reconnecting" && (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 size={40} className="animate-spin text-primary" />
              <p className="text-sm">Reconnecting to WhatsApp…</p>
            </div>
          )}

          {/* QR ready — show the actual image */}
          {status === "qr_ready" && qrBase64 && (
            <img
              src={qrBase64}
              alt="WhatsApp QR code"
              className="w-full h-full object-contain p-2"
            />
          )}

          {/* QR ready but no base64 yet (rare timing) */}
          {status === "qr_ready" && !qrBase64 && (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <QrCode size={48} className="opacity-30" />
              <p className="text-sm">{t.waiting}</p>
            </div>
          )}

          {/* Error state */}
          {status === "error" && (
            <div className="flex flex-col items-center gap-3 text-muted-foreground px-4 text-center">
              <AlertCircle size={36} className="text-destructive" />
              <p className="text-xs">{error ?? "Something went wrong"}</p>
              <Button variant="outline" size="sm" onClick={() => refresh()}>
                <RefreshCw size={14} /> {t.retry}
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground">{t.qrRefresh}</p>
          {status === "qr_ready" && (
            <button
              type="button"
              className="text-xs text-primary hover:underline flex items-center gap-1"
              onClick={() => refresh()}
            >
              <RefreshCw size={11} /> {t.refreshNow}
            </button>
          )}
        </div>
      </div>

      {/* How-to instructions */}
      <div className="rounded-xl bg-muted/40 border border-border p-4 space-y-3">
        <p className="text-sm font-semibold flex items-center gap-2">
          <Smartphone size={15} className="text-primary" /> {t.howScan}
        </p>
        <ol className="space-y-2 text-sm text-muted-foreground list-none">
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">1</span>
            {t.scanSteps[0]}
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">2</span>
            {t.scanSteps[1]}
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">3</span>
            {t.scanSteps[2]}
          </li>
        </ol>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

const Agent = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = agentCopy[language];
  const [step, setStep] = useState<Step>(0);
  const [businessName, setBusinessName] = useState("");
  const [businessInfo, setBusinessInfo] = useState("");
  const [infoEntries, setInfoEntries] = useState<Array<{ id: string; name: string; description: string; created_at: string }>>([]);
  const [fileEntries, setFileEntries] = useState<Array<{ id: string; file_name: string; file_path: string; created_at: string; file_size: number | null }>>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [saving,       setSaving]       = useState(false);
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  const [aiOn, setAiOn] = useState(false);
  const [botName, setBotName] = useState("");
  const [botPrompt, setBotPrompt] = useState("");
  const [editingBotId, setEditingBotId] = useState<string | null>(null);
  const [botEntries, setBotEntries] = useState<Array<{ id: string; name: string; prompt: string; is_active: boolean; created_at: string; updated_at: string }>>([]);
  const [vertical, setVertical] = useState<"coaching" | "realestate" | "clinic" | "interior" | null>(null);
  const [testMessages, setTestMessages] = useState<TestChatMessage[]>([]);
  const [testQuestion, setTestQuestion] = useState("");
  const [testingBot, setTestingBot] = useState(false);
  const [syncingKnowledge, setSyncingKnowledge] = useState(false);
  const testChatHydratedFor = useRef<string | null>(null);
  const testChatHistoryKey = user?.id ? getTestChatHistoryKey(user.id) : null;

  const steps = [
    { ...t.steps[0], icon: Store },
    { ...t.steps[1], icon: Sparkles },
    { ...t.steps[2], icon: MessageCircle },
  ];
  const sideNav = [
    { label: t.nav[0], icon: LayoutDashboard, targetStep: 3 as Step },
    { label: t.nav[1], icon: Store, targetStep: 0 as Step },
    { label: t.nav[2], icon: Sparkles, targetStep: 1 as Step },
    { label: t.nav[3], icon: MessageCircle, targetStep: 2 as Step },
  ];

  const canNextFrom0 = infoEntries.length > 0 || fileEntries.length > 0;
  const canNextFrom1 = aiOn && botEntries.length > 0;
  const canNextFrom2 = whatsappConnected;

  const verticals = [
    { id: "coaching" as const,   label: "Coaching / EdTech",        icon: GraduationCap, hint: "Demo class, fees, batch timings" },
    { id: "realestate" as const, label: "Real Estate / Brokers",    icon: Home,          hint: "Site visit, brochure, locality" },
    { id: "clinic" as const,     label: "Clinics / Salons",         icon: Stethoscope,   hint: "Appointment, services, pricing" },
    { id: "interior" as const,   label: "Interior Designers",       icon: Sofa,          hint: "Portfolio, quote, consultation" },
  ];

  const verticalTemplates: Record<string, { title: string; description: string }> = {
    coaching:   { title: "Course & batch details",  description: "Jaise: NEET batch — Mon–Sat 6 PM, fees ₹25,000, demo class free." },
    realestate: { title: "Property listing",        description: "Jaise: 2BHK Andheri West, ₹1.8 Cr, site visit available weekends." },
    clinic:     { title: "Services & timings",      description: "Jaise: Dental cleaning ₹800, Mon–Sat 10 AM–8 PM, appointment via WhatsApp." },
    interior:   { title: "Services offered",        description: "Jaise: Full home interior, 2BHK from ₹4 L, free consultation visit." },
  };

  const botTemplates = [
    {
      name: "Hinglish Casual",
      tag: "Most popular",
      prompt: "Aap ek friendly WhatsApp assistant ho. Hinglish mein casually reply karo (mix Hindi + English). Business knowledge use karke leads ko qualify karo, questions ka jawab do, aur appointment book karne mein help karo. Short, warm messages bhejo — jaise dost baat kar raha ho.",
    },
    {
      name: "Sales Assistant",
      tag: "Lead conversion",
      prompt: "You are a polite sales assistant. Use business info to share pricing, benefits, and next steps. Ask qualifying questions (budget, timeline, location) and offer to book a site visit or appointment.",
    },
    {
      name: "Customer Support",
      tag: "Service queries",
      prompt: "You are a helpful customer support assistant. Use business knowledge to answer questions clearly, politely, and accurately. If unsure, ask user to share more details.",
    },
    {
      name: "FAQ Bot",
      tag: "Quick answers",
      prompt: "You are an FAQ bot. Answer common questions from business knowledge. If unsure, politely ask the user to contact support.",
    },
  ];

  const personalityChips = [
    { label: "Friendly", suffix: " Tone: warm, friendly, use emojis sparingly." },
    { label: "Formal", suffix: " Tone: professional and formal." },
    { label: "Hinglish-casual", suffix: " Tone: casual Hinglish (Hindi + English mix), like talking to a friend." },
  ];

  const checklist = [
    { done: infoEntries.length > 0 || fileEntries.length > 0, label: t.checklist[0], step: 0 as Step },
    { done: aiOn && botEntries.length > 0, label: t.checklist[1], step: 1 as Step },
    { done: whatsappConnected, label: t.checklist[2], step: 2 as Step },
  ];
  const checklistDone = checklist.filter((c) => c.done).length;
  const setupComplete = checklistDone === 3;

  useEffect(() => {
    if (!testChatHistoryKey) {
      testChatHydratedFor.current = null;
      setTestMessages([]);
      return;
    }

    try {
      const stored = window.localStorage.getItem(testChatHistoryKey);
      const parsed = stored ? JSON.parse(stored) : [];
      setTestMessages(Array.isArray(parsed) ? parsed.filter(isTestChatMessage) : []);
    } catch {
      setTestMessages([]);
    } finally {
      testChatHydratedFor.current = testChatHistoryKey;
    }
  }, [testChatHistoryKey]);

  useEffect(() => {
    if (!testChatHistoryKey || testChatHydratedFor.current !== testChatHistoryKey) return;
    window.localStorage.setItem(testChatHistoryKey, JSON.stringify(testMessages));
  }, [testChatHistoryKey, testMessages]);

  useEffect(() => {
    const loadData = async () => {
      const [{ data: infoData, error: infoErr }, { data: fileData, error: fileErr }, { data: botData, error: botErr }] = await Promise.all([
        supabase
          .from("business_information")
          .select("id,name,description,created_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("business_files")
          .select("id,file_name,file_path,created_at,file_size")
          .order("created_at", { ascending: false }),
        supabase
          .from("ai_bots")
          .select("id,name,prompt,is_active,created_at,updated_at")
          .order("created_at", { ascending: false }),
      ]);

      if (infoErr || fileErr || botErr) {
        toast.error(infoErr?.message ?? fileErr?.message ?? botErr?.message ?? "Failed to load business details");
        return;
      }
      const infoRows = infoData ?? [];
      const fileRows = fileData ?? [];
      const bots = botData ?? [];
      const hasExistingSetup = infoRows.length > 0 || fileRows.length > 0 || bots.length > 0;

      setInfoEntries(infoRows);
      setFileEntries(fileRows);
      setBotEntries(bots);
      setAiOn(bots.some((b) => b.is_active));

      // Returning users should land on dashboard directly.
      if (hasExistingSetup) setStep(3);
    };

    void loadData();
  }, []);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setPendingFiles((prev) => [...prev, ...files]);
    toast.success(`Added ${files.length} file${files.length > 1 ? "s" : ""} to upload queue`);
  };

  const goNext = () => setStep((s) => Math.min(3, s + 1) as Step);

  const addBusinessInformation = async () => {
    if (!user?.id) {
      toast.error("User session not found");
      return;
    }
    setSaving(true);
    try {
      const name = businessName.trim();
      const description = businessInfo.trim();
      if (name.length < 2 || description.length < 5) {
        toast.error("Please provide a valid title and description");
        return;
      }

      const { data, error } = await supabase
        .from("business_information")
        .insert({ user_id: user.id, name, description })
        .select("id,name,description,created_at")
        .single();
      if (error) throw error;
      if (data) setInfoEntries((prev) => [data, ...prev]);
      if (data) {
        try {
          await invokeIngestKnowledge({
            documents: [{
              title: data.name,
              content: data.description,
              source_type: "business_profile",
              source_url: `business-information://${data.id}`,
              metadata: {
                source_table: "business_information",
                business_information_id: data.id,
                created_at: data.created_at,
              },
            }],
          });
        } catch (ingestError: any) {
          toast.warning(`Business information saved, but AI indexing failed: ${ingestError?.message ?? "Unknown error"}`);
        }
      }
      setBusinessName("");
      setBusinessInfo("");
      toast.success("Business information added");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to add business information");
    } finally {
      setSaving(false);
    }
  };

  const uploadBusinessFiles = async () => {
    if (!user?.id || pendingFiles.length === 0) return;
    setSaving(true);
    try {
      const uploadedRows: Array<{ id: string; file_name: string; file_path: string; created_at: string; file_size: number | null }> = [];

      for (const file of pendingFiles) {
        const safeName = file.name.replace(/[^\w.\-]+/g, "_");
        const path = `${user.id}/${Date.now()}_${safeName}`;
        const { error: upErr } = await supabase.storage.from("business-assets").upload(path, file, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });
        if (upErr) throw upErr;

        const { data, error: dbErr } = await supabase
          .from("business_files")
          .insert({
            user_id: user.id,
            file_name: file.name,
            file_path: path,
            mime_type: file.type || null,
            file_size: file.size,
          })
          .select("id,file_name,file_path,created_at,file_size")
          .single();
        if (dbErr) throw dbErr;
        if (data) uploadedRows.push(data);
      }

      if (uploadedRows.length > 0) {
        const { data: { session } } = await supabase.auth.getSession();
        const { error: ingestErr } = await supabase.functions.invoke("ingest-knowledge", {
          body: {
            business_id: user.id,
            file_ids: uploadedRows.map((row) => row.id),
          },
          ...(session?.access_token
            ? { headers: { Authorization: `Bearer ${session.access_token}` } }
            : {}),
        });
        if (ingestErr) {
          toast.warning(`Files uploaded, but AI indexing failed: ${ingestErr.message}`);
        } else {
          toast.success("Files uploaded and indexed for AI");
        }
      }

      setFileEntries((prev) => [...uploadedRows, ...prev]);
      setPendingFiles([]);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to upload files");
    } finally {
      setSaving(false);
    }
  };

  const deleteBusinessInformation = async (id: string) => {
    if (user?.id) {
      try {
        await invokeIngestKnowledge({ delete_source_urls: [`business-information://${id}`] });
      } catch {
        // Keep deletion usable even if index cleanup fails.
      }
    }
    const { error } = await supabase.from("business_information").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setInfoEntries((prev) => prev.filter((row) => row.id !== id));
    toast.success("Business information deleted");
  };

  const deleteBusinessFile = async (id: string, filePath: string) => {
    if (user?.id) {
      const { data: { session } } = await supabase.auth.getSession();
      const { error: ingestErr } = await supabase.functions.invoke("ingest-knowledge", {
        body: {
          business_id: user.id,
          delete_file_paths: [filePath],
        },
        ...(session?.access_token
          ? { headers: { Authorization: `Bearer ${session.access_token}` } }
          : {}),
      });
      if (ingestErr) {
        toast.warning(`File will be deleted, but AI index cleanup failed: ${ingestErr.message}`);
      }
    }

    const { error: storageErr } = await supabase.storage.from("business-assets").remove([filePath]);
    if (storageErr) {
      toast.error(storageErr.message);
      return;
    }
    const { error } = await supabase.from("business_files").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setFileEntries((prev) => prev.filter((row) => row.id !== id));
    toast.success("File deleted");
  };

  const applyTemplate = (name: string, prompt: string) => {
    setBotName(name);
    setBotPrompt(prompt);
    setEditingBotId(null);
  };

  const applyPersonality = (suffix: string) => {
    setBotPrompt((prev) => {
      const trimmed = prev.trim();
      return trimmed.includes(suffix.trim()) ? trimmed : (trimmed + "\n" + suffix);
    });
  };

  const applyVertical = (id: "coaching" | "realestate" | "clinic" | "interior") => {
    setVertical(id);
    const t = verticalTemplates[id];
    if (!businessName) setBusinessName(t.title);
    if (!businessInfo) setBusinessInfo(t.description);
  };

  const editBot = (id: string) => {
    const row = botEntries.find((bot) => bot.id === id);
    if (!row) return;
    setBotName(row.name);
    setBotPrompt(row.prompt);
    setEditingBotId(row.id);
  };

  const resetBotForm = () => {
    setBotName("");
    setBotPrompt("");
    setEditingBotId(null);
  };

  const saveBot = async () => {
    if (!user?.id) {
      toast.error("User session not found");
      return;
    }
    const prompt = botPrompt.trim();
    const name = botName.trim() || "AI Assistant";
    if (prompt.length < 10) {
      toast.error("Please provide a meaningful prompt");
      return;
    }

    setSaving(true);
    try {
      if (editingBotId) {
        const { data, error } = await supabase
          .from("ai_bots")
          .update({
            name,
            prompt,
            is_active: aiOn,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingBotId)
          .select("id,name,prompt,is_active,created_at,updated_at")
          .single();
        if (error) throw error;
        setBotEntries((prev) => prev.map((bot) => (bot.id === editingBotId ? data : bot)));
        toast.success("Bot updated");
      } else {
        const { data, error } = await supabase
          .from("ai_bots")
          .insert({
            user_id: user.id,
            name,
            prompt,
            is_active: aiOn,
          })
          .select("id,name,prompt,is_active,created_at,updated_at")
          .single();
        if (error) throw error;
        setBotEntries((prev) => [data, ...prev]);
        toast.success("Bot created");
      }
      resetBotForm();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save bot");
    } finally {
      setSaving(false);
    }
  };

  const removePendingFile = (fileName: string) => {
    setPendingFiles((prev) => prev.filter((f) => f.name !== fileName));
  };

  const formatDate = (value: string) => {
    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  };

  const invokeIngestKnowledge = async (body: Record<string, unknown>) => {
    if (!user?.id) throw new Error("User session not found");
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase.functions.invoke("ingest-knowledge", {
      body: { business_id: user.id, ...body },
      ...(session?.access_token
        ? { headers: { Authorization: `Bearer ${session.access_token}` } }
        : {}),
    });
    if (error) throw error;
  };

  const syncKnowledge = async () => {
    setSyncingKnowledge(true);
    try {
      await invokeIngestKnowledge({
        ingest_existing_business_data: true,
        ingest_existing_files: true,
      });
      toast.success("Knowledge synced for AI testing");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to sync knowledge");
    } finally {
      setSyncingKnowledge(false);
    }
  };

  const clearTestChatHistory = () => {
    setTestMessages([]);
    if (testChatHistoryKey) {
      window.localStorage.removeItem(testChatHistoryKey);
    }
    toast.success("Test chat history cleared");
  };

  const sendTestQuestion = async () => {
    if (!user?.id) {
      toast.error("User session not found");
      return;
    }
    const question = testQuestion.trim();
    if (!question) return;

    const userMessage: TestChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      message: question,
    };
    setTestMessages((prev) => [...prev, userMessage]);
    setTestQuestion("");
    setTestingBot(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("query-rag", {
        body: {
          business_id: user.id,
          customer_phone: "0000000000",
          message: question,
          send_whatsapp: false,
          match_count: 5,
        },
        ...(session?.access_token
          ? { headers: { Authorization: `Bearer ${session.access_token}` } }
          : {}),
      });
      if (error) throw error;

      setTestMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          message: String((data as any)?.answer ?? "I could not find that information."),
          retrievalScore: Number((data as any)?.retrieval_score ?? 0),
          faithfulnessScore: Number((data as any)?.faithfulness_score ?? 0),
        },
      ]);
    } catch (e: any) {
      setTestMessages((prev) => [
        ...prev,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          message: e?.message ?? "Failed to test AI bot response.",
        },
      ]);
    } finally {
      setTestingBot(false);
    }
  };

  const goBack = () => setStep((s) => Math.max(0, s - 1) as Step);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/", { replace: true });
  };

  const displayName =
    (user?.user_metadata?.full_name as string) ||
    (user?.user_metadata?.name as string) ||
    user?.email || "Account";
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const initial   = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-background hero-glow flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-background/60 backdrop-blur-sm sticky top-0 h-screen">
        <div className="px-5 h-16 flex items-center gap-2 border-b border-border">
          <div className="px-3 py-1.5 rounded-xl bg-gradient-to-br from-primary via-accent to-primary font-display font-extrabold text-primary-foreground text-sm">
            Briqlabs
          </div>
          <span className="font-display font-extrabold text-lg text-primary">Agent</span>
        </div>

        <nav className="flex-1 p-3 space-y-1 text-sm">
          {sideNav.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.targetStep === step ||
              (item.label === "Dashboard" && step === 3);

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => setStep(item.targetStep)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  isActive
                    ? "bg-muted text-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon size={16} /> {item.label}
              </button>
            );
          })}

          <a href="https://wa.me/916362094506" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <LifeBuoy size={16} /> {t.help}
          </a>
        </nav>

        <div className="p-3 border-t border-border space-y-3">
          <div className="flex items-center gap-3 px-2">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center font-semibold">
                {initial}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleSignOut}>
            <LogOut size={16} /> {t.signOut}
          </Button>
          <div className="flex items-center justify-between px-2 text-sm text-muted-foreground">
            <span>{t.theme}</span>
            <div className="flex items-center gap-1">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="md:hidden border-b border-border">
          <div className="container mx-auto flex items-center justify-between h-16 px-6">
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-gradient-to-br from-primary via-accent to-primary font-display font-extrabold text-primary-foreground text-base">
                Briqlabs
              </div>
              <span className="font-display font-extrabold text-xl text-primary">Agent</span>
            </div>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut size={16} /> {t.signOut}
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto max-w-7xl px-6 py-8">
          {/* Stepper */}
          <div className="mb-10">
            <div className="flex items-center justify-between">
              {steps.map((s, i) => {
                const Icon = s.icon;
                const active = step === i;
                const done   = step > i || step === 3;
                return (
                  <div key={i} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        done   ? "bg-primary text-primary-foreground"
                               : active
                                 ? "bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30"
                                 : "bg-muted text-muted-foreground"
                      }`}>
                        {done ? <Check size={22} /> : <Icon size={22} />}
                      </div>
                      <div className="text-center">
                        <p className={`text-xs font-semibold ${active || done ? "text-foreground" : "text-muted-foreground"}`}>
                          {s.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground hidden sm:block">{s.sub}</p>
                      </div>
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 -mt-6 ${step > i ? "bg-primary" : "bg-border"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* ── Step 0 — Business info ── */}
            {step === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                className="glass rounded-2xl p-8"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Store className="text-primary" />
                  <h1 className="text-2xl font-display font-bold">{t.step0Title}</h1>
                </div>
                <p className="text-muted-foreground mb-6">{t.step0Desc}</p>

                <div className="mb-6">
                  <p className="text-sm font-medium mb-3">{t.verticalPrompt} <span className="text-muted-foreground font-normal">{t.optional}</span></p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {verticals.map((v) => {
                      const Icon = v.icon;
                      const active = vertical === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => applyVertical(v.id)}
                          className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all ${
                            active ? "border-primary bg-primary/10 shadow-sm" : "border-border hover:border-primary/40 hover:bg-muted/40"
                          }`}
                        >
                          <Icon size={18} className={active ? "text-primary" : "text-muted-foreground"} />
                          <span className="text-xs font-semibold leading-tight">{v.label}</span>
                          <span className="text-[10px] text-muted-foreground leading-tight">{v.hint}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
                  <section className="rounded-xl border border-border bg-background/70 p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{t.tabs[0]}</p>
                        <p className="text-xs text-muted-foreground">{t.step0Desc}</p>
                      </div>
                      <Store size={18} className="text-primary" />
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="bn">{t.labels.title}</Label>
                        <Input id="bn" placeholder={t.placeholders.businessTitle} value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bi">{t.labels.description}</Label>
                        <Textarea
                          id="bi" rows={4}
                          placeholder={t.placeholders.businessDesc}
                          value={businessInfo} onChange={(e) => setBusinessInfo(e.target.value)}
                        />
                      </div>
                      <Button type="button" variant="hero" onClick={addBusinessInformation} disabled={saving}>
                        {t.addBusiness}
                      </Button>

                      <div className="rounded-xl border border-border overflow-hidden">
                        <div className="grid grid-cols-12 px-4 py-3 text-xs uppercase text-muted-foreground border-b border-border">
                          <span className="col-span-3">{t.labels.title}</span>
                          <span className="col-span-6">{t.labels.description}</span>
                          <span className="col-span-2">{t.labels.created}</span>
                          <span className="col-span-1 text-right">{t.labels.actions}</span>
                        </div>
                        {infoEntries.length === 0 ? (
                          <p className="p-4 text-sm text-muted-foreground">{t.noBusiness}</p>
                        ) : (
                          infoEntries.map((entry) => (
                            <div key={entry.id} className="grid grid-cols-12 px-4 py-3 text-sm border-b border-border last:border-b-0">
                              <span className="col-span-3 font-medium break-words">{entry.name}</span>
                              <span className="col-span-6 text-muted-foreground break-words">{entry.description}</span>
                              <span className="col-span-2 text-muted-foreground">{formatDate(entry.created_at)}</span>
                              <div className="col-span-1 flex justify-end">
                                <Button variant="ghost" size="icon" onClick={() => void deleteBusinessInformation(entry.id)}>
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </section>

                  <section className="rounded-xl border border-border bg-background/70 p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{t.tabs[1]}</p>
                        <p className="text-xs text-muted-foreground">{t.uploadHelp}</p>
                      </div>
                      <FileText size={18} className="text-primary" />
                    </div>
                    <div className="space-y-4">
                      <div className="rounded-xl border border-dashed border-border p-5 text-center bg-muted/30">
                        <FileText className="mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground mb-3">{t.uploadHelp}</p>
                        <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-primary hover:underline">
                          <Upload size={16} />
                          {t.chooseFiles}
                          <input type="file" multiple className="hidden" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" onChange={handleFiles} />
                        </label>
                      </div>

                      {pendingFiles.length > 0 && (
                        <div className="rounded-xl border border-border p-3 space-y-2">
                          <p className="text-sm font-medium">{t.readyUpload}</p>
                          {pendingFiles.map((f) => (
                            <div key={`${f.name}-${f.size}`} className="flex items-center justify-between text-sm">
                              <span>{f.name}</span>
                              <Button type="button" size="sm" variant="ghost" onClick={() => removePendingFile(f.name)}>
                                {t.remove}
                              </Button>
                            </div>
                          ))}
                          <Button type="button" onClick={uploadBusinessFiles} disabled={saving}>{t.uploadFiles}</Button>
                        </div>
                      )}

                      <div className="rounded-xl border border-border overflow-hidden">
                        <div className="grid grid-cols-12 px-4 py-3 text-xs uppercase text-muted-foreground border-b border-border">
                          <span className="col-span-5">{t.labels.file}</span>
                          <span className="col-span-3">{t.labels.size}</span>
                          <span className="col-span-3">{t.labels.created}</span>
                          <span className="col-span-1 text-right">{t.labels.actions}</span>
                        </div>
                        {fileEntries.length === 0 ? (
                          <p className="p-4 text-sm text-muted-foreground">{t.noFiles}</p>
                        ) : (
                          fileEntries.map((entry) => (
                            <div key={entry.id} className="grid grid-cols-12 px-4 py-3 text-sm border-b border-border last:border-b-0">
                              <span className="col-span-5">{entry.file_name}</span>
                              <span className="col-span-3 text-muted-foreground">{entry.file_size ? `${Math.ceil(entry.file_size / 1024)} KB` : "-"}</span>
                              <span className="col-span-3 text-muted-foreground">{formatDate(entry.created_at)}</span>
                              <div className="col-span-1 flex justify-end">
                                <Button variant="ghost" size="icon" onClick={() => void deleteBusinessFile(entry.id, entry.file_path)}>
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </section>
                </div>

                <div className="flex justify-end mt-8">
                  <Button variant="hero" size="lg" disabled={!canNextFrom0 || saving} onClick={goNext}>
                    {t.next} <ArrowRight size={16} />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── Step 2 — Connect WhatsApp ── */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                className="glass rounded-2xl p-8"
              >
                <div className="flex items-center gap-3 mb-2">
                  <MessageCircle className="text-primary" />
                  <h1 className="text-2xl font-display font-bold">{t.step2Title}</h1>
                </div>
                <p className="text-muted-foreground mb-6">{t.step2Desc}</p>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)]">
                  <section className="space-y-3">
                    <div className="rounded-xl border border-border bg-muted/30 p-5">
                      <p className="text-sm font-semibold mb-1 flex items-center gap-2"><Smartphone size={14} className="text-primary"/> {t.personal}</p>
                      <p className="text-xs text-muted-foreground">{t.personalDesc}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/30 p-5">
                      <p className="text-sm font-semibold mb-1 flex items-center gap-2"><MessageCircle size={14} className="text-primary"/> {t.businessNumber}</p>
                      <p className="text-xs text-muted-foreground">{t.businessNumberDesc}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-background/70 p-5">
                      <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <QrCode size={15} className="text-primary" /> {t.nav[3]}
                      </p>
                      <p className="text-sm text-muted-foreground">{t.step2Desc}</p>
                    </div>
                  </section>

                  <section className="rounded-xl border border-border bg-background/70 p-5">
                    {/* QR panel is mounted only when the WhatsApp step is active */}
                    <WhatsAppQRPanel
                      onConnected={() => {
                        setWhatsappConnected(true);
                        toast.success("WhatsApp connected!");
                      }}
                    />
                  </section>
                </div>

                <div className="flex justify-between mt-8">
                  <Button variant="ghost" onClick={goBack}>
                    <ArrowLeft size={16} /> {t.back}
                  </Button>
                  <Button variant="hero" size="lg" disabled={!canNextFrom2} onClick={() => setStep(3)}>
                    {t.finish} <Rocket size={16} />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── Step 1 — AI Bot Configuration ── */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                className="glass rounded-2xl p-8"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="text-primary" />
                  <h1 className="text-2xl font-display font-bold">{t.step1Title}</h1>
                </div>
                <p className="text-muted-foreground mb-6">{t.step1Desc}</p>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)]">
                  <section className="space-y-6">
                {/* Templates first */}
                {(botEntries.length === 0 || editingBotId) && (
                <div className="rounded-xl border border-border p-5">
                  <p className="font-semibold mb-1">{t.templatesTitle}</p>
                  <p className="text-sm text-muted-foreground mb-4">{t.templatesDesc}</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    {botTemplates.map((template) => (
                      <button
                        key={template.name}
                        type="button"
                        onClick={() => applyTemplate(template.name, template.prompt)}
                        className="rounded-lg border border-border bg-background p-4 text-left hover:border-primary/50 hover:bg-muted/40 transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold">{template.name}</p>
                          <span className="text-[10px] uppercase tracking-wide bg-primary/10 text-primary px-2 py-0.5 rounded-full">{template.tag}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-3">{template.prompt}</p>
                      </button>
                    ))}
                  </div>
                </div>
                )}

                <div className="rounded-xl border border-border p-6 flex items-center justify-between bg-muted/30">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${aiOn ? "bg-gradient-to-br from-primary to-accent text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      <Sparkles size={26} />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{t.aiAssistant}</p>
                      <p className="text-sm text-muted-foreground">{aiOn ? t.aiOn : t.aiOff}</p>
                    </div>
                  </div>
                  <Switch checked={aiOn} onCheckedChange={setAiOn} className="scale-125" />
                </div>

                {(botEntries.length === 0 || editingBotId) && (
                <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
                      <Pencil size={18} />
                    </div>
                    {editingBotId && (
                      <Button type="button" size="sm" variant="ghost" onClick={resetBotForm}>
                        {t.cancelEdit}
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bot-prompt">{t.botPrompt}</Label>
                    <Textarea
                      id="bot-prompt"
                      rows={5}
                      placeholder={t.placeholders.botPrompt}
                      value={botPrompt}
                      onChange={(e) => setBotPrompt(e.target.value)}
                    />
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="text-xs text-muted-foreground self-center">{t.personality}</span>
                      {personalityChips.map((p) => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => applyPersonality(p.suffix)}
                          className="text-xs px-2 py-1 rounded-full border border-border hover:border-primary/50 hover:bg-primary/10 transition-colors"
                        >
                          + {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" onClick={saveBot} disabled={saving}>
                      {editingBotId ? t.updateBot : t.createBot}
                    </Button>
                  </div>
                </div>
                )}

		                <div className="rounded-xl border border-border overflow-hidden">
	                  <div className="grid grid-cols-12 px-4 py-3 text-xs uppercase text-muted-foreground border-b border-border items-center">
                    <span className="col-span-11">{t.table.prompt}</span>
                    <div className="col-span-1 flex justify-center">
                      <Pencil size={14} />
                    </div>
                  </div>
                  {botEntries.length === 0 ? (
                    <p className="p-4 text-sm text-muted-foreground">{t.table.noBots}</p>
                  ) : (
                    botEntries.map((bot) => (
                      <div key={bot.id} className="grid grid-cols-12 px-4 py-3 text-sm border-b border-border last:border-b-0 items-center">
                        <span className="col-span-11 text-muted-foreground break-words whitespace-pre-wrap">{bot.prompt}</span>
                        <div className="col-span-1 flex justify-center">
                          <Button variant="ghost" size="icon" onClick={() => editBot(bot.id)} className="h-8 w-8">
                            <Pencil size={16} />
                          </Button>
                        </div>
                      </div>
                    ))
	                  )}
	                </div>

                  </section>

		                <section className="rounded-xl border border-border bg-background/70 overflow-hidden xl:sticky xl:top-8 xl:self-start">
	                  <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
	                    <div className="flex items-center gap-3">
	                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
	                        <Bot size={20} />
	                      </div>
	                      <div>
	                        <p className="font-semibold">Test chat</p>
	                        <p className="text-xs text-muted-foreground">Business info and uploaded files</p>
	                      </div>
	                    </div>
	                    <div className="flex flex-wrap gap-2">
	                      <Button type="button" variant="outline" size="sm" onClick={syncKnowledge} disabled={syncingKnowledge || testingBot}>
	                        {syncingKnowledge ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
	                        Sync knowledge
	                      </Button>
	                    </div>
	                  </div>

		                  <div className="h-[520px] overflow-y-auto bg-muted/20 p-4">
	                    {testMessages.length === 0 ? (
	                      <div className="flex h-full flex-col items-center justify-center text-center">
	                        <MessageCircle className="mb-3 text-muted-foreground" size={30} />
	                        <p className="text-sm font-medium">Ask a customer-style question</p>
	                        <p className="mt-1 max-w-xs text-xs text-muted-foreground">Try pricing, timings, services, addresses, or details from uploaded files.</p>
	                      </div>
	                    ) : (
	                      <div className="space-y-3">
	                        {testMessages.map((message) => (
	                          <div
	                            key={message.id}
	                            className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
	                          >
	                            {message.role === "assistant" && (
	                              <div className="mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
	                                <Bot size={15} />
	                              </div>
	                            )}
	                            <div className={`max-w-[82%] rounded-xl px-3 py-2 text-sm ${
	                              message.role === "user"
	                                ? "bg-primary text-primary-foreground"
	                                : "border border-border bg-background"
	                            }`}>
	                              <p className="whitespace-pre-wrap break-words">{message.message}</p>
	                              {message.role === "assistant" && typeof message.retrievalScore === "number" && (
	                                <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] text-muted-foreground">
	                                  <span className="rounded-full bg-muted px-2 py-0.5">Retrieval {Math.round(message.retrievalScore * 100)}%</span>
	                                  <span className="rounded-full bg-muted px-2 py-0.5">Faithfulness {Math.round((message.faithfulnessScore ?? 0) * 100)}%</span>
	                                </div>
	                              )}
	                            </div>
	                            {message.role === "user" && (
	                              <div className="mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
	                                <UserRound size={15} />
	                              </div>
	                            )}
	                          </div>
	                        ))}
	                        {testingBot && (
	                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
	                            <Loader2 size={15} className="animate-spin" />
	                            Testing response
	                          </div>
	                        )}
	                      </div>
	                    )}
	                  </div>

	                  <div className="border-t border-border p-3">
	                    <div className="flex gap-2">
	                      <Textarea
	                        rows={2}
	                        value={testQuestion}
	                        onChange={(e) => setTestQuestion(e.target.value)}
	                        placeholder="Ask what a customer would ask..."
	                        className="min-h-[48px] resize-none"
	                        onKeyDown={(e) => {
	                          if (e.key === "Enter" && !e.shiftKey) {
	                            e.preventDefault();
	                            void sendTestQuestion();
	                          }
	                        }}
	                      />
	                      <Button
	                        type="button"
	                        size="icon"
	                        className="h-12 w-12 flex-shrink-0"
	                        onClick={() => void sendTestQuestion()}
	                        disabled={testingBot || !testQuestion.trim()}
	                        aria-label="Send test message"
	                      >
	                        {testingBot ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
	                      </Button>
	                    </div>
	                    <div className="mt-2 flex justify-start">
	                      <Button type="button" variant="ghost" size="sm" onClick={clearTestChatHistory} disabled={testMessages.length === 0 || testingBot}>
	                        <Trash2 size={15} />
	                        Clear history
	                      </Button>
	                    </div>
	                  </div>
		                </section>
                </div>

	                <div className="flex justify-between mt-8">
                  <Button variant="ghost" onClick={goBack}>
                    <ArrowLeft size={16} /> {t.back}
                  </Button>
                  <Button variant="hero" size="lg" disabled={!canNextFrom1} onClick={goNext}>
                    {t.next} <ArrowRight size={16} />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── Step 3 — Done ── */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="rounded-3xl bg-gradient-to-r from-primary to-accent p-8 text-primary-foreground">
                  <h1 className="text-3xl md:text-4xl font-display font-extrabold mb-2">
                    {setupComplete ? t.dashboardReady : t.dashboardTodo}
                  </h1>
                  <p className="text-base md:text-lg text-primary-foreground/90 max-w-3xl">
                    {setupComplete
                      ? t.manage
                      : t.progress(checklistDone)}
                  </p>
                </div>

                <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
                  <aside className="space-y-4 xl:sticky xl:top-8 xl:self-start">
                {!setupComplete ? (
                  <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{t.checklistTitle}</p>
                      <span className="text-xs text-muted-foreground">{checklistDone}/3</span>
                    </div>
                    <div className="space-y-2">
                      {checklist.map((c) => (
                        <button
                          key={c.label}
                          type="button"
                          onClick={() => setStep(c.step)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/40 transition-colors text-left"
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${c.done ? "bg-primary text-primary-foreground" : "border-2 border-border"}`}>
                            {c.done && <Check size={14} />}
                          </div>
                          <span className={`flex-1 text-sm ${c.done ? "line-through text-muted-foreground" : "font-medium"}`}>{c.label}</span>
                          {!c.done && <ArrowRight size={14} className="text-muted-foreground" />}
                        </button>
                      ))}
                    </div>
                    <Button
                      variant="hero"
                      size="lg"
                      className="w-full"
                      onClick={() => {
                        const next = checklist.find((c) => !c.done);
                        if (next) setStep(next.step);
                      }}
                    >
                      {t.resume} <ArrowRight size={16} />
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{t.checklistTitle}</p>
                      <span className="text-xs text-muted-foreground">{checklistDone}/3</span>
                    </div>
                    {checklist.map((c) => (
                      <button
                        key={c.label}
                        type="button"
                        onClick={() => setStep(c.step)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/40 transition-colors text-left"
                      >
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                          <Check size={14} />
                        </div>
                        <span className="flex-1 text-sm text-muted-foreground">{c.label}</span>
                        <ArrowRight size={14} className="text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                )}
                  </aside>

                  <section className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="w-12 h-12 rounded-full bg-blue-500/15 text-blue-600 flex items-center justify-center mb-4">
                      <Store size={22} />
                    </div>
                    <p className="text-4xl font-bold text-foreground">{infoEntries.length}</p>
                    <p className="text-muted-foreground mt-2">{t.stats[0]}</p>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center mb-4">
                      <FileText size={22} />
                    </div>
                    <p className="text-4xl font-bold text-foreground">{fileEntries.length}</p>
                    <p className="text-muted-foreground mt-2">{t.stats[1]}</p>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="w-12 h-12 rounded-full bg-amber-500/15 text-amber-600 flex items-center justify-center mb-4">
                      <MessageCircle size={22} />
                    </div>
                    <p className="text-4xl font-bold text-foreground">{whatsappConnected ? 1 : 0}</p>
                    <p className="text-muted-foreground mt-2">{t.stats[2]}</p>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="w-12 h-12 rounded-full bg-violet-500/15 text-violet-600 flex items-center justify-center mb-4">
                      <Sparkles size={22} />
                    </div>
                    <p className="text-4xl font-bold text-foreground">{botEntries.filter((bot) => bot.is_active).length}</p>
                    <p className="text-muted-foreground mt-2">{t.stats[3]}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-3xl font-display font-bold">{t.quick}</h2>
                  <div className="grid gap-4 md:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => setStep(0)}
                      className="rounded-2xl border border-border bg-card p-5 text-left hover:bg-muted/40 transition-colors"
                    >
                      <p className="text-lg font-semibold">{t.quickCards[0][0]}</p>
                      <p className="text-sm text-muted-foreground mt-2">{t.quickCards[0][1]}</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="rounded-2xl border border-border bg-card p-5 text-left hover:bg-muted/40 transition-colors"
                    >
                      <p className="text-lg font-semibold">{t.quickCards[1][0]}</p>
                      <p className="text-sm text-muted-foreground mt-2">{t.quickCards[1][1]}</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="rounded-2xl border border-border bg-card p-5 text-left hover:bg-muted/40 transition-colors"
                    >
                      <p className="text-lg font-semibold">{t.quickCards[2][0]}</p>
                      <p className="text-sm text-muted-foreground mt-2">{t.quickCards[2][1]}</p>
                    </button>
                  </div>
                </div>
                  </section>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-xs text-muted-foreground mt-8">
            {t.support}{" "}
            <a href="https://wa.me/916362094506" className="text-primary hover:underline">{t.supportLink}</a>
          </p>
        </main>
      </div>
    </div>
  );
};

export default Agent;

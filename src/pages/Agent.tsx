import { useEffect } from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, MessageCircle, Power, Check, ArrowRight, ArrowLeft,
  Store, FileText, QrCode, Sparkles, LogOut, LifeBuoy, LayoutDashboard,
  RefreshCw, Smartphone, Loader2, AlertCircle, Trash2, Pencil, Plus,
  GraduationCap, Home, Stethoscope, Sofa, Rocket,
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

type Step = 0 | 1 | 2 | 3;

// ── WhatsApp QR panel (isolated so the hook only runs when step === 1) ────────

function WhatsAppQRPanel({ onConnected }: { onConnected: () => void }) {
  const { status, qrBase64, connected, error, refresh } = useWhatsAppQR();

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
          <p className="font-semibold">WhatsApp connected</p>
          <p className="text-sm text-muted-foreground">Your account is linked via QR</p>
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
              <p className="text-sm">Generating QR…</p>
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
              <p className="text-sm">Waiting for QR…</p>
            </div>
          )}

          {/* Error state */}
          {status === "error" && (
            <div className="flex flex-col items-center gap-3 text-muted-foreground px-4 text-center">
              <AlertCircle size={36} className="text-destructive" />
              <p className="text-xs">{error ?? "Something went wrong"}</p>
              <Button variant="outline" size="sm" onClick={() => refresh()}>
                <RefreshCw size={14} /> Retry
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground">QR refreshes automatically every 60 s</p>
          {status === "qr_ready" && (
            <button
              type="button"
              className="text-xs text-primary hover:underline flex items-center gap-1"
              onClick={() => refresh()}
            >
              <RefreshCw size={11} /> Refresh now
            </button>
          )}
        </div>
      </div>

      {/* How-to instructions */}
      <div className="rounded-xl bg-muted/40 border border-border p-4 space-y-3">
        <p className="text-sm font-semibold flex items-center gap-2">
          <Smartphone size={15} className="text-primary" /> How to scan
        </p>
        <ol className="space-y-2 text-sm text-muted-foreground list-none">
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">1</span>
            Open WhatsApp on your phone
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">2</span>
            Go to <strong>Settings → Linked Devices → Link a Device</strong>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">3</span>
            Point your camera at the QR code above
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
  const [step, setStep] = useState<Step>(0);
  const [businessName, setBusinessName] = useState("");
  const [businessInfo, setBusinessInfo] = useState("");
  const [infoEntries, setInfoEntries] = useState<Array<{ id: string; name: string; description: string; created_at: string }>>([]);
  const [fileEntries, setFileEntries] = useState<Array<{ id: string; file_name: string; file_path: string; created_at: string; file_size: number | null }>>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState<"info" | "files">("info");
  const [saving,       setSaving]       = useState(false);
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  const [aiOn, setAiOn] = useState(false);
  const [botName, setBotName] = useState("");
  const [botPrompt, setBotPrompt] = useState("");
  const [editingBotId, setEditingBotId] = useState<string | null>(null);
  const [botEntries, setBotEntries] = useState<Array<{ id: string; name: string; prompt: string; is_active: boolean; created_at: string; updated_at: string }>>([]);
  const [vertical, setVertical] = useState<"coaching" | "realestate" | "clinic" | "interior" | null>(null);

  const steps = [
    { label: "Business",      sub: "Details bharo",     icon: Store },
    { label: "WhatsApp",      sub: "QR scan karo",      icon: MessageCircle },
    { label: "AI Chalu Karo", sub: "Go live 🚀",         icon: Power },
  ];
  const sideNav = [
    { label: "Dashboard", icon: LayoutDashboard, targetStep: 3 as Step },
    { label: "Business Details", icon: Store, targetStep: 0 as Step },
    { label: "Whatsapp Integration", icon: MessageCircle, targetStep: 1 as Step },
    { label: "AI bot", icon: Sparkles, targetStep: 2 as Step },
  ];

  const canNextFrom0 = infoEntries.length > 0 || fileEntries.length > 0;
  const canNextFrom1 = whatsappConnected;
  const canNextFrom2 = aiOn && botEntries.length > 0;

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
    { done: infoEntries.length > 0 || fileEntries.length > 0, label: "Business info added", step: 0 as Step },
    { done: whatsappConnected, label: "WhatsApp connected", step: 1 as Step },
    { done: aiOn && botEntries.length > 0, label: "AI bot active", step: 2 as Step },
  ];
  const checklistDone = checklist.filter((c) => c.done).length;
  const setupComplete = checklistDone === 3;

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

      setFileEntries((prev) => [...uploadedRows, ...prev]);
      setPendingFiles([]);
      toast.success("Files uploaded");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to upload files");
    } finally {
      setSaving(false);
    }
  };

  const deleteBusinessInformation = async (id: string) => {
    const { error } = await supabase.from("business_information").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setInfoEntries((prev) => prev.filter((row) => row.id !== id));
    toast.success("Business information deleted");
  };

  const deleteBusinessFile = async (id: string, filePath: string) => {
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
    setBotPrompt((prev) => (prev.includes(suffix.trim()) ? prev : (prev.trim() + suffix)));
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
    const name = botName.trim();
    const prompt = botPrompt.trim();
    if (name.length < 2 || prompt.length < 10) {
      toast.error("Please provide a bot name and meaningful prompt");
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

  const deleteBot = async (id: string) => {
    const { error } = await supabase.from("ai_bots").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setBotEntries((prev) => prev.filter((bot) => bot.id !== id));
    toast.success("Bot deleted");
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
            <LifeBuoy size={16} /> Help
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
            <LogOut size={16} /> Sign out
          </Button>
          <div className="flex items-center justify-between px-2 text-sm text-muted-foreground">
            <span>Theme</span>
            <ThemeToggle />
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
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut size={16} /> Sign out
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto max-w-2xl px-6 py-10">
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
                  <h1 className="text-2xl font-display font-bold">Apne business ke baare mein batao</h1>
                </div>
                <p className="text-muted-foreground mb-6">Yeh info se aapka AI agent customers ko reply karega. Jitna detail, utna better.</p>

                <div className="mb-6">
                  <p className="text-sm font-medium mb-3">Aap kya karte ho? <span className="text-muted-foreground font-normal">(optional — template auto-fill ho jayega)</span></p>
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

                <div className="space-y-5">
                  <div className="flex rounded-lg border border-border bg-muted/30 p-1 text-sm">
                    <button
                      type="button"
                      onClick={() => setActiveTab("info")}
                      className={`px-3 py-1.5 rounded-md ${activeTab === "info" ? "bg-background text-foreground" : "text-muted-foreground"}`}
                    >
                      Business Information
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("files")}
                      className={`px-3 py-1.5 rounded-md ${activeTab === "files" ? "bg-background text-foreground" : "text-muted-foreground"}`}
                    >
                      Business Files
                    </button>
                  </div>

                  {activeTab === "info" ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="bn">Title</Label>
                        <Input id="bn" placeholder="e.g. Store timings" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bi">Description</Label>
                        <Textarea
                          id="bi" rows={4}
                          placeholder="Write business details your AI should use."
                          value={businessInfo} onChange={(e) => setBusinessInfo(e.target.value)}
                        />
                      </div>
                      <Button type="button" variant="hero" onClick={addBusinessInformation} disabled={saving}>
                        Add Business Information
                      </Button>

                      <div className="rounded-xl border border-border overflow-hidden">
                        <div className="grid grid-cols-12 px-4 py-3 text-xs uppercase text-muted-foreground border-b border-border">
                          <span className="col-span-3">Name</span>
                          <span className="col-span-5">Description</span>
                          <span className="col-span-3">Created At</span>
                          <span className="col-span-1 text-right">Actions</span>
                        </div>
                        {infoEntries.length === 0 ? (
                          <p className="p-4 text-sm text-muted-foreground">No business information added yet.</p>
                        ) : (
                          infoEntries.map((entry) => (
                            <div key={entry.id} className="grid grid-cols-12 px-4 py-3 text-sm border-b border-border last:border-b-0">
                              <span className="col-span-3">{entry.name}</span>
                              <span className="col-span-5 text-muted-foreground">{entry.description}</span>
                              <span className="col-span-3 text-muted-foreground">{formatDate(entry.created_at)}</span>
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
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-dashed border-border p-5 text-center bg-muted/30">
                        <FileText className="mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground mb-3">Upload menu / brochure / price list (multiple files supported)</p>
                        <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-primary hover:underline">
                          <Upload size={16} />
                          Choose files
                          <input type="file" multiple className="hidden" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" onChange={handleFiles} />
                        </label>
                      </div>

                      {pendingFiles.length > 0 && (
                        <div className="rounded-xl border border-border p-3 space-y-2">
                          <p className="text-sm font-medium">Ready to upload</p>
                          {pendingFiles.map((f) => (
                            <div key={`${f.name}-${f.size}`} className="flex items-center justify-between text-sm">
                              <span>{f.name}</span>
                              <Button type="button" size="sm" variant="ghost" onClick={() => removePendingFile(f.name)}>
                                Remove
                              </Button>
                            </div>
                          ))}
                          <Button type="button" onClick={uploadBusinessFiles} disabled={saving}>Upload Files</Button>
                        </div>
                      )}

                      <div className="rounded-xl border border-border overflow-hidden">
                        <div className="grid grid-cols-12 px-4 py-3 text-xs uppercase text-muted-foreground border-b border-border">
                          <span className="col-span-5">File</span>
                          <span className="col-span-3">Size</span>
                          <span className="col-span-3">Created At</span>
                          <span className="col-span-1 text-right">Actions</span>
                        </div>
                        {fileEntries.length === 0 ? (
                          <p className="p-4 text-sm text-muted-foreground">No files uploaded yet.</p>
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
                  )}
                </div>

                <div className="flex justify-end mt-8">
                  <Button variant="hero" size="lg" disabled={!canNextFrom0 || saving} onClick={goNext}>
                    Next <ArrowRight size={16} />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── Step 1 — Connect WhatsApp ── */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                className="glass rounded-2xl p-8"
              >
                <div className="flex items-center gap-3 mb-2">
                  <MessageCircle className="text-primary" />
                  <h1 className="text-2xl font-display font-bold">WhatsApp connect karo</h1>
                </div>
                <p className="text-muted-foreground mb-6">QR scan karo apne WhatsApp se — 30 second ka kaam hai.</p>

                <div className="mb-6 grid md:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border bg-muted/30 p-4">
                    <p className="text-sm font-semibold mb-1 flex items-center gap-2"><Smartphone size={14} className="text-primary"/> Personal number</p>
                    <p className="text-xs text-muted-foreground">Apna personal WhatsApp use kar sakte ho — alag SIM ki zaroorat nahi.</p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/30 p-4">
                    <p className="text-sm font-semibold mb-1 flex items-center gap-2"><MessageCircle size={14} className="text-primary"/> Business number</p>
                    <p className="text-xs text-muted-foreground">WhatsApp Business app ka number bhi link kar sakte ho. Recommended for SMB.</p>
                  </div>
                </div>

                {/* QR panel is mounted only when step === 1 */}
                <WhatsAppQRPanel
                  onConnected={() => {
                    setWhatsappConnected(true);
                    toast.success("WhatsApp connected! 🎉");
                  }}
                />

                <div className="flex justify-between mt-8">
                  <Button variant="ghost" onClick={goBack}>
                    <ArrowLeft size={16} /> Back
                  </Button>
                  <Button variant="hero" size="lg" disabled={!canNextFrom1} onClick={goNext}>
                    Next <ArrowRight size={16} />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── Step 2 — AI Bot Configuration ── */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                className="glass rounded-2xl p-8"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Power className="text-primary" />
                  <h1 className="text-2xl font-display font-bold">AI bot setup karo</h1>
                </div>
                <p className="text-muted-foreground mb-6">Template choose karo ya apna prompt likho. Hinglish wala SMBs ke liye sabse popular hai.</p>

                {/* Templates first */}
                {(botEntries.length === 0 || editingBotId) && (
                <div className="mb-6 rounded-xl border border-border p-5">
                  <p className="font-semibold mb-1">Templates se shuru karo</p>
                  <p className="text-sm text-muted-foreground mb-4">Click karke prefill ho jayega — phir edit kar sakte ho.</p>
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
                      <p className="font-semibold text-lg">AI Assistant</p>
                      <p className="text-sm text-muted-foreground">{aiOn ? "Chalu hai — bot leads ko reply karega" : "Abhi off hai"}</p>
                    </div>
                  </div>
                  <Switch checked={aiOn} onCheckedChange={setAiOn} className="scale-125" />
                </div>

                <div className="mt-6 rounded-xl border border-border bg-muted/30 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{editingBotId ? "Edit Bot" : botEntries.length >= 1 ? "Your Bot" : "Create Bot"}</p>
                    {editingBotId && (
                      <Button type="button" size="sm" variant="ghost" onClick={resetBotForm}>
                        Cancel Edit
                      </Button>
                    )}
                  </div>

                  {botEntries.length >= 1 && !editingBotId ? (
                    <div className="rounded-lg border border-dashed border-border bg-background/60 p-4 text-sm text-muted-foreground">
                      Sirf <strong className="text-foreground">1 AI bot</strong> allowed hai per account. Edit karne ke liye neeche table mein pencil icon dabao, ya delete karke naya banao.
                    </div>
                  ) : (
                  <>
                  <div className="space-y-2">
                    <Label htmlFor="bot-name">Bot Name</Label>
                    <Input
                      id="bot-name"
                      placeholder="e.g. Customer Support Bot"
                      value={botName}
                      onChange={(e) => setBotName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bot-prompt">Bot Prompt</Label>
                    <Textarea
                      id="bot-prompt"
                      rows={5}
                      placeholder="Define how your bot should respond to customers."
                      value={botPrompt}
                      onChange={(e) => setBotPrompt(e.target.value)}
                    />
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="text-xs text-muted-foreground self-center">Personality:</span>
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
                      {editingBotId ? "Update Bot" : "Create Bot"}
                    </Button>
                  </div>
                  </>
                  )}
                </div>

                <div className="mt-6 rounded-xl border border-border overflow-hidden">
                  <div className="grid grid-cols-12 px-4 py-3 text-xs uppercase text-muted-foreground border-b border-border">
                    <span className="col-span-2">Bot</span>
                    <span className="col-span-6">Prompt</span>
                    <span className="col-span-2">Status</span>
                    <span className="col-span-2 text-right">Actions</span>
                  </div>
                  {botEntries.length === 0 ? (
                    <p className="p-4 text-sm text-muted-foreground">No bots created yet.</p>
                  ) : (
                    botEntries.map((bot) => (
                      <div key={bot.id} className="grid grid-cols-12 px-4 py-3 text-sm border-b border-border last:border-b-0">
                        <span className="col-span-2 font-medium">{bot.name}</span>
                        <span className="col-span-6 text-muted-foreground">{bot.prompt}</span>
                        <span className="col-span-2">{bot.is_active ? "Active" : "Inactive"}</span>
                        <div className="col-span-2 flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => editBot(bot.id)}>
                            <Pencil size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => void deleteBot(bot.id)}>
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex justify-between mt-8">
                  <Button variant="ghost" onClick={goBack}>
                    <ArrowLeft size={16} /> Back
                  </Button>
                  <Button variant="hero" size="lg" disabled={!canNextFrom2} onClick={() => setStep(3)}>
                    Activate Agent — Go Live <Rocket size={16} />
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
                    {setupComplete ? "Welcome back! Aapka agent live hai 🚀" : "Chalo, agent ready karte hain — 10 min mein live."}
                  </h1>
                  <p className="text-base md:text-lg text-primary-foreground/90 max-w-3xl">
                    {setupComplete
                      ? "Business knowledge, WhatsApp aur AI bots — sab ek jagah manage karo."
                      : `${checklistDone} of 3 done. Bas ek-do step aur baaki hai.`}
                  </p>
                </div>

                {!setupComplete && (
                  <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">Setup checklist</p>
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
                      Resume Setup <ArrowRight size={16} />
                    </Button>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="w-12 h-12 rounded-full bg-blue-500/15 text-blue-600 flex items-center justify-center mb-4">
                      <Store size={22} />
                    </div>
                    <p className="text-4xl font-bold text-foreground">{infoEntries.length}</p>
                    <p className="text-muted-foreground mt-2">Business Information</p>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center mb-4">
                      <FileText size={22} />
                    </div>
                    <p className="text-4xl font-bold text-foreground">{fileEntries.length}</p>
                    <p className="text-muted-foreground mt-2">Business Files</p>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="w-12 h-12 rounded-full bg-amber-500/15 text-amber-600 flex items-center justify-center mb-4">
                      <MessageCircle size={22} />
                    </div>
                    <p className="text-4xl font-bold text-foreground">{whatsappConnected ? 1 : 0}</p>
                    <p className="text-muted-foreground mt-2">WhatsApp Connections</p>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="w-12 h-12 rounded-full bg-violet-500/15 text-violet-600 flex items-center justify-center mb-4">
                      <Sparkles size={22} />
                    </div>
                    <p className="text-4xl font-bold text-foreground">{botEntries.filter((bot) => bot.is_active).length}</p>
                    <p className="text-muted-foreground mt-2">Active AI Bots</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-3xl font-display font-bold">Quick Actions</h2>
                  <div className="grid gap-4 md:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => setStep(0)}
                      className="rounded-2xl border border-border bg-card p-5 text-left hover:bg-muted/40 transition-colors"
                    >
                      <p className="text-lg font-semibold">Add Business Info</p>
                      <p className="text-sm text-muted-foreground mt-2">Build your knowledge base</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="rounded-2xl border border-border bg-card p-5 text-left hover:bg-muted/40 transition-colors"
                    >
                      <p className="text-lg font-semibold">Connect WhatsApp</p>
                      <p className="text-sm text-muted-foreground mt-2">Enable messaging channel</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="rounded-2xl border border-border bg-card p-5 text-left hover:bg-muted/40 transition-colors"
                    >
                      <p className="text-lg font-semibold">Create AI Bot</p>
                      <p className="text-sm text-muted-foreground mt-2">Configure prompt automation</p>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-xs text-muted-foreground mt-8">
            Need help? WhatsApp us at{" "}
            <a href="https://wa.me/916362094506" className="text-primary hover:underline">support</a>
          </p>
        </main>
      </div>
    </div>
  );
};

export default Agent;

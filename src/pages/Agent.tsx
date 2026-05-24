import { useEffect } from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, MessageCircle, Power, Check, ArrowRight, ArrowLeft,
  Store, FileText, QrCode, Sparkles, LogOut, LifeBuoy, LayoutDashboard,
  RefreshCw, Smartphone, Loader2, AlertCircle, Trash2, Pencil, Plus,
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
            Apne phone par WhatsApp kholein
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">2</span>
            Jaayein <strong>Settings → Linked Devices → Link a Device</strong>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">3</span>
            Upar diye QR code par camera point karein — bas ho gaya ✅
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

  const steps = [
    { label: "Business Info",    icon: Store },
    { label: "Connect WhatsApp", icon: MessageCircle },
    { label: "Turn ON AI",       icon: Power },
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

  const botTemplates = [
    {
      name: "Dukaan Support Bot",
      prompt: "You are a friendly customer support assistant for an Indian small business. Reply in simple Hinglish (mix of Hindi + English). Use the business knowledge to answer questions about timings, location, products and policies. Be short, polite and helpful.",
    },
    {
      name: "Lead Capture Bot",
      prompt: "You are a sales assistant. Greet the customer warmly in Hinglish, understand what they need, share relevant product/price info from business knowledge, and politely ask for their name, city and phone number so the team can follow up.",
    },
    {
      name: "Appointment / Booking Bot",
      prompt: "You help customers book an appointment or place an order. Ask for service/product, preferred date & time, name and phone number. Confirm details back in Hinglish and tell them the team will reach out shortly.",
    },
  ];

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

          <a href="https://wa.me/919999999999" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
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
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut size={16} /> Sign out
            </Button>
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
                      <span className={`text-xs font-medium text-center ${active || done ? "text-foreground" : "text-muted-foreground"}`}>
                        {s.label}
                      </span>
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
                  <h1 className="text-2xl font-display font-bold">Tell us about your business</h1>
                </div>
                <p className="text-muted-foreground mb-6">Your AI assistant will use this to answer customers.</p>

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
                  <h1 className="text-2xl font-display font-bold">Connect your WhatsApp <span className="text-muted-foreground font-normal text-lg">/ WhatsApp jodein</span></h1>
                </div>
                <p className="text-muted-foreground mb-6">
                  Apne <strong>business WhatsApp number</strong> se neeche diye QR ko scan karein.
                  Bas ek baar — phir saare customer messages aapke AI bot ko milenge.
                </p>
                <div className="mb-6 rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-3 text-sm text-foreground">
                  💡 <strong>Tip:</strong> Use the WhatsApp number jisme aap customers ko reply karte hain — personal nahi, business wala.
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
                  <h1 className="text-2xl font-display font-bold">AI Bot Setup <span className="text-muted-foreground font-normal text-lg">/ Apna bot banayein</span></h1>
                </div>
                <p className="text-muted-foreground mb-6">
                  Apne customers ko auto-reply dene wala bot 2 minute mein taiyaar karein. Niche template chunein ya apni marzi se likhein.
                </p>

                <div className="rounded-xl border border-border p-6 flex items-center justify-between bg-muted/30">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${aiOn ? "bg-gradient-to-br from-primary to-accent text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      <Sparkles size={26} />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">AI Assistant {aiOn ? "ON" : "OFF"}</p>
                      <p className="text-sm text-muted-foreground">{aiOn ? "Bot aapke customers ko auto-reply de raha hai 🚀" : "Switch ON karein taaki bot replies bhejna shuru kare"}</p>
                    </div>
                  </div>
                  <Switch checked={aiOn} onCheckedChange={setAiOn} className="scale-125" />
                </div>

                <div className="mt-6 rounded-xl border border-border bg-muted/30 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">Naya Bot banayein</p>
                    <Button type="button" size="sm" variant="hero" onClick={resetBotForm}>
                      <Plus size={14} /> New
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bot-name">Bot Name</Label>
                    <Input
                      id="bot-name"
                      placeholder="e.g. Dukaan Support Bot"
                      value={botName}
                      onChange={(e) => setBotName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bot-prompt">Bot Instructions <span className="text-muted-foreground font-normal">(bot ko kya karna hai)</span></Label>
                    <Textarea
                      id="bot-prompt"
                      rows={5}
                      placeholder="Example: Aap ek polite assistant hain. Customer ke sawal ka short Hinglish reply dein…"
                      value={botPrompt}
                      onChange={(e) => setBotPrompt(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" onClick={saveBot} disabled={saving}>
                      {editingBotId ? "Update Bot" : "Create Bot"}
                    </Button>
                    {editingBotId && (
                      <Button type="button" variant="ghost" onClick={resetBotForm}>
                        Cancel Edit
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-border p-5">
                  <p className="font-semibold mb-1">Ready-made Templates</p>
                  <p className="text-sm text-muted-foreground mb-4">Ek template chunein — ham form bhar denge, aap edit kar sakte hain.</p>
                  <div className="grid gap-3 md:grid-cols-3">
                    {botTemplates.map((template) => (
                      <div key={template.name} className="rounded-lg border border-border bg-background p-4">
                        <p className="font-semibold mb-2">{template.name}</p>
                        <p className="text-sm text-muted-foreground mb-3">{template.prompt}</p>
                        <Button type="button" variant="ghost" size="sm" onClick={() => applyTemplate(template.name, template.prompt)}>
                          Use Template
                        </Button>
                      </div>
                    ))}
                  </div>
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
                    Finish <ArrowRight size={16} />
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
                  <h1 className="text-4xl font-display font-extrabold mb-2">
                    Namaste, {displayName.split(" ")[0]} 👋
                  </h1>
                  <p className="text-lg/8 text-primary-foreground/90 max-w-3xl">
                    Aapka AI WhatsApp agent yahan hai. Ek hi jagah par business info, WhatsApp aur bots manage karein —
                    aur zyada leads paayein, bina kisi mehnat ke.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2 text-sm">
                    <span className={`px-3 py-1 rounded-full ${whatsappConnected ? "bg-emerald-500/20 text-emerald-50" : "bg-white/15 text-primary-foreground/80"}`}>
                      {whatsappConnected ? "✅ WhatsApp Connected" : "⚠️ WhatsApp not connected"}
                    </span>
                    <span className={`px-3 py-1 rounded-full ${aiOn ? "bg-emerald-500/20 text-emerald-50" : "bg-white/15 text-primary-foreground/80"}`}>
                      {aiOn ? "🤖 AI Bot Active" : "💤 AI Bot Off"}
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="w-12 h-12 rounded-full bg-blue-500/15 text-blue-600 flex items-center justify-center mb-4">
                      <Store size={22} />
                    </div>
                    <p className="text-4xl font-bold text-foreground">{infoEntries.length}</p>
                    <p className="text-muted-foreground mt-2">Business Info entries</p>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center mb-4">
                      <FileText size={22} />
                    </div>
                    <p className="text-4xl font-bold text-foreground">{fileEntries.length}</p>
                    <p className="text-muted-foreground mt-2">Uploaded files</p>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="w-12 h-12 rounded-full bg-amber-500/15 text-amber-600 flex items-center justify-center mb-4">
                      <MessageCircle size={22} />
                    </div>
                    <p className="text-4xl font-bold text-foreground">{whatsappConnected ? 1 : 0}</p>
                    <p className="text-muted-foreground mt-2">WhatsApp connected</p>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="w-12 h-12 rounded-full bg-violet-500/15 text-violet-600 flex items-center justify-center mb-4">
                      <Sparkles size={22} />
                    </div>
                    <p className="text-4xl font-bold text-foreground">{botEntries.filter((bot) => bot.is_active).length}</p>
                    <p className="text-muted-foreground mt-2">Active AI bots</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-3xl font-display font-bold">Quick Actions <span className="text-muted-foreground text-lg font-normal">/ Jaldi karein</span></h2>
                  <div className="grid gap-4 md:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => setStep(0)}
                      className="rounded-2xl border border-border bg-card p-5 text-left hover:bg-muted/40 transition-colors"
                    >
                      <p className="text-lg font-semibold">➕ Add Business Info</p>
                      <p className="text-sm text-muted-foreground mt-2">Timings, products, prices — bot ko sab batayein</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="rounded-2xl border border-border bg-card p-5 text-left hover:bg-muted/40 transition-colors"
                    >
                      <p className="text-lg font-semibold">📱 {whatsappConnected ? "Manage WhatsApp" : "Connect WhatsApp"}</p>
                      <p className="text-sm text-muted-foreground mt-2">{whatsappConnected ? "Status check karein ya dobara link karein" : "QR scan karke 30 sec mein link karein"}</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="rounded-2xl border border-border bg-card p-5 text-left hover:bg-muted/40 transition-colors"
                    >
                      <p className="text-lg font-semibold">🤖 {botEntries.length > 0 ? "Manage AI Bot" : "Create AI Bot"}</p>
                      <p className="text-sm text-muted-foreground mt-2">Template chunein ya apna prompt likhein</p>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-xs text-muted-foreground mt-8">
            Need help? WhatsApp us at{" "}
            <a href="https://wa.me/919999999999" className="text-primary hover:underline">support</a>
          </p>
        </main>
      </div>
    </div>
  );
};

export default Agent;

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
//import { Upload, MessageCircle, Power, Check, ArrowRight, ArrowLeft, Store, FileText, Phone, Sparkles, LogOut, Settings, LifeBuoy } from "lucide-react";
import { Upload, MessageCircle, Power, Check, ArrowRight, ArrowLeft, Store, FileText, QrCode, Sparkles, LogOut, Settings, LifeBuoy, RefreshCw, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";

type Step = 0 | 1 | 2 | 3;

const Agent = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(0);
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [businessInfo, setBusinessInfo] = useState("");
  const [fileName, setFileName] = useState("");
  /*
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [aiOn, setAiOn] = useState(false);
*/
  const [phone, setPhone] = useState("");
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  const [qrExpired, setQrExpired] = useState(false);
  const [aiOn, setAiOn] = useState(false);
  
  const steps = [
    { label: "Business Info", icon: Store },
    { label: "Connect WhatsApp", icon: MessageCircle },
    { label: "Turn ON AI", icon: Power },
  ];

  const canNextFrom0 = businessName.trim().length > 1 && businessType.trim().length > 1 && (businessInfo.trim().length > 5 || fileName);
  const canNextFrom1 = whatsappConnected;

  /*const handleSendOtp = () => {
    if (phone.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    setOtpSent(true);
    toast.success("OTP sent to your WhatsApp number");
  }; */
/*
  const handleVerify = () => {
    if (otp.length < 4) {
      toast.error("Enter the 6-digit OTP");
      return;
    }
    setWhatsappConnected(true);
    toast.success("WhatsApp connected successfully");
  };
  */
    const handleRefreshQr = () => {
    setQrExpired(false);
    toast.success("QR code refreshed");
  };

  const handleSimulateConnect = () => {
    setWhatsappConnected(true);
    toast.success("WhatsApp connected successfully");
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFileName(f.name);
      toast.success(`Uploaded ${f.name}`);
    }
  };

  const goNext = () => setStep((s) => (Math.min(3, s + 1) as Step));
  const goBack = () => setStep((s) => (Math.max(0, s - 1) as Step));

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/", { replace: true });
  };

  const displayName =
    (user?.user_metadata?.full_name as string) ||
    (user?.user_metadata?.name as string) ||
    user?.email ||
    "Account";
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const initial = displayName.charAt(0).toUpperCase();

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
          <a className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted text-foreground font-medium">
            <Sparkles size={16} /> Setup
          </a>
          <a href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Settings size={16} /> Home
          </a>
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
              const done = step > i || step === 3;
              return (
                <div key={i} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        done
                          ? "bg-primary text-primary-foreground"
                          : active
                            ? "bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
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
          {step === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="glass rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-2">
                <Store className="text-primary" />
                <h1 className="text-2xl font-display font-bold">Tell us about your business</h1>
              </div>
              <p className="text-muted-foreground mb-6">Your AI assistant will use this to answer customers.</p>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="bn">Business name</Label>
                  <Input id="bn" placeholder="e.g. Sharma Electronics" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bt">What do you do?</Label>
                  <Input id="bt" placeholder="e.g. Mobile phone shop, Dental clinic, Saree store" value={businessType} onChange={(e) => setBusinessType(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bi">Business details</Label>
                  <Textarea
                    id="bi"
                    rows={5}
                    placeholder="Write a few lines about your products, services, prices, timings, address, etc. The AI will use this to reply to customers."
                    value={businessInfo}
                    onChange={(e) => setBusinessInfo(e.target.value)}
                  />
                </div>

                <div className="rounded-xl border border-dashed border-border p-5 text-center bg-muted/30">
                  <FileText className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">Or upload a menu / brochure / price list (PDF, image)</p>
                  <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-primary hover:underline">
                    <Upload size={16} />
                    {fileName ? `Replace: ${fileName}` : "Choose file"}
                    <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" onChange={handleFile} />
                  </label>
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <Button variant="hero" size="lg" disabled={!canNextFrom0} onClick={goNext}>
                  Next <ArrowRight size={16} />
                </Button>
              </div>
            </motion.div>
          )}
          

          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="glass rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-2">
                <MessageCircle className="text-primary" />
                <h1 className="text-2xl font-display font-bold">Connect your WhatsApp</h1>
              </div>
              <p className="text-muted-foreground mb-6">Scan the QR code with your WhatsApp app to link your account.</p>

              {!whatsappConnected ? (
                <div className="space-y-6">
                  {/* QR Code Display */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative w-56 h-56 rounded-2xl border-2 border-border bg-white flex items-center justify-center shadow-sm">
                      {qrExpired ? (
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                          <QrCode size={48} className="opacity-30" />
                          <p className="text-sm font-medium">QR code expired</p>
                          <Button variant="outline" size="sm" onClick={handleRefreshQr}>
                            <RefreshCw size={14} /> Refresh
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          {/* Placeholder QR — replace with real QR image/component */}
                          <QrCode size={160} className="text-foreground" strokeWidth={1.2} />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">QR code expires in 60 seconds</p>
                  </div>

                  {/* Instructions */}
                  <div className="rounded-xl bg-muted/40 border border-border p-4 space-y-3">
                    <p className="text-sm font-semibold flex items-center gap-2"><Smartphone size={15} className="text-primary" /> How to scan</p>
                    <ol className="space-y-2 text-sm text-muted-foreground list-none">
                      <li className="flex items-start gap-2"><span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">1</span>Open WhatsApp on your phone</li>
                      <li className="flex items-start gap-2"><span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">2</span>Go to <strong>Settings → Linked Devices → Link a Device</strong></li>
                      <li className="flex items-start gap-2"><span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">3</span>Point your camera at the QR code above</li>
                    </ol>
                  </div>

                  {/* Dev/demo shortcut — remove in production */}
                  <button
                    type="button"
                    className="w-full text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 text-center"
                    onClick={handleSimulateConnect}
                  >
                    Simulate successful scan (demo only)
                  </button>
                </div>
              ) : (
                <div className="rounded-xl bg-primary/10 border border-primary/30 p-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Check size={20} />
                  </div>
                  <div>
                    <p className="font-semibold">WhatsApp connected</p>
                    <p className="text-sm text-muted-foreground">Your account is linked via QR</p>
                  </div>
                </div>
              )}

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



          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="glass rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-2">
                <Power className="text-primary" />
                <h1 className="text-2xl font-display font-bold">Turn ON your AI assistant</h1>
              </div>
              <p className="text-muted-foreground mb-6">That's it! Switch it on and your AI will start replying to customers on WhatsApp.</p>

              <div className="rounded-xl border border-border p-6 flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${aiOn ? "bg-gradient-to-br from-primary to-accent text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    <Sparkles size={26} />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">AI Assistant</p>
                    <p className="text-sm text-muted-foreground">{aiOn ? "Active — replying to customers" : "Currently off"}</p>
                  </div>
                </div>
                <Switch checked={aiOn} onCheckedChange={setAiOn} className="scale-125" />
              </div>

              <div className="mt-6 grid gap-3">
                <div className="flex items-start gap-3 text-sm">
                  <Check size={16} className="text-primary mt-0.5" />
                  <span>Replies 24/7 in Hindi & English</span>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <Check size={16} className="text-primary mt-0.5" />
                  <span>Answers from your business details</span>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <Check size={16} className="text-primary mt-0.5" />
                  <span>You can turn it off anytime</span>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <Button variant="ghost" onClick={goBack}>
                  <ArrowLeft size={16} /> Back
                </Button>
                <Button variant="hero" size="lg" disabled={!aiOn} onClick={() => setStep(3)}>
                  Finish <ArrowRight size={16} />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-2xl p-10 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-5"
              >
                <Check size={40} className="text-primary-foreground" />
              </motion.div>
              <h1 className="text-3xl font-display font-bold mb-2">You're all set!</h1>
              <p className="text-muted-foreground mb-6">
                Your AI assistant is now live on WhatsApp. Send a test message to <strong>+91 {phone}</strong> to try it out.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="hero" size="lg" asChild>
                  <a href={`https://wa.me/91${phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                    Send a test message
                  </a>
                </Button>
                <Button variant="hero-outline" size="lg" onClick={() => { setStep(0); setAiOn(false); }}>
                  Edit setup
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Need help? WhatsApp us at <a href="https://wa.me/919999999999" className="text-primary hover:underline">support</a>
        </p>
      </main>
      </div>
    </div>
  );
};

export default Agent;

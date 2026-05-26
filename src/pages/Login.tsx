import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
//import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/use-language";
import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";

const copy = {
  hinglish: {
    trial: "Free 14-day trial",
    title: "Welcome to Briqlabs",
    subtitle: "Sign in to set up your AI assistant",
    google: "Continue with Google",
    termsStart: "By continuing, you agree to our",
    terms: "Terms",
    and: "and",
    privacy: "Privacy Policy",
    signInFailed: "Sign in failed. Please try again.",
    genericError: "Something went wrong",
  },
  en: {
    trial: "Free 14-day trial",
    title: "Welcome to Briqlabs",
    subtitle: "Sign in to set up your AI assistant",
    google: "Continue with Google",
    termsStart: "By continuing, you agree to our",
    terms: "Terms",
    and: "and",
    privacy: "Privacy Policy",
    signInFailed: "Sign in failed. Please try again.",
    genericError: "Something went wrong",
  },
  hi: {
    trial: "14 दिन का फ्री ट्रायल",
    title: "Briqlabs में आपका स्वागत है",
    subtitle: "AI assistant setup करने के लिए sign in करें",
    google: "Google से continue करें",
    termsStart: "Continue करके आप हमारी",
    terms: "Terms",
    and: "और",
    privacy: "Privacy Policy",
    signInFailed: "Sign in failed. कृपया फिर कोशिश करें.",
    genericError: "कुछ गलत हुआ",
  },
};

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
    <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.96H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.04l3.007-2.333z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.96l3.007 2.333C4.672 5.166 6.656 3.58 9 3.58z"/>
  </svg>
);

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const { language } = useLanguage();
  const t = copy[language];

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || "/agent";

  useEffect(() => {
    if (!loading && user) navigate(from, { replace: true });
  }, [loading, user, navigate, from]);
/*
  const signInWithGoogle = async () => {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/agent`,
      });
      if (result.error) {
        toast.error("Sign in failed. Please try again.");
        setBusy(false);
        return;
      }
      if (result.redirected) return;
      navigate(from, { replace: true });
    } catch (e) {
      toast.error("Something went wrong");
      setBusy(false);
    }
  }; */
  // ✅ REPLACE WITH THIS
const signInWithGoogle = async () => {
  setBusy(true);
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/agent`,
      },
    });
    if (error) {
      toast.error(t.signInFailed);
      setBusy(false);
    }
    // No navigate() needed — Supabase handles the redirect automatically
  } catch (e) {
    toast.error(t.genericError);
    setBusy(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-background hero-glow px-6">
      <div className="fixed right-4 top-4 flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass rounded-2xl p-8 glow-border"
      >
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="px-3 py-1.5 rounded-xl bg-gradient-to-br from-primary via-accent to-primary font-display font-extrabold text-primary-foreground text-base">
            Briqlabs
          </div>
          <span className="font-display font-extrabold text-xl text-primary">AI</span>
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
            <Sparkles size={12} /> {t.trial}
          </div>
          <h1 className="text-3xl font-display font-bold mb-2">{t.title}</h1>
          <p className="text-muted-foreground text-sm">{t.subtitle}</p>
        </div>

        <Button
          variant="hero-outline"
          size="lg"
          className="w-full bg-background hover:bg-muted"
          onClick={signInWithGoogle}
          disabled={busy}
        >
          {busy ? <Loader2 size={18} className="animate-spin" /> : <GoogleIcon />}
          {t.google}
        </Button>

        <p className="text-xs text-muted-foreground text-center mt-6">
          {t.termsStart}{" "}
          <Link to="/terms" target="_blank" className="text-primary hover:underline">{t.terms}</Link> {t.and}{" "}
          <Link to="/privacy" target="_blank" className="text-primary hover:underline">{t.privacy}</Link>.
        </p>
      </motion.div>
    </div>
  );
};

export default Login;

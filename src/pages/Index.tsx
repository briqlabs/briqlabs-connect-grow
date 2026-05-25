import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Sparkles, MessageCircle, Bot, Files, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [busy, setBusy] = useState(false);

  const startTrial = async () => {
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/agent` },
      });
      if (error) {
        setBusy(false);
      }
    } catch {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="text-lg font-semibold">Briqlabs AI</div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-slate-600 hover:text-slate-900">Sign in</Link>
            <Button onClick={startTrial} disabled={busy}>
              {busy ? <Loader2 size={16} className="animate-spin" /> : null}
              Start 14-day trial
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <section className="rounded-3xl bg-gradient-to-r from-blue-600 to-violet-600 p-8 text-white md:p-14">
          <div className="max-w-3xl space-y-5">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
              <Sparkles size={12} /> Business AI Platform
            </p>
            <h1 className="text-4xl font-bold leading-tight md:text-6xl">Automate customer conversations on WhatsApp with AI</h1>
            <p className="text-base text-white/90 md:text-lg">
              Upload your business knowledge, configure your AI bot prompt, connect WhatsApp, and let Briqlabs reply automatically.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                size="lg"
                className="bg-white text-slate-900 hover:bg-slate-100"
                onClick={startTrial}
                disabled={busy}
              >
                {busy ? <Loader2 size={16} className="animate-spin" /> : "Start 14-day trial"}
              </Button>
              <a href="#features" className="inline-flex items-center gap-2 rounded-md border border-white/40 px-5 py-2.5 text-sm font-medium hover:bg-white/10">
                Explore features <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </section>

        <section id="features" className="mt-12 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700">
              <Files size={22} />
            </div>
            <h2 className="text-xl font-semibold">Business Knowledge Base</h2>
            <p className="mt-2 text-sm text-slate-600">Store multiple business info entries and files so your bot answers with your latest business context.</p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <MessageCircle size={22} />
            </div>
            <h2 className="text-xl font-semibold">WhatsApp Connection</h2>
            <p className="mt-2 text-sm text-slate-600">Connect your WhatsApp instance with QR and keep conversations flowing through your existing channel.</p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-700">
              <Bot size={22} />
            </div>
            <h2 className="text-xl font-semibold">AI Bot Prompt Control</h2>
            <p className="mt-2 text-sm text-slate-600">Create, edit, and manage bot prompts with templates so each business responds in the right voice.</p>
          </article>
        </section>

        <section className="mt-12 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm md:p-10">
          <h3 className="text-3xl font-bold">Ready to launch your AI assistant?</h3>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Start your trial with Google sign-in. After login, your existing `/agent` onboarding and all backend workflows remain unchanged.
          </p>
          <div className="mt-6">
            <Button onClick={startTrial} size="lg" disabled={busy}>
              {busy ? <Loader2 size={16} className="animate-spin" /> : "Start 14-day trial"}
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-sm text-slate-500 md:flex-row">
          <p>© {new Date().getFullYear()} Briqlabs AI</p>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-slate-800">Terms</Link>
            <Link to="/privacy" className="hover:text-slate-800">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

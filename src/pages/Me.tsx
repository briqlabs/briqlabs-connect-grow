import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BrainCircuit, Github, Linkedin, MessageCircle, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import LeadFormDialog from "@/components/LeadFormDialog";
import type { LeadFormOpener } from "@/pages/Index";

const Me = () => {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("Get Started");

  const openForm: LeadFormOpener = (title = "Get Started") => {
    if (title === "Start Free Trial") {
      navigate("/agent");
      return;
    }
    setDialogTitle(title);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar openForm={openForm} />

      <main className="pt-24 pb-16">
        <section className="container mx-auto px-6">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/5 text-primary">
                Founder spotlight
              </Badge>
              <h1 className="max-w-3xl text-4xl font-black leading-tight text-foreground sm:text-5xl lg:text-6xl">
                Hi, I’m <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Harish Kumar</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                I’m the founder of Briqlabs AI, building AI agents that help Indian businesses turn WhatsApp into a growth channel with faster replies, better leads, and 24/7 support.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button variant="hero" asChild>
                  <a href="https://briqlabs.com">
                    See WhatsApp demo
                    <MessageCircle className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" onClick={() => openForm("Start Free Trial")}>
                  Start a project
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="https://github.com/briqlabs"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
                <a
                  href="https://www.linkedin.com/in/harish-kumar"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </a>
              </div>
            </div>

            <Card className="border-primary/20 shadow-2xl shadow-primary/10">
              <CardContent className="p-8">
                <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-primary/10 via-background to-accent/10 p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                      <BrainCircuit className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">About the mission</p>
                      <p className="text-lg font-semibold text-foreground">Helping founders grow with AI</p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4 text-sm text-muted-foreground">
                    <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                      <p className="font-semibold text-foreground">What I believe</p>
                      <p className="mt-1">Small businesses deserve the same automation power as large companies, without the complexity.</p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                      <p className="font-semibold text-foreground">What I build</p>
                      <p className="mt-1">WhatsApp AI agents, voice receptionists, and smart support flows tailored for real-world business needs.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="container mx-auto mt-16 px-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-border/70 bg-card/70 backdrop-blur">
              <CardContent className="p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Built for modern teams</h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">From clinics to coaching businesses, I help teams automate conversations without losing the personal touch.</p>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/70 backdrop-blur">
              <CardContent className="p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">WhatsApp-first experience</h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">The interface is designed to feel natural, human, and easy for customers to interact with from the first message.</p>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/70 backdrop-blur">
              <CardContent className="p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <BrainCircuit className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Practical AI, not hype</h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">Every solution is shaped around real business goals like lead capture, appointment booking, and support automation.</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
      <LeadFormDialog open={dialogOpen} onOpenChange={setDialogOpen} title={dialogTitle} />
    </div>
  );
};

export default Me;

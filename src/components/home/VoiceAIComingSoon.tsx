import { useState } from "react";
import { Phone, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function VoiceAIComingSoon() {
  const [email, setEmail] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Sahi email daaliye");
      return;
    }
    toast.success("Done! Launch hote hi notify karenge 🚀");
    setEmail("");
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto rounded-3xl border border-border bg-gradient-to-br from-accent/10 via-card to-primary/10 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
            <Phone size={28} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-semibold mb-3">
              <Bell size={12} /> Coming Soon
            </div>
            <h3 className="text-2xl md:text-3xl font-display font-bold">
              Voice AI Receptionist — <span className="gradient-text">jald aa raha hai</span>
            </h3>
            <p className="text-muted-foreground mt-2">
              Calls automatically receive karega, appointments book karega, FAQs answer karega — 24×7.
            </p>
          </div>
          <form onSubmit={submit} className="flex gap-2 w-full md:w-auto">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="md:w-56"
            />
            <Button type="submit" variant="hero">Notify me</Button>
          </form>
        </div>
      </div>
    </section>
  );
}

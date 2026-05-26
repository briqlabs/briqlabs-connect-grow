import { motion } from "framer-motion";
import { GraduationCap, Home, HeartPulse, Sofa, type LucideIcon } from "lucide-react";
import type { Vertical } from "./ChatMockup";

export const VERTICALS: Array<{
  id: Vertical;
  icon: LucideIcon;
  label: string;
  tagline: string;
}> = [
  { id: "coaching", icon: GraduationCap, label: "Coaching & EdTech", tagline: "Demo class auto-book karwao" },
  { id: "realestate", icon: Home, label: "Real Estate", tagline: "Site visit + brochure auto-send" },
  { id: "clinics", icon: HeartPulse, label: "Clinics & Salons", tagline: "Appointment + reminder + reschedule" },
  { id: "interior", icon: Sofa, label: "Interior Designers", tagline: "Lead qualify + portfolio share" },
];

export default function VerticalsSection({
  active,
  onSelect,
}: {
  active: Vertical;
  onSelect: (v: Vertical) => void;
}) {
  return (
    <section id="use-cases" className="py-20 md:py-28">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">Built For Indian SMBs</p>
          <h2 className="text-3xl md:text-5xl font-display font-bold">
            Aapka business, <span className="gradient-text">aapka agent</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Vertical select karo — agent uske hisaab se reply karta hai, leads qualify karta hai, aur bookings handle karta hai.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {VERTICALS.map((v) => {
            const Icon = v.icon;
            const isActive = v.id === active;
            return (
              <button
                key={v.id}
                onClick={() => onSelect(v.id)}
                className={`text-left rounded-2xl p-5 border transition-all ${
                  isActive
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${
                  isActive ? "bg-gradient-to-br from-primary to-accent text-primary-foreground" : "bg-muted text-foreground"
                }`}>
                  <Icon size={20} />
                </div>
                <p className="font-semibold">{v.label}</p>
                <p className="text-sm text-muted-foreground mt-1">{v.tagline}</p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
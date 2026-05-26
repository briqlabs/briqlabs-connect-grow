import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LeadFormOpener } from "@/pages/Index";
import ThemeToggle from "@/components/ThemeToggle";

const Navbar = ({ openForm }: { openForm: LeadFormOpener }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto flex items-center justify-between h-16 px-6">
        <a href="/" className="flex items-center gap-2 group">
          <div className="relative px-3 py-1.5 rounded-xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center font-display font-extrabold text-primary-foreground text-base tracking-tight shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow duration-300">
            <span className="relative z-10">Briqlabs</span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <span className="font-display font-extrabold text-xl tracking-tight text-primary">AI</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          <a href="#use-cases" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Use cases</a>
          <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
          <span className="text-xs px-2 py-0.5 rounded-full bg-accent/15 text-accent">Voice AI · soon</span>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          <Button variant="hero" size="sm" onClick={() => openForm("Start Free Trial")}>Start free trial</Button>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-border"
          >
            <div className="flex flex-col gap-4 p-6">
              <a href="#use-cases" className="text-sm text-muted-foreground hover:text-foreground">Use cases</a>
              <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground">FAQ</a>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <Button variant="hero" size="sm" onClick={() => { openForm("Start Free Trial"); setMobileOpen(false); }}>Start free trial</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

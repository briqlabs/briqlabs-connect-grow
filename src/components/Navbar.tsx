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
        <a href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center font-display font-extrabold text-primary-foreground text-lg tracking-tight shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow duration-300">
            <span className="relative z-10">B</span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-foreground">
            Briqlabs<span className="text-primary ml-1.5 font-extrabold">AI</span>
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          <a href="#products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Products</a>
          <a href="#whatsapp" className="text-sm text-muted-foreground hover:text-foreground transition-colors">WhatsApp AI</a>
          <a href="#voice" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Voice AI</a>
          <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          <Button variant="hero" size="sm" onClick={() => openForm("Get Started")}>Get Started</Button>
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
              <a href="#products" className="text-sm text-muted-foreground hover:text-foreground">Products</a>
              <a href="#whatsapp" className="text-sm text-muted-foreground hover:text-foreground">WhatsApp AI</a>
              <a href="#voice" className="text-sm text-muted-foreground hover:text-foreground">Voice AI</a>
              <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground">Contact</a>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <Button variant="hero" size="sm" onClick={() => { openForm("Get Started"); setMobileOpen(false); }}>Get Started</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

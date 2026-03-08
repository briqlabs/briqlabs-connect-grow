import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LeadFormOpener } from "@/pages/Index";

const Navbar = ({ openForm }: { openForm: LeadFormOpener }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto flex items-center justify-between h-16 px-6">
        <a href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center font-display font-bold text-primary-foreground text-sm">
            B
          </div>
          <span className="font-display font-semibold text-lg text-foreground">
            Briqlabs <span className="text-primary">AI</span>
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          <a href="#products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Products</a>
          <a href="#whatsapp" className="text-sm text-muted-foreground hover:text-foreground transition-colors">WhatsApp AI</a>
          <a href="#voice" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Voice AI</a>
          <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
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
              <Button variant="hero" size="sm" onClick={() => { openForm("Get Started"); setMobileOpen(false); }}>Get Started</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProductsSection from "@/components/ProductsSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import LeadFormDialog from "@/components/LeadFormDialog";

export type LeadFormOpener = (title?: string) => void;

const Index = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("Get Started");

  const openForm: LeadFormOpener = (title = "Get Started") => {
    setDialogTitle(title);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar openForm={openForm} />
      <HeroSection openForm={openForm} />
      <ProductsSection openForm={openForm} />
      <CTASection openForm={openForm} />
      <Footer />
      <LeadFormDialog open={dialogOpen} onOpenChange={setDialogOpen} title={dialogTitle} />
    </div>
  );
};

export default Index;

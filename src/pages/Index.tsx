import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSectionV2 from "@/components/home/HeroSectionV2";
import VerticalsSection from "@/components/home/VerticalsSection";
import HowItWorks from "@/components/home/HowItWorks";
import FeaturesGrid from "@/components/home/FeaturesGrid";
import VoiceAIComingSoon from "@/components/home/VoiceAIComingSoon";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import FAQSection from "@/components/home/FAQSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import LeadFormDialog from "@/components/LeadFormDialog";
import type { Vertical } from "@/components/home/ChatMockup";

export type LeadFormOpener = (title?: string) => void;

const Index = () => {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("Get Started");
  const [vertical, setVertical] = useState<Vertical>("coaching");

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
      <HeroSectionV2 openForm={openForm} vertical={vertical} setVertical={setVertical} />
      <VerticalsSection active={vertical} onSelect={setVertical} />
      <HowItWorks />
      <FeaturesGrid />
      <VoiceAIComingSoon />
      <TestimonialsSection />
      <FAQSection />
      <CTASection openForm={openForm} />
      <Footer />
      <LeadFormDialog open={dialogOpen} onOpenChange={setDialogOpen} title={dialogTitle} />
    </div>
  );
};

export default Index;

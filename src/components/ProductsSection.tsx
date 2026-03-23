import { useState } from "react";
import { MessageCircle, Phone } from "lucide-react";
import ProductCard from "./ProductCard";
import { motion } from "framer-motion";
import WhatsAppDemoDialog from "./WhatsAppDemoDialog";
import VoiceAIDemoDialog from "./VoiceAIDemoDialog";
interface ProductsSectionProps {
  openForm?: (title?: string) => void;
}

const ProductsSection = ({ openForm }: ProductsSectionProps) => {
  const [whatsappDemoOpen, setWhatsappDemoOpen] = useState(false);
  const [voiceDemoOpen, setVoiceDemoOpen] = useState(false);
  return (
    <>
      <section id="products" className="py-24 md:py-32 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">Our Products</p>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">
              Two AI Agents. <span className="gradient-text">Infinite Growth.</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div id="whatsapp">
              <ProductCard
                icon={MessageCircle}
                title="WhatsApp AI Agent"
                subtitle="Lead Generation & Follow-ups"
                description="Automate your entire WhatsApp sales pipeline. Our AI agent engages leads, qualifies prospects, and sends intelligent follow-ups — all on autopilot."
                features={[
                  "Automated lead qualification",
                  "Smart follow-up sequences",
                  "Personalized conversations at scale",
                  "Real-time CRM integration",
                  "Multi-language support",
                ]}
                gradient="primary"
                delay={0}
                onLearnMore={() => setWhatsappDemoOpen(true)}
              />
            </div>
            <div id="voice">
              <ProductCard
                icon={Phone}
                title="Voice AI Receptionist"
                subtitle="Front Desk Automation"
                description="Never miss an appointment again. Our Voice AI handles incoming calls, books appointments, answers FAQs, and manages your front desk 24/7."
                features={[
                  "Natural voice conversations",
                  "Instant appointment booking",
                  "Calendar integration",
                  "Call routing & transfers",
                  "After-hours coverage",
                ]}
                gradient="accent"
                delay={0.2}
              />
            </div>
          </div>
        </div>
      </section>

      <WhatsAppDemoDialog
        open={whatsappDemoOpen}
        onOpenChange={setWhatsappDemoOpen}
        onGetStarted={() => openForm?.("Start Free Trial")}
      />
    </>
  );
};

export default ProductsSection;

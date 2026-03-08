import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, MessageCircle, Bot, Zap, Users, Globe, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import LeadFormDialog from "@/components/LeadFormDialog";
import whatsappQualification from "@/assets/whatsapp-lead-qualification.png";
import whatsappFollowUps from "@/assets/whatsapp-follow-ups.png";
import whatsappCRM from "@/assets/whatsapp-crm.png";

const sections = [
  {
    badge: "24x7 AI Lead Qualification",
    title: "Qualify & Manage Leads With Intelligent Automation",
    image: whatsappQualification,
    features: [
      { icon: Bot, title: "AI-Powered Qualification Agent", desc: "Engage leads instantly and identify customer intent around the clock" },
      { icon: Zap, title: "Custom Prompt Setup", desc: "Aligned with your sales processes for effective lead handling" },
      { icon: MessageCircle, title: "Message Bump-Ups", desc: "Smart reminders to ensure no opportunity is ever missed" },
      { icon: BarChart3, title: "Smart Lead Progression", desc: "Predefined triggers to auto-shift qualified leads through your pipeline" },
    ],
  },
  {
    badge: "Automated Lead Nurturing",
    title: "Streamline Communication With Automated AI Follow-Ups",
    image: whatsappFollowUps,
    features: [
      { icon: Zap, title: "Automated Follow-Ups", desc: "Tailored sequences for timely communication at scale" },
      { icon: BarChart3, title: "Intelligent Response Tracking", desc: "Instantly notify your sales team for faster interaction" },
      { icon: Users, title: "Lead Engagement", desc: "Engage leads to capture and maximize their attention" },
      { icon: MessageCircle, title: "Tailored Message Sequences", desc: "Customized workflows that drive higher conversions" },
    ],
  },
  {
    badge: "Advanced Closing Tools",
    title: "Close Deals Faster With WhatsApp CRM Integration",
    image: whatsappCRM,
    features: [
      { icon: MessageCircle, title: "Customized WhatsApp CRM", desc: "Manage and track leads directly within WhatsApp" },
      { icon: Bot, title: "AI-Powered Replies", desc: "Respond instantly to queries, helping close deals faster" },
      { icon: Globe, title: "Multi-Language Support", desc: "Engage prospects in their preferred language automatically" },
      { icon: Users, title: "Integrated Communication Tools", desc: "Seamless and efficient interaction for your entire sales team" },
    ],
  },
];

const WhatsAppAI = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container mx-auto flex items-center justify-between h-16 px-6">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <span className="font-display font-semibold text-lg text-foreground">
            WhatsApp <span className="text-primary">AI Agent</span>
          </span>
          <Button variant="hero" size="sm" onClick={() => setDialogOpen(true)}>
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 hero-glow relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary/5 blur-3xl animate-float" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6 text-sm text-muted-foreground">
              <MessageCircle size={14} className="text-primary" />
              WhatsApp AI Agent
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight mb-6 max-w-3xl mx-auto">
              Automate Your Entire <span className="gradient-text">WhatsApp Sales Pipeline</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              From lead qualification to closing deals — our AI agent engages, qualifies, and follows up with prospects on WhatsApp, 24/7.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="hero" size="lg" className="text-base px-8 py-6" onClick={() => setDialogOpen(true)}>
                Start Free Trial <ArrowRight size={18} />
              </Button>
              <Button variant="hero-outline" size="lg" className="text-base px-8 py-6" onClick={() => setDialogOpen(true)}>
                Book a Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature sections */}
      {sections.map((section, idx) => (
        <section key={idx} className="py-20 md:py-28">
          <div className="container mx-auto px-6">
            <div className={`grid md:grid-cols-2 gap-12 md:gap-16 items-center ${idx % 2 === 1 ? "md:[direction:rtl]" : ""}`}>
              {/* Image */}
              <motion.div
                initial={{ opacity: 0, x: idx % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="md:[direction:ltr]"
              >
                <div className="rounded-2xl overflow-hidden border border-border glow-border">
                  <img src={section.image} alt={section.badge} className="w-full h-auto" loading="lazy" />
                </div>
              </motion.div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, x: idx % 2 === 0 ? 40 : -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="md:[direction:ltr]"
              >
                <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
                  {section.badge}
                </span>
                <h2 className="text-2xl md:text-4xl font-display font-bold text-foreground mb-8">
                  {section.title}
                </h2>

                <div className="space-y-6">
                  {section.features.map((feat, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <feat.icon size={20} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">{feat.title}</h3>
                        <p className="text-sm text-muted-foreground">{feat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      ))}

      {/* Bottom CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 hero-glow" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
              Ready to <span className="gradient-text">Transform</span> Your WhatsApp Sales?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Join 500+ businesses already using Briqlabs WhatsApp AI Agent to close more deals.
            </p>
            <Button variant="hero" size="lg" className="text-base px-8 py-6" onClick={() => setDialogOpen(true)}>
              Get Started Now <ArrowRight size={18} />
            </Button>
          </motion.div>
        </div>
      </section>

      <LeadFormDialog open={dialogOpen} onOpenChange={setDialogOpen} title="Get Started" />
    </div>
  );
};

export default WhatsAppAI;

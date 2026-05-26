import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/hooks/use-language";
import type { Language } from "@/hooks/use-language";
import { useNavigate } from "react-router-dom";

type LegalSection = [string, string | string[]];

const copy: Record<Language, { title: string; updated: string; sections: LegalSection[] }> = {
  hinglish: {
    title: "Terms & Conditions",
    updated: "Last updated",
    sections: [
      ["1. Acceptance of Terms", "By accessing or using Briqlabs AI's services, website, or products, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our services."],
      ["2. Services", "Briqlabs AI provides AI-powered automation solutions including WhatsApp AI agents, Voice AI agents, and related services. We reserve the right to modify, suspend, or discontinue any part of our services at any time."],
      ["3. User Responsibilities", ["Provide accurate and complete information when using our services", "Use our services only for lawful purposes", "Not attempt to reverse-engineer, copy, or redistribute our technology", "Maintain the confidentiality of your account credentials"]],
      ["4. Intellectual Property", "All content, trademarks, and technology on this platform are owned by Briqlabs AI. You may not use, reproduce, or distribute any materials without prior written consent."],
      ["5. Limitation of Liability", "Briqlabs AI shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services. Our total liability is limited to the amount paid by you for the services in the preceding 12 months."],
      ["6. Termination", "We may terminate or suspend your access to our services at our sole discretion, without prior notice, for conduct that we believe violates these Terms or is harmful to other users or our business."],
      ["7. Governing Law", "These Terms shall be governed by and construed in accordance with applicable laws. Any disputes shall be resolved through binding arbitration."],
      ["8. Contact Us", "For questions about these Terms, contact us at"],
    ],
  },
  en: {
    title: "Terms & Conditions",
    updated: "Last updated",
    sections: [
      ["1. Acceptance of Terms", "By accessing or using Briqlabs AI's services, website, or products, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our services."],
      ["2. Services", "Briqlabs AI provides AI-powered automation solutions including WhatsApp AI agents, Voice AI agents, and related services. We reserve the right to modify, suspend, or discontinue any part of our services at any time."],
      ["3. User Responsibilities", ["Provide accurate and complete information when using our services", "Use our services only for lawful purposes", "Do not attempt to reverse-engineer, copy, or redistribute our technology", "Maintain the confidentiality of your account credentials"]],
      ["4. Intellectual Property", "All content, trademarks, and technology on this platform are owned by Briqlabs AI. You may not use, reproduce, or distribute any materials without prior written consent."],
      ["5. Limitation of Liability", "Briqlabs AI shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services. Our total liability is limited to the amount paid by you for the services in the preceding 12 months."],
      ["6. Termination", "We may terminate or suspend your access to our services at our sole discretion, without prior notice, for conduct that we believe violates these Terms or is harmful to other users or our business."],
      ["7. Governing Law", "These Terms shall be governed by and construed in accordance with applicable laws. Any disputes shall be resolved through binding arbitration."],
      ["8. Contact Us", "For questions about these Terms, contact us at"],
    ],
  },
  hi: {
    title: "नियम और शर्तें",
    updated: "अंतिम अपडेट",
    sections: [
      ["1. Terms की स्वीकृति", "Briqlabs AI की services, website या products access/use करके आप इन Terms & Conditions से सहमत होते हैं. अगर आप सहमत नहीं हैं, कृपया services use न करें."],
      ["2. Services", "Briqlabs AI WhatsApp AI agents, Voice AI agents और related services सहित AI-powered automation solutions देता है. हम किसी भी service को modify, suspend या discontinue कर सकते हैं."],
      ["3. User Responsibilities", ["Services use करते समय accurate और complete information दें", "Services केवल lawful purposes के लिए use करें", "हमारी technology को reverse-engineer, copy या redistribute करने की कोशिश न करें", "अपने account credentials confidential रखें"]],
      ["4. Intellectual Property", "इस platform का content, trademarks और technology Briqlabs AI की property है. Prior written consent के बिना material use, reproduce या distribute नहीं कर सकते."],
      ["5. Limitation of Liability", "Services use से होने वाले indirect, incidental या consequential damages के लिए Briqlabs AI liable नहीं होगा. हमारी total liability पिछले 12 months में paid amount तक limited है."],
      ["6. Termination", "अगर conduct इन Terms का violation करता है या users/business के लिए harmful है, तो हम access terminate या suspend कर सकते हैं."],
      ["7. Governing Law", "ये Terms applicable laws के अनुसार governed होंगे. Disputes binding arbitration से resolve होंगे."],
      ["8. Contact Us", "इन Terms से जुड़े सवालों के लिए हमें contact करें:"],
    ],
  },
};

const Terms = () => {
  const navigate = useNavigate();
  const openForm = () => navigate("/agent");
  const { language } = useLanguage();
  const t = copy[language];

  return (
    <div className="min-h-screen bg-background">
      <Navbar openForm={openForm} />
      <main className="container mx-auto px-6 pt-24 pb-16 max-w-3xl">
        <h1 className="text-3xl font-display font-bold text-foreground mb-8">{t.title}</h1>
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p className="text-sm">{t.updated}: {new Date().toLocaleDateString(language === "hi" ? "hi-IN" : "en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
          {t.sections.map(([title, body], index) => (
            <section key={title} className="space-y-3">
              <h2 className="text-xl font-display font-semibold text-foreground">{title}</h2>
              {Array.isArray(body) ? (
                <ul className="list-disc pl-5 space-y-1">
                  {body.map((item) => <li key={item}>{item}</li>)}
                </ul>
              ) : index === t.sections.length - 1 ? (
                <p>{body} <a href="mailto:hello@briqlabs.com" className="text-primary hover:underline">hello@briqlabs.com</a>.</p>
              ) : (
                <p>{body}</p>
              )}
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;

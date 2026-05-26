import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/hooks/use-language";
import type { Language } from "@/hooks/use-language";
import { useNavigate } from "react-router-dom";

type LegalSection = [string, string | string[]];

const copy: Record<Language, { title: string; updated: string; sections: LegalSection[] }> = {
  hinglish: {
    title: "Privacy Policy",
    updated: "Last updated",
    sections: [
      ["1. Information We Collect", "We collect information you provide directly, including your name, email address, phone number, and business details when you fill out forms or contact us. We also collect usage data such as IP address, browser type, and pages visited through cookies and similar technologies."],
      ["2. How We Use Your Information", ["To provide, maintain, and improve our AI products and services", "To communicate with you about updates, promotions, and support", "To process your requests and respond to inquiries", "To analyze usage patterns and optimize user experience", "To comply with legal obligations"]],
      ["3. Data Sharing", "We do not sell your personal information. We may share data with trusted service providers who assist in operating our platform, subject to confidentiality agreements. We may also disclose information when required by law or to protect our rights."],
      ["4. Data Security", "We implement industry-standard security measures to protect your data, including encryption, secure servers, and access controls. However, no method of transmission over the internet is 100% secure."],
      ["5. Your Rights", "You have the right to access, update, or delete your personal information. You may opt out of marketing communications at any time. To exercise these rights, contact us at the details provided below."],
      ["6. Contact Us", "If you have questions about this Privacy Policy, please contact us at"],
    ],
  },
  en: {
    title: "Privacy Policy",
    updated: "Last updated",
    sections: [
      ["1. Information We Collect", "We collect information you provide directly, including your name, email address, phone number, and business details when you fill out forms or contact us. We also collect usage data such as IP address, browser type, and pages visited through cookies and similar technologies."],
      ["2. How We Use Your Information", ["To provide, maintain, and improve our AI products and services", "To communicate with you about updates, promotions, and support", "To process your requests and respond to inquiries", "To analyze usage patterns and optimize user experience", "To comply with legal obligations"]],
      ["3. Data Sharing", "We do not sell your personal information. We may share data with trusted service providers who assist in operating our platform, subject to confidentiality agreements. We may also disclose information when required by law or to protect our rights."],
      ["4. Data Security", "We implement industry-standard security measures to protect your data, including encryption, secure servers, and access controls. However, no method of transmission over the internet is 100% secure."],
      ["5. Your Rights", "You have the right to access, update, or delete your personal information. You may opt out of marketing communications at any time. To exercise these rights, contact us at the details provided below."],
      ["6. Contact Us", "If you have questions about this Privacy Policy, please contact us at"],
    ],
  },
  hi: {
    title: "गोपनीयता नीति",
    updated: "अंतिम अपडेट",
    sections: [
      ["1. हम कौन सी जानकारी collect करते हैं", "जब आप forms भरते हैं या हमें contact करते हैं, हम आपका नाम, email, phone number और business details collect करते हैं. Cookies और similar technologies से IP address, browser type और visited pages जैसा usage data भी collect हो सकता है."],
      ["2. हम आपकी जानकारी कैसे use करते हैं", ["AI products और services provide, maintain और improve करने के लिए", "Updates, promotions और support के बारे में communicate करने के लिए", "आपके requests process करने और inquiries का जवाब देने के लिए", "Usage patterns analyze करके user experience optimize करने के लिए", "Legal obligations comply करने के लिए"]],
      ["3. Data Sharing", "हम आपकी personal information sell नहीं करते. Platform operate करने में मदद करने वाले trusted service providers के साथ confidentiality agreements के तहत data share हो सकता है. Law requirement या rights protect करने के लिए भी disclosure हो सकता है."],
      ["4. Data Security", "हम encryption, secure servers और access controls जैसे industry-standard security measures use करते हैं. फिर भी internet transmission का कोई method 100% secure नहीं होता."],
      ["5. आपके Rights", "आप अपनी personal information access, update या delete कर सकते हैं. Marketing communications से opt out कर सकते हैं. इन rights के लिए नीचे दिए contact details पर लिखें."],
      ["6. Contact Us", "इस Privacy Policy पर सवाल हों तो contact करें:"],
    ],
  },
};

const Privacy = () => {
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

export default Privacy;

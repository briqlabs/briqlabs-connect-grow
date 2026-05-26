import { useLanguage } from "@/hooks/use-language";

const copy = {
  hinglish: {
    privacy: "Privacy Policy",
    terms: "Terms & Conditions",
    rights: "All rights reserved.",
  },
  en: {
    privacy: "Privacy Policy",
    terms: "Terms & Conditions",
    rights: "All rights reserved.",
  },
  hi: {
    privacy: "गोपनीयता नीति",
    terms: "नियम और शर्तें",
    rights: "सर्वाधिकार सुरक्षित.",
  },
};

const Footer = () => {
  const { language } = useLanguage();
  const t = copy[language];

  return (
    <footer className="border-t border-border py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center font-display font-bold text-primary-foreground text-xs">
              B
            </div>
            <span className="font-display font-semibold text-foreground">
              Briqlabs <span className="text-primary">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.privacy}</a>
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.terms}</a>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Briqlabs AI. {t.rights}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLanguage } from "@/hooks/use-language";

interface LeadFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
}

const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSd0cg9vz0UEeaCjG3G8KVSGEx6vfo0SmiZ659rflnBNFB2H4Q/viewform?embedded=true";

const copy = {
  hinglish: {
    fallbackTitle: "Get Started",
    desc: "Fill in your details and we'll reach out to you.",
    frameTitle: "Contact Form",
    loading: "Loading…",
  },
  en: {
    fallbackTitle: "Get Started",
    desc: "Fill in your details and we'll reach out to you.",
    frameTitle: "Contact Form",
    loading: "Loading…",
  },
  hi: {
    fallbackTitle: "शुरू करें",
    desc: "अपनी details भरें, हम आपसे contact करेंगे.",
    frameTitle: "Contact Form",
    loading: "Loading…",
  },
};

const LeadFormDialog = ({ open, onOpenChange, title = "Get Started" }: LeadFormDialogProps) => {
  const { language } = useLanguage();
  const t = copy[language];
  const displayTitle = title === "Get Started" ? t.fallbackTitle : title;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border sm:max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{displayTitle}</DialogTitle>
          <DialogDescription>{t.desc}</DialogDescription>
        </DialogHeader>
        <div className="overflow-hidden rounded-md" style={{ height: 450 }}>
          <iframe
            src={GOOGLE_FORM_URL}
            width="100%"
            height={550}
            frameBorder={0}
            marginHeight={0}
            marginWidth={0}
            className="rounded-md border-0"
            title={t.frameTitle}
            style={{ marginTop: -100 }}
          >
            {t.loading}
          </iframe>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadFormDialog;

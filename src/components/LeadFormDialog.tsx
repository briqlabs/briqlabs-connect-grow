import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface LeadFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
}

const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSd0cg9vz0UEeaCjG3G8KVSGEx6vfo0SmiZ659rflnBNFB2H4Q/viewform?embedded=true";

const LeadFormDialog = ({ open, onOpenChange, title = "Get Started" }: LeadFormDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border sm:max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{title}</DialogTitle>
          <DialogDescription>Fill in your details and we'll reach out to you.</DialogDescription>
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
            title="Contact Form"
            style={{ marginTop: -100 }}
          >
            Loading…
          </iframe>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadFormDialog;

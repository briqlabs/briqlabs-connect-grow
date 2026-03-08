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
        <iframe
          src={GOOGLE_FORM_URL}
          width="100%"
          height="450"
          frameBorder={0}
          marginHeight={0}
          marginWidth={0}
          className="rounded-md"
          title="Contact Form"
        >
          Loading…
        </iframe>
      </DialogContent>
    </Dialog>
  );
};

export default LeadFormDialog;

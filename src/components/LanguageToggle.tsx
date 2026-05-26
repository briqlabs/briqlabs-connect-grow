import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";

const LanguageToggle = () => {
  const { cycleLanguage, label, shortLabel } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycleLanguage}
      className="h-9 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
      aria-label={`Change language. Current language: ${label}`}
      title={`Language: ${label}`}
    >
      <Languages size={17} />
      <span className="text-xs font-semibold">{shortLabel}</span>
    </Button>
  );
};

export default LanguageToggle;


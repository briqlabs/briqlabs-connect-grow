import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface ProductCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  gradient: "primary" | "accent";
  delay?: number;
  onLearnMore?: () => void;
}

const ProductCard = ({ icon: Icon, title, subtitle, description, features, gradient, delay = 0, onLearnMore }: ProductCardProps) => {
  const gradientStyles = {
    primary: "from-primary/20 to-primary/5 border-primary/20 hover:border-primary/40",
    accent: "from-accent/20 to-accent/5 border-accent/20 hover:border-accent/40",
  };

  const iconBg = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className={`relative rounded-2xl bg-gradient-to-b ${gradientStyles[gradient]} border p-8 md:p-10 transition-all duration-300 group`}
    >
      <div className={`w-14 h-14 rounded-xl ${iconBg[gradient]} flex items-center justify-center mb-6`}>
        <Icon size={28} />
      </div>

      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">{subtitle}</p>
      <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">{title}</h3>
      <p className="text-muted-foreground leading-relaxed mb-8">{description}</p>

      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3 text-sm text-secondary-foreground">
            <div className={`w-1.5 h-1.5 rounded-full ${gradient === "primary" ? "bg-primary" : "bg-accent"}`} />
            {feature}
          </li>
        ))}
      </ul>

      <Button variant={gradient === "primary" ? "hero" : "hero-outline"} className="group-hover:translate-x-1 transition-transform" onClick={onLearnMore}>
        Learn More <ArrowRight size={16} />
      </Button>
    </motion.div>
  );
};

export default ProductCard;

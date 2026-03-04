import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  value?: string;
  trend?: string;
  variant?: "primary" | "accent" | "warning" | "default";
  className?: string;
  onClick?: () => void;
}

const variantStyles = {
  primary: "glow-primary border-primary/20",
  accent: "glow-accent border-accent/20",
  warning: "glow-warning border-warning/20",
  default: "",
};

const iconBgStyles = {
  primary: "gradient-primary",
  accent: "gradient-accent",
  warning: "gradient-warm",
  default: "bg-secondary",
};

const FeatureCard = ({ title, description, icon: Icon, value, trend, variant = "default", className, onClick }: FeatureCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn(
        "glass rounded-xl p-5 cursor-pointer transition-all",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", iconBgStyles[variant])}>
          <Icon className="w-5 h-5 text-primary-foreground" />
        </div>
        {trend && (
          <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      {value && <p className="text-2xl font-bold text-foreground mb-1">{value}</p>}
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </motion.div>
  );
};

export default FeatureCard;

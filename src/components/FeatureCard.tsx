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

const iconBgStyles = {
  primary: "hero-gradient-subtle",
  accent: "bg-accent",
  warning: "bg-warning",
  default: "bg-secondary",
};

const FeatureCard = ({ title, description, icon: Icon, value, trend, variant = "default", className, onClick }: FeatureCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn(
        "glass-card-hover rounded-2xl p-5 cursor-pointer",
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", iconBgStyles[variant])}>
          <Icon className="w-5 h-5 text-primary-foreground" />
        </div>
        {trend && (
          <span className="text-xs font-semibold text-accent bg-accent/10 px-2.5 py-1 rounded-full">
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

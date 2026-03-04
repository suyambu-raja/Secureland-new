import { motion } from "framer-motion";
import { AlertTriangle, Info, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertCardProps {
  title: string;
  description: string;
  timestamp: string;
  severity: "critical" | "warning" | "info" | "success";
}

const severityConfig = {
  critical: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20" },
  warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10", border: "border-warning/20" },
  info: { icon: Info, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  success: { icon: CheckCircle, color: "text-accent", bg: "bg-accent/10", border: "border-accent/20" },
};

const AlertCard = ({ title, description, timestamp, severity }: AlertCardProps) => {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn("glass rounded-lg p-4 border", config.border)}
    >
      <div className="flex items-start gap-3">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", config.bg)}>
          <Icon className={cn("w-4 h-4", config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-foreground">{title}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{timestamp}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AlertCard;

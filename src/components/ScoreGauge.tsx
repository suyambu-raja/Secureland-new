import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScoreGaugeProps {
  score: number;
  label: string;
  maxScore?: number;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "accent" | "warning" | "destructive";
}

const colorMap = {
  primary: { stroke: "hsl(209, 82%, 30%)", bg: "hsl(209, 82%, 30%, 0.1)" },
  accent: { stroke: "hsl(145, 65%, 32%)", bg: "hsl(145, 65%, 32%, 0.1)" },
  warning: { stroke: "hsl(38, 92%, 50%)", bg: "hsl(38, 92%, 50%, 0.1)" },
  destructive: { stroke: "hsl(0, 72%, 51%)", bg: "hsl(0, 72%, 51%, 0.1)" },
};

const sizeMap = {
  sm: { size: 80, stroke: 6, text: "text-lg" },
  md: { size: 100, stroke: 8, text: "text-2xl" },
  lg: { size: 130, stroke: 10, text: "text-3xl" },
};

const ScoreGauge = ({ score, label, maxScore = 100, size = "md", variant = "primary" }: ScoreGaugeProps) => {
  const percent = Math.min((score / maxScore) * 100, 100);
  const { size: sz, stroke, text } = sizeMap[size];
  const { stroke: strokeColor, bg } = colorMap[variant];
  const radius = (sz - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: sz, height: sz }}>
        <svg width={sz} height={sz} className="-rotate-90">
          <circle cx={sz / 2} cy={sz / 2} r={radius} stroke={bg} strokeWidth={stroke} fill="none" />
          <motion.circle
            cx={sz / 2} cy={sz / 2} r={radius}
            stroke={strokeColor} strokeWidth={stroke} fill="none" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-bold text-foreground", text)}>{score}</span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
    </div>
  );
};

export default ScoreGauge;

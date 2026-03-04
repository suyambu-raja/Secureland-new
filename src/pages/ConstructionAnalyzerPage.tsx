import { motion } from "framer-motion";
import { Building2, Droplets, Mountain, Activity } from "lucide-react";
import ScoreGauge from "@/components/ScoreGauge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const stabilityData = [
  { name: "Flood Risk", score: 25, fill: "hsl(217, 91%, 60%)" },
  { name: "Soil Strength", score: 82, fill: "hsl(160, 84%, 39%)" },
  { name: "Earthquake Zone", score: 45, fill: "hsl(38, 92%, 50%)" },
  { name: "Land Slope", score: 78, fill: "hsl(200, 90%, 50%)" },
];

const ConstructionAnalyzerPage = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Construction Stability Analyzer</h1>
        <p className="text-sm text-muted-foreground mt-1">AI-powered safety analysis for construction planning</p>
      </div>

      <div className="glass rounded-xl p-8 text-center">
        <h3 className="text-sm text-muted-foreground mb-4">Overall Construction Stability Score</h3>
        <ScoreGauge score={76} label="Stability Score" variant="primary" size="lg" />
        <p className="text-sm text-accent font-medium mt-4">Good — Suitable for construction with precautions</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { icon: Droplets, label: "Flood Risk", score: 25, variant: "accent" as const, desc: "Low risk zone" },
          { icon: Mountain, label: "Soil Strength", score: 82, variant: "primary" as const, desc: "Strong foundation" },
          { icon: Activity, label: "Earthquake Zone", score: 45, variant: "warning" as const, desc: "Moderate zone III" },
          { icon: Building2, label: "Land Slope", score: 78, variant: "primary" as const, desc: "Gentle slope" },
        ].map((item) => (
          <div key={item.label} className="glass rounded-xl p-5 text-center">
            <ScoreGauge score={item.score} label={item.label} variant={item.variant} size="sm" />
            <p className="text-xs text-muted-foreground mt-2">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Risk Breakdown</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={stabilityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
            <XAxis dataKey="name" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }} axisLine={false} />
            <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }} axisLine={false} />
            <Tooltip
              contentStyle={{ background: "hsl(222, 47%, 9%)", border: "1px solid hsl(222, 30%, 18%)", borderRadius: 8 }}
              labelStyle={{ color: "hsl(210, 40%, 96%)" }}
            />
            <Bar dataKey="score" radius={[6, 6, 0, 0]} fill="hsl(217, 91%, 60%)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default ConstructionAnalyzerPage;

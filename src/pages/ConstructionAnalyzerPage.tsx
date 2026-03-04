import { motion } from "framer-motion";
import { Building2, Droplets, Mountain, Activity } from "lucide-react";
import ScoreGauge from "@/components/ScoreGauge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const stabilityData = [
  { name: "Flood Risk", score: 25 },
  { name: "Soil Strength", score: 82 },
  { name: "Earthquake", score: 45 },
  { name: "Land Slope", score: 78 },
];

const ConstructionAnalyzerPage = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl space-y-6">
      <div className="hero-gradient rounded-2xl p-8 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 80% 50%, hsla(190,100%,50%,0.3) 0%, transparent 50%)`
        }} />
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-1">Construction Stability Analyzer</h1>
          <p className="text-primary-foreground/60 text-sm">AI-powered safety analysis for construction planning</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-8 text-center">
        <h3 className="text-sm text-muted-foreground mb-4 font-medium">Overall Construction Stability Score</h3>
        <ScoreGauge score={76} label="Stability Score" variant="primary" size="lg" />
        <p className="text-sm text-accent font-semibold mt-4">Good — Suitable for construction with precautions</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { icon: Droplets, label: "Flood Risk", score: 25, variant: "accent" as const, desc: "Low risk zone" },
          { icon: Mountain, label: "Soil Strength", score: 82, variant: "primary" as const, desc: "Strong foundation" },
          { icon: Activity, label: "Earthquake Zone", score: 45, variant: "warning" as const, desc: "Moderate zone III" },
          { icon: Building2, label: "Land Slope", score: 78, variant: "primary" as const, desc: "Gentle slope" },
        ].map((item) => (
          <div key={item.label} className="glass-card rounded-2xl p-5 text-center">
            <ScoreGauge score={item.score} label={item.label} variant={item.variant} size="sm" />
            <p className="text-xs text-muted-foreground mt-2">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Risk Breakdown</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={stabilityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
            <XAxis dataKey="name" tick={{ fill: "hsl(215, 15%, 50%)", fontSize: 12 }} axisLine={false} />
            <YAxis tick={{ fill: "hsl(215, 15%, 50%)", fontSize: 12 }} axisLine={false} />
            <Tooltip contentStyle={{ background: "white", border: "1px solid hsl(214, 20%, 90%)", borderRadius: 12 }} />
            <Bar dataKey="score" radius={[8, 8, 0, 0]} fill="hsl(209, 82%, 30%)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default ConstructionAnalyzerPage;

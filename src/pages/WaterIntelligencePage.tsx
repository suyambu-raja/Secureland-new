import { motion } from "framer-motion";
import { Droplets, Waves, MapPin } from "lucide-react";
import ScoreGauge from "@/components/ScoreGauge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const waterData = [
  { month: "Jan", depth: 45 }, { month: "Feb", depth: 42 }, { month: "Mar", depth: 38 },
  { month: "Apr", depth: 35 }, { month: "May", depth: 30 }, { month: "Jun", depth: 28 },
  { month: "Jul", depth: 32 }, { month: "Aug", depth: 40 }, { month: "Sep", depth: 48 },
];

const WaterIntelligencePage = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl space-y-6">
      <div className="hero-gradient rounded-2xl p-8 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 80% 50%, hsla(190,100%,50%,0.3) 0%, transparent 50%)`
        }} />
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-1">Water Resource Analysis</h1>
          <p className="text-primary-foreground/60 text-sm">Groundwater intelligence and water availability insights</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-6 text-center">
          <Droplets className="w-8 h-8 text-primary mx-auto mb-3" />
          <p className="text-3xl font-bold text-foreground">32m</p>
          <p className="text-sm text-muted-foreground mt-1">Groundwater Depth</p>
        </div>
        <div className="glass-card rounded-2xl p-6 text-center">
          <ScoreGauge score={78} label="Water Availability" variant="primary" size="sm" />
        </div>
        <div className="glass-card rounded-2xl p-6 text-center">
          <Waves className="w-8 h-8 text-accent mx-auto mb-3" />
          <p className="text-3xl font-bold text-foreground">4</p>
          <p className="text-sm text-muted-foreground mt-1">Nearby Water Sources</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Groundwater Depth Trend (meters)</h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={waterData}>
            <defs>
              <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(190, 100%, 50%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(190, 100%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
            <XAxis dataKey="month" tick={{ fill: "hsl(215, 15%, 50%)", fontSize: 12 }} axisLine={false} />
            <YAxis tick={{ fill: "hsl(215, 15%, 50%)", fontSize: 12 }} axisLine={false} />
            <Tooltip contentStyle={{ background: "white", border: "1px solid hsl(214, 20%, 90%)", borderRadius: 12 }} />
            <Area type="monotone" dataKey="depth" stroke="hsl(190, 100%, 50%)" fill="url(#waterGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Nearby Water Sources</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            { name: "Hebbal Lake", dist: "1.2 km", type: "Lake" },
            { name: "Arkavathy River", dist: "3.5 km", type: "River" },
            { name: "Borewell #142", dist: "0.8 km", type: "Borewell" },
            { name: "Community Tank", dist: "2.1 km", type: "Tank" },
          ].map((s) => (
            <div key={s.name} className="flex items-center gap-3 bg-secondary rounded-xl p-4">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.type}</p>
              </div>
              <span className="text-xs text-muted-foreground font-medium">{s.dist}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default WaterIntelligencePage;

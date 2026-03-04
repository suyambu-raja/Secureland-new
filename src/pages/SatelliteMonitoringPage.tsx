import { motion } from "framer-motion";
import { Satellite } from "lucide-react";
import AlertCard from "@/components/AlertCard";

const SatelliteMonitoringPage = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl space-y-6">
      <div className="hero-gradient rounded-2xl p-8 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 80% 50%, hsla(190,100%,50%,0.3) 0%, transparent 50%)`
        }} />
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-1">Satellite Monitoring</h1>
          <p className="text-primary-foreground/60 text-sm">Real-time satellite surveillance of your registered lands</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="h-96 relative flex items-center justify-center" style={{
          background: `linear-gradient(135deg, hsl(145 30% 85%), hsl(200 30% 80%), hsl(145 30% 75%))`
        }}>
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, hsl(209 82% 30% / 0.2) 40px, hsl(209 82% 30% / 0.2) 41px),
              repeating-linear-gradient(90deg, transparent, transparent 40px, hsl(209 82% 30% / 0.2) 40px, hsl(209 82% 30% / 0.2) 41px)`
          }} />

          <div className="text-center z-10 bg-card/80 backdrop-blur-sm rounded-2xl px-8 py-6 border border-border">
            <Satellite className="w-12 h-12 text-primary mx-auto mb-3" />
            <p className="text-foreground font-bold">Satellite Map View</p>
            <p className="text-sm text-muted-foreground mt-1">8 active monitoring zones</p>
          </div>

          {/* Mock markers */}
          {[
            { top: "30%", left: "25%", color: "bg-accent" },
            { top: "45%", left: "60%", color: "bg-warning" },
            { top: "65%", left: "40%", color: "bg-primary" },
          ].map((m, i) => (
            <div key={i} className="absolute" style={{ top: m.top, left: m.left }}>
              <div className={`w-4 h-4 rounded-full ${m.color} animate-pulse shadow-lg`} />
            </div>
          ))}
        </div>

        <div className="p-4 flex gap-4 border-t border-border bg-card">
          {[
            { label: "Active Zones", value: "8", color: "text-primary" },
            { label: "Encroachments", value: "2", color: "text-destructive" },
            { label: "Last Scan", value: "2h ago", color: "text-muted-foreground" },
          ].map((s) => (
            <div key={s.label} className="flex-1 text-center">
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Monitoring Alerts</h3>
        <div className="space-y-3">
          <AlertCard severity="critical" title="Encroachment Detected" description="New construction within 5m of boundary on Plot #SL-2847" timestamp="2 hours ago" />
          <AlertCard severity="warning" title="Unauthorized Construction" description="Structure detected on adjacent plot near Plot #SL-1923" timestamp="6 hours ago" />
          <AlertCard severity="success" title="Boundary Verified" description="All boundaries intact for Plot #SL-3102" timestamp="1 day ago" />
        </div>
      </div>
    </motion.div>
  );
};

export default SatelliteMonitoringPage;

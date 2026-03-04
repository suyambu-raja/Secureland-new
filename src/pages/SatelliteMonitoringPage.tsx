import { motion } from "framer-motion";
import { Satellite, AlertTriangle, MapPin, Eye } from "lucide-react";
import AlertCard from "@/components/AlertCard";

const SatelliteMonitoringPage = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Satellite Monitoring</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time satellite surveillance of your registered lands</p>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="h-96 bg-secondary relative flex items-center justify-center">
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `radial-gradient(circle at 40% 50%, hsl(160 84% 39% / 0.2) 0%, transparent 50%),
              radial-gradient(circle at 70% 30%, hsl(217 91% 60% / 0.15) 0%, transparent 40%)`
          }} />
          <div className="text-center z-10">
            <Satellite className="w-12 h-12 text-primary mx-auto mb-3 animate-pulse-glow" />
            <p className="text-foreground font-semibold">Satellite Map View</p>
            <p className="text-sm text-muted-foreground mt-1">8 active monitoring zones</p>
          </div>

          {/* Mock markers */}
          {[
            { top: "30%", left: "25%", color: "bg-accent" },
            { top: "45%", left: "60%", color: "bg-warning" },
            { top: "65%", left: "40%", color: "bg-primary" },
          ].map((m, i) => (
            <div key={i} className="absolute" style={{ top: m.top, left: m.left }}>
              <div className={`w-4 h-4 rounded-full ${m.color} animate-pulse`} />
            </div>
          ))}
        </div>

        <div className="p-4 flex gap-4 border-t border-border">
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

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Monitoring Alerts</h3>
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

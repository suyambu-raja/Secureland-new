import { motion } from "framer-motion";
import { Shield, Fingerprint, CheckCircle, AlertTriangle, Lock } from "lucide-react";
import ScoreGauge from "@/components/ScoreGauge";

const FraudProtectionPage = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Fraud Protection</h1>
        <p className="text-sm text-muted-foreground mt-1">AI-powered fraud detection and ownership verification</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-6 text-center">
          <ScoreGauge score={92} label="Ownership Verified" variant="accent" size="md" />
        </div>
        <div className="glass rounded-xl p-6 text-center">
          <ScoreGauge score={15} label="Fraud Risk" variant="destructive" size="md" />
        </div>
        <div className="glass rounded-xl p-6 text-center">
          <ScoreGauge score={88} label="Boundary Integrity" variant="primary" size="md" />
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Fingerprint className="w-4 h-4 text-primary" /> Boundary Fingerprint
        </h3>
        <div className="h-48 rounded-lg bg-secondary border border-border flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 20px, hsl(217 91% 60% / 0.1) 20px, hsl(217 91% 60% / 0.1) 21px),
              repeating-linear-gradient(90deg, transparent, transparent 20px, hsl(217 91% 60% / 0.1) 20px, hsl(217 91% 60% / 0.1) 21px)`
          }} />
          <div className="text-center z-10">
            <Fingerprint className="w-12 h-12 text-primary mx-auto mb-2 animate-pulse-glow" />
            <p className="text-sm text-muted-foreground">Unique boundary fingerprint generated</p>
            <p className="text-xs text-primary font-mono mt-1">FP-2847A-KA-BLR-92X</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {[
          { icon: CheckCircle, title: "Ownership Verified", desc: "Document hash matches blockchain record", status: "verified" },
          { icon: Lock, title: "Title Deed Secured", desc: "No duplicate registrations found", status: "verified" },
          { icon: Shield, title: "Encumbrance Check", desc: "No liens or mortgages detected", status: "verified" },
          { icon: AlertTriangle, title: "Boundary Alert", desc: "Minor deviation detected (2.3%)", status: "warning" },
        ].map((item) => (
          <div key={item.title} className="glass rounded-xl p-5 flex items-start gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
              item.status === "verified" ? "bg-accent/10" : "bg-warning/10"
            }`}>
              <item.icon className={`w-5 h-5 ${item.status === "verified" ? "text-accent" : "text-warning"}`} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
              <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default FraudProtectionPage;

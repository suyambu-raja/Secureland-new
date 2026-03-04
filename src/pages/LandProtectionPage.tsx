import { motion } from "framer-motion";
import { Shield, MapPin, Satellite, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FeatureCard from "@/components/FeatureCard";

const LandProtectionPage = () => {
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl space-y-6">
      <div className="hero-gradient rounded-2xl p-8 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 80% 50%, hsla(190,100%,50%,0.3) 0%, transparent 50%)`
        }} />
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-1">Land Protection</h1>
          <p className="text-primary-foreground/60 text-sm">Secure and monitor your registered properties</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FeatureCard icon={Shield} title="Register Land" description="Register and protect your property" variant="primary" onClick={() => navigate("/register-land")} />
        <FeatureCard icon={Satellite} title="Satellite Monitoring" description="Real-time boundary surveillance" variant="accent" onClick={() => navigate("/satellite")} />
        <FeatureCard icon={AlertTriangle} title="Fraud Detection" description="AI-powered fraud analysis" variant="warning" onClick={() => navigate("/fraud-protection")} />
        <FeatureCard icon={MapPin} title="Digital Twin" description="3D land visualization" variant="primary" />
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Your Protected Lands</h3>
        <div className="space-y-3">
          {[
            { id: "SL-2847", area: "2,450 sq.m", loc: "Whitefield, Bangalore", status: "Active" },
            { id: "SL-1923", area: "1,200 sq.m", loc: "Electronic City, Bangalore", status: "Active" },
            { id: "SL-3102", area: "5,000 sq.m", loc: "Devanahalli, Bangalore", status: "Pending" },
          ].map((land) => (
            <div key={land.id} className="flex items-center justify-between bg-secondary rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Plot #{land.id}</p>
                  <p className="text-xs text-muted-foreground">{land.loc} · {land.area}</p>
                </div>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                land.status === "Active" ? "bg-accent/10 text-accent" : "bg-warning/10 text-warning"
              }`}>
                {land.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default LandProtectionPage;

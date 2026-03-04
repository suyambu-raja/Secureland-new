import { motion } from "framer-motion";
import { Shield, ShoppingBag, ArrowRight, Satellite, AlertTriangle, Droplets, MapPin, TrendingUp, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ModuleSelectionPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl hero-gradient flex items-center justify-center shadow-lg shadow-primary/30">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">
            SecureLand – Select Your Portal
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Choose your module to get started. Each portal offers specialized features.
          </p>
        </motion.div>

        {/* Two Portal Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Land Protection */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            whileHover={{ y: -6 }}
            className="glass-card rounded-3xl p-8 border-2 border-transparent hover:border-primary/30 transition-all group cursor-pointer relative overflow-hidden"
            onClick={() => navigate("/login?module=protection")}
          >
            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                <Shield className="w-7 h-7 text-primary" />
              </div>

              <h2 className="text-xl font-bold text-foreground mb-2">Land Protection</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Protect and monitor your land from fraud and encroachments using AI and satellite monitoring.
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { icon: Satellite, label: "Satellite" },
                  { icon: AlertTriangle, label: "Fraud AI" },
                  { icon: Droplets, label: "Water" },
                ].map((f) => (
                  <span key={f.label} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-secondary/80 px-2.5 py-1 rounded-lg">
                    <f.icon className="w-3 h-3 text-primary" /> {f.label}
                  </span>
                ))}
              </div>

              <button className="w-full h-12 rounded-xl hero-gradient-subtle text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 group-hover:shadow-xl group-hover:shadow-primary/30">
                Enter Portal <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Land Marketplace */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            whileHover={{ y: -6 }}
            className="glass-card rounded-3xl p-8 border-2 border-transparent hover:border-accent/30 transition-all group cursor-pointer relative overflow-hidden"
            onClick={() => navigate("/login?module=marketplace")}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-5">
                <ShoppingBag className="w-7 h-7 text-accent" />
              </div>

              <h2 className="text-xl font-bold text-foreground mb-2">Land Marketplace</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Buy, sell, rent, and analyze properties with AI-driven investment insights.
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { icon: MapPin, label: "Explorer" },
                  { icon: TrendingUp, label: "Intelligence" },
                  { icon: BarChart3, label: "Analytics" },
                ].map((f) => (
                  <span key={f.label} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-secondary/80 px-2.5 py-1 rounded-lg">
                    <f.icon className="w-3 h-3 text-accent" /> {f.label}
                  </span>
                ))}
              </div>

              <button className="w-full h-12 rounded-xl bg-accent text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-accent/20 group-hover:shadow-xl group-hover:shadow-accent/30">
                Enter Portal <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ModuleSelectionPage;

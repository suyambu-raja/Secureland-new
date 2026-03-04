import { motion } from "framer-motion";
import { Shield, Store, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const modules = [
  {
    title: "Land Protection",
    description: "Protect and monitor your land from fraud and encroachments with real-time AI & Satellite alerts.",
    icon: Shield,
    path: "/dashboard",
    glowClass: "glow-cyan",
    hoverBorder: "hover:border-cyan/40",
    iconGradient: "hero-gradient",
  },
  {
    title: "Land Marketplace",
    description: "Buy, sell, rent, and analyze properties with AI-driven investment scores and clear titles.",
    icon: Store,
    path: "/marketplace",
    glowClass: "glow-green",
    hoverBorder: "hover:border-accent/40",
    iconGradient: "bg-accent",
  },
];

const ModuleSelectionPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `radial-gradient(circle at 25% 40%, hsla(190,100%,50%,0.3) 0%, transparent 50%),
          radial-gradient(circle at 75% 70%, hsla(145,65%,32%,0.2) 0%, transparent 50%)`
      }} />

      <div className="relative z-10 w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary-foreground/10 backdrop-blur border border-primary-foreground/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-extrabold tracking-widest text-primary-foreground">SECURELAND</span>
          </div>
          <h1 className="text-3xl font-bold text-primary-foreground mb-3">Select Your Portal</h1>
          <p className="text-primary-foreground/60">Choose how you want to use SecureLand.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {modules.map((mod, i) => (
            <motion.div
              key={mod.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              whileHover={{ y: -6, scale: 1.02 }}
              onClick={() => navigate(mod.path)}
              className={`cursor-pointer p-8 rounded-2xl glass ${mod.hoverBorder} transition-all duration-300 group`}
            >
              <div className={`w-16 h-16 rounded-2xl ${mod.iconGradient} flex items-center justify-center mb-6`}>
                <mod.icon className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-bold text-primary-foreground mb-3">{mod.title}</h2>
              <p className="text-sm text-primary-foreground/60 mb-6 leading-relaxed">{mod.description}</p>
              <div className="flex items-center gap-2 text-sm font-semibold text-cyan group-hover:gap-3 transition-all">
                Enter Portal <ArrowRight className="w-4 h-4" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModuleSelectionPage;

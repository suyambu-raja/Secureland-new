import { motion } from "framer-motion";
import { Shield, Store, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const modules = [
  {
    title: "Land Protection",
    description: "Protect your land with AI-powered monitoring, fraud detection, and digital twin technology. For existing land owners.",
    icon: Shield,
    path: "/dashboard",
    gradient: "gradient-primary",
  },
  {
    title: "Land Marketplace",
    description: "Explore, buy, sell, and invest in properties with AI-driven insights, safety scores, and investment analytics.",
    icon: Store,
    path: "/marketplace",
    gradient: "gradient-accent",
  },
];

const ModuleSelectionPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-[500px] h-[500px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Choose Your Module</h1>
          <p className="text-muted-foreground">Select how you want to use SecureLand</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {modules.map((mod, i) => (
            <motion.div
              key={mod.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ y: -6, scale: 1.02 }}
              onClick={() => navigate(mod.path)}
              className="glass rounded-2xl p-8 cursor-pointer group hover-lift"
            >
              <div className={`w-14 h-14 rounded-xl ${mod.gradient} flex items-center justify-center mb-6`}>
                <mod.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-3">{mod.title}</h2>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{mod.description}</p>
              <div className="flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
                Enter Module <ArrowRight className="w-4 h-4" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModuleSelectionPage;

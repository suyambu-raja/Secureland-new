import { Search, Bell, Globe, User, Shield } from "lucide-react";
import { motion } from "framer-motion";

const Navbar = () => {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 h-16 bg-card/90 backdrop-blur-xl border-b border-border flex items-center justify-between px-6"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg hero-gradient flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-extrabold tracking-wider text-foreground hidden sm:block">
          SECURE<span className="gradient-text">LAND</span>
        </span>
      </div>

      <div className="flex-1 max-w-md mx-8 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search properties, locations, reports..."
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="w-9 h-9 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <Globe className="w-4 h-4" />
        </button>
        <button className="w-9 h-9 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
        </button>
        <div className="w-9 h-9 rounded-full hero-gradient-subtle flex items-center justify-center text-xs font-bold text-primary-foreground ml-1">
          JD
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;

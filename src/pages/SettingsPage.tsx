import { motion } from "framer-motion";
import { User, Bell, Shield, Globe, Moon } from "lucide-react";

const SettingsPage = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl space-y-6">
      <div className="hero-gradient rounded-2xl p-8 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 80% 50%, hsla(190,100%,50%,0.3) 0%, transparent 50%)`
        }} />
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-1">Settings</h1>
          <p className="text-primary-foreground/60 text-sm">Manage your account and preferences</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Profile</h3>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full hero-gradient-subtle flex items-center justify-center text-xl font-bold text-primary-foreground">
            JD
          </div>
          <div>
            <p className="text-foreground font-bold">John Doe</p>
            <p className="text-sm text-muted-foreground">+91 9876543210</p>
          </div>
        </div>
      </div>

      {[
        { icon: Bell, title: "Notifications", desc: "Manage alert preferences" },
        { icon: Shield, title: "Security", desc: "Two-factor authentication and login settings" },
        { icon: Globe, title: "Language", desc: "English (India)" },
        { icon: Moon, title: "Appearance", desc: "Light mode active" },
      ].map((item) => (
        <div key={item.title} className="glass-card rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
            <item.icon className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
            <p className="text-xs text-muted-foreground">{item.desc}</p>
          </div>
        </div>
      ))}
    </motion.div>
  );
};

export default SettingsPage;

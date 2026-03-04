import { motion } from "framer-motion";
import { User, Bell, Shield, Globe, Moon } from "lucide-react";

const SettingsPage = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      <div className="glass rounded-xl p-6 space-y-6">
        <h3 className="text-sm font-semibold text-foreground">Profile</h3>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
            <User className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <p className="text-foreground font-semibold">Rajesh Kumar</p>
            <p className="text-sm text-muted-foreground">+91 9876543210</p>
          </div>
        </div>
      </div>

      {[
        { icon: Bell, title: "Notifications", desc: "Manage alert preferences" },
        { icon: Shield, title: "Security", desc: "Two-factor authentication and login settings" },
        { icon: Globe, title: "Language", desc: "English (India)" },
        { icon: Moon, title: "Appearance", desc: "Dark mode enabled" },
      ].map((item) => (
        <div key={item.title} className="glass rounded-xl p-5 flex items-center gap-4 cursor-pointer hover:bg-card/80 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
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

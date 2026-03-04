import {
  LayoutDashboard, Shield, FileText, Satellite, AlertTriangle,
  Building2, Droplets, Store, TrendingUp, BarChart3, Settings,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { title: "Land Protection", path: "/land-protection", icon: Shield },
  { title: "Register Land", path: "/register-land", icon: FileText },
  { title: "Satellite Monitoring", path: "/satellite", icon: Satellite },
  { title: "Fraud Protection", path: "/fraud-protection", icon: AlertTriangle },
  { title: "Construction Analyzer", path: "/construction", icon: Building2 },
  { title: "Water Intelligence", path: "/water", icon: Droplets },
  { title: "Marketplace", path: "/marketplace", icon: Store },
  { title: "Investment Analytics", path: "/investments", icon: TrendingUp },
  { title: "Reports", path: "/reports", icon: BarChart3 },
  { title: "Settings", path: "/settings", icon: Settings },
];

const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-[calc(100vh-4rem)] sticky top-16 bg-sidebar border-r border-sidebar-border flex flex-col overflow-hidden z-40"
    >
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item, i) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "sidebar-active text-primary"
                  : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("w-5 h-5 shrink-0", isActive && "text-primary")} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="whitespace-nowrap"
                    >
                      {item.title}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </motion.aside>
  );
};

export default AppSidebar;

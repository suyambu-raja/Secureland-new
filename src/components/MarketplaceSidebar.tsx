import {
    Map, Store, TrendingUp, ShieldCheck, BarChart3, ChevronLeft, ChevronRight, LogOut, ShoppingBag, CloudRain
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
    { title: "Property Explorer", path: "/marketplace/property-explorer", icon: Map },
    { title: "Buy / Sell / Rent", path: "/marketplace/listings", icon: Store },
    { title: "Property Intelligence", path: "/marketplace/intelligence", icon: TrendingUp },
    { title: "Area Safety Scores", path: "/marketplace/area-safety", icon: ShieldCheck },
    { title: "Investment Analytics", path: "/marketplace/investments", icon: BarChart3 },
    { title: "Disaster Simulation", path: "/marketplace/disaster-simulation/CHN-102", icon: CloudRain },
];

const MarketplaceSidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();

    return (
        <motion.aside
            animate={{ width: collapsed ? 72 : 270 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="h-[calc(100vh-68px)] sticky top-[68px] glass-light dark:bg-card/40 border-r border-border/40 flex flex-col overflow-hidden z-40 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]"
        >
            {/* Module Header */}
            <AnimatePresence>
                {!collapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="px-5 pt-5 pb-3"
                    >
                        <div className="flex items-center gap-2.5 mb-1">
                            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                                <ShoppingBag className="w-4 h-4 text-accent" />
                            </div>
                            <span className="text-sm font-bold text-foreground tracking-tight">LAND MARKETPLACE</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground pl-[42px]">Buy, sell & invest in land</p>
                    </motion.div>
                )}
            </AnimatePresence>
            {collapsed && (
                <div className="flex justify-center pt-5 pb-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                        <ShoppingBag className="w-4 h-4 text-accent" />
                    </div>
                </div>
            )}

            <div className="mx-3 h-px bg-border/50 mb-2" />

            <nav className="flex-1 py-2 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-300 group relative overflow-hidden",
                                isActive
                                    ? "text-accent font-semibold bg-accent/10 shadow-[inset_4px_0_0_0_hsl(var(--accent))]"
                                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                            )
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <motion.div
                                        layoutId="marketplace-sidebar-active"
                                        className="absolute inset-0 bg-accent/5 z-0"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <item.icon className={cn("w-[20px] h-[20px] shrink-0 z-10", isActive ? "text-accent" : "text-muted-foreground group-hover:text-foreground")} />
                                <AnimatePresence>
                                    {!collapsed && (
                                        <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="whitespace-nowrap z-10 truncate">
                                            {item.title}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="p-3 space-y-2 border-t border-border/40">
                <button
                    onClick={() => navigate("/modules")}
                    className={cn(
                        "w-full flex items-center gap-3 py-2.5 rounded-xl text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all",
                        collapsed ? "justify-center px-0" : "px-3"
                    )}
                >
                    <LogOut className="w-[20px] h-[20px] shrink-0" />
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">
                                Switch Portal
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-full flex items-center justify-center py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all"
                >
                    {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </button>
            </div>
        </motion.aside>
    );
};

export default MarketplaceSidebar;

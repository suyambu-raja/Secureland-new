import { motion } from "framer-motion";
import { TrendingUp, MapPin, Store, ShieldCheck, BarChart3, ArrowUpRight, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const stats = [
    { label: "Active Listings", value: "2,847", change: "+12%", color: "text-accent" },
    { label: "Avg Price/sqft", value: "₹4,520", change: "+3.2%", color: "text-primary" },
    { label: "Properties Sold", value: "156", change: "+8%", color: "text-orange-500" },
    { label: "Safety Score Avg", value: "91/100", change: "+1.5%", color: "text-emerald-500" },
];

const featuredProperties = [
    { name: "Green Valley Estate", location: "Coimbatore", price: "₹1.2 Cr", type: "Buy", area: "2400 sqft", safety: 94 },
    { name: "Lakeview Residency", location: "Ooty", price: "₹85 L", type: "Rent", area: "1800 sqft", safety: 91 },
    { name: "Urban Heights", location: "RS Puram", price: "₹2.8 Cr", type: "Buy", area: "1600 sqft", safety: 96 },
];

const MarketplaceDashboardPage = () => {
    const navigate = useNavigate();

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-[1200px] mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Marketplace Overview</h1>
                    <p className="text-muted-foreground text-sm mt-1">AI-powered property insights and investment analytics.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 border border-accent/20">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    <span className="text-sm font-semibold text-accent">Live Market Data</span>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="glass-card rounded-2xl p-5"
                    >
                        <p className="text-xs text-muted-foreground font-medium mb-2">{stat.label}</p>
                        <div className="flex items-end justify-between">
                            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                            <span className={`text-xs font-semibold ${stat.color} flex items-center gap-0.5`}>
                                <ArrowUpRight className="w-3 h-3" /> {stat.change}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-4 gap-4">
                {[
                    { title: "Property Explorer", icon: MapPin, desc: "Browse on map", path: "/marketplace/property-explorer", color: "text-primary" },
                    { title: "Listings", icon: Store, desc: "Buy/Sell/Rent", path: "/marketplace/listings", color: "text-accent" },
                    { title: "Area Safety", icon: ShieldCheck, desc: "Safety scores", path: "/marketplace/area-safety", color: "text-emerald-500" },
                    { title: "Analytics", icon: BarChart3, desc: "Investment insights", path: "/marketplace/investments", color: "text-orange-500" },
                ].map((action) => (
                    <motion.div
                        key={action.title}
                        whileHover={{ y: -3 }}
                        onClick={() => navigate(action.path)}
                        className="glass-card-hover rounded-2xl p-5 cursor-pointer group"
                    >
                        <action.icon className={`w-7 h-7 ${action.color} mb-3`} />
                        <h3 className="text-sm font-bold text-foreground mb-0.5">{action.title}</h3>
                        <p className="text-xs text-muted-foreground">{action.desc}</p>
                    </motion.div>
                ))}
            </div>

            {/* Featured Properties */}
            <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-foreground">Featured Properties</h3>
                    <button
                        onClick={() => navigate("/marketplace/listings")}
                        className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                    >
                        View All <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                    {featuredProperties.map((prop) => (
                        <div key={prop.name} className="p-4 rounded-xl bg-secondary/50 border border-border/50 hover:bg-secondary/80 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${prop.type === "Buy" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                                    }`}>{prop.type}</span>
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <ShieldCheck className="w-3 h-3 text-accent" /> {prop.safety}
                                </span>
                            </div>
                            <h4 className="text-sm font-bold text-foreground mb-1">{prop.name}</h4>
                            <p className="text-xs text-muted-foreground mb-2">{prop.location} • {prop.area}</p>
                            <p className="text-base font-bold text-primary">{prop.price}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Market Trends */}
            <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Market Trends</h3>
                <div className="grid md:grid-cols-3 gap-4">
                    {[
                        { area: "Coimbatore", trend: "+12.5%", avg: "₹4,200/sqft", demand: "High" },
                        { area: "Ooty", trend: "+8.3%", avg: "₹6,800/sqft", demand: "Medium" },
                        { area: "Mettupalayam", trend: "+15.1%", avg: "₹2,100/sqft", demand: "Rising" },
                    ].map((t) => (
                        <div key={t.area} className="p-4 rounded-xl bg-secondary/50 border border-border/50">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-bold text-foreground">{t.area}</h4>
                                <span className="text-xs font-bold text-accent">{t.trend}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">Avg: {t.avg}</p>
                            <p className="text-xs text-muted-foreground">Demand: <span className="font-semibold text-foreground">{t.demand}</span></p>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default MarketplaceDashboardPage;

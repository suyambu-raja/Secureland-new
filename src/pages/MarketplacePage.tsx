import { motion } from "framer-motion";
import { Search, Filter, MapPin } from "lucide-react";
import PropertyCard from "@/components/PropertyCard";

const properties = [
  { title: "Premium Plot - Whitefield", location: "Whitefield, Bangalore", price: "₹1.2 Cr", area: "2,400 sq.m", safetyScore: 92, waterScore: 85, type: "sale" as const },
  { title: "Agricultural Land - Devanahalli", location: "Devanahalli, Bangalore", price: "₹45 L", area: "5,000 sq.m", safetyScore: 78, waterScore: 90, type: "investment" as const },
  { title: "Residential Plot - Electronic City", location: "Electronic City, Bangalore", price: "₹85 L", area: "1,200 sq.m", safetyScore: 88, waterScore: 72, type: "sale" as const },
  { title: "Commercial Land - Hebbal", location: "Hebbal, Bangalore", price: "₹2.5 Cr", area: "3,600 sq.m", safetyScore: 95, waterScore: 80, type: "sale" as const },
  { title: "Farm Plot - Anekal", location: "Anekal, Bangalore", price: "₹30 L", area: "8,000 sq.m", safetyScore: 70, waterScore: 95, type: "rent" as const },
  { title: "Layout Site - Sarjapur", location: "Sarjapur Road, Bangalore", price: "₹1.8 Cr", area: "2,000 sq.m", safetyScore: 90, waterScore: 68, type: "investment" as const },
];

const MarketplacePage = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl space-y-6">
      <div className="hero-gradient rounded-2xl p-8 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 80% 50%, hsla(145,65%,32%,0.3) 0%, transparent 50%)`
        }} />
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Land Marketplace</h1>
            <p className="text-primary-foreground/60 text-sm">Explore, buy, sell, and invest in properties</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search properties..."
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <button className="h-11 px-5 rounded-xl bg-card border border-border text-sm text-foreground flex items-center gap-2 hover:bg-secondary transition-colors font-medium">
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      <div className="glass-card rounded-2xl h-56 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: `linear-gradient(135deg, hsl(145 30% 85%), hsl(200 30% 80%), hsl(145 30% 75%))`
        }} />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, hsl(209 82% 30% / 0.15) 40px, hsl(209 82% 30% / 0.15) 41px),
            repeating-linear-gradient(90deg, transparent, transparent 40px, hsl(209 82% 30% / 0.15) 40px, hsl(209 82% 30% / 0.15) 41px)`
        }} />
        <div className="text-center z-10 bg-card/80 backdrop-blur-sm rounded-2xl px-8 py-6 border border-border">
          <MapPin className="w-10 h-10 text-primary mx-auto mb-2" />
          <p className="text-foreground font-bold">Interactive Map Explorer</p>
          <p className="text-sm text-muted-foreground">Search locations and view property markers</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {properties.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <PropertyCard {...p} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default MarketplacePage;

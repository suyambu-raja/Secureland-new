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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Land Marketplace</h1>
          <p className="text-sm text-muted-foreground mt-1">Explore, buy, sell, and invest in properties</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search properties..."
              className="h-10 pl-10 pr-4 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
            />
          </div>
          <button className="h-10 px-4 rounded-lg bg-secondary border border-border text-sm text-foreground flex items-center gap-2 hover:bg-muted transition-colors">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      <div className="glass rounded-xl h-64 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 30% 40%, hsl(217 91% 60% / 0.2) 0%, transparent 50%),
            radial-gradient(circle at 70% 60%, hsl(160 84% 39% / 0.15) 0%, transparent 40%)`
        }} />
        <div className="text-center z-10">
          <MapPin className="w-10 h-10 text-primary mx-auto mb-2" />
          <p className="text-foreground font-semibold">Interactive Map Explorer</p>
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

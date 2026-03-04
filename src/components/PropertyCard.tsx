import { motion } from "framer-motion";
import { MapPin, Shield, Droplets } from "lucide-react";
import { cn } from "@/lib/utils";

interface PropertyCardProps {
  image?: string;
  title: string;
  location: string;
  price: string;
  area: string;
  safetyScore: number;
  waterScore: number;
  type?: "sale" | "rent" | "investment";
}

const typeBadge = {
  sale: "bg-primary/10 text-primary",
  rent: "bg-accent/10 text-accent",
  investment: "bg-warning/10 text-warning",
};

const PropertyCard = ({ image, title, location, price, area, safetyScore, waterScore, type = "sale" }: PropertyCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glass-card-hover rounded-2xl overflow-hidden group cursor-pointer"
    >
      <div className="relative h-40 bg-secondary overflow-hidden">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full hero-gradient-subtle flex items-center justify-center">
            <MapPin className="w-8 h-8 text-primary-foreground/50" />
          </div>
        )}
        <span className={cn("absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm", typeBadge[type])}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </span>
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-foreground mb-1 truncate">{title}</h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{location}</span>
        </div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold gradient-text">{price}</span>
          <span className="text-xs text-muted-foreground">{area}</span>
        </div>
        <div className="flex items-center gap-4 pt-3 border-t border-border">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs font-medium text-foreground">{safetyScore}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-foreground">{waterScore}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;

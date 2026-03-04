import { motion } from "framer-motion";
import LandMap from "@/components/LandMap";

const PropertyExplorerPage = () => {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-[1200px] mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Property Explorer</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Search locations on the map to view land rates and property insights.
                </p>
            </div>

            <LandMap />
        </motion.div>
    );
};

export default PropertyExplorerPage;

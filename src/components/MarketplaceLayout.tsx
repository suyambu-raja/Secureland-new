import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import MarketplaceSidebar from "./MarketplaceSidebar";

const MarketplaceLayout = () => {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="flex">
                <MarketplaceSidebar />
                <main className="flex-1 p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MarketplaceLayout;

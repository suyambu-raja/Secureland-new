import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import ProtectionSidebar from "./ProtectionSidebar";

const ProtectionLayout = () => {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="flex">
                <ProtectionSidebar />
                <main className="flex-1 p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default ProtectionLayout;

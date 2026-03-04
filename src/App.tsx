import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SplashScreen from "./components/SplashScreen";

// Auth Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ModuleSelectionPage from "./pages/ModuleSelectionPage";
import DigitalTwinPage from "./pages/DigitalTwinPage";

// Layouts (Strictly Separate)
import ProtectionLayout from "./components/ProtectionLayout";
import MarketplaceLayout from "./components/MarketplaceLayout";

// Land Protection Pages
import DashboardPage from "./pages/DashboardPage";
import RegisterLandPage from "./pages/RegisterLandPage";
import FraudProtectionPage from "./pages/FraudProtectionPage";
import SatelliteMonitoringPage from "./pages/SatelliteMonitoringPage";
import RealTimeAlertsPage from "./pages/RealTimeAlertsPage";
import ConstructionAnalyzerPage from "./pages/ConstructionAnalyzerPage";
import WaterIntelligencePage from "./pages/WaterIntelligencePage";
import OwnershipTransferPage from "./pages/OwnershipTransferPage";
import LoanVerificationPage from "./pages/LoanVerificationPage";
import ReportsPage from "./pages/ReportsPage";

// Land Marketplace Pages
import MarketplaceDashboardPage from "./pages/MarketplaceDashboardPage";
import PropertyExplorerPage from "./pages/PropertyExplorerPage";
import MarketplacePage from "./pages/MarketplacePage";
import PropertyDetailsPage from "./pages/PropertyDetailsPage";
import InvestmentAnalyticsPage from "./pages/InvestmentAnalyticsPage";
import AreaSafetyPage from "./pages/AreaSafetyPage";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth & Portal Selection */}
            <Route path="/" element={<Navigate to="/modules" replace />} />
            <Route path="/modules" element={<ModuleSelectionPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/digital-twin" element={<DigitalTwinPage />} />

            {/* ======================================== */}
            {/* LAND PROTECTION — Separate Portal        */}
            {/* ======================================== */}
            <Route path="/protection" element={<ProtectionLayout />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="register-land" element={<RegisterLandPage />} />
              <Route path="fraud-protection" element={<FraudProtectionPage />} />
              <Route path="satellite" element={<SatelliteMonitoringPage />} />
              <Route path="alerts" element={<RealTimeAlertsPage />} />
              <Route path="construction" element={<ConstructionAnalyzerPage />} />
              <Route path="water" element={<WaterIntelligencePage />} />
              <Route path="ownership-transfer" element={<OwnershipTransferPage />} />
              <Route path="loan-verification" element={<LoanVerificationPage />} />
              <Route path="reports" element={<ReportsPage />} />
            </Route>

            {/* ======================================== */}
            {/* LAND MARKETPLACE — Separate Portal       */}
            {/* ======================================== */}
            <Route path="/marketplace" element={<MarketplaceLayout />}>
              <Route path="dashboard" element={<MarketplaceDashboardPage />} />
              <Route path="property-explorer" element={<PropertyExplorerPage />} />
              <Route path="listings" element={<MarketplacePage />} />
              <Route path="property/:id" element={<PropertyDetailsPage />} />
              <Route path="intelligence" element={<InvestmentAnalyticsPage />} />
              <Route path="area-safety" element={<AreaSafetyPage />} />
              <Route path="investments" element={<InvestmentAnalyticsPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

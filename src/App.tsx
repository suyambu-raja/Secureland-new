import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import LoginPage from "./pages/LoginPage";
import ModuleSelectionPage from "./pages/ModuleSelectionPage";
import DashboardPage from "./pages/DashboardPage";
import LandProtectionPage from "./pages/LandProtectionPage";
import RegisterLandPage from "./pages/RegisterLandPage";
import SatelliteMonitoringPage from "./pages/SatelliteMonitoringPage";
import FraudProtectionPage from "./pages/FraudProtectionPage";
import ConstructionAnalyzerPage from "./pages/ConstructionAnalyzerPage";
import WaterIntelligencePage from "./pages/WaterIntelligencePage";
import MarketplacePage from "./pages/MarketplacePage";
import InvestmentAnalyticsPage from "./pages/InvestmentAnalyticsPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/modules" element={<ModuleSelectionPage />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/land-protection" element={<LandProtectionPage />} />
            <Route path="/register-land" element={<RegisterLandPage />} />
            <Route path="/satellite" element={<SatelliteMonitoringPage />} />
            <Route path="/fraud-protection" element={<FraudProtectionPage />} />
            <Route path="/construction" element={<ConstructionAnalyzerPage />} />
            <Route path="/water" element={<WaterIntelligencePage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/investments" element={<InvestmentAnalyticsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { motion } from "framer-motion";
import { TrendingUp, BarChart3, PieChart, ArrowUpRight } from "lucide-react";
import FeatureCard from "@/components/FeatureCard";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const priceData = [
  { year: "2019", value: 4500 }, { year: "2020", value: 4800 },
  { year: "2021", value: 5200 }, { year: "2022", value: 6100 },
  { year: "2023", value: 6800 }, { year: "2024", value: 7500 },
  { year: "2025", value: 8200 },
];

const demandData = [
  { month: "Jan", demand: 120 }, { month: "Feb", demand: 135 },
  { month: "Mar", demand: 148 }, { month: "Apr", demand: 162 },
  { month: "May", demand: 175 }, { month: "Jun", demand: 190 },
];

const InvestmentAnalyticsPage = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl space-y-6">
      <div className="hero-gradient rounded-2xl p-8 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 80% 50%, hsla(190,100%,50%,0.3) 0%, transparent 50%)`
        }} />
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-1">Investment Analytics</h1>
          <p className="text-primary-foreground/60 text-sm">AI-driven property investment insights and analytics</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FeatureCard icon={TrendingUp} title="Avg. Growth Rate" description="Annual appreciation" value="14.2%" trend="↑ 2.1%" variant="primary" />
        <FeatureCard icon={BarChart3} title="Total Investment" description="Portfolio value" value="₹8.5 Cr" variant="accent" />
        <FeatureCard icon={PieChart} title="ROI Potential" description="Projected 3-year return" value="42%" variant="warning" />
        <FeatureCard icon={ArrowUpRight} title="Demand Index" description="Current market demand" value="190" trend="Hot" variant="primary" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Property Price Trends (₹/sq.ft)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={priceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis dataKey="year" tick={{ fill: "hsl(215, 15%, 50%)", fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: "hsl(215, 15%, 50%)", fontSize: 12 }} axisLine={false} />
              <Tooltip contentStyle={{ background: "white", border: "1px solid hsl(214, 20%, 90%)", borderRadius: 12 }} />
              <Line type="monotone" dataKey="value" stroke="hsl(209, 82%, 30%)" strokeWidth={2.5} dot={{ fill: "hsl(209, 82%, 30%)", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Demand Growth</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={demandData}>
              <defs>
                <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(145, 65%, 32%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(145, 65%, 32%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis dataKey="month" tick={{ fill: "hsl(215, 15%, 50%)", fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: "hsl(215, 15%, 50%)", fontSize: 12 }} axisLine={false} />
              <Tooltip contentStyle={{ background: "white", border: "1px solid hsl(214, 20%, 90%)", borderRadius: 12 }} />
              <Area type="monotone" dataKey="demand" stroke="hsl(145, 65%, 32%)" fill="url(#demandGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Top Investment Opportunities</h3>
        <div className="space-y-3">
          {[
            { area: "Devanahalli", growth: "+18%", roi: "High", risk: "Low" },
            { area: "Sarjapur Road", growth: "+15%", roi: "High", risk: "Medium" },
            { area: "Anekal", growth: "+22%", roi: "Very High", risk: "Medium" },
            { area: "Whitefield", growth: "+12%", roi: "Moderate", risk: "Low" },
          ].map((opp) => (
            <div key={opp.area} className="flex items-center justify-between bg-secondary rounded-xl p-4">
              <span className="text-sm font-semibold text-foreground">{opp.area}</span>
              <div className="flex items-center gap-6">
                <span className="text-sm text-accent font-semibold">{opp.growth}</span>
                <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-semibold">{opp.roi}</span>
                <span className="text-xs text-muted-foreground font-medium">{opp.risk} Risk</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default InvestmentAnalyticsPage;

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
      <div>
        <h1 className="text-2xl font-bold text-foreground">Investment Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">AI-driven property investment insights and analytics</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FeatureCard icon={TrendingUp} title="Avg. Growth Rate" description="Annual appreciation" value="14.2%" trend="↑ 2.1%" variant="primary" />
        <FeatureCard icon={BarChart3} title="Total Investment" description="Portfolio value" value="₹8.5 Cr" variant="accent" />
        <FeatureCard icon={PieChart} title="ROI Potential" description="Projected 3-year return" value="42%" variant="warning" />
        <FeatureCard icon={ArrowUpRight} title="Demand Index" description="Current market demand" value="190" trend="Hot" variant="primary" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Property Price Trends (₹/sq.ft)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={priceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
              <XAxis dataKey="year" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }} axisLine={false} />
              <Tooltip contentStyle={{ background: "hsl(222, 47%, 9%)", border: "1px solid hsl(222, 30%, 18%)", borderRadius: 8 }} />
              <Line type="monotone" dataKey="value" stroke="hsl(217, 91%, 60%)" strokeWidth={2.5} dot={{ fill: "hsl(217, 91%, 60%)", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Demand Growth</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={demandData}>
              <defs>
                <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
              <XAxis dataKey="month" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }} axisLine={false} />
              <Tooltip contentStyle={{ background: "hsl(222, 47%, 9%)", border: "1px solid hsl(222, 30%, 18%)", borderRadius: 8 }} />
              <Area type="monotone" dataKey="demand" stroke="hsl(160, 84%, 39%)" fill="url(#demandGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Top Investment Opportunities</h3>
        <div className="space-y-3">
          {[
            { area: "Devanahalli", growth: "+18%", roi: "High", risk: "Low" },
            { area: "Sarjapur Road", growth: "+15%", roi: "High", risk: "Medium" },
            { area: "Anekal", growth: "+22%", roi: "Very High", risk: "Medium" },
            { area: "Whitefield", growth: "+12%", roi: "Moderate", risk: "Low" },
          ].map((opp) => (
            <div key={opp.area} className="flex items-center justify-between bg-secondary rounded-lg p-4">
              <span className="text-sm font-semibold text-foreground">{opp.area}</span>
              <div className="flex items-center gap-6">
                <span className="text-sm text-accent font-medium">{opp.growth}</span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{opp.roi}</span>
                <span className="text-xs text-muted-foreground">{opp.risk} Risk</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default InvestmentAnalyticsPage;

import { motion } from "framer-motion";
import { Shield, Satellite, AlertTriangle, TrendingUp } from "lucide-react";
import FeatureCard from "@/components/FeatureCard";
import AlertCard from "@/components/AlertCard";
import ScoreGauge from "@/components/ScoreGauge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const chartData = [
  { month: "Jan", value: 65 }, { month: "Feb", value: 72 }, { month: "Mar", value: 68 },
  { month: "Apr", value: 80 }, { month: "May", value: 85 }, { month: "Jun", value: 92 },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const DashboardPage = () => {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-7xl">
      {/* Hero Banner */}
      <motion.div variants={item} className="hero-gradient rounded-2xl p-8 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 80% 50%, hsla(190,100%,50%,0.3) 0%, transparent 50%)`
        }} />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Welcome Back, John</h1>
            <p className="text-primary-foreground/60 text-sm">Your land protection dashboard is active and monitoring.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full px-4 py-2 border border-primary-foreground/20">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-semibold text-primary-foreground">Dashboard Activated</span>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FeatureCard icon={Shield} title="Protected Lands" description="Active land registrations" value="12" trend="+2 this month" variant="primary" />
        <FeatureCard icon={Satellite} title="Monitoring Active" description="Satellite scans running" value="8" variant="accent" />
        <FeatureCard icon={AlertTriangle} title="Alerts" description="Pending alerts to review" value="3" variant="warning" />
        <FeatureCard icon={TrendingUp} title="Portfolio Value" description="Total estimated value" value="₹4.2Cr" trend="+12%" variant="primary" />
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="lg:col-span-2 glass-card rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Protection Score Trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(209, 82%, 30%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(209, 82%, 30%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis dataKey="month" tick={{ fill: "hsl(215, 15%, 50%)", fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: "hsl(215, 15%, 50%)", fontSize: 12 }} axisLine={false} />
              <Tooltip contentStyle={{ background: "white", border: "1px solid hsl(214, 20%, 90%)", borderRadius: 12 }} />
              <Area type="monotone" dataKey="value" stroke="hsl(209, 82%, 30%)" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={item} className="glass-card rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-6">Security Scores</h3>
          <div className="grid grid-cols-2 gap-6">
            <ScoreGauge score={92} label="Protection" variant="primary" size="sm" />
            <ScoreGauge score={87} label="Safety" variant="accent" size="sm" />
            <ScoreGauge score={45} label="Fraud Risk" variant="destructive" size="sm" />
            <ScoreGauge score={78} label="Water" variant="primary" size="sm" />
          </div>
        </motion.div>
      </div>

      <motion.div variants={item} className="glass-card rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Recent Alerts</h3>
        <div className="space-y-3">
          <AlertCard severity="critical" title="Encroachment Detected" description="Unauthorized activity detected on Plot #SL-2847" timestamp="2 hours ago" />
          <AlertCard severity="warning" title="Boundary Mismatch" description="Satellite scan shows 2.3% deviation on Plot #SL-1923" timestamp="5 hours ago" />
          <AlertCard severity="info" title="Report Ready" description="Monthly safety report for all registered lands is available" timestamp="1 day ago" />
          <AlertCard severity="success" title="Verification Complete" description="Plot #SL-3102 ownership verification successful" timestamp="2 days ago" />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardPage;

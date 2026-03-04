import { motion } from "framer-motion";
import { FileText, Download, Calendar } from "lucide-react";

const reports = [
  { title: "Land Safety Report", desc: "Comprehensive safety analysis for all registered lands", date: "Mar 1, 2026", type: "Safety" },
  { title: "Fraud Risk Assessment", desc: "Monthly fraud detection and risk scoring report", date: "Feb 28, 2026", type: "Fraud" },
  { title: "Monitoring History", desc: "Satellite monitoring logs and boundary change history", date: "Feb 25, 2026", type: "Monitoring" },
  { title: "Investment Analysis", desc: "Property valuation and market trend analysis", date: "Feb 20, 2026", type: "Investment" },
  { title: "Water Resource Report", desc: "Groundwater analysis and water availability assessment", date: "Feb 15, 2026", type: "Water" },
];

const ReportsPage = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl space-y-6">
      <div className="hero-gradient rounded-2xl p-8 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 80% 50%, hsla(190,100%,50%,0.3) 0%, transparent 50%)`
        }} />
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-1">Reports</h1>
          <p className="text-primary-foreground/60 text-sm">Download and view generated reports</p>
        </div>
      </div>

      <div className="space-y-3">
        {reports.map((r, i) => (
          <motion.div
            key={r.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card rounded-2xl p-5 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground">{r.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <Calendar className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{r.date}</span>
              </div>
            </div>
            <span className="text-xs bg-secondary text-muted-foreground px-2.5 py-1 rounded-full font-medium hidden sm:block">{r.type}</span>
            <button className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors shrink-0">
              <Download className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ReportsPage;

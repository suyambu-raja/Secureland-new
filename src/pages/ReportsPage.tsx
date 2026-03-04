import { motion } from "framer-motion";
import { Shield, FileText, Download, Calendar } from "lucide-react";

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
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">Download and view generated reports</p>
      </div>

      <div className="space-y-3">
        {reports.map((r, i) => (
          <motion.div
            key={r.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass rounded-xl p-5 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
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
            <span className="text-xs bg-secondary text-muted-foreground px-2 py-1 rounded-full hidden sm:block">{r.type}</span>
            <button className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors shrink-0">
              <Download className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ReportsPage;

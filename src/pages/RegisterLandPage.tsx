import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, FileText, Upload, MapPin, User, Phone, Ruler, ArrowRight } from "lucide-react";

const RegisterLandPage = () => {
  const [mode, setMode] = useState<"select" | "camera" | "manual">("select");
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScanned(true);
    }, 3000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Register Your Land</h1>
        <p className="text-sm text-muted-foreground mt-1">Choose a registration method to protect your property</p>
      </div>

      {mode === "select" && (
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            whileHover={{ y: -4 }}
            onClick={() => setMode("camera")}
            className="glass rounded-xl p-8 cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-6">
              <Camera className="w-7 h-7 text-primary-foreground" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">Camera Registration</h2>
            <p className="text-sm text-muted-foreground mb-4">Upload or scan your land document. AI will extract details automatically.</p>
            <span className="text-sm font-semibold text-primary flex items-center gap-2 group-hover:gap-3 transition-all">
              Start Scanning <ArrowRight className="w-4 h-4" />
            </span>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            onClick={() => setMode("manual")}
            className="glass rounded-xl p-8 cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-xl gradient-accent flex items-center justify-center mb-6">
              <FileText className="w-7 h-7 text-primary-foreground" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">Manual Registration</h2>
            <p className="text-sm text-muted-foreground mb-4">Fill in your land details manually and draw your boundary on the map.</p>
            <span className="text-sm font-semibold text-accent flex items-center gap-2 group-hover:gap-3 transition-all">
              Enter Details <ArrowRight className="w-4 h-4" />
            </span>
          </motion.div>
        </div>
      )}

      {mode === "camera" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <button onClick={() => setMode("select")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to options
          </button>

          {!scanned ? (
            <div className="glass rounded-xl p-8">
              <div className="border-2 border-dashed border-border rounded-xl p-12 text-center relative overflow-hidden">
                {scanning && (
                  <div className="absolute inset-0">
                    <div className="absolute left-0 right-0 h-0.5 bg-primary animate-scan-line" />
                    <div className="absolute inset-0 bg-primary/5" />
                  </div>
                )}
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {scanning ? "AI Scanning Document..." : "Upload Land Document"}
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {scanning ? "Extracting land details from your document" : "Drag & drop or click to upload your land ownership document"}
                </p>
                {!scanning && (
                  <button
                    onClick={handleScan}
                    className="h-10 px-6 rounded-lg gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    Upload & Scan
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Extracted Details</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { label: "Owner Name", value: "Rajesh Kumar" },
                  { label: "Survey Number", value: "SY-2847/A" },
                  { label: "Land Area", value: "2,450 sq.m" },
                  { label: "Location", value: "Bangalore, Karnataka" },
                ].map((d) => (
                  <div key={d.label} className="bg-secondary rounded-lg p-4">
                    <span className="text-xs text-muted-foreground">{d.label}</span>
                    <p className="text-sm font-semibold text-foreground mt-1">{d.value}</p>
                  </div>
                ))}
              </div>
              <button className="mt-6 h-10 px-6 rounded-lg gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
                Generate Digital Land Twin
              </button>
            </div>
          )}
        </motion.div>
      )}

      {mode === "manual" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <button onClick={() => setMode("select")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to options
          </button>

          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">Land Details</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { label: "Owner Name", icon: User, placeholder: "Enter full name" },
                { label: "Mobile Number", icon: Phone, placeholder: "+91 9876543210" },
                { label: "State", icon: MapPin, placeholder: "Select state" },
                { label: "Location", icon: MapPin, placeholder: "Enter location" },
                { label: "Land Area (sq.m)", icon: Ruler, placeholder: "Enter area" },
              ].map((field) => (
                <div key={field.label}>
                  <label className="text-xs text-muted-foreground mb-1.5 block">{field.label}</label>
                  <div className="relative">
                    <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <label className="text-xs text-muted-foreground mb-1.5 block">Land Boundary (Map)</label>
              <div className="h-64 rounded-lg bg-secondary border border-border flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Click to select location & draw boundary</p>
                </div>
              </div>
            </div>

            <button className="mt-6 h-10 px-6 rounded-lg gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
              Register & Generate Digital Twin
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default RegisterLandPage;

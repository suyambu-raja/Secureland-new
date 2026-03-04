import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, FileText, Upload, MapPin, User, Phone, Ruler, ArrowRight, Scan, CheckCircle } from "lucide-react";

const RegisterLandPage = () => {
  const [mode, setMode] = useState<"select" | "camera" | "manual">("select");
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScanned(true);
    }, 3500);
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPoints([...points, { x, y }]);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl space-y-6">
      {/* Hero */}
      <div className="hero-gradient rounded-2xl p-8 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 70% 50%, hsla(190,100%,50%,0.3) 0%, transparent 50%)`
        }} />
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-2">Register Your Land</h1>
          <p className="text-primary-foreground/60 text-sm">Create a permanent Digital Land Twin for your property to activate satellite monitoring and fraud protection.</p>
        </div>
      </div>

      {mode === "select" && (
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            whileHover={{ y: -4 }}
            onClick={() => setMode("camera")}
            className="glass-card-hover rounded-2xl p-8 cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-2xl hero-gradient flex items-center justify-center mb-6">
              <Camera className="w-7 h-7 text-primary-foreground" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">Camera Registration</h2>
            <p className="text-sm text-muted-foreground mb-4">Scan or upload your land deed. Our AI will automatically extract details and generate your Digital Twin.</p>
            <span className="text-sm font-semibold text-primary flex items-center gap-2 group-hover:gap-3 transition-all">
              Select Document Scan <ArrowRight className="w-4 h-4" />
            </span>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            onClick={() => setMode("manual")}
            className="glass-card-hover rounded-2xl p-8 cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-6">
              <FileText className="w-7 h-7 text-primary-foreground" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">Manual Registration</h2>
            <p className="text-sm text-muted-foreground mb-4">Manually enter your property details and draw your land boundaries on our interactive map.</p>
            <span className="text-sm font-semibold text-accent flex items-center gap-2 group-hover:gap-3 transition-all">
              Select Manual Entry <ArrowRight className="w-4 h-4" />
            </span>
          </motion.div>
        </div>
      )}

      {mode === "camera" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <button onClick={() => { setMode("select"); setScanned(false); setScanning(false); }} className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
            ← Back to options
          </button>

          <div className="glass-card rounded-2xl p-8">
            {!scanned ? (
              <div className="border-2 border-dashed border-border rounded-2xl p-12 text-center relative overflow-hidden">
                {scanning && (
                  <div className="absolute inset-0">
                    <div className="absolute left-0 right-0 h-1 hero-gradient-subtle scan-line rounded-full" />
                    <div className="absolute inset-0 bg-primary/5" />
                  </div>
                )}
                <Upload className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {scanning ? "AI Document Analysis..." : "Upload Property Document"}
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {scanning ? "Extracting coordinates, owner info, and survey details." : "Click to upload or take a photo of your land deed. Supports JPG, PNG, PDF."}
                </p>
                {!scanning && (
                  <button onClick={handleScan} className="h-11 px-8 rounded-xl hero-gradient-subtle text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
                    Upload & Scan
                  </button>
                )}
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-2 mb-6">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  <h3 className="text-lg font-bold text-foreground">Data Extracted Successfully</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {[
                    { label: "Owner Name", value: "John Doe" },
                    { label: "Survey Number", value: "42A / Ooty Rd" },
                    { label: "Land Area", value: "1.50 Acres" },
                    { label: "Location", value: "Coimbatore North" },
                  ].map((d) => (
                    <div key={d.label} className="bg-secondary rounded-xl p-4">
                      <span className="text-xs text-muted-foreground font-medium">{d.label}</span>
                      <p className="text-sm font-bold text-foreground mt-1">{d.value}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-secondary rounded-xl p-4 mb-6">
                  <span className="text-xs text-muted-foreground font-medium">Extracted GPS Coordinates</span>
                  <p className="text-sm font-mono font-medium text-foreground mt-1">11.0168° N, 76.9558° E | 11.0172° N, ...</p>
                </div>
                <button className="h-11 px-8 rounded-xl hero-gradient-subtle text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
                  Confirm & Generate Digital Twin
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {mode === "manual" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <button onClick={() => { setMode("select"); setPoints([]); }} className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
            ← Back to options
          </button>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-foreground mb-2">Enter Land Details</h3>
              <p className="text-sm text-muted-foreground mb-6">Provide accurate information to generate the digital twin.</p>
              <div className="space-y-4">
                {[
                  { label: "Owner Name", icon: User, placeholder: "Enter full name" },
                  { label: "Mobile Number", icon: Phone, placeholder: "+91 9876543210" },
                  { label: "State", icon: MapPin, placeholder: "Select state" },
                  { label: "Land Location", icon: MapPin, placeholder: "Enter location" },
                  { label: "Land Area (sq.m)", icon: Ruler, placeholder: "Enter area" },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="text-xs font-semibold text-foreground mb-1.5 block">{field.label}</label>
                    <div className="relative">
                      <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder={field.placeholder}
                        className="w-full h-11 pl-10 pr-4 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-6 w-full h-11 rounded-xl hero-gradient-subtle text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
                Submit & Generate Digital Twin
              </button>
              {points.length < 3 && (
                <p className="text-xs text-muted-foreground mt-3 text-center">Please draw at least 3 points on the map to define your boundary.</p>
              )}
            </div>

            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scan className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Mark Land Boundaries</span>
                </div>
                <button onClick={() => setPoints([])} className="text-xs text-muted-foreground hover:text-destructive transition-colors font-medium">
                  Clear Map
                </button>
              </div>
              <div
                onClick={handleMapClick}
                className="relative h-[400px] cursor-crosshair overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, hsl(145 30% 85%), hsl(200 30% 80%), hsl(145 30% 75%))`,
                }}
              >
                {/* Grid overlay */}
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, hsl(209 82% 30% / 0.15) 40px, hsl(209 82% 30% / 0.15) 41px),
                    repeating-linear-gradient(90deg, transparent, transparent 40px, hsl(209 82% 30% / 0.15) 40px, hsl(209 82% 30% / 0.15) 41px)`
                }} />

                {/* SVG Drawing Layer */}
                <svg className="absolute inset-0 w-full h-full">
                  {points.length > 1 && (
                    <polygon
                      points={points.map(p => `${p.x},${p.y}`).join(" ")}
                      fill="hsla(209, 82%, 30%, 0.2)"
                      stroke="hsl(190, 100%, 50%)"
                      strokeWidth="2"
                    />
                  )}
                  {points.length > 0 && points.map((p, i) => {
                    if (i === 0) return null;
                    return <line key={i} x1={points[i-1].x} y1={points[i-1].y} x2={p.x} y2={p.y} stroke="hsl(190, 100%, 50%)" strokeWidth="2" />;
                  })}
                  {points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="6" fill="hsl(209, 82%, 30%)" stroke="white" strokeWidth="2" />
                  ))}
                </svg>

                {points.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center bg-card/80 backdrop-blur-sm rounded-xl px-6 py-4 border border-border">
                      <p className="text-sm text-foreground font-medium">Click on the map to trace your land boundary</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default RegisterLandPage;

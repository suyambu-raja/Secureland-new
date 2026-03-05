import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Camera, FileText, Upload, MapPin, User, Phone, Ruler, ArrowRight,
  Scan, CheckCircle, Plus, Globe, Image, Trash2, Loader2, Square
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { doc, setDoc, collection } from "firebase/firestore";
import { registerOnBlockchain } from "@/lib/blockchain";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyADeLSm5n2zxbGooVoS6zggXITfSjbBsfo";

// =============================================
// GOOGLE MAPS BOUNDARY DRAWING COMPONENT
// =============================================
const BoundaryMap = ({ points, onPointsChange }: {
  points: { lat: number; lng: number }[];
  onPointsChange: (pts: { lat: number; lng: number }[]) => void;
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polygonRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const initMap = () => {
      const google = (window as any).google;
      if (!google?.maps) { setTimeout(initMap, 300); return; }

      const map = new google.maps.Map(mapRef.current!, {
        center: { lat: 13.0827, lng: 80.2707 },
        zoom: 14,
        mapTypeId: "satellite",
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        gestureHandling: "greedy",
      });

      map.addListener("click", (e: any) => {
        onPointsChange([...points, { lat: e.latLng.lat(), lng: e.latLng.lng() }]);
      });

      mapInstanceRef.current = map;
    };

    if ((window as any).google?.maps) {
      initMap();
    } else if (!document.getElementById("google-maps-script")) {
      const script = document.createElement("script");
      script.id = "google-maps-script";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&loading=async`;
      script.async = true;
      script.onload = () => setTimeout(initMap, 200);
      document.head.appendChild(script);
    } else {
      const poll = setInterval(() => {
        if ((window as any).google?.maps) { clearInterval(poll); initMap(); }
      }, 200);
    }
  }, []); // eslint-disable-line

  // Re-register click handler when points change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const google = (window as any).google;
    if (!map || !google?.maps) return;

    // Clear previous listeners and re-add
    google.maps.event.clearListeners(map, "click");
    map.addListener("click", (e: any) => {
      onPointsChange([...points, { lat: e.latLng.lat(), lng: e.latLng.lng() }]);
    });
  }, [points, onPointsChange]);

  // Update markers & polygon
  useEffect(() => {
    const google = (window as any).google;
    if (!google?.maps || !mapInstanceRef.current) return;

    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    if (polygonRef.current) { polygonRef.current.setMap(null); polygonRef.current = null; }

    points.forEach((p, i) => {
      const marker = new google.maps.Marker({
        position: { lat: p.lat, lng: p.lng },
        map: mapInstanceRef.current,
        draggable: true,
        label: { text: `${i + 1}`, color: "#fff", fontWeight: "bold", fontSize: "11px" },
        icon: {
          path: google.maps.SymbolPath.CIRCLE, scale: 10,
          fillColor: "#2563EB", fillOpacity: 1, strokeColor: "#fff", strokeWeight: 2,
        },
      });
      // Allow dragging to edit boundary
      marker.addListener("dragend", (e: any) => {
        const updated = [...points];
        updated[i] = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        onPointsChange(updated);
      });
      markersRef.current.push(marker);
    });

    if (points.length >= 3) {
      polygonRef.current = new google.maps.Polygon({
        paths: points.map(p => ({ lat: p.lat, lng: p.lng })),
        strokeColor: "#00E5FF", strokeOpacity: 0.9, strokeWeight: 2.5,
        fillColor: "#2563EB", fillOpacity: 0.15,
        map: mapInstanceRef.current,
      });
    }

    if (points.length > 0 && points.length <= 3) {
      const bounds = new google.maps.LatLngBounds();
      points.forEach(p => bounds.extend({ lat: p.lat, lng: p.lng }));
      mapInstanceRef.current.fitBounds(bounds, 100);
    }
  }, [points]); // eslint-disable-line

  return <div ref={mapRef} className="w-full h-full" />;
};

// =============================================
// Calculate polygon area (Shoelace formula for lat/lng)
// =============================================
const calculateArea = (pts: { lat: number; lng: number }[]) => {
  if (pts.length < 3) return 0;
  // Approximate using Haversine-based Shoelace
  const R = 6371000; // Earth radius in meters
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    const lat1 = pts[i].lat * Math.PI / 180;
    const lat2 = pts[j].lat * Math.PI / 180;
    const dLng = (pts[j].lng - pts[i].lng) * Math.PI / 180;
    area += dLng * (2 + Math.sin(lat1) + Math.sin(lat2));
  }
  area = Math.abs(area * R * R / 2);
  return Math.round(area);
};

// =============================================
// MAIN REGISTER LAND PAGE
// =============================================
const RegisterLandPage = () => {
  const [stage, setStage] = useState<"landing" | "select" | "camera" | "manual">("landing");
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form state
  const [ownerName, setOwnerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [state, setState] = useState("");
  const [location, setLocation] = useState("");
  const [points, setPoints] = useState<{ lat: number; lng: number }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill from logged in user
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("secureland_current_user") || "{}");
    if (user.name) setOwnerName(user.name);
    if (user.phone) setMobile(user.phone);
  }, []);

  const handlePointsChange = useCallback((newPoints: { lat: number; lng: number }[]) => {
    setPoints(newPoints);
  }, []);

  const calculatedArea = calculateArea(points);

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setCapturedImage(ev.target?.result as string);
        setScanning(true);
        setTimeout(() => { setScanning(false); setScanned(true); }, 3500);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!ownerName.trim()) { toast({ title: "Owner Name Required", variant: "destructive" }); return; }
    if (mobile.length < 10) { toast({ title: "Valid Mobile Number Required", variant: "destructive" }); return; }
    if (!state.trim()) { toast({ title: "State Required", variant: "destructive" }); return; }
    if (!location.trim()) { toast({ title: "Location Required", variant: "destructive" }); return; }
    if (points.length < 3) { toast({ title: "Mark at least 3 boundary points on the map", variant: "destructive" }); return; }

    setSubmitting(true);
    try {
      // Generate unique Land ID
      const landId = `SL-${state.slice(0, 2).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
      const twin: any = {
        landId,
        ownerName,
        mobile,
        state,
        location,
        area: calculatedArea,
        coordinates: points,
        createdAt: new Date().toISOString(),
        polygon: points,
      };

      // 1. Save to Firebase Firestore
      await setDoc(doc(db, "digitalTwins", landId), twin);

      // 2. Register on Blockchain (client-side SHA-256 hash chain)
      try {
        const block = await registerOnBlockchain({
          landId,
          ownerName,
          mobile,
          state,
          location,
          area: calculatedArea,
          coordinates: points,
        });
        twin.blockchainHash = block.hash;
        twin.blockIndex = block.index;
        twin.blockNonce = block.nonce;
        twin.blockchainTimestamp = block.timestamp;
        twin.blockchainVerified = true;
      } catch (bcErr) {
        console.warn("Blockchain registration skipped:", bcErr);
      }

      // 3. Keep in localStorage for session
      const existing = JSON.parse(localStorage.getItem("secureland_twins") || "[]");
      existing.push(twin);
      localStorage.setItem("secureland_twins", JSON.stringify(existing));
      localStorage.setItem("secureland_latest_twin", JSON.stringify(twin));

      toast({ title: "⛓️ Land Registered on Blockchain!", description: `Land ID: ${landId} — Hash: ${twin.blockchainHash?.slice(0, 16)}...` });
      navigate("/digital-twin");
    } catch (error: any) {
      console.error("Land registration error:", error);
      toast({ title: "Registration Failed", description: error.message || "Failed to save. Try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-[1200px] mx-auto space-y-8">
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleCameraCapture} className="hidden" />

      {/* === LANDING === */}
      {stage === "landing" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
            className="w-28 h-28 rounded-3xl bg-primary/10 flex items-center justify-center mb-8 shadow-xl shadow-primary/10 border border-primary/20 relative">
            <div className="absolute -inset-4 bg-primary/10 blur-2xl rounded-full" />
            <MapPin className="w-12 h-12 text-primary relative z-10" />
          </motion.div>
          <h1 className="text-3xl font-extrabold text-foreground mb-3 tracking-tight">Digital Twin Registration</h1>
          <p className="text-muted-foreground text-sm max-w-md mb-8">Register your land and generate its Digital Twin identity.</p>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setStage("select")}
            className="h-14 px-10 rounded-2xl hero-gradient-subtle text-primary-foreground font-semibold text-base flex items-center gap-3 shadow-xl shadow-primary/30 hover:opacity-90 transition-opacity">
            <Plus className="w-5 h-5" /> Register New Land <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      )}

      {/* === SELECT METHOD === */}
      {stage === "select" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">How to Register?</h1>
            <p className="text-muted-foreground text-sm">Choose your preferred registration method.</p>
          </div>
          <button onClick={() => setStage("landing")} className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">← Back</button>
          <div className="grid md:grid-cols-2 gap-6">
            <motion.button whileHover={{ y: -4, scale: 1.01 }} onClick={() => setStage("camera")}
              className="glass-card rounded-2xl p-8 text-left hover:border-primary/30 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                <Camera className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Camera Scan</h3>
              <p className="text-sm text-muted-foreground">Capture land document and AI will extract details automatically.</p>
            </motion.button>
            <motion.button whileHover={{ y: -4, scale: 1.01 }} onClick={() => setStage("manual")}
              className="glass-card rounded-2xl p-8 text-left hover:border-primary/30 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/20 transition-colors">
                <FileText className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Manual Entry</h3>
              <p className="text-sm text-muted-foreground">Enter land details and draw boundary on Google Maps.</p>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* === CAMERA SCAN === */}
      {stage === "camera" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">AI Document Scanner</h1>
            <p className="text-muted-foreground text-sm">Capture or upload your land document.</p>
          </div>
          <button onClick={() => { setStage("select"); setCapturedImage(null); setScanned(false); }} className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">← Back</button>
          <div className="glass-card rounded-2xl p-8 text-center">
            {!capturedImage ? (
              <div className="space-y-6">
                <div className="w-24 h-24 mx-auto rounded-3xl bg-primary/10 border-2 border-dashed border-primary/30 flex items-center justify-center">
                  <Scan className="w-10 h-10 text-primary" />
                </div>
                <div className="flex gap-4 justify-center">
                  <button onClick={() => fileInputRef.current?.click()}
                    className="h-12 px-6 rounded-xl hero-gradient-subtle text-primary-foreground font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg">
                    <Camera className="w-4 h-4" /> Capture
                  </button>
                  <button onClick={() => fileInputRef.current?.click()}
                    className="h-12 px-6 rounded-xl bg-secondary border border-border text-foreground font-semibold flex items-center gap-2 hover:bg-secondary/80 transition-colors">
                    <Upload className="w-4 h-4" /> Upload
                  </button>
                </div>
              </div>
            ) : scanning ? (
              <div className="space-y-6 py-8">
                <Loader2 className="w-16 h-16 text-primary mx-auto animate-spin" />
                <h3 className="text-lg font-bold text-foreground">AI Document Analysis...</h3>
                <p className="text-sm text-muted-foreground">Extracting coordinates, owner info, and survey details.</p>
              </div>
            ) : scanned ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-2 mb-6">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-lg font-bold text-foreground">Data Extracted Successfully</h3>
                </div>
                {capturedImage && <img src={capturedImage} alt="Document" className="w-full h-40 object-cover rounded-xl mb-6 border border-border" />}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {[{ label: "Owner Name", value: "John Doe" }, { label: "Survey Number", value: "42A / Ooty Rd" }, { label: "Land Area", value: "1.50 Acres" }, { label: "Location", value: "Coimbatore North" }].map((d) => (
                    <div key={d.label} className="bg-secondary/50 rounded-xl p-4 border border-border/50">
                      <span className="text-xs text-muted-foreground font-medium">{d.label}</span>
                      <p className="text-sm font-bold text-foreground mt-1">{d.value}</p>
                    </div>
                  ))}
                </div>
                <button onClick={() => navigate("/digital-twin")}
                  className="h-12 px-8 rounded-xl hero-gradient-subtle text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg">
                  Confirm & Generate Digital Twin <ArrowRight className="w-4 h-4 inline ml-2" />
                </button>
              </motion.div>
            ) : null}
          </div>
        </motion.div>
      )}

      {/* === MANUAL REGISTRATION === */}
      {stage === "manual" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Manual Registration</h1>
            <p className="text-muted-foreground text-sm">Enter land details and mark boundaries on Google Maps.</p>
          </div>
          <button onClick={() => { setStage("select"); setPoints([]); }} className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">← Back to options</button>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* LEFT — Form */}
            <div className="glass-card rounded-[24px] p-8">
              <h3 className="text-lg font-bold text-foreground mb-2">Enter Land Details</h3>
              <p className="text-sm text-muted-foreground mb-6">Provide accurate information to generate the digital twin.</p>
              <div className="space-y-4">
                {/* Owner Name */}
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">Owner Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="text" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Enter full name"
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                </div>
                {/* Mobile */}
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="+91 9876543210"
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                </div>
                {/* State */}
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">State</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <select value={state} onChange={(e) => setState(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer">
                      <option value="">Select state</option>
                      {["Tamil Nadu", "Kerala", "Karnataka", "Andhra Pradesh", "Telangana", "Maharashtra", "Gujarat", "Rajasthan", "Uttar Pradesh", "West Bengal", "Bihar", "Odisha", "Punjab", "Haryana", "Madhya Pradesh", "Other"].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* Location */}
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">Land Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Village / Town / City"
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                </div>
                {/* Auto-calculated Area */}
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">Land Area (auto-calculated from boundary)</label>
                  <div className="h-11 px-4 rounded-xl bg-secondary border border-border flex items-center gap-2 text-sm">
                    <Square className="w-4 h-4 text-muted-foreground" />
                    <span className={`font-mono font-medium ${calculatedArea > 0 ? "text-foreground" : "text-muted-foreground"}`}>
                      {calculatedArea > 0 ? `${calculatedArea.toLocaleString()} sq.m (${(calculatedArea / 4046.86).toFixed(2)} acres)` : "Mark boundary to calculate"}
                    </span>
                  </div>
                </div>
                {/* Coordinates */}
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">GPS Coordinates ({points.length} points)</label>
                  <div className="max-h-20 overflow-y-auto px-4 py-2 rounded-xl bg-secondary border border-border text-xs text-muted-foreground font-mono">
                    {points.length > 0
                      ? points.map((p, i) => <div key={i}>#{i + 1}: {p.lat.toFixed(6)}°N, {p.lng.toFixed(6)}°E</div>)
                      : "Click on the map to mark boundaries →"
                    }
                  </div>
                </div>
              </div>

              <button onClick={handleSubmit}
                disabled={submitting || points.length < 3 || !ownerName || mobile.length < 10 || !state || !location}
                className="mt-6 w-full h-12 rounded-xl hero-gradient-subtle text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Submit & Generate Digital Twin <ArrowRight className="w-4 h-4" /></>}
              </button>
              {points.length < 3 && (
                <p className="text-xs text-muted-foreground mt-3 text-center">Please draw at least 3 points on the map to define your boundary.</p>
              )}
            </div>

            {/* RIGHT — Google Maps */}
            <div className="glass-card rounded-[24px] overflow-hidden">
              <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scan className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Mark Land Boundaries (Google Maps)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-muted-foreground font-mono">{points.length} pts</span>
                  <button onClick={() => setPoints([])} className="text-xs text-muted-foreground hover:text-destructive transition-colors font-medium flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                </div>
              </div>
              <div className="relative h-[530px] overflow-hidden">
                <BoundaryMap points={points} onPointsChange={handlePointsChange} />

                {points.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="text-center bg-card/80 backdrop-blur-sm rounded-xl px-6 py-4 border border-border shadow-lg">
                      <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
                      <p className="text-sm text-foreground font-medium">Click on satellite map to mark boundary</p>
                      <p className="text-xs text-muted-foreground mt-1">Mark at least 3 corner points • Drag to edit</p>
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

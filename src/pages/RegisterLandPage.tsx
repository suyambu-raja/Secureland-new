import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Camera, FileText, Upload, MapPin, User, Phone, Ruler, ArrowRight, Scan, CheckCircle, Plus, Globe, Image } from "lucide-react";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyADeLSm5n2zxbGooVoS6zggXITfSjbBsfo";

// Isolated Google Maps Boundary component
const BoundaryMap = ({ onPointAdd, points, onClear }: {
  onPointAdd: (lat: number, lng: number) => void;
  points: { lat: number; lng: number }[];
  onClear: () => void;
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polygonRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const initMap = () => {
      const google = (window as any).google;
      if (!google?.maps) {
        setTimeout(initMap, 300);
        return;
      }

      const map = new google.maps.Map(mapRef.current!, {
        center: { lat: 13.0827, lng: 80.2707 }, // Chennai default
        zoom: 15,
        mapTypeId: "satellite",
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
      });

      map.addListener("click", (e: any) => {
        onPointAdd(e.latLng.lat(), e.latLng.lng());
      });

      mapInstanceRef.current = map;
    };

    // Load Google Maps
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
        if ((window as any).google?.maps) {
          clearInterval(poll);
          initMap();
        }
      }, 200);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update markers and polygon when points change
  useEffect(() => {
    const google = (window as any).google;
    if (!google?.maps || !mapInstanceRef.current) return;

    // Clear old markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    // Clear old polygon
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
      polygonRef.current = null;
    }

    // Add new markers
    points.forEach((p, i) => {
      const marker = new google.maps.Marker({
        position: { lat: p.lat, lng: p.lng },
        map: mapInstanceRef.current,
        label: { text: `${i + 1}`, color: "#fff", fontWeight: "bold", fontSize: "12px" },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#2563EB",
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 2,
        },
      });
      markersRef.current.push(marker);
    });

    // Add polygon if 3+ points
    if (points.length >= 3) {
      polygonRef.current = new google.maps.Polygon({
        paths: points.map(p => ({ lat: p.lat, lng: p.lng })),
        strokeColor: "#00E5FF",
        strokeOpacity: 0.9,
        strokeWeight: 2,
        fillColor: "#2563EB",
        fillOpacity: 0.15,
        map: mapInstanceRef.current,
      });
    }

    // Auto-fit bounds
    if (points.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      points.forEach(p => bounds.extend({ lat: p.lat, lng: p.lng }));
      mapInstanceRef.current.fitBounds(bounds, 80);
    }
  }, [points]);

  return <div ref={mapRef} className="w-full h-full" />;
};

const RegisterLandPage = () => {
  const [stage, setStage] = useState<"landing" | "select" | "camera" | "manual">("landing");
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [points, setPoints] = useState<{ lat: number; lng: number }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setCapturedImage(ev.target?.result as string);
        setScanning(true);
        setTimeout(() => {
          setScanning(false);
          setScanned(true);
        }, 3500);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPoint = useCallback((lat: number, lng: number) => {
    setPoints(prev => [...prev, { lat, lng }]);
  }, []);

  const handleGenerateTwin = () => {
    navigate("/digital-twin");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-[1200px] mx-auto space-y-8">
      {/* Hidden Camera Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraCapture}
        className="hidden"
      />

      {/* Step 5: Landing — Register Land Button */}
      {stage === "landing" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center min-h-[60vh] text-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-28 h-28 rounded-3xl bg-primary/10 flex items-center justify-center mb-8 shadow-xl shadow-primary/10 border border-primary/20 relative"
          >
            <div className="absolute -inset-4 bg-primary/10 blur-2xl rounded-full" />
            <MapPin className="w-12 h-12 text-primary relative z-10" />
          </motion.div>

          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">Register Your Property</h1>
          <p className="text-muted-foreground max-w-md mb-10">
            Add your land to the SecureLand protection network. Create a permanent digital identity and enable satellite monitoring.
          </p>

          <motion.button
            whileHover={{ scale: 1.03, translateY: -3 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setStage("select")}
            className="flex items-center gap-3 hero-gradient-subtle px-10 py-4 rounded-2xl text-white font-bold text-lg shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_40px_rgba(37,99,235,0.6)] transition-all border border-white/10"
          >
            <Plus className="w-6 h-6" />
            Register Land
          </motion.button>
        </motion.div>
      )}

      {/* Step 6: Camera or Manual Selection */}
      {stage === "select" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Choose Registration Method</h1>
            <p className="text-muted-foreground text-sm">Select how you'd like to register your land document.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              whileHover={{ y: -4, scale: 1.01 }}
              onClick={() => {
                setStage("camera");
                // Trigger native camera
                fileInputRef.current?.click();
              }}
              className="glass-card-hover rounded-[24px] p-8 cursor-pointer group border border-border/50"
            >
              <div className="w-16 h-16 rounded-2xl hero-gradient flex items-center justify-center mb-6 shadow-lg shadow-primary/20 group-hover:shadow-xl group-hover:shadow-primary/30 transition-shadow">
                <Camera className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Camera Registration</h2>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                Take a photo of your land document. Our AI will automatically extract the land details and GPS coordinates.
              </p>
              <span className="text-sm font-semibold text-primary flex items-center gap-2 group-hover:gap-3 transition-all">
                Open Camera <ArrowRight className="w-4 h-4" />
              </span>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, scale: 1.01 }}
              onClick={() => setStage("manual")}
              className="glass-card-hover rounded-[24px] p-8 cursor-pointer group border border-border/50"
            >
              <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-6 shadow-lg shadow-accent/20 group-hover:shadow-xl group-hover:shadow-accent/30 transition-shadow">
                <FileText className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Manual Registration</h2>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                Manually enter your property details and mark your land boundaries using interactive Google Maps.
              </p>
              <span className="text-sm font-semibold text-accent flex items-center gap-2 group-hover:gap-3 transition-all">
                Enter Details <ArrowRight className="w-4 h-4" />
              </span>
            </motion.div>
          </div>

          <button onClick={() => setStage("landing")} className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
            ← Back
          </button>
        </motion.div>
      )}

      {/* Step 7: Camera Registration */}
      {stage === "camera" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Camera Registration</h1>
              <p className="text-muted-foreground text-sm">Upload or capture your land document for AI processing.</p>
            </div>
          </div>
          <button onClick={() => { setStage("select"); setScanned(false); setScanning(false); setCapturedImage(null); }} className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
            ← Back to options
          </button>

          <div className="glass-card rounded-[24px] p-8">
            {!capturedImage && !scanned ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-2xl p-16 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Upload or Capture Document</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                  Click to open your camera or select a photo of your land deed. Supports JPG, PNG, PDF.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <span className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold flex items-center gap-2">
                    <Camera className="w-4 h-4" /> Take Photo
                  </span>
                  <span className="px-4 py-2 rounded-lg bg-secondary text-foreground text-sm font-semibold flex items-center gap-2">
                    <Image className="w-4 h-4" /> Gallery
                  </span>
                </div>
              </div>
            ) : scanning ? (
              <div className="relative overflow-hidden rounded-2xl">
                {capturedImage && (
                  <img src={capturedImage} alt="Captured document" className="w-full h-64 object-cover rounded-2xl opacity-50" />
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm rounded-2xl">
                  <motion.div
                    animate={{ y: ["0%", "100%", "0%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent absolute top-0"
                  />
                  <Scan className="w-12 h-12 text-primary mb-4 animate-pulse" />
                  <h3 className="text-lg font-bold text-foreground">AI Document Analysis...</h3>
                  <p className="text-sm text-muted-foreground">Extracting coordinates, owner info, and survey details.</p>
                </div>
              </div>
            ) : scanned ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-2 mb-6">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  <h3 className="text-lg font-bold text-foreground">Data Extracted Successfully</h3>
                </div>
                {capturedImage && (
                  <img src={capturedImage} alt="Captured document" className="w-full h-40 object-cover rounded-xl mb-6 border border-border" />
                )}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {[
                    { label: "Owner Name", value: "John Doe" },
                    { label: "Survey Number", value: "42A / Ooty Rd" },
                    { label: "Land Area", value: "1.50 Acres" },
                    { label: "Location", value: "Coimbatore North" },
                  ].map((d) => (
                    <div key={d.label} className="bg-secondary/50 rounded-xl p-4 border border-border/50">
                      <span className="text-xs text-muted-foreground font-medium">{d.label}</span>
                      <p className="text-sm font-bold text-foreground mt-1">{d.value}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-secondary/50 rounded-xl p-4 mb-6 border border-border/50">
                  <span className="text-xs text-muted-foreground font-medium">Extracted GPS Coordinates</span>
                  <p className="text-sm font-mono font-medium text-foreground mt-1">11.0168° N, 76.9558° E | 11.0172° N, 76.9562° E</p>
                </div>
                <button
                  onClick={handleGenerateTwin}
                  className="h-12 px-8 rounded-xl hero-gradient-subtle text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                >
                  Confirm & Generate Digital Twin <ArrowRight className="w-4 h-4 inline ml-2" />
                </button>
              </motion.div>
            ) : null}
          </div>
        </motion.div>
      )}

      {/* Step 8: Manual Registration */}
      {stage === "manual" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Manual Registration</h1>
            <p className="text-muted-foreground text-sm">Enter land details and mark boundaries on the map.</p>
          </div>
          <button onClick={() => { setStage("select"); setPoints([]); }} className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
            ← Back to options
          </button>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="glass-card rounded-[24px] p-8">
              <h3 className="text-lg font-bold text-foreground mb-2">Enter Land Details</h3>
              <p className="text-sm text-muted-foreground mb-6">Provide accurate information to generate the digital twin.</p>
              <div className="space-y-4">
                {[
                  { label: "Owner Name", icon: User, placeholder: "Enter full name", type: "text" },
                  { label: "Mobile Number", icon: Phone, placeholder: "+91 9876543210", type: "tel" },
                  { label: "State", icon: Globe, placeholder: "Select state", type: "text" },
                  { label: "Location", icon: MapPin, placeholder: "Enter location / village / city", type: "text" },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="text-xs font-semibold text-foreground mb-1.5 block">{field.label}</label>
                    <div className="relative">
                      <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        className="w-full h-11 pl-10 pr-4 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                  </div>
                ))}

                {/* Coordinates Display */}
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">Coordinates (from Map)</label>
                  <div className="h-11 px-4 rounded-xl bg-secondary border border-border flex items-center text-sm text-muted-foreground font-mono">
                    {points.length > 0
                      ? `${points.length} point(s) marked — ${points.map(p => `${p.lat.toFixed(4)}°, ${p.lng.toFixed(4)}°`).join(" | ")}`
                      : "Click on the map to mark boundaries →"
                    }
                  </div>
                </div>
              </div>
              <button
                onClick={handleGenerateTwin}
                disabled={points.length < 3}
                className="mt-6 w-full h-12 rounded-xl hero-gradient-subtle text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Submit & Generate Digital Twin <ArrowRight className="w-4 h-4" />
              </button>
              {points.length < 3 && (
                <p className="text-xs text-muted-foreground mt-3 text-center">Please draw at least 3 points on the map to define your boundary.</p>
              )}
            </div>

            <div className="glass-card rounded-[24px] overflow-hidden">
              <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scan className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Mark Land Boundaries (Google Maps)</span>
                </div>
                <button onClick={() => setPoints([])} className="text-xs text-muted-foreground hover:text-destructive transition-colors font-medium">
                  Clear Map
                </button>
              </div>
              <div className="relative h-[450px] overflow-hidden">
                <BoundaryMap
                  onPointAdd={handleAddPoint}
                  points={points}
                  onClear={() => setPoints([])}
                />

                {points.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="text-center bg-card/80 backdrop-blur-sm rounded-xl px-6 py-4 border border-border">
                      <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
                      <p className="text-sm text-foreground font-medium">Click on the map to trace your land boundary</p>
                      <p className="text-xs text-muted-foreground mt-1">Mark at least 3 corner points</p>
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

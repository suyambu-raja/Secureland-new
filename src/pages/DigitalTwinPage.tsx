import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Shield, Map, Fingerprint, CheckCircle, Hexagon, ArrowRight, Sparkles,
    MapPin, User, Phone, Globe, Calendar, Hash, Ruler, Copy, Download, Eye, Box
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Cesium3DViewer from "@/components/Cesium3DViewer";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyADeLSm5n2zxbGooVoS6zggXITfSjbBsfo";

// =============================================
// DIGITAL TWIN MAP VIEWER
// =============================================
const TwinMapViewer = ({ polygon }: { polygon: { lat: number; lng: number }[] }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current || polygon.length < 3) return;

        const initMap = () => {
            const google = (window as any).google;
            if (!google?.maps) { setTimeout(initMap, 300); return; }

            const bounds = new google.maps.LatLngBounds();
            polygon.forEach(p => bounds.extend({ lat: p.lat, lng: p.lng }));

            const map = new google.maps.Map(mapRef.current!, {
                center: bounds.getCenter(),
                zoom: 17,
                mapTypeId: "satellite",
                disableDefaultUI: false,
                zoomControl: true,
                mapTypeControl: true,
                streetViewControl: false,
                fullscreenControl: true,
            });

            // Draw polygon
            new google.maps.Polygon({
                paths: polygon.map(p => ({ lat: p.lat, lng: p.lng })),
                strokeColor: "#00E5FF",
                strokeOpacity: 1,
                strokeWeight: 3,
                fillColor: "#2563EB",
                fillOpacity: 0.2,
                map,
            });

            // Add markers at corners
            polygon.forEach((p, i) => {
                new google.maps.Marker({
                    position: { lat: p.lat, lng: p.lng },
                    map,
                    label: { text: `${i + 1}`, color: "#fff", fontWeight: "bold", fontSize: "10px" },
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE, scale: 8,
                        fillColor: "#00E5FF", fillOpacity: 1, strokeColor: "#fff", strokeWeight: 2,
                    },
                });
            });

            map.fitBounds(bounds, 60);
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
    }, [polygon]);

    return <div ref={mapRef} className="w-full h-full rounded-2xl" />;
};

// =============================================
// MAIN DIGITAL TWIN PAGE
// =============================================
const DigitalTwinPage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState<"generating" | "complete">("generating");
    const [twin, setTwin] = useState<any>(null);
    const [viewMode, setViewMode] = useState<"2D" | "3D">("2D");

    useEffect(() => {
        const stored = localStorage.getItem("secureland_latest_twin");
        if (stored) setTwin(JSON.parse(stored));
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setPhase("complete"), 500);
                    return 100;
                }
                return prev + 2;
            });
        }, 80);
        return () => clearInterval(interval);
    }, []);

    const steps = [
        { label: "Processing GPS Coordinates", threshold: 15 },
        { label: "Generating Boundary Hash", threshold: 30 },
        { label: "Computing Land Area", threshold: 45 },
        { label: "Creating 3D Terrain Model", threshold: 60 },
        { label: "Linking Owner Identity", threshold: 75 },
        { label: "Storing on Blockchain", threshold: 90 },
    ];

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied!", description: text });
    };

    if (!twin) {
        return (
            <div className="min-h-screen hero-gradient flex items-center justify-center p-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-primary-foreground mb-4">No Land Data Found</h1>
                    <button onClick={() => navigate("/protection/register-land")}
                        className="h-12 px-8 rounded-xl hero-gradient-subtle text-primary-foreground font-semibold">
                        Register Land First
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen hero-gradient relative overflow-hidden">
            {/* Particle Background */}
            <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `radial-gradient(circle at 30% 30%, hsla(190,100%,50%,0.4) 0%, transparent 50%),
          radial-gradient(circle at 70% 70%, hsla(145,65%,32%,0.3) 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, hsla(209,82%,50%,0.2) 0%, transparent 60%)`
            }} />
            <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(255,255,255,0.2) 60px),
          repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(255,255,255,0.2) 60px)`
            }} />

            <div className="relative z-10 p-6 max-w-7xl mx-auto">
                {phase === "generating" ? (
                    <div className="flex items-center justify-center min-h-[80vh]">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 text-center w-full max-w-2xl">
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} className="w-32 h-32 mx-auto relative">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Hexagon className="w-32 h-32 text-cyan/30" strokeWidth={0.5} />
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                                        <Fingerprint className="w-14 h-14 text-primary-foreground drop-shadow-[0_0_20px_rgba(0,210,255,0.8)]" />
                                    </motion.div>
                                </div>
                            </motion.div>

                            <div>
                                <h1 className="text-3xl font-extrabold text-primary-foreground mb-3 tracking-tight">Generating Digital Twin</h1>
                                <p className="text-primary-foreground/60 text-sm">SecureLand AI is creating the permanent digital identity of your land.</p>
                            </div>

                            <div className="max-w-md mx-auto">
                                <div className="h-3 w-full bg-primary-foreground/10 rounded-full overflow-hidden backdrop-blur-sm border border-primary-foreground/10">
                                    <motion.div className="h-full rounded-full"
                                        style={{ background: "linear-gradient(90deg, #3b82f6, #00d2ff, #10b981)", width: `${progress}%` }}
                                        transition={{ duration: 0.3 }} />
                                </div>
                                <p className="text-primary-foreground/80 text-sm font-mono mt-3">{progress}%</p>
                            </div>

                            <div className="space-y-3 max-w-sm mx-auto text-left">
                                {steps.map((s, i) => (
                                    <motion.div key={s.label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: progress >= s.threshold ? 1 : 0.3, x: 0 }}
                                        transition={{ delay: i * 0.08 }} className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${progress >= s.threshold ? "bg-cyan/20 border-cyan text-cyan" : "border-primary-foreground/20 text-primary-foreground/30"}`}>
                                            {progress >= s.threshold ? <CheckCircle className="w-4 h-4" /> : <span className="w-2 h-2 bg-primary-foreground/20 rounded-full" />}
                                        </div>
                                        <span className={`text-sm font-medium ${progress >= s.threshold ? "text-primary-foreground" : "text-primary-foreground/30"}`}>{s.label}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
                                className="w-20 h-20 mx-auto rounded-2xl bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.4)] mb-4">
                                <CheckCircle className="w-10 h-10 text-emerald-400" />
                            </motion.div>
                            <h1 className="text-3xl font-extrabold text-primary-foreground tracking-tight">Digital Twin Created!</h1>
                            <p className="text-primary-foreground/50 text-sm mt-2">Your land's permanent digital identity is now secured.</p>
                        </div>

                        <div className="grid lg:grid-cols-5 gap-6">
                            {/* LEFT — Info Panel (2 cols) */}
                            <div className="lg:col-span-2 space-y-4">
                                {/* Twin ID Card */}
                                <div className="glass rounded-2xl p-6 border border-primary-foreground/10">
                                    <div className="flex items-center gap-3 mb-5">
                                        <Sparkles className="w-5 h-5 text-cyan" />
                                        <span className="text-sm font-bold text-primary-foreground">Digital Twin Identity</span>
                                    </div>

                                    <div className="space-y-3">
                                        {[
                                            { label: "Land ID", value: twin.landId, icon: Hash, copyable: true },
                                            { label: "Owner", value: twin.ownerName, icon: User },
                                            { label: "Mobile", value: `+91 ${twin.mobile}`, icon: Phone },
                                            { label: "State", value: twin.state, icon: Globe },
                                            { label: "Location", value: twin.location, icon: MapPin },
                                            { label: "Land Area", value: `${twin.area?.toLocaleString()} sq.m (${(twin.area / 4046.86).toFixed(2)} acres)`, icon: Ruler },
                                            { label: "Boundary Points", value: `${twin.coordinates?.length} GPS Points`, icon: Map },
                                            { label: "Created", value: new Date(twin.createdAt).toLocaleString("en-IN"), icon: Calendar },
                                        ].map((item: any) => (
                                            <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-primary-foreground/5 border border-primary-foreground/10">
                                                <item.icon className="w-4 h-4 text-cyan shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] text-primary-foreground/40 font-medium">{item.label}</p>
                                                    <p className="text-sm font-bold text-primary-foreground truncate font-mono">{item.value}</p>
                                                </div>
                                                {item.copyable && (
                                                    <button onClick={() => copyToClipboard(item.value)} className="p-1.5 rounded-lg hover:bg-primary-foreground/10 transition-colors">
                                                        <Copy className="w-3.5 h-3.5 text-primary-foreground/50" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Blockchain Verification */}
                                <div className="glass rounded-2xl p-5 border border-primary-foreground/10">
                                    <p className="text-[10px] text-primary-foreground/40 font-medium mb-2 uppercase tracking-wider">⛓️ Blockchain Record</p>
                                    {twin.blockchainHash ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-mono text-cyan truncate flex-1">0x{twin.blockchainHash}</p>
                                                <button onClick={() => copyToClipboard(twin.blockchainHash)} className="p-1 rounded hover:bg-primary-foreground/10">
                                                    <Copy className="w-3 h-3 text-primary-foreground/50" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-4 text-[10px] font-mono text-primary-foreground/50">
                                                <span>Block #{twin.blockIndex}</span>
                                                <span>Nonce: {twin.blockNonce}</span>
                                                <div className="flex items-center gap-1 ml-auto">
                                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                                    <span className="text-emerald-400 font-bold">VERIFIED</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs font-mono text-primary-foreground/40">Blockchain registration pending...</p>
                                        </div>
                                    )}
                                </div>

                                {/* GPS Coordinates */}
                                <div className="glass rounded-2xl p-5 border border-primary-foreground/10">
                                    <p className="text-xs font-bold text-primary-foreground mb-3 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-cyan" /> GPS Coordinates
                                    </p>
                                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                        {twin.coordinates?.map((c: any, i: number) => (
                                            <div key={i} className="flex items-center gap-2 text-xs font-mono text-primary-foreground/70">
                                                <span className="w-5 h-5 rounded bg-cyan/10 text-cyan flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                                                {c.lat.toFixed(6)}°N, {c.lng.toFixed(6)}°E
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT — Satellite Map (3 cols) */}
                            <div className="lg:col-span-3">
                                <div className="glass rounded-2xl overflow-hidden border border-primary-foreground/10 h-full flex flex-col">
                                    <div className="px-5 py-3 border-b border-primary-foreground/10 flex items-center justify-between bg-primary-foreground/5 shrink-0">
                                        <div className="flex items-center gap-2">
                                            <Eye className="w-4 h-4 text-cyan" />
                                            <span className="text-sm font-bold text-primary-foreground">
                                                {viewMode === "2D" ? "Satellite View — 2D Boundary" : "Digital Twin — 3D Visualizer"}
                                            </span>
                                        </div>
                                        <div className="flex bg-black/40 p-1 rounded-lg border border-white/10">
                                            <button
                                                onClick={() => setViewMode("2D")}
                                                className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all flex items-center gap-1.5 ${viewMode === "2D" ? "bg-cyan text-black" : "text-primary-foreground/50 hover:text-primary-foreground"}`}
                                            >
                                                <Map className="w-3 h-3" /> 2D MAP
                                            </button>
                                            <button
                                                onClick={() => setViewMode("3D")}
                                                className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all flex items-center gap-1.5 ${viewMode === "3D" ? "bg-cyan text-black" : "text-primary-foreground/50 hover:text-primary-foreground"}`}
                                            >
                                                <Box className="w-3 h-3" /> 3D TWIN
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-h-[500px]">
                                        {viewMode === "2D" ? (
                                            <TwinMapViewer polygon={twin.polygon || twin.coordinates || []} />
                                        ) : (
                                            <Cesium3DViewer
                                                coordinates={twin.polygon || twin.coordinates || []}
                                                landId={twin.landId}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto mt-6">
                            <button onClick={() => navigate("/protection/dashboard")}
                                className="flex-1 h-12 rounded-xl hero-gradient-subtle text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 border border-white/10">
                                <Shield className="w-4 h-4" /> Go to Dashboard
                            </button>
                            <button onClick={() => navigate("/protection/register-land")}
                                className="flex-1 h-12 rounded-xl bg-primary-foreground/10 backdrop-blur border border-primary-foreground/20 text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:bg-primary-foreground/20 transition-all">
                                <Map className="w-4 h-4" /> Register Another
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default DigitalTwinPage;

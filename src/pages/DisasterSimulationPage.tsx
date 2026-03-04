import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    MapPin, Droplets, Mountain, AlertTriangle, Shield, Waves,
    Cloud, Thermometer, Wind, TrendingUp, ChevronLeft, Play,
    RotateCcw, Satellite, Activity, Eye, Layers, Info, Gauge,
    ArrowRight, Clock, Zap, CloudRain
} from "lucide-react";

// ============================================
// MOCK PROPERTY DATA
// ============================================
const mockProperties: Record<string, any> = {
    "CHN-102": {
        id: "CHN-102",
        name: "Velachery Green Plots",
        location: "Velachery, Chennai",
        latitude: 12.9784,
        longitude: 80.2210,
        elevation: 7,
        area: "2400 sq.ft",
        price: "₹1.2 Cr",
        distance_to_river: 1200,
        nearby_water: "Adyar River",
        safety_score: 62,
        flood_history: "Flooded in 2015, 2021",
    },
    "CBE-205": {
        id: "CBE-205",
        name: "Green Valley Estate",
        location: "Coimbatore North",
        latitude: 11.0168,
        longitude: 76.9558,
        elevation: 425,
        area: "3200 sq.ft",
        price: "₹85 L",
        distance_to_river: 4500,
        nearby_water: "Noyyal River",
        safety_score: 94,
        flood_history: "None recorded",
    },
    "OTY-301": {
        id: "OTY-301",
        name: "Hilltop Gardens",
        location: "Coonoor, Ooty",
        latitude: 11.3530,
        longitude: 76.7959,
        elevation: 1850,
        area: "4000 sq.ft",
        price: "₹1.5 Cr",
        distance_to_river: 8200,
        nearby_water: "Coonoor Stream",
        safety_score: 97,
        flood_history: "None recorded",
    },
};

// ============================================
// FLOOD SIMULATION LOGIC
// ============================================
const calculateFloodRisk = (elevation: number, rainfall: number, distToRiver: number) => {
    let score = 0;

    // Elevation scoring (0-40 points)
    if (elevation < 5) score += 40;
    else if (elevation < 10) score += 30;
    else if (elevation < 20) score += 20;
    else if (elevation < 50) score += 10;
    else score += 0;

    // Rainfall scoring (0-35 points)
    if (rainfall > 200) score += 35;
    else if (rainfall > 150) score += 28;
    else if (rainfall > 100) score += 20;
    else if (rainfall > 50) score += 10;
    else score += 0;

    // Distance to water (0-25 points)
    if (distToRiver < 500) score += 25;
    else if (distToRiver < 1000) score += 20;
    else if (distToRiver < 2000) score += 12;
    else if (distToRiver < 5000) score += 5;
    else score += 0;

    let level: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "MINIMAL";
    if (score >= 70) level = "CRITICAL";
    else if (score >= 50) level = "HIGH";
    else if (score >= 30) level = "MEDIUM";
    else if (score >= 15) level = "LOW";
    else level = "MINIMAL";

    return { score, level };
};

const riskColors = {
    CRITICAL: { bg: "bg-red-500", text: "text-red-500", border: "border-red-500/30", fill: "bg-red-500/10" },
    HIGH: { bg: "bg-orange-500", text: "text-orange-500", border: "border-orange-500/30", fill: "bg-orange-500/10" },
    MEDIUM: { bg: "bg-yellow-500", text: "text-yellow-500", border: "border-yellow-500/30", fill: "bg-yellow-500/10" },
    LOW: { bg: "bg-blue-500", text: "text-blue-500", border: "border-blue-500/30", fill: "bg-blue-500/10" },
    MINIMAL: { bg: "bg-emerald-500", text: "text-emerald-500", border: "border-emerald-500/30", fill: "bg-emerald-500/10" },
};

// ============================================
// WEATHER MOCK DATA
// ============================================
const weatherScenarios = [
    { name: "Normal", rainfall: 25, humidity: 65, wind: 12, temp: 32, icon: Cloud },
    { name: "Heavy Rain", rainfall: 150, humidity: 92, wind: 35, temp: 26, icon: CloudRain },
    { name: "Monsoon", rainfall: 250, humidity: 98, wind: 55, temp: 24, icon: Waves },
    { name: "Cyclone", rainfall: 400, humidity: 99, wind: 120, temp: 22, icon: Wind },
];

// ============================================
// GOOGLE MAP SATELLITE PREVIEW
// ============================================
const SatelliteMapPreview = ({ lat, lng, label }: { lat: number; lng: number; label: string }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);

    useEffect(() => {
        if (!mapRef.current || mapInstance.current) return;

        const initMap = () => {
            const google = (window as any).google;
            if (!google?.maps) {
                setTimeout(initMap, 500);
                return;
            }
            const map = new google.maps.Map(mapRef.current!, {
                center: { lat, lng },
                zoom: 15,
                mapTypeId: "satellite",
                disableDefaultUI: true,
                gestureHandling: "cooperative",
            });
            new google.maps.Marker({ position: { lat, lng }, map, title: label });

            // Property boundary circle
            new google.maps.Circle({
                center: { lat, lng },
                radius: 100,
                strokeColor: "#2563EB",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: "#2563EB",
                fillOpacity: 0.1,
                map,
            });

            mapInstance.current = map;
        };

        // Load Google Maps if not loaded
        if (!(window as any).google?.maps) {
            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyADeLSm5n2zxbGooVoS6zggXITfSjbBsfo"}&loading=async`;
            script.async = true;
            script.onload = () => setTimeout(initMap, 100);
            document.head.appendChild(script);
        } else {
            initMap();
        }
    }, [lat, lng, label]);

    return <div ref={mapRef} className="w-full h-full rounded-2xl" />;
};

// ============================================
// 3D TERRAIN VIEWER (Cesium-style with Three.js-like visualization)
// ============================================
const Terrain3DViewer = ({ lat, lng, elevation, waterLevel, riskLevel }: {
    lat: number; lng: number; elevation: number; waterLevel: number; riskLevel: string;
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animFrameRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const W = canvas.width = canvas.offsetWidth * 2;
        const H = canvas.height = canvas.offsetHeight * 2;
        ctx.scale(2, 2);
        const w = W / 2;
        const h = H / 2;

        let time = 0;

        const drawTerrain = () => {
            time += 0.02;
            ctx.clearRect(0, 0, w, h);

            // Sky gradient
            const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.4);
            skyGrad.addColorStop(0, "#0a1628");
            skyGrad.addColorStop(1, "#1a365d");
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, w, h * 0.4);

            // Stars
            for (let i = 0; i < 50; i++) {
                const sx = (Math.sin(i * 47.3) * 0.5 + 0.5) * w;
                const sy = (Math.sin(i * 31.7) * 0.5 + 0.25) * h * 0.35;
                ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.sin(time + i) * 0.3})`;
                ctx.fillRect(sx, sy, 1.5, 1.5);
            }

            // Generate terrain heightmap
            const cols = 80;
            const rows = 40;
            const cellW = w / cols;
            const terrainBaseY = h * 0.35;

            // Draw terrain strips from back to front
            for (let row = 0; row < rows; row++) {
                const depth = row / rows;
                const rowY = terrainBaseY + depth * h * 0.6;
                const perspScale = 0.3 + depth * 0.7;

                for (let col = 0; col < cols; col++) {
                    const colNorm = col / cols;
                    // Generate terrain height using noise-like function
                    const terrainH = Math.sin(colNorm * 8 + lat) * 15 +
                        Math.sin(colNorm * 3 + lng) * 25 +
                        Math.cos(depth * 5 + colNorm * 4) * 10 +
                        Math.sin(colNorm * 12 + depth * 7) * 5;

                    const normalizedElevation = elevation / 100;
                    const cellHeight = (terrainH + normalizedElevation * 20) * perspScale;
                    const x = col * cellW;
                    const y = rowY - cellHeight;

                    // Terrain color based on height
                    const hue = cellHeight > 30 * perspScale ? 30 : cellHeight > 10 * perspScale ? 100 : 120;
                    const lightness = 20 + cellHeight * 0.3;
                    ctx.fillStyle = `hsl(${hue}, 50%, ${lightness}%)`;
                    ctx.fillRect(x, y, cellW + 1, cellHeight + 2);

                    // Water level overlay
                    const waterH = (waterLevel / 100) * h * 0.25 * perspScale;
                    if (waterH > 0 && y + cellHeight > rowY - waterH) {
                        const waterAlpha = 0.3 + Math.sin(time * 2 + col * 0.3) * 0.1;
                        ctx.fillStyle = `rgba(59, 130, 246, ${waterAlpha})`;
                        const waterStart = Math.max(y, rowY - waterH);
                        ctx.fillRect(x, waterStart, cellW + 1, rowY - waterStart + 2);
                    }
                }
            }

            // Water surface shimmer
            if (waterLevel > 0) {
                const waterSurfaceY = terrainBaseY + h * 0.6 - (waterLevel / 100) * h * 0.25;
                for (let i = 0; i < 20; i++) {
                    const sx = Math.sin(time * 1.5 + i * 2.1) * w * 0.4 + w * 0.5;
                    const sy = waterSurfaceY + Math.sin(time + i * 1.7) * 5;
                    ctx.fillStyle = `rgba(147, 197, 253, ${0.2 + Math.sin(time + i) * 0.1})`;
                    ctx.fillRect(sx - 15, sy, 30, 1.5);
                }
            }

            // Property marker
            const markerX = w * 0.5;
            const markerY = terrainBaseY + h * 0.2;
            ctx.beginPath();
            ctx.arc(markerX, markerY, 6, 0, Math.PI * 2);
            ctx.fillStyle = riskLevel === "CRITICAL" || riskLevel === "HIGH" ? "#EF4444" : "#2563EB";
            ctx.fill();
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 2;
            ctx.stroke();

            // Pulsing ring
            const pulseR = 8 + Math.sin(time * 3) * 4;
            ctx.beginPath();
            ctx.arc(markerX, markerY, pulseR, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.5 - Math.sin(time * 3) * 0.3})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // HUD overlay text
            ctx.fillStyle = "rgba(255,255,255,0.7)";
            ctx.font = "bold 10px monospace";
            ctx.fillText(`LAT ${lat.toFixed(4)}  LNG ${lng.toFixed(4)}`, 10, 18);
            ctx.fillText(`ELEV ${elevation}m  WATER ${waterLevel}%`, 10, 32);

            animFrameRef.current = requestAnimationFrame(drawTerrain);
        };

        drawTerrain();
        return () => cancelAnimationFrame(animFrameRef.current);
    }, [lat, lng, elevation, waterLevel, riskLevel]);

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full rounded-2xl"
            style={{ imageRendering: "pixelated" }}
        />
    );
};

// ============================================
// MAIN PAGE COMPONENT
// ============================================
const DisasterSimulationPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Default to CHN-102 if no matching property
    const property = mockProperties[id || ""] || mockProperties["CHN-102"];

    const [waterLevel, setWaterLevel] = useState(0);
    const [selectedScenario, setSelectedScenario] = useState(0);
    const [simulating, setSimulating] = useState(false);
    const [showAiExplanation, setShowAiExplanation] = useState(false);
    const [activeTab, setActiveTab] = useState<"satellite" | "terrain">("terrain");

    const scenario = weatherScenarios[selectedScenario];
    const floodRisk = calculateFloodRisk(property.elevation, scenario.rainfall, property.distance_to_river);
    const colors = riskColors[floodRisk.level];

    // Auto-simulate
    const runSimulation = () => {
        setSimulating(true);
        setWaterLevel(0);
        let level = 0;

        const maxLevel = Math.min(
            floodRisk.score,
            scenario.rainfall > 200 ? 85 : scenario.rainfall > 100 ? 55 : 25
        );

        const interval = setInterval(() => {
            level += 2;
            setWaterLevel(Math.min(level, maxLevel));
            if (level >= maxLevel) {
                clearInterval(interval);
                setSimulating(false);
            }
        }, 80);
    };

    const resetSimulation = () => {
        setWaterLevel(0);
        setSimulating(false);
    };

    // AI Explanation
    const aiExplanation = `Based on the analysis of ${property.name} in ${property.location}:

• Elevation: ${property.elevation}m above sea level ${property.elevation < 10 ? "(critically low)" : property.elevation < 50 ? "(moderate)" : "(safe)"}
• Distance to ${property.nearby_water}: ${(property.distance_to_river / 1000).toFixed(1)} km
• Under ${scenario.name} conditions (${scenario.rainfall}mm rainfall):
  → Flood Risk Level: ${floodRisk.level}
  → Risk Score: ${floodRisk.score}/100

${floodRisk.level === "CRITICAL" || floodRisk.level === "HIGH"
            ? "⚠️ This property has significant flood vulnerability. Consider flood insurance and elevated construction. Historical data confirms previous flooding events."
            : floodRisk.level === "MEDIUM"
                ? "⚡ Moderate flood risk detected. While not immediately dangerous, extreme weather events could cause waterlogging. Basic precautions recommended."
                : "✅ This property has low flood risk due to favorable elevation and distance from water bodies. Standard construction practices are sufficient."
        }`;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-[1400px] mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors">
                    <ChevronLeft className="w-5 h-5 text-foreground" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">3D Disaster Risk Simulation</h1>
                    <p className="text-sm text-muted-foreground">{property.name} — {property.location}</p>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${colors.fill} border ${colors.border}`}>
                    <AlertTriangle className={`w-4 h-4 ${colors.text}`} />
                    <span className={`text-sm font-bold ${colors.text}`}>{floodRisk.level} RISK</span>
                </div>
            </div>

            {/* Property Info Bar */}
            <div className="grid grid-cols-6 gap-3">
                {[
                    { label: "Elevation", value: `${property.elevation}m`, icon: Mountain },
                    { label: "Safety Score", value: `${property.safety_score}/100`, icon: Shield },
                    { label: "River Distance", value: `${(property.distance_to_river / 1000).toFixed(1)} km`, icon: Waves },
                    { label: "Area", value: property.area, icon: MapPin },
                    { label: "Price", value: property.price, icon: TrendingUp },
                    { label: "Flood History", value: property.flood_history.includes("None") ? "Clean" : "Recorded", icon: Clock },
                ].map((item, i) => (
                    <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="glass-card rounded-xl p-3"
                    >
                        <div className="flex items-center gap-1.5 mb-1">
                            <item.icon className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-[11px] text-muted-foreground font-medium">{item.label}</span>
                        </div>
                        <p className="text-sm font-bold text-foreground">{item.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* LEFT: 3D Viewer + Map */}
                <div className="lg:col-span-2 space-y-4">
                    {/* View Toggle */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab("terrain")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === "terrain" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <Mountain className="w-4 h-4" /> 3D Terrain
                        </button>
                        <button
                            onClick={() => setActiveTab("satellite")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === "satellite" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <Satellite className="w-4 h-4" /> Satellite View
                        </button>
                    </div>

                    {/* Viewer */}
                    <div className="glass-card rounded-2xl overflow-hidden h-[420px] relative">
                        {/* HUD Overlays */}
                        <div className="absolute top-3 right-3 z-10 bg-background/80 backdrop-blur-md rounded-lg px-3 py-2 border border-border/50">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${simulating ? "bg-red-500 animate-pulse" : "bg-emerald-500"}`} />
                                <span className="text-xs font-mono text-foreground">{simulating ? "SIMULATING" : "READY"}</span>
                            </div>
                        </div>

                        {activeTab === "terrain" ? (
                            <Terrain3DViewer
                                lat={property.latitude}
                                lng={property.longitude}
                                elevation={property.elevation}
                                waterLevel={waterLevel}
                                riskLevel={floodRisk.level}
                            />
                        ) : (
                            <SatelliteMapPreview
                                lat={property.latitude}
                                lng={property.longitude}
                                label={property.name}
                            />
                        )}
                    </div>

                    {/* Simulation Controls */}
                    <div className="glass-card rounded-2xl p-5">
                        <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-primary" /> Flood Simulation Controls
                        </h3>

                        <div className="space-y-5">
                            {/* Weather Scenario */}
                            <div>
                                <label className="text-xs font-semibold text-foreground mb-2 block">Weather Scenario</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {weatherScenarios.map((s, i) => (
                                        <button
                                            key={s.name}
                                            onClick={() => { setSelectedScenario(i); resetSimulation(); }}
                                            className={`p-3 rounded-xl text-center transition-all ${selectedScenario === i
                                                    ? "bg-primary/10 border-2 border-primary text-primary"
                                                    : "bg-secondary/50 border-2 border-transparent text-muted-foreground hover:text-foreground"
                                                }`}
                                        >
                                            <s.icon className="w-5 h-5 mx-auto mb-1" />
                                            <p className="text-xs font-bold">{s.name}</p>
                                            <p className="text-[10px] mt-0.5">{s.rainfall}mm</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Water Level Slider */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-semibold text-foreground">Water Level</label>
                                    <span className="text-xs font-mono text-primary font-bold">{waterLevel}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={waterLevel}
                                    onChange={(e) => setWaterLevel(Number(e.target.value))}
                                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                                    style={{
                                        background: `linear-gradient(to right, hsl(209, 82%, 45%) ${waterLevel}%, hsl(var(--secondary)) ${waterLevel}%)`,
                                    }}
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={runSimulation}
                                    disabled={simulating}
                                    className="flex-1 h-11 rounded-xl hero-gradient-subtle text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 disabled:opacity-50"
                                >
                                    <Play className="w-4 h-4" /> Run Simulation
                                </button>
                                <button
                                    onClick={resetSimulation}
                                    className="h-11 px-5 rounded-xl bg-secondary text-foreground font-semibold flex items-center gap-2 hover:bg-secondary/80 transition-colors"
                                >
                                    <RotateCcw className="w-4 h-4" /> Reset
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Analysis Panel */}
                <div className="space-y-4">
                    {/* Flood Risk Score Card */}
                    <div className={`glass-card rounded-2xl p-6 border-2 ${colors.border}`}>
                        <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                            <Gauge className="w-5 h-5 text-primary" /> Flood Risk Analysis
                        </h3>

                        <div className="text-center mb-5">
                            <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center border-4 ${colors.border} ${colors.fill}`}>
                                <span className={`text-3xl font-extrabold ${colors.text}`}>{floodRisk.score}</span>
                            </div>
                            <p className={`text-lg font-bold mt-2 ${colors.text}`}>{floodRisk.level}</p>
                            <p className="text-xs text-muted-foreground mt-1">Risk Score out of 100</p>
                        </div>

                        <div className="space-y-3">
                            {[
                                { label: "Elevation Risk", value: property.elevation < 10 ? "High" : property.elevation < 50 ? "Medium" : "Low", pct: property.elevation < 10 ? 85 : property.elevation < 50 ? 45 : 15 },
                                { label: "Rainfall Impact", value: scenario.rainfall > 150 ? "Severe" : scenario.rainfall > 50 ? "Moderate" : "Light", pct: Math.min(scenario.rainfall / 4, 100) },
                                { label: "River Proximity", value: property.distance_to_river < 2000 ? "Close" : "Safe", pct: Math.max(100 - property.distance_to_river / 100, 5) },
                            ].map((r) => (
                                <div key={r.label}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-muted-foreground font-medium">{r.label}</span>
                                        <span className="font-bold text-foreground">{r.value}</span>
                                    </div>
                                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${r.pct}%` }}
                                            transition={{ duration: 1 }}
                                            className={`h-full rounded-full ${r.pct > 60 ? "bg-red-500" : r.pct > 30 ? "bg-yellow-500" : "bg-emerald-500"}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Weather Panel */}
                    <div className="glass-card rounded-2xl p-5">
                        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                            <Cloud className="w-4 h-4 text-blue-400" /> Weather Conditions
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: "Rainfall", value: `${scenario.rainfall}mm`, icon: CloudRain, color: "text-blue-400" },
                                { label: "Humidity", value: `${scenario.humidity}%`, icon: Droplets, color: "text-cyan-400" },
                                { label: "Wind Speed", value: `${scenario.wind} km/h`, icon: Wind, color: "text-purple-400" },
                                { label: "Temperature", value: `${scenario.temp}°C`, icon: Thermometer, color: "text-orange-400" },
                            ].map((w) => (
                                <div key={w.label} className="p-3 rounded-xl bg-secondary/50 border border-border/50">
                                    <w.icon className={`w-4 h-4 ${w.color} mb-1`} />
                                    <p className="text-xs text-muted-foreground">{w.label}</p>
                                    <p className="text-sm font-bold text-foreground">{w.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Elevation Display */}
                    <div className="glass-card rounded-2xl p-5">
                        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                            <Mountain className="w-4 h-4 text-amber-500" /> Elevation Profile
                        </h3>
                        <div className="flex items-end gap-1 h-16">
                            {Array.from({ length: 20 }).map((_, i) => {
                                const h = Math.sin(i * 0.5 + property.elevation * 0.01) * 30 + 40 + (i === 10 ? property.elevation * 0.1 : 0);
                                const isProperty = i === 10;
                                return (
                                    <div
                                        key={i}
                                        className={`flex-1 rounded-t transition-all ${isProperty ? "bg-primary" : "bg-secondary"}`}
                                        style={{ height: `${Math.max(h, 10)}%` }}
                                    />
                                );
                            })}
                        </div>
                        <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
                            <span>West</span>
                            <span className="font-bold text-primary">{property.elevation}m ASL</span>
                            <span>East</span>
                        </div>
                    </div>

                    {/* Nearby Water Bodies */}
                    <div className="glass-card rounded-2xl p-5">
                        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                            <Waves className="w-4 h-4 text-blue-500" /> Nearby Water Bodies
                        </h3>
                        <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-foreground">{property.nearby_water}</p>
                                    <p className="text-xs text-muted-foreground">{(property.distance_to_river / 1000).toFixed(1)} km away</p>
                                </div>
                                <Droplets className="w-6 h-6 text-blue-400" />
                            </div>
                        </div>
                    </div>

                    {/* AI Explanation */}
                    <div className="glass-card rounded-2xl p-5">
                        <button
                            onClick={() => setShowAiExplanation(!showAiExplanation)}
                            className="w-full flex items-center justify-between"
                        >
                            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                <Zap className="w-4 h-4 text-yellow-500" /> AI Risk Explanation
                            </h3>
                            <ArrowRight className={`w-4 h-4 text-muted-foreground transition-transform ${showAiExplanation ? "rotate-90" : ""}`} />
                        </button>
                        <AnimatePresence>
                            {showAiExplanation && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <pre className="mt-3 text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed bg-secondary/50 rounded-xl p-4 border border-border/50">
                                        {aiExplanation}
                                    </pre>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Simulation Timeline */}
            <div className="glass-card rounded-2xl p-5">
                <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" /> Simulation Timeline
                </h3>
                <div className="flex items-center gap-1">
                    {Array.from({ length: 24 }).map((_, i) => {
                        const hourRain = scenario.rainfall * (Math.sin(i * 0.5 + 2) * 0.5 + 0.5) / 24;
                        const barHeight = (hourRain / (scenario.rainfall / 6)) * 100;
                        const isFlooded = barHeight > 60 && waterLevel > 30;
                        return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <div className="w-full h-12 bg-secondary/30 rounded-t relative overflow-hidden">
                                    <div
                                        className={`absolute bottom-0 w-full rounded-t transition-all ${isFlooded ? "bg-red-500/60" : "bg-blue-500/50"}`}
                                        style={{ height: `${Math.min(barHeight, 100)}%` }}
                                    />
                                </div>
                                {i % 6 === 0 && (
                                    <span className="text-[9px] text-muted-foreground">{i}h</span>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                    <span>Start</span>
                    <span>← Rainfall Distribution Over 24 Hours →</span>
                    <span>End</span>
                </div>
            </div>

            {/* Property Comparison */}
            <div className="glass-card rounded-2xl p-5">
                <h3 className="text-base font-bold text-foreground mb-4">Compare with Other Properties</h3>
                <div className="grid md:grid-cols-3 gap-3">
                    {Object.values(mockProperties).map((p: any) => {
                        const risk = calculateFloodRisk(p.elevation, scenario.rainfall, p.distance_to_river);
                        const c = riskColors[risk.level];
                        return (
                            <div
                                key={p.id}
                                onClick={() => navigate(`/marketplace/disaster-simulation/${p.id}`)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${p.id === property.id ? `${c.fill} border-2 ${c.border}` : "bg-secondary/30 border-border/50 hover:bg-secondary/50"
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-bold text-foreground">{p.id}</span>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${c.fill} ${c.text}`}>{risk.level}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mb-1">{p.location}</p>
                                <div className="text-xs text-muted-foreground">
                                    {p.elevation}m elev · {(p.distance_to_river / 1000).toFixed(1)}km to river
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
};

export default DisasterSimulationPage;

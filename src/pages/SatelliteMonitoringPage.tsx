import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Satellite, Focus, Map, Activity, Layers, ZoomIn, ZoomOut, Locate } from "lucide-react";
import AlertCard from "@/components/AlertCard";

const GOOGLE_MAPS_API_KEY = "AIzaSyADeLSm5n2zxbGooVoS6zggXITfSjbBsfo";

const monitoredPlots = [
  {
    id: "SL-2847A",
    name: "Plot #SL-2847A",
    center: { lat: 11.0168, lng: 76.9558 },
    status: "safe",
    lastScan: "1 min ago",
    boundary: [
      { lat: 11.0175, lng: 76.9548 },
      { lat: 11.0180, lng: 76.9565 },
      { lat: 11.0165, lng: 76.9572 },
      { lat: 11.0158, lng: 76.9555 },
    ],
  },
  {
    id: "SL-1923B",
    name: "Plot #SL-1923B",
    center: { lat: 11.0210, lng: 76.9620 },
    status: "alert",
    lastScan: "Live",
    boundary: [
      { lat: 11.0215, lng: 76.9612 },
      { lat: 11.0220, lng: 76.9630 },
      { lat: 11.0205, lng: 76.9635 },
      { lat: 11.0200, lng: 76.9618 },
    ],
  },
];

// Load Google Maps API with async loading
const loadGoogleMaps = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if ((window as any).google?.maps) {
      resolve();
      return;
    }
    const existingScript = document.getElementById("google-maps-script");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });
};

// Isolated Google Map component that prevents React DOM conflicts
const GoogleMapView = ({ onMapReady }: { onMapReady: (map: any) => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        await loadGoogleMaps();
        if (cancelled || !containerRef.current || mapInstanceRef.current) return;

        const google = (window as any).google;
        const map = new google.maps.Map(containerRef.current, {
          center: { lat: 11.0185, lng: 76.9585 },
          zoom: 16,
          mapTypeId: "satellite",
          disableDefaultUI: true,
          zoomControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          gestureHandling: "greedy",
          tilt: 45,
        });

        mapInstanceRef.current = map;

        // Draw plot boundaries and markers
        monitoredPlots.forEach((plot) => {
          const polygon = new google.maps.Polygon({
            paths: plot.boundary,
            strokeColor: plot.status === "alert" ? "#EF4444" : "#2563EB",
            strokeOpacity: 0.9,
            strokeWeight: 3,
            fillColor: plot.status === "alert" ? "#EF4444" : "#2563EB",
            fillOpacity: 0.15,
            map,
          });

          if (plot.status === "alert") {
            new google.maps.Circle({
              center: plot.center,
              radius: 30,
              strokeColor: "#EF4444",
              strokeOpacity: 0.4,
              strokeWeight: 2,
              fillColor: "#EF4444",
              fillOpacity: 0.1,
              map,
            });
          }

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="font-family:'Inter',sans-serif;padding:8px;min-width:180px">
                <h3 style="font-size:14px;font-weight:700;margin-bottom:6px;color:#1e293b">${plot.name}</h3>
                <div style="font-size:12px;color:#64748b;line-height:1.6">
                  <div><b>Status:</b> <span style="color:${plot.status === "alert" ? "#EF4444" : "#10B981"};font-weight:600">${plot.status === "alert" ? "⚠️ Alert" : "✅ Secured"}</span></div>
                  <div><b>Last Scan:</b> ${plot.lastScan}</div>
                  <div><b>Coords:</b> ${plot.center.lat.toFixed(4)}, ${plot.center.lng.toFixed(4)}</div>
                </div>
              </div>`,
          });

          const marker = new google.maps.Marker({
            position: plot.center,
            map,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: plot.status === "alert" ? 10 : 8,
              fillColor: plot.status === "alert" ? "#EF4444" : "#2563EB",
              fillOpacity: 1,
              strokeColor: "#FFFFFF",
              strokeWeight: 3,
            },
            title: plot.name,
          });

          marker.addListener("click", () => infoWindow.open(map, marker));
          polygon.addListener("click", () => {
            infoWindow.setPosition(plot.center);
            infoWindow.open(map);
          });
        });

        onMapReady(map);
      } catch (err) {
        console.error("Google Maps init error:", err);
      }
    };

    init();

    return () => {
      cancelled = true;
      // Do NOT destroy the map — let the DOM node removal handle it
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // This div is never re-rendered by React — Google Maps owns it
  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
};

const SatelliteMonitoringPage = () => {
  const googleMapRef = useRef<any>(null);
  const [mapType, setMapType] = useState<"satellite" | "hybrid" | "terrain">("satellite");
  const [mapLoaded, setMapLoaded] = useState(false);

  const handleMapReady = useCallback((map: any) => {
    googleMapRef.current = map;
    setMapLoaded(true);
  }, []);

  const changeMapType = (type: "satellite" | "hybrid" | "terrain") => {
    setMapType(type);
    googleMapRef.current?.setMapTypeId(type);
  };

  const zoomIn = () => {
    if (googleMapRef.current) googleMapRef.current.setZoom(googleMapRef.current.getZoom() + 1);
  };
  const zoomOut = () => {
    if (googleMapRef.current) googleMapRef.current.setZoom(googleMapRef.current.getZoom() - 1);
  };
  const resetView = () => {
    if (googleMapRef.current) {
      googleMapRef.current.setCenter({ lat: 11.0185, lng: 76.9585 });
      googleMapRef.current.setZoom(16);
      googleMapRef.current.setTilt(45);
    }
  };
  const panToPlot = (center: { lat: number; lng: number }) => {
    if (googleMapRef.current) {
      googleMapRef.current.panTo(center);
      googleMapRef.current.setZoom(18);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-[calc(100vh-8rem)] flex flex-col space-y-4 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Live Land Monitoring</h1>
          <p className="text-muted-foreground text-sm">Real-time satellite surveillance and AI encroachment detection.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-accent/10 backdrop-blur-md rounded-full px-4 py-2 border border-accent/20">
            <Satellite className="w-4 h-4 text-accent" />
            <span className="text-xs font-semibold text-accent">Google Satellite Active</span>
          </div>
          <div className="flex items-center gap-2 bg-destructive/10 backdrop-blur-md rounded-full px-4 py-2 border border-destructive/20 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
            <Activity className="w-4 h-4 text-destructive animate-pulse" />
            <span className="text-xs font-semibold text-destructive">1 Active Alert</span>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Map */}
        <div className="flex-1 glass-card rounded-[24px] overflow-hidden relative border border-border/50 shadow-2xl">
          {/* Map type controls */}
          <div className="absolute top-4 left-4 z-[10] flex gap-2">
            {([
              { type: "satellite" as const, icon: Satellite, label: "Satellite" },
              { type: "hybrid" as const, icon: Map, label: "Hybrid" },
              { type: "terrain" as const, icon: Layers, label: "Terrain" },
            ]).map((t) => (
              <button
                key={t.type}
                onClick={() => changeMapType(t.type)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border shadow-lg text-sm font-medium transition-all ${mapType === t.type
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background/80 backdrop-blur-md border-border/50 text-foreground hover:bg-secondary"
                  }`}
              >
                <t.icon className="w-4 h-4" />
                <span className="hidden md:inline">{t.label}</span>
              </button>
            ))}
          </div>

          {/* Zoom controls */}
          <div className="absolute top-4 right-4 z-[10] flex flex-col gap-2">
            <div className="bg-background/90 backdrop-blur-xl rounded-xl border border-border/50 shadow-2xl overflow-hidden">
              <button onClick={zoomIn} className="p-2.5 hover:bg-secondary transition-colors border-b border-border/30">
                <ZoomIn className="w-4 h-4 text-foreground" />
              </button>
              <button onClick={zoomOut} className="p-2.5 hover:bg-secondary transition-colors border-b border-border/30">
                <ZoomOut className="w-4 h-4 text-foreground" />
              </button>
              <button onClick={resetView} className="p-2.5 hover:bg-secondary transition-colors">
                <Locate className="w-4 h-4 text-foreground" />
              </button>
            </div>
          </div>

          {/* Status panel */}
          <div className="absolute bottom-4 left-4 z-[10]">
            <div className="bg-background/90 backdrop-blur-xl rounded-xl p-3 border border-border/50 shadow-2xl min-w-[180px]">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">MONITORING STATUS</div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Satellites</span>
                  <span className="text-primary font-bold">12 Active</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last Scan</span>
                  <span className="text-foreground font-mono text-xs">1m ago</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Resolution</span>
                  <span className="text-foreground font-mono text-xs">0.5m/px</span>
                </div>
              </div>
            </div>
          </div>

          {/* Loading state */}
          {!mapLoaded && (
            <div className="absolute inset-0 z-[5] bg-[#0a0a0a] flex items-center justify-center">
              <div className="text-center">
                <Satellite className="w-10 h-10 text-primary/50 mx-auto mb-3 animate-pulse" />
                <p className="text-sm text-muted-foreground">Loading satellite imagery...</p>
              </div>
            </div>
          )}

          {/* Google Maps — isolated from React's DOM reconciliation */}
          <div className="w-full h-full" style={{ minHeight: 400 }}>
            <GoogleMapView onMapReady={handleMapReady} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="shrink-0 lg:w-[400px] flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
          {/* Monitored Plots */}
          <div className="glass-card rounded-[24px] p-6 border border-border/50 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Focus className="w-5 h-5 text-primary" /> Monitored Plots
            </h3>
            <div className="space-y-3">
              {monitoredPlots.map((plot) => (
                <div
                  key={plot.id}
                  onClick={() => panToPlot(plot.center)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all hover:shadow-md ${plot.status === "alert"
                      ? "bg-destructive/5 border-destructive/20 hover:bg-destructive/10"
                      : "bg-primary/5 border-primary/20 hover:bg-primary/10"
                    }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-foreground">{plot.name}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${plot.status === "alert" ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent"
                      }`}>
                      {plot.status === "alert" ? "Alert" : "Secured"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {plot.center.lat.toFixed(4)}, {plot.center.lng.toFixed(4)} • Scanned {plot.lastScan}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Alert Log */}
          <div className="glass-card rounded-[24px] p-6 border border-border/50 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent" /> Alert Log
            </h3>
            <div className="space-y-4">
              <AlertCard severity="critical" title="Encroachment Risk" description="Unauthorized structure detected near northern boundary of Plot #SL-1923B." timestamp="Live" />
              <AlertCard severity="warning" title="Boundary Change" description="Minor foliage overgrowth detected affecting boundary visibility." timestamp="2 hours ago" />
              <AlertCard severity="success" title="Scan Completed" description="Routine perimeter scan done. No anomalies on SL-2847A." timestamp="1 day ago" />
              <AlertCard severity="info" title="System Update" description="Satellite imagery updated to highest resolution." timestamp="2 days ago" />
            </div>
          </div>

          <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-[20px] p-6 text-center">
            <Satellite className="w-8 h-8 text-primary mx-auto mb-3 opacity-80" />
            <h4 className="font-semibold text-primary mb-1">Google Satellite Active</h4>
            <p className="text-sm text-foreground/70">Live imagery powered by Google Maps API with boundary monitoring.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SatelliteMonitoringPage;

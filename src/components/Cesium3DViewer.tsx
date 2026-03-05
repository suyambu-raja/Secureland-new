import React, { useEffect, useRef } from "react";
import { Viewer, Entity, PolygonGraphics, CameraFlyTo } from "resium";
import { Cartesian3, Color, Ion, CesiumTerrainProvider, createWorldTerrainAsync, VerticalOrigin } from "cesium";

interface Cesium3DViewerProps {
    coordinates: { lat: number; lng: number }[];
    landId: string;
}

const CESIUM_ION_TOKEN = import.meta.env.VITE_CESIUM_ION_TOKEN || "";
if (CESIUM_ION_TOKEN) {
    Ion.defaultAccessToken = CESIUM_ION_TOKEN;
}

const Cesium3DViewer: React.FC<Cesium3DViewerProps> = ({ coordinates, landId }) => {
    const viewerRef = useRef<any>(null);
    const [terrainProvider, setTerrainProvider] = React.useState<any>(undefined);

    useEffect(() => {
        if (CESIUM_ION_TOKEN) {
            CesiumTerrainProvider.fromIonAssetId(1).then(provider => {
                setTerrainProvider(provider);
            });
        }
    }, []);

    // Convert lat/lng to Cartesian3
    const positions = coordinates.map((coord) =>
        Cartesian3.fromDegrees(coord.lng, coord.lat, 2) // Slight offset from ground
    );

    // Calculate center for camera initial view
    const centerLat = coordinates.reduce((s, c) => s + c.lat, 0) / coordinates.length;
    const centerLng = coordinates.reduce((s, c) => s + c.lng, 0) / coordinates.length;
    const centerPosition = Cartesian3.fromDegrees(centerLng, centerLat, 500); // 500m up

    return (
        <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-2xl border border-primary-foreground/10">
            <Viewer
                full
                terrainProvider={terrainProvider}
                animation={false}
                timeline={false}
                baseLayerPicker={false}
                geocoder={false}
                homeButton={false}
                infoBox={false}
                navigationHelpButton={false}
                sceneModePicker={false}
                ref={viewerRef}
                style={{ width: "100%", height: "100%" }}
            >
                {/* Fly to the land on load */}
                <CameraFlyTo
                    duration={4}
                    destination={centerPosition}
                    orientation={{
                        heading: 0,
                        pitch: -0.8,
                        roll: 0,
                    }}
                />

                {/* The Land Boundary Polygon */}
                <Entity
                    name={landId}
                    description={`Digital Twin of Land ${landId}`}
                >
                    <PolygonGraphics
                        hierarchy={positions}
                        material={Color.CYAN.withAlpha(0.4)}
                        outline={true}
                        outlineColor={Color.CYAN}
                        outlineWidth={3}
                    // Add a slight height to make it "extrude" if we wanted, 
                    // but for now let's just make it a clear flat boundary on terrain
                    />
                </Entity>

                {/* Individual Points/Corner Markers */}
                {coordinates.map((coord, i) => (
                    <Entity
                        key={i}
                        position={Cartesian3.fromDegrees(coord.lng, coord.lat, 3)}
                        point={{
                            pixelSize: 8,
                            color: Color.WHITE,
                            outlineColor: Color.CYAN,
                            outlineWidth: 2,
                        }}
                    />
                ))}
            </Viewer>

            {/* Info Overlay */}
            <div className="absolute top-4 left-4 z-10 glass p-3 rounded-xl border border-primary-foreground/10">
                <p className="text-[10px] text-primary-foreground/40 font-medium uppercase tracking-wider">3D Digital Twin</p>
                <p className="text-sm font-bold text-primary-foreground">{landId}</p>
            </div>
        </div>
    );
};

export default Cesium3DViewer;

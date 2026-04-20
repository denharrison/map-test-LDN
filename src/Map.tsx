import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MarkerData {
  id: number;
  lat: number;
  lng: number;
  name: string;
}

export const EditableMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  const [markers, setMarkers] = useState<MarkerData[]>([]);
  
    const handleRename = (id: number, newName: string) => {
        setMarkers((prev) =>
          prev.map((m) => (m.id === id ? { ...m, name: newName } : m)),
        );
      };

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView(
        [40.7128, -74.006],
        10,
      );

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution: "© OpenStreetMap",
        },
      ).addTo(mapInstance.current);

      mapInstance.current.on("click", (e) => {
        const newMarker: MarkerData = {
          id: Date.now(), 
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          name: "Новая точка",
        };

        setMarkers((prev) => [...prev, newMarker]);
      });
    }

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;

    mapInstance.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapInstance.current?.removeLayer(layer);
      }
    });

    markers.forEach((m) => {
      const leafletMarker = L.marker([m.lat, m.lng])
        .addTo(mapInstance.current!)
        .bindPopup(
          `<b>${m.name}</b><br/><button id="btn-${m.id}">Изменить название</button>`,
        );

      leafletMarker.on("popupopen", () => {
        const btn = document.getElementById(`btn-${m.id}`);
        btn?.addEventListener("click", () => {
          const newName = prompt("Введите новое название:", m.name);
          if (newName) {
            handleRename(m.id, newName);
          }
        });
      });
    });
  }, [markers]); 


  return (
    <div
      ref={mapRef}
      style={{ height: "500px", width: "100%", borderRadius: "8px" }}
    />
  );
};

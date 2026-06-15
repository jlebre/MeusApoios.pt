"use client";

import { useEffect, useRef, useState } from "react";

// Mapa para marcar a localização do projeto. Usa Leaflet + OpenStreetMap
// (sem API key). Carrega Leaflet via CDN para evitar problemas de SSR.
export default function LocationMap({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );

  useEffect(() => {
    // injeta CSS e JS do Leaflet via CDN
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    const existing = (window as any).L;
    if (existing) {
      setReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => setReady(true);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!ready || !ref.current) return;
    const L = (window as any).L;
    // centro: Portugal continental
    const map = L.map(ref.current, {
      scrollWheelZoom: false, // evita capturar o scroll da página
      tap: true,
      dragging: true,
      touchZoom: true,
    }).setView([39.5, -8.0], 6);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 18,
    }).addTo(map);

    // no telemóvel, scroll-zoom só quando o mapa tem foco (após toque)
    map.on("focus", () => map.scrollWheelZoom.enable());
    map.on("blur", () => map.scrollWheelZoom.disable());

    let marker: any = null;
    map.on("click", (e: any) => {
      const { lat, lng } = e.latlng;
      if (marker) marker.setLatLng(e.latlng);
      else marker = L.marker(e.latlng).addTo(map);
      setCoords({ lat, lng });
      onPick(lat, lng);
    });

    return () => map.remove();
  }, [ready]);

  return (
    <div>
      <div
        ref={ref}
        className="h-72 w-full overflow-hidden rounded-xl border border-clay/30 sm:h-64"
        style={{ background: "#e8e8e8" }}
      />
      {coords ? (
        <p className="mt-2 text-xs text-olive">
          Localização marcada: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
        </p>
      ) : (
        <p className="mt-2 text-xs text-ink/50">
          Toca no mapa para marcar a localização do teu projeto (opcional).
        </p>
      )}
    </div>
  );
}

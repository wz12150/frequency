import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface ProvinceStationData {
  id: string;
  name: string;
  stations: number;
}

// ── Province capitals ─────────────────────────────────────────────────────────
const PROVINCE_CAPITALS = [
  { id: 'ulaanbaatar',  name: 'Ulaanbaatar',  capital: 'Ulaanbaatar',  lat: 47.9077, lng: 106.8832 },
  { id: 'orkhon',       name: 'Orkhon',        capital: 'Erdenet',      lat: 49.0280, lng: 104.0444 },
  { id: 'darkhan-uul',  name: 'Darkhan-Uul',  capital: 'Darkhan',      lat: 49.4935, lng: 105.9748 },
  { id: 'dornod',       name: 'Dornod',        capital: 'Choibalsan',   lat: 48.0771, lng: 114.5354 },
  { id: 'bayan-olgii',  name: 'Bayan-Ölgii',  capital: 'Ölgii',        lat: 48.9715, lng:  89.9669 },
  { id: 'khovd',        name: 'Khovd',         capital: 'Khovd',        lat: 48.0059, lng:  91.6414 },
  { id: 'uvs',          name: 'Uvs',           capital: 'Ulaangom',     lat: 49.9810, lng:  92.0659 },
  { id: 'khovsgol',     name: 'Khövsgöl',      capital: 'Mörön',        lat: 49.6334, lng: 100.1570 },
  { id: 'bulgan',       name: 'Bulgan',        capital: 'Bulgan',       lat: 48.8135, lng: 103.5363 },
  { id: 'selenge',      name: 'Selenge',       capital: 'Sükhbaatar',   lat: 50.2340, lng: 106.1989 },
  { id: 'arkhangai',    name: 'Arkhangai',     capital: 'Tsetserleg',   lat: 47.4782, lng: 101.4523 },
  { id: 'zavkhan',      name: 'Zavkhan',       capital: 'Uliastai',     lat: 47.7429, lng:  96.8454 },
  { id: 'govi-altai',   name: 'Govi-Altai',   capital: 'Altai',        lat: 46.3727, lng:  96.2591 },
  { id: 'bayankhongor', name: 'Bayankhongor', capital: 'Bayankhongor', lat: 46.1943, lng: 100.7139 },
  { id: 'ovorkhangai',  name: 'Övörkhangai',  capital: 'Arvaikheer',   lat: 46.2638, lng: 102.7768 },
  { id: 'dundgovi',     name: 'Dundgovi',      capital: 'Mandalgovi',   lat: 45.7698, lng: 106.2739 },
  { id: 'dornogovi',    name: 'Dornogovi',     capital: 'Sainshand',    lat: 44.8932, lng: 110.1199 },
  { id: 'khentii',      name: 'Khentii',       capital: 'Öndörkhaan',  lat: 47.3173, lng: 110.6540 },
  { id: 'tov',          name: 'Töv',           capital: 'Zuunmod',      lat: 47.7078, lng: 106.9544 },
  { id: 'govisumber',   name: 'Govisümber',   capital: 'Choir',        lat: 46.3638, lng: 108.3591 },
  { id: 'sukhbaatar',   name: 'Sükhbaatar',   capital: 'Baruun-Urt',  lat: 46.6786, lng: 113.2869 },
  { id: 'omnogovi',     name: 'Ömnögovi',      capital: 'Dalanzadgad', lat: 43.5706, lng: 104.4254 },
];

// ── Color helpers ─────────────────────────────────────────────────────────────
function bubbleColor(t: number): string {
  // light-sky (#bae6fd) → deep-blue (#1d4ed8)
  const r = Math.round(186 - t * (186 - 29));
  const g = Math.round(230 - t * (230 - 78));
  const b = Math.round(253 - t * (253 - 216));
  return `rgb(${r},${g},${b})`;
}

function bubbleSize(t: number): number {
  return Math.round(32 + t * 28); // 32 – 60 px
}

// ── Leaflet DivIcon ───────────────────────────────────────────────────────────
function makeDivIcon(stations: number, min: number, max: number): L.DivIcon {
  const t        = Math.sqrt(Math.max(0, (stations - min) / Math.max(max - min, 1)));
  const color    = bubbleColor(t);
  const size     = bubbleSize(t);
  const textCol  = t > 0.55 ? '#ffffff' : '#1e3a8a';
  const fs       = size < 42 ? 9 : size < 52 ? 11 : 14;
  const label    = stations >= 1000
    ? `${(stations / 1000).toFixed(1)}k`
    : String(stations);

  return L.divIcon({
    className: '',
    iconSize:   [size, size] as [number, number],
    iconAnchor: [size / 2, size / 2] as [number, number],
    html: `<div style="
      width:${size}px;height:${size}px;
      border-radius:50%;
      background:${color};
      border:2.5px solid rgba(255,255,255,0.9);
      box-shadow:0 2px 10px rgba(0,0,0,0.30);
      display:flex;align-items:center;justify-content:center;
      font-family:system-ui,sans-serif;
      font-size:${fs}px;font-weight:700;
      color:${textCol};
      cursor:pointer;
      user-select:none;
    ">${label}</div>`,
  });
}

// ── Legend ────────────────────────────────────────────────────────────────────
function Legend({ min, max }: { min: number; max: number }) {
  const steps = Array.from({ length: 6 }, (_, i) => {
    const t = i / 5;
    return { v: Math.round(min + t * (max - min)), color: bubbleColor(t) };
  });
  return (
    <div className="flex items-center gap-3 mt-3 px-1 select-none">
      <span className="text-xs text-muted-foreground whitespace-nowrap">Fewer</span>
      <div className="flex flex-1 h-3 rounded overflow-hidden border border-blue-100">
        {steps.map((s, i) => (
          <div key={i} className="flex-1 h-full" style={{ background: s.color }} />
        ))}
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">More stations</span>
      <span className="text-xs text-muted-foreground tabular-nums ml-2">{max.toLocaleString()}</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function MongoliaProvinceMap({ data }: { data: ProvinceStationData[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<L.Map | null>(null);
  const markersRef   = useRef<L.Marker[]>([]);

  const stationMap = Object.fromEntries(data.map(d => [d.id, d.stations]));
  const values     = data.map(d => d.stations);
  const maxVal     = Math.max(...values, 1);
  const minVal     = Math.min(...values, 0);

  // ── Init map ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center:      [46.8, 103.8],
      zoom:        5,
      minZoom:     4,
      maxZoom:     12,
      zoomControl: true,
      attributionControl: true,
    });

    // Primary: CartoDB Voyager (permissive CORS, no API key needed)
    const cartoLayer = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' +
          ' &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
      }
    );

    // Fallback: ESRI World Street Map
    const esriLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri',
        maxZoom: 20,
      }
    );

    cartoLayer.addTo(map);

    // If CartoDB tiles fail, switch to ESRI
    cartoLayer.on('tileerror', () => {
      if (map.hasLayer(cartoLayer)) {
        map.removeLayer(cartoLayer);
        esriLayer.addTo(map);
      }
    });

    // Fit Mongolia bounds
    map.fitBounds([[41.0, 87.0], [52.8, 120.5]]);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Update markers when data changes ───────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    PROVINCE_CAPITALS.forEach(prov => {
      const stations = stationMap[prov.id] ?? 0;
      const icon     = makeDivIcon(stations, minVal, maxVal);

      const marker = L.marker([prov.lat, prov.lng], { icon });

      marker.bindTooltip(
        `<div style="font-family:system-ui,sans-serif;min-width:140px;padding:2px 0">
           <div style="font-weight:700;font-size:13px;margin-bottom:3px">${prov.name}</div>
           <div style="font-size:11px;color:#64748b;margin-bottom:2px">Capital: ${prov.capital}</div>
           <div style="font-size:12px;color:#1d4ed8;font-weight:600">${stations.toLocaleString()} stations</div>
         </div>`,
        { direction: 'top', offset: [0, -4], opacity: 0.97 }
      );

      marker.addTo(map);
      markersRef.current.push(marker);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, minVal, maxVal]);

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className="w-full rounded-lg overflow-hidden border border-blue-200"
        style={{ height: '520px', background: '#e8f4f8' }}
      />
      <Legend min={minVal} max={maxVal} />
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, X, Check } from 'lucide-react';

type CoordinatePickerProps = {
  open: boolean;
  value: { lat: number | null; lng: number | null };
  onConfirm: (lat: number, lng: number) => void;
  onCancel: () => void;
};

export function CoordinatePicker({ open, value, onConfirm, onCancel }: CoordinatePickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [selectedLat, setSelectedLat] = useState<number | null>(value.lat);
  const [selectedLng, setSelectedLng] = useState<number | null>(value.lng);

  useEffect(() => {
    setSelectedLat(value.lat);
    setSelectedLng(value.lng);
  }, [value.lat, value.lng, open]);

  useEffect(() => {
    if (!open || !containerRef.current) return;

    const map = L.map(containerRef.current, {
      center: [46.8, 103.8],
      zoom: 5,
      minZoom: 3,
      maxZoom: 14,
    });

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      { attribution: '&copy; OpenStreetMap &copy; CARTO', subdomains: 'abcd', maxZoom: 20 }
    ).addTo(map);

    // 如果已有值，显示已有标记
    if (value.lat != null && value.lng != null) {
      const icon = L.divIcon({
        className: '',
        iconSize: [20, 20] as [number, number],
        iconAnchor: [10, 10] as [number, number],
        html: `<div style="width:20px;height:20px;border-radius:50%;background:#2563eb;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);cursor:pointer;"></div>`,
      });
      const m = L.marker([value.lat, value.lng], { icon }).addTo(map);
      m.bindPopup('Current location').openPopup();
      map.setView([value.lat, value.lng], 10);
    }

    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setSelectedLat(lat);
      setSelectedLng(lng);

      if (markerRef.current) markerRef.current.remove();
      const icon = L.divIcon({
        className: '',
        iconSize: [20, 20] as [number, number],
        iconAnchor: [10, 10] as [number, number],
        html: `<div style="width:20px;height:20px;border-radius:50%;background:#dc2626;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);cursor:pointer;"></div>`,
      });
      const marker = L.marker([lat, lng], { icon }).addTo(map);
      marker.bindPopup(`Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`).openPopup();
      markerRef.current = marker;
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [open, value.lat, value.lng]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-card rounded-xl shadow-2xl border border-border w-full max-w-3xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-semibold text-base">选择位置</h3>
              <p className="text-xs text-muted-foreground">点击地图选择经纬度</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4">
          <div
            ref={containerRef}
            className="w-full rounded-lg overflow-hidden border border-border"
            style={{ height: '450px' }}
          />
          <div className="mt-3 text-sm text-muted-foreground">
            {selectedLat != null && selectedLng != null ? (
              <span className="font-mono text-foreground">
                已选: 纬度 {selectedLat.toFixed(6)}, 经度 {selectedLng.toFixed(6)}
              </span>
            ) : (
              <span>请点击地图选择位置</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-4">
          <div className="flex gap-2">
            {selectedLat != null && selectedLng != null && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {selectedLat.toFixed(4)}, {selectedLng.toFixed(4)}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-5 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm"
            >
              取消
            </button>
            <button
              onClick={() => {
                if (selectedLat != null && selectedLng != null) {
                  onConfirm(selectedLat, selectedLng);
                }
              }}
              disabled={selectedLat == null || selectedLng == null}
              className="px-5 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              确认选择
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
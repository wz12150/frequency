import { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Search, MapPin, Layers, Download, RefreshCw, Save, CheckCircle2,
  ChevronDown, ChevronUp, SlidersHorizontal, X,
} from 'lucide-react';
import { stationApi } from '../api/station';

// ─── Zoom thresholds ──────────────────────────────────────────────────────────
const ZOOM_DOT   = 7;   // < 7  → tiny dot only
const ZOOM_LABEL = 9;   // 7–8  → dot + name label  │  ≥ 9 → tower icon + label

// ─── Status colors ────────────────────────────────────────────────────────────
const STATUS_COLOR: Record<string, string> = {
  normal: '#2e7d32', expiring: '#f59e0b', expired: '#d32f2f',
};

const STATION_TYPES = ['All', 'Mobile', 'Broadcasting', 'Fixed', 'Satellite', 'Microwave', 'Navigation'];

interface Station {
  guid: string; name: string; type: string;
  frequency: string; freqMHz: number;
  lat: number; lng: number;
  status: 'normal' | 'expiring' | 'expired';
  province: string; expiry: string; power: string;
  unit: string;
  equipName: string;
  equipModel: string;
  // StationForm fields
  technicalStandard?: string;
  bandwidthProcessingUnitModel?: string;
  ownerName?: string;
  backhaulNetworkAccessMethod?: string;
  stationPurpose?: string;
  modulationType?: string;
  equipmentCount?: string;
  equipmentPower?: string;
  antenna?: string;
  antennaCount?: string;
  detailedLocation?: string;
  region?: string;
  openDate?: string;
}

// ─── Tower SVG (high zoom icon) ───────────────────────────────────────────────
function towerSVG(color: string, selected: boolean): string {
  const sw  = selected ? 2.5 : 2;
  const sw2 = selected ? 1.8 : 1.4;
  const glow = selected
    ? `filter:drop-shadow(0 0 5px ${color}) drop-shadow(0 0 2px ${color});`
    : '';
  return `<svg width="24" height="34" viewBox="0 0 24 34" fill="none" xmlns="http://www.w3.org/2000/svg" style="${glow}">
    <path d="M5,9 Q12,2 19,9" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" opacity="0.65"/>
    <path d="M8,6 Q12,2 16,6" fill="none" stroke="${color}" stroke-width="1.1" stroke-linecap="round" opacity="0.45"/>
    <circle cx="12" cy="2.5" r="2.5" fill="${color}"/>
    <line x1="12" y1="2.5" x2="12" y2="30" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>
    <line x1="4"  y1="13" x2="20" y2="13" stroke="${color}" stroke-width="${sw2}" stroke-linecap="round"/>
    <line x1="6"  y1="19" x2="18" y2="19" stroke="${color}" stroke-width="${sw2}" stroke-linecap="round"/>
    <line x1="8"  y1="25" x2="16" y2="25" stroke="${color}" stroke-width="${sw2}" stroke-linecap="round"/>
    <line x1="12" y1="28" x2="2"  y2="34" stroke="${color}" stroke-width="${sw2}" stroke-linecap="round" opacity="0.8"/>
    <line x1="12" y1="28" x2="22" y2="34" stroke="${color}" stroke-width="${sw2}" stroke-linecap="round" opacity="0.8"/>
  </svg>`;
}

function truncate(s: string, n: number) { return s.length > n ? s.slice(0, n) + '…' : s; }

// ─── Hover tooltip HTML (5 fields) ───────────────────────────────────────────
function makeTooltipHtml(s: Station): string {
  const color = STATUS_COLOR[s.status];
  const statusLabel = s.status === 'normal' ? 'Normal' : s.status === 'expiring' ? 'Expiring' : 'Expired';
  const dot = `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${color};margin-right:5px;vertical-align:middle;flex-shrink:0"></span>`;
  const row = (label: string, value: string) =>
    `<tr>
       <td style="color:#9ca3af;padding:3px 12px 3px 0;white-space:nowrap;vertical-align:top;font-size:11px">${label}</td>
       <td style="color:#111827;font-weight:500;font-size:11.5px;word-break:break-word;max-width:170px">${value}</td>
     </tr>`;
  return `
    <div style="font-family:system-ui,-apple-system,sans-serif;min-width:220px;padding:2px 0">
      <div style="font-weight:700;font-size:13px;color:#111827;padding-bottom:7px;margin-bottom:6px;border-bottom:1px solid #e5e7eb;line-height:1.3">${s.name}</div>
      <table style="border-collapse:collapse;width:100%">
        ${row('Station Type',    s.type)}
        ${row('Operating Unit',  s.unit)}
        ${row('Equipment Name',  s.equipName)}
        ${row('Equipment Model', s.equipModel)}
      </table>
      <div style="margin-top:7px;padding-top:6px;border-top:1px solid #f3f4f6;font-size:11px;color:${color};font-weight:600;display:flex;align-items:center">${dot}${statusLabel} · ${s.frequency}</div>
    </div>`;
}

// ─── DivIcon factory ──────────────────────────────────────────────────────────
function makeStationIcon(station: Station, selected: boolean, zoom: number): L.DivIcon {
  const color = STATUS_COLOR[station.status];

  /* ── tiny dot (zoom < ZOOM_DOT) ── */
  if (zoom < ZOOM_DOT) {
    const sz = selected ? 10 : 6;
    const ring = selected ? `box-shadow:0 0 0 2px white,0 0 0 4px ${color};` : '';
    return L.divIcon({
      className: '',
      iconSize:   [sz, sz] as [number, number],
      iconAnchor: [sz / 2, sz / 2] as [number, number],
      html: `<div style="width:${sz}px;height:${sz}px;border-radius:50%;background:${color};${ring}cursor:pointer;"></div>`,
    });
  }

  /* ── medium dot + name (ZOOM_DOT ≤ zoom < ZOOM_LABEL) ── */
  if (zoom < ZOOM_LABEL) {
    const dotSz = selected ? 14 : 10;
    const lbl   = truncate(station.name, 20);
    const selStyle = selected ? `font-weight:700;border:1px solid ${color};` : '';
    return L.divIcon({
      className: '',
      iconSize:   [150, dotSz + 22] as [number, number],
      iconAnchor: [75, dotSz / 2] as [number, number],
      html: `<div style="width:150px;display:flex;flex-direction:column;align-items:center;cursor:pointer;">
        <div style="width:${dotSz}px;height:${dotSz}px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 5px rgba(0,0,0,0.35)${selected ? ',0 0 0 2px '+color : ''}; flex-shrink:0;"></div>
        <div style="margin-top:2px;background:rgba(255,255,255,0.93);padding:1px 5px;border-radius:3px;font-size:10px;font-family:system-ui,sans-serif;color:#1f2937;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.18);${selStyle}">${lbl}</div>
      </div>`,
    });
  }

  /* ── tower icon + name (zoom ≥ ZOOM_LABEL) ── */
  const lbl      = truncate(station.name, 22);
  const selStyle = selected ? `font-weight:700;border:1.5px solid ${color};` : 'border:1px solid rgba(0,0,0,0.08);';
  return L.divIcon({
    className: '',
    iconSize:   [150, 62] as [number, number],
    iconAnchor: [75, 40] as [number, number],
    html: `<div style="width:150px;display:flex;flex-direction:column;align-items:center;cursor:pointer;">
      ${towerSVG(color, selected)}
      <div style="margin-top:2px;background:rgba(255,255,255,0.95);padding:2px 7px;border-radius:4px;font-size:11px;font-family:system-ui,sans-serif;color:#1f2937;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.2);max-width:150px;overflow:hidden;text-overflow:ellipsis;${selStyle}">${lbl}</div>
    </div>`,
  });
}

// ─── Component ────────────────────────────────────────────────────────────────
export function StationMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<L.Map | null>(null);
  const markersRef   = useRef<Map<string, L.Marker>>(new Map());

  const [stations,    setStations]    = useState<Station[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [selectedGuid, setSelectedGuid] = useState<string | null>(null);
  const [editForm,    setEditForm]    = useState<Partial<Station>>({});
  const [savedId,     setSavedId]     = useState<string | null>(null);
  const [zoom,        setZoom]        = useState(5);
  const [filterOpen,  setFilterOpen]  = useState(true);

  // ── Fetch station data from API ───────────────────────────────────────────
  useEffect(() => {
    stationApi.getMapPoints().then((data: Station[]) => {
      setStations(data);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  // ── Filter state ──────────────────────────────────────────────────────────
  const [selTypes,    setSelTypes]    = useState<string[]>([]);
  const [stationType, setStationType] = useState('All');
  const [freqMin,     setFreqMin]     = useState('');
  const [freqMax,     setFreqMax]     = useState('');
  const [nameSearch,  setNameSearch]  = useState('');
  const [province,    setProvince]    = useState('');

  const activeFilterCount = [
    stationType !== 'All',
    selTypes.length > 0,
    !!freqMin || !!freqMax,
    !!nameSearch,
    !!province,
  ].filter(Boolean).length;

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const fMin = parseFloat(freqMin);
    const fMax = parseFloat(freqMax);
    return stations.filter(s => {
      if (stationType !== 'All' && s.type !== stationType) return false;
      if (selTypes.length && !selTypes.includes(s.type)) return false;
      if (!isNaN(fMin) && s.freqMHz < fMin) return false;
      if (!isNaN(fMax) && s.freqMHz > fMax) return false;
      if (nameSearch && !s.name.toLowerCase().includes(nameSearch.toLowerCase())) return false;
      if (province && s.province !== province) return false;
      return true;
    });
  }, [stations, stationType, selTypes, freqMin, freqMax, nameSearch, province]);

  const selected = stations.find(s => s.guid === selectedGuid) ?? null;

  const provinces = useMemo(() => [...new Set(stations.map(s => s.province))].sort(), [stations]);

  // Sync editForm when selection changes
  useEffect(() => {
    setEditForm(selected ? { ...selected } : {});
  }, [selectedGuid]);

  // ── Init Leaflet map ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [46.8, 103.8], zoom: 5, minZoom: 4, maxZoom: 14,
      zoomControl: true, attributionControl: true,
    });

    const carto = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>', subdomains: 'abcd', maxZoom: 20 }
    );
    const esri = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      { attribution: 'Tiles &copy; Esri', maxZoom: 20 }
    );
    carto.addTo(map);
    carto.on('tileerror', () => { if (map.hasLayer(carto)) { map.removeLayer(carto); esri.addTo(map); } });
    map.fitBounds([[41.0, 87.0], [52.8, 120.5]]);

    map.on('zoomend', () => setZoom(map.getZoom()));

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; markersRef.current.clear(); };
  }, []);

  // ── Sync markers (add / remove / update icon) ─────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const guids = new Set(filtered.map(s => s.guid));

    markersRef.current.forEach((marker, guid) => {
      if (!guids.has(guid)) { marker.remove(); markersRef.current.delete(guid); }
    });

    filtered.forEach(station => {
      const isSel = station.guid === selectedGuid;
      const icon  = makeStationIcon(station, isSel, zoom);

      const tooltipHtml = makeTooltipHtml(station);
      if (markersRef.current.has(station.guid)) {
        const m = markersRef.current.get(station.guid)!;
        m.setIcon(icon);
        m.unbindTooltip();
        m.bindTooltip(tooltipHtml, { direction: 'top', offset: [0, -8], opacity: 0.98, sticky: false });
      } else {
        const marker = L.marker([station.lat, station.lng], { icon });
        marker.bindTooltip(tooltipHtml, { direction: 'top', offset: [0, -8], opacity: 0.98, sticky: false });
        marker.on('click', () => setSelectedGuid(prev => prev === station.guid ? null : station.guid));
        marker.addTo(map);
        markersRef.current.set(station.guid, marker);
      }
    });
  }, [filtered, selectedGuid, zoom]);

  // ── Pan to selected ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedGuid || !mapRef.current) return;
    const s = stations.find(x => x.guid === selectedGuid);
    if (s) mapRef.current.panTo([s.lat, s.lng], { animate: true });
  }, [selectedGuid]);

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!selectedGuid || !editForm.name) {
      alert('请填写必填字段：Station Name');
      return;
    }
    try {
      const payload = {
        sitename: editForm.name,
        type: editForm.type,
        stationtype: editForm.type,
        province: editForm.province ?? '',
        district: editForm.region ?? '',
        location: editForm.detailedLocation ?? '',
        devicemodel: editForm.equipModel ?? '',
        devicequantity: editForm.equipmentCount ? parseInt(editForm.equipmentCount) : undefined,
        outputpower: editForm.equipmentPower ? parseFloat(editForm.equipmentPower) : undefined,
        anttype: editForm.antenna ?? '',
        antquantity: editForm.antennaCount ? parseInt(editForm.antennaCount) : undefined,
        technology: editForm.technicalStandard ?? '',
        backbone: editForm.backhaulNetworkAccessMethod ?? '',
        stationpurpose: editForm.stationPurpose ?? '',
        modulation: editForm.modulationType ?? '',
        startdate: editForm.openDate || undefined,
        expirationdate: editForm.expiry || undefined,
        longitude: editForm.lng,
        latitude: editForm.lat,
        unit: editForm.ownerName ?? editForm.unit ?? '',
        equipname: editForm.equipName ?? '',
      };
      await stationApi.update(selectedGuid, payload);
      setStations(prev => prev.map(s => s.guid === selectedGuid ? { ...s, ...editForm } as Station : s));
      setSavedId(selectedGuid);
      setTimeout(() => setSavedId(null), 2000);
    } catch (error) {
      console.error('Failed to save station:', error);
      alert('保存失败，请重试');
    }
  };

  const handleReset = () => {
    setStationType('All'); setSelTypes([]); setBandId('');
    setFreqMin(''); setFreqMax(''); setNameSearch(''); setProvince('');
    setSelectedGuid(null);
    mapRef.current?.fitBounds([[41.0, 87.0], [52.8, 120.5]]);
  };

  const toggleType = (t: string) =>
    setSelTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const normalCount   = filtered.filter(s => s.status === 'normal').length;
  const expiringCount = filtered.filter(s => s.status === 'expiring').length;
  const expiredCount  = filtered.filter(s => s.status === 'expired').length;

  const inputCls  = 'w-full px-2.5 py-1.5 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary';
  const selectCls = inputCls;

  // ── Type badge colors ─────────────────────────────────────────────────────
  const typeColors: Record<string, string> = {
    Mobile: 'bg-blue-100 text-blue-800 border-blue-300',
    Broadcasting: 'bg-pink-100 text-pink-800 border-pink-300',
    Fixed: 'bg-green-100 text-green-800 border-green-300',
    Satellite: 'bg-purple-100 text-purple-800 border-purple-300',
    Microwave: 'bg-orange-100 text-orange-800 border-orange-300',
    Navigation: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  };

  return (
    <div className="space-y-4 overflow-y-auto h-full pb-4">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-semibold mb-1">Station Map</h2>
        <p className="text-muted-foreground text-sm">
          Spatial distribution · {stations.length} total stations · {filtered.length} displayed
          {activeFilterCount > 0 && <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">{activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active</span>}
        </p>
      </div>

      {/* ══ Filter Panel ══════════════════════════════════════════════════════ */}
      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        {/* Panel header */}
        <button
          onClick={() => setFilterOpen(o => !o)}
          className="w-full flex items-center justify-between px-5 py-3 hover:bg-muted/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-sm">Filter &amp; Query</span>
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs">{activeFilterCount}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <button
                onClick={e => { e.stopPropagation(); handleReset(); }}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Clear all
              </button>
            )}
            {filterOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </button>

        {filterOpen && (
          <div className="border-t border-border">
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border">

              {/* ── Section A: Station Type ──────────────────────────────── */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold">A</span>
                    Station Type
                  </p>
                  {stationType !== 'All' && (
                    <button onClick={() => setStationType('All')} className="text-xs text-blue-600 hover:underline">Clear</button>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Station Type</label>
                  <select value={stationType} onChange={e => setStationType(e.target.value)} className={selectCls}>
                    {STATION_TYPES.map(t => <option key={t} value={t}>{t === 'All' ? 'All types' : t}</option>)}
                  </select>
                </div>
              </div>

              {/* ── Section B: Frequency Range ────────────────────────────── */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold">B</span>
                    Frequency Range
                  </p>
                  {(freqMin || freqMax) && (
                    <button onClick={() => { setFreqMin(''); setFreqMax(''); }} className="text-xs text-blue-600 hover:underline">Clear</button>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number" placeholder="Min" value={freqMin}
                    onChange={e => setFreqMin(e.target.value)}
                    className={`${inputCls} text-center`}
                  />
                  <span className="text-muted-foreground text-xs flex-shrink-0">—</span>
                  <input
                    type="number" placeholder="Max" value={freqMax}
                    onChange={e => setFreqMax(e.target.value)}
                    className={`${inputCls} text-center`}
                  />
                </div>
             </div>

              {/* ── Section C: Station Name ───────────────────────────────── */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold">C</span>
                    Station Name
                  </p>
                  {nameSearch && (
                    <button onClick={() => setNameSearch('')} className="text-xs text-blue-600 hover:underline">Clear</button>
                  )}
                </div>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="text" placeholder="Search…"
                    value={nameSearch}
                    onChange={e => setNameSearch(e.target.value)}
                    className={`${inputCls} pl-7`}
                  />
                </div>
              </div>

              {/* ── Section D: Region ────────────────────────────────────── */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold">D</span>
                    Region
                  </p>
                  {province && (
                    <button onClick={() => setProvince('')} className="text-xs text-blue-600 hover:underline">Clear</button>
                  )}
                </div>
                <select value={province} onChange={e => setProvince(e.target.value)} className={selectCls}>
                  <option value="">All provinces</option>
                  {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            {/* Reset all row */}
            <div className="px-5 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{filtered.length}</span> of <span className="font-semibold">{stations.length}</span> stations
              </p>
              <button onClick={handleReset} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <RefreshCw className="w-3.5 h-3.5" /> Reset all filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══ Map + Detail Panel ════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

        {/* Leaflet Map */}
        <div className="lg:col-span-3 bg-card rounded-lg border border-border shadow-sm overflow-hidden">
          <div className="bg-muted px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">Map View</h3>
              <span className="text-xs text-muted-foreground">
                CartoDB Voyager · zoom {zoom} ·
                {zoom < ZOOM_DOT ? ' dot mode' : zoom < ZOOM_LABEL ? ' label mode' : ' icon mode'}
              </span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => mapRef.current?.fitBounds([[41.0, 87.0], [52.8, 120.5]])}
                className="p-1.5 hover:bg-background rounded transition-colors text-muted-foreground hover:text-foreground"
                title="Fit Mongolia"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:bg-background rounded transition-colors text-muted-foreground hover:text-foreground" title="Export">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative">
            <div ref={containerRef} className="w-full" style={{ height: '600px', background: '#e8f4f8' }} />

            {/* Zoom hint */}
            <div className="absolute top-3 right-3 z-[1000] bg-white/90 backdrop-blur-sm text-[11px] text-gray-500 px-2.5 py-1.5 rounded-lg shadow border border-gray-200">
              {zoom < ZOOM_DOT
                ? '🔍 Zoom in for station labels'
                : zoom < ZOOM_LABEL
                ? '🔍 Zoom in for tower icons'
                : '🗼 Tower icons active'}
            </div>

            {/* Legend */}
            <div className="absolute bottom-5 left-4 z-[1000] bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-3">
              <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <MapPin className="w-3 h-3" /> Legend
              </p>
              <div className="space-y-1.5 mb-2">
                {[{ l: 'Normal', c: '#2e7d32' }, { l: 'Expiring', c: '#f59e0b' }, { l: 'Expired', c: '#d32f2f' }].map(x => (
                  <div key={x.l} className="flex items-center gap-2 text-xs">
                    <div className="w-3.5 h-3.5 rounded-full border border-white/80 shadow-sm flex-shrink-0" style={{ background: x.c }} />
                    <span className="text-gray-600">{x.l}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-2 text-[10px] text-gray-400 grid grid-cols-2 gap-x-3 gap-y-0.5">
                {[['M', 'Mobile'], ['B', 'Broadcast'], ['F', 'Fixed'], ['S', 'Satellite'], ['μ', 'Microwave'], ['N', 'Navigation']].map(([k, v]) => (
                  <div key={k}><span className="font-semibold">{k}</span>={v}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Station Detail / Edit Panel ─────────────────────────────────── */}
        <div className="bg-card rounded-lg border border-border shadow-sm flex flex-col">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="font-semibold text-sm">Station Info</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {selected ? 'Edit fields and save changes' : 'Click a marker to view details'}
            </p>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-muted-foreground text-sm">Loading stations…</div>
            </div>
          ) : selected ? (
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Station Name */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium mb-1">Station Name <span className="text-red-500">*</span></label>
                  <input type="text" value={editForm.name ?? ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className={inputCls} />
                </div>
                {/* Technical Standard */}
                <div>
                  <label className="block text-xs font-medium mb-1">Technical Standard</label>
                  <input type="text" value={editForm.technicalStandard ?? ''} onChange={e => setEditForm(f => ({ ...f, technicalStandard: e.target.value }))} className={inputCls} />
                </div>
                {/* Bandwidth Processing Unit Model */}
                <div>
                  <label className="block text-xs font-medium mb-1">Bandwidth Processing Unit Model</label>
                  <input type="text" value={editForm.bandwidthProcessingUnitModel ?? ''} onChange={e => setEditForm(f => ({ ...f, bandwidthProcessingUnitModel: e.target.value }))} className={inputCls} />
                </div>
                {/* Owner Name */}
                <div>
                  <label className="block text-xs font-medium mb-1">Owner Name <span className="text-red-500">*</span></label>
                  <input type="text" value={editForm.ownerName ?? ''} onChange={e => setEditForm(f => ({ ...f, ownerName: e.target.value }))} className={inputCls} />
                </div>
                {/* Backhaul Network Access Method */}
                <div>
                  <label className="block text-xs font-medium mb-1">Backhaul Network Access Method</label>
                  <input type="text" value={editForm.backhaulNetworkAccessMethod ?? ''} onChange={e => setEditForm(f => ({ ...f, backhaulNetworkAccessMethod: e.target.value }))} className={inputCls} />
                </div>
                {/* Station Purpose */}
                <div>
                  <label className="block text-xs font-medium mb-1">Station Purpose</label>
                  <input type="text" value={editForm.stationPurpose ?? ''} onChange={e => setEditForm(f => ({ ...f, stationPurpose: e.target.value }))} className={inputCls} />
                </div>
                {/* Modulation Type */}
                <div>
                  <label className="block text-xs font-medium mb-1">Modulation Type</label>
                  <input type="text" value={editForm.modulationType ?? ''} onChange={e => setEditForm(f => ({ ...f, modulationType: e.target.value }))} className={inputCls} />
                </div>
                {/* Station Type */}
                <div>
                  <label className="block text-xs font-medium mb-1">Station Type <span className="text-red-500">*</span></label>
                  <select value={editForm.type ?? ''} onChange={e => setEditForm(f => ({ ...f, type: e.target.value }))} className={selectCls}>
                    {STATION_TYPES.filter(t => t !== 'All').map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                {/* Frequency */}
                <div>
                  <label className="block text-xs font-medium mb-1">Frequency</label>
                  <input type="text" value={editForm.frequency ?? ''} onChange={e => setEditForm(f => ({ ...f, frequency: e.target.value }))} className={inputCls} />
                </div>
                {/* Equipment Name and Model */}
                <div>
                  <label className="block text-xs font-medium mb-1">Equipment Name and Model</label>
                  <input type="text" value={editForm.equipName ?? ''} onChange={e => setEditForm(f => ({ ...f, equipName: e.target.value }))} className={inputCls} />
                </div>
                {/* Equipment Count */}
                <div>
                  <label className="block text-xs font-medium mb-1">Equipment Count</label>
                  <input type="text" value={editForm.equipmentCount ?? ''} onChange={e => setEditForm(f => ({ ...f, equipmentCount: e.target.value }))} className={inputCls} />
                </div>
                {/* Equipment Output Power */}
                <div>
                  <label className="block text-xs font-medium mb-1">Equipment Output Power</label>
                  <input type="text" value={editForm.equipmentPower ?? ''} onChange={e => setEditForm(f => ({ ...f, equipmentPower: e.target.value }))} className={inputCls} />
                </div>
                {/* Antenna Type */}
                <div>
                  <label className="block text-xs font-medium mb-1">Antenna Type</label>
                  <input type="text" value={editForm.antenna ?? ''} onChange={e => setEditForm(f => ({ ...f, antenna: e.target.value }))} className={inputCls} />
                </div>
                {/* Antenna Count */}
                <div>
                  <label className="block text-xs font-medium mb-1">Antenna Count</label>
                  <input type="text" value={editForm.antennaCount ?? ''} onChange={e => setEditForm(f => ({ ...f, antennaCount: e.target.value }))} className={inputCls} />
                </div>
                {/* Province */}
                <div>
                  <label className="block text-xs font-medium mb-1">Province <span className="text-red-500">*</span></label>
                  <select value={editForm.province ?? ''} onChange={e => setEditForm(f => ({ ...f, province: e.target.value }))} className={selectCls}>
                    <option value="">Select Province</option>
                    {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                {/* Region */}
                <div>
                  <label className="block text-xs font-medium mb-1">Region <span className="text-red-500">*</span></label>
                  <input type="text" value={editForm.region ?? ''} onChange={e => setEditForm(f => ({ ...f, region: e.target.value }))} className={inputCls} />
                </div>
                {/* Detailed Location */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium mb-1">Detailed Location</label>
                  <input type="text" value={editForm.detailedLocation ?? ''} onChange={e => setEditForm(f => ({ ...f, detailedLocation: e.target.value }))} className={inputCls} />
                </div>
                {/* Status */}
                <div>
                  <label className="block text-xs font-medium mb-1">Status</label>
                  <select value={editForm.status ?? ''} onChange={e => setEditForm(f => ({ ...f, status: e.target.value as Station['status'] }))} className={selectCls}>
                    <option value="normal">Normal</option>
                    <option value="expiring">Expiring</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                {/* Open Date */}
                <div>
                  <label className="block text-xs font-medium mb-1">Open Date</label>
                  <input type="date" value={editForm.openDate ?? ''} onChange={e => setEditForm(f => ({ ...f, openDate: e.target.value }))} className={inputCls} />
                </div>
                {/* Expire Date */}
                <div>
                  <label className="block text-xs font-medium mb-1">Expire Date</label>
                  <input type="date" value={editForm.expiry ?? ''} onChange={e => setEditForm(f => ({ ...f, expiry: e.target.value }))} className={inputCls} />
                </div>
                {/* Latitude */}
                <div>
                  <label className="block text-xs font-medium mb-1">Latitude</label>
                  <input type="number" step="0.0001" value={editForm.lat ?? ''} onChange={e => setEditForm(f => ({ ...f, lat: parseFloat(e.target.value) }))} className={inputCls} />
                </div>
                {/* Longitude */}
                <div>
                  <label className="block text-xs font-medium mb-1">Longitude</label>
                  <input type="number" step="0.0001" value={editForm.lng ?? ''} onChange={e => setEditForm(f => ({ ...f, lng: parseFloat(e.target.value) }))} className={inputCls} />
                </div>
              </div>

              {/* Save */}
              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleSave}
                  className={`px-6 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                    savedId === selected.guid
                      ? 'bg-green-600 text-white'
                      : 'bg-primary text-primary-foreground hover:opacity-90'
                  }`}
                >
                  {savedId === selected.guid
                    ? <><CheckCircle2 className="w-4 h-4" /> Saved!</>
                    : <><Save className="w-4 h-4" /> Save</>}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground py-10 px-6">
              <MapPin className="w-10 h-10 mb-3 opacity-25" />
              <p className="font-medium text-sm">No station selected</p>
              <p className="text-xs mt-1 opacity-60">Click a marker on the map</p>
              <div className="mt-4 text-left space-y-1 text-xs text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Display modes:</p>
                <p>• Zoom &lt; {ZOOM_DOT}: colored dots</p>
                <p>• Zoom {ZOOM_DOT}–{ZOOM_LABEL - 1}: dot + name label</p>
                <p>• Zoom ≥ {ZOOM_LABEL}: tower icon + label</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══ Summary Stats ══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Displayed',  value: filtered.length, color: 'text-foreground',  bg: '' },
          { label: 'Normal',     value: normalCount,     color: 'text-green-600',   bg: 'bg-green-50 border-green-200' },
          { label: 'Expiring',   value: expiringCount,   color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-200' },
          { label: 'Expired',    value: expiredCount,    color: 'text-red-600',     bg: 'bg-red-50 border-red-200'     },
        ].map(s => (
          <div key={s.label} className={`bg-card p-4 rounded-lg border ${s.bg || 'border-border'} shadow-sm`}>
            <div className="text-xs text-muted-foreground mb-1">{s.label} Stations</div>
            <div className={`text-2xl font-semibold tabular-nums ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

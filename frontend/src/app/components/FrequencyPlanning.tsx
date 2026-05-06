import { useMemo, useState } from 'react';
import { ArrowLeft, BadgeInfo, ChevronLeft, ChevronRight, FileDown, FileUp, Info, Plus, RadioTower, ShieldAlert, Satellite, X } from 'lucide-react';

type SpectrumSegment = {
  service: string;
  share: number;
  color: string;
  note: string;
};

type StationRecord = {
  name: string;
  transmitFrequency: string;
  bandwidth: string;
  deviceName: string;
  deviceModel: string;
  deviceCount: number;
  outputPower: string;
  antennaType: string;
  antennaCount: number;
  province: string;
  city: string;
  district: string;
  location: string;
  longitude: string;
  latitude: string;
};

type SpectrumBlock = {
  id: number;
  band: string;
  range: string;
  start: number;
  end: number;
  width: number;
  status: 'occupied' | 'free' | 'reserved';
  color: string;
  label: string;
  subCategoryName?: string;
  icons?: string[];
  note: string;
  stations?: StationRecord[];
  segments?: SpectrumSegment[];
};

type DetailView = 'overview' | 'detail';

const spectrumRows = [
  { title: '3–300 kHz', unit: 'kHz', start: 3, end: 300 },
  { title: '300–3000 kHz', unit: 'kHz', start: 300, end: 3000 },
  { title: '3–30 MHz', unit: 'MHz', start: 3, end: 30 },
  { title: '30–300 MHz', unit: 'MHz', start: 30, end: 300 },
  { title: '300–3000 MHz', unit: 'MHz', start: 300, end: 3000 },
  { title: '3–30 GHz', unit: 'GHz', start: 3, end: 30 },
  { title: '30–300 GHz', unit: 'GHz', start: 30, end: 300 },
];

const spectrumBlocks: SpectrumBlock[] = [
  { id: 1, band: 'Broadcasting', range: '47–68 MHz', start: 47, end: 68, width: 21, step: 6, bandwidth: 8, stationCount: 18, stations: [
    { name: 'Ulaanbaatar TV-1', location: 'Ulaanbaatar', owner: 'National TV', frequency: '55.25 MHz' },
    { name: 'FM 101.7', location: 'Ulaanbaatar', owner: 'Public Radio', frequency: '57.75 MHz' },
    { name: 'Relay Site A', location: 'Darkhan', owner: 'Broadcast Relay', frequency: '63.50 MHz' },
  ], status: 'occupied', color: '#2B7FFF', label: 'Broadcast', icons: ['📡'], note: 'Terrestrial broadcast planning allocation', segments: [
    { service: 'TV', share: 50, color: '#2B7FFF', note: 'Digital television' },
    { service: 'Radio', share: 30, color: '#4F8DF7', note: 'FM / public radio' },
    { service: 'Auxiliary', share: 20, color: '#7FB3FF', note: 'Support services' },
  ] },
  { id: 2, band: 'Mobile', range: '824–960 MHz', start: 824, end: 960, width: 136, step: 5, bandwidth: 10, stationCount: 42, stations: [
    { name: 'UB Cell Site 12', location: 'Ulaanbaatar', owner: 'MobiCom', frequency: '836.5 MHz' },
    { name: 'Gobi LTE Node', location: 'Dalanzadgad', owner: 'Unitel', frequency: '889.0 MHz' },
    { name: '5G Trial Site', location: 'Erdenet', owner: 'Skytel', frequency: '927.5 MHz' },
  ], status: 'occupied', color: '#27AE60', label: 'Mobile', icons: ['📱'], note: 'Public mobile communication allocation', segments: [
    { service: '4G LTE', share: 40, color: '#27AE60', note: 'Macro coverage' },
    { service: '5G NR', share: 40, color: '#3CCF7A', note: 'Mid-band capacity' },
    { service: 'IoT', share: 20, color: '#7EE2A8', note: 'Low-power access' },
  ] },
  {
    id: 8,
    band: '700 MHz',
    range: '703–798 MHz',
    start: 703,
    end: 798,
    width: 95,
    step: 5,
    bandwidth: 10,
    stationCount: 6,
    stations: [
      { name: '700 MHz Macro A', location: 'Ulaanbaatar', owner: 'MobiCom', frequency: '703.5 MHz' },
      { name: '700 MHz Macro B', location: 'Darkhan', owner: 'Unitel', frequency: '711.0 MHz' },
      { name: 'Safety Relay', location: 'Selenge', owner: 'Public Safety', frequency: '721.0 MHz' },
    ],
    status: 'occupied',
    color: '#2563EB',
    label: '700 MHz Duplex Band',
    icons: ['📶'],
    note: 'One band shared by multiple services with equal vertical split',
    segments: [
      { service: 'Mobile broadband', share: 1, color: '#2563EB', note: 'FDD/LTE coverage' },
      { service: 'Public safety', share: 1, color: '#0EA5E9', note: 'Mission-critical communications' },
      { service: 'Broadcast protection', share: 1, color: '#14B8A6', note: 'Channel protection and guard use' },
    ],
  },
  { id: 3, band: 'NDB / Aviation', range: '285–315 kHz', start: 285, end: 315, width: 30, step: 1, bandwidth: 3, stationCount: 12, stations: [
    { name: 'NDB UB-1', location: 'Ulaanbaatar', owner: 'Civil Aviation', frequency: '289.5 kHz' },
    { name: 'NDB Darkhan', location: 'Darkhan', owner: 'Civil Aviation', frequency: '298.0 kHz' },
    { name: 'Coastal Beacon', location: 'Khovd', owner: 'Marine Service', frequency: '308.5 kHz' },
  ], status: 'occupied', color: '#6366F1', label: 'Low Frequency', icons: ['📻'], note: 'Aviation and navigation beacons', segments: [
    { service: 'Aviation Navigation', share: 50, color: '#4F46E5', note: 'Non-directional beacon use' },
    { service: 'Marine / Beacon', share: 50, color: '#818CF8', note: 'Marine and coastal assistance' },
  ] },
  { id: 4, band: 'LF Shared Services', range: '495–505 kHz', start: 495, end: 505, width: 10, step: 1, bandwidth: 2, stationCount: 9, stations: [
    { name: 'LF Control A', location: 'Ulaanbaatar', owner: 'Utility Bureau', frequency: '496.0 kHz' },
    { name: 'LF Control B', location: 'Erdenet', owner: 'Utility Bureau', frequency: '500.5 kHz' },
    { name: 'LF Research', location: 'Darkhan', owner: 'Research Lab', frequency: '503.0 kHz' },
  ], status: 'occupied', color: '#0EA5E9', label: 'LF Shared', icons: ['📡'], note: 'Shared service block with equal split', segments: [
    { service: 'Public Service', share: 33, color: '#0284C7', note: 'Public communication' },
    { service: 'Utility Control', share: 33, color: '#38BDF8', note: 'Remote monitoring' },
    { service: 'Experimental', share: 34, color: '#7DD3FC', note: 'Research and trials' },
  ] },
  { id: 5, band: 'Emergency', range: '156–174 MHz', start: 156, end: 174, width: 18, status: 'occupied', color: '#D64545', label: 'Emergency', icons: ['🚨'], note: 'Emergency and public safety radio services' },
  { id: 6, band: 'Fixed Service', range: '7.1–7.3 GHz', start: 7.1, end: 7.3, width: 0.2, status: 'occupied', color: '#F39C12', label: 'Fixed', icons: ['🛰️'], note: 'Point-to-point fixed microwave links' },
  { id: 6, band: 'Satellite', range: '10.7–12.75 GHz', start: 10.7, end: 12.75, width: 2.05, status: 'occupied', color: '#8E44AD', label: 'Satellite', icons: ['🛰️'], note: 'Satellite downlink planning band' },
  { id: 7, band: 'Reserved', range: '2.3–2.4 GHz', start: 2.3, end: 2.4, width: 0.1, status: 'reserved', color: '#8A8F98', label: 'Reserved', icons: ['⬜'], note: 'Reserved for future coordination' },
  { id: 8, band: 'Unallocated', range: 'Unassigned gaps', start: 0, end: 0, width: 0, status: 'free', color: '#E5E7EB', label: 'Idle', icons: ['◻️'], note: 'White space indicates free or unassigned spectrum' },
];

export function FrequencyPlanning() {
  const [viewMode, setViewMode] = useState<DetailView>('overview');
  const [selectedBlock, setSelectedBlock] = useState<SpectrumBlock | null>(null);
  const [showStationPanel, setShowStationPanel] = useState(false);
  const [stationPage, setStationPage] = useState(1);
  const [stationFreqRange, setStationFreqRange] = useState('');

  const blocksByRow = useMemo(() => {
    return spectrumRows.map((row) => {
      const rowBlocks = spectrumBlocks.filter((block) => {
        if (row.title === '3–300 kHz') return block.id === 4;
        if (row.title === '300–3000 kHz') return block.id === 5;
        if (row.title === '3–30 MHz') return block.start >= 3 && block.end <= 30;
        if (row.title === '30–300 MHz') return block.start >= 30 && block.end <= 300;
        if (row.title === '300–3000 MHz') return block.start >= 300 && block.end <= 3000;
        if (row.title === '3–30 GHz') return block.start >= 3 && block.end <= 30;
        if (row.title === '30–300 GHz') return block.start >= 30 && block.end <= 300;
        return false;
      });
      return { ...row, blocks: rowBlocks };
    });
  }, []);

  const frequencyBands = [
    { id: 1, category: 'Mobile', subCategory: 'LTE/5G', service: 'Primary', bandName: 'Band 3', startFreq: 1710, endFreq: 1785, step: 5, bandwidth: 5, status: 'occupied', stations: 342 },
    { id: 2, category: 'Broadcasting', subCategory: 'DVB-T', service: 'Primary', bandName: 'UHF', startFreq: 470, endFreq: 862, step: 8, bandwidth: 8, status: 'occupied', stations: 128 },
    { id: 3, category: 'Fixed', subCategory: 'Microwave', service: 'Secondary', bandName: 'C-Band', startFreq: 3700, endFreq: 4200, step: 40, bandwidth: 40, status: 'occupied', stations: 89 },
    { id: 4, category: 'Satellite', subCategory: 'Ku-Band', service: 'Primary', bandName: 'DBS', startFreq: 11700, endFreq: 12200, step: 27, bandwidth: 27, status: 'occupied', stations: 45 },
    { id: 5, category: 'Unallocated', subCategory: '-', service: '-', bandName: 'Reserved', startFreq: 2300, endFreq: 2400, step: 0, bandwidth: 0, status: 'free', stations: 0 },
  ];

  const stationRecords = useMemo(() => {
    const source = selectedBlock?.stations ?? [];
    const seed = source.length > 0 ? source : [{ name: 'Sample Station', location: 'Unknown', owner: 'Unknown', frequency: '-' }];
    return Array.from({ length: 40 }, (_, index) => {
      const base = seed[index % seed.length];
      return {
        name: base.name ?? `Station ${index + 1}`,
        transmitFrequency: base.frequency ?? '-',
        bandwidth: selectedBlock ? `${selectedBlock.bandwidth} kHz` : '-',
        deviceName: 'Radio Unit',
        deviceModel: 'Model X',
        deviceCount: 1,
        outputPower: '50 W',
        antennaType: 'Omni',
        antennaCount: 1,
        province: 'Ulaanbaatar',
        city: base.location ?? '-',
        district: '-',
        location: base.location ?? '-',
        longitude: '106.9',
        latitude: '47.9',
      };
    });
  }, [selectedBlock]);

  const filteredStationRecords = useMemo(() => {
    const value = stationFreqRange.trim().toLowerCase();
    if (!value) return stationRecords;
    return stationRecords.filter((station) => {
      const freq = station.transmitFrequency.toLowerCase();
      const bandwidth = station.bandwidth.toLowerCase();
      return freq.includes(value) || bandwidth.includes(value);
    });
  }, [stationFreqRange, stationRecords]);

  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(filteredStationRecords.length / pageSize));
  const currentPage = Math.min(stationPage, totalPages);
  const pagedStations = filteredStationRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const categories = [
    { name: 'Broadcasting', range: 'Radio & TV services', color: '#2B7FFF', count: 12 },
    { name: 'Mobile Communication', range: 'Public cellular networks', color: '#27AE60', count: 24 },
    { name: 'Emergency Communication', range: 'Public safety, rescue', color: '#D64545', count: 8 },
    { name: 'Dedicated / Fixed Wireless', range: 'Microwave links', color: '#F39C12', count: 18 },
    { name: 'Satellite', range: 'Space-ground services', color: '#8E44AD', count: 9 },
    { name: 'Reserved / Free', range: 'Unallocated blocks', color: '#9CA3AF', count: 15 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Frequency Planning</h2>
          <p className="text-muted-foreground">Visual spectrum allocation map for Mongolia's radio resources</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => setViewMode('overview')} className={`px-4 py-2 rounded-lg transition-colors ${viewMode === 'overview' ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-muted'}`}>Overview</button>
        </div>
      </div>

      {viewMode === 'overview' && !selectedBlock && (
        <>
          <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-lg font-semibold">Spectrum Allocation Overview</h3>
                <p className="text-sm text-muted-foreground">Color blocks represent service types; blank areas indicate free or unassigned spectrum.</p>
              </div>
              <div className="text-sm text-muted-foreground">Click any block to open detailed planning info</div>
            </div>

            <div className="space-y-4">
              {categories.map((category) => (
                <div key={category.name}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium">{category.name}</span>
                      <span className="text-sm text-muted-foreground ml-3">{category.range}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">{category.count} bands</div>
                  </div>
                  <div className="h-12 bg-muted rounded-lg overflow-hidden flex items-center">
                    <div className="h-full flex items-center justify-center text-white text-sm font-medium transition-all cursor-pointer hover:opacity-80" style={{ backgroundColor: category.color, width: `${(category.count / 24) * 100}%` }}>
                      {category.count > 4 ? `${category.count} bands` : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
              <div>
                <h3 className="text-lg font-semibold">National Spectrum Distribution Map</h3>
                <p className="text-sm text-muted-foreground">7-band layout inspired by the reference radio allocation chart. Width shows range, stacked height shows shared use.</p>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#2B7FFF]" />Broadcast</span>
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#27AE60]" />Mobile</span>
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#D64545]" />Emergency</span>
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#F39C12]" />Fixed</span>
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#8E44AD]" />Satellite</span>
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#9CA3AF]" />Free</span>
              </div>
            </div>

            <div className="space-y-4">
              {blocksByRow.map((row) => (
                <div key={row.title} className="grid grid-cols-[130px_1fr_90px] gap-3 items-start">
                  <div className="pt-3 text-sm font-medium text-muted-foreground">{row.title}</div>
                  <div className="relative h-24 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
                    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,.08) 1px, transparent 1px)', backgroundSize: '8% 100%' }} />
                    <div className="relative h-full flex items-stretch gap-0">
                      {row.blocks.length > 0 ? row.blocks.map((block) => {
                        const hasSegments = block.segments && block.segments.length > 0;
                        return (
                        <button
                          key={block.id}
                          onClick={() => { setSelectedBlock(block); setViewMode('detail'); setStationPage(1); }}
                          className="relative h-full border-r border-white/15 transition-all hover:brightness-110 hover:shadow-2xl group overflow-hidden"
                          style={{ background: block.color, width: `${Math.max(block.width * 8, 90)}px` }}
                          title={`${block.band} · ${block.range}`}
                        >
                          {hasSegments ? (
                            <div className="absolute inset-0 flex flex-col">
                              {block.segments!.map((segment) => (
                                <div
                                  key={segment.service}
                                  className="flex-1 flex items-center justify-center text-white text-[11px] leading-tight px-2 text-center font-semibold border-b border-white/20 last:border-b-0"
                                  style={{ background: segment.color, opacity: 0.95 }}
                                >
                                  <div>
                                    <div className="font-bold">{segment.service}</div>
                                    <div className="text-[10px] opacity-90">{segment.note}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-[11px] leading-tight px-2 text-center font-semibold">
                              <div className="flex items-center gap-1 text-xs mb-1">{block.icons?.map((i) => <span key={i}>{i}</span>)}<span>{block.label}</span></div>
                              <div className="text-[10px] opacity-95">{block.range}</div>
                            </div>
                          )}
                          <div className="absolute bottom-1 right-2 text-[10px] bg-black/20 px-1 rounded text-white/95">{block.status === 'free' ? 'FREE' : block.status.toUpperCase()}</div>
                          <div className="absolute top-1 left-2 hidden group-hover:block text-[10px] bg-black/80 text-white px-2 py-1 rounded whitespace-nowrap">Click for details</div>
                        </button>
                        );
                      }) : (
                        <div className="h-full w-full bg-gradient-to-r from-slate-200 via-white to-slate-200" />
                      )}
                    </div>
                    <div className="absolute left-3 right-3 bottom-0 h-6 flex items-center justify-between text-[10px] text-slate-200/80">
                      <span>Start</span>
                      <span>Shared / segmented allocation</span>
                      <span>End</span>
                    </div>
                  </div>
                  <div className="pt-3 text-right text-sm text-muted-foreground">{row.unit}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
              <div className="text-xs sm:text-sm">White space = unassigned spectrum</div>
              <div className="flex flex-wrap gap-4 sm:gap-6">
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#2B7FFF] rounded" /><span>Occupied</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#9CA3AF] rounded" /><span>Reserved</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-white border border-border rounded" /><span>Free</span></div>
              </div>
            </div>
          </div>
        </>
      )}

      {viewMode === 'detail' && selectedBlock && (
        <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <button onClick={() => { setSelectedBlock(null); setViewMode('overview'); }} className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"><ArrowLeft className="w-4 h-4" /></button>
              <div>
                <h3 className="text-lg font-semibold">Frequency Planning Details</h3>
                <p className="text-sm text-muted-foreground">Detailed view for the selected spectrum block</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setSelectedBlock(null); setViewMode('overview'); setShowStationPanel(false); }} className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4 rotate-180" />Back to spectrum map</button>
            </div>
          </div>

          <div className="w-full bg-sky-200 rounded-2xl p-6 border border-sky-300 text-black">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-black/70">Selected Block</div>
                <div className="text-2xl font-semibold text-black">{selectedBlock.band}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-black/70">Range</div>
                <div className="text-xl font-semibold text-black">{selectedBlock.range}</div>
              </div>
            </div>
            <div className="h-24 rounded-xl mb-4" style={{ background: selectedBlock.color }} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg bg-white/35 p-3"><div className="text-black/70">Business Type</div><div className="font-medium text-black">{selectedBlock.label}</div></div>
              <div className="rounded-lg bg-white/35 p-3"><div className="text-black/70">Business Subclass</div><div className="font-medium text-black">{selectedBlock.subCategoryName ?? '-'}</div></div>
              <div className="rounded-lg bg-white/35 p-3"><div className="text-black/70">Step</div><div className="font-medium text-black">{selectedBlock.step} kHz</div></div>
              <div className="rounded-lg bg-white/35 p-3"><div className="text-black/70">Bandwidth</div><div className="font-medium text-black">{selectedBlock.bandwidth} kHz</div></div>
              <div className="rounded-lg bg-white/35 p-3"><div className="text-black/70">Station Count</div><button onClick={() => setShowStationPanel(true)} className="font-medium text-black underline decoration-dotted underline-offset-4">{selectedBlock.stationCount}</button></div>
              <div className="rounded-lg bg-white/35 p-3"><div className="text-black/70">Usage Status</div><div className="font-medium text-black capitalize">{selectedBlock.status}</div></div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'detail' && !selectedBlock && (
        <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Frequency Planning Details</h3>
            <button onClick={() => setViewMode('overview')} className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">Back to Overview</button>
          </div>
          <p className="text-muted-foreground">Please select a block from the spectrum map to inspect its details.</p>
        </div>
      )}

      {showStationPanel && selectedBlock && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Station Information</h3>
                <p className="text-sm text-gray-500 mt-1">One station per row, 20 stations per page</p>
              </div>
              <button onClick={() => setShowStationPanel(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
            </div>

            <div className="flex-1 overflow-auto p-6 bg-gradient-to-b from-sky-50 via-white to-blue-50">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 text-sm mb-6">
                <div className="rounded-2xl bg-white/80 border border-sky-100 shadow-sm p-4">
                  <div className="text-gray-500">Band</div><div className="font-medium text-gray-900">{selectedBlock.band}</div>
                </div>
                <div className="rounded-2xl bg-white/80 border border-sky-100 shadow-sm p-4">
                  <div className="text-gray-500">Station Count</div><div className="font-medium text-gray-900">{filteredStationRecords.length}</div>
                </div>
                <div className="rounded-2xl bg-white/80 border border-sky-100 shadow-sm p-4">
                  <div className="text-gray-500">Page</div><div className="font-medium text-gray-900">{currentPage} / {totalPages}</div>
                </div>
                <div className="rounded-2xl bg-white/80 border border-sky-100 shadow-sm p-4">
                  <div className="text-gray-500">Page Size</div><div className="font-medium text-gray-900">{pageSize}</div>
                </div>
                <div className="rounded-2xl bg-white/80 border border-sky-100 shadow-sm p-4">
                  <div className="text-gray-500">Frequency Range Query</div>
                  <input
                    type="text"
                    value={stationFreqRange}
                    onChange={(e) => { setStationFreqRange(e.target.value); setStationPage(1); }}
                    className="mt-2 w-full rounded-lg border border-sky-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
                    placeholder="e.g. 703, 5 MHz"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-sky-100 shadow-lg bg-white/80 backdrop-blur-sm">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-sky-600 to-blue-600 text-white">
                      <th className="text-left py-3 px-3 whitespace-nowrap">Frequency Band</th>
                      <th className="text-left py-3 px-3 whitespace-nowrap">National Allocation</th>
                      <th className="text-left py-3 px-3 whitespace-nowrap">Utilization</th>
                      <th className="text-left py-3 px-3 whitespace-nowrap">Special Conditions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-100">
                    {pagedStations.map((station, index) => (
                      <tr key={`${station.name}-${index}`} className={`transition-colors ${index % 2 === 0 ? 'bg-sky-50/70' : 'bg-white/70'} hover:bg-sky-100/80`}>
                        <td className="py-3 px-3 whitespace-nowrap font-medium text-gray-900">{station.transmitFrequency}</td>
                        <td className="py-3 px-3 whitespace-nowrap text-gray-700">{selectedBlock?.note ?? '-'}</td>
                        <td className="py-3 px-3 whitespace-nowrap text-gray-700">{station.bandwidth}</td>
                        <td className="py-3 px-3 whitespace-nowrap text-gray-700">{station.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-200 bg-white">
              <div className="text-sm text-gray-600">Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, stationRecords.length)} of {stationRecords.length}</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStationPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button className="px-3 py-2 rounded-lg bg-blue-600 text-white">{currentPage}</button>
                <button
                  onClick={() => setStationPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BadgeInfo, ChevronLeft, ChevronRight, FileDown, FileUp, Info, Plus, RadioTower, ShieldAlert, Satellite, X } from 'lucide-react';
import { planningApi, PlanningVO } from '../api/planning';

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

/** start/end/width 为 kHz；step、bandwidth 为 kHz（与后端导入一致）*/
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
  level: string;
  subCategoryName?: string;
  icons?: string[];
  note: string;
  stations?: StationRecord[];
  segments?: SpectrumSegment[];
  step?: number;
  bandwidth?: number;
  stationCount?: number;
};

type DetailView = 'overview' | 'detail';

type SpectrumRowDef = {
  title: string;
  unit: string;
  /** 该行在图谱上对应的频率区间（kHz，与 PlanningVO 一致） */
  khzStart: number;
  khzEnd: number;
};

function trimFreqNumber(n: number): string {
  if (!Number.isFinite(n)) return '-';
  const rounded = Math.round(n * 1e9) / 1e9;
  if (Number.isInteger(rounded)) return String(rounded);
  const s = rounded.toFixed(8).replace(/\.?0+$/, '');
  return s === '-0' ? '0' : s;
}

/** 将 kHz 转为可读的单值（自动选 kHz / MHz / GHz）*/
function formatFrequencyFromKhz(khz: number): string {
  if (!Number.isFinite(khz)) return '-';
  const abs = Math.abs(khz);
  if (abs >= 1_000_000) return `${trimFreqNumber(khz / 1_000_000)} GHz`;
  if (abs >= 1000) return `${trimFreqNumber(khz / 1000)} MHz`;
  return `${trimFreqNumber(khz)} kHz`;
}

/** 起止频率同为 kHz，统一选一个单位展示区间 */
function formatFrequencyRangeFromKhz(startKhz: number, endKhz: number): string {
  if (!Number.isFinite(startKhz) || !Number.isFinite(endKhz)) return '-';
  const maxAbs = Math.max(Math.abs(startKhz), Math.abs(endKhz));
  if (maxAbs >= 1_000_000) {
    return `${trimFreqNumber(startKhz / 1_000_000)}–${trimFreqNumber(endKhz / 1_000_000)} GHz`;
  }
  if (maxAbs >= 1000) {
    return `${trimFreqNumber(startKhz / 1000)}–${trimFreqNumber(endKhz / 1000)} MHz`;
  }
  return `${trimFreqNumber(startKhz)}–${trimFreqNumber(endKhz)} kHz`;
}

function formatPlanningStepOrBandwidthFromKhz(khz: number | undefined): string {
  if (khz === undefined || khz === null || !Number.isFinite(Number(khz))) return '-';
  return formatFrequencyFromKhz(Number(khz));
}

/** 解析频率字符串，返回 kHz 单位的数字值*/
function parseFrequencyToKhz(value: string | number | undefined): number {
  if (value === undefined || value === null) return 0;
  const str = String(value).trim().toUpperCase();
  if (str === '') return 0;
  if (str.includes('GHZ')) return parseFloat(str.replace(/[^\d.]/g, '')) * 1_000_000;
  if (str.includes('MHZ')) return parseFloat(str.replace(/[^\d.]/g, '')) * 1_000;
  return parseFloat(str.replace(/[^\d.]/g, '')); // 默认 kHz
}

// --- API data transform helpers ---

function deriveStatus(level: string): { color: string; status: 'occupied' | 'free' | 'reserved' } {
  const map: Record<string, { color: string; status: 'occupied' | 'free' | 'reserved' }> = {
    'PRIMARY':     { color: '#2B7FFF', status: 'occupied' },
    'SECONDARY':   { color: '#27AE60', status: 'occupied' },
    'ALLOCATED':   { color: '#2563EB', status: 'occupied' },
    'RESERVED':    { color: '#8A8F98', status: 'reserved' },
    'UNALLOCATED': { color: '#E5E7EB', status: 'free' },
  };
  return map[level.toUpperCase()] ?? { color: '#6366F1', status: 'occupied' };
}

function radioservicesToCategory(radioservices: string): string {
  const rs = radioservices.toLowerCase();
  if (rs.includes('broadcast') || rs.includes('tv') || rs.includes('radio')) return 'Broadcasting';
  if (rs.includes('mobile') || rs.includes('cellular') || rs.includes('lte') || rs.includes('5g')) return 'Mobile Communication';
  if (rs.includes('emergency') || rs.includes('public safety') || rs.includes('rescue')) return 'Emergency Communication';
  if (rs.includes('fixed') || rs.includes('microwave') || rs.includes('point')) return 'Dedicated / Fixed Wireless';
  if (rs.includes('satellite') || rs.includes('vsat')) return 'Satellite';
  return 'Reserved / Free';
}

function radioservicesToColor(radioservices: string): string {
  const rs = radioservices.toLowerCase();
  if (rs.includes('broadcast') || rs.includes('tv') || rs.includes('radio')) return '#2B7FFF';
  if (rs.includes('mobile') || rs.includes('cellular') || rs.includes('lte') || rs.includes('5g')) return '#27AE60';
  if (rs.includes('emergency') || rs.includes('public safety')) return '#D64545';
  if (rs.includes('fixed') || rs.includes('microwave')) return '#F39C12';
  if (rs.includes('satellite')) return '#8E44AD';
  return '#9CA3AF';
}

function planningVOToSpectrumBlock(record: PlanningVO, index: number, allRecords: PlanningVO[]): SpectrumBlock {
  const { status } = deriveStatus(record.level ?? '');
  const serviceColor = radioservicesToColor(record.radioservices ?? '');
  const startKhz = parseFrequencyToKhz(record.startfrequency);
  const endKhz = parseFrequencyToKhz(record.stopfrequency);
  const width = endKhz - startKhz;
  const block: SpectrumBlock = {
    id: index + 1,
    band: record.radioservices ?? 'Unknown',
    range: record.segmentname?.trim()
      ? record.segmentname
      : formatFrequencyRangeFromKhz(startKhz, endKhz),
    start: startKhz,
    end: endKhz,
    width,
    status,
    color: serviceColor,
    label: record.radioservices ?? 'Unknown',
    level: record.level ?? '',
    subCategoryName: record.subservices ?? undefined,
    note: record.remark ?? '',
    stations: undefined,
    segments: undefined,
    step: record.step,
    bandwidth: record.bandwidth,
    stationCount: allRecords.filter(r => r.radioservices === record.radioservices).length,
  };
  return block;
}

const categoryColorMap: Record<string, string> = {
  'Broadcasting': '#2B7FFF', 'Mobile Communication': '#27AE60',
  'Emergency Communication': '#D64545', 'Dedicated / Fixed Wireless': '#F39C12',
  'Satellite': '#8E44AD', 'Reserved / Free': '#9CA3AF',
};
const categoryRangeMap: Record<string, string> = {
  'Broadcasting': 'Radio & TV services', 'Mobile Communication': 'Public cellular networks',
  'Emergency Communication': 'Public safety, rescue', 'Dedicated / Fixed Wireless': 'Microwave links',
  'Satellite': 'Space-ground services', 'Reserved / Free': 'Unallocated blocks',
};

const spectrumRows: SpectrumRowDef[] = [
  { title: '3–300 kHz', unit: 'kHz', khzStart: 3, khzEnd: 300 },
  { title: '300–3000 kHz', unit: 'kHz', khzStart: 300, khzEnd: 3000 },
  { title: '3–30 MHz', unit: 'MHz', khzStart: 3000, khzEnd: 30_000 },
  { title: '30–300 MHz', unit: 'MHz', khzStart: 30_000, khzEnd: 300_000 },
];

export function FrequencyPlanning() {
  // --- State ---
  const [viewMode, setViewMode] = useState<DetailView>('overview');
  const [selectedBlock, setSelectedBlock] = useState<SpectrumBlock | null>(null);
  const [showStationPanel, setShowStationPanel] = useState(false);
  const [stationFreqRange, setStationFreqRange] = useState('');
  const [planningRecords, setPlanningRecords] = useState<PlanningVO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // --- Fetch data ---
  useEffect(() => {
    setIsLoading(true);
    setApiError(null);
    planningApi.list()
      .then((response: any) => {
        const data = response?.data ?? response ?? {};
        const records = Array.isArray(data) ? data : (data.records ?? data.list ?? []);
        setPlanningRecords(records);
      })
      .catch((err: Error) => {
        setApiError(err.message ?? '加载频谱数据失败');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // --- Dynamic data derived from API ---
  const spectrumBlocks = useMemo(() => {
    if (planningRecords.length === 0) return [];
    const blocks = planningRecords.map((record, index) =>
      planningVOToSpectrumBlock(record, index, planningRecords),
    );
    return blocks.sort((a, b) => a.start - b.start);
  }, [planningRecords]);

  const categories = useMemo(() => {
    if (planningRecords.length === 0) return [];
    const group: Record<string, number> = {};
    planningRecords.forEach((record) => {
      const cat = radioservicesToCategory(record.radioservices ?? '');
      group[cat] = (group[cat] ?? 0) + 1;
    });
    return Object.entries(group).map(([name, count]) => ({
      name, range: categoryRangeMap[name] ?? '', color: categoryColorMap[name] ?? '#9CA3AF', count,
    }));
  }, [planningRecords]);

  const blocksByRow = useMemo(() => {
    return spectrumRows.map((row, rowIndex) => {
      const isLastRow = rowIndex === spectrumRows.length - 1;
      const rowBlocks = spectrumBlocks.filter((block) => {
        const midKhz = (block.start + block.end) / 2;
        if (midKhz < row.khzStart) return false;
        if (isLastRow) return midKhz <= row.khzEnd;
        return midKhz < row.khzEnd;
      });
      return { ...row, blocks: rowBlocks };
    });
  }, [spectrumBlocks]);

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
        bandwidth: selectedBlock ? formatPlanningStepOrBandwidthFromKhz(selectedBlock.bandwidth) : '-',
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

  const pageStations = filteredStationRecords;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold mb-1">Frequency Planning</h2>
          <p className="text-xs text-muted-foreground">Visual spectrum allocation map for Mongolia's radio resources</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => setViewMode('overview')} className={`px-4 py-2 rounded-lg transition-colors ${viewMode === 'overview' ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-muted'}`}>Overview</button>
        </div>
      </div>

      {viewMode === 'overview' && !selectedBlock && (
        <>
          {isLoading && (
            <div className="bg-card p-6 rounded-lg border border-border text-center py-12">
              <div className="text-muted-foreground">正在加载频谱数据...</div>
            </div>
          )}
          {apiError && (
            <div className="bg-card p-6 rounded-lg border border-red-200 bg-red-50">
              <div className="text-red-600">加载失败: {apiError}</div>
            </div>
          )}
          {!isLoading && !apiError && (
          <>
          <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div>
                <h3 className="text-base font-semibold">Spectrum Allocation Overview</h3>
                <p className="text-xs text-muted-foreground">Color blocks represent service types; blank areas indicate free or unassigned spectrum.</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-red-600">共 {planningRecords.length} 条</span>
              </div>
            </div>

            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="font-medium">{category.name}</span>
                      <span className="text-sm text-muted-foreground ml-3">{category.range}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">{category.count} bands</div>
                  </div>
                  <div className="h-8 bg-muted rounded-lg overflow-hidden flex items-center">
                    <div className="h-full flex items-center justify-center text-white text-sm font-medium transition-all cursor-pointer hover:opacity-80" style={{ backgroundColor: category.color, width: `${(category.count / 24) * 100}%` }}>
                      {category.count > 4 ? `${category.count} bands` : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border shadow-sm overflow-hidden">
            <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
              <div>
                <h3 className="text-lg font-semibold">National Spectrum Distribution Map</h3>
                <p className="text-xs text-muted-foreground">7-band layout inspired by the reference radio allocation chart. Width shows range, stacked height shows shared use.</p>
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

            <div className="space-y-2">
              {blocksByRow.map((row) => (
                <div key={row.title} className="flex gap-3 items-center">
                  <div className="text-xs font-medium text-muted-foreground w-[130px] shrink-0 self-center">{row.title}</div>
                  <div className="relative h-24 min-w-[600px] rounded-xl border border-slate-800 bg-slate-950 overflow-x-auto">
                    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,.08) 1px, transparent 1px)', backgroundSize: '8% 100%' }} />
                    <div className="relative h-full flex items-stretch gap-0 w-max">
                      {row.blocks.length > 0 ? row.blocks.map((block) => {
                        const hasSegments = block.segments && block.segments.length > 0;
                        const rowSpanKhz = Math.max(row.khzEnd - row.khzStart, 1);
                        const blockSpanKhz = Math.max(block.end - block.start, 1);
                        const widthPct = Math.min(100, Math.max((blockSpanKhz / rowSpanKhz) * 100, 3));
                        const isNarrowBlock = widthPct < 8;
                        return (
                        <button
                          key={block.id}
                          onClick={() => { setSelectedBlock(block); setViewMode('detail'); setStationPage(1); }}
                          className={`relative border-r border-white/15 transition-all hover:brightness-110 hover:shadow-2xl group overflow-hidden shrink-0 ${isNarrowBlock ? 'h-24 flex flex-col' : 'h-full'}`}
                          style={{ background: block.color, width: `${widthPct}%`, minWidth: isNarrowBlock ? '72px' : '56px' }}
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
                          ) : isNarrowBlock ? (
                            <div className="flex flex-col items-center justify-start h-full text-white text-[10px] leading-tight px-1 text-center font-semibold space-y-1">
                              <div className="font-bold truncate w-full">{block.label}</div>
                              <div className="opacity-90">{block.range}</div>
                              <div className="opacity-70">{block.status === 'free' ? 'FREE' : block.status.toUpperCase()}</div>
                            </div>
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-[11px] leading-tight px-2 text-center font-semibold">
                              <div className="flex items-center gap-1 text-xs mb-1">{block.icons?.map((i) => <span key={i}>{i}</span>)}<span>{block.label}</span></div>
                              <div className="text-[10px] opacity-95">{block.range}</div>
                            </div>
                          )}
                          {!isNarrowBlock && <div className="absolute bottom-1 right-2 text-[10px] bg-black/20 px-1 rounded text-white/95">{block.status === 'free' ? 'FREE' : block.status.toUpperCase()}</div>}
                          <div className="absolute top-1 left-2 hidden group-hover:block text-[10px] bg-black/80 text-white px-2 py-1 rounded whitespace-nowrap z-10">Click for details</div>
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
                  <div className="text-right text-xs text-muted-foreground w-[90px] shrink-0 self-center">{row.unit}</div>
                </div>
              ))}
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <div className="text-xs">White space = unassigned spectrum</div>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#2B7FFF] rounded" /><span>Occupied</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#9CA3AF] rounded" /><span>Reserved</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-white border border-border rounded" /><span>Free</span></div>
              </div>
            </div>
          </div>
          </>
          )}
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
              <div className="rounded-lg bg-white/35 p-3"><div className="text-black/70">Category</div><div className="font-medium text-black">{selectedBlock.label}</div></div>
              <div className="rounded-lg bg-white/35 p-3"><div className="text-black/70">Subcategory</div><div className="font-medium text-black">{selectedBlock.subCategoryName ?? '-'}</div></div>
              <div className="rounded-lg bg-white/35 p-3"><div className="text-black/70">Level</div><div className="font-medium text-black capitalize">{selectedBlock.level}</div></div>
              <div className="rounded-lg bg-white/35 p-3"><div className="text-black/70">Band Name</div><div className="font-medium text-black">{selectedBlock.band}</div></div>
              <div className="rounded-lg bg-white/35 p-3"><div className="text-black/70">Start Frequency</div><div className="font-medium text-black">{formatFrequencyFromKhz(selectedBlock.start)}</div></div>
              <div className="rounded-lg bg-white/35 p-3"><div className="text-black/70">End Frequency</div><div className="font-medium text-black">{formatFrequencyFromKhz(selectedBlock.end)}</div></div>
              <div className="rounded-lg bg-white/35 p-3"><div className="text-black/70">Step</div><div className="font-medium text-black">{formatPlanningStepOrBandwidthFromKhz(selectedBlock.step)}</div></div>
              <div className="rounded-lg bg-white/35 p-3"><div className="text-black/70">Signal Bandwidth</div><div className="font-medium text-black">{formatPlanningStepOrBandwidthFromKhz(selectedBlock.bandwidth)}</div></div>
              <div className="rounded-lg bg-white/35 p-3"><div className="text-black/70">Notes</div><div className="font-medium text-black">{selectedBlock.note}</div></div>
              <div className="rounded-lg bg-white/35 p-3"><div className="text-black/70">Station Count</div><button onClick={() => setShowStationPanel(true)} className="font-medium text-black underline decoration-dotted underline-offset-4">{selectedBlock.stationCount}</button></div>
              <div className="rounded-lg bg-white/35 p-3"><div className="text-black/70">Occupied</div><div className="font-medium text-black">{selectedBlock.status}</div></div>
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
                <div className="rounded-2xl bg-white/80 border border-sky-100 shadow-sm p-4 md:col-span-3">
                  <div className="text-gray-500">Frequency Range Query</div>
                  <input
                    type="text"
                    value={stationFreqRange}
                    onChange={(e) => setStationFreqRange(e.target.value)}
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
                    {pageStations.map((station, index) => (
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

          </div>
        </div>
      )}

    </div>
  );
}

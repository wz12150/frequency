import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BadgeInfo, ChevronLeft, ChevronRight, Edit, FileDown, FileUp, Info, Plus, RadioTower, ShieldAlert, Satellite, X } from 'lucide-react';
import { planningApi, PlanningVO } from '../api/planning';
import { dictTypeApi, dictDataApi, type DictData } from '../api/system';
import { PlanningForm, type FrequencyBand } from './PlanningForm';

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
  guid: string;
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
  /** 业务类型，从数据字典 ServiceType 获取 */
  serviceType?: string;
  /** 频段类型，从数据字典 BandType 获取 */
  bandType?: string;
};

/** 垂直堆叠层的渲染单元：同一个 band 名称的多个块堆叠显示 */
type LayeredBlock = {
  band: string;           // band 名称（与 SpectrumBlock.band 相同）
  layers: SpectrumBlock[]; // 该层的所有业务块（通常 1 个，冲突时多个）
  widthPct: number;       // 宽度百分比
  startKhz: number;       // 起始频率 kHz
  endKhz: number;         // 终止频率 kHz
  color: string;          // 业务类型颜色（取自第一个 layer）
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

/** 根据字典数据的 value 获取对应的 label */
function getDictLabel(options: DictData[], value: string | undefined): string {
  if (!value) return '-';
  const item = options.find(opt => opt.value === value);
  return item?.label ?? value;
}

/** 将同一 row 中的 blocks 按起始/终止频率分组，相同频率范围的多个块垂直堆叠 */
function groupBlocksIntoLayers(blocks: SpectrumBlock[], rowStartKhz: number, rowEndKhz: number): LayeredBlock[] {
  const rowSpanKhz = rowEndKhz - rowStartKhz;

  // 按 起始频率+终止频率 分组（相同频段）
  const freqGroups = new Map<string, SpectrumBlock[]>();
  blocks.forEach(block => {
    // 使用 start 和 end 作为唯一标识
    const key = `${block.start}-${block.end}`;
    if (!freqGroups.has(key)) {
      freqGroups.set(key, []);
    }
    freqGroups.get(key)!.push(block);
  });

  const layeredBlocks: LayeredBlock[] = [];

  freqGroups.forEach((groupBlocks, freqKey) => {
    // 按起始频率排序
    const sorted = [...groupBlocks].sort((a, b) => a.start - b.start);

    if (sorted.length === 1) {
      // 只有一个块，直接作为单层
      const block = sorted[0];
      const blockSpanKhz = block.end - block.start;
      // 宽度按占该行总范围的比例计算
      const widthPct = Math.max(2, Math.min(100, (blockSpanKhz / rowSpanKhz) * 100));
      layeredBlocks.push({
        band: block.band,
        layers: [block],
        widthPct,
        startKhz: block.start,
        endKhz: block.end,
        color: block.color,
      });
    } else {
      // 多个块（同一频段多个业务）：垂直堆叠
      const block = sorted[0];
      const blockSpanKhz = block.end - block.start;
      const widthPct = Math.max(2, Math.min(100, (blockSpanKhz / rowSpanKhz) * 100));
      layeredBlocks.push({
        band: block.band,
        layers: sorted,
        widthPct,
        startKhz: block.start,
        endKhz: block.end,
        color: sorted[0].color,
      });
    }
  });

  return layeredBlocks;
}

/** 解析频率字符串，返回 kHz 单位的数字值
 * 导入时频率单位为 MHz（Excel 中不带单位后缀），所以纯数字默认按 MHz 处理
 */
function parseFrequencyToKhz(value: string | number | undefined): number {
  if (value === undefined || value === null) return 0;
  const str = String(value).trim().toUpperCase();
  if (str === '') return 0;
  if (str.includes('GHZ')) return parseFloat(str.replace(/[^\d.]/g, '')) * 1_000_000;
  if (str.includes('MHZ')) return parseFloat(str.replace(/[^\d.]/g, '')) * 1_000;
  // 导入时单位为 MHz，纯数字默认按 MHz 处理
  const num = parseFloat(str.replace(/[^\d.]/g, ''));
  return num * 1_000; // MHz → kHz
}

// --- API data transform helpers ---

function deriveStatus(level: string): { color: string; status: 'occupied' | 'free' | 'reserved' } {
  const levelUpper = level.toUpperCase();
  if (levelUpper === 'NOT ALLOCATED' || levelUpper === 'UNALLOCATED' || levelUpper === 'FREE') {
    return { color: '#9CA3AF', status: 'free' };
  }
  const map: Record<string, { color: string; status: 'occupied' | 'free' | 'reserved' }> = {
    'PRIMARY':     { color: '#2B7FFF', status: 'occupied' },
    'SECONDARY':   { color: '#27AE60', status: 'occupied' },
    'ALLOCATED':   { color: '#2563EB', status: 'occupied' },
    'RESERVED':    { color: '#8A8F98', status: 'reserved' },
  };
  return map[levelUpper] ?? { color: '#9CA3AF', status: 'free' };
}

function radioservicesToCategory(radioservices: string): string {
  const rs = radioservices.toLowerCase();
  if (rs.includes('broadcast') || rs.includes('tv') || rs.includes('radio')) return 'Broadcasting';
  if (rs.includes('mobile') || rs.includes('cellular') || rs.includes('lte') || rs.includes('5g')) return 'Mobile Communication';
  if (rs.includes('emergency') || rs.includes('public safety') || rs.includes('rescue')) return 'Emergency Communication';
  if (rs.includes('maritime')) return 'Maritime Communication';
  if (rs.includes('fixed') || rs.includes('microwave') || rs.includes('point')) return 'Dedicated / Fixed Wireless';
  if (rs.includes('satellite') || rs.includes('vsat')) return 'Satellite';
  return 'Reserved / Free';
}

function radioservicesToColor(radioservices: string): string {
  const rs = radioservices.toLowerCase();
  if (rs.includes('broadcast') || rs.includes('tv') || rs.includes('radio')) return '#2B7FFF';
  if (rs.includes('mobile') || rs.includes('cellular') || rs.includes('lte') || rs.includes('5g')) return '#27AE60';
  if (rs.includes('emergency') || rs.includes('public safety')) return '#D64545';
  if (rs.includes('maritime')) return '#00BFA5';
  if (rs.includes('fixed') || rs.includes('microwave')) return '#F39C12';
  if (rs.includes('satellite')) return '#8E44AD';
  return ''; // 空字符串表示未匹配，需要兜底颜色
}

const serviceTypeColors = [
  '#2B7FFF', '#27AE60', '#D64545', '#F39C12',
  '#8E44AD', '#00BFA5', '#FF6B9D', '#00BFA5',
  '#FFB300', '#7C4DFF', '#00ACC1', '#F06292',
];

function planningVOToSpectrumBlock(
  record: PlanningVO,
  index: number,
  allRecords: PlanningVO[],
  serviceTypeColorMap: Record<string, string>,
): SpectrumBlock {
  const { status } = deriveStatus(record.level ?? '');
  const levelUpper = (record.level ?? '').toUpperCase();
  const startKhz = parseFrequencyToKhz(record.startfrequency);
  const endKhz = parseFrequencyToKhz(record.stopfrequency);
  const serviceColor = (() => {
    // Free / Unallocated / Reserved / Not Allocated 明确用灰色（与图例一致）
    const normalizedLevel = levelUpper.replace(/[-_]/g, ' ');
    const radiosUpper = (record.radioservices ?? '').toUpperCase().replace(/[-_]/g, ' ');
    // MF (300-3000 kHz) 频段跟随 Free 的颜色逻辑
    if (normalizedLevel === 'UNALLOCATED' || normalizedLevel === 'RESERVED' || normalizedLevel === 'NOT ALLOCATED' || normalizedLevel === 'FREE' || normalizedLevel === 'NO ALLOCATED' || radiosUpper === 'NOT ALLOCATED' || radiosUpper === 'FREE') return '#9CA3AF';
    const st = record.serviceType;
    if (st && st.trim() && serviceTypeColorMap[st]) return serviceTypeColorMap[st];
    const rc = radioservicesToColor(record.radioservices ?? '');
    if (rc && rc.trim()) return rc;
    return '#8B7355';
  })();
  const width = endKhz - startKhz;
  const block: SpectrumBlock = {
    id: index + 1,
    guid: record.guid,
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
    serviceType: record.serviceType,
    bandType: record.bandType,
  };
  return block;
}

const categoryColorMap: Record<string, string> = {
  'Broadcasting': '#2B7FFF', 'Mobile Communication': '#27AE60',
  'Emergency Communication': '#D64545', 'Maritime Communication': '#00BFA5',
  'Dedicated / Fixed Wireless': '#F39C12',
  'Satellite': '#8E44AD', 'Reserved / Free': '#9CA3AF',
};
const categoryRangeMap: Record<string, string> = {
  'Broadcasting': 'Radio & TV services', 'Mobile Communication': 'Public cellular networks',
  'Emergency Communication': 'Public safety, rescue', 'Maritime Communication': 'Maritime mobile services',
  'Dedicated / Fixed Wireless': 'Microwave links',
  'Satellite': 'Space-ground services', 'Reserved / Free': 'Unallocated blocks',
};

const defaultSpectrumRows: SpectrumRowDef[] = [
  { title: 'VLF (3–30 kHz)', unit: 'kHz', khzStart: 3, khzEnd: 30 },
  { title: 'LF (30–300 kHz)', unit: 'kHz', khzStart: 30, khzEnd: 300 },
  { title: 'MF (300–3000 kHz)', unit: 'kHz', khzStart: 300, khzEnd: 3000 },
  { title: 'HF (3–30 MHz)', unit: 'MHz', khzStart: 3000, khzEnd: 30_000 },
  { title: 'VHF (30–300 MHz)', unit: 'MHz', khzStart: 30_000, khzEnd: 300_000 },
  { title: 'UHF (300–3000 MHz)', unit: 'MHz', khzStart: 300_000, khzEnd: 3_000_000 },
  { title: 'SHF (3–30 GHz)', unit: 'GHz', khzStart: 3_000_000, khzEnd: 30_000_000 },
  { title: 'EHF (30–300 GHz)', unit: 'GHz', khzStart: 30_000_000, khzEnd: 300_000_000 },
  { title: 'THF (300–3000 GHz)', unit: 'GHz', khzStart: 300_000_000, khzEnd: 3_000_000_000 },
];

export function FrequencyPlanning() {
  // --- State ---
  const [viewMode, setViewMode] = useState<DetailView>('overview');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [hoveredBlock, setHoveredBlock] = useState<{ range: string; radioservices: string } | null>(null);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [selectedBlock, setSelectedBlock] = useState<SpectrumBlock | null>(null);
  const [showStationPanel, setShowStationPanel] = useState(false);
  const [stationFreqRange, setStationFreqRange] = useState('');
  const [stationPage, setStationPage] = useState(1);
  const [planningRecords, setPlanningRecords] = useState<PlanningVO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [serviceTypeOptions, setServiceTypeOptions] = useState<DictData[]>([]);
  const [bandTypeOptions, setBandTypeOptions] = useState<DictData[]>([]);
  const [planningDialogMode, setPlanningDialogMode] = useState<'add' | 'edit' | null>(null);
  const [planningFormRecord, setPlanningFormRecord] = useState<FrequencyBand | null>(null);

  // --- Helper: convert PlanningVO to FrequencyBand ---
  const convertToFrequencyBand = (vo: PlanningVO): FrequencyBand => ({
    guid: vo.guid,
    category: vo.radioservices,
    subCategory: vo.subservices,
    service: vo.level,
    bandName: vo.segmentname,
    startFreq: vo.startfrequency as number,
    endFreq: vo.stopfrequency as number,
    step: vo.step,
    bandwidth: vo.bandwidth,
    status: 'free' as const,
    note: vo.remark || '',
    serviceType: vo.serviceType,
    bandType: vo.bandType,
  });

  // --- Helper: convert FrequencyBand to Partial<PlanningVO> ---
  const convertToPlanningVO = (fb: FrequencyBand): Partial<PlanningVO> => ({
    guid: fb.guid,
    radioservices: fb.category,
    subservices: fb.subCategory,
    level: fb.service,
    segmentname: fb.bandName,
    startfrequency: fb.startFreq,
    stopfrequency: fb.endFreq,
    step: fb.step,
    bandwidth: fb.bandwidth,
    remark: fb.note,
    serviceType: fb.serviceType,
    bandType: fb.bandType,
  });

  // --- Open edit dialog ---
  const openPlanningEdit = (record: FrequencyBand) => {
    setPlanningFormRecord(record);
    setPlanningDialogMode('edit');
  };

  // --- Save planning edit ---
  const savePlanningEdit = async () => {
    if (!planningFormRecord) return;
    if (!planningFormRecord.category || !planningFormRecord.subCategory || !planningFormRecord.service || planningFormRecord.startFreq === 0 || planningFormRecord.endFreq === 0) {
      alert('Please fill in all required fields: Category, Subcategory, Level, Start Frequency, End Frequency');
      return;
    }
    try {
      const vo = convertToPlanningVO(planningFormRecord);
      await planningApi.update(planningFormRecord.guid, {
        radioservices: vo.radioservices,
        subservices: vo.subservices,
        level: vo.level,
        segmentname: vo.segmentname,
        startfrequency: vo.startfrequency,
        stopfrequency: vo.stopfrequency,
        step: vo.step,
        bandwidth: vo.bandwidth,
        remark: vo.remark,
        serviceType: vo.serviceType,
        bandType: vo.bandType,
      });
      // Refresh data
      const response: any = await planningApi.list();
      const data = response?.data ?? response ?? {};
      const records = Array.isArray(data) ? data : (data.records ?? data.list ?? []);
      setPlanningRecords(records);
      setPlanningDialogMode(null);
      setPlanningFormRecord(null);
    } catch (err: any) {
      alert(err.message ?? '保存失败');
    }
  };

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

  // --- Fetch dict data for ServiceType and BandType ---
  useEffect(() => {
    const loadDictData = async () => {
      try {
        // 获取所有字典类型
        const typeResult = await dictTypeApi.list();
        const dictTypes = (typeResult as any)?.data ?? typeResult ?? [];

        // 查找 ServiceType 和 BandType 的 typeId
        const serviceTypeDict = dictTypes.find((d: any) => d.code === 'service_type');
        const bandTypeDict = dictTypes.find((d: any) => d.code === 'freq_band');

        // 并行获取字典数据
        const promises = [];
        if (serviceTypeDict?.guid) {
          promises.push(dictDataApi.list(serviceTypeDict.guid).then((res: any) => {
            const data = res?.data ?? res ?? [];
            setServiceTypeOptions(Array.isArray(data) ? data : data.records ?? []);
          }));
        }
        if (bandTypeDict?.guid) {
          promises.push(dictDataApi.list(bandTypeDict.guid).then((res: any) => {
            const data = res?.data ?? res ?? [];
            setBandTypeOptions(Array.isArray(data) ? data : data.records ?? []);
          }));
        }
        await Promise.all(promises);
      } catch (err) {
        console.error('加载数据字典失败:', err);
      }
    };
    loadDictData();
  }, []);

  // --- Dynamic data derived from API ---
  const serviceTypeColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    serviceTypeOptions.forEach((opt, idx) => {
      map[opt.value] = serviceTypeColors[idx % serviceTypeColors.length];
    });
    return map;
  }, [serviceTypeOptions]);

  const spectrumBlocks = useMemo(() => {
    if (planningRecords.length === 0) return [];
    const blocks = planningRecords.map((record, index) =>
      planningVOToSpectrumBlock(record, index, planningRecords, serviceTypeColorMap),
    );
    return blocks.sort((a, b) => a.start - b.start);
  }, [planningRecords, serviceTypeColorMap]);

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

  // 根据频段类型字典动态生成频段行标签
  const spectrumRows = useMemo(() => {
    if (bandTypeOptions.length === 0) return defaultSpectrumRows;
    return defaultSpectrumRows.map((row) => {
      // 尝试根据频率范围匹配 BandType 字典
      const matched = bandTypeOptions.find((opt) => {
        const label = opt.label ?? '';
        // 匹配如 "LW"、"MW"、"SW"、"VHF" 等缩写
        return (
          (row.khzStart >= 3 && row.khzEnd <= 300 && /^(LF|LW|Long\s*Wave)/i.test(label)) ||
          (row.khzStart >= 300 && row.khzEnd <= 3000 && /^(MF|MW|Medium\s*Wave)/i.test(label)) ||
          (row.khzStart >= 3000 && row.khzEnd <= 30000 && /^(HF|SW|Short\s*Wave)/i.test(label)) ||
          (row.khzStart >= 30000 && row.khzEnd <= 300000 && /^(VHF|Very\s*High)/i.test(label))
        );
      });
      if (matched) {
        return { ...row, title: `${matched.label} (${row.title.split('(')[1]}` };
      }
      return row;
    });
  }, [bandTypeOptions]);

  const blocksByRow = useMemo(() => {
    return spectrumRows.map((row, rowIndex) => {
      const isLastRow = rowIndex === spectrumRows.length - 1;
      const rowBlocks = spectrumBlocks.filter((block) => {
        const midKhz = (block.start + block.end) / 2;
        if (midKhz < row.khzStart) return false;
        if (isLastRow) return midKhz <= row.khzEnd;
        return midKhz < row.khzEnd;
      });
      // 将同 band 的块分组为垂直堆叠层
      const layeredBlocks = groupBlocksIntoLayers(rowBlocks, row.khzStart, row.khzEnd);
      return { ...row, blocks: rowBlocks, layeredBlocks };
    });
  }, [spectrumBlocks, spectrumRows]);

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
    <div className="space-y-3 overflow-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
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
                {serviceTypeOptions.length > 0 ? (
                  serviceTypeOptions.map((opt, idx) => (
                    <span key={opt.value} className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded" style={{ backgroundColor: serviceTypeColors[idx % serviceTypeColors.length] }} />
                      {opt.label}
                    </span>
                  ))
                ) : (
                  <>
                    <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#2B7FFF]" />Broadcast</span>
                    <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#27AE60]" />Mobile</span>
                    <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#D64545]" />Emergency</span>
                    <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#F39C12]" />Fixed</span>
                    <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#8E44AD]" />Satellite</span>
                    <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#9CA3AF]" />Free</span>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2 mr-4">
              {blocksByRow.map((row) => (
                <div key={row.title} className="flex gap-3 items-center">
                  <div className="text-xs font-medium text-muted-foreground w-[130px]">{row.title}</div>
                  <div
                      className="relative mr-2 rounded-xl border border-slate-800 overflow-hidden"
                      style={{ height: '128px', width: '100%', backgroundColor: !(row.layeredBlocks && row.layeredBlocks.length > 0) ? '#D1D5DB' : '#0f172a' }}
                    >
                    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,.08) 1px, transparent 1px)', backgroundSize: '8% 100%' }} />
                    <div className="relative h-full flex items-stretch gap-0 w-full overflow-hidden">
                      {/* 按频率顺序渲染所有块和Free区域 */}
                      {(() => {
                        if (!row.blocks || row.blocks.length === 0) return null;

                        const totalRangeKhz = row.khzEnd - row.khzStart;
                        const sortedLayered = [...(row.layeredBlocks || [])].sort((a, b) => a.startKhz - b.startKhz);

                        // 构建所有段（块和Free区域）
                        const segments: { type: 'block' | 'free'; start: number; end: number; layeredIdx?: number }[] = [];
                        let currentKhz = row.khzStart;

                        // 遍历sortedLayered，按顺序插入块和间隙
                        for (let i = 0; i < sortedLayered.length; i++) {
                          const layer = sortedLayered[i];
                          // 跳过完全在行范围外的块
                          if (layer.endKhz <= row.khzStart || layer.startKhz >= row.khzEnd) continue;
                          // 如果块超出范围，裁剪到行范围内
                          const blockStart = Math.max(layer.startKhz, row.khzStart);
                          const blockEnd = Math.min(layer.endKhz, row.khzEnd);
                          // 如果有间隙（Free区域）
                          if (blockStart > currentKhz) {
                            segments.push({ type: 'free', start: currentKhz, end: blockStart });
                          }
                          // 添加块
                          segments.push({ type: 'block', start: blockStart, end: blockEnd, layeredIdx: i });
                          currentKhz = blockEnd;
                        }

                        // 末尾Free区域
                        if (currentKhz < row.khzEnd) {
                          segments.push({ type: 'free', start: currentKhz, end: row.khzEnd });
                        }

                        return (
                          <>
                            {segments.map((seg, idx) => {
                              const segEnd = Math.min(seg.end, row.khzEnd);
                              const segRangeKhz = segEnd - seg.start;
                              const widthPct = (segRangeKhz / totalRangeKhz) * 100;

                              if (seg.type === 'free') {
                                return (
                                  <div
                                    key={`free-${idx}`}
                                    className="relative shrink-0 overflow-visible cursor-default"
                                    style={{ width: `${widthPct}%`, backgroundColor: '#9CA3AF' }}
                                    onMouseEnter={(e) => { setHoveredRow(row.title); setHoveredBlock({ range: 'Free', radioservices: `${formatFrequencyRangeFromKhz(seg.start, Math.min(seg.end, row.khzEnd))}` }); setMouseX(e.clientX); setMouseY(e.clientY); }}
                                    onMouseLeave={() => { setHoveredRow(null); }}
                                  />
                                );
                              }

                              // 渲染业务块
                              const layeredBlock = sortedLayered[seg.layeredIdx!];
                              const { layers, color } = layeredBlock;
                              const isMultiLayer = layers.length > 1;

                              return (
                                <div key={`layered-${seg.layeredIdx}`} className="relative shrink-0 overflow-visible" style={{ width: `${widthPct}%` }}>
                                  <div className="relative w-full h-full">
                                    {layers.map((block, layerIndex) => {
                                      const layerHeightPct = isMultiLayer ? `${100 / layers.length}%` : '100%';
                                      const layerTop = isMultiLayer ? `${(layerIndex / layers.length) * 100}%` : '0%';
                                      return (
                                        <button
                                          key={block.id}
                                          onClick={() => { setSelectedBlock(block); setViewMode('detail'); setStationPage(1); }}
                                          onMouseEnter={(e) => { setHoveredRow(row.title); setHoveredBlock({ range: block.range, radioservices: block.label }); setMouseX(e.clientX); setMouseY(e.clientY); }}
                                          onMouseLeave={() => { setHoveredRow(null); setHoveredBlock(null); }}
                                          className="absolute left-0 right-0 transition-all hover:brightness-110"
                                          style={{ backgroundColor: block.color, height: layerHeightPct, top: layerTop }}
                                        />
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </>
                        );
                      })()}
                    </div>
                    <div className="absolute left-3 right-3 bottom-0 h-6 flex items-center justify-between text-[10px] text-slate-200/80">
                      <span>Start</span>
                      <span>End</span>
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground w-[90px] self-center">{row.unit}</div>
                </div>
              ))}
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
              <button onClick={() => {
                const vo = planningRecords.find(r => r.guid === selectedBlock.guid);
                if (vo) {
                  openPlanningEdit(convertToFrequencyBand(vo));
                }
              }} className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-2"><Edit className="w-4 h-4" />Edit</button>
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
              <div className="rounded-lg bg-white/35 p-3"><div className="text-black/70">Service Type</div><div className="font-medium text-black">{getDictLabel(serviceTypeOptions, selectedBlock.serviceType)}</div></div>
              <div className="rounded-lg bg-white/35 p-3"><div className="text-black/70">Band Type</div><div className="font-medium text-black">{getDictLabel(bandTypeOptions, selectedBlock.bandType)}</div></div>
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

      {hoveredRow && (
        <div
          className="fixed bg-slate-900 text-white text-xs px-3 py-2 rounded shadow-xl whitespace-nowrap z-50 pointer-events-none"
          style={{
            left: mouseX,
            top: mouseY - 40,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="text-center">
            <div className="font-semibold text-sm">
              {hoveredBlock?.radioservices ?? '-'}
            </div>
            <div className="text-[10px] opacity-80">
              {hoveredBlock?.range ?? '-'}
            </div>
          </div>
        </div>
      )}

      {planningDialogMode && planningFormRecord && (
        <PlanningForm
          title={planningDialogMode === 'add' ? 'Add Frequency Planning Band' : 'Edit Planning Data'}
          description={planningDialogMode === 'add' ? 'Create a new planning record for the table.' : 'Update the selected planning record.'}
          value={planningFormRecord}
          onChange={(data) => setPlanningFormRecord(data)}
          onClose={() => { setPlanningDialogMode(null); setPlanningFormRecord(null); }}
          onSubmit={savePlanningEdit}
          submitLabel={planningDialogMode === 'add' ? 'Add Band' : 'Save Changes'}
          serviceTypeOptions={serviceTypeOptions}
          bandTypeOptions={bandTypeOptions}
        />
      )}

    </div>
  );
}

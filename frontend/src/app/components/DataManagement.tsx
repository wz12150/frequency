import { useMemo, useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Plus, Edit, Trash2, FileUp, FileDown, X, Upload, Download, Search, Eye, ArrowLeft, ChevronRight, Info, MapPin } from 'lucide-react';
import { DatePicker } from './ui/date-picker';
import { RecordDetailCard } from './RecordDetailCard';
import { LicenseDetail } from './LicenseDetail';
import { LicenseForm } from './LicenseForm';
import { CoordinatePicker } from './CoordinatePicker';
import { planningApi, PlanningVO } from '../api/planning';
import { stationApi } from '../api/station';
import { permitApi, PermitVO } from '../api/permit';
import { dictTypeApi, dictDataApi, type DictData } from '../api/system';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from './ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

type DataTab = 'station' | 'license' | 'planning';

type StationRecord = {
  id: string;
  name: string;
  frequencyLicense?: string;
  type: string;
  region: string;
  province?: string;
  detailedLocation?: string;
  frequency: string;
  receiveFrequency?: string;
  status: 'normal' | 'expiring' | 'expired';
  openDate?: string;
  expireDate: string;
  latitude?: string;
  longitude?: string;
  power?: string;
  antenna?: string;
  equipmentCount?: string;
  equipmentPower?: string;
  technicalStandard?: string;
  bandwidth?: string;
  bandwidthProcessingUnitModel?: string;
  ownerName?: string;
  ownedsite?: string;
  bbuModel?: string;
  backhaulNetworkAccessMethod?: string;
  stationPurpose?: string;
  modulationType?: string;
  antennaCount?: string;
  equipmentNameAndModel?: string;
};

type LicenseRecord = {
  guid: string;
  id: string;
  number: string;
  organization: string;
  station: string;
  frequency: string;
  type: string;
  power: string;
  status: 'normal' | 'expiring' | 'expired';
  startDate: string;
  endDate: string;
  licenseAuthorization?: string;
  unit?: string;
  category?: string;
  law?: string;
  coverage?: string;
  process?: string;
  code?: string;
  decisionDate?: string;
  decision?: string;
  description?: string;
  registration?: string;
  address?: string;
  phone?: string;
  email?: string;
  administrativeInfo?: string;
  contactPerson?: string;
};

type FrequencyBand = {
  guid: string;
  category: string;
  subCategory: string;
  service: string;
  bandName: string;
  startFreq: number;
  endFreq: number;
  step: number;
  bandwidth: number;
  status: 'occupied' | 'free';
  note: string;
  /** 业务类型，从数据字典 ServiceType 获取 */
  serviceType?: string;
  /** 频段类型，从数据字典 BandType 获取 */
  bandType?: string;
};

const convertToFrequencyBand = (vo: PlanningVO): FrequencyBand => ({
  guid: vo.guid,
  category: vo.radioservices,
  subCategory: vo.subservices,
  service: vo.level,
  bandName: vo.segmentname,
  startFreq: vo.startfrequency,
  endFreq: vo.stopfrequency,
  step: vo.step,
  bandwidth: vo.bandwidth,
  status: 'free' as const,
  note: vo.remark || '',
  serviceType: vo.serviceType,
  bandType: vo.bandType,
});

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

/** 根据 radioservices 文本匹配 ServiceType 字典的 value */
function matchServiceType(radioservices: string, serviceTypeOptions: DictData[]): string | undefined {
  if (!radioservices || serviceTypeOptions.length === 0) return undefined;
  const lower = radioservices.toLowerCase();
  // 精确匹配 label
  const exact = serviceTypeOptions.find(opt => opt.label.toLowerCase() === lower);
  if (exact) return exact.value;
  // 包含匹配 label
  const partial = serviceTypeOptions.find(opt => lower.includes(opt.label.toLowerCase()) || opt.label.toLowerCase().includes(lower));
  if (partial) return partial.value;
  // 业务类型关键词匹配
  if (lower.includes('broadcast') || lower.includes('tv') || lower.includes('radio')) {
    const found = serviceTypeOptions.find(opt => opt.label.toLowerCase().includes('broadcast') || opt.label.toLowerCase().includes('tv'));
    if (found) return found.value;
  }
  if (lower.includes('mobile') || lower.includes('cellular') || lower.includes('lte') || lower.includes('5g')) {
    const found = serviceTypeOptions.find(opt => opt.label.toLowerCase().includes('mobile'));
    if (found) return found.value;
  }
  if (lower.includes('emergency') || lower.includes('public safety') || lower.includes('rescue')) {
    const found = serviceTypeOptions.find(opt => opt.label.toLowerCase().includes('emergency'));
    if (found) return found.value;
  }
  if (lower.includes('fixed') || lower.includes('microwave') || lower.includes('point')) {
    const found = serviceTypeOptions.find(opt => opt.label.toLowerCase().includes('fixed') || opt.label.toLowerCase().includes('microwave'));
    if (found) return found.value;
  }
  if (lower.includes('satellite') || lower.includes('vsat')) {
    const found = serviceTypeOptions.find(opt => opt.label.toLowerCase().includes('satellite'));
    if (found) return found.value;
  }
  return undefined;
}

/** 根据频段范围（MHz）匹配 BandType 字典的 value */
function matchBandType(startFreqMHz: number, endFreqMHz: number, bandTypeOptions: DictData[]): string | undefined {
  if (!endFreqMHz || bandTypeOptions.length === 0) return undefined;
  const midFreq = (startFreqMHz + endFreqMHz) / 2;
  // 尝试精确匹配
  for (const opt of bandTypeOptions) {
    const labelLower = opt.label.toLowerCase();
    // 匹配频段关键词
    if (labelLower.includes('lf') || labelLower.includes('low frequency')) {
      if (midFreq >= 30 && midFreq <= 300) return opt.value;
    }
    if (labelLower.includes('mf') || labelLower.includes('medium frequency')) {
      if (midFreq >= 300 && midFreq <= 3000) return opt.value;
    }
    if (labelLower.includes('hf') || labelLower.includes('high frequency')) {
      if (midFreq >= 3_000 && midFreq <= 30_000) return opt.value;
    }
    if (labelLower.includes('vhf') || labelLower.includes('very high frequency')) {
      if (midFreq >= 30_000 && midFreq <= 300_000) return opt.value;
    }
    if (labelLower.includes('uhf') || labelLower.includes('ultra high frequency')) {
      if (midFreq >= 300_000 && midFreq <= 3_000_000) return opt.value;
    }
    if (labelLower.includes('shf') || labelLower.includes('super high frequency')) {
      if (midFreq >= 3_000_000 && midFreq <= 30_000_000) return opt.value;
    }
    if (labelLower.includes('ehf') || labelLower.includes('extremely high frequency')) {
      if (midFreq >= 30_000_000) return opt.value;
    }
    // 匹配 L/S/C/Ku/Ka 等频段名称
    if (labelLower.includes('l-band') && midFreq >= 1_000_000 && midFreq <= 2_000_000) return opt.value;
    if (labelLower.includes('s-band') && midFreq >= 2_000_000 && midFreq <= 4_000_000) return opt.value;
    if (labelLower.includes('c-band') && midFreq >= 4_000_000 && midFreq <= 8_000_000) return opt.value;
    if (labelLower.includes('x-band') && midFreq >= 8_000_000 && midFreq <= 12_000_000) return opt.value;
    if (labelLower.includes('ku') && midFreq >= 10_700_000 && midFreq <= 14_500_000) return opt.value;
    if (labelLower.includes('ka') && midFreq >= 26_500_000 && midFreq <= 40_000_000) return opt.value;
    if (labelLower.includes('k') && midFreq >= 18_000_000 && midFreq <= 27_000_000) return opt.value;
  }
  return undefined;
}

function mapPermitVoToLicenseRecord(r: PermitVO): LicenseRecord {
  const now = new Date();
  const endDate = r.enddate ? new Date(r.enddate) : null;
  const warning = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  let status: 'normal' | 'expiring' | 'expired' = 'normal';
  if (endDate) {
    if (endDate < now) status = 'expired';
    else if (endDate < warning) status = 'expiring';
  }
  return {
    guid: r.guid,
    id: r.guid,
    number: r.code ?? '',
    organization: r.interlocutor ?? '',
    station: r.scope ?? '',
    frequency: r.scope ?? '',
    type: r.type ?? '',
    power: '',
    status,
    startDate: r.startdate ?? '',
    endDate: r.enddate ?? '',
    licenseAuthorization: r.consent ?? '',
    unit: r.interlocutor ?? '',
    category: r.category ?? '',
    law: r.legal ?? '',
    coverage: r.scope ?? '',
    process: r.process ?? '',
    code: r.code ?? '',
    decisionDate: r.decisiondate ?? '',
    decision: r.decision ?? '',
    description: r.note ?? '',
    registration: r.register ?? '',
    address: r.address ?? '',
    phone: r.phone ?? '',
    email: r.email ?? '',
    administrativeInfo: r.administrativeinfo ?? '',
    contactPerson: r.directorname ?? '',
  };
}

type DetailRecord =
  | { type: 'station'; data: StationRecord }
  | { type: 'license'; data: LicenseRecord }
  | { type: 'planning'; data: FrequencyBand };

type PlanningFormProps = {
  title: string;
  description: string;
  value: FrequencyBand;
  onChange: (value: FrequencyBand) => void;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel: string;
  serviceTypeOptions?: DictData[];
  bandTypeOptions?: DictData[];
};

const stationFields: (keyof StationRecord)[] = [
  'name',
  'frequencyLicense',
  'technicalStandard',
  'bbuModel',
  'ownedsite',
  'backhaulNetworkAccessMethod',
  'stationPurpose',
  'modulationType',
  'type',
  'frequency',
  'receiveFrequency',
  'bandwidth',
  'equipmentNameAndModel',
  'equipmentCount',
  'equipmentPower',
  'antenna',
  'antennaCount',
  'province',
  'region',
  'detailedLocation',
  'status',
  'openDate',
  'expireDate',
  'latitude',
  'longitude',
];
const licenseFields: (keyof LicenseRecord)[] = ['number', 'organization', 'station', 'frequency', 'type', 'power', 'status', 'startDate', 'endDate', 'licenseAuthorization', 'unit', 'category', 'law', 'coverage', 'process', 'code', 'decisionDate', 'decision', 'description', 'registration', 'address', 'phone', 'email', 'administrativeInfo', 'contactPerson'];
const planningFields: (keyof FrequencyBand)[] = ['category', 'subCategory', 'service', 'bandName', 'startFreq', 'endFreq', 'step', 'bandwidth', 'status', 'note', 'serviceType', 'bandType'];
const stationFieldMap: Record<keyof StationRecord, string> = {
  name: 'Station Name',
  frequencyLicense: 'Frequency License',
  technicalStandard: 'Technical Standard',
  bbuModel: 'BBU Model',
  ownedsite: 'Owner Name',
  backhaulNetworkAccessMethod: 'Backhaul Network Access Method',
  stationPurpose: 'Station Purpose',
  modulationType: 'Modulation Type',
  type: 'Station Type',
  frequency: 'Transmit Frequency (MHz)',
  receiveFrequency: 'Receive Frequency (MHz)',
  bandwidth: 'Bandwidth',
  equipmentNameAndModel: 'Equipment Name and Model',
  equipmentCount: 'Equipment Count',
  equipmentPower: 'Equipment Output Power',
  antenna: 'Antenna Type',
  antennaCount: 'Antenna Count',
  province: 'Province',
  region: 'Region',
  detailedLocation: 'Detailed Location',
  status: 'Status',
  openDate: 'Open Date',
  expireDate: 'Expire Date',
  latitude: 'Latitude',
  longitude: 'Longitude',
};

// Station导出字段配置 - 按StationForm输入顺序排列
const stationExportFields: { key: keyof StationRecord; label: string; required: boolean }[] = [
  { key: 'name', label: 'Station Name', required: true },
  { key: 'frequencyLicense', label: 'Frequency License', required: false },
  { key: 'technicalStandard', label: 'Technical Standard', required: false },
  { key: 'bbuModel', label: 'BBU Model', required: false },
  { key: 'ownedsite', label: 'Owner Name', required: true },
  { key: 'backhaulNetworkAccessMethod', label: 'Backhaul Network Access Method', required: false },
  { key: 'stationPurpose', label: 'Station Purpose', required: false },
  { key: 'modulationType', label: 'Modulation Type', required: false },
  { key: 'type', label: 'Station Type', required: true },
  { key: 'frequency', label: 'Transmit Frequency (MHz)', required: true },
  { key: 'receiveFrequency', label: 'Receive Frequency (MHz)', required: false },
  { key: 'bandwidth', label: 'Bandwidth', required: true },
  { key: 'equipmentNameAndModel', label: 'Equipment Name and Model', required: false },
  { key: 'equipmentCount', label: 'Equipment Count', required: false },
  { key: 'equipmentPower', label: 'Equipment Output Power', required: false },
  { key: 'antenna', label: 'Antenna Type', required: false },
  { key: 'antennaCount', label: 'Antenna Count', required: false },
  { key: 'province', label: 'Province', required: true },
  { key: 'region', label: 'Region', required: true },
  { key: 'detailedLocation', label: 'Detailed Location', required: false },
  { key: 'status', label: 'Status', required: false },
  { key: 'openDate', label: 'Open Date', required: true },
  { key: 'expireDate', label: 'Expire Date', required: true },
  { key: 'latitude', label: 'Latitude', required: true },
  { key: 'longitude', label: 'Longitude', required: true },
];
const licenseFieldMap: Record<keyof LicenseRecord, string> = {
  id: 'ID',
  number: 'License Number',
  organization: 'Organization',
  station: 'Station',
  frequency: 'Frequency',
  type: 'Type',
  power: 'Power',
  status: 'Status',
  startDate: 'Start Date',
  endDate: 'End Date',
  licenseAuthorization: 'License',
  unit: 'Unit',
  category: 'Category',
  law: 'Law',
  coverage: 'Coverage',
  process: 'Process',
  code: 'Code',
  decisionDate: 'Decision Date',
  decision: 'Decision',
  description: 'Description',
  registration: 'Registration',
  address: 'Address',
  phone: 'Phone',
  email: 'Email',
  administrativeInfo: 'Administrative Info',
  contactPerson: 'Contact Person',
};
const planningFieldMap: Record<keyof FrequencyBand, string> = {
  guid: 'GUID',
  category: 'Radioservices',
  subCategory: 'Subservices',
  service: 'Level',
  bandName: 'Band Name',
  startFreq: 'Start Frequency',
  endFreq: 'End Frequency',
  step: 'Step',
  bandwidth: 'Signal Bandwidth',
  status: 'Status',
  note: 'Notes',
  serviceType: 'Service Type',
  bandType: 'Band Type',
};

type StationFormProps = {
  title: string;
  description: string;
  value: StationRecord;
  onChange: (value: StationRecord) => void;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel: string;
  onOpenCoordinatePicker: () => void;
  licenseOptions: LicenseRecord[];
};

function StationForm({ title, description, value, onChange, onClose, onSubmit, submitLabel, onOpenCoordinatePicker, licenseOptions }: StationFormProps) {
  const update = <K extends keyof StationRecord>(key: K, next: StationRecord[K]) => {
    onChange({ ...value, [key]: next });
  };
  const updateMany = (patch: Partial<StationRecord>) => {
    onChange({ ...value, ...patch });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-2">Station Name <span className="text-red-500">*</span></label><input value={value.name} onChange={(e) => update('name', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
            <div><label className="block text-sm font-medium mb-2">Frequency License</label>
              <select value={value.frequencyLicense ?? ''} onChange={(e) => update('frequencyLicense', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">-- Select License --</option>
                {licenseOptions.map((license) => (
                  <option key={license.guid} value={license.code}>{license.code}</option>
                ))}
              </select>
            </div>
            <div><label className="block text-sm font-medium mb-2">Technical Standard</label><input value={value.technicalStandard ?? ''} onChange={(e) => update('technicalStandard', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium mb-2">BBU Model</label><input value={value.bbuModel ?? ''} onChange={(e) => update('bbuModel', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium mb-2">Owner Name <span className="text-red-500">*</span></label><input value={value.ownedsite ?? ''} onChange={(e) => update('ownedsite', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
            <div><label className="block text-sm font-medium mb-2">Backhaul Network Access Method</label><input value={value.backhaulNetworkAccessMethod ?? ''} onChange={(e) => update('backhaulNetworkAccessMethod', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium mb-2">Station Purpose</label><input value={value.stationPurpose ?? ''} onChange={(e) => update('stationPurpose', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium mb-2">Modulation Type</label><input value={value.modulationType ?? ''} onChange={(e) => update('modulationType', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium mb-2">Station Type <span className="text-red-500">*</span></label><input value={value.type} onChange={(e) => update('type', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
            <div><label className="block text-sm font-medium mb-2">Transmit Frequency (MHz) <span className="text-red-500">*</span></label><input value={value.frequency} onChange={(e) => update('frequency', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
            <div><label className="block text-sm font-medium mb-2">Receive Frequency (MHz)</label><input value={value.receiveFrequency ?? ''} onChange={(e) => update('receiveFrequency', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium mb-2">Bandwidth <span className="text-red-500">*</span></label><input value={value.bandwidth ?? ''} onChange={(e) => update('bandwidth', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
            <div><label className="block text-sm font-medium mb-2">Equipment Name and Model</label><input value={value.equipmentNameAndModel ?? ''} onChange={(e) => update('equipmentNameAndModel', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium mb-2">Equipment Count</label><input value={value.equipmentCount ?? ''} onChange={(e) => update('equipmentCount', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium mb-2">Equipment Output Power</label><input value={value.equipmentPower ?? value.power ?? ''} onChange={(e) => updateMany({ equipmentPower: e.target.value, power: e.target.value })} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium mb-2">Antenna Type</label><input value={value.antenna ?? ''} onChange={(e) => update('antenna', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium mb-2">Antenna Count</label><input value={value.antennaCount ?? ''} onChange={(e) => update('antennaCount', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium mb-2">Province <span className="text-red-500">*</span></label><input value={value.province ?? ''} onChange={(e) => update('province', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
            <div><label className="block text-sm font-medium mb-2">Region <span className="text-red-500">*</span></label><input value={value.region} onChange={(e) => update('region', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
            <div><label className="block text-sm font-medium mb-2">Detailed Location</label><input value={value.detailedLocation ?? ''} onChange={(e) => update('detailedLocation', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium mb-2">Status</label><select value={value.status} onChange={(e) => update('status', e.target.value as StationRecord['status'])} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"><option value="normal">Normal</option><option value="expiring">Expiring</option><option value="expired">Expired</option></select></div>
            <div><label className="block text-sm font-medium mb-2">Open Date <span className="text-red-500">*</span></label><DatePicker value={value.openDate ?? ''} onChange={(v) => update('openDate', v)} /></div>
            <div><label className="block text-sm font-medium mb-2">Expire Date <span className="text-red-500">*</span></label><DatePicker value={value.expireDate ?? ''} onChange={(v) => update('expireDate', v)} /></div>
            <div><label className="block text-sm font-medium mb-2">Latitude <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                <input
                  value={value.latitude ?? ''}
                  onChange={(e) => update('latitude', e.target.value)}
                  className="flex-1 w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. 46.8523"
                  required
                />
                <button
                  type="button"
                  onClick={onOpenCoordinatePicker}
                  className="px-3 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm flex items-center gap-1.5 whitespace-nowrap"
                  title="从地图选择"
                >
                  <MapPin className="w-4 h-4" /> 地图选点
                </button>
              </div>
            </div>
            <div><label className="block text-sm font-medium mb-2">Longitude <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                <input
                  value={value.longitude ?? ''}
                  onChange={(e) => update('longitude', e.target.value)}
                  className="flex-1 w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. 103.7695"
                  required
                />
                <button
                  type="button"
                  onClick={onOpenCoordinatePicker}
                  className="px-3 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm flex items-center gap-1.5 whitespace-nowrap"
                  title="从地图选择"
                >
                  <MapPin className="w-4 h-4" /> 地图选点
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-border flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-colors">Cancel</button>
          <button onClick={onSubmit} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">{submitLabel}</button>
        </div>
      </div>
    </div>
  );
}

function PlanningForm({ title, description, value, onChange, onClose, onSubmit, submitLabel, serviceTypeOptions = [], bandTypeOptions = [] }: PlanningFormProps) {
  const update = <K extends keyof FrequencyBand>(key: K, next: FrequencyBand[K]) => onChange({ ...value, [key]: next });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-2">Radioservices<span className="text-red-500"> *</span></label><input value={value.category} onChange={(e) => update('category', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
            <div><label className="block text-sm font-medium mb-2">Subservices<span className="text-red-500"> *</span></label><input value={value.subCategory} onChange={(e) => update('subCategory', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
            <div><label className="block text-sm font-medium mb-2">Level<span className="text-red-500"> *</span></label><input value={value.service} onChange={(e) => update('service', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
            <div><label className="block text-sm font-medium mb-2">Band Name</label><input value={value.bandName} onChange={(e) => update('bandName', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium mb-2">Start Frequency<span className="text-red-500"> *</span></label><input type="number" value={value.startFreq} onChange={(e) => update('startFreq', Number(e.target.value))} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
            <div><label className="block text-sm font-medium mb-2">End Frequency<span className="text-red-500"> *</span></label><input type="number" value={value.endFreq} onChange={(e) => update('endFreq', Number(e.target.value))} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
            <div><label className="block text-sm font-medium mb-2">Step</label><input type="number" value={value.step} onChange={(e) => update('step', Number(e.target.value))} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium mb-2">Signal Bandwidth</label><input type="number" value={value.bandwidth} onChange={(e) => update('bandwidth', Number(e.target.value))} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium mb-2">Service Type</label>
              <Select value={value.serviceType ?? ''} onValueChange={(v) => update('serviceType', v)}>
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="-- Select Service Type --" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {serviceTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><label className="block text-sm font-medium mb-2">Band Type</label>
              <Select value={value.bandType ?? ''} onValueChange={(v) => update('bandType', v)}>
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="-- Select Band Type --" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {bandTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2"><label className="block text-sm font-medium mb-2">Notes</label><textarea value={value.note} onChange={(e) => update('note', e.target.value)} rows={4} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
          </div>
        </div>
        <div className="p-6 border-t border-border flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-colors">Cancel</button>
          <button onClick={onSubmit} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">{submitLabel}</button>
        </div>
      </div>
    </div>
  );
}

function buildFrequencyString(ft?: number, fr?: number): string {
  if (ft && fr) return `${ft}–${fr} MHz`;
  if (ft) return `${ft} MHz`;
  if (fr) return `${fr} MHz`;
  return '';
}

function computeStatus(expDate?: string): 'normal' | 'expiring' | 'expired' {
  if (!expDate) return 'normal';
  const now = new Date();
  const exp = new Date(expDate);
  if (exp < now) return 'expired';
  const warning = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  if (exp < warning) return 'expiring';
  return 'normal';
}

function mapVoToStationRecord(r: any): StationRecord {
  return {
    id: r.guid,
    name: r.sitename ?? '',
    type: r.type ?? '',
    region: r.district ?? '',
    province: r.province ?? '',
    detailedLocation: r.location ?? '',
    frequency: r.frequencyt?.toString() ?? '',
    receiveFrequency: r.frequencyr?.toString() ?? '',
    bandwidth: r.bandwidth?.toString() ?? '',
    bandwidthProcessingUnitModel: r.bandwidthprocessingunitmodel ?? '',
    status: computeStatus(r.expirationdate),
    openDate: r.startdate ?? '',
    expireDate: r.expirationdate ?? '',
    latitude: r.latitude?.toString() ?? '',
    longitude: r.longitude?.toString() ?? '',
    power: r.outputpower ? `${r.outputpower} W` : '',
    equipmentCount: r.devicequantity?.toString() ?? '',
    equipmentPower: r.outputpower?.toString() ?? '',
    technicalStandard: r.technology ?? '',
    ownerName: r.unit ?? '',
    backhaulNetworkAccessMethod: r.backbone ?? '',
    stationPurpose: r.stationpurpose ?? '',
    modulationType: r.modulation ?? '',
    antennaCount: r.antquantity?.toString() ?? '',
    equipmentNameAndModel: r.devicemodel ?? '',
    antenna: r.anttype ?? '',
    frequencyLicense: r.frequencyLicense ?? '',
    ownedsite: r.ownedsite ?? '',
    bbuModel: r.bbumodel ?? '',
  };
}

export function DataManagement() {
  const [activeTab, setActiveTab] = useState<DataTab>('station');
  const [searchTerm, setSearchTerm] = useState('');
  const [licenseUnitFilter, setLicenseUnitFilter] = useState('All');
  const [licenseRegionFilter, setLicenseRegionFilter] = useState('All');
  const [licenseBandFilter, setLicenseBandFilter] = useState('All');
  const [licenseStatusFilter, setLicenseStatusFilter] = useState('All');
  const [stationDialogMode, setStationDialogMode] = useState<'add' | 'edit' | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [importTab, setImportTab] = useState<DataTab>('station');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [detailRecord, setDetailRecord] = useState<DetailRecord | null>(null);
  const [stationFormRecord, setStationFormRecord] = useState<StationRecord | null>(null);
  const [licenseDialogMode, setLicenseDialogMode] = useState<'add' | 'edit' | null>(null);
  const [licenseFormRecord, setLicenseFormRecord] = useState<LicenseRecord | null>(null);
  const [planningDialogMode, setPlanningDialogMode] = useState<'add' | 'edit' | null>(null);
  const [planningFormRecord, setPlanningFormRecord] = useState<FrequencyBand | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [exportOptions, setExportOptions] = useState({ format: 'xlsx', range: 'all', fields: stationExportFields.map(f => f.key) });
  const [coordinatePickerOpen, setCoordinatePickerOpen] = useState(false);
  const [serviceTypeOptions, setServiceTypeOptions] = useState<DictData[]>([]);
  const [bandTypeOptions, setBandTypeOptions] = useState<DictData[]>([]);

  // 分页状态 - pageSize 9999 for fetching all data, display uses actual pagination
  const [stationPage, setStationPage] = useState({ pageNum: 1, pageSize: 9999 });
  const [stationTotal, setStationTotal] = useState(0);
  const [licensePage, setLicensePage] = useState({ pageNum: 1, pageSize: 9999 });
  const [licenseTotal, setLicenseTotal] = useState(0);
  const [planningPage, setPlanningPage] = useState({ pageNum: 1, pageSize: 9999 });
  const [planningTotal, setPlanningTotal] = useState(0);

  const [stationRecords, setStationRecords] = useState<StationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [licenseRecords, setLicenseRecords] = useState<LicenseRecord[]>([]);
  const [planningRecords, setPlanningRecords] = useState<FrequencyBand[]>([]);

  // 数据获取函数
  const fetchStationData = useCallback(async () => {
    try {
      const res = await stationApi.page({ pageNum: 1, pageSize: 9999, keyword: searchTerm });
      if (res.code === 200 && res.data?.records) {
        setStationRecords(res.data.records.map(mapVoToStationRecord));
        setStationTotal(res.data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch station data:', error);
    }
  }, [searchTerm]);

  const fetchLicenseData = useCallback(async () => {
    try {
      const res = await permitApi.page({ pageNum: 1, pageSize: 9999, keyword: searchTerm });
      if (res.code === 200 && res.data?.records) {
        setLicenseRecords(res.data.records.map(mapPermitVoToLicenseRecord));
        setLicenseTotal(res.data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch license data:', error);
    }
  }, [searchTerm]);

  const fetchPlanningData = useCallback(async () => {
    try {
      const res = await planningApi.page({ pageNum: 1, pageSize: 9999 });
      if (res.code === 200 && res.data) {
        setPlanningRecords(res.data.records.map(convertToFrequencyBand));
        setPlanningTotal(res.data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch planning data:', error);
    }
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchStationData(), fetchLicenseData(), fetchPlanningData()]);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [fetchStationData, fetchLicenseData, fetchPlanningData]);

  const licenseUnits = useMemo(() => ['All', ...Array.from(new Set(licenseRecords.map((item) => item.organization))).sort()], [licenseRecords]);
  const licenseRegions = useMemo(() => ['All', ...Array.from(new Set(stationRecords.map((item) => item.region))).sort()], [stationRecords]);
  const licenseBands = useMemo(() => ['All', '470-862 MHz', '1800-1900 MHz', '3400-3600 MHz', '5925-6425 MHz', '11.7-12.2 GHz'], []);
  const licenseStatuses = useMemo(() => ['All', 'Normal', 'Expiring', 'Expired'], []);

  // 分页处理函数
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setStationPage(prev => ({ ...prev, pageNum: 1 }));
    setLicensePage(prev => ({ ...prev, pageNum: 1 }));
  };

  const handleStationPageChange = (newPage: number) => {
    setStationPage(prev => ({ ...prev, pageNum: newPage }));
  };

  const handleStationPageSizeChange = (newSize: number) => {
    setStationPage({ pageNum: 1, pageSize: newSize });
  };

  const handleLicensePageChange = (newPage: number) => {
    setLicensePage(prev => ({ ...prev, pageNum: newPage }));
  };

  const handleLicensePageSizeChange = (newSize: number) => {
    setLicensePage({ pageNum: 1, pageSize: newSize });
  };

  const handlePlanningPageChange = (newPage: number) => {
    setPlanningPage(prev => ({ ...prev, pageNum: newPage }));
  };

  const handlePlanningPageSizeChange = (newSize: number) => {
    setPlanningPage({ pageNum: 1, pageSize: newSize });
  };

  const filteredLicenseData = useMemo(() => licenseRecords.filter((license) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || [license.number, license.licenseAuthorization, license.organization, license.station, license.frequency, license.type].some((value) => value?.toLowerCase().includes(q));
    const matchesUnit = licenseUnitFilter === 'All' || license.organization === licenseUnitFilter;
    const matchesRegion = licenseRegionFilter === 'All' || stationRecords.find((station) => station.name === license.station)?.region === licenseRegionFilter;
    const matchesBand = licenseBandFilter === 'All' || license.frequency === licenseBandFilter;
    const matchesStatus = licenseStatusFilter === 'All' || license.status.toLowerCase() === licenseStatusFilter.toLowerCase();
    return matchesSearch && matchesUnit && matchesRegion && matchesBand && matchesStatus;
  }), [licenseBandFilter, licenseRegionFilter, licenseRecords, licenseStatusFilter, licenseUnitFilter, searchTerm, stationRecords]);

  const filteredStationData = useMemo(() => stationRecords.filter((s) => !searchTerm || [s.name, s.type, s.region, s.ownerName].some((v) => v?.toLowerCase().includes(searchTerm.toLowerCase()))), [searchTerm, stationRecords]);

  const filteredPlanningData = useMemo(() => planningRecords, [planningRecords]);

  // Client-side pagination for display (10 items per page)
  const DISPLAY_PAGE_SIZE = 10;
  const paginatedStations = useMemo(() => {
    const start = (stationPage.pageNum - 1) * DISPLAY_PAGE_SIZE;
    return filteredStationData.slice(start, start + DISPLAY_PAGE_SIZE);
  }, [filteredStationData, stationPage.pageNum]);

  const paginatedLicenses = useMemo(() => {
    const start = (licensePage.pageNum - 1) * DISPLAY_PAGE_SIZE;
    return filteredLicenseData.slice(start, start + DISPLAY_PAGE_SIZE);
  }, [filteredLicenseData, licensePage.pageNum]);

  const paginatedPlans = useMemo(() => {
    const start = (planningPage.pageNum - 1) * DISPLAY_PAGE_SIZE;
    return filteredPlanningData.slice(start, start + DISPLAY_PAGE_SIZE);
  }, [filteredPlanningData, planningPage.pageNum]);

  const planningSheet = useMemo(() => planningRecords.map((item) => ({ ...item })), [planningRecords]);

  // License Detail 状态
  const [showLicenseDetail, setShowLicenseDetail] = useState(false);
  const [detailLicenseId, setDetailLicenseId] = useState<string | null>(null);

  const openDetail = (record: DetailRecord) => {
    if (record.type === 'license') {
      // License 使用新的 LicenseDetail 组件全屏显示
      setDetailLicenseId(record.data.guid);
      setShowLicenseDetail(true);
    } else {
      // Station 和 Planning 保持使用 RecordDetailCard
      setDetailRecord(record);
      setShowDetailDialog(true);
    }
  };

  const openEdit = (record: DetailRecord) => {
    if (record.type !== 'station') return;
    setStationFormRecord(record.data);
    setStationDialogMode('edit');
  };

  const openPlanningEdit = (record: FrequencyBand) => {
    setPlanningFormRecord(record);
    setPlanningDialogMode('edit');
  };

  const savePlanningEdit = async () => {
    if (!planningFormRecord) return;
    if (planningDialogMode === 'add') {
      if (!planningFormRecord.category || !planningFormRecord.subCategory || !planningFormRecord.service || planningFormRecord.startFreq === 0 || planningFormRecord.endFreq === 0) {
        alert('Please fill in all required fields: Category, Subcategory, Level, Start Frequency, End Frequency');
        return;
      }
    }
    try {
      const vo = convertToPlanningVO(planningFormRecord);
      if (planningDialogMode === 'add') {
        await planningApi.create({
          radioservices: vo.radioservices!,
          subservices: vo.subservices!,
          level: vo.level!,
          segmentname: vo.segmentname!,
          startfrequency: vo.startfrequency!,
          stopfrequency: vo.stopfrequency!,
          step: vo.step!,
          bandwidth: vo.bandwidth!,
          remark: vo.remark || '',
          serviceType: vo.serviceType || '',
          bandType: vo.bandType || '',
        });
      } else {
        await planningApi.update(planningFormRecord.guid, {
          radioservices: vo.radioservices,
          subservices: vo.subservices,
          level: vo.service,
          segmentname: vo.bandName,
          startfrequency: vo.startFreq,
          stopfrequency: vo.endFreq,
          step: vo.step,
          bandwidth: vo.bandwidth,
          remark: vo.note,
          serviceType: vo.serviceType,
          bandType: vo.bandType,
        });
      }
      const res = await planningApi.page({ pageNum: planningPage.pageNum, pageSize: planningPage.pageSize });
      if (res.code === 200 && res.data) {
        setPlanningRecords(res.data.records.map(convertToFrequencyBand));
        setPlanningTotal(res.data.total || 0);
      }
    } catch (error) {
      console.error('Failed to save planning data:', error);
      alert('Save failed');
      return;
    }
    setPlanningDialogMode(null);
    setPlanningFormRecord(null);
  };

  const deletePlanning = async (guid: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      await planningApi.delete(guid);
      const res = await planningApi.page({ pageNum: planningPage.pageNum, pageSize: planningPage.pageSize });
      if (res.code === 200 && res.data) {
        setPlanningRecords(res.data.records.map(convertToFrequencyBand));
        setPlanningTotal(res.data.total || 0);
      }
    } catch (error) {
      console.error('Failed to delete planning data:', error);
      alert('Delete failed');
    }
  };

  const openLicenseEdit = (record: LicenseRecord) => {
    setLicenseFormRecord(record);
    setLicenseDialogMode('edit');
  };

  const refreshStationData = async () => {
    const res = await stationApi.page({ pageNum: stationPage.pageNum, pageSize: stationPage.pageSize, keyword: searchTerm });
    if (res.code === 200 && res.data?.records) {
      setStationRecords(res.data.records.map(mapVoToStationRecord));
      setStationTotal(res.data.total || 0);
    }
  };

  const refreshLicenseData = async () => {
    const res = await permitApi.page({ pageNum: 1, pageSize: licensePage.pageSize, keyword: searchTerm });
    if (res.code === 200 && res.data?.records) {
      setLicenseRecords(res.data.records.map(mapPermitVoToLicenseRecord));
      setLicenseTotal(res.data.total || 0);
      setLicensePage(prev => ({ ...prev, pageNum: 1 }));
    }
  };

  // 当打开 Station 表单对话框时，确保 license 数据已加载
  useEffect(() => {
    if (stationDialogMode && !licenseRecords.length) {
      refreshLicenseData();
    }
  }, [stationDialogMode, licenseRecords.length]);

  // 加载 ServiceType 和 BandType 字典数据
  useEffect(() => {
    const loadDictData = async () => {
      try {
        console.log('[DictData] 开始加载字典数据');
        const typeResult = await dictTypeApi.list();
        console.log('[DictData] dictTypeApi.list 返回:', typeResult);
        const dictTypes = (typeResult as any)?.data ?? typeResult ?? [];
        console.log('[DictData] dictTypes:', dictTypes);
        // 根据实际的 code 值匹配：ServiceType -> service_type, BandType -> freq_band
        const serviceTypeDict = dictTypes.find((d: any) => d.code === 'service_type');
        const bandTypeDict = dictTypes.find((d: any) => d.code === 'freq_band');
        console.log('[DictData] serviceTypeDict:', serviceTypeDict);
        console.log('[DictData] bandTypeDict:', bandTypeDict);
        const promises = [];
        if (serviceTypeDict?.guid) {
          promises.push(dictDataApi.list(serviceTypeDict.guid).then((res: any) => {
            console.log('[DictData] dictDataApi.list 返回 (ServiceType):', res);
            const data = res?.data ?? res ?? [];
            console.log('[DictData] ServiceType data:', data);
            setServiceTypeOptions(Array.isArray(data) ? data : data.records ?? []);
          }));
        }
        if (bandTypeDict?.guid) {
          promises.push(dictDataApi.list(bandTypeDict.guid).then((res: any) => {
            console.log('[DictData] dictDataApi.list 返回 (BandType):', res);
            const data = res?.data ?? res ?? [];
            console.log('[DictData] BandType data:', data);
            setBandTypeOptions(Array.isArray(data) ? data : data.records ?? []);
          }));
        }
        await Promise.all(promises);
        console.log('[DictData] 加载完成, serviceTypeOptions:', serviceTypeOptions, 'bandTypeOptions:', bandTypeOptions);
      } catch (err) {
        console.error('加载数据字典失败:', err);
      }
    };
    loadDictData();
  }, []);

  const refreshPlanningData = async () => {
    const res = await planningApi.page({ pageNum: planningPage.pageNum, pageSize: planningPage.pageSize });
    if (res.code === 200 && res.data) {
      setPlanningRecords(res.data.records.map(convertToFrequencyBand));
      setPlanningTotal(res.data.total || 0);
    }
  };

  const saveStationEdit = async () => {
    if (!stationFormRecord) return;
    try {
      const payload = {
        type: stationFormRecord.type,
        stationtype: stationFormRecord.type,
        province: stationFormRecord.province ?? '',
        district: stationFormRecord.region,
        location: stationFormRecord.detailedLocation ?? '',
        sitename: stationFormRecord.name,
        devicemodel: stationFormRecord.equipmentNameAndModel ?? '',
        devicequantity: stationFormRecord.equipmentCount ? parseInt(stationFormRecord.equipmentCount) : undefined,
        outputpower: stationFormRecord.equipmentPower ? parseFloat(stationFormRecord.equipmentPower) : undefined,
        anttype: stationFormRecord.antenna ?? '',
        antquantity: stationFormRecord.antennaCount ? parseInt(stationFormRecord.antennaCount) : undefined,
        technology: stationFormRecord.technicalStandard ?? '',
        backbone: stationFormRecord.backhaulNetworkAccessMethod ?? '',
        stationpurpose: stationFormRecord.stationPurpose ?? '',
        modulation: stationFormRecord.modulationType ?? '',
        startdate: stationFormRecord.openDate || undefined,
        expirationdate: stationFormRecord.expireDate || undefined,
        longitude: stationFormRecord.longitude ? parseFloat(stationFormRecord.longitude) : undefined,
        latitude: stationFormRecord.latitude ? parseFloat(stationFormRecord.latitude) : undefined,
        unit: stationFormRecord.ownedsite ?? '',
        equipname: stationFormRecord.equipmentNameAndModel ?? '',
        frequencyLicense: stationFormRecord.frequencyLicense ?? '',
        frequencyt: stationFormRecord.frequency ? parseFloat(stationFormRecord.frequency) : undefined,
        frequencyr: stationFormRecord.receiveFrequency ? parseFloat(stationFormRecord.receiveFrequency) : undefined,
        bandwidth: stationFormRecord.bandwidth ? parseFloat(stationFormRecord.bandwidth) : undefined,
        ownedsite: stationFormRecord.ownedsite ?? '',
        bbumodel: stationFormRecord.bbuModel ?? '',
      };
      await stationApi.update(stationFormRecord.id, payload);
      await refreshStationData();
      await refreshLicenseData();
    } catch (error) {
      console.error('Failed to save station:', error);
      alert('保存失败');
      return;
    }
    setStationDialogMode(null);
    setStationFormRecord(null);
  };

  const handleDeleteStation = async (id: string) => {
    if (!confirm('确定要删除这条记录吗？')) return;
    try {
      await stationApi.delete(id);
      setStationRecords((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Failed to delete station:', error);
      alert('删除失败');
    }
  };

  const statusLabel = (status: string) => status === 'normal' ? 'Normal' : status === 'expiring' ? 'Expiring' : 'Expired';
  const statusClass = (status: string) => status === 'normal' ? 'bg-green-100 text-green-700' : status === 'expiring' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';

  const exportToExcel = (tab: DataTab) => {
    const data = tab === 'station' ? stationRecords : tab === 'license' ? licenseRecords : planningRecords;
    const fields = tab === 'station' ? stationFields : tab === 'license' ? licenseFields : planningFields;
    const fieldLabelMap = tab === 'station' ? stationFieldMap : tab === 'license' ? licenseFieldMap : planningFieldMap;
    const headerRow = fields.map((field) => fieldLabelMap[field as keyof typeof fieldLabelMap] ?? String(field));
    const rows = data.map((item) => fields.map((field) => (item as any)[field] ?? ''));
    const worksheet = XLSX.utils.aoa_to_sheet([headerRow, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, tab);
    XLSX.writeFile(workbook, `${tab}-data.xlsx`);
  };

  const importFromExcel = async () => {
    if (!importFile) return;
    if (importTab === 'planning') {
      try {
        //读取 Excel 文件并预处理：添加 serviceType 和 bandType 列
        const buffer = await importFile.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });

        // 为每行添加 serviceType 和 bandType
        const processedRows = rows.map((row: any) => {
          const radioservices = row.Radioservices || row.radioservices || row.category || '';
          const startFreq = parseFloat(String(row['Start Frequency'] || row.startFreq || row.startfrequency || 0));
          const endFreq = parseFloat(String(row['End Frequency'] || row.endFreq || row.stopfrequency || 0));
          return {
            ...row,
            ServiceType: matchServiceType(radioservices, serviceTypeOptions) ?? row.ServiceType ?? row.serviceType ?? '',
            BandType: matchBandType(startFreq, endFreq, bandTypeOptions) ?? row.BandType ?? row.bandType ?? '',
          };
        });

        //写入新的 Excel 文件（添加 ServiceType 和 BandType 列）
        const planningExportFields: (keyof typeof planningFieldMap)[] = ['category', 'subCategory', 'service', 'bandName', 'startFreq', 'endFreq', 'step', 'bandwidth', 'status', 'note', 'serviceType', 'bandType'];
        const headerRow = [...planningFields.map((field) => planningFieldMap[field as keyof typeof planningFieldMap] ?? String(field)), 'ServiceType', 'BandType'];
        const dataRows = processedRows.map((item) => {
          const rowData: any[] = [];
          for (const field of planningFields) {
            rowData.push((item as any)[field] ?? '');
          }
          // 添加 serviceType 和 bandType
          rowData.push(item.ServiceType || item.serviceType || '', item.BandType || item.bandType || '');
          return rowData;
        });
        const newSheet = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows]);
        const newWorkbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(newWorkbook, newSheet, 'planning');
        const wbout = XLSX.write(newWorkbook, { bookType: 'xlsx', type: 'array' });
        const processedFile = new File([wbout], importFile.name, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        await planningApi.import(processedFile);
        const res = await planningApi.page({ pageNum: planningPage.pageNum, pageSize: planningPage.pageSize });
        if (res.code === 200 && res.data) {
          setPlanningRecords(res.data.records.map(convertToFrequencyBand));
          setPlanningTotal(res.data.total || 0);
        }
      } catch (error) {
        console.error('Failed to import planning data:', error);
        alert('Planning data import failed');
        return;
      }
      alert('成功导入数据');
      setShowImportDialog(false);
      setImportFile(null);
      return;
    }

    const buffer = await importFile.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });

    if (importTab === 'station') {
      try {
        let importedCount = 0;
        for (const row of rows) {
          const payload = {
            // 基本信息（与表单顺序对应）
            // 注意：模板列名使用空格（如 'Station Name'），也需要支持
            sitename: String(row['Station Name'] ?? row.name ?? row.Name ?? ''),
            frequencyLicense: String(row['Frequency License'] ?? row.frequencyLicense ?? ''),
            technology: String(row['Technical Standard'] ?? row.technicalStandard ?? ''),
            bbumodel: String(row['BBU Model'] ?? row.bbumodel ?? row.BBUModel ?? ''),
            ownedsite: String(row['Owner Name'] ?? row.ownedsite ?? row.OwnedSite ?? row.unit ?? row.Unit ?? ''),
            backbone: String(row['Backhaul Network Access Method'] ?? row.backhaulNetworkAccessMethod ?? ''),
            stationpurpose: String(row['Station Purpose'] ?? row.stationPurpose ?? ''),
            modulation: String(row['Modulation Type'] ?? row.modulationType ?? ''),

            // 频率相关
            type: String(row['Station Type'] ?? row.type ?? row.Type ?? ''),
            stationtype: String(row['Station Type'] ?? row.type ?? row.Type ?? ''),
            frequencyt: row.frequencyt ?? row.FrequencyT ?? row.frequency ?? row.Frequency ?? row['Transmit Frequency'] ? parseFloat(String(row.frequencyt ?? row.FrequencyT ?? row.frequency ?? row.Frequency ?? row['Transmit Frequency'])) : undefined,
            frequencyr: row.frequencyr ?? row.FrequencyR ?? row.receiveFrequency ?? row['Receive Frequency'] ? parseFloat(String(row.frequencyr ?? row.FrequencyR ?? row.receiveFrequency ?? row['Receive Frequency'])) : undefined,
            bandwidth: row.bandwidth ?? row.Bandwidth ?? row['Bandwidth'] ? parseFloat(String(row.bandwidth ?? row.Bandwidth ?? row['Bandwidth'])) : undefined,

            // 设备信息
            devicemodel: String(row['Equipment Name and Model'] ?? row.equipmentNameAndModel ?? ''),
            devicequantity: row['Equipment Count'] ?? row.equipmentCount ? parseInt(String(row['Equipment Count'] ?? row.equipmentCount)) : undefined,
            outputpower: row['Equipment Output Power'] ?? row.equipmentPower ? parseFloat(String(row['Equipment Output Power'] ?? row.equipmentPower)) : undefined,

            // 天线信息
            anttype: String(row['Antenna Type'] ?? row.antenna ?? ''),
            antquantity: row['Antenna Count'] ?? row.antennaCount ? parseInt(String(row['Antenna Count'] ?? row.antennaCount)) : undefined,

            // 位置信息
            province: String(row['Province'] ?? row.province ?? ''),
            district: String(row['Region'] ?? row.region ?? row.Region ?? ''),
            location: String(row['Detailed Location'] ?? row.detailedLocation ?? ''),

            // 日期
            startdate: String(row['Open Date'] ?? row.openDate ?? ''),
            expirationdate: String(row['Expire Date'] ?? row.expireDate ?? ''),

            // 坐标
            longitude: row['Longitude'] ?? row.longitude ? parseFloat(String(row['Longitude'] ?? row.longitude)) : undefined,
            latitude: row['Latitude'] ?? row.latitude ? parseFloat(String(row['Latitude'] ?? row.latitude)) : undefined,

            // 额外字段
            unit: String(row['Owner Name'] ?? row.ownedsite ?? row.OwnedSite ?? ''),
            equipname: String(row['Equipment Name and Model'] ?? row.equipmentNameAndModel ?? ''),
          };
          console.log('[Station Import] Row data:', row);
          console.log('[Station Import] Payload:', payload);

          // 验证必填字段
          if (!payload.sitename) {
            console.warn('[Station Import] Skipping row - missing sitename:', row);
            continue;
          }
          if (!payload.province) {
            console.warn('[Station Import] Skipping row - missing province:', row);
            continue;
          }
          if (!payload.type) {
            console.warn('[Station Import] Skipping row - missing type:', row);
            continue;
          }

          const result = await stationApi.create(payload);
          console.log('[Station Import] Create result:', result);
          importedCount++;
        }
        console.log('[Station Import] Total imported:', importedCount, 'rows');
        await refreshStationData();
        console.log('[Station Import] After refresh - stationRecords:', stationRecords.length);
        alert(`成功导入 ${importedCount} 行数据`);
      } catch (error) {
        console.error('Failed to import station data:', error);
        alert('导入失败');
        setShowImportDialog(false);
        setImportFile(null);
        return;
      }
    }
    if (importTab === 'license') {
      let importedCount = 0;
      for (const row of rows) {
        // 辅助函数：格式化日期为 yyyy-MM-dd
        const formatDate = (val: any): string => {
          if (!val) return '';
          if (val instanceof Date) {
            const d = val;
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          }
          if (typeof val === 'number') {
            // Excel 日期序列号转换
            const d = new Date(Math.round((val - 25569) * 86400 * 1000));
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          }
          // 如果是字符串，尝试解析并格式化
          if (typeof val === 'string' && val) {
            const d = new Date(val);
            if (!isNaN(d.getTime())) {
              const year = d.getFullYear();
              const month = String(d.getMonth() + 1).padStart(2, '0');
              const day = String(d.getDate()).padStart(2, '0');
              return `${year}-${month}-${day}`;
            }
          }
          return String(val);
        };

        const payload = {
          consent: String(row['License / Authorization'] ?? row.licenseAuthorization ?? ''),
          interlocutor: String(row.organization ?? row.Organization ?? row.unit ?? row.Unit ?? ''),
          category: String(row.category ?? row.Category ?? ''),
          legal: String(row.law ?? row.Law ?? ''),
          type: String(row.type ?? row.Type ?? ''),
          startdate: formatDate(row['Start Date'] ?? row.startDate),
          enddate: formatDate(row['End Date'] ?? row.endDate),
          scope: String(row.coverage ?? row['Coverage Range'] ?? row.frequency ?? row.Frequency ?? ''),
          process: String(row.process ?? row.Process ?? ''),
          status: String(row.status ?? row.Status ?? 'active'),
          code: String(row['Code / No.'] ?? row.code ?? ''),
          decisiondate: formatDate(row['Decision Date'] ?? row.decisionDate),
          decision: String(row.decision ?? row.Decision ?? ''),
          note: String(row.description ?? row.Description ?? ''),
          register: String(row.registration ?? row.Registration ?? ''),
          address: String(row.address ?? row.Address ?? ''),
          phone: String(row.phone ?? row.Phone ?? ''),
          email: String(row.email ?? row.Email ?? ''),
          administrativeinfo: String(row['Administrative Info'] ?? row.administrativeInfo ?? ''),
          directorname: String(row['Contact Person'] ?? row.contactPerson ?? ''),
        };
        console.log('[License Import] Row data:', row);
        console.log('[License Import] Payload:', payload);

        // 验证必填字段
        if (!payload.interlocutor) {
          console.warn('[License Import] Skipping row - missing interlocutor:', row);
          continue;
        }

        try {
          const result = await permitApi.create(payload);
          console.log('[License Import] Create result:', result);
          importedCount++;
        } catch (error) {
          console.error('[License Import] Failed to create license:', error);
          alert(`导入失败：第 ${importedCount + 1} 行数据存在问题。\n错误信息：${error instanceof Error ? error.message : '未知错误'}\n数据：${JSON.stringify(payload)}`);
          return; // 遇到错误就停止导入
        }
      }
      console.log('[License Import] Total imported:', importedCount, 'rows');
      await refreshLicenseData();
      alert(`成功导入 ${importedCount} 行数据`);
    }
    setShowImportDialog(false);
    setImportFile(null);
  };

  const downloadImportTemplate = () => {
    if (importTab === 'station') {
      // 动态生成 Station 导入模板（使用 stationFields 顺序）
      const fields = [
        'Station Name', 'Frequency License', 'Technical Standard', 'BBU Model',
        'Owner Name', 'Backhaul Network Access Method', 'Station Purpose', 'Modulation Type',
        'Station Type', 'Transmit Frequency (MHz)', 'Receive Frequency (MHz)', 'Bandwidth',
        'Equipment Name and Model', 'Equipment Count', 'Equipment Output Power',
        'Antenna Type', 'Antenna Count', 'Province', 'Region', 'Detailed Location',
        'Status', 'Open Date', 'Expire Date', 'Latitude', 'Longitude',
      ];
      const worksheet = XLSX.utils.aoa_to_sheet([fields]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Station Import');
      XLSX.writeFile(workbook, 'station-data.xlsx');
      return;
    } else if (importTab === 'license') {
      // 动态生成 License 导入模板
      const fields = [
        'Code / No.', 'License / Authorization', 'Organization', 'Category', 'Type',
        'Start Date', 'End Date', 'Coverage Range', 'Process', 'Status',
        'Decision Date', 'Decision', 'Description', 'Registration',
        'Address', 'Phone', 'Email', 'Administrative Info', 'Contact Person',
        'Law',
      ];
      const worksheet = XLSX.utils.aoa_to_sheet([fields]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'License Import');
      XLSX.writeFile(workbook, 'license-data.xlsx');
      return;
    } else {
      // Planning 类型，下载模板文件
      const link = document.createElement('a');
      link.href = '/docs/frequency-planning-data.xlsx';
      link.download = 'frequency-planning-data.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6">
      {showLicenseDetail && detailLicenseId ? (
        <LicenseDetail
          permitId={detailLicenseId}
          onBack={() => { setShowLicenseDetail(false); setDetailLicenseId(null); }}
        />
      ) : (
        <>
      <div>
        <h2 className="text-2xl font-semibold mb-2">Data Management</h2>
        <p className="text-muted-foreground">Centralized management of station, license, and planning data</p>
      </div>

      <div className="flex gap-3">
        <button onClick={() => setActiveTab('station')} className={`px-6 py-3 rounded-lg transition-colors ${activeTab === 'station' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border hover:bg-muted'}`}>Station Data</button>
        <button onClick={() => setActiveTab('license')} className={`px-6 py-3 rounded-lg transition-colors ${activeTab === 'license' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border hover:bg-muted'}`}>License Data</button>
        <button onClick={() => setActiveTab('planning')} className={`px-6 py-3 rounded-lg transition-colors ${activeTab === 'planning' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border hover:bg-muted'}`}>Planning Data</button>
      </div>

      {activeTab === 'station' && (
        <div className="bg-card rounded-lg border border-border shadow-sm overflow-y-auto max-h-[calc(100vh-280px)]">
          <div className="flex items-center justify-between p-4 gap-4 sticky top-0 bg-card z-10 border-b border-border">
            <h3 className="text-lg font-semibold whitespace-nowrap">Station Data Management</h3>
            <div className="flex items-center gap-2 flex-1 justify-end">
              <div className="relative max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" placeholder="Search station name..." value={searchTerm} onChange={(e) => handleSearchChange(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <button type="button" onClick={() => { setImportTab('station'); setShowImportDialog(true); }} className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-2"><FileUp className="w-4 h-4" />Import</button>
              <button type="button" onClick={() => setShowExportDialog(true)} className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-2"><FileDown className="w-4 h-4" />Export</button>
              <button type="button" onClick={async () => { setStationFormRecord({ id: '', name: '', frequencyLicense: '', type: '', region: '', province: '', detailedLocation: '', frequency: '', receiveFrequency: '', bandwidth: '', status: 'normal', openDate: '', expireDate: '', latitude: '', longitude: '', power: '', antenna: '', equipmentCount: '', equipmentPower: '', technicalStandard: '', bandwidthProcessingUnitModel: '', ownerName: '', ownedsite: '', bbuModel: '', backhaulNetworkAccessMethod: '', stationPurpose: '', modulationType: '', antennaCount: '', equipmentNameAndModel: '' }); await refreshLicenseData(); setStationDialogMode('add'); }} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"><Plus className="w-4 h-4" />Add</button>
            </div>
          </div>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading stations...</div>
          ) : filteredStationData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No stations found</div>
          ) : (
            <>
            <table className="w-full">
              <thead className="sticky top-[60px] bg-card z-10">
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">Station Name</th>
                  <th className="text-left py-3 px-4">Frequency License</th>
                  <th className="text-left py-3 px-4">Station Type</th>
                  <th className="text-left py-3 px-4">Region</th>
                  <th className="text-left py-3 px-4">Owner Name</th>
                  <th className="text-center py-3 px-4">Status</th>
                  <th className="text-center py-3 px-4">Actions</th>
                </tr>
              </thead>
                <tbody key={stationPage.pageNum}>
                  {paginatedStations.map((station) => (
                    <tr key={station.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{station.name}</td>
                      <td className="py-3 px-4">{station.frequencyLicense || '-'}</td>
                      <td className="py-3 px-4">{station.type}</td>
                      <td className="py-3 px-4">{station.region}</td>
                      <td className="py-3 px-4 text-sm">{station.ownerName}</td>
                      <td className="text-center py-3 px-4"><span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${statusClass(station.status)}`}>{statusLabel(station.status)}</span></td>
                      <td className="text-center py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openDetail({ type: 'station', data: station })} className="p-1 hover:bg-muted rounded" title="Detail"><Eye className="w-4 h-4 text-slate-600" /></button>
                          <button onClick={() => openEdit({ type: 'station', data: station })} className="p-1 hover:bg-muted rounded" title="Edit"><Edit className="w-4 h-4 text-primary" /></button>
                          <button onClick={() => handleDeleteStation(station.id)} className="p-1 hover:bg-muted rounded" title="Delete"><Trash2 className="w-4 h-4 text-red-500" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {filteredStationData.length > 0 && (
              <div className="flex items-center justify-between p-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Total {filteredStationData.length} items
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={stationPage.pageSize}
                    onChange={(e) => handleStationPageSizeChange(Number(e.target.value))}
                    className="px-3 py-1 border border-border rounded-lg bg-input-background text-sm"
                  >
                    <option value={10}>10 条/页</option>
                    <option value={20}>20 条/页</option>
                    <option value={50}>50 条/页</option>
                  </select>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => handleStationPageChange(stationPage.pageNum - 1)}
                          className={stationPage.pageNum <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <span className="px-3 py-1 text-sm">{stationPage.pageNum}</span>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handleStationPageChange(stationPage.pageNum + 1)}
                          className={stationPage.pageNum >= Math.ceil(filteredStationData.length / DISPLAY_PAGE_SIZE) ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            )}
            </>
          )}
        </div>
      )}

      {activeTab === 'license' && (
        <div className="bg-card rounded-lg border border-border shadow-sm overflow-y-auto max-h-[calc(100vh-280px)]">
          <div className="flex items-center justify-between p-4 gap-4 sticky top-0 bg-card z-10 border-b border-border">
            <h3 className="text-lg font-semibold whitespace-nowrap">License Data Management</h3>
            <div className="flex items-center gap-2 flex-1 justify-end">
              <div className="relative max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => handleSearchChange(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <select value={licenseUnitFilter} onChange={(e) => setLicenseUnitFilter(e.target.value)} className="px-3 py-2 border border-border rounded-lg bg-input-background text-sm">{licenseUnits.map((unit) => <option key={unit} value={unit}>{unit === 'All' ? 'All Units' : unit}</option>)}</select>
              <select value={licenseRegionFilter} onChange={(e) => setLicenseRegionFilter(e.target.value)} className="px-3 py-2 border border-border rounded-lg bg-input-background text-sm">{licenseRegions.map((region) => <option key={region} value={region}>{region === 'All' ? 'All Regions' : region}</option>)}</select>
              <select value={licenseBandFilter} onChange={(e) => setLicenseBandFilter(e.target.value)} className="px-3 py-2 border border-border rounded-lg bg-input-background text-sm">{licenseBands.map((band) => <option key={band} value={band}>{band === 'All' ? 'All Bands' : band}</option>)}</select>
              <select value={licenseStatusFilter} onChange={(e) => setLicenseStatusFilter(e.target.value)} className="px-3 py-2 border border-border rounded-lg bg-input-background text-sm">{licenseStatuses.map((status) => <option key={status} value={status}>{status === 'All' ? 'All Status' : status}</option>)}</select>
              <button type="button" onClick={() => { setImportTab('license'); setShowImportDialog(true); }} className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-2"><FileUp className="w-4 h-4" />Import</button>
              <button type="button" onClick={() => exportToExcel('license')} className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-2"><FileDown className="w-4 h-4" />Export</button>
              <button type="button" onClick={() => { setLicenseFormRecord({ guid: '', id: '', number: '', organization: '', station: '', frequency: '', type: '', power: '', status: 'normal', startDate: '', endDate: '', licenseAuthorization: '', unit: '', category: '', law: '', coverage: '', process: '', code: '', decisionDate: '', decision: '', description: '', registration: '', address: '', phone: '', email: '', administrativeInfo: '', contactPerson: '' }); setLicenseDialogMode('add'); }} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"><Plus className="w-4 h-4" />Add</button>
            </div>
          </div>
          <table className="w-full">
            <thead className="sticky top-[60px] bg-card z-10">
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4">License</th>
                <th className="text-left py-3 px-4">License/Authorization</th>
                <th className="text-left py-3 px-4">Organization</th>
                <th className="text-left py-3 px-4">Category</th>
                <th className="text-left py-3 px-4">Type</th>
                <th className="text-left py-3 px-4">Start Date</th>
                <th className="text-left py-3 px-4">End Date</th>
                <th className="text-center py-3 px-4">Actions</th>
              </tr>
            </thead>
              <tbody key={licensePage.pageNum}>
                {paginatedLicenses.map((license) => (
                  <tr key={license.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium text-sm">{license.number || '-'}</td>
                    <td className="py-3 px-4 text-sm">{license.licenseAuthorization || '-'}</td>
                    <td className="py-3 px-4">{license.unit ?? license.organization}</td>
                    <td className="py-3 px-4">{license.category ?? license.type}</td>
                    <td className="py-3 px-4">{license.type}</td>
                    <td className="py-3 px-4 text-sm">{license.startDate}</td>
                    <td className="py-3 px-4 text-sm">{license.endDate}</td>
                    <td className="text-center py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button type="button" onClick={() => openDetail({ type: 'license', data: license })} className="p-1 hover:bg-muted rounded" title="Detail"><Eye className="w-4 h-4 text-slate-600" /></button>
                        <button type="button" onClick={() => openLicenseEdit(license)} className="p-1 hover:bg-muted rounded" title="Edit"><Edit className="w-4 h-4 text-primary" /></button>
                        <button type="button" onClick={async () => {
                          if (!confirm('确定要删除这条记录吗？')) return;
                          try {
                            await permitApi.delete(license.guid);
                            setLicenseRecords((prev) => prev.filter((item) => item.guid !== license.guid));
                          } catch { alert('删除失败'); }
                        }} className="p-1 hover:bg-muted rounded" title="Delete"><Trash2 className="w-4 h-4 text-red-500" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
          </table>
          {filteredLicenseData.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t border-border">
              <div className="text-sm text-muted-foreground">
                Total {filteredLicenseData.length} items
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={licensePage.pageSize}
                  onChange={(e) => handleLicensePageSizeChange(Number(e.target.value))}
                  className="px-3 py-1 border border-border rounded-lg bg-input-background text-sm"
                >
                  <option value={10}>10 条/页</option>
                  <option value={20}>20 条/页</option>
                  <option value={50}>50 条/页</option>
                </select>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handleLicensePageChange(licensePage.pageNum - 1)}
                        className={licensePage.pageNum <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <span className="px-3 py-1 text-sm">{licensePage.pageNum}</span>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handleLicensePageChange(licensePage.pageNum + 1)}
                        className={licensePage.pageNum >= Math.ceil(filteredLicenseData.length / DISPLAY_PAGE_SIZE) ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'planning' && (
        <div className="bg-card rounded-lg border border-border shadow-sm overflow-y-auto max-h-[calc(100vh-280px)]">
          <div className="flex items-center justify-between p-4 gap-4 sticky top-0 bg-card z-10 border-b border-border">
            <h3 className="text-lg font-semibold whitespace-nowrap">Planning Data Management</h3>
            <div className="flex items-center gap-2 flex-1 justify-end">
              <button type="button" onClick={() => { setImportTab('planning'); setShowImportDialog(true); }} className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-2"><FileUp className="w-4 h-4" />Import</button>
              <button type="button" onClick={() => exportToExcel('planning')} className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-2"><FileDown className="w-4 h-4" />Export</button>
              <button type="button" onClick={async () => {
                if (!confirm('确定要删除所有 Planning 数据吗？此操作不可恢复！')) return;
                if (!confirm('再次确认：删除所有 Planning 数据？')) return;
                try {
                  await planningApi.deleteAll();
                  await refreshPlanningData();
                  alert('所有 Planning 数据已删除');
                } catch (error) {
                  console.error('删除失败:', error);
                  alert('删除失败');
                }
              }} className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"><Trash2 className="w-4 h-4" />Delete All</button>
              <button type="button" onClick={() => { setPlanningFormRecord({ guid: '', category: '', subCategory: '', service: '', bandName: '', startFreq: 0, endFreq: 0, step: 0, bandwidth: 0, status: 'free', note: '', serviceType: '', bandType: '' }); setPlanningDialogMode('add'); }} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"><Plus className="w-4 h-4" />Add</button>
            </div>
          </div>
          <table className="w-full">
            <thead className="sticky top-[60px] bg-card z-10">
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4">Radioservices</th>
                <th className="text-left py-3 px-4">Subservices</th>
                <th className="text-left py-3 px-4">Level</th>
                  <th className="text-left py-3 px-4">Band Name</th>
                  <th className="text-left py-3 px-4">Start Frequency</th>
                  <th className="text-left py-3 px-4">End Frequency</th>
                  <th className="text-left py-3 px-4">Step</th>
                  <th className="text-left py-3 px-4">Signal Bandwidth</th>
                  <th className="text-left py-3 px-4">Service Type</th>
                  <th className="text-left py-3 px-4">Band Type</th>
                  <th className="text-left py-3 px-4">Notes</th>
                  <th className="text-center py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody key={planningPage.pageNum}>
                {paginatedPlans.map((plan) => (
                  <tr key={plan.guid} className="border-b border-border hover:bg-muted/50">
                     <td className="py-3 px-4">{plan.category}</td>
                    <td className="py-3 px-4">{plan.subCategory}</td>
                    <td className="py-3 px-4">{plan.service}</td>
                    <td className="py-3 px-4 font-medium">{plan.bandName}</td>
                    <td className="py-3 px-4">{plan.startFreq}</td>
                    <td className="py-3 px-4">{plan.endFreq}</td>
                    <td className="py-3 px-4">{plan.step}</td>
                    <td className="py-3 px-4">{plan.bandwidth}</td>
                    <td className="py-3 px-4">{serviceTypeOptions.find(o => o.value === plan.serviceType)?.label ?? plan.serviceType ?? '-'}</td>
                    <td className="py-3 px-4">{bandTypeOptions.find(o => o.value === plan.bandType)?.label ?? plan.bandType ?? '-'}</td>
                    <td className="py-3 px-4">{plan.note}</td>
                    <td className="text-center py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openPlanningEdit(plan)} className="p-1 hover:bg-muted rounded" title="Edit"><Edit className="w-4 h-4 text-primary" /></button>
                        <button onClick={() => deletePlanning(plan.guid)} className="p-1 hover:bg-muted rounded" title="Delete"><Trash2 className="w-4 h-4 text-red-500" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
          </table>
          {filteredPlanningData.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t border-border">
              <div className="text-sm text-muted-foreground">
                Total {filteredPlanningData.length} items
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={planningPage.pageSize}
                  onChange={(e) => handlePlanningPageSizeChange(Number(e.target.value))}
                  className="px-3 py-1 border border-border rounded-lg bg-input-background text-sm"
                >
                  <option value={10}>10 条/页</option>
                  <option value={20}>20 条/页</option>
                  <option value={50}>50 条/页</option>
                </select>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePlanningPageChange(planningPage.pageNum - 1)}
                        className={planningPage.pageNum <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <span className="px-3 py-1 text-sm">{planningPage.pageNum}</span>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePlanningPageChange(planningPage.pageNum + 1)}
                        className={planningPage.pageNum >= Math.ceil(filteredPlanningData.length / DISPLAY_PAGE_SIZE) ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          )}
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

      {showDetailDialog && detailRecord && detailRecord.type === 'station' && (
        <RecordDetailCard
          title="Station Detail"
          subtitle="Detailed station information"
          fields={[
            { label: 'Station Name', value: detailRecord.data.name },
            { label: 'Frequency License', value: detailRecord.data.frequencyLicense ?? '-' },
            { label: 'Technical Standard', value: detailRecord.data.technicalStandard ?? '-' },
            { label: 'Owner Name', value: detailRecord.data.ownedsite ?? '-' },
            { label: 'Backhaul Network Access Method', value: detailRecord.data.backhaulNetworkAccessMethod ?? '-' },
            { label: 'Station Purpose', value: detailRecord.data.stationPurpose ?? '-' },
            { label: 'Modulation Type', value: detailRecord.data.modulationType ?? '-' },
            { label: 'Station Type', value: detailRecord.data.type },
            { label: 'Transmit Frequency (MHz)', value: detailRecord.data.frequency },
            { label: 'Receive Frequency (MHz)', value: detailRecord.data.receiveFrequency ?? '-' },
            { label: 'Bandwidth', value: detailRecord.data.bandwidth ?? '-' },
            { label: 'Equipment Name and Model', value: detailRecord.data.equipmentNameAndModel ?? '-' },
            { label: 'Equipment Count', value: detailRecord.data.equipmentCount ?? '-' },
            { label: 'Equipment Output Power', value: detailRecord.data.equipmentPower ?? detailRecord.data.power ?? '-' },
            { label: 'Antenna Type', value: detailRecord.data.antenna ?? '-' },
            { label: 'Antenna Count', value: detailRecord.data.antennaCount ?? '-' },
            { label: 'Province', value: detailRecord.data.province ?? '-' },
            { label: 'Region', value: detailRecord.data.region },
            { label: 'Detailed Location', value: detailRecord.data.detailedLocation ?? '-' },
            { label: 'Status', value: statusLabel(detailRecord.data.status) },
            { label: 'Open Date', value: detailRecord.data.openDate ?? '-' },
            { label: 'Expire Date', value: detailRecord.data.expireDate },
            { label: 'Latitude', value: detailRecord.data.latitude ?? '-' },
            { label: 'Longitude', value: detailRecord.data.longitude ?? '-' },
          ]}
          onClose={() => setShowDetailDialog(false)}
          primaryActionLabel="Close"
        />
      )}

      {stationDialogMode && stationFormRecord && (
        <StationForm
          title={stationDialogMode === 'add' ? 'Add New Station' : 'Edit Station'}
          description={stationDialogMode === 'add' ? 'Create a new station using the same fields as the edit form.' : 'Update the full station record, including the extra fields from your second table.'}
          value={stationFormRecord}
          onChange={(data) => setStationFormRecord(data)}
          onClose={() => { setStationDialogMode(null); setStationFormRecord(null); }}
          onOpenCoordinatePicker={() => setCoordinatePickerOpen(true)}
          licenseOptions={licenseRecords}
          onSubmit={() => {
            if (!stationFormRecord.name || !stationFormRecord.ownedsite || !stationFormRecord.type || !stationFormRecord.province || !stationFormRecord.region || !stationFormRecord.frequency || !stationFormRecord.openDate || !stationFormRecord.expireDate || !stationFormRecord.latitude || !stationFormRecord.longitude) {
              alert('Please fill in all required fields: Station Name, Owner Name, Station Type, Province, Region, Transmit Frequency, Open Date, Expire Date, Latitude, Longitude');
              return;
            }
            // Validate numeric fields
            if (isNaN(parseFloat(stationFormRecord.frequency)) || parseFloat(stationFormRecord.frequency) <= 0) {
              alert('Transmit Frequency must be a valid positive number');
              return;
            }
            if (stationFormRecord.receiveFrequency && (isNaN(parseFloat(stationFormRecord.receiveFrequency)) || parseFloat(stationFormRecord.receiveFrequency) <= 0)) {
              alert('Receive Frequency must be a valid positive number');
              return;
            }
            if (stationFormRecord.bandwidth && (isNaN(parseFloat(stationFormRecord.bandwidth)) || parseFloat(stationFormRecord.bandwidth) <= 0)) {
              alert('Bandwidth must be a valid positive number');
              return;
            }
            if (stationFormRecord.equipmentCount && (isNaN(parseInt(stationFormRecord.equipmentCount)) || parseInt(stationFormRecord.equipmentCount) <= 0)) {
              alert('Equipment Count must be a valid positive integer');
              return;
            }
            if (stationFormRecord.equipmentPower && (isNaN(parseFloat(stationFormRecord.equipmentPower)) || parseFloat(stationFormRecord.equipmentPower) <= 0)) {
              alert('Equipment Output Power must be a valid positive number');
              return;
            }
            if (stationFormRecord.antennaCount && (isNaN(parseInt(stationFormRecord.antennaCount)) || parseInt(stationFormRecord.antennaCount) <= 0)) {
              alert('Antenna Count must be a valid positive integer');
              return;
            }
            if (stationDialogMode === 'add') {
              (async () => {
                try {
                  const payload = {
                    type: stationFormRecord.type,
                    stationtype: stationFormRecord.type,
                    province: stationFormRecord.province ?? '',
                    district: stationFormRecord.region,
                    location: stationFormRecord.detailedLocation ?? '',
                    sitename: stationFormRecord.name,
                    devicemodel: stationFormRecord.equipmentNameAndModel ?? '',
                    devicequantity: stationFormRecord.equipmentCount ? parseInt(stationFormRecord.equipmentCount) : undefined,
                    outputpower: stationFormRecord.equipmentPower ? parseFloat(stationFormRecord.equipmentPower) : undefined,
                    anttype: stationFormRecord.antenna ?? '',
                    antquantity: stationFormRecord.antennaCount ? parseInt(stationFormRecord.antennaCount) : undefined,
                    technology: stationFormRecord.technicalStandard ?? '',
                    backbone: stationFormRecord.backhaulNetworkAccessMethod ?? '',
                    stationpurpose: stationFormRecord.stationPurpose ?? '',
                    modulation: stationFormRecord.modulationType ?? '',
                    startdate: stationFormRecord.openDate || undefined,
                    expirationdate: stationFormRecord.expireDate || undefined,
                    longitude: stationFormRecord.longitude ? parseFloat(stationFormRecord.longitude) : undefined,
                    latitude: stationFormRecord.latitude ? parseFloat(stationFormRecord.latitude) : undefined,
                    unit: stationFormRecord.ownedsite ?? '',
                    equipname: stationFormRecord.equipmentNameAndModel ?? '',
                    frequencyLicense: stationFormRecord.frequencyLicense ?? '',
                    frequencyt: stationFormRecord.frequency ? parseFloat(stationFormRecord.frequency) : undefined,
                    frequencyr: stationFormRecord.receiveFrequency ? parseFloat(stationFormRecord.receiveFrequency) : undefined,
                    bandwidth: stationFormRecord.bandwidth ? parseFloat(stationFormRecord.bandwidth) : undefined,
                    ownedsite: stationFormRecord.ownedsite ?? '',
                    bbumodel: stationFormRecord.bbuModel ?? '',
                  };
                  await stationApi.create(payload);
                  await refreshStationData();
                  await refreshLicenseData();
                } catch (error) {
                  console.error('Failed to add station:', error);
                  alert('添加失败');
                  return;
                }
                setStationDialogMode(null);
                setStationFormRecord(null);
              })();
            } else {
              saveStationEdit();
            }
          }}
          submitLabel={stationDialogMode === 'add' ? 'Add Station' : 'Save Changes'}
        />
      )}

      {stationDialogMode && stationFormRecord && (
        <CoordinatePicker
          open={coordinatePickerOpen}
          value={{
            lat: stationFormRecord.latitude ? parseFloat(stationFormRecord.latitude) : null,
            lng: stationFormRecord.longitude ? parseFloat(stationFormRecord.longitude) : null,
          }}
          onConfirm={(lat, lng) => {
            setStationFormRecord(prev => prev ? {
              ...prev,
              latitude: lat.toString(),
              longitude: lng.toString(),
            } : prev);
            setCoordinatePickerOpen(false);
          }}
          onCancel={() => setCoordinatePickerOpen(false)}
        />
      )}

      {licenseDialogMode && licenseFormRecord && (
        <LicenseForm
          title={licenseDialogMode === 'add' ? 'Add License' : 'Edit License'}
          description="Use the authorization parameters from the detail table."
          value={licenseFormRecord}
          onChange={(data) => setLicenseFormRecord(data)}
          onClose={() => { setLicenseDialogMode(null); setLicenseFormRecord(null); }}
          onSubmit={() => {
            if (licenseDialogMode === 'add') {
              if (!licenseFormRecord.unit || !licenseFormRecord.category || !licenseFormRecord.type || !licenseFormRecord.startDate || !licenseFormRecord.endDate) {
                alert('Please fill in all required fields: Organization, Category, Type, Start Date, End Date');
                return;
              }
              (async () => {
                try {
                  await permitApi.create({
                    consent: licenseFormRecord.licenseAuthorization ?? '',
                    interlocutor: licenseFormRecord.organization || (licenseFormRecord.unit ?? ''),
                    category: licenseFormRecord.category ?? '',
                    legal: licenseFormRecord.law ?? '',
                    type: licenseFormRecord.type ?? '',
                    startdate: licenseFormRecord.startDate || undefined,
                    enddate: licenseFormRecord.endDate || undefined,
                    scope: licenseFormRecord.coverage ?? licenseFormRecord.frequency ?? '',
                    process: licenseFormRecord.process ?? '',
                    status: licenseFormRecord.status ?? 'active',
                    code: licenseFormRecord.code ?? '',
                    decisiondate: licenseFormRecord.decisionDate || undefined,
                    decision: licenseFormRecord.decision ?? '',
                    note: licenseFormRecord.description ?? '',
                    register: licenseFormRecord.registration ?? '',
                    address: licenseFormRecord.address ?? '',
                    phone: licenseFormRecord.phone ?? '',
                    email: licenseFormRecord.email ?? '',
                    administrativeinfo: licenseFormRecord.administrativeInfo ?? '',
                    directorname: licenseFormRecord.contactPerson ?? '',
                  });
                  await refreshLicenseData();
                } catch { alert('添加失败'); return; }
                setLicenseDialogMode(null);
                setLicenseFormRecord(null);
              })();
            } else {
              (async () => {
                try {
                  await permitApi.update(licenseFormRecord.guid, {
                    consent: licenseFormRecord.licenseAuthorization ?? '',
                    interlocutor: licenseFormRecord.organization || (licenseFormRecord.unit ?? ''),
                    category: licenseFormRecord.category ?? '',
                    legal: licenseFormRecord.law ?? '',
                    type: licenseFormRecord.type ?? '',
                    startdate: licenseFormRecord.startDate || undefined,
                    enddate: licenseFormRecord.endDate || undefined,
                    scope: licenseFormRecord.coverage ?? licenseFormRecord.frequency ?? '',
                    process: licenseFormRecord.process ?? '',
                    status: licenseFormRecord.status ?? 'active',
                    code: licenseFormRecord.code ?? '',
                    decisiondate: licenseFormRecord.decisionDate || undefined,
                    decision: licenseFormRecord.decision ?? '',
                    note: licenseFormRecord.description ?? '',
                    register: licenseFormRecord.registration ?? '',
                    address: licenseFormRecord.address ?? '',
                    phone: licenseFormRecord.phone ?? '',
                    email: licenseFormRecord.email ?? '',
                    administrativeinfo: licenseFormRecord.administrativeInfo ?? '',
                    directorname: licenseFormRecord.contactPerson ?? '',
                  });
                  await refreshLicenseData();
                } catch { alert('保存失败'); return; }
                setLicenseDialogMode(null);
                setLicenseFormRecord(null);
              })();
            }
          }}
          submitLabel={licenseDialogMode === 'add' ? 'Add License' : 'Save Changes'}
        />
      )}

      {showImportDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-card shadow-2xl border border-border">
            <div className="flex items-center justify-between border-b border-border p-6">
              <h3 className="text-xl font-semibold">Import Excel</h3>
              <button type="button" onClick={() => { setShowImportDialog(false); setImportFile(null); }} className="p-2 hover:bg-muted rounded-lg transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-2">
                {(['station', 'license', 'planning'] as DataTab[]).map((tab) => (
                  <button key={tab} type="button" onClick={() => setImportTab(tab)} className={`px-4 py-2 rounded-lg border ${importTab === tab ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}>
                    {tab === 'station' ? 'Station Data' : tab === 'license' ? 'License Data' : 'Planning Data'}
                  </button>
                ))}
              </div>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <input type="file" accept=".xlsx,.xls" onChange={(e) => setImportFile(e.target.files?.[0] ?? null)} className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  {importFile ? <div><p className="text-sm font-medium mb-1">{importFile.name}</p><p className="text-xs text-muted-foreground">{(importFile.size / 1024).toFixed(2)} KB</p></div> : <div><p className="text-sm text-muted-foreground mb-1">Click to upload or drag and drop</p><p className="text-xs text-muted-foreground">Excel files only (.xlsx, .xls)</p></div>}
                </label>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-4 py-3">
                <div className="text-sm text-muted-foreground">
                  没有模板？先下载导入模板后再填写数据
                </div>
                <button
                  type="button"
                  onClick={downloadImportTemplate}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  下载导入模板
                </button>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowImportDialog(false); setImportFile(null); }} className="px-5 py-2 border border-border rounded-lg hover:bg-muted transition-colors">Cancel</button>
                <button type="button" onClick={importFromExcel} disabled={!importFile} className="px-5 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">Import Data</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showExportDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-card shadow-2xl border border-border">
            <div className="flex items-center justify-between border-b border-border p-6">
              <h3 className="text-xl font-semibold">Export Station Data</h3>
              <button type="button" onClick={() => setShowExportDialog(false)} className="p-2 hover:bg-muted rounded-lg transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-3">Select fields to export (in input form order):</h4>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto border border-border rounded-lg p-3">
                  {stationExportFields.map((field) => (
                    <label key={field.key} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={exportOptions.fields.includes(field.key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setExportOptions(prev => ({
                              ...prev,
                              fields: [...prev.fields, field.key]
                            }));
                          } else {
                            setExportOptions(prev => ({
                              ...prev,
                              fields: prev.fields.filter(f => f !== field.key)
                            }));
                          }
                        }}
                        className="rounded border-border"
                      />
                      <span>{field.label}</span>
                      {field.required && <span className="text-red-500 text-xs">*</span>}
                    </label>
                  ))}
                </div>
              </div>
              {exportOptions.fields.length > 0 && stationRecords.length > 0 && (
                <div className="border border-border rounded-lg p-3 mt-4">
                  <h4 className="text-sm font-medium mb-2">Preview (first 3 rows):</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          {exportOptions.fields.slice(0, 5).map(field => (
                            <th key={field} className="text-left py-1 px-2 font-medium">{stationExportFields.find(f => f.key === field)?.label}</th>
                          ))}
                          {exportOptions.fields.length > 5 && <th className="text-left py-1 px-2">...</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {stationRecords.slice(0, 3).map((record, idx) => (
                          <tr key={idx} className="border-b border-border">
                            {exportOptions.fields.slice(0, 5).map(field => (
                              <td key={field} className="py-1 px-2">{(record as any)[field] ?? '-'}</td>
                            ))}
                            {exportOptions.fields.length > 5 && <td className="py-1 px-2">...</td>}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  {exportOptions.fields.length} field(s) selected
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setExportOptions(prev => ({ ...prev, fields: stationExportFields.map(f => f.key) }))}
                    className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportOptions(prev => ({ ...prev, fields: stationExportFields.filter(f => f.required).map(f => f.key) }))}
                    className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm"
                  >
                    Select Required Only
                  </button>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowExportDialog(false)} className="px-5 py-2 border border-border rounded-lg hover:bg-muted transition-colors">Cancel</button>
                <button
                  type="button"
                  onClick={() => {
                    if (exportOptions.fields.length === 0) {
                      alert('Please select at least one field to export');
                      return;
                    }
                    const data = stationRecords;
                    const fieldLabelMap: Record<string, string> = {};
                    stationExportFields.forEach(f => { fieldLabelMap[f.key] = f.label; });
                    const headerRow = exportOptions.fields.map((field) => fieldLabelMap[field] ?? String(field));
                    const rows = data.map((item) => exportOptions.fields.map((field) => (item as any)[field] ?? ''));
                    const worksheet = XLSX.utils.aoa_to_sheet([headerRow, ...rows]);
                    const workbook = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(workbook, worksheet, 'Station Data');
                    XLSX.writeFile(workbook, `station-data-${new Date().toISOString().split('T')[0]}.xlsx`);
                    setShowExportDialog(false);
                  }}
                  className="px-5 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                >
                  Export Excel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}

import { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { Plus, Edit, Trash2, FileUp, FileDown, X, Upload, Download, Search, Eye, ArrowLeft, ChevronRight, Info } from 'lucide-react';
import { RecordDetailCard } from './RecordDetailCard';
import { LicenseForm } from './LicenseForm';

type DataTab = 'station' | 'license' | 'planning';


type StationRecord = {
  id: number;
  name: string;
  type: string;
  region: string;
  province?: string;
  detailedLocation?: string;
  frequency: string;
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
  bandwidthProcessingUnitModel?: string;
  ownerName?: string;
  backhaulNetworkAccessMethod?: string;
  stationPurpose?: string;
  modulationType?: string;
  antennaCount?: string;
  equipmentNameAndModel?: string;
};

type LicenseRecord = {
  id: number;
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
  id: number;
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
};

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
};

const stationFields: (keyof StationRecord)[] = ['name', 'type', 'region', 'province', 'detailedLocation', 'frequency', 'status', 'openDate', 'expireDate', 'latitude', 'longitude', 'power', 'antenna', 'equipmentCount', 'equipmentPower', 'technicalStandard', 'bandwidthProcessingUnitModel', 'ownerName', 'backhaulNetworkAccessMethod', 'stationPurpose', 'modulationType', 'antennaCount', 'equipmentNameAndModel'];
const licenseFields: (keyof LicenseRecord)[] = ['number', 'organization', 'station', 'frequency', 'type', 'power', 'status', 'startDate', 'endDate', 'licenseAuthorization', 'unit', 'category', 'law', 'coverage', 'process', 'code', 'decisionDate', 'decision', 'description', 'registration', 'address', 'phone', 'email', 'administrativeInfo', 'contactPerson'];
const planningFields: (keyof FrequencyBand)[] = ['category', 'subCategory', 'service', 'bandName', 'startFreq', 'endFreq', 'step', 'bandwidth', 'status', 'note'];

type StationFormProps = {
  title: string;
  description: string;
  value: StationRecord;
  onChange: (value: StationRecord) => void;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel: string;
};

function StationForm({ title, description, value, onChange, onClose, onSubmit, submitLabel }: StationFormProps) {
  const update = <K extends keyof StationRecord>(key: K, next: StationRecord[K]) => onChange({ ...value, [key]: next });
  const updateMany = (patch: Partial<StationRecord>) => onChange({ ...value, ...patch });

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
            <div className="md:col-span-2"><label className="block text-sm font-medium mb-2">Station Name</label><input value={value.name} onChange={(e) => update('name', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium mb-2">Technical Standard</label><input value={value.technicalStandard ?? ''} onChange={(e) => update('technicalStandard', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium mb-2">Bandwidth Processing Unit Model</label><input value={value.bandwidthProcessingUnitModel ?? ''} onChange={(e) => update('bandwidthProcessingUnitModel', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium mb-2">Owner Name</label><input value={value.ownerName ?? ''} onChange={(e) => update('ownerName', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium mb-2">Backhaul Network Access Method</label><input value={value.backhaulNetworkAccessMethod ?? ''} onChange={(e) => update('backhaulNetworkAccessMethod', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium mb-2">Station Purpose</label><input value={value.stationPurpose ?? ''} onChange={(e) => update('stationPurpose', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium mb-2">Modulation Type</label><input value={value.modulationType ?? ''} onChange={(e) => update('modulationType', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium mb-2">Station Type</label><input value={value.type} onChange={(e) => update('type', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium mb-2">Transmit Frequency</label><input value={value.frequency} onChange={(e) => update('frequency', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium mb-2">Receive Frequency</label><input value={value.frequency} onChange={(e) => update('frequency', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium mb-2">Equipment Name and Model</label><input value={value.equipmentNameAndModel ?? ''} onChange={(e) => update('equipmentNameAndModel', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium mb-2">Equipment Count</label><input value={value.equipmentCount ?? ''} onChange={(e) => update('equipmentCount', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium mb-2">Equipment Output Power</label><input value={value.equipmentPower ?? value.power ?? ''} onChange={(e) => updateMany({ equipmentPower: e.target.value, power: e.target.value })} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium mb-2">Antenna Type</label><input value={value.antenna ?? ''} onChange={(e) => update('antenna', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium mb-2">Antenna Count</label><input value={value.antennaCount ?? ''} onChange={(e) => update('antennaCount', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium mb-2">Province</label><input value={value.province ?? ''} onChange={(e) => update('province', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium mb-2">Region</label><input value={value.region} onChange={(e) => update('region', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium mb-2">Detailed Location</label><input value={value.detailedLocation ?? ''} onChange={(e) => update('detailedLocation', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium mb-2">Status</label><select value={value.status} onChange={(e) => update('status', e.target.value as StationRecord['status'])} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"><option value="normal">Normal</option><option value="expiring">Expiring</option><option value="expired">Expired</option></select></div>
            <div><label className="block text-sm font-medium mb-2">Open Date</label><input type="date" value={value.openDate ?? ''} onChange={(e) => update('openDate', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium mb-2">Expire Date</label><input type="date" value={value.expireDate} onChange={(e) => update('expireDate', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium mb-2">Latitude</label><input value={value.latitude ?? ''} onChange={(e) => update('latitude', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium mb-2">Longitude</label><input value={value.longitude ?? ''} onChange={(e) => update('longitude', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
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

function PlanningForm({ title, description, value, onChange, onClose, onSubmit, submitLabel }: PlanningFormProps) {
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
            <div><label className="block text-sm font-medium mb-2">Frequency Band</label><input value={value.bandName} onChange={(e) => update('bandName', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium mb-2">ITU Region 1 Allocation</label><input value={value.subCategory} onChange={(e) => update('subCategory', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium mb-2">National Allocation</label><input value={value.category} onChange={(e) => update('category', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium mb-2">Utilization</label><input value={value.service} onChange={(e) => update('service', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium mb-2">Special Conditions</label><textarea value={value.note} onChange={(e) => update('note', e.target.value)} rows={4} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
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
  const [exportOptions, setExportOptions] = useState({ format: 'xlsx', range: 'all', fields: ['all'] });
  const [newStation, setNewStation] = useState({
    name: '',
    type: '',
    region: '',
    province: '',
    detailedLocation: '',
    frequency: '',
    status: 'normal',
    openDate: '',
    expireDate: '',
    latitude: '',
    longitude: '',
    power: '',
    antenna: '',
    equipmentCount: '',
    equipmentPower: '',
    technicalStandard: '',
    bandwidthProcessingUnitModel: '',
    ownerName: '',
    backhaulNetworkAccessMethod: '',
    stationPurpose: '',
    modulationType: '',
    antennaCount: '',
    equipmentNameAndModel: '',
  });

  const [stationRecords, setStationRecords] = useState<StationRecord[]>([
    {
      id: 1,
      name: 'Ulaanbaatar Central A',
      type: 'Mobile',
      region: 'Ulaanbaatar',
      province: 'Ulaanbaatar',
      detailedLocation: 'Peace Avenue 12, SBD',
      frequency: '1800-1900 MHz',
      status: 'normal',
      openDate: '2024-01-01',
      expireDate: '2027-12-31',
      latitude: '47.9189',
      longitude: '106.9170',
      power: '50W',
      antenna: 'Directional',
      equipmentCount: '12',
      equipmentPower: '50W',
      technicalStandard: 'LTE',
      bandwidthProcessingUnitModel: 'BBU-3900',
      ownerName: 'Mongolia Telecom',
      backhaulNetworkAccessMethod: 'Fiber',
      stationPurpose: 'Public mobile service',
      modulationType: 'QAM',
      antennaCount: '4',
      equipmentNameAndModel: 'Ericsson RBS 6601',
    },
    {
      id: 2,
      name: 'Dornogovi Station B',
      type: 'Broadcasting',
      region: 'Dornogovi',
      province: 'Dornogovi',
      detailedLocation: 'Sainshand District North',
      frequency: '470-862 MHz',
      status: 'expiring',
      openDate: '2023-04-15',
      expireDate: '2026-05-22',
      latitude: '44.9635',
      longitude: '110.1502',
      power: '100W',
      antenna: 'Omnidirectional',
      equipmentCount: '8',
      equipmentPower: '100W',
      technicalStandard: 'DVB-T2',
      bandwidthProcessingUnitModel: 'TX-8800',
      ownerName: 'National Broadcasting',
      backhaulNetworkAccessMethod: 'Microwave',
      stationPurpose: 'Regional broadcast coverage',
      modulationType: 'OFDM',
      antennaCount: '2',
      equipmentNameAndModel: 'Rohde & Schwarz NH7300',
    },
  ]);
  const [licenseRecords, setLicenseRecords] = useState<LicenseRecord[]>([
    { id: 1, number: 'LIC-2024-001580', organization: 'Mongolia Telecom', station: 'Ulaanbaatar Central A', frequency: '1800-1850 MHz', type: 'Mobile', power: '50W', status: 'normal', startDate: '2024-01-01', endDate: '2027-12-31', licenseAuthorization: 'Yes', unit: 'Mongolia Telecom', category: 'Mobile', law: 'Telecom Law', coverage: 'Ulaanbaatar', process: 'Approved', code: '001580', decisionDate: '2024-01-01', decision: 'Granted', description: 'Frequency authorization', registration: 'Mongolia Telecom', address: 'Ulaanbaatar Central A', phone: '-', email: '-', administrativeInfo: '-', contactPerson: '-' },
    { id: 2, number: 'LIC-2024-000890', organization: 'Mongolia Broadcasting', station: 'Dornogovi Station B', frequency: '470-478 MHz', type: 'Broadcasting', power: '100W', status: 'expiring', startDate: '2023-06-01', endDate: '2026-05-31', licenseAuthorization: 'Yes', unit: 'Mongolia Broadcasting', category: 'Broadcasting', law: 'Broadcast Law', coverage: 'Dornogovi', process: 'Approved', code: '000890', decisionDate: '2023-06-01', decision: 'Granted', description: 'Frequency authorization', registration: 'Mongolia Broadcasting', address: 'Dornogovi Station B', phone: '-', email: '-', administrativeInfo: '-', contactPerson: '-' },
  ]);
  const [planningRecords, setPlanningRecords] = useState<FrequencyBand[]>([
    { id: 1, category: 'Mobile', subCategory: 'LTE/5G', service: 'Primary', bandName: 'Band 3', startFreq: 1710, endFreq: 1785, step: 5, bandwidth: 5, status: 'occupied', note: 'ITU Allocation' },
    { id: 2, category: 'Broadcasting', subCategory: 'DVB-T', service: 'Primary', bandName: 'UHF', startFreq: 470, endFreq: 862, step: 8, bandwidth: 8, status: 'occupied', note: 'Broadcast allocation' },
    { id: 3, category: 'Fixed', subCategory: 'Microwave', service: 'Secondary', bandName: 'C-Band', startFreq: 3700, endFreq: 4200, step: 40, bandwidth: 40, status: 'occupied', note: 'Point-to-point links' },
    { id: 4, category: 'Satellite', subCategory: 'Ku-Band', service: 'Primary', bandName: 'DBS', startFreq: 11700, endFreq: 12200, step: 27, bandwidth: 27, status: 'occupied', note: 'Satellite downlink' },
    { id: 5, category: 'Unallocated', subCategory: '-', service: '-', bandName: 'Reserved', startFreq: 2300, endFreq: 2400, step: 0, bandwidth: 0, status: 'free', note: 'Reserved for future coordination' },
  ]);

  const licenseUnits = useMemo(() => ['All', ...Array.from(new Set(licenseRecords.map((item) => item.organization))).sort()], [licenseRecords]);
  const licenseRegions = useMemo(() => ['All', ...Array.from(new Set(stationRecords.map((item) => item.region))).sort()], [stationRecords]);
  const licenseBands = useMemo(() => ['All', '470-862 MHz', '1800-1900 MHz', '3400-3600 MHz', '5925-6425 MHz', '11.7-12.2 GHz'], []);
  const licenseStatuses = useMemo(() => ['All', 'Normal', 'Expiring', 'Expired'], []);

  const filteredLicenseData = useMemo(() => licenseRecords.filter((license) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || [license.number, license.organization, license.station, license.frequency, license.type].some((value) => value.toLowerCase().includes(q));
    const matchesUnit = licenseUnitFilter === 'All' || license.organization === licenseUnitFilter;
    const matchesRegion = licenseRegionFilter === 'All' || stationRecords.find((station) => station.name === license.station)?.region === licenseRegionFilter;
    const matchesBand = licenseBandFilter === 'All' || license.frequency === licenseBandFilter;
    const matchesStatus = licenseStatusFilter === 'All' || license.status.toLowerCase() === licenseStatusFilter.toLowerCase();
    return matchesSearch && matchesUnit && matchesRegion && matchesBand && matchesStatus;
  }), [licenseBandFilter, licenseRegionFilter, licenseRecords, licenseStatusFilter, licenseUnitFilter, searchTerm, stationRecords]);

  const planningSheet = useMemo(() => planningRecords.map((item) => ({ ...item })), [planningRecords]);
  const planningFieldMap = useMemo(() => ({
    bandName: 'Frequency Band',
    subCategory: 'ITU Region 1 Allocation',
    category: 'National Allocation',
    service: 'Utilization',
    note: 'Special Conditions',
  }), []);

  const openDetail = (record: DetailRecord) => {
    setDetailRecord(record);
    setShowDetailDialog(true);
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

  const savePlanningEdit = () => {
    if (!planningFormRecord) return;
    setPlanningRecords((prev) => prev.map((item) => (
      item.id === planningFormRecord.id ? planningFormRecord : item
    )));
    setPlanningDialogMode(null);
    setPlanningFormRecord(null);
  };

  const openLicenseEdit = (record: LicenseRecord) => {
    setLicenseFormRecord(record);
    setLicenseDialogMode('edit');
  };

  const saveStationEdit = () => {
    if (!stationFormRecord) return;
    setStationRecords((prev) => prev.map((item) => (
      item.id === stationFormRecord.id ? stationFormRecord : item
    )));
    setStationDialogMode(null);
    setStationFormRecord(null);
  };

  const statusLabel = (status: string) => status === 'normal' ? 'Normal' : status === 'expiring' ? 'Expiring' : 'Expired';
  const statusClass = (status: string) => status === 'normal' ? 'bg-green-100 text-green-700' : status === 'expiring' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';

  const exportToExcel = (tab: DataTab) => {
    const data = tab === 'station' ? stationRecords : tab === 'license' ? licenseRecords : planningRecords;
    const fields = tab === 'station' ? stationFields : tab === 'license' ? licenseFields : planningFields;
    const rows = data.map((item) => fields.map((field) => (item as any)[field] ?? ''));
    const worksheet = XLSX.utils.aoa_to_sheet([fields.map((field) => tab === 'planning' ? planningFieldMap[field as keyof FrequencyBand] ?? String(field) : String(field)), ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, tab);
    XLSX.writeFile(workbook, `${tab}-data.xlsx`);
  };

  const importFromExcel = async () => {
    if (!importFile) return;
    const buffer = await importFile.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });
    if (importTab === 'station') {
      setStationRecords(rows.map((row, index) => ({
        id: Date.now() + index,
        name: String(row.name ?? row.Name ?? ''),
        type: String(row.type ?? row.Type ?? ''),
        region: String(row.region ?? row.Region ?? ''),
        province: String(row.province ?? row.Province ?? ''),
        detailedLocation: String(row.detailedLocation ?? row['Detailed Location'] ?? ''),
        frequency: String(row.frequency ?? row.Frequency ?? ''),
        status: (String(row.status ?? row.Status ?? 'normal').toLowerCase() as StationRecord['status']),
        openDate: String(row.openDate ?? row['Open Date'] ?? ''),
        expireDate: String(row.expireDate ?? row['Expire Date'] ?? ''),
        latitude: String(row.latitude ?? row.Latitude ?? ''),
        longitude: String(row.longitude ?? row.Longitude ?? ''),
        power: String(row.power ?? row.Power ?? ''),
        antenna: String(row.antenna ?? row['Antenna Type'] ?? ''),
        equipmentCount: String(row.equipmentCount ?? row['Equipment Count'] ?? ''),
        equipmentPower: String(row.equipmentPower ?? row['Equipment Output Power'] ?? ''),
        technicalStandard: String(row.technicalStandard ?? row['Technical Standard'] ?? ''),
        bandwidthProcessingUnitModel: String(row.bandwidthProcessingUnitModel ?? row['Bandwidth Processing Unit Model'] ?? ''),
        ownerName: String(row.ownerName ?? row['Owner Name'] ?? ''),
        backhaulNetworkAccessMethod: String(row.backhaulNetworkAccessMethod ?? row['Backhaul Network Access Method'] ?? ''),
        stationPurpose: String(row.stationPurpose ?? row['Station Purpose'] ?? ''),
        modulationType: String(row.modulationType ?? row['Modulation Type'] ?? ''),
        antennaCount: String(row.antennaCount ?? row['Antenna Count'] ?? ''),
        equipmentNameAndModel: String(row.equipmentNameAndModel ?? row['Equipment Name and Model'] ?? ''),
      })));
    }
    if (importTab === 'license') {
      setLicenseRecords(rows.map((row, index) => ({
        id: Date.now() + index,
        number: String(row.number ?? row.Number ?? ''),
        organization: String(row.organization ?? row.Organization ?? ''),
        station: String(row.station ?? row.Station ?? ''),
        frequency: String(row.frequency ?? row.Frequency ?? ''),
        type: String(row.type ?? row.Type ?? ''),
        power: String(row.power ?? row.Power ?? ''),
        status: (String(row.status ?? row.Status ?? 'normal').toLowerCase() as LicenseRecord['status']),
        startDate: String(row.startDate ?? row['Start Date'] ?? ''),
        endDate: String(row.endDate ?? row['End Date'] ?? ''),
        licenseAuthorization: String(row.licenseAuthorization ?? row['License / Authorization'] ?? ''),
        unit: String(row.unit ?? row.Unit ?? ''),
        category: String(row.category ?? row.Category ?? ''),
        law: String(row.law ?? row.Law ?? ''),
        coverage: String(row.coverage ?? row['Coverage Range'] ?? ''),
        process: String(row.process ?? row.Process ?? ''),
        code: String(row.code ?? row['Code / No.'] ?? ''),
        decisionDate: String(row.decisionDate ?? row['Decision Date'] ?? ''),
        decision: String(row.decision ?? row.Decision ?? ''),
        description: String(row.description ?? row.Description ?? ''),
        registration: String(row.registration ?? row.Registration ?? ''),
        address: String(row.address ?? row.Address ?? ''),
        phone: String(row.phone ?? row.Phone ?? ''),
        email: String(row.email ?? row.Email ?? ''),
        administrativeInfo: String(row.administrativeInfo ?? row['Administrative Info'] ?? ''),
        contactPerson: String(row.contactPerson ?? row['Contact Person'] ?? ''),
      })));
    }
    if (importTab === 'planning') {
      setPlanningRecords(rows.map((row, index) => ({
        id: Date.now() + index,
        category: String(row.category ?? row.Category ?? ''),
        subCategory: String(row.subCategory ?? row.Subcategory ?? ''),
        service: String(row.service ?? row.Service ?? ''),
        bandName: String(row.bandName ?? row['Band Name'] ?? ''),
        startFreq: Number(row.startFreq ?? row['Start Freq'] ?? 0),
        endFreq: Number(row.endFreq ?? row['End Freq'] ?? 0),
        step: Number(row.step ?? row.Step ?? 0),
        bandwidth: Number(row.bandwidth ?? row.Bandwidth ?? 0),
        status: String(row.status ?? row.Status ?? 'free') as FrequencyBand['status'],
        note: String(row.note ?? row.Note ?? ''),
      })));
    }
    setShowImportDialog(false);
    setImportFile(null);
  };

  return (
    <div className="space-y-6">
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
        <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Station Data Management</h3>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => { setImportTab('station'); setShowImportDialog(true); }} className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-2"><FileUp className="w-4 h-4" />Import Excel</button>
              <button type="button" onClick={() => exportToExcel('station')} className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-2"><FileDown className="w-4 h-4" />Export Excel</button>
              <button type="button" onClick={() => { setStationFormRecord({ id: Date.now(), name: '', type: '', region: '', province: '', detailedLocation: '', frequency: '', status: 'normal', openDate: '', expireDate: '', latitude: '', longitude: '', power: '', antenna: '', equipmentCount: '', equipmentPower: '', technicalStandard: '', bandwidthProcessingUnitModel: '', ownerName: '', backhaulNetworkAccessMethod: '', stationPurpose: '', modulationType: '', antennaCount: '', equipmentNameAndModel: '' }); setStationDialogMode('add'); }} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"><Plus className="w-4 h-4" />Add Station</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"><div className="md:col-span-2 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input type="text" placeholder="Search station name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div></div>
          <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-border"><th className="text-left py-3 px-4">Station Name</th><th className="text-left py-3 px-4">Station Type</th><th className="text-left py-3 px-4">Region</th><th className="text-left py-3 px-4">Frequency Range</th><th className="text-center py-3 px-4">Status</th><th className="text-center py-3 px-4">Actions</th></tr></thead><tbody>{stationRecords.filter((s) => !searchTerm || [s.name, s.type, s.region, s.frequency].some((v) => v.toLowerCase().includes(searchTerm.toLowerCase()))).map((station) => <tr key={station.id} className="border-b border-border hover:bg-muted/50"><td className="py-3 px-4 font-medium">{station.name}</td><td className="py-3 px-4">{station.type}</td><td className="py-3 px-4">{station.region}</td><td className="py-3 px-4 text-sm">{station.frequency}</td><td className="text-center py-3 px-4"><span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${statusClass(station.status)}`}>{statusLabel(station.status)}</span></td><td className="text-center py-3 px-4"><div className="flex items-center justify-center gap-2"><button onClick={() => openDetail({ type: 'station', data: station })} className="p-1 hover:bg-muted rounded" title="Detail"><Eye className="w-4 h-4 text-slate-600" /></button><button onClick={() => openEdit({ type: 'station', data: station })} className="p-1 hover:bg-muted rounded" title="Edit"><Edit className="w-4 h-4 text-primary" /></button><button className="p-1 hover:bg-muted rounded" title="Delete"><Trash2 className="w-4 h-4 text-red-500" /></button></div></td></tr>)}</tbody></table></div>
        </div>
      )}

      {activeTab === 'license' && (
        <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">License Data Management</h3>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => { setImportTab('license'); setShowImportDialog(true); }} className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-2"><FileUp className="w-4 h-4" />Import Excel</button>
              <button type="button" onClick={() => exportToExcel('license')} className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-2"><FileDown className="w-4 h-4" />Export Excel</button>
              <button type="button" onClick={() => { setLicenseFormRecord({ id: Date.now(), number: '', organization: '', station: '', frequency: '', type: '', power: '', status: 'normal', startDate: '', endDate: '', licenseAuthorization: '', unit: '', category: '', law: '', coverage: '', process: '', code: '', decisionDate: '', decision: '', description: '', registration: '', address: '', phone: '', email: '', administrativeInfo: '', contactPerson: '' }); setLicenseDialogMode('add'); }} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"><Plus className="w-4 h-4" />Add License</button>
            </div>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 mb-6"><div className="xl:col-span-3 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input type="text" placeholder="Search license number, organization, or station..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div><select value={licenseUnitFilter} onChange={(e) => setLicenseUnitFilter(e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background xl:col-span-2">{licenseUnits.map((unit) => <option key={unit} value={unit}>{unit === 'All' ? 'All Units' : unit}</option>)}</select><select value={licenseRegionFilter} onChange={(e) => setLicenseRegionFilter(e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background xl:col-span-2">{licenseRegions.map((region) => <option key={region} value={region}>{region === 'All' ? 'All Regions' : region}</option>)}</select><select value={licenseBandFilter} onChange={(e) => setLicenseBandFilter(e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background xl:col-span-2">{licenseBands.map((band) => <option key={band} value={band}>{band === 'All' ? 'All Bands' : band}</option>)}</select><select value={licenseStatusFilter} onChange={(e) => setLicenseStatusFilter(e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background xl:col-span-3">{licenseStatuses.map((status) => <option key={status} value={status}>{status === 'All' ? 'All Status' : status}</option>)}</select></div>
          <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-border"><th className="text-left py-3 px-4">License Number</th><th className="text-left py-3 px-4">Organization</th><th className="text-left py-3 px-4">Station</th><th className="text-left py-3 px-4">Frequency Range</th><th className="text-left py-3 px-4">Service Type</th><th className="text-center py-3 px-4">Power</th><th className="text-center py-3 px-4">Period</th><th className="text-center py-3 px-4">Status</th><th className="text-center py-3 px-4">Actions</th></tr></thead><tbody>{filteredLicenseData.map((license) => <tr key={license.id} className="border-b border-border hover:bg-muted/50"><td className="py-3 px-4 font-medium text-sm">{license.number}</td><td className="py-3 px-4">{license.organization}</td><td className="py-3 px-4">{license.station}</td><td className="py-3 px-4 text-sm">{license.frequency}</td><td className="py-3 px-4">{license.type}</td><td className="text-center py-3 px-4">{license.power}</td><td className="text-center py-3 px-4 text-sm"><div>{license.startDate}</div><div className="text-muted-foreground">to {license.endDate}</div></td><td className="text-center py-3 px-4"><span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${statusClass(license.status)}`}>{statusLabel(license.status)}</span></td><td className="text-center py-3 px-4"><div className="flex items-center justify-center gap-2"><button type="button" onClick={() => openDetail({ type: 'license', data: license })} className="p-1 hover:bg-muted rounded" title="Detail"><Eye className="w-4 h-4 text-slate-600" /></button><button type="button" onClick={() => openLicenseEdit(license)} className="p-1 hover:bg-muted rounded" title="Edit"><Edit className="w-4 h-4 text-primary" /></button><button type="button" onClick={() => setLicenseRecords((prev) => prev.filter((item) => item.id !== license.id))} className="p-1 hover:bg-muted rounded" title="Delete"><Trash2 className="w-4 h-4 text-red-500" /></button></div></td></tr>)}</tbody></table></div>
        </div>
      )}

      {activeTab === 'planning' && (
        <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Planning Data Management</h3>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => { setImportTab('planning'); setShowImportDialog(true); }} className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-2"><FileUp className="w-4 h-4" />Import Excel</button>
              <button type="button" onClick={() => exportToExcel('planning')} className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-2"><FileDown className="w-4 h-4" />Export Excel</button>
              <button type="button" onClick={() => { setPlanningFormRecord({ id: Date.now(), category: '', subCategory: '', service: '', bandName: '', startFreq: 0, endFreq: 0, step: 0, bandwidth: 0, status: 'free', note: '' }); setPlanningDialogMode('add'); }} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"><Plus className="w-4 h-4" />Add Custom Band</button>
            </div>
          </div>
          <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-border"><th className="text-left py-3 px-4">Frequency Band</th><th className="text-left py-3 px-4">ITU Region 1 Allocation</th><th className="text-left py-3 px-4">National Allocation</th><th className="text-left py-3 px-4">Utilization</th><th className="text-left py-3 px-4">Special Conditions</th><th className="text-center py-3 px-4">Actions</th></tr></thead><tbody>{planningRecords.map((plan) => <tr key={plan.id} className="border-b border-border hover:bg-muted/50"><td className="py-3 px-4 font-medium">{plan.bandName}</td><td className="py-3 px-4">{plan.subCategory}</td><td className="py-3 px-4">{plan.category}</td><td className="py-3 px-4">{plan.service}</td><td className="py-3 px-4">{plan.note}</td><td className="text-center py-3 px-4"><div className="flex items-center justify-center gap-2"><button onClick={() => openPlanningEdit(plan)} className="p-1 hover:bg-muted rounded" title="Edit"><Edit className="w-4 h-4 text-primary" /></button>{plan.category === 'Custom' && <button className="p-1 hover:bg-muted rounded" title="Delete"><Trash2 className="w-4 h-4 text-red-500" /></button>}</div></td></tr>)}</tbody></table></div>
        </div>
      )}

      {planningDialogMode && planningFormRecord && (
        <PlanningForm
          title={planningDialogMode === 'add' ? 'Add Custom Band' : 'Edit Planning Data'}
          description={planningDialogMode === 'add' ? 'Create a new planning record for the table.' : 'Update the selected planning record.'}
          value={planningFormRecord}
          onChange={(data) => setPlanningFormRecord(data)}
          onClose={() => { setPlanningDialogMode(null); setPlanningFormRecord(null); }}
          onSubmit={() => {
            if (planningDialogMode === 'add') {
              setPlanningRecords((prev) => [...prev, { ...planningFormRecord, id: Date.now() }]);
            } else {
              savePlanningEdit();
            }
          }}
          submitLabel={planningDialogMode === 'add' ? 'Add Band' : 'Save Changes'}
        />
      )}

      {showDetailDialog && detailRecord && detailRecord.type === 'station' && (
        <RecordDetailCard
          title="Station Detail"
          subtitle="Detailed station information"
          fields={[
            { label: 'Station Name', value: detailRecord.data.name },
            { label: 'Technical Standard', value: detailRecord.data.technicalStandard ?? '-' },
            { label: 'Bandwidth Processing Unit Model', value: detailRecord.data.bandwidthProcessingUnitModel ?? '-' },
            { label: 'Owner Name', value: detailRecord.data.ownerName ?? '-' },
            { label: 'Backhaul Network Access Method', value: detailRecord.data.backhaulNetworkAccessMethod ?? '-' },
            { label: 'Station Purpose', value: detailRecord.data.stationPurpose ?? '-' },
            { label: 'Modulation Type', value: detailRecord.data.modulationType ?? '-' },
            { label: 'Station Type', value: detailRecord.data.type },
            { label: 'Transmit Frequency', value: detailRecord.data.frequency },
            { label: 'Receive Frequency', value: detailRecord.data.frequency },
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

      {showDetailDialog && detailRecord && detailRecord.type === 'license' && (
        <RecordDetailCard
          title="Authorized Station Detail"
          subtitle="Station-specific frequency authorization information"
          fields={[
            { label: 'License / Authorization', value: detailRecord.data.licenseAuthorization ?? '-' },
            { label: 'Unit', value: detailRecord.data.unit ?? detailRecord.data.organization },
            { label: 'Category', value: detailRecord.data.category ?? detailRecord.data.type },
            { label: 'Law', value: detailRecord.data.law ?? '-' },
            { label: 'Type', value: detailRecord.data.type },
            { label: 'Start Date', value: detailRecord.data.startDate },
            { label: 'End Date', value: detailRecord.data.endDate },
            { label: 'Coverage Range', value: detailRecord.data.coverage ?? detailRecord.data.frequency },
            { label: 'Process', value: detailRecord.data.process ?? 'Approved' },
            { label: 'Status', value: statusLabel(detailRecord.data.status) },
            { label: 'Code / No.', value: detailRecord.data.code ?? detailRecord.data.number.replace(/^LIC-/, '') },
            { label: 'Decision Date', value: detailRecord.data.decisionDate ?? detailRecord.data.startDate },
            { label: 'Decision', value: detailRecord.data.decision ?? 'Granted' },
            { label: 'Description', value: detailRecord.data.description ?? 'Station authorization detail view' },
            { label: 'Registration', value: detailRecord.data.registration ?? detailRecord.data.organization },
            { label: 'Address', value: detailRecord.data.address ?? detailRecord.data.station },
            { label: 'Phone', value: detailRecord.data.phone ?? '-' },
            { label: 'Email', value: detailRecord.data.email ?? '-' },
            { label: 'Administrative Info', value: detailRecord.data.administrativeInfo ?? '-' },
            { label: 'Contact Person', value: detailRecord.data.contactPerson ?? '-' },
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
          onSubmit={() => {
            if (stationDialogMode === 'add') {
              setStationRecords((prev) => [...prev, { ...stationFormRecord, id: Date.now() }]);
            } else {
              saveStationEdit();
            }
          }}
          submitLabel={stationDialogMode === 'add' ? 'Add Station' : 'Save Changes'}
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
              setLicenseRecords((prev) => [...prev, { ...licenseFormRecord, id: Date.now() }]);
            } else {
              setLicenseRecords((prev) => prev.map((item) => item.id === licenseFormRecord.id ? licenseFormRecord : item));
            }
            setLicenseDialogMode(null);
            setLicenseFormRecord(null);
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
          <div className="w-full max-w-xl rounded-lg bg-card shadow-2xl border border-border">
            <div className="flex items-center justify-between border-b border-border p-6">
              <h3 className="text-xl font-semibold">Export Excel</h3>
              <button type="button" onClick={() => setShowExportDialog(false)} className="p-2 hover:bg-muted rounded-lg transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-2">
                {(['station', 'license', 'planning'] as DataTab[]).map((tab) => (
                  <button key={tab} type="button" onClick={() => exportToExcel(tab)} className={`px-4 py-2 rounded-lg border ${activeTab === tab ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}>
                    {tab === 'station' ? 'Station Data' : tab === 'license' ? 'License Data' : 'Planning Data'}
                  </button>
                ))}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowExportDialog(false)} className="px-5 py-2 border border-border rounded-lg hover:bg-muted transition-colors">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

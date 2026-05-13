import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, MapPin, Filter } from 'lucide-react';
import { StationDetailCard } from './StationDetailCard';

const API_BASE = '/api';

async function fetchRegionStats() {
  const res = await fetch(`${API_BASE}/statistics/station/region-detail`);
  const json = await res.json();
  return json.data || [];
}

async function fetchGrowthTrend(type: string, year: number, province: string) {
  const params = new URLSearchParams({ type, year: String(year), province });
  const res = await fetch(`${API_BASE}/statistics/station/growth-trend?${params}`);
  const json = await res.json();
  return json.data || [];
}

async function fetchExpiredStations(year: number, province: string, type: string) {
  const params = new URLSearchParams({ year: String(year), province, type });
  const res = await fetch(`${API_BASE}/statistics/station/expired-detail?${params}`);
  const json = await res.json();
  return json.data || [];
}

type StationRecord = {
  type: string;
  province: string;
  year: number;
  month: number;
  count: number;
  name: string;
  longitude: string;
  latitude: string;
  technicalStandard?: string;
  bandwidthProcessingUnitModel?: string;
  ownerName?: string;
  backhaulNetworkAccessMethod?: string;
  stationPurpose?: string;
  modulationType?: string;
  stationType?: string;
  transmitFrequency?: string;
  receiveFrequency?: string;
  bandwidth?: string;
  equipmentNameAndModel?: string;
  equipmentCount?: string;
  equipmentPower?: string;
  antennaType?: string;
  antennaCount?: string;
  region?: string;
  detailedLocation?: string;
  openDate?: string;
  expireDate?: string;
};

export function StationStats() {
  const [analysisType, setAnalysisType] = useState<'regional' | 'growth' | 'validity'>('regional');
  const [selectedGrowthType, setSelectedGrowthType] = useState('All');
  const [selectedGrowthYear, setSelectedGrowthYear] = useState<number>(2026);
  const [selectedGrowthProvince, setSelectedGrowthProvince] = useState('All');
  const [growthMetric, setGrowthMetric] = useState<'count' | 'percent'>('count');
  const [selectedRegion, setSelectedRegion] = useState<string>('Ulaanbaatar');
  const [selectedType, setSelectedType] = useState<string>('Mobile');

  const [selectedValidityYear, setSelectedValidityYear] = useState<number>(2026);
  const [selectedValidityProvince, setSelectedValidityProvince] = useState('All');
  const [selectedValidityType, setSelectedValidityType] = useState('All');
  const [showExpiredOnMap, setShowExpiredOnMap] = useState(true);
  const [selectedExpiredMonth, setSelectedExpiredMonth] = useState<number | null>(8);
  const [selectedExpiredStation, setSelectedExpiredStation] = useState<any | null>(null);

  // API data state
  const [regionStats, setRegionStats] = useState<any[]>([]);
  const [growthData, setGrowthData] = useState<any[]>([]);
  const [expiredData, setExpiredData] = useState<any[]>([]);

  // Load data from API
  useEffect(() => {
    if (analysisType === 'regional') {
      fetchRegionStats().then(setRegionStats).catch(console.error);
    } else if (analysisType === 'growth') {
      fetchGrowthTrend(selectedGrowthType, selectedGrowthYear, selectedGrowthProvince)
        .then(setGrowthData).catch(console.error);
    } else if (analysisType === 'validity') {
      fetchExpiredStations(selectedValidityYear, selectedValidityProvince, selectedValidityType)
        .then(setExpiredData).catch(console.error);
    }
  }, [analysisType, selectedGrowthType, selectedGrowthYear, selectedGrowthProvince,
      selectedValidityYear, selectedValidityProvince, selectedValidityType]);

  const regionalData = [
    { region: 'Ulaanbaatar', mobile: 580, broadcast: 320, fixed: 180, satellite: 120, other: 85 },
    { region: 'Dornogovi', mobile: 180, broadcast: 95, fixed: 75, satellite: 52, other: 30 },
    { region: 'Central', mobile: 320, broadcast: 165, fixed: 110, satellite: 68, other: 48 },
    { region: 'Selenge', mobile: 245, broadcast: 128, fixed: 85, satellite: 42, other: 35 },
    { region: 'Khentii', mobile: 155, broadcast: 82, fixed: 58, satellite: 32, other: 28 },
  ];

  const stationRecords: StationRecord[] = [
    ...Array.from({ length: 12 }, (_, i) => ({ type: 'Mobile', province: ['Ulaanbaatar', 'Central', 'Selenge'][i % 3], year: 2025, month: i + 1, count: 40 + i * 2, name: `Mobile-${i + 1}`, longitude: '106.9', latitude: '47.9' })),
    ...Array.from({ length: 12 }, (_, i) => ({ type: 'Mobile', province: ['Ulaanbaatar', 'Dornogovi', 'Khentii'][i % 3], year: 2026, month: i + 1, count: 45 + i * 3, name: `Mobile-${i + 13}`, longitude: '106.9', latitude: '47.9' })),
    ...Array.from({ length: 12 }, (_, i) => ({ type: 'Broadcasting', province: ['Ulaanbaatar', 'Central', 'Selenge'][i % 3], year: 2025, month: i + 1, count: 20 + i, name: `Broadcast-${i + 1}`, longitude: '106.8', latitude: '47.8' })),
    ...Array.from({ length: 12 }, (_, i) => ({ type: 'Broadcasting', province: ['Ulaanbaatar', 'Dornogovi', 'Khentii'][i % 3], year: 2026, month: i + 1, count: 22 + i * 2, name: `Broadcast-${i + 13}`, longitude: '107.0', latitude: '47.7' })),
    ...Array.from({ length: 12 }, (_, i) => ({ type: 'Fixed', province: ['Central', 'Selenge', 'Khentii'][i % 3], year: 2025, month: i + 1, count: 15 + i, name: `Fixed-${i + 1}`, longitude: '106.7', latitude: '47.6' })),
    ...Array.from({ length: 12 }, (_, i) => ({ type: 'Fixed', province: ['Central', 'Ulaanbaatar', 'Dornogovi'][i % 3], year: 2026, month: i + 1, count: 16 + i * 2, name: `Fixed-${i + 13}`, longitude: '106.6', latitude: '47.5' })),
    ...Array.from({ length: 12 }, (_, i) => ({ type: 'Satellite', province: ['Ulaanbaatar', 'Central', 'Khentii'][i % 3], year: 2025, month: i + 1, count: 8 + i, name: `Satellite-${i + 1}`, longitude: '106.5', latitude: '47.4' })),
    ...Array.from({ length: 12 }, (_, i) => ({ type: 'Satellite', province: ['Ulaanbaatar', 'Selenge', 'Dornogovi'][i % 3], year: 2026, month: i + 1, count: 10 + i, name: `Satellite-${i + 13}`, longitude: '106.4', latitude: '47.3' })),
  ];

  const validityStations: StationRecord[] = [
    { type: 'Mobile', province: 'Ulaanbaatar', region: 'Ulaanbaatar', year: 2026, month: 5, count: 8, name: 'Ulaanbaatar Central A', longitude: '106.905', latitude: '47.918', technicalStandard: 'LTE', bandwidthProcessingUnitModel: 'BBU-3900', ownerName: 'Mongolia Telecom', backhaulNetworkAccessMethod: 'Fiber', stationPurpose: 'Public mobile service', modulationType: 'QAM', stationType: 'Mobile', transmitFrequency: '1800-1900 MHz', receiveFrequency: '1710-1785 MHz', bandwidth: '20 MHz', equipmentNameAndModel: 'Ericsson RBS 6601', equipmentCount: '12', equipmentPower: '50W', antennaType: 'Directional', antennaCount: '4', detailedLocation: 'Peace Avenue 12, SBD', openDate: '2024-01-01', expireDate: '2026-05-15' },
    { type: 'Broadcasting', province: 'Dornogovi', region: 'Dornogovi', year: 2026, month: 5, count: 10, name: 'Dornogovi Station B', longitude: '109.321', latitude: '44.223', technicalStandard: 'DVB-T2', bandwidthProcessingUnitModel: 'TX-8800', ownerName: 'National Broadcasting', backhaulNetworkAccessMethod: 'Microwave', stationPurpose: 'Regional broadcast coverage', modulationType: 'OFDM', stationType: 'Broadcasting', transmitFrequency: '470-862 MHz', receiveFrequency: '470-862 MHz', bandwidth: '8 MHz', equipmentNameAndModel: 'Rohde & Schwarz NH7300', equipmentCount: '8', equipmentPower: '100W', antennaType: 'Omnidirectional', antennaCount: '2', detailedLocation: 'Sainshand District North', openDate: '2023-04-15', expireDate: '2026-05-22' },
    { type: 'Fixed', province: 'Central', region: 'Central', year: 2026, month: 6, count: 6, name: 'Central Microwave', longitude: '105.412', latitude: '48.112', technicalStandard: 'Microwave', bandwidthProcessingUnitModel: 'RTN-380', ownerName: 'National Communications', backhaulNetworkAccessMethod: 'Radio Relay', stationPurpose: 'Backhaul link', modulationType: 'QPSK', stationType: 'Fixed', transmitFrequency: '5925-6425 MHz', receiveFrequency: '5925-6425 MHz', bandwidth: '40 MHz', equipmentNameAndModel: 'Huawei RTN 380H', equipmentCount: '4', equipmentPower: '10W', antennaType: 'Parabolic', antennaCount: '2', detailedLocation: 'Central hub site', openDate: '2023-09-01', expireDate: '2026-06-08' },
    { type: 'Fixed', province: 'Selenge', region: 'Selenge', year: 2026, month: 7, count: 12, name: 'Selenge Comm Station', longitude: '106.233', latitude: '49.789', technicalStandard: 'Microwave', bandwidthProcessingUnitModel: 'RTN-950', ownerName: 'Mongolia Telecom', backhaulNetworkAccessMethod: 'Fiber', stationPurpose: 'Transmission relay', modulationType: 'QPSK', stationType: 'Fixed', transmitFrequency: '7125-7750 MHz', receiveFrequency: '7125-7750 MHz', bandwidth: '40 MHz', equipmentNameAndModel: 'Nokia FlexiPacket MW', equipmentCount: '6', equipmentPower: '5W', antennaType: 'Parabolic', antennaCount: '2', detailedLocation: 'Selenge industrial area', openDate: '2024-03-10', expireDate: '2026-07-18' },
    { type: 'Satellite', province: 'Khentii', region: 'Khentii', year: 2026, month: 8, count: 14, name: 'Khentii Satellite C', longitude: '110.321', latitude: '48.345', technicalStandard: 'Ku-Band', bandwidthProcessingUnitModel: 'VSAT-9000', ownerName: 'SkyNet LLC', backhaulNetworkAccessMethod: 'Satellite', stationPurpose: 'Remote access', modulationType: '8PSK', stationType: 'Satellite', transmitFrequency: '11.7-12.5 GHz', receiveFrequency: '14.0-14.5 GHz', bandwidth: '27 MHz', equipmentNameAndModel: 'Hughes HN9000', equipmentCount: '3', equipmentPower: '1W', antennaType: 'Dish', antennaCount: '1', detailedLocation: 'Khentii eastern site', openDate: '2022-11-20', expireDate: '2026-08-25' },
    { type: 'Mobile', province: 'Ulaanbaatar', region: 'Ulaanbaatar', year: 2026, month: 8, count: 9, name: 'Ulaanbaatar South D', longitude: '106.855', latitude: '47.892', technicalStandard: 'LTE', bandwidthProcessingUnitModel: 'BBU-5900', ownerName: 'Unitel LLC', backhaulNetworkAccessMethod: 'Fiber', stationPurpose: 'Public mobile service', modulationType: 'QAM', stationType: 'Mobile', transmitFrequency: '1800-1900 MHz', receiveFrequency: '1710-1785 MHz', bandwidth: '20 MHz', equipmentNameAndModel: 'Huawei BTS3900', equipmentCount: '10', equipmentPower: '40W', antennaType: 'Directional', antennaCount: '4', detailedLocation: 'South district node', openDate: '2024-02-14', expireDate: '2026-08-17' },
  ];

  const regionTotals = useMemo(() => (regionStats.length > 0 ? regionStats : regionalData).map((row: any) => ({ region: row.region, total: row.total ?? (row.mobile + row.broadcast + row.fixed + row.satellite + row.other) })).sort((a, b) => b.total - a.total), [regionStats]);
  const totalStations = useMemo(() => regionTotals.reduce((sum, item) => sum + item.total, 0), [regionTotals]);
  const pieData = useMemo(() => regionTotals.map((item, index) => ({ ...item, color: ['#1D4ED8', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD'][index % 5] })), [regionTotals]);
  const stationTypeData = useMemo(() => {
    const data = regionStats.length > 0 ? regionStats : regionalData;
    const totalMobile = data.reduce((sum: number, r: any) => sum + r.mobile, 0);
    const totalBroadcast = data.reduce((sum: number, r: any) => sum + r.broadcast, 0);
    const totalFixed = data.reduce((sum: number, r: any) => sum + r.fixed, 0);
    const totalSatellite = data.reduce((sum: number, r: any) => sum + r.satellite, 0);
    const totalOther = data.reduce((sum: number, r: any) => sum + r.other, 0);
    return [
      { type: 'Mobile', count: totalMobile },
      { type: 'Broadcasting', count: totalBroadcast },
      { type: 'Fixed', count: totalFixed },
      { type: 'Satellite', count: totalSatellite },
      { type: 'Others', count: totalOther },
    ];
  }, [regionStats]);

  const growthTypes = useMemo(() => ['All', ...Array.from(new Set(stationRecords.map((item) => item.type)))], [stationRecords]);
  const growthYears = useMemo(() => Array.from(new Set(stationRecords.map((item) => item.year))).sort((a, b) => a - b), [stationRecords]);
  const growthProvinces = useMemo(() => ['All', ...Array.from(new Set(stationRecords.map((item) => item.province))).sort()], [stationRecords]);
  const filteredGrowthRecords = useMemo(() => stationRecords.filter((item) => (selectedGrowthType === 'All' || item.type === selectedGrowthType) && item.year === selectedGrowthYear && (selectedGrowthProvince === 'All' || item.province === selectedGrowthProvince)), [selectedGrowthProvince, selectedGrowthType, selectedGrowthYear, stationRecords]);
  const monthlyTotals = useMemo(() => Array.from({ length: 12 }, (_, index) => ({ month: index + 1, count: filteredGrowthRecords.filter((item) => item.month === index + 1).reduce((sum, item) => sum + item.count, 0) })), [filteredGrowthRecords]);
  const previousYearTotals = useMemo(() => Array.from({ length: 12 }, (_, index) => ({ month: index + 1, count: stationRecords.filter((item) => item.year === selectedGrowthYear - 1 && item.month === index + 1).filter((item) => (selectedGrowthType === 'All' || item.type === selectedGrowthType) && (selectedGrowthProvince === 'All' || item.province === selectedGrowthProvince)).reduce((sum, item) => sum + item.count, 0) })), [selectedGrowthProvince, selectedGrowthType, selectedGrowthYear, stationRecords]);
  const yoyGrowthData = growthData.map((item) => ({
    month: item.month,
    current: item.current,
    previous: item.previous,
    growthCount: item.growthCount,
    growthPercent: item.growthPercent,
  }));
  const momGrowthData = growthData.map((item) => ({
    month: item.month,
    current: item.current,
    previous: item.previous,
    growthCount: item.momCount,
    growthPercent: item.momPercent,
  }));

  const validityYears = useMemo(() => [2025, 2026], []);
  const validityProvinces = useMemo(() => ['All'], []);
  const validityTypes = useMemo(() => ['All'], []);
  const validityMonths = useMemo(() => Array.from({ length: 12 }, (_, index) => index + 1), []);
  const filteredValidityStations = expiredData;
  const monthlyExpiredData = useMemo(() => validityMonths.map((month) => ({ month: new Date(selectedValidityYear, month - 1).toLocaleString('en-US', { month: 'short' }), monthIndex: month, count: expiredData.filter((item) => item.month === month).reduce((sum, item) => sum + (item.expiredCount ?? 1), 0) })), [expiredData, selectedValidityYear, validityMonths]);
  const selectedMonthStations = useMemo(() => selectedExpiredMonth ? expiredData.filter((item) => item.month === selectedExpiredMonth) : expiredData, [expiredData, selectedExpiredMonth]);

  const [activeRegionIndex, setActiveRegionIndex] = useState<number | null>(null);
  const validityMapStations = showExpiredOnMap ? selectedMonthStations : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Station Statistics Analysis</h2>
        <p className="text-muted-foreground">Multi-dimensional station data statistics and trend analysis</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <button onClick={() => setAnalysisType('regional')} className={`px-6 py-3 rounded-lg transition-colors ${analysisType === 'regional' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border hover:bg-muted'}`}>Regional Statistics</button>
        <button onClick={() => setAnalysisType('growth')} className={`px-6 py-3 rounded-lg transition-colors ${analysisType === 'growth' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border hover:bg-muted'}`}>Growth Trend</button>
        <button onClick={() => setAnalysisType('validity')} className={`px-6 py-3 rounded-lg transition-colors ${analysisType === 'validity' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border hover:bg-muted'}`}>Validity Period</button>
      </div>

      {analysisType === 'regional' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Station Share by Region</h3>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={120} dataKey="total" labelLine={false} label={({ percent }) => `${((percent ?? 0) * 100).toFixed(1)}%`} onMouseEnter={(_, index) => setActiveRegionIndex(index)} onMouseLeave={() => setActiveRegionIndex(null)}>
                    {pieData.map((entry, index) => <Cell key={`region-pie-${entry.region}`} fill={entry.color} opacity={activeRegionIndex === null || activeRegionIndex === index ? 1 : 0.45} />)}
                  </Pie>
                  <Tooltip formatter={(value: number) => [value, 'Station Count']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="-mt-44 mb-32 text-center pointer-events-none">
                <div className="text-sm text-muted-foreground">Total Stations</div>
                <div className="text-3xl font-bold text-foreground">{totalStations}</div>
              </div>
              <div className="mt-2 border border-border rounded-lg overflow-hidden">
                <div className="max-h-56 overflow-y-auto">
                  {regionTotals.map((item, idx) => (
                    <button key={`region-list-${item.region}`} onMouseEnter={() => setActiveRegionIndex(idx)} onMouseLeave={() => setActiveRegionIndex(null)} onClick={() => setSelectedRegion(item.region)} className={`w-full flex items-center justify-between px-4 py-2 text-sm border-b border-border last:border-b-0 hover:bg-muted/60 text-left ${selectedRegion === item.region ? 'bg-muted' : ''}`}>
                      <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pieData[idx]?.color }} />{item.region}</span>
                      <span className="font-medium">{item.total}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Regional Station Count by Type</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={stationTypeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [value, 'Station Count']} />
                  <Bar dataKey="count" onClick={(data) => setSelectedType(data.type)}>
                    {stationTypeData.map((entry) => <Cell key={`type-bar-${entry.type}`} fill={selectedType === entry.type ? '#f57c00' : '#1976d2'} cursor="pointer" />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Regional Statistics Detail</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-border"><th className="text-left py-3 px-4">Region</th><th className="text-center py-3 px-4">Mobile</th><th className="text-center py-3 px-4">Broadcasting</th><th className="text-center py-3 px-4">Fixed</th><th className="text-center py-3 px-4">Satellite</th><th className="text-center py-3 px-4">Others</th><th className="text-center py-3 px-4">Total</th><th className="text-center py-3 px-4">Percentage</th></tr></thead>
                <tbody>{(regionStats.length > 0 ? regionStats : regionalData).map((row: any) => { const total = row.total ?? (row.mobile + row.broadcast + row.fixed + row.satellite + row.other); const percentage = ((total / totalStations) * 100).toFixed(1); return (<tr key={row.region} className="border-b border-border hover:bg-muted/50"><td className="py-3 px-4 font-medium">{row.region}</td><td className="text-center py-3 px-4">{row.mobile}</td><td className="text-center py-3 px-4">{row.broadcast}</td><td className="text-center py-3 px-4">{row.fixed}</td><td className="text-center py-3 px-4">{row.satellite}</td><td className="text-center py-3 px-4">{row.other}</td><td className="text-center py-3 px-4 font-semibold">{total}</td><td className="text-center py-3 px-4">{percentage}%</td></tr>); })}</tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {analysisType === 'growth' && (
        <div className="grid grid-cols-1 xl:grid-cols-[260px_1fr] gap-6">
          <aside className="bg-card p-5 rounded-lg border border-border shadow-sm h-fit">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Filters</h3>
              <Filter className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-muted-foreground mb-2">Station Type</label>
                <select value={selectedGrowthType} onChange={(e) => setSelectedGrowthType(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2">
                  {growthTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-muted-foreground mb-2">Year</label>
                <select value={selectedGrowthYear} onChange={(e) => setSelectedGrowthYear(Number(e.target.value))} className="w-full rounded-lg border border-border bg-background px-3 py-2">
                  {growthYears.map((year) => <option key={year} value={year}>{year}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-muted-foreground mb-2">Province</label>
                <select value={selectedGrowthProvince} onChange={(e) => setSelectedGrowthProvince(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2">
                  {growthProvinces.map((province) => <option key={province} value={province}>{province}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-muted-foreground mb-2">Growth Metric</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setGrowthMetric('count')} className={`rounded-lg px-3 py-2 border transition-colors ${growthMetric === 'count' ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}>Count</button>
                  <button onClick={() => setGrowthMetric('percent')} className={`rounded-lg px-3 py-2 border transition-colors ${growthMetric === 'percent' ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}>Percent</button>
                </div>
              </div>
              <div>
                <div className="text-muted-foreground mb-2">Station Types</div>
                <div className="max-h-[320px] overflow-y-auto rounded-lg border border-border divide-y divide-border">
                  {growthTypes.filter((type) => type !== 'All').map((type) => (
                    <button key={type} onClick={() => setSelectedGrowthType(type)} className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/60 ${selectedGrowthType === type ? 'bg-muted font-medium' : ''}`}>
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Year-over-Year Growth Comparison</h3>
                  <div className="text-sm text-muted-foreground">{selectedGrowthYear} vs {selectedGrowthYear - 1}</div>
                </div>
                <ResponsiveContainer width="100%" height={340}>
                  <BarChart data={yoyGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: number, name: string) => [value, name === 'growthPercent' ? '%' : 'Stations']} />
                    <Legend />
                    <ReferenceLine y={0} stroke="#999" />
                    <Bar dataKey={growthMetric === 'count' ? 'growthCount' : 'growthPercent'} fill="#1976d2" name={growthMetric === 'count' ? 'YoY Growth Count' : 'YoY Growth %'} />
                    <Line type="monotone" dataKey="current" stroke="#f57c00" strokeWidth={2} dot={false} name="Current Year Stations" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Month-over-Month Growth Comparison</h3>
                  <div className="text-sm text-muted-foreground">Selected Year: {selectedGrowthYear}</div>
                </div>
                <ResponsiveContainer width="100%" height={340}>
                  <BarChart data={momGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [value, 'count']} />
                    <Legend />
                    <ReferenceLine y={0} stroke="#999" />
                    <Bar dataKey={growthMetric === 'count' ? 'growthCount' : 'growthPercent'} fill="#2e7d32" name={growthMetric === 'count' ? 'MoM Growth Count' : 'MoM Growth %'} />
                    <Line type="monotone" dataKey="current" stroke="#1976d2" strokeWidth={2} dot={false} name="Monthly Stations" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Filtered Monthly Data</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3">Month</th>
                      <th className="text-right py-2 px-3">Current Year</th>
                      <th className="text-right py-2 px-3">Previous Year</th>
                      <th className="text-right py-2 px-3">YoY Change</th>
                      <th className="text-right py-2 px-3">MoM Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yoyGrowthData.map((item, index) => (
                      <tr key={item.month} className="border-b border-border hover:bg-muted/50">
                        <td className="py-2 px-3">{item.month}</td>
                        <td className="text-right py-2 px-3">{item.current}</td>
                        <td className="text-right py-2 px-3">{item.previous}</td>
                        <td className="text-right py-2 px-3">{growthMetric === 'count' ? item.growthCount : `${item.growthPercent}%`}</td>
                        <td className="text-right py-2 px-3">{growthMetric === 'count' ? momGrowthData[index].growthCount : `${momGrowthData[index].growthPercent}%`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {analysisType === 'validity' && (
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
              <div>
                <h3 className="text-lg font-semibold">Monthly Expired Station Count</h3>
                <p className="text-sm text-muted-foreground">Use filters to analyze expired stations by month.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4 text-sm">
              <select value={selectedValidityYear} onChange={(e) => { setSelectedValidityYear(Number(e.target.value)); setSelectedExpiredMonth(null); }} className="rounded-lg border border-border bg-background px-3 py-2">{validityYears.map((year) => <option key={year} value={year}>{year}</option>)}</select>
              <select value={selectedValidityProvince} onChange={(e) => setSelectedValidityProvince(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2">{validityProvinces.map((province) => <option key={province} value={province}>{province}</option>)}</select>
              <select value={selectedValidityType} onChange={(e) => setSelectedValidityType(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2">{validityTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select>
              <div className="rounded-lg border border-border bg-muted px-3 py-2 text-muted-foreground">Expired stations: {filteredValidityStations.length}</div>
            </div>
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={monthlyExpiredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => [value, 'Expired Station Count']} />
                <Legend />
                <Bar dataKey="count" fill="#1976d2" onClick={(data) => setSelectedExpiredMonth(data.monthIndex)} label={{ position: 'top', fill: '#1f2937', fontSize: 12, fontWeight: 600 }}>
                  {monthlyExpiredData.map((entry) => (
                    <Cell key={`expired-bar-${entry.monthIndex}`} fill={selectedExpiredMonth === entry.monthIndex ? '#f57c00' : '#1976d2'} cursor="pointer" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <h3 className="text-lg font-semibold">Expired Station Details</h3>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div>Selected Month: {selectedExpiredMonth ? new Date(selectedValidityYear, selectedExpiredMonth - 1, 1).toLocaleString('en-US', { month: 'long' }) : 'All'}</div>
                <button
                  type="button"
                  onClick={() => {
                    const rows = selectedMonthStations.map((station) => [station.name, station.province, station.type, station.month, station.expiredCount, station.expireDate].join(','));
                    const csv = ['Name,Province,Type,Month,Expired Count,Date', ...rows].join('\n');
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `expired-stations-${selectedValidityYear}-${selectedExpiredMonth ?? 'all'}.csv`;
                    link.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-foreground"
                >
                  Export
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3">Name</th>
                    <th className="text-left py-2 px-3">Province</th>
                    <th className="text-left py-2 px-3">Type</th>
                    <th className="text-center py-2 px-3">Month</th>
                    <th className="text-center py-2 px-3">Expired Count</th>
                    <th className="text-center py-2 px-3">Date</th>
                    <th className="text-center py-2 px-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedMonthStations.map((station) => (
                    <tr key={station.guid} className="border-b border-border hover:bg-muted/50">
                      <td className="py-2 px-3 font-medium">{station.name}</td>
                      <td className="py-2 px-3">{station.province}</td>
                      <td className="py-2 px-3">{station.type}</td>
                      <td className="text-center py-2 px-3">{station.month}</td>
                      <td className="text-center py-2 px-3">{station.expiredCount}</td>
                      <td className="text-center py-2 px-3">{station.expireDate}</td>
                      <td className="text-center py-2 px-3">
                        <button type="button" onClick={() => setSelectedExpiredStation(station)} className="text-primary hover:underline">Detail</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedExpiredStation && (
        <StationDetailCard
          title="Station Detail"
          subtitle="Detailed parameters of the selected station"
          fields={[
            { label: 'Technical Standard', value: selectedExpiredStation.technicalStandard ?? '-' },
            { label: 'Bandwidth Processing Unit Model', value: selectedExpiredStation.bandwidthProcessingUnitModel ?? '-' },
            { label: 'Owner Name', value: selectedExpiredStation.ownerName ?? '-' },
            { label: 'Backhaul Network Access Method', value: selectedExpiredStation.backhaulNetworkAccessMethod ?? '-' },
            { label: 'Station Purpose', value: selectedExpiredStation.stationPurpose ?? '-' },
            { label: 'Modulation Type', value: selectedExpiredStation.modulationType ?? '-' },
            { label: 'Station Type', value: selectedExpiredStation.stationType ?? selectedExpiredStation.type },
            { label: 'Transmit Frequency', value: selectedExpiredStation.transmitFrequency ?? '-' },
            { label: 'Receive Frequency', value: selectedExpiredStation.receiveFrequency ?? '-' },
            { label: 'Bandwidth', value: selectedExpiredStation.bandwidth ?? '-' },
            { label: 'Equipment Name and Model', value: selectedExpiredStation.equipmentNameAndModel ?? '-' },
            { label: 'Equipment Count', value: selectedExpiredStation.equipmentCount ?? '-' },
            { label: 'Equipment Output Power', value: selectedExpiredStation.equipmentPower ?? '-' },
            { label: 'Antenna Type', value: selectedExpiredStation.antennaType ?? '-' },
            { label: 'Antenna Count', value: selectedExpiredStation.antennaCount ?? '-' },
            { label: 'Province', value: selectedExpiredStation.province },
            { label: 'Region', value: selectedExpiredStation.region ?? selectedExpiredStation.province },
            { label: 'Detailed Location', value: selectedExpiredStation.detailedLocation ?? '-' },
            { label: 'Station Name', value: selectedExpiredStation.name },
            { label: 'Longitude', value: selectedExpiredStation.longitude },
            { label: 'Latitude', value: selectedExpiredStation.latitude },
            { label: 'Open Date', value: selectedExpiredStation.openDate ?? '-' },
            { label: 'Expiry Date', value: selectedExpiredStation.expireDate },
          ]}
          onClose={() => setSelectedExpiredStation(null)}
        />
      )}
    </div>
  );
}

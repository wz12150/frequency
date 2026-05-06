import { useMemo, useState } from 'react';
import { BarChart, Bar, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';

type DetailModalProps = {
  title: string;
  subtitle: string;
  onClose: () => void;
  fields: Array<[string, string | number]>;
};

function DetailModal({ title, subtitle, onClose, fields }: DetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <button onClick={onClose} className="rounded-lg px-3 py-2 text-sm border border-border hover:bg-muted">Close</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
          {fields.map(([label, value]) => (
            <div key={label} className="rounded-lg border border-border bg-card p-4">
              <div className="text-xs font-semibold text-muted-foreground mb-2">{label}</div>
              <div className="text-sm font-medium break-all">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LicenseAnalysis() {
  const [analysisType, setAnalysisType] = useState<'usage' | 'count' | 'station' | 'validity'>('usage');
  const [selectedBusinessType, setSelectedBusinessType] = useState('All');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedProvince, setSelectedProvince] = useState('All');
  const [selectedLicenseDetail, setSelectedLicenseDetail] = useState<{
    number: string;
    organization: string;
    region: string;
    frequency: string;
    period: string;
    status: string;
    stationCount?: number;
  } | null>(null);
  const [selectedStationDetail, setSelectedStationDetail] = useState<{
    number: string;
    organization: string;
    region: string;
    frequency: string;
    period: string;
    status: string;
    stationCount?: number;
  } | null>(null);
  const [selectedValidityLicense, setSelectedValidityLicense] = useState<{
    number: string;
    organization: string;
    region: string;
    frequency: string;
    period: string;
    status: string;
    stationCount?: number;
  } | null>(null);

  const businessTypes = ['Mobile', 'Broadcasting', 'Fixed', 'Satellite', 'Microwave', 'Navigation'];
  const provinces = ['All', 'Ulaanbaatar', 'Dornogovi', 'Central', 'Selenge', 'Khentii'];
  const years = ['2024', '2025', '2026'];

  const usageMonthlyData = [
    { month: '01', businessType: 'Mobile', province: 'Ulaanbaatar', year: '2026', usageRate: 68.2, yoyGrowth: 6.1, momGrowth: 1.2, prevYearRate: 64.3, prevMonthRate: 67.4 },
    { month: '02', businessType: 'Mobile', province: 'Ulaanbaatar', year: '2026', usageRate: 69.4, yoyGrowth: 5.8, momGrowth: 1.8, prevYearRate: 65.6, prevMonthRate: 68.2 },
    { month: '03', businessType: 'Mobile', province: 'Ulaanbaatar', year: '2026', usageRate: 70.1, yoyGrowth: 5.6, momGrowth: 1.0, prevYearRate: 66.4, prevMonthRate: 69.4 },
    { month: '04', businessType: 'Mobile', province: 'Ulaanbaatar', year: '2026', usageRate: 71.3, yoyGrowth: 5.3, momGrowth: 1.7, prevYearRate: 67.7, prevMonthRate: 70.1 },
    { month: '05', businessType: 'Mobile', province: 'Ulaanbaatar', year: '2026', usageRate: 72.0, yoyGrowth: 5.0, momGrowth: 1.0, prevYearRate: 68.5, prevMonthRate: 71.3 },
    { month: '06', businessType: 'Mobile', province: 'Ulaanbaatar', year: '2026', usageRate: 72.8, yoyGrowth: 4.8, momGrowth: 1.1, prevYearRate: 69.4, prevMonthRate: 72.0 },
    { month: '07', businessType: 'Mobile', province: 'Ulaanbaatar', year: '2026', usageRate: 73.6, yoyGrowth: 4.5, momGrowth: 1.1, prevYearRate: 70.4, prevMonthRate: 72.8 },
    { month: '08', businessType: 'Mobile', province: 'Ulaanbaatar', year: '2026', usageRate: 74.1, yoyGrowth: 4.3, momGrowth: 0.7, prevYearRate: 71.0, prevMonthRate: 73.6 },
    { month: '09', businessType: 'Mobile', province: 'Ulaanbaatar', year: '2026', usageRate: 74.8, yoyGrowth: 4.2, momGrowth: 0.9, prevYearRate: 71.6, prevMonthRate: 74.1 },
    { month: '10', businessType: 'Mobile', province: 'Ulaanbaatar', year: '2026', usageRate: 75.2, yoyGrowth: 4.0, momGrowth: 0.5, prevYearRate: 72.2, prevMonthRate: 74.8 },
    { month: '11', businessType: 'Mobile', province: 'Ulaanbaatar', year: '2026', usageRate: 75.7, yoyGrowth: 3.9, momGrowth: 0.7, prevYearRate: 72.8, prevMonthRate: 75.2 },
    { month: '12', businessType: 'Mobile', province: 'Ulaanbaatar', year: '2026', usageRate: 76.3, yoyGrowth: 3.8, momGrowth: 0.8, prevYearRate: 73.4, prevMonthRate: 75.7 },
    { month: '01', businessType: 'Broadcasting', province: 'Dornogovi', year: '2026', usageRate: 55.1, yoyGrowth: 2.4, momGrowth: 0.8, prevYearRate: 53.8, prevMonthRate: 54.7 },
    { month: '02', businessType: 'Broadcasting', province: 'Dornogovi', year: '2026', usageRate: 55.6, yoyGrowth: 2.2, momGrowth: 0.9, prevYearRate: 54.4, prevMonthRate: 55.1 },
    { month: '01', businessType: 'Mobile', province: 'Ulaanbaatar', year: '2025', usageRate: 64.3, yoyGrowth: 5.4, momGrowth: 0.0, prevYearRate: 60.8, prevMonthRate: 63.8 },
    { month: '02', businessType: 'Mobile', province: 'Ulaanbaatar', year: '2025', usageRate: 65.6, yoyGrowth: 5.1, momGrowth: 2.0, prevYearRate: 62.4, prevMonthRate: 64.3 },
    { month: '03', businessType: 'Mobile', province: 'Ulaanbaatar', year: '2025', usageRate: 66.4, yoyGrowth: 4.9, momGrowth: 1.2, prevYearRate: 63.1, prevMonthRate: 65.6 },
    { month: '04', businessType: 'Mobile', province: 'Ulaanbaatar', year: '2025', usageRate: 67.7, yoyGrowth: 4.7, momGrowth: 2.0, prevYearRate: 64.5, prevMonthRate: 66.4 },
    { month: '05', businessType: 'Mobile', province: 'Ulaanbaatar', year: '2025', usageRate: 68.5, yoyGrowth: 4.5, momGrowth: 1.2, prevYearRate: 65.1, prevMonthRate: 67.7 },
    { month: '06', businessType: 'Mobile', province: 'Ulaanbaatar', year: '2025', usageRate: 69.4, yoyGrowth: 4.3, momGrowth: 1.3, prevYearRate: 65.9, prevMonthRate: 68.5 },
    { month: '07', businessType: 'Mobile', province: 'Ulaanbaatar', year: '2025', usageRate: 70.4, yoyGrowth: 4.1, momGrowth: 1.4, prevYearRate: 66.8, prevMonthRate: 69.4 },
    { month: '08', businessType: 'Mobile', province: 'Ulaanbaatar', year: '2025', usageRate: 71.0, yoyGrowth: 4.0, momGrowth: 0.9, prevYearRate: 67.3, prevMonthRate: 70.4 },
    { month: '09', businessType: 'Mobile', province: 'Ulaanbaatar', year: '2025', usageRate: 71.6, yoyGrowth: 3.8, momGrowth: 0.8, prevYearRate: 67.9, prevMonthRate: 71.0 },
    { month: '10', businessType: 'Mobile', province: 'Ulaanbaatar', year: '2025', usageRate: 72.2, yoyGrowth: 3.7, momGrowth: 0.8, prevYearRate: 68.4, prevMonthRate: 71.6 },
    { month: '11', businessType: 'Mobile', province: 'Ulaanbaatar', year: '2025', usageRate: 72.8, yoyGrowth: 3.6, momGrowth: 0.8, prevYearRate: 69.0, prevMonthRate: 72.2 },
    { month: '12', businessType: 'Mobile', province: 'Ulaanbaatar', year: '2025', usageRate: 73.4, yoyGrowth: 3.5, momGrowth: 0.8, prevYearRate: 69.6, prevMonthRate: 72.8 },
  ];

  const filteredUsageData = useMemo(() => usageMonthlyData.filter((item) => (
    (selectedBusinessType === 'All' || item.businessType === selectedBusinessType)
    && (selectedYear === 'All' || item.year === selectedYear)
    && (selectedProvince === 'All' || item.province === selectedProvince)
  )), [selectedBusinessType, selectedProvince, selectedYear]);

  const selectedYearSamePeriodComparison = useMemo(() => {
    const currentYear = Number(selectedYear);
    return filteredUsageData
      .filter((item) => item.year === selectedYear)
      .sort((a, b) => Number(a.month) - Number(b.month))
      .map((item) => {
        const prevYearItem = usageMonthlyData.find(
          (candidate) =>
            candidate.businessType === item.businessType
            && candidate.province === item.province
            && candidate.year === String(currentYear - 1)
            && candidate.month === item.month,
        );
        return {
          month: item.month,
          usageRate: item.usageRate,
          growthRate: prevYearItem ? Number((((item.usageRate - prevYearItem.usageRate) / prevYearItem.usageRate) * 100).toFixed(1)) : item.yoyGrowth,
        };
      });
  }, [filteredUsageData, selectedYear, usageMonthlyData]);

  const selectedYearMonthComparison = useMemo(() => {
    return filteredUsageData
      .filter((item) => item.year === selectedYear)
      .sort((a, b) => Number(a.month) - Number(b.month))
      .map((item, index, array) => {
        const prevItem = array[index - 1];
        const growthRate = prevItem
          ? Number((((item.usageRate - prevItem.usageRate) / prevItem.usageRate) * 100).toFixed(1))
          : item.momGrowth;
        return {
          month: item.month,
          usageRate: item.usageRate,
          growthRate,
        };
      });
  }, [filteredUsageData, selectedYear]);

  const licenseCountData = [
    { type: 'Mobile', count: 1580, province: 'Ulaanbaatar', date: '2026-05-02', period: 'day', details: [
      { number: 'LIC-2024-001580', organization: 'Mongolia Telecom', region: 'Ulaanbaatar', frequency: '1800-1850 MHz', period: '2026-05-02', status: 'normal' },
      { number: 'LIC-2024-001581', organization: 'Mongolia Telecom', region: 'Ulaanbaatar', frequency: '1850-1900 MHz', period: '2026-05-02', status: 'normal' },
    ] },
    { type: 'Broadcasting', count: 890, province: 'Dornogovi', date: '2026-05-02', period: 'day', details: [
      { number: 'LIC-2024-000890', organization: 'Mongolia Broadcasting', region: 'Dornogovi', frequency: '470-478 MHz', period: '2026-05-02', status: 'expiring' },
    ] },
    { type: 'Fixed', count: 650, province: 'Central', date: '2026-05-02', period: 'day', details: [
      { number: 'LIC-2024-000650', organization: 'National Communications', region: 'Central', frequency: '5925-5965 MHz', period: '2026-05-02', status: 'normal' },
    ] },
    { type: 'Satellite', count: 420, province: 'Khentii', date: '2026-05-02', period: 'day', details: [
      { number: 'LIC-2024-000420', organization: 'Satellite Communications Co', region: 'Khentii', frequency: '11700-11750 MHz', period: '2026-05-02', status: 'expired' },
    ] },
    { type: 'Microwave', count: 333, province: 'Selenge', date: '2026-05-02', period: 'day', details: [
      { number: 'LIC-2024-000333', organization: 'Network Infra Ltd', region: 'Selenge', frequency: '5925-6425 MHz', period: '2026-05-02', status: 'normal' },
    ] },
    { type: 'Navigation', count: 229, province: 'Ulaanbaatar', date: '2026-05-02', period: 'day', details: [
      { number: 'LIC-2024-000229', organization: 'Aviation Authority', region: 'Ulaanbaatar', frequency: '108-118 MHz', period: '2026-05-02', status: 'normal' },
    ] },
  ];

  const licenseCountTrend = [
    { month: '2025-05', count: 4020 },
    { month: '2025-06', count: 4050 },
    { month: '2025-07', count: 4085 },
    { month: '2025-08', count: 4120 },
    { month: '2025-09', count: 4155 },
    { month: '2025-10', count: 4185 },
    { month: '2025-11', count: 4215 },
    { month: '2025-12', count: 4242 },
    { month: '2026-01', count: 4265 },
    { month: '2026-02', count: 4280 },
    { month: '2026-03', count: 4295 },
    { month: '2026-04', count: 4310 },
  ];

  const licenseDetailRecords = licenseCountData.flatMap((item) => item.details);

  const stationCountByType = [
    {
      type: 'Mobile',
      licenses: 1580,
      stations: 1245,
      ratio: 0.79,
      province: 'Ulaanbaatar',
      date: '2026-05',
      details: [
        { number: 'LIC-2024-001580', organization: 'Mongolia Telecom', region: 'Ulaanbaatar', frequency: '1800-1850 MHz', period: '2026-05-02', status: 'normal', stationCount: 1245 },
        { number: 'LIC-2024-001581', organization: 'Mongolia Telecom', region: 'Ulaanbaatar', frequency: '1850-1900 MHz', period: '2026-05-02', status: 'normal', stationCount: 1245 },
      ],
    },
    {
      type: 'Broadcasting',
      licenses: 890,
      stations: 790,
      ratio: 0.89,
      province: 'Dornogovi',
      date: '2026-05',
      details: [
        { number: 'LIC-2024-000890', organization: 'Mongolia Broadcasting', region: 'Dornogovi', frequency: '470-478 MHz', period: '2026-05-02', status: 'expiring', stationCount: 790 },
      ],
    },
    {
      type: 'Fixed',
      licenses: 650,
      stations: 508,
      ratio: 0.78,
      province: 'Central',
      date: '2026-05',
      details: [
        { number: 'LIC-2024-000650', organization: 'National Communications', region: 'Central', frequency: '5925-5965 MHz', period: '2026-05-02', status: 'normal', stationCount: 508 },
      ],
    },
    {
      type: 'Satellite',
      licenses: 420,
      stations: 314,
      ratio: 0.75,
      province: 'Khentii',
      date: '2026-05',
      details: [
        { number: 'LIC-2024-000420', organization: 'Satellite Communications Co', region: 'Khentii', frequency: '11700-11750 MHz', period: '2026-05-02', status: 'expired', stationCount: 314 },
      ],
    },
    {
      type: 'Microwave',
      licenses: 333,
      stations: 280,
      ratio: 0.84,
      province: 'Selenge',
      date: '2026-05',
      details: [
        { number: 'LIC-2024-000333', organization: 'Network Infra Ltd', region: 'Selenge', frequency: '5925-6425 MHz', period: '2026-05-02', status: 'normal', stationCount: 280 },
      ],
    },
  ];

  const [selectedLicenseType, setSelectedLicenseType] = useState('Mobile');
  const [countDateFilter, setCountDateFilter] = useState('2026-05');
  const [countProvinceFilter, setCountProvinceFilter] = useState('All');
  const [detailStartDate, setDetailStartDate] = useState('');
  const [detailEndDate, setDetailEndDate] = useState('');
  const [detailRegion, setDetailRegion] = useState('All');
  const [detailBusinessType, setDetailBusinessType] = useState('All');
  const [stationCountDateFilter, setStationCountDateFilter] = useState('2026-05');
  const [stationCountProvinceFilter, setStationCountProvinceFilter] = useState('All');
  const [validityDateFilter, setValidityDateFilter] = useState('2026-05');
  const [validityProvinceFilter, setValidityProvinceFilter] = useState('All');
  const [includeExpired, setIncludeExpired] = useState(true);

  const validityStatus = [
    { month: '2026-05', province: 'Ulaanbaatar', normal: 3985, expiring: 42, expired: 18 },
    { month: '2026-06', province: 'Dornogovi', normal: 3920, expiring: 58, expired: 25 },
    { month: '2026-07', province: 'Central', normal: 3855, expiring: 67, expired: 32 },
    { month: '2026-08', province: 'Selenge', normal: 3770, expiring: 85, expired: 45 },
    { month: '2026-09', province: 'Khentii', normal: 3698, expiring: 72, expired: 38 },
    { month: '2026-10', province: 'Ulaanbaatar', normal: 3603, expiring: 95, expired: 52 },
    { month: '2026-11', province: 'Dornogovi', normal: 3555, expiring: 88, expired: 48 },
    { month: '2026-12', province: 'Central', normal: 3435, expiring: 120, expired: 65 },
    { month: '2027-01', province: 'Selenge', normal: 3365, expiring: 98, expired: 42 },
    { month: '2027-02', province: 'Khentii', normal: 3308, expiring: 104, expired: 50 },
    { month: '2027-03', province: 'Ulaanbaatar', normal: 3244, expiring: 110, expired: 56 },
    { month: '2027-04', province: 'Dornogovi', normal: 3190, expiring: 96, expired: 61 },
    { month: '2027-05', province: 'Central', normal: 3142, expiring: 102, expired: 58 },
    { month: '2027-06', province: 'Selenge', normal: 3098, expiring: 118, expired: 64 },
    { month: '2027-07', province: 'Khentii', normal: 3036, expiring: 125, expired: 70 },
    { month: '2027-08', province: 'Ulaanbaatar', normal: 2985, expiring: 132, expired: 75 },
    { month: '2027-09', province: 'Dornogovi', normal: 2924, expiring: 120, expired: 68 },
    { month: '2027-10', province: 'Central', normal: 2876, expiring: 128, expired: 72 },
    { month: '2027-11', province: 'Selenge', normal: 2819, expiring: 134, expired: 77 },
    { month: '2027-12', province: 'Khentii', normal: 2765, expiring: 140, expired: 81 },
  ];
  const validityLicenseRecords = validityStatus.flatMap((row, index) => [
    { month: row.month, province: row.province, number: `VL-${row.month.replace('-', '')}-${String(index + 1).padStart(3, '0')}`, organization: 'Mongolia Telecom', region: row.province, frequency: '1800-1850 MHz', period: `${row.month}-15`, status: 'normal', stationCount: 1200 },
    { month: row.month, province: row.province, number: `VL-${row.month.replace('-', '')}-${String(index + 101).padStart(3, '0')}`, organization: 'National Communications', region: row.province, frequency: '470-478 MHz', period: `${row.month}-20`, status: 'expiring', stationCount: 790 },
    { month: row.month, province: row.province, number: `VL-${row.month.replace('-', '')}-${String(index + 201).padStart(3, '0')}`, organization: 'Aviation Authority', region: row.province, frequency: '5925-5965 MHz', period: `${row.month}-25`, status: 'expired', stationCount: 508 },
  ]);

  const countBusinessTypes = Array.from(new Set(licenseCountData.map((item) => item.type)));
  const countProvinces = ['All', ...Array.from(new Set(licenseCountData.map((item) => item.province)))];
  const detailRegions = ['All', 'Ulaanbaatar', 'Dornogovi', 'Central', 'Selenge', 'Khentii'];
  const detailTypes = ['All', ...businessTypes];
  const validityMonthOptions = Array.from(new Set(validityStatus.map((item) => item.month))).sort().reverse();
  const validityProvinceOptions = ['All', ...Array.from(new Set(validityStatus.map((item) => item.province))).sort()];
  const validityStartIndex = validityMonthOptions.indexOf(validityDateFilter);
  const validityStartMonth = validityStartIndex >= 0 ? validityMonthOptions[validityStartIndex] : validityMonthOptions[0];
  const validityFutureMonths = Array.from({ length: 12 }, (_, index) => {
    const [year, month] = validityStartMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + index, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  });
  const filteredValidityStatus = validityFutureMonths.flatMap((month) => validityStatus.filter((row) => row.month === month && (validityProvinceFilter === 'All' || row.province === validityProvinceFilter) && (includeExpired || row.expired === 0)));
  const monthlyValidityRecords = validityLicenseRecords.filter((record) => record.month === validityDateFilter && (validityProvinceFilter === 'All' || record.province === validityProvinceFilter) && (includeExpired || record.status !== 'expired'));
  const validityChartData = validityFutureMonths.map((month) => {
    const rows = validityStatus.filter((row) => row.month === month && (validityProvinceFilter === 'All' || row.province === validityProvinceFilter));
    return {
      month,
      normal: rows.reduce((sum, row) => sum + row.normal, 0),
      expiring: rows.reduce((sum, row) => sum + row.expiring, 0),
      expired: rows.reduce((sum, row) => sum + row.expired, 0),
    };
  });
  const validityDisplayData = validityChartData.map((item) => ({
    ...item,
    expired: includeExpired ? item.expired : 0,
  }));
  const filteredCountData = licenseCountData.filter((item) => (
    (countProvinceFilter === 'All' || item.province === countProvinceFilter)
    && (!countDateFilter || item.date.startsWith(countDateFilter))
  ));
  const selectedCountItem = filteredCountData.find((item) => item.type === selectedLicenseType) ?? filteredCountData[0] ?? licenseCountData[0];
  const countChartRows = filteredCountData.map((item) => ({
    ...item,
    value: item.count,
  }));
  const filteredStationCountData = stationCountByType.filter((item) => (
    (stationCountProvinceFilter === 'All' || item.province === stationCountProvinceFilter)
    && (!stationCountDateFilter || item.date.startsWith(stationCountDateFilter))
  ));
  const selectedStationType = filteredStationCountData.find((item) => item.type === selectedLicenseType) ?? filteredStationCountData[0] ?? stationCountByType[0];
  const stationChartRows = filteredStationCountData.map((item) => ({
    ...item,
    value: item.stations,
  }));
  const selectedStationDetails = selectedStationType?.details ?? [];
  const filteredDetailRecords = licenseDetailRecords.filter((record) => {
    const recordDate = record.period;
    const matchesStart = !detailStartDate || recordDate >= detailStartDate;
    const matchesEnd = !detailEndDate || recordDate <= detailEndDate;
    return matchesStart
      && matchesEnd
      && (detailRegion === 'All' || record.region === detailRegion)
      && (detailBusinessType === 'All' || record.organization.includes(detailBusinessType) || record.frequency.includes(detailBusinessType));
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">License Analysis</h2>
        <p className="text-muted-foreground">Frequency license data statistics and resource utilization analysis</p>
      </div>

      {/* Analysis Type Tabs */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => setAnalysisType('usage')}
          className={`px-6 py-3 rounded-lg transition-colors ${
            analysisType === 'usage' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border hover:bg-muted'
          }`}
        >
          Usage Rate Analysis
        </button>
        <button
          onClick={() => setAnalysisType('count')}
          className={`px-6 py-3 rounded-lg transition-colors ${
            analysisType === 'count' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border hover:bg-muted'
          }`}
        >
          License Count Statistics
        </button>
        <button
          onClick={() => setAnalysisType('station')}
          className={`px-6 py-3 rounded-lg transition-colors ${
            analysisType === 'station' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border hover:bg-muted'
          }`}
        >
          Licensed Station Count
        </button>
        <button
          onClick={() => setAnalysisType('validity')}
          className={`px-6 py-3 rounded-lg transition-colors ${
            analysisType === 'validity' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border hover:bg-muted'
          }`}
        >
          Validity Period Statistics
        </button>
      </div>

      {analysisType === 'usage' && (
        <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-6">
          {/* Left filter sidebar */}
          <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Business Types</h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedBusinessType('All')}
                className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${selectedBusinessType === 'All' ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}
              >
                All Types
              </button>
              {businessTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedBusinessType(type)}
                  className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${selectedBusinessType === type ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Usage Rate Growth Analysis Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select value={selectedBusinessType} onChange={(e) => setSelectedBusinessType(e.target.value)} className="px-4 py-2 border border-border rounded-lg bg-input-background">
                  <option value="All">All Business Types</option>
                  {businessTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
                <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="px-4 py-2 border border-border rounded-lg bg-input-background">
                  {years.map((year) => <option key={year} value={year}>{year}</option>)}
                </select>
                <select value={selectedProvince} onChange={(e) => setSelectedProvince(e.target.value)} className="px-4 py-2 border border-border rounded-lg bg-input-background">
                  {provinces.map((province) => <option key={province} value={province}>{province === 'All' ? 'All Provinces' : province}</option>)}
                </select>
              </div>
            </div>

            {/* Summary card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
                <div className="text-sm text-muted-foreground">Selected Business Type</div>
                <div className="text-xl font-semibold mt-1">{selectedBusinessType}</div>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
                <div className="text-sm text-muted-foreground">Selected Year</div>
                <div className="text-xl font-semibold mt-1">{selectedYear}</div>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
                <div className="text-sm text-muted-foreground">Selected Province</div>
                <div className="text-xl font-semibold mt-1">{selectedProvince}</div>
              </div>
            </div>

            {/* Top-right YoY chart */}
            <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Selected Year vs Previous Year Same Month Growth</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={selectedYearSamePeriodComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="usageRate" fill="#1976d2" name="Monthly Usage Rate (%)" />
                  <Bar dataKey="growthRate" fill="#42a5f5" name="YoY Growth (%)" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 text-sm text-muted-foreground">
                Y-axis shows monthly usage rate and year-over-year growth relative to the same month in the previous year.
              </div>
            </div>

            {/* Bottom-right MoM chart */}
            <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Selected Year: Month vs Previous Month Growth</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={selectedYearMonthComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="usageRate" fill="#2e7d32" name="Monthly Usage Rate (%)" />
                  <Bar dataKey="growthRate" fill="#66bb6a" name="MoM Growth (%)" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 text-sm text-muted-foreground">
                Y-axis shows monthly usage rate and month-over-month growth relative to the previous month.
              </div>
            </div>
          </div>
        </div>
      )}

      {analysisType === 'count' && (
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Count Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <input
                  type="date"
                  value={countDateFilter}
                  onChange={(e) => setCountDateFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-input-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Province / Region</label>
                <select value={countProvinceFilter} onChange={(e) => setCountProvinceFilter(e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background">
                  {countProvinces.map((province) => <option key={province} value={province}>{province === 'All' ? 'All Provinces' : province}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
                <div className="text-sm text-muted-foreground mb-1">Filtered Records</div>
                <div className="text-3xl font-semibold">{filteredCountData.length}</div>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
                <div className="text-sm text-muted-foreground mb-1">Selected Type Count</div>
                <div className="text-3xl font-semibold">{selectedCountItem?.count ?? 0}</div>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
                <div className="text-sm text-muted-foreground mb-1">Selected Type Province</div>
                <div className="text-xl font-semibold mt-1">{selectedCountItem?.province ?? '-'}</div>
              </div>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
              <h3 className="text-lg font-semibold mb-4">License Count by Service Type</h3>
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={countChartRows} onClick={(state) => {
                  const clicked = state?.activePayload?.[0]?.payload;
                  if (clicked?.type) setSelectedLicenseType(clicked.type);
                }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Authorized Count" isAnimationActive={false}>
                    {countChartRows.map((entry) => (
                      <Cell key={entry.type} fill={selectedLicenseType === entry.type ? '#f97316' : '#1976d2'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 text-sm text-muted-foreground">
                Blue indicates unselected. Orange highlights the selected business type.
              </div>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
              <h3 className="text-lg font-semibold mb-4">License Detail</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date / End Date</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="date"
                      value={detailStartDate}
                      onChange={(e) => setDetailStartDate(e.target.value)}
                      className="px-4 py-2 border border-border rounded-lg bg-input-background"
                    />
                    <input
                      type="date"
                      value={detailEndDate}
                      onChange={(e) => setDetailEndDate(e.target.value)}
                      className="px-4 py-2 border border-border rounded-lg bg-input-background"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Region</label>
                  <select value={detailRegion} onChange={(e) => setDetailRegion(e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background">
                    {detailRegions.map((region) => <option key={region} value={region}>{region === 'All' ? 'All Regions' : region}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Business Type</label>
                  <select value={detailBusinessType} onChange={(e) => setDetailBusinessType(e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background">
                    {detailTypes.map((type) => <option key={type} value={type}>{type === 'All' ? 'All Business Types' : type}</option>)}
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4">License No.</th>
                      <th className="text-left py-3 px-4">Organization</th>
                      <th className="text-left py-3 px-4">Region</th>
                      <th className="text-left py-3 px-4">Frequency</th>
                      <th className="text-left py-3 px-4">Period</th>
                      <th className="text-center py-3 px-4">Status</th>
                      <th className="text-center py-3 px-4">View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDetailRecords.map((record) => (
                      <tr key={record.number} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{record.number}</td>
                        <td className="py-3 px-4">{record.organization}</td>
                        <td className="py-3 px-4">{record.region}</td>
                        <td className="py-3 px-4">{record.frequency}</td>
                        <td className="py-3 px-4">{record.period}</td>
                        <td className="text-center py-3 px-4">
                          <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                            record.status === 'normal' ? 'bg-green-100 text-green-700' :
                            record.status === 'expiring' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {record.status === 'normal' ? 'Normal' : record.status === 'expiring' ? 'Expiring' : 'Expired'}
                          </span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <button
                            type="button"
                            onClick={() => setSelectedLicenseDetail({
                              number: record.number,
                              organization: record.organization,
                              region: record.region,
                              frequency: record.frequency,
                              period: record.period,
                              status: record.status,
                            })}
                            className="text-primary hover:text-orange-500 underline underline-offset-2"
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {analysisType === 'station' && (
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
            <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
              <h3 className="text-lg font-semibold">Licensed Station Analysis</h3>
              <div className="flex items-center gap-3 text-sm flex-wrap">
                <input
                  type="month"
                  value={stationCountDateFilter}
                  onChange={(e) => setStationCountDateFilter(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg bg-input-background"
                />
                <select
                  value={stationCountProvinceFilter}
                  onChange={(e) => setStationCountProvinceFilter(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg bg-input-background"
                >
                  {countProvinces.map((province) => <option key={province} value={province}>{province === 'All' ? 'All Provinces' : province}</option>)}
                </select>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={stationChartRows} onClick={(state) => {
                const clicked = state?.activePayload?.[0]?.payload;
                if (clicked?.type) setSelectedLicenseType(clicked.type);
              }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="stations" name="Station Count">
                  {stationChartRows.map((entry) => (
                    <Cell key={`station-${entry.type}`} fill={selectedLicenseType === entry.type ? '#f97316' : '#1976d2'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 text-sm text-muted-foreground">Blue indicates unselected, orange highlights the selected service type.</div>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Authorized Station Details - {selectedLicenseType === 'All' ? 'All Types' : selectedLicenseType}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Time Period</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input type="date" value={detailStartDate} onChange={(e) => setDetailStartDate(e.target.value)} className="px-4 py-2 border border-border rounded-lg bg-input-background" />
                  <input type="date" value={detailEndDate} onChange={(e) => setDetailEndDate(e.target.value)} className="px-4 py-2 border border-border rounded-lg bg-input-background" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Region</label>
                <select value={detailRegion} onChange={(e) => setDetailRegion(e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background">
                  {detailRegions.map((region) => <option key={region} value={region}>{region === 'All' ? 'All Regions' : region}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Business Type</label>
                <select value={detailBusinessType} onChange={(e) => setDetailBusinessType(e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background">
                  {detailTypes.map((type) => <option key={type} value={type}>{type === 'All' ? 'All Business Types' : type}</option>)}
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4">License No.</th>
                    <th className="text-left py-3 px-4">Organization</th>
                    <th className="text-left py-3 px-4">Region</th>
                    <th className="text-left py-3 px-4">Frequency</th>
                    <th className="text-left py-3 px-4">Period</th>
                    <th className="text-center py-3 px-4">Status</th>
                    <th className="text-center py-3 px-4">Station Count</th>
                    <th className="text-center py-3 px-4">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStationDetails.map((detail) => (
                    <tr key={detail.number} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{detail.number}</td>
                      <td className="py-3 px-4">{detail.organization}</td>
                      <td className="py-3 px-4">{detail.region}</td>
                      <td className="py-3 px-4">{detail.frequency}</td>
                      <td className="py-3 px-4">{detail.period}</td>
                      <td className="text-center py-3 px-4">
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${detail.status === 'normal' ? 'bg-green-100 text-green-700' : detail.status === 'expiring' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {detail.status === 'normal' ? 'Normal' : detail.status === 'expiring' ? 'Expiring' : 'Expired'}
                        </span>
                      </td>
                      <td className="text-center py-3 px-4 font-semibold">{detail.stationCount}</td>
                      <td className="text-center py-3 px-4">
                        <button type="button" onClick={() => setSelectedStationDetail({
                          number: detail.number,
                          organization: detail.organization,
                          region: detail.region,
                          frequency: detail.frequency,
                          period: detail.period,
                          status: detail.status,
                          stationCount: detail.stationCount,
                        })} className="text-primary hover:text-orange-500 underline underline-offset-2">Detail</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedLicenseDetail && (
        <DetailModal
          title="License Details"
          subtitle="Detailed frequency authorization information"
          onClose={() => setSelectedLicenseDetail(null)}
          fields={[
            ['License / Authorization', selectedLicenseDetail.number],
            ['Organization', selectedLicenseDetail.organization],
            ['Category', selectedLicenseDetail.frequency],
            ['Law', selectedLicenseDetail.region],
            ['Type', selectedLicenseDetail.status],
            ['Start Date', selectedLicenseDetail.period],
            ['End Date', selectedLicenseDetail.period],
            ['Coverage Area', selectedLicenseDetail.frequency],
            ['Process', 'Approved'],
            ['Status', selectedLicenseDetail.status],
            ['Code / No.', selectedLicenseDetail.number.replace('LIC-', '')],
            ['Decision Date', selectedLicenseDetail.period],
            ['Decision', 'Granted'],
            ['Description', 'Frequency authorization detail view'],
            ['Registration', selectedLicenseDetail.organization],
            ['Address', selectedLicenseDetail.region],
            ['Phone', 'N/A'],
            ['Email', 'N/A'],
            ['Administrative Info', 'Frequency management system'],
            ['Contact Person', 'N/A'],
            ['Station Count', selectedLicenseDetail.stationCount ?? 'N/A'],
          ]}
        />
      )}

      {selectedStationDetail && (
        <DetailModal
          title="Authorized Station Detail"
          subtitle="Station-specific frequency authorization information"
          onClose={() => setSelectedStationDetail(null)}
          fields={[
            ['License / Authorization', selectedStationDetail.number],
            ['Organization', selectedStationDetail.organization],
            ['Category', selectedStationDetail.frequency],
            ['Law', selectedStationDetail.region],
            ['Type', selectedStationDetail.status],
            ['Start Date', selectedStationDetail.period],
            ['End Date', selectedStationDetail.period],
            ['Coverage Area', selectedStationDetail.frequency],
            ['Process', 'Approved'],
            ['Status', selectedStationDetail.status],
            ['Code / No.', selectedStationDetail.number.replace('LIC-', '')],
            ['Decision Date', selectedStationDetail.period],
            ['Decision', 'Granted'],
            ['Description', 'Station authorization detail view'],
            ['Registration', selectedStationDetail.organization],
            ['Address', selectedStationDetail.region],
            ['Phone', 'N/A'],
            ['Email', 'N/A'],
            ['Administrative Info', 'Frequency management system'],
            ['Contact Person', 'N/A'],
            ['Station Count', selectedStationDetail.stationCount ?? 'N/A'],
          ]}
        />
      )}

      {selectedValidityLicense && (
        <DetailModal
          title="Frequency License Detail"
          subtitle="Detailed frequency authorization information"
          onClose={() => setSelectedValidityLicense(null)}
          fields={[
            ['License / Authorization', selectedValidityLicense.number],
            ['Organization', selectedValidityLicense.organization],
            ['Category', selectedValidityLicense.frequency],
            ['Law', selectedValidityLicense.region],
            ['Type', selectedValidityLicense.status],
            ['Start Date', selectedValidityLicense.period],
            ['End Date', selectedValidityLicense.period],
            ['Coverage Area', selectedValidityLicense.frequency],
            ['Process', 'Approved'],
            ['Status', selectedValidityLicense.status],
            ['Code / No.', selectedValidityLicense.number.replace('VL-', '')],
            ['Decision Date', selectedValidityLicense.period],
            ['Decision', 'Granted'],
            ['Description', 'Frequency authorization detail view'],
            ['Registration', selectedValidityLicense.organization],
            ['Address', selectedValidityLicense.region],
            ['Phone', 'N/A'],
            ['Email', 'N/A'],
            ['Administrative Info', 'Frequency management system'],
            ['Contact Person', 'N/A'],
            ['Station Count', selectedValidityLicense.stationCount ?? 'N/A'],
          ]}
        />
      )}

      {analysisType === 'validity' && (
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
            <h3 className="text-lg font-semibold mb-4">License Validity Forecast (Next 12 Months)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <select value={validityDateFilter} onChange={(e) => setValidityDateFilter(e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background">
                  {validityMonthOptions.map((month) => <option key={month} value={month}>{month}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Province / Region</label>
                <select value={validityProvinceFilter} onChange={(e) => setValidityProvinceFilter(e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background">
                  {validityProvinceOptions.map((province) => <option key={province} value={province}>{province === 'All' ? 'All Provinces' : province}</option>)}
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm font-medium rounded-lg border border-border bg-input-background px-4 py-2 w-full">
                  <input type="checkbox" checked={includeExpired} onChange={(e) => setIncludeExpired(e.target.checked)} />
                  <span>Include Expired</span>
                </label>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={validityDisplayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar key="validity-normal" dataKey="normal" stackId="a" fill="#2e7d32" name="Normal" />
                <Bar key="validity-expiring" dataKey="expiring" stackId="a" fill="#f57c00" name="Expiring (60 days)" />
                <Bar key="validity-expired" dataKey="expired" stackId="a" fill="#d32f2f" name="Expired" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Selected Date</div>
              <div className="text-2xl font-semibold text-primary">{validityDateFilter}</div>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Selected Province</div>
              <div className="text-2xl font-semibold">{validityProvinceFilter}</div>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Expired Licenses</div>
              <div className="text-2xl font-semibold text-red-600">{filteredValidityStatus.reduce((sum, row) => sum + row.expired, 0)}</div>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Total Licenses</div>
              <div className="text-2xl font-semibold">{filteredValidityStatus.reduce((sum, row) => sum + row.normal + row.expiring + row.expired, 0)}</div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Monthly Validity Details - {new Date(`${validityDateFilter}-01`).toLocaleString('en-US', { month: 'long' })}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Province / Region</label>
                <select value={validityProvinceFilter} onChange={(e) => setValidityProvinceFilter(e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background">
                  {validityProvinceOptions.map((province) => <option key={province} value={province}>{province === 'All' ? 'All Provinces' : province}</option>)}
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm font-medium rounded-lg border border-border bg-input-background px-4 py-2 w-full">
                  <input type="checkbox" checked={includeExpired} onChange={(e) => setIncludeExpired(e.target.checked)} />
                  <span>Include Expired</span>
                </label>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-center py-3 px-4">Province</th>
                    <th className="text-center py-3 px-4">License No.</th>
                    <th className="text-center py-3 px-4">Organization</th>
                    <th className="text-center py-3 px-4">Status</th>
                    <th className="text-center py-3 px-4">End Date</th>
                    <th className="text-center py-3 px-4">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyValidityRecords.map((record) => (
                    <tr key={`${record.month}-${record.number}`} className="border-b border-border hover:bg-muted/50">
                      <td className="text-center py-3 px-4">{record.province}</td>
                      <td className="text-center py-3 px-4">{record.number}</td>
                      <td className="text-center py-3 px-4">{record.organization}</td>
                      <td className="text-center py-3 px-4">
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${record.status === 'normal' ? 'bg-green-100 text-green-700' : record.status === 'expiring' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {record.status === 'normal' ? 'Normal' : record.status === 'expiring' ? 'Expiring' : 'Expired'}
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">{record.period}</td>
                      <td className="text-center py-3 px-4">
                        <button onClick={() => setSelectedValidityLicense({
                          number: record.number,
                          organization: record.organization,
                          region: record.region,
                          frequency: record.frequency,
                          period: record.period,
                          status: record.status,
                          stationCount: record.stationCount,
                        })} className="text-primary hover:text-orange-500 underline underline-offset-2">Detail</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

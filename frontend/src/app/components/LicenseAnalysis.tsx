import { useMemo, useState, useEffect } from 'react';
import { BarChart, Bar, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { statisticsApi, PermitUsageByMonthVO, LicenseCountByTypeVO, StationCountDetailVO, ValidityForecastVO, PermitQuery, PermitVO } from '../api/statistics';

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
    startDate: string;
    endDate: string;
    status: string;
    stationCount?: number;
  } | null>(null);
  const [selectedStationDetail, setSelectedStationDetail] = useState<{
    number: string;
    organization: string;
    region: string;
    frequency: string;
    startDate: string;
    endDate: string;
    status: string;
    stationCount?: number;
  } | null>(null);
  const [selectedValidityLicense, setSelectedValidityLicense] = useState<{
    number: string;
    organization: string;
    region: string;
    frequency: string;
    startDate: string;
    endDate: string;
    status: string;
    stationCount?: number;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Usage Rate Analysis data (loaded from API)
  const [usageMonthlyData, setUsageMonthlyData] = useState<PermitUsageByMonthVO[]>([]);

  // License Count Statistics data
  const [licenseCountData, setLicenseCountData] = useState<LicenseCountByTypeVO[]>([]);
  const [licenseCountTrend, setLicenseCountTrend] = useState<{ month: string; count: number }[]>([]);
  const [licenseDetailRecords, setLicenseDetailRecords] = useState<any[]>([]);

  // Licensed Station Count data
  const [stationCountByType, setStationCountByType] = useState<StationCountDetailVO[]>([]);

  // Validity Period Statistics data
  const [validityForecast, setValidityForecast] = useState<ValidityForecastVO[]>([]);
  const [validityLicenseRecords, setValidityLicenseRecords] = useState<any[]>([]);

  const businessTypes = ['Mobile', 'Broadcasting', 'Fixed', 'Satellite', 'Microwave', 'Navigation'];
  const provinces = ['All', 'Ulaanbaatar', 'Dornogovi', 'Central', 'Selenge', 'Khentii'];
  const years = ['2024', '2025', '2026'];

  // Filter state - declared before useEffect that references them
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

  // ====== 数据获取函数 ======

  const fetchUsageData = async (businessType: string, province: string, year: string) => {
    try {
      setLoading(true);
      const res = await statisticsApi.permitUsageByMonth({
        businessType: businessType === 'All' ? undefined : businessType,
        province: province === 'All' ? undefined : province,
        year: parseInt(year),
      });
      if (res.code === 200) {
        setUsageMonthlyData(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch usage data:', err);
      setError('Failed to load usage rate data');
    } finally {
      setLoading(false);
    }
  };

  const fetchLicenseCountData = async (province: string, date: string) => {
    try {
      const res = await statisticsApi.permitCountByType({ province, date: date ? `${date}-01` : undefined });
      if (res.code === 200) {
        setLicenseCountData(res.data || []);
        // Generate trend data based on total count
        const total = (res.data || []).reduce((sum: number, item: LicenseCountByTypeVO) => sum + item.count, 0);
        const trend = Array.from({ length: 12 }, (_, i) => {
          const d = new Date();
          d.setMonth(d.getMonth() - 11 + i);
          return {
            month: d.toISOString().slice(0, 7),
            count: total,
          };
        });
        setLicenseCountTrend(trend);
      }
    } catch (err) {
      console.error('Failed to fetch license count:', err);
    }
  };

  const fetchLicenseDetails = async (startDate: string, endDate: string, region: string, businessType: string) => {
    try {
      const query: PermitQuery = { pageSize: 1000 };
      if (region && region !== 'All') query.province = region;
      if (businessType && businessType !== 'All') (query as any).category = businessType;
      if (startDate) query.startDate = startDate;
      if (endDate) query.endDate = endDate;
      const res = await statisticsApi.permitPage(query);
      if (res.code === 200 && res.data?.records) {
        const records = res.data.records.map((p: PermitVO) => mapPermitToLicenseDetail(p));
        setLicenseDetailRecords(records);
      }
    } catch (err) {
      console.error('Failed to fetch license details:', err);
    }
  };

  const fetchStationCountData = async (province: string, date: string) => {
    try {
      const res = await statisticsApi.permitStationCountDetail({ province, date });
      if (res.code === 200) {
        setStationCountByType(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch station count:', err);
    }
  };

  const fetchValidityForecast = async (province: string) => {
    try {
      const res = await statisticsApi.permitValidityForecast({ province, months: 12 });
      if (res.code === 200) {
        setValidityForecast(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch validity forecast:', err);
    }
  };

  const fetchValidityDetails = async (date: string, province: string, includeExpired: boolean) => {
    try {
      const query: PermitQuery = { pageSize: 1000 };
      if (province && province !== 'All') query.province = province;
      const res = await statisticsApi.permitPage(query);
      if (res.code === 200 && res.data?.records) {
        const records = (res.data.records as PermitVO[])
          .filter((p: PermitVO) => {
            const endDate = p.enddate ? new Date(p.enddate) : null;
            const now = new Date();
            if (!includeExpired && endDate && endDate < now) return false;
            return true;
          })
          .map((p: PermitVO) => mapPermitToValidityRecord(p));
        setValidityLicenseRecords(records);
      }
    } catch (err) {
      console.error('Failed to fetch validity details:', err);
    }
  };

  // 辅助函数：计算状态
  function computeStatus(enddate: string | null): 'normal' | 'expiring' | 'expired' {
    if (!enddate) return 'normal';
    const end = new Date(enddate);
    const now = new Date();
    const warning = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    if (end < now) return 'expired';
    if (end < warning) return 'expiring';
    return 'normal';
  }

  function mapPermitToLicenseDetail(p: PermitVO) {
    return {
      number: p.code || p.consent || p.guid,
      organization: p.interlocutor || '',
      region: p.address || '',
      frequency: p.category || '',
      startDate: p.startdate || '',
      endDate: p.enddate || '',
      status: computeStatus(p.enddate),
      province: p.address || '',
    };
  }

  function mapPermitToValidityRecord(p: PermitVO) {
    return {
      number: p.code || p.consent || p.guid,
      organization: p.interlocutor || '',
      region: p.address || '',
      frequency: p.category || '',
      startDate: p.startdate || '',
      endDate: p.enddate || '',
      status: computeStatus(p.enddate),
      stationCount: 0,
      province: p.address || '',
    };
  }

  useEffect(() => {
    if (analysisType === 'usage') {
      fetchUsageData(selectedBusinessType, selectedProvince, selectedYear);
    } else if (analysisType === 'count') {
      fetchLicenseCountData(countProvinceFilter, countDateFilter);
      fetchLicenseDetails(detailStartDate, detailEndDate, detailRegion, detailBusinessType);
    } else if (analysisType === 'station') {
      fetchStationCountData(stationCountProvinceFilter, stationCountDateFilter);
    } else if (analysisType === 'validity') {
      fetchValidityForecast(validityProvinceFilter);
      fetchValidityDetails(validityDateFilter, validityProvinceFilter, includeExpired);
    }
  }, [analysisType, selectedBusinessType, selectedProvince, selectedYear, countProvinceFilter, countDateFilter, detailStartDate, detailEndDate, detailRegion, detailBusinessType, stationCountProvinceFilter, stationCountDateFilter, validityDateFilter, validityProvinceFilter, includeExpired]);

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

  // License Count data is loaded from API via licenseCountData state

  // Station count data is loaded from API via stationCountByType state

  // Validity data is loaded from API via validityForecast and validityLicenseRecords states

  const countBusinessTypes = Array.from(new Set(licenseCountData.map((item) => item.type)));
  const countProvinces = ['All', ...Array.from(new Set(licenseCountData.map((item) => item.province)))];
  const detailRegions = ['All', 'Ulaanbaatar', 'Dornogovi', 'Central', 'Selenge', 'Khentii'];
  const detailTypes = ['All', ...businessTypes];
  const validityMonthOptions = Array.from(new Set(validityForecast.map((item) => item.month))).sort().reverse();
  const validityProvinceOptions = ['All', ...Array.from(new Set(validityForecast.map((item) => item.province))).sort()];
  const validityStartIndex = validityMonthOptions.indexOf(validityDateFilter);
  const validityStartMonth = validityStartIndex >= 0 ? validityMonthOptions[validityStartIndex] : (validityMonthOptions[0] ?? '2026-01');
  const validityFutureMonths = Array.from({ length: 12 }, (_, index) => {
    if (!validityStartMonth) return '2026-01';
    const [year, month] = validityStartMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + index, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  });
  const filteredValidityStatus = validityFutureMonths.flatMap((month) => validityForecast.filter((row) => row.month === month && (validityProvinceFilter === 'All' || row.province === validityProvinceFilter) && (includeExpired || row.expired === 0)));
  const monthlyValidityRecords = validityLicenseRecords.filter((record) => record.month === validityDateFilter && (validityProvinceFilter === 'All' || record.province === validityProvinceFilter) && (includeExpired || record.status !== 'expired'));
  const validityChartData = validityFutureMonths.map((month) => {
    const rows = validityForecast.filter((row) => row.month === month && (validityProvinceFilter === 'All' || row.province === validityProvinceFilter));
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
  const countChartRows = (() => {
    const grouped = filteredCountData.reduce((acc: Record<string, number>, item: LicenseCountByTypeVO) => {
      acc[item.type] = (acc[item.type] || 0) + item.count;
      return acc;
    }, {});
    return Object.entries(grouped).map(([type, count]) => ({ type, count, value: count }));
  })();
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
    const recordDate = record.endDate;
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
            <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
              <h3 className="text-lg font-semibold mb-4">License Count by Service Type</h3>
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={countChartRows} onClick={(state) => {
                  const clicked = state?.activePayload?.[0]?.payload;
                  if (clicked?.type) {
                    setSelectedLicenseType(clicked.type);
                    setDetailBusinessType(clicked.type);
                  }
                }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="type" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" tickMargin={10} height={80} />
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
                      <th className="text-left py-3 px-4">Start Date</th>
                      <th className="text-left py-3 px-4">End Date</th>
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
                        <td className="py-3 px-4">{record.startDate}</td>
                        <td className="py-3 px-4">{record.endDate}</td>
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
                              startDate: record.startDate,
                              endDate: record.endDate,
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
                    <th className="text-left py-3 px-4">Start Date</th>
                    <th className="text-left py-3 px-4">End Date</th>
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
                      <td className="py-3 px-4">{detail.startDate}</td>
                      <td className="py-3 px-4">{detail.endDate}</td>
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
                          startDate: detail.startDate,
                          endDate: detail.endDate,
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
            ['Start Date', selectedLicenseDetail.startDate],
            ['End Date', selectedLicenseDetail.endDate],
            ['Coverage Area', selectedLicenseDetail.frequency],
            ['Process', 'Approved'],
            ['Status', selectedLicenseDetail.status],
            ['Code / No.', selectedLicenseDetail.number.replace('LIC-', '')],
            ['Decision Date', selectedLicenseDetail.endDate],
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
            ['Start Date', selectedStationDetail.startDate],
            ['End Date', selectedStationDetail.endDate],
            ['Coverage Area', selectedStationDetail.frequency],
            ['Process', 'Approved'],
            ['Status', selectedStationDetail.status],
            ['Code / No.', selectedStationDetail.number.replace('LIC-', '')],
            ['Decision Date', selectedStationDetail.endDate],
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
            ['Start Date', selectedValidityLicense.startDate],
            ['End Date', selectedValidityLicense.endDate],
            ['Coverage Area', selectedValidityLicense.frequency],
            ['Process', 'Approved'],
            ['Status', selectedValidityLicense.status],
            ['Code / No.', selectedValidityLicense.number.replace('VL-', '')],
            ['Decision Date', selectedValidityLicense.endDate],
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Selected Date</div>
              <div className="text-2xl font-semibold text-primary">{validityDateFilter}</div>
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
                      <td className="text-center py-3 px-4">{record.endDate}</td>
                      <td className="text-center py-3 px-4">
                        <button onClick={() => setSelectedValidityLicense({
                          number: record.number,
                          organization: record.organization,
                          region: record.region,
                          frequency: record.frequency,
                          startDate: record.startDate,
                          endDate: record.endDate,
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

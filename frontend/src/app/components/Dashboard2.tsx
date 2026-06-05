import { useEffect, useState } from 'react';
import { Radio } from 'lucide-react';
import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { dashboardApi, DashboardOverviewVO } from '../api/dashboard';
import { MongoliaProvinceMap, ProvinceStationData } from './MongoliaProvinceMap';

export function Dashboard2() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [apiData, setApiData] = useState<DashboardOverviewVO | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await dashboardApi.overview();
        setApiData(data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // KPI data
  const kpiData = {
    total: apiData?.totalStations ?? 0,
    normal: apiData?.normalLicenses ?? 0,
    expiring: apiData?.expiringSoon ?? 0,
    expired: apiData?.expired ?? 0,
  };

  // License status pie data
  const licenseStatusData = [
    { name: 'Normal', value: kpiData.normal, color: '#00d4ff' },
    { name: 'Expiring', value: kpiData.expiring, color: '#fbbf24' },
    { name: 'Expired', value: kpiData.expired, color: '#ef4444' },
  ];

  // Station types pie data
  const stationTypesData = apiData?.stationTypes?.map(t => ({
    name: t.name,
    value: t.value,
    color: t.color || '#3b82f6',
  })) ?? [];

  // Growth trend data
  const growthData = apiData?.stationGrowthTrend ?? [
    { month: '11', count: 45 },
    { month: '12', count: 52 },
    { month: '01', count: 58 },
    { month: '02', count: 63 },
    { month: '03', count: 72 },
    { month: '04', count: 85 },
    { month: '05', count: 98 },
  ];

  // License types for bar chart (horizontal)
  const licenseTypesData = [...(apiData?.licenseTypeStats ?? [])]
    .map(d => ({
      type: d.type,
      normal: d.normal,
      expiring: d.expiring,
      expired: d.expired,
      total: d.normal + d.expiring + d.expired,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  // Province map data
  const mapData: ProvinceStationData[] = apiData?.provinceStats?.map(p => ({
    id: p.id,
    name: p.name,
    stations: p.total,
  })) ?? [];

  // Regional ranking data
  const regionData = [...(apiData?.provinceStats ?? [])]
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)
    .map(p => ({
      name: p.name,
      value: p.total,
    }));

  const totalLicense = kpiData.normal + kpiData.expiring + kpiData.expired;

  return (
    <div className="h-full bg-[#0a1628] relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(0, 212, 255, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.15) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      {/* Header */}
      <div className="relative z-10 px-6 py-4 border-b border-cyan-500/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Radio className="w-7 h-7 text-cyan-400" />
          <h1 className="text-2xl font-bold text-cyan-300 tracking-wider">频谱资源分析</h1>
        </div>
        <div className="flex items-center gap-2 text-cyan-400/80">
          <span className="text-sm">{currentTime.toLocaleDateString('zh-CN')}</span>
          <span className="text-sm font-mono">
            {currentTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-[calc(100%-72px)] flex gap-3 p-4">
        {/* Left Panel */}
        <div className="w-80 space-y-3 overflow-y-auto custom-scrollbar pr-1">
          {/* Card 1: Frequency License Statistics */}
          <div className="bg-gradient-to-br from-[#0d2137]/90 to-[#0a1628]/90 backdrop-blur-sm rounded-xl border border-cyan-500/30 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-cyan-400 rounded-full" />
              <h3 className="text-sm font-semibold text-cyan-300">频率许可统计分析</h3>
            </div>
            <div className="flex items-center gap-4">
              {/* Donut chart */}
              <div className="relative w-32 h-32 flex-shrink-0">
                <PieChart width={128} height={128}>
                  <Pie
                    data={licenseStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {licenseStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(10, 22, 40, 0.95)',
                      border: '1px solid rgba(0, 212, 255, 0.3)',
                      borderRadius: '6px',
                      fontSize: '11px',
                    }}
                    formatter={(value: number) => [value.toLocaleString(), '']}
                  />
                </PieChart>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-lg font-bold text-white">{loading ? '-' : totalLicense.toLocaleString()}</span>
                  <span className="text-[9px] text-cyan-400/70">总计</span>
                </div>
              </div>
              {/* Legend */}
              <div className="flex-1 space-y-2">
                {licenseStatusData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-cyan-200/80">{item.name}</span>
                    </div>
                    <span className="text-xs font-medium text-cyan-300">{item.value.toLocaleString()}</span>
                  </div>
                ))}
                {/* Trend indicators */}
                <div className="flex items-center gap-1 mt-2 pt-2 border-t border-cyan-500/20">
                  <span className="text-[10px] text-green-400">↑ 12.5%</span>
                  <span className="text-[9px] text-cyan-400/50">较上月</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Station Type Distribution */}
          <div className="bg-gradient-to-br from-[#0d2137]/90 to-[#0a1628]/90 backdrop-blur-sm rounded-xl border border-cyan-500/30 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-cyan-400 rounded-full" />
              <h3 className="text-sm font-semibold text-cyan-300">台站类型分布</h3>
            </div>
            <div className="flex items-center gap-3">
              {/* Pie chart */}
              <div className="relative w-28 h-28 flex-shrink-0">
                <PieChart width={112} height={112}>
                  <Pie
                    data={stationTypesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={2}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {stationTypesData.map((entry, index) => (
                      <Cell key={`st-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(10, 22, 40, 0.95)',
                      border: '1px solid rgba(0, 212, 255, 0.3)',
                      borderRadius: '6px',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </div>
              {/* Legend */}
              <div className="flex-1 space-y-1.5">
                {stationTypesData.slice(0, 4).map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: item.color }} />
                      <span className="text-[11px] text-cyan-200/80 truncate">{item.name}</span>
                    </div>
                    <span className="text-[11px] font-medium text-cyan-300">{item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3: License Type Statistics (Horizontal Bar) */}
          <div className="bg-gradient-to-br from-[#0d2137]/90 to-[#0a1628]/90 backdrop-blur-sm rounded-xl border border-cyan-500/30 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-cyan-400 rounded-full" />
              <h3 className="text-sm font-semibold text-cyan-300">频率许可统计</h3>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart
                data={licenseTypesData}
                layout="vertical"
                margin={{ top: 0, right: 10, left: 50, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 212, 255, 0.1)" horizontal={false} />
                <XAxis type="number" stroke="#64748b" style={{ fontSize: '9px' }} />
                <YAxis
                  dataKey="type"
                  type="category"
                  stroke="#64748b"
                  style={{ fontSize: '9px' }}
                  width={45}
                  tickFormatter={(v) => v.length > 4 ? v.slice(0, 4) : v}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(10, 22, 40, 0.95)',
                    border: '1px solid rgba(0, 212, 255, 0.3)',
                    borderRadius: '6px',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="total" fill="url(#leftBarGradient)" radius={[0, 3, 3, 0]} />
                <defs>
                  <linearGradient id="leftBarGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.5} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Center Panel - Map */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0d2137]/80 to-[#0a1628]/90 backdrop-blur-sm rounded-xl border border-cyan-500/30 overflow-hidden">
            {/* Map header */}
            <div className="absolute top-3 left-4 z-10 flex items-center gap-2">
              <div className="w-1 h-4 bg-cyan-400 rounded-full" />
              <h3 className="text-sm font-semibold text-cyan-300">台站地域分布</h3>
            </div>
            {/* Ulaanbaatar badge */}
            <div className="absolute top-3 right-4 z-10 bg-cyan-500/20 border border-cyan-400/40 rounded px-3 py-1.5">
              <div className="text-[10px] text-cyan-400/80">省会城市</div>
              <div className="text-sm font-bold text-cyan-300">乌兰巴托</div>
              <div className="text-lg font-bold text-white">{loading ? '-' : mapData[0]?.stations.toLocaleString() || '0'}</div>
            </div>
            {/* Map */}
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-cyan-400">Loading...</span>
              </div>
            ) : mapData.length > 0 ? (
              <div className="absolute inset-8">
                <MongoliaProvinceMap data={mapData} />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-cyan-400/60">暂无数据</span>
              </div>
            )}
            {/* Province count badge */}
            <div className="absolute bottom-3 left-4 z-10 bg-cyan-500/20 border border-cyan-400/40 rounded px-3 py-1.5">
              <span className="text-xs text-cyan-400/80">{mapData.length} 个省份</span>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-80 space-y-3 overflow-y-auto custom-scrollbar pl-1">
          {/* Card: Station Growth Trend */}
          <div className="bg-gradient-to-br from-[#0d2137]/90 to-[#0a1628]/90 backdrop-blur-sm rounded-xl border border-cyan-500/30 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-cyan-400 rounded-full" />
              <h3 className="text-sm font-semibold text-cyan-300">台站增长走势</h3>
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 212, 255, 0.1)" />
                <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '9px' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '9px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(10, 22, 40, 0.95)',
                    border: '1px solid rgba(0, 212, 255, 0.3)',
                    borderRadius: '6px',
                    fontSize: '11px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#00d4ff"
                  strokeWidth={2}
                  dot={{ fill: '#00d4ff', r: 2 }}
                  activeDot={{ r: 4, fill: '#00d4ff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Card: Regional Ranking */}
          <div className="bg-gradient-to-br from-[#0d2137]/90 to-[#0a1628]/90 backdrop-blur-sm rounded-xl border border-cyan-500/30 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-cyan-400 rounded-full" />
              <h3 className="text-sm font-semibold text-cyan-300">区域排名</h3>
            </div>
            <div className="space-y-2">
              {regionData.slice(0, 5).map((item, idx) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-sm flex items-center justify-center text-[10px] font-bold ${
                    idx === 0 ? 'bg-red-500 text-white' :
                    idx === 1 ? 'bg-orange-500 text-white' :
                    idx === 2 ? 'bg-yellow-500 text-black' :
                    'bg-cyan-500/30 text-cyan-300'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="flex-1 text-xs text-cyan-200/80 truncate">{item.name}</span>
                  <span className="text-xs font-medium text-cyan-300">{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Regional Details List */}
          <div className="bg-gradient-to-br from-[#0d2137]/90 to-[#0a1628]/90 backdrop-blur-sm rounded-xl border border-cyan-500/30 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-cyan-400 rounded-full" />
              <h3 className="text-sm font-semibold text-cyan-300">区域详情</h3>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {regionData.map((item, idx) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-cyan-500/10 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-cyan-400/60 w-4">{idx + 1}</span>
                    <span className="text-xs text-cyan-200/80">{item.name}</span>
                  </div>
                  <span className="text-xs font-medium text-cyan-300">{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 212, 255, 0.05);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 212, 255, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 212, 255, 0.5);
        }
      `}</style>
    </div>
  );
}
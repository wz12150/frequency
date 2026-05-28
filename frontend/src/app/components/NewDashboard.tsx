import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardApi } from '../api/dashboard';
import { MongoliaProvinceMap } from './MongoliaProvinceMap';

export function NewDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());

  // State for real API data
  const [kpiData, setKpiData] = useState({
    total: 0,
    normal: 0,
    pending: 0,
    expired: 0,
  });
  const [stationTypeData, setStationTypeData] = useState<Array<{
    type: string; name: string; count: number; percentage: number; color: string;
  }>>([]);
  const [licenseTypeData, setLicenseTypeData] = useState<Array<{
    type: string; name: string; count: number; color: string;
  }>>([]);
  const [trendData, setTrendData] = useState<Array<{date: string; value: number}>>([]);
  const [regionData, setRegionData] = useState<Array<{region: string; count: number; demand: number}>>([]);
  const [loading, setLoading] = useState(true);
  const [mapData, setMapData] = useState<Array<{id: string; name: string; stations: number}>>([]);

  // Fetch dashboard data from API
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await dashboardApi.overview();

        // KPI data - Total = sum of all license types (normal + expiring + expired)
        // Normal/Pending/Expired = totals from license stats
        let totalPermits = 0;
        let totalNormal = 0;
        let totalPending = 0;
        let totalExpired = 0;

        if (data.licenseTypeStats && data.licenseTypeStats.length > 0) {
          data.licenseTypeStats.forEach((item: any) => {
            totalPermits += (item.normal || 0) + (item.expiring || 0) + (item.expired || 0);
            totalNormal += item.normal || 0;
            totalPending += item.expiring || 0;
            totalExpired += item.expired || 0;
          });
        }

        setKpiData({
          total: totalPermits,
          normal: totalNormal,
          pending: totalPending,
          expired: totalExpired,
        });

        // Station type distribution (pie chart) - only top 6
        if (data.stationTypes && data.stationTypes.length > 0) {
          const sorted = [...data.stationTypes]
            .sort((a: any, b: any) => b.value - a.value)
            .slice(0, 6);
          const total = sorted.reduce((sum: number, item: any) => sum + item.value, 0);
          const colors = ['#22d3ee', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa'];
          setStationTypeData(sorted.map((item: any, index: number) => ({
            type: item.name,
            name: item.name,
            count: item.value,
            percentage: total > 0 ? (item.value / total * 100).toFixed(1) : 0,
            color: item.color || colors[index % 6],
          })));
        }

        // License type distribution (from licenseTypeStats) - only top 6
        if (data.licenseTypeStats && data.licenseTypeStats.length > 0) {
          const sorted = [...data.licenseTypeStats]
            .map((item: any) => ({
              type: item.type,
              name: item.type,
              count: item.normal + item.expiring + item.expired,
              color: '#22d3ee',
            }))
            .sort((a: any, b: any) => b.count - a.count)
            .slice(0, 6);
          const colors = ['#22d3ee', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa'];
          setLicenseTypeData(sorted.map((item: any, index: number) => ({
            ...item,
            color: colors[index % 6],
          })));
        }

        // Growth trend
        if (data.stationGrowthTrend && data.stationGrowthTrend.length > 0) {
          setTrendData(data.stationGrowthTrend.map((item: any) => ({
            date: item.month?.slice(5) || '',
            value: item.count || 0,
          })));
        } else {
          setTrendData([
            { date: '11-20', value: 45 },
            { date: '11-21', value: 52 },
            { date: '11-22', value: 48 },
            { date: '11-23', value: 61 },
            { date: '11-24', value: 55 },
            { date: '11-25', value: 67 },
            { date: '11-26', value: 72 },
            { date: '11-27', value: 68 },
            { date: '11-28', value: 75 },
          ]);
        }

        // Province/Region data
        if (data.provinceStats && data.provinceStats.length > 0) {
          setRegionData(data.provinceStats.slice(0, 8).map((item: any) => ({
            region: item.name || item.abbr || '',
            count: item.total || 0,
            demand: (item.total || 0) + Math.floor(Math.random() * 50),
          })));

          // Map data for MongoliaProvinceMap
          setMapData(data.provinceStats.map((item: any) => ({
            id: item.id || item.name?.toLowerCase().replace(/\s+/g, '-') || '',
            name: item.name || item.abbr || '',
            stations: item.total || 0,
          })));
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-full bg-[#0f2847] relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.4) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}></div>
      </div>

      {/* Top header */}
      <div className="relative z-10 flex items-center justify-center px-6 py-4 border-b border-cyan-500/30">
        <div className="text-cyan-400 font-bold text-2xl tracking-wider">Frequency Analysis</div>
      </div>

      <div className="relative z-10 h-[calc(100%-73px)] flex gap-4 p-4">
        {/* Left sidebar */}
        <div className="w-80 space-y-4 overflow-y-auto custom-scrollbar pr-2">
          {/* Frequency Authorization Statistics */}
          <div className="bg-gradient-to-br from-blue-900/60 to-blue-800/50 backdrop-blur-sm rounded-lg border border-cyan-400/40 p-4">
            <div className="text-cyan-300 text-sm mb-3 flex items-center justify-center gap-2">
              <div className="w-1 h-4 bg-cyan-400"></div>
              Frequency Authorization Statistics
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-cyan-500/20 rounded p-3 text-center border border-cyan-400/40 flex flex-col items-center justify-center">
                <div className="text-lg font-bold text-cyan-200">{loading ? '-' : kpiData.total.toLocaleString()}</div>
                <div className="text-xs text-cyan-300/70 mt-1">Total</div>
              </div>
              <div className="bg-green-500/20 rounded p-3 text-center border border-green-400/40 flex flex-col items-center justify-center">
                <div className="text-lg font-bold text-green-200">{loading ? '-' : kpiData.normal.toLocaleString()}</div>
                <div className="text-xs text-green-300/70 mt-1">Normal</div>
              </div>
              <div className="bg-amber-500/20 rounded p-3 text-center border border-amber-400/40 flex flex-col items-center justify-center">
                <div className="text-lg font-bold text-amber-200">{loading ? '-' : kpiData.pending.toLocaleString()}</div>
                <div className="text-xs text-amber-300/70 mt-1">Pending</div>
              </div>
              <div className="bg-emerald-500/20 rounded p-3 text-center border border-emerald-400/40 flex flex-col items-center justify-center">
                <div className="text-lg font-bold text-emerald-200">{loading ? '-' : kpiData.expired.toLocaleString()}</div>
                <div className="text-xs text-emerald-300/70 mt-1">Expired</div>
              </div>
            </div>
          </div>

          {/* Frequency License Type Distribution */}
          <div className="bg-gradient-to-br from-blue-900/60 to-blue-800/50 backdrop-blur-sm rounded-lg border border-cyan-400/40 p-4">
            <div className="text-cyan-300 text-sm mb-3 flex items-center gap-2">
              <div className="w-1 h-4 bg-cyan-400"></div>
              Frequency License Types Distributions
            </div>
            {/* License Status Pie Chart */}
            <div className="mb-4 flex flex-col items-center">
              <p className="text-xs text-cyan-300/70 mb-2">License Status</p>
              <div className="relative w-40 h-40 mx-auto">
                <PieChart width={160} height={160}>
                  <Pie
                    data={[
                      { name: 'Normal', value: kpiData.normal, color: '#34d399' },
                      { name: 'Pending', value: kpiData.pending, color: '#fbbf24' },
                      { name: 'Expired', value: kpiData.expired, color: '#f87171' },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {[
                      { name: 'Normal', value: kpiData.normal, color: '#34d399' },
                      { name: 'Pending', value: kpiData.pending, color: '#fbbf24' },
                      { name: 'Expired', value: kpiData.expired, color: '#f87171' },
                    ].map((entry, index) => (
                      <Cell key={`license-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(34, 211, 238, 0.3)',
                      borderRadius: '6px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number, name: string) => {
                      const total = kpiData.normal + kpiData.pending + kpiData.expired;
                      return [`${value} (${total > 0 ? ((value / total) * 100).toFixed(1) : 0}%)`, name];
                    }}
                  />
                </PieChart>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="text-xl font-bold text-cyan-300">{loading ? '-' : (kpiData.normal + kpiData.pending + kpiData.expired).toLocaleString()}</div>
                  <div className="text-[10px] text-cyan-400/70">Total</div>
                </div>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-xs">
                  <div className="w-2 h-2 rounded-sm bg-[#34d399]"></div>
                  <span className="text-cyan-300/70">Normal {kpiData.total > 0 ? ((kpiData.normal / kpiData.total) * 100).toFixed(1) : 0}%</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <div className="w-2 h-2 rounded-sm bg-[#fbbf24]"></div>
                  <span className="text-cyan-300/70">Pending {kpiData.total > 0 ? ((kpiData.pending / kpiData.total) * 100).toFixed(1) : 0}%</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <div className="w-2 h-2 rounded-sm bg-[#f87171]"></div>
                  <span className="text-cyan-300/70">Expired {kpiData.total > 0 ? ((kpiData.expired / kpiData.total) * 100).toFixed(1) : 0}%</span>
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1.5">
              {licenseTypeData.map((item) => (
                <div key={item.type} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }}></div>
                    <span className="text-cyan-200/80">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-200 font-medium">{item.count.toLocaleString()}</span>
                    <span className="text-cyan-400/60 text-[10px]">({((item.count / licenseTypeData.reduce((s, i) => s + i.count, 0)) * 100).toFixed(1)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Authorized Station Count */}
          <div className="bg-gradient-to-br from-blue-900/60 to-blue-800/50 backdrop-blur-sm rounded-lg border border-cyan-400/40 p-4">
            <div className="text-center mb-2">
              <div className="text-cyan-200 text-base font-medium">Authorized Station Count</div>
            </div>
            <div className="relative w-48 h-48 mx-auto">
              <PieChart width={192} height={192}>
                <Pie
                  data={stationTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="count"
                  startAngle={90}
                  endAngle={-270}
                >
                  {stationTypeData.map((entry, index) => (
                    <Cell key={`cell-${entry.type}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(34, 211, 238, 0.3)',
                    borderRadius: '6px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number, name: string, props: any) => [
                    `${value} (${props.payload.percentage}%)`,
                    props.payload.name
                  ]}
                />
              </PieChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-3xl font-bold text-cyan-300">{loading ? '-' : stationTypeData.reduce((sum, item) => sum + item.count, 0).toLocaleString()}</div>
                <div className="text-xs text-cyan-400/70 mt-1">Total</div>
              </div>
            </div>
            <div className="mt-3 space-y-1.5">
              {stationTypeData.map((item) => (
                <div key={item.type} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }}></div>
                    <span className="text-cyan-200/80">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-200 font-medium">{item.count.toLocaleString()}</span>
                    <span className="text-cyan-400/60 text-[10px]">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>


        </div>

        {/* Center map area */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 to-blue-800/50 backdrop-blur-sm rounded-lg border border-cyan-400/40 overflow-hidden">
            {/* Map container - Using MongoliaProvinceMap component, full area */}
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-cyan-400">Loading...</div>
              </div>
            ) : mapData.length > 0 ? (
              <div className="absolute inset-0">
                <MongoliaProvinceMap data={mapData} />
              </div>
            ) : null}
          </div>
        </div>

        {/* Right panel */}
        <div className="w-80 space-y-4 overflow-y-auto custom-scrollbar pr-2">
          {/* Station Growth Statistics */}
          <div className="bg-gradient-to-br from-blue-900/60 to-blue-800/50 backdrop-blur-sm rounded-lg border border-cyan-400/40 p-4 h-56">
            <div className="text-cyan-300 text-sm mb-2 flex items-center gap-2">
              <div className="w-1 h-4 bg-cyan-400"></div>
              Station Growth Statistics
            </div>
            <ResponsiveContainer width="100%" height="88%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.1)" />
                <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '10px' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '10px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(34, 211, 238, 0.3)',
                    borderRadius: '6px',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  dot={{ fill: '#22d3ee', r: 3 }}
                  activeDot={{ r: 5, fill: '#06b6d4' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Regional Station Count Statistics */}
          <div className="bg-gradient-to-br from-blue-900/60 to-blue-800/50 backdrop-blur-sm rounded-lg border border-cyan-400/40 p-4 h-72">
            <div className="text-cyan-300 text-sm mb-2 flex items-center gap-2">
              <div className="w-1 h-4 bg-cyan-400"></div>
              Regional Station Count Statistics
            </div>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={regionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.1)" />
                <XAxis dataKey="region" stroke="#64748b" style={{ fontSize: '10px' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '10px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(34, 211, 238, 0.3)',
                    borderRadius: '6px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Regional Station Count */}
          <div className="bg-gradient-to-br from-blue-900/60 to-blue-800/50 backdrop-blur-sm rounded-lg border border-cyan-400/40 p-4">
            <div className="text-cyan-300 text-sm mb-2 flex items-center gap-2">
              <div className="w-1 h-4 bg-cyan-400"></div>
              Regional Station Count
            </div>
            <div className="space-y-1.5">
              {regionData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1.5 hover:bg-cyan-500/15 px-2 rounded transition-colors">
                  <span className="text-cyan-200 w-24 truncate">{item.region}</span>
                  <span className="text-cyan-200 font-medium">{loading ? '-' : item.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Custom styles for glow markers and animations */}
      <style>{`
        .glow-marker {
          position: relative;
        }
        .glow-core {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 40%;
          height: 40%;
          background: #22d3ee;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 10px #22d3ee, 0 0 20px #22d3ee, 0 0 30px #22d3ee;
        }
        .glow-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(34, 211, 238, 0.6) 0%, rgba(34, 211, 238, 0) 70%);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0.5;
          }
        }
        @keyframes orbit {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(59, 130, 246, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(34, 211, 238, 0.6);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 211, 238, 0.9);
        }
      `}</style>
    </div>
  );
}

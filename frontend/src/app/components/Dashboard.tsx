import { useState, useEffect, useMemo } from 'react';
import {
  Activity, TrendingUp, AlertTriangle, CheckCircle, Clock,
  Settings2, FileCheck, Radio,
} from 'lucide-react';
import { dashboardApi, DashboardOverviewVO } from '../api/dashboard';
import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { MongoliaProvinceMap, ProvinceStationData } from './MongoliaProvinceMap';

// ── Tooltip: license horizontal bar ──────────────────────────────────────────
const LicenseBarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const normal   = payload.find((p: any) => p.dataKey === 'normal')?.value   ?? 0;
  const expiring = payload.find((p: any) => p.dataKey === 'expiring')?.value ?? 0;
  const expired  = payload.find((p: any) => p.dataKey === 'expired')?.value  ?? 0;
  const total    = normal + expiring + expired;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm min-w-[180px]">
      <p className="font-semibold text-gray-800 mb-2">{label}</p>
      <div className="space-y-1.5">
        {[
          { label: 'Normal',          val: normal,   cls: 'text-green-700', dot: '#2e7d32' },
          { label: 'Expiring (≤60d)', val: expiring, cls: 'text-amber-600', dot: '#f59e0b' },
          { label: 'Expired',         val: expired,  cls: 'text-red-600',   dot: '#d32f2f' },
        ].map(r => (
          <div key={r.label} className="flex justify-between gap-6">
            <span className="flex items-center gap-1.5 text-gray-600">
              <span className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: r.dot }} />
              {r.label}
            </span>
            <span className={`font-semibold tabular-nums ${r.cls}`}>{r.val.toLocaleString()}</span>
          </div>
        ))}
        <div className="border-t border-gray-100 pt-1.5 flex justify-between">
          <span className="text-gray-500">Total</span>
          <span className="font-semibold tabular-nums">{total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

// ── Tooltip: province stacked bar ─────────────────────────────────────────────
const ProvinceBarTooltip = ({ active, payload, label, days }: any) => {
  if (!active || !payload?.length) return null;
  const normal   = payload.find((p: any) => p.dataKey === 'normal')?.value   ?? 0;
  const expiring = payload.find((p: any) => p.dataKey === 'expiring')?.value ?? 0;
  const expired  = payload.find((p: any) => p.dataKey === 'expired')?.value  ?? 0;
  const total    = normal + expiring + expired;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm min-w-[170px]">
      <p className="font-semibold text-gray-800 mb-2">{label}</p>
      <div className="space-y-1">
        {[
          { label: 'Normal',               val: normal,   dot: '#2e7d32', cls: 'text-green-700' },
          { label: `Expiring (≤${days}d)`, val: expiring, dot: '#f59e0b', cls: 'text-amber-600' },
          { label: 'Expired',              val: expired,  dot: '#d32f2f', cls: 'text-red-600'   },
        ].map(r => (
          <div key={r.label} className="flex justify-between gap-4">
            <span className="flex items-center gap-1.5 text-gray-600">
              <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: r.dot }} />
              {r.label}
            </span>
            <span className={`font-medium tabular-nums ${r.cls}`}>{r.val}</span>
          </div>
        ))}
        <div className="border-t border-gray-100 mt-1.5 pt-1.5 flex justify-between">
          <span className="text-gray-500">Total</span>
          <span className="font-semibold">{total}</span>
        </div>
      </div>
    </div>
  );
};

// ── Divider used inside grouped cards ─────────────────────────────────────────
function SectionDivider({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
        {title}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

export function Dashboard() {
  const [expiringDays, setExpiringDays] = useState(60);
  const [inputDays, setInputDays] = useState('60');

  // ── API data state ─────────────────────────────────────────────────────────
  const [apiData, setApiData] = useState<DashboardOverviewVO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Province breakdown (threshold-driven) ─────────────────────────────────
  const allProvinceData = useMemo(() => {
    if (!apiData?.provinceStats) return [];
    return apiData.provinceStats.map(p => {
      const rawExpiring = Math.round(p.expiring60 * (expiringDays / 60));
      const expiring    = Math.min(rawExpiring, p.total - p.expired);
      const normal      = Math.max(0, p.total - expiring - p.expired);
      return { ...p, stations: p.total, expiring, normal };
    });
  }, [apiData?.provinceStats, expiringDays]);

  const provinceStationData: ProvinceStationData[] =
    apiData?.provinceStats?.map(p => ({
      id: p.id, name: p.name, stations: p.total,
    })) ?? [];

  const totalNormal   = allProvinceData.reduce((s, p) => s + p.normal,   0);
  const totalExpiring = allProvinceData.reduce((s, p) => s + p.expiring, 0);
  const totalExpired  = allProvinceData.reduce((s, p) => s + p.expired,  0);
  const totalAll      = totalNormal + totalExpiring + totalExpired;

  // ── License aggregates ────────────────────────────────────────────────────
  const licNormal    = apiData?.licenseTypeStats?.reduce((s, d) => s + d.normal,   0)   ?? 0;
  const licExpiring = apiData?.licenseTypeStats?.reduce((s, d) => s + d.expiring, 0)   ?? 0;
  const licExpired  = apiData?.licenseTypeStats?.reduce((s, d) => s + d.expired,  0)   ?? 0;
  const licTotal    = licNormal + licExpiring + licExpired;

  const licenseChartData = [...(apiData?.licenseTypeStats ?? [])]
    .map(d => ({ ...d, total: d.normal + d.expiring + d.expired }))
    .sort((a, b) => b.total - a.total);

  const licDonutData = [
    { name: 'Normal',   value: licNormal,   color: '#2e7d32' },
    { name: 'Expiring', value: licExpiring, color: '#f59e0b' },
    { name: 'Expired',  value: licExpired,  color: '#d32f2f' },
  ];

  const stationTypes = apiData?.stationTypes?.map(t => ({
    id: t.id,
    name: t.name,
    value: t.value,
    color: t.color,
  })) ?? [];

  const growthData = apiData?.stationGrowthTrend ?? [];

  const stats = [
    {
      label: 'Total Stations',
      value: (apiData?.totalStations ?? 0).toLocaleString(),
      change: apiData?.stationGrowth ?? '+0%',
      icon: Activity,
      color: 'bg-blue-500',
    },
    {
      label: 'Normal Licenses',
      value: (apiData?.normalLicenses ?? 0).toLocaleString(),
      change: apiData?.licenseGrowth ?? '+0%',
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      label: 'Expiring Soon',
      value: (apiData?.expiringSoon ?? 0).toLocaleString(),
      change: apiData?.expiringGrowth ?? '+0%',
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      label: 'Expired',
      value: (apiData?.expired ?? 0).toLocaleString(),
      change: apiData?.expiredGrowth ?? '+0%',
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
  ];

  const applyDays = () => {
    const v = parseInt(inputDays, 10);
    if (!isNaN(v) && v > 0 && v <= 365) setExpiringDays(v);
    else setInputDays(String(expiringDays));
  };

  // ── Fetch Dashboard data ────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    setError(null);
    dashboardApi.overview()
      .then((data: DashboardOverviewVO) => {
        setApiData(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message || 'Failed to load dashboard data');
        setLoading(false);
      });
  }, []);

  return (
    <>
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading dashboard data...</div>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center h-64 space-y-3">
          <AlertTriangle className="w-8 h-8 text-red-500" />
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >Reload</button>
        </div>
      )}

      {!loading && !error && (
      <div className="space-y-6">

      {/* Page title */}
      <div>
        <h2 className="text-2xl font-semibold mb-2">Overview Dashboard</h2>
        <p className="text-muted-foreground">Spectrum resource usage and real-time statistics</p>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          KPI Cards
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-card p-6 rounded-lg border border-border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-3xl font-semibold">{stat.value}</p>
                  <p className={`text-sm mt-2 flex items-center gap-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    <TrendingUp className="w-4 h-4" />
                    {stat.change}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 1 — Province Station Count Map
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-semibold">Province Station Count Statistics</h3>
          <span className="text-sm text-muted-foreground">
            Based on Station Info Table · {totalAll.toLocaleString()} total stations
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Administrative boundary map of Mongolia — station count per province (aimag)
        </p>
        <MongoliaProvinceMap data={provinceStationData} />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 2 — Frequency License Statistics
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold">Frequency License Statistics</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Based on Frequency License Information Table · Expiring threshold: 60 days
              </p>
            </div>
          </div>
          <span className="text-sm text-muted-foreground tabular-nums">
            {licTotal.toLocaleString()} total licensed stations
          </span>
        </div>

        <div className="p-6 space-y-6">

          {/* Status summary cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-green-700 font-medium mb-0.5">Normal</p>
                <p className="text-2xl font-bold text-green-800 tabular-nums">{licNormal.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-0.5">{((licNormal / licTotal) * 100).toFixed(1)}% of total</p>
              </div>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-amber-700 font-medium mb-0.5">Expiring (≤60 days)</p>
                <p className="text-2xl font-bold text-amber-800 tabular-nums">{licExpiring.toLocaleString()}</p>
                <p className="text-xs text-amber-600 mt-0.5">{((licExpiring / licTotal) * 100).toFixed(1)}% of total</p>
              </div>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-red-700 font-medium mb-0.5">Expired</p>
                <p className="text-2xl font-bold text-red-800 tabular-nums">{licExpired.toLocaleString()}</p>
                <p className="text-xs text-red-600 mt-0.5">{((licExpired / licTotal) * 100).toFixed(1)}% of total</p>
              </div>
            </div>
          </div>

          {/* Donut + stacked bar */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Donut */}
            <div className="lg:col-span-2 flex flex-col items-center justify-center">
              <p className="text-sm font-medium text-muted-foreground mb-2">Overall License Status</p>
              <div className="relative">
                <ResponsiveContainer width={220} height={220}>
                  <PieChart>
                    <Pie
                      data={licDonutData}
                      cx="50%" cy="50%"
                      innerRadius={62} outerRadius={95}
                      paddingAngle={2}
                      dataKey="value"
                      startAngle={90} endAngle={-270}
                    >
                      {licDonutData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => [v.toLocaleString(), '']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-gray-800">{licTotal.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">Total</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 mt-2 w-full max-w-[200px]">
                {licDonutData.map(d => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: d.color }} />
                      <span className="text-muted-foreground">{d.name}</span>
                    </span>
                    <span className="font-medium tabular-nums">{d.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Horizontal stacked bar — top 6 types */}
            <div className="lg:col-span-3">
              <p className="text-sm font-medium text-muted-foreground mb-3">Top 6 License Types by Station Count</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={licenseChartData}
                  layout="vertical"
                  margin={{ top: 0, right: 24, left: 8, bottom: 0 }}
                  barSize={22}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <YAxis dataKey="type" type="category" width={88} tick={{ fontSize: 12, fill: '#374151' }} />
                  <Tooltip content={<LicenseBarTooltip />} />
                  <Legend verticalAlign="bottom" height={28}
                    formatter={(v) => <span style={{ fontSize: 12, color: '#374151' }}>{v}</span>}
                  />
                  <Bar dataKey="normal"   stackId="s" fill="#2e7d32" name="Normal"          />
                  <Bar dataKey="expiring" stackId="s" fill="#f59e0b" name="Expiring (≤60d)" />
                  <Bar dataKey="expired"  stackId="s" fill="#d32f2f" name="Expired" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detail table */}
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="text-left py-2.5 px-4 font-semibold">Rank</th>
                  <th className="text-left py-2.5 px-4 font-semibold">License Type</th>
                  <th className="text-center py-2.5 px-4 font-semibold">Total</th>
                  <th className="text-center py-2.5 px-4 font-semibold text-green-700">Normal</th>
                  <th className="text-center py-2.5 px-4 font-semibold text-amber-600">Expiring (≤60d)</th>
                  <th className="text-center py-2.5 px-4 font-semibold text-red-600">Expired</th>
                  <th className="text-left py-2.5 px-4 font-semibold">Status Distribution</th>
                </tr>
              </thead>
              <tbody>
                {licenseChartData.map((row, idx) => {
                  const total = row.normal + row.expiring + row.expired;
                  const nPct  = (row.normal   / total) * 100;
                  const ePct  = (row.expiring / total) * 100;
                  const xPct  = (row.expired  / total) * 100;
                  return (
                    <tr key={row.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white ${
                          idx === 0 ? 'bg-blue-600' : idx === 1 ? 'bg-blue-500' : idx === 2 ? 'bg-blue-400' : 'bg-gray-400'
                        }`}>{idx + 1}</span>
                      </td>
                      <td className="py-3 px-4 font-medium">{row.type}</td>
                      <td className="text-center py-3 px-4 tabular-nums font-medium">{total.toLocaleString()}</td>
                      <td className="text-center py-3 px-4 text-green-700 tabular-nums">{row.normal.toLocaleString()}</td>
                      <td className="text-center py-3 px-4 text-amber-600 tabular-nums">{row.expiring.toLocaleString()}</td>
                      <td className="text-center py-3 px-4 text-red-600 tabular-nums">{row.expired.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex h-4 rounded overflow-hidden w-full min-w-[100px]"
                          title={`Normal ${nPct.toFixed(0)}% / Expiring ${ePct.toFixed(0)}% / Expired ${xPct.toFixed(0)}%`}>
                          <div style={{ width: `${nPct}%`, background: '#2e7d32' }} />
                          <div style={{ width: `${ePct}%`, background: '#f59e0b' }} />
                          <div style={{ width: `${xPct}%`, background: '#d32f2f' }} />
                        </div>
                        <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5 tabular-nums">
                          <span>{nPct.toFixed(0)}%</span>
                          <span>{ePct.toFixed(0)}%</span>
                          <span>{xPct.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border bg-muted/40">
                  <td className="py-2.5 px-4 font-semibold" colSpan={2}>Total</td>
                  <td className="text-center py-2.5 px-4 font-semibold tabular-nums">{licTotal.toLocaleString()}</td>
                  <td className="text-center py-2.5 px-4 font-semibold text-green-700 tabular-nums">{licNormal.toLocaleString()}</td>
                  <td className="text-center py-2.5 px-4 font-semibold text-amber-600 tabular-nums">{licExpiring.toLocaleString()}</td>
                  <td className="text-center py-2.5 px-4 font-semibold text-red-600 tabular-nums">{licExpired.toLocaleString()}</td>
                  <td className="py-2.5 px-4">
                    <div className="flex h-4 rounded overflow-hidden w-full min-w-[100px]">
                      <div style={{ width: `${(licNormal / licTotal) * 100}%`, background: '#2e7d32' }} />
                      <div style={{ width: `${(licExpiring / licTotal) * 100}%`, background: '#f59e0b' }} />
                      <div style={{ width: `${(licExpired / licTotal) * 100}%`, background: '#d32f2f' }} />
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 3 — Station Statistics (4 sub-modules grouped)
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold">Station Statistics</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Based on Station Information Table · Type distribution, growth trend, and regional status
              </p>
            </div>
          </div>
          <span className="text-sm text-muted-foreground tabular-nums">
            {totalAll.toLocaleString()} total stations · 22 aimags
          </span>
        </div>

        <div className="p-6 space-y-8">

          {/* ── Sub-section A: Type Distribution + Growth Trend ────────────── */}
          <SectionDivider title="Type Distribution & Growth Trend" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Station Type Distribution */}
            <div className="rounded-lg border border-border p-5">
              <h4 className="font-medium mb-4 text-gray-700">Station Type Distribution</h4>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={stationTypes}
                    cx="50%" cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={95}
                    dataKey="value"
                  >
                    {stationTypes.map(entry => (
                      <Cell key={`pie-cell-${entry.id}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                {stationTypes.map(type => (
                  <div key={`legend-${type.id}`} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded flex-shrink-0" style={{ backgroundColor: type.color }} />
                    <span className="text-muted-foreground">{type.name}: {type.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Growth Trend */}
            <div className="rounded-lg border border-border p-5">
              <h4 className="font-medium mb-4 text-gray-700">Station Growth Trend (Last 12 Months)</h4>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#1976d2" strokeWidth={2} dot={{ fill: '#1976d2', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Sub-section B: Province Count by Status ────────────────────── */}
          <SectionDivider title="Province Station Count by Status" />
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <p className="text-sm text-muted-foreground">All 22 aimags — stacked by Normal / Expiring / Expired</p>
              <div className="flex items-center gap-2 bg-muted/60 border border-border rounded-lg px-3 py-2">
                <Settings2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground whitespace-nowrap">Expiring within</span>
                <input
                  type="number" min={1} max={365}
                  value={inputDays}
                  onChange={e => setInputDays(e.target.value)}
                  onBlur={applyDays}
                  onKeyDown={e => e.key === 'Enter' && applyDays()}
                  className="w-16 text-center text-sm font-medium border border-border rounded px-2 py-1 bg-background focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <span className="text-sm text-muted-foreground">days</span>
                <button
                  onClick={applyDays}
                  className="ml-1 px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >Apply</button>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mb-5">
              {[
                { label: 'Normal',                      value: totalNormal,   color: 'bg-green-100 text-green-800 border-green-200' },
                { label: `Expiring (≤${expiringDays}d)`, value: totalExpiring, color: 'bg-amber-100 text-amber-800 border-amber-200' },
                { label: 'Expired',                     value: totalExpired,  color: 'bg-red-100 text-red-800 border-red-200'       },
              ].map(b => (
                <span key={b.label} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border font-medium ${b.color}`}>
                  {b.label}
                  <span className="font-semibold tabular-nums">{b.value.toLocaleString()}</span>
                </span>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={allProvinceData} margin={{ top: 4, right: 16, left: 0, bottom: 60 }} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="abbr" tick={{ fontSize: 11, fill: '#6b7280' }} angle={-40} textAnchor="end" interval={0} height={60} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} width={40} />
                <Tooltip content={<ProvinceBarTooltip days={expiringDays} />} />
                <Legend verticalAlign="top" height={32}
                  formatter={(v) => <span style={{ fontSize: 12, color: '#374151' }}>{v}</span>}
                />
                <Bar dataKey="normal"   stackId="s" fill="#2e7d32" name="Normal"                       />
                <Bar dataKey="expiring" stackId="s" fill="#f59e0b" name={`Expiring (≤${expiringDays}d)`} />
                <Bar dataKey="expired"  stackId="s" fill="#d32f2f" name="Expired" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ── Sub-section C: Regional Expiration Table ───────────────────── */}
          <SectionDivider title="Regional Station Expiration Status" />
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">Expiration breakdown by province</p>
              <span className="text-sm text-muted-foreground">
                Expiring threshold: <span className="font-medium text-amber-600">{expiringDays} days</span>
              </span>
            </div>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left py-3 px-4 font-semibold">Region</th>
                    <th className="text-center py-3 px-4 font-semibold">Total</th>
                    <th className="text-center py-3 px-4 font-semibold text-green-700">Normal</th>
                    <th className="text-center py-3 px-4 font-semibold text-amber-600">Expiring (≤{expiringDays}d)</th>
                    <th className="text-center py-3 px-4 font-semibold text-red-600">Expired</th>
                    <th className="text-center py-3 px-4 font-semibold">Expiry Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {allProvinceData.map(p => {
                    const expireRate   = ((p.expired / p.total) * 100).toFixed(1);
                    const expiringRate = ((p.expiring + p.expired) / p.total) * 100;
                    return (
                      <tr key={p.id} className="border-b border-border hover:bg-muted/40 transition-colors">
                        <td className="py-2.5 px-4 font-medium">{p.name}</td>
                        <td className="text-center py-2.5 px-4 tabular-nums">{p.total.toLocaleString()}</td>
                        <td className="text-center py-2.5 px-4 text-green-700 tabular-nums">{p.normal.toLocaleString()}</td>
                        <td className="text-center py-2.5 px-4 text-amber-600 tabular-nums">{p.expiring.toLocaleString()}</td>
                        <td className="text-center py-2.5 px-4 text-red-600 tabular-nums">{p.expired.toLocaleString()}</td>
                        <td className="text-center py-2.5 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-red-400 rounded-full" style={{ width: `${Math.min(expiringRate, 100)}%` }} />
                            </div>
                            <span className={`tabular-nums text-xs ${parseFloat(expireRate) > 10 ? 'text-red-600' : 'text-muted-foreground'}`}>
                              {expireRate}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border bg-muted/40">
                    <td className="py-2.5 px-4 font-semibold">Total</td>
                    <td className="text-center py-2.5 px-4 font-semibold tabular-nums">{totalAll.toLocaleString()}</td>
                    <td className="text-center py-2.5 px-4 font-semibold text-green-700 tabular-nums">{totalNormal.toLocaleString()}</td>
                    <td className="text-center py-2.5 px-4 font-semibold text-amber-600 tabular-nums">{totalExpiring.toLocaleString()}</td>
                    <td className="text-center py-2.5 px-4 font-semibold text-red-600 tabular-nums">{totalExpired.toLocaleString()}</td>
                    <td className="text-center py-2.5 px-4 font-semibold tabular-nums">
                      {((totalExpired / totalAll) * 100).toFixed(1)}%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

        </div>
      </div>

    </div>
      )}
    </>
  );
}

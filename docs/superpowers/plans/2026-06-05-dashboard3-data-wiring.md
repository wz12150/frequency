# 驾驶舱数据关联实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把现有 `Cockpit/` 目录下的硬编码驾驶舱改造为 `Dashboard3`，接入真实 API 数据

**Architecture:** Cockpit 组件全部重写，从静态数据改为调用 `dashboardApi.overview()`，子面板（LeftPanel/RightPanel/MapSection/DashboardHeader）全部通过 props 接收数据，按需增加 API 端点

**Tech Stack:** React 18 + TypeScript + recharts（已有）/ 原生 SVG 图表（保留）/ `dashboardApi`（已有）

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `frontend/src/app/components/Cockpit/` | Rename → `Dashboard3/` | 重命名目录（含 4 个子文件） |
| `frontend/src/app/components/Dashboard3/Dashboard3.tsx` | Create | 主容器，useEffect 调用 `dashboardApi.overview()`，向下传递 props |
| `frontend/src/app/components/Dashboard3/DashboardHeader.tsx` | Modify | 时间改为 `new Date()`（实时），其余不变 |
| `frontend/src/app/components/Dashboard3/LeftPanel.tsx` | Modify | 接收 `leftPanelData` prop，从 API 数据计算渲染 |
| `frontend/src/app/components/Dashboard3/RightPanel.tsx` | Modify | 接收 `rightPanelData` prop，从 API 数据计算渲染 |
| `frontend/src/app/components/Dashboard3/MapSection.tsx` | Modify | 接收 `mapData` prop，从 API `provinceStats` 渲染省份气泡 |
| `frontend/src/app/components/Dashboard3/index.ts` | Create | `export { Dashboard3 }` |
| `frontend/src/app/App.tsx` | Modify | `import Dashboard3` 替换 `Cockpit`，路由 case 改为 `dashboard3` |
| `frontend/src/app/components/Layout.tsx` | Modify | `id: 'cockpit'` → `id: 'dashboard3'`，label 保持"驾驶舱" |
| `frontend/src/app/api/dashboard.ts` | Modify | 可选：补充 `Dashboard3VO` 接口（与 `DashboardOverviewVO` 共用） |

---

## Task 1: 重命名 Cockpit 目录为 Dashboard3

**Files:**
- Rename: `frontend/src/app/components/Cockpit/` → `frontend/src/app/components/Dashboard3/`

- [ ] **Step 1: 重命名目录**

Run: (PowerShell)
```powershell
Rename-Item -Path "d:\workspace\10Frequency\frontend\src\app\components\Cockpit" -NewName "Dashboard3"
```

Expected: 目录成功重命名

- [ ] **Step 2: 验证文件存在**

Run:
```powershell
Get-ChildItem "d:\workspace\10Frequency\frontend\src\app\components\Dashboard3"
```

Expected: 列出 `Cockpit.tsx`, `LeftPanel.tsx`, `RightPanel.tsx`, `MapSection.tsx`, `DashboardHeader.tsx`, `logoImg.ts`, `mapImg.ts`

---

## Task 2: 创建 Dashboard3 主容器组件

**Files:**
- Create: `frontend/src/app/components/Dashboard3/Dashboard3.tsx`
- Create: `frontend/src/app/components/Dashboard3/index.ts`

- [ ] **Step 1: 创建 Dashboard3.tsx**

```typescript
import { useEffect, useState } from 'react';
import { dashboardApi, DashboardOverviewVO } from '../../api/dashboard';
import { DashboardHeader } from './DashboardHeader';
import { LeftPanel } from './LeftPanel';
import { MapSection } from './MapSection';
import { RightPanel } from './RightPanel';

interface LeftPanelData {
  totalStations: number;
  normal: number;
  expiring: number;
  expired: number;
  licenseAuthList: { label: string; value: number }[];
  stationTypeList: { name: string; value: number; color: string }[];
}

interface RightPanelData {
  growthTrend: { month: string; count: number }[];
  regionStats: { name: string; value: number; color: string }[];
}

interface MapData {
  id: string;
  name: string;
  stations: number;
}

export function Dashboard3() {
  const [apiData, setApiData] = useState<DashboardOverviewVO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.overview()
      .then((data: DashboardOverviewVO) => {
        setApiData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Left panel data
  const leftData: LeftPanelData = {
    totalStations: apiData?.totalStations ?? 0,
    normal: apiData?.normalLicenses ?? 0,
    expiring: apiData?.expiringSoon ?? 0,
    expired: apiData?.expired ?? 0,
    licenseAuthList: (apiData?.licenseTypeStats ?? []).slice(0, 6).map((l, i) => ({
      label: l.type,
      value: l.normal + l.expiring + l.expired,
    })),
    stationTypeList: (apiData?.stationTypes ?? []).map(t => ({
      name: t.name,
      value: t.value,
      color: t.color || '#00bcd4',
    })),
  };

  // Right panel data
  const rightData: RightPanelData = {
    growthTrend: apiData?.stationGrowthTrend ?? [],
    regionStats: (apiData?.provinceStats ?? [])
      .sort((a, b) => b.total - a.total)
      .slice(0, 16)
      .map((p, i) => ({
        name: p.abbr || p.name,
        value: p.total,
        color: i === 0 ? '#00bcd4' : i < 3 ? '#4ade80' : '#c86ef0',
      })),
  };

  // Map data
  const mapData: MapData[] = (apiData?.provinceStats ?? []).map(p => ({
    id: p.id,
    name: p.name,
    stations: p.total,
  }));

  return (
    <div style={{
      width: '100%', height: '100vh', minHeight: '640px',
      background: '#0d3552',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', position: 'relative',
    }}>
      {/* Dot grid background */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'radial-gradient(circle, rgba(0,140,190,0.18) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />
      {/* Vignette overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 90% 85% at 50% 50%, transparent 30%, rgba(1,5,15,0.62) 100%)',
      }} />

      {/* Main layout */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <DashboardHeader />
        <div style={{ flex: 1, display: 'flex', padding: '8px', gap: '8px', overflow: 'hidden' }}>
          <LeftPanel data={leftData} loading={loading} />
          <MapSection data={mapData} loading={loading} />
          <RightPanel data={rightData} loading={loading} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 创建 index.ts**

```typescript
export { Dashboard3 } from './Dashboard3';
```

---

## Task 3: 重写 LeftPanel 接收 API 数据

**Files:**
- Modify: `frontend/src/app/components/Dashboard3/LeftPanel.tsx:1-165`

- [ ] **Step 1: 重写 LeftPanel 组件**

将文件内容替换为以下完整实现（保留原有视觉样式，仅将硬编码数据替换为 props）：

```typescript
import React from 'react';

interface LeftPanelProps {
  data: {
    totalStations: number;
    normal: number;
    expiring: number;
    expired: number;
    licenseAuthList: { label: string; value: number }[];
    stationTypeList: { name: string; value: number; color: string }[];
  };
  loading: boolean;
}

const CARD: React.CSSProperties = {
  background: 'rgba(15,48,88,0.92)',
  border: '1px solid rgba(0,160,210,0.3)',
  borderRadius: '4px', padding: '10px 12px',
  boxShadow: 'inset 0 0 30px rgba(0,100,160,0.06)',
};

function STitle({ text }: { text: string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'7px', marginBottom:'10px' }}>
      <div style={{ width:'3px', height:'14px', borderRadius:'2px', background:'linear-gradient(180deg,#00e5ff,#006aaa)', flexShrink:0 }} />
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="7.5" cy="7.5" r="7" stroke="#00bcd4" strokeWidth="1" fill="none" opacity="0.45"/>
        <circle cx="7.5" cy="7.5" r="4.2" stroke="#00bcd4" strokeWidth="1" fill="none" opacity="0.7"/>
        <circle cx="7.5" cy="7.5" r="1.5" fill="#00bcd4" opacity="0.9"/>
        <line x1="7.5" y1="0.5" x2="7.5" y2="3.3" stroke="#00bcd4" strokeWidth="1" opacity="0.6"/>
        <line x1="14.5" y1="7.5" x2="11.7" y2="7.5" stroke="#00bcd4" strokeWidth="1" opacity="0.6"/>
        <line x1="7.5" y1="14.5" x2="7.5" y2="11.7" stroke="#00bcd4" strokeWidth="1" opacity="0.6"/>
        <line x1="0.5" y1="7.5" x2="3.3" y2="7.5" stroke="#00bcd4" strokeWidth="1" opacity="0.6"/>
      </svg>
      <span style={{ color:'#d8eeff', fontSize:'12px', fontWeight:600, letterSpacing:'1px', fontFamily:'sans-serif' }}>{text}</span>
    </div>
  );
}

function SubLabel({ text }: { text: string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'5px', marginBottom:'8px' }}>
      <div style={{ width:0, height:0, borderTop:'4px solid transparent', borderBottom:'4px solid transparent', borderLeft:'7px solid #ffb800' }} />
      <span style={{ color:'#7ab4cc', fontSize:'11px', fontFamily:'sans-serif' }}>{text}</span>
    </div>
  );
}

function StatCard({ type, value, label }: { type:'ok'|'warn'|'err', value:string, label:string }) {
  const C = {
    ok:   { bg:'rgba(0,180,220,0.07)',  bdr:'rgba(0,180,220,0.42)',  txt:'#00e5ff' },
    warn: { bg:'rgba(200,140,0,0.07)',  bdr:'rgba(200,140,0,0.42)',  txt:'#ffb800' },
    err:  { bg:'rgba(210,40,40,0.07)', bdr:'rgba(210,40,40,0.42)',  txt:'#ff4040' },
  }[type];
  return (
    <div style={{ flex:1, background:C.bg, border:`1px solid ${C.bdr}`, borderRadius:'4px', padding:'7px 4px 8px', display:'flex', flexDirection:'column', alignItems:'center', gap:'3px' }}>
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <circle cx="13" cy="13" r="12" stroke={C.txt} strokeWidth="1" fill="none" opacity="0.3"/>
        <circle cx="13" cy="13" r="7.5" stroke={C.txt} strokeWidth="1" fill="none" opacity="0.6"/>
        {type === 'ok'   && <><circle cx="13" cy="13" r="2.2" fill={C.txt}/><line x1="13" y1="1" x2="13" y2="5.5" stroke={C.txt} strokeWidth="1.4"/><line x1="13" y1="20.5" x2="13" y2="25" stroke={C.txt} strokeWidth="1.4"/><line x1="1" y1="13" x2="5.5" y2="13" stroke={C.txt} strokeWidth="1.4"/><line x1="20.5" y1="13" x2="25" y2="13" stroke={C.txt} strokeWidth="1.4"/></>}
        {type === 'warn' && <><circle cx="13" cy="13" r="1.5" fill={C.txt}/><path d="M13 7.5 L13 13" stroke={C.txt} strokeWidth="1.8" strokeLinecap="round"/><path d="M13 13 L17 17" stroke={C.txt} strokeWidth="1.4" strokeLinecap="round"/></>}
        {type === 'err'  && <><line x1="9" y1="9" x2="17" y2="17" stroke={C.txt} strokeWidth="1.8" strokeLinecap="round"/><line x1="17" y1="9" x2="9" y2="17" stroke={C.txt} strokeWidth="1.8" strokeLinecap="round"/></>}
      </svg>
      <span style={{ color:C.txt, fontSize:'20px', fontWeight:700, lineHeight:1, fontFamily:'sans-serif' }}>{value}</span>
      <span style={{ color:'#7ab4cc', fontSize:'10px', fontFamily:'sans-serif' }}>{label}</span>
    </div>
  );
}

function DonutSVG({ slices }: { slices: { name: string; pct: number; color: string }[] }) {
  const cx = 53, cy = 53, innerR = 33, outerR = 51, gap = 0.03;
  let angle = -Math.PI / 2;
  const paths = slices.map((d, i) => {
    const sweep = (d.pct / 100) * 2 * Math.PI - gap;
    const a1 = angle + gap / 2;
    const a2 = a1 + sweep;
    const x1 = cx + outerR * Math.cos(a1), y1 = cy + outerR * Math.sin(a1);
    const x2 = cx + outerR * Math.cos(a2), y2 = cy + outerR * Math.sin(a2);
    const ix1 = cx + innerR * Math.cos(a1), iy1 = cy + innerR * Math.sin(a1);
    const ix2 = cx + innerR * Math.cos(a2), iy2 = cy + innerR * Math.sin(a2);
    const large = sweep > Math.PI ? 1 : 0;
    const path = `M${x1.toFixed(2)},${y1.toFixed(2)} A${outerR},${outerR} 0 ${large} 1 ${x2.toFixed(2)},${y2.toFixed(2)} L${ix2.toFixed(2)},${iy2.toFixed(2)} A${innerR},${innerR} 0 ${large} 0 ${ix1.toFixed(2)},${iy1.toFixed(2)} Z`;
    angle += (d.pct / 100) * 2 * Math.PI;
    return <path key={`ds-${i}`} d={path} fill={d.color}/>;
  });
  return (
    <div style={{ position:'relative', width:'106px', height:'106px', flexShrink:0 }}>
      <svg width="106" height="106" viewBox="0 0 106 106" style={{ display:'block' }}>
        {paths}
      </svg>
    </div>
  );
}

export function LeftPanel({ data, loading }: LeftPanelProps) {
  const total = data.totalStations;
  const stationTypeList = data.stationTypeList;

  // Build donut slices from stationTypeList
  const donutSlices = stationTypeList.length > 0
    ? stationTypeList.map(t => ({ name: t.name, pct: total > 0 ? (t.value / total) * 100 : 0, color: t.color }))
    : [
        { name: 'Mobile', pct: 20, color: '#ffd700' },
        { name: 'Broadcast', pct: 16, color: '#00bcd4' },
        { name: 'Radio', pct: 14, color: '#4ade80' },
        { name: 'Other', pct: 15, color: '#4466ff' },
        { name: 'Aviation', pct: 35, color: '#c86ef0' },
      ];

  return (
    <div style={{ width:'282px', minWidth:'282px', display:'flex', flexDirection:'column', gap:'8px', overflow:'hidden' }}>

      {/* Card 1: Frequency Authorization */}
      <div style={CARD}>
        <STitle text="Frequency Authorization" />
        <div style={{ display:'flex', gap:'7px', marginBottom:'12px' }}>
          <StatCard type="ok"   value={loading ? '-' : String(data.normal)}   label="Normal" />
          <StatCard type="warn" value={loading ? '-' : String(data.expiring)} label="Expiring" />
          <StatCard type="err"  value={loading ? '-' : String(data.expired)}  label="Expired" />
        </div>
        <div style={{ height:'1px', background:'rgba(0,150,200,0.18)', marginBottom:'9px' }} />
        <SubLabel text="Licensed Stations" />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', rowGap:'5px', columnGap:'4px' }}>
          {data.licenseAuthList.map((item, i) => (
            <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'4px' }}>
              <div style={{ width:'7px', height:'7px', borderRadius:'1px', background:'#1050a0', flexShrink:0, marginTop:'2px' }} />
              <span style={{ color:'#7ab4cc', fontSize:'10px', lineHeight:1.5, fontFamily:'sans-serif' }}>
                {i+1} {item.label}: {loading ? '-' : item.value.toLocaleString()}
              </span>
            </div>
          ))}
          {data.licenseAuthList.length === 0 && !loading && Array.from({ length: 6 }, (_, i) => (
            <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'4px' }}>
              <div style={{ width:'7px', height:'7px', borderRadius:'1px', background:'#1050a0', flexShrink:0, marginTop:'2px' }} />
              <span style={{ color:'#7ab4cc', fontSize:'10px', lineHeight:1.5, fontFamily:'sans-serif' }}>—</span>
            </div>
          ))}
        </div>
      </div>

      {/* Card 2: Station Type Statistics */}
      <div style={{ ...CARD, flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <STitle text="Station Type Statistics" />
        <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'10px' }}>
          {loading ? (
            <div style={{ width:'106px', height:'106px', display:'flex', alignItems:'center', justifyContent:'center', color:'#00e5ff', fontSize:'11px' }}>Loading…</div>
          ) : (
            <DonutSVG slices={donutSlices} />
          )}
          <div style={{ display:'flex', flexDirection:'column', gap:'6px', marginLeft:'20px' }}>
            {(stationTypeList.length > 0 ? stationTypeList : donutSlices).map(d => (
              <div key={d.name} style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                <span style={{ color:'#7ab4cc', fontSize:'10px', width:'36px', textAlign:'right', fontFamily:'sans-serif' }}>{d.pct.toFixed(1)}%</span>
                <div style={{ width:'9px', height:'9px', borderRadius:'1px', background:d.color, flexShrink:0 }} />
                <span style={{ color:'#7ab4cc', fontSize:'10px', fontFamily:'sans-serif' }}>{d.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ height:'1px', background:'rgba(0,150,200,0.18)', marginBottom:'9px' }} />
        <SubLabel text="Station Type Details" />
        <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
          {(stationTypeList.length > 0 ? stationTypeList : donutSlices).map(item => (
            <div key={item.name} style={{ display:'flex', alignItems:'center', gap:'6px' }}>
              <span style={{ color:'#7ab4cc', fontSize:'10px', width:'90px', flexShrink:0, fontFamily:'sans-serif' }}>{item.name}</span>
              <div style={{ flex:1, background:'rgba(0,15,45,0.7)', borderRadius:'2px', height:'16px', overflow:'hidden' }}>
                <div style={{ width:`${total > 0 ? Math.min((item.value / Math.max(...(stationTypeList.length > 0 ? stationTypeList : donutSlices).map(s => s.value), 1)) * 100, 100) : 0}%`, height:'100%', background:item.color, borderRadius:'2px', display:'flex', alignItems:'center', justifyContent:'flex-end', paddingRight:'5px', minWidth:'26px' }}>
                  <span style={{ color:'#fff', fontSize:'10px', fontWeight:700, fontFamily:'sans-serif' }}>{loading ? '-' : item.value.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## Task 4: 重写 RightPanel 接收 API 数据

**Files:**
- Modify: `frontend/src/app/components/Dashboard3/RightPanel.tsx:1-161`

- [ ] **Step 1: 重写 RightPanel 组件**

```typescript
import React from 'react';

interface RightPanelProps {
  data: {
    growthTrend: { month: string; count: number }[];
    regionStats: { name: string; value: number; color: string }[];
  };
  loading: boolean;
}

const CARD: React.CSSProperties = {
  background: 'rgba(15,48,88,0.92)',
  border: '1px solid rgba(0,160,210,0.3)',
  borderRadius: '4px', padding: '10px 12px',
  boxShadow: 'inset 0 0 30px rgba(0,100,160,0.06)',
};

function STitle({ text }: { text: string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'7px', marginBottom:'5px' }}>
      <div style={{ width:'3px', height:'13px', borderRadius:'2px', background:'linear-gradient(180deg,#00e5ff,#006aaa)', flexShrink:0 }} />
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="6.5" stroke="#00bcd4" strokeWidth="1" fill="none" opacity="0.45"/>
        <circle cx="7" cy="7" r="3.8" stroke="#00bcd4" strokeWidth="1" fill="none" opacity="0.7"/>
        <circle cx="7" cy="7" r="1.4" fill="#00bcd4" opacity="0.9"/>
        <line x1="7" y1="0.5" x2="7" y2="3.2" stroke="#00bcd4" strokeWidth="1" opacity="0.6"/>
        <line x1="13.5" y1="7" x2="10.8" y2="7" stroke="#00bcd4" strokeWidth="1" opacity="0.6"/>
        <line x1="7" y1="13.5" x2="7" y2="10.8" stroke="#00bcd4" strokeWidth="1" opacity="0.6"/>
        <line x1="0.5" y1="7" x2="3.2" y2="7" stroke="#00bcd4" strokeWidth="1" opacity="0.6"/>
      </svg>
      <span style={{ color:'#d8eeff', fontSize:'12px', fontWeight:600, letterSpacing:'1px', fontFamily:'sans-serif' }}>{text}</span>
    </div>
  );
}

/* ── SVG line chart ── */
function LineChartSVG({ data }: { data: { month: string; count: number }[] }) {
  const W = 258, H = 92;
  const ml = 20, mr = 6, mt = 4, mb = 14;
  const pw = W - ml - mr;
  const ph = H - mt - mb;
  const maxV = Math.max(...data.map(d => d.count), 1);
  const n = data.length;
  const xOf = (i: number) => ml + (n > 1 ? (i / (n - 1)) * pw : pw / 2);
  const yOf = (v: number) => mt + ph - (v / maxV) * ph;
  const pts = data.map((d, i) => `${xOf(i).toFixed(1)},${yOf(d.count).toFixed(1)}`).join(' ');
  const yTicks = Array.from({ length: 5 }, (_, i) => Math.round((maxV * i) / 4));
  const gridStroke = 'rgba(0,130,170,0.14)';
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display:'block' }}>
      {yTicks.map((t, i) => (
        <line key={`lg-${i}`} x1={ml} x2={ml + pw} y1={yOf(t)} y2={yOf(t)} stroke={gridStroke} strokeDasharray="3 3"/>
      ))}
      {yTicks.map((t, i) => (
        <text key={`ly-${i}`} x={ml - 3} y={yOf(t) + 3} textAnchor="end" fill="#2d5868" fontSize={8} fontFamily="sans-serif">{t}</text>
      ))}
      {data.map((d, i) => (
        <text key={`lx-${i}`} x={xOf(i)} y={H - 2} textAnchor="middle" fill="#2d5868" fontSize={8} fontFamily="sans-serif">{d.month.slice(5)}</text>
      ))}
      {data.length > 1 && <polyline points={pts} fill="none" stroke="#4ade80" strokeWidth={1.5}/>}
      {data.map((d, i) => (
        <circle key={`ld-${i}`} cx={xOf(i)} cy={yOf(d.count)} r={2.5} fill="#4ade80"/>
      ))}
    </svg>
  );
}

/* ── SVG bar chart ── */
function BarChartSVG({ data }: { data: { name: string; value: number; color: string }[] }) {
  const W = 258, H = 108;
  const ml = 20, mr = 6, mt = 4, mb = 14;
  const pw = W - ml - mr;
  const ph = H - mt - mb;
  const maxV = Math.max(...data.map(d => d.value), 1);
  const n = data.length;
  const slotW = pw / n;
  const barW = Math.min(9, slotW * 0.65);
  const xOf = (i: number) => ml + i * slotW + (slotW - barW) / 2;
  const yOf = (v: number) => mt + ph - (v / maxV) * ph;
  const barH = (v: number) => (v / maxV) * ph;
  const yTicks = Array.from({ length: 5 }, (_, i) => Math.round((maxV * i) / 4));
  const gridStroke = 'rgba(0,130,170,0.14)';
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display:'block' }}>
      {yTicks.map((t, i) => (
        <line key={`bg-${i}`} x1={ml} x2={ml + pw} y1={yOf(t)} y2={yOf(t)} stroke={gridStroke} strokeDasharray="3 3"/>
      ))}
      {yTicks.map((t, i) => (
        <text key={`by-${i}`} x={ml - 3} y={yOf(t) + 3} textAnchor="end" fill="#2d5868" fontSize={8} fontFamily="sans-serif">{t}</text>
      ))}
      {data.map((d, i) => i % 2 === 0 ? (
        <text key={`bx-${i}`} x={xOf(i) + barW / 2} y={H - 2} textAnchor="middle" fill="#2d5868" fontSize={8} fontFamily="sans-serif">{d.name}</text>
      ) : null)}
      {data.map((d, i) => (
        <rect key={`br-${i}`} x={xOf(i)} y={yOf(d.value)} width={barW} height={barH(d.value)} fill={d.color} rx={2}/>
      ))}
    </svg>
  );
}

export function RightPanel({ data, loading }: RightPanelProps) {
  const { growthTrend, regionStats } = data;
  const maxRegionVal = Math.max(...regionStats.map(r => r.value), 1);

  return (
    <div style={{ width:'282px', minWidth:'282px', display:'flex', flexDirection:'column', gap:'8px', overflow:'hidden' }}>

      {/* Line chart: Station Growth Rate */}
      <div style={CARD}>
        <STitle text="Station Growth Rate" />
        <div style={{ textAlign:'right', color:'#2d5868', fontSize:'10px', marginBottom:'2px', fontFamily:'sans-serif' }}>
          {loading ? 'Loading…' : `${growthTrend.length} months`}
        </div>
        {loading ? (
          <div style={{ height:'92px', display:'flex', alignItems:'center', justifyContent:'center', color:'#00e5ff', fontSize:'11px' }}>Loading…</div>
        ) : (
          <LineChartSVG data={growthTrend} />
        )}
      </div>

      {/* Bar chart: Regional Station Count */}
      <div style={CARD}>
        <STitle text="Regional Station Count" />
        {loading ? (
          <div style={{ height:'108px', display:'flex', alignItems:'center', justifyContent:'center', color:'#00e5ff', fontSize:'11px' }}>Loading…</div>
        ) : (
          <BarChartSVG data={regionStats} />
        )}
      </div>

      {/* Region list */}
      <div style={{ ...CARD, flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'5px', marginBottom:'10px' }}>
          <div style={{ width:0, height:0, borderTop:'4px solid transparent', borderBottom:'4px solid transparent', borderLeft:'7px solid #ffb800' }}/>
          <span style={{ color:'#7ab4cc', fontSize:'11px', fontFamily:'sans-serif' }}>Regional Station Details</span>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'7px' }}>
          {regionStats.slice(0, 10).map(r => (
            <div key={r.name} style={{ display:'flex', alignItems:'center', gap:'7px' }}>
              <span style={{ color:'#7ab4cc', fontSize:'10px', width:'88px', flexShrink:0, fontFamily:'sans-serif' }}>{r.name}</span>
              <div style={{ flex:1, background:'rgba(0,15,42,0.8)', borderRadius:'2px', height:'15px', overflow:'hidden' }}>
                <div style={{ width:`${(r.value / maxRegionVal) * 100}%`, height:'100%', background:r.color, borderRadius:'2px', display:'flex', alignItems:'center', justifyContent:'flex-end', paddingRight:'5px', minWidth:'22px' }}>
                  <span style={{ color:'#fff', fontSize:'10px', fontWeight:700, fontFamily:'sans-serif' }}>{loading ? '-' : r.value.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
```

---

## Task 5: 重写 MapSection 接收 API 数据

**Files:**
- Modify: `frontend/src/app/components/Dashboard3/MapSection.tsx`

- [ ] **Step 1: 重写 MapSection 组件**

```typescript
import React from 'react';
import { MAP_IMG as mapImg } from './mapImg';

interface ProvinceBadge {
  name: string;
  x: number;  // percentage
  y: number;  // percentage
  n: number;  // station count
}

interface MapSectionProps {
  data: { id: string; name: string; stations: number }[];
  loading: boolean;
}

// Province name → approximate x/y percentage on the 500×250 map
// Map extracted from static PROVINCES array + DB_PROVINCE_TO_KEY mapping
const PROVINCE_LAYOUT: Record<string, { x: number; y: number }> = {
  'ulaanbaatar':   { x: 64.5, y: 47 },
  'tov':          { x: 59.5, y: 53 },
  'selenge':      { x: 55.5, y: 23 },
  'darkhan-uul':  { x: 63,   y: 22 },
  'dornogovi':    { x: 64,   y: 67 },
  'khentii':      { x: 72.5, y: 39 },
  'khovsgol':     { x: 39,   y: 24 },
  'dornod':       { x: 83,   y: 43 },
  'arkhangai':    { x: 41.5, y: 47 },
  'bulgan':       { x: 49,   y: 30 },
  'ovorkhangai':  { x: 47.5, y: 59 },
  'sukhbaatar':   { x: 74.5, y: 61 },
  'zavkhan':      { x: 29,   y: 42 },
  'khovd':        { x: 18.5, y: 57 },
  'omnogovi':     { x: 43,   y: 73 },
  'bayankhongor': { x: 37,   y: 62 },
  'uvs':          { x: 19,   y: 32 },
  'dundgovi':     { x: 54,   y: 60 },
  'bayan-olgii':  { x: 8.5,  y: 44 },
  'govisumber':   { x: 68,   y: 56 },
  'govi-altai':   { x: 25,   y: 62 },
  'orkhon':       { x: 60,   y: 28 },
};

export function MapSection({ data, loading }: MapSectionProps) {
  // Build badges from API data, fall back to 0 for unknown provinces
  const badges: ProvinceBadge[] = data.map(p => {
    const layout = PROVINCE_LAYOUT[p.id] ?? PROVINCE_LAYOUT[p.id.toLowerCase().replace(/\s+/g, '-')];
    return {
      name: p.name,
      x: layout?.x ?? 50,
      y: layout?.y ?? 50,
      n: p.stations,
    };
  });

  return (
    <div style={{
      flex: 1, position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes mcw  { to { transform:rotate(360deg);  } }
        @keyframes mccw { to { transform:rotate(-360deg); } }
        @keyframes mcw2 { to { transform:rotate(360deg);  } }
      `}</style>

      {/* Ring animations (unchanged) */}
      <div style={{ position:'absolute', width:'620px', height:'620px', top:'50%', left:'50%', marginLeft:'-310px', marginTop:'-310px', animation:'mcw 50s linear infinite', pointerEvents:'none' }}>
        <svg width="620" height="620" viewBox="0 0 620 620">
          <circle cx="310" cy="310" r="305" fill="none" stroke="#00d4f0" strokeWidth="0.8" strokeDasharray="11 9" opacity="0.2"/>
        </svg>
      </div>
      <div style={{ position:'absolute', width:'572px', height:'572px', top:'50%', left:'50%', marginLeft:'-286px', marginTop:'-286px', animation:'mccw 30s linear infinite', pointerEvents:'none' }}>
        <svg width="572" height="572" viewBox="0 0 572 572">
          <circle cx="286" cy="286" r="282" fill="none" stroke="#00aac8" strokeWidth="1.6" strokeDasharray="26 10" opacity="0.48"/>
          <circle cx="286" cy="286" r="282" fill="none" stroke="#00e5ff" strokeWidth="3.5" strokeDasharray="65 700" opacity="0.8" strokeLinecap="round"/>
          <circle cx="286" cy="286" r="282" fill="none" stroke="#00e5ff" strokeWidth="2" strokeDasharray="28 700" strokeDashoffset="-220" opacity="0.55" strokeLinecap="round"/>
          <circle cx="286" cy="286" r="282" fill="none" stroke="#ffb800" strokeWidth="2" strokeDasharray="18 700" strokeDashoffset="-400" opacity="0.5" strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ position:'absolute', width:'524px', height:'524px', top:'50%', left:'50%', marginLeft:'-262px', marginTop:'-262px', animation:'mcw2 22s linear infinite', pointerEvents:'none' }}>
        <svg width="524" height="524" viewBox="0 0 524 524">
          <circle cx="262" cy="262" r="258" fill="none" stroke="#004d65" strokeWidth="1" strokeDasharray="3 16" opacity="0.6"/>
        </svg>
      </div>
      <div style={{ position:'absolute', width:'492px', height:'492px', top:'50%', left:'50%', marginLeft:'-246px', marginTop:'-246px', borderRadius:'50%', border:'1px solid rgba(0,160,200,0.09)', pointerEvents:'none' }}/>

      {/* Cardinal tick dots */}
      <div style={{ position:'absolute', width:'572px', height:'572px', top:'50%', left:'50%', marginLeft:'-286px', marginTop:'-286px', pointerEvents:'none' }}>
        <svg width="572" height="572" viewBox="0 0 572 572">
          {[0,90,180,270].map((deg,i) => {
            const r=282, rad=(deg*Math.PI)/180;
            const cx=286+r*Math.cos(rad), cy=286+r*Math.sin(rad);
            return <g key={`cardinal-${i}`}><circle cx={cx} cy={cy} r="5" fill="#00e5ff" opacity="0.9"/><circle cx={cx} cy={cy} r="10" fill="none" stroke="#00e5ff" strokeWidth="1" opacity="0.3"/></g>;
          })}
          {[45,135,225,315].map((deg,i) => {
            const r=282, rad=(deg*Math.PI)/180;
            const cx=286+r*Math.cos(rad), cy=286+r*Math.sin(rad);
            return <circle key={`diag-${i}`} cx={cx} cy={cy} r="2.5" fill="#00bcd4" opacity="0.5"/>;
          })}
        </svg>
      </div>

      {/* Map image + province badge overlay */}
      <div style={{ position:'relative', width:'704px', height:'374px' }}>
        <img src={mapImg} alt="Mongolia map" style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', objectFit:'fill', display:'block' }} />

        {loading ? (
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', color:'#00e5ff', fontSize:'13px', zIndex:10 }}>Loading map data…</div>
        ) : (
          badges.map(p => (
            <div key={p.name} style={{
              position:'absolute', left:`${p.x}%`, top:`${p.y}%`,
              transform:'translate(-50%,-50%)', textAlign:'center', pointerEvents:'none', zIndex:2,
            }}>
              <div style={{
                display:'inline-block', background:'rgba(1,11,30,0.86)',
                border:'1px solid rgba(0,210,255,0.8)', borderRadius:'2px', padding:'0 4px',
                lineHeight:'15px', color:'#00e5ff', fontSize:'9px', fontWeight:700,
                fontFamily:'sans-serif', boxShadow:'0 0 7px rgba(0,200,255,0.3)', whiteSpace:'nowrap',
              }}>{p.n}</div>
              <div style={{ color:'#90c8dc', fontSize:'7px', marginTop:'1px', fontFamily:'sans-serif', whiteSpace:'nowrap', textShadow:'0 1px 4px rgba(0,0,0,0.95)' }}>{p.name}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

---

## Task 6: 修复 DashboardHeader 时间逻辑

**Files:**
- Modify: `frontend/src/app/components/Dashboard3/DashboardHeader.tsx:5`

- [ ] **Step 1: 修复时间初始化**

```typescript
// OLD (line 5):
const [time, setTime] = useState(new Date('2022-11-18T16:28:53'));

// NEW:
const [time, setTime] = useState(new Date());
```

```typescript
// Also update the date display to use real current date (line 33):
// OLD:
<span style={{ color:'#3d6880', fontSize:'12px', fontFamily:'sans-serif' }}>2022-11-18&nbsp;&nbsp;Monday</span>
// NEW:
<span style={{ color:'#3d6880', fontSize:'12px', fontFamily:'sans-serif' }}>
  {time.toLocaleDateString('zh-CN')}&nbsp;&nbsp;{time.toLocaleDateString('zh-CN', { weekday: 'long' })}
</span>
```

---

## Task 7: 更新 App.tsx 路由

**Files:**
- Modify: `frontend/src/app/App.tsx:11`, `frontend/src/app/App.tsx:43`

- [ ] **Step 1: 更新 import 和路由 case**

```typescript
// OLD (line 11):
import Cockpit from './components/Cockpit/Cockpit';

// NEW:
import { Dashboard3 } from './components/Dashboard3';

// OLD (line 43):
case 'cockpit': return <Cockpit />;

// NEW:
case 'dashboard3': return <Dashboard3 />;
```

---

## Task 8: 更新 Layout.tsx 导航项

**Files:**
- Modify: `frontend/src/app/components/Layout.tsx:35`, `frontend/src/app/components/Layout.tsx:111`

- [ ] **Step 1: 更新导航 ID**

```typescript
// OLD (line 35):
{ id: 'cockpit', icon: LayoutDashboard, label: '驾驶舱' },

// NEW:
{ id: 'dashboard3', icon: LayoutDashboard, label: '驾驶舱' },
```

```typescript
// OLD (line 111):
<main className={`flex-1 overflow-auto ${currentPage === 'cockpit' ? 'p-0' : 'p-6'}`}>{children}</main>

// NEW:
<main className={`flex-1 overflow-auto ${currentPage === 'dashboard3' ? 'p-0' : 'p-6'}`}>{children}</main>
```

---

## Task 9: 验证编译

- [ ] **Step 1: 运行 TypeScript 检查**

Run:
```powershell
cd d:\workspace\10Frequency\frontend
pnpm tsc --noEmit
```

Expected: 无 TypeScript 错误（可能有 unused import 警告，可忽略）

- [ ] **Step 2: 启动开发服务器验证**

Run:
```powershell
cd d:\workspace\10Frequency\frontend
pnpm dev
```

Expected: 浏览器访问 http://localhost:84 导航到"驾驶舱"能正常显示，数据来自真实 API

---

## 执行方式

Plan 完成并保存至 `docs/superpowers/plans/2026-06-05-dashboard3-data-wiring.md`。

**执行选项：**

**1. Subagent-Driven（推荐）** - 每任务一个 fresh subagent，任务间 review，快速迭代

**2. Inline Execution** - 在本 session 使用 executing-plans 批量执行，带检查点 review

选择哪种方式？
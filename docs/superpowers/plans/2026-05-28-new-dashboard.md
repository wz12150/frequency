# New Dashboard 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在菜单中新增"New Dashboard"菜单项，点击后进入基于新设计图片的Dashboard页面，数据复用现有API接口

**Architecture:** 在现有路由体系中新增`new-dashboard`页面，使用与原Dashboard相同的API数据但采用新的布局设计

**Tech Stack:** React 18 + TypeScript + Recharts + Tailwind CSS 4 + shadcn/ui

---

## 文件结构

```
frontend/src/app/
├── App.tsx                          # 新增路由 case 'new-dashboard'
├── components/
│   ├── Layout.tsx                   # menuItems 新增 New Dashboard 项
│   ├── Dashboard.tsx                # 现有Dashboard（不动）
│   └── NewDashboard.tsx             # 新建：新设计Dashboard组件
└── api/
    └── dashboard.ts                  # 复用：已有API不变
```

---

## 数据流（已验证）

**API接口：** `GET /api/dashboard/overview`
**数据类型：** `DashboardOverviewVO`

```typescript
interface DashboardOverviewVO {
  totalStations: number;
  normalLicenses: number;
  expiringSoon: number;
  expired: number;
  stationGrowth: string;
  licenseGrowth: string;
  expiringGrowth: string;
  expiredGrowth: string;
  provinceStats: ProvinceStatsVO[];      // 22个省份台站数据
  licenseTypeStats: LicenseTypeStatsVO[]; // 许可证类型统计
  stationTypes: { id, name, value, color }[]; // 台站类型分布
  stationGrowthTrend: { month, count }[]; // 增长趋势
}
```

---

## Task 1: 在 Layout.tsx 菜单中添加 New Dashboard 项

**Files:**
- Modify: `frontend/src/app/components/Layout.tsx:25-33`

- [ ] **Step 1: 在 menuItems 数组中添加 New Dashboard 项**

在现有 menuItems 中新增：

```typescript
{ id: 'new-dashboard', icon: LayoutDashboard, label: 'New Dashboard' },
```

需要导入 `LayoutDashboard` 图标：

```typescript
import { Home, Map, Radio, BarChart3, FileCheck, Database, Settings, LogOut, X, Save, LockKeyhole, LayoutDashboard } from 'lucide-react';
```

---

## Task 2: 在 App.tsx 中添加路由

**Files:**
- Modify: `frontend/src/app/App.tsx:29-40`

- [ ] **Step 1: 导入 NewDashboard 组件**

```typescript
import { NewDashboard } from './components/NewDashboard';
```

- [ ] **Step 2: 在 switch case 中添加路由**

```typescript
case 'new-dashboard': return <NewDashboard />;
```

---

## Task 3: 创建 NewDashboard.tsx 组件

**Files:**
- Create: `frontend/src/app/components/NewDashboard.tsx`

**数据来源：** 复用 `dashboardApi.overview()` 返回的 `DashboardOverviewVO` 数据

**设计方向（根据用户提供的设计图片）：**
- 新的卡片布局和视觉风格
- 复用相同的API数据和Recharts图表
- 保持响应式设计

- [ ] **Step 1: 创建 NewDashboard.tsx 文件**

```typescript
import { useState, useEffect, useMemo } from 'react';
import {
  Activity, TrendingUp, AlertTriangle, CheckCircle, Clock,
  Radio, LayoutDashboard,
} from 'lucide-react';
import { dashboardApi, DashboardOverviewVO } from '../api/dashboard';
import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

// KPI卡片数据
const stats = [
  { label: 'Total Stations', key: 'totalStations', growthKey: 'stationGrowth', icon: Activity, color: 'bg-blue-500' },
  { label: 'Normal Licenses', key: 'normalLicenses', growthKey: 'licenseGrowth', icon: CheckCircle, color: 'bg-green-500' },
  { label: 'Expiring Soon', key: 'expiringSoon', growthKey: 'expiringGrowth', icon: Clock, color: 'bg-yellow-500' },
  { label: 'Expired', key: 'expired', growthKey: 'expiredGrowth', icon: AlertTriangle, color: 'bg-red-500' },
];

export function NewDashboard() {
  const [apiData, setApiData] = useState<DashboardOverviewVO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
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

  if (loading) return <div className="flex items-center justify-center h-64">Loading...</div>;
  if (error) return <div className="flex items-center justify-center h-64 text-red-500">{error}</div>;
  if (!apiData) return null;

  // 计算统计数据
  const kpiStats = stats.map(stat => ({
    ...stat,
    value: (apiData[stat.key as keyof DashboardOverviewVO] as number).toLocaleString(),
    change: apiData[stat.growthKey as keyof DashboardOverviewVO] as string,
  }));

  return (
    <div className="space-y-6 p-6">
      {/* 页面标题 */}
      <div>
        <h2 className="text-2xl font-semibold mb-2">New Dashboard</h2>
        <p className="text-muted-foreground">Spectrum resource usage and real-time statistics</p>
      </div>

      {/* KPI 卡片网格 - 新设计布局 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiStats.map((stat) => {
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

      {/* 图表区域 - 可根据设计图片进一步调整 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 台站增长趋势 */}
        <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Station Growth Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={apiData.stationGrowthTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#1976d2" strokeWidth={2} dot={{ fill: '#1976d2', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 台站类型分布 */}
        <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Station Type Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={apiData.stationTypes}
                cx="50%" cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={95}
                dataKey="value"
              >
                {apiData.stationTypes.map(entry => (
                  <Cell key={entry.id} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 省份统计图表 */}
      <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Province Station Statistics</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={apiData.provinceStats}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="abbr" tick={{ fontSize: 11 }} angle={-40} textAnchor="end" interval={0} height={60} />
            <YAxis tick={{ fontSize: 11 }} width={40} />
            <Tooltip />
            <Legend verticalAlign="top" height={32} />
            <Bar dataKey="total" fill="#1976d2" name="Total Stations" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

---

## Task 4: 验证实现

**Files:**
- Modify: `frontend/src/app/components/Layout.tsx`
- Modify: `frontend/src/app/App.tsx`
- Create: `frontend/src/app/components/NewDashboard.tsx`

- [ ] **Step 1: 启动开发服务器验证**

```bash
cd frontend && pnpm dev
```

- [ ] **Step 2: 访问页面验证**

打开浏览器访问 http://localhost:84，确认：
1. 侧边栏菜单显示 "New Dashboard" 选项
2. 点击后页面正常渲染
3. 数据从 `/api/dashboard/overview` 正确加载
4. 无控制台错误

---

## 执行方式

**Plan complete and saved to `docs/superpowers/plans/2026-05-28-new-dashboard.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
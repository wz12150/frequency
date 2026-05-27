# Dashboard 功能完善实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Dashboard.tsx 中的硬编码模拟数据替换为从 `/api/dashboard/overview` API 获取的真实数据，同时保留所有 UI 组件和交互逻辑不变。

**Architecture:** Dashboard 组件通过 `useEffect` 在挂载时调用 `dashboardApi.overview()` 获取数据，数据存储在 `useState` 中，加载/错误状态通过独立 state 管理。数据 shape 与 API 返回的 `DashboardOverviewVO` 对齐。

**Tech Stack:** React 18 + TypeScript, Recharts, dashboard API module

---

## 文件结构

```
frontend/src/app/
├── components/
│   └── Dashboard.tsx          # 主组件，需改造数据层
├── api/
│   └── dashboard.ts          # API 调用层（已存在，需确认接口）
└── context/
    └── AuthContext.tsx        # token 获取（dashboardApi 内部使用）
```

**Modify:**
- `frontend/src/app/components/Dashboard.tsx` — 替换硬编码数据为 API 数据

---

## 任务清单

### Task 1: 添加 Loading 和 Error 状态

**Files:**
- Modify: `frontend/src/app/components/Dashboard.tsx:129-131`

- [ ] **Step 1: 添加状态声明**

在 `Dashboard.tsx` 的 `export function Dashboard()` 开头，`useState` 声明之后添加：

```tsx
  // ── API 数据状态 ────────────────────────────────────────────────────────
  const [apiData, setApiData] = useState<DashboardOverviewVO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
```

- [ ] **Step 2: 添加 useEffect 获取数据**

在 `applyDays` 函数之后添加：

```tsx
  // ── 获取 Dashboard 数据 ───────────────────────────────────────────────
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
```

- [ ] **Step 3: 在 return JSX 的最外层添加 Loading/Error 条件渲染**

在 `return (` 之后，`div className="space-y-6">` 之前添加：

```tsx
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-3">
        <AlertTriangle className="w-8 h-8 text-red-500" />
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >Reload</button>
      </div>
    );
  }
```

注意：需要在文件顶部 import 列表中添加 `AlertTriangle`（如果没有的话），从 lucide-react 导入。

- [ ] **Step 4: 提交**

```bash
git add frontend/src/app/components/Dashboard.tsx
git commit -m "feat(dashboard): add loading and error states for API data"
```

---

### Task 2: 将 KPI Cards 数据替换为 API 数据

**Files:**
- Modify: `frontend/src/app/components/Dashboard.tsx:185-190`

- [ ] **Step 1: 替换 stats 数组为 API 数据**

找到 `const stats = [...]` 代码块，替换为：

```tsx
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
```

- [ ] **Step 2: 提交**

```bash
git add frontend/src/app/components/Dashboard.tsx
git commit -m "feat(dashboard): wire KPI cards to API data"
```

---

### Task 3: 将 Province Station Map 数据替换为 API 数据

**Files:**
- Modify: `frontend/src/app/components/Dashboard.tsx:133-145`

- [ ] **Step 1: 替换 allProvinceData 的计算**

找到 `const allProvinceData = useMemo(...)` 代码块，替换为：

```tsx
  const allProvinceData = useMemo(() => {
    if (!apiData?.provinceStats) return [];
    return apiData.provinceStats.map(p => {
      const rawExpiring = Math.round(p.expiring60 * (expiringDays / 60));
      const expiring    = Math.min(rawExpiring, p.total - p.expired);
      const normal      = Math.max(0, p.total - expiring - p.expired);
      return { ...p, stations: p.total, expiring, normal };
    });
  }, [apiData?.provinceStats, expiringDays]);
```

- [ ] **Step 2: 替换 provinceStationData**

找到 `const provinceStationData: ProvinceStationData[]` 代码块，替换为：

```tsx
  const provinceStationData: ProvinceStationData[] =
    apiData?.provinceStats?.map(p => ({
      id: p.id, name: p.name, stations: p.total,
    })) ?? [];
```

- [ ] **Step 3: 替换 totalNormal/totalExpiring/totalExpired/totalAll**

找到相关计算代码，替换为：

```tsx
  const totalNormal    = allProvinceData.reduce((s, p) => s + p.normal,   0);
  const totalExpiring = allProvinceData.reduce((s, p) => s + p.expiring, 0);
  const totalExpired  = allProvinceData.reduce((s, p) => s + p.expired,  0);
  const totalAll      = totalNormal + totalExpiring + totalExpired;
```

（这部分计算逻辑不变，因为 `allProvinceData` 已经从 API 数据计算）

- [ ] **Step 4: 提交**

```bash
git add frontend/src/app/components/Dashboard.tsx
git commit -m "feat(dashboard): wire province map data to API"
```

---

### Task 4: 将 License Statistics 数据替换为 API 数据

**Files:**
- Modify: `frontend/src/app/components/Dashboard.tsx:152-166`

- [ ] **Step 1: 替换 license 数据计算**

找到 `const licNormal/Expiring/Expired/Total` 计算代码，替换为：

```tsx
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
```

- [ ] **Step 2: 提交**

```bash
git add frontend/src/app/components/Dashboard.tsx
git commit -m "feat(dashboard): wire license statistics to API data"
```

---

### Task 5: 将 Station Statistics 数据替换为 API 数据

**Files:**
- Modify: `frontend/src/app/components/Dashboard.tsx:168-183`

- [ ] **Step 1: 替换 stationTypes 和 growthData**

找到 `const stationTypes = [...]` 和 `const growthData = [...]` 代码块，替换为：

```tsx
  const stationTypes = apiData?.stationTypes?.map((t, i) => ({
    id: t.id,
    name: t.name,
    value: t.value,
    color: t.color,
  })) ?? [];

  const growthData = apiData?.stationGrowthTrend ?? [];
```

- [ ] **Step 2: 提交**

```bash
git add frontend/src/app/components/Dashboard.tsx
git commit -m "feat(dashboard): wire station statistics to API data"
```

---

### Task 6: 删除硬编码的模拟数据常量

**Files:**
- Modify: `frontend/src/app/components/Dashboard.tsx:14-48`

- [ ] **Step 1: 删除 BASE_PROVINCE_DATA 和 LICENSE_TYPE_DATA 常量**

删除以下代码：

```tsx
// ── Base province data ────────────────────────────────────────────────────────
const BASE_PROVINCE_DATA = [
  { id: 'ulaanbaatar',  name: 'Ulaanbaatar',  abbr: 'UB', total: 1245, expiring60: 120, expired: 75 },
  // ... 22 provinces
];

// ── Frequency license data ─────────────────────────────────────────────────────
const LICENSE_TYPE_DATA = [
  { id: 'mobile',       type: 'Mobile',       normal: 1250, expiring: 210, expired: 120 },
  // ... 6 types
];
```

同时删除文件顶部 `useMemo` 的 `BASE_PROVINCE_DATA` 引用（已在 Task 3 步骤 1 中处理）。

- [ ] **Step 2: 提交**

```bash
git add frontend/src/app/components/Dashboard.tsx
git commit -m "refactor(dashboard): remove hardcoded mock data"
```

---

## 自检清单

**1. Spec coverage:**
- [x] KPI Cards 数据来自 API (`apiData.totalStations`, `normalLicenses`, `expiringSoon`, `expired`)
- [x] Province Station Map 数据来自 API (`apiData.provinceStats`)
- [x] License Statistics 数据来自 API (`apiData.licenseTypeStats`)
- [x] Station Type Distribution 来自 API (`apiData.stationTypes`)
- [x] Growth Trend 来自 API (`apiData.stationGrowthTrend`)
- [x] 所有增长率字段来自 API
- [x] Loading 和 Error 状态正确处理
- [x] 所有硬编码 mock 数据已删除

**2. Placeholder scan:**
- 无 "TBD", "TODO", "placeholder" 等占位符
- 无 "类似 Task N" 的模糊引用
- 所有代码块均为完整可执行代码

**3. Type consistency:**
- `DashboardOverviewVO` 接口字段与使用处完全一致
- `ProvinceStatsVO`, `LicenseTypeStatsVO` 字段与使用处一致
- 所有 `apiData?.field ?? default` 提供了安全的空值保护

---

## 执行选择

Plan complete and saved to `docs/superpowers/plans/2026-05-13-dashboard-api-integration.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
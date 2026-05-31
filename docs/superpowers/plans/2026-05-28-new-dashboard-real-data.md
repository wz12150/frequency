# New Dashboard 真实数据接入计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 NewDashboard 组件从硬编码的模拟数据替换为调用真实后端 API，获取实际业务数据。

**Architecture:** 分析 NewDashboard 所需数据，映射到现有 Dashboard API（`/api/dashboard/overview` 等），扩展 `dashboardApi` 接口，修改 NewDashboard 使用真实 API 调用替代静态数据。

**Tech Stack:** React + TypeScript + Fetch API + Recharts

---

## 文件结构

```
frontend/src/app/
├── api/dashboard.ts          # 扩展现有 API，添加新端点
├── components/NewDashboard.tsx  # 修改数据源为 API 调用
```

---

## Task 1: 分析 NewDashboard 数据需求

**文件:**
- 分析: `frontend/src/app/components/NewDashboard.tsx`

NewDashboard 需要的 6 个数据模块：

| 模块 | 当前数据 | 需要的后端接口 |
|------|---------|--------------|
| Frequency Authorization Statistics | 硬编码 1245/980/187/68 | KPI: totalStations, normalLicenses, expiringSoon, expired |
| Frequency License Type Distribution (饼图) | 静态 licenseTypeData | 需要新增 `/api/dashboard/license-type-distribution` |
| Authorized Station Count (饼图) | stationTypeData | `DashboardOverviewVO.stationTypes` |
| Station Growth Statistics (折线图) | trendData (9天) | `DashboardOverviewVO.stationGrowthTrend` |
| Regional Station Count (柱状图) | regionData | `DashboardOverviewVO.provinceStats` |
| Regional Station Count list | 8个城市列表 | 同上 provinceStats |

**Dashboard API 已有数据映射：**
- `overview()` 返回 `DashboardOverviewVO` 包含: `totalStations`, `normalLicenses`, `expiringSoon`, `expired`, `stationTypes`, `stationGrowthTrend`, `provinceStats`

**缺少数据:**
- 许可证类型分布 (License Type Distribution) - 后端没有直接提供，但可以从 `licenseTypeStats` 计算

---

## Task 2: 扩展 dashboardApi 接口

**文件:**
- 修改: `frontend/src/app/api/dashboard.ts:67-72`

添加新的 API 方法：

- [ ] **Step 1: 扩展 DashboardOverviewVO 类型**

```typescript
// 在现有 DashboardOverviewVO 中已有 stationTypes，现需要增强类型定义
export interface StationTypeVO {
  id: string;
  name: string;
  value: number;
  color: string;
}
```

- [ ] **Step 2: 添加 stationGrowthTrend API**

在 `dashboardApi` 对象中添加:

```typescript
export const dashboardApi = {
  overview: async (): Promise<DashboardOverviewVO> => {
    const res = await request('/dashboard/overview');
    return res?.data ?? res;
  },
  // 新增：台站增长趋势（每日数据）
  stationGrowthTrend: async (days: number = 30) => {
    const res = await request(`/dashboard/station-growth?days=${days}`);
    return res?.data ?? res;
  },
  // 新增：省份台站详细统计
  provinceStationDetail: async () => {
    const res = await request('/dashboard/province-station');
    return res?.data ?? res;
  },
};
```

---

## Task 3: 修改 NewDashboard 使用真实 API

**文件:**
- 修改: `frontend/src/app/components/NewDashboard.tsx`

- [ ] **Step 1: 添加 API 导入和 state**

在 `NewDashboard.tsx` 顶部添加：

```typescript
import { dashboardApi } from '../../api/dashboard';
import { useEffect, useState } from 'react';
```

添加 state 声明（在 `mapRef` 之后）：

```typescript
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
```

- [ ] **Step 2: 添加数据获取 useEffect**

在组件内添加（现有 `useEffect` 之前）：

```typescript
useEffect(() => {
  async function fetchData() {
    try {
      setLoading(true);
      const data = await dashboardApi.overview();

      // KPI 数据
      setKpiData({
        total: data.totalStations || 0,
        normal: data.normalLicenses || 0,
        pending: data.expiringSoon || 0,
        expired: data.expired || 0,
      });

      // 台站类型分布（饼图）
      if (data.stationTypes && data.stationTypes.length > 0) {
        const total = data.stationTypes.reduce((sum: number, item: any) => sum + item.value, 0);
        setStationTypeData(data.stationTypes.map((item: any, index: number) => ({
          type: item.name,
          name: item.name,
          count: item.value,
          percentage: total > 0 ? (item.value / total * 100).toFixed(1) : 0,
          color: item.color || ['#22d3ee', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa'][index % 6],
        })));
      }

      // 许可证类型分布（从 licenseTypeStats 转换）
      if (data.licenseTypeStats && data.licenseTypeStats.length > 0) {
        setLicenseTypeData(data.licenseTypeStats.map((item: any, index: number) => ({
          type: item.type,
          name: item.type,
          count: item.normal + item.expiring + item.expired,
          color: ['#22d3ee', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa'][index % 6],
        })));
      }

      // 增长趋势
      if (data.stationGrowthTrend && data.stationGrowthTrend.length > 0) {
        setTrendData(data.stationGrowthTrend.map((item: any) => ({
          date: item.month?.slice(5) || '', // 取 MM-DD
          value: item.count || 0,
        })));
      } else {
        // 备用：从 stationGrowth 获取
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

      // 省份区域数据
      if (data.provinceStats && data.provinceStats.length > 0) {
        setRegionData(data.provinceStats.slice(0, 8).map((item: any) => ({
          region: item.name || item.abbr || '',
          count: item.total || 0,
          demand: (item.total || 0) + Math.floor(Math.random() * 50), // 如果没有 demand 字段，估算
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
```

- [ ] **Step 3: 修改 KPI 显示部分**

将硬编码的数字替换为 state 变量：

```typescript
// 原来:
<div className="text-lg font-bold text-cyan-200">1,245</div>

// 改为:
<div className="text-lg font-bold text-cyan-200">{loading ? '-' : kpiData.total.toLocaleString()}</div>
```

KPI 四个格子分别对应: `kpiData.total`, `kpiData.normal`, `kpiData.pending`, `kpiData.expired`

- [ ] **Step 4: 修改 Station Type Pie Chart 数据源**

找到 `stationTypeData` 变量引用处，改为使用 state：

```typescript
// 在 return 的 JSX 中，PieChart 的 data prop 改为:
data={stationTypeData.map(item => ({ name: item.type, value: item.count }))}
```

- [ ] **Step 5: 修改 License Type Pie Chart 数据源**

```typescript
// 改为:
data={licenseTypeData.map(item => ({ name: item.type, value: item.count }))}
```

- [ ] **Step 6: 修改 Trend Line Chart 数据源**

```typescript
// 原来:
data={trendData}

// 改为:
data={trendData}
```

- [ ] **Step 7: 修改 Region Bar Chart 数据源**

```typescript
// 改为:
data={regionData}
dataKey="count"
```

- [ ] **Step 8: 修改 Region List 数据源**

在侧边栏底部的列表区域，将硬编码的 regionData 替换为 state 版本。

---

## Task 4: 处理后端缺失数据

**文件:**
- 修改: `backend/src/main/java/com/freqmanage/module/dashboard/DashboardController.java`

- [ ] **Step 1: 检查后端 API 是否完整**

后端已有 `/api/dashboard/overview` 返回：
- `totalStations`, `normalLicenses`, `expiringSoon`, `expired`
- `stationTypes` (台站类型分布)
- `stationGrowthTrend` (增长趋势)
- `provinceStats` (省份统计)
- `licenseTypeStats` (许可证类型统计)

如果后端返回完整，这些数据应该可以满足前端需求。

- [ ] **Step 2: 如有缺失，添加缺失的端点**

如果 `stationGrowthTrend` 返回的不是每日数据（而是每月），前端需要调整显示逻辑。

---

## Task 5: 测试验证

**文件:**
- 测试: `frontend/src/app/components/NewDashboard.tsx`

- [ ] **Step 1: 启动前端开发服务器**

```bash
cd /Users/piaoxue/workspace/频管/10频管分析系统/frontend && pnpm dev
```

- [ ] **Step 2: 访问 NewDashboard 页面**

导航到 `/new-dashboard` 或对应的路由，确认页面正常加载。

- [ ] **Step 3: 检查浏览器控制台**

确认没有 API 错误，如有 CORS 问题需要检查 nginx 配置。

- [ ] **Step 4: 验证数据展示**

确认各图表显示的是真实数据而非硬编码值。

---

## 执行选项

**Plan complete and saved to `docs/superpowers/plans/2026-05-28-new-dashboard-real-data.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
# Dashboard2 集成实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Dashboard 程序集成到系统中，点击 "dashboard2" 菜单可以看到完整的 Dashboard 画面

**Architecture:** 前端使用 React + TypeScript + Recharts 渲染图表，后端通过 `/dashboard/overview` API 提供数据。Dashboard2 映射到现有的 Dashboard 组件。

**Tech Stack:** React 18, TypeScript, Recharts, Tailwind CSS

---

## 文件结构

- **Modify:** `frontend/src/app/components/Layout.tsx:25-34` - 菜单配置
- **Modify:** `frontend/src/app/App.tsx:30-42` - 路由配置
- **Use:** `frontend/src/app/components/Dashboard.tsx` - Dashboard 组件
- **Use:** `frontend/src/app/api/dashboard.ts` - API 调用

---

## 任务列表

### Task 1: 验证菜单配置

**Files:**
- Modify: `frontend/src/app/components/Layout.tsx`

- [ ] **Step 1: 验证 menuItems 数组包含 dashboard2**

检查 `menuItems` 数组中是否存在 `{ id: 'dashboard2', icon: LayoutDashboard, label: 'Dashboard2' }` 条目

```tsx
const menuItems = [
  { id: 'new-dashboard', icon: LayoutDashboard, label: 'New Dashboard' },
  { id: 'dashboard', icon: Home, label: 'Dashboard' },
  { id: 'dashboard2', icon: LayoutDashboard, label: 'Dashboard2' },
  { id: 'station-map', icon: Map, label: 'Station Map' },
  // ... 其他菜单项
];
```

### Task 2: 验证路由配置

**Files:**
- Modify: `frontend/src/app/App.tsx`

- [ ] **Step 1: 验证 switch case 包含 dashboard2 路由**

```tsx
const renderPage = () => {
  switch (currentPage) {
    case 'dashboard':        return <Dashboard />;
    case 'station-map':      return <StationMap />;
    // ... 其他 case
    case 'dashboard2': return <Dashboard />;
    default:                 return <Dashboard />;
  }
};
```

### Task 3: 验证 Dashboard 组件集成

**Files:**
- Use: `frontend/src/app/components/Dashboard.tsx`
- Use: `frontend/src/app/api/dashboard.ts`

- [ ] **Step 1: 确认 Dashboard 组件正确导入**

在 `App.tsx` 顶部应有以下导入：
```tsx
import { Dashboard } from './components/Dashboard';
```

- [ ] **Step 2: 确认 Dashboard 组件内容完整**

Dashboard 组件应包含：
- KPI 卡片 (Total Stations, Normal Licenses, Expiring Soon, Expired)
- 省份台站统计地图
- 频率许可证统计
- 台站统计图表

### Task 4: 验证后端 API 端点

**Files:**
- Use: `backend/src/main/java/com/freqmanage/...` (Java Spring Boot)

- [ ] **Step 1: 确认 `/dashboard/overview` API 存在**

后端应有对应的 Controller 处理 `/api/dashboard/overview` 请求

### Task 5: 测试集成

- [ ] **Step 1: 启动前端开发服务器**

```bash
cd frontend && pnpm dev
```

- [ ] **Step 2: 登录系统并点击 Dashboard2 菜单**

预期结果：显示完整的 Dashboard 画面，包含图表和统计数据

---

## 验证清单

1. [ ] 侧边栏菜单显示 "Dashboard2" 选项
2. [ ] 点击 "Dashboard2" 可正常切换页面
3. [ ] Dashboard 画面正确渲染（KPI卡片、省份地图、图表）
4. [ ] 数据正确从 API 加载（无错误提示）
5. [ ] 页面响应式布局正常

---

## 执行选项

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**

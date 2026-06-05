# Dashboard2 UI Design Spec

**Date:** 2026-06-03
**Status:** Draft

## 1. Concept & Vision

基于参考图片设计一个深色科技风格的 Dashboard2 界面，采用深蓝色背景配合青色/蓝色渐变强调色，呈现专业的频谱管理数据分析大屏。界面分为左中右三栏布局，左侧展示统计数据卡片和饼图，中心展示省份地图热力图，右侧展示趋势折线图和区域柱状图。

整体风格：**科技感大屏 / Data Visualization Dashboard**

---

## 2. Design Language

### Color Palette
- **Background Primary:** `#0a1628` (深海军蓝)
- **Background Secondary:** `#102a4c` (深蓝)
- **Accent Primary:** `#00d4ff` (青色)
- **Accent Secondary:** `#3b82f6` (蓝色)
- **Text Primary:** `#e0f2fe` (浅青白)
- **Text Secondary:** `#7dd3fc` (青色文字)
- **Success:** `#10b981` (绿色)
- **Warning:** `#f59e0b` (琥珀色)
- **Danger:** `#ef4444` (红色)

### Typography
- **Font Family:** Inter, system-ui, sans-serif
- **Heading:** 16px bold
- **Body:** 14px
- **Caption:** 12px

### Spatial System
- **Gap:** 16px between cards
- **Padding:** 16px inside cards
- **Border Radius:** 12px for cards
- **Grid Background:** 40px squares with cyan lines

### Motion Philosophy
- Subtle pulse animations for highlights
- Smooth transitions on hover (200ms)
- Chart animations on data load

---

## 3. Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                    HEADER: Frequency Analysis                    │
├──────────────┬────────────────────────────┬─────────────────────┤
│              │                            │                     │
│  STATISTICS  │                            │   STATION TREND     │
│  (4 cards)   │                            │   (Line Chart)      │
│              │                            │                     │
├──────────────┤       PROVINCE MAP         ├─────────────────────┤
│              │       (Heat Map)           │                     │
│  LICENSE     │                            │   REGIONAL STATS     │
│  PIE CHART   │                            │   (Bar Chart)       │
│              │                            │                     │
├──────────────┤                            ├─────────────────────┤
│              │                            │                     │
│  STATION     │                            │   REGIONAL LIST     │
│  TYPE PIE    │                            │   (Table)           │
│              │                            │                     │
└──────────────┴────────────────────────────┴─────────────────────┘
```

### Responsive Strategy
- Desktop-first (1920x1080 primary)
- Scrollable panels on smaller screens
- Fullscreen mode support

---

## 4. Features & Interactions

### 4.1 Header
- Title: "Frequency Analysis"
- Real-time clock display
- Subtle grid background

### 4.2 Statistics Cards (Left Top)
- 4 cards in 2x2 grid
- Total Stations, Normal Licenses, Pending, Expired
- Each with icon, value, and label
- Hover: slight glow effect

### 4.3 License Pie Chart (Left Middle)
- Donut chart showing license status distribution
- Center shows total count
- Legend with percentages

### 4.4 Station Type Pie Chart (Left Bottom)
- Pie chart showing station type distribution
- Legend with type names and counts

### 4.5 Province Map (Center)
- Mongolia province heat map
- Color intensity based on station count
- Hover tooltip with province details

### 4.6 Station Growth Trend (Right Top)
- Line chart showing monthly trend
- Gradient fill under the line
- Hover tooltips

### 4.7 Regional Bar Chart (Right Middle)
- Horizontal bar chart
- Shows top regions by station count
- Gradient bars

### 4.8 Regional List (Right Bottom)
- Scrollable list of regions
- Shows station count per region

---

## 5. Component Inventory

### Card Component
- States: default, hover
- Background: semi-transparent with blur
- Border: 1px cyan accent
- Shadow: subtle glow on hover

### Chart Components
- PieChart (with donut center)
- BarChart (horizontal)
- LineChart (with area fill)
- All with dark theme tooltips

### KPI Card
- Icon + Value + Label
- Gradient background based on type
- Hover: scale(1.02)

---

## 6. Technical Approach

### Stack
- React 18 + TypeScript
- Tailwind CSS
- Recharts
- Lucide React icons

### File Structure
```
frontend/src/app/components/Dashboard2.tsx  (main component)
frontend/src/app/components/ui/             (shared UI)
```

### Data Source
- API: `/api/dashboard/overview`
- Use existing `dashboardApi.overview()` from `dashboard.ts`

---

## 7. Implementation Notes

- Dark theme background with animated grid pattern
- Cards use `backdrop-blur` for glassmorphism effect
- Charts use cyan/blue gradient theme
- All numbers formatted with locale string
- Loading states while fetching data
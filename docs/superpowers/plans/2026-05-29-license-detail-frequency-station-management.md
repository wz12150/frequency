# License 详情频段管理与站点关联功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为每个 License 详情页实现频段列表管理和站点关联列表管理，支持新增、编辑、删除频段和站点记录。

**阶段说明：**
- **Phase 1（当前）**：纯前端界面开发，不连接后端 API
- **Phase 2**：后端 API 集成（等 Phase 1 确认后再进行）

**Tech Stack:** React + TypeScript + Tailwind CSS 4 + shadcn/ui (Radix UI) + Lucide Icons

---

## 界面设计

### 整体布局

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back   License Detail                                        │
│          LIC-2026-00123                                          │
├─────────────────────────────────────────────────────────────────┤
│  [ License Info ]  [ 𐠩 Frequencies (3) ]  [ 🏢 Stations (5) ]     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  License Info / Frequencies / Stations 内容区                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### Header 区域

- 返回按钮 (`← Back`) - 左侧，调用 `onBack`
- 标题 "License Detail" - 居中偏左
- 副标题显示 License Code/Consent - 次行

---

### Tab 切换 (Radix UI Tabs)

三个 Tab：
1. **License Info** - 显示许可证基本信息（始终展示）
2. **Frequencies (N)** - 频段列表，右上角显示数量徽章
3. **Stations (N)** - 站点列表，右上角显示数量徽章

---

### Tab 1: License Info

展示许可证主表字段，以 3 列网格卡片布局：

```
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ License          │ │ Organization     │ │ Category         │
│ LIC-2026-00123   │ │ Mongolia CRC     │ │ Mobile           │
└──────────────────┘ └──────────────────┘ └──────────────────┘
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ Type             │ │ Status           │ │ Start Date       │
│ Commercial       │ │ Active           │ │ 2026-01-15       │
└──────────────────┘ └──────────────────┘ └──────────────────┘
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ End Date         │ │ Code             │ │ Decision Date    │
│ 2027-01-14       │ │ LIC-2026-00123   │ │ 2026-01-10       │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

字段映射（来自 PermitVO）：
- License → consent
- Organization → interlocutor
- Category → category
- Type → type
- Status → status
- Start Date → startdate
- End Date → enddate
- Code → code
- Decision Date → decisiondate
- Decision → decision
- Process → process
- Scope → scope
- Address → address
- Phone → phone
- Email → email
- Director → directorname
- Note → note

---

### Tab 2: Frequencies 频段列表

布局：
- 右上角 "+ Add Frequency" 按钮（Primary 样式）
- 表格展示频段列表

```
┌─────────────────────────────────────────────────────────────────┐
│  Frequencies                                          [+ Add]  │
├─────────────────────────────────────────────────────────────────┤
│  Frequency (MHz)      │  Bandwidth (MHz)    │  Actions         │
├─────────────────────────────────────────────────────────────────┤
│  1805.5               │  15                 │  [Edit] [Delete] │
│  1825.0               │  20                 │  [Edit] [Delete] │
│  1850.0               │  25                 │  [Edit] [Delete] │
├─────────────────────────────────────────────────────────────────┤
│  (Empty State: "No frequencies. Click Add Frequency to create") │
└─────────────────────────────────────────────────────────────────┘
```

**空状态**：显示提示文案和添加按钮。

---

### Tab 3: Stations 站点列表

布局与 Frequencies 类似：
- 右上角 "+ Add Station" 按钮
- 表格展示站点列表

```
┌─────────────────────────────────────────────────────────────────┐
│  Stations                                           [+ Add]    │
├─────────────────────────────────────────────────────────────────┤
│  Type                  │  Quantity  │  Power (W)  │  Actions  │
├─────────────────────────────────────────────────────────────────┤
│  Base Station          │  3         │  40         │  [Edit] [D]│
│  Mobile Unit           │  10        │  5          │  [Edit] [D]│
│  Relay Station         │  2         │  20         │  [Edit] [D]│
├─────────────────────────────────────────────────────────────────┤
│  (Empty State: "No stations. Click Add Station to create.")       │
└─────────────────────────────────────────────────────────────────┘
```

---

### Add/Edit Frequency 弹窗 (Dialog)

```
┌─────────────────────────────────────────┐
│  Add Frequency                      ✕   │
│  Enter frequency details                │
├─────────────────────────────────────────┤
│  Frequency (MHz) *                      │
│  ┌───────────────────────────────────┐  │
│  │ 1805.5                            │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Bandwidth (MHz)                        │
│  ┌───────────────────────────────────┐  │
│  │ 15                                │  │
│  └───────────────────────────────────┘  │
│                                         │
│           [Cancel]  [Create]             │
└─────────────────────────────────────────┘
```

- `editingFrequency.guid` 存在时标题为 "Edit Frequency"，按钮为 "Update"
- `editingFrequency.guid` 为空时标题为 "Add Frequency"，按钮为 "Create"
- 点击 X 或 Cancel 关闭弹窗
- 关闭后清空表单状态

---

### Add/Edit Station 弹窗 (Dialog)

```
┌─────────────────────────────────────────┐
│  Add Station                        ✕   │
│  Enter station details                   │
├─────────────────────────────────────────┤
│  Type                                   │
│  ┌───────────────────────────────────┐  │
│  │ Base Station                      │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Quantity                               │
│  ┌───────────────────────────────────┐  │
│  │ 3                                 │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Output Power (W)                       │
│  ┌───────────────────────────────────┐  │
│  │ 40                                │  │
│  └───────────────────────────────────┘  │
│                                         │
│           [Cancel]  [Create]             │
└─────────────────────────────────────────┘
```

- `editingStation.guid` 存在时标题为 "Edit Station"，按钮为 "Update"

---

## 文件结构

```
frontend/src/app/components/
├── LicenseDetail.tsx       ← 新增: License详情页（含3个Tab）
├── FrequencyForm.tsx       ← 新增: 频段表单弹窗
└── StationForm.tsx         ← 新增: 站点表单弹窗
```

---

## 组件状态设计

### LicenseDetail 组件

```typescript
type Tab = 'info' | 'frequencies' | 'stations';

// Props
type LicenseDetailProps = {
  permitId: string;
  onBack: () => void;
};

// 内部 State
const [activeTab, setActiveTab] = useState<Tab>('info');
const [permit, setPermit] = useState<PermitVO | null>(null);
const [frequencies, setFrequencies] = useState<FrequencyVO[]>([]);
const [stations, setStations] = useState<StationPermitVO[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// Frequency Form State
const [showFrequencyForm, setShowFrequencyForm] = useState(false);
const [editingFrequency, setEditingFrequency] = useState<FrequencyFormValue | null>(null);

// Station Form State
const [showStationForm, setShowStationForm] = useState(false);
const [editingStation, setEditingStation] = useState<StationFormValue | null>(null);
```

### FrequencyFormValue

```typescript
type FrequencyFormValue = {
  guid?: string;       // 有则为编辑，无则为新增
  permitid: string;
  frequency?: number;
  badnwidth?: number;
};
```

### StationFormValue

```typescript
type StationFormValue = {
  guid?: string;       // 有则为编辑，无则为新增
  permitid: string;
  quantity?: number;
  outputpower?: number;
  type?: string;
};
```

---

## Phase 1 任务清单（纯前端界面）

### Task 1: 创建 FrequencyForm 弹窗组件

**Files:**
- Create: `frontend/src/app/components/FrequencyForm.tsx`

- [ ] **Step 1: 创建组件**

使用 `ui/dialog` + `ui/input` + `ui/button` 构建：

```tsx
// 使用 Radix Dialog 组件
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';

type FrequencyFormProps = {
  title: string;
  description: string;
  value: {
    guid?: string;
    permitid: string;
    frequency?: number;
    badnwidth?: number;
  };
  onChange: (value: FrequencyFormProps['value']) => void;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel: string;
};
```

- [ ] **Step 2: 提交**

```bash
git add frontend/src/app/components/FrequencyForm.tsx
git commit -m "feat(frontend): add FrequencyForm modal component"
```

---

### Task 2: 创建 StationForm 弹窗组件

**Files:**
- Create: `frontend/src/app/components/StationForm.tsx`

- [ ] **Step 1: 创建组件**

```tsx
// 类似 FrequencyForm，使用 Dialog + Input + Button
type StationFormProps = {
  title: string;
  description: string;
  value: {
    guid?: string;
    permitid: string;
    quantity?: number;
    outputpower?: number;
    type?: string;
  };
  onChange: (value: StationFormProps['value']) => void;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel: string;
};
```

- [ ] **Step 2: 提交**

```bash
git add frontend/src/app/components/StationForm.tsx
git commit -m "feat(frontend): add StationForm modal component"
```

---

### Task 3: 创建 LicenseDetail 组件

**Files:**
- Create: `frontend/src/app/components/LicenseDetail.tsx`

- [ ] **Step 1: 创建 LicenseDetail 组件**

使用 `ui/tabs` + `ui/table` + `ui/dialog` + `ui/card` + lucide-react 图标：

```
组件结构：
- Header (ArrowLeft + 标题)
- Tabs (TabsList + TabsTrigger × 3)
- TabsContent 'info' → 卡片网格 (PermitVO 字段)
- TabsContent 'frequencies' → Table + Add Button
- TabsContent 'stations' → Table + Add Button
- FrequencyForm Dialog (条件渲染)
- StationForm Dialog (条件渲染)
```

**空状态展示**：
- Frequencies 空：显示 "No frequencies. Click Add Frequency to create one."
- Stations 空：显示 "No stations. Click Add Station to create one."

**数据管理**（Phase 1 使用 mock 数据，Phase 2 替换为 API）：
```typescript
// Phase 1: 使用 mock 数据
const [frequencies, setFrequencies] = useState([
  { guid: 'freq-1', permitid: '1', frequency: 1805.5, badnwidth: 15 },
  { guid: 'freq-2', permitid: '1', frequency: 1825.0, badnwidth: 20 },
  { guid: 'freq-3', permitid: '1', frequency: 1850.0, badnwidth: 25 },
]);

const [stations, setStations] = useState([
  { guid: 'stat-1', permitid: '1', type: 'Base Station', quantity: 3, outputpower: 40 },
  { guid: 'stat-2', permitid: '1', type: 'Mobile Unit', quantity: 10, outputpower: 5 },
  { guid: 'stat-3', permitid: '1', type: 'Relay Station', quantity: 2, outputpower: 20 },
]);

const [permit, setPermit] = useState<PermitVO>({
  guid: '1',
  consent: 'LIC-2026-00123',
  interlocutor: 'Mongolia CRC',
  category: 'Mobile',
  type: 'Commercial',
  status: 'active',
  startdate: '2026-01-15',
  enddate: '2027-01-14',
  code: 'LIC-2026-00123',
  decisiondate: '2026-01-10',
  decision: 'Approved',
  process: 'Standard',
  scope: 'Nationwide',
  address: 'Ulaanbaatar',
  phone: '+976-11-123456',
  email: 'info@crc.mn',
  directorname: 'John Smith',
  note: '',
});
```

- [ ] **Step 2: 提交**

```bash
git add frontend/src/app/components/LicenseDetail.tsx
git commit -m "feat(frontend): add LicenseDetail component with frequency and station management UI"
```

---

### Task 4: 在 LicenseAnalysis 中集成 LicenseDetail

**Files:**
- Modify: `frontend/src/app/components/LicenseAnalysis.tsx`

- [ ] **Step 1: 添加导入**

```typescript
import { LicenseDetail } from './LicenseDetail';
```

- [ ] **Step 2: 添加 state**

```typescript
const [showLicenseDetail, setShowLicenseDetail] = useState(false);
const [detailPermitId, setDetailPermitId] = useState<string | null>(null);
```

- [ ] **Step 3: 替换 Detail Modal 为 LicenseDetail 组件**

找到现有的 Detail Modal 代码（selectedLicenseDetail 等），替换为：

```tsx
{showLicenseDetail && detailPermitId && (
  <LicenseDetail
    permitId={detailPermitId}
    onBack={() => { setShowLicenseDetail(false); setDetailPermitId(null); }}
  />
)}
```

- [ ] **Step 4: 修改 Detail 按钮点击逻辑**

将表格中的 "Detail" 按钮 onClick 从 `setSelectedLicenseDetail({...})` 改为：

```tsx
onClick={() => {
  setDetailPermitId(detail.guid || detail.number);
  setShowLicenseDetail(true);
}}
```

- [ ] **Step 5: 提交**

```bash
git add frontend/src/app/components/LicenseAnalysis.tsx
git commit -m "feat(license-analysis): integrate LicenseDetail component"
```

---

## Phase 1 验证步骤

1. `cd frontend && pnpm dev` 启动前端
2. 打开 License Analysis 页面
3. 切换到 License Count Statistics Tab
4. 点击任意一行的 "Detail" 按钮
5. 确认进入 LicenseDetail 页面，三个 Tab 可切换
6. Frequencies Tab 显示 3 条 mock 数据
7. 点击 "Add Frequency" 弹出表单，填写后点 Create，列表增加一条
8. 点击 Edit 修改频段信息
9. 点击 Delete 删除频段（需确认）
10. 切换到 Stations Tab，重复 Add/Edit/Delete 操作
11. 切换回 License Info Tab 确认基本信息展示正确

---

## Phase 2 任务（Phase 1 确认后执行）

### Task 5: 扩展前端 permit API

**Files:**
- Modify: `frontend/src/app/api/permit.ts`

添加方法：`getFrequencies`, `createFrequency`, `updateFrequency`, `deleteFrequency`, `getStationPermits`, `createStationPermit`, `updateStationPermit`, `deleteStationPermit`

### Task 6: 后端 API 确认/添加

**Files:**
- Read/Modify: `backend/src/main/java/com/freqmanage/module/permit/controller/PermitController.java`
- Read/Modify: `backend/src/main/java/com/freqmanage/module/permit/service/FrequencyService.java`
- Read/Modify: `backend/src/main/java/com/freqmanage/module/permit/service/StationPermitService.java`

确认/添加端点：
- `PUT /api/permit/frequency/{id}` - 更新频段
- `DELETE /api/permit/frequency/{id}` - 删除频段
- `PUT /api/permit/station-permit/{id}` - 更新站点
- `DELETE /api/permit/station-permit/{id}` - 删除站点

### Task 7: LicenseDetail 数据替换为 API 调用

**Files:**
- Modify: `frontend/src/app/components/LicenseDetail.tsx`

将 Phase 1 的 mock 数据替换为真实 API 调用，添加 `useEffect` 在 `permitId` 变化时加载数据。

---

## 执行顺序

**Phase 1（当前，等确认后执行）：**
1. Task 1: FrequencyForm 组件
2. Task 2: StationForm 组件
3. Task 3: LicenseDetail 组件
4. Task 4: 集成到 LicenseAnalysis

**Phase 2（Phase 1 确认后）：**
5. Task 5: 扩展前端 permit API
6. Task 6: 后端 API 确认/添加
7. Task 7: 数据替换为 API 调用

---

**Plan saved to `docs/superpowers/plans/2026-05-29-license-detail-frequency-station-management.md`**

**当前状态：Phase 1 界面开发，等待用户确认界面设计。**

**Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
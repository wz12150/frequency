# License Data 功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Data Management 页面的 **License Data** tab 从本地 Mock 状态接入真实后端 API（`/api/permit`），实现许可证数据的增删改查持久化。

**Architecture:**
- 后端 `/api/permit` 提供完整 CRUD：`GET /permit/page`、`POST /permit`、`PUT /permit/{id}`、`DELETE /permit/{id}`
- 后端 `PermitVO` extends `RsbtSpecialPermit`，字段映射：`consent`(许可证号) → 前端 `licenseAuthorization`，`interlocutor`(对话者/组织) → `organization`，`process`(流程) → `status`
- 前端 `LicenseRecord` 的 `id` 改为 `guid`(string)，`organization` 映射到 `interlocutor`
- 频段(`Frequency`)和台站(`StationPermit`)为 Permit 的关联子表，列表展示时无需 JOIN，复杂详情通过 `/permit/detail/{id}` 获取

**Tech Stack:** React + TypeScript (前端), Spring Boot + MyBatis-Plus + EasyExcel (后端), MySQL 8.0

---

## 文件结构

```
frontend/src/app/
├── api/permit.ts              ← 新增：permit API 调用层
├── components/DataManagement.tsx ← License Data tab 接入 API (修改)

backend/src/main/java/com/freqmanage/module/permit/
├── controller/PermitController.java ← 已有 CRUD，确认即可
├── service/PermitService.java      ← 已有 page/create/update/delete 方法，确认即可
```

---

## Task 1: 创建前端 API 层 frontend/src/app/api/permit.ts

**Files:**
- Create: `frontend/src/app/api/permit.ts`

**Step 1: 编写 permit API 模块**

```typescript
// frontend/src/app/api/permit.ts
const BASE_URL = 'http://localhost:8084/api';

const request = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(`${BASE_URL}${url}`, { ...options, headers });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || 'Request failed');
  }
  return response.json();
};

// 后端 PermitVO 字段对应前端 LicenseRecord 视图
// guid → id, consent → licenseAuthorization, interlocutor → organization,
// category → category, type → type, process → status, decision → decision,
// decisiondate → decisionDate, register → registration, startdate → startDate, enddate → endDate

export interface PermitVO {
  guid: string;
  consent: string;       // 许可证号 (licenseAuthorization)
  interlocutor: string;  // 组织 (organization)
  category: string;      // 类别
  legal: string;          // 法律依据
  type: string;          // 类型
  startdate: string;     // 开始日期
  enddate: string;       // 结束日期
  scope: string;         // 范围 (frequency)
  process: string;       // 流程 (status)
  status: string;        // 状态
  code: string;          // 许可证号
  decisiondate: string;  // 决定日期
  decision: string;      // 决定
  note: string;          // 备注
  register: string;     // 登记人 (registration)
  address: string;       // 地址
  phone: string;         // 电话
  email: string;         // 邮箱
  administrativeinfo: string; // 行政信息
  directorname: string;  // 负责人
}

export interface PermitQuery {
  pageNum?: number;
  pageSize?: number;
  keyword?: string;
  type?: string;
  status?: string;
}

export interface PermitCreate {
  consent: string;
  interlocutor?: string;
  category?: string;
  legal?: string;
  type?: string;
  startdate?: string;
  enddate?: string;
  scope?: string;
  process?: string;
  status?: string;
  code?: string;
  decisiondate?: string;
  decision?: string;
  note?: string;
  register?: string;
  address?: string;
  phone?: string;
  email?: string;
  administrativeinfo?: string;
  directorname?: string;
}

export interface PermitUpdate {
  consent?: string;
  interlocutor?: string;
  category?: string;
  legal?: string;
  type?: string;
  startdate?: string;
  enddate?: string;
  scope?: string;
  process?: string;
  status?: string;
  code?: string;
  decisiondate?: string;
  decision?: string;
  note?: string;
  register?: string;
  address?: string;
  phone?: string;
  email?: string;
  administrativeinfo?: string;
  directorname?: string;
}

export const permitApi = {
  page: (query: PermitQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });
    return request(`/permit/page?${params}`);
  },

  getById: (id: string) => request(`/permit/${id}`),

  create: (data: PermitCreate) =>
    request('/permit', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: PermitUpdate) =>
    request(`/permit/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) =>
    request(`/permit/${id}`, { method: 'DELETE' }),

  list: () => request('/permit/list'),
};
```

**Step 2: 提交**

```bash
git add frontend/src/app/api/permit.ts
git commit -m "feat(permit): add permit API module for license data"
```

---

## Task 2: 修改 DataManagement.tsx License Data tab 接入真实 API

**Files:**
- Modify: `frontend/src/app/components/DataManagement.tsx`

### Step 1: 添加 import

在 import 区域添加：

```typescript
import { permitApi } from '../api/permit';
```

### Step 2: 修改 LicenseRecord 类型

将 `LicenseRecord.id` 从 `number` 改为 `string`，并添加 `guid` 字段以适配后端主键：

```typescript
type LicenseRecord = {
  guid: string;
  id: string;
  number: string;
  organization: string;
  station: string;
  frequency: string;
  type: string;
  power: string;
  status: 'normal' | 'expiring' | 'expired';
  startDate: string;
  endDate: string;
  licenseAuthorization?: string;
  unit?: string;
  category?: string;
  law?: string;
  coverage?: string;
  process?: string;
  code?: string;
  decisionDate?: string;
  decision?: string;
  description?: string;
  registration?: string;
  address?: string;
  phone?: string;
  email?: string;
  administrativeInfo?: string;
  contactPerson?: string;
};
```

### Step 3: 添加映射函数

在 `mapVoToStationRecord` 附近添加：

```typescript
function mapPermitVoToLicenseRecord(r: PermitVO): LicenseRecord {
  const now = new Date();
  const endDate = r.enddate ? new Date(r.enddate) : null;
  const warning = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  let status: 'normal' | 'expiring' | 'expired' = 'normal';
  if (endDate) {
    if (endDate < now) status = 'expired';
    else if (endDate < warning) status = 'expiring';
  }
  return {
    guid: r.guid,
    id: r.guid,
    number: r.code ?? '',
    organization: r.interlocutor ?? '',
    station: r.scope ?? '',
    frequency: r.scope ?? '',
    type: r.type ?? '',
    power: '',
    status,
    startDate: r.startdate ?? '',
    endDate: r.enddate ?? '',
    licenseAuthorization: r.consent ?? '',
    unit: r.interlocutor ?? '',
    category: r.category ?? '',
    law: r.legal ?? '',
    coverage: r.scope ?? '',
    process: r.process ?? '',
    code: r.code ?? '',
    decisionDate: r.decisiondate ?? '',
    decision: r.decision ?? '',
    description: r.note ?? '',
    registration: r.register ?? '',
    address: r.address ?? '',
    phone: r.phone ?? '',
    email: r.email ?? '',
    administrativeInfo: r.administrativeinfo ?? '',
    contactPerson: r.directorname ?? '',
  };
}
```

### Step 4: 修改 licenseRecords 初始化和加载逻辑

将 useEffect 中的 `fetchAll` 修改为也加载 permit 数据：

```typescript
useEffect(() => {
  const fetchAll = async () => {
    try {
      const [stationRes, permitRes, planningRes] = await Promise.all([
        stationApi.page({ pageSize: 1000 }),
        permitApi.page({ pageSize: 1000 }),
        planningApi.page({ pageSize: 1000 }),
      ]);
      if (stationRes.code === 200 && stationRes.data?.records) {
        setStationRecords(stationRes.data.records.map(mapVoToStationRecord));
      }
      if (permitRes.code === 200 && permitRes.data?.records) {
        setLicenseRecords(permitRes.data.records.map(mapPermitVoToLicenseRecord));
      }
      if (planningRes.code === 200 && planningRes.data) {
        setPlanningRecords(planningRes.data.records.map(convertToFrequencyBand));
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };
  fetchAll();
}, []);
```

同时将 `licenseRecords` 的初始 `useState` 改为空数组：

```typescript
const [licenseRecords, setLicenseRecords] = useState<LicenseRecord[]>([]);
```

### Step 5: 添加 refreshLicenseData 函数

在 `refreshStationData` 附近添加：

```typescript
const refreshLicenseData = async () => {
  const res = await permitApi.page({ pageSize: 1000 });
  if (res.code === 200 && res.data?.records) {
    setLicenseRecords(res.data.records.map(mapPermitVoToLicenseRecord));
  }
};
```

### Step 6: 修改 Delete License 逻辑

将当前删除按钮：
```typescript
onClick={() => setLicenseRecords((prev) => prev.filter((item) => item.id !== license.id))}
```

改为：
```typescript
onClick={async () => {
  if (!confirm('确定要删除这条记录吗？')) return;
  try {
    await permitApi.delete(license.guid);
    setLicenseRecords((prev) => prev.filter((item) => item.guid !== license.guid));
  } catch { alert('删除失败'); }
}}
```

### Step 7: 修改 Add License 提交逻辑

将 `licenseDialogMode === 'add'` 的 onSubmit 改为调用 API：

```typescript
if (licenseDialogMode === 'add') {
  if (!licenseFormRecord?.category || !licenseFormRecord?.type || !licenseFormRecord?.startDate || !licenseFormRecord?.endDate) {
    alert('请填写所有必填字段：类别、类型、开始日期、结束日期');
    return;
  }
  try {
    await permitApi.create({
      consent: licenseFormRecord.licenseAuthorization ?? '',
      interlocutor: licenseFormRecord.organization || licenseFormRecord.unit ?? '',
      category: licenseFormRecord.category ?? '',
      legal: licenseFormRecord.law ?? '',
      type: licenseFormRecord.type ?? '',
      startdate: licenseFormRecord.startDate || undefined,
      enddate: licenseFormRecord.endDate || undefined,
      scope: licenseFormRecord.coverage ?? licenseFormRecord.frequency ?? '',
      process: licenseFormRecord.process ?? '',
      status: licenseFormRecord.status ?? 'active',
      code: licenseFormRecord.code ?? '',
      decisiondate: licenseFormRecord.decisionDate || undefined,
      decision: licenseFormRecord.decision ?? '',
      note: licenseFormRecord.description ?? '',
      register: licenseFormRecord.registration ?? '',
      address: licenseFormRecord.address ?? '',
      phone: licenseFormRecord.phone ?? '',
      email: licenseFormRecord.email ?? '',
      administrativeinfo: licenseFormRecord.administrativeInfo ?? '',
      directorname: licenseFormRecord.contactPerson ?? '',
    });
    await refreshLicenseData();
  } catch { alert('添加失败'); return; }
  setLicenseDialogMode(null);
  setLicenseFormRecord(null);
} else {
  // edit 逻辑见 Step 8
}
```

### Step 8: 修改 Edit License (save) 提交逻辑

在 license dialog 的 onSubmit 的 else 分支中：

```typescript
try {
  await permitApi.update(licenseFormRecord.guid, {
    consent: licenseFormRecord.licenseAuthorization ?? '',
    interlocutor: licenseFormRecord.organization || licenseFormRecord.unit ?? '',
    category: licenseFormRecord.category ?? '',
    legal: licenseFormRecord.law ?? '',
    type: licenseFormRecord.type ?? '',
    startdate: licenseFormRecord.startDate || undefined,
    enddate: licenseFormRecord.endDate || undefined,
    scope: licenseFormRecord.coverage ?? licenseFormRecord.frequency ?? '',
    process: licenseFormRecord.process ?? '',
    status: licenseFormRecord.status ?? 'active',
    code: licenseFormRecord.code ?? '',
    decisiondate: licenseFormRecord.decisionDate || undefined,
    decision: licenseFormRecord.decision ?? '',
    note: licenseFormRecord.description ?? '',
    register: licenseFormRecord.registration ?? '',
    address: licenseFormRecord.address ?? '',
    phone: licenseFormRecord.phone ?? '',
    email: licenseFormRecord.email ?? '',
    administrativeinfo: licenseFormRecord.administrativeInfo ?? '',
    directorname: licenseFormRecord.contactPerson ?? '',
  });
  await refreshLicenseData();
} catch { alert('保存失败'); return; }
setLicenseDialogMode(null);
setLicenseFormRecord(null);
```

### Step 9: 修改 Add License 初始值

在"Add License"按钮的 onClick 中，`setLicenseFormRecord` 的初始对象需添加 `guid` 字段（空字符串）：

```typescript
// 在 Add License 按钮处
setLicenseFormRecord({
  guid: '', id: '',  // 新增 guid
  number: '', organization: '', ...
});
```

同样在 `openLicenseEdit` 中也需要确保 `guid` 被设置（来自 `license.guid`）。

### Step 10: 修改 Edit 按钮打开逻辑

将 `openLicenseEdit` 中的 `setLicenseFormRecord(record)` 改为保留 guid：

```typescript
const openLicenseEdit = (record: LicenseRecord) => {
  setLicenseFormRecord({ ...record, guid: record.guid });
  setLicenseDialogMode('edit');
};
```

### Step 11: 提交

```bash
git add frontend/src/app/components/DataManagement.tsx
git commit -m "feat(data-management): connect license tab to backend permit API for full CRUD"
```

---

## Task 3: 修复 LicenseRecord 验证逻辑中的字段名问题

**Files:**
- Modify: `frontend/src/app/components/DataManagement.tsx` (License dialog onSubmit)

当前 `licenseDialogMode === 'add'` 验证使用了 `startDateDisplay`/`endDateDisplay`，应改为 `startDate`/`endDate`。

在 onSubmit 的 add 分支中：

```typescript
// 将
if (!licenseFormRecord.unit || !licenseFormRecord.category || !licenseFormRecord.type || !licenseFormRecord.startDateDisplay || !licenseFormRecord.endDateDisplay) {

// 改为
if (!licenseFormRecord.unit || !licenseFormRecord.category || !licenseFormRecord.type || !licenseFormRecord.startDate || !licenseFormRecord.endDate) {
```

**Step 2: 提交**

```bash
git add frontend/src/app/components/DataManagement.tsx
git commit -m "fix(data-management): correct license form validation field names"
```

---

## Task 4: 确认后端 PermitController CRUD 完整性

**Files:**
- Read: `backend/src/main/java/com/freqmanage/module/permit/controller/PermitController.java`

确认以下端点均已实现：
- `GET /api/permit/page` ✓ (第40行)
- `POST /api/permit` ✓ (第55行)
- `PUT /api/permit/{id}` ✓ (第61行)
- `DELETE /api/permit/{id}` ✓ (第67行)
- `GET /api/permit/list` ✓ (第84行)
- `GET /api/permit/{id}` ✓ (第45行)

后端已完整实现，无需修改。跳过 Task 4。

---

## 验证步骤

1. 重启后端 Java 服务
2. 刷新 Data Management → License Data tab，确认表格加载真实数据
3. 点击 Add License，填写字段后提交，确认出现新记录
4. 点击 Edit 修改记录，保存后确认数据更新
5. 点击 Delete，确认从前端列表和后端同时移除

---

## 执行顺序

1. **Task 1**（创建 permitApi） → 2. **Task 2**（修改 DataManagement.tsx） → 3. **Task 3**（验证逻辑修复）→ **Task 4（确认跳过）**

**Plan complete and saved to `docs/superpowers/plans/2026-05-11-license-data.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**

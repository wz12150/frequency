# Station Data 功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Data Management 页面的 **Station Data** tab 从本地 Mock 状态接入真实后端 API，实现数据的增删改查持久化。

**Architecture:**
- `DataManagement.tsx` 的 Station Data tab 目前使用 `useState` 初始化 2 条硬编码数据，所有增删改操作仅操作本地 state，不调用后端 API
- 后端已有 `StationController` 提供 CRUD 接口：`GET /api/station/page`、`GET /api/station/{id}`、`POST /api/station`、`PUT /api/station/{id}`、`DELETE /api/station/{id}`
- 数据流向：前端 `stationRecords`（本地）→ 通过 `stationApi` 调用后端 → 持久化到 MySQL `RSBT_STATION` 表

**Tech Stack:** React + TypeScript (前端), Spring Boot + MyBatis-Plus + EasyExcel (后端), MySQL 8.0

---

## 文件结构

```
frontend/src/app/
├── api/station.ts               ← 已有，需补充 delete 和 create 方法 (修改)
├── components/DataManagement.tsx ← Station Data tab 接入 API (修改)

backend/src/main/java/com/freqmanage/module/station/
├── controller/StationController.java ← 已有 GET /station/page，DELETE /station/{id} (确认)
├── service/StationService.java    ← 已有 page/update/delete/create 方法 (确认)
├── mapper/StationMapper.java      ← 已有 (确认)
```

---

## Task 1: 扩展 stationApi 增加 create 和 delete 方法

**Files:**
- Modify: `frontend/src/app/api/station.ts:1-298`

当前 `stationApi` 只有 `getMapPoints` 和 `update` 两个方法。需要补充：

- `create(data: StationCreate)` → `POST /api/station`
- `delete(id: string)` → `DELETE /api/station/{id}`
- `getById(id: string)` → `GET /api/station/{id}`（用于刷新单条）
- `page(query: StationQuery)` → `GET /api/station/page`（用于分页列表）

**Step 1: 添加 StationQuery 类型和 stationApi.page 方法**

```typescript
export interface StationQuery {
  pageNum?: number;
  pageSize?: number;
  keyword?: string;
  type?: string;
  province?: string;
  stationtype?: string;
}

export interface StationCreate {
  type: string;
  technology?: string;
  stationtype: string;
  frequencyt?: number;
  frequencyr?: number;
  bandwidth?: number;
  devicemodel?: string;
  devicequantity?: number;
  outputpower?: number;
  province: string;
  district?: string;
  location?: string;
  sitename: string;
  longitude?: number;
  latitude?: number;
  startdate?: string;
  expirationdate?: string;
  unit?: string;
  equipname?: string;
}
```

**Step 2: 扩展 stationApi 对象**

```typescript
export const stationApi = {
  getMapPoints: () => request('/station/map'),

  page: (query: StationQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });
    return request(`/station/page?${params}`);
  },

  getById: (id: string) => request(`/station/${id}`),

  create: (data: StationCreate) =>
    request('/station', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: StationUpdate) =>
    request(`/station/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) =>
    request(`/station/${id}`, { method: 'DELETE' }),
};
```

**Step 3: 提交**

```bash
git add frontend/src/app/api/station.ts
git commit -m "feat(station-api): add create/delete/page/getById methods to stationApi"
```

---

## Task 2: 确认后端 StationController 支持 DELETE 和 POST

**Files:**
- Modify: `backend/src/main/java/com/freqmanage/module/station/controller/StationController.java:1-82`

**Step 1: 确认 DELETE 端点存在**

当前 `StationController.java` 第 51-55 行已存在 `@DeleteMapping("/{id}")` 方法。

**Step 2: 确认 POST create 端点存在**

当前 `StationController.java` 第 39-43 行已存在 `@PostMapping` create 方法。

**Step 3: 提交（无需修改代码，跳过此步）**

直接进入 Task 3。

---

## Task 3: 修改 DataManagement.tsx 的 Station Data tab 接入真实 API

**Files:**
- Modify: `frontend/src/app/components/DataManagement.tsx:1-886`

**关键变更：**
1. 组件 mount 时调用 `stationApi.page({ pageSize: 1000 })` 获取真实数据，替换初始的 2 条 mock 数据
2. Add Station：调用 `stationApi.create()` 持久化到后端
3. Edit Station（StationForm 弹窗的 Save Changes 按钮）：调用 `stationApi.update()` 持久化
4. Delete Station：调用 `stationApi.delete(id)` 从后端删除，乐观更新本地 state
5. Import Excel（station tab）：解析后逐条或批量调用 `stationApi.create()`
6. `stationRecords` 的 `id` 从 `number` 改为 `guid`（`string`），因为后端 `RSBT_STATION.GUID` 是主键

### Step 1: 替换 import 和初始 mock 数据

将 `stationRecords` 的初始 `useState` 从：
```typescript
const [stationRecords, setStationRecords] = useState<StationRecord[]>([
  { id: 1, name: 'Ulaanbaatar Central A', ... },
  { id: 2, name: 'Dornogovi Station B', ... },
]);
```

改为从 API 加载：
```typescript
const [stationRecords, setStationRecords] = useState<StationRecord[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  stationApi.page({ pageSize: 1000 }).then((res) => {
    if (res.code === 200 && res.data?.records) {
      setStationRecords(res.data.records.map((r: any) => ({
        id: r.guid,
        name: r.sitename,
        type: r.type ?? '',
        region: r.district ?? '',
        province: r.province ?? '',
        detailedLocation: r.location ?? '',
        frequency: buildFrequencyString(r.frequencyt, r.frequencyr),
        status: computeStatus(r.expirationdate),
        openDate: r.startdate ?? '',
        expireDate: r.expirationdate ?? '',
        latitude: r.latitude?.toString() ?? '',
        longitude: r.longitude?.toString() ?? '',
        power: r.outputpower ? `${r.outputpower} W` : '',
        equipmentCount: r.devicequantity?.toString() ?? '',
        equipmentPower: r.outputpower?.toString() ?? '',
        technicalStandard: r.technology ?? '',
        ownerName: r.unit ?? '',
        backhaulNetworkAccessMethod: r.backbone ?? '',
        stationPurpose: r.stationpurpose ?? '',
        modulationType: r.modulation ?? '',
        antennaCount: r.antquantity?.toString() ?? '',
        equipmentNameAndModel: r.devicemodel ?? '',
        antenna: r.anttype ?? '',
      })));
    }
    setLoading(false);
  }).catch(() => setLoading(false));
}, []);

function buildFrequencyString(ft?: number, fr?: number): string {
  if (ft && fr) return `${ft}–${fr} MHz`;
  if (ft) return `${ft} MHz`;
  if (fr) return `${fr} MHz`;
  return '';
}

function computeStatus(expDate?: string): 'normal' | 'expiring' | 'expired' {
  if (!expDate) return 'normal';
  const now = new Date();
  const exp = new Date(expDate);
  if (exp < now) return 'expired';
  const warning = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  if (exp < warning) return 'expiring';
  return 'normal';
}
```

### Step 2: 修改 Delete Station 逻辑

将当前：
```typescript
onClick={() => { if (confirm('确定要删除这条记录吗？')) setStationRecords((prev) => prev.filter((item) => item.id !== station.id)); }}
```

改为：
```typescript
onClick={async () => {
  if (!confirm('确定要删除这条记录吗？')) return;
  try {
    await stationApi.delete(station.id);
    setStationRecords((prev) => prev.filter((item) => item.id !== station.id));
  } catch { alert('删除失败'); }
}}
```

### Step 3: 修改 Add Station 提交逻辑

当前 Add Station 弹窗提交（`stationDialogMode === 'add'`）代码为：
```typescript
setStationRecords((prev) => [...prev, { ...stationFormRecord, id: Date.now() }]);
```

改为：
```typescript
try {
  const payload = {
    type: stationFormRecord.type,
    stationtype: stationFormRecord.type,
    province: stationFormRecord.province,
    district: stationFormRecord.region,
    location: stationFormRecord.detailedLocation ?? '',
    sitename: stationFormRecord.name,
    unit: stationFormRecord.ownerName ?? '',
    devicemodel: stationFormRecord.equipmentNameAndModel ?? '',
    devicequantity: stationFormRecord.equipmentCount ? parseInt(stationFormRecord.equipmentCount) : undefined,
    outputpower: stationFormRecord.equipmentPower ? parseFloat(stationFormRecord.equipmentPower) : undefined,
    anttype: stationFormRecord.antenna ?? '',
    antquantity: stationFormRecord.antennaCount ? parseInt(stationFormRecord.antennaCount) : undefined,
    technology: stationFormRecord.technicalStandard ?? '',
    backbone: stationFormRecord.backhaulNetworkAccessMethod ?? '',
    stationpurpose: stationFormRecord.stationPurpose ?? '',
    modulation: stationFormRecord.modulationType ?? '',
    startdate: stationFormRecord.openDate || undefined,
    expirationdate: stationFormRecord.expireDate || undefined,
    longitude: stationFormRecord.longitude ? parseFloat(stationFormRecord.longitude) : undefined,
    latitude: stationFormRecord.latitude ? parseFloat(stationFormRecord.latitude) : undefined,
    unit: stationFormRecord.ownerName ?? '',
    equipname: '',
  };
  await stationApi.create(payload);
  const res = await stationApi.page({ pageSize: 1000 });
  if (res.code === 200 && res.data?.records) { /* 重新加载列表 */ }
  setStationDialogMode(null);
  setStationFormRecord(null);
} catch { alert('添加失败'); }
```

### Step 4: 修改 Edit Station 提交逻辑（saveStationEdit）

将当前：
```typescript
const saveStationEdit = () => {
  if (!stationFormRecord) return;
  setStationRecords((prev) => prev.map((item) => (
    item.id === stationFormRecord.id ? stationFormRecord : item
  )));
  setStationDialogMode(null);
  setStationFormRecord(null);
};
```

改为：
```typescript
const saveStationEdit = async () => {
  if (!stationFormRecord) return;
  try {
    const payload = {
      type: stationFormRecord.type,
      stationtype: stationFormRecord.type,
      province: stationFormRecord.province,
      district: stationFormRecord.region,
      location: stationFormRecord.detailedLocation ?? '',
      sitename: stationFormRecord.name,
      devicemodel: stationFormRecord.equipmentNameAndModel ?? '',
      devicequantity: stationFormRecord.equipmentCount ? parseInt(stationFormRecord.equipmentCount) : undefined,
      outputpower: stationFormRecord.equipmentPower ? parseFloat(stationFormRecord.equipmentPower) : undefined,
      anttype: stationFormRecord.antenna ?? '',
      antquantity: stationFormRecord.antennaCount ? parseInt(stationFormRecord.antennaCount) : undefined,
      technology: stationFormRecord.technicalStandard ?? '',
      backbone: stationFormRecord.backhaulNetworkAccessMethod ?? '',
      stationpurpose: stationFormRecord.stationPurpose ?? '',
      modulation: stationFormRecord.modulationType ?? '',
      startdate: stationFormRecord.openDate || undefined,
      expirationdate: stationFormRecord.expireDate || undefined,
      longitude: stationFormRecord.longitude ? parseFloat(stationFormRecord.longitude) : undefined,
      latitude: stationFormRecord.latitude ? parseFloat(stationFormRecord.latitude) : undefined,
      unit: stationFormRecord.ownerName ?? '',
      equipname: '',
    };
    await stationApi.update(stationFormRecord.id, payload);
    setStationRecords((prev) => prev.map((item) =>
      item.id === stationFormRecord.id ? stationFormRecord : item
    ));
  } catch { alert('保存失败'); return; }
  setStationDialogMode(null);
  setStationFormRecord(null);
};
```

### Step 5: 修改 Import Excel station tab 处理逻辑

将当前 `importTab === 'station'` 分支中的：
```typescript
setStationRecords(rows.map((row, index) => ({ ... })));
```

改为循环调用 `stationApi.create()`：
```typescript
const newRecords = rows.map((row) => ({
  type: String(row.type ?? row.Type ?? ''),
  stationtype: String(row.type ?? row.Type ?? ''),
  province: String(row.province ?? row.Province ?? ''),
  district: String(row.region ?? row.Region ?? ''),
  location: String(row.detailedLocation ?? row['Detailed Location'] ?? ''),
  sitename: String(row.name ?? row.Name ?? ''),
  devicemodel: String(row.equipmentNameAndModel ?? row['Equipment Name and Model'] ?? ''),
  devicequantity: String(row.equipmentCount ?? row['Equipment Count'] ?? ''),
  outputpower: parseFloat(String(row.equipmentPower ?? row['Equipment Output Power'] ?? '')),
  anttype: String(row.antenna ?? row['Antenna Type'] ?? ''),
  antquantity: parseInt(String(row.antennaCount ?? row['Antenna Count'] ?? '')),
  technology: String(row.technicalStandard ?? row['Technical Standard'] ?? ''),
  backbone: String(row.backhaulNetworkAccessMethod ?? row['Backhaul Network Access Method'] ?? ''),
  stationpurpose: String(row.stationPurpose ?? row['Station Purpose'] ?? ''),
  modulation: String(row.modulationType ?? row['Modulation Type'] ?? ''),
  startdate: String(row.openDate ?? row['Open Date'] ?? ''),
  expirationdate: String(row.expireDate ?? row['Expire Date'] ?? ''),
  longitude: parseFloat(String(row.longitude ?? row.Longitude ?? '0')),
  latitude: parseFloat(String(row.latitude ?? row.Latitude ?? '0')),
  unit: String(row.ownerName ?? row['Owner Name'] ?? ''),
  equipname: '',
}));
try {
  for (const rec of newRecords) {
    await stationApi.create(rec);
  }
  const res = await stationApi.page({ pageSize: 1000 });
  if (res.code === 200 && res.data?.records) { /* 重新加载 */ }
} catch { alert('导入失败'); }
```

### Step 6: 提交

```bash
git add frontend/src/app/components/DataManagement.tsx
git commit -m "feat(data-management): connect station tab to backend API for full CRUD"
```

---

## Task 4: 修复 Add Station 弹窗的 licenseFormRecord 验证 bug

**Files:**
- Modify: `frontend/src/app/components/DataManagement.tsx` (LicenseForm 弹窗提交逻辑)

当前 `licenseDialogMode === 'add'` 的 `onSubmit` 中使用了 `licenseFormRecord.licenseAuthorization`、`licenseFormRecord.unit`、`licenseFormRecord.startDateDisplay` 等不存在的字段名，会导致 alert 无法正常弹出。检查 `LicenseForm.tsx` 中 `LicenseRecord` 的 `startDate`/`endDate` 字段，修正验证条件。

**Step 1: 修正 LicenseRecord add 验证**

```typescript
// 将
if (!licenseFormRecord.licenseAuthorization || !licenseFormRecord.unit || !licenseFormRecord.category || !licenseFormRecord.type || !licenseFormRecord.startDateDisplay || !licenseFormRecord.endDateDisplay) {

// 改为
if (!licenseFormRecord.unit || !licenseFormRecord.category || !licenseFormRecord.type || !licenseFormRecord.startDate || !licenseFormRecord.endDate) {
```

### Step 2: 提交

```bash
git add frontend/src/app/components/DataManagement.tsx
git commit -m "fix(data-management): correct licenseFormRecord validation fields"
```

---

## 验证步骤

1. 启动后端 Java 服务：`cd backend && mvn spring-boot:run`（或 IDE 启动）
2. 启动前端：`cd frontend && pnpm dev`
3. 访问 Data Management → Station Data，确认表格加载真实数据
4. 点击 Add Station，填写必填字段，提交后确认出现在列表中
5. 点击 Edit，修改任意字段，保存后确认后端数据更新
6. 点击 Delete，确认记录从前端列表和后端数据库同时移除
7. 使用 Import Excel 上传包含 station 数据的 xlsx 文件，确认导入成功

---

## 执行顺序

1. Task 1（扩展 stationApi） → **Task 2（确认后端 DELETE/POST 端点，已确认，跳过）**
2. Task 3（修改 DataManagement.tsx）→ **Task 4（修复 LicenseForm bug）**

**Plan complete and saved to `docs/superpowers/plans/2026-05-11-station-data.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**

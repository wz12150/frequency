# 频管分析系统 - 批量删除功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 Station Data、License Data、Planning Data 三个列表界面增加批量删除、全部删除功能。

**Architecture:** 在 DataManagement.tsx 中为每个 Tab 页添加选择状态管理（selectedIds）和对应的批量/全部删除函数。复选框列添加到表头，行数据支持单选/全选。删除操作通过对应的 API（stationApi.delete / permitApi.delete / planningApi.delete）执行，删除后刷新本地状态。

**Tech Stack:** React 18 + TypeScript + Tailwind CSS + Lucide Icons

---

## 文件结构

- **Modify:** `frontend/src/app/components/DataManagement.tsx`
  - 行 442: 新增 `selectedStationIds`, `selectedLicenseIds`, `selectedPlanningIds` 状态
  - 行 686: 新增 `filteredStationData`（已有，需为 license/planning 添加类似过滤）
  - 删除/选择函数（Task 2-4）
  - 三个 Tab 的 JSX 表格部分添加复选框列和删除按钮（Task 5-7）

---

## Task 1: 新增 License/Planning 列表过滤状态

**Files:**
- Modify: `frontend/src/app/components/DataManagement.tsx:470-485`

**变更内容:**
在 `filteredLicenseData` 之后，为 `filteredPlanningData` 添加同样的过滤逻辑（搜索过滤 + 三种下拉框过滤）。

```typescript
// 在 filteredLicenseData useMemo 之后添加（行 ~485）
const filteredPlanningData = useMemo(() => planningRecords, [planningRecords]);
```

---

## Task 2: 新增 License 批量删除和全部删除逻辑

**Files:**
- Modify: `frontend/src/app/components/DataManagement.tsx:637-684`（在 handleBatchDeleteStations 之后添加）

**变更内容:**
在 `handleBatchDeleteStations` 函数之后、`toggleSelectStation` 之前添加：

```typescript
const [selectedLicenseIds, setSelectedLicenseIds] = useState<Set<string>>(new Set());

const handleBatchDeleteLicenses = async () => {
  if (selectedLicenseIds.size === 0) return;
  if (!confirm(`确定要删除选中的 ${selectedLicenseIds.size} 条记录吗？`)) return;
  try {
    const deletePromises = Array.from(selectedLicenseIds).map((guid) => permitApi.delete(guid));
    await Promise.all(deletePromises);
    setLicenseRecords((prev) => prev.filter((item) => !selectedLicenseIds.has(item.guid)));
    setSelectedLicenseIds(new Set());
  } catch (error) {
    console.error('Failed to batch delete licenses:', error);
    alert('批量删除失败');
  }
};

const handleDeleteAllLicenses = async () => {
  if (licenseRecords.length === 0) return;
  if (!confirm(`确定要删除全部 ${licenseRecords.length} 条记录吗？此操作不可恢复！`)) return;
  try {
    const deletePromises = licenseRecords.map((item) => permitApi.delete(item.guid));
    await Promise.all(deletePromises);
    setLicenseRecords([]);
    setSelectedLicenseIds(new Set());
  } catch (error) {
    console.error('Failed to delete all licenses:', error);
    alert('全部删除失败');
  }
};

const toggleSelectLicense = (guid: string) => {
  setSelectedLicenseIds((prev) => {
    const next = new Set(prev);
    if (next.has(guid)) { next.delete(guid); } else { next.add(guid); }
    return next;
  });
};

const toggleSelectAllLicenses = () => {
  setSelectedLicenseIds((prev) => {
    if (prev.size === filteredLicenseData.length) return new Set();
    return new Set(filteredLicenseData.map((l) => l.guid));
  });
};
```

---

## Task 3: 新增 Planning 批量删除和全部删除逻辑

**Files:**
- Modify: `frontend/src/app/components/DataManagement.tsx`（在 Task 2 之后添加）

**变更内容:**
在 `toggleSelectAllLicenses` 函数之后添加：

```typescript
const [selectedPlanningIds, setSelectedPlanningIds] = useState<Set<string>>(new Set());

const handleBatchDeletePlannings = async () => {
  if (selectedPlanningIds.size === 0) return;
  if (!confirm(`确定要删除选中的 ${selectedPlanningIds.size} 条记录吗？`)) return;
  try {
    const deletePromises = Array.from(selectedPlanningIds).map((guid) => planningApi.delete(guid));
    await Promise.all(deletePromises);
    const res = await planningApi.page({ pageSize: 1000 });
    if (res.code === 200 && res.data) {
      setPlanningRecords(res.data.records.map(convertToFrequencyBand));
    }
    setSelectedPlanningIds(new Set());
  } catch (error) {
    console.error('Failed to batch delete plannings:', error);
    alert('批量删除失败');
  }
};

const handleDeleteAllPlannings = async () => {
  if (planningRecords.length === 0) return;
  if (!confirm(`确定要删除全部 ${planningRecords.length} 条记录吗？此操作不可恢复！`)) return;
  try {
    const deletePromises = planningRecords.map((item) => planningApi.delete(item.guid));
    await Promise.all(deletePromises);
    setPlanningRecords([]);
    setSelectedPlanningIds(new Set());
  } catch (error) {
    console.error('Failed to delete all plannings:', error);
    alert('全部删除失败');
  }
};

const toggleSelectPlanning = (guid: string) => {
  setSelectedPlanningIds((prev) => {
    const next = new Set(prev);
    if (next.has(guid)) { next.delete(guid); } else { next.add(guid); }
    return next;
  });
};

const toggleSelectAllPlannings = () => {
  setSelectedPlanningIds((prev) => {
    if (prev.size === filteredPlanningData.length) return new Set();
    return new Set(filteredPlanningData.map((p) => p.guid));
  });
};
```

---

## Task 4: 修改 License Data 列表界面 — 添加复选框列和删除按钮

**Files:**
- Modify: `frontend/src/app/components/DataManagement.tsx:896-954`

**变更内容:**

在表头的 `<tr className="border-b border-border">` 之前添加全选复选框列：
```tsx
<th className="text-left py-3 px-4">
  <input type="checkbox"
    checked={selectedLicenseIds.size === filteredLicenseData.length && filteredLicenseData.length > 0}
    onChange={toggleSelectAllLicenses}
    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
  />
</th>
```

在表头行添加全选复选框后，每行数据第一个 `<td>` 改为包含单选复选框：
```tsx
<td className="py-3 px-4">
  <input type="checkbox"
    checked={selectedLicenseIds.has(license.guid)}
    onChange={() => toggleSelectLicense(license.guid)}
    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
  />
</td>
```

在按钮区域（删除按钮后面）添加：
```tsx
{selectedLicenseIds.size > 0 && (
  <button type="button" onClick={handleBatchDeleteLicenses}
    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2">
    <Trash2 className="w-4 h-4" />Delete Selected ({selectedLicenseIds.size})
  </button>
)}
{licenseRecords.length > 0 && (
  <button type="button" onClick={handleDeleteAllLicenses}
    className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2">
    <Trash2 className="w-4 h-4" />Delete All
  </button>
)}
```

---

## Task 5: 修改 Planning Data 列表界面 — 添加复选框列和删除按钮

**Files:**
- Modify: `frontend/src/app/components/DataManagement.tsx:956-1000`

**变更内容:**

与 Task 4 相同的模式，对 Planning Data 表格进行修改：
- 表头行添加全选复选框 `<th>`
- 每行数据 `<td>` 首列添加单选复选框
- 按钮区域添加批量删除和全部删除按钮

在 `planningRecords.map((plan) => (` 行的 `<tr>` 中添加 `<td>` 复选框：
```tsx
<td className="py-3 px-4">
  <input type="checkbox"
    checked={selectedPlanningIds.has(plan.guid)}
    onChange={() => toggleSelectPlanning(plan.guid)}
    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
  />
</td>
```

---

## Task 6: 验证修改

**验证步骤:**
1. 启动前端开发服务器：`cd frontend && pnpm dev`
2. 访问 Data Management 页面
3. 切换到 License Data Tab — 验证复选框出现，批量删除/全部删除按钮可用
4. 切换到 Planning Data Tab — 验证复选框出现，批量删除/全部删除按钮可用
5. 切换回 Station Data Tab — 验证原有功能正常，选择后批量删除按钮出现
6. 测试全选功能 — 三个 Tab 都应正常
7. 验证取消选择后按钮消失

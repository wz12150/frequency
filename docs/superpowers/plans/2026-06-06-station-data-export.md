# Station Data Export 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标:** 实现Station Data导出功能，导出字段顺序与StationForm输入字段顺序一致，支持按字段选择导出

**架构:** 在DataManagement组件中添加新的导出配置和对话框，允许用户按输入表单顺序选择要导出的字段，生成符合中国频管系统规范的Excel文件

**Tech Stack:** React + TypeScript + xlsx库 + Tailwind CSS

---

## 文件结构

- Modify: `frontend/src/app/components/DataManagement.tsx`
  - 添加按输入表单顺序排列的导出字段配置
  - 添加导出字段选择对话框
  - 修改现有导出逻辑支持字段选择

---

## 任务分解

### Task 1: 添加按输入表单顺序的导出字段配置

**Files:**
- Modify: `frontend/src/app/components/DataManagement.tsx:179-208`

当前`stationFields`和`stationFieldMap`顺序与输入表单不一致，需要添加按输入表单顺序排列的导出字段配置。

- [ ] **Step 1: 在 stationFieldMap 定义后添加按输入表单顺序的导出字段配置**

在 `stationFieldMap` 定义之后（约第208行后），添加以下配置：

```typescript
// Station导出字段配置 - 按StationForm输入顺序排列
const stationExportFields: { key: keyof StationRecord; label: string; required: boolean }[] = [
  { key: 'name', label: 'Station Name', required: true },
  { key: 'frequencyLicense', label: 'Frequency License', required: false },
  { key: 'technicalStandard', label: 'Technical Standard', required: false },
  { key: 'bbuModel', label: 'BBU Model', required: false },
  { key: 'ownedsite', label: 'Owner Name', required: true },
  { key: 'backhaulNetworkAccessMethod', label: 'Backhaul Network Access Method', required: false },
  { key: 'stationPurpose', label: 'Station Purpose', required: false },
  { key: 'modulationType', label: 'Modulation Type', required: false },
  { key: 'type', label: 'Station Type', required: true },
  { key: 'frequency', label: 'Transmit Frequency (MHz)', required: true },
  { key: 'receiveFrequency', label: 'Receive Frequency (MHz)', required: false },
  { key: 'bandwidth', label: 'Bandwidth', required: true },
  { key: 'equipmentNameAndModel', label: 'Equipment Name and Model', required: false },
  { key: 'equipmentCount', label: 'Equipment Count', required: false },
  { key: 'equipmentPower', label: 'Equipment Output Power', required: false },
  { key: 'antenna', label: 'Antenna Type', required: false },
  { key: 'antennaCount', label: 'Antenna Count', required: false },
  { key: 'province', label: 'Province', required: true },
  { key: 'region', label: 'Region', required: true },
  { key: 'detailedLocation', label: 'Detailed Location', required: false },
  { key: 'status', label: 'Status', required: false },
  { key: 'openDate', label: 'Open Date', required: true },
  { key: 'expireDate', label: 'Expire Date', required: true },
  { key: 'latitude', label: 'Latitude', required: true },
  { key: 'longitude', label: 'Longitude', required: true },
];
```

- [ ] **Step 2: 添加导出选项状态**

在 `DataManagement` 组件的状态定义部分（约第472行附近），确保 `exportOptions` 状态存在：

```typescript
const [exportOptions, setExportOptions] = useState({ 
  format: 'xlsx', 
  range: 'all', 
  fields: stationExportFields.map(f => f.key) // 默认导出所有字段
});
```

- [ ] **Step 3: 提交更改**

```bash
git add frontend/src/app/components/DataManagement.tsx
git commit -m "feat: add station export fields config in input form order"
```

---

### Task 2: 创建导出字段选择对话框

**Files:**
- Modify: `frontend/src/app/components/DataManagement.tsx:1490-1511`

现有的导出对话框结构简单，需要扩展为包含字段选择功能。

- [ ] **Step 1: 读取现有导出对话框代码**

找到现有 `showExportDialog` 对话框（约第1490行），理解其当前结构。

- [ ] **Step 2: 重构导出对话框，添加字段选择功能**

将现有的导出对话框替换为包含字段选择的新版本：

```tsx
{showExportDialog && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="w-full max-w-2xl rounded-lg bg-card shadow-2xl border border-border">
      <div className="flex items-center justify-between border-b border-border p-6">
        <h3 className="text-xl font-semibold">Export Station Data</h3>
        <button type="button" onClick={() => setShowExportDialog(false)} className="p-2 hover:bg-muted rounded-lg transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
      </div>
      <div className="p-6 space-y-4">
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-3">Select fields to export (in input form order):</h4>
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto border border-border rounded-lg p-3">
            {stationExportFields.map((field) => (
              <label key={field.key} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 p-1 rounded">
                <input
                  type="checkbox"
                  checked={exportOptions.fields.includes(field.key)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setExportOptions(prev => ({
                        ...prev,
                        fields: [...prev.fields, field.key]
                      }));
                    } else {
                      setExportOptions(prev => ({
                        ...prev,
                        fields: prev.fields.filter(f => f !== field.key)
                      }));
                    }
                  }}
                  className="rounded border-border"
                />
                <span>{field.label}</span>
                {field.required && <span className="text-red-500 text-xs">*</span>}
              </label>
            ))}
          </div>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-border">
          <div className="text-sm text-muted-foreground">
            {exportOptions.fields.length} field(s) selected
          </div>
          <div className="flex gap-3">
            <button 
              type="button" 
              onClick={() => setExportOptions(prev => ({ ...prev, fields: stationExportFields.map(f => f.key) }))}
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm"
            >
              Select All
            </button>
            <button 
              type="button" 
              onClick={() => setExportOptions(prev => ({ ...prev, fields: stationExportFields.filter(f => f.required).map(f => f.key) }))}
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm"
            >
              Select Required Only
            </button>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={() => setShowExportDialog(false)} className="px-5 py-2 border border-border rounded-lg hover:bg-muted transition-colors">Cancel</button>
          <button 
            type="button" 
            onClick={() => {
              if (exportOptions.fields.length === 0) {
                alert('Please select at least one field to export');
                return;
              }
              // 调用导出函数
              const data = stationRecords;
              const fieldLabelMap: Record<string, string> = {};
              stationExportFields.forEach(f => { fieldLabelMap[f.key] = f.label; });
              const rows = data.map((item) => exportOptions.fields.map((field) => (item as any)[field] ?? ''));
              const worksheet = XLSX.utils.aoa_to_sheet([[...exportOptions.fields.map((field) => fieldLabelMap[field] ?? String(field)), ...rows]]);
              const workbook = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(workbook, worksheet, 'Station Data');
              XLSX.writeFile(workbook, `station-data-${new Date().toISOString().split('T')[0]}.xlsx`);
              setShowExportDialog(false);
            }}
            className="px-5 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            Export Excel
          </button>
        </div>
      </div>
    </div>
  </div>
)}
```

- [ ] **Step 3: 提交更改**

```bash
git add frontend/src/app/components/DataManagement.tsx
git commit -m "feat: add field selection dialog for station export"
```

---

### Task 3: 更新导出按钮打开导出对话框

**Files:**
- Modify: `frontend/src/app/components/DataManagement.tsx:939`

找到Station Data管理区域的导出按钮，确保它打开导出对话框而不是直接导出。

- [ ] **Step 1: 修改导出按钮的onClick事件**

将导出按钮的 onClick 从直接调用 `exportToExcel('station')` 改为打开导出对话框：

```tsx
// 原来的代码:
<button type="button" onClick={() => exportToExcel('station')} className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-2"><FileDown className="w-4 h-4" />Export Excel</button>

// 修改为:
<button type="button" onClick={() => setShowExportDialog(true)} className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-2"><FileDown className="w-4 h-4" />Export Excel</button>
```

- [ ] **Step 2: 提交更改**

```bash
git add frontend/src/app/components/DataManagement.tsx
git commit -m "feat: update export button to open field selection dialog"
```

---

### Task 4: 添加导出预览功能（可选增强）

**Files:**
- Modify: `frontend/src/app/components/DataManagement.tsx`

在导出对话框中添加导出数据预览，显示前几行数据。

- [ ] **Step 1: 在导出对话框中添加预览区域**

在导出对话框的字段选择下方添加预览区域：

```tsx
{exportOptions.fields.length > 0 && stationRecords.length > 0 && (
  <div className="border border-border rounded-lg p-3 mt-4">
    <h4 className="text-sm font-medium mb-2">Preview (first 3 rows):</h4>
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border">
            {exportOptions.fields.slice(0, 5).map(field => (
              <th key={field} className="text-left py-1 px-2 font-medium">{stationExportFields.find(f => f.key === field)?.label}</th>
            ))}
            {exportOptions.fields.length > 5 && <th className="text-left py-1 px-2">...</th>}
          </tr>
        </thead>
        <tbody>
          {stationRecords.slice(0, 3).map((record, idx) => (
            <tr key={idx} className="border-b border-border">
              {exportOptions.fields.slice(0, 5).map(field => (
                <td key={field} className="py-1 px-2">{(record as any)[field] ?? '-'}</td>
              ))}
              {exportOptions.fields.length > 5 && <td className="py-1 px-2">...</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}
```

- [ ] **Step 2: 提交更改**

```bash
git add frontend/src/app/components/DataManagement.tsx
git commit -m "feat: add export preview in field selection dialog"
```

---

## 验证步骤

1. 打开 DataManagement 页面
2. 切换到 Station Data 标签
3. 点击 "Export Excel" 按钮
4. 验证导出对话框包含所有25个字段（按输入表单顺序排列）
5. 验证可以选择/取消选择字段
6. 验证 "Select All" 和 "Select Required Only" 按钮功能
7. 验证导出生成的Excel文件字段顺序与输入表单一致

---

## 字段顺序对照表

| # | 字段Key | 字段Label | 必填 |
|---|---------|-----------|------|
| 1 | name | Station Name | ✓ |
| 2 | frequencyLicense | Frequency License | |
| 3 | technicalStandard | Technical Standard | |
| 4 | bbuModel | BBU Model | |
| 5 | ownedsite | Owner Name | ✓ |
| 6 | backhaulNetworkAccessMethod | Backhaul Network Access Method | |
| 7 | stationPurpose | Station Purpose | |
| 8 | modulationType | Modulation Type | |
| 9 | type | Station Type | ✓ |
| 10 | frequency | Transmit Frequency (MHz) | ✓ |
| 11 | receiveFrequency | Receive Frequency (MHz) | |
| 12 | bandwidth | Bandwidth | ✓ |
| 13 | equipmentNameAndModel | Equipment Name and Model | |
| 14 | equipmentCount | Equipment Count | |
| 15 | equipmentPower | Equipment Output Power | |
| 16 | antenna | Antenna Type | |
| 17 | antennaCount | Antenna Count | |
| 18 | province | Province | ✓ |
| 19 | region | Region | ✓ |
| 20 | detailedLocation | Detailed Location | |
| 21 | status | Status | |
| 22 | openDate | Open Date | ✓ |
| 23 | expireDate | Expire Date | ✓ |
| 24 | latitude | Latitude | ✓ |
| 25 | longitude | Longitude | ✓ |
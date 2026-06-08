# Station Data 导入程序重新设计实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重新设计 Station Data 的导入程序，确保与当前 `StationCreate` / `StationRecord` 类型的所有字段一一对应，且顺序与 Add Station 表单一致。

**Architecture:** 修改 `DataManagement.tsx` 中的 `importFromExcel` 函数，增加缺失的字段映射；同步更新 `stationFields` 数组和 `stationFieldMap` 映射表，确保导入模板表头与字段一一对应且顺序与 Add Station 表单一致。

**Tech Stack:** React + TypeScript + xlsx (SheetJS)

---

## Add Station 表单字段顺序（参考）

```
1.  name                    → Station Name
2.  frequencyLicense         → Frequency License
3.  technicalStandard        → Technical Standard
4.  bbuModel                 → BBU Model
5.  ownedsite                → Owner Name
6.  backhaulNetworkAccessMethod → Backhaul Network Access Method
7.  stationPurpose           → Station Purpose
8.  modulationType           → Modulation Type
9.  type                     → Station Type
10. frequency                → Transmit Frequency (MHz)
11. receiveFrequency         → Receive Frequency (MHz)
12. bandwidth                → Bandwidth
13. equipmentNameAndModel    → Equipment Name and Model
14. equipmentCount           → Equipment Count
15. equipmentPower           → Equipment Output Power
16. antenna                  → Antenna Type
17. antennaCount             → Antenna Count
18. province                 → Province
19. region                   → Region
20. detailedLocation         → Detailed Location
21. status                   → Status
22. openDate                 → Open Date
23. expireDate                → Expire Date
24. latitude                 → Latitude
25. longitude                → Longitude
```

---

## 文件结构

- **修改:** `frontend/src/app/components/DataManagement.tsx`
  - `importFromExcel` 函数（Station 导入部分）
  - `stationFields` 数组
  - `stationFieldMap` 对象
  - `mapVoToStationRecord` 函数（保持一致性）

---

## 任务 1: 更新 `stationFields` 数组，按照 Add Station 表单顺序排列

**Files:**
- Modify: `frontend/src/app/components/DataManagement.tsx:179`

- [ ] **Step 1: 用正确的顺序替换 `stationFields` 数组**

当前行 179：
```javascript
const stationFields: (keyof StationRecord)[] = ['name', 'frequencyLicense', 'type', 'region', 'province', 'detailedLocation', 'frequency', 'bandwidth', 'status', 'openDate', 'expireDate', 'latitude', 'longitude', 'power', 'antenna', 'equipmentCount', 'equipmentPower', 'technicalStandard', 'bandwidthProcessingUnitModel', 'ownerName', 'backhaulNetworkAccessMethod', 'stationPurpose', 'modulationType', 'antennaCount', 'equipmentNameAndModel'];
```

替换为（按照 Add Station 表单顺序）：
```javascript
const stationFields: (keyof StationRecord)[] = [
  'name',
  'frequencyLicense',
  'technicalStandard',
  'bbuModel',
  'ownedsite',
  'backhaulNetworkAccessMethod',
  'stationPurpose',
  'modulationType',
  'type',
  'frequency',
  'receiveFrequency',
  'bandwidth',
  'equipmentNameAndModel',
  'equipmentCount',
  'equipmentPower',
  'antenna',
  'antennaCount',
  'province',
  'region',
  'detailedLocation',
  'status',
  'openDate',
  'expireDate',
  'latitude',
  'longitude',
];
```

- [ ] **Step 2: 提交更改**

```bash
git add frontend/src/app/components/DataManagement.tsx
git commit -m "refactor: 按Add Station表单顺序重排 stationFields"
```

---

## 任务 2: 更新 `stationFieldMap` 表头中文映射，与表单标签一致

**Files:**
- Modify: `frontend/src/app/components/DataManagement.tsx:182-208`

- [ ] **Step 1: 替换整个 `stationFieldMap` 对象**

当前 `stationFieldMap` 定义（约 lines 182-208）：

```javascript
const stationFieldMap: Record<keyof StationRecord, string> = {
  name: 'Station Name',
  frequencyLicense: 'Frequency License',
  type: 'Station Type',
  region: 'Region',
  province: 'Province',
  detailedLocation: 'Detailed Location',
  frequency: 'Frequency',
  bandwidth: 'Bandwidth',
  status: 'Status',
  openDate: 'Open Date',
  expireDate: 'Expire Date',
  latitude: 'Latitude',
  longitude: 'Longitude',
  power: 'Power',
  antenna: 'Antenna Type',
  equipmentCount: 'Equipment Count',
  equipmentPower: 'Equipment Output Power',
  technicalStandard: 'Technical Standard',
  bandwidthProcessingUnitModel: 'Bandwidth Processing Unit Model',
  ownerName: 'Owner Name',
  backhaulNetworkAccessMethod: 'Backhaul Network Access Method',
  stationPurpose: 'Station Purpose',
  modulationType: 'Modulation Type',
  antennaCount: 'Antenna Count',
  equipmentNameAndModel: 'Equipment Name and Model',
};
```

替换为（按照 Add Station 表单标签精确匹配）：
```javascript
const stationFieldMap: Record<keyof StationRecord, string> = {
  name: 'Station Name',
  frequencyLicense: 'Frequency License',
  technicalStandard: 'Technical Standard',
  bbuModel: 'BBU Model',
  ownedsite: 'Owner Name',
  backhaulNetworkAccessMethod: 'Backhaul Network Access Method',
  stationPurpose: 'Station Purpose',
  modulationType: 'Modulation Type',
  type: 'Station Type',
  frequency: 'Transmit Frequency (MHz)',
  receiveFrequency: 'Receive Frequency (MHz)',
  bandwidth: 'Bandwidth',
  equipmentNameAndModel: 'Equipment Name and Model',
  equipmentCount: 'Equipment Count',
  equipmentPower: 'Equipment Output Power',
  antenna: 'Antenna Type',
  antennaCount: 'Antenna Count',
  province: 'Province',
  region: 'Region',
  detailedLocation: 'Detailed Location',
  status: 'Status',
  openDate: 'Open Date',
  expireDate: 'Expire Date',
  latitude: 'Latitude',
  longitude: 'Longitude',
};
```

- [ ] **Step 2: 提交更改**

```bash
git add frontend/src/app/components/DataManagement.tsx
git commit -m "feat: 更新 stationFieldMap 表头映射，与Add Station表单标签一致"
```

---

## 任务 3: 补充 `importFromExcel` 中缺失的字段映射

**Files:**
- Modify: `frontend/src/app/components/DataManagement.tsx:829-866`

- [ ] **Step 1: 找到 `importFromExcel` 函数中 `importTab === 'station'` 的 payload 构建部分**

当前代码约在 lines 829-866，payload 对象缺少以下字段：
- `bbumodel` → BBU型号
- `ownedsite` → 自有站址
- `frequencyt` → 发射频率
- `frequencyr` → 接收频率
- `bandwidth` → 带宽
- `bandwidthprocessingunitmodel` → 带宽处理单元型号

- [ ] **Step 2: 替换整个 payload 对象，补充缺失字段并修正顺序**

替换为（按照 Add Station 表单顺序）：
```javascript
const payload = {
  // 基本信息（与表单顺序对应）
  sitename: String(row.name ?? row.Name ?? ''),
  frequencyLicense: String(row.frequencyLicense ?? row['Frequency License'] ?? ''),
  technology: String(row.technicalStandard ?? row['Technical Standard'] ?? ''),
  bbumodel: String(row.bbuModel ?? row.BBUModel ?? row['BBU Model'] ?? ''),
  ownedsite: String(row.ownedsite ?? row.OwnedSite ?? row['Owner Name'] ?? row.unit ?? row.Unit ?? ''),
  backbone: String(row.backhaulNetworkAccessMethod ?? row['Backhaul Network Access Method'] ?? ''),
  stationpurpose: String(row.stationPurpose ?? row['Station Purpose'] ?? ''),
  modulation: String(row.modulationType ?? row['Modulation Type'] ?? ''),

  // 频率相关
  type: String(row.type ?? row.Type ?? ''),
  stationtype: String(row.type ?? row.Type ?? ''),
  frequencyt: row.frequencyt ?? row.FrequencyT ?? row.frequency ?? row.Frequency ?? row['Transmit Frequency'] ? parseFloat(String(row.frequencyt ?? row.FrequencyT ?? row.frequency ?? row.Frequency ?? row['Transmit Frequency'])) : undefined,
  frequencyr: row.frequencyr ?? row.FrequencyR ?? row.receiveFrequency ?? row['Receive Frequency'] ? parseFloat(String(row.frequencyr ?? row.FrequencyR ?? row.receiveFrequency ?? row['Receive Frequency'])) : undefined,
  bandwidth: row.bandwidth ?? row.Bandwidth ? parseFloat(String(row.bandwidth ?? row.Bandwidth)) : undefined,

  // 设备信息
  devicemodel: String(row.equipmentNameAndModel ?? row['Equipment Name and Model'] ?? ''),
  devicequantity: row.equipmentCount ?? row['Equipment Count'] ? parseInt(String(row.equipmentCount ?? row['Equipment Count'])) : undefined,
  outputpower: row.equipmentPower ?? row['Equipment Output Power'] ? parseFloat(String(row.equipmentPower ?? row['Equipment Output Power'])) : undefined,

  // 天线信息
  anttype: String(row.antenna ?? row['Antenna Type'] ?? ''),
  antquantity: row.antennaCount ?? row['Antenna Count'] ? parseInt(String(row.antennaCount ?? row['Antenna Count'])) : undefined,

  // 位置信息
  province: String(row.province ?? row.Province ?? ''),
  district: String(row.region ?? row.Region ?? ''),
  location: String(row.detailedLocation ?? row['Detailed Location'] ?? ''),

  // 日期
  startdate: String(row.openDate ?? row['Open Date'] ?? ''),
  expirationdate: String(row.expireDate ?? row['Expire Date'] ?? ''),

  // 坐标
  longitude: row.longitude ?? row.Longitude ? parseFloat(String(row.longitude ?? row.Longitude)) : undefined,
  latitude: row.latitude ?? row.Latitude ? parseFloat(String(row.latitude ?? row.Latitude)) : undefined,

  // 额外字段
  unit: String(row.ownedsite ?? row.OwnedSite ?? row['Owner Name'] ?? ''),
  equipname: String(row.equipmentNameAndModel ?? row['Equipment Name and Model'] ?? ''),
};
```

- [ ] **Step 3: 提交更改**

```bash
git add frontend/src/app/components/DataManagement.tsx
git commit -m "fix: 补充Station导入缺失字段映射并修正payload结构"
```

---

## 任务 4: 更新 `mapVoToStationRecord` 函数，确保所有字段正确映射

**Files:**
- Modify: `frontend/src/app/components/DataManagement.tsx:418-450`

- [ ] **Step 1: 检查并更新 `mapVoToStationRecord` 函数**

当前函数约在 lines 418-450，替换为（确保所有字段正确映射）：
```javascript
function mapVoToStationRecord(r: any): StationRecord {
  return {
    id: r.guid,
    name: r.sitename ?? '',
    type: r.type ?? '',
    region: r.district ?? '',
    province: r.province ?? '',
    detailedLocation: r.location ?? '',
    frequency: r.frequencyt?.toString() ?? '',
    receiveFrequency: r.frequencyr?.toString() ?? '',
    bandwidth: r.bandwidth?.toString() ?? '',
    bandwidthProcessingUnitModel: r.bandwidthprocessingunitmodel ?? '',
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
    ownedsite: r.ownedsite ?? '',
    bbuModel: r.bbumodel ?? '',
    backhaulNetworkAccessMethod: r.backbone ?? '',
    stationPurpose: r.stationpurpose ?? '',
    modulationType: r.modulation ?? '',
    antennaCount: r.antquantity?.toString() ?? '',
    equipmentNameAndModel: r.devicemodel ?? '',
    antenna: r.anttype ?? '',
    frequencyLicense: r.frequencyLicense ?? '',
  };
}
```

- [ ] **Step 2: 提交更改**

```bash
git add frontend/src/app/components/DataManagement.tsx
git commit -m "fix: 确保 mapVoToStationRecord 覆盖所有导入字段"
```

---

## 任务 5: 验证完整导入流程

- [ ] **Step 1: 确认导入模板字段与 importFromExcel 映射一致**

检查 `importFromExcel` 中使用的 Excel 表头名称与 `stationFieldMap` 中定义的表头是否匹配：

| Excel 表头 (英文) | 备选表头 |
|---|---|
| Station Name | Name |
| Frequency License | - |
| Technical Standard | - |
| BBU Model | BBUModel |
| Owner Name | OwnedSite, Unit |
| Backhaul Network Access Method | - |
| Station Purpose | - |
| Modulation Type | - |
| Station Type | Type |
| Transmit Frequency (MHz) | FrequencyT, Frequency |
| Receive Frequency (MHz) | FrequencyR |
| Bandwidth | - |
| Equipment Name and Model | - |
| Equipment Count | - |
| Equipment Output Power | - |
| Antenna Type | - |
| Antenna Count | - |
| Province | - |
| Region | - |
| Detailed Location | - |
| Status | - |
| Open Date | - |
| Expire Date | - |
| Latitude | - |
| Longitude | - |

- [ ] **Step 2: 测试导入功能**

手动测试步骤：
1. 导出当前 Station 数据为 Excel（验证 `exportToExcel` 函数正常工作）
2. 检查导出的 Excel 表头顺序是否与 `stationFields` 一致
3. 使用导入功能导入测试 Excel
4. 验证数据是否正确写入后端

```bash
# 启动前端开发服务器
cd frontend && pnpm dev
```

---

## 字段映射对照表（最终版）

| StationRecord 字段 | Excel 表头 (建议) | 后端 API 字段 |
|---|---|---|
| name | Station Name | sitename |
| frequencyLicense | Frequency License | frequencyLicense |
| technicalStandard | Technical Standard | technology |
| bbuModel | BBU Model | bbumodel |
| ownedsite | Owner Name | ownedsite |
| backhaulNetworkAccessMethod | Backhaul Network Access Method | backbone |
| stationPurpose | Station Purpose | stationpurpose |
| modulationType | Modulation Type | modulation |
| type | Station Type | type / stationtype |
| frequency | Transmit Frequency (MHz) | frequencyt |
| receiveFrequency | Receive Frequency (MHz) | frequencyr |
| bandwidth | Bandwidth | bandwidth |
| equipmentNameAndModel | Equipment Name and Model | devicemodel |
| equipmentCount | Equipment Count | devicequantity |
| equipmentPower | Equipment Output Power | outputpower |
| antenna | Antenna Type | anttype |
| antennaCount | Antenna Count | antquantity |
| province | Province | province |
| region | Region | district |
| detailedLocation | Detailed Location | location |
| status | Status | (计算字段) |
| openDate | Open Date | startdate |
| expireDate | Expire Date | expirationdate |
| latitude | Latitude | latitude |
| longitude | Longitude | longitude |

---

## 备注

1. **Excel 模板表头**: 统一使用英文表头，导入程序使用大小写不敏感匹配
2. **数值字段处理**: `bandwidth`, `frequencyt`, `frequencyr`, `devicequantity`, `outputpower`, `antquantity` 使用 `parseFloat` / `parseInt` 转换
3. **可选字段**: 所有字段在 Excel 中均可选，导入时使用 `??` 合并运算符处理缺失值
4. **`ownedsite` 与 `unit`**: 目前映射到同一来源（Owner Name），如需区分需业务确认
5. **导出功能**: `exportToExcel` 函数使用 `stationFields` 顺序导出，无需额外修改
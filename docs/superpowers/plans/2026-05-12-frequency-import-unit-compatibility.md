# 频段频率导入/展示单位兼容方案

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 解决 Planning Data 导入时频率值因单位（kHz/MHz/GHz）导致后端 BigDecimal 解析失败的问题，同时确保频段展示正常。

**Architecture:** 后端字段改为 String 类型，前端在导入时将频率格式化为纯数字（kHz 归一化值），展示时按原样显示。关键变化点：① 导入 Excel 时前端做预处理 ② 前端展示层增加单位解析函数 ③ 后端字段类型变更（需通知后端开发者）

**Tech Stack:** React 18 + TypeScript (前端) | Java Spring Boot + Alibaba EasyExcel (后端)

---

## 背景

**问题现象：**
```
Error: Convert data com.alibaba.excel.metadata.data.ReadCellData@cae843bf to class java.math.BigDecimal error
```

**根因：** 后端 `/planning/import` 接口中 `startfrequency`、`stopfrequency` 等字段定义为 `BigDecimal`，EasyExcel 解析 Excel 时遇到带单位的文本（如 "1800 MHz"）无法转换为 `BigDecimal`，导致 500 错误。

**用户输入频率可能包含单位：**
- `1800 kHz`
- `1800 MHz`
- `1800 GHz`

---

## 文件结构

**Frontend:**
- `frontend/src/app/components/DataManagement.tsx` — 导入逻辑（Task 1）
- `frontend/src/app/api/planning.ts` — 接口类型定义（Task 2）
- `frontend/src/app/components/FrequencyPlanning.tsx` — 频段展示层（Task 3）

**Backend (需通知后端开发者修改):**
- `PlanningImportController.java` — 导入接口字段类型
- `PlanningExcelListener.java` — EasyExcel 监听器字段映射
- `PlanningDomain.java` — 实体字段类型（startfrequency/stopfrequency/step/bandwidth → String）

---

## Task 1: 前端导入预处理 — 将频率值归一化为 kHz 纯数字文本

**Files:**
- Modify: `frontend/src/app/components/DataManagement.tsx:797-814`

**变更内容:**

当前 `importFromExcel` 对 planning 类型的处理是直接上传文件：
```typescript
if (importTab === 'planning') {
  try {
    await planningApi.import(importFile);
    // ...
  }
}
```

**改为：** 在上传前，使用 JavaScript 读取 Excel 文件，将 `Start Frequency`、`End Frequency`、`Step`、`Signal Bandwidth` 列中的值统一转换为 kHz 单位的数字字符串，再上传。

原理：在上传前将带单位的频率值（如 "1800 MHz"）转换为 kHz 纯数字（如 "1800000"），后端存储为 String 类型时直接保存纯数字，存储和展示都不会有问题。

但这需要引入 `xlsx` 库修改文件内容，实际上更简单的方案是：

**最终方案（Task 1+3 联动）：后端改为 String，前端展示时解析单位**

Task 1 先跳过，看 Task 3。

---

## Task 2: 后端字段变更（需通知后端开发者）

**Files (Backend):**
- Modify: `Planning.java` 实体类 — `startfrequency`、`stopfrequency`、`step`、`bandwidth` 字段类型从 `BigDecimal` 改为 `String`
- Modify: `PlanningExcelListener.java` — 对应列映射从 `BigDecimal` 改为 `String`

**变更内容:**

```java
// Planning.java 原来：
private BigDecimal startfrequency;
private BigDecimal stopfrequency;

// 改为：
private String startfrequency;
private String stopfrequency;
```

这样 Excel 中即使写入带单位的文本（如 "1800 MHz"），后端也能接收为字符串，不会报 BigDecimal 转换错误。

**影响范围：**
- 存储层：字段类型变化，如已有数据需要一次性的数据迁移（将数字转为字符串）
- 查询层：`startfrequency`、`stopfrequency` 作为数字查询的条件（如 `WHERE startfrequency > 1800000`）需要改为字符串比较或数值转换

---

## Task 3: 前端展示层 — 增加频率单位解析函数

**Files:**
- Modify: `frontend/src/app/components/FrequencyPlanning.tsx:129-156`
- Modify: `frontend/src/app/api/planning.ts:54-58` — `PlanningVO` 接口类型

**变更内容:**

在 `FrequencyPlanning.tsx` 中添加频率解析函数：

```typescript
/** 解析频率字符串，返回 kHz 单位的数字值 */
function parseFrequencyToKhz(value: string | number | undefined): number {
  if (value === undefined || value === null) return 0;
  const str = String(value).trim().toUpperCase();
  if (str === '') return 0;
  if (str.includes('GHZ')) return parseFloat(str.replace(/[^\d.]/g, '')) * 1_000_000;
  if (str.includes('MHZ')) return parseFloat(str.replace(/[^\d.]/g, '')) * 1_000;
  return parseFloat(str.replace(/[^\d.]/g, '')); // 默认 kHz
}

/** 格式化频率为可读字符串（保留原单位显示） */
function formatFrequencyDisplay(value: string | number | undefined): string {
  if (value === undefined || value === null) return '-';
  const str = String(value).trim();
  // 如果已经是带单位的格式，原样返回
  if (str.toUpperCase().includes('GHZ') || str.toUpperCase().includes('MHZ') || str.toUpperCase().includes('KHZ')) {
    return str;
  }
  // 否则按数字处理，转换为合适的单位
  const num = parseFloat(str);
  if (isNaN(num)) return str;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(3)} GHz`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(3)} MHz`;
  return `${num} kHz`;
}
```

然后修改 `planningVOToSpectrumBlock` 函数中的解析逻辑：

```typescript
function planningVOToSpectrumBlock(record: PlanningVO, index: number, allRecords: PlanningVO[]): SpectrumBlock {
  const { status } = deriveStatus(record.level ?? '');
  const serviceColor = radioservicesToColor(record.radioservices ?? '');
  const startKhz = parseFrequencyToKhz(record.startfrequency);
  const endKhz = parseFrequencyToKhz(record.stopfrequency);
  const width = endKhz - startKhz;
  // ...
}
```

同时更新 `planning.ts` 中的类型定义，支持 string 类型的频率值：

```typescript
export interface PlanningVO {
  // ...
  startfrequency: number | string;
  stopfrequency: number | string;
  // ...
}
```

---

## Task 4: 验证前后端联动

**验证步骤:**

1. 准备包含不同单位的 Excel 文件测试数据：
   - `1800 kHz`
   - `1800 MHz`
   - `1800 GHz`

2. 通过前端界面上传 Planning Data

3. 检查导入是否成功（无 500 错误）

4. 检查 National Spectrum Distribution Map 展示是否正常：
   - 频段位置是否正确
   - 颜色是否按业务类型区分
   - 详细信息弹窗中频率值是否正确显示

---

## 风险与注意事项

1. **后端必须配合修改** — 如果只改前端不改后端，后端仍然会以 BigDecimal 解析，错误依旧
2. **已有数据迁移** — 后端改为 String 类型后，数据库中已有的数字记录需要确认兼容性
3. **查询条件兼容性** — 如果后端有基于频率值的范围查询逻辑，需要确认字符串比较是否影响查询结果

---

## 执行顺序

1. **Task 2（后端）** — 先通知后端开发者修改字段类型为 String（必须优先完成）
2. **Task 3（前端展示层）** — 前端增加单位解析函数
3. **Task 4（验证）** — 前后端联动测试

**建议：同时进行 Task 2 和 Task 3，因为两者互相依赖但代码修改是独立的。**

# Station Map 功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Station Map 前端从静态 Mock 数据替换为真实 API 数据，修复前端 bug，扩展后端 VO 以支持前端所需全部字段。

**Architecture:**
- 前端 `StationMap.tsx` 已有完整 UI（含地图、筛选面板、详情编辑面板），使用 Leaflet 渲染台站点，当前使用硬编码的 `INIT_STATIONS` mock 数据
- 后端 `/api/station/map` 已存在，返回 `List<StationMapVO>`，但 VO 字段不足，且未计算 `status`（许可证状态）
- 数据流向：数据库 `RSBT_STATION` → `StationService.getMapPoints()` → `StationMapVO` → 前端 `StationMap.tsx`

**Tech Stack:** React + TypeScript (前端), Spring Boot + MyBatis-Plus (后端), MySQL 8.0, Leaflet (地图)

---

## 文件结构

```
backend/src/main/java/com/freqmanage/module/station/
├── vo/StationMapVO.java          ← 扩展字段 (修改)
├── service/StationService.java   ← 添加 status 计算逻辑 (修改)
frontend/src/app/
├── api/station.ts               ← 新增 API 调用层
├── components/StationMap.tsx    ← 接入 API，修复 setBandService bug (修改)
```

---

## 已知 Bug

- `StationMap.tsx:430` 调用了未定义的 `setBandService`，应调用 `setBandId('')`。此 Bug 在 Task 4 中修复。

---

## Task 1: 扩展 StationMapVO 增加所有前端所需字段

**Files:**
- Modify: `backend/src/main/java/com/freqmanage/module/station/vo/StationMapVO.java:1-18`

前端 `Station` 接口需要以下额外字段：`status`、`frequency`（显示用字符串）、`freqMHz`（中心频率，数值）、`unit`（设台单位）、`equipName`（设备名称）、`equipModel`（设备型号）、`expiry`（有效期）、`power`（功率）。其中 `unit`/`equipName`/`equipModel`/`expiry`/`power` 需要在数据库中增加对应列或复用现有列。

当前 `RSBT_STATION` 表有字段：`DEVICEMODEL`（设备型号）、`OUTPUTPOWER`（功率）、`EXPIRATIONDATE`（到期日期）、`LONGITUDE`/`LATITUDE`（经纬度）、`SITENAME`（站名）、`TYPE`/`STATIONTYPE`（类型）、`PROVINCE`/`DISTRICT`/`LOCATION`（地址）。缺少：`unit`（设台单位）、`equipName`（设备名称）、`status`（需计算）。

**Step 1: 在 RSBT_STATION 表增加缺字段（unit / equip_name）**

```sql
ALTER TABLE RSBT_STATION 
ADD COLUMN UNIT VARCHAR(200) DEFAULT NULL COMMENT '设台单位' AFTER LOCATION,
ADD COLUMN EQUIPNAME VARCHAR(100) DEFAULT NULL COMMENT '设备名称' AFTER UNIT;
```

**Step 2: 扩展 StationMapVO**

```java
// backend/src/main/java/com/freqmanage/module/station/vo/StationMapVO.java
package com.freqmanage.module.station.vo;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class StationMapVO {
    private String guid;
    private String sitename;        // 站名
    private BigDecimal longitude;   // 经度
    private BigDecimal latitude;     // 纬度
    private String type;             // TYPE 字段 (Mobile/Broadcasting/Fixed/Satellite/Microwave/Navigation)
    private String stationtype;      // STATIONTYPE 字段

    // 新增字段
    private String frequency;       // 显示用频率字符串，如 "1800–1900 MHz"，由 FREQUENCYT + FREQUENCYR 拼装
    private BigDecimal freqMHz;     // 中心频率 MHz (数值)，用于筛选
    private String unit;            // 设台单位
    private String equipName;       // 设备名称
    private String equipModel;      // 设备型号 (复用 DEVICEMODEL)
    private String expiry;          // 有效期 (EXPIRATIONDATE 格式化为 yyyy-MM-dd)
    private String power;           // 功率 (OUTPUTPOWER + 'W')
    private String status;           // normal / expiring / expired (由 EXPIRATIONDATE 推算)
    private String province;         // 省份
}
```

**Step 3: 提交**

```bash
git add backend/src/main/java/com/freqmanage/module/station/vo/StationMapVO.java
git commit -m "feat(station): expand StationMapVO with all fields needed by frontend map"
```

---

## Task 2: 在 StationService 中实现 status 计算逻辑并完善 convertToMapVO

**Files:**
- Modify: `backend/src/main/java/com/freqmanage/module/station/service/StationService.java:99-107` (getMapPoints 方法)
- Modify: `backend/src/main/java/com/freqmanage/module/station/service/StationService.java:240-249` (convertToMapVO 方法)

**Step 1: 添加 status 计算辅助方法到 StationService**

```java
// 在 StationService 类中添加
private String computeStatus(LocalDate expirationDate) {
    if (expirationDate == null) return "normal";
    LocalDate today = LocalDate.now();
    LocalDate warningThreshold = today.plusDays(90); // 提前90天提醒
    if (expirationDate.isBefore(today)) return "expired";
    if (expirationDate.isBefore(warningThreshold)) return "expiring";
    return "normal";
}
```

**Step 2: 修改 getMapPoints 方法注释（方法体现有，只调整逻辑）**

当前 `getMapPoints` 仅过滤了有经纬度的记录。保持查询逻辑不变，结果通过 `convertToMapVO` 映射时增加字段填充。

**Step 3: 重写 convertToMapVO 方法**

```java
private StationMapVO convertToMapVO(RsbtStation entity) {
    StationMapVO vo = new StationMapVO();
    vo.setGuid(entity.getGuid());
    vo.setSitename(entity.getSitename());
    vo.setLongitude(entity.getLongitude());
    vo.setLatitude(entity.getLatitude());
    vo.setType(entity.getType());
    vo.setStationtype(entity.getStationtype());
    vo.setProvince(entity.getProvince());

    // 频率字符串拼接：FREQUENCYT - FREQUENCYR MHz
    BigDecimal ft = entity.getFrequencyt();
    BigDecimal fr = entity.getFrequencyr();
    if (ft != null && fr != null) {
        vo.setFrequency(ft.stripTrailingZeros().toPlainString() + "–" 
                      + fr.stripTrailingZeros().toPlainString() + " MHz");
        // 中心频率 = (FREQUENCYT + FREQUENCYR) / 2
        vo.setFreqMHz(ft.add(fr).divide(new BigDecimal("2"), 6, java.math.RoundingMode.HALF_UP));
    } else if (ft != null) {
        vo.setFrequency(ft.stripTrailingZeros().toPlainString() + " MHz");
        vo.setFreqMHz(ft);
    } else if (fr != null) {
        vo.setFrequency(fr.stripTrailingZeros().toPlainString() + " MHz");
        vo.setFreqMHz(fr);
    }

    // 设备相关
    vo.setEquipModel(entity.getDevicemodel());  // 复用 DEVICEMODEL

    // 从新字段获取（字段可能为空）
    // 注意：UNIT 和 EQUIPNAME 已加入 VO 和 DB，这里通过反射或直接字段获取
    // 由于 Entity 也需要同步，先用 entity 的 getter 兼容
    try {
        java.lang.reflect.Method getUnit = entity.getClass().getMethod("getUnit");
        Object unitVal = getUnit.invoke(entity);
        if (unitVal != null) vo.setUnit(unitVal.toString());
    } catch (Exception ignored) {}
    try {
        java.lang.reflect.Method getEquipName = entity.getClass().getMethod("getEquipname");
        Object equipNameVal = getEquipName.invoke(entity);
        if (equipNameVal != null) vo.setEquipName(equipNameVal.toString());
    } catch (Exception ignored) {}

    // 功率
    if (entity.getOutputpower() != null) {
        vo.setPower(entity.getOutputpower().stripTrailingZeros().toPlainString() + " W");
    }

    // 有效期
    if (entity.getExpirationdate() != null) {
        vo.setExpiry(entity.getExpirationdate().toString());
    }

    // 状态计算
    vo.setStatus(computeStatus(entity.getExpirationdate()));

    return vo;
}
```

> **注意：** Entity 也需要增加 `getUnit()` 和 `getEquipname()` 方法反射获取。如果后续 Entity 有直接字段，`convertToMapVO` 可以简化为直接调用 getter。Task 3 会同步扩展 Entity。

**Step 4: 提交**

```bash
git add backend/src/main/java/com/freqmanage/module/station/service/StationService.java
git commit -m "feat(station): compute status from expiration date and populate all map VO fields"
```

---

## Task 3: 扩展 RsbtStation Entity 增加 unit 和 equipName 字段

**Files:**
- Modify: `backend/src/main/java/com/freqmanage/module/station/entity/RsbtStation.java:1-43`

**Step 1: 添加两个新字段到 RsbtStation**

```java
// 在 RsbtStation.java 中添加字段（位置在 devicemodel 之后）
private String unit;        // 设台单位
private String equipname;  // 设备名称 (注意 MySQL 列名为 EQUIPNAME)
// 并添加对应的 getter/setter
```

同时在 `copyProperties` 方法中添加对这两个字段的处理（分别对应 StationCreateDTO 和 StationUpdateDTO 中需要新增的 dto.unit 和 dto.equipname）。

**Step 2: 提交**

```bash
git add backend/src/main/java/com/freqmanage/module/station/entity/RsbtStation.java
git commit -m "feat(station): add unit and equipname fields to RsbtStation entity"
```

---

## Task 4: 创建前端 API 调用层 frontend/src/app/api/station.ts

**Files:**
- Create: `frontend/src/app/api/station.ts`

**Step 1: 编写 station.ts API 模块**

```typescript
// frontend/src/app/api/station.ts
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

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
};

// StationMapVO 对应的前端类型
export interface StationMapVO {
  guid: string;
  sitename: string;
  longitude: number;
  latitude: number;
  type: string;
  stationtype: string;
  frequency: string;     // "1800–1900 MHz"
  freqMHz: number;        // 中心频率数值
  unit: string;           // 设台单位
  equipName: string;      // 设备名称
  equipModel: string;     // 设备型号
  expiry: string;         // "2027-06-30"
  power: string;          // "20 W"
  status: 'normal' | 'expiring' | 'expired';
  province: string;
}

// Station 编辑更新 DTO
export interface StationUpdate {
  type?: string;
  technology?: string;
  stationtype?: string;
  frequencyt?: number;
  frequencyr?: number;
  bandwidth?: number;
  devicemodel?: string;
  outputpower?: number;
  province?: string;
  district?: string;
  location?: string;
  sitename?: string;
  longitude?: number;
  latitude?: number;
  startdate?: string;
  expirationdate?: string;
  unit?: string;
  equipname?: string;
}

export const stationApi = {
  // 获取地图台站列表
  getMapPoints: () => request('/station/map'),

  // 更新台站（用于保存编辑）
  update: (id: string, data: StationUpdate) =>
    request(`/station/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};
```

**Step 2: 提交**

```bash
git add frontend/src/app/api/station.ts
git commit -m "feat(station): add station API module for map data fetching"
```

---

## Task 5: 修改 StationMap.tsx 接入 API 并修复 setBandService bug

**Files:**
- Modify: `frontend/src/app/components/StationMap.tsx:1-718`

前端需要做三件事：
1. 导入 `stationApi` 替代 `INIT_STATIONS`
2. 用 `useEffect` 在组件挂载时调用 `stationApi.getMapPoints()` 获取数据
3. 修复第 430 行的 `setBandService('')` bug（应改为 `setBandId('')`）

**Step 1: 替换 import 和 mock 数据**

```typescript
// 删除 INIT_STATIONS 相关导入和常量（约第 59-102 行）
// 替换为从 API 导入
import { stationApi } from '../api/station';
```

**Step 2: 在组件内替换 stations 初始化逻辑**

将：
```typescript
const [stations, setStations] = useState<Station[]>(INIT_STATIONS);
```

替换为：
```typescript
const [stations, setStations] = useState<Station[]>([]);
const [loading, setLoading] = useState(true);
```

添加 useEffect：
```typescript
useEffect(() => {
  stationApi.getMapPoints().then((data: any[]) => {
    setStations(data);
    setLoading(false);
  }).catch(() => {
    setLoading(false);
  });
}, []);
```

**Step 3: 修复 setBandService bug**

找到 StationMap.tsx 第 430 行：
```typescript
<button onClick={() => { setBandService(''); setBandId(''); }} className="text-xs text-blue-600 hover:underline">Clear</button>
```

改为：
```typescript
<button onClick={() => { setBandId(''); }} className="text-xs text-blue-600 hover:underline">Clear</button>
```

> 注：直接改 `setBandId('')` 即可，因为 `setBandId('')` 已经能正确清除频段筛选条件，而 `setBandService` 函数不存在。

**Step 4: 提交**

```bash
git add frontend/src/app/components/StationMap.tsx
git commit -m "fix(stationmap): connect to real API and fix setBandService undefined bug"
```

---

## Task 6: 扩展 StationCreateDTO 和 StationUpdateDTO 增加 unit 和 equipname 字段

**Files:**
- Modify: `backend/src/main/java/com/freqmanage/module/station/dto/StationCreateDTO.java`
- Modify: `backend/src/main/java/com/freqmanage/module/station/dto/StationUpdateDTO.java`

由于前端编辑面板需要编辑 `unit` 和 `equipname`（设备名称）字段，后端 DTO 需要支持接收这两个字段，数据库层 Task 1 已添加列，Task 3 已扩展 Entity，此处只需扩展 DTO 并在 `copyProperties` 中传递。

**Step 1: 扩展 StationCreateDTO**

```java
// 添加字段
private String unit;
private String equipname;

// 添加 getter/setter (Lombok @Data 已处理)
```

**Step 2: 扩展 StationUpdateDTO**

```java
private String unit;
private String equipname;
```

**Step 3: 在 copyProperties 中添加传递**

在 `if (src instanceof StationCreateDTO)` 分支添加：
```java
target.setUnit(dto.getUnit());
target.setEquipname(dto.getEquipname());
```

在 `if (src instanceof StationUpdateDTO)` 分支添加：
```java
target.setUnit(dto.getUnit());
target.setEquipname(dto.getEquipname());
```

**Step 4: 提交**

```bash
git add backend/src/main/java/com/freqmanage/module/station/dto/StationCreateDTO.java backend/src/main/java/com/freqmanage/module/station/dto/StationUpdateDTO.java
git commit -m "feat(station): add unit and equipname to create/update DTOs"
```

---

## Task 7: 修改 StationController 增加 PUT /api/station/{id} 的同步响应

当前 `StationController.update` 返回 `ApiResponse<Void>`，前端保存后需要知道是否成功。前端 `handleSave` 函数直接操作本地 state，无刷新逻辑，所以后端返回 void 即可，前端已在本地更新 state。但需确保 `update` 方法正确处理 `equipname` 字段透传。

---

## Task 8: 添加前端 API 代理配置确认

确认 nginx.conf 中 `/api/station` 路径已正确代理到后端 8084 端口（已确认，见 nginx.conf 第 38 行）。

确认后端 `StationController` 的 `/api/station/map` 路径可访问：
- GET `/api/station/map` → `StationService.getMapPoints()` → `List<StationMapVO>`
- PUT `/api/station/{id}` → `StationService.update(id, dto)`

---

## 验证步骤

1. 启动后端 Java 服务
2. 启动前端 `pnpm dev`
3. 访问 Station Map 页面，确认地图渲染真实台站数据
4. 点击台站 marker，确认详情面板显示正确数据
5. 编辑台站信息并保存，确认 PUT `/api/station/{id}` 被调用
6. 测试筛选功能（按省份、按频段、按名称搜索）

---

## 执行顺序

1. Task 1 (数据库 + VO) → **2. Task 3 (Entity) → Task 6 (DTO)** → **3. Task 2 (Service)**
   - Task 1 改 VO，Task 3 改 Entity，Task 6 改 DTO，三者可并行开发
4. Task 4 (前端 API) + Task 5 (前端组件) → **顺序可调换**
5. Task 7 (Controller) → **最后确认**

**Plan complete and saved to `docs/superpowers/plans/2026-05-11-station-map.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**

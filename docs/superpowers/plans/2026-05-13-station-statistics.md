# Station Statistics 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 Station Statistics 页面实现后端 API，替换掉硬编码的模拟数据，使区域统计、增长趋势、有效期分析三个模块都能从真实数据库读取数据。

**Architecture:** 前端已有三套 Tab UI（regional/growth/validity），后端需新增两个 Controller 端点和一个 Service，提供按省份+类型聚合的统计数据。数据来源为 `RSBT_STATION` 表，通过 MyBatis-Plus 查询。

**Tech Stack:** Java Spring Boot, MyBatis-Plus, MySQL 8.0

---

### Task 1: 新增 Region Stats API（区域统计饼图 + 柱状图数据）

**Files:**
- Create: `backend/src/main/java/com/freqmanage/module/statistics/vo/StationRegionDetailVO.java`
- Modify: `backend/src/main/java/com/freqmanage/module/statistics/controller/StatisticsController.java`
- Modify: `backend/src/main/java/com/freqmanage/module/statistics/service/StatisticsService.java`

**Context:** 前端 `regionalData` 包含5个地区（Ulaanbaatar、Dornogovi、Central、Selenge、Khentii），每个地区有 mobile/broadcast/fixed/satellite/other 五种类型计数。需提供类似的聚合结构。

- [ ] **Step 1: 创建 StationRegionDetailVO**

路径: `backend/src/main/java/com/freqmanage/module/statistics/vo/StationRegionDetailVO.java`

```java
package com.freqmanage.module.statistics.vo;

import lombok.Data;
import java.util.Map;

@Data
public class StationRegionDetailVO {
    private String region;           // 省份名
    private Long mobile;
    private Long broadcast;
    private Long fixed;
    private Long satellite;
    private Long other;
    private Long total;

    public static StationRegionDetailVO from(String region, Map<String, Long> typeCountMap) {
        StationRegionDetailVO vo = new StationRegionDetailVO();
        vo.setRegion(region);
        vo.setMobile(typeCountMap.getOrDefault("Mobile", 0L));
        vo.setBroadcast(typeCountMap.getOrDefault("Broadcasting", 0L));
        vo.setFixed(typeCountMap.getOrDefault("Fixed", 0L));
        vo.setSatellite(typeCountMap.getOrDefault("Satellite", 0L));
        vo.setOther(typeCountMap.getOrDefault("Other", 0L));
        vo.setTotal(vo.getMobile() + vo.getBroadcast() + vo.getFixed()
                  + vo.getSatellite() + vo.getOther());
        return vo;
    }
}
```

- [ ] **Step 2: 在 StatisticsService 添加 getRegionStats 方法**

在 `StatisticsService.java` 第176行后添加方法：

```java
public List<StationRegionDetailVO> getRegionStats() {
    LambdaQueryWrapper<RsbtStation> wrapper = new LambdaQueryWrapper<>();
    wrapper.select(RsbtStation::getProvince, RsbtStation::getStationtype);
    List<RsbtStation> stations = stationMapper.selectList(wrapper);

    // 按 province 分组
    Map<String, List<RsbtStation>> byProvince = stations.stream()
            .filter(s -> s.getProvince() != null && !s.getProvince().isEmpty())
            .collect(Collectors.groupingBy(RsbtStation::getProvince));

    return byProvince.entrySet().stream()
            .map(entry -> {
                Map<String, Long> typeCountMap = entry.getValue().stream()
                        .filter(s -> s.getStationtype() != null && !s.getStationtype().isEmpty())
                        .collect(Collectors.groupingBy(
                                s -> s.getStationtype(),
                                Collectors.counting()));
                return StationRegionDetailVO.from(entry.getKey(), typeCountMap);
            })
            .sorted(Comparator.comparingLong(StationRegionDetailVO::getTotal).reversed())
            .collect(Collectors.toList());
}
```

注意：`StationRegionDetailVO` 需要 import，在文件顶部已有：
`import com.freqmanage.module.statistics.vo.StationRegionDetailVO;`

- [ ] **Step 3: 在 StatisticsController 添加端点**

在 `StatisticsController.java` 第62行后添加：

```java
@GetMapping("/station/region-detail")
public ApiResponse<List<StationRegionDetailVO>> stationRegionDetail() {
    return ApiResponse.ok(statisticsService.getRegionStats());
}
```

- [ ] **Step 4: 编译验证**

Run: `cd backend && mvn compile -q`
Expected: BUILD SUCCESS（无输出表示成功）

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/freqmanage/module/statistics/vo/StationRegionDetailVO.java backend/src/main/java/com/freqmanage/module/statistics/service/StatisticsService.java backend/src/main/java/com/freqmanage/module/statistics/controller/StatisticsController.java
git commit -m "feat(statistics): add station region detail API for regional tab"
```

---

### Task 2: 新增 Growth Trend API（增长趋势月同比/月环比数据）

**Files:**
- Create: `backend/src/main/java/com/freqmanage/module/statistics/vo/MonthlyGrowthVO.java`
- Modify: `backend/src/main/java/com/freqmanage/module/statistics/service/StatisticsService.java`
- Modify: `backend/src/main/java/com/freqmanage/module/statistics/controller/StatisticsController.java`

- [ ] **Step 1: 创建 MonthlyGrowthVO**

路径: `backend/src/main/java/com/freqmanage/module/statistics/vo/MonthlyGrowthVO.java`

```java
package com.freqmanage.module.statistics.vo;

import lombok.Data;

@Data
public class MonthlyGrowthVO {
    private String month;          // "Jan", "Feb"...
    private Long current;          // 当前年份该月总数
    private Long previous;         // 去年同月总数
    private Long growthCount;      // 同比增长数量
    private Double growthPercent;  // 同比增长百分比
    private Long momCount;         // 环比增长数量
    private Double momPercent;     // 环比增长百分比
}
```

- [ ] **Step 2: 创建 GrowthQueryDTO 接收筛选参数**

路径: `backend/src/main/java/com/freqmanage/module/statistics/dto/GrowthQueryDTO.java`

```java
package com.freqmanage.module.statistics.dto;

import lombok.Data;

@Data
public class GrowthQueryDTO {
    private String type = "All";       // 站型筛选
    private Integer year;             // 年份
    private String province = "All";   // 省份筛选

    public Integer resolveYear() {
        return year != null ? year : java.time.LocalDate.now().getYear();
    }
}
```

- [ ] **Step 3: 在 StatisticsService 添加 getGrowthTrend 方法**

在 `StatisticsService.java` 中添加：

```java
public List<MonthlyGrowthVO> getGrowthTrend(String type, Integer year, String province) {
    int targetYear = year != null ? year : LocalDate.now().getYear();
    List<MonthlyGrowthVO> result = new ArrayList<>();

    for (int month = 1; month <= 12; month++) {
        // 当年当月计数
        Long current = countStations(targetYear, month, type, province);
        // 去年同月计数
        Long previous = countStations(targetYear - 1, month, type, province);
        // 上月计数（用于环比）
        Long lastMonth = month > 1 ? countStations(targetYear, month - 1, type, province) : 0L;

        long growthCountVal = current - previous;
        double growthPercentVal = previous > 0 ? (growthCountVal * 100.0 / previous) : 0.0;
        long momCountVal = current - lastMonth;
        double momPercentVal = lastMonth > 0 ? (momCountVal * 100.0 / lastMonth) : 0.0;

        MonthlyGrowthVO vo = new MonthlyGrowthVO();
        vo.setMonth(new java.text.SimpleDateFormat("MMM", java.util.Locale.ENGLISH)
                        .format(new java.util.Date(targetYear - 1900, month - 1, 1)));
        vo.setCurrent(current);
        vo.setPrevious(previous);
        vo.setGrowthCount(growthCountVal);
        vo.setGrowthPercent(Math.round(growthPercentVal * 10) / 10.0);
        vo.setMomCount(momCountVal);
        vo.setMomPercent(Math.round(momPercentVal * 10) / 10.0);
        result.add(vo);
    }
    return result;
}

private Long countStations(Integer year, Integer month, String type, String province) {
    LambdaQueryWrapper<RsbtStation> wrapper = new LambdaQueryWrapper<>();
    wrapper.apply(year != null && month != null,
            "YEAR({0}) = {1} AND MONTH({0}) = {2}",
            RsbtStation::getStartdate, year, month);
    if (!"All".equals(type) && type != null && !type.isEmpty()) {
        wrapper.eq(RsbtStation::getStationtype, type);
    }
    if (!"All".equals(province) && province != null && !province.isEmpty()) {
        wrapper.eq(RsbtStation::getProvince, province);
    }
    return stationMapper.selectCount(wrapper);
}
```

- [ ] **Step 4: 在 StatisticsController 添加端点**

```java
@GetMapping("/station/growth-trend")
public ApiResponse<List<MonthlyGrowthVO>> stationGrowthTrend(
        @RequestParam(required = false, defaultValue = "All") String type,
        @RequestParam(required = false) Integer year,
        @RequestParam(required = false, defaultValue = "All") String province) {
    return ApiResponse.ok(statisticsService.getGrowthTrend(type, year, province));
}
```

- [ ] **Step 5: 添加 GrowthQueryDTO 的 import**

在 `StatisticsController.java` 顶部添加：
`import com.freqmanage.module.statistics.dto.GrowthQueryDTO;`

- [ ] **Step 6: 编译验证**

Run: `cd backend && mvn compile -q`
Expected: BUILD SUCCESS

- [ ] **Step 7: Commit**

```bash
git add backend/src/main/java/com/freqmanage/module/statistics/vo/MonthlyGrowthVO.java backend/src/main/java/com/freqmanage/module/statistics/dto/GrowthQueryDTO.java backend/src/main/java/com/freqmanage/module/statistics/service/StatisticsService.java backend/src/main/java/com/freqmanage/module/statistics/controller/StatisticsController.java
git commit -m "feat(statistics): add station growth trend API with YoY and MoM metrics"
```

---

### Task 3: 新增 Validity Period API（有效期分析即将过期站点列表）

**Files:**
- Create: `backend/src/main/java/com/freqmanage/module/statistics/vo/ExpiredStationVO.java`
- Modify: `backend/src/main/java/com/freqmanage/module/statistics/service/StatisticsService.java`
- Modify: `backend/src/main/java/com/freqmanage/module/statistics/controller/StatisticsController.java`

- [ ] **Step 1: 创建 ExpiredStationVO**

路径: `backend/src/main/java/com/freqmanage/module/statistics/vo/ExpiredStationVO.java`

```java
package com.freqmanage.module.statistics.vo;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ExpiredStationVO {
    private String guid;
    private String name;           // sitename
    private String province;
    private String type;           // stationtype
    private Integer month;         // 过期月份（1-12）
    private Integer expiredCount;  // 该月过期数量（固定为1，因为每条记录是一个站）
    private String expireDate;    // expirationdate 字符串
    private String technicalStandard;  // technology
    private String bandwidthProcessingUnitModel;  // bbumodel
    private String ownerName;      // unit（设台单位）
    private String backhaulNetworkAccessMethod;  // backbone
    private String stationPurpose; // stationpurpose
    private String modulationType; // modulation
    private String stationType;    // stationtype
    private String transmitFrequency;  // frequencyt + " MHz"
    private String receiveFrequency;  // frequencyr + " MHz"
    private String bandwidth;     // bandwidth
    private String equipmentNameAndModel;  // devicemodel
    private String equipmentCount;  // devicequantity
    private String equipmentPower;  // outputpower + " W"
    private String antennaType;    // anttype
    private String antennaCount;  // antquantity
    private String region;        // province
    private String detailedLocation;  // location
    private String longitude;    // longitude
    private String latitude;      // latitude
    private String openDate;      // startdate
}
```

- [ ] **Step 2: 在 StatisticsService 添加 getExpiredStations 方法**

```java
public List<ExpiredStationVO> getExpiredStations(Integer year, String province, String type) {
    int targetYear = year != null ? year : LocalDate.now().getYear();
    LambdaQueryWrapper<RsbtStation> wrapper = new LambdaQueryWrapper<>();
    wrapper.eq(RsbtStation::getDeleted, 0);

    if (!"All".equals(province) && province != null && !province.isEmpty()) {
        wrapper.eq(RsbtStation::getProvince, province);
    }
    if (!"All".equals(type) && type != null && !type.isEmpty()) {
        wrapper.eq(RsbtStation::getStationtype, type);
    }

    List<RsbtStation> stations = stationMapper.selectList(wrapper);

    return stations.stream()
            .filter(s -> s.getExpirationdate() != null
                    && s.getExpirationdate().getYear() == targetYear)
            .filter(s -> s.getExpirationdate().isBefore(LocalDate.now().plusMonths(3))
                    || s.getExpirationdate().isBefore(LocalDate.now()))
            .map(s -> convertToExpiredVO(s))
            .sorted(Comparator.comparing(ExpiredStationVO::getMonth))
            .collect(Collectors.toList());
}

private ExpiredStationVO convertToExpiredVO(RsbtStation s) {
    ExpiredStationVO vo = new ExpiredStationVO();
    vo.setGuid(s.getGuid());
    vo.setName(s.getSitename());
    vo.setProvince(s.getProvince());
    vo.setType(s.getStationtype());
    vo.setExpiredCount(1);
    vo.setExpireDate(s.getExpirationdate() != null ? s.getExpirationdate().toString() : "");
    vo.setTechnicalStandard(s.getTechnology());
    vo.setBandwidthProcessingUnitModel(s.getBbumodel());
    vo.setOwnerName(s.getUnit());
    vo.setBackhaulNetworkAccessMethod(s.getBackbone());
    vo.setStationPurpose(s.getStationpurpose());
    vo.setModulationType(s.getModulation());
    vo.setStationType(s.getStationtype());
    if (s.getFrequencyt() != null) {
        vo.setTransmitFrequency(s.getFrequencyt().stripTrailingZeros().toPlainString() + " MHz");
    }
    if (s.getFrequencyr() != null) {
        vo.setReceiveFrequency(s.getFrequencyr().stripTrailingZeros().toPlainString() + " MHz");
    }
    if (s.getBandwidth() != null) {
        vo.setBandwidth(s.getBandwidth().stripTrailingZeros().toPlainString() + " MHz");
    }
    vo.setEquipmentNameAndModel(s.getDevicemodel());
    if (s.getDevicequantity() != null) {
        vo.setEquipmentCount(String.valueOf(s.getDevicequantity()));
    }
    if (s.getOutputpower() != null) {
        vo.setEquipmentPower(s.getOutputpower().stripTrailingZeros().toPlainString() + " W");
    }
    vo.setAntennaType(s.getAnttype());
    if (s.getAntquantity() != null) {
        vo.setAntennaCount(String.valueOf(s.getAntquantity()));
    }
    vo.setRegion(s.getProvince());
    vo.setDetailedLocation(s.getLocation());
    vo.setLongitude(s.getLongitude() != null ? s.getLongitude().stripTrailingZeros().toPlainString() : "");
    vo.setLatitude(s.getLatitude() != null ? s.getLatitude().stripTrailingZeros().toPlainString() : "");
    vo.setOpenDate(s.getStartdate() != null ? s.getStartdate().toString() : "");
    if (s.getExpirationdate() != null) {
        vo.setMonth(s.getExpirationdate().getMonthValue());
    }
    return vo;
}
```

- [ ] **Step 3: 在 StatisticsController 添加端点**

```java
@GetMapping("/station/expired-detail")
public ApiResponse<List<ExpiredStationVO>> expiredStationDetail(
        @RequestParam(required = false) Integer year,
        @RequestParam(required = false, defaultValue = "All") String province,
        @RequestParam(required = false, defaultValue = "All") String type) {
    return ApiResponse.ok(statisticsService.getExpiredStations(year, province, type));
}
```

- [ ] **Step 4: 编译验证**

Run: `cd backend && mvn compile -q`
Expected: BUILD SUCCESS

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/freqmanage/module/statistics/vo/ExpiredStationVO.java backend/src/main/java/com/freqmanage/module/statistics/service/StatisticsService.java backend/src/main/java/com/freqmanage/module/statistics/controller/StatisticsController.java
git commit -m "feat(statistics): add station expired detail API for validity tab"
```

---

### Task 4: 前端对接（替换硬编码数据为 API 调用）

**Files:**
- Modify: `frontend/src/app/components/StationStats.tsx`

前端目前使用硬编码数据（regionalData、stationRecords、validityStations），需要改为调用后端 API。

- [ ] **Step 1: 添加 API 接口调用**

在 StationStats.tsx 顶部添加：

```typescript
const API_BASE = '/api';

async function fetchRegionStats() {
  const res = await fetch(`${API_BASE}/statistics/station/region-detail`);
  const json = await res.json();
  return json.data || [];
}

async function fetchGrowthTrend(type: string, year: number, province: string) {
  const params = new URLSearchParams({ type, year: String(year), province });
  const res = await fetch(`${API_BASE}/statistics/station/growth-trend?${params}`);
  const json = await res.json();
  return json.data || [];
}

async function fetchExpiredStations(year: number, province: string, type: string) {
  const params = new URLSearchParams({ year: String(year), province, type });
  const res = await fetch(`${API_BASE}/statistics/station/expired-detail?${params}`);
  const json = await res.json();
  return json.data || [];
}
```

- [ ] **Step 2: 使用 useEffect 加载数据**

在组件内添加状态和 effect：

```typescript
const [regionStats, setRegionStats] = useState<any[]>([]);
const [growthData, setGrowthData] = useState<any[]>([]);
const [expiredData, setExpiredData] = useState<any[]>([]);

useEffect(() => {
  if (analysisType === 'regional') {
    fetchRegionStats().then(setRegionStats).catch(console.error);
  } else if (analysisType === 'growth') {
    fetchGrowthTrend(selectedGrowthType, selectedGrowthYear, selectedGrowthProvince)
      .then(setGrowthData).catch(console.error);
  } else if (analysisType === 'validity') {
    fetchExpiredStations(selectedValidityYear, selectedValidityProvince, selectedValidityType)
      .then(setExpiredData).catch(console.error);
  }
}, [analysisType, selectedGrowthType, selectedGrowthYear, selectedGrowthProvince,
    selectedValidityYear, selectedValidityProvince, selectedValidityType]);
```

- [ ] **Step 3: 替换 regional 视图数据源**

将 `regionalData` 的引用替换为 `regionStats`。由于 API 返回的字段名可能不同，需要映射：
- API 返回: `{ region, mobile, broadcast, fixed, satellite, other, total }`
- 前端使用: `{ region, mobile, broadcast, fixed, satellite, other }`（无 total，computed）
- 在模板中使用 `regionStats` 替代 `regionalData`

注意：`region` 字段名保持一致，类型字段需确认（API 使用 stationtype 映射为 Mobile/Broadcasting/Fixed/Satellite/Other）。

- [ ] **Step 4: 替换 growth 视图数据源**

将 `yoyGrowthData` 和 `momGrowthData` 的计算改用 API 数据。前端现有 `monthlyTotals`、`previousYearTotals` 等 useMemo 可保持不变，但数据源改为 `growthData`。

由于 API 已返回 growthCount/growthPercent/momCount/momPercent，直接使用：
```typescript
const yoyGrowthData = growthData.map(item => ({
  month: item.month,
  current: item.current,
  previous: item.previous,
  growthCount: item.growthCount,
  growthPercent: item.growthPercent,
}));
const momGrowthData = growthData.map(item => ({
  month: item.month,
  current: item.current,
  previous: item.previous,
  growthCount: item.momCount,
  growthPercent: item.momPercent,
}));
```

- [ ] **Step 5: 替换 validity 视图数据源**

将 `validityStations` 替换为 `expiredData`。由于 API 返回的是完整的过期站点列表（已按 month 排序），前端筛选逻辑可简化为：
```typescript
const selectedMonthStations = selectedExpiredMonth
  ? expiredData.filter(item => item.month === selectedExpiredMonth)
  : expiredData;
```

- [ ] **Step 6: 验证构建**

Run: `cd frontend && pnpm build`
Expected: 无编译错误

- [ ] **Step 7: Commit**

```bash
git add frontend/src/app/components/StationStats.tsx
git commit -m "feat(frontend): wire StationStats to real API endpoints"
```

---

### Task 5: 验证与测试

- [ ] **Step 1: 启动后端并验证 API**

Backend 重启后，验证各端点返回正确 JSON：

```bash
# 区域统计
curl http://localhost:8080/api/statistics/station/region-detail

# 增长趋势（带筛选参数）
curl "http://localhost:8080/api/statistics/station/growth-trend?type=Mobile&year=2026&province=All"

# 过期站点
curl "http://localhost:8080/api/statistics/station/expired-detail?year=2026&province=All&type=All"
```

Expected: 返回 JSON 数组，数据来源于真实数据库。

- [ ] **Step 2: 前端功能测试**

在浏览器中打开 Station Statistics 页面：
1. Regional Tab：验证饼图、柱状图、表格显示真实数据
2. Growth Tab：切换筛选条件，验证图表数据变化
3. Validity Tab：验证过期站点列表和详情弹窗

---

## Self-Review Checklist

**1. Spec coverage:** 前端 StationStats.tsx 三个 Tab（regional/growth/validity）所需数据均有对应 API 覆盖：
- regional → `/station/region-detail`
- growth → `/station/growth-trend`（返回 YoY + MoM）
- validity → `/station/expired-detail`

**2. Placeholder scan:** 无 "TBD"、"TODO"、"implement later" 等占位符。每个方法均有完整实现代码。

**3. Type consistency:**
- `StationRegionDetailVO`: region/mobile/broadcast/fixed/satellite/other/total
- `MonthlyGrowthVO`: month/current/previous/growthCount/growthPercent/momCount/momPercent
- `ExpiredStationVO`: guid/name/province/type/month/expiredCount/expireDate + 完整技术字段

字段名与前端 StationStats.tsx 中的使用一致（province/type/sitename/stationtype 等）。

**4. API 设计一致性:** 所有端点均返回 `ApiResponse<T>` 包装，遵循现有 `StatisticsController` 模式。

---

**Plan complete and saved to `docs/superpowers/plans/2026-05-13-station-statistics.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
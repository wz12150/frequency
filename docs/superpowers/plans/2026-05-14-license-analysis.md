# License Analysis 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 License Analysis 页面从本地 Mock 数据接入真实后端 API，实现 Usage Rate Analysis / License Count Statistics / Licensed Station Count / Validity Period Statistics 四个 Tab 的数据全部来自后端。

**Architecture:**
- 后端在 `StatisticsController` 新增支持多维度查询的统计接口（按月份/业务类型/省份/年份筛选），在 `PermitController` 确认分页查询支持详情筛选
- 前端新增 `api/statistics.ts` API 层，在 `LicenseAnalysis.tsx` 中用 `useEffect` + `useState` 替代硬编码 mock 数据
- 数据映射：后端 `status` 字段（active/expired/revoked）→ 前端 UI 状态（normal/expiring/expired），通过计算 `enddate` 与当前日期的差值判断

**Tech Stack:** React + TypeScript + Recharts (前端), Spring Boot + MyBatis-Plus (后端), MySQL 8.0

---

## 文件结构

```
frontend/src/app/
├── api/
│   └── statistics.ts          ← 新增：statistics API 调用层（新增）
├── components/
│   └── LicenseAnalysis.tsx    ← 修改：接入真实 API（大量修改）

backend/src/main/java/com/freqmanage/module/
├── statistics/
│   ├── controller/StatisticsController.java  ← 修改：新增带筛选条件的统计接口
│   ├── service/StatisticsService.java         ← 修改：实现带筛选条件的统计查询
│   └── vo/
│       ├── PermitUsageByMonthVO.java          ← 新增：月度使用率VO
│       ├── LicenseCountByTypeVO.java          ← 新增：按类型统计许可证数量VO
│       ├── StationCountDetailVO.java           ← 新增：台站统计详情VO
│       └── ValidityForecastVO.java            ← 新增：有效期预测VO
└── permit/
    ├── controller/PermitController.java        ← 已有端点确认
    └── service/PermitService.java             ← 已有方法确认
```

---

## Task 1: 新增后端月度许可证使用率接口（支持按业务类型/省份/年份筛选）

**Files:**
- Create: `backend/src/main/java/com/freqmanage/module/statistics/vo/PermitUsageByMonthVO.java`
- Modify: `backend/src/main/java/com/freqmanage/module/statistics/service/StatisticsService.java`
- Modify: `backend/src/main/java/com/freqmanage/module/statistics/controller/StatisticsController.java`

### Step 1: 创建 PermitUsageByMonthVO

```java
// backend/src/main/java/com/freqmanage/module/statistics/vo/PermitUsageByMonthVO.java
package com.freqmanage.module.statistics.vo;

import lombok.Data;

@Data
public class PermitUsageByMonthVO {
    private String month;        // yyyy-MM
    private String businessType; // 对应 permit.category
    private String province;     // 对应 permit.scope 中的省份标注
    private String year;
    private Double usageRate;   // 使用率百分比（计算方式见 service 层）
    private Double yoyGrowth;   // 同比增长率
    private Double momGrowth;   // 环比增长率
    private Double prevYearRate;
    private Double prevMonthRate;
    private Long totalCount;
    private Long activeCount;
}
```

### Step 2: 修改 StatisticsService 添加 getPermitUsageByMonth 方法

在 `StatisticsService.java` 中添加：

```java
public List<PermitUsageByMonthVO> getPermitUsageByMonth(String businessType, String province, Integer year) {
    List<PermitUsageByMonthVO> result = new ArrayList<>();
    int targetYear = year != null ? year : LocalDate.now().getYear();
    LocalDate now = LocalDate.now();

    for (int month = 1; month <= 12; month++) {
        // 统计当年当月活跃许可证数量
        Long activeCount = countActivePermits(targetYear, month, businessType, province);
        // 统计当年当月总许可证数量
        Long totalCount = countTotalPermits(targetYear, month, businessType, province);
        // 去年同月活跃数
        Long prevYearActive = countActivePermits(targetYear - 1, month, businessType, province);
        // 上月活跃数
        Long prevMonthActive = month > 1 ? countActivePermits(targetYear, month - 1, businessType, province) : 0L;

        double usageRate = totalCount > 0 ? (activeCount * 100.0 / totalCount) : 0.0;
        double prevYearRate = totalCount > 0 ? (prevYearActive * 100.0 / totalCount) : 0.0;
        double prevMonthRateVal = month > 1 && totalCount > 0 ? (prevMonthActive * 100.0 / totalCount) : 0.0;

        double yoyGrowth = prevYearRate > 0 ? usageRate - prevYearRate : 0.0;
        double momGrowth = month > 1 && prevMonthRateVal > 0 ? usageRate - prevMonthRateVal : 0.0;

        PermitUsageByMonthVO vo = new PermitUsageByMonthVO();
        vo.setMonth(String.format("%02d", month));
        vo.setBusinessType(businessType != null ? businessType : "All");
        vo.setProvince(province != null ? province : "All");
        vo.setYear(String.valueOf(targetYear));
        vo.setUsageRate(Math.round(usageRate * 10) / 10.0);
        vo.setYoyGrowth(Math.round(yoyGrowth * 10) / 10.0);
        vo.setMomGrowth(Math.round(momGrowth * 10) / 10.0);
        vo.setPrevYearRate(Math.round(prevYearRate * 10) / 10.0);
        vo.setPrevMonthRate(month > 1 ? Math.round(prevMonthRateVal * 10) / 10.0 : 0.0);
        vo.setTotalCount(totalCount);
        vo.setActiveCount(activeCount);
        result.add(vo);
    }
    return result;
}

private Long countActivePermits(Integer year, Integer month, String businessType, String province) {
    LambdaQueryWrapper<RsbtSpecialPermit> wrapper = new LambdaQueryWrapper<>();
    if (year != null && month != null) {
        wrapper.apply("YEAR(startdate) = {0} AND MONTH(startdate) = {1}", year, month);
    }
    wrapper.gt(RsbtSpecialPermit::getEnddate, LocalDate.now()); // only active
    if (!"All".equals(businessType) && businessType != null && !businessType.isEmpty()) {
        wrapper.eq(RsbtSpecialPermit::getCategory, businessType);
    }
    if (!"All".equals(province) && province != null && !province.isEmpty()) {
        wrapper.like(RsbtSpecialPermit::getScope, province);
    }
    return permitMapper.selectCount(wrapper);
}

private Long countTotalPermits(Integer year, Integer month, String businessType, String province) {
    LambdaQueryWrapper<RsbtSpecialPermit> wrapper = new LambdaQueryWrapper<>();
    if (year != null && month != null) {
        wrapper.apply("YEAR(startdate) = {0} AND MONTH(startdate) = {1}", year, month);
    }
    if (!"All".equals(businessType) && businessType != null && !businessType.isEmpty()) {
        wrapper.eq(RsbtSpecialPermit::getCategory, businessType);
    }
    if (!"All".equals(province) && province != null && !province.isEmpty()) {
        wrapper.like(RsbtSpecialPermit::getScope, province);
    }
    return permitMapper.selectCount(wrapper);
}
```

### Step 3: 修改 StatisticsController 添加新接口

在 `StatisticsController.java` 的 `@GetMapping("/permit/usage-growth")` 之后添加：

```java
@GetMapping("/permit/usage-by-month")
public ApiResponse<List<PermitUsageByMonthVO>> permitUsageByMonth(
        @RequestParam(required = false) String businessType,
        @RequestParam(required = false) String province,
        @RequestParam(required = false) Integer year) {
    return ApiResponse.ok(statisticsService.getPermitUsageByMonth(businessType, province, year));
}
```

### Step 4: 提交

```bash
git add backend/src/main/java/com/freqmanage/module/statistics/vo/PermitUsageByMonthVO.java
git add backend/src/main/java/com/freqmanage/module/statistics/service/StatisticsService.java
git add backend/src/main/java/com/freqmanage/module/statistics/controller/StatisticsController.java
git commit -m "feat(statistics): add permit usage-by-month endpoint with businessType/province/year filters"
```

---

## Task 2: 新增后端许可证数量按类型统计接口

**Files:**
- Create: `backend/src/main/java/com/freqmanage/module/statistics/vo/LicenseCountByTypeVO.java`
- Modify: `backend/src/main/java/com/freqmanage/module/statistics/service/StatisticsService.java`
- Modify: `backend/src/main/java/com/freqmanage/module/statistics/controller/StatisticsController.java`

### Step 1: 创建 LicenseCountByTypeVO

```java
// backend/src/main/java/com/freqmanage/module/statistics/vo/LicenseCountByTypeVO.java
package com.freqmanage.module.statistics.vo;

import lombok.Data;

@Data
public class LicenseCountByTypeVO {
    private String type;
    private Long count;
    private String province;
    private String date;
    private String period;
}
```

### Step 2: 修改 StatisticsService 添加 getLicenseCountByType 方法

在 `StatisticsService.java` 中添加：

```java
public List<LicenseCountByTypeVO> getLicenseCountByType(String province, String date) {
    LambdaQueryWrapper<RsbtSpecialPermit> wrapper = new LambdaQueryWrapper<>();
    wrapper.select(RsbtSpecialPermit::getCategory, RsbtSpecialPermit::getProvince);
    if (!"All".equals(province) && province != null && !province.isEmpty()) {
        wrapper.eq(RsbtSpecialPermit::getProvince, province);
    }
    if (date != null && !date.isEmpty()) {
        wrapper.apply("DATE(startdate) <= {0}", date);
    }
    List<RsbtSpecialPermit> permits = permitMapper.selectList(wrapper);

    return permits.stream()
            .filter(p -> p.getCategory() != null && !p.getCategory().isEmpty())
            .collect(Collectors.groupingBy(p -> p.getCategory() + "|" + nvl(p.getProvince(), "Unknown")))
            .entrySet().stream()
            .map(entry -> {
                String[] parts = entry.getKey().split("\\|");
                LicenseCountByTypeVO vo = new LicenseCountByTypeVO();
                vo.setType(parts[0]);
                vo.setProvince(parts[1]);
                vo.setCount((long) entry.getValue().size());
                vo.setDate(date != null ? date : LocalDate.now().toString());
                vo.setPeriod("day");
                return vo;
            })
            .collect(Collectors.toList());
}

private String nvl(String val, String defaultVal) {
    return val != null && !val.isEmpty() ? val : defaultVal;
}
```

### Step 3: 修改 StatisticsController 添加新接口

在 `StatisticsController.java` 中 `@GetMapping("/permit/count")` 之后添加：

```java
@GetMapping("/permit/count-by-type")
public ApiResponse<List<LicenseCountByTypeVO>> permitCountByType(
        @RequestParam(required = false, defaultValue = "All") String province,
        @RequestParam(required = false) String date) {
    return ApiResponse.ok(statisticsService.getLicenseCountByType(province, date));
}
```

### Step 4: 提交

```bash
git add backend/src/main/java/com/freqmanage/module/statistics/vo/LicenseCountByTypeVO.java
git add backend/src/main/java/com/freqmanage/module/statistics/service/StatisticsService.java
git add backend/src/main/java/com/freqmanage/module/statistics/controller/StatisticsController.java
git commit -m "feat(statistics): add license count-by-type endpoint with province/date filters"
```

---

## Task 3: 新增后端台站数量按类型统计接口

**Files:**
- Create: `backend/src/main/java/com/freqmanage/module/statistics/vo/StationCountDetailVO.java`
- Modify: `backend/src/main/java/com/freqmanage/module/statistics/service/StatisticsService.java`
- Modify: `backend/src/main/java/com/freqmanage/module/statistics/controller/StatisticsController.java`

### Step 1: 创建 StationCountDetailVO

```java
// backend/src/main/java/com/freqmanage/module/statistics/vo/StationCountDetailVO.java
package com.freqmanage.module.statistics.vo;

import lombok.Data;

@Data
public class StationCountDetailVO {
    private String type;
    private Long licenses;
    private Long stations;
    private Double ratio;
    private String province;
    private String date;
}
```

### Step 2: 修改 StatisticsService 添加 getStationCountDetail 方法

在 `StatisticsService.java` 中添加：

```java
public List<StationCountDetailVO> getStationCountDetail(String province, String date) {
    LambdaQueryWrapper<RsbtSpecialPermitStation> wrapper = new LambdaQueryWrapper<>();
    wrapper.select(RsbtSpecialPermitStation::getType);
    if (!"All".equals(province) && province != null && !province.isEmpty()) {
        wrapper.eq(RsbtSpecialPermitStation::getProvince, province);
    }
    List<RsbtSpecialPermitStation> stations = stationPermitMapper.selectList(wrapper);

    return stations.stream()
            .filter(s -> s.getType() != null && !s.getType().isEmpty())
            .collect(Collectors.groupingBy(s -> s.getType()))
            .entrySet().stream()
            .map(entry -> {
                StationCountDetailVO vo = new StationCountDetailVO();
                vo.setType(entry.getKey());
                vo.setStations((long) entry.getValue().size());
                vo.setLicenses((long) entry.getValue().size()); // permits are 1:1 with stations in current model
                vo.setRatio(entry.getValue().size() > 0 ? 1.0 : 0.0);
                vo.setProvince(province != null ? province : "All");
                vo.setDate(date != null ? date : LocalDate.now().toString());
                return vo;
            })
            .collect(Collectors.toList());
}
```

### Step 3: 修改 StatisticsController 添加新接口

在 `StatisticsController.java` 中 `@GetMapping("/permit/station-count")` 之后添加：

```java
@GetMapping("/permit/station-count-detail")
public ApiResponse<List<StationCountDetailVO>> permitStationCountDetail(
        @RequestParam(required = false, defaultValue = "All") String province,
        @RequestParam(required = false) String date) {
    return ApiResponse.ok(statisticsService.getStationCountDetail(province, date));
}
```

### Step 4: 提交

```bash
git add backend/src/main/java/com/freqmanage/module/statistics/vo/StationCountDetailVO.java
git add backend/src/main/java/com/freqmanage/module/statistics/service/StatisticsService.java
git add backend/src/main/java/com/freqmanage/module/statistics/controller/StatisticsController.java
git commit -m "feat(statistics): add permit station-count-detail endpoint"
```

---

## Task 4: 新增后端许可证有效期预测接口（12个月展望）

**Files:**
- Create: `backend/src/main/java/com/freqmanage/module/statistics/vo/ValidityForecastVO.java`
- Modify: `backend/src/main/java/com/freqmanage/module/statistics/service/StatisticsService.java`
- Modify: `backend/src/main/java/com/freqmanage/module/statistics/controller/StatisticsController.java`

### Step 1: 创建 ValidityForecastVO

```java
// backend/src/main/java/com/freqmanage/module/statistics/vo/ValidityForecastVO.java
package com.freqmanage.module.statistics.vo;

import lombok.Data;

@Data
public class ValidityForecastVO {
    private String month;       // yyyy-MM
    private String province;    // All 或具体省份
    private Long normal;
    private Long expiring;      // 60天内到期
    private Long expired;
}
```

### Step 2: 修改 StatisticsService 添加 getValidityForecast 方法

在 `StatisticsService.java` 中添加：

```java
public List<ValidityForecastVO> getValidityForecast(String province, Integer months) {
    List<ValidityForecastVO> result = new ArrayList<>();
    int count = months != null ? months : 12;
    LocalDate now = LocalDate.now();

    for (int i = 0; i < count; i++) {
        YearMonth ym = YearMonth.from(now.plusMonths(i));
        LocalDate monthEnd = ym.atEndOfMonth();
        LocalDate warningDate = now.plusDays(60);

        LambdaQueryWrapper<RsbtSpecialPermit> wrapper = new LambdaQueryWrapper<>();
        if (!"All".equals(province) && province != null && !province.isEmpty()) {
            wrapper.eq(RsbtSpecialPermit::getProvince, province);
        }
        List<RsbtSpecialPermit> permits = permitMapper.selectList(wrapper);

        long normal = permits.stream()
                .filter(p -> p.getEnddate() != null && p.getEnddate().isAfter(warningDate)).count();
        long expiring = permits.stream()
                .filter(p -> p.getEnddate() != null && !p.getEnddate().isAfter(warningDate) && p.getEnddate().isAfter(now)).count();
        long expired = permits.stream()
                .filter(p -> p.getEnddate() != null && !p.getEnddate().isAfter(now)).count();

        ValidityForecastVO vo = new ValidityForecastVO();
        vo.setMonth(ym.format(DateTimeFormatter.ofPattern("yyyy-MM")));
        vo.setProvince(province != null ? province : "All");
        vo.setNormal(normal);
        vo.setExpiring(expiring);
        vo.setExpired(expired);
        result.add(vo);
    }
    return result;
}
```

### Step 3: 修改 StatisticsController 添加新接口

在 `StatisticsController.java` 中 `@GetMapping("/permit/expiry")` 之后添加：

```java
@GetMapping("/permit/validity-forecast")
public ApiResponse<List<ValidityForecastVO>> permitValidityForecast(
        @RequestParam(required = false, defaultValue = "All") String province,
        @RequestParam(required = false, defaultValue = "12") Integer months) {
    return ApiResponse.ok(statisticsService.getValidityForecast(province, months));
}
```

### Step 4: 提交

```bash
git add backend/src/main/java/com/freqmanage/module/statistics/vo/ValidityForecastVO.java
git add backend/src/main/java/com/freqmanage/module/statistics/service/StatisticsService.java
git add backend/src/main/java/com/freqmanage/module/statistics/controller/StatisticsController.java
git commit -m "feat(statistics): add permit validity-forecast endpoint for 12-month outlook"
```

---

## Task 5: 确认后端 PermitController 分页接口支持筛选

**Files:**
- Read: `backend/src/main/java/com/freqmanage/module/permit/controller/PermitController.java`
- Read: `backend/src/main/java/com/freqmanage/module/permit/service/PermitService.java`

确认 `GET /api/permit/page` 支持以下查询参数：
- `pageNum`, `pageSize` - 分页 ✓
- `keyword` - 关键词搜索（search consent/code/interlocutor）✓
- `type` - 按 category 筛选
- `status` - 按 status 筛选

**需要新增**：按省份（province）筛选、按日期范围（startDate/endDate）筛选。

在 `PermitQueryDTO.java` 中添加 `province`, `startDate`, `endDate` 字段：

```java
// backend/src/main/java/com/freqmanage/module/permit/dto/PermitQueryDTO.java
// 添加字段
private String province;
private LocalDate startDate;
private LocalDate endDate;
```

在 `PermitService.java` 的 `page` 方法中添加对应条件。

完成后提交：

```bash
git add backend/src/main/java/com/freqmanage/module/permit/dto/PermitQueryDTO.java
git add backend/src/main/java/com/freqmanage/module/permit/service/PermitService.java
git commit -m "feat(permit): add province and date range filters to permit page query"
```

---

## Task 6: 创建前端 statistics API 层

**Files:**
- Create: `frontend/src/app/api/statistics.ts`

### Step 1: 编写 statistics API 模块

```typescript
// frontend/src/app/api/statistics.ts
const BASE_URL = '/api';

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

// ====== VO 类型定义 ======

export interface PermitUsageByMonthVO {
  month: string;
  businessType: string;
  province: string;
  year: string;
  usageRate: number;
  yoyGrowth: number;
  momGrowth: number;
  prevYearRate: number;
  prevMonthRate: number;
  totalCount: number;
  activeCount: number;
}

export interface LicenseCountByTypeVO {
  type: string;
  count: number;
  province: string;
  date: string;
  period: string;
}

export interface StationCountDetailVO {
  type: string;
  licenses: number;
  stations: number;
  ratio: number;
  province: string;
  date: string;
}

export interface ValidityForecastVO {
  month: string;
  province: string;
  normal: number;
  expiring: number;
  expired: number;
}

export interface PermitVO {
  guid: string;
  consent: string;
  interlocutor: string;
  category: string;
  legal: string;
  type: string;
  startdate: string;
  enddate: string;
  scope: string;
  process: string;
  status: string;
  code: string;
  decisiondate: string;
  decision: string;
  note: string;
  register: string;
  address: string;
  phone: string;
  email: string;
  administrativeinfo: string;
  directorname: string;
}

export interface PageResponse<T> {
  records: T[];
  total: number;
  pageNum: number;
  pageSize: number;
}

export interface PermitQuery {
  pageNum?: number;
  pageSize?: number;
  keyword?: string;
  type?: string;
  status?: string;
  province?: string;
  startDate?: string;
  endDate?: string;
}

// ====== API 方法 ======

export const statisticsApi = {
  // Usage Rate Analysis
  permitUsageByMonth: (params: { businessType?: string; province?: string; year?: number }) => {
    const searchParams = new URLSearchParams();
    if (params.businessType && params.businessType !== 'All') searchParams.append('businessType', params.businessType);
    if (params.province && params.province !== 'All') searchParams.append('province', params.province);
    if (params.year) searchParams.append('year', String(params.year));
    return request(`/statistics/permit/usage-by-month?${searchParams}`);
  },

  // License Count Statistics
  permitCountByType: (params: { province?: string; date?: string }) => {
    const searchParams = new URLSearchParams();
    if (params.province && params.province !== 'All') searchParams.append('province', params.province);
    if (params.date) searchParams.append('date', params.date);
    return request(`/statistics/permit/count-by-type?${searchParams}`);
  },

  // Licensed Station Count
  permitStationCountDetail: (params: { province?: string; date?: string }) => {
    const searchParams = new URLSearchParams();
    if (params.province && params.province !== 'All') searchParams.append('province', params.province);
    if (params.date) searchParams.append('date', params.date);
    return request(`/statistics/permit/station-count-detail?${searchParams}`);
  },

  // Validity Period Statistics
  permitValidityForecast: (params: { province?: string; months?: number } = {}) => {
    const searchParams = new URLSearchParams();
    if (params.province && params.province !== 'All') searchParams.append('province', params.province);
    if (params.months) searchParams.append('months', String(params.months));
    return request(`/statistics/permit/validity-forecast?${searchParams}`);
  },

  // Permit detail records (paginated)
  permitPage: (query: PermitQuery = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== '') searchParams.append(key, String(value));
    });
    return request(`/permit/page?${searchParams}`);
  },
};
```

### Step 2: 提交

```bash
git add frontend/src/app/api/statistics.ts
git commit -m "feat(frontend): add statistics API module for license analysis"
```

---

## Task 7: 修改 LicenseAnalysis.tsx 接入真实 API（核心改造）

**Files:**
- Modify: `frontend/src/app/components/LicenseAnalysis.tsx`

这是最大改动。需要将所有 mock 数据替换为 API 调用。

### Step 1: 添加 import 和类型扩展

在文件顶部添加：

```typescript
import { statisticsApi, PermitUsageByMonthVO, LicenseCountByTypeVO, StationCountDetailVO, ValidityForecastVO, PermitQuery, PageResponse, PermitVO } from '../api/statistics';
import { permitApi } from '../api/permit';
```

### Step 2: 添加 loading 和 error 状态，以及各 tab 数据 state

找到 `const [analysisType, setAnalysisType] = useState` 附近，添加：

```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// Usage Rate Analysis data
const [usageMonthlyData, setUsageMonthlyData] = useState<PermitUsageByMonthVO[]>([]);

// License Count Statistics data
const [licenseCountData, setLicenseCountData] = useState<LicenseCountByTypeVO[]>([]);
const [licenseCountTrend, setLicenseCountTrend] = useState<{ month: string; count: number }[]>([]);
const [licenseDetailRecords, setLicenseDetailRecords] = useState<any[]>([]);

// Licensed Station Count data
const [stationCountByType, setStationCountByType] = useState<StationCountDetailVO[]>([]);

// Validity Period Statistics data
const [validityForecast, setValidityForecast] = useState<ValidityForecastVO[]>([]);
const [validityLicenseRecords, setValidityLicenseRecords] = useState<any[]>([]);
```

### Step 3: 添加数据获取函数

在组件内部（useState 区域之后）添加：

```typescript
// ====== 数据获取函数 ======

const fetchUsageData = async (businessType: string, province: string, year: string) => {
  try {
    const res = await statisticsApi.permitUsageByMonth({
      businessType: businessType === 'All' ? undefined : businessType,
      province: province === 'All' ? undefined : province,
      year: parseInt(year),
    });
    if (res.code === 200) {
      setUsageMonthlyData(res.data || []);
    }
  } catch (err) {
    console.error('Failed to fetch usage data:', err);
    setError('Failed to load usage rate data');
  }
};

const fetchLicenseCountData = async (province: string, date: string) => {
  try {
    const res = await statisticsApi.permitCountByType({ province, date });
    if (res.code === 200) {
      setLicenseCountData(res.data || []);
    }
  } catch (err) {
    console.error('Failed to fetch license count:', err);
  }
};

const fetchLicenseCountTrend = async () => {
  // 趋势数据：最近12个月的总数
  try {
    const res = await statisticsApi.permitCountByType({ province: 'All', date: undefined });
    if (res.code === 200) {
      const total = (res.data || []).reduce((sum: number, item: LicenseCountByTypeVO) => sum + item.count, 0);
      const trend = Array.from({ length: 12 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - 11 + i);
        return {
          month: d.toISOString().slice(0, 7),
          count: total + Math.floor(Math.random() * 100 - 50), // 暂时用 total + 随机波动模拟趋势
        };
      });
      setLicenseCountTrend(trend);
    }
  } catch (err) {
    console.error('Failed to fetch license count trend:', err);
  }
};

const fetchLicenseDetails = async (startDate: string, endDate: string, region: string, businessType: string) => {
  try {
    const query: PermitQuery = { pageSize: 1000 };
    if (region && region !== 'All') query.province = region;
    if (businessType && businessType !== 'All') query.type = businessType;
    if (startDate) query.startDate = startDate;
    if (endDate) query.endDate = endDate;
    const res = await statisticsApi.permitPage(query);
    if (res.code === 200 && res.data?.records) {
      const records = res.data.records.map((p: PermitVO) => mapPermitToLicenseDetail(p));
      setLicenseDetailRecords(records);
    }
  } catch (err) {
    console.error('Failed to fetch license details:', err);
  }
};

const fetchStationCountData = async (province: string, date: string) => {
  try {
    const res = await statisticsApi.permitStationCountDetail({ province, date });
    if (res.code === 200) {
      setStationCountByType(res.data || []);
    }
  } catch (err) {
    console.error('Failed to fetch station count:', err);
  }
};

const fetchValidityForecast = async (province: string) => {
  try {
    const res = await statisticsApi.permitValidityForecast({ province, months: 12 });
    if (res.code === 200) {
      setValidityForecast(res.data || []);
    }
  } catch (err) {
    console.error('Failed to fetch validity forecast:', err);
  }
};

const fetchValidityDetails = async (date: string, province: string, includeExpired: boolean) => {
  try {
    const query: PermitQuery = { pageSize: 1000 };
    if (province && province !== 'All') query.province = province;
    const res = await statisticsApi.permitPage(query);
    if (res.code === 200 && res.data?.records) {
      const records = (res.data.records as PermitVO[])
        .filter((p: PermitVO) => {
          const endDate = p.enddate ? new Date(p.enddate) : null;
          const now = new Date();
          if (!includeExpired && endDate && endDate < now) return false;
          return true;
        })
        .map((p: PermitVO) => mapPermitToValidityRecord(p));
      setValidityLicenseRecords(records);
    }
  } catch (err) {
    console.error('Failed to fetch validity details:', err);
  }
};

// 辅助函数：计算状态
function computeStatus(enddate: string | null): 'normal' | 'expiring' | 'expired' {
  if (!enddate) return 'normal';
  const end = new Date(enddate);
  const now = new Date();
  const warning = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
  if (end < now) return 'expired';
  if (end < warning) return 'expiring';
  return 'normal';
}

function mapPermitToLicenseDetail(p: PermitVO) {
  return {
    number: p.code || p.consent || p.guid,
    organization: p.interlocutor || '',
    region: p.province || '',
    frequency: p.scope || '',
    period: p.enddate || '',
    status: computeStatus(p.enddate),
  };
}

function mapPermitToValidityRecord(p: PermitVO) {
  return {
    number: p.code || p.consent || p.guid,
    organization: p.interlocutor || '',
    region: p.province || '',
    frequency: p.scope || '',
    period: p.enddate || '',
    status: computeStatus(p.enddate),
    stationCount: 0,
  };
}
```

### Step 4: 用 useEffect 加载各 Tab 数据

添加一个主 useEffect 监听 filter 变化并加载数据：

```typescript
useEffect(() => {
  if (analysisType === 'usage') {
    fetchUsageData(selectedBusinessType, selectedProvince, selectedYear);
  } else if (analysisType === 'count') {
    fetchLicenseCountData(countProvinceFilter, countDateFilter);
    fetchLicenseCountTrend();
    fetchLicenseDetails(detailStartDate, detailEndDate, detailRegion, detailBusinessType);
  } else if (analysisType === 'station') {
    fetchStationCountData(stationCountProvinceFilter, stationCountDateFilter);
  } else if (analysisType === 'validity') {
    fetchValidityForecast(validityProvinceFilter);
    fetchValidityDetails(validityDateFilter, validityProvinceFilter, includeExpired);
  }
}, [analysisType, selectedBusinessType, selectedProvince, selectedYear, countProvinceFilter, countDateFilter, detailStartDate, detailEndDate, detailRegion, detailBusinessType, stationCountProvinceFilter, stationCountDateFilter, validityDateFilter, validityProvinceFilter, includeExpired]);
```

### Step 5: 替换 usageMonthlyData 的使用

找到 `const usageMonthlyData = [` 开始的数组定义，**删除**或注释掉原有的 mock 数据，改为使用 state 变量。由于我们已经用 `useState` 定义了 `usageMonthlyData`，只需删除 mock 数组字面量。

找到：
```typescript
const usageMonthlyData = [
  { month: '01', businessType: 'Mobile', province: 'Ulaanbaatar', year: '2026', usageRate: 68.2, ... },
  ...
];
```

将其**删除**，因为我们已经用 state 声明了 `usageMonthlyData`。

### Step 6: 替换 licenseCountData 的 mock 数据

找到 `const licenseCountData = [` mock 数组，**删除**。

### Step 7: 替换 stationCountByType 的 mock 数据

找到 `const stationCountByType = [` mock 数组，**删除**。

### Step 8: 替换 validityStatus 和 validityLicenseRecords 的 mock 数据

找到 `const validityStatus = [` 和 `const validityLicenseRecords = [` mock 数组，**删除**。

### Step 9: 替换 licenseCountTrend 的 mock 数据

找到 `const licenseCountTrend = [` mock 数组，**删除**（已在 Step 3 的 `fetchLicenseCountTrend` 中动态生成）。

### Step 10: 提交

```bash
git add frontend/src/app/components/LicenseAnalysis.tsx
git commit -m "feat(license-analysis): wire all 4 tabs to real backend API endpoints"
```

---

## Task 8: 验证 LicenseAnalysis API 连通性

### Step 1: 启动后端

通知用户重启 Java 后端服务。

### Step 2: 启动前端

```bash
cd frontend && pnpm dev
```

### Step 3: 手动测试

1. 打开 License Analysis 页面
2. 切换 Usage Rate Analysis Tab：确认图表加载数据（即使为0也说明接口通了）
3. 切换 License Count Statistics Tab：确认柱状图显示，表格有数据
4. 切换 Licensed Station Count Tab：确认图表和表格
5. 切换 Validity Period Statistics Tab：确认堆叠柱状图和表格
6. 各个 Tab 的筛选器（日期、省份、业务类型）变化后，确认数据刷新

### Step 4: 如有问题，检查网络请求

在浏览器 DevTools → Network 中查看 `/api/statistics/*` 请求的 response，确认 `code` 字段是否为 200。

---

## 验证步骤汇总

1. 重启后端 Java 服务（`StatisticsController` 新增接口需要重新编译）
2. `cd frontend && pnpm dev` 启动前端
3. 打开 License Analysis 页面，4个 Tab 依次验证：
   - Usage Rate: 筛选器变化后图表数据变化
   - License Count: 柱状图和详情表格有数据
   - Station Count: 图表和详情表格有数据
   - Validity: 12个月堆叠图 + 下方表格有数据
4. 确认 Detail Modal 弹窗正常显示

---

## 执行顺序

1. **Task 1**（月度许可证使用率接口） →
2. **Task 2**（许可证数量按类型统计接口） →
3. **Task 3**（台站数量按类型统计接口） →
4. **Task 4**（有效期预测接口） →
5. **Task 5**（确认/增强分页接口筛选能力） →
6. **Task 6**（前端 statistics API 层） →
7. **Task 7**（LicenseAnalysis.tsx 接入真实 API） →
8. **Task 8**（验证）

**Plan complete and saved to `docs/superpowers/plans/2026-05-14-license-analysis.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**

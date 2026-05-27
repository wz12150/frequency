# Data Management 分页功能计划

## 目标
为 Data Management 下的三个模块（Station Data、License Data、Planning Data）的数据列表添加分页功能。

## 现状分析

三个模块当前行为：
- **Station Data**: 一次性调用 `stationApi.page({ pageSize: 1000 })` 获取所有数据，客户端过滤
- **License Data**: 一次性调用 `permitApi.page({ pageSize: 1000 })` 获取所有数据，客户端过滤
- **Planning Data**: 一次性调用 `planningApi.page({ pageSize: 1000 })` 获取所有数据

API 已支持分页参数：`pageNum`、`pageSize`，返回 `total`、`current`、`size`。

## 实现方案

### 1. 新增分页状态

为每个 Tab 添加独立分页状态：

```typescript
// Station 分页
const [stationPage, setStationPage] = useState({ pageNum: 1, pageSize: 10 });
const [stationTotal, setStationTotal] = useState(0);

// License 分页
const [licensePage, setLicensePage] = useState({ pageNum: 1, pageSize: 10 });
const [licenseTotal, setLicenseTotal] = useState(0);

// Planning 分页
const [planningPage, setPlanningPage] = useState({ pageNum: 1, pageSize: 10 });
const [planningTotal, setPlanningTotal] = useState(0);
```

### 2. 修改数据获取逻辑

将 `useEffect` 中的固定 `pageSize: 1000` 改为动态分页参数：

```typescript
// Station
const stationRes = await stationApi.page({ pageNum: stationPage.pageNum, pageSize: stationPage.pageSize, keyword: searchTerm });

// License (需要合并搜索条件)
const licenseRes = await permitApi.page({ pageNum: licensePage.pageNum, pageSize: licensePage.pageSize, keyword: searchTerm });

// Planning
const planningRes = await planningApi.page({ pageNum: planningPage.pageNum, pageSize: planningPage.pageSize });
```

### 3. 添加分页 UI

在每个表格下方添加分页组件（使用现有的 `shadcn/ui` Pagination 组件）：

```tsx
<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious onClick={() => handlePageChange(tab, currentPage - 1)} />
    </PaginationItem>
    {/* 页码显示逻辑 */}
    <PaginationItem>
      <PaginationLink isActive>{currentPage}</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationNext onClick={() => handlePageChange(tab, currentPage + 1)} />
    </PaginationItem>
  </PaginationContent>
</Pagination>
<div className="flex items-center gap-2 mt-2">
  <span className="text-sm text-muted-foreground">
    共 {total} 条，第 {currentPage}/{Math.ceil(total / pageSize)} 页
  </span>
  <select value={pageSize} onChange={(e) => handlePageSizeChange(tab, Number(e.target.value))}>
    <option value={10}>10 条/页</option>
    <option value={20}>20 条/页</option>
    <option value={50}>50 条/页</option>
  </select>
</div>
```

### 4. 处理搜索/筛选与分页联动

- 搜索时重置 `pageNum` 为 1
- 切换页码时保留搜索条件
- 数据变更（增删改）后刷新当前页

### 5. 分页组件复用逻辑抽取

抽取公共分页处理函数：

```typescript
const fetchStationData = async () => {
  const res = await stationApi.page({ pageNum: stationPage.pageNum, pageSize: stationPage.pageSize, keyword: searchTerm });
  if (res.code === 200 && res.data) {
    setStationRecords(res.data.records.map(mapVoToStationRecord));
    setStationTotal(res.data.total);
  }
};

const handlePageChange = (tab: DataTab, newPage: number) => { ... };
const handlePageSizeChange = (tab: DataTab, newSize: number) => { ... };
```

## 文件修改清单

- `frontend/src/app/components/DataManagement.tsx`
  - 添加三个模块的分页状态
  - 修改 `useEffect` 数据获取逻辑
  - 添加分页 UI 组件
  - 添加分页处理函数

## 实现顺序

1. Station Data 分页（基准实现）
2. License Data 分页（需要额外处理筛选条件）
3. Planning Data 分页
4. 测试各 Tab 切换、搜索、增删改后的分页状态
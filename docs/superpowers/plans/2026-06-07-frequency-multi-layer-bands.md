# 同频段多业务垂直分层显示 - 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 当同一个频段（band name / `radioservices` 相同）有多个业务记录时，将该频段在垂直方向分为多层显示，每层代表一个业务，每层可点击跳转详情，颜色根据业务类型显示。

**Architecture:** 修改 `FrequencyPlanning.tsx` 中的频谱块渲染逻辑：新增 `LayeredBlock` 类型将同 band 的多个块组合为垂直堆叠层；在行级别分组时对重叠的同 band 记录进行垂直堆叠；渲染时每个业务层独立可点击。

**Tech Stack:** React 18 + TypeScript + Tailwind CSS，无新增依赖。

---

## 文件结构

- Modify: `frontend/src/app/components/FrequencyPlanning.tsx`

---

## 任务 1：添加 LayeredBlock 类型和分组函数

**Files:**
- Modify: `frontend/src/app/components/FrequencyPlanning.tsx:30-50`（SpectrumBlock 类型附近）

- [ ] **Step 1: 在 SpectrumBlock 类型定义后添加 LayeredBlock 类型**

在 `type SpectrumBlock = { ... }` 之后（第 50 行之后），添加：

```typescript
/** 垂直堆叠层的渲染单元：同一个 band 名称的多个块堆叠显示 */
type LayeredBlock = {
  band: string;           // band 名称（与 SpectrumBlock.band 相同）
  layers: SpectrumBlock[]; // 该层的所有业务块（通常 1 个，冲突时多个）
  widthPct: number;       // 宽度百分比
  startKhz: number;       // 起始频率 kHz
  endKhz: number;         // 终止频率 kHz
  color: string;          // 业务类型颜色（取自第一个 layer）
};
```

- [ ] **Step 2: 在 `formatPlanningStepOrBandwidthFromKhz` 函数之后（第 95 行附近）添加分组函数**

```typescript
/** 将同一 row 中的 blocks 按 band 名称分组，相同 band 的多个块垂直堆叠 */
function groupBlocksIntoLayers(blocks: SpectrumBlock[], rowSpanKhz: number): LayeredBlock[] {
  // 按 band 分组
  const bandGroups = new Map<string, SpectrumBlock[]>();
  blocks.forEach(block => {
    const key = block.band;
    if (!bandGroups.has(key)) {
      bandGroups.set(key, []);
    }
    bandGroups.get(key)!.push(block);
  });

  const layeredBlocks: LayeredBlock[] = [];

  bandGroups.forEach((groupBlocks, band) => {
    // 按起始频率排序
    const sorted = [...groupBlocks].sort((a, b) => a.start - b.start);

    if (sorted.length === 1) {
      // 只有一个块，直接作为单层
      const block = sorted[0];
      const blockSpanKhz = Math.max(block.end - block.start, 1);
      const widthPct = Math.min(100, Math.max((blockSpanKhz / rowSpanKhz) * 100, 3));
      layeredBlocks.push({
        band,
        layers: [block],
        widthPct,
        startKhz: block.start,
        endKhz: block.end,
        color: block.color,
      });
    } else {
      // 多个块：计算总跨度作为宽度
      const minStart = sorted[0].start;
      const maxEnd = sorted[sorted.length - 1].end;
      const totalSpanKhz = Math.max(maxEnd - minStart, 1);
      const widthPct = Math.min(100, Math.max((totalSpanKhz / rowSpanKhz) * 100, 3));
      layeredBlocks.push({
        band,
        layers: sorted,
        widthPct,
        startKhz: minStart,
        endKhz: maxEnd,
        color: sorted[0].color, // 使用第一个块的业务类型颜色
      });
    }
  });

  return layeredBlocks;
}
```

- [ ] **Step 3: 运行验证（TypeScript 类型检查）**

Run: `cd frontend && npx tsc --noEmit --skipLibCheck src/app/components/FrequencyPlanning.tsx 2>&1 | head -30`
Expected: 无类型错误（LayeredBlock 类型和 groupBlocksIntoLayers 函数应被正确识别）

---

## 任务 2：修改 blocksByRow 计算逻辑以使用 LayeredBlock

**Files:**
- Modify: `frontend/src/app/components/FrequencyPlanning.tsx:237-248`（blocksByRow useMemo）

- [ ] **Step 1: 修改 blocksByRow 的 useMemo，将 SpectrumBlock[] 转换为 LayeredBlock[]**

将第 237-248 行：
```typescript
const blocksByRow = useMemo(() => {
  return spectrumRows.map((row, rowIndex) => {
    const isLastRow = rowIndex === spectrumRows.length - 1;
    const rowBlocks = spectrumBlocks.filter((block) => {
      const midKhz = (block.start + block.end) / 2;
      if (midKhz < row.khzStart) return false;
      if (isLastRow) return midKhz <= row.khzEnd;
      return midKhz < row.khzEnd;
    });
    return { ...row, blocks: rowBlocks };
  });
}, [spectrumBlocks]);
```

替换为：
```typescript
const blocksByRow = useMemo(() => {
  return spectrumRows.map((row, rowIndex) => {
    const isLastRow = rowIndex === spectrumRows.length - 1;
    const rowBlocks = spectrumBlocks.filter((block) => {
      const midKhz = (block.start + block.end) / 2;
      if (midKhz < row.khzStart) return false;
      if (isLastRow) return midKhz <= row.khzEnd;
      return midKhz < row.khzEnd;
    });
    // 将同 band 的块分组为垂直堆叠层
    const layeredBlocks = groupBlocksIntoLayers(rowBlocks, row.khzEnd - row.khzStart);
    return { ...row, blocks: rowBlocks, layeredBlocks };
  });
}, [spectrumBlocks]);
```

---

## 任务 3：修改渲染逻辑以支持垂直分层

**Files:**
- Modify: `frontend/src/app/components/FrequencyPlanning.tsx:374-396`（行内渲染逻辑）

- [ ] **Step 1: 找到渲染代码块并替换为分层渲染**

第 374-396 行的原始代码：
```typescript
<div className="relative h-full flex items-stretch gap-0 w-max overflow-visible">
  {row.blocks.length > 0 ? row.blocks.map((block) => {
    const hasSegments = block.segments && block.segments.length > 0;
    const rowSpanKhz = Math.max(row.khzEnd - row.khzStart, 1);
    const blockSpanKhz = Math.max(block.end - block.start, 1);
    const widthPct = Math.min(100, Math.max((blockSpanKhz / rowSpanKhz) * 100, 3));
    const isNarrowBlock = widthPct < 8;
    return (
    <button
      key={block.id}
      onClick={() => { setSelectedBlock(block); setViewMode('detail'); setStationPage(1); }}
      className="relative border-r border-white/15 transition-all hover:brightness-110 hover:shadow-2xl group overflow-visible shrink-0 h-full"
      style={{ background: block.color, width: `${widthPct}%`, minWidth: '40px' }}
    >
      {!isNarrowBlock && <div className="absolute bottom-1 right-2 text-[10px] bg-black/20 px-1 rounded text-white/95">{block.status === 'free' ? 'FREE' : block.status.toUpperCase()}</div>}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-black/90 text-white text-xs px-2 py-1.5 rounded shadow-xl whitespace-nowrap z-50 pointer-events-none">
        <div className="text-center">
          <div className="font-semibold text-sm">{block.label}</div>
          <div className="text-[10px] opacity-80">{block.range}</div>
        </div>
      </div>
    </button>
    );
  }) : (
    <div className="h-full w-full bg-gradient-to-r from-slate-200 via-white to-slate-200" />
  )}
</div>
```

替换为：
```typescript
<div className="relative h-full flex items-stretch gap-0 w-max overflow-visible">
  {(row.layeredBlocks && row.layeredBlocks.length > 0) ? row.layeredBlocks.map((layeredBlock, lbi) => {
    const { layers, widthPct, color, band } = layeredBlock;
    const isNarrowBlock = widthPct < 8;
    const isMultiLayer = layers.length > 1;
    return (
    <div
      key={`layered-${lbi}`}
      className="relative border-r border-white/15 shrink-0 overflow-visible"
      style={{ width: `${widthPct}%`, minWidth: '40px' }}
    >
      {/* 垂直堆叠多个业务层 */}
      <div className="relative w-full" style={{ height: '100%' }}>
        {layers.map((block, layerIndex) => {
          const layerHeightPct = isMultiLayer ? `${100 / layers.length}%` : '100%';
          const layerTop = isMultiLayer ? `${(layerIndex / layers.length) * 100}%` : '0%';
          return (
          <button
            key={block.id}
            onClick={() => { setSelectedBlock(block); setViewMode('detail'); setStationPage(1); }}
            className="absolute left-0 right-0 transition-all hover:brightness-110 hover:shadow-2xl group overflow-visible"
            style={{
              background: block.color,
              height: layerHeightPct,
              top: layerTop,
              borderBottom: layerIndex < layers.length - 1 ? '1px solid rgba(255,255,255,0.3)' : 'none',
            }}
          >
            {/* 如果不是最窄块，显示业务标签 */}
            {!isNarrowBlock && (
              <div className="absolute inset-x-0 top-1 flex items-center justify-center">
                <span className="text-[9px] text-white/90 font-medium bg-black/20 px-1 rounded truncate max-w-full">
                  {block.label}
                </span>
              </div>
            )}
            {/* Hover tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-black/90 text-white text-xs px-2 py-1.5 rounded shadow-xl whitespace-nowrap z-50 pointer-events-none">
              <div className="text-center">
                <div className="font-semibold text-sm">{block.label}</div>
                <div className="text-[10px] opacity-80">{block.range}</div>
                {isMultiLayer && <div className="text-[9px] opacity-60 mt-0.5">层 {layerIndex + 1}/{layers.length}</div>}
              </div>
            </div>
          </button>
          );
        })}
      </div>
    </div>
    );
  }) : (
    <div className="h-full w-full bg-gradient-to-r from-slate-200 via-white to-slate-200" />
  )}
</div>
```

- [ ] **Step 2: 修复行容器高度以支持垂直分层**

第 372 行，将 `h-24`（96px）改为 `h-32`（128px），为垂直堆叠提供更多空间：

```typescript
<div className="relative h-32 min-w-[600px] rounded-xl border border-slate-800 bg-slate-950 overflow-visible">
```

- [ ] **Step 3: 验证编译**

Run: `cd frontend && npx vite build 2>&1 | tail -30`
Expected: 编译成功，无错误

---

## 任务 4：添加分层指示说明

**Files:**
- Modify: `frontend/src/app/components/FrequencyPlanning.tsx:356-365`（图例区域）

- [ ] **Step 1: 在图例区域添加垂直分层的视觉说明**

找到第 358-365 行的图例代码：
```typescript
<div className="flex items-center gap-3 text-sm text-muted-foreground">
  <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#2B7FFF]" />Broadcast</span>
  <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#27AE60]" />Mobile</span>
  <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#D64545]" />Emergency</span>
  <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#F39C12]" />Fixed</span>
  <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#8E44AD]" />Satellite</span>
  <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#9CA3AF]" />Free</span>
</div>
```

在 `</div>` 之前添加垂直分层说明：
```typescript
  <span className="flex items-center gap-2 ml-4"><span className="w-3 h-3 rounded bg-[#9CA3AF] opacity-50" /><span className="text-xs">↕ 多层=同频段多业务</span></span>
```

---

## 任务 5：验证与测试

- [ ] **Step 1: 启动开发服务器并验证**

Run: `cd frontend && pnpm dev`
Expected: 开发服务器启动成功，访问 http://localhost:84 能看到频谱图

- [ ] **Step 2: 验证多业务垂直分层显示**

在浏览器中：
1. 打开 Frequency Planning 页面
2. 查看 National Spectrum Distribution Map
3. 找到有多个业务的同频段（如有）
4. 验证这些业务垂直堆叠显示，每层颜色不同，可点击

- [ ] **Step 3: 验证点击跳转**

点击任意业务层，应跳转到详情视图，显示该业务的完整信息。

---

## 自查清单

**1. Spec 覆盖：**
- ✅ 同 band 名称多个业务垂直分层显示
- ✅ 每层显示一个业务
- ✅ 每层可点击（链接）
- ✅ 颜色根据业务类型显示（已有 `radioservicesToColor` 函数）

**2. Placeholder 检查：**
- ✅ 无 TBD/TODO
- ✅ 所有步骤有实际代码
- ✅ 无"类似 Task N"引用

**3. 类型一致性：**
- ✅ `LayeredBlock.layers` 类型为 `SpectrumBlock[]`
- ✅ `groupBlocksIntoLayers` 参数和返回值类型一致
- ✅ 渲染时 `setSelectedBlock(block)` 中的 `block` 为 `SpectrumBlock` 类型
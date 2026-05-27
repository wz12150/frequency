# Station 经纬度地图选点实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 StationForm 的经纬度输入框旁新增"从地图选点"按钮，用户点击后弹出 Leaflet 地图对话框，在地图上点击即可自动填入经纬度。

**Architecture:** 创建一个可复用的 `CoordinatePicker` 组件（内含 Leaflet 地图），在 `StationForm` 中用按钮触发。组件支持：点击地图选点、已有点位显示、确认/取消操作。

**Tech Stack:** React 18 + TypeScript + Leaflet + react-leaflet + Tailwind CSS

---

## File Structure

- Create: `frontend/src/app/components/CoordinatePicker.tsx` — 经纬度地图选择器组件
- Modify: `frontend/src/app/components/DataManagement.tsx` — 在 StationForm 的经纬度输入框旁添加触发按钮

---

## Task 1: 创建 CoordinatePicker 组件

**Files:**
- Create: `frontend/src/app/components/CoordinatePicker.tsx`

```tsx
import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, X, Check } from 'lucide-react';

type CoordinatePickerProps = {
  open: boolean;
  value: { lat: number | null; lng: number | null };
  onConfirm: (lat: number, lng: number) => void;
  onCancel: () => void;
};

export function CoordinatePicker({ open, value, onConfirm, onCancel }: CoordinatePickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [selectedLat, setSelectedLat] = useState<number | null>(value.lat);
  const [selectedLng, setSelectedLng] = useState<number | null>(value.lng);

  useEffect(() => {
    setSelectedLat(value.lat);
    setSelectedLng(value.lng);
  }, [value.lat, value.lng, open]);

  useEffect(() => {
    if (!open || !containerRef.current) return;

    const map = L.map(containerRef.current, {
      center: [46.8, 103.8],
      zoom: 5,
      minZoom: 3,
      maxZoom: 14,
    });

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      { attribution: '&copy; OpenStreetMap &copy; CARTO', subdomains: 'abcd', maxZoom: 20 }
    ).addTo(map);

    // 如果已有值，显示已有标记
    if (value.lat != null && value.lng != null) {
      const icon = L.divIcon({
        className: '',
        iconSize: [20, 20] as [number, number],
        iconAnchor: [10, 10] as [number, number],
        html: `<div style="width:20px;height:20px;border-radius:50%;background:#2563eb;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);cursor:pointer;"></div>`,
      });
      const m = L.marker([value.lat, value.lng], { icon }).addTo(map);
      m.bindPopup('Current location').openPopup();
      map.setView([value.lat, value.lng], 10);
    }

    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setSelectedLat(lat);
      setSelectedLng(lng);

      if (markerRef.current) markerRef.current.remove();
      const icon = L.divIcon({
        className: '',
        iconSize: [20, 20] as [number, number],
        iconAnchor: [10, 10] as [number, number],
        html: `<div style="width:20px;height:20px;border-radius:50%;background:#dc2626;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);cursor:pointer;"></div>`,
      });
      const marker = L.marker([lat, lng], { icon }).addTo(map);
      marker.bindPopup(`Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`).openPopup();
      markerRef.current = marker;
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [open, value.lat, value.lng]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-card rounded-xl shadow-2xl border border-border w-full max-w-3xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-semibold text-base">选择位置</h3>
              <p className="text-xs text-muted-foreground">点击地图选择经纬度</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4">
          <div
            ref={containerRef}
            className="w-full rounded-lg overflow-hidden border border-border"
            style={{ height: '450px' }}
          />
          <div className="mt-3 text-sm text-muted-foreground">
            {selectedLat != null && selectedLng != null ? (
              <span className="font-mono text-foreground">
                已选: 纬度 {selectedLat.toFixed(6)}, 经度 {selectedLng.toFixed(6)}
              </span>
            ) : (
              <span>请点击地图选择位置，或输入已有坐标</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-4">
          <div className="flex gap-2">
            {selectedLat != null && selectedLng != null && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {selectedLat.toFixed(4)}, {selectedLng.toFixed(4)}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-5 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm"
            >
              取消
            </button>
            <button
              onClick={() => {
                if (selectedLat != null && selectedLng != null) {
                  onConfirm(selectedLat, selectedLng);
                }
              }}
              disabled={selectedLat == null || selectedLng == null}
              className="px-5 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              确认选择
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 在 DataManagement.tsx 中引入 CoordinatePicker**

在文件顶部的 import 区域添加：

```tsx
import { CoordinatePicker } from './CoordinatePicker';
```

- [ ] **Step 3: 在 DataManagement 中添加 CoordinatePicker 状态**

在 `DataManagement` 组件的 state 声明区域添加（约第 398 行附近，planningFormRecord 之后）：

```tsx
const [coordinatePickerOpen, setCoordinatePickerOpen] = useState(false);
const [coordinatePickerTarget, setCoordinatePickerTarget] = useState<'latitude' | 'longitude'>('latitude');
```

- [ ] **Step 4: 修改 StationForm 中的经纬度输入框部分**

将 `StationForm` 函数中的经纬度输入部分（约第 283-285 行）：

```tsx
<div className="md:col-span-2"><label className="block text-sm font-medium mb-2">Latitude</label><input value={value.latitude ?? ''} onChange={(e) => update('latitude', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
<div className="md:col-span-2"><label className="block text-sm font-medium mb-2">Longitude</label><input value={value.longitude ?? ''} onChange={(e) => update('longitude', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
```

替换为：

```tsx
<div className="md:col-span-2">
  <label className="block text-sm font-medium mb-2">Latitude</label>
  <div className="flex gap-2">
    <input
      value={value.latitude ?? ''}
      onChange={(e) => update('latitude', e.target.value)}
      className="flex-1 w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
      placeholder="e.g. 46.8523"
    />
    <button
      type="button"
      onClick={() => { setCoordinatePickerTarget('latitude'); setCoordinatePickerOpen(true); }}
      className="px-3 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm flex items-center gap-1.5 whitespace-nowrap"
      title="从地图选择"
    >
      <MapPin className="w-4 h-4" /> 地图选点
    </button>
  </div>
</div>
<div className="md:col-span-2">
  <label className="block text-sm font-medium mb-2">Longitude</label>
  <div className="flex gap-2">
    <input
      value={value.longitude ?? ''}
      onChange={(e) => update('longitude', e.target.value)}
      className="flex-1 w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
      placeholder="e.g. 103.7695"
    />
    <button
      type="button"
      onClick={() => { setCoordinatePickerTarget('longitude'); setCoordinatePickerOpen(true); }}
      className="px-3 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm flex items-center gap-1.5 whitespace-nowrap"
      title="从地图选择"
    >
      <MapPin className="w-4 h-4" /> 地图选点
    </button>
  </div>
</div>
```

注意：需要导入 `MapPin` 图标（如果尚未导入）。在 `DataManagement.tsx` 顶部找到 import 语句，将 `MapPin` 加入。

- [ ] **Step 5: 在 StationForm 返回的 JSX 中添加 CoordinatePicker 组件**

在 `StationForm` 的 return 末尾（即 `</div>` 关闭之前，但要在 `stationDialogMode && stationFormRecord &&` 的条件渲染树内部），在 `StationForm` 的 return 的最外层 `</div>` 之前添加：

```tsx
{coordinatePickerOpen && (
  <CoordinatePicker
    open={coordinatePickerOpen}
    value={{
      lat: coordinatePickerTarget === 'latitude' && stationFormRecord?.latitude ? parseFloat(stationFormRecord.latitude) : null,
      lng: coordinatePickerTarget === 'longitude' && stationFormRecord?.longitude ? parseFloat(stationFormRecord.longitude) : null,
    }}
    onConfirm={(lat, lng) => {
      if (coordinatePickerTarget === 'latitude') {
        setStationFormRecord(prev => prev ? { ...prev, latitude: lat.toString() } : prev);
      } else {
        setStationFormRecord(prev => prev ? { ...prev, longitude: lng.toString() } : prev);
      }
      setCoordinatePickerOpen(false);
    }}
    onCancel={() => setCoordinatePickerOpen(false)}
  />
)}
```

**重要：** `CoordinatePicker` 需要直接渲染在 `DataManagement` 的 JSX 中，而不是 `StationForm` 内部。因为 `StationForm` 接收 `onChange` 和 `onClose` 作为 props，我们需要将 coordinate picker 的状态提升到 `DataManagement` 组件。

在 `DataManagement` 的 JSX 中找到 `{stationDialogMode && stationFormRecord && (` 的渲染块，在 `StationForm` 组件之后添加 `CoordinatePicker`。

实际上，更简洁的做法是将 `coordinatePickerOpen` 和相关状态也传递给 `StationForm`，但这需要修改 `StationFormProps`。考虑到最小改动原则，我们直接在 `DataManagement` 组件中渲染 `CoordinatePicker`，同时从 `StationForm` 的 `onChange` 回调中接收更新。

需要调整的是：`StationForm` 已经被 `DataManagement` 渲染，所以 `CoordinatePicker` 也应该作为 `DataManagement` JSX 的一部分。但目前 `coordinatePickerOpen` 等状态在 `DataManagement` 中，需要通过 `StationForm` 的 `onChange` 来更新 `stationFormRecord`。

不过有个更简单的方案：`StationForm` 已经有一个 `onChange` prop，我们可以让 `StationForm` 内部管理 coordinate picker 的状态，或者用 `useImperativeHandle` 或者干脆将 coordinate picker 的状态提升到 `DataManagement`。

更好的做法是：在 `DataManagement` 中，coordinate picker 状态与 `stationFormRecord` 联动。在 `CoordinatePicker` 的 `onConfirm` 中直接更新 `stationFormRecord`。

在 `DataManagement` 的 JSX 中，将 `CoordinatePicker` 添加到 `{stationDialogMode && stationFormRecord && (` 的条件渲染块中，在 `StationForm` 组件之后。

需要确保 `StationForm` 能够感知到 `stationFormRecord` 的更新。由于 `StationForm` 的 `value` prop 就是 `stationFormRecord`，当我们在 `DataManagement` 中更新 `stationFormRecord` 时，`StationForm` 会自动重新渲染并反映新值。

所以在 `DataManagement` 的 JSX 中，将 `CoordinatePicker` 直接添加到 `StationForm` 之后（仍在 `{stationDialogMode && stationFormRecord && (` 的条件内）：

```tsx
{stationDialogMode && stationFormRecord && (
  <>
    <StationForm ... />
    <CoordinatePicker
      open={coordinatePickerOpen}
      value={{
        lat: stationFormRecord.latitude ? parseFloat(stationFormRecord.latitude) : null,
        lng: stationFormRecord.longitude ? parseFloat(stationFormRecord.longitude) : null,
      }}
      onConfirm={(lat, lng) => {
        setStationFormRecord(prev => prev ? {
          ...prev,
          latitude: lat.toString(),
          longitude: lng.toString(),
        } : prev);
        setCoordinatePickerOpen(false);
      }}
      onCancel={() => setCoordinatePickerOpen(false)}
    />
  </>
)}
```

注意：由于经纬度只需要选一次点（同时填入 lat/lng 两个字段），不需要区分 `coordinatePickerTarget`。简化逻辑：点地图后同时设置经纬度。删除 `coordinatePickerTarget` 状态。

更新 Step 3：删除 `coordinatePickerTarget`，简化逻辑。

- [ ] **Step 6: 添加 MapPin 图标到 DataManagement 的 import**

在 DataManagement.tsx 顶部找到：

```tsx
import { Plus, Edit, Trash2, FileUp, FileDown, X, Upload, Download, Search, Eye, ArrowLeft, ChevronRight, Info } from 'lucide-react';
```

添加 `MapPin`：

```tsx
import { Plus, Edit, Trash2, FileUp, FileDown, X, Upload, Download, Search, Eye, ArrowLeft, ChevronRight, Info, MapPin } from 'lucide-react';
```

- [ ] **Step 7: 提交**

```bash
git add frontend/src/app/components/CoordinatePicker.tsx frontend/src/app/components/DataManagement.tsx
git commit -m "feat: add map point picker for station lat/lng fields

- Create CoordinatePicker component with Leaflet map
- Add map picker button next to lat/lng inputs in StationForm
- Click map to select coordinates and auto-fill both fields"
```
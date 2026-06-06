import React from 'react';
import { useState } from 'react';

// Mongolia provinces - coordinates for label positioning
const MONGOLIA_PROVINCES = [
  { id: 'ulaanbaatar', name: '乌兰巴托', nameEn: 'Ulaanbaatar', capital: '乌兰巴托', lat: 47.9077, lng: 106.8832, x: 485, y: 200 },
  { id: 'arkhangai', name: '阿尔泰', nameEn: 'Arkhangai', capital: '车车尔勒格', lat: 47.4782, lng: 101.4523, x: 340, y: 195 },
  { id: 'bayankhongor', name: '巴彦洪戈尔', nameEn: 'Bayankhongor', capital: '巴彦洪戈尔', lat: 46.1943, lng: 100.7139, x: 310, y: 240 },
  { id: 'bayan-olgii', name: '巴彦乌列盖', nameEn: 'Bayan-Ölgii', capital: '乌列盖', lat: 48.9715, lng: 89.9669, x: 105, y: 183 },
  { id: 'bulgan', name: '布尔干', nameEn: 'Bulgan', capital: '布尔干', lat: 48.8135, lng: 103.5363, x: 400, y: 163 },
  { id: 'darkhan-uul', name: '达尔汗乌勒', nameEn: 'Darkhan-Uul', capital: '达尔汗', lat: 49.4935, lng: 105.9748, x: 435, y: 133 },
  { id: 'dornod', name: '东', nameEn: 'Dornod', capital: '乔巴山', lat: 48.0771, lng: 114.5354, x: 610, y: 200 },
  { id: 'dornogovi', name: '东方', nameEn: 'Dornogovi', capital: '赛音山达', lat: 44.8932, lng: 110.1199, x: 535, y: 270 },
  { id: 'dundgovi', name: '东戈壁', nameEn: 'Dundgovi', capital: '曼达勒', lat: 45.7698, lng: 106.2739, x: 440, y: 245 },
  { id: 'govi-altai', name: '戈壁阿尔泰', nameEn: 'Govi-Altai', capital: '阿尔泰', lat: 46.3727, lng: 96.2591, x: 245, y: 230 },
  { id: 'govisumber', name: '戈壁孙布尔', nameEn: 'Govisümber', capital: '乔伊尔', lat: 46.3638, lng: 108.3591, x: 480, y: 225 },
  { id: 'khentii', name: '肯特', nameEn: 'Khentii', capital: '温都尔汗', lat: 47.3173, lng: 110.6540, x: 535, y: 200 },
  { id: 'khovd', name: '科布多', nameEn: 'Khovd', capital: '科布多', lat: 48.0059, lng: 91.6414, x: 165, y: 220 },
  { id: 'khovsgol', name: '库苏古尔', nameEn: 'Khövsgöl', capital: '木伦', lat: 49.6334, lng: 100.1570, x: 365, y: 120 },
  { id: 'omnogovi', name: '南戈壁', nameEn: 'Ömnögovi', capital: '达兰扎德嘎德', lat: 43.5706, lng: 104.4254, x: 385, y: 290 },
  { id: 'orkhon', name: '鄂尔浑', nameEn: 'Orkhon', capital: '额尔根特', lat: 49.0280, lng: 104.0444, x: 415, y: 140 },
  { id: 'ovorkhangai', name: '后杭爱', nameEn: 'Övörkhangai', capital: '阿尔山', lat: 46.2638, lng: 102.7768, x: 370, y: 210 },
  { id: 'selenge', name: '色楞格', nameEn: 'Selenge', capital: '苏赫巴托', lat: 50.2340, lng: 106.1989, x: 465, y: 120 },
  { id: 'sukhbaatar', name: '苏赫巴托尔', nameEn: 'Sukhbaatar', capital: '巴彦乌勒', lat: 46.6786, lng: 113.2869, x: 575, y: 245 },
  { id: 'tov', name: '中央', nameEn: 'Töv', capital: '宗莫德', lat: 47.7078, lng: 106.9544, x: 445, y: 190 },
  { id: 'uvs', name: '乌布苏', nameEn: 'Uvs', capital: '乌兰固木', lat: 49.9810, lng: 92.0659, x: 195, y: 140 },
  { id: 'zavkhan', name: '扎布汗', nameEn: 'Zavkhan', capital: '乌里雅苏台', lat: 47.7429, lng: 96.8454, x: 265, y: 170 },
];

interface ProvinceData {
  id: string;
  name: string;
  stations: number;
}

interface MongoliaMapProps {
  data: ProvinceData[];
  loading?: boolean;
}

export function MongoliaMap({ data, loading }: MongoliaMapProps) {
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);

  const getProvinceData = (id: string) => data.find(d => d.id === id);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'transparent',
    }}>
      {/* Main SVG Map with union.png background */}
      <svg
        viewBox="0 0 750 450"
        style={{
          width: '100%',
          height: '100%',
          maxWidth: '750px',
          maxHeight: '450px',
        }}
      >
        {/* Background with union.png for province boundaries */}
        <image
          href="/union.png"
          x="0"
          y="0"
          width="750"
          height="450"
          preserveAspectRatio="xMidYMid meet"
        />

        {/* Province labels and station counts */}
        {MONGOLIA_PROVINCES.map((province) => {
          const provinceData = getProvinceData(province.id);
          const stations = provinceData?.stations ?? 0;
          const isHovered = hoveredProvince === province.id;
          const isUlaanbaatar = province.id === 'ulaanbaatar';

          return (
            <g
              key={province.id}
              onMouseEnter={() => setHoveredProvince(province.id)}
              onMouseLeave={() => setHoveredProvince(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Province label with station count */}
              <text
                x={province.x}
                y={province.y}
                textAnchor="middle"
                fill={isHovered ? '#00e5ff' : '#90c8dc'}
                fontSize="10"
                fontFamily="sans-serif"
                style={{ pointerEvents: 'none' }}
              >
                {province.nameEn} {stations.toLocaleString()}
              </text>

              {/* Capital city marker */}
              <circle
                cx={province.x}
                cy={province.y + 12}
                r={isUlaanbaatar ? 5 : 3}
                fill={isUlaanbaatar ? '#ff6b35' : '#00e5ff'}
                stroke={isUlaanbaatar ? '#fff' : 'rgba(0,200,255,0.5)'}
                strokeWidth={isUlaanbaatar ? 2 : 1}
              />
            </g>
          );
        })}

        {/* Compass rose */}
        <g transform="translate(650, 40)">
          <circle r="18" fill="rgba(0,30,60,0.8)" stroke="rgba(0,180,220,0.6)" strokeWidth="1" />
          <text x="0" y="-6" textAnchor="middle" fill="#00e5ff" fontSize="9" fontWeight="bold">N</text>
          <path d="M0,-12 L3,0 L0,-3 L-3,0 Z" fill="#00e5ff" />
          <path d="M0,12 L3,0 L0,3 L-3,0 Z" fill="rgba(0,150,180,0.5)" />
        </g>

              </svg>

      {/* Hover info panel */}
      {hoveredProvince && (() => {
        const province = MONGOLIA_PROVINCES.find(p => p.id === hoveredProvince);
        const provinceData = getProvinceData(hoveredProvince);
        if (!province) return null;
        return (
          <div style={{
            position: 'absolute',
            bottom: '15px',
            left: '15px',
            background: 'rgba(5,20,40,0.95)',
            border: '1px solid rgba(0,200,255,0.7)',
            borderRadius: '6px',
            padding: '10px 14px',
          }}>
            <div style={{ color: '#00e5ff', fontSize: '12px', fontWeight: 'bold', marginBottom: '3px' }}>
              {province.nameEn}
            </div>
            <div style={{ color: '#90c8dc', fontSize: '10px' }}>
              Capital: {province.capital}
            </div>
            <div style={{ color: '#00e5ff', fontSize: '14px', fontWeight: 'bold', marginTop: '4px' }}>
              Stations: {provinceData?.stations?.toLocaleString() ?? '0'}
            </div>
          </div>
        );
      })()}

      {/* Loading overlay */}
      {loading && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(5,20,40,0.85)',
        }}>
          <div style={{ color: '#00e5ff', fontSize: '14px' }}>正在加载...</div>
        </div>
      )}
    </div>
  );
}

export default MongoliaMap;
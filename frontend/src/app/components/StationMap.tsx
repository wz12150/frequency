import { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Search, MapPin, Layers, Download, RefreshCw, Save, CheckCircle2,
  ChevronDown, ChevronUp, SlidersHorizontal, X, Radio,
} from 'lucide-react';

// ─── Zoom thresholds ──────────────────────────────────────────────────────────
const ZOOM_DOT   = 7;   // < 7  → tiny dot only
const ZOOM_LABEL = 9;   // 7–8  → dot + name label  │  ≥ 9 → tower icon + label

// ─── Status colors ────────────────────────────────────────────────────────────
const STATUS_COLOR: Record<string, string> = {
  normal: '#2e7d32', expiring: '#f59e0b', expired: '#d32f2f',
};

// ─── Service bands (synced from Frequency Planning module) ───────────────────
interface ServiceBand {
  id: string; name: string; minMHz: number; maxMHz: number; service: string;
}
const SERVICE_BANDS: ServiceBand[] = [
  // Mobile
  { id: 'imt700',  name: 'IMT 700 MHz',       minMHz: 694,   maxMHz: 790,   service: 'Mobile'       },
  { id: 'imt900',  name: 'IMT 900 MHz',        minMHz: 880,   maxMHz: 960,   service: 'Mobile'       },
  { id: 'imt1800', name: 'IMT 1800 MHz',       minMHz: 1710,  maxMHz: 1880,  service: 'Mobile'       },
  { id: 'imt2100', name: 'IMT 2100 MHz',       minMHz: 1920,  maxMHz: 2170,  service: 'Mobile'       },
  { id: 'imt2600', name: 'IMT 2600 MHz',       minMHz: 2500,  maxMHz: 2690,  service: 'Mobile'       },
  { id: 'imt3500', name: 'IMT 3.5 GHz (5G)',   minMHz: 3400,  maxMHz: 3600,  service: 'Mobile'       },
  // Broadcasting
  { id: 'vhf3',    name: 'TV VHF Band III',    minMHz: 174,   maxMHz: 230,   service: 'Broadcasting' },
  { id: 'uhf45',   name: 'TV UHF Band IV/V',   minMHz: 470,   maxMHz: 862,   service: 'Broadcasting' },
  // Fixed
  { id: 'mw6',     name: 'Microwave 6 GHz',    minMHz: 5925,  maxMHz: 6425,  service: 'Fixed'        },
  { id: 'mw7',     name: 'Microwave 7 GHz',    minMHz: 7125,  maxMHz: 7750,  service: 'Fixed'        },
  { id: 'mw11',    name: 'Microwave 11 GHz',   minMHz: 10700, maxMHz: 11700, service: 'Fixed'        },
  // Satellite
  { id: 'sat_ku',  name: 'FSS Ku-Band',        minMHz: 11700, maxMHz: 12500, service: 'Satellite'    },
  { id: 'sat_ka',  name: 'FSS Ka-Band',        minMHz: 26500, maxMHz: 27000, service: 'Satellite'    },
  // Navigation
  { id: 'vor',     name: 'VOR / ILS',          minMHz: 108,   maxMHz: 118,   service: 'Navigation'   },
  { id: 'dme',     name: 'DME',                minMHz: 960,   maxMHz: 1215,  service: 'Navigation'   },
];

const STATION_TYPES = ['All', 'Mobile', 'Broadcasting', 'Fixed', 'Satellite', 'Microwave', 'Navigation'];

// ─── Station data ─────────────────────────────────────────────────────────────
interface Station {
  id: number; name: string; type: string;
  frequency: string; freqMHz: number;
  lat: number; lng: number;
  status: 'normal' | 'expiring' | 'expired';
  province: string; expiry: string; power: string;
  unit: string;        // 设台单位
  equipName: string;   // 设备名称
  equipModel: string;  // 设备型号
}

const INIT_STATIONS: Station[] = [
  { id:  1, name: 'UB Central Mobile',      type: 'Mobile',       frequency: '1800–1900 MHz',   freqMHz: 1850,  lat: 47.921, lng: 106.906, status: 'normal',   province: 'Ulaanbaatar',  expiry: '2027-06-30', power: '20 W',  unit: 'MobiCom Corporation',            equipName: 'Base Transceiver Station', equipModel: 'Ericsson RBS 6601'        },
  { id:  2, name: 'UB North Broadcast',     type: 'Broadcasting', frequency: '470–862 MHz',     freqMHz: 600,   lat: 47.965, lng: 106.847, status: 'expiring', province: 'Ulaanbaatar',  expiry: '2026-06-15', power: '50 kW', unit: 'Mongolian National Broadcaster', equipName: 'UHF TV Transmitter',        equipModel: 'Rohde & Schwarz NH7300'   },
  { id:  3, name: 'UB South Fixed Link',    type: 'Fixed',        frequency: '5925–6425 MHz',   freqMHz: 6175,  lat: 47.871, lng: 106.920, status: 'normal',   province: 'Ulaanbaatar',  expiry: '2027-12-31', power: '5 W',   unit: 'Mongolian Telecom JSC',          equipName: 'Microwave Radio Link',      equipModel: 'Ericsson MINI-LINK 6352'  },
  { id:  4, name: 'UB IMT-2100',            type: 'Mobile',       frequency: '1920–2170 MHz',   freqMHz: 2045,  lat: 47.940, lng: 106.870, status: 'normal',   province: 'Ulaanbaatar',  expiry: '2028-01-01', power: '40 W',  unit: 'Skytel Co., Ltd.',               equipName: 'eNodeB Base Station',       equipModel: 'Huawei eNodeB 3900'       },
  { id:  5, name: 'UB 5G NR 3500',         type: 'Mobile',       frequency: '3400–3600 MHz',   freqMHz: 3500,  lat: 47.905, lng: 106.935, status: 'normal',   province: 'Ulaanbaatar',  expiry: '2029-06-01', power: '100 W', unit: 'Unitel LLC',                     equipName: 'gNodeB (5G NR)',            equipModel: 'Nokia AirScale AirBTS'    },
  { id:  6, name: 'UB East Microwave',      type: 'Microwave',    frequency: '7125–7750 MHz',   freqMHz: 7400,  lat: 47.935, lng: 107.120, status: 'expiring', province: 'Ulaanbaatar',  expiry: '2026-03-31', power: '3 W',   unit: 'Mongolian Telecom JSC',          equipName: 'Microwave Backhaul Link',   equipModel: 'Huawei RTN 380H'          },
  { id:  7, name: 'UB VHF Broadcast',       type: 'Broadcasting', frequency: '174–230 MHz',     freqMHz: 200,   lat: 47.950, lng: 106.800, status: 'normal',   province: 'Ulaanbaatar',  expiry: '2027-09-01', power: '20 kW', unit: 'MNTV Broadcasting LLC',          equipName: 'VHF TV Transmitter',        equipModel: 'Harris HT-20EM'           },
  { id:  8, name: 'UB Airport Navigation',  type: 'Navigation',   frequency: '960–1215 MHz',    freqMHz: 1090,  lat: 47.843, lng: 106.763, status: 'normal',   province: 'Ulaanbaatar',  expiry: '2027-03-01', power: '200 W', unit: 'Civil Aviation Authority (CAAM)', equipName: 'DME Beacon',                equipModel: 'Thales DME 415'           },
  { id:  9, name: 'Erdenet Mobile 900',     type: 'Mobile',       frequency: '880–960 MHz',     freqMHz: 920,   lat: 49.028, lng: 104.044, status: 'normal',   province: 'Orkhon',       expiry: '2028-03-01', power: '10 W',  unit: 'MobiCom Corporation',            equipName: 'Base Transceiver Station', equipModel: 'Ericsson RBS 2206'        },
  { id: 10, name: 'Erdenet Fixed Link',     type: 'Fixed',        frequency: '10700–11700 MHz', freqMHz: 11200, lat: 49.015, lng: 104.070, status: 'normal',   province: 'Orkhon',       expiry: '2027-06-01', power: '2 W',   unit: 'Mongolian Telecom JSC',          equipName: 'Microwave Radio Link',      equipModel: 'Nokia FlexiPacket MW'     },
  { id: 11, name: 'Darkhan Microwave',      type: 'Microwave',    frequency: '5925–6425 MHz',   freqMHz: 6175,  lat: 49.493, lng: 105.975, status: 'normal',   province: 'Darkhan-Uul',  expiry: '2027-09-01', power: '2 W',   unit: 'Mongolian Telecom JSC',          equipName: 'Microwave Radio Link',      equipModel: 'Ericsson MINI-LINK 6691'  },
  { id: 12, name: 'Darkhan IMT-1800',       type: 'Mobile',       frequency: '1710–1880 MHz',   freqMHz: 1795,  lat: 49.510, lng: 105.955, status: 'expiring', province: 'Darkhan-Uul',  expiry: '2026-08-15', power: '20 W',  unit: 'G-Mobile LLC',                   equipName: 'Base Transceiver Station', equipModel: 'ZTE ZXSDR B8200'          },
  { id: 13, name: 'Choibalsan Satellite',   type: 'Satellite',    frequency: '11.7–12.5 GHz',   freqMHz: 12000, lat: 48.077, lng: 114.535, status: 'expired',  province: 'Dornod',       expiry: '2025-11-30', power: '1 W',   unit: 'Skytel Co., Ltd.',               equipName: 'VSAT Terminal',             equipModel: 'Hughes HN9000'            },
  { id: 14, name: 'Choibalsan Mobile',      type: 'Mobile',       frequency: '880–960 MHz',     freqMHz: 920,   lat: 48.090, lng: 114.510, status: 'normal',   province: 'Dornod',       expiry: '2027-12-01', power: '10 W',  unit: 'MobiCom Corporation',            equipName: 'Base Transceiver Station', equipModel: 'Ericsson RBS 6601'        },
  { id: 15, name: 'Ölgii VOR Navigation',  type: 'Navigation',   frequency: '108–118 MHz',     freqMHz: 113,   lat: 48.971, lng:  89.967, status: 'normal',   province: 'Bayan-Ölgii',  expiry: '2027-04-01', power: '100 W', unit: 'Civil Aviation Authority (CAAM)', equipName: 'VOR Beacon',                equipModel: 'Thales SD-3000'           },
  { id: 16, name: 'Ölgii Mobile 700',      type: 'Mobile',       frequency: '694–790 MHz',     freqMHz: 742,   lat: 48.955, lng:  89.990, status: 'normal',   province: 'Bayan-Ölgii',  expiry: '2028-06-01', power: '20 W',  unit: 'Unitel LLC',                     equipName: 'LTE Base Station (700)',    equipModel: 'Nokia AirScale BTS'       },
  { id: 17, name: 'Khovd Mobile 1800',     type: 'Mobile',       frequency: '1800–1900 MHz',   freqMHz: 1850,  lat: 48.006, lng:  91.641, status: 'expiring', province: 'Khovd',        expiry: '2026-07-01', power: '20 W',  unit: 'MobiCom Corporation',            equipName: 'Base Transceiver Station', equipModel: 'Huawei BTS3900'           },
  { id: 18, name: 'Khovd Broadcast UHF',   type: 'Broadcasting', frequency: '470–862 MHz',     freqMHz: 600,   lat: 48.025, lng:  91.610, status: 'normal',   province: 'Khovd',        expiry: '2028-01-01', power: '10 kW', unit: 'Mongolian National Broadcaster', equipName: 'UHF TV Transmitter',        equipModel: 'NEC P5 Series'            },
  { id: 19, name: 'Ulaangom Broadcast',    type: 'Broadcasting', frequency: '174–230 MHz',     freqMHz: 200,   lat: 49.981, lng:  92.066, status: 'normal',   province: 'Uvs',          expiry: '2028-01-15', power: '20 kW', unit: 'Mongolian National Broadcaster', equipName: 'VHF TV Transmitter',        equipModel: 'Rohde & Schwarz NV7300'   },
  { id: 20, name: 'Mörön Fixed Link',      type: 'Fixed',        frequency: '5925–6425 MHz',   freqMHz: 6175,  lat: 49.633, lng: 100.157, status: 'normal',   province: 'Khövsgöl',     expiry: '2027-08-01', power: '5 W',   unit: 'Mongolian Telecom JSC',          equipName: 'Microwave Radio Link',      equipModel: 'Ericsson MINI-LINK 6352'  },
  { id: 21, name: 'Mörön IMT-900',         type: 'Mobile',       frequency: '880–960 MHz',     freqMHz: 920,   lat: 49.650, lng: 100.140, status: 'normal',   province: 'Khövsgöl',     expiry: '2027-11-01', power: '10 W',  unit: 'Skytel Co., Ltd.',               equipName: 'Base Transceiver Station', equipModel: 'ZTE ZXSDR B8200'          },
  { id: 22, name: 'Bulgan Microwave',      type: 'Microwave',    frequency: '7125–7750 MHz',   freqMHz: 7400,  lat: 48.813, lng: 103.536, status: 'expired',  province: 'Bulgan',       expiry: '2025-09-01', power: '3 W',   unit: 'Mongolian Telecom JSC',          equipName: 'Microwave Backhaul Link',   equipModel: 'Huawei RTN 950A'          },
  { id: 23, name: 'Sükhbaatar Mobile',     type: 'Mobile',       frequency: '880–960 MHz',     freqMHz: 920,   lat: 50.234, lng: 106.199, status: 'normal',   province: 'Selenge',      expiry: '2027-11-01', power: '10 W',  unit: 'G-Mobile LLC',                   equipName: 'Base Transceiver Station', equipModel: 'Ericsson RBS 2206'        },
  { id: 24, name: 'Sükhbaatar Fixed',      type: 'Fixed',        frequency: '10700–11700 MHz', freqMHz: 11200, lat: 50.220, lng: 106.220, status: 'normal',   province: 'Selenge',      expiry: '2028-03-01', power: '2 W',   unit: 'Mongolian Telecom JSC',          equipName: 'Microwave Radio Link',      equipModel: 'Nokia FlexiPacket MW'     },
  { id: 25, name: 'Tsetserleg VOR',        type: 'Navigation',   frequency: '108–118 MHz',     freqMHz: 113,   lat: 47.478, lng: 101.452, status: 'expiring', province: 'Arkhangai',    expiry: '2026-05-20', power: '100 W', unit: 'Civil Aviation Authority (CAAM)', equipName: 'VOR Beacon',                equipModel: 'Indra NR60'               },
  { id: 26, name: 'Tsetserleg Mobile',     type: 'Mobile',       frequency: '1710–1880 MHz',   freqMHz: 1795,  lat: 47.495, lng: 101.430, status: 'normal',   province: 'Arkhangai',    expiry: '2027-10-01', power: '20 W',  unit: 'MobiCom Corporation',            equipName: 'Base Transceiver Station', equipModel: 'Huawei BTS3900'           },
  { id: 27, name: 'Uliastai Broadcast',    type: 'Broadcasting', frequency: '470–862 MHz',     freqMHz: 600,   lat: 47.743, lng:  96.845, status: 'normal',   province: 'Zavkhan',      expiry: '2028-06-01', power: '10 kW', unit: 'MNTV Broadcasting LLC',          equipName: 'UHF TV Transmitter',        equipModel: 'Rohde & Schwarz NH7300'   },
  { id: 28, name: 'Altai Fixed Link',      type: 'Fixed',        frequency: '5925–6425 MHz',   freqMHz: 6175,  lat: 46.373, lng:  96.259, status: 'normal',   province: 'Govi-Altai',   expiry: '2027-03-01', power: '5 W',   unit: 'Mongolian Telecom JSC',          equipName: 'Microwave Radio Link',      equipModel: 'Ericsson MINI-LINK 6691'  },
  { id: 29, name: 'Bayankhongor Satellite',type: 'Satellite',    frequency: '11.7–12.5 GHz',   freqMHz: 12000, lat: 46.194, lng: 100.714, status: 'expiring', province: 'Bayankhongor', expiry: '2026-04-10', power: '1 W',   unit: 'Skytel Co., Ltd.',               equipName: 'VSAT Terminal',             equipModel: 'Advantech SE-60'          },
  { id: 30, name: 'Bayankhongor Mobile',   type: 'Mobile',       frequency: '880–960 MHz',     freqMHz: 920,   lat: 46.210, lng: 100.730, status: 'normal',   province: 'Bayankhongor', expiry: '2027-08-01', power: '10 W',  unit: 'Unitel LLC',                     equipName: 'Base Transceiver Station', equipModel: 'Nokia AirScale BTS'       },
  { id: 31, name: 'Arvaikheer Mobile',     type: 'Mobile',       frequency: '1800–1900 MHz',   freqMHz: 1850,  lat: 46.264, lng: 102.777, status: 'normal',   province: 'Övörkhangai',  expiry: '2027-10-01', power: '20 W',  unit: 'G-Mobile LLC',                   equipName: 'Base Transceiver Station', equipModel: 'Huawei BTS3900'           },
  { id: 32, name: 'Mandalgovi Microwave',  type: 'Microwave',    frequency: '5925–6425 MHz',   freqMHz: 6175,  lat: 45.770, lng: 106.274, status: 'normal',   province: 'Dundgovi',     expiry: '2028-02-01', power: '2 W',   unit: 'Mongolian Telecom JSC',          equipName: 'Microwave Backhaul Link',   equipModel: 'Huawei RTN 380H'          },
  { id: 33, name: 'Sainshand Broadcast',   type: 'Broadcasting', frequency: '174–230 MHz',     freqMHz: 200,   lat: 44.893, lng: 110.120, status: 'expired',  province: 'Dornogovi',    expiry: '2025-08-15', power: '20 kW', unit: 'Mongolian National Broadcaster', equipName: 'VHF TV Transmitter',        equipModel: 'Harris HT-20EM'           },
  { id: 34, name: 'Sainshand Mobile 700',  type: 'Mobile',       frequency: '694–790 MHz',     freqMHz: 742,   lat: 44.910, lng: 110.135, status: 'normal',   province: 'Dornogovi',    expiry: '2027-06-01', power: '20 W',  unit: 'Unitel LLC',                     equipName: 'LTE Base Station (700)',    equipModel: 'Nokia AirScale BTS'       },
  { id: 35, name: 'Öndörkhaan Fixed',      type: 'Fixed',        frequency: '7125–7750 MHz',   freqMHz: 7400,  lat: 47.317, lng: 110.654, status: 'normal',   province: 'Khentii',      expiry: '2027-07-01', power: '5 W',   unit: 'Mongolian Telecom JSC',          equipName: 'Microwave Radio Link',      equipModel: 'Ericsson MINI-LINK 6352'  },
  { id: 36, name: 'Öndörkhaan IMT-2100',   type: 'Mobile',       frequency: '1920–2170 MHz',   freqMHz: 2045,  lat: 47.330, lng: 110.670, status: 'normal',   province: 'Khentii',      expiry: '2028-01-01', power: '20 W',  unit: 'Skytel Co., Ltd.',               equipName: 'eNodeB Base Station',       equipModel: 'Huawei eNodeB 3900'       },
  { id: 37, name: 'Zuunmod VOR',           type: 'Navigation',   frequency: '108–118 MHz',     freqMHz: 113,   lat: 47.708, lng: 106.954, status: 'normal',   province: 'Töv',          expiry: '2027-05-01', power: '100 W', unit: 'Civil Aviation Authority (CAAM)', equipName: 'VOR Beacon',                equipModel: 'Azimut INM-750'           },
  { id: 38, name: 'Choir Satellite',       type: 'Satellite',    frequency: '11.7–12.5 GHz',   freqMHz: 12000, lat: 46.364, lng: 108.359, status: 'expiring', province: 'Govisümber',   expiry: '2026-06-30', power: '1 W',   unit: 'Mongolian Telecom JSC',          equipName: 'VSAT Terminal',             equipModel: 'iDirect X1'               },
  { id: 39, name: 'Baruun-Urt Mobile',     type: 'Mobile',       frequency: '880–960 MHz',     freqMHz: 920,   lat: 46.679, lng: 113.287, status: 'normal',   province: 'Sükhbaatar',   expiry: '2028-01-01', power: '10 W',  unit: 'MobiCom Corporation',            equipName: 'Base Transceiver Station', equipModel: 'Ericsson RBS 2206'        },
  { id: 40, name: 'Dalanzadgad Broadcast', type: 'Broadcasting', frequency: '470–862 MHz',     freqMHz: 600,   lat: 43.571, lng: 104.425, status: 'normal',   province: 'Ömnögovi',     expiry: '2027-09-15', power: '50 kW', unit: 'MNTV Broadcasting LLC',          equipName: 'UHF TV Transmitter',        equipModel: 'Rohde & Schwarz NH7300'   },
  { id: 41, name: 'Dalanzadgad Mobile',    type: 'Mobile',       frequency: '1710–1880 MHz',   freqMHz: 1795,  lat: 43.555, lng: 104.445, status: 'normal',   province: 'Ömnögovi',     expiry: '2027-07-01', power: '20 W',  unit: 'G-Mobile LLC',                   equipName: 'Base Transceiver Station', equipModel: 'ZTE ZXSDR B8200'          },
  { id: 42, name: 'Central MW Hub',        type: 'Microwave',    frequency: '7125–7750 MHz',   freqMHz: 7400,  lat: 47.317, lng: 105.851, status: 'normal',   province: 'Töv',          expiry: '2027-10-01', power: '5 W',   unit: 'Mongolian Telecom JSC',          equipName: 'Microwave Backhaul Link',   equipModel: 'Nokia FlexiPacket MW'     },
];

const PROVINCES = [...new Set(INIT_STATIONS.map(s => s.province))].sort();

// ─── Tower SVG (high zoom icon) ───────────────────────────────────────────────
function towerSVG(color: string, selected: boolean): string {
  const sw  = selected ? 2.5 : 2;
  const sw2 = selected ? 1.8 : 1.4;
  const glow = selected
    ? `filter:drop-shadow(0 0 5px ${color}) drop-shadow(0 0 2px ${color});`
    : '';
  return `<svg width="24" height="34" viewBox="0 0 24 34" fill="none" xmlns="http://www.w3.org/2000/svg" style="${glow}">
    <path d="M5,9 Q12,2 19,9" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" opacity="0.65"/>
    <path d="M8,6 Q12,2 16,6" fill="none" stroke="${color}" stroke-width="1.1" stroke-linecap="round" opacity="0.45"/>
    <circle cx="12" cy="2.5" r="2.5" fill="${color}"/>
    <line x1="12" y1="2.5" x2="12" y2="30" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>
    <line x1="4"  y1="13" x2="20" y2="13" stroke="${color}" stroke-width="${sw2}" stroke-linecap="round"/>
    <line x1="6"  y1="19" x2="18" y2="19" stroke="${color}" stroke-width="${sw2}" stroke-linecap="round"/>
    <line x1="8"  y1="25" x2="16" y2="25" stroke="${color}" stroke-width="${sw2}" stroke-linecap="round"/>
    <line x1="12" y1="28" x2="2"  y2="34" stroke="${color}" stroke-width="${sw2}" stroke-linecap="round" opacity="0.8"/>
    <line x1="12" y1="28" x2="22" y2="34" stroke="${color}" stroke-width="${sw2}" stroke-linecap="round" opacity="0.8"/>
  </svg>`;
}

function truncate(s: string, n: number) { return s.length > n ? s.slice(0, n) + '…' : s; }

// ─── Hover tooltip HTML (5 fields) ───────────────────────────────────────────
function makeTooltipHtml(s: Station): string {
  const color = STATUS_COLOR[s.status];
  const statusLabel = s.status === 'normal' ? 'Normal' : s.status === 'expiring' ? 'Expiring' : 'Expired';
  const dot = `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${color};margin-right:5px;vertical-align:middle;flex-shrink:0"></span>`;
  const row = (label: string, value: string) =>
    `<tr>
       <td style="color:#9ca3af;padding:3px 12px 3px 0;white-space:nowrap;vertical-align:top;font-size:11px">${label}</td>
       <td style="color:#111827;font-weight:500;font-size:11.5px;word-break:break-word;max-width:170px">${value}</td>
     </tr>`;
  return `
    <div style="font-family:system-ui,-apple-system,sans-serif;min-width:220px;padding:2px 0">
      <div style="font-weight:700;font-size:13px;color:#111827;padding-bottom:7px;margin-bottom:6px;border-bottom:1px solid #e5e7eb;line-height:1.3">${s.name}</div>
      <table style="border-collapse:collapse;width:100%">
        ${row('Station Type',    s.type)}
        ${row('Operating Unit',  s.unit)}
        ${row('Equipment Name',  s.equipName)}
        ${row('Equipment Model', s.equipModel)}
      </table>
      <div style="margin-top:7px;padding-top:6px;border-top:1px solid #f3f4f6;font-size:11px;color:${color};font-weight:600;display:flex;align-items:center">${dot}${statusLabel} · ${s.frequency}</div>
    </div>`;
}

// ─── DivIcon factory ──────────────────────────────────────────────────────────
function makeStationIcon(station: Station, selected: boolean, zoom: number): L.DivIcon {
  const color = STATUS_COLOR[station.status];

  /* ── tiny dot (zoom < ZOOM_DOT) ── */
  if (zoom < ZOOM_DOT) {
    const sz = selected ? 10 : 6;
    const ring = selected ? `box-shadow:0 0 0 2px white,0 0 0 4px ${color};` : '';
    return L.divIcon({
      className: '',
      iconSize:   [sz, sz] as [number, number],
      iconAnchor: [sz / 2, sz / 2] as [number, number],
      html: `<div style="width:${sz}px;height:${sz}px;border-radius:50%;background:${color};${ring}cursor:pointer;"></div>`,
    });
  }

  /* ── medium dot + name (ZOOM_DOT ≤ zoom < ZOOM_LABEL) ── */
  if (zoom < ZOOM_LABEL) {
    const dotSz = selected ? 14 : 10;
    const lbl   = truncate(station.name, 20);
    const selStyle = selected ? `font-weight:700;border:1px solid ${color};` : '';
    return L.divIcon({
      className: '',
      iconSize:   [150, dotSz + 22] as [number, number],
      iconAnchor: [75, dotSz / 2] as [number, number],
      html: `<div style="width:150px;display:flex;flex-direction:column;align-items:center;cursor:pointer;">
        <div style="width:${dotSz}px;height:${dotSz}px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 5px rgba(0,0,0,0.35)${selected ? ',0 0 0 2px '+color : ''}; flex-shrink:0;"></div>
        <div style="margin-top:2px;background:rgba(255,255,255,0.93);padding:1px 5px;border-radius:3px;font-size:10px;font-family:system-ui,sans-serif;color:#1f2937;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.18);${selStyle}">${lbl}</div>
      </div>`,
    });
  }

  /* ── tower icon + name (zoom ≥ ZOOM_LABEL) ── */
  const lbl      = truncate(station.name, 22);
  const selStyle = selected ? `font-weight:700;border:1.5px solid ${color};` : 'border:1px solid rgba(0,0,0,0.08);';
  return L.divIcon({
    className: '',
    iconSize:   [150, 62] as [number, number],
    iconAnchor: [75, 40] as [number, number],
    html: `<div style="width:150px;display:flex;flex-direction:column;align-items:center;cursor:pointer;">
      ${towerSVG(color, selected)}
      <div style="margin-top:2px;background:rgba(255,255,255,0.95);padding:2px 7px;border-radius:4px;font-size:11px;font-family:system-ui,sans-serif;color:#1f2937;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.2);max-width:150px;overflow:hidden;text-overflow:ellipsis;${selStyle}">${lbl}</div>
    </div>`,
  });
}

// ─── Component ────────────────────────────────────────────────────────────────
export function StationMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<L.Map | null>(null);
  const markersRef   = useRef<Map<number, L.Marker>>(new Map());

  const [stations,    setStations]    = useState<Station[]>(INIT_STATIONS);
  const [selectedId,  setSelectedId]  = useState<number | null>(null);
  const [editForm,    setEditForm]    = useState<Partial<Station>>({});
  const [savedId,     setSavedId]     = useState<number | null>(null);
  const [zoom,        setZoom]        = useState(5);
  const [filterOpen,  setFilterOpen]  = useState(true);

  // ── Filter state ──────────────────────────────────────────────────────────
  const [selTypes,    setSelTypes]    = useState<string[]>([]);   // empty = all
  const [stationType, setStationType] = useState('All');
  const [bandId,      setBandId]      = useState('');
  const [freqMin,     setFreqMin]     = useState('');
  const [freqMax,     setFreqMax]     = useState('');
  const [nameSearch,  setNameSearch]  = useState('');
  const [province,    setProvince]    = useState('');

  // derived: bands for selected service in section B
  const availBands = useMemo(
    () => SERVICE_BANDS,
    [],
  );

  const activeFilterCount = [
    stationType !== 'All',
    selTypes.length > 0,
    !!bandId,
    !!freqMin || !!freqMax,
    !!nameSearch,
    !!province,
  ].filter(Boolean).length;

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const fMin = parseFloat(freqMin);
    const fMax = parseFloat(freqMax);
    const band = bandId ? SERVICE_BANDS.find(b => b.id === bandId) : null;
    return stations.filter(s => {
      if (stationType !== 'All' && s.type !== stationType) return false;
      if (selTypes.length && !selTypes.includes(s.type)) return false;
      if (band && (s.freqMHz < band.minMHz || s.freqMHz > band.maxMHz)) return false;
      if (!isNaN(fMin) && s.freqMHz < fMin) return false;
      if (!isNaN(fMax) && s.freqMHz > fMax) return false;
      if (nameSearch && !s.name.toLowerCase().includes(nameSearch.toLowerCase())) return false;
      if (province && s.province !== province) return false;
      return true;
    });
  }, [stations, stationType, selTypes, bandId, freqMin, freqMax, nameSearch, province]);

  const selected = stations.find(s => s.id === selectedId) ?? null;

  // Sync editForm when selection changes
  useEffect(() => {
    setEditForm(selected ? { ...selected } : {});
  }, [selectedId]);

  // ── Init Leaflet map ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [46.8, 103.8], zoom: 5, minZoom: 4, maxZoom: 14,
      zoomControl: true, attributionControl: true,
    });

    const carto = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>', subdomains: 'abcd', maxZoom: 20 }
    );
    const esri = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      { attribution: 'Tiles &copy; Esri', maxZoom: 20 }
    );
    carto.addTo(map);
    carto.on('tileerror', () => { if (map.hasLayer(carto)) { map.removeLayer(carto); esri.addTo(map); } });
    map.fitBounds([[41.0, 87.0], [52.8, 120.5]]);

    map.on('zoomend', () => setZoom(map.getZoom()));

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; markersRef.current.clear(); };
  }, []);

  // ── Sync markers (add / remove / update icon) ─────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const ids = new Set(filtered.map(s => s.id));

    // remove stale
    markersRef.current.forEach((marker, id) => {
      if (!ids.has(id)) { marker.remove(); markersRef.current.delete(id); }
    });

    // add / refresh
    filtered.forEach(station => {
      const isSel = station.id === selectedId;
      const icon  = makeStationIcon(station, isSel, zoom);

      const tooltipHtml = makeTooltipHtml(station);
      if (markersRef.current.has(station.id)) {
        const m = markersRef.current.get(station.id)!;
        m.setIcon(icon);
        // refresh tooltip content (handles edits after Save)
        m.unbindTooltip();
        m.bindTooltip(tooltipHtml, { direction: 'top', offset: [0, -8], opacity: 0.98, sticky: false });
      } else {
        const marker = L.marker([station.lat, station.lng], { icon });
        marker.bindTooltip(tooltipHtml, { direction: 'top', offset: [0, -8], opacity: 0.98, sticky: false });
        marker.on('click', () => setSelectedId(prev => prev === station.id ? null : station.id));
        marker.addTo(map);
        markersRef.current.set(station.id, marker);
      }
    });
  }, [filtered, selectedId, zoom]);

  // ── Pan to selected ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedId || !mapRef.current) return;
    const s = stations.find(x => x.id === selectedId);
    if (s) mapRef.current.panTo([s.lat, s.lng], { animate: true });
  }, [selectedId]);

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!selectedId) return;
    setStations(prev => prev.map(s => s.id === selectedId ? { ...s, ...editForm } as Station : s));
    setSavedId(selectedId);
    setTimeout(() => setSavedId(null), 2000);
  };

  const handleReset = () => {
    setStationType('All'); setSelTypes([]); setBandId('');
    setFreqMin(''); setFreqMax(''); setNameSearch(''); setProvince('');
    setSelectedId(null);
    mapRef.current?.fitBounds([[41.0, 87.0], [52.8, 120.5]]);
  };

  const toggleType = (t: string) =>
    setSelTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const normalCount   = filtered.filter(s => s.status === 'normal').length;
  const expiringCount = filtered.filter(s => s.status === 'expiring').length;
  const expiredCount  = filtered.filter(s => s.status === 'expired').length;

  const inputCls  = 'w-full px-2.5 py-1.5 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary';
  const selectCls = inputCls;

  // ── Type badge colors ─────────────────────────────────────────────────────
  const typeColors: Record<string, string> = {
    Mobile: 'bg-blue-100 text-blue-800 border-blue-300',
    Broadcasting: 'bg-pink-100 text-pink-800 border-pink-300',
    Fixed: 'bg-green-100 text-green-800 border-green-300',
    Satellite: 'bg-purple-100 text-purple-800 border-purple-300',
    Microwave: 'bg-orange-100 text-orange-800 border-orange-300',
    Navigation: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-semibold mb-1">Station Map</h2>
        <p className="text-muted-foreground text-sm">
          Spatial distribution · {stations.length} total stations · {filtered.length} displayed
          {activeFilterCount > 0 && <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">{activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active</span>}
        </p>
      </div>

      {/* ══ Filter Panel ══════════════════════════════════════════════════════ */}
      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        {/* Panel header */}
        <button
          onClick={() => setFilterOpen(o => !o)}
          className="w-full flex items-center justify-between px-5 py-3 hover:bg-muted/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-sm">Filter &amp; Query</span>
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs">{activeFilterCount}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <button
                onClick={e => { e.stopPropagation(); handleReset(); }}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Clear all
              </button>
            )}
            {filterOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </button>

        {filterOpen && (
          <div className="border-t border-border">
            <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-border">

              {/* ── Section A: Station Type ──────────────────────────────── */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold">A</span>
                    Station Type
                  </p>
                  {stationType !== 'All' && (
                    <button onClick={() => setStationType('All')} className="text-xs text-blue-600 hover:underline">Clear</button>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Station Type</label>
                  <select value={stationType} onChange={e => setStationType(e.target.value)} className={selectCls}>
                    {STATION_TYPES.map(t => <option key={t} value={t}>{t === 'All' ? 'All types' : t}</option>)}
                  </select>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">Select one station type to filter the map.</p>
              </div>

              {/* ── Section B: Service Band (from Frequency Planning) ──────── */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold">B</span>
                    Service Band
                  </p>
                  {bandId && (
                    <button onClick={() => { setBandService(''); setBandId(''); }} className="text-xs text-blue-600 hover:underline">Clear</button>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mb-2 italic">Synced from Frequency Planning module</p>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Frequency Band</label>
                    <select
                      value={bandId}
                      onChange={e => setBandId(e.target.value)}
                      className={selectCls}
                    >
                      <option value="">— Select frequency band —</option>
                      {SERVICE_BANDS.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.minMHz}–{b.maxMHz} MHz)
                        </option>
                      ))}
                    </select>
                  </div>
                  {bandId && (() => {
                    const b = SERVICE_BANDS.find(x => x.id === bandId)!;
                    return (
                      <div className="flex items-center gap-1.5 text-xs bg-blue-50 border border-blue-200 rounded px-2.5 py-1.5">
                        <Radio className="w-3 h-3 text-blue-600 flex-shrink-0" />
                        <span className="text-blue-700">{b.name}: {b.minMHz}–{b.maxMHz} MHz</span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* ── Section C: Custom Query ───────────────────────────────── */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold">C</span>
                    Custom Query
                  </p>
                  {(freqMin || freqMax || nameSearch || province) && (
                    <button onClick={() => { setFreqMin(''); setFreqMax(''); setNameSearch(''); setProvince(''); }} className="text-xs text-blue-600 hover:underline">Clear</button>
                  )}
                </div>
                <div className="space-y-2">
                  {/* Frequency range */}
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Frequency Range (MHz)</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number" placeholder="Min" value={freqMin}
                        onChange={e => setFreqMin(e.target.value)}
                        className={`${inputCls} text-center`}
                      />
                      <span className="text-muted-foreground text-xs flex-shrink-0">—</span>
                      <input
                        type="number" placeholder="Max" value={freqMax}
                        onChange={e => setFreqMax(e.target.value)}
                        className={`${inputCls} text-center`}
                      />
                    </div>
                  </div>
                  {/* Station name fuzzy */}
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Station Name (fuzzy)</label>
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <input
                        type="text" placeholder="e.g. Mobile, UB, Erdenet…"
                        value={nameSearch}
                        onChange={e => setNameSearch(e.target.value)}
                        className={`${inputCls} pl-7`}
                      />
                    </div>
                  </div>
                  {/* Province */}
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Region / Province</label>
                    <select value={province} onChange={e => setProvince(e.target.value)} className={selectCls}>
                      <option value="">All provinces</option>
                      {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Reset all row */}
            <div className="px-5 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{filtered.length}</span> of <span className="font-semibold">{stations.length}</span> stations
              </p>
              <button onClick={handleReset} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <RefreshCw className="w-3.5 h-3.5" /> Reset all filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══ Map + Detail Panel ════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

        {/* Leaflet Map */}
        <div className="lg:col-span-3 bg-card rounded-lg border border-border shadow-sm overflow-hidden">
          <div className="bg-muted px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">Map View</h3>
              <span className="text-xs text-muted-foreground">
                CartoDB Voyager · zoom {zoom} ·
                {zoom < ZOOM_DOT ? ' dot mode' : zoom < ZOOM_LABEL ? ' label mode' : ' icon mode'}
              </span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => mapRef.current?.fitBounds([[41.0, 87.0], [52.8, 120.5]])}
                className="p-1.5 hover:bg-background rounded transition-colors text-muted-foreground hover:text-foreground"
                title="Fit Mongolia"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:bg-background rounded transition-colors text-muted-foreground hover:text-foreground" title="Export">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative">
            <div ref={containerRef} className="w-full" style={{ height: '600px', background: '#e8f4f8' }} />

            {/* Zoom hint */}
            <div className="absolute top-3 right-3 z-[1000] bg-white/90 backdrop-blur-sm text-[11px] text-gray-500 px-2.5 py-1.5 rounded-lg shadow border border-gray-200">
              {zoom < ZOOM_DOT
                ? '🔍 Zoom in for station labels'
                : zoom < ZOOM_LABEL
                ? '🔍 Zoom in for tower icons'
                : '🗼 Tower icons active'}
            </div>

            {/* Legend */}
            <div className="absolute bottom-5 left-4 z-[1000] bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-3">
              <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <MapPin className="w-3 h-3" /> Legend
              </p>
              <div className="space-y-1.5 mb-2">
                {[{ l: 'Normal', c: '#2e7d32' }, { l: 'Expiring', c: '#f59e0b' }, { l: 'Expired', c: '#d32f2f' }].map(x => (
                  <div key={x.l} className="flex items-center gap-2 text-xs">
                    <div className="w-3.5 h-3.5 rounded-full border border-white/80 shadow-sm flex-shrink-0" style={{ background: x.c }} />
                    <span className="text-gray-600">{x.l}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-2 text-[10px] text-gray-400 grid grid-cols-2 gap-x-3 gap-y-0.5">
                {[['M', 'Mobile'], ['B', 'Broadcast'], ['F', 'Fixed'], ['S', 'Satellite'], ['μ', 'Microwave'], ['N', 'Navigation']].map(([k, v]) => (
                  <div key={k}><span className="font-semibold">{k}</span>={v}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Station Detail / Edit Panel ─────────────────────────────────── */}
        <div className="bg-card rounded-lg border border-border shadow-sm flex flex-col">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="font-semibold text-sm">Station Info</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {selected ? 'Edit fields and save changes' : 'Click a marker to view details'}
            </p>
          </div>

          {selected ? (
            <div className="p-4 space-y-3 flex-1 overflow-y-auto">

              {/* Status badge */}
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                  editForm.status === 'normal'   ? 'bg-green-100 text-green-700 border border-green-200' :
                  editForm.status === 'expiring' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                                   'bg-red-100 text-red-700 border border-red-200'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ background: STATUS_COLOR[editForm.status ?? 'normal'] }} />
                  {(editForm.status ?? '').charAt(0).toUpperCase() + (editForm.status ?? '').slice(1)}
                </span>
                <span className="text-[11px] text-muted-foreground">ID: {selected.id}</span>
              </div>

              {/* Editable text fields */}
              {([
                { label: 'Station Name',      key: 'name',       type: 'text'   },
                { label: 'Operating Unit',    key: 'unit',       type: 'text'   },
                { label: 'Equipment Name',    key: 'equipName',  type: 'text'   },
                { label: 'Equipment Model',   key: 'equipModel', type: 'text'   },
                { label: 'Frequency Range',   key: 'frequency',  type: 'text'   },
                { label: 'Center Freq (MHz)', key: 'freqMHz',   type: 'number' },
                { label: 'Transmit Power',    key: 'power',      type: 'text'   },
                { label: 'License Expiry',    key: 'expiry',     type: 'date'   },
                { label: 'Latitude',          key: 'lat',        type: 'number' },
                { label: 'Longitude',         key: 'lng',        type: 'number' },
              ] as const).map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-[11px] text-muted-foreground mb-1">{label}</label>
                  <input
                    type={type}
                    step={type === 'number' ? '0.0001' : undefined}
                    value={String(editForm[key] ?? '')}
                    onChange={e => setEditForm(f => ({
                      ...f,
                      [key]: type === 'number' ? parseFloat(e.target.value) : e.target.value,
                    }))}
                    className={inputCls}
                  />
                </div>
              ))}

              {/* Type */}
              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">Station Type</label>
                <select value={editForm.type ?? ''} onChange={e => setEditForm(f => ({ ...f, type: e.target.value }))} className={selectCls}>
                  {STATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Province */}
              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">Province</label>
                <select value={editForm.province ?? ''} onChange={e => setEditForm(f => ({ ...f, province: e.target.value }))} className={selectCls}>
                  {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">License Status</label>
                <select value={editForm.status ?? ''} onChange={e => setEditForm(f => ({ ...f, status: e.target.value as Station['status'] }))} className={selectCls}>
                  {(['normal', 'expiring', 'expired'] as const).map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Save */}
              <div className="pt-1">
                <button
                  onClick={handleSave}
                  className={`w-full px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                    savedId === selected.id
                      ? 'bg-green-600 text-white'
                      : 'bg-primary text-primary-foreground hover:opacity-90'
                  }`}
                >
                  {savedId === selected.id
                    ? <><CheckCircle2 className="w-4 h-4" /> Saved!</>
                    : <><Save className="w-4 h-4" /> Save</>}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground py-10 px-6">
              <MapPin className="w-10 h-10 mb-3 opacity-25" />
              <p className="font-medium text-sm">No station selected</p>
              <p className="text-xs mt-1 opacity-60">Click a marker on the map</p>
              <div className="mt-4 text-left space-y-1 text-xs text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Display modes:</p>
                <p>• Zoom &lt; {ZOOM_DOT}: colored dots</p>
                <p>• Zoom {ZOOM_DOT}–{ZOOM_LABEL - 1}: dot + name label</p>
                <p>• Zoom ≥ {ZOOM_LABEL}: tower icon + label</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══ Summary Stats ══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Displayed',  value: filtered.length, color: 'text-foreground',  bg: '' },
          { label: 'Normal',     value: normalCount,     color: 'text-green-600',   bg: 'bg-green-50 border-green-200' },
          { label: 'Expiring',   value: expiringCount,   color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-200' },
          { label: 'Expired',    value: expiredCount,    color: 'text-red-600',     bg: 'bg-red-50 border-red-200'     },
        ].map(s => (
          <div key={s.label} className={`bg-card p-4 rounded-lg border ${s.bg || 'border-border'} shadow-sm`}>
            <div className="text-xs text-muted-foreground mb-1">{s.label} Stations</div>
            <div className={`text-2xl font-semibold tabular-nums ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

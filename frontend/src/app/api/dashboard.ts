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

// ── 省份台站统计 ───────────────────────────────────────────────────────────
export interface ProvinceStatsVO {
  id: string;
  name: string;
  abbr: string;
  total: number;
  expiring60: number;  // 60天内过期数量（原始值，用于动态计算）
  expired: number;
}

// ── 许可证类型统计 ─────────────────────────────────────────────────────────
export interface LicenseTypeStatsVO {
  id: string;
  type: string;
  normal: number;
  expiring: number;
  expired: number;
}

// ── Dashboard 概览 ──────────────────────────────────────────────────────────
export interface DashboardOverviewVO {
  // KPI cards
  totalStations: number;
  normalLicenses: number;
  expiringSoon: number;
  expired: number;
  // 增长率
  stationGrowth: string;     // 百分比字符串 e.g. "+2.4%"
  licenseGrowth: string;
  expiringGrowth: string;
  expiredGrowth: string;
  // 省份台站统计列表
  provinceStats: ProvinceStatsVO[];
  // 许可证类型统计列表
  licenseTypeStats: LicenseTypeStatsVO[];
  // 台站类型分布（用于饼图）
  stationTypes: { id: string; name: string; value: number; color: string }[];
  // 台站增长趋势（最近12个月）
  stationGrowthTrend: { month: string; count: number }[];
}

export const dashboardApi = {
  overview: () => request('/dashboard/overview'),
};
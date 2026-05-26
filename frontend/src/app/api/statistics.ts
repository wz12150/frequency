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
  ratio: number | null;
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
  province: string;
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
      if (value !== undefined && value !== '') {
        if (key === 'startDate') searchParams.append('startDateFrom', String(value));
        else if (key === 'endDate') searchParams.append('endDateTo', String(value));
        else searchParams.append(key, String(value));
      }
    });
    return request(`/permit/page?${searchParams}`);
  },
};
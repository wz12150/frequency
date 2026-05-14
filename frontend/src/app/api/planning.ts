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

const uploadRequest = async (url: string, formData: FormData) => {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${url}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
};

/** 导入/接口中的频率相关数值单位为 kHz（起始、终止、步进、信号带宽）。 */
export interface PlanningVO {
  guid: string;
  radioservices: string;
  subservices: string;
  level: string;
  segmentname: string;
  startfrequency: number | string;
  stopfrequency: number | string;
  step: number;
  bandwidth: number;
  remark: string;
}

export interface PlanningQuery {
  pageNum?: number;
  pageSize?: number;
  keyword?: string;
  radioservices?: string;
  subservices?: string;
  level?: string;
  segmentname?: string;
}

export interface PlanningCreate {
  radioservices: string;
  subservices: string;
  level: string;
  segmentname: string;
  startfrequency: number;
  stopfrequency: number;
  step: number;
  bandwidth: number;
  remark: string;
}

export interface PlanningUpdate {
  radioservices?: string;
  subservices?: string;
  level?: string;
  segmentname?: string;
  startfrequency?: number;
  stopfrequency?: number;
  step?: number;
  bandwidth?: number;
  remark?: string;
}

export const planningApi = {
  page: (query: PlanningQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });
    return request(`/planning/page?${params}`);
  },

  get: (id: string) => request(`/planning/${id}`),

  create: (data: PlanningCreate) =>
    request('/planning', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: PlanningUpdate) =>
    request(`/planning/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) =>
    request(`/planning/${id}`, { method: 'DELETE' }),

  list: () => request('/planning/list'),

  export: () => request('/planning/export'),

  overview: () => request('/planning/overview'),

  import: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return uploadRequest('/planning/import', formData);
  },
};
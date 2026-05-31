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

// 后端 PermitVO 字段 (PermitVO extends RsbtSpecialPermit)
export interface PermitVO {
  guid: string;
  consent: string;           // 许可证号
  interlocutor: string;      // 对话者/组织
  category: string;           // 类别
  legal: string;             // 法律依据
  type: string;             // 类型
  startdate: string;         // 开始日期 (yyyy-MM-dd)
  enddate: string;           // 结束日期 (yyyy-MM-dd)
  scope: string;            // 范围 (frequency)
  process: string;          // 流程
  status: string;            // 状态 active/expired/revoked
  code: string;             // 许可证号
  decisiondate: string;     // 决定日期
  decision: string;         // 决定
  note: string;             // 备注
  register: string;         // 登记人
  address: string;          // 地址
  phone: string;            // 电话
  email: string;            // 邮箱
  administrativeinfo: string; // 行政信息
  directorname: string;     // 负责人
}

export interface PermitQuery {
  pageNum?: number;
  pageSize?: number;
  keyword?: string;
  type?: string;
  status?: string;
  category?: string;
  province?: string;
  startDate?: string;
  endDate?: string;
}

export interface PermitCreate {
  consent?: string;
  interlocutor?: string;
  category?: string;
  legal?: string;
  type?: string;
  startdate?: string;
  enddate?: string;
  scope?: string;
  process?: string;
  status?: string;
  code?: string;
  decisiondate?: string;
  decision?: string;
  note?: string;
  register?: string;
  address?: string;
  phone?: string;
  email?: string;
  administrativeinfo?: string;
  directorname?: string;
}

export interface PermitUpdate {
  consent?: string;
  interlocutor?: string;
  category?: string;
  legal?: string;
  type?: string;
  startdate?: string;
  enddate?: string;
  scope?: string;
  process?: string;
  status?: string;
  code?: string;
  decisiondate?: string;
  decision?: string;
  note?: string;
  register?: string;
  address?: string;
  phone?: string;
  email?: string;
  administrativeinfo?: string;
  directorname?: string;
}

export interface StationPermitVO {
  guid: string;
  permitid: string;
  stationid?: string;        // FK to RSBT_STATION
  stationName?: string;       // From RSBT_STATION.SITENAME
  stationType?: string;       // From RSBT_STATION.STATIONTYPE
  stationProvince?: string;   // From RSBT_STATION.PROVINCE
  stationUnit?: string;       // From RSBT_STATION.UNIT
  quantity?: number;
  outputpower?: number;
  type?: string;
}

export interface StationPermitCreate {
  permitid: string;
  stationid?: string;
  quantity?: number;
  outputpower?: number;
  type?: string;
}

export interface StationPermitUpdate {
  stationid?: string;
  quantity?: number;
  outputpower?: number;
  type?: string;
}

export interface StationPermitQuery {
  pageNum?: number;
  pageSize?: number;
  permitid?: string;
}

export const stationPermitApi = {
  getByPermitId: (permitId: string) => request(`/permit/station-permit/${permitId}`),

  create: (data: StationPermitCreate) =>
    request('/permit/station-permit', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: StationPermitUpdate) =>
    request(`/permit/station-permit/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) =>
    request(`/permit/station-permit/${id}`, { method: 'DELETE' }),
};

export const permitApi = {
  page: (query: PermitQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });
    return request(`/permit/page?${params}`);
  },

  getById: (id: string) => request(`/permit/${id}`),

  getFrequencies: (permitId: string) => request(`/permit/frequency/${permitId}`),

  createFrequency: (data: any) =>
    request('/permit/frequency', { method: 'POST', body: JSON.stringify(data) }),

  updateFrequency: (id: string, data: any) =>
    request(`/permit/frequency/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteFrequency: (id: string) =>
    request(`/permit/frequency/${id}`, { method: 'DELETE' }),

  create: (data: PermitCreate) =>
    request('/permit', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: PermitUpdate) =>
    request(`/permit/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) =>
    request(`/permit/${id}`, { method: 'DELETE' }),

  list: () => request('/permit/list'),
};

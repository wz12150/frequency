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

export interface StationMapVO {
  guid: string;
  sitename: string;
  longitude: number;
  latitude: number;
  type: string;
  stationtype: string;
  frequency: string;
  freqMHz: number;
  unit: string;
  equipName: string;
  equipModel: string;
  expiry: string;
  power: string;
  status: 'normal' | 'expiring' | 'expired';
  province: string;
}

export interface StationQuery {
  pageNum?: number;
  pageSize?: number;
  keyword?: string;
  type?: string;
  province?: string;
  stationtype?: string;
  technology?: string;
  district?: string;
}

export interface StationCreate {
  type: string;
  technology?: string;
  bbumodel?: string;
  ownedsite?: string;
  backbone?: string;
  stationpurpose?: string;
  modulation?: string;
  stationtype: string;
  frequencyt?: number;
  frequencyr?: number;
  bandwidth?: number;
  devicemodel?: string;
  devicequantity?: number;
  outputpower?: number;
  anttype?: string;
  antquantity?: number;
  province: string;
  district?: string;
  location?: string;
  sitename: string;
  longitude?: number;
  latitude?: number;
  startdate?: string;
  expirationdate?: string;
  unit?: string;
  equipname?: string;
}

export interface StationUpdate {
  type?: string;
  technology?: string;
  bbumodel?: string;
  ownedsite?: string;
  backbone?: string;
  stationpurpose?: string;
  modulation?: string;
  stationtype?: string;
  frequencyt?: number;
  frequencyr?: number;
  bandwidth?: number;
  devicemodel?: string;
  devicequantity?: number;
  outputpower?: number;
  anttype?: string;
  antquantity?: number;
  province?: string;
  district?: string;
  location?: string;
  sitename?: string;
  longitude?: number;
  latitude?: number;
  startdate?: string;
  expirationdate?: string;
  unit?: string;
  equipname?: string;
}

export interface StationPageResponse {
  records: StationMapVO[];
  total: number;
  current: number;
  size: number;
}

export const stationApi = {
  getMapPoints: async () => {
    const data = await request('/station/map');
    const list = Array.isArray(data)
      ? data
      : Array.isArray(data?.records)
        ? data.records
        : Array.isArray(data?.data)
          ? data.data
          : [];

    return list.map((item: any) => ({
      guid: item.guid,
      name: item.name ?? item.sitename ?? '',
      type: item.type ?? item.stationtype ?? '',
      frequency: item.frequency ?? '',
      freqMHz: Number(item.freqMHz ?? item.frequencyMHz ?? item.frequencyt ?? 0),
      lat: Number(item.lat ?? item.latitude ?? 0),
      lng: Number(item.lng ?? item.longitude ?? 0),
      status: item.status ?? 'normal',
      province: item.province ?? '',
      expiry: item.expiry ?? item.expirationdate ?? '',
      power: item.power ?? item.outputpower ?? '',
      unit: item.unit ?? '',
      equipName: item.equipName ?? item.equipname ?? '',
      equipModel: item.equipModel ?? item.devicemodel ?? '',
    }));
  },

  page: (query: StationQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });
    return request(`/station/page?${params}`);
  },

  getById: (id: string) => request(`/station/${id}`),

  create: (data: StationCreate) =>
    request('/station', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: StationUpdate) =>
    request(`/station/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) =>
    request(`/station/${id}`, { method: 'DELETE' }),

  getRegionDetail: (type?: string, province?: string) => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (province) params.append('province', province);
    return request(`/station/region-detail?${params}`);
  },
};

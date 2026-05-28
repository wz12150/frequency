const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

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

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface PageResponse<T> {
  records: T[];
  total: number;
  pageNum: number;
  pageSize: number;
}

export interface Organization {
  guid: string;
  parentId?: string;
  name: string;
  code: string;
  type: string;
  region: string;
  address: string;
  contact: string;
  phone: string;
  email: string;
  status: string;
  createTime: string;
  updateTime: string;
}

export interface OrganizationQuery {
  pageNum?: number;
  pageSize?: number;
  keyword?: string;
  name?: string;
  code?: string;
  type?: string;
  region?: string;
}

export interface OrganizationCreate {
  parentId?: string;
  name: string;
  code: string;
  type: string;
  region: string;
  address?: string;
  contact?: string;
  phone?: string;
  email?: string;
  status?: string;
}

export interface OrganizationUpdate {
  parentId?: string;
  name?: string;
  code?: string;
  type?: string;
  region?: string;
  address?: string;
  contact?: string;
  phone?: string;
  email?: string;
  status?: string;
}

export const organizationApi = {
  page: (query: OrganizationQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });
    return request(`/system/organization/page?${params}`);
  },

  get: (id: string) => request(`/system/organization/${id}`),

  create: (data: OrganizationCreate) =>
    request('/system/organization', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: OrganizationUpdate) =>
    request(`/system/organization/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) => request(`/system/organization/${id}`, { method: 'DELETE' }),

  list: () => request('/system/organization/list'),
};

export interface User {
  guid: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  roleId: string;
  roleName: string;
  orgId: string;
  orgName: string;
  status: string;
}

export interface UserQuery {
  pageNum?: number;
  pageSize?: number;
  keyword?: string;
  username?: string;
  name?: string;
  roleId?: string;
  orgId?: string;
  status?: string;
}

export interface UserCreate {
  username: string;
  password: string;
  name: string;
  email: string;
  phone?: string;
  roleId: string;
  orgId: string;
  status?: string;
}

export interface UserUpdate {
  name?: string;
  email?: string;
  phone?: string;
  roleId?: string;
  orgId?: string;
  status?: string;
}

export const userApi = {
  page: (query: UserQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });
    return request(`/system/user/page?${params}`);
  },

  get: (id: string) => request(`/system/user/${id}`),

  getByUsername: (username: string) => request(`/system/user/username/${username}`),

  create: (data: UserCreate) =>
    request('/system/user', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: UserUpdate) =>
    request(`/system/user/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  resetPassword: (id: string, newPassword: string) =>
    request(`/system/user/${id}/reset-password?newPassword=${encodeURIComponent(newPassword)}`, {
      method: 'POST',
    }),

  delete: (id: string) => request(`/system/user/${id}`, { method: 'DELETE' }),

  list: () => request('/system/user/list'),
};

export interface Role {
  guid: string;
  name: string;
  description: string;
  status: string;
  permissions: string[];
  userCount: number;
}

export interface RoleQuery {
  pageNum?: number;
  pageSize?: number;
  keyword?: string;
  name?: string;
  status?: string;
}

export interface RoleCreate {
  name: string;
  description?: string;
  status?: string;
  permissions: string[];
}

export interface RoleUpdate {
  name?: string;
  description?: string;
  status?: string;
  permissions?: string[];
}

export const roleApi = {
  page: (query: RoleQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });
    return request(`/system/role/page?${params}`);
  },

  get: (id: string) => request(`/system/role/${id}`),

  create: (data: RoleCreate) =>
    request('/system/role', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: RoleUpdate) =>
    request(`/system/role/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) => request(`/system/role/${id}`, { method: 'DELETE' }),

  list: () => request('/system/role/list'),

  getPermissions: (id: string) => request(`/system/role/${id}/permissions`),
};

// 数据字典类型
export interface DictType {
  guid: string;
  name: string;
  code: string;
  description: string;
  status: string;
  createTime: string;
  updateTime: string;
}

export interface DictTypeQuery {
  pageNum?: number;
  pageSize?: number;
  keyword?: string;
  name?: string;
  code?: string;
}

export interface DictTypeCreate {
  name: string;
  code: string;
  description?: string;
  status?: string;
}

export interface DictTypeUpdate {
  name?: string;
  code?: string;
  description?: string;
  status?: string;
}

export const dictTypeApi = {
  page: (query: DictTypeQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });
    return request(`/system/dict/type/page?${params}`);
  },

  get: (id: string) => request(`/system/dict/type/${id}`),

  create: (data: DictTypeCreate) =>
    request('/system/dict/type', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: DictTypeUpdate) =>
    request(`/system/dict/type/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) => request(`/system/dict/type/${id}`, { method: 'DELETE' }),

  list: () => request('/system/dict/type/list'),
};

// 数据字典数据
export interface DictData {
  guid: string;
  typeId: string;
  typeName?: string;
  label: string;
  value: string;
  sort: number;
  status: string;
  remark: string;
  createTime: string;
  updateTime: string;
}

export interface DictDataQuery {
  pageNum?: number;
  pageSize?: number;
  typeId?: string;
  keyword?: string;
  label?: string;
  value?: string;
}

export interface DictDataCreate {
  typeId: string;
  label: string;
  value: string;
  sort?: number;
  status?: string;
  remark?: string;
}

export interface DictDataUpdate {
  typeId?: string;
  label?: string;
  value?: string;
  sort?: number;
  status?: string;
  remark?: string;
}

export const dictDataApi = {
  page: (query: DictDataQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });
    return request(`/system/dict/data/page?${params}`);
  },

  get: (id: string) => request(`/system/dict/data/${id}`),

  create: (data: DictDataCreate) =>
    request('/system/dict/data', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: DictDataUpdate) =>
    request(`/system/dict/data/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) => request(`/system/dict/data/${id}`, { method: 'DELETE' }),

  list: (typeId: string) => request(`/system/dict/data/list?typeId=${typeId}`),
};
import { useState, useEffect } from 'react';
import { Building2, Users, Plus, Edit2, Trash2, Search, Shield, Check, Layers3, X, KeyRound } from 'lucide-react';
import { organizationApi, userApi, roleApi, type Organization, type User, type Role } from '../api/system';

type PermissionKey = 'dashboard' | 'stations' | 'licenses' | 'planning' | 'reports' | 'system';

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface PageResponse<T> {
  records: T[];
  total: number;
  pageNum: number;
  pageSize: number;
}

export function SystemManagement() {
  const [activeTab, setActiveTab] = useState<'organization' | 'users' | 'roles'>('organization');
  const [showAddOrgDialog, setShowAddOrgDialog] = useState(false);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showAddRoleDialog, setShowAddRoleDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [resetPasswordUser, setResetPasswordUser] = useState<string | null>(null);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roleData, setRoleData] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  const [newOrg, setNewOrg] = useState({
    name: '',
    code: '',
    type: '',
    region: '',
    address: '',
    contact: '',
    phone: '',
    email: '',
    status: 'enabled',
  });

  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    phone: '',
    roleId: '',
    orgId: '',
    status: 'active',
  });

  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    status: 'enabled',
    permissions: ['dashboard', 'stations'] as PermissionKey[],
  });

  const permissionCatalog: Array<{ key: PermissionKey; label: string; detail: string }> = [
    { key: 'dashboard', label: 'Dashboard', detail: 'View system summary and KPIs' },
    { key: 'stations', label: 'Station Management', detail: 'Create, update and delete station records' },
    { key: 'licenses', label: 'License Management', detail: 'Manage licensing data and lifecycle' },
    { key: 'planning', label: 'Frequency Planning', detail: 'Edit planning bands and allocations' },
    { key: 'reports', label: 'Reports & Analytics', detail: 'Access charts, exports and insights' },
    { key: 'system', label: 'System Administration', detail: 'Manage organizations, users and roles' },
  ];

  const orgTypes = ['Regional', 'Branch', 'Hub', 'Station'];

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'organization') {
        const result = await organizationApi.page({ keyword: searchTerm });
        setOrganizations((result as ApiResponse<PageResponse<Organization>>).data.records);
      } else if (activeTab === 'users') {
        const result = await userApi.page({ keyword: searchTerm });
        setUsers((result as ApiResponse<PageResponse<User>>).data.records);
      } else if (activeTab === 'roles') {
        const result = await roleApi.page();
        setRoleData((result as ApiResponse<PageResponse<Role>>).data.records);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadData();
  };

  const handleAddOrg = async () => {
    try {
      await organizationApi.create({
        name: newOrg.name,
        code: newOrg.code,
        type: newOrg.type,
        region: newOrg.region,
        address: newOrg.address,
        contact: newOrg.contact,
        phone: newOrg.phone,
        email: newOrg.email,
        status: newOrg.status,
      });
      setShowAddOrgDialog(false);
      resetOrgForm();
      loadData();
    } catch (error) {
      alert('Failed to add organization');
    }
  };

  const handleEditOrg = async () => {
    if (!editingOrg) return;
    try {
      await organizationApi.update(editingOrg.guid, {
        name: newOrg.name,
        code: newOrg.code,
        type: newOrg.type,
        region: newOrg.region,
        address: newOrg.address,
        contact: newOrg.contact,
        phone: newOrg.phone,
        email: newOrg.email,
        status: newOrg.status,
      });
      setShowAddOrgDialog(false);
      setEditingOrg(null);
      resetOrgForm();
      loadData();
    } catch (error) {
      alert('Failed to update organization');
    }
  };

  const handleDeleteOrg = async (id: string) => {
    if (!confirm('Are you sure you want to delete this organization?')) return;
    try {
      await organizationApi.delete(id);
      loadData();
    } catch (error) {
      alert('Failed to delete organization');
    }
  };

  const resetOrgForm = () => {
    setNewOrg({
      name: '',
      code: '',
      type: '',
      region: '',
      address: '',
      contact: '',
      phone: '',
      email: '',
      status: 'enabled',
    });
  };

  const handleAddUser = async () => {
    try {
      await userApi.create({
        username: newUser.username,
        password: newUser.password,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        roleId: newUser.roleId,
        orgId: newUser.orgId,
        status: newUser.status,
      });
      setShowAddUserDialog(false);
      resetUserForm();
      loadData();
    } catch (error) {
      alert('Failed to add user');
    }
  };

  const handleEditUser = async () => {
    if (!editingUser) return;
    try {
      await userApi.update(editingUser.guid, {
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        roleId: newUser.roleId,
        orgId: newUser.orgId,
        status: newUser.status,
      });
      setShowAddUserDialog(false);
      setEditingUser(null);
      resetUserForm();
      loadData();
    } catch (error) {
      alert('Failed to update user');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await userApi.delete(id);
      loadData();
    } catch (error) {
      alert('Failed to delete user');
    }
  };

  const handleResetPassword = async (id: string) => {
    if (!confirm('Are you sure you want to reset password? Password will be reset to 12345678')) return;
    try {
      await userApi.resetPassword(id, '12345678');
      setResetPasswordUser(null);
      alert('Password reset successfully');
    } catch (error) {
      alert('Failed to reset password');
    }
  };

  const resetUserForm = () => {
    setNewUser({
      username: '',
      password: '',
      name: '',
      email: '',
      phone: '',
      roleId: '',
      orgId: '',
      status: 'active',
    });
  };

  const handleAddRole = async () => {
    try {
      await roleApi.create({
        name: newRole.name,
        description: newRole.description,
        status: newRole.status,
        permissions: newRole.permissions,
      });
      setShowAddRoleDialog(false);
      resetRoleForm();
      loadData();
    } catch (error) {
      alert('Failed to add role');
    }
  };

  const handleEditRole = async () => {
    if (!editingRole) return;
    try {
      await roleApi.update(editingRole.guid, {
        name: newRole.name,
        description: newRole.description,
        status: newRole.status,
        permissions: newRole.permissions,
      });
      setShowAddRoleDialog(false);
      setEditingRole(null);
      resetRoleForm();
      loadData();
    } catch (error) {
      alert('Failed to update role');
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    try {
      await roleApi.delete(id);
      loadData();
    } catch (error) {
      alert('Failed to delete role');
    }
  };

  const resetRoleForm = () => {
    setNewRole({
      name: '',
      description: '',
      status: 'enabled',
      permissions: ['dashboard', 'stations'],
    });
  };

  const openEditOrgDialog = (org: Organization) => {
    setEditingOrg(org);
    const orgStatus = org.status === 'enabled' || org.status === 'active' ? 'enabled' : 'disabled';
    setNewOrg({
      name: org.name,
      code: org.code,
      type: org.type,
      region: org.region,
      address: org.address || '',
      contact: org.contact || '',
      phone: org.phone || '',
      email: org.email || '',
      status: orgStatus,
    });
    setShowAddOrgDialog(true);
  };

  const openEditUserDialog = (user: User) => {
    setEditingUser(user);
    setNewUser({
      username: user.username,
      password: '',
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      roleId: user.roleId || '',
      orgId: user.orgId || '',
      status: user.status || 'active',
    });
    setShowAddUserDialog(true);
  };

  const openEditRoleDialog = (role: Role) => {
    setEditingRole(role);
    setNewRole({
      name: role.name,
      description: role.description || '',
      status: role.status || 'enabled',
      permissions: role.permissions as PermissionKey[],
    });
    setShowAddRoleDialog(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">System Management</h2>
        <p className="text-muted-foreground">Organization and user management</p>
      </div>

      <div className="border-b border-border">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('organization')}
            className={`pb-3 px-2 border-b-2 transition-colors ${
              activeTab === 'organization'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Organization Settings
            </div>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-2 border-b-2 transition-colors ${
              activeTab === 'users'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              User Management
            </div>
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`pb-3 px-2 border-b-2 transition-colors ${
              activeTab === 'roles'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <Layers3 className="w-4 h-4" />
              Role Management
            </div>
          </button>
        </div>
      </div>

      {activeTab === 'organization' && (
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Search Organization</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by name or code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <button
                onClick={handleSearch}
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Search
              </button>
              <button
                onClick={() => { setShowAddOrgDialog(true); resetOrgForm(); }}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Organization
              </button>
            </div>
          </div>

          {loading ? (
            <div className="bg-card rounded-lg border border-border shadow-sm p-8 text-center">
              Loading...
            </div>
          ) : (
            <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium">Region</th>
                      <th className="px-6 py-3 text-left text-xs font-medium">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {organizations.map((org) => (
                      <tr key={org.guid} className="hover:bg-muted/50">
                        <td className="px-6 py-4 text-sm font-mono">{org.code}</td>
                        <td className="px-6 py-4 text-sm font-medium">{org.name}</td>
                        <td className="px-6 py-4 text-sm">{org.type}</td>
                        <td className="px-6 py-4 text-sm">{org.region}</td>
                        <td className="px-6 py-4 text-sm">{org.contact}</td>
                        <td className="px-6 py-4 text-sm">{org.phone}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                            org.status === 'enabled' || org.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {org.status === 'enabled' || org.status === 'active' ? 'Enabled' : 'Disabled'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditOrgDialog(org)}
                              className="p-1.5 hover:bg-muted rounded transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteOrg(org.guid)}
                              className="p-1.5 hover:bg-muted rounded transition-colors text-red-600"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Search User</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by username, name, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <button
                onClick={handleSearch}
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Search
              </button>
              <button
                onClick={() => { setShowAddUserDialog(true); resetUserForm(); }}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add User
              </button>
            </div>
          </div>

          {loading ? (
            <div className="bg-card rounded-lg border border-border shadow-sm p-8 text-center">
              Loading...
            </div>
          ) : (
            <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium">Username</th>
                      <th className="px-6 py-3 text-left text-xs font-medium">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium">Organization</th>
                      <th className="px-6 py-3 text-left text-xs font-medium">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.map((user) => (
                      <tr key={user.guid} className="hover:bg-muted/50">
                        <td className="px-6 py-4 text-sm font-mono">{user.username}</td>
                        <td className="px-6 py-4 text-sm font-medium">{user.name}</td>
                        <td className="px-6 py-4 text-sm">{user.email}</td>
                        <td className="px-6 py-4 text-sm">{user.phone}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                            {user.roleName}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">{user.orgName}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                            user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {user.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditUserDialog(user)}
                              className="p-1.5 hover:bg-muted rounded transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setResetPasswordUser(user.guid)}
                              className="p-1.5 hover:bg-muted rounded transition-colors text-amber-600"
                              title="Reset Password"
                            >
                              <KeyRound className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.guid)}
                              className="p-1.5 hover:bg-muted rounded transition-colors text-red-600"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {showAddOrgDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold">{editingOrg ? 'Edit Organization' : 'Add Organization'}</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Organization Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newOrg.name}
                    onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Organization Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newOrg.code}
                    onChange={(e) => setNewOrg({ ...newOrg, code: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newOrg.type}
                    onChange={(e) => setNewOrg({ ...newOrg, type: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select Type</option>
                    {orgTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Region <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newOrg.region}
                    onChange={(e) => setNewOrg({ ...newOrg, region: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <input
                    type="text"
                    value={newOrg.address}
                    onChange={(e) => setNewOrg({ ...newOrg, address: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Contact Person</label>
                  <input
                    type="text"
                    value={newOrg.contact}
                    onChange={(e) => setNewOrg({ ...newOrg, contact: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <input
                    type="text"
                    value={newOrg.phone}
                    onChange={(e) => setNewOrg({ ...newOrg, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={newOrg.email}
                    onChange={(e) => setNewOrg({ ...newOrg, email: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={newOrg.status}
                    onChange={(e) => setNewOrg({ ...newOrg, status: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border flex justify-end gap-3">
              <button
                onClick={() => { setShowAddOrgDialog(false); setEditingOrg(null); resetOrgForm(); }}
                className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingOrg ? handleEditOrg : handleAddOrg}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                {editingOrg ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddUserDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold">{editingUser ? 'Edit User' : 'Add User'}</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    disabled={!!editingUser}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted"
                  />
                </div>
                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <input
                    type="text"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newUser.roleId}
                    onChange={(e) => setNewUser({ ...newUser, roleId: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select Role</option>
                    {roleData.map((role) => (
                      <option key={role.guid} value={role.guid}>{role.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Organization <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newUser.orgId}
                    onChange={(e) => setNewUser({ ...newUser, orgId: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select Organization</option>
                    {organizations.map((org) => (
                      <option key={org.guid} value={org.guid}>{org.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newUser.status}
                    onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border flex justify-end gap-3">
              <button
                onClick={() => { setShowAddUserDialog(false); setEditingUser(null); resetUserForm(); }}
                className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingUser ? handleEditUser : handleAddUser}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                {editingUser ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-lg border border-border shadow-sm flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Role Management</h3>
              <p className="text-sm text-muted-foreground">Configure roles and assign permissions to control access across the system.</p>
            </div>
            <button
              onClick={() => { setShowAddRoleDialog(true); resetRoleForm(); }}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Role
            </button>
          </div>

          {loading ? (
            <div className="bg-card rounded-lg border border-border shadow-sm p-8 text-center">
              Loading...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {roleData.map((role) => (
                <div key={role.guid} className="bg-card p-6 rounded-lg border border-border shadow-sm">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Layers3 className="w-4 h-4 text-primary" />
                        <h4 className="font-semibold">{role.name}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </div>
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                      role.status === 'enabled' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {role.status === 'enabled' ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div className="rounded-lg bg-muted/60 p-3">
                      <div className="text-muted-foreground text-xs mb-1">Users</div>
                      <div className="font-semibold">{role.userCount}</div>
                    </div>
                    <div className="rounded-lg bg-muted/60 p-3">
                      <div className="text-muted-foreground text-xs mb-1">Permissions</div>
                      <div className="font-semibold">{role.permissions.length}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {role.permissions.map((permission) => {
                      const matched = permissionCatalog.find((item) => item.key === permission);
                      return (
                        <span key={permission} className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs">
                          <Check className="w-3 h-3 text-primary" />
                          {matched?.label ?? permission}
                        </span>
                      );
                    })}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditRoleDialog(role)}
                      className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm flex items-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRole(role.guid)}
                      className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm flex items-center gap-2 text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showAddRoleDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-semibold">{editingRole ? 'Edit Role' : 'Add Role'}</h3>
              <button
                onClick={() => { setShowAddRoleDialog(false); setEditingRole(null); resetRoleForm(); }}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Role Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={newRole.status}
                    onChange={(e) => setNewRole({ ...newRole, status: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={newRole.description}
                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Permissions</h4>
                  <span className="text-sm text-muted-foreground">Select the modules this role can access</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {permissionCatalog.map((permission) => (
                    <label key={permission.key} className="flex items-start gap-3 rounded-lg border border-border p-4 cursor-pointer hover:bg-muted/50">
                      <input
                        type="checkbox"
                        checked={newRole.permissions.includes(permission.key)}
                        onChange={(e) => {
                          setNewRole((prev) => ({
                            ...prev,
                            permissions: e.target.checked
                              ? [...prev.permissions, permission.key]
                              : prev.permissions.filter((item) => item !== permission.key),
                          }));
                        }}
                        className="mt-1 rounded border-border text-primary focus:ring-primary"
                      />
                      <div>
                        <div className="font-medium">{permission.label}</div>
                        <div className="text-sm text-muted-foreground">{permission.detail}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border flex justify-end gap-3">
              <button
                onClick={() => { setShowAddRoleDialog(false); setEditingRole(null); resetRoleForm(); }}
                className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingRole ? handleEditRole : handleAddRole}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                {editingRole ? 'Update Role' : 'Save Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {resetPasswordUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-semibold">Reset Password</h3>
              <button onClick={() => setResetPasswordUser(null)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Confirm reset password.
              </p>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                The password will be reset to <span className="font-semibold">12345678</span>.
              </div>
            </div>
            <div className="p-6 border-t border-border flex justify-end gap-3">
              <button onClick={() => setResetPasswordUser(null)} className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-colors">
                Cancel
              </button>
              <button
                onClick={() => { handleResetPassword(resetPasswordUser); }}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                Reset to 12345678
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState } from 'react';
import { Building2, Users, Plus, Edit2, Trash2, Search, Shield, Check, Layers3, X, KeyRound } from 'lucide-react';

type PermissionKey = 'dashboard' | 'stations' | 'licenses' | 'planning' | 'reports' | 'system';

export function SystemManagement() {
  const [activeTab, setActiveTab] = useState<'organization' | 'users' | 'roles'>('organization');
  const [showAddOrgDialog, setShowAddOrgDialog] = useState(false);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showAddRoleDialog, setShowAddRoleDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [resetPasswordUser, setResetPasswordUser] = useState<string | null>(null);

  const [newOrg, setNewOrg] = useState({
    name: '',
    code: '',
    type: '',
    region: '',
    address: '',
    contact: '',
    phone: '',
    email: '',
  });

  const [newUser, setNewUser] = useState({
    username: '',
    name: '',
    email: '',
    phone: '',
    role: '',
    organization: '',
    status: 'active',
  });

  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    status: 'enabled',
    permissions: ['dashboard', 'stations'] as PermissionKey[],
  });

  const resetRoleForm = () => {
    setNewRole({
      name: '',
      description: '',
      status: 'enabled',
      permissions: ['dashboard', 'stations'],
    });
  };

  const organizations = [
    { id: 1, name: 'Ulaanbaatar Regional Office', code: 'UB-001', type: 'Regional', region: 'Ulaanbaatar', contact: 'B. Batjargal', phone: '+976-11-123456' },
    { id: 2, name: 'Dornogovi Branch', code: 'DG-002', type: 'Branch', region: 'Dornogovi', contact: 'S. Sukhbaatar', phone: '+976-11-234567' },
    { id: 3, name: 'Central Communications Hub', code: 'CC-003', type: 'Hub', region: 'Central', contact: 'D. Dorj', phone: '+976-11-345678' },
  ];

  const users = [
    { id: 1, username: 'admin', name: 'Administrator', email: 'admin@crc.mn', phone: '+976-99-111111', role: 'System Admin', organization: 'UB-001', status: 'active' },
    { id: 2, username: 'batjargal', name: 'B. Batjargal', email: 'batjargal@crc.mn', phone: '+976-99-222222', role: 'Manager', organization: 'UB-001', status: 'active' },
    { id: 3, username: 'sukhbaatar', name: 'S. Sukhbaatar', email: 'sukhbaatar@crc.mn', phone: '+976-99-333333', role: 'Operator', organization: 'DG-002', status: 'active' },
    { id: 4, username: 'dorj', name: 'D. Dorj', email: 'dorj@crc.mn', phone: '+976-99-444444', role: 'Engineer', organization: 'CC-003', status: 'inactive' },
  ];

  const roleData = [
    { id: 1, name: 'System Admin', description: 'Full access to all system functions', status: 'enabled', users: 1, permissions: ['dashboard', 'stations', 'licenses', 'planning', 'reports', 'system'] as PermissionKey[] },
    { id: 2, name: 'Manager', description: 'Manage stations, licenses and reports', status: 'enabled', users: 3, permissions: ['dashboard', 'stations', 'licenses', 'planning', 'reports'] as PermissionKey[] },
    { id: 3, name: 'Operator', description: 'Operate daily frequency management tasks', status: 'enabled', users: 8, permissions: ['dashboard', 'stations', 'licenses'] as PermissionKey[] },
    { id: 4, name: 'Viewer', description: 'Read-only access for monitoring', status: 'disabled', users: 5, permissions: ['dashboard', 'reports'] as PermissionKey[] },
  ];

  const permissionCatalog: Array<{ key: PermissionKey; label: string; detail: string }> = [
    { key: 'dashboard', label: 'Dashboard', detail: 'View system summary and KPIs' },
    { key: 'stations', label: 'Station Management', detail: 'Create, update and delete station records' },
    { key: 'licenses', label: 'License Management', detail: 'Manage licensing data and lifecycle' },
    { key: 'planning', label: 'Frequency Planning', detail: 'Edit planning bands and allocations' },
    { key: 'reports', label: 'Reports & Analytics', detail: 'Access charts, exports and insights' },
    { key: 'system', label: 'System Administration', detail: 'Manage organizations, users and roles' },
  ];

  const orgTypes = ['Regional', 'Branch', 'Hub', 'Station'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">System Management</h2>
        <p className="text-muted-foreground">Organization and user management</p>
      </div>

      {/* Tabs */}
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

      {/* Organization Settings Tab */}
      {activeTab === 'organization' && (
        <div className="space-y-6">
          {/* Search and Actions */}
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
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <button
                onClick={() => setShowAddOrgDialog(true)}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Organization
              </button>
            </div>
          </div>

          {/* Organizations Table */}
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
                    <th className="px-6 py-3 text-left text-xs font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {organizations.map((org) => (
                    <tr key={org.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 text-sm font-mono">{org.code}</td>
                      <td className="px-6 py-4 text-sm font-medium">{org.name}</td>
                      <td className="px-6 py-4 text-sm">{org.type}</td>
                      <td className="px-6 py-4 text-sm">{org.region}</td>
                      <td className="px-6 py-4 text-sm">{org.contact}</td>
                      <td className="px-6 py-4 text-sm">{org.phone}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button className="p-1.5 hover:bg-muted rounded transition-colors" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 hover:bg-muted rounded transition-colors text-red-600" title="Delete">
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
        </div>
      )}

      {/* User Management Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Search and Actions */}
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
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <button
                onClick={() => setShowAddUserDialog(true)}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add User
              </button>
            </div>
          </div>

          {/* Users Table */}
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
                    <tr key={user.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 text-sm font-mono">{user.username}</td>
                      <td className="px-6 py-4 text-sm font-medium">{user.name}</td>
                      <td className="px-6 py-4 text-sm">{user.email}</td>
                      <td className="px-6 py-4 text-sm">{user.phone}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                          {user.role}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{user.organization}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                          user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {user.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button className="p-1.5 hover:bg-muted rounded transition-colors" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setResetPasswordUser(user.username)}
                            className="p-1.5 hover:bg-muted rounded transition-colors text-amber-600"
                            title="Reset Password"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 hover:bg-muted rounded transition-colors text-red-600" title="Delete">
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
        </div>
      )}

      {/* Add Organization Dialog */}
      {showAddOrgDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold">Add Organization</h3>
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
              </div>
            </div>
            <div className="p-6 border-t border-border flex justify-end gap-3">
              <button
                onClick={() => setShowAddOrgDialog(false)}
                className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Dialog */}
      {showAddUserDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold">Add User</h3>
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
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
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
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select Role</option>
                    {roleData.map((role) => (
                      <option key={role.id} value={role.name}>{role.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Organization <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newUser.organization}
                    onChange={(e) => setNewUser({ ...newUser, organization: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select Organization</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.code}>{org.name}</option>
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
                onClick={() => setShowAddUserDialog(false)}
                className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Management Tab */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-lg border border-border shadow-sm flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Role Management</h3>
              <p className="text-sm text-muted-foreground">Configure roles and assign permissions to control access across the system.</p>
            </div>
            <button
              onClick={() => setShowAddRoleDialog(true)}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Role
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {roleData.map((role) => (
              <div key={role.id} className="bg-card p-6 rounded-lg border border-border shadow-sm">
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
                    <div className="font-semibold">{role.users}</div>
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
                  <button className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm flex items-center gap-2">
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm flex items-center gap-2 text-red-600">
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showAddRoleDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add Role</h3>
              <button onClick={() => { setShowAddRoleDialog(false); resetRoleForm(); }} className="p-2 hover:bg-muted rounded-lg transition-colors">
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
              <button onClick={() => { setShowAddRoleDialog(false); resetRoleForm(); }} className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-colors">
                Cancel
              </button>
              <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                Save Role
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
                Confirm reset password for <span className="font-medium text-foreground">{resetPasswordUser}</span>.
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
                onClick={() => setResetPasswordUser(null)}
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

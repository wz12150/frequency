import { ReactNode, useState } from 'react';
import { Menu, ChevronLeft, Home, Map, Radio, BarChart3, FileCheck, Database, Settings, LogOut, X, Save, LockKeyhole, LayoutDashboard } from 'lucide-react';
import iconImage from '../../assets/icon.png';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout?: () => void;
}

export function Layout({ children, currentPage, onNavigate, onLogout }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: 'Administrator',
    role: 'System Admin',
    email: 'admin@crc.mn',
    phone: '+976-99-111111',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard1' },
    { id: 'dashboard2', icon: LayoutDashboard, label: 'Dashboard2' },
    { id: 'new-dashboard', icon: LayoutDashboard, label: 'Dashboard3' },
    { id: 'dashboard4', icon: LayoutDashboard, label: 'Dashboard4' },
    { id: 'station-map', icon: Map, label: 'Station Map' },
    { id: 'frequency-planning', icon: Radio, label: 'Frequency Planning' },
    { id: 'station-stats', icon: BarChart3, label: 'Station Statistics' },
    { id: 'license-analysis', icon: FileCheck, label: 'License Analysis' },
    { id: 'data-management', icon: Database, label: 'Data Management' },
    { id: 'system-management', icon: Settings, label: 'System Management' },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <div className={`${sidebarOpen ? 'w-48' : 'w-16'} bg-gradient-to-b from-[#0a3d8f] to-[#1976d2] transition-all duration-300 flex flex-col overflow-hidden`}>
        <div className="px-4 py-2 border-b border-white/20 flex items-center justify-center">
          <div className={`bg-white rounded-lg p-2 ${sidebarOpen ? 'w-32' : 'w-12'} flex items-center justify-center transition-all duration-300`}>
            <img src={iconImage} alt="Logo" className={`${sidebarOpen ? 'h-10' : 'h-6'} w-auto transition-all duration-300`} />
          </div>
        </div>

        <nav className={`flex-1 ${sidebarOpen ? 'p-3' : 'p-2'} space-y-2 overflow-y-auto`}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center ${sidebarOpen ? 'gap-2 px-3' : 'justify-center px-2'} py-3 rounded-lg transition-colors text-xs ${
                  isActive ? 'bg-white/20 text-white shadow-sm' : 'text-white/90 hover:bg-white/10'
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {sidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {sidebarOpen && (
          <div className="p-3 border-t border-white/20">
            <div className="text-white/60 text-[10px]">
              <div>Version 1.0</div>
              <div className="mt-0.5">© 2026 CRC</div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-gradient-to-r from-[#0a3d8f] via-[#1565c0] to-[#1976d2] border-b border-blue-800/40 px-6 py-4 flex items-center justify-between relative shadow-md">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/15 rounded-lg transition-colors text-white">
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <h1 className="absolute left-1/2 -translate-x-1/2 text-2xl font-bold text-white drop-shadow-sm tracking-wide">
            Frequency Management Analysis Platform
          </h1>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowProfileDialog(true)}
              className="text-right hover:opacity-90 transition-opacity"
              title="Edit Profile"
            >
              <div className="text-sm font-medium text-white">Administrator</div>
              <div className="text-xs text-blue-200">System Admin</div>
            </button>
            <button
              onClick={() => setShowProfileDialog(true)}
              className="w-10 h-10 rounded-full bg-white/20 text-white border border-white/30 flex items-center justify-center font-semibold hover:bg-white/30 transition-colors"
              title="Edit Profile"
            >
              A
            </button>
            {onLogout && (
              <button onClick={onLogout} className="p-2 hover:bg-white/15 rounded-lg transition-colors text-blue-100 hover:text-white" title="Logout">
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-hidden">{children}</main>
      </div>

      {showProfileDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold">Personal Profile</h3>
                <p className="text-sm text-muted-foreground">Update your information and password</p>
              </div>
              <button onClick={() => setShowProfileDialog(false)} className="p-2 rounded-lg hover:bg-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="rounded-2xl border border-border bg-muted/30 p-5 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-semibold">A</div>
                  <div>
                    <div className="font-semibold">Administrator</div>
                    <div className="text-sm text-muted-foreground">System Admin</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Display Name</label>
                  <input value={profileForm.name} disabled className="w-full px-4 py-2 border border-border rounded-lg bg-muted text-muted-foreground cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Role</label>
                  <input value={profileForm.role} disabled className="w-full px-4 py-2 border border-border rounded-lg bg-muted text-muted-foreground cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Email</label>
                  <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Phone</label>
                  <input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-border bg-muted/20 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <LockKeyhole className="w-4 h-4 text-primary" />
                    <h4 className="font-semibold">Change Password</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">Current Password</label>
                      <input type="password" value={profileForm.currentPassword} onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">New Password</label>
                      <input type="password" value={profileForm.newPassword} onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                      <input type="password" value={profileForm.confirmPassword} onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                  You can update your personal details and set a new password from this panel.
                </div>
              </div>
            </div>

            <div className="border-t border-border px-6 py-4 flex justify-end gap-3 bg-muted/20">
              <button onClick={() => setShowProfileDialog(false)} className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-colors">
                Cancel
              </button>
              <button onClick={() => setShowProfileDialog(false)} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

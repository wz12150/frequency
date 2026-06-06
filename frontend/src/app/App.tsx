import { useState } from 'react';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { StationMap } from './components/StationMap';
import { FrequencyPlanning } from './components/FrequencyPlanning';
import { StationStats } from './components/StationStats';
import { LicenseAnalysis } from './components/LicenseAnalysis';
import { DataManagement } from './components/DataManagement';
import { SystemManagement } from './components/SystemManagement';
import { Dashboard4 } from './components/Dashboard4';
import { NewDashboard } from './components/NewDashboard';
import { Dashboard2 } from './components/Dashboard2';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<string>('dashboard');

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('dashboard');
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':        return <Dashboard />;
      case 'station-map':      return <StationMap />;
      case 'frequency-planning': return <FrequencyPlanning />;
      case 'station-stats':    return <StationStats />;
      case 'license-analysis': return <LicenseAnalysis />;
      case 'data-management':  return <DataManagement />;
      case 'system-management': return <SystemManagement />;
      case 'new-dashboard': return <NewDashboard />;
      case 'dashboard2': return <Dashboard2 />;
      case 'dashboard4': return <Dashboard4 />;
      default:                 return <Dashboard />;
    }
  };

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      onLogout={handleLogout}
    >
      {renderPage()}
    </Layout>
  );
}

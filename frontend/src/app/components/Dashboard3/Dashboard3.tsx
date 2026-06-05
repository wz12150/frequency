import { useEffect, useState } from 'react';
import { dashboardApi, DashboardOverviewVO } from '../../api/dashboard';
import { DashboardHeader } from './DashboardHeader';
import { LeftPanel } from './LeftPanel';
import { MapSection } from './MapSection';
import { RightPanel } from './RightPanel';

interface LeftPanelData {
  totalStations: number;
  normal: number;
  expiring: number;
  expired: number;
  licenseAuthList: { label: string; value: number }[];
  stationTypeList: { name: string; value: number; color: string }[];
}

interface RightPanelData {
  growthTrend: { month: string; count: number }[];
  regionStats: { name: string; value: number; color: string }[];
}

interface MapData {
  id: string;
  name: string;
  stations: number;
}

export function Dashboard3() {
  const [apiData, setApiData] = useState<DashboardOverviewVO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.overview()
      .then((data: DashboardOverviewVO) => {
        setApiData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Left panel data
  const leftData: LeftPanelData = {
    totalStations: apiData?.totalStations ?? 0,
    normal: apiData?.normalLicenses ?? 0,
    expiring: apiData?.expiringSoon ?? 0,
    expired: apiData?.expired ?? 0,
    licenseAuthList: (apiData?.licenseTypeStats ?? []).slice(0, 6).map((l, i) => ({
      label: l.type,
      value: l.normal + l.expiring + l.expired,
    })),
    stationTypeList: (apiData?.stationTypes ?? []).map(t => ({
      name: t.name,
      value: t.value,
      color: t.color || '#00bcd4',
    })),
  };

  // Right panel data
  const rightData: RightPanelData = {
    growthTrend: apiData?.stationGrowthTrend ?? [],
    regionStats: (apiData?.provinceStats ?? [])
      .sort((a, b) => b.total - a.total)
      .slice(0, 16)
      .map((p, i) => ({
        name: p.abbr || p.name,
        value: p.total,
        color: i === 0 ? '#00bcd4' : i < 3 ? '#4ade80' : '#c86ef0',
      })),
  };

  // Map data
  const mapData: MapData[] = (apiData?.provinceStats ?? []).map(p => ({
    id: p.id,
    name: p.name,
    stations: p.total,
  }));

  return (
    <div style={{
      width: '100%', height: '100vh', minHeight: '640px',
      background: '#0d3552',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', position: 'relative',
    }}>
      {/* Dot grid background */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'radial-gradient(circle, rgba(0,140,190,0.18) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />
      {/* Vignette overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 90% 85% at 50% 50%, transparent 30%, rgba(1,5,15,0.62) 100%)',
      }} />

      {/* Main layout */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <DashboardHeader />
        <div style={{ flex: 1, display: 'flex', padding: '8px', gap: '8px', overflow: 'hidden' }}>
          <LeftPanel data={leftData} loading={loading} />
          <MapSection data={mapData} loading={loading} />
          <RightPanel data={rightData} loading={loading} />
        </div>
      </div>
    </div>
  );
}
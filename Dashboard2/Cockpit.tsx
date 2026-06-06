import React from 'react';
import { DashboardHeader } from './DashboardHeader';
import { LeftPanel } from './LeftPanel';
import { MapSection } from './MapSection';
import { RightPanel } from './RightPanel';

export default function Cockpit() {
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
          <LeftPanel />
          <MapSection />
          <RightPanel />
        </div>
      </div>
    </div>
  );
}
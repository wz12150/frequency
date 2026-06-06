import React from 'react';
import { MongoliaMap } from './MongoliaMap';

interface MapSectionProps {
  data: { id: string; name: string; stations: number }[];
  loading: boolean;
}

export function MapSection({ data, loading }: MapSectionProps) {
  return (
    <div style={{
      flex: 1,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {/* Decorative rings */}
      <style>{`
        @keyframes mcw  { to { transform:rotate(360deg);  } }
        @keyframes mccw { to { transform:rotate(-360deg); } }
      `}</style>

      {/* Ring 1 */}
      <div style={{
        position: 'absolute',
        width: '620px',
        height: '620px',
        top: '50%',
        left: '50%',
        marginLeft: '-310px',
        marginTop: '-310px',
        animation: 'mcw 50s linear infinite',
        pointerEvents: 'none',
      }}>
        <svg width="620" height="620" viewBox="0 0 620 620">
          <circle cx="310" cy="310" r="305" fill="none" stroke="#00d4f0" strokeWidth="0.8" strokeDasharray="11 9" opacity="0.2" />
        </svg>
      </div>

      {/* Ring 2 */}
      <div style={{
        position: 'absolute',
        width: '572px',
        height: '572px',
        top: '50%',
        left: '50%',
        marginLeft: '-286px',
        marginTop: '-286px',
        animation: 'mccw 30s linear infinite',
        pointerEvents: 'none',
      }}>
        <svg width="572" height="572" viewBox="0 0 572 572">
          <circle cx="286" cy="286" r="282" fill="none" stroke="#00aac8" strokeWidth="1.6" strokeDasharray="26 10" opacity="0.48" />
          <circle cx="286" cy="286" r="282" fill="none" stroke="#00e5ff" strokeWidth="3.5" strokeDasharray="65 700" opacity="0.8" strokeLinecap="round" />
          <circle cx="286" cy="286" r="282" fill="none" stroke="#00e5ff" strokeWidth="2" strokeDasharray="28 700" strokeDashoffset="-220" opacity="0.55" strokeLinecap="round" />
          <circle cx="286" cy="286" r="282" fill="none" stroke="#ffb800" strokeWidth="2" strokeDasharray="18 700" strokeDashoffset="-400" opacity="0.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Ring 3 */}
      <div style={{
        position: 'absolute',
        width: '524px',
        height: '524px',
        top: '50%',
        left: '50%',
        marginLeft: '-262px',
        marginTop: '-262px',
        animation: 'mcw 22s linear infinite',
        pointerEvents: 'none',
      }}>
        <svg width="524" height="524" viewBox="0 0 524 524">
          <circle cx="262" cy="262" r="258" fill="none" stroke="#004d65" strokeWidth="1" strokeDasharray="3 16" opacity="0.6" />
        </svg>
      </div>

      {/* Static inner border */}
      <div style={{
        position: 'absolute',
        width: '492px',
        height: '492px',
        top: '50%',
        left: '50%',
        marginLeft: '-246px',
        marginTop: '-246px',
        borderRadius: '50%',
        border: '1px solid rgba(0,160,200,0.09)',
        pointerEvents: 'none',
      }} />

      {/* Cardinal tick dots */}
      <div style={{
        position: 'absolute',
        width: '572px',
        height: '572px',
        top: '50%',
        left: '50%',
        marginLeft: '-286px',
        marginTop: '-286px',
        pointerEvents: 'none',
      }}>
        <svg width="572" height="572" viewBox="0 0 572 572">
          {[0, 90, 180, 270].map((deg, i) => {
            const r = 282;
            const rad = (deg * Math.PI) / 180;
            const cx = 286 + r * Math.cos(rad);
            const cy = 286 + r * Math.sin(rad);
            return (
              <g key={`cardinal-${i}`}>
                <circle cx={cx} cy={cy} r="5" fill="#00e5ff" opacity="0.9" />
                <circle cx={cx} cy={cy} r="10" fill="none" stroke="#00e5ff" strokeWidth="1" opacity="0.3" />
              </g>
            );
          })}
          {[45, 135, 225, 315].map((deg, i) => {
            const r = 282;
            const rad = (deg * Math.PI) / 180;
            const cx = 286 + r * Math.cos(rad);
            const cy = 286 + r * Math.sin(rad);
            return <circle key={`diag-${i}`} cx={cx} cy={cy} r="2.5" fill="#00bcd4" opacity="0.5" />;
          })}
        </svg>
      </div>

      {/* Mongolia Map */}
      <div style={{ position: 'relative', width: '100%', height: '100%', zIndex: 2 }}>
        <MongoliaMap data={data} loading={loading} />
      </div>
    </div>
  );
}
import React from 'react';
import { MAP_IMG as mapImg } from './mapImg';

interface ProvinceBadge {
  name: string;
  x: number;
  y: number;
  n: number;
}

interface MapSectionProps {
  data: { id: string; name: string; stations: number }[];
  loading: boolean;
}

// Province id → approximate x/y percentage on the 704×374 map container
const PROVINCE_LAYOUT: Record<string, { x: number; y: number }> = {
  'ulaanbaatar':   { x: 64.5, y: 47 },
  'tov':          { x: 59.5, y: 53 },
  'selenge':      { x: 55.5, y: 23 },
  'darkhan-uul':  { x: 63,   y: 22 },
  'dornogovi':    { x: 64,   y: 67 },
  'khentii':      { x: 72.5, y: 39 },
  'khovsgol':     { x: 39,   y: 24 },
  'dornod':       { x: 83,   y: 43 },
  'arkhangai':    { x: 41.5, y: 47 },
  'bulgan':       { x: 49,   y: 30 },
  'ovorkhangai':  { x: 47.5, y: 59 },
  'sukhbaatar':   { x: 74.5, y: 61 },
  'zavkhan':      { x: 29,   y: 42 },
  'khovd':        { x: 18.5, y: 57 },
  'omnogovi':     { x: 43,   y: 73 },
  'bayankhongor': { x: 37,   y: 62 },
  'uvs':          { x: 19,   y: 32 },
  'dundgovi':     { x: 54,   y: 60 },
  'bayan-olgii':  { x: 8.5,  y: 44 },
  'govisumber':   { x: 68,   y: 56 },
  'govi-altai':   { x: 25,   y: 62 },
  'orkhon':       { x: 60,   y: 28 },
};

export function MapSection({ data, loading }: MapSectionProps) {
  const badges: ProvinceBadge[] = data.map(p => {
    const layout = PROVINCE_LAYOUT[p.id] ?? PROVINCE_LAYOUT[p.id.toLowerCase().replace(/\s+/g, '-')];
    return {
      name: p.name,
      x: layout?.x ?? 50,
      y: layout?.y ?? 50,
      n: p.stations,
    };
  });

  return (
    <div style={{
      flex: 1, position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes mcw  { to { transform:rotate(360deg);  } }
        @keyframes mccw { to { transform:rotate(-360deg); } }
        @keyframes mcw2 { to { transform:rotate(360deg);  } }
      `}</style>

      {/* Ring 1 */}
      <div style={{ position:'absolute', width:'620px', height:'620px', top:'50%', left:'50%', marginLeft:'-310px', marginTop:'-310px', animation:'mcw 50s linear infinite', pointerEvents:'none' }}>
        <svg width="620" height="620" viewBox="0 0 620 620">
          <circle cx="310" cy="310" r="305" fill="none" stroke="#00d4f0" strokeWidth="0.8" strokeDasharray="11 9" opacity="0.2"/>
        </svg>
      </div>

      {/* Ring 2 */}
      <div style={{ position:'absolute', width:'572px', height:'572px', top:'50%', left:'50%', marginLeft:'-286px', marginTop:'-286px', animation:'mccw 30s linear infinite', pointerEvents:'none' }}>
        <svg width="572" height="572" viewBox="0 0 572 572">
          <circle cx="286" cy="286" r="282" fill="none" stroke="#00aac8" strokeWidth="1.6" strokeDasharray="26 10" opacity="0.48"/>
          <circle cx="286" cy="286" r="282" fill="none" stroke="#00e5ff" strokeWidth="3.5" strokeDasharray="65 700" opacity="0.8" strokeLinecap="round"/>
          <circle cx="286" cy="286" r="282" fill="none" stroke="#00e5ff" strokeWidth="2" strokeDasharray="28 700" strokeDashoffset="-220" opacity="0.55" strokeLinecap="round"/>
          <circle cx="286" cy="286" r="282" fill="none" stroke="#ffb800" strokeWidth="2" strokeDasharray="18 700" strokeDashoffset="-400" opacity="0.5" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Ring 3 */}
      <div style={{ position:'absolute', width:'524px', height:'524px', top:'50%', left:'50%', marginLeft:'-262px', marginTop:'-262px', animation:'mcw2 22s linear infinite', pointerEvents:'none' }}>
        <svg width="524" height="524" viewBox="0 0 524 524">
          <circle cx="262" cy="262" r="258" fill="none" stroke="#004d65" strokeWidth="1" strokeDasharray="3 16" opacity="0.6"/>
        </svg>
      </div>

      {/* Static inner border */}
      <div style={{ position:'absolute', width:'492px', height:'492px', top:'50%', left:'50%', marginLeft:'-246px', marginTop:'-246px', borderRadius:'50%', border:'1px solid rgba(0,160,200,0.09)', pointerEvents:'none' }}/>

      {/* Cardinal tick dots */}
      <div style={{ position:'absolute', width:'572px', height:'572px', top:'50%', left:'50%', marginLeft:'-286px', marginTop:'-286px', pointerEvents:'none' }}>
        <svg width="572" height="572" viewBox="0 0 572 572">
          {[0,90,180,270].map((deg,i) => {
            const r=282, rad=(deg*Math.PI)/180;
            const cx=286+r*Math.cos(rad), cy=286+r*Math.sin(rad);
            return <g key={`cardinal-${i}`}><circle cx={cx} cy={cy} r="5" fill="#00e5ff" opacity="0.9"/><circle cx={cx} cy={cy} r="10" fill="none" stroke="#00e5ff" strokeWidth="1" opacity="0.3"/></g>;
          })}
          {[45,135,225,315].map((deg,i) => {
            const r=282, rad=(deg*Math.PI)/180;
            const cx=286+r*Math.cos(rad), cy=286+r*Math.sin(rad);
            return <circle key={`diag-${i}`} cx={cx} cy={cy} r="2.5" fill="#00bcd4" opacity="0.5"/>;
          })}
        </svg>
      </div>

      {/* Map image + province badge overlay */}
      <div style={{ position:'relative', width:'704px', height:'374px' }}>
        <img src={mapImg} alt="Mongolia map" style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', objectFit:'fill', display:'block' }} />

        {loading ? (
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', color:'#00e5ff', fontSize:'13px', zIndex:10 }}>Loading map data…</div>
        ) : (
          badges.map(p => (
            <div key={p.name} style={{
              position:'absolute', left:`${p.x}%`, top:`${p.y}%`,
              transform:'translate(-50%,-50%)', textAlign:'center', pointerEvents:'none', zIndex:2,
            }}>
              <div style={{
                display:'inline-block', background:'rgba(1,11,30,0.86)',
                border:'1px solid rgba(0,210,255,0.8)', borderRadius:'2px', padding:'0 4px',
                lineHeight:'15px', color:'#00e5ff', fontSize:'9px', fontWeight:700,
                fontFamily:'sans-serif', boxShadow:'0 0 7px rgba(0,200,255,0.3)', whiteSpace:'nowrap',
              }}>{p.n}</div>
              <div style={{ color:'#90c8dc', fontSize:'7px', marginTop:'1px', fontFamily:'sans-serif', whiteSpace:'nowrap', textShadow:'0 1px 4px rgba(0,0,0,0.95)' }}>{p.name}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
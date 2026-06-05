import React from 'react';
import { MAP_IMG as mapImg } from './mapImg';

/* ── Province badge data (x/y as % of the 500×250 map container) ── */
const PROVINCES = [
  { name:'Bayan-Ölgiy', x:8.5,  y:44,  n:35 },
  { name:'Uvs',         x:19,   y:32,  n:45 },
  { name:'Hovd',        x:18.5, y:57,  n:24 },
  { name:'Dzavhan',     x:29,   y:42,  n:48 },
  { name:'Hövsgöl',     x:39,   y:24,  n:35 },
  { name:'Bulgan',      x:49,   y:30,  n:30 },
  { name:'Selenge',     x:55.5, y:23,  n:4  },
  { name:'Orhon',       x:60,   y:28,  n:8  },
  { name:'Darhan-Uul',  x:63,   y:22,  n:36 },
  { name:'Arhangay',    x:41.5, y:47,  n:51 },
  { name:'Govi-Altay',  x:25,   y:62,  n:39 },
  { name:'Bayanhongor', x:37,   y:62,  n:38 },
  { name:'Övorhangay',  x:47.5, y:59,  n:64 },
  { name:'Ömnögovi',    x:43,   y:73,  n:28 },
  { name:'Dundgovi',    x:54,   y:60,  n:45 },
  { name:'Tov',         x:59.5, y:53,  n:60 },
  { name:'Ulaanbaatar', x:64.5, y:47,  n:50 },
  { name:'Govi-Sümber', x:68,   y:56,  n:12 },
  { name:'Dornogovi',   x:64,   y:67,  n:29 },
  { name:'Hentiy',      x:72.5, y:39,  n:35 },
  { name:'Sükhbaatar',  x:74.5, y:61,  n:24 },
  { name:'Dornod',      x:83,   y:43,  n:20 },
];

export function MapSection() {
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

      {/* ── Ring 1 – outermost fine dashes CW ── */}
      <div style={{ position:'absolute', width:'620px', height:'620px', top:'50%', left:'50%', marginLeft:'-310px', marginTop:'-310px', animation:'mcw 50s linear infinite', pointerEvents:'none' }}>
        <svg width="620" height="620" viewBox="0 0 620 620">
          <circle cx="310" cy="310" r="305" fill="none" stroke="#00d4f0" strokeWidth="0.8" strokeDasharray="11 9" opacity="0.2"/>
        </svg>
      </div>

      {/* ── Ring 2 – main ring with bright arcs CCW ── */}
      <div style={{ position:'absolute', width:'572px', height:'572px', top:'50%', left:'50%', marginLeft:'-286px', marginTop:'-286px', animation:'mccw 30s linear infinite', pointerEvents:'none' }}>
        <svg width="572" height="572" viewBox="0 0 572 572">
          <circle cx="286" cy="286" r="282" fill="none" stroke="#00aac8" strokeWidth="1.6" strokeDasharray="26 10" opacity="0.48"/>
          <circle cx="286" cy="286" r="282" fill="none" stroke="#00e5ff" strokeWidth="3.5" strokeDasharray="65 700" opacity="0.8" strokeLinecap="round"/>
          <circle cx="286" cy="286" r="282" fill="none" stroke="#00e5ff" strokeWidth="2" strokeDasharray="28 700" strokeDashoffset="-220" opacity="0.55" strokeLinecap="round"/>
          <circle cx="286" cy="286" r="282" fill="none" stroke="#ffb800" strokeWidth="2" strokeDasharray="18 700" strokeDashoffset="-400" opacity="0.5" strokeLinecap="round"/>
        </svg>
      </div>

      {/* ── Ring 3 – inner small dots CW ── */}
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

      {/* ── Map image + province badge overlay ── */}
      <div style={{ position:'relative', width:'704px', height:'374px' }}>

        {/* Mongolia map PNG */}
        <img
          src={mapImg}
          alt="Mongolia map"
          style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', objectFit:'fill', display:'block' }}
        />

        {/* Province badges (HTML, positioned as % of container) */}
        {PROVINCES.map(p => (
          <div key={p.name} style={{
            position:'absolute',
            left:`${p.x}%`, top:`${p.y}%`,
            transform:'translate(-50%,-50%)',
            textAlign:'center', pointerEvents:'none', zIndex:2,
          }}>
            <div style={{
              display:'inline-block',
              background:'rgba(1,11,30,0.86)',
              border:'1px solid rgba(0,210,255,0.8)',
              borderRadius:'2px', padding:'0 4px',
              lineHeight:'15px', color:'#00e5ff',
              fontSize:'9px', fontWeight:700,
              fontFamily:'sans-serif',
              boxShadow:'0 0 7px rgba(0,200,255,0.3)',
              whiteSpace:'nowrap',
            }}>{p.n}</div>
            <div style={{
              color:'#90c8dc', fontSize:'7px', marginTop:'1px',
              fontFamily:'sans-serif', whiteSpace:'nowrap',
              textShadow:'0 1px 4px rgba(0,0,0,0.95)',
            }}>{p.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

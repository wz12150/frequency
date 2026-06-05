import React from 'react';

const CARD: React.CSSProperties = {
  background: 'rgba(15,48,88,0.92)',
  border: '1px solid rgba(0,160,210,0.3)',
  borderRadius: '4px', padding: '10px 12px',
  boxShadow: 'inset 0 0 30px rgba(0,100,160,0.06)',
};

function STitle({ text }: { text: string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'7px', marginBottom:'5px' }}>
      <div style={{ width:'3px', height:'13px', borderRadius:'2px', background:'linear-gradient(180deg,#00e5ff,#006aaa)', flexShrink:0 }} />
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="6.5" stroke="#00bcd4" strokeWidth="1" fill="none" opacity="0.45"/>
        <circle cx="7" cy="7" r="3.8" stroke="#00bcd4" strokeWidth="1" fill="none" opacity="0.7"/>
        <circle cx="7" cy="7" r="1.4" fill="#00bcd4" opacity="0.9"/>
        <line x1="7" y1="0.5" x2="7" y2="3.2" stroke="#00bcd4" strokeWidth="1" opacity="0.6"/>
        <line x1="13.5" y1="7" x2="10.8" y2="7" stroke="#00bcd4" strokeWidth="1" opacity="0.6"/>
        <line x1="7" y1="13.5" x2="7" y2="10.8" stroke="#00bcd4" strokeWidth="1" opacity="0.6"/>
        <line x1="0.5" y1="7" x2="3.2" y2="7" stroke="#00bcd4" strokeWidth="1" opacity="0.6"/>
      </svg>
      <span style={{ color:'#d8eeff', fontSize:'12px', fontWeight:600, letterSpacing:'1px', fontFamily:'sans-serif' }}>{text}</span>
    </div>
  );
}

const LINE_D = [
  {t:'12:01',v:5},{t:'12:02',v:12},{t:'12:03',v:8},{t:'12:04',v:16},{t:'12:05',v:10},
  {t:'12:06',v:18},{t:'12:07',v:7},{t:'12:08',v:14},{t:'12:09',v:11},{t:'12:10',v:15},
];
const BAR_D = [
  {label:'1',v:12},{label:'2',v:7},{label:'3',v:15},{label:'4',v:9},
  {label:'5',v:18},{label:'6',v:5},{label:'7',v:14},{label:'8',v:10},
  {label:'9',v:16},{label:'10',v:8},{label:'11',v:13},{label:'12',v:17},
  {label:'13',v:6},{label:'14',v:11},{label:'15',v:4},{label:'16',v:19},
];
const REGIONS = [
  { name:'Ulaanbaatar', val:50, color:'#00bcd4' },
  { name:'Govi-Sümber', val:12, color:'#00bcd4' },
  { name:'Tov',         val:60, color:'#4ade80' },
  { name:'Darhan-Uul',  val:36, color:'#c86ef0' },
  { name:'Orhon',       val:8,  color:'#00bcd4' },
  { name:'Bulgan',      val:30, color:'#4ade80' },
  { name:'Hentiy',      val:35, color:'#ffd700' },
];

/* ── SVG line chart ── */
function LineChartSVG() {
  const W = 258, H = 92;
  const ml = 20, mr = 6, mt = 4, mb = 14;
  const pw = W - ml - mr; // 232
  const ph = H - mt - mb; // 74
  const maxV = 20;
  const n = LINE_D.length;
  const xOf = (i: number) => ml + (i / (n - 1)) * pw;
  const yOf = (v: number) => mt + ph - (v / maxV) * ph;
  const pts = LINE_D.map((d, i) => `${xOf(i).toFixed(1)},${yOf(d.v).toFixed(1)}`).join(' ');
  const yTicks = [0, 5, 10, 15, 20];
  const gridStroke = 'rgba(0,130,170,0.14)';
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display:'block' }}>
      {/* grid */}
      {yTicks.map((t, i) => (
        <line key={`lg-${i}`} x1={ml} x2={ml + pw} y1={yOf(t)} y2={yOf(t)} stroke={gridStroke} strokeDasharray="3 3"/>
      ))}
      {/* y-axis labels */}
      {yTicks.map((t, i) => (
        <text key={`ly-${i}`} x={ml - 3} y={yOf(t) + 3} textAnchor="end" fill="#2d5868" fontSize={8} fontFamily="sans-serif">{t}</text>
      ))}
      {/* x-axis labels */}
      {LINE_D.map((d, i) => (
        <text key={`lx-${i}`} x={xOf(i)} y={H - 2} textAnchor="middle" fill="#2d5868" fontSize={8} fontFamily="sans-serif">{d.t.slice(3)}</text>
      ))}
      {/* line */}
      <polyline points={pts} fill="none" stroke="#4ade80" strokeWidth={1.5}/>
      {/* dots */}
      {LINE_D.map((d, i) => (
        <circle key={`ld-${i}`} cx={xOf(i)} cy={yOf(d.v)} r={2.5} fill="#4ade80"/>
      ))}
    </svg>
  );
}

/* ── SVG bar chart ── */
function BarChartSVG() {
  const W = 258, H = 108;
  const ml = 20, mr = 6, mt = 4, mb = 14;
  const pw = W - ml - mr; // 232
  const ph = H - mt - mb; // 90
  const maxV = 20;
  const n = BAR_D.length;
  const slotW = pw / n;
  const barW = Math.min(9, slotW * 0.65);
  const xOf = (i: number) => ml + i * slotW + (slotW - barW) / 2;
  const yOf = (v: number) => mt + ph - (v / maxV) * ph;
  const barH = (v: number) => (v / maxV) * ph;
  const yTicks = [0, 5, 10, 15, 20];
  const gridStroke = 'rgba(0,130,170,0.14)';
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display:'block' }}>
      {/* grid */}
      {yTicks.map((t, i) => (
        <line key={`bg-${i}`} x1={ml} x2={ml + pw} y1={yOf(t)} y2={yOf(t)} stroke={gridStroke} strokeDasharray="3 3"/>
      ))}
      {/* y-axis labels */}
      {yTicks.map((t, i) => (
        <text key={`by-${i}`} x={ml - 3} y={yOf(t) + 3} textAnchor="end" fill="#2d5868" fontSize={8} fontFamily="sans-serif">{t}</text>
      ))}
      {/* x-axis labels – every 2nd to avoid crowding */}
      {BAR_D.map((d, i) => i % 2 === 0 ? (
        <text key={`bx-${i}`} x={xOf(i) + barW / 2} y={H - 2} textAnchor="middle" fill="#2d5868" fontSize={8} fontFamily="sans-serif">{d.label}</text>
      ) : null)}
      {/* bars */}
      {BAR_D.map((d, i) => (
        <rect key={`br-${i}`} x={xOf(i)} y={yOf(d.v)} width={barW} height={barH(d.v)} fill="#00bcd4" rx={2}/>
      ))}
    </svg>
  );
}

export function RightPanel() {
  return (
    <div style={{ width:'282px', minWidth:'282px', display:'flex', flexDirection:'column', gap:'8px', overflow:'hidden' }}>

      {/* Line chart */}
      <div style={CARD}>
        <STitle text="Station Growth Rate" />
        <div style={{ textAlign:'right', color:'#2d5868', fontSize:'10px', marginBottom:'2px', fontFamily:'sans-serif' }}>Growth Rate</div>
        <LineChartSVG />
      </div>

      {/* Bar chart */}
      <div style={CARD}>
        <STitle text="Regional Station Count" />
        <BarChartSVG />
      </div>

      {/* Region list */}
      <div style={{ ...CARD, flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'5px', marginBottom:'10px' }}>
          <div style={{ width:0, height:0, borderTop:'4px solid transparent', borderBottom:'4px solid transparent', borderLeft:'7px solid #ffb800' }}/>
          <span style={{ color:'#7ab4cc', fontSize:'11px', fontFamily:'sans-serif' }}>Regional Station Details</span>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'7px' }}>
          {REGIONS.map(r => (
            <div key={r.name} style={{ display:'flex', alignItems:'center', gap:'7px' }}>
              <span style={{ color:'#7ab4cc', fontSize:'10px', width:'88px', flexShrink:0, fontFamily:'sans-serif' }}>{r.name}</span>
              <div style={{ flex:1, background:'rgba(0,15,42,0.8)', borderRadius:'2px', height:'15px', overflow:'hidden' }}>
                <div style={{ width:`${(r.val/60)*100}%`, height:'100%', background:r.color, borderRadius:'2px', display:'flex', alignItems:'center', justifyContent:'flex-end', paddingRight:'5px', minWidth:'22px' }}>
                  <span style={{ color:'#fff', fontSize:'10px', fontWeight:700, fontFamily:'sans-serif' }}>{r.val}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

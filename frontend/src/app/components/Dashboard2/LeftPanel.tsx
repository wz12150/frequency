import React from 'react';

interface LeftPanelProps {
  data: {
    totalStations: number;
    normal: number;
    expiring: number;
    expired: number;
    licenseAuthList: { label: string; value: number }[];
    stationTypeList: { name: string; value: number; color: string }[];
  };
  loading: boolean;
}

const CARD: React.CSSProperties = {
  background: 'rgba(15,48,88,0.92)',
  border: '1px solid rgba(0,160,210,0.3)',
  borderRadius: '4px', padding: '10px 12px',
  boxShadow: 'inset 0 0 30px rgba(0,100,160,0.06)',
};

function STitle({ text }: { text: string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'7px', marginBottom:'10px' }}>
      <div style={{ width:'3px', height:'14px', borderRadius:'2px', background:'linear-gradient(180deg,#00e5ff,#006aaa)', flexShrink:0 }} />
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="7.5" cy="7.5" r="7" stroke="#00bcd4" strokeWidth="1" fill="none" opacity="0.45"/>
        <circle cx="7.5" cy="7.5" r="4.2" stroke="#00bcd4" strokeWidth="1" fill="none" opacity="0.7"/>
        <circle cx="7.5" cy="7.5" r="1.5" fill="#00bcd4" opacity="0.9"/>
        <line x1="7.5" y1="0.5" x2="7.5" y2="3.3" stroke="#00bcd4" strokeWidth="1" opacity="0.6"/>
        <line x1="14.5" y1="7.5" x2="11.7" y2="7.5" stroke="#00bcd4" strokeWidth="1" opacity="0.6"/>
        <line x1="7.5" y1="14.5" x2="7.5" y2="11.7" stroke="#00bcd4" strokeWidth="1" opacity="0.6"/>
        <line x1="0.5" y1="7.5" x2="3.3" y2="7.5" stroke="#00bcd4" strokeWidth="1" opacity="0.6"/>
      </svg>
      <span style={{ color:'#d8eeff', fontSize:'12px', fontWeight:600, letterSpacing:'1px', fontFamily:'sans-serif' }}>{text}</span>
    </div>
  );
}

function SubLabel({ text }: { text: string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'5px', marginBottom:'8px' }}>
      <div style={{ width:0, height:0, borderTop:'4px solid transparent', borderBottom:'4px solid transparent', borderLeft:'7px solid #ffb800' }} />
      <span style={{ color:'#7ab4cc', fontSize:'11px', fontFamily:'sans-serif' }}>{text}</span>
    </div>
  );
}

function StatCard({ type, value, label }: { type:'ok'|'warn'|'err', value:string, label:string }) {
  const C = {
    ok:   { bg:'rgba(0,180,220,0.07)',  bdr:'rgba(0,180,220,0.42)',  txt:'#00e5ff' },
    warn: { bg:'rgba(200,140,0,0.07)',  bdr:'rgba(200,140,0,0.42)',  txt:'#ffb800' },
    err:  { bg:'rgba(210,40,40,0.07)', bdr:'rgba(210,40,40,0.42)',  txt:'#ff4040' },
  }[type];
  return (
    <div style={{ flex:1, background:C.bg, border:`1px solid ${C.bdr}`, borderRadius:'4px', padding:'7px 4px 8px', display:'flex', flexDirection:'column', alignItems:'center', gap:'3px' }}>
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <circle cx="13" cy="13" r="12" stroke={C.txt} strokeWidth="1" fill="none" opacity="0.3"/>
        <circle cx="13" cy="13" r="7.5" stroke={C.txt} strokeWidth="1" fill="none" opacity="0.6"/>
        {type === 'ok'   && <><circle cx="13" cy="13" r="2.2" fill={C.txt}/><line x1="13" y1="1" x2="13" y2="5.5" stroke={C.txt} strokeWidth="1.4"/><line x1="13" y1="20.5" x2="13" y2="25" stroke={C.txt} strokeWidth="1.4"/><line x1="1" y1="13" x2="5.5" y2="13" stroke={C.txt} strokeWidth="1.4"/><line x1="20.5" y1="13" x2="25" y2="13" stroke={C.txt} strokeWidth="1.4"/></>}
        {type === 'warn' && <><circle cx="13" cy="13" r="1.5" fill={C.txt}/><path d="M13 7.5 L13 13" stroke={C.txt} strokeWidth="1.8" strokeLinecap="round"/><path d="M13 13 L17 17" stroke={C.txt} strokeWidth="1.4" strokeLinecap="round"/></>}
        {type === 'err'  && <><line x1="9" y1="9" x2="17" y2="17" stroke={C.txt} strokeWidth="1.8" strokeLinecap="round"/><line x1="17" y1="9" x2="9" y2="17" stroke={C.txt} strokeWidth="1.8" strokeLinecap="round"/></>}
      </svg>
      <span style={{ color:C.txt, fontSize:'20px', fontWeight:700, lineHeight:1, fontFamily:'sans-serif' }}>{value}</span>
      <span style={{ color:'#7ab4cc', fontSize:'10px', fontFamily:'sans-serif' }}>{label}</span>
    </div>
  );
}

function DonutSVG({ slices, total }: { slices: { name: string; pct: number; color: string }[]; total: number }) {
  const cx = 53, cy = 53, innerR = 33, outerR = 51, gap = 0.03;
  let angle = -Math.PI / 2;
  const paths = slices.map((d, i) => {
    const sweep = (d.pct / 100) * 2 * Math.PI - gap;
    const a1 = angle + gap / 2;
    const a2 = a1 + sweep;
    const x1 = cx + outerR * Math.cos(a1), y1 = cy + outerR * Math.sin(a1);
    const x2 = cx + outerR * Math.cos(a2), y2 = cy + outerR * Math.sin(a2);
    const ix1 = cx + innerR * Math.cos(a1), iy1 = cy + innerR * Math.sin(a1);
    const ix2 = cx + innerR * Math.cos(a2), iy2 = cy + innerR * Math.sin(a2);
    const large = sweep > Math.PI ? 1 : 0;
    const path = `M${x1.toFixed(2)},${y1.toFixed(2)} A${outerR},${outerR} 0 ${large} 1 ${x2.toFixed(2)},${y2.toFixed(2)} L${ix2.toFixed(2)},${iy2.toFixed(2)} A${innerR},${innerR} 0 ${large} 0 ${ix1.toFixed(2)},${iy1.toFixed(2)} Z`;
    angle += (d.pct / 100) * 2 * Math.PI;
    return <path key={`ds-${i}`} d={path} fill={d.color}/>;
  });
  return (
    <div style={{ position:'relative', width:'106px', height:'106px', flexShrink:0 }}>
      <svg width="106" height="106" viewBox="0 0 106 106" style={{ display:'block' }}>
        {paths}
      </svg>
      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', textAlign:'center', pointerEvents:'none' }}>
        <div style={{ color:'#00e5ff', fontSize:'15px', fontWeight:700, lineHeight:1, fontFamily:'sans-serif' }}>{total.toLocaleString()}</div>
        <div style={{ color:'#7ab4cc', fontSize:'9px', marginTop:'2px', fontFamily:'sans-serif' }}>Total</div>
      </div>
    </div>
  );
}

export function LeftPanel({ data, loading }: LeftPanelProps) {
  const total = data.totalStations;
  const stationTypeList = data.stationTypeList;

  // Vibrant color palette for pie chart
  const vibrantColors = [
    '#ff4757', // vivid red
    '#2ed573', // bright green
    '#ffa502', // vivid orange
    '#1e90ff', // dodger blue
    '#ff6b9d', // hot pink
    '#a55eea', // bright purple
    '#ff6348', // tomato
    '#00d2d3', // cyan
    '#f368e0', // magenta pink
    '#ff9f43', // amber
    '#10ac84', // emerald
    '#5f27cd', // purple
  ];

  const fallbackSlices = [
    { name: 'Mobile', pct: 20, color: '#ff4757' },
    { name: 'Broadcast', pct: 16, color: '#2ed573' },
    { name: 'Radio', pct: 14, color: '#ffa502' },
    { name: 'Aviation', pct: 35, color: '#1e90ff' },
    { name: 'Maritime', pct: 15, color: '#ff6b9d' },
  ];

  const donutSlices = stationTypeList.length > 0
    ? stationTypeList.map((t, i) => ({
        name: t.name,
        pct: total > 0 ? (t.value / total) * 100 : 0,
        color: t.color || vibrantColors[i % vibrantColors.length]
      }))
    : fallbackSlices;

  const maxVal = Math.max(...(stationTypeList.length > 0 ? stationTypeList : fallbackSlices).map(s => s.value ?? 0), 1);

  return (
    <div style={{ width:'282px', minWidth:'282px', display:'flex', flexDirection:'column', gap:'8px', overflow:'hidden' }}>

      {/* Card 1: Frequency Authorization */}
      <div style={CARD}>
        <STitle text="Frequency Authorization" />
        <div style={{ display:'flex', gap:'7px', marginBottom:'12px' }}>
          <StatCard type="ok"   value={loading ? '-' : String(data.normal)}   label="Normal" />
          <StatCard type="warn" value={loading ? '-' : String(data.expiring)} label="Expiring" />
          <StatCard type="err"  value={loading ? '-' : String(data.expired)}  label="Expired" />
        </div>
        <div style={{ height:'1px', background:'rgba(0,150,200,0.18)', marginBottom:'9px' }} />
        <SubLabel text="Licensed Stations" />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', rowGap:'5px', columnGap:'4px' }}>
          {data.licenseAuthList.map((item, i) => (
            <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'4px' }}>
              <div style={{ width:'7px', height:'7px', borderRadius:'1px', background:'#1050a0', flexShrink:0, marginTop:'2px' }} />
              <span style={{ color:'#7ab4cc', fontSize:'10px', lineHeight:1.5, fontFamily:'sans-serif' }}>
                {i+1} {item.label}: {loading ? '-' : item.value.toLocaleString()}
              </span>
            </div>
          ))}
          {data.licenseAuthList.length === 0 && !loading && Array.from({ length: 6 }, (_, i) => (
            <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'4px' }}>
              <div style={{ width:'7px', height:'7px', borderRadius:'1px', background:'#1050a0', flexShrink:0, marginTop:'2px' }} />
              <span style={{ color:'#7ab4cc', fontSize:'10px', lineHeight:1.5, fontFamily:'sans-serif' }}>—</span>
            </div>
          ))}
        </div>
      </div>

      {/* Card 2: Station Type Statistics */}
      <div style={{ ...CARD, flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <STitle text="Station Type Statistics" />
        <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'10px' }}>
          {loading ? (
            <div style={{ width:'106px', height:'106px', display:'flex', alignItems:'center', justifyContent:'center', color:'#00e5ff', fontSize:'11px' }}>Loading…</div>
          ) : (
            <DonutSVG slices={donutSlices} total={total} />
          )}
          <div style={{ display:'flex', flexDirection:'column', gap:'6px', marginLeft:'20px' }}>
            {(stationTypeList.length > 0 ? donutSlices : fallbackSlices).map(d => (
              <div key={d.name} style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                <span style={{ color:'#7ab4cc', fontSize:'10px', width:'36px', textAlign:'right', fontFamily:'sans-serif' }}>{d.pct.toFixed(1)}%</span>
                <div style={{ width:'9px', height:'9px', borderRadius:'1px', background:d.color, flexShrink:0 }} />
                <span style={{ color:'#7ab4cc', fontSize:'10px', fontFamily:'sans-serif' }}>{d.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ height:'1px', background:'rgba(0,150,200,0.18)', marginBottom:'9px' }} />
        <SubLabel text="Station Type Details" />
        <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
          {(stationTypeList.length > 0 ? stationTypeList : fallbackSlices).map(item => (
            <div key={item.name} style={{ display:'flex', alignItems:'center', gap:'6px' }}>
              <span style={{ color:'#7ab4cc', fontSize:'10px', width:'90px', flexShrink:0, fontFamily:'sans-serif' }}>{item.name}</span>
              <div style={{ flex:1, background:'rgba(0,15,45,0.7)', borderRadius:'2px', height:'16px', overflow:'hidden' }}>
                <div style={{ width:`${(item.value / maxVal) * 100}%`, height:'100%', background:item.color, borderRadius:'2px', display:'flex', alignItems:'center', justifyContent:'flex-end', paddingRight:'5px', minWidth:'26px' }}>
                  <span style={{ color:'#fff', fontSize:'10px', fontWeight:700, fontFamily:'sans-serif' }}>{loading ? '-' : item.value.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
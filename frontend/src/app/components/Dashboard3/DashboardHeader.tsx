import React, { useState, useEffect } from 'react';
import { LOGO_IMG } from './logoImg';

export function DashboardHeader() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div style={{
      height: '50px', flexShrink: 0,
      background: 'linear-gradient(180deg,#0a2a42 0%,#0d3250 100%)',
      borderBottom: '1px solid rgba(0,180,230,0.18)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 18px', position: 'relative',
    }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:'linear-gradient(90deg,transparent 0%,rgba(0,200,255,0.7) 15%,rgba(0,200,255,0.7) 85%,transparent 100%)', opacity:0.6 }} />
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'1px', background:'linear-gradient(90deg,transparent 5%,rgba(0,160,210,0.3) 30%,rgba(0,160,210,0.3) 70%,transparent 95%)' }} />

      {/* Logo */}
      <img src={LOGO_IMG} alt="DecentTest" style={{ height:'32px', width:'auto', objectFit:'contain', background:'#fff', borderRadius:'3px', padding:'2px 6px' }} />

      {/* Center title */}
      <div style={{ position:'absolute', left:'50%', transform:'translateX(-50%)', display:'flex', flexDirection:'column', alignItems:'center', gap:'3px' }}>
        <span style={{ color:'#fff', fontSize:'22px', fontWeight:700, letterSpacing:'8px', fontFamily:'sans-serif', textShadow:'0 0 24px rgba(0,200,255,0.35)' }}>FREQUENCY ANALYSIS</span>
      </div>

      {/* Date + Time */}
      <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
        <span style={{ color:'#3d6880', fontSize:'12px', fontFamily:'sans-serif' }}>{time.toLocaleDateString('zh-CN')}&nbsp;&nbsp;{time.toLocaleDateString('zh-CN', { weekday: 'long' })}</span>
        <div style={{ display:'flex', alignItems:'center', gap:'2px' }}>
          {[pad(time.getHours()), pad(time.getMinutes()), pad(time.getSeconds())].map((s, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span style={{ color:'#00bcd4', fontSize:'16px', fontWeight:700, padding:'0 1px', lineHeight:1 }}>:</span>}
              <div style={{ minWidth:'32px', padding:'2px 6px', background:'rgba(0,180,220,0.06)', border:'1px solid rgba(0,200,240,0.5)', borderRadius:'3px', textAlign:'center', color:'#00e5ff', fontSize:'19px', fontWeight:700, fontFamily:'monospace', fontVariantNumeric:'tabular-nums', boxShadow:'0 0 10px rgba(0,180,220,0.2)' }}>{s}</div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

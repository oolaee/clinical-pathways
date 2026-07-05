import type { Vals } from '../vals'
import { Box, css } from '../ui'

export function Vitals({ v }: { v: Vals }) {
  return (
    <div style={css('padding:24px 28px 40px;max-width:760px')}>
      <div style={css("font-family:'Cormorant Garamond',serif;font-weight:600;font-size:30px;line-height:1.1")}>Vitals</div>
      <div style={css('font-size:12.5px;color:#7d715f;margin-top:3px')}>Tab between fields · trends shown against prior visits</div>
      <div style={css('background:#ffffff;border:1px solid #e9e2d8;border-radius:12px;padding:8px 22px;margin-top:18px')}>
        {v.vitFields.map((f, i) => (
          <div key={i} style={css('display:grid;grid-template-columns:190px 120px 60px 110px 1fr;gap:14px;align-items:center;padding:11px 0;border-bottom:1px solid #f1ece3')}>
            <div style={css('font-size:13px;font-weight:600')}>{f.label}</div>
            <input value={f.val} onChange={f.on} style={css('border:1px solid #ddd2c2;border-radius:7px;padding:8px 10px;font-size:14px;font-weight:600;color:#171810;background:#fcfbfb;text-align:right;width:110px')} />
            <div style={css('font-size:12px;color:#8a7a66')}>{f.unit}</div>
            {f.hasSpark ? (
              <svg width="96" height="26" viewBox="0 0 96 26" style={{ overflow: 'visible' }}>
                <polyline points={f.spark} fill="none" stroke="#b6a28e" strokeWidth="1.5" />
                <circle cx={f.sx} cy={f.sy} r="2.5" fill="#171810" />
              </svg>
            ) : (
              <div></div>
            )}
            <div style={css('font-size:11.5px;color:#7d715f')}>{f.trend}</div>
          </div>
        ))}
        <div style={css('display:grid;grid-template-columns:190px 1fr;gap:14px;align-items:center;padding:13px 0')}>
          <div style={css('font-size:13px;font-weight:600')}>BMI <span style={css('font-weight:400;color:#8a7a66;font-size:11.5px')}>auto</span></div>
          <div style={css('display:flex;align-items:baseline;gap:10px')}>
            <div style={css('font-size:20px;font-weight:700')}>{v.bmiVal}</div>
            <div style={css(`font-size:12px;font-weight:600;color:${v.bmiC}`)}>{v.bmiClass}</div>
            <div style={css('font-size:11.5px;color:#8a7a66')}>{v.bmiCalc}</div>
          </div>
        </div>
      </div>
      <div style={css('display:flex;margin-top:16px')}>
        <div style={css('flex:1')}></div>
        <Box onClick={v.goLabs} s="background:#171810;color:#fcfbfb;font-size:13px;font-weight:600;padding:9px 18px;border-radius:8px;cursor:pointer" hover="background:#33342a">Continue to labs →</Box>
      </div>
    </div>
  )
}

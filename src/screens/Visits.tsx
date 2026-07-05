import type { Vals } from '../vals'
import { Box, css } from '../ui'

export function Visits({ v }: { v: Vals }) {
  return (
    <div style={css('padding:24px 28px 40px;max-width:820px')}>
      <div>
        <div style={css("font-family:'Cormorant Garamond',serif;font-weight:600;font-size:30px;line-height:1.1")}>Visits — {v.pName}</div>
        <div style={css('font-size:12.5px;color:#7d715f;margin-top:3px')}>Each visit is its own encounter — labs, evaluation, and the finalized plan are tracked per visit</div>
      </div>
      <div style={css('display:flex;gap:8px;margin:18px 0 20px;flex-wrap:wrap')}>
        <Box onClick={v.onNewFollowup} s="background:#171810;color:#fcfbfb;font-size:13px;font-weight:600;padding:9px 16px;border-radius:8px;cursor:pointer" hover="background:#33342a">+ New follow-up</Box>
        <Box onClick={v.onNewLabs} s="border:1px solid #ddd2c2;color:#171810;font-size:13px;font-weight:600;padding:9px 16px;border-radius:8px;cursor:pointer;background:#ffffff" hover="background:#f7f2ec">+ New labs / lab review</Box>
        <Box onClick={v.onNewEncounter} s="border:1px solid #ddd2c2;color:#171810;font-size:13px;font-weight:600;padding:9px 16px;border-radius:8px;cursor:pointer;background:#ffffff" hover="background:#f7f2ec">+ New encounter</Box>
      </div>
      <div style={css('display:flex;flex-direction:column;gap:10px')}>
        {v.visitList.map((vi, i) => (
          <div key={i} style={css(`display:flex;align-items:center;gap:14px;background:#ffffff;border:1.5px solid ${vi.bd};border-radius:11px;padding:14px 18px`)}>
            <div style={css(`width:10px;height:10px;border-radius:50%;background:${vi.dotBg};flex:none`)}></div>
            <div style={css('flex:1;min-width:0')}>
              <div style={css('font-size:13.5px;font-weight:700')}>{vi.type}</div>
              <div style={css('font-size:12px;color:#7d715f;margin-top:2px')}>{vi.date}</div>
            </div>
            {vi.active && <div style={css('font-size:10px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:#4f7355')}>Active</div>}
            <div style={css(`font-size:10.5px;font-weight:700;padding:4px 10px;border-radius:12px;background:${vi.stBg};color:${vi.stC}`)}>{vi.status}</div>
            <Box onClick={vi.onOpen} s="font-size:12px;font-weight:600;padding:6px 13px;border-radius:7px;cursor:pointer;border:1px solid #ddd2c2;background:#fcfbfb" hover="background:#f0e5db">Open →</Box>
          </div>
        ))}
      </div>
    </div>
  )
}

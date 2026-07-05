import type { Vals } from '../vals'
import { Box, css } from '../ui'

export function Header({ v }: { v: Vals }) {
  return (
    <div style={css('height:54px;flex:none;background:#ffffff;border-bottom:1px solid #e9e2d8;display:flex;align-items:center;gap:14px;padding:0 18px')}>
      <div style={css('display:flex;align-items:baseline;gap:8px')}>
        <div style={css("font-family:'Cormorant Garamond',serif;font-weight:600;font-size:22px")}>Olympia</div>
        <div style={css('font-size:11.5px;font-weight:600;color:#8a7a66;letter-spacing:.4px')}>Clinical Pathways</div>
      </div>
      <div style={css('width:1px;height:22px;background:#e9e2d8')}></div>
      {v.hasPatient && (
        <div style={css('display:flex;align-items:center;gap:9px;min-width:0;overflow:hidden')}>
          <div style={css('font-size:13px;font-weight:700;white-space:nowrap')}>{v.pName}</div>
          <div style={css('font-size:11.5px;color:#7d715f;white-space:nowrap')}>{v.pMeta}</div>
          <div style={css('display:flex;gap:5px')}>
            {v.pChips.map((pc, i) => (
              <div key={i} style={css('font-size:10px;font-weight:600;padding:3px 7px;border-radius:4px;background:#f0e5db;color:#6b5c46;white-space:nowrap')}>{pc.t}</div>
            ))}
          </div>
          <div style={css('font-size:10px;font-weight:600;padding:3px 7px;border-radius:4px;background:#eef0e9;color:#4f7355;white-space:nowrap')}>{v.activeVisitLabel}</div>
        </div>
      )}
      <div style={css('flex:1')}></div>
      <div style={css('font-size:11.5px;color:#8a7a66;display:flex;align-items:center;gap:6px;white-space:nowrap;flex:none')} title="Session locks automatically when idle">
        <div style={css('width:6px;height:6px;border-radius:50%;background:#b6a28e;animation:olpulse 2.4s infinite')}></div>
        Auto-lock {v.lockTimer}
      </div>
      <div style={css(`font-size:10px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;padding:5px 9px;border-radius:5px;background:${v.roleBg};color:${v.roleC}`)}>{v.roleLabel} · {v.userName}</div>
      {v.hasPatient && (
        <Box onClick={v.onNewVisit} s="font-size:12px;font-weight:600;color:#171810;border:1px solid #ddd2c2;border-radius:6px;padding:5px 11px;cursor:pointer;background:#fcfbfb" hover="background:#f0e5db">+ New visit</Box>
      )}
      <Box onClick={v.onLock} s="font-size:12px;font-weight:600;color:#7d715f;border:1px solid #e2d6c8;border-radius:6px;padding:5px 11px;cursor:pointer;background:#fcfbfb" hover="background:#f0e5db;color:#171810">Lock</Box>
    </div>
  )
}

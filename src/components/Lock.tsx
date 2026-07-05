import type { Vals } from '../vals'
import { Box, css } from '../ui'

export function Lock({ v }: { v: Vals }) {
  return (
    <div style={css("min-height:100vh;background:#f0e5db;display:flex;align-items:center;justify-content:center;font-family:'DM Sans',sans-serif;color:#171810")}>
      <div style={css('width:430px;display:flex;flex-direction:column;align-items:center')}>
        <div style={css("font-family:'Cormorant Garamond',serif;font-weight:600;font-size:46px;line-height:1;letter-spacing:.5px")}>Olympia</div>
        <div style={css('font-size:10.5px;letter-spacing:3.5px;text-transform:uppercase;color:#8a7a66;margin-top:6px')}>Aesthetics &amp; Wellness</div>
        <div style={css('margin-top:26px;font-size:15px;font-weight:700')}>Clinical Pathways</div>
        <div style={css('margin-top:4px;font-size:12.5px;color:#7d715f')}>Clinical decision support · Palm Harbor, FL </div>
        <div style={css('margin-top:30px;width:100%;background:#fcfbfb;border:1px solid #e2d6c8;border-radius:14px;padding:20px;display:flex;flex-direction:column;gap:9px;box-shadow:0 2px 14px rgba(23,24,16,.05)')}>
          <div style={css('font-size:11px;font-weight:600;letter-spacing:.8px;text-transform:uppercase;color:#8a7a66;margin-bottom:3px')}>Select profile to unlock</div>
          {v.lockUsers.map((u, i) => (
            <Box
              key={i}
              onClick={u.on}
              s="display:flex;align-items:center;gap:12px;padding:11px 13px;border:1px solid #e8e0d4;border-radius:10px;background:#ffffff;cursor:pointer"
              hover="border-color:#b6a28e;box-shadow:0 1px 8px rgba(23,24,16,.07)"
            >
              <div style={css('width:36px;height:36px;border-radius:50%;background:#f0e5db;display:flex;align-items:center;justify-content:center;font-size:12.5px;font-weight:700;color:#171810;flex:none')}>{u.init}</div>
              <div style={css('flex:1;min-width:0')}>
                <div style={css('font-size:13.5px;font-weight:600')}>{u.name}</div>
                <div style={css('font-size:11.5px;color:#7d715f;margin-top:1px')}>{u.title}</div>
              </div>
              <div style={css(`font-size:10px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;padding:4px 8px;border-radius:5px;background:${u.bg};color:${u.c}`)}>{u.role}</div>
            </Box>
          ))}
        </div>
        <div style={css('margin-top:18px;display:flex;align-items:center;gap:8px;font-size:11.5px;color:#8a7a66')}>
          <div style={css('width:6px;height:6px;border-radius:50%;background:#4f7355')}></div>
          Local session · Encrypted at rest · Nothing leaves this device
        </div>
      </div>
    </div>
  )
}

import type { Vals } from '../vals'
import { Box, css } from '../ui'

export function Sidebar({ v }: { v: Vals }) {
  return (
    <div style={css('width:192px;flex:none;background:#f7f2ec;border-right:1px solid #e9e2d8;display:flex;flex-direction:column;padding:14px 10px 12px')}>
      <div style={css('display:flex;flex-direction:column;gap:2px')}>
        {v.navItems.map((nv, i) => (
          <Box
            key={i}
            onClick={nv.on}
            s={`font-size:13px;font-weight:${nv.w};padding:8px 12px;border-radius:7px;cursor:pointer;background:${nv.bg};color:${nv.c}`}
            hover="background:#efe6d9"
          >
            {nv.label}
          </Box>
        ))}
      </div>
      <div style={css('flex:1')}></div>
      <div style={css('font-size:10.5px;color:#a2947f;line-height:1.6;padding:0 12px')}>
        v1.4.2 · local build<br />Encrypted SQLite · AES-256
      </div>
    </div>
  )
}

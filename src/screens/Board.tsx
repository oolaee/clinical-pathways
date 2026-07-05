import type { Vals } from '../vals'
import { Box, css } from '../ui'

const GRID = 'display:grid;grid-template-columns:minmax(140px,1.5fr) 52px minmax(96px,1.2fr) 66px 108px 132px;gap:8px'

export function Board({ v }: { v: Vals }) {
  return (
    <div style={css('padding:24px 28px 40px')}>
      <div style={css('display:flex;align-items:flex-end;gap:16px;margin-bottom:16px')}>
        <div>
          <div style={css("font-family:'Cormorant Garamond',serif;font-weight:600;font-size:30px;line-height:1.1")}>Patients</div>
          <div style={css('font-size:12.5px;color:#7d715f;margin-top:3px')}>{v.boardCount} on the board · sorted by last activity</div>
        </div>
        <div style={css('flex:1')}></div>
        <Box onClick={v.onNewPatient} s="background:#171810;color:#fcfbfb;font-size:13px;font-weight:600;padding:9px 16px;border-radius:8px;cursor:pointer" hover="background:#33342a">+ New Patient</Box>
      </div>
      <div style={css('display:flex;gap:18px;align-items:center;margin-bottom:14px;flex-wrap:wrap')}>
        <div style={css('display:flex;gap:5px;align-items:center')}>
          <div style={css('font-size:11px;font-weight:600;color:#8a7a66;text-transform:uppercase;letter-spacing:.5px;margin-right:2px')}>Pathway</div>
          {v.pathFilters.map((f, i) => (
            <Box key={i} onClick={f.on} s={`font-size:11.5px;font-weight:600;padding:4px 10px;border-radius:20px;cursor:pointer;border:1px solid ${f.bd};background:${f.bg};color:${f.c}`}>{f.t}</Box>
          ))}
        </div>
        <div style={css('display:flex;gap:5px;align-items:center')}>
          <div style={css('font-size:11px;font-weight:600;color:#8a7a66;text-transform:uppercase;letter-spacing:.5px;margin-right:2px')}>Status</div>
          {v.statusFilters.map((f, i) => (
            <Box key={i} onClick={f.on} s={`font-size:11.5px;font-weight:600;padding:4px 10px;border-radius:20px;cursor:pointer;border:1px solid ${f.bd};background:${f.bg};color:${f.c}`}>{f.t}</Box>
          ))}
        </div>
      </div>
      <div style={css('background:#ffffff;border:1px solid #e9e2d8;border-radius:10px;overflow:hidden')}>
        <div style={css(`${GRID};padding:9px 16px;background:#f7f2ec;border-bottom:1px solid #e9e2d8;font-size:10.5px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;color:#8a7a66`)}>
          <div>Patient</div><div>Age / Sex</div><div>Active pathways</div><div>Last visit</div><div>Labs</div><div>Evaluation</div>
        </div>
        {v.rows.map((r, i) => (
          <Box key={i} onClick={r.on} s={`${GRID};padding:${v.rowPad} 16px;border-bottom:1px solid #f1ece3;align-items:center;cursor:pointer;background:#ffffff`} hover="background:#faf6f0">
            <div style={css('display:flex;align-items:center;gap:9px;min-width:0')}>
              <div style={css('width:26px;height:26px;border-radius:50%;background:#f0e5db;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#6b5c46;flex:none')}>{r.init}</div>
              <div style={css('font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>{r.name}</div>
            </div>
            <div style={css('font-size:12.5px;color:#55503f')}>{r.ageSex}</div>
            <div style={css('display:flex;gap:4px;flex-wrap:wrap')}>
              {r.chips.map((c, j) => (
                <div key={j} style={css('font-size:10px;font-weight:600;padding:2px 7px;border-radius:4px;background:#f0e5db;color:#6b5c46;white-space:nowrap')}>{c.t}</div>
              ))}
            </div>
            <div style={css('font-size:12.5px;color:#55503f')}>{r.lastVisit}</div>
            <div><span style={css(`font-size:11px;font-weight:600;padding:3px 9px;border-radius:20px;background:${r.labBg};color:${r.labC}`)}>{r.labT}</span></div>
            <div><span style={css(`font-size:11px;font-weight:600;padding:3px 9px;border-radius:20px;background:${r.evBg};color:${r.evC}`)}>{r.evT}</span></div>
          </Box>
        ))}
      </div>
    </div>
  )
}

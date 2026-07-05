import type { Vals } from '../vals'
import { Box, css } from '../ui'

export function Talk({ v }: { v: Vals }) {
  return (
    <div style={css('padding:24px 28px 48px;max-width:780px')}>
      {v.tpGated && (
        <div style={css('margin-top:60px;display:flex;flex-direction:column;align-items:center;gap:12px')}>
          <div style={css('font-size:17px;font-weight:700')}>Provider role required</div>
          <div style={css('font-size:13px;color:#7d715f;max-width:400px;text-align:center;line-height:1.55')}>Medication talking points include dosing and are visible to provider roles only.</div>
        </div>
      )}
      {v.tpShow && (
        <>
          <div style={css("font-family:'Cormorant Garamond',serif;font-weight:600;font-size:30px;line-height:1.1")}>Talking Points</div>
          <div style={css('font-size:12.5px;color:#7d715f;margin-top:3px')}>Work through each item with the patient before the first dose · saved to the visit record</div>
          <div style={css('display:flex;gap:6px;margin:18px 0 16px')}>
            {v.tpTabs.map((t, i) => (
              <Box key={i} onClick={t.on} s={`font-size:12.5px;font-weight:600;padding:7px 14px;border-radius:8px;cursor:pointer;background:${t.bg};color:${t.c};border:1px solid ${t.bd}`}>{t.t}</Box>
            ))}
          </div>
          <div style={css('background:#ffffff;border:1px solid #e9e2d8;border-radius:12px;padding:22px 24px')}>
            <div style={css('display:flex;align-items:baseline;gap:10px')}>
              <div style={css('font-size:17px;font-weight:700')}>{v.tpMedTitle}</div>
              <div style={css('font-size:12px;color:#7d715f')}>{v.tpMedSub}</div>
              <div style={css('flex:1')}></div>
              <div style={css('font-size:12px;font-weight:700;color:#55503f')}>{v.tpDone} / {v.tpTotal}</div>
            </div>
            <div style={css('height:4px;background:#f0e5db;border-radius:2px;margin:12px 0 18px;overflow:hidden')}>
              <div style={css(`height:100%;background:#b6a28e;border-radius:2px;width:${v.tpPct}`)}></div>
            </div>
            <div style={css('display:flex;flex-direction:column;gap:16px')}>
              {v.tpSections.map((s, i) => (
                <div key={i}>
                  <div style={css(`font-size:10.5px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:${s.lc};margin-bottom:7px`)}>{s.label}</div>
                  <div style={css('display:flex;flex-direction:column;gap:5px')}>
                    {s.items.map((it, j) => (
                      <Box key={j} onClick={it.on} s={`display:flex;gap:10px;align-items:flex-start;padding:8px 10px;border-radius:7px;cursor:pointer;background:${it.bg}`} hover="background:#faf6f0">
                        <div style={css(`width:17px;height:17px;border-radius:5px;border:1.5px solid ${it.bd};background:${it.boxBg};flex:none;display:flex;align-items:center;justify-content:center;color:#ffffff;font-size:11px;font-weight:700;margin-top:1px`)}>{it.mark}</div>
                        <div style={css('font-size:13px;color:#3a382f;line-height:1.5')}>{it.text}</div>
                      </Box>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={css('display:flex;margin-top:20px;align-items:center;gap:12px;border-top:1px solid #f1ece3;padding-top:16px')}>
              {v.tpSaved && <div style={css('font-size:12.5px;font-weight:700;color:#4f7355')}>✓ Saved to visit · Jul 4, 2026</div>}
              <div style={css('flex:1')}></div>
              <div onClick={v.onSaveTp} style={css(`font-size:13px;font-weight:700;padding:9px 18px;border-radius:8px;cursor:${v.tpCur};background:${v.tpBg};color:${v.tpC}`)}>Save checklist to visit</div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

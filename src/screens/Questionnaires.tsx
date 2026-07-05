import type { Vals } from '../vals'
import { Box, css } from '../ui'

export function Questionnaires({ v }: { v: Vals }) {
  return (
    <div style={css('padding:24px 28px 40px;max-width:860px')}>
      <div style={css("font-family:'Cormorant Garamond',serif;font-weight:600;font-size:30px;line-height:1.1")}>Symptom Questionnaires</div>
      <div style={css('font-size:12.5px;color:#7d715f;margin-top:3px')}>One questionnaire per selected pathway · scores feed the rules engine</div>
      <div style={css('display:flex;gap:6px;margin:18px 0 16px;flex-wrap:wrap')}>
        {v.qTabs.map((t, i) => (
          <Box key={i} onClick={t.on} s={`font-size:12.5px;font-weight:600;padding:7px 14px;border-radius:8px;cursor:pointer;background:${t.bg};color:${t.c};border:1px solid ${t.bd}`}>{t.t}</Box>
        ))}
      </div>
      <div style={css('background:#ffffff;border:1px solid #e9e2d8;border-radius:12px;padding:24px 26px')}>
        <div style={css('display:flex;align-items:center;gap:12px')}>
          <div style={css('flex:1')}>
            <div style={css('font-size:16px;font-weight:700')}>{v.qTitle}</div>
            <div style={css('font-size:12.5px;color:#7d715f;margin-top:4px')}>{v.qDesc}</div>
          </div>
          <Box onClick={v.qTog} s="display:flex;align-items:center;gap:8px;cursor:pointer;flex:none">
            <div style={css('font-size:11.5px;font-weight:600;color:#7d715f')}>{v.qTogLabel}</div>
            <div style={css(`width:34px;height:19px;border-radius:11px;background:${v.qSwBg};position:relative`)}>
              <div style={css(`position:absolute;top:2px;left:${v.qSwL};width:15px;height:15px;border-radius:50%;background:#ffffff;transition:left .15s`)}></div>
            </div>
          </Box>
        </div>
        {v.qOff && (
          <div style={css('margin-top:16px;background:#f7f2ec;border-radius:9px;padding:14px 16px;font-size:12.5px;color:#7d715f;line-height:1.5')}>
            <b>Not administered this visit.</b> The rules engine will skip symptom scoring for this pathway. Toggle back on if it applies to this patient.
          </div>
        )}
        {v.qOn && (
          <>
            <div style={css('display:flex;flex-direction:column;gap:16px;margin-top:18px')}>
              {v.qItems.map((it, i) => (
                <div key={i} style={css('display:flex;flex-direction:column;gap:7px;border-bottom:1px solid #f1ece3;padding-bottom:14px')}>
                  <div style={css('font-size:13.5px;font-weight:600')}>{it.q}</div>
                  {it.subShow && <div style={css('font-size:11.5px;color:#8a7a66;margin-top:-4px')}>{it.sub}</div>}
                  <div style={css('display:flex;gap:5px;flex-wrap:wrap')}>
                    {it.opts.map((o, j) => (
                      <Box key={j} onClick={o.on} s={`font-size:12px;font-weight:600;min-width:30px;text-align:center;padding:5px 9px;border-radius:6px;cursor:pointer;border:1px solid ${o.bd};background:${o.bg};color:${o.c}`} hover="border-color:#b6a28e">{o.t}</Box>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={css('margin-top:18px;background:#f0e5db;border-radius:10px;padding:16px 18px')}>
              <div style={css('font-size:11px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;color:#8a7a66;margin-bottom:9px')}>Computed score</div>
              <div style={css('display:flex;gap:8px;flex-wrap:wrap;align-items:center')}>
                {v.qChips.map((qc, i) => (
                  <div key={i} style={css(`font-size:12.5px;font-weight:700;padding:6px 12px;border-radius:7px;background:${qc.bg};color:${qc.c}`)}>{qc.t}</div>
                ))}
                <div style={css('font-size:12.5px;color:#55503f')}>{v.qInterp}</div>
              </div>
            </div>
          </>
        )}
      </div>
      <div style={css('display:flex;gap:10px;margin-top:16px')}>
        <Box onClick={v.qPrev} s="font-size:13px;font-weight:600;color:#55503f;border:1px solid #ddd2c2;border-radius:8px;padding:9px 16px;cursor:pointer;background:#ffffff" hover="background:#f7f2ec">← {v.qPrevLabel}</Box>
        <div style={css('flex:1')}></div>
        <Box onClick={v.qNext} s="background:#171810;color:#fcfbfb;font-size:13px;font-weight:600;padding:9px 18px;border-radius:8px;cursor:pointer" hover="background:#33342a">{v.qNextLabel}</Box>
      </div>
    </div>
  )
}

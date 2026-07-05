import type { Vals } from '../vals'
import { Box, css } from '../ui'

const VGRID = 'display:grid;grid-template-columns:minmax(90px,1.4fr) 56px 40px minmax(64px,1fr) 64px 78px;gap:6px'
const MGRID = 'display:grid;grid-template-columns:1.6fr 100px 90px 130px;gap:8px'
const MINP = 'border:1px solid #ddd2c2;border-radius:7px;padding:8px 10px;font-size:13px;color:#171810;background:#fcfbfb'

export function Labs({ v }: { v: Vals }) {
  return (
    <div style={css('padding:24px 28px 40px')}>
      <div style={css('display:flex;align-items:flex-end;gap:16px')}>
        <div>
          <div style={css("font-family:'Cormorant Garamond',serif;font-weight:600;font-size:30px;line-height:1.1")}>Labs</div>
          <div style={css('font-size:12.5px;color:#7d715f;margin-top:3px')}>Upload → local extraction → human verification → record</div>
        </div>
        <div style={css('flex:1')}></div>
        <div style={css('display:flex;gap:5px')}>
          {v.labTabs.map((t, i) => (
            <Box key={i} onClick={t.on} s={`font-size:12px;font-weight:600;padding:6px 13px;border-radius:7px;cursor:pointer;background:${t.bg};color:${t.c};border:1px solid ${t.bd}`}>{t.t}</Box>
          ))}
        </div>
      </div>

      {v.lvUpload && (
        <>
          <Box onClick={v.onUpload} s="margin-top:20px;border:1.5px dashed #c9b9a4;border-radius:14px;background:#faf6f0;padding:64px 24px;display:flex;flex-direction:column;align-items:center;gap:10px;cursor:pointer" hover="border-color:#b6a28e;background:#f7f0e7">
            <div style={css('width:44px;height:44px;border-radius:10px;background:#f0e5db;display:flex;align-items:center;justify-content:center;font-size:20px;color:#8a7a66;font-weight:300')}>↑</div>
            <div style={css('font-size:15px;font-weight:700')}>Drop lab PDF here, or click to browse</div>
            <div style={css('font-size:12.5px;color:#7d715f')}>LabCorp and Quest report formats · processed entirely on this device</div>
          </Box>
          <div style={css('margin-top:14px;font-size:12px;color:#8a7a66;display:flex;align-items:center;gap:8px')}>
            <div style={css('width:6px;height:6px;border-radius:50%;background:#4f7355')}></div>No file ever leaves this machine. Extraction runs on the local model.
          </div>
        </>
      )}

      {v.lvProcessing && (
        <div style={css('margin-top:20px;border:1px solid #e9e2d8;border-radius:14px;background:#ffffff;padding:70px 24px;display:flex;flex-direction:column;align-items:center;gap:14px')}>
          <div style={css('font-size:12px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:#8a7a66;animation:olpulse 1.6s infinite')}>Extracting values with local AI</div>
          <div style={css('width:320px;height:6px;background:#f0e5db;border-radius:3px;overflow:hidden')}>
            <div style={css(`height:100%;background:#b6a28e;border-radius:3px;width:${v.procW}`)}></div>
          </div>
          <div style={css('font-size:13.5px;font-weight:600')}>{v.procMsg}</div>
          <div style={css('font-size:12px;color:#7d715f')}>Nothing leaves this device. Every extracted value will require human verification.</div>
        </div>
      )}

      {v.lvVerify && (
        <>
          <div style={css('margin-top:18px;background:#f0e5db;border-radius:9px;padding:10px 16px;display:flex;align-items:center;gap:10px')}>
            <div style={css('width:7px;height:7px;border-radius:50%;background:#a9762c;flex:none')}></div>
            <div style={css('font-size:12.5px;color:#55503f;line-height:1.4')}><b>Verification required.</b> Values extracted by the local model cannot enter the record until a human confirms each one against the source PDF.</div>
            <div style={css('flex:1')}></div>
            <div style={css('font-size:12px;font-weight:700;color:#55503f;white-space:nowrap')}>{v.vConfirmed} of {v.vTotal} confirmed</div>
          </div>
          <div style={css('display:grid;grid-template-columns:minmax(180px,0.8fr) minmax(440px,1.7fr);gap:18px;margin-top:16px;align-items:start')}>
            <div style={css('background:#eceae6;border:1px solid #ddd8cf;border-radius:10px;padding:16px;position:sticky;top:0')}>
              <div style={css('font-size:10.5px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:#8a8578;margin-bottom:10px')}>Source · {v.pdfFile} · page 1 of 2</div>
              <div style={css('background:#ffffff;border:1px solid #d8d3c9;border-radius:4px;padding:18px 18px 22px;font-size:11px;color:#3a382f;box-shadow:0 2px 8px rgba(23,24,16,.06)')}>
                <div style={css('display:flex;justify-content:space-between;border-bottom:2px solid #3a382f;padding-bottom:8px;margin-bottom:10px')}>
                  <div style={css('font-weight:700;font-size:12px')}>LABORATORY REPORT</div>
                  <div style={css('color:#8b8578')}>Final · 06/28/2026</div>
                </div>
                <div style={css('line-height:1.7;margin-bottom:10px;color:#55503f')}>Patient: {v.pdfName}<br />Ordering: OSEI, AMARA MD · Olympia Aesthetics &amp; Wellness<br />Collected: 06/26/2026 07:42 · Fasting: Yes</div>
                <div style={css('border-top:1px solid #d8d3c9;padding-top:8px')}>
                  {v.pdfLines.map((l, i) => (
                    <div key={i} style={css(`display:flex;justify-content:space-between;padding:3.5px 4px;border-radius:3px;background:${l.bg}`)}>
                      <div>{l.a}</div>
                      <div style={css(`font-weight:${l.w}`)}>{l.v}</div>
                    </div>
                  ))}
                </div>
                <div style={css('margin-top:12px;color:#a19b8e;font-size:10px')}>This document is a fictional sample for prototype use.</div>
              </div>
            </div>
            <div>
              <div style={css('display:flex;gap:10px;margin-bottom:10px')}>
                <Box onClick={v.onConfirmAll} s="font-size:12.5px;font-weight:600;padding:8px 14px;border-radius:8px;cursor:pointer;background:#171810;color:#fcfbfb" hover="background:#33342a">Confirm all high-confidence ({v.hcCount})</Box>
                <div style={css('flex:1')}></div>
                <div onClick={v.onAddRecord} style={css(`font-size:12.5px;font-weight:700;padding:8px 16px;border-radius:8px;cursor:${v.addCur};background:${v.addBg};color:${v.addC}`)}>Add {v.vTotal} values to record</div>
              </div>
              <div style={css('background:#ffffff;border:1px solid #e9e2d8;border-radius:10px;overflow-x:auto')}>
                <div style={css(`${VGRID};padding:8px 14px;background:#f7f2ec;border-bottom:1px solid #e9e2d8;font-size:10px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:#8a7a66`)}>
                  <div>Analyte</div><div>Result</div><div>Units</div><div>Reference</div><div>Confidence</div><div></div>
                </div>
                {v.verifyRows.map((r, i) => (
                  <div key={i} style={css(`${VGRID};padding:9px 14px;border-bottom:1px solid #f1ece3;align-items:center;background:${r.bg}`)}>
                    <div style={css('font-size:12.5px;font-weight:600')}>{r.analyte}</div>
                    <div style={css(`font-size:13px;font-weight:700;color:${r.flagC}`)}>{r.result}</div>
                    <div style={css('font-size:11.5px;color:#8a7a66')}>{r.units}</div>
                    <div style={css('font-size:11.5px;color:#8a7a66')}>{r.range}</div>
                    <div><span style={css(`font-size:10px;font-weight:700;padding:3px 8px;border-radius:12px;background:${r.confBg};color:${r.confC}`)}>{r.conf}</span></div>
                    <div onClick={r.on} style={css(`font-size:11px;font-weight:700;text-align:center;padding:5px 0;border-radius:6px;cursor:pointer;border:1px solid ${r.btnBd};background:${r.btnBg};color:${r.btnC}`)}>{r.btnT}</div>
                  </div>
                ))}
              </div>
              <div style={css('margin-top:12px;font-size:12px;color:#7d715f')}>Extraction wrong or missing? <span style={css('font-weight:600;color:#171810;text-decoration:underline;cursor:pointer')}>Enter a value manually</span> — manual entries skip AI confidence and are marked human-entered.</div>
            </div>
          </div>
        </>
      )}

      {v.lvManual && (
        <div style={css('margin-top:20px;background:#ffffff;border:1px solid #e9e2d8;border-radius:12px;padding:20px 22px;max-width:820px')}>
          <div style={css('font-size:15px;font-weight:700')}>Manual lab entry</div>
          <div style={css('font-size:12.5px;color:#7d715f;margin:4px 0 16px')}>For results phoned in, hand-delivered, or missed by extraction. Manual entries skip AI confidence and are marked <b>human-entered</b> in the record.</div>
          <div style={css(`${MGRID};padding:0 0 6px;font-size:10px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:#8a7a66`)}>
            <div>Analyte</div><div>Result</div><div>Units</div><div>Reference range</div>
          </div>
          <div style={css('display:flex;flex-direction:column;gap:7px')}>
            {v.manualRows.map((m, i) => (
              <div key={i} style={css(MGRID)}>
                <input value={m.a} onChange={m.onA} placeholder="e.g. Fasting insulin" style={css(MINP)} />
                <input value={m.v} onChange={m.onV} placeholder="0.0" style={css(`${MINP};font-weight:600;text-align:right`)} />
                <input value={m.u} onChange={m.onU} placeholder="units" style={css(MINP)} />
                <input value={m.r} onChange={m.onR} placeholder="low – high" style={css(MINP)} />
              </div>
            ))}
          </div>
          <div style={css('display:flex;gap:10px;margin-top:14px;align-items:center')}>
            <Box onClick={v.onAddRow} s="font-size:12.5px;font-weight:600;color:#55503f;border:1px solid #ddd2c2;border-radius:8px;padding:8px 14px;cursor:pointer;background:#ffffff" hover="background:#f7f2ec">+ Add row</Box>
            <div style={css('flex:1')}></div>
            <div onClick={v.onSaveManual} style={css(`font-size:12.5px;font-weight:700;padding:8px 16px;border-radius:8px;cursor:${v.msCur};background:${v.msBg};color:${v.msC}`)}>Save to record</div>
          </div>
        </div>
      )}

      {v.lvResults && (
        <>
          {v.lvEmptyShow && (
            <div style={css('margin-top:56px;display:flex;flex-direction:column;align-items:center;gap:10px')}>
              <div style={css('font-size:15px;font-weight:700')}>No labs on record for {v.pName}</div>
              <div style={css('font-size:12.5px;color:#7d715f;max-width:380px;text-align:center;line-height:1.5')}>Upload a lab PDF or use manual entry. Values appear here after verification.</div>
            </div>
          )}
          <div style={css('display:flex;flex-direction:column;gap:16px;margin-top:20px;max-width:900px')}>
            {v.resultPanels.map((p, i) => (
              <div key={i} style={css('background:#ffffff;border:1px solid #e9e2d8;border-radius:12px;overflow:hidden')}>
                <div style={css('padding:12px 18px;background:#f7f2ec;border-bottom:1px solid #e9e2d8;display:flex;align-items:center;gap:10px')}>
                  <div style={css('font-size:13.5px;font-weight:700')}>{p.panel}</div>
                  <div style={css('font-size:11.5px;color:#8a7a66')}>{p.date}</div>
                </div>
                {p.rows.map((r, j) => (
                  <div key={j} style={css('display:grid;grid-template-columns:1.4fr 110px 130px 120px 120px;gap:10px;padding:9px 18px;border-bottom:1px solid #f1ece3;align-items:center')}>
                    <div style={css('font-size:12.5px;font-weight:600')}>{r.a}</div>
                    <div style={css(`font-size:13.5px;font-weight:700;color:${r.flagC}`)}>{r.v} <span style={css('font-size:10.5px;font-weight:400;color:#8a7a66')}>{r.u}</span></div>
                    <div><span style={css(`font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px;background:${r.fBg};color:${r.fC}`)}>{r.flag}</span></div>
                    <div style={css('font-size:11.5px;color:#8a7a66')}>{r.range}</div>
                    <svg width="100" height="24" viewBox="0 0 100 24" style={{ overflow: 'visible' }}>
                      <polyline points={r.spark} fill="none" stroke="#b6a28e" strokeWidth="1.5" />
                      <circle cx={r.sx} cy={r.sy} r="2.5" fill={r.flagC} />
                    </svg>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

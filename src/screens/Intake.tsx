import type { Vals } from '../vals'
import { Box, css } from '../ui'

const INP = 'border:1px solid #ddd2c2;border-radius:7px;padding:9px 11px;font-size:13.5px;color:#171810;background:#fcfbfb'
const LBL = 'display:flex;flex-direction:column;gap:5px;font-size:11.5px;font-weight:600;color:#7d715f'

function CheckChip({ c }: { c: Vals['ikHist'][number] }) {
  return (
    <Box onClick={c.on} s={`display:flex;align-items:center;gap:7px;font-size:12.5px;font-weight:600;padding:7px 12px;border-radius:8px;cursor:pointer;border:1.5px solid ${c.bd};background:${c.bg};color:${c.c}`} hover="border-color:#b6a28e">
      <div style={css(`width:14px;height:14px;border-radius:4px;border:1.5px solid ${c.boxBd};background:${c.boxBg};display:flex;align-items:center;justify-content:center;color:#ffffff;font-size:10px;font-weight:700;flex:none`)}>{c.mark}</div>
      {c.t}
    </Box>
  )
}

export function Intake({ v }: { v: Vals }) {
  return (
    <div style={css('padding:24px 28px 40px;max-width:820px')}>
      <div style={css("font-family:'Cormorant Garamond',serif;font-weight:600;font-size:30px;line-height:1.1")}>New Patient Intake</div>
      <div style={css('display:flex;gap:6px;margin:16px 0 22px;align-items:center')}>
        {v.ikSteps.map((s, i) => (
          <div key={i} style={css('display:flex;align-items:center;gap:6px')}>
            <div style={css(`width:22px;height:22px;border-radius:50%;background:${s.bg};color:${s.c};font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center`)}>{s.n}</div>
            <div style={css(`font-size:12px;font-weight:${s.w};color:${s.tc};white-space:nowrap`)}>{s.t}</div>
            {s.line && <div style={css('width:26px;height:1px;background:#ddd2c2;margin:0 4px')}></div>}
          </div>
        ))}
      </div>

      <div style={css('background:#ffffff;border:1px solid #e9e2d8;border-radius:12px;padding:26px')}>
        {v.ik1 && (
          <>
            <div style={css('font-size:16px;font-weight:700;margin-bottom:16px')}>Demographics</div>
            <div style={css('display:grid;grid-template-columns:1fr 1fr;gap:14px 18px')}>
              <label style={css(LBL)}>First name<input style={css(INP)} placeholder="First name" /></label>
              <label style={css(LBL)}>Last name<input style={css(INP)} placeholder="Last name" /></label>
              <label style={css(LBL)}>Date of birth<input style={css(INP)} placeholder="MM / DD / YYYY" /></label>
              <label style={css(LBL)}>Sex at birth<select style={css(INP)}><option>Select…</option><option>Male</option><option>Female</option></select></label>
              <label style={css(LBL)}>Phone<input style={css(INP)} placeholder="(727) 555-0100" /></label>
              <label style={css(LBL)}>Preferred pharmacy<input style={css(INP)} placeholder="Pharmacy name, city" /></label>
            </div>
          </>
        )}
        {v.ik2 && (
          <>
            <div style={css('font-size:16px;font-weight:700;margin-bottom:4px')}>Medical history</div>
            <div style={css('font-size:12.5px;color:#7d715f;margin-bottom:14px')}>Check all that apply — structured entries feed the rules engine directly.</div>
            <div style={css('display:flex;flex-wrap:wrap;gap:7px')}>
              {v.ikHist.map((c, i) => <CheckChip key={i} c={c} />)}
            </div>
            <div style={css('font-size:11px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:#8a7a66;margin:18px 0 8px')}>Family history</div>
            <div style={css('display:flex;flex-wrap:wrap;gap:7px')}>
              {v.ikFam.map((c, i) => <CheckChip key={i} c={c} />)}
            </div>
            <label style={css(`${LBL};margin-top:16px`)}>Other conditions / surgical history<input style={css(INP)} placeholder="Anything not covered above" /></label>
          </>
        )}
        {v.ik3 && (
          <>
            <div style={css('font-size:16px;font-weight:700;margin-bottom:4px')}>Medications &amp; allergies</div>
            <div style={css('font-size:12.5px;color:#7d715f;margin-bottom:14px')}>Current medication classes — exact agent and dose are captured at the questionnaire step.</div>
            <div style={css('display:flex;flex-wrap:wrap;gap:7px')}>
              {v.ikMeds.map((c, i) => <CheckChip key={i} c={c} />)}
            </div>
            <div style={css('font-size:11px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:#8a7a66;margin:18px 0 8px')}>Allergies</div>
            <div style={css('display:flex;flex-wrap:wrap;gap:7px')}>
              {v.ikAllergy.map((c, i) => <CheckChip key={i} c={c} />)}
            </div>
            <label style={css(`${LBL};margin-top:16px`)}>Other medications, supplements, or reactions<input style={css(INP)} placeholder="Name, dose, frequency — or reaction details" /></label>
          </>
        )}
        {v.ik4 && (
          <>
            <div style={css('font-size:16px;font-weight:700;margin-bottom:16px')}>Weight &amp; treatment goals</div>
            <div style={css('display:grid;grid-template-columns:1fr 1fr;gap:14px 18px')}>
              <label style={css(LBL)}>Current weight (lb)<input style={css(INP)} placeholder="0" /></label>
              <label style={css(LBL)}>Goal weight (lb)<input style={css(INP)} placeholder="0" /></label>
            </div>
            <label style={css(`${LBL};margin-top:14px`)}>What does the patient most want out of treatment?<textarea rows={3} style={css(`${INP};resize:vertical`)} placeholder="Energy, weight loss, sleep, libido…" /></label>
          </>
        )}
        {v.ik5 && (
          <>
            <div style={css('font-size:16px;font-weight:700;margin-bottom:4px')}>Pathway selection</div>
            <div style={css('font-size:12.5px;color:#7d715f;margin-bottom:16px')}>A patient can be on multiple pathways. Each selection adds its own questionnaire step.</div>
            <div style={css('display:grid;grid-template-columns:1fr 1fr;gap:12px')}>
              {v.pwCards.map((pw, i) => (
                <Box key={i} onClick={pw.on} s={`border:1.5px solid ${pw.bd};background:${pw.bg};border-radius:10px;padding:14px 16px;cursor:pointer`} hover="border-color:#b6a28e">
                  <div style={css('display:flex;align-items:center;gap:8px')}>
                    <div style={css(`width:16px;height:16px;border-radius:50%;border:1.5px solid ${pw.dotBd};background:${pw.dot};flex:none`)}></div>
                    <div style={css('font-size:14px;font-weight:700')}>{pw.name}</div>
                    {pw.tagShow && <div style={css('font-size:9.5px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;background:#171810;color:#f0e5db;border-radius:4px;padding:2px 6px')}>{pw.tag}</div>}
                  </div>
                  <div style={css('font-size:12px;color:#7d715f;margin-top:6px;line-height:1.45')}>{pw.desc}</div>
                </Box>
              ))}
            </div>
            {v.glpNote && (
              <div style={css('margin-top:14px;background:#f0e5db;border-radius:8px;padding:11px 14px;font-size:12.5px;color:#55503f;line-height:1.5')}>
                <b>Metabolic pathway added automatically.</b> GLP-1 response is evaluated on a metabolic foundation — insulin resistance and metabolic syndrome markers are required for plateau workup logic.
              </div>
            )}
          </>
        )}
      </div>

      <div style={css('display:flex;gap:10px;margin-top:16px')}>
        {v.backShow && (
          <Box onClick={v.onBack} s="font-size:13px;font-weight:600;color:#55503f;border:1px solid #ddd2c2;border-radius:8px;padding:9px 16px;cursor:pointer;background:#ffffff" hover="background:#f7f2ec">Back</Box>
        )}
        <div style={css('flex:1')}></div>
        <Box onClick={v.onNext} s="background:#171810;color:#fcfbfb;font-size:13px;font-weight:600;padding:9px 18px;border-radius:8px;cursor:pointer" hover="background:#33342a">{v.nextLabel}</Box>
      </div>
    </div>
  )
}

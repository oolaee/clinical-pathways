import { useState } from 'react'
import type { Vals } from '../vals'
import { Box, css } from '../ui'
import { draftSummary } from '../ai'

export function Summary({ v }: { v: Vals }) {
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const runDraft = async () => {
    if (busy) return
    setBusy(true)
    try {
      const text = await draftSummary({
        patient: v.smName,
        findings: v.smFindings.map((f) => f.t + '. ' + f.d),
        plan: v.smPlan.map((p) => p.t + ' — ' + p.d),
        labsOrdered: v.smHasLabs ? v.smLabsText.split(' · ') : [],
        followUp: v.smFollow,
      })
      setDraft(text)
    } catch (e) {
      setDraft('On-device drafting failed: ' + String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={css('padding:24px 28px 48px')}>
      <div style={css('display:flex;align-items:flex-end;max-width:720px;margin-bottom:16px')}>
        <div>
          <div style={css("font-family:'Cormorant Garamond',serif;font-weight:600;font-size:30px;line-height:1.1")}>Visit Summary</div>
          <div style={css('font-size:12.5px;color:#7d715f;margin-top:3px')}>Print-ready for the chart</div>
        </div>
        <div style={css('flex:1')}></div>
        {v.isDesktop && (
          <div onClick={runDraft} style={css(`font-size:12.5px;font-weight:600;padding:8px 15px;border-radius:8px;margin-right:8px;border:1px solid #ddd2c2;background:#fcfbfb;color:#171810;cursor:${busy ? 'default' : 'pointer'};opacity:${busy ? '0.6' : '1'}`)}>
            {busy ? 'Drafting on-device…' : '✦ Draft with on-device AI'}
          </div>
        )}
        <Box onClick={v.onPrint} s="font-size:12.5px;font-weight:600;padding:8px 15px;border-radius:8px;cursor:pointer;background:#171810;color:#fcfbfb" hover="background:#33342a">Print / Save PDF</Box>
      </div>
      {v.isDesktop && draft && (
        <div style={css('width:720px;background:#f7f2ec;border:1px solid #e2d6c8;border-radius:10px;padding:16px 18px;margin-bottom:16px')}>
          <div style={css('font-size:11px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;color:#8a7a66;margin-bottom:8px')}>On-device AI draft · provider reviews before saving</div>
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={6} style={css('width:100%;border:1px solid #ddd2c2;border-radius:8px;padding:11px 13px;font-size:13px;line-height:1.55;color:#171810;background:#ffffff;resize:vertical')} />
        </div>
      )}
      <div style={css('width:720px;background:#ffffff;border:1px solid #e9e2d8;border-radius:4px;padding:48px 52px;box-shadow:0 2px 14px rgba(23,24,16,.05)')}>
        <div style={css('display:flex;justify-content:space-between;align-items:baseline;border-bottom:1.5px solid #171810;padding-bottom:14px')}>
          <div>
            <div style={css("font-family:'Cormorant Garamond',serif;font-weight:600;font-size:24px")}>Olympia Aesthetics &amp; Wellness</div>
            <div style={css('font-size:10.5px;letter-spacing:1.5px;text-transform:uppercase;color:#8a7a66;margin-top:2px')}>Visit Summary · Confidential</div>
          </div>
          <div style={css('font-size:11.5px;color:#55503f;text-align:right;line-height:1.6')}>Palm Harbor, FL<br />July 4, 2026</div>
        </div>
        <div style={css('display:flex;gap:26px;padding:14px 0;border-bottom:1px solid #e9e2d8;font-size:12px;color:#3a382f')}>
          <div><b>Patient:</b> {v.smName}</div><div><b>{v.smMeta}</b></div><div><b>Provider:</b> Amara Osei, MD</div>
        </div>
        <div style={css('padding-top:18px')}>
          <div style={css('font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:#8a7a66;margin-bottom:8px')}>Findings</div>
          {v.smFindings.map((f, i) => (
            <div key={i} style={css('font-size:12.5px;color:#3a382f;line-height:1.6;padding:2px 0')}><b>{f.t}.</b> {f.d}</div>
          ))}
          <div style={css('font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:#8a7a66;margin:18px 0 8px')}>Plan</div>
          {v.smPlan.map((p, i) => (
            <div key={i} style={css('font-size:12.5px;color:#3a382f;line-height:1.6;padding:2px 0')}>{p.n}. <b>{p.t}</b> — {p.d}</div>
          ))}
          <div style={css('font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:#8a7a66;margin:18px 0 8px')}>Labs ordered</div>
          {v.smHasLabs && <div style={css('font-size:12.5px;color:#3a382f;line-height:1.6')}>{v.smLabsText}</div>}
          {v.smNoLabs && <div style={css('font-size:12.5px;color:#8a7a66;line-height:1.6')}>No labs ordered this visit.</div>}
          <div style={css('font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:#8a7a66;margin:18px 0 8px')}>Counseling documented</div>
          <div style={css('font-size:12.5px;color:#3a382f;line-height:1.6')}>{v.smTp}</div>
          <div style={css('font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:#8a7a66;margin:18px 0 8px')}>Follow-up</div>
          <div style={css('font-size:12.5px;color:#3a382f;line-height:1.6')}>{v.smFollow}</div>
          <div style={css('margin-top:30px;border-top:1px solid #e9e2d8;padding-top:12px;display:flex;justify-content:space-between;font-size:10.5px;color:#a2947f')}>
            <div>Generated by Clinical Pathways · reviewed and finalized by the provider</div>
            <div>Page 1 of 1</div>
          </div>
        </div>
      </div>
    </div>
  )
}

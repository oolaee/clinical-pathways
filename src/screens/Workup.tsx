import type { Vals } from '../vals'
import { css } from '../ui'

export function Workup({ v }: { v: Vals }) {
  return (
    <div style={css('padding:24px 28px 48px;max-width:860px')}>
      <div style={css("font-family:'Cormorant Garamond',serif;font-weight:600;font-size:30px;line-height:1.1")}>The Heavy Metabolic Workup</div>
      <div style={css('font-size:12.5px;color:#7d715f;margin-top:3px')}>Provider reference · why we order it, what each lab tells you, and how to act on it</div>
      <div style={css('margin-top:18px;background:#171810;color:#f0e5db;border-radius:12px;padding:20px 24px')}>
        <div style={css('font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:#b6a28e;margin-bottom:8px')}>Why we do this</div>
        <div style={css('font-size:13.5px;line-height:1.65')}>Insulin resistance precedes a type 2 diabetes diagnosis by 10–15 years, and it drives most of what walks through our door: stalled weight loss, low testosterone, fatigue, atherogenic lipids. A glucose and an A1c alone miss it — glucose is the <b>last</b> thing to rise. The heavy workup measures the machinery upstream so we can intervene a decade earlier.</div>
      </div>
      <div style={css('font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:#8a7a66;margin:24px 0 10px')}>How to use it</div>
      <div style={css('display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px')}>
        {v.wkSteps.map((s, i) => (
          <div key={i} style={css('background:#ffffff;border:1px solid #e9e2d8;border-radius:10px;padding:14px 16px')}>
            <div style={css('font-size:11px;font-weight:700;color:#b6a28e;margin-bottom:6px')}>{s.n}</div>
            <div style={css('font-size:13px;font-weight:700')}>{s.t}</div>
            <div style={css('font-size:12px;color:#7d715f;margin-top:5px;line-height:1.5')}>{s.d}</div>
          </div>
        ))}
      </div>
      <div style={css('font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:#8a7a66;margin:24px 0 10px')}>The panel · what each lab tells you</div>
      <div style={css('display:flex;flex-direction:column;gap:10px')}>
        {v.wkLabs.map((l, i) => (
          <div key={i} style={css('background:#ffffff;border:1px solid #e9e2d8;border-radius:10px;padding:14px 18px;display:grid;grid-template-columns:190px 1fr;gap:16px')}>
            <div>
              <div style={css('font-size:13.5px;font-weight:700')}>{l.name}</div>
              <div style={css('font-size:11px;color:#8a7a66;margin-top:3px')}>{l.target}</div>
            </div>
            <div>
              <div style={css('font-size:12.5px;color:#3a382f;line-height:1.55')}>{l.what}</div>
              <div style={css('font-size:11.5px;color:#7d715f;margin-top:5px;line-height:1.5')}><b style={css('color:#8a7a66')}>Acting on it:</b> {l.act}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={css('font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:#8a7a66;margin:24px 0 10px')}>Computed markers · formulas the engine uses</div>
      <div style={css('background:#f0e5db;border-radius:12px;padding:18px 22px;display:flex;flex-direction:column;gap:10px')}>
        {v.wkFormulas.map((f, i) => (
          <div key={i} style={css('display:grid;grid-template-columns:170px 1fr;gap:14px;align-items:baseline')}>
            <div style={css('font-size:13px;font-weight:700')}>{f.n}</div>
            <div style={css('font-size:12.5px;color:#55503f;line-height:1.5')}>{f.d}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

import type { Vals } from '../vals'
import { Box, css } from '../ui'

export function Evaluation({ v }: { v: Vals }) {
  return (
    <div style={css('padding:24px 28px 48px;max-width:940px')}>
      {v.evGated && (
        <div style={css('margin-top:60px;display:flex;flex-direction:column;align-items:center;gap:12px')}>
          <div style={css('width:52px;height:52px;border-radius:50%;background:#f0e5db;display:flex;align-items:center;justify-content:center;font-size:20px;color:#8a7a66')}>●</div>
          <div style={css('font-size:17px;font-weight:700')}>Ready for provider review</div>
          <div style={css('font-size:13px;color:#7d715f;max-width:420px;text-align:center;line-height:1.55')}>The evaluation for {v.pName} has run. Dosing recommendations and plan finalization are visible to provider roles only.</div>
          <div style={css('font-size:11px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;padding:5px 11px;border-radius:5px;background:#b6a28e;color:#ffffff')}>Clinical staff view</div>
        </div>
      )}
      {v.evEmpty && (
        <div style={css('margin-top:60px;display:flex;flex-direction:column;align-items:center;gap:12px')}>
          <div style={css('font-size:17px;font-weight:700')}>No evaluation on file</div>
          <div style={css('font-size:13px;color:#7d715f;max-width:420px;text-align:center;line-height:1.55')}>{v.evEmptyMsg}</div>
        </div>
      )}
      {v.evHas && (
        <>
          <div style={css('background:#171810;color:#f0e5db;border-radius:9px;padding:10px 16px;display:flex;align-items:center;gap:10px;margin-bottom:20px')}>
            <div style={css('width:7px;height:7px;border-radius:50%;background:#b6a28e;flex:none')}></div>
            <div style={css('font-size:12.5px;font-weight:600')}>{v.evBanner}</div>
            <div style={css('flex:1')}></div>
            <div style={css('font-size:11px;color:#b6a28e')}>Rules engine v3.2 · ran {v.evRan}</div>
          </div>

          <div style={css("font-family:'Cormorant Garamond',serif;font-weight:600;font-size:30px;line-height:1.1")}>Evaluation — {v.pName}</div>
          <div style={css('font-size:12.5px;color:#7d715f;margin:4px 0 20px')}>Deterministic rules engine · all recommendations traceable to data and Olympia protocol</div>

          <div style={css('font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:#8a7a66;margin-bottom:10px')}>Computed markers</div>
          <div style={css('display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;margin-bottom:26px')}>
            {v.markers.map((m, i) => (
              <div key={i} style={css('background:#ffffff;border:1px solid #e9e2d8;border-radius:10px;padding:14px 16px')}>
                <div style={css('display:flex;align-items:center;gap:8px')}>
                  <div style={css('font-size:12px;font-weight:700;color:#55503f;flex:1')}>{m.name}</div>
                  <div style={css(`font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px;background:${m.stBg};color:${m.stC}`)}>{m.st}</div>
                </div>
                <div style={css('font-size:22px;font-weight:700;margin-top:6px')}>{m.value} <span style={css('font-size:11px;font-weight:400;color:#8a7a66')}>{m.unit}</span></div>
                <div style={css('font-size:11.5px;color:#7d715f;margin-top:5px;line-height:1.5')}>{m.detail}</div>
              </div>
            ))}
          </div>

          <div style={css('font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:#8a7a66;margin-bottom:10px')}>Findings</div>
          <div style={css('background:#ffffff;border:1px solid #e9e2d8;border-radius:10px;padding:6px 18px;margin-bottom:26px')}>
            {v.findings.map((f, i) => (
              <div key={i} style={css('display:flex;gap:11px;padding:11px 0;border-bottom:1px solid #f1ece3;align-items:flex-start')}>
                <div style={css(`width:8px;height:8px;border-radius:50%;background:${f.dot};flex:none;margin-top:5px`)}></div>
                <div>
                  <div style={css('font-size:13.5px;font-weight:700')}>{f.t}</div>
                  <div style={css('font-size:12.5px;color:#55503f;margin-top:2px;line-height:1.5')}>{f.d}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={css('font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:#8a7a66;margin-bottom:10px')}>Recommendations · grouped by pathway</div>
          <div style={css('display:flex;flex-direction:column;gap:16px;margin-bottom:26px')}>
            {v.recGroups.map((g, i) => (
              <div key={i} style={css('background:#ffffff;border:1px solid #e9e2d8;border-radius:12px;overflow:hidden')}>
                <div style={css('padding:11px 18px;background:#f0e5db;font-size:13px;font-weight:700;color:#55503f')}>{g.pathway}</div>
                <div style={css('padding:14px 18px;display:flex;flex-direction:column;gap:14px')}>
                  {g.tiers.map((tr, j) => (
                    <div key={j}>
                      <div style={css(`font-size:10.5px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:${tr.lc};margin-bottom:8px`)}>{tr.label}</div>
                      <div style={css('display:flex;flex-direction:column;gap:9px')}>
                        {tr.recs.map((rc, k) => (
                          <div key={k} style={css('border:1px solid #eee7dc;border-radius:9px;padding:12px 14px;background:#fcfbfb')}>
                            <div style={css('display:flex;align-items:flex-start;gap:10px')}>
                              <div style={css('flex:1')}>
                                <div style={css('font-size:13.5px;font-weight:700')}>{rc.title}</div>
                                <div style={css('font-size:12.5px;color:#3a382f;margin-top:3px;line-height:1.55')}>{rc.detail}</div>
                                <div style={css('font-size:11.5px;color:#7d715f;margin-top:6px;line-height:1.5')}><b style={css('color:#8a7a66')}>Why:</b> {rc.rationale}</div>
                              </div>
                              <div style={css('font-size:9.5px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;padding:3px 7px;border-radius:4px;background:#f0e5db;color:#6b5c46;white-space:nowrap')}>{rc.tag}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={css('font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:#8a7a66;margin-bottom:10px')}>Suggested lab orders · toggle bundles, then labs within them</div>
          <div style={css('display:flex;flex-direction:column;gap:10px;margin-bottom:14px')}>
            {v.labBundles.map((b, i) => (
              <div key={i} style={css(`border:1.5px solid ${b.bd};background:${b.bg};border-radius:10px;overflow:hidden`)}>
                <div onClick={b.onTog} style={css('display:flex;gap:11px;align-items:flex-start;padding:12px 14px;cursor:pointer')}>
                  <div style={css(`width:32px;height:18px;border-radius:10px;background:${b.swBg};position:relative;flex:none;margin-top:2px`)}>
                    <div style={css(`position:absolute;top:2px;left:${b.swL};width:14px;height:14px;border-radius:50%;background:#ffffff;transition:left .15s`)}></div>
                  </div>
                  <div style={css('flex:1')}>
                    <div style={css('display:flex;align-items:center;gap:8px')}>
                      <div style={css('font-size:13px;font-weight:700')}>{b.name}</div>
                      {b.suggested && <div style={css('font-size:9px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;background:#171810;color:#f0e5db;border-radius:4px;padding:2px 6px')}>Suggested</div>}
                    </div>
                    <div style={css('font-size:11.5px;color:#7d715f;margin-top:2px;line-height:1.45')}>{b.desc}</div>
                  </div>
                </div>
                {b.on && (
                  <div style={css('border-top:1px solid #eee7dc;padding:6px 16px 12px 46px;display:flex;flex-direction:column;gap:1px')}>
                    {b.labs.map((l, j) => (
                      <div key={j} onClick={l.onT} style={css('display:flex;align-items:center;gap:11px;padding:6px 0;cursor:pointer')}>
                        <div style={css(`width:26px;height:15px;border-radius:9px;background:${l.swBg};position:relative;flex:none`)}>
                          <div style={css(`position:absolute;top:2px;left:${l.swL};width:11px;height:11px;border-radius:50%;background:#ffffff;transition:left .15s`)}></div>
                        </div>
                        <div style={css(`font-size:12.5px;font-weight:600;color:${l.c};text-decoration:${l.dec}`)}>{l.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={css('background:#ffffff;border:1px solid #e9e2d8;border-radius:10px;padding:14px 16px;margin-bottom:28px')}>
            <div style={css('font-size:12.5px;font-weight:700')}>Add a lab manually</div>
            <div style={css('font-size:11.5px;color:#7d715f;margin:2px 0 10px')}>Anything not in a bundle. Added labs appear on the visit summary.</div>
            <div style={css('display:flex;gap:8px')}>
              <input value={v.manualLabDraft} onChange={v.onManualLabInput} placeholder="e.g. Homocysteine, ApoB, Uric acid…" style={css('flex:1;border:1px solid #ddd2c2;border-radius:7px;padding:9px 11px;font-size:13px;color:#171810;background:#fcfbfb')} />
              <Box onClick={v.onAddManualLab} s="font-size:12.5px;font-weight:700;padding:9px 16px;border-radius:8px;cursor:pointer;background:#171810;color:#fcfbfb" hover="background:#33342a">+ Add</Box>
            </div>
            {v.hasManualLabs && (
              <div style={css('display:flex;flex-wrap:wrap;gap:6px;margin-top:12px')}>
                {v.manualOrderLabs.map((m, i) => (
                  <div key={i} style={css('display:flex;align-items:center;gap:7px;font-size:12px;font-weight:600;padding:5px 8px 5px 11px;border-radius:20px;background:#f0e5db;color:#55503f')}>
                    {m.name}
                    <Box onClick={m.onRemove} s="width:16px;height:16px;border-radius:50%;background:#ddccbb;color:#6b5c46;display:flex;align-items:center;justify-content:center;font-size:11px;cursor:pointer" hover="background:#c9b9a4;color:#171810">×</Box>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={css('background:#ffffff;border:1px solid #e9e2d8;border-radius:12px;padding:18px 20px')}>
            {v.notFinalized && (
              <>
                <div onClick={v.onAttest} style={css('display:flex;gap:11px;align-items:flex-start;cursor:pointer')}>
                  <div style={css(`width:18px;height:18px;border-radius:5px;border:1.5px solid ${v.attBd};background:${v.attBg};flex:none;display:flex;align-items:center;justify-content:center;color:#ffffff;font-size:12px;font-weight:700`)}>{v.attMark}</div>
                  <div style={css('font-size:12.5px;color:#3a382f;line-height:1.55')}>I have independently reviewed the data, findings, and each recommendation above. I understand these are rules-based suggestions, not medical advice, and I take full clinical responsibility for the finalized plan.</div>
                </div>
                <div style={css('display:flex;margin-top:14px;align-items:center;gap:12px')}>
                  <div style={css('font-size:11.5px;color:#8a7a66')}>{v.finHint}</div>
                  <div style={css('flex:1')}></div>
                  <div onClick={v.onFinalize} style={css(`font-size:13px;font-weight:700;padding:10px 20px;border-radius:8px;cursor:${v.finCur};background:${v.finBg};color:${v.finC}`)}>Finalize plan</div>
                </div>
              </>
            )}
            {v.finalized && (
              <div style={css('display:flex;align-items:center;gap:12px')}>
                <div style={css('width:10px;height:10px;border-radius:50%;background:#4f7355;flex:none')}></div>
                <div style={css('font-size:13.5px;font-weight:700')}>Plan finalized by {v.userName} · Jul 4, 2026 · 10:42</div>
                <div style={css('flex:1')}></div>
                <Box onClick={v.goTalk} s="font-size:12.5px;font-weight:600;padding:8px 14px;border-radius:8px;cursor:pointer;background:#171810;color:#fcfbfb" hover="background:#33342a">Open talking points →</Box>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

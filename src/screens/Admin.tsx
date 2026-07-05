import type { Vals } from '../vals'
import { Box, css } from '../ui'

const UGRID = 'display:grid;grid-template-columns:1.4fr 120px 1fr 120px 80px;gap:10px'
const AGRID = 'display:grid;grid-template-columns:150px 150px 1fr 160px;gap:10px'

export function Admin({ v }: { v: Vals }) {
  return (
    <div style={css('padding:24px 28px 48px;max-width:880px')}>
      <div style={css("font-family:'Cormorant Garamond',serif;font-weight:600;font-size:30px;line-height:1.1")}>Administration</div>
      <div style={css('display:flex;gap:6px;margin:18px 0 16px')}>
        {v.aTabs.map((t, i) => (
          <Box key={i} onClick={t.on} s={`font-size:12.5px;font-weight:600;padding:7px 14px;border-radius:8px;cursor:pointer;background:${t.bg};color:${t.c};border:1px solid ${t.bd}`}>{t.t}</Box>
        ))}
      </div>

      {v.aU && (
        <>
          <div style={css('background:#ffffff;border:1px solid #e9e2d8;border-radius:10px;overflow:hidden')}>
            <div style={css(`${UGRID};padding:9px 16px;background:#f7f2ec;border-bottom:1px solid #e9e2d8;font-size:10.5px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:#8a7a66`)}>
              <div>User</div><div>Role</div><div>Username</div><div>Last active</div><div></div>
            </div>
            {v.aUsers.map((u, i) => (
              <div key={i} style={css(`${UGRID};padding:11px 16px;border-bottom:1px solid #f1ece3;align-items:center`)}>
                <div style={css('font-size:13px;font-weight:600')}>{u.name}</div>
                <div><span style={css(`font-size:10px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;padding:3px 8px;border-radius:5px;background:${u.bg};color:${u.c}`)}>{u.role}</span></div>
                <div style={css('font-size:12.5px;color:#55503f')}>{u.user}</div>
                <div style={css('font-size:12px;color:#7d715f')}>{u.last}</div>
                <Box onClick={u.onRemove} s="font-size:11.5px;font-weight:600;color:#b3423a;text-align:center;padding:5px 0;border-radius:6px;cursor:pointer;border:1px solid #eddad7;background:#fdf6f5" hover="background:#f6e3e1">Remove</Box>
              </div>
            ))}
          </div>
          <div style={css('margin-top:14px;background:#ffffff;border:1px solid #e9e2d8;border-radius:10px;padding:16px 18px')}>
            <div style={css('font-size:13.5px;font-weight:700;margin-bottom:12px')}>Add a user</div>
            <div style={css('display:grid;grid-template-columns:1.3fr 1fr;gap:10px')}>
              <input value={v.newUserName} onChange={v.onNewUserName} placeholder="Full name (e.g. Lauren Diaz, RN)" style={css('border:1px solid #ddd2c2;border-radius:7px;padding:9px 11px;font-size:13px;color:#171810;background:#fcfbfb')} />
              <input value={v.newUserUser} onChange={v.onNewUserUser} placeholder="Username" style={css('border:1px solid #ddd2c2;border-radius:7px;padding:9px 11px;font-size:13px;color:#171810;background:#fcfbfb')} />
            </div>
            <div style={css('display:flex;align-items:center;gap:12px;margin-top:12px;flex-wrap:wrap')}>
              <div style={css('font-size:11.5px;font-weight:600;color:#8a7a66')}>Role</div>
              <div style={css('display:flex;gap:5px')}>
                {v.roleOpts.map((ro, i) => (
                  <Box key={i} onClick={ro.on} s={`font-size:12px;font-weight:600;padding:6px 12px;border-radius:20px;cursor:pointer;border:1px solid ${ro.bd};background:${ro.bg};color:${ro.c}`}>{ro.label}</Box>
                ))}
              </div>
              <div style={css('flex:1')}></div>
              <div onClick={v.onAddUser} style={css(`font-size:12.5px;font-weight:700;padding:8px 18px;border-radius:8px;cursor:${v.addUserCur};background:${v.addUserBg};color:${v.addUserC}`)}>Add user</div>
            </div>
          </div>
          <div style={css('margin-top:12px;font-size:12px;color:#7d715f')}>Role permissions are enforced at login and on every screen. Only Provider roles can view dosing or finalize plans. Added users appear on the login screen immediately.</div>
        </>
      )}

      {v.aBundles && (
        <>
          <div style={css('font-size:12.5px;color:#7d715f;margin-bottom:14px')}>Bundles you define here appear as toggles under <b>Suggested lab orders</b> on every evaluation. Edit names, add or remove the labs inside each, or build new bundles — changes apply everywhere immediately.</div>
          <div style={css('display:flex;flex-direction:column;gap:12px')}>
            {v.adminBundles.map((b, i) => (
              <div key={i} style={css('background:#ffffff;border:1px solid #e9e2d8;border-radius:11px;padding:16px 18px')}>
                <div style={css('display:flex;gap:10px;align-items:center')}>
                  <input value={b.name} onChange={b.onName} placeholder="Bundle name" style={css('flex:1;border:1px solid #ddd2c2;border-radius:7px;padding:8px 11px;font-size:13.5px;font-weight:700;color:#171810;background:#fcfbfb')} />
                  <div style={css('font-size:11px;color:#8a7a66;white-space:nowrap')}>{b.labCount}</div>
                  <Box onClick={b.onRemove} s="font-size:11.5px;font-weight:600;color:#b3423a;padding:6px 12px;border-radius:7px;cursor:pointer;border:1px solid #eddad7;background:#fdf6f5" hover="background:#f6e3e1">Delete bundle</Box>
                </div>
                <input value={b.desc} onChange={b.onDesc} placeholder="Short description (e.g. Recheck at 12 weeks)" style={css('width:100%;border:1px solid #ddd2c2;border-radius:7px;padding:7px 11px;font-size:12px;color:#55503f;background:#fcfbfb;margin-top:8px')} />
                <div style={css('font-size:10.5px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:#8a7a66;margin:14px 0 7px')}>Labs in this bundle</div>
                <div style={css('display:flex;flex-direction:column;gap:6px')}>
                  {b.labs.map((l, j) => (
                    <div key={j} style={css('display:flex;gap:8px;align-items:center')}>
                      <input value={l.v} onChange={l.onIn} placeholder="Lab / analyte name" style={css('flex:1;border:1px solid #ddd2c2;border-radius:7px;padding:8px 11px;font-size:13px;color:#171810;background:#fcfbfb')} />
                      <Box onClick={l.onRm} s="width:30px;height:30px;flex:none;border-radius:7px;border:1px solid #e2d6c8;background:#fcfbfb;color:#8a7a66;display:flex;align-items:center;justify-content:center;font-size:15px;cursor:pointer" hover="background:#f6e3e1;color:#b3423a">×</Box>
                    </div>
                  ))}
                </div>
                <Box onClick={b.onAddLab} s="display:inline-block;margin-top:10px;font-size:12px;font-weight:600;color:#55503f;border:1px solid #ddd2c2;border-radius:8px;padding:7px 13px;cursor:pointer;background:#fcfbfb" hover="background:#f7f2ec">+ Add lab</Box>
              </div>
            ))}
          </div>
          <Box onClick={v.onAddBundle} s="margin-top:14px;display:inline-block;font-size:13px;font-weight:600;padding:10px 18px;border-radius:8px;cursor:pointer;background:#171810;color:#fcfbfb" hover="background:#33342a">+ New bundle</Box>
        </>
      )}

      {v.aA && (
        <>
          <div style={css('background:#ffffff;border:1px solid #e9e2d8;border-radius:10px;overflow:hidden')}>
            <div style={css(`${AGRID};padding:9px 16px;background:#f7f2ec;border-bottom:1px solid #e9e2d8;font-size:10.5px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:#8a7a66`)}>
              <div>Time</div><div>User</div><div>Action</div><div>Patient</div>
            </div>
            {v.aAudit.map((e, i) => (
              <div key={i} style={css(`${AGRID};padding:9px 16px;border-bottom:1px solid #f1ece3;align-items:center;font-size:12.5px`)}>
                <div style={css('color:#7d715f')}>{e.ts}</div>
                <div style={css('font-weight:600')}>{e.user}</div>
                <div style={css('color:#3a382f')}>{e.action}</div>
                <div style={css('color:#55503f')}>{e.pt}</div>
              </div>
            ))}
          </div>
          <div style={css('margin-top:12px;font-size:12px;color:#7d715f')}>Append-only log stored in the encrypted local database. Cannot be edited or purged from the UI.</div>
        </>
      )}

      {v.aB && (
        <div style={css('display:grid;grid-template-columns:1fr 1fr;gap:12px')}>
          <div style={css('background:#ffffff;border:1px solid #e9e2d8;border-radius:10px;padding:18px 20px')}>
            <div style={css('font-size:13.5px;font-weight:700;margin-bottom:12px')}>Encryption</div>
            <div style={css('display:flex;flex-direction:column;gap:9px;font-size:12.5px;color:#3a382f')}>
              <div style={css('display:flex;justify-content:space-between')}><span style={css('color:#7d715f')}>Database</span><b>SQLite · SQLCipher AES-256</b></div>
              <div style={css('display:flex;justify-content:space-between')}><span style={css('color:#7d715f')}>Key storage</span><b>OS keychain</b></div>
              <div style={css('display:flex;justify-content:space-between')}><span style={css('color:#7d715f')}>At-rest status</span><b style={css('color:#4f7355')}>Encrypted</b></div>
              <div style={css('display:flex;justify-content:space-between')}><span style={css('color:#7d715f')}>Network access</span><b style={css('color:#4f7355')}>None — fully local</b></div>
            </div>
          </div>
          <div style={css('background:#ffffff;border:1px solid #e9e2d8;border-radius:10px;padding:18px 20px')}>
            <div style={css('font-size:13.5px;font-weight:700;margin-bottom:12px')}>Backups</div>
            <div style={css('display:flex;flex-direction:column;gap:9px;font-size:12.5px;color:#3a382f')}>
              <div style={css('display:flex;justify-content:space-between')}><span style={css('color:#7d715f')}>Last backup</span><b style={css('color:#4f7355')}>Today · 06:00 — verified</b></div>
              <div style={css('display:flex;justify-content:space-between')}><span style={css('color:#7d715f')}>Destination</span><b>D:\OlympiaBackups (local drive)</b></div>
              <div style={css('display:flex;justify-content:space-between')}><span style={css('color:#7d715f')}>Schedule</span><b>Daily · 30-day retention</b></div>
            </div>
            <Box onClick={v.onBackup} s="margin-top:14px;font-size:12.5px;font-weight:600;padding:8px 0;border-radius:8px;cursor:pointer;background:#171810;color:#fcfbfb;text-align:center" hover="background:#33342a">{v.backupLabel}</Box>
          </div>
        </div>
      )}
    </div>
  )
}

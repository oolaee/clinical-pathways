/**
 * Derived view-model for the whole app — a faithful port of the prototype's
 * `Component.renderVals()`. Given the current state + setState, it computes every
 * value and event handler the screens render against. Keeping this as one
 * cohesive function (rather than scattering logic across components) preserves
 * the prototype's exact behavior.
 */
import {
  AUDIT,
  EVALS,
  PANELS,
  PATIENTS,
  PW,
  QUEST,
  TALK,
  VERIFY,
  WK_FORMULAS,
  WK_LABS,
  WK_STEPS,
  CONFIG,
  type Patient,
  type Evaluation,
} from './data'
import { chip, lvl, roleMetaOf, sparkline } from './helpers'
import { lockMax, type Store } from './store'
import { IS_DESKTOP, extractLabs } from './ai'

export function computeVals(store: Store) {
  const { state: S, setState, timers } = store

  const go = (screen: string) => setState({ screen })
  const roleMeta_ = roleMetaOf

  const newVisit = (type: string) => {
    const id = 'v' + Date.now()
    const list = (S.visitsByPatient[S.pid] || []).concat([{ id, type, date: 'Today · Jul 4, 2026', status: 'In progress' }])
    setState({
      visitsByPatient: { ...S.visitsByPatient, [S.pid]: list },
      activeVisit: { ...S.activeVisit, [S.pid]: id },
      labView: 'upload',
      screen: 'labs',
    })
  }

  const role = S.role
  const isProv = role === 'provider'
  const isMA = role === 'ma'
  const isAdmin = role === 'admin'
  const isDraft = S.pid === 0
  const P: Patient | { id: number; name: string; age: number | string; sex: string; paths: string[]; last: string; lab: string; ev: string } = isDraft
    ? { id: 0, name: 'New Patient', age: '—', sex: '', paths: S.intakePaths.map((n) => n.split(' ')[0]), last: 'Today', lab: 'Pending upload', ev: 'Not run' }
    : PATIENTS.find((p) => p.id === S.pid) || PATIENTS[0]
  const activeVid = S.activeVisit[S.pid] || 'v0'
  const vk = S.pid + '/' + activeVid
  const isFin = !!S.finalized[vk] || (activeVid === 'v0' && P.ev === 'Finalized')

  // ---- lock ----
  const lockUsers = S.users.map((u) => {
    const rm = roleMeta_(u.roleKey)
    return {
      name: u.name,
      title: u.title,
      role: rm.label,
      init: u.init || u.name.split(' ').map((x) => x[0]).slice(0, 2).join(''),
      bg: rm.bg,
      c: rm.c,
      on: () =>
        setState({
          locked: false,
          role: u.roleKey,
          userName: u.short || u.name,
          lockSecs: lockMax(),
          screen: u.roleKey === 'admin' ? 'admin' : 'patients',
        }),
    }
  })

  const mm = Math.floor(S.lockSecs / 60)
  const ss = ('0' + (S.lockSecs % 60)).slice(-2)
  const roleMeta = isProv
    ? { l: 'Provider', bg: '#171810', c: '#f0e5db' }
    : isMA
      ? { l: 'Clinical staff', bg: '#b6a28e', c: '#ffffff' }
      : { l: 'Admin', bg: '#f0e5db', c: '#6b5c46' }

  // ---- nav ----
  const clinical: [string, string][] = [
    ['Patient Board', 'patients'], ['Visits', 'visits'], ['Intake', 'intake'], ['Questionnaires', 'quest'], ['Vitals', 'vitals'], ['Labs', 'labs'], ['Evaluation', 'eval'], ['Metabolic Workup', 'workup'], ['Talking Points', 'talk'], ['Visit Summary', 'summary'],
  ]
  const navDef: [string, string][] = isAdmin
    ? [['Administration', 'admin']]
    : isProv
      ? clinical.concat([['Administration', 'admin']])
      : clinical
  const navItems = navDef.map(([label, scr]) => {
    const sel = S.screen === scr
    return { label, on: () => go(scr), bg: sel ? '#171810' : 'transparent', c: sel ? '#fcfbfb' : '#55503f', w: sel ? 600 : 500 }
  })

  // ---- board ----
  const badgeLab = (t: string) => (t === 'Verified' ? { bg: '#e6ece6', c: '#4f7355' } : t === 'Awaiting verification' ? { bg: '#f3e8d3', c: '#a9762c' } : { bg: '#efece6', c: '#8b8578' })
  const shortLab = (t: string) => (t === 'Awaiting verification' ? 'Unverified' : t)
  const badgeEv = (t: string) => (t === 'Finalized' ? { bg: '#171810', c: '#f0e5db' } : t === 'Ready for review' ? { bg: '#ecdfd0', c: '#7a6242' } : { bg: '#efece6', c: '#8b8578' })
  const filtered = PATIENTS.filter((p) => {
    const ev = S.finalized[p.id + '/' + (S.activeVisit[p.id] || 'v0')] || p.ev === 'Finalized' ? 'Finalized' : p.ev
    if (S.pathFilter !== 'All' && !p.paths.some((x) => x.indexOf(S.pathFilter) === 0)) return false
    if (S.statusFilter !== 'All' && ev !== S.statusFilter) return false
    return true
  })
  const rows = filtered.map((p) => {
    const ev = S.finalized[p.id + '/' + (S.activeVisit[p.id] || 'v0')] || p.ev === 'Finalized' ? 'Finalized' : p.ev
    const lb = badgeLab(p.lab)
    const eb = badgeEv(ev)
    return {
      name: p.name,
      init: p.name.split(' ').map((x) => x[0]).join(''),
      ageSex: p.age + ' ' + p.sex,
      chips: p.paths.map((t) => ({ t })),
      lastVisit: p.last,
      labT: shortLab(p.lab), labBg: lb.bg, labC: lb.c,
      evT: ev, evBg: eb.bg, evC: eb.c,
      on: () => setState({ pid: p.id, screen: 'eval' }),
    }
  })
  const mkFilters = (list: string[], cur: string, key: 'pathFilter' | 'statusFilter') =>
    list.map((t) => ({ t, ...chip(t === cur), on: () => setState({ [key]: t }) }))

  // ---- intake ----
  const ikTitles = ['Demographics', 'History', 'Medications', 'Goals', 'Pathways']
  const ikSteps = ikTitles.map((t, i) => {
    const n = i + 1
    const cur = S.intakeStep === n
    const done = S.intakeStep > n
    return { n, t, bg: cur || done ? '#171810' : '#eee7dc', c: cur || done ? '#fcfbfb' : '#8a7a66', tc: cur ? '#171810' : '#8a7a66', w: cur ? 700 : 500, line: n < 5 }
  })
  const glpOn = S.intakePaths.includes('GLP-1')
  const pwCards = PW.map(([name, desc]) => {
    const isMet = name.indexOf('Metabolic') === 0
    const sel = S.intakePaths.includes(name) || (isMet && glpOn)
    const lockedMet = isMet && glpOn
    return {
      name, desc, tag: 'Included with GLP-1', tagShow: lockedMet,
      bd: sel ? '#b6a28e' : '#e9e2d8', bg: sel ? '#faf4ec' : '#ffffff',
      dot: sel ? '#b6a28e' : '#ffffff', dotBd: sel ? '#b6a28e' : '#c9b9a4',
      on: () => {
        if (lockedMet) return
        let ps = S.intakePaths.slice()
        if (ps.includes(name)) ps = ps.filter((x) => x !== name)
        else {
          ps.push(name)
          if (name === 'GLP-1' && !ps.includes('Metabolic / Weight Loss')) ps.push('Metabolic / Weight Loss')
        }
        setState({ intakePaths: ps })
      },
    }
  })

  // ---- intake checkboxes ----
  const mkChecks = (list: string[]) =>
    list.map((t) => {
      const on = !!S.ikChecks[t]
      return { t, mark: on ? '✓' : '', bd: on ? '#b6a28e' : '#e2d6c8', bg: on ? '#faf4ec' : '#ffffff', c: on ? '#171810' : '#55503f', boxBd: on ? '#b6a28e' : '#c9b9a4', boxBg: on ? '#b6a28e' : '#ffffff', on: () => setState({ ikChecks: { ...S.ikChecks, [t]: !on } }) }
    })
  const ikHist = mkChecks(['Hypertension', 'Prediabetes', 'Type 2 diabetes', 'High cholesterol', 'Sleep apnea', 'Fatty liver', 'PCOS', 'Hypothyroidism', 'Depression / anxiety', 'GERD', 'IBS', 'Autoimmune disease', 'None of these'])
  const ikFam = mkChecks(['FH: Type 2 diabetes', 'FH: Heart disease', 'FH: Thyroid disease', 'FH: Obesity', 'FH: Breast / prostate cancer', 'FH: None significant'])
  const ikMeds = mkChecks(['Metformin', 'GLP-1 agonist', 'Statin', 'Antihypertensive', 'Thyroid replacement', 'SSRI / SNRI', 'PPI / acid reducer', 'Regular NSAIDs', 'OCP / HRT', 'No current medications'])
  const ikAllergy = mkChecks(['NKDA', 'Penicillin', 'Sulfa', 'Statin intolerance', 'Shellfish / iodine'])

  // ---- questionnaires ----
  const qKeys = Object.keys(QUEST)
  const qTabs = qKeys.map((k) => ({ t: k, ...chip(k === S.qTab), on: () => setState({ qTab: k }) }))
  const Q = QUEST[S.qTab]
  const MRS = ['0 None', '1 Mild', '2 Moderate', '3 Severe', '4 Very severe']
  const val = (i: number, it: { def: number }) => S.answers[S.pid + ':' + S.qTab + ':' + i] ?? (isDraft ? 0 : it.def)
  const qRelMap: Record<string, string> = { TRT: 'TRT', BHRT: 'BHRT', Thyroid: 'Thyroid', 'Metabolic / GLP-1': 'Metabolic', 'Gut Health': 'Gut' }
  const qRelevant = isDraft
    ? S.intakePaths.some((p) => p.indexOf(qRelMap[S.qTab]) === 0 || (qRelMap[S.qTab] === 'Metabolic' && p === 'GLP-1'))
    : true
  const qEnabledKey = S.pid + ':' + S.qTab
  const qOn = S.qEnabled[qEnabledKey] ?? qRelevant
  const qIdx = qKeys.indexOf(S.qTab)
  const qItems = Q.items.map((it, i) => {
    const v = val(i, it)
    let labels: string[]
    if (it.type === 's10') labels = Array.from({ length: 11 }, (_, n) => '' + n)
    else if (it.type === 'mrs') labels = MRS
    else if (it.type === 'yn') labels = ['No', 'Yes']
    else labels = it.opts!
    return {
      q: it.q, sub: it.sub || '', subShow: !!it.sub,
      opts: labels.map((t, oi) => {
        const sel = oi === v
        return { t, bg: sel ? '#171810' : '#ffffff', c: sel ? '#fcfbfb' : '#55503f', bd: sel ? '#171810' : '#e2d6c8', on: () => setState({ answers: { ...S.answers, [S.pid + ':' + S.qTab + ':' + i]: oi } }) }
      }),
    }
  })
  let qChips: { t: string; bg: string; c: string }[] = []
  let qInterp = ''
  const sum = (type: string) => Q.items.reduce((a, it, i) => a + (it.type === type ? val(i, it) : 0), 0)
  if (S.qTab === 'TRT') {
    const yes1 = val(0, Q.items[0]) === 1
    const yes7 = val(6, Q.items[6]) === 1
    const others = Q.items.slice(0, 10).reduce((a, it, i) => a + val(i, it), 0)
    const pos = yes1 || yes7 || others >= 3
    qChips = [{ t: 'ADAM: ' + (pos ? 'Positive' : 'Negative'), ...(pos ? lvl('amber') : lvl('ok')) }, { t: 'Severity ' + sum('s10') + ' / 60', bg: '#ffffff', c: '#171810' }]
    qInterp = pos ? 'Screen positive — biochemical confirmation with two morning draws required before treatment.' : 'Screen negative.'
  } else if (S.qTab === 'BHRT') {
    const t = sum('mrs')
    qChips = [{ t: 'MRS ' + t + ' / 40', ...(t >= 17 ? lvl('amber') : lvl('ok')) }]
    qInterp = t >= 17 ? 'Moderate–severe symptom burden — supports treatment discussion.' : 'Mild symptom burden.'
  } else if (S.qTab === 'Thyroid') {
    const t = sum('s10')
    qChips = [{ t: 'Symptom score ' + t + ' / 60', ...(t >= 25 ? lvl('amber') : lvl('ok')) }]
    qInterp = t >= 25 ? 'Significant hypothyroid symptom burden — interpret alongside TSH, free T4, and TPO.' : 'Low symptom burden.'
  } else if (S.qTab === 'Metabolic / GLP-1') {
    const t = sum('s10')
    const plateau = val(9, Q.items[9])
    qChips = [{ t: 'Appetite burden ' + t + ' / 30', ...(t >= 15 ? lvl('amber') : lvl('ok')) }, { t: 'Plateau: ' + Q.items[9].opts![plateau], ...(plateau >= 3 ? lvl('red') : lvl('ok')) }]
    qInterp = plateau >= 3 ? 'Plateau ≥ 4 weeks at current dose triggers workup logic in the rules engine.' : 'No plateau trigger.'
  } else {
    const t = sum('s10')
    qChips = [{ t: 'GI burden ' + t + ' / 20', ...(t >= 10 ? lvl('amber') : lvl('ok')) }]
    qInterp = t >= 10 ? 'Elevated GI symptom burden — functional workup set suggested at evaluation.' : 'Low GI burden.'
  }

  // ---- vitals ----
  const V = S.vits[S.pid] || (isDraft ? { ht: '', wt: '', sys: '', dia: '', hr: '', waist: '', bf: '' } : { ht: 66, wt: 158, sys: 122, dia: 78, hr: 70, waist: 33, bf: 29 })
  const vdef: [string, string, string, number[] | null, string][] = [
    ['ht', 'Height', 'in', null, ''],
    ['wt', 'Weight', 'lb', [235, 229, 224, 222, 221], '−14 lb / 12 wk · flat × 6 wk'],
    ['sys', 'BP systolic', 'mmHg', [142, 138, 136, 134], 'improving'],
    ['dia', 'BP diastolic', 'mmHg', [92, 90, 88, 86], 'improving'],
    ['hr', 'Heart rate', 'bpm', [78, 76, 74, 72], ''],
    ['waist', 'Waist circumference', 'in', [45, 44, 43, 42], '−3 in / 12 wk'],
    ['bf', 'Body fat (InBody)', '%', [34.1, 33.2, 32.1, 31.2], ''],
  ]
  const vitFields = vdef.map(([k, label, unit, hist, trend]) => {
    const showHist = !!hist && S.pid === 1
    const s = showHist ? sparkline(hist!, 96, 26) : null
    return { label, unit, trend: showHist ? trend : isDraft ? 'no prior values' : '', val: '' + V[k], hasSpark: !!showHist, spark: s ? s.pts : '', sx: s ? s.x : '0', sy: s ? s.y : '0', on: (e: { target: { value: string } }) => setState({ vits: { ...S.vits, [S.pid]: { ...V, [k]: e.target.value } } }) }
  })
  const htN = parseFloat('' + V.ht) || 0
  const wtN = parseFloat('' + V.wt) || 0
  const bmi = htN > 0 ? (703 * wtN) / (htN * htN) : 0
  const bmiClass: [string, string] = bmi >= 30 ? ['Obese class I', '#b3423a'] : bmi >= 25 ? ['Overweight', '#a9762c'] : ['Normal', '#4f7355']

  // ---- labs ----
  const labTabs = ([['Upload', 'upload'], ['Manual entry', 'manual'], ['Verify', 'verify'], ['Results', 'results']] as [string, string][]).map(([t, k]) => ({ t, ...chip(S.labView === k || (k === 'upload' && S.labView === 'processing')), on: () => setState({ labView: k }) }))
  const manualRows = S.manual.map((m, i) => {
    const set = (f: string, v: string) => {
      const arr = S.manual.slice()
      arr[i] = { ...arr[i], [f]: v }
      setState({ manual: arr })
    }
    return { a: m.a, v: m.v, u: m.u, r: m.r, onA: (e: { target: { value: string } }) => set('a', e.target.value), onV: (e: { target: { value: string } }) => set('v', e.target.value), onU: (e: { target: { value: string } }) => set('u', e.target.value), onR: (e: { target: { value: string } }) => set('r', e.target.value) }
  })
  const manualReady = S.manual.some((m) => m.a && m.v)
  // On-device extraction results replace the seeded sample once available.
  const labSource = S.aiLabs ?? VERIFY
  const confirmed = (i: number) => !!S.conf[i]
  const vConfirmed = labSource.reduce((a, _, i) => a + (confirmed(i) ? 1 : 0), 0)
  const allConf = vConfirmed === labSource.length
  const verifyRows = labSource.map((r, i) => {
    const low = r.conf === 'low'
    const ok = confirmed(i)
    return {
      analyte: r.a, result: r.v + (r.flag ? ' ' + r.flag : ''), units: r.u, range: r.r,
      flagC: r.flag ? (r.flag === 'H' && (r.a === 'TSH' || r.a === 'TPO Antibodies' || r.a === 'hs-CRP') ? '#b3423a' : '#a9762c') : '#171810',
      conf: low ? 'Low' : 'High', confBg: low ? '#f6e3e1' : '#e6ece6', confC: low ? '#b3423a' : '#4f7355',
      bg: ok ? '#ffffff' : low ? '#fdf6f5' : '#ffffff',
      btnT: ok ? '✓ Done' : 'Confirm',
      btnBg: ok ? '#e6ece6' : low ? '#b3423a' : '#ffffff', btnC: ok ? '#4f7355' : low ? '#ffffff' : '#171810', btnBd: ok ? '#e6ece6' : low ? '#b3423a' : '#ddd2c2',
      on: () => setState({ conf: { ...S.conf, [i]: !ok } }),
    }
  })
  const pdfLines = labSource.map((r) => ({ a: r.a, v: r.v + ' ' + r.u + (r.flag ? '  ' + r.flag : ''), w: r.flag ? 700 : 400, bg: r.conf === 'low' ? '#f3e8d3' : 'transparent' }))
  let panels = (PANELS[S.pid] || []).slice() as { panel: string; date: string; rows: { a: string; v: string; u: string; r?: string; range?: string; flag: string; hist: number[] | null }[] }[]
  if (S.manualSaved[S.pid]) panels = panels.concat([{ panel: 'Manual entry', date: 'Entered today · human-entered', rows: S.manual.filter((m) => m.a && m.v).map((m) => ({ a: m.a, v: m.v, u: m.u, r: m.r || '—', flag: '', hist: null })) }])
  const resultPanels = panels.map((p) => ({
    panel: p.panel, date: p.date,
    rows: p.rows.map((r) => {
      const s = r.hist ? sparkline(r.hist, 100, 24) : { pts: '', x: '-10', y: '-10' }
      const bad = r.flag.indexOf('H') === 0 || r.flag.indexOf('L') === 0
      return { a: r.a, v: r.v, u: r.u, range: r.range || r.r, flag: r.flag || 'Normal', fBg: bad ? '#f3e8d3' : '#efece6', fC: bad ? '#a9762c' : '#8b8578', flagC: bad ? '#a9762c' : '#171810', spark: s.pts, sx: s.x, sy: s.y }
    }),
  }))

  // ---- systemic screening (rules engine, JNC 8) ----
  const sysN = parseFloat('' + V.sys)
  const diaN = parseFloat('' + V.dia)
  const scrAge = typeof P.age === 'number' ? P.age : 50
  const thrS = scrAge >= 60 ? 150 : 140
  const thrD = 90
  const scrMarkers: Evaluation['markers'] = []
  const scrFindings: Evaluation['findings'] = []
  const scrGroups: Evaluation['recs'] = []
  if (sysN >= thrS || diaN >= thrD) {
    const stage2 = sysN >= 160 || diaN >= 100
    scrMarkers.push({ name: 'Blood pressure vs JNC 8 goal', value: sysN + ' / ' + diaN, unit: 'mmHg', st: stage2 ? 'Stage 2 HTN' : 'Above goal', lvl: 'red', detail: 'Goal < ' + thrS + '/' + thrD + ' for age ' + scrAge + ' per JNC 8 · confirm with a second seated reading' })
    scrFindings.push({ t: 'Hypertension — not on the selected pathways', d: 'Office BP ' + sysN + '/' + diaN + ' exceeds the JNC 8 threshold of ' + thrS + '/' + thrD + ' for this age. ' + (stage2 ? 'Stage 2 (≥160/100) — JNC 8 recommends initiating two-drug therapy.' : 'Confirm on repeat measurement, then initiate single-agent therapy.'), lvl: 'red' })
    scrGroups.push({
      pathway: 'Systemic screening — beyond selected pathways',
      tiers: [
        {
          label: 'Conventional · evidence-based (JNC 8)',
          integ: false,
          recs: stage2
            ? [
                { title: 'Initiate two-drug antihypertensive therapy', detail: 'Lisinopril 10 mg PO daily PLUS amlodipine 5 mg PO daily. Recheck BP in 2 weeks and titrate to goal < ' + thrS + '/' + thrD + '. BMP at 2–4 weeks for creatinine and potassium.', rationale: 'BP ≥ 160/100 — JNC 8 recommends starting two agents; ACEi + CCB combination per ACCOMPLISH.', tag: 'JNC 8' },
                { title: 'Home BP log + lifestyle counseling', detail: 'Twice-daily home readings × 2 weeks. Sodium < 2.3 g/day, DASH pattern, limit alcohol, aerobic exercise 150 min/wk.', rationale: 'Confirms the office reading and guides titration; lifestyle changes lower SBP 4–11 mmHg.', tag: 'JNC 8 / AHA' },
              ]
            : [
                { title: 'Confirm, then initiate single-agent therapy', detail: 'Repeat after 5 min seated rest, both arms. If confirmed: lisinopril 10 mg PO daily (amlodipine 5 mg if ACEi not tolerated). Recheck at 4 weeks.', rationale: 'Single elevated office reading above JNC 8 threshold — confirmation required before diagnosis and treatment.', tag: 'JNC 8' },
              ],
        },
      ],
    })
  }

  // ---- evaluation ----
  const E0 = EVALS[S.pid]
  const E: Evaluation | null = E0
    ? { ...E0, markers: E0.markers.concat(scrMarkers), findings: E0.findings.concat(scrFindings), recs: E0.recs.concat(scrGroups) }
    : scrGroups.length
      ? { ran: 'live · from current vitals', markers: scrMarkers, findings: scrFindings, recs: scrGroups, suggest: ['htn'], orders: [{ name: 'Hypertension baseline set', desc: 'BMP, urinalysis, lipid panel, EKG — baseline before starting therapy' }], smPlan: [], smTp: '', smFollow: '' }
      : null
  const evGated = isMA && !!E
  const evEmptyMsg = P.ev === 'Finalized' ? 'This visit was finalized on ' + P.last + '. Open the visit summary for the plan of record.' : P.lab === 'Verified' ? 'Labs are verified. Run the evaluation from the patient record to generate findings.' : 'Labs are not yet verified for ' + P.name + '. The rules engine requires verified values.'
  const markers = (E ? E.markers : []).map((m) => ({ ...m, ...(m.lvl === 'red' ? { stBg: '#f6e3e1', stC: '#b3423a' } : m.lvl === 'amber' ? { stBg: '#f3e8d3', stC: '#a9762c' } : { stBg: '#e6ece6', stC: '#4f7355' }) }))
  const findings = (E ? E.findings : []).map((f) => ({ ...f, dot: f.lvl === 'red' ? '#b3423a' : f.lvl === 'amber' ? '#a9762c' : '#4f7355' }))
  const recGroups = (E ? E.recs : []).map((g) => ({ pathway: g.pathway, tiers: g.tiers.map((t) => ({ label: t.label, lc: t.integ ? '#a9762c' : '#4f7355', recs: t.recs })) }))
  const suggested = ((E && E.suggest) || []).concat(scrGroups.length ? ['htn'] : [])
  const labBundles = S.bundles.map((b) => {
    const bon = S.bundleOn[vk + ':' + b.id] ?? suggested.includes(b.id)
    const labs = b.labs.map((ln, li) => {
      const off = !!S.labOff[vk + ':' + b.id + ':' + li]
      return { name: ln, enabled: !off, c: off ? '#a19b8e' : '#171810', dec: off ? 'line-through' : 'none', swBg: off ? '#ddd2c2' : '#4f7355', swL: off ? '2px' : '14px', onT: () => setState({ labOff: { ...S.labOff, [vk + ':' + b.id + ':' + li]: !off } }) }
    })
    return { name: b.name, desc: b.desc, suggested: suggested.includes(b.id), labs, on: bon, swBg: bon ? '#b6a28e' : '#ddd2c2', swL: bon ? '16px' : '2px', bd: bon ? '#b6a28e' : '#e9e2d8', bg: bon ? '#faf4ec' : '#ffffff', onTog: () => setState({ bundleOn: { ...S.bundleOn, [vk + ':' + b.id]: !bon } }) }
  })
  const mlabs = S.manualLabs[vk] || []
  const manualOrderLabs = mlabs.map((ln, i) => ({ name: ln, onRemove: () => setState({ manualLabs: { ...S.manualLabs, [vk]: mlabs.filter((_, j) => j !== i) } }) }))
  const orderedLabs: string[] = []
  labBundles.forEach((b) => {
    if (b.on) b.labs.forEach((l) => { if (l.enabled) orderedLabs.push(l.name) })
  })
  mlabs.forEach((l) => orderedLabs.push(l))
  const orderedUniq = [...new Set(orderedLabs)]
  const attestedNow = !!S.attested[vk]
  const canFin = isProv && attestedNow

  // ---- talking points ----
  const tpGated = isMA || isAdmin
  const tp = TALK[S.tpTab]
  const tpTabs = TALK.map((t, i) => ({ t: t.key, ...chip(i === S.tpTab), on: () => setState({ tpTab: i }) }))
  let tpTotal = 0
  let tpDone = 0
  const tpSections = tp.sections.map((s, si) => ({
    label: s.label, lc: '#8a7a66',
    items: s.items.map((text, ii) => {
      const k = S.tpTab + ':' + si + ':' + ii
      const done = !!S.tpChecked[k]
      tpTotal++
      if (done) tpDone++
      return { text, mark: done ? '✓' : '', bd: done ? '#4f7355' : '#c9b9a4', boxBg: done ? '#4f7355' : '#ffffff', bg: done ? '#f5f7f4' : 'transparent', on: () => setState({ tpChecked: { ...S.tpChecked, [k]: !done } }) }
    }),
  }))
  const tpComplete = tpDone === tpTotal
  const tpSaved = !!S.tpSaved[S.tpTab]

  // ---- summary ----
  const smP = EVALS[S.pid] ? P : PATIENTS[0]
  const smE = EVALS[S.pid] || EVALS[1]

  // ---- admin ----
  const aTabs = ([['Users', 'users'], ['Lab bundles', 'bundles'], ['Audit log', 'audit'], ['Backup & encryption', 'backup']] as [string, string][]).map(([t, k]) => ({ t, ...chip(S.aTab === k), on: () => setState({ aTab: k }) }))
  const setBundles = (bs: typeof S.bundles) => setState({ bundles: bs })
  const adminBundles = S.bundles.map((b, bi) => ({
    name: b.name, desc: b.desc, labCount: b.labs.length + (b.labs.length === 1 ? ' lab' : ' labs'),
    onName: (e: { target: { value: string } }) => { const bs = S.bundles.slice(); bs[bi] = { ...bs[bi], name: e.target.value }; setBundles(bs) },
    onDesc: (e: { target: { value: string } }) => { const bs = S.bundles.slice(); bs[bi] = { ...bs[bi], desc: e.target.value }; setBundles(bs) },
    onAddLab: () => { const bs = S.bundles.slice(); bs[bi] = { ...bs[bi], labs: bs[bi].labs.concat(['']) }; setBundles(bs) },
    onRemove: () => setBundles(S.bundles.filter((_, j) => j !== bi)),
    labs: b.labs.map((ln, li) => ({
      v: ln,
      onIn: (e: { target: { value: string } }) => { const bs = S.bundles.slice(); const ls = bs[bi].labs.slice(); ls[li] = e.target.value; bs[bi] = { ...bs[bi], labs: ls }; setBundles(bs) },
      onRm: () => { const bs = S.bundles.slice(); bs[bi] = { ...bs[bi], labs: bs[bi].labs.filter((_, j) => j !== li) }; setBundles(bs) },
    })),
  }))
  const onAddBundle = () => setBundles(S.bundles.concat([{ id: 'b' + Date.now(), name: 'New bundle', desc: '', labs: [''] }]))
  const aUsers = S.users.map((u) => {
    const rm = roleMeta_(u.roleKey)
    return { name: u.name, role: rm.label, bg: rm.bg, c: rm.c, user: u.user, last: u.last, onRemove: () => setState({ users: S.users.filter((x) => x.id !== u.id) }) }
  })
  const nu = S.newUser
  const newUserReady = !!(nu.name.trim() && nu.user.trim())
  const onAddUser = () => {
    if (!newUserReady) return
    const init = nu.name.trim().split(' ').map((x) => x[0]).slice(0, 2).join('').toUpperCase()
    setState({ users: S.users.concat([{ id: 'u' + Date.now(), name: nu.name.trim(), title: '', roleKey: nu.role, user: nu.user.trim(), last: 'Just added', init, short: nu.name.trim() }]), newUser: { name: '', user: '', role: 'ma' } })
  }
  const roleOpts = ([['ma', 'Clinical staff'], ['provider', 'Provider'], ['admin', 'Admin']] as ['ma' | 'provider' | 'admin', string][]).map(([k, label]) => ({ label, k, ...chip(nu.role === k), on: () => setState({ newUser: { ...nu, role: k } }) }))

  // ---- visits ----
  const v0Fin = P.ev === 'Finalized'
  const seedVisit = { id: 'v0', type: (P.paths || []).join(', ') + ' · initial visit', date: isDraft ? 'Today' : P.last, status: v0Fin ? 'Finalized' : P.ev }
  const extraVisits = S.visitsByPatient[S.pid] || []
  const allVisits = extraVisits.slice().reverse().concat([seedVisit])
  const visitList = allVisits.map((v) => {
    const fin = v.id === 'v0' ? v0Fin : !!S.finalized[S.pid + '/' + v.id]
    const stat = fin ? 'Finalized' : v.status
    const sm = stat === 'Finalized' ? { bg: '#171810', c: '#f0e5db' } : stat === 'In progress' ? { bg: '#f3e8d3', c: '#a9762c' } : stat === 'Ready for review' ? { bg: '#ecdfd0', c: '#7a6242' } : { bg: '#efece6', c: '#8b8578' }
    return { type: v.type, date: v.date, status: stat, stBg: sm.bg, stC: sm.c, active: v.id === activeVid, dotBg: v.id === activeVid ? '#4f7355' : '#ddd2c2', bd: v.id === activeVid ? '#b6a28e' : '#e9e2d8', onOpen: () => setState({ activeVisit: { ...S.activeVisit, [S.pid]: v.id }, screen: 'eval' }) }
  })
  const activeVObj = allVisits.find((v) => v.id === activeVid) || seedVisit
  const activeVisitLabel = 'Visit · ' + activeVObj.date

  const onUpload = () => {
    setState({ labView: 'processing', procPct: 0, procMsg: 'Reading page 1 of 2…', aiLabs: null })
    if (timers.p) clearInterval(timers.p)
    timers.p = setInterval(() => {
      setState((prev) => {
        const p = prev.procPct + 6
        if (p >= 100) {
          if (timers.p) clearInterval(timers.p)
          return { labView: 'verify', procPct: 100 }
        }
        return { procPct: p, procMsg: p < 40 ? 'Reading page 1 of 2…' : p < 75 ? 'Reading page 2 of 2…' : 'Matching analytes to reference ranges…' }
      })
    }, 160)
  }

  return {
    locked: S.locked,
    unlocked: !S.locked,
    lockUsers,
    roleLabel: roleMeta.l, roleBg: roleMeta.bg, roleC: roleMeta.c, userName: S.userName,
    lockTimer: mm + ':' + ss,
    onLock: () => setState({ locked: true, lockSecs: lockMax() }),
    onActivity: () => { if (S.lockSecs < lockMax() - 5) setState({ lockSecs: lockMax() }) },
    navItems,
    hasPatient: !S.locked && !isAdmin,
    pName: P.name,
    pMeta: isDraft ? 'Intake in progress' : P.age + ' ' + (P.sex === 'M' ? 'M' : 'F') + ' · MRN 00' + (1040 + P.id),
    pChips: P.paths.map((t) => ({ t })),
    activeVisitLabel, onNewVisit: () => go('visits'),
    visitList, onNewFollowup: () => newVisit('Follow-up'), onNewLabs: () => newVisit('New labs / lab review'), onNewEncounter: () => newVisit('New encounter'),
    sPatients: S.screen === 'patients', sVisits: S.screen === 'visits', sIntake: S.screen === 'intake', sQuest: S.screen === 'quest', sVitals: S.screen === 'vitals', sLabs: S.screen === 'labs', sEval: S.screen === 'eval', sWorkup: S.screen === 'workup', sTalk: S.screen === 'talk', sSummary: S.screen === 'summary', sAdmin: S.screen === 'admin',
    ikHist, ikFam, ikMeds, ikAllergy,
    // board
    boardCount: filtered.length + ' patients', rows, rowPad: (CONFIG.boardDensity ?? 'compact') === 'compact' ? '8px' : '13px',
    pathFilters: mkFilters(['All', 'Metabolic', 'GLP-1', 'TRT', 'BHRT', 'Thyroid', 'Gut'], S.pathFilter, 'pathFilter'),
    statusFilters: mkFilters(['All', 'Not run', 'Ready for review', 'Finalized'], S.statusFilter, 'statusFilter'),
    onNewPatient: () => setState({ pid: 0, screen: 'intake', intakeStep: 1, intakePaths: [], ikChecks: {}, attested: {}, labView: 'upload' }),
    // intake
    ikSteps, ik1: S.intakeStep === 1, ik2: S.intakeStep === 2, ik3: S.intakeStep === 3, ik4: S.intakeStep === 4, ik5: S.intakeStep === 5,
    pwCards, glpNote: glpOn,
    backShow: S.intakeStep > 1,
    onBack: () => setState({ intakeStep: Math.max(1, S.intakeStep - 1) }),
    nextLabel: S.intakeStep === 5 ? 'Begin questionnaires →' : 'Continue',
    onNext: () => { if (S.intakeStep === 5) setState({ screen: 'quest' }); else setState({ intakeStep: S.intakeStep + 1 }) },
    // quest
    qTabs, qTitle: Q.title, qDesc: Q.desc, qItems, qChips, qInterp,
    qOn, qOff: !qOn, qTogLabel: qOn ? 'Administered this visit' : 'Off — not administered',
    qSwBg: qOn ? '#b6a28e' : '#ddd2c2', qSwL: qOn ? '17px' : '2px',
    qTog: () => setState({ qEnabled: { ...S.qEnabled, [qEnabledKey]: !qOn } }),
    qPrevLabel: qIdx > 0 ? qKeys[qIdx - 1] : 'Intake',
    qPrev: () => { if (qIdx > 0) setState({ qTab: qKeys[qIdx - 1] }); else go('intake') },
    qNextLabel: qIdx < qKeys.length - 1 ? 'Next: ' + qKeys[qIdx + 1] + ' →' : 'Continue to vitals →',
    qNext: () => { if (qIdx < qKeys.length - 1) setState({ qTab: qKeys[qIdx + 1] }); else go('vitals') },
    goLabs: () => go('labs'),
    // vitals
    vitFields, bmiVal: bmi ? bmi.toFixed(1) : '—', bmiClass: bmi ? bmiClass[0] : 'enter height and weight', bmiC: bmi ? bmiClass[1] : '#a19b8e', bmiCalc: bmi ? '703 × ' + wtN + ' ÷ ' + htN + '²' + (S.pid === 1 ? ' · prior 32.9' : '') : '',
    // labs
    labTabs, lvUpload: S.labView === 'upload', lvProcessing: S.labView === 'processing', lvVerify: S.labView === 'verify', lvResults: S.labView === 'results', lvManual: S.labView === 'manual',
    lvEmptyShow: panels.length === 0,
    manualRows, onAddRow: () => setState({ manual: S.manual.concat([{ a: '', v: '', u: '', r: '' }]) }),
    msBg: manualReady ? '#171810' : '#efece6', msC: manualReady ? '#fcfbfb' : '#a19b8e', msCur: manualReady ? 'pointer' : 'default',
    onSaveManual: () => { if (manualReady) setState({ manualSaved: { ...S.manualSaved, [S.pid]: true }, labView: 'results' }) },
    pdfName: isDraft ? 'NEW PATIENT — pending demographics' : P.name.split(' ').reverse().join(', ').toUpperCase() + ' · ' + P.age + ' ' + P.sex,
    pdfFile: isDraft ? 'uploaded-labs.pdf' : 'labs-' + P.name.split(' ')[1].toLowerCase() + '.pdf',
    onUpload,
    procW: S.procPct + '%', procMsg: S.procMsg,
    verifyRows, pdfLines, vConfirmed, vTotal: labSource.length,
    hcCount: labSource.filter((r) => r.conf === 'high').length,
    // On-device AI extraction (desktop only; browser keeps the mock upload).
    isDesktop: IS_DESKTOP, aiBusy: S.aiBusy, aiModel: !!S.aiLabs,
    onExtractAI: async () => {
      if (S.aiBusy) return
      setState({ aiBusy: true })
      const text = 'LABORATORY REPORT\n' + VERIFY.map((r) => `${r.a}: ${r.v} ${r.u}${r.flag ? ' ' + r.flag : ''} (ref ${r.r})`).join('\n')
      try {
        const rows = await extractLabs(text)
        setState({ aiLabs: rows.length ? rows : VERIFY, conf: {}, aiBusy: false, labView: 'verify' })
      } catch (e) {
        setState({ aiBusy: false })
        console.error('on-device extraction failed:', e)
      }
    },
    onConfirmAll: () => { const c = { ...S.conf }; VERIFY.forEach((r, i) => { if (r.conf === 'high') c[i] = true }); setState({ conf: c }) },
    addBg: allConf ? '#4f7355' : '#efece6', addC: allConf ? '#ffffff' : '#a19b8e', addCur: allConf ? 'pointer' : 'default',
    onAddRecord: () => { if (allConf) setState({ labView: 'results' }) },
    resultPanels,
    // eval
    evGated, evEmpty: (!E || isAdmin) && !isMA, evHas: !!E && !isMA && !isAdmin, evEmptyMsg,
    evBanner: 'Suggestions only. Provider review required before any order is placed.',
    evRan: E ? E.ran : '', markers, findings, recGroups,
    labBundles, manualOrderLabs, hasManualLabs: mlabs.length > 0, manualLabDraft: S.manualLabDraft,
    onManualLabInput: (e: { target: { value: string } }) => setState({ manualLabDraft: e.target.value }),
    onAddManualLab: () => { const v = (S.manualLabDraft || '').trim(); if (!v) return; setState({ manualLabs: { ...S.manualLabs, [vk]: mlabs.concat([v]) }, manualLabDraft: '' }) },
    notFinalized: !isFin, finalized: isFin,
    attBd: attestedNow ? '#171810' : '#c9b9a4', attBg: attestedNow ? '#171810' : '#ffffff', attMark: attestedNow ? '✓' : '',
    onAttest: () => setState({ attested: { ...S.attested, [vk]: !attestedNow } }),
    finHint: isProv ? (attestedNow ? 'Finalizing writes the plan and an audit entry.' : 'Check the attestation to enable finalization.') : 'Finalization is available to Provider roles only.',
    finBg: canFin ? '#171810' : '#efece6', finC: canFin ? '#fcfbfb' : '#a19b8e', finCur: canFin ? 'pointer' : 'default',
    onFinalize: () => { if (canFin) setState({ finalized: { ...S.finalized, [vk]: true }, attested: { ...S.attested, [vk]: false } }) },
    goTalk: () => go('talk'),
    // talk
    tpGated, tpShow: !tpGated, tpTabs, tpMedTitle: tp.title, tpMedSub: tp.sub, tpSections, tpDone, tpTotal, tpPct: Math.round((100 * tpDone) / tpTotal) + '%',
    tpBg: tpComplete && !tpSaved ? '#171810' : '#efece6', tpC: tpComplete && !tpSaved ? '#fcfbfb' : '#a19b8e', tpCur: tpComplete && !tpSaved ? 'pointer' : 'default',
    onSaveTp: () => { if (tpComplete) setState({ tpSaved: { ...S.tpSaved, [S.tpTab]: true } }) }, tpSaved,
    // summary
    smName: smP.name, smMeta: smP.age + ' ' + smP.sex + ' · MRN 00' + (1040 + smP.id),
    smFindings: smE.findings.map((f) => ({ t: f.t, d: f.d })),
    smPlan: smE.smPlan.map((p, i) => ({ ...p, n: i + 1 })),
    smTp: smE.smTp, smFollow: smE.smFollow,
    smLabsText: orderedUniq.join(' · '), smHasLabs: orderedUniq.length > 0, smNoLabs: orderedUniq.length === 0,
    onPrint: () => window.print(),
    // workup
    wkSteps: WK_STEPS, wkLabs: WK_LABS, wkFormulas: WK_FORMULAS,
    // admin
    aTabs, aU: S.aTab === 'users', aBundles: S.aTab === 'bundles', aA: S.aTab === 'audit', aB: S.aTab === 'backup',
    aUsers,
    newUserName: nu.name, newUserUser: nu.user, roleOpts,
    onNewUserName: (e: { target: { value: string } }) => setState({ newUser: { ...nu, name: e.target.value } }),
    onNewUserUser: (e: { target: { value: string } }) => setState({ newUser: { ...nu, user: e.target.value } }),
    onAddUser, addUserBg: newUserReady ? '#171810' : '#efece6', addUserC: newUserReady ? '#fcfbfb' : '#a19b8e', addUserCur: newUserReady ? 'pointer' : 'default',
    adminBundles, onAddBundle,
    aAudit: AUDIT,
    onBackup: () => setState({ backupDone: true }),
    backupLabel: S.backupDone ? '✓ Backup complete — verified' : 'Run backup now',
  }
}

export type Vals = ReturnType<typeof computeVals>

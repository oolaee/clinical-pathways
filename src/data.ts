/**
 * Static clinical content for the prototype — seeded patients, questionnaires,
 * lab data, evaluations, talking points, audit log, lab bundles, and users.
 * Ported verbatim from the design bundle. No real PHI: fictional sample data.
 */
import type { RoleKey } from './helpers'

export type Patient = {
  id: number
  name: string
  age: number
  sex: 'M' | 'F'
  paths: string[]
  last: string
  lab: string
  ev: string
}

export const PATIENTS: Patient[] = [
  { id: 1, name: 'Marcus Delgado', age: 48, sex: 'M', paths: ['GLP-1', 'Metabolic', 'TRT'], last: 'Jun 30', lab: 'Verified', ev: 'Ready for review' },
  { id: 2, name: 'Diane Whitfield', age: 51, sex: 'F', paths: ['BHRT'], last: 'Jul 1', lab: 'Verified', ev: 'Ready for review' },
  { id: 3, name: 'Sarah Kim', age: 39, sex: 'F', paths: ['Thyroid', 'Gut Health'], last: 'Jul 2', lab: 'Awaiting verification', ev: 'Not run' },
  { id: 4, name: 'Tom Braddock', age: 61, sex: 'M', paths: ['TRT'], last: 'Jun 12', lab: 'Verified', ev: 'Finalized' },
  { id: 5, name: 'Elena Cruz', age: 44, sex: 'F', paths: ['Metabolic'], last: 'Jun 26', lab: 'Pending upload', ev: 'Not run' },
  { id: 6, name: 'Rachel Nguyen', age: 55, sex: 'F', paths: ['BHRT', 'Thyroid'], last: 'Jun 24', lab: 'Verified', ev: 'Finalized' },
  { id: 7, name: 'David Okafor', age: 36, sex: 'M', paths: ['GLP-1', 'Metabolic'], last: 'Jun 29', lab: 'Awaiting verification', ev: 'Not run' },
  { id: 8, name: 'Janet Mills', age: 63, sex: 'F', paths: ['Thyroid'], last: 'Jun 18', lab: 'Verified', ev: 'Finalized' },
]

export type QuestItem = {
  q: string
  sub?: string
  type: 'yn' | 's10' | 'mrs' | 'ch'
  def: number
  opts?: string[]
}
export type Quest = { title: string; desc: string; items: QuestItem[] }

export const QUEST: Record<string, Quest> = {
  TRT: {
    title: 'TRT — ADAM + severity',
    desc: 'Androgen Deficiency in the Aging Male screen, then 0–10 symptom severity.',
    items: [
      { q: '1. Decrease in libido (sex drive)?', type: 'yn', def: 1 },
      { q: '2. Lack of energy?', type: 'yn', def: 1 },
      { q: '3. Decrease in strength or endurance?', type: 'yn', def: 1 },
      { q: '4. Lost height?', type: 'yn', def: 0 },
      { q: '5. Decreased enjoyment of life?', type: 'yn', def: 1 },
      { q: '6. Sad or grumpy?', type: 'yn', def: 0 },
      { q: '7. Erections less strong?', type: 'yn', def: 1 },
      { q: '8. Recent deterioration in ability to play sports?', type: 'yn', def: 1 },
      { q: '9. Falling asleep after dinner?', type: 'yn', def: 1 },
      { q: '10. Deterioration in work performance?', type: 'yn', def: 0 },
      { q: 'Libido severity', sub: '0 = no problem · 10 = severe', type: 's10', def: 6 },
      { q: 'Morning erections', sub: '0 = normal · 10 = absent', type: 's10', def: 5 },
      { q: 'Energy', sub: '0 = normal · 10 = exhausted daily', type: 's10', def: 7 },
      { q: 'Mood', type: 's10', def: 4 },
      { q: 'Muscle loss', type: 's10', def: 6 },
      { q: 'Brain fog', type: 's10', def: 6 },
    ],
  },
  BHRT: {
    title: 'BHRT — menopause rating scale',
    desc: 'Rate each symptom over the past 4 weeks. 0 none · 4 very severe.',
    items: [
      { q: 'Hot flashes', type: 'mrs', def: 3 },
      { q: 'Night sweats', type: 'mrs', def: 3 },
      { q: 'Sleep problems (falling or staying asleep)', type: 'mrs', def: 3 },
      { q: 'Depressive mood', type: 'mrs', def: 2 },
      { q: 'Irritability', type: 'mrs', def: 2 },
      { q: 'Anxiety / inner restlessness', type: 'mrs', def: 2 },
      { q: 'Physical and mental exhaustion', type: 'mrs', def: 3 },
      { q: 'Vaginal dryness', type: 'mrs', def: 2 },
      { q: 'Change in libido', type: 'mrs', def: 2 },
      { q: 'Bladder problems', type: 'mrs', def: 1 },
      { q: 'Cycle changes in the past 12 months?', type: 'ch', opts: ['Regular', 'Occasionally irregular', 'Frequently irregular', 'No cycle > 3 mo'], def: 2 },
    ],
  },
  Thyroid: {
    title: 'Thyroid — symptom severity',
    desc: 'Rate each symptom 0–10 over the past month.',
    items: [
      { q: 'Fatigue', type: 's10', def: 8 },
      { q: 'Cold intolerance', type: 's10', def: 6 },
      { q: 'Constipation', type: 's10', def: 4 },
      { q: 'Hair thinning', type: 's10', def: 7 },
      { q: 'Weight change despite unchanged habits', type: 's10', def: 5 },
      { q: 'Dry skin', type: 's10', def: 5 },
    ],
  },
  'Metabolic / GLP-1': {
    title: 'Metabolic / GLP-1 — response tracking',
    desc: 'Appetite, response history, and side-effect burden on current therapy.',
    items: [
      { q: 'Appetite', sub: '0 = fully suppressed · 10 = constant hunger', type: 's10', def: 6 },
      { q: 'Cravings (sugar, refined carbs)', type: 's10', def: 5 },
      { q: 'Energy crashes after meals', type: 's10', def: 6 },
      { q: 'Weight history pattern', type: 'ch', opts: ['Stable', 'Gradual gain', 'Rapid gain', 'Yo-yo pattern'], def: 3 },
      { q: 'Prior / current GLP-1 agent', type: 'ch', opts: ['None', 'Semaglutide', 'Tirzepatide', 'Liraglutide'], def: 1 },
      { q: 'Current dose', type: 'ch', opts: ['0.25 mg', '0.5 mg', '1 mg', '1.7 mg', '2.4 mg'], def: 4 },
      { q: 'Nausea on current dose?', type: 'yn', def: 0 },
      { q: 'Constipation?', type: 'yn', def: 1 },
      { q: 'Reflux?', type: 'yn', def: 0 },
      { q: 'How long has weight been flat?', type: 'ch', opts: ['Not flat', '< 2 wk', '2–4 wk', '4–6 wk', '6+ wk'], def: 4 },
    ],
  },
  'Gut Health': {
    title: 'Gut Health — GI symptom burden',
    desc: 'Conventional plus functional intake for the integrative workup.',
    items: [
      { q: 'Bloating', type: 's10', def: 6 },
      { q: 'Abdominal discomfort after meals', type: 's10', def: 4 },
      { q: 'Typical stool pattern', type: 'ch', opts: ['Type 1–2 (hard)', 'Type 3–4 (normal)', 'Type 5–7 (loose)', 'Alternating'], def: 3 },
      { q: 'Suspected food reactions?', type: 'yn', def: 1 },
      { q: 'Antibiotic courses, past 5 years', type: 'ch', opts: ['None', '1–2 courses', '3+ courses'], def: 1 },
      { q: 'NSAID use', type: 'ch', opts: ['Rare', 'Weekly', 'Daily'], def: 1 },
    ],
  },
}

export type VerifyRow = { a: string; v: string; u: string; r: string; flag: string; conf: 'high' | 'low' }

export const VERIFY: VerifyRow[] = [
  { a: 'TSH', v: '5.8', u: 'µIU/mL', r: '0.45 – 4.50', flag: 'H', conf: 'high' },
  { a: 'Free T4', v: '1.1', u: 'ng/dL', r: '0.8 – 1.8', flag: '', conf: 'high' },
  { a: 'Free T3', v: '2.6', u: 'pg/mL', r: '2.3 – 4.2', flag: '', conf: 'high' },
  { a: 'TPO Antibodies', v: '212', u: 'IU/mL', r: '< 34', flag: 'H', conf: 'low' },
  { a: 'Thyroglobulin Ab', v: '< 1.0', u: 'IU/mL', r: '< 1.0', flag: '', conf: 'low' },
  { a: 'Ferritin', v: '18', u: 'ng/mL', r: '16 – 154', flag: '', conf: 'high' },
  { a: 'Vitamin D, 25-OH', v: '24', u: 'ng/mL', r: '30 – 100', flag: 'L', conf: 'high' },
  { a: 'hs-CRP', v: '3.1', u: 'mg/L', r: '< 3.0', flag: 'H', conf: 'high' },
  { a: 'WBC', v: '6.2', u: 'K/µL', r: '3.4 – 10.8', flag: '', conf: 'high' },
]

export type PanelRow = { a: string; v: string; u: string; r: string; flag: string; hist: number[] | null }
export type Panel = { panel: string; date: string; rows: PanelRow[] }

export const PANELS: Record<number, Panel[]> = {
  1: [
    { panel: 'Metabolic panel', date: 'Collected Jun 26, 2026 · fasting', rows: [
      { a: 'Fasting glucose', v: '98', u: 'mg/dL', r: '65 – 99', flag: '', hist: [104, 101, 99, 98] },
      { a: 'Fasting insulin', v: '14.0', u: 'µIU/mL', r: '2.6 – 11.0', flag: 'H', hist: [18, 16.5, 15, 14] },
      { a: 'Hemoglobin A1c', v: '5.9', u: '%', r: '< 5.7', flag: 'H', hist: [6.2, 6.1, 6.0, 5.9] },
      { a: 'Triglycerides', v: '168', u: 'mg/dL', r: '< 150', flag: 'H', hist: [210, 195, 180, 168] },
      { a: 'HDL cholesterol', v: '38', u: 'mg/dL', r: '> 39', flag: 'L', hist: [34, 35, 37, 38] },
      { a: 'ALT', v: '42', u: 'U/L', r: '0 – 44', flag: '', hist: [55, 50, 46, 42] },
    ]},
    { panel: 'Hormone panel', date: 'Collected Jun 26, 2026 · 07:40 AM draw', rows: [
      { a: 'Total testosterone', v: '310', u: 'ng/dL', r: '264 – 916', flag: 'L*', hist: [345, 330, 318, 310] },
      { a: 'Free testosterone', v: '6.8', u: 'pg/mL', r: '9.1 – 24.6 (age 48)', flag: 'L', hist: [8.1, 7.6, 7.1, 6.8] },
      { a: 'LH', v: '3.2', u: 'mIU/mL', r: '1.7 – 8.6', flag: '', hist: [3.5, 3.4, 3.3, 3.2] },
      { a: 'Estradiol (sensitive)', v: '22', u: 'pg/mL', r: '8 – 35', flag: '', hist: [25, 24, 23, 22] },
      { a: 'SHBG', v: '28', u: 'nmol/L', r: '16 – 55', flag: '', hist: [26, 27, 27, 28] },
      { a: 'PSA', v: '0.9', u: 'ng/mL', r: '< 4.0', flag: '', hist: [0.8, 0.8, 0.9, 0.9] },
    ]},
  ],
  2: [
    { panel: 'Hormone panel', date: 'Collected Jun 29, 2026', rows: [
      { a: 'FSH', v: '38', u: 'mIU/mL', r: '25.8 – 134.8 (postmeno)', flag: 'H*', hist: [18, 24, 31, 38] },
      { a: 'Estradiol', v: '45', u: 'pg/mL', r: 'cycle-dependent', flag: '', hist: [110, 88, 62, 45] },
      { a: 'Progesterone', v: '0.4', u: 'ng/mL', r: 'luteal 1.8 – 24', flag: 'L', hist: [4.2, 2.1, 0.9, 0.4] },
      { a: 'TSH', v: '2.1', u: 'µIU/mL', r: '0.45 – 4.50', flag: '', hist: [2.3, 2.2, 2.0, 2.1] },
    ]},
    { panel: 'Metabolic screen', date: 'Collected Jun 29, 2026 · fasting', rows: [
      { a: 'Fasting glucose', v: '88', u: 'mg/dL', r: '65 – 99', flag: '', hist: [90, 89, 87, 88] },
      { a: 'Fasting insulin', v: '6.1', u: 'µIU/mL', r: '2.6 – 11.0', flag: '', hist: [6.5, 6.0, 6.2, 6.1] },
      { a: 'Hemoglobin A1c', v: '5.3', u: '%', r: '< 5.7', flag: '', hist: [5.4, 5.3, 5.4, 5.3] },
    ]},
  ],
  3: [
    { panel: 'Thyroid panel', date: 'Collected Jun 26, 2026 · pending verification', rows: [
      { a: 'TSH', v: '5.8', u: 'µIU/mL', r: '0.45 – 4.50', flag: 'H', hist: [3.9, 4.4, 5.1, 5.8] },
      { a: 'Free T4', v: '1.1', u: 'ng/dL', r: '0.8 – 1.8', flag: '', hist: [1.3, 1.2, 1.2, 1.1] },
      { a: 'TPO Antibodies', v: '212', u: 'IU/mL', r: '< 34', flag: 'H', hist: [88, 130, 170, 212] },
    ]},
  ],
}

export type Marker = { name: string; value: string; unit: string; st: string; lvl: string; detail: string }
export type Finding = { t: string; d: string; lvl: string }
export type Rec = { title: string; detail: string; rationale: string; tag: string }
export type Tier = { label: string; integ: boolean; recs: Rec[] }
export type RecGroup = { pathway: string; tiers: Tier[] }
export type Order = { name: string; desc: string }
export type SmPlanItem = { t: string; d: string }
export type Evaluation = {
  ran: string
  markers: Marker[]
  findings: Finding[]
  recs: RecGroup[]
  suggest: string[]
  orders: Order[]
  smPlan: SmPlanItem[]
  smTp: string
  smFollow: string
}

export const EVALS: Record<number, Evaluation> = {
  1: {
    ran: 'Jul 4, 2026 · 09:12',
    markers: [
      { name: 'HOMA-IR', value: '3.4', unit: '', st: 'Elevated', lvl: 'amber', detail: '(glucose 98 × insulin 14) ÷ 405 = 3.39 · threshold 2.5' },
      { name: 'Triglyceride : HDL ratio', value: '4.4', unit: '', st: 'Elevated', lvl: 'amber', detail: 'TG 168 ÷ HDL 38 · atherogenic above 3.0' },
      { name: 'Metabolic syndrome criteria', value: '3 / 5', unit: 'met', st: 'Meets criteria', lvl: 'red', detail: 'Waist 42 in (>40) · TG 168 (≥150) · HDL 38 (<40)' },
      { name: 'Free testosterone vs age norm', value: '6.8', unit: 'pg/mL', st: 'Low', lvl: 'red', detail: 'Age-48 reference 9.1 – 24.6 · total T 310, confirmed ×2 AM draws' },
      { name: 'GLP-1 response', value: '−14 lb', unit: '/ 12 wk', st: 'Plateau', lvl: 'amber', detail: 'Weight flat ±1 lb × 6 wk on semaglutide 2.4 mg · side-effect burden low' },
    ],
    findings: [
      { t: 'Insulin resistance', d: 'HOMA-IR 3.4 (threshold 2.5) — fasting insulin 14 µIU/mL, fasting glucose 98 mg/dL. Improving from 4.6 at baseline but persists on GLP-1.', lvl: 'amber' },
      { t: 'Metabolic syndrome', d: '3 of 5 criteria met: waist circumference 42 in, triglycerides 168 mg/dL, HDL 38 mg/dL. BP 134/86 borderline (criterion not met at <135).', lvl: 'red' },
      { t: 'GLP-1 plateau', d: 'Weight stable ±1 lb for 6 weeks at maximum semaglutide dose (2.4 mg). Nausea absent, appetite score 6/10 — pharmacologic ceiling likely reached.', lvl: 'amber' },
      { t: 'Symptomatic hypogonadism', d: 'Total testosterone 310 ng/dL confirmed on two morning draws; free T 6.8 pg/mL below age norm. LH 3.2 (inappropriately normal → secondary pattern). ADAM positive, severity 34/60.', lvl: 'red' },
      { t: 'Atherogenic dyslipidemia', d: 'TG/HDL ratio 4.4 with low HDL — consistent with the insulin-resistant lipid pattern.', lvl: 'amber' },
    ],
    recs: [
      { pathway: 'Metabolic / Weight Loss', tiers: [
        { label: 'Conventional · first-line', integ: false, recs: [
          { title: 'Metformin 500 mg PO BID with food', detail: 'Titrate by 500 mg weekly as tolerated to 1000 mg BID. Extended-release if GI intolerance.', rationale: 'HOMA-IR 3.4 with A1c 5.9 — insulin sensitization adjunct to GLP-1 therapy. eGFR 92, no contraindication.', tag: 'Olympia MET-04' },
          { title: 'Nutrition + resistance training plan', detail: 'Protein-forward pattern (≥1.2 g/kg), 30 g/day fiber, resistance training 3×/week, 7-hour sleep target.', rationale: 'Preserves lean mass during GLP-1 weight loss and improves insulin sensitivity independent of weight.', tag: 'Olympia MET-01' },
        ]},
        { label: 'Adjunct · integrative', integ: true, recs: [
          { title: 'Berberine 500 mg TID', detail: 'With meals, 12-week trial. Avoid combining with macrolides.', rationale: 'Integrative option for insulin resistance; modest evidence. Clearly labeled adjunct — not a metformin substitute.', tag: 'Olympia INT-02' },
        ]},
      ]},
      { pathway: 'GLP-1 · plateau workup', tiers: [
        { label: 'Conventional · first-line', integ: false, recs: [
          { title: 'Plateau workup before dose change', detail: 'Confirm adherence and injection technique. Recheck fasting insulin, A1c, AM cortisol, full thyroid panel. Review sleep and alcohol intake.', rationale: '6-week plateau at maximum dose triggers workup logic before any agent switch.', tag: 'Olympia GLP-07' },
          { title: 'If workup unremarkable: transition to tirzepatide 2.5 mg SC weekly', detail: 'One-week washout from semaglutide; titrate q4wk per response. Counsel on renewed GI adaptation.', rationale: 'Dual GIP/GLP-1 agonism produces further loss in a majority of semaglutide plateau patients.', tag: 'Olympia GLP-08' },
        ]},
      ]},
      { pathway: 'TRT', tiers: [
        { label: 'Conventional · first-line', integ: false, recs: [
          { title: 'Injectable — testosterone cypionate 100 mg IM weekly, or 50 mg SC twice weekly', detail: 'Most predictable levels. SC twice-weekly flattens peaks/troughs. Recheck total/free T, CBC (hematocrit), sensitive estradiol, PSA at 6 and 12 weeks, then q6mo.', rationale: 'Confirmed symptomatic hypogonadism: total T 310 ×2, free T below age norm, ADAM positive. Secondary pattern — pituitary review documented.', tag: 'Olympia TRT-01' },
          { title: 'Transdermal — testosterone cream 100 mg/mL, apply 1 mL (100 mg) daily', detail: 'Alternative for needle-averse patients. Apply to shoulders/inner arms; caution re: transference to partners/children — wash hands, cover site. Trough level at 4–6 weeks (draw ~2 h post-application).', rationale: 'Offered as a route choice. Daily dosing gives stable levels but adds transference risk and absorption variability.', tag: 'Olympia TRT-02' },
        ]},
        { label: 'Fertility-sparing alternative · discuss first', integ: true, recs: [
          { title: 'Enclomiphene citrate 12.5–25 mg PO daily (or every other day)', detail: 'Raises endogenous testosterone by stimulating LH/FSH — preserves testicular function and fertility. Recheck total T and LH at 4–6 weeks; titrate to a mid-normal T. Suits a secondary (low/normal LH) pattern like this one.', rationale: 'This patient has an inappropriately-normal LH of 3.2 (secondary hypogonadism) and is 48 — enclomiphene can restore levels without shutting down the axis or fertility. Preferred to discuss before exogenous testosterone.', tag: 'Olympia TRT-03' },
          { title: 'HCG 500 IU SC twice weekly alongside injectable TRT', detail: 'Only if the patient chooses exogenous testosterone AND wants fertility preserved; maintains intratesticular testosterone.', rationale: 'Exogenous testosterone suppresses spermatogenesis; HCG mitigates. Confirm family planning status before start.', tag: 'Olympia TRT-04' },
        ]},
      ]},
    ],
    suggest: ['met', 'trt', 'plateau', 'micro'],
    orders: [
      { name: 'Metabolic follow-up set', desc: 'A1c, fasting insulin, lipid panel with NMR — recheck at 12 weeks' },
      { name: 'TRT baseline set', desc: 'PSA, CBC with hematocrit, sensitive estradiol — required before first injection' },
      { name: 'Plateau workup set', desc: 'AM cortisol, TSH, free T4, free T3 — rule out secondary causes of stall' },
      { name: 'Micronutrient panel (integrative)', desc: 'Vitamin D, B12, magnesium RBC, zinc — optional, patient interest dependent' },
    ],
    smPlan: [
      { t: 'Metformin 500 mg BID', d: 'titrating to 1000 mg BID over 3 weeks; take with food' },
      { t: 'Continue semaglutide 2.4 mg weekly', d: 'pending plateau workup results; possible transition to tirzepatide at follow-up' },
      { t: 'Testosterone cypionate 100 mg IM weekly', d: 'first injection after baseline PSA/CBC/E2 drawn; 6-week labs scheduled' },
      { t: 'Nutrition and resistance training plan', d: 'protein ≥1.2 g/kg, resistance training 3×/week' },
    ],
    smTp: 'Metformin start counseling completed and saved (mechanism, GI side effects, lactic acidosis precautions, B12 monitoring). Testosterone start counseling completed (erythrocytosis, fertility suppression, monitoring schedule, consent confirmed).',
    smFollow: '6 weeks — Aug 15, 2026. Labs 1 week prior: TRT 6-week set + plateau workup set.',
  },
  2: {
    ran: 'Jul 4, 2026 · 08:35',
    markers: [
      { name: 'Menopause rating scale', value: '26', unit: '/ 44', st: 'Mod–severe', lvl: 'amber', detail: 'Vasomotor subscore 6/8 · sleep and exhaustion prominent' },
      { name: 'FSH', value: '38', unit: 'mIU/mL', st: 'Perimenopausal', lvl: 'amber', detail: 'Rising across 4 draws (18 → 38) with irregular cycles' },
      { name: 'HOMA-IR', value: '1.3', unit: '', st: 'Normal', lvl: 'ok', detail: '(glucose 88 × insulin 6.1) ÷ 405 = 1.33 · threshold 2.5' },
    ],
    findings: [
      { t: 'Symptomatic perimenopause', d: 'MRS 26/44 with severe vasomotor symptoms and sleep disruption. FSH 38 rising, progesterone 0.4, cycles frequently irregular ×12 months.', lvl: 'amber' },
      { t: 'Metabolic screen normal', d: 'HOMA-IR 1.3, A1c 5.3, fasting glucose 88 — no metabolic intervention indicated.', lvl: 'ok' },
    ],
    recs: [
      { pathway: 'BHRT', tiers: [
        { label: 'Conventional · first-line', integ: false, recs: [
          { title: 'Estradiol patch 0.0375 mg/day, changed twice weekly — or estradiol cream 0.5 mg daily', detail: 'Plus micronized progesterone 100 mg PO nightly (intact uterus). Reassess symptoms at 6 weeks; E2 level at 8–12 weeks.', rationale: 'Moderate–severe vasomotor symptoms in perimenopause; transdermal route preferred (age 51, no VTE history). Uterus intact → progesterone required.', tag: 'Olympia BHRT-02' },
          { title: 'Sleep and symptom hygiene plan', detail: 'Cooling sleep environment, trigger diary (alcohol, caffeine), strength training 2–3×/week.', rationale: 'Improves vasomotor and sleep outcomes alongside hormone therapy.', tag: 'Olympia BHRT-01' },
        ]},
        { label: 'Adjunct · integrative', integ: true, recs: [
          { title: 'Magnesium glycinate 300 mg nightly', detail: '8-week trial for sleep quality.', rationale: 'Low-risk integrative adjunct for sleep disruption; evidence modest and labeled as such.', tag: 'Olympia INT-05' },
        ]},
      ]},
    ],
    suggest: ['bhrt', 'breast', 'adrenal'],
    orders: [
      { name: 'BHRT baseline set', desc: 'Estradiol, FSH, TSH, lipid panel — drawn before first application' },
      { name: 'Breast imaging confirmation', desc: 'Verify mammogram within 12 months before initiating estradiol' },
      { name: 'Adrenal pattern panel (integrative)', desc: '4-point salivary cortisol — optional, patient interest dependent' },
    ],
    smPlan: [
      { t: 'Estradiol patch 0.0375 mg/day', d: 'twice weekly, with micronized progesterone 100 mg nightly' },
      { t: 'Symptom and sleep plan', d: 'trigger diary, strength training 2–3×/week' },
    ],
    smTp: 'BHRT start counseling completed: expected timeline, breast tenderness and spotting, VTE and breast cancer risk discussion documented, monitoring schedule reviewed, consent confirmed.',
    smFollow: '6 weeks — Aug 12, 2026. E2 level at 8–12 weeks.',
  },
}

export type TalkSection = { label: string; items: string[] }
export type Talk = { key: string; title: string; sub: string; sections: TalkSection[] }

export const TALK: Talk[] = [
  { key: 'Metformin', title: 'Starting metformin', sub: '500 mg BID → 1000 mg BID · with food', sections: [
    { label: 'Mechanism · plain language', items: ['Explained: metformin tells the liver to release less sugar and helps muscles use insulin better — it does not cause low blood sugar on its own.'] },
    { label: 'Expected timeline', items: ['Stomach effects settle within 1–2 weeks; full effect on labs at 4–6 weeks.', 'We recheck A1c and fasting insulin at 12 weeks.'] },
    { label: 'Common side effects', items: ['Nausea, loose stools, metallic taste — usually temporary; always take with food.', 'If GI effects persist, we switch to the extended-release form.'] },
    { label: 'Serious warnings', items: ['Lactic acidosis is rare: hold metformin for contrast-dye imaging, severe illness, or heavy alcohol use — call us first.', 'Long-term use can lower B12; we check it yearly.'] },
    { label: 'Contraindications reviewed', items: ['Kidney function confirmed adequate (eGFR 92, threshold 30).', 'No liver disease or heavy alcohol use reported.'] },
    { label: 'Monitoring schedule', items: ['A1c + fasting insulin at 12 weeks, then every 6 months. B12 yearly.'] },
    { label: 'Consent', items: ['Patient verbalized understanding and agrees to start. Questions answered.'] },
  ]},
  { key: 'Testosterone', title: 'Starting testosterone cypionate', sub: '100 mg IM weekly · or 50 mg SC twice weekly', sections: [
    { label: 'Mechanism · plain language', items: ['Explained: this replaces the testosterone the body is under-producing, restoring levels to the normal range for his age.'] },
    { label: 'Expected timeline', items: ['Energy, mood, and libido typically improve at 3–6 weeks; body composition changes take 3–6 months.'] },
    { label: 'Common side effects', items: ['Acne or oily skin, injection-site soreness, mild fluid retention early on.'] },
    { label: 'Serious warnings', items: ['Blood can thicken (raised hematocrit) — this is why we draw a CBC at 6 and 12 weeks; donation or dose change if >54%.', 'Fertility is suppressed while on therapy — family planning status confirmed and documented.', 'Can worsen untreated sleep apnea — screening discussed.'] },
    { label: 'Contraindications reviewed', items: ['PSA 0.9, no prostate cancer history; hematocrit 44% at baseline.', 'Not seeking near-term fertility (HCG option offered and declined/accepted — documented).'] },
    { label: 'Monitoring schedule', items: ['Total/free T, CBC, sensitive estradiol, PSA at 6 and 12 weeks, then every 6 months.'] },
    { label: 'Consent', items: ['Patient verbalized understanding, chose injection route, and consents to start.'] },
  ]},
  { key: 'GLP-1', title: 'Starting a GLP-1 (semaglutide)', sub: '0.25 mg SC weekly · titrate every 4 weeks', sections: [
    { label: 'Mechanism · plain language', items: ['Explained: this mimics a fullness hormone — it slows stomach emptying and quiets “food noise,” so smaller portions satisfy.'] },
    { label: 'Expected timeline', items: ['Appetite effect within days of each dose step; meaningful weight change measured over months, not weeks.', 'Dose increases every 4 weeks as tolerated.'] },
    { label: 'Common side effects', items: ['Nausea, constipation, reflux — worst in the first 1–2 weeks of each step.', 'Mitigation reviewed: smaller meals, less fat, hydration, fiber, stop eating at first fullness.'] },
    { label: 'Serious warnings', items: ['Severe abdominal pain that radiates to the back → stop and call (pancreatitis warning).', 'Gallbladder issues possible with rapid weight loss — symptoms reviewed.', 'Boxed warning: thyroid C-cell tumors in rodents — do not use with personal/family history of medullary thyroid cancer or MEN2 (screened: negative).'] },
    { label: 'Contraindications reviewed', items: ['No personal or family history of MTC or MEN2; no pancreatitis history; not pregnant or planning pregnancy.'] },
    { label: 'Monitoring schedule', items: ['Weight every 2 weeks in-app; side-effect check at each dose step; labs at 12 weeks.'] },
    { label: 'Consent', items: ['Patient verbalized understanding and consents to start; injection technique demonstrated.'] },
  ]},
]

export type AuditEntry = { ts: string; user: string; action: string; pt: string }

export const AUDIT: AuditEntry[] = [
  { ts: 'Jul 4 · 10:42', user: 'aosei (Provider)', action: 'Finalized evaluation plan', pt: 'Delgado, Marcus' },
  { ts: 'Jul 4 · 10:38', user: 'aosei (Provider)', action: 'Viewed evaluation results', pt: 'Delgado, Marcus' },
  { ts: 'Jul 4 · 09:12', user: 'aosei (Provider)', action: 'Ran rules engine v3.2', pt: 'Delgado, Marcus' },
  { ts: 'Jul 3 · 16:20', user: 'jellis (Clinical staff)', action: 'Verified 9 extracted lab values', pt: 'Kim, Sarah' },
  { ts: 'Jul 3 · 16:04', user: 'jellis (Clinical staff)', action: 'Uploaded lab PDF (2 pages)', pt: 'Kim, Sarah' },
  { ts: 'Jul 2 · 14:11', user: 'jellis (Clinical staff)', action: 'Entered vitals', pt: 'Whitfield, Diane' },
  { ts: 'Jul 2 · 13:58', user: 'jellis (Clinical staff)', action: 'Completed BHRT questionnaire', pt: 'Whitfield, Diane' },
  { ts: 'Jul 1 · 09:30', user: 'pnair (Admin)', action: 'Ran manual backup — verified', pt: '—' },
  { ts: 'Jun 30 · 11:47', user: 'aosei (Provider)', action: 'Edited medication list', pt: 'Delgado, Marcus' },
  { ts: 'Jun 30 · 08:15', user: 'jellis (Clinical staff)', action: 'Created patient record', pt: 'Okafor, David' },
]

export type Bundle = { id: string; name: string; desc: string; labs: string[] }

export const INITIAL_BUNDLES: Bundle[] = [
  { id: 'met', name: 'Metabolic follow-up set', desc: 'Recheck at 12 weeks', labs: ['Hemoglobin A1c', 'Fasting insulin', 'Lipid panel', 'NMR LipoProfile'] },
  { id: 'trt', name: 'TRT baseline set', desc: 'Required before first injection', labs: ['PSA', 'CBC with hematocrit', 'Sensitive estradiol'] },
  { id: 'plateau', name: 'Plateau workup set', desc: 'Rule out secondary causes of stall', labs: ['AM cortisol', 'TSH', 'Free T4', 'Free T3'] },
  { id: 'micro', name: 'Micronutrient panel', desc: 'Optional · patient interest dependent', labs: ['Vitamin D, 25-OH', 'Vitamin B12', 'Magnesium RBC', 'Zinc'] },
  { id: 'bhrt', name: 'BHRT baseline set', desc: 'Before first application', labs: ['Estradiol', 'FSH', 'TSH', 'Lipid panel'] },
  { id: 'breast', name: 'Breast imaging confirmation', desc: 'Verify before initiating estradiol', labs: ['Mammogram within 12 months'] },
  { id: 'adrenal', name: 'Adrenal pattern panel', desc: 'Integrative · optional', labs: ['4-point salivary cortisol', 'DHEA-S'] },
  { id: 'htn', name: 'Hypertension baseline set', desc: 'Before starting therapy', labs: ['BMP', 'Urinalysis', 'Lipid panel', 'EKG'] },
]

export type User = {
  id: string
  name: string
  title: string
  roleKey: RoleKey
  user: string
  last: string
  init: string
  short: string
}

export const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Amara Osei, MD', title: 'Physician · Medical Director', roleKey: 'provider', user: 'aosei', last: 'Today · 10:42', init: 'AO', short: 'Dr. Osei' },
  { id: 'u2', name: 'Jordan Ellis, MA', title: 'Medical Assistant', roleKey: 'ma', user: 'jellis', last: 'Yesterday · 16:20', init: 'JE', short: 'J. Ellis' },
  { id: 'u3', name: 'Priya Nair', title: 'Practice Administrator', roleKey: 'admin', user: 'pnair', last: 'Jul 1 · 09:30', init: 'PN', short: 'P. Nair' },
]

/** Provider-reference content for the Heavy Metabolic Workup screen. */
export const WK_STEPS = [
  { n: 'STEP 1', t: 'Baseline — before any agent', d: 'Draw the full panel fasting, before starting GLP-1, metformin, or hormones. This is the reference point every future decision compares against.' },
  { n: 'STEP 2', t: 'Recheck at 12 weeks', d: 'Insulin and TG/HDL move before weight does. A falling HOMA-IR on a stable weight means the therapy is working — do not abandon it.' },
  { n: 'STEP 3', t: 'On every plateau or stall', d: 'A GLP-1 plateau with a normal workup is a dosing problem. A plateau with rising insulin or cortisol is a different disease — work it up before switching agents.' },
]

export const WK_LABS = [
  { name: 'Fasting insulin', target: 'Target < 8 µIU/mL', what: 'The single most sensitive early marker. Rises years before glucose — a normal glucose with insulin of 15 is insulin resistance, full stop.', act: 'Feeds HOMA-IR. > 11 with normal glucose = early IR → lifestyle + consider metformin.' },
  { name: 'Fasting glucose + A1c', target: 'Glucose < 100 · A1c < 5.7%', what: 'Late-stage markers. By the time these rise, beta cells have been compensating for a decade. Never reassuring on their own.', act: 'A1c 5.7–6.4 = prediabetes → treat the insulin resistance now, not at 6.5.' },
  { name: 'Lipid panel + NMR (LP-IR)', target: 'TG/HDL < 3.0 · small LDL-P low', what: 'The insulin-resistant lipid signature: high triglycerides, low HDL, small dense LDL particles. Standard LDL-C can look normal while particle number is high.', act: 'TG/HDL > 3.0 supports IR even with normal insulin. High small LDL-P → treat metabolically before reaching for a statin alone.' },
  { name: 'hs-CRP', target: 'Target < 1.0 mg/L', what: 'Vascular inflammation. IR and visceral fat drive it; it independently predicts cardiovascular events.', act: '1–3 = moderate risk, > 3 = high. Falls with weight loss and exercise — good progress marker.' },
  { name: 'Uric acid', target: 'Target < 6.0 mg/dL', what: 'Marker of fructose load and metabolic stress; tracks with fatty liver and hypertension.', act: '> 6.5 → cut fructose/alcohol; recheck with the 12-week panel.' },
  { name: 'ALT + GGT', target: 'ALT < 30 · GGT < 30', what: 'Screens for fatty liver — present in most patients with significant IR and reversible with treatment.', act: 'ALT > 30 in this context suggests NAFLD → ultrasound or FibroScan if persistent, weight loss is the treatment.' },
  { name: 'AM cortisol', target: 'Draw before 9 AM', what: 'Rules out the stall-driver nobody checks: chronic cortisol elevation blocks weight loss and raises glucose.', act: 'Part of every plateau workup. Elevated → sleep, stress, and med review before blaming the GLP-1.' },
  { name: 'TSH + free T4/T3', target: 'TSH 0.45 – 4.5', what: 'Untreated hypothyroidism drops resting energy expenditure ~10% and mimics metabolic failure.', act: 'Always in the plateau workup. Subclinical patterns (TSH 4.5–10, normal T4) → check TPO before deciding.' },
]

export const WK_FORMULAS = [
  { n: 'HOMA-IR', d: '(fasting glucose × fasting insulin) ÷ 405. Under 1.5 ideal · over 2.5 = insulin resistance · over 4 = severe.' },
  { n: 'TG : HDL ratio', d: 'Triglycerides ÷ HDL. Under 2 ideal · over 3 = atherogenic, insulin-resistant pattern.' },
  { n: 'MetSyn criteria', d: 'Count of 5: waist (> 40 in M / > 35 in F), TG ≥ 150, HDL (< 40 M / < 50 F), BP ≥ 130/85, glucose ≥ 100. Three or more = metabolic syndrome.' },
]

/** Pathway cards on the intake step: [name, description]. */
export const PW: [string, string][] = [
  ['Metabolic / Weight Loss', 'Insulin resistance and metabolic syndrome evaluation. Foundation pathway.'],
  ['GLP-1', 'Response tracking, side-effect burden, dose history, plateau workup. Always includes Metabolic.'],
  ['TRT (men)', 'Low testosterone evaluation and treatment with monitoring plan.'],
  ['BHRT (women)', 'Perimenopause and menopause hormone evaluation and treatment.'],
  ['Thyroid', 'Full panel interpretation including subclinical patterns.'],
  ['Gut Health / Functional', 'Permeability, GI symptom burden, integrative workup alongside conventional.'],
]

/** DC props → app config (defaults from the prototype's data-props). */
export const CONFIG = { autoLockMinutes: 15, boardDensity: 'compact' as 'compact' | 'comfortable' }

# Clinical Pathways

Provider-facing **clinical decision support** desktop app for Olympia Aesthetics &
Wellness (Palm Harbor, FL). This is the real React implementation of the
high-fidelity design that was prototyped in Claude Design — see
[`design-source/`](./design-source) for the original handoff bundle.

It is internal, provider-facing software — never patient-facing. The product
vision is a fully local desktop app (Tauri, encrypted SQLite, local Ollama).
This repository is the **web frontend** for that: the complete, navigable UI with
mock processing and seeded sample patients. No real authentication, PDF parsing,
or AI calls — all clinical logic is deterministic and rules-based.

## Stack

- **React 18 + TypeScript + Vite**
- No UI framework — inline styles ported faithfully from the design so the output
  is pixel-identical. Fonts (Cormorant Garamond for titles, DM Sans for
  everything else) load from Google Fonts.

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build to dist/
npm run typecheck  # tsc only
```

On the lock screen, pick a profile to unlock — the role you choose drives what
you can see and do:

| Profile | Role | Access |
| --- | --- | --- |
| Amara Osei, MD | Provider | Full — evaluations, dosing, finalize plans, admin |
| Jordan Ellis, MA | Clinical staff | Intake, vitals, labs, verification; no dosing, no finalize |
| Priya Nair | Admin | User management, audit log, lab bundles, backup only |

## What's in it

Every screen from the design is built and navigable:

- **Lock screen** with practice branding, role badges, and an idle auto-lock timer
- **Patient Board** — ED-tracking-board style, filter by pathway and status
- **Visits** — per-patient encounters (follow-up, lab review, new encounter)
- **Intake** — 5 steps; checkbox history/meds; pathway cards (GLP-1 auto-selects
  Metabolic)
- **Questionnaires** — TRT / BHRT / Thyroid / Metabolic-GLP-1 / Gut, with
  per-pathway "administered" toggles and computed scores
- **Vitals** — auto-calculated BMI, trend sparklines
- **Labs** — upload → mock local extraction → per-value human verification (with
  low-confidence flags) → results; plus manual entry
- **Evaluation** — computed markers, findings, tiered recommendations by pathway,
  JNC-8 systemic screening driven live from entered vitals, toggleable lab
  bundles, attestation + provider-only finalize
- **Metabolic Workup** — provider reference
- **Talking Points** — metformin / testosterone / GLP-1 start checklists
- **Visit Summary** — print-ready chart summary
- **Administration** — users, editable lab bundles, audit log, backup/encryption

Three seeded fictional patients demonstrate the full range (multi-pathway
GLP-1 + TRT, perimenopausal BHRT, subclinical thyroid + gut).

## Code layout

```
src/
  data.ts        Seeded clinical content (patients, questionnaires, labs, evals…)
  store.ts       App state + class-style setState + auto-lock timer
  vals.ts        The derived view-model — computes every value + handler the UI reads
  helpers.ts     Sparkline, chip/level/role color helpers
  ui.tsx         css() string→style helper + hover-capable <Box>
  components/    Lock, Header, Sidebar
  screens/       One component per screen
```

`vals.ts` is a faithful port of the prototype's single render function; the
screens are thin and read entirely from it. Prototype state (bundles, added
users, visits) lives in memory and resets on reload, matching the design's scope.

## Notes

- **No PHI.** All patient data is fictional sample data for the prototype.
- The design source and conversation transcripts are preserved under
  `design-source/` for reference.

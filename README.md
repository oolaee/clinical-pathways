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
src-tauri/       Tauri v2 desktop shell (Rust) — hosts the frontend natively
```

`vals.ts` is a faithful port of the prototype's single render function; the
screens are thin and read entirely from it. Prototype state (bundles, added
users, visits) lives in memory and resets on reload, matching the design's scope.

## Desktop app (Tauri)

The web frontend above is wrapped in a [Tauri](https://tauri.app) v2 shell
(`src-tauri/`) so it runs as a native desktop app. Right now the shell just hosts
the frontend in a native window — no backend commands yet — which is the
foundation for the local-first backend (encrypted SQLite + local Ollama) on the
roadmap below.

### Prerequisites

- **Rust** (stable) — https://rustup.rs
- **Node** 18+
- Platform WebView:
  - **macOS** — WebKit is built in; install Xcode Command Line Tools (`xcode-select --install`).
  - **Windows** — [WebView2 runtime](https://developer.microsoft.com/microsoft-edge/webview2/) (preinstalled on Windows 11) + the MSVC C++ Build Tools.
  - **Linux** — `libwebkit2gtk-4.1-dev`, `libgtk-3-dev`, `librsvg2-dev`, `libayatana-appindicator3-dev`, `build-essential`.

### Run / build

```bash
npm install
npm run desktop         # tauri dev — launches the native window with hot reload
npm run desktop:build   # tauri build — produces installers in src-tauri/target/release/bundle/
```

`npm run desktop:build` outputs a `.dmg`/`.app` on macOS, `.msi`/`.exe` on
Windows, and `.deb`/`.AppImage` on Linux. App icons are generated from
`assets/app-icon.svg` → `assets/app-icon.png`; regenerate the full platform set
with `npm run tauri icon assets/app-icon.png`.

> This scaffold was authored and dependency-checked on Linux, where the WebKitGTK
> system libs weren't available to complete a full native build. The Rust code,
> `tauri.conf.json`, and `Cargo.lock` all validate; run `npm run desktop` on
> macOS or Windows to launch it.

### Roadmap to the full local-first app

1. **Self-host fonts** — the frontend currently loads Cormorant Garamond / DM Sans
   from Google Fonts. For a truly offline, "nothing leaves this device" app, bundle
   the `.woff2` files locally and tighten `tauri.conf.json` → `app.security.csp`
   from `null` to a strict local policy. _(Top priority before shipping.)_
2. **Encrypted SQLite** — add SQLCipher (AES-256) via a Tauri command layer;
   replace the in-memory store with persistent, encrypted local data.
3. **Local Ollama** — wire lab-PDF extraction and visit-summary drafting to a
   local model, keeping all inference on-device.
4. **Auth & OS keychain** — real login and key storage in the OS keychain.

## Notes

- **No PHI.** All patient data is fictional sample data for the prototype.
- The design source and conversation transcripts are preserved under
  `design-source/` for reference.

# Clinical Pathways

Provider-facing **clinical decision support** desktop app for Olympia Aesthetics &
Wellness (Palm Harbor, FL). This is the real React implementation of the
high-fidelity design that was prototyped in Claude Design — see
[`design-source/`](./design-source) for the original handoff bundle.

It is internal, provider-facing software — never patient-facing. It ships as a
**standalone macOS app** (Tauri) with an **on-device LLM bundled into the
installer** — no cloud, no separate model download, nothing leaves the machine.
The clinical rules engine is fully deterministic; the model only assists with
two tasks (lab extraction, visit-summary drafting) and every output requires
provider review.

Running as a plain web app (`npm run dev`) uses seeded sample patients and
deterministic mocks for those two tasks, so the UI is fully usable without a
model. The bundled model is used automatically when running the desktop build.

> **Installing on a Mac?** See **[INSTALL.md](./INSTALL.md)** for the full
> step-by-step (prerequisites → build → install), or just run
> `scripts/build-macos.sh` on a Mac.

## Stack

- **React 18 + TypeScript + Vite**, packaged as a **Tauri v2** macOS app.
- No UI framework — inline styles ported faithfully from the design so the output
  is pixel-identical. Fonts (Cormorant Garamond, DM Sans) are **self-hosted**
  (`src/fonts.css`) so the app makes **zero external requests**.
- **On-device LLM** bundled in the installer (llama.cpp sidecar + GGUF model).
- **Encrypted local persistence** (SQLite + AES-256-GCM); data survives restarts
  and never leaves the machine.

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
  ai.ts          Desktop LLM client — invokes the Rust commands, mock fallback
  db.ts          Desktop persistence client — load/save the encrypted store
  fonts.css      Self-hosted @font-face (woff2 in src/fonts/)
  components/    Lock, Header, Sidebar
  screens/       One component per screen
src-tauri/       Tauri v2 desktop shell (Rust)
  src/ai.rs      llama.cpp sidecar lifecycle + extract_labs / draft_summary
  src/db.rs      Encrypted SQLite store (AES-256-GCM) + db_load / db_save
  binaries/      Bundled llama-server (fetched, gitignored)
  resources/     Bundled GGUF model (fetched, gitignored)
scripts/
  fetch-llm.sh     Provisions the runtime + model into the bundle
  build-macos.sh   One-shot: prereq check → provision → build the app
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

### Provision the on-device LLM (once, before building)

The app bundles its own model so the installed product is fully offline. Fetch
the runtime + model into the Tauri bundle before building:

```bash
scripts/fetch-llm.sh
```

This builds a **static `llama-server`** (llama.cpp, MIT, Metal-accelerated on
macOS — a single self-contained binary) into `src-tauri/binaries/`, and downloads
a quantized **GGUF model** into `src-tauri/resources/models/`. Both are then
bundled into the `.app` by Tauri and never fetched at runtime. Requires Xcode
Command Line Tools + `cmake`. Neither artifact is committed (they're large and
gitignored).

**Model presets.** Pick by the Mac's RAM with `MODEL_PRESET=… scripts/fetch-llm.sh`
(default `qwen-7b`). Medical-tuned and general options:

| preset | model | ~size | min RAM | license |
| --- | --- | --- | --- | --- |
| `medgemma-27b` | MedGemma 27B (Google, medical) | ~16 GB | 32 GB | HAI-DEF* |
| `openbio-8b` | OpenBioLLM-8B (Llama-3, medical) | ~5 GB | 16 GB | Llama-3* |
| `meditron-8b` | Meditron-3 8B (Llama-3.1, medical) | ~5 GB | 16 GB | Llama-3.1* |
| `biomistral-7b` | BioMistral-7B (medical) | ~4.5 GB | 16 GB | Apache-2.0 |
| `medgemma-4b` | MedGemma 4B (Google, medical) | ~3 GB | 16 GB | HAI-DEF* |
| `qwen-14b` | Qwen2.5-14B (general reasoning) | ~9 GB | 32 GB | Apache-2.0 |
| `qwen-7b` | Qwen2.5-7B (general, **default**) | ~4.7 GB | 16 GB | Apache-2.0 |
| `qwen-3b` | Qwen2.5-3B (smallest) | ~2 GB | 8 GB | Apache-2.0 |

\*Medical fine-tunes inherit their base model's license — confirm the terms for a
commercial product. The Apache-2.0 rows are cleanest to redistribute. Or point at
any GGUF with `MODEL_URL=… MODEL_FILE=…`.

> **Safety scope.** By design the deterministic rules engine — not the model — is
> the clinical decision authority. The LLM assists (lab extraction, drafting,
> surfacing considerations) and every output is provider-reviewed. Keep it in that
> assistive role; using an LLM for autonomous medical decisions carries real
> regulatory/liability implications.

### Run / build

```bash
npm install
scripts/fetch-llm.sh    # once — puts the runtime + model into the bundle
npm run desktop         # tauri dev — native window with the local model + hot reload
npm run desktop:build   # tauri build — produces the .dmg (model bundled) in
                        #   src-tauri/target/release/bundle/
```

App icons are generated from `assets/app-icon.svg` → `assets/app-icon.png`;
regenerate the full platform set with `npm run tauri icon assets/app-icon.png`.

> **Verification status.** This was authored and dependency-checked on Linux,
> which can't complete a macOS/WebKit build. Verified here: the frontend builds,
> typechecks, and runs with zero external requests; the Rust dependency graph
> resolves (`Cargo.lock`); and the two backend cores compile/run in isolation —
> the LLM HTTP/JSON client, and the SQLite + AES-256-GCM encrypt/decrypt
> round-trip. Not yet run on macOS: the full native build, sidecar launch, first
> model load, and code-signing/notarization. Run `scripts/build-macos.sh` on a
> Mac to produce the app, and expect to iterate on packaging/signing there.

### How the on-device AI is wired

- **Runtime:** `llama-server` runs as a Tauri **sidecar** on `127.0.0.1:11534`,
  launched at startup (`src-tauri/src/ai.rs`) and torn down on exit.
- **Commands:** Rust exposes `llm_status`, `extract_labs`, and `draft_summary`,
  which call the local server's OpenAI-compatible API.
- **Frontend:** `src/ai.ts` detects the desktop shell and invokes those commands
  — the Labs screen can extract analytes from a report, and the Visit Summary can
  draft a plain-language summary. In a browser, `IS_DESKTOP` is false and the
  seeded mocks are used instead. Model output still requires human verification
  (labs) or provider review (summaries) exactly as the design specifies.

### Auto-updates & releases

Installed apps check for a signed update on launch and install it automatically
(`src/updater.ts` → Tauri updater plugin). Releases are produced by the
**`.github/workflows/release.yml`** GitHub Action: push a tag and CI builds,
**Apple-signs + notarizes**, **updater-signs**, and publishes a GitHub Release
with `latest.json`.

```bash
# cut a release (after setting the repo secrets below)
git tag v1.4.3 && git push origin v1.4.3
```

Required repo secrets (Settings → Secrets and variables → Actions): the Apple
Developer ID set (`APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`,
`APPLE_SIGNING_IDENTITY`, `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID`) — the
**same identity you already use for Prescription Write Pro** — plus the updater
key (`TAURI_SIGNING_PRIVATE_KEY`, `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`) from
`npm run tauri signer generate`.

The updater public key and endpoint live in `tauri.conf.json`. The endpoint
defaults to this repo's GitHub Releases; **note GitHub caps a release asset at
2 GB**, so if the bundled model pushes the `.dmg` over that, host releases where
Prescription Write Pro does and change the endpoint (the pipeline is otherwise
identical).

### Encrypted persistence

Durable clinical state (patients' visits, evaluations, verified labs, plans,
questionnaire answers, users, lab bundles) is written to a local SQLite file as a
single **AES-256-GCM–encrypted** document (`src-tauri/src/db.rs`), keyed by a
`0600` key file in the app-data directory. The frontend loads it on launch and
saves on change (debounced). In a browser (`npm run dev`) it stays in-memory.
The app always reopens **locked** — session/role/screen are intentionally not
persisted.

### Done for shipping ✓

- Self-hosted fonts — zero external requests.
- On-device LLM bundled into the installer (selectable medical/general models).
- Encrypted local persistence (AES-256-GCM).
- Signed + notarized releases with **auto-update on launch** (CI workflow).
- macOS build script + [INSTALL.md](./INSTALL.md) runbook.

### Remaining hardening

1. **Move the DB key into the macOS Keychain** (currently a `0600` key file).
2. **Tighten the CSP** — with fonts local, `app.security.csp` can go from `null`
   to a strict local policy; test that IPC + inline styles still work on-device.

_Single-user by design for now — multi-user PIN/password auth is deferred._

## Notes

- **No PHI.** All patient data is fictional sample data for the prototype.
- The design source and conversation transcripts are preserved under
  `design-source/` for reference.

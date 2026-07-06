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
  ai.ts          Desktop LLM client — invokes the Rust commands, mock fallback
  components/    Lock, Header, Sidebar
  screens/       One component per screen
src-tauri/       Tauri v2 desktop shell (Rust)
  src/ai.rs      llama.cpp sidecar lifecycle + extract_labs / draft_summary
  binaries/      Bundled llama-server (fetched, gitignored)
  resources/     Bundled GGUF model (fetched, gitignored)
scripts/
  fetch-llm.sh   Provisions the runtime + model into the bundle before building
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

**Default model:** `Qwen2.5-3B-Instruct` (Q4_K_M, ~2 GB, **Apache-2.0** — safe to
redistribute in a commercial product). Swap it with
`MODEL_URL=… MODEL_FILE=… scripts/fetch-llm.sh`. **Confirm the model license
before shipping** — for a commercial medical product, prefer a permissive
(Apache-2.0 / MIT) model; note that some popular models (e.g. Llama) carry
use-based license terms.

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
> which can't complete a macOS/WebKit build. Verified here: the frontend builds
> and typechecks; the Rust dependency graph resolves (`Cargo.lock`); and the
> LLM HTTP/JSON core compiles in isolation. Not yet run on macOS: the full native
> build, the sidecar launch, and code-signing/notarization. Run
> `scripts/fetch-llm.sh` then `npm run desktop` on a Mac to bring it up, and
> expect to iterate on packaging/signing there.

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

### Roadmap

1. **Self-host fonts** — the frontend loads Cormorant Garamond / DM Sans from
   Google Fonts. For a truly offline app, bundle the `.woff2` files locally and
   tighten `tauri.conf.json` → `app.security.csp` from `null` to a strict policy.
   _(Top priority before shipping.)_
2. **Encrypted SQLite** — add SQLCipher (AES-256) via a Tauri command layer;
   replace the in-memory store with persistent, encrypted local data.
3. **Auth & OS keychain** — real login and key storage in the OS keychain.
4. **Signing & notarization** — Apple Developer ID signing + notarization so the
   `.dmg` installs cleanly on other Macs.

## Notes

- **No PHI.** All patient data is fictional sample data for the prototype.
- The design source and conversation transcripts are preserved under
  `design-source/` for reference.

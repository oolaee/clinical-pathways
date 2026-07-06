# Installing Clinical Pathways on a Mac

This builds the app **from source on a Mac** and installs it. There is no
pre-built download yet — the app bundles its own AI model, so it's assembled on
your machine. Once built, it's a normal Mac app: fully offline, nothing leaves
the computer.

Two audiences:

- **[A) Build it](#a-build-the-app-one-time-on-a-mac)** — do this once on any Mac
  (yours or IT's). Produces a `Clinical Pathways.app` / `.dmg`.
- **[B) Install it](#b-install-on-the-work-mac)** — copy the app to the work Mac
  and open it.

If the build Mac and the work Mac are the same machine, just do A then open the
app.

---

## A) Build the app (one time, on a Mac)

### 1. Install the prerequisites

Open **Terminal** and run these once:

```bash
# Xcode command line tools (C compiler, git)
xcode-select --install

# Homebrew (if you don't have it) — https://brew.sh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Build tools
brew install cmake node

# Rust — accept the defaults, then close & reopen Terminal
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### 2. Get the code

```bash
git clone https://github.com/oolaee/clinical-pathways.git
cd clinical-pathways
git checkout implement-clinical-pathways
```

### 3. Build

```bash
scripts/build-macos.sh
```

That script checks your tools, downloads + builds the bundled model (a few
minutes the first time), and produces the app. When it finishes it prints the
path to the `.dmg` and `.app`, under
`src-tauri/target/release/bundle/`.

> **What's the model?** It bundles `Qwen2.5-3B-Instruct` (~2 GB, Apache-2.0, safe
> to redistribute). The finished app is therefore a few GB. To use a different
> model: `MODEL_URL=… MODEL_FILE=… scripts/fetch-llm.sh` before building.

### Try it without building first (optional)

To see the app running before you build the installer:

```bash
npm install
scripts/fetch-llm.sh   # once, to get the model
npm run desktop        # launches the app window
```

---

## B) Install on the work Mac

1. Copy the `.dmg` (from `src-tauri/target/release/bundle/dmg/`) to the work Mac.
2. Double-click it and drag **Clinical Pathways** into **Applications**.
3. **First launch** — because the app isn't signed with an Apple Developer
   account yet, macOS Gatekeeper will warn. Do this **once**:
   - **Right-click** the app in Applications → **Open** → **Open** in the dialog.
   - If macOS still refuses, run:
     ```bash
     xattr -dr com.apple.quarantine "/Applications/Clinical Pathways.app"
     ```
   After the first open, it launches normally like any app.

Data is stored encrypted (AES-256-GCM) under
`~/Library/Application Support/com.olympia.clinical-pathways/` and never leaves
the machine.

---

## Optional: sign & notarize (for clean install on many Macs)

The right-click-to-open step above is only needed for unsigned builds. To hand
the `.dmg` to staff and have it "just open," sign and notarize it with an
**Apple Developer account** ($99/yr):

1. In Xcode, create a **Developer ID Application** certificate.
2. Create an app-specific password / API key for notarization.
3. Set these before building:
   ```bash
   export APPLE_SIGNING_IDENTITY="Developer ID Application: Your Name (TEAMID)"
   export APPLE_ID="you@example.com"
   export APPLE_PASSWORD="app-specific-password"
   export APPLE_TEAM_ID="TEAMID"
   npm run desktop:build
   ```
   Tauri signs and notarizes automatically when these are present. See
   https://v2.tauri.app/distribute/sign/macos/ for the current details.

---

## Troubleshooting

- **"cmake: command not found"** → `brew install cmake`.
- **"cargo: command not found"** → install Rust (step 1), then reopen Terminal.
- **Build fails compiling the model runtime** → ensure Xcode CLT is installed
  (`xcode-select --install`) and you have ~10 GB free disk.
- **App opens but AI features are disabled** → the model didn't bundle. Re-run
  `scripts/fetch-llm.sh`, confirm a `.gguf` exists in
  `src-tauri/resources/models/`, and rebuild. The app still works without it —
  lab extraction and summary drafting just fall back to the built-in samples.
- **"Nothing happens on first double-click"** → that's Gatekeeper. Right-click →
  Open (section B, step 3).

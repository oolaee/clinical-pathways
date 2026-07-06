#!/usr/bin/env bash
#
# One-shot macOS build: checks tools, provisions the bundled LLM, and produces
# the installable Clinical Pathways app. Run this on the Mac that will build the
# product. See INSTALL.md for prerequisites and the end-user install steps.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

say()  { printf "\n\033[1m==> %s\033[0m\n" "$*"; }
fail() { printf "\n\033[31mERROR: %s\033[0m\n" "$*" >&2; exit 1; }

[[ "$(uname -s)" == "Darwin" ]] || fail "This script must run on macOS."

# --- 1. Prerequisites ----------------------------------------------------------
say "Checking prerequisites"
command -v node  >/dev/null || fail "Node.js not found. Install from https://nodejs.org (LTS)."
command -v cargo >/dev/null || fail "Rust not found. Install from https://rustup.rs, then reopen the terminal."
command -v cmake >/dev/null || fail "cmake not found. Install with:  brew install cmake"
xcode-select -p  >/dev/null 2>&1 || fail "Xcode Command Line Tools missing. Run:  xcode-select --install"
echo "node $(node -v) · $(cargo --version) · cmake $(cmake --version | head -1 | awk '{print $3}') · OK"

# --- 2. Bundle the on-device model (once) --------------------------------------
if ! ls src-tauri/binaries/llama-server-* >/dev/null 2>&1 || ! ls src-tauri/resources/models/*.gguf >/dev/null 2>&1; then
  say "Provisioning the on-device LLM (builds llama.cpp + downloads the model — a few minutes)"
  bash scripts/fetch-llm.sh
else
  say "On-device model already provisioned — skipping (delete src-tauri/binaries + resources/models to refresh)"
fi

# --- 3. Frontend deps + build --------------------------------------------------
say "Installing JS dependencies"
npm install

say "Building the desktop app (this compiles the Rust backend — first run is slow)"
npm run desktop:build

# --- 4. Report -----------------------------------------------------------------
BUNDLE="src-tauri/target/release/bundle"
say "Build complete"
DMG="$(ls "$BUNDLE"/dmg/*.dmg 2>/dev/null | head -1 || true)"
APP="$(ls -d "$BUNDLE"/macos/*.app 2>/dev/null | head -1 || true)"
[[ -n "$DMG" ]] && echo "Installer : $DMG"
[[ -n "$APP" ]] && echo "App       : $APP"
cat <<'NOTE'

Install it:
  • Open the .dmg and drag "Clinical Pathways" to Applications.
  • First launch on an unsigned build: right-click the app → Open → Open
    (or run:  xattr -dr com.apple.quarantine "/Applications/Clinical Pathways.app").

To distribute to other Macs cleanly (no right-click), sign + notarize with an
Apple Developer ID — see INSTALL.md.
NOTE

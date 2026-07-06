#!/usr/bin/env bash
#
# Provision the on-device LLM that ships INSIDE the app installer:
#   1. A llama.cpp `llama-server` binary  -> src-tauri/binaries/llama-server-<triple>
#   2. A quantized GGUF model            -> src-tauri/resources/models/<model>.gguf
#
# Run this once on the build machine BEFORE `npm run desktop:build`. Tauri then
# bundles both into the .app, so the shipped product needs no downloads and runs
# fully offline.
#
# The binary is built STATIC from source (BUILD_SHARED_LIBS=OFF) so it's a single
# self-contained file with no loose .dylib dependencies — the cleanest thing to
# bundle and code-sign. On macOS it builds with Metal for GPU acceleration.
#
# Requirements (macOS): Xcode Command Line Tools + cmake + git + curl.
#   xcode-select --install && brew install cmake
#
# Override the model with:  MODEL_URL=... MODEL_FILE=... scripts/fetch-llm.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BIN_DIR="$ROOT/src-tauri/binaries"
MODEL_DIR="$ROOT/src-tauri/resources/models"
mkdir -p "$BIN_DIR" "$MODEL_DIR"

# --- Resolve the Tauri/Rust target triple for the current host -----------------
ARCH="$(uname -m)"
OS="$(uname -s)"
case "$OS" in
  Darwin)
    case "$ARCH" in
      arm64)  TRIPLE="aarch64-apple-darwin" ;;
      x86_64) TRIPLE="x86_64-apple-darwin" ;;
      *) echo "Unsupported macOS arch: $ARCH" >&2; exit 1 ;;
    esac ;;
  Linux)
    TRIPLE="x86_64-unknown-linux-gnu" ;;   # for local testing only
  *) echo "Unsupported OS: $OS" >&2; exit 1 ;;
esac
echo "==> Target triple: $TRIPLE"

# --- Default model: Qwen2.5-3B-Instruct (Apache-2.0 — redistributable) ----------
# ~2.0 GB Q4_K_M. Big enough for lab extraction + summary drafting, small enough
# to bundle. Swap MODEL_URL/MODEL_FILE for a different model or quant.
MODEL_URL="${MODEL_URL:-https://huggingface.co/bartowski/Qwen2.5-3B-Instruct-GGUF/resolve/main/Qwen2.5-3B-Instruct-Q4_K_M.gguf}"
MODEL_FILE="${MODEL_FILE:-Qwen2.5-3B-Instruct-Q4_K_M.gguf}"

# --- 1. Build a static llama-server --------------------------------------------
SERVER_OUT="$BIN_DIR/llama-server-$TRIPLE"
if [[ -f "$SERVER_OUT" ]]; then
  echo "==> llama-server already present: $SERVER_OUT (delete to rebuild)"
else
  WORK="$(mktemp -d)"
  echo "==> Cloning llama.cpp into $WORK"
  git clone --depth 1 https://github.com/ggml-org/llama.cpp "$WORK/llama.cpp"
  METAL_FLAG=""
  [[ "$OS" == "Darwin" ]] && METAL_FLAG="-DGGML_METAL=ON"
  echo "==> Building static llama-server (this takes a few minutes)"
  cmake -S "$WORK/llama.cpp" -B "$WORK/build" \
    -DCMAKE_BUILD_TYPE=Release \
    -DBUILD_SHARED_LIBS=OFF \
    -DLLAMA_CURL=OFF \
    $METAL_FLAG
  cmake --build "$WORK/build" --config Release --target llama-server -j
  cp "$WORK/build/bin/llama-server" "$SERVER_OUT"
  chmod +x "$SERVER_OUT"
  rm -rf "$WORK"
  echo "==> Wrote $SERVER_OUT"
fi

# --- 2. Download the model -----------------------------------------------------
MODEL_OUT="$MODEL_DIR/$MODEL_FILE"
if [[ -f "$MODEL_OUT" ]]; then
  echo "==> Model already present: $MODEL_OUT"
else
  echo "==> Downloading model → $MODEL_OUT"
  curl -L --fail --progress-bar "$MODEL_URL" -o "$MODEL_OUT"
fi

echo ""
echo "Done. Bundled for $TRIPLE:"
echo "  binary : $SERVER_OUT"
echo "  model  : $MODEL_OUT  ($(du -h "$MODEL_OUT" | cut -f1))"
echo ""
echo "Next:  npm run desktop        # dev run with the local model"
echo "       npm run desktop:build  # produces the .dmg with model bundled"

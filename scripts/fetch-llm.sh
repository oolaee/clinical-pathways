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

# --- Model selection -----------------------------------------------------------
# Pick a preset with MODEL_PRESET=… (sized by the Mac's RAM), or override the URL
# directly with MODEL_URL=… MODEL_FILE=…. All are Q4_K_M GGUF.
#
#   preset          model                         ~size   min RAM  license       notes
#   medgemma-27b    MedGemma 27B (Google, med)    ~16 GB  32 GB    HAI-DEF*      strongest medical
#   openbio-8b      OpenBioLLM-8B (Llama-3, med)  ~5 GB   16 GB    Llama-3*      strong medical, small
#   meditron-8b     Meditron-3 8B (Llama-3.1,med) ~5 GB   16 GB    Llama-3.1*    clinical guidelines
#   biomistral-7b   BioMistral-7B (med)           ~4.5 GB 16 GB    Apache-2.0    medical + permissive
#   medgemma-4b     MedGemma 4B (Google, med)     ~3 GB   16 GB    HAI-DEF*      lightest medical
#   qwen-14b        Qwen2.5-14B-Instruct (gen)    ~9 GB   32 GB    Apache-2.0    best general reasoning
#   qwen-7b         Qwen2.5-7B-Instruct (gen)     ~4.7GB  16 GB    Apache-2.0    strong general (default)
#   qwen-3b         Qwen2.5-3B-Instruct (gen)     ~2 GB   8 GB     Apache-2.0    smallest; fits GitHub Releases
#
# *License note: medical fine-tunes on Llama / Gemma inherit those base-model
#  license terms. For a commercial product confirm the terms; the Apache-2.0
#  options (biomistral-7b, qwen-*) are the cleanest to redistribute.
#
# URLs are best-effort pointers to current GGUF conversions. If one 404s, find
# the model on huggingface.co and pass MODEL_URL/MODEL_FILE explicitly.
MODEL_PRESET="${MODEL_PRESET:-qwen-7b}"
HF="https://huggingface.co"
case "$MODEL_PRESET" in
  medgemma-27b)  DEF_URL="$HF/unsloth/medgemma-27b-text-it-GGUF/resolve/main/medgemma-27b-text-it-Q4_K_M.gguf"; DEF_FILE="medgemma-27b-text-it-Q4_K_M.gguf" ;;
  medgemma-4b)   DEF_URL="$HF/unsloth/medgemma-4b-it-GGUF/resolve/main/medgemma-4b-it-Q4_K_M.gguf";             DEF_FILE="medgemma-4b-it-Q4_K_M.gguf" ;;
  openbio-8b)    DEF_URL="$HF/mradermacher/Llama3-OpenBioLLM-8B-GGUF/resolve/main/Llama3-OpenBioLLM-8B.Q4_K_M.gguf"; DEF_FILE="Llama3-OpenBioLLM-8B.Q4_K_M.gguf" ;;
  meditron-8b)   DEF_URL="$HF/mradermacher/Meditron3-8B-GGUF/resolve/main/Meditron3-8B.Q4_K_M.gguf";            DEF_FILE="Meditron3-8B.Q4_K_M.gguf" ;;
  biomistral-7b) DEF_URL="$HF/MaziyarPanahi/BioMistral-7B-GGUF/resolve/main/BioMistral-7B.Q4_K_M.gguf";         DEF_FILE="BioMistral-7B.Q4_K_M.gguf" ;;
  qwen-14b)      DEF_URL="$HF/bartowski/Qwen2.5-14B-Instruct-GGUF/resolve/main/Qwen2.5-14B-Instruct-Q4_K_M.gguf"; DEF_FILE="Qwen2.5-14B-Instruct-Q4_K_M.gguf" ;;
  qwen-7b)       DEF_URL="$HF/bartowski/Qwen2.5-7B-Instruct-GGUF/resolve/main/Qwen2.5-7B-Instruct-Q4_K_M.gguf";  DEF_FILE="Qwen2.5-7B-Instruct-Q4_K_M.gguf" ;;
  qwen-3b)       DEF_URL="$HF/bartowski/Qwen2.5-3B-Instruct-GGUF/resolve/main/Qwen2.5-3B-Instruct-Q4_K_M.gguf";  DEF_FILE="Qwen2.5-3B-Instruct-Q4_K_M.gguf" ;;
  *) echo "Unknown MODEL_PRESET '$MODEL_PRESET' (see the table in this script)." >&2; exit 1 ;;
esac
MODEL_URL="${MODEL_URL:-$DEF_URL}"
MODEL_FILE="${MODEL_FILE:-$DEF_FILE}"
echo "==> Model preset: $MODEL_PRESET → $MODEL_FILE"

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

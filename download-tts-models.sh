#!/bin/bash
set -e
cd "$(dirname "$0")"

DEST="public/tts/assets"
BASE="https://huggingface.co/kyutai/pocket-tts-without-voice-cloning/resolve/main"

FILES=(
  "tts_b6369a24.safetensors"
  "tokenizer.model"
)

VOICES=(
  "alba"
  "marius"
  "javert"
  "fantine"
  "cosette"
  "eponine"
  "azelma"
)

download() {
  local src="$1"
  local dest="$2"

  if [ -f "$dest" ]; then
    echo "skip $dest (exists)"
  else
    echo "get $src"
    curl -L --fail -o "$dest" "$src"
  fi
}

download_files() {
  for f in "${FILES[@]}"; do
    download "$BASE/$f" "$DEST/$f"
  done
}

download_voices() {
  mkdir -p $DEST

  for v in "${VOICES[@]}"; do
    local url="$BASE/embeddings_v2/$v.safetensors"
    local out="$DEST/embeddings_v2/$v.safetensors"
    download "$url" "$out"
  done
}

mkdir -p $DEST
mkdir -p "$DEST/embeddings_v2"

download_files
download_voices

echo "Done. Total:"
du -sh $DEST

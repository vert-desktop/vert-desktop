#!/usr/bin/env bash
# Downloads static/portable binaries for local development.
# These are the same binaries that CI bundles into the installer.
set -euo pipefail

# Allow CI to override the target triple via env var
TARGET="${RUST_TARGET:-$(rustc -vV | grep host | awk '{print $2}')}"
BINDIR="src-tauri/binaries"
mkdir -p "$BINDIR"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

echo "=== Setting up dev sidecars for $TARGET ==="

# ── FFmpeg (static) ─────────────────────────────────────────────────────────
if [[ "$TARGET" == *linux* ]]; then
  echo "→ Downloading FFmpeg static (Linux)…"
  curl -# -L "https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz" \
    -o "$TMP/ffmpeg.tar.xz"
  tar -xJf "$TMP/ffmpeg.tar.xz" -C "$TMP"
  find "$TMP" -name "ffmpeg" -not -path "*/ffprobe*" -type f \
    | head -1 | xargs -I{} cp {} "$BINDIR/ffmpeg-$TARGET"
elif [[ "$TARGET" == *darwin* ]]; then
  echo "→ Downloading FFmpeg (macOS)…"
  curl -# -L "https://evermeet.cx/ffmpeg/getrelease/ffmpeg/zip" -o "$TMP/ffmpeg.zip"
  unzip -q "$TMP/ffmpeg.zip" -d "$TMP/ffmpeg"
  find "$TMP/ffmpeg" -name "ffmpeg" -type f | head -1 \
    | xargs -I{} cp {} "$BINDIR/ffmpeg-$TARGET"
fi
chmod +x "$BINDIR/ffmpeg-$TARGET"
echo "  ✓ ffmpeg $("$BINDIR/ffmpeg-$TARGET" -version 2>&1 | head -1)"

# ── ImageMagick (portable) ────────────────────────────────────────────────────
if [[ "$TARGET" == *linux* ]]; then
  echo "→ Downloading ImageMagick portable (Linux)…"
  curl -# -L "https://imagemagick.org/archive/binaries/magick" \
    -o "$BINDIR/magick-$TARGET"
elif [[ "$TARGET" == *darwin* ]]; then
  echo "→ Downloading ImageMagick (macOS)…"
  ARCH=$(uname -m)
  if [[ "$ARCH" == "arm64" ]]; then
    curl -# -L "https://imagemagick.org/archive/binaries/ImageMagick-arm64-apple-darwin23.6.0.tar.gz" \
      -o "$TMP/magick.tar.gz"
  else
    curl -# -L "https://imagemagick.org/archive/binaries/ImageMagick-x86_64-apple-darwin20.1.0.tar.gz" \
      -o "$TMP/magick.tar.gz"
  fi
  tar -xzf "$TMP/magick.tar.gz" -C "$TMP"
  find "$TMP" -name "magick" -type f | head -1 \
    | xargs -I{} cp {} "$BINDIR/magick-$TARGET"
fi
chmod +x "$BINDIR/magick-$TARGET"
echo "  ✓ magick $("$BINDIR/magick-$TARGET" --version 2>&1 | head -1 || echo '(checking...)')"

# ── Pandoc (static) ──────────────────────────────────────────────────────────
PANDOC_VERSION="3.6.4"
if [[ "$TARGET" == *linux* ]]; then
  echo "→ Downloading Pandoc $PANDOC_VERSION (Linux)…"
  curl -# -L "https://github.com/jgm/pandoc/releases/download/${PANDOC_VERSION}/pandoc-${PANDOC_VERSION}-linux-amd64.tar.gz" \
    -o "$TMP/pandoc.tar.gz"
  tar -xzf "$TMP/pandoc.tar.gz" -C "$TMP"
  find "$TMP" -name "pandoc" -type f | head -1 \
    | xargs -I{} cp {} "$BINDIR/pandoc-$TARGET"
elif [[ "$TARGET" == *darwin* ]]; then
  ARCH=$(uname -m)
  if [[ "$ARCH" == "arm64" ]]; then
    curl -# -L "https://github.com/jgm/pandoc/releases/download/${PANDOC_VERSION}/pandoc-${PANDOC_VERSION}-arm64-macOS.zip" \
      -o "$TMP/pandoc.zip"
  else
    curl -# -L "https://github.com/jgm/pandoc/releases/download/${PANDOC_VERSION}/pandoc-${PANDOC_VERSION}-x86_64-macOS.zip" \
      -o "$TMP/pandoc.zip"
  fi
  unzip -q "$TMP/pandoc.zip" -d "$TMP/pandoc"
  find "$TMP/pandoc" -name "pandoc" -type f | head -1 \
    | xargs -I{} cp {} "$BINDIR/pandoc-$TARGET"
fi
chmod +x "$BINDIR/pandoc-$TARGET"
echo "  ✓ pandoc $("$BINDIR/pandoc-$TARGET" --version 2>&1 | head -1)"

echo ""
echo "=== All sidecars ready ==="
ls -lh "$BINDIR/"

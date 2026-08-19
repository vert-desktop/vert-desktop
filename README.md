# VERT Desktop

Privacy-first file converter for images, audio, video and documents — everything runs
**locally**, powered by bundled FFmpeg, ImageMagick and Pandoc sidecars. No uploads, no
servers, no internet connection required.

Built with Rust + Tauri v2 + React. Available in 15 languages. Inspired by
[VERT.sh](https://vert.sh).

🔗 Landing page: https://vert-desktop.github.io/vert-desktop/

## Features

- 🔒 **100% local** — conversions run entirely on your machine, nothing leaves your computer
- ⚡ **Native speed** — no WebAssembly overhead, native binaries at full CPU speed
- 📦 **Batch convert** — drop multiple files, convert them all at once
- 🌍 **15 languages** — EN, FR, DE, ES, IT, BS, HR, ID, TR, JA, KO, EL, ZH-CN, ZH-TW, PT-BR
- 🎨 **Light & dark** — follows your system theme, toggleable in settings
- 🛠 **Open source** — AGPL-3.0, built with Rust + Tauri + React

## Supported formats

250+ formats across four categories, powered by FFmpeg, ImageMagick and Pandoc:

| Category  | Count | Examples |
|-----------|-------|----------|
| Images    | 150+  | PNG, JPEG, WebP, AVIF, HEIC, JXL, GIF, BMP, TIFF, SVG, PSD, RAW |
| Audio     | 40+   | MP3, WAV, FLAC, OGG, Opus, AAC, ALAC, M4A, AIFF, WMA |
| Video     | 30+   | MP4, MKV, WebM, AVI, MOV, GIF, TS, M4V, 3GP, OGV |
| Documents | 12    | DOCX, Markdown, HTML, RTF, EPUB, ODT, RST, CSV |

## Install

Available for **macOS (Apple Silicon)** and **Linux (x86_64)**.

### One-line install

```sh
curl -fsSL https://vert-desktop.github.io/vert-desktop/install.sh | sh
```

Detects your platform automatically: Homebrew on macOS, `.deb` on Debian/Ubuntu, and
`.AppImage` on other Linux distributions.

<details>
<summary>Manual install (Homebrew, .dmg, .deb, .AppImage)</summary>

**macOS — Homebrew**

```sh
brew install --cask vert-desktop/tap/vert-desktop
```

**macOS — .dmg**

Download `VERT.Desktop_<version>_aarch64.dmg` from the
[latest release](https://github.com/vert-desktop/vert-desktop/releases/latest) and drag
the app into `/Applications`.

**Linux — .deb (Debian/Ubuntu)**

```sh
curl -L -o vert-desktop.deb "$(curl -s https://api.github.com/repos/vert-desktop/vert-desktop/releases/latest | grep -oP '"browser_download_url":\s*"\K[^"]+\.deb')"
sudo apt install ./vert-desktop.deb
```

**Linux — .AppImage (universal)**

```sh
curl -L -o vert-desktop.AppImage "$(curl -s https://api.github.com/repos/vert-desktop/vert-desktop/releases/latest | grep -oP '"browser_download_url":\s*"\K[^"]+\.AppImage')"
chmod +x vert-desktop.AppImage
./vert-desktop.AppImage
```

</details>

## Uninstall

### One-line uninstall

```sh
curl -fsSL https://vert-desktop.github.io/vert-desktop/uninstall.sh | sh
```

<details>
<summary>Manual uninstall (Homebrew, .deb, .AppImage)</summary>

**macOS — Homebrew**

```sh
brew uninstall --cask vert-desktop
```

**Linux — .deb**

```sh
sudo apt remove vert-desktop
```

**Linux — .AppImage**

Delete the installed `vert-desktop.AppImage` file (and its `.desktop` entry if you
created one).

</details>

## Development

Requires [Rust](https://www.rust-lang.org/tools/install), [pnpm](https://pnpm.io) and the
[Tauri prerequisites](https://v2.tauri.app/start/prerequisites/) for your platform.

```sh
pnpm install          # install JS dependencies
pnpm setup            # download dev sidecars (ffmpeg, magick, pandoc)
pnpm tauri dev        # run the app in dev mode
```

Other useful scripts:

```sh
pnpm lint             # ESLint
pnpm test             # unit tests (Vitest)
pnpm test:e2e         # e2e tests (Playwright)
pnpm test:all         # unit + e2e
pnpm build            # production frontend build
```

## License

[AGPL-3.0](https://www.gnu.org/licenses/agpl-3.0.html)

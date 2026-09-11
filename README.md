# Direct QR Generator

Single-file, offline QR code generator. The URL you type is encoded **literally** into
the QR matrix — no shortener, no redirect domain, no third-party app in the middle.
Scanning goes straight to your link, and nobody but you sees the traffic.

## Use it

Double-click `index.html`. That's the whole install — it works offline, from a USB stick,
or emailed to someone. No build step, no server, no account, no network calls.

## What it does

| | |
|---|---|
| **Direct encode** | Raw URL in the matrix. No `bit.ly`-style hop, no scan analytics, never expires. |
| **Error correction** | L / M / Q / H (7 % – 30 % damage recovery). |
| **Styles** | Square, rounded, dots. Finder eyes and timing lines always stay square so the code still scans. |
| **Colors** | 9 presets, any dot/background color (picker or hex), gradients (4 directions), separate eye color, transparent background, swap — with a live contrast check. |
| **Center logo** | Optional. Auto-switches to level H so the covered modules are recoverable. |
| **Download** | PNG / JPG / WebP at 512–4096 px, or SVG. Plus clipboard copy and a print/PDF sheet. |
| **Batch** | Paste many URLs, one per line — generates and downloads all of them. |
| **Shareable links** | Self-contained `data:` image links (PNG or SVG) plus a "re-open link" that rebuilds the same QR with all settings. |
| **Guardrails** | Warns on a too-small export, a too-thin quiet zone, or content that won't fit. |

Non-ASCII URLs (é, ä, हिन्दी) are encoded as UTF-8 and decode correctly.

## Changing the colors

The **Colors** section sits under the shape controls:

- **Presets** — one click for a tested palette (Classic, Navy, Royal, Ocean, Forest,
  Crimson, Sunset, Espresso, Charcoal).
- **Dots** and **Background** — color picker, or type an exact brand hex (`#1A73E8` or
  the short form `#1AE`).
- **Gradient to** — tick it to fade the dots into a second color; pick diagonal ↘,
  horizontal →, vertical ↓, or radial ◎.
- **Eye color** — tick it to give the three corner squares their own color.
- **Transparent background** — for placing the code on your own artwork. PNG, WebP and
  SVG keep the transparency; JPG can't, so it is flattened onto white.
- **⇄ Swap** — exchanges dot and background colors.

Every change is graded live by a **contrast check**:

| Badge | Contrast | Meaning |
|---|---|---|
| Green | 5:1 or more | Scans reliably. |
| Amber | 4 – 5:1 | Borderline — may fail in dim light or on glossy print. |
| Red | under 4:1, or dots lighter than background | Expect failures. |

These thresholds come from testing, not a style guide: the decoder read grey-on-white
at 3.9:1 but failed at 3.2:1 *on a perfect digital image*. A phone camera adds blur and
glare, hence the safety margin. Light-on-dark ("inverted") codes are flagged red because
many phone scanners don't read them at all.

## How to download a QR

Under the QR there is a **Download** panel:

1. Pick a **format** — PNG, JPG, WebP, or SVG.
2. Pick a **size** — 512, 1024, 2048, or 4096 px (hidden for SVG, which is resolution-free).
3. Click the big **⬇ Download …** button. It names the exact file you'll get, e.g.
   `example.com-qr-1024.png`, and saves to your browser's Downloads folder.

Next to it: **Copy image** (straight to the clipboard, for pasting into Canva, Word, Slack)
and **Print / PDF** (opens a print sheet — choose "Save as PDF" in the print dialog).

For many codes at once, use **Batch mode**, then **Download all** — it saves every code in
the format you selected.

### Which format?

| Format | Use it for | Typical 1024 px size |
|---|---|---|
| **PNG** | Default choice. Sharp, works everywhere. | ~30 KB |
| **SVG** | Print, large signage, anything resized later. Never blurs. | ~8 KB |
| **WebP** | Websites where file size matters. | ~16 KB |
| **JPG** | Only when something insists on JPG — larger here *and* softer edges. | ~80 KB |

## Links to a generated QR

The tool runs offline with no server, so there is nothing to host an image on — a link
has to carry the image inside it. Under **Shareable links**:

- **Image link (PNG)** — a `data:image/png;base64,…` URL. Paste it into a browser address
  bar, an email, or an `<img src="…">` and the QR appears. No hosting, never expires.
  Roughly 40 KB for a 1024 px code.
- **Image link (SVG)** — the same idea in vector form, and usually ~4× smaller. Best for
  websites and print.
- **Re-open link** — a link back to `index.html` with your URL, error correction, shape,
  size, quiet zone, and colours in the fragment. Anyone who has the file gets the exact
  same QR back, ready to re-export.

Each one has **Copy link**, **Open**, and **Save file** next to it.

Caveat: data links are long. Some chat apps and form fields truncate them — when that
happens, send the PNG/SVG file itself instead. If you need a short `https://…` link to the
image, that requires hosting it somewhere (your own web server, S3, a CDN); upload the
exported PNG and use that file's URL.

## Printing checklist

- Keep the quiet zone at **4 modules** (the default) — scanners need that white border.
- Export at **4 px per module or more**; the tool warns you and names a safe size.
- Prefer **SVG** for anything printed larger than a business card.
- Test-scan the final artwork with a real phone before you send it to print.

## Verification

Every rendering path was round-trip tested: generated codes were decoded back with an
independent decoder (jsQR) across all shape × error-correction × colour combinations,
plus the PNG export, the SVG export, the logo overlay, and batch mode.

## Build a release

You don't need a build to *use* the tool — `index.html` runs as-is. The build packages
it for distribution. It needs Node 22+ and has no dependencies.

```bash
npm run build
```

Output in `dist/`:

- `qr-code-generator.html` — the tool, stamped with version and build date
- `qr-code-generator-v<version>.zip` — the tool + README + license notices
- `SHA256SUMS.txt` — checksums for both

`dist/` is not committed; release builds are attached to
[GitHub Releases](https://github.com/prmdigital/QR-Code/releases). To cut a new one,
bump `version` in `package.json` and run the build again.

## Files

- `index.html` — the entire tool (QR encoder inlined).
- `scripts/build.mjs` — release build.
- `THIRD_PARTY_LICENSES.md` — license notice for the bundled QR library.

QR encoding by [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) (MIT), inlined for offline use.

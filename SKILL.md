---
name: excalidraw
description: Author and render Excalidraw hand-drawn figures. Use when creating or updating conceptual diagrams for docs as editable .excalidraw JSON, or rendering .excalidraw files to PNG/SVG in the real hand-drawn (rough.js + Virgil) style.
---

# Excalidraw figures

Author conceptual diagrams as editable `.excalidraw` JSON, then render them to
PNG/SVG that looks **exactly** like the Excalidraw editor — real rough.js
strokes, the real Virgil hand-drawn font, correct hachure clipping.

Rendering runs the **real `@excalidraw/excalidraw` engine** inside headless
Chromium (Puppeteer). This is why fidelity is perfect; the older SVG-only
exporters (`excalidraw-to-svg`, `@excalidraw/utils`) approximate rough.js and do
not match the editor.

The skill directory contains `node_modules` and Chromium — projects only ever
commit the `.excalidraw` sources and the rendered `.png`s.

## Commands

All commands take a file or a directory (which processes every `*.excalidraw`
inside it, skipping names starting `_`). Run them from the skill directory.

**Render** — `.excalidraw` → PNG/SVG:

```bash
node render.mjs <file | dir ...> [--scale N] [--svg] [--out DIR] [--padding P]
```

Defaults: PNG, `--scale 2`, `--padding 12`, output beside each source.
`--svg` emits SVG; `--out DIR` redirects output.

**Fit** — shrink oversized text boxes so the figure isn't surrounded by empty
margins (a text element's stored width feeds the export bounding box, so a box
wider than its text overhangs the drawing):

```bash
node fit.mjs <file | dir ...> [--dry]      # --dry previews, no write
```

It re-measures each free-standing text element in the real font and tightens
its box, keeping the text visually anchored (per `textAlign`). Container-bound
labels are left to the engine. Writes back to the source.

**List** — inspect elements before surgery (index, id, type, x/y, w×h, text):

```bash
node list.mjs <file>
```

**Typical loop:** author/edit JSON → `node fit.mjs <dir>` → `node render.mjs <dir>`.

## First-time setup (per machine)

From the skill directory, run:

```bash
npm install
npx puppeteer browsers install chrome   # postinstall is blocked by allow-scripts
```

Node comes from lazy nvm; if `node` isn't found, prepend it to PATH:
`export PATH="$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node | tail -1)/bin:$PATH"`.

`react` + `react-dom` are real dependencies: Excalidraw's prebuilt UMD bundle
reads `React`/`ReactDOM` off `window`, so `web/index.html` loads them as globals
before the engine. We author no React ourselves.

## Authoring `.excalidraw` JSON

Files are plain JSON (`{ "type": "excalidraw", "elements": [...], "appState": {...}, "files": {} }`)
and stay editable at excalidraw.com or in the VS Code "Excalidraw Editor"
extension (`pomdtr.excalidraw-editor`). Because the render uses the real engine,
**no normalization tricks are needed** — no `baseline` field, no font remapping.
Just write natural Excalidraw elements:

- **Boxes**: `type: "rectangle"`, `roundness: {"type": 3}` for rounded corners,
  `fillStyle: "hachure"` for the diagonal hand-drawn fill, `backgroundColor` for
  the fill colour, `strokeStyle: "dashed"` for a dashed outline.
- **Text inside a box** (the box *is* the label container): give the rectangle
  `boundElements: [{"type": "text", "id": "<textId>"}]`, and the text element
  `containerId: "<rectId>"`, `textAlign: "center"`, `verticalAlign: "middle"`.
  The engine centres and wraps it — never float text on top of a box.
- **Fonts**: `fontFamily: 1` = Virgil (hand-drawn, the default look),
  `2` = Helvetica, `3` = Cascadia (code). Use `1` for the sketch aesthetic.
- **Arrows / lines**: `type: "arrow"` with `points` and `endArrowhead: "arrow"`;
  `type: "line"` for plain connectors.
- Every element needs a unique `id`, plus the usual `x`, `y`, `width`, `height`,
  `strokeColor`, `seed`. Copy an existing figure as a starting point.

The cleanest way to author is to draw once in the editor, save the
`.excalidraw`, then hand-tune values here — or copy an existing figure's
elements and edit coordinates/labels.

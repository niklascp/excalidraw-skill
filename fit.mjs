#!/usr/bin/env node
// Shrink every free-standing text element's box to its actual rendered size,
// keeping the text visually anchored. Oversized text boxes (e.g. a fixed
// width authored by hand) otherwise inflate the export bounding box and leave
// large empty margins around the figure.
//
//   node fit.mjs <file.excalidraw | dir ...> [--dry]
//
// Container-bound text (label inside a box) is left untouched — the engine sizes
// and positions it from its container. Edits are written back to the source file
// (unless --dry), so the tightened geometry also shows in the editor.
import fs from "node:fs";
import path from "node:path";
import { withPage, expandFiles, readScene, writeScene } from "./lib.mjs";

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const files = expandFiles(args.filter((a) => a !== "--dry"));
if (!files.length) {
  console.error("no .excalidraw files found");
  process.exit(1);
}

// Re-anchor x so the visible text stays put after width changes, per textAlign.
function reanchorX(el, newWidth) {
  const align = el.textAlign || "left";
  if (align === "center") return Math.round(el.x + el.width / 2 - newWidth / 2);
  if (align === "right") return Math.round(el.x + el.width - newWidth);
  return el.x;
}

await withPage(async (page) => {
  for (const file of files) {
    if (!fs.existsSync(file)) {
      console.error("skip (missing):", file);
      continue;
    }
    const scene = readScene(file);
    let changed = 0;
    for (const el of scene.elements || []) {
      if (el.type !== "text" || el.containerId) continue;
      const { width, height } = await page.evaluate((e) => window.measureText(e), el);
      if (width === el.width && height === el.height) continue;
      el.x = reanchorX(el, width);
      el.width = width;
      el.height = height;
      changed++;
    }
    if (changed && !dry) writeScene(file, scene);
    console.log(`${dry ? "would fit" : "fit"} ${changed} text box(es) in ${path.relative(process.cwd(), file)}`);
  }
});

#!/usr/bin/env node
// Render hand-authored .excalidraw scenes to PNG (or SVG) using the *real*
// Excalidraw engine in headless Chromium. Output is pixel-identical to the
// editor: true rough.js strokes, real Virgil hand-drawn font, correct hachure.
//
//   node render.mjs <file.excalidraw | dir ...> [--scale N] [--svg] [--out DIR] [--padding P]
//
// Defaults: scale 2, PNG, output beside each source, padding 12. A directory
// argument renders every *.excalidraw inside it (skipping names starting "_").
import fs from "node:fs";
import path from "node:path";
import { withPage, expandFiles, readScene } from "./lib.mjs";

function parseArgs(argv) {
  const opts = { files: [], scale: 2, svg: false, out: null, padding: 12 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--scale") opts.scale = Number(argv[++i]);
    else if (a === "--svg") opts.svg = true;
    else if (a === "--out") opts.out = argv[++i];
    else if (a === "--padding") opts.padding = Number(argv[++i]);
    else opts.files.push(a);
  }
  return opts;
}

const opts = parseArgs(process.argv.slice(2));
const files = expandFiles(opts.files.length ? opts.files : [process.cwd()]);
if (!files.length) {
  console.error("no .excalidraw files found");
  process.exit(1);
}

await withPage(async (page) => {
  for (const file of files) {
    if (!fs.existsSync(file)) {
      console.error("skip (missing):", file);
      continue;
    }
    const scene = readScene(file);
    const result = await page.evaluate((s, o) => window.renderScene(s, o), scene, {
      svg: opts.svg,
      scale: opts.scale,
      padding: opts.padding,
    });

    const ext = opts.svg ? ".svg" : ".png";
    const outDir = opts.out ? path.resolve(opts.out) : path.dirname(file);
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, path.basename(file).replace(/\.excalidraw$/, ext));
    const data = opts.svg ? result.svg : Buffer.from(result.dataUrl.split(",")[1], "base64");
    fs.writeFileSync(outPath, data);
    console.log("wrote", path.relative(process.cwd(), outPath));
  }
});

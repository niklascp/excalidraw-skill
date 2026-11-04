#!/usr/bin/env node
// Print a compact table of a scene's elements for inspection before surgery:
// index, id (short), type, position/size, and text. No browser needed.
//
//   node list.mjs <file.excalidraw>
import { expandFiles, readScene } from "./lib.mjs";

const files = expandFiles(process.argv.slice(2));
if (!files.length) {
  console.error("usage: node list.mjs <file.excalidraw | dir>");
  process.exit(1);
}

function pad(s, n) {
  s = String(s);
  return s.length >= n ? s.slice(0, n) : s + " ".repeat(n - s.length);
}

for (const file of files) {
  const scene = readScene(file);
  console.log(`\n${file}  (${(scene.elements || []).length} elements)`);
  console.log(pad("#", 4) + pad("id", 10) + pad("type", 11) + pad("x,y", 14) + pad("w×h", 12) + "text");
  (scene.elements || []).forEach((el, i) => {
    const pos = `${Math.round(el.x)},${Math.round(el.y)}`;
    const size = `${Math.round(el.width)}×${Math.round(el.height)}`;
    const text = el.type === "text" ? JSON.stringify(el.originalText ?? el.text ?? "") : el.containerId ? `→${el.containerId.slice(0, 6)}` : "";
    console.log(pad(i, 4) + pad((el.id || "").slice(0, 8), 10) + pad(el.type, 11) + pad(pos, 14) + pad(size, 12) + text);
  });
}

// Shared plumbing for the skill's CLIs (render / fit / list): a static server
// rooted at the skill folder + a headless Chromium page with the real Excalidraw
// engine and fonts loaded. Same-origin serving means no CORS and no templating.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

export const HERE = path.dirname(fileURLToPath(import.meta.url));

const MIME = {
  ".html": "text/html",
  ".mjs": "text/javascript",
  ".js": "text/javascript",
  ".css": "text/css",
  ".woff2": "font/woff2",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

export function expandFiles(inputs) {
  const files = [];
  for (const inp of inputs) {
    const p = path.resolve(inp);
    if (fs.existsSync(p) && fs.statSync(p).isDirectory()) {
      for (const f of fs.readdirSync(p).sort()) {
        if (f.endsWith(".excalidraw") && !f.startsWith("_")) files.push(path.join(p, f));
      }
    } else {
      files.push(p.endsWith(".excalidraw") ? p : `${p}.excalidraw`);
    }
  }
  return files;
}

export function readScene(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function writeScene(file, scene) {
  fs.writeFileSync(file, JSON.stringify(scene, null, 2) + "\n");
}

function startServer() {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split("?")[0]);
    const file = path.join(HERE, rel);
    if (!file.startsWith(HERE) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404).end("not found");
      return;
    }
    res.writeHead(200, { "content-type": MIME[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}

// Boot the engine page once and hand it to `fn`. Handles teardown.
export async function withPage(fn) {
  const server = await startServer();
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  try {
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.error("page error:", e.message));
    await page.goto(`${origin}/web/index.html`, { waitUntil: "networkidle0" });
    await page.waitForFunction("window.ExcalidrawLib && window.renderScene && window.measureText && window.__pageReady");
    return await fn(page);
  } finally {
    await browser.close();
    server.close();
  }
}

// Runs in the headless page. Loads the hand-drawn fonts, then exposes
// window.renderScene(scene, opts) which the Node side calls per file.
const ASSET_BASE = window.EXCALIDRAW_ASSET_PATH + "excalidraw-assets/";

async function loadFonts() {
  const faces = [
    new FontFace("Virgil", `url(${ASSET_BASE}Virgil.woff2)`),
    new FontFace("Cascadia", `url(${ASSET_BASE}Cascadia.woff2)`),
  ];
  await Promise.all(
    faces.map(async (f) => {
      try {
        document.fonts.add(await f.load());
      } catch {
        /* a missing face just falls back */
      }
    }),
  );
  await document.fonts.ready;
}

function blobToDataUrl(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

const FONT_FAMILY = { 1: "Virgil", 2: "Helvetica", 3: "Cascadia" };
const _measureCtx = document.createElement("canvas").getContext("2d");

// Tight pixel size of a text element in the font it will actually render with.
// Used by the `fit` CLI to shrink oversized text boxes that would otherwise
// inflate the export bounding box.
window.measureText = function measureText(el) {
  const family = FONT_FAMILY[el.fontFamily] || "Virgil";
  _measureCtx.font = `${el.fontSize}px ${family}`;
  const lines = String(el.originalText ?? el.text ?? "").split("\n");
  let width = 0;
  for (const line of lines) width = Math.max(width, _measureCtx.measureText(line).width);
  const lineHeight = el.lineHeight || 1.25;
  return { width: Math.ceil(width), height: Math.ceil(el.fontSize * lineHeight * lines.length) };
};

const fontsReady = loadFonts();

window.renderScene = async function renderScene(scene, { svg = false, scale = 2, padding = 12 } = {}) {
  await fontsReady;
  const lib = window.ExcalidrawLib;
  const appState = {
    ...(scene.appState || {}),
    exportBackground: true,
    viewBackgroundColor: scene.appState?.viewBackgroundColor || "#ffffff",
    exportWithDarkMode: false,
    exportEmbedScene: false,
  };
  const common = { elements: scene.elements || [], appState, files: scene.files || null, exportPadding: padding };

  if (svg) {
    const el = await lib.exportToSvg(common);
    return { svg: new XMLSerializer().serializeToString(el) };
  }

  const blob = await lib.exportToBlob({
    ...common,
    mimeType: "image/png",
    quality: 1,
    // canvas is sized to the returned width/height; `scale` scales the drawing
    // onto it — so both must be multiplied for a true NxN raster.
    getDimensions: (width, height) => ({ width: width * scale, height: height * scale, scale }),
  });
  return { dataUrl: await blobToDataUrl(blob) };
};

window.__pageReady = fontsReady.then(() => true);

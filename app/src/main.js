// Panel Forge — Leonida Cover Lab: editor wiring.
// One photo (or several) in, a multi-panel GTA-style cover out as a PNG.
// Everything runs on this machine: photos are read with FileReader / Image and
// painted on a local canvas, never uploaded anywhere.

import { TEMPLATES, GRADES, makePanelState, drawCover } from "./cover.js";

const SIZES = {
  square: { label: "Square post · 1080 × 1080", w: 1080, h: 1080, key: "square" },
  portrait: { label: "Portrait post · 1080 × 1350", w: 1080, h: 1350, key: "portrait" },
  wide: { label: "Wide post · 1920 × 1080", w: 1920, h: 1080, key: "wide" },
};

const state = {
  template: "classic",
  grade: "sunset",
  sizeKey: "square",
  title: "LEONIDA\nHEAT",
  subtitle: "Panel Forge cover lab",
  panels: [],
  selected: 0,
};

const $ = (id) => document.getElementById(id);
const canvas = $("stage");
const ctx = canvas.getContext("2d");

function panelCount() {
  return TEMPLATES[state.template].panels.length;
}

function ensurePanels() {
  while (state.panels.length < panelCount()) state.panels.push(makePanelState());
  state.selected = Math.min(state.selected, panelCount() - 1);
}

function currentSize() {
  return SIZES[state.sizeKey];
}

export function render() {
  ensurePanels();
  const { w, h } = currentSize();
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  drawCover(ctx, w, h, state);
  buildPanelControls();
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function loadImageFromSrc(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Fill every panel with one photo (the fast path from photo to cover). Each panel
// gets its own crop of the same photo — different zoom and focal point per panel —
// so one photo still reads as a composed multi-panel cover, not a tiled repeat.
async function fillAllPanels(img) {
  ensurePanels();
  const crops = [
    { zoom: 1.0, ox: 0.5, oy: 0.42 },
    { zoom: 1.45, ox: 0.32, oy: 0.3 },
    { zoom: 1.6, ox: 0.68, oy: 0.55 },
    { zoom: 1.25, ox: 0.6, oy: 0.4 },
    { zoom: 1.5, ox: 0.4, oy: 0.62 },
  ];
  for (let i = 0; i < panelCount(); i++) {
    const c = crops[i % crops.length];
    state.panels[i].img = img;
    state.panels[i].zoom = c.zoom;
    state.panels[i].ox = c.ox;
    state.panels[i].oy = c.oy;
  }
  render();
}

function buildPanelControls() {
  const wrap = $("panel-controls");
  wrap.innerHTML = "";
  for (let i = 0; i < panelCount(); i++) {
    const row = document.createElement("div");
    row.className = "panel-row" + (i === state.selected ? " active" : "");
    const title = document.createElement("button");
    title.type = "button";
    title.textContent = `Panel ${i + 1}`;
    title.addEventListener("click", () => {
      state.selected = i;
      render();
    });
    const file = document.createElement("input");
    file.type = "file";
    file.accept = "image/*";
    file.setAttribute("aria-label", `Photo for panel ${i + 1}`);
    file.addEventListener("change", async () => {
      if (file.files && file.files[0]) {
        state.panels[i].img = await loadImageFromFile(file.files[0]);
        state.selected = i;
        render();
      }
    });
    const zoom = document.createElement("input");
    zoom.type = "range";
    zoom.min = "1";
    zoom.max = "3";
    zoom.step = "0.01";
    zoom.value = String(state.panels[i].zoom);
    zoom.setAttribute("aria-label", `Zoom for panel ${i + 1}`);
    zoom.addEventListener("input", () => {
      state.panels[i].zoom = Number(zoom.value);
      render();
    });
    row.append(title, file, zoom);
    wrap.append(row);
  }
}

// Drag on the canvas to reposition the selected panel's photo.
let dragging = null;
canvas.addEventListener("pointerdown", (e) => {
  dragging = { x: e.clientX, y: e.clientY };
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  const rect = canvas.getBoundingClientRect();
  const p = state.panels[state.selected];
  if (!p || !p.img) return;
  p.ox = clamp01(p.ox - (e.clientX - dragging.x) / rect.width);
  p.oy = clamp01(p.oy - (e.clientY - dragging.y) / rect.height);
  dragging = { x: e.clientX, y: e.clientY };
  drawCover(ctx, canvas.width, canvas.height, state);
});
canvas.addEventListener("pointerup", () => (dragging = null));

// Double-click the preview to export straight away — the fast path for repeat users.
canvas.addEventListener("dblclick", () => exportPng());

function clamp01(v) {
  return Math.min(1, Math.max(0, v));
}

function exportPng() {
  render();
  const a = document.createElement("a");
  a.download = `panel-forge-cover-${state.sizeKey}.png`;
  a.href = canvas.toDataURL("image/png");
  a.click();
}

function wireControls() {
  $("template").addEventListener("change", () => {
    state.template = $("template").value;
    ensurePanels();
    render();
  });
  $("grade").addEventListener("change", () => {
    state.grade = $("grade").value;
    render();
  });
  $("size").addEventListener("change", () => {
    state.sizeKey = $("size").value;
    render();
  });
  $("title").addEventListener("input", () => {
    state.title = $("title").value;
    drawCover(ctx, canvas.width, canvas.height, state);
  });
  $("subtitle").addEventListener("input", () => {
    state.subtitle = $("subtitle").value;
    drawCover(ctx, canvas.width, canvas.height, state);
  });
  $("hero-photo").addEventListener("change", async () => {
    const f = $("hero-photo").files && $("hero-photo").files[0];
    if (f) fillAllPanels(await loadImageFromFile(f));
  });
  $("sample-pier").addEventListener("click", async () =>
    fillAllPanels(await loadImageFromSrc("samples/pier.jpg")),
  );
  $("sample-boulevard").addEventListener("click", async () =>
    fillAllPanels(await loadImageFromSrc("samples/boulevard.jpg")),
  );
  $("export").addEventListener("click", exportPng);
}

// Screenshot mode for the maker's own shots: ?shot=cover shows just the cover at
// export size; ?shot=editor is the normal editor. Photos: ?photo=pier|boulevard.
async function applyShotParams() {
  const q = new URLSearchParams(location.search);
  if (q.get("caption")) {
    state.title = q.get("caption").replace(/\\n/g, "\n");
    $("title").value = state.title;
  }
  if (q.get("template") && TEMPLATES[q.get("template")]) state.template = q.get("template");
  if (q.get("grade") && GRADES[q.get("grade")]) state.grade = q.get("grade");
  if (q.get("size") && SIZES[q.get("size")]) state.sizeKey = q.get("size");
  $("template").value = state.template;
  $("grade").value = state.grade;
  $("size").value = state.sizeKey;
  const photo = q.get("photo");
  if (photo === "pier" || photo === "boulevard") {
    await fillAllPanels(await loadImageFromSrc(`samples/${photo}.jpg`));
  }
  if (q.get("shot") === "cover") {
    document.body.classList.add("shot-cover");
  }
  render();
}

wireControls();
ensurePanels();
render();
applyShotParams();

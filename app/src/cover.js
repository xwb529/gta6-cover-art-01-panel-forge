// Panel Forge — Leonida Cover Lab (gta6-cover-art-01 entry by xwb529)
// Pure drawing engine for the cover maker: given a state and a target size it paints a
// multi-panel, GTA-poster-style cover onto any 2D canvas. No network, no libraries —
// the same function drives the live preview and the PNG export, so what you see is
// exactly what you download.

export const TEMPLATES = {
  classic: {
    label: "Classic Five — hero panel, two beats, wide finale",
    // Panels are fractions of the canvas: [x, y, w, h]
    panels: [
      [0.0, 0.0, 0.52, 0.68],
      [0.52, 0.0, 0.48, 0.34],
      [0.52, 0.34, 0.48, 0.34],
      [0.0, 0.68, 0.62, 0.32],
      [0.62, 0.68, 0.38, 0.32],
    ],
  },
  strips: {
    label: "Sunset Strips — three verticals over a banner",
    panels: [
      [0.0, 0.0, 0.34, 0.66],
      [0.34, 0.0, 0.33, 0.66],
      [0.67, 0.0, 0.33, 0.66],
      [0.0, 0.66, 1.0, 0.34],
    ],
  },
  grid: {
    label: "Neon Grid — four panels, one headline block",
    panels: [
      [0.0, 0.0, 0.5, 0.42],
      [0.5, 0.0, 0.5, 0.42],
      [0.0, 0.42, 0.5, 0.4],
      [0.5, 0.42, 0.5, 0.4],
      [0.0, 0.82, 1.0, 0.18],
    ],
  },
};

export const GRADES = {
  sunset: {
    label: "Vice Sunset",
    wash: ["rgba(255,94,58,0.28)", "rgba(255,176,0,0.10)", "rgba(64,0,96,0.34)"],
    sky: ["#2b0a3d", "#8f1d5a", "#ff7a3d", "#ffc46b"],
  },
  neon: {
    label: "Neon Nights",
    wash: ["rgba(0,229,255,0.16)", "rgba(255,0,128,0.14)", "rgba(10,0,40,0.38)"],
    sky: ["#05001e", "#1b0b4d", "#7a0c5e", "#ff2e88"],
  },
  gold: {
    label: "Leonida Gold",
    wash: ["rgba(255,196,0,0.20)", "rgba(255,120,0,0.10)", "rgba(30,16,0,0.30)"],
    sky: ["#160b00", "#4d2400", "#a85a00", "#ffd34d"],
  },
  noir: {
    label: "Noir Mono",
    wash: ["rgba(0,0,0,0.10)", "rgba(255,255,255,0.05)", "rgba(0,0,0,0.45)"],
    sky: ["#050505", "#1c1c1c", "#3d3d3d", "#8a8a8a"],
    mono: true,
  },
};

export function makePanelState() {
  return { img: null, zoom: 1, ox: 0.5, oy: 0.5 };
}

// Draw one photo into a clipped panel rect, honouring zoom and focal offset.
function drawPhotoPanel(ctx, rect, panel, grade) {
  const [x, y, w, h] = rect;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  if (panel.img) {
    const img = panel.img;
    const scale = Math.max(w / img.width, h / img.height) * panel.zoom;
    const dw = img.width * scale;
    const dh = img.height * scale;
    const dx = x + (w - dw) * panel.ox;
    const dy = y + (h - dh) * panel.oy;
    if (grade.mono) ctx.filter = "grayscale(1) contrast(1.15)";
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.filter = "none";
  } else {
    const g = ctx.createLinearGradient(x, y, x, y + h);
    grade.sky.forEach((c, i) => g.addColorStop(i / (grade.sky.length - 1), c));
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    // Placeholder sun disc so empty panels still read as a Leonida skyline card.
    ctx.fillStyle = "rgba(255,220,150,0.85)";
    ctx.beginPath();
    ctx.arc(x + w * 0.5, y + h * 0.62, Math.min(w, h) * 0.16, 0, Math.PI * 2);
    ctx.fill();
  }
  // Colour grade wash, top tint to bottom shade.
  const wash = ctx.createLinearGradient(x, y, x, y + h);
  wash.addColorStop(0, grade.wash[0]);
  wash.addColorStop(0.55, grade.wash[1]);
  wash.addColorStop(1, grade.wash[2]);
  ctx.fillStyle = wash;
  ctx.fillRect(x, y, w, h);
  // A faint top-left inner edge, like light catching a printed poster panel.
  ctx.strokeStyle = "rgba(255,255,255,0.13)";
  ctx.lineWidth = Math.max(1, Math.min(w, h) * 0.004);
  ctx.beginPath();
  ctx.moveTo(x + 1, y + h - 1);
  ctx.lineTo(x + 1, y + 1);
  ctx.lineTo(x + w - 1, y + 1);
  ctx.stroke();
  ctx.restore();
}

// Bold poster lettering: stacked title lines, heavy stroke, hard magenta drop shade.
function drawLettering(ctx, W, H, state) {
  const title = (state.title || "").trim();
  if (!title) return;
  const lines = title.toUpperCase().split("\n").filter(Boolean);
  const base = H * (state.sizeKey === "wide" ? 0.16 : 0.115);
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  lines.forEach((line, i) => {
    let size = base;
    ctx.font = `900 ${size}px "Arial Black", "Segoe UI", sans-serif`;
    // Shrink to fit the canvas width.
    const width = ctx.measureText(line).width;
    if (width > W * 0.94) {
      size = size * ((W * 0.94) / width);
      ctx.font = `900 ${size}px "Arial Black", "Segoe UI", sans-serif`;
    }
    const y = H * 0.97 - (lines.length - 1 - i) * size * 1.04;
    ctx.lineWidth = size * 0.16;
    ctx.strokeStyle = "#0a0a12";
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#ff2e88";
    ctx.shadowOffsetX = size * 0.07;
    ctx.shadowOffsetY = size * 0.07;
    ctx.strokeText(line, W / 2, y);
    ctx.shadowColor = "transparent";
    ctx.fillText(line, W / 2, y);
  });
  if (state.subtitle) {
    const s = H * 0.032;
    ctx.font = `700 ${s}px "Segoe UI", Arial, sans-serif`;
    ctx.fillStyle = "#ffd34d";
    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    const y = H * 0.97 - lines.length * base * 1.04 - s * 0.6;
    ctx.fillText(state.subtitle.toUpperCase(), W / 2, y);
  }
  ctx.restore();
}

export function drawCover(ctx, W, H, state) {
  const template = TEMPLATES[state.template] || TEMPLATES.classic;
  const grade = GRADES[state.grade] || GRADES.sunset;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#0a0a12";
  ctx.fillRect(0, 0, W, H);
  const gutter = Math.max(3, W * 0.006);
  template.panels.forEach((p, i) => {
    const rect = [
      p[0] * W + gutter / 2,
      p[1] * H + gutter / 2,
      p[2] * W - gutter,
      p[3] * H - gutter,
    ];
    drawPhotoPanel(ctx, rect, state.panels[i] || makePanelState(), grade);
  });
  // Frame + vignette for the printed-poster feel.
  ctx.save();
  ctx.strokeStyle = "#0a0a12";
  ctx.lineWidth = Math.max(6, W * 0.012);
  ctx.strokeRect(0, 0, W, H);
  const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.45, W / 2, H / 2, Math.max(W, H) * 0.78);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, "rgba(0,0,0,0.35)");
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
  drawLettering(ctx, W, H, state);
}

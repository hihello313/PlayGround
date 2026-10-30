export const TAU = Math.PI * 2;

export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export const lerp = (a, b, t) => a + (b - a) * t;

export function rgba(hex, alpha) {
  const value = hex.replace("#", "");
  const n = value.length === 3 ? value.split("").map((c) => c + c).join("") : value;
  const num = parseInt(n, 16);
  return `rgba(${(num >> 16) & 255},${(num >> 8) & 255},${num & 255},${alpha})`;
}

export function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const sceneCache = new WeakMap();

export function getSceneData(level) {
  let data = sceneCache.get(level);
  if (data) return data;
  const rng = mulberry32(level.seed * 811 + 3);
  const stars = Array.from({ length: 86 }, () => ({
    x: rng(),
    y: rng() * 0.63,
    r: 0.7 + rng() * 1.9,
    phase: rng() * TAU,
    alpha: 0.28 + rng() * 0.72
  }));
  const clouds = Array.from({ length: 28 }, () => ({
    x: rng() * (level.width + 600) - 300,
    y: 30 + rng() * 470,
    s: 0.42 + rng() * 1.45,
    p: 0.045 + rng() * 0.19,
    a: 0.25 + rng() * 0.65,
    phase: rng() * TAU,
    drift: 0.6 + rng() * 1.4
  }));
  const isles = Array.from({ length: 10 }, () => ({
    x: rng() * level.width,
    y: 120 + rng() * 330,
    s: 0.26 + rng() * 0.82,
    p: 0.12 + rng() * 0.25,
    phase: rng() * TAU
  }));
  const motes = Array.from({ length: level.palette.aurora ? 64 : 38 }, () => ({
    x: rng() * (level.width + 400) - 200,
    y: 150 + rng() * 430,
    r: 0.8 + rng() * 2.1,
    p: 0.2 + rng() * 0.55,
    phase: rng() * TAU,
    drift: 0.35 + rng() * 1.1
  }));
  data = { stars, clouds, isles, motes };
  sceneCache.set(level, data);
  return data;
}

function drawStars(ctx, view, level, camX, t) {
  if (!level.palette.stars) return;
  const stars = getSceneData(level).stars;
  ctx.save();
  for (const star of stars) {
    const x = ((star.x * view.w - camX * 0.012) % (view.w + 20) + view.w + 20) % (view.w + 20) - 10;
    const y = star.y * view.h;
    const twinkle = 0.58 + Math.sin(t * 1.5 + star.phase) * 0.42;
    ctx.globalAlpha = star.alpha * twinkle;
    ctx.fillStyle = "#f3f0ff";
    ctx.beginPath();
    ctx.arc(x, y, star.r, 0, TAU);
    ctx.fill();
    if (star.r > 2) {
      ctx.globalAlpha *= 0.32;
      ctx.fillRect(x - 5, y - 0.5, 10, 1);
      ctx.fillRect(x - 0.5, y - 5, 1, 10);
    }
  }
  ctx.restore();
}

function drawSun(ctx, view, level, camX, t) {
  const pal = level.palette;
  const x = view.w * pal.sunX - camX * 0.022;
  const y = view.h * pal.sunY;
  const moon = level.id === "moon";
  const radius = Math.min(view.w, view.h) * (moon ? 0.055 : 0.085);
  const glowRadius = radius * (moon ? 5 : 6.2);

  const glow = ctx.createRadialGradient(x, y, radius * 0.2, x, y, glowRadius);
  glow.addColorStop(0, pal.sunGlow);
  glow.addColorStop(0.35, pal.sunGlow.replace(/[\d.]+\)$/, "0.15)"));
  glow.addColorStop(1, "rgba(255,220,170,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, glowRadius, 0, TAU);
  ctx.fill();

  if (moon) {
    ctx.save();
    ctx.shadowColor = "rgba(210, 220, 255, 0.55)";
    ctx.shadowBlur = 24;
    ctx.fillStyle = pal.sun;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, TAU);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = "rgba(171, 181, 217, 0.22)";
    const craters = [[-0.26, -0.12, 0.17], [0.2, 0.16, 0.12], [0.13, -0.27, 0.08], [-0.12, 0.3, 0.07]];
    for (const [cx, cy, cr] of craters) {
      ctx.beginPath();
      ctx.arc(x + radius * cx, y + radius * cy, radius * cr, 0, TAU);
      ctx.fill();
    }
  } else {
    const disc = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, radius * 0.1, x, y, radius);
    disc.addColorStop(0, "#fff9e3");
    disc.addColorStop(0.7, pal.sun);
    disc.addColorStop(1, "rgba(255, 186, 118, 0.9)");
    ctx.fillStyle = disc;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = "#ffe9c7";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, radius + 12 + Math.sin(t * 0.7) * 2, 0, TAU);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  ctx.globalAlpha = 0.1;
  ctx.strokeStyle = pal.sun;
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(x, y + view.h * 0.07, radius * (1.4 + i * 0.6), radius * 0.12, 0, 0, TAU);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawAurora(ctx, view, level, t) {
  if (!level.palette.aurora) return;
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const colors = [
    ["rgba(92, 236, 210, 0)", "rgba(92, 236, 210, 0.2)", "rgba(92, 236, 210, 0)"],
    ["rgba(155, 127, 255, 0)", "rgba(155, 127, 255, 0.18)", "rgba(155, 127, 255, 0)"],
    ["rgba(255, 135, 190, 0)", "rgba(255, 135, 190, 0.1)", "rgba(255, 135, 190, 0)"]
  ];
  for (let band = 0; band < 3; band++) {
    const grad = ctx.createLinearGradient(0, view.h * 0.05, 0, view.h * 0.55);
    grad.addColorStop(0, colors[band][0]);
    grad.addColorStop(0.45, colors[band][1]);
    grad.addColorStop(1, colors[band][2]);
    ctx.fillStyle = grad;
    ctx.beginPath();
    const baseY = view.h * (0.13 + band * 0.055);
    ctx.moveTo(-30, baseY + 30);
    for (let x = -30; x <= view.w + 40; x += 24) {
      const wave = Math.sin(x * 0.006 + t * 0.18 + band * 2.1) * 28 + Math.sin(x * 0.002 + t * 0.09) * 38;
      ctx.lineTo(x, baseY + wave);
    }
    for (let x = view.w + 40; x >= -30; x -= 24) {
      const wave = Math.sin(x * 0.006 + t * 0.18 + band * 2.1) * 28 + Math.sin(x * 0.002 + t * 0.09) * 38;
      ctx.lineTo(x, baseY + 65 + wave * 0.5);
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawSea(ctx, view, level, camX, t) {
  if (!level.palette.water) return;
  const horizon = view.h * 0.545;
  const grad = ctx.createLinearGradient(0, horizon, 0, view.h);
  grad.addColorStop(0, "rgba(244, 164, 133, 0.66)");
  grad.addColorStop(0.18, "rgba(105, 153, 166, 0.75)");
  grad.addColorStop(1, "rgba(26, 71, 92, 0.92)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, horizon, view.w, view.h - horizon);

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  for (let i = 0; i < 28; i++) {
    const y = horizon + 9 + i * (view.h - horizon) / 30;
    const speed = 0.4 + i * 0.035;
    const x = ((i * 173 + t * 18 * speed - camX * 0.06) % (view.w + 240)) - 120;
    const w = 20 + (i % 5) * 26;
    ctx.globalAlpha = 0.08 + (i / 28) * 0.18;
    ctx.fillStyle = "#ffe6bd";
    ctx.beginPath();
    ctx.ellipse(x, y, w, 1.4, 0, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function ridgeY(worldX, seed, amp) {
  return Math.sin(worldX * 0.0023 + seed) * amp
    + Math.sin(worldX * 0.0071 + seed * 1.73) * amp * 0.35
    + Math.sin(worldX * 0.0167 + seed * 0.61) * amp * 0.11;
}

function drawRidge(ctx, view, camX, factor, baseY, color, seed, amp, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-40, view.h + 20);
  for (let x = -40; x <= view.w + 40; x += 14) {
    const worldX = camX * factor + x;
    ctx.lineTo(x, baseY - ridgeY(worldX, seed, amp));
  }
  ctx.lineTo(view.w + 40, view.h + 20);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawClouds(ctx, view, level, camX, t) {
  const pal = level.palette;
  const clouds = getSceneData(level).clouds;
  ctx.save();
  for (const cloud of clouds) {
    const x = cloud.x - camX * cloud.p + Math.sin(t * 0.045 * cloud.drift + cloud.phase) * 12;
    const y = cloud.y + Math.sin(t * 0.13 + cloud.phase) * 3;
    if (x < -320 || x > view.w + 320) continue;
    const s = cloud.s;
    ctx.globalAlpha = cloud.a * 0.72;
    ctx.fillStyle = pal.cloudShade;
    ctx.beginPath();
    ctx.ellipse(x + 8 * s, y + 10 * s, 92 * s, 24 * s, 0, 0, TAU);
    ctx.ellipse(x + 54 * s, y + 8 * s, 58 * s, 20 * s, 0, 0, TAU);
    ctx.ellipse(x - 48 * s, y + 12 * s, 54 * s, 18 * s, 0, 0, TAU);
    ctx.fill();

    ctx.globalAlpha = cloud.a;
    ctx.fillStyle = pal.cloud;
    ctx.beginPath();
    ctx.ellipse(x, y, 64 * s, 22 * s, 0, 0, TAU);
    ctx.ellipse(x + 43 * s, y + 4 * s, 42 * s, 18 * s, 0, 0, TAU);
    ctx.ellipse(x - 39 * s, y + 5 * s, 40 * s, 16 * s, 0, 0, TAU);
    ctx.ellipse(x + 8 * s, y - 11 * s, 34 * s, 19 * s, 0, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function drawFloatingIsles(ctx, view, level, camX, t) {
  const pal = level.palette;
  const isles = getSceneData(level).isles;
  ctx.save();
  for (const isle of isles) {
    const x = isle.x - camX * isle.p;
    if (x < -180 || x > view.w + 180) continue;
    const y = isle.y + Math.sin(t * 0.28 + isle.phase) * 5;
    const s = isle.s;
    ctx.globalAlpha = 0.2 + isle.p * 0.7;
    ctx.fillStyle = pal.mountainNear;
    ctx.beginPath();
    ctx.ellipse(x, y, 44 * s, 12 * s, 0, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - 42 * s, y + 2 * s);
    ctx.quadraticCurveTo(x - 22 * s, y + 54 * s, x + 2 * s, y + 24 * s);
    ctx.quadraticCurveTo(x + 18 * s, y + 48 * s, x + 40 * s, y + 2 * s);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = pal.grassDark;
    ctx.globalAlpha *= 0.8;
    ctx.beginPath();
    ctx.ellipse(x, y - 2 * s, 42 * s, 8 * s, 0, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function drawMotes(ctx, view, level, camX, t) {
  const pal = level.palette;
  const motes = getSceneData(level).motes;
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  for (const mote of motes) {
    const x = mote.x - camX * mote.p + Math.sin(t * 0.4 * mote.drift + mote.phase) * 8;
    const y = mote.y + Math.cos(t * 0.52 + mote.phase) * 7;
    if (x < -20 || x > view.w + 20 || y < 0 || y > view.h) continue;
    const pulse = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 2.2 + mote.phase));
    ctx.globalAlpha = pulse * 0.75;
    ctx.fillStyle = pal.firefly;
    ctx.beginPath();
    ctx.arc(x, y, mote.r, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = pulse * 0.14;
    ctx.beginPath();
    ctx.arc(x, y, mote.r * 5, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

export function drawBackground(ctx, view, level, camX, t) {
  const pal = level.palette;
  const sky = ctx.createLinearGradient(0, 0, 0, view.h);
  sky.addColorStop(0, pal.sky[0]);
  sky.addColorStop(0.38, pal.sky[1]);
  sky.addColorStop(0.72, pal.sky[2]);
  sky.addColorStop(1, pal.sky[3]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, view.w, view.h);

  drawStars(ctx, view, level, camX, t);
  drawSun(ctx, view, level, camX, t);
  drawAurora(ctx, view, level, t);
  drawSea(ctx, view, level, camX, t);
  drawClouds(ctx, view, level, camX, t);

  const farBase = view.h * 0.575;
  const midBase = view.h * 0.635;
  const nearBase = view.h * 0.72;
  drawRidge(ctx, view, camX, 0.055, farBase, pal.mountainFar, level.seed + 2.2, 52, 0.72);
  drawRidge(ctx, view, camX, 0.12, midBase, pal.mountainMid, level.seed + 8.7, 62, 0.85);
  drawRidge(ctx, view, camX, 0.23, nearBase, pal.mountainNear, level.seed + 15.1, 74, 1);

  drawFloatingIsles(ctx, view, level, camX, t);

  const haze = ctx.createLinearGradient(0, view.h * 0.42, 0, view.h * 0.78);
  haze.addColorStop(0, "rgba(255,255,255,0)");
  haze.addColorStop(0.6, pal.haze);
  haze.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = haze;
  ctx.fillRect(0, view.h * 0.4, view.w, view.h * 0.45);

  drawMotes(ctx, view, level, camX, t);
}

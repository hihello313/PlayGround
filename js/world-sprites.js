import { TAU, rgba, roundRect, mulberry32 } from "./art.js";

export function drawIsland(ctx, platform, level, t) {
  const pal = level.palette;
  const { x, y, w } = platform;
  const rng = mulberry32(platform.seed * 991 + 7);
  const depth = 82 + (platform.seed % 5) * 11 + Math.min(w * 0.075, 34);
  const mid = y + depth * 0.44;

  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = "#1b1029";
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + depth + 15, w * 0.47, 13, 0, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 1;

  const rock = ctx.createLinearGradient(x, y, x, y + depth);
  rock.addColorStop(0, pal.rockLight);
  rock.addColorStop(0.28, pal.rock);
  rock.addColorStop(1, pal.rockDark);
  ctx.fillStyle = rock;
  ctx.strokeStyle = pal.rockDark;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 5, y + 1);
  ctx.lineTo(x + w - 5, y + 1);
  ctx.lineTo(x + w - 2, mid);
  ctx.lineTo(x + w * 0.83, y + depth * 0.73);
  ctx.lineTo(x + w * 0.7, y + depth * 0.62);
  ctx.lineTo(x + w * 0.57, y + depth * 0.94);
  ctx.lineTo(x + w * 0.44, y + depth * 0.69);
  ctx.lineTo(x + w * 0.31, y + depth * 0.88);
  ctx.lineTo(x + w * 0.17, y + depth * 0.63);
  ctx.lineTo(x + 2, mid);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.globalAlpha = 0.22;
  ctx.fillStyle = "#ffe4c7";
  ctx.beginPath();
  ctx.moveTo(x + 12, y + 9);
  ctx.quadraticCurveTo(x + w * 0.24, y + 26, x + w * 0.38, y + depth * 0.44);
  ctx.quadraticCurveTo(x + w * 0.22, y + 32, x + 12, y + 9);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.strokeStyle = rgba(pal.rockDark, 0.55);
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 3; i++) {
    const cx = x + w * (0.2 + rng() * 0.6);
    const cy = y + 22 + rng() * depth * 0.42;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + (rng() - 0.5) * 20, cy + 12 + rng() * 12);
    ctx.stroke();
  }

  const grass = ctx.createLinearGradient(0, y - 12, 0, y + 11);
  grass.addColorStop(0, pal.grassLight);
  grass.addColorStop(0.55, pal.grass);
  grass.addColorStop(1, pal.grassDark);
  ctx.fillStyle = grass;
  ctx.strokeStyle = pal.grassDark;
  ctx.lineWidth = 1.6;
  roundRect(ctx, x - 4, y - 11, w + 8, 21, 10);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = rgba(pal.grassLight, 0.55);
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x + 8, y - 7);
  ctx.quadraticCurveTo(x + w * 0.5, y - 12, x + w - 8, y - 7);
  ctx.stroke();

  const tuftCount = Math.max(4, Math.round(w / 32));
  for (let i = 0; i < tuftCount; i++) {
    const tx = x + 8 + (i / Math.max(1, tuftCount - 1)) * (w - 16) + (rng() - 0.5) * 7;
    const sway = Math.sin(t * 1.7 + i * 1.4 + platform.seed) * 1.2;
    ctx.strokeStyle = i % 3 === 0 ? pal.grassLight : pal.grassDark;
    ctx.lineWidth = 1.4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(tx, y - 8);
    ctx.quadraticCurveTo(tx + sway - 2, y - 16, tx + sway + 1, y - 20 - (i % 2) * 3);
    ctx.stroke();
  }

  const flowerColors = [pal.accent, "#ffe3a3", "#f6a8b8", pal.grassLight];
  for (let i = 0; i < Math.max(2, Math.round(w / 110)); i++) {
    const fx = x + 20 + rng() * (w - 40);
    const fy = y - 9 - rng() * 3;
    const sway = Math.sin(t * 1.5 + fx) * 1;
    ctx.strokeStyle = pal.grassDark;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx + sway, fy - 9);
    ctx.stroke();
    ctx.fillStyle = flowerColors[i % flowerColors.length];
    for (let p = 0; p < 5; p++) {
      const a = (p / 5) * TAU;
      ctx.beginPath();
      ctx.arc(fx + sway + Math.cos(a) * 2.5, fy - 9 + Math.sin(a) * 2.5, 1.7, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = "#ffe6a8";
    ctx.beginPath();
    ctx.arc(fx + sway, fy - 9, 1.2, 0, TAU);
    ctx.fill();
  }

  const vineCount = Math.max(1, Math.round(w / 170));
  for (let i = 0; i < vineCount; i++) {
    const vx = x + 25 + rng() * (w - 50);
    const len = 24 + rng() * 38;
    ctx.strokeStyle = rgba(pal.grassDark, 0.9);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(vx, y + 7);
    ctx.bezierCurveTo(vx - 4, y + len * 0.35, vx + 5, y + len * 0.7, vx - 2, y + len);
    ctx.stroke();
    for (let l = 1; l <= 3; l++) {
      const ly = y + 7 + (len / 4) * l;
      ctx.fillStyle = rgba(pal.grass, 0.8);
      ctx.beginPath();
      ctx.ellipse(vx + (l % 2 ? 5 : -4), ly, 4.2, 2.1, l % 2 ? 0.5 : -0.5, 0, TAU);
      ctx.fill();
    }
  }
  ctx.restore();
}

export function drawBird(ctx, bird, level, t) {
  const skin = level.birdSkins[bird.skin % level.birdSkins.length];
  const cx = bird.x + bird.w / 2;
  const y = bird.y;
  const w = bird.w;
  const flap = Math.sin(t * 3.15 + (bird.motion?.phase || 0) + bird.x * 0.005);
  const blink = Math.sin(t * 0.9 + bird.x * 0.02) > 0.985;

  ctx.save();
  ctx.translate(cx, y);

  // Tail feathers
  ctx.save();
  ctx.translate(-w * 0.39, 43);
  for (let i = 0; i < 3; i++) {
    ctx.save();
    ctx.rotate(-0.18 + i * 0.2 + flap * 0.03);
    ctx.fillStyle = i === 1 ? skin.wing : skin.wingDark;
    ctx.strokeStyle = rgba(skin.dark, 0.7);
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.quadraticCurveTo(-w * 0.27, -20 + i * 8, -w * 0.42, -5 + i * 12);
    ctx.quadraticCurveTo(-w * 0.2, 6 + i * 7, 0, 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  // Far wing
  ctx.save();
  ctx.translate(-w * 0.27, 40);
  ctx.rotate(-0.24 + flap * 0.15);
  const farWing = ctx.createLinearGradient(-w * 0.5, 0, 0, 40);
  farWing.addColorStop(0, skin.wingDark);
  farWing.addColorStop(1, skin.wing);
  ctx.fillStyle = farWing;
  ctx.strokeStyle = rgba(skin.dark, 0.65);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -6);
  ctx.bezierCurveTo(-w * 0.35, -36 - flap * 8, -w * 0.73, -20 - flap * 16, -w * 0.66, 10);
  ctx.bezierCurveTo(-w * 0.48, 31, -w * 0.18, 34, 0, 18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = rgba(skin.light, 0.23);
  ctx.lineWidth = 1.1;
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    ctx.moveTo(-w * 0.08, 3 + i * 4);
    ctx.quadraticCurveTo(-w * 0.36, -4 - flap * 8 + i * 5, -w * 0.56, 5 + i * 5);
    ctx.stroke();
  }
  ctx.restore();

  // Body
  const body = ctx.createLinearGradient(0, 4, 0, 104);
  body.addColorStop(0, skin.light);
  body.addColorStop(0.35, skin.body);
  body.addColorStop(1, skin.dark);
  ctx.fillStyle = body;
  ctx.strokeStyle = rgba(skin.dark, 0.9);
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(0, 57, w * 0.5, 46, 0, 0, TAU);
  ctx.fill();
  ctx.stroke();

  // Belly scallops
  ctx.globalAlpha = 0.42;
  ctx.fillStyle = skin.light;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.ellipse(-w * 0.22 + i * w * 0.15, 80 + Math.sin(i) * 4, w * 0.09, 13, 0.1, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Near wing
  ctx.save();
  ctx.translate(-w * 0.08, 50);
  ctx.rotate(0.06 - flap * 0.11);
  const wing = ctx.createLinearGradient(-w * 0.5, 0, 0, 42);
  wing.addColorStop(0, skin.wing);
  wing.addColorStop(1, skin.wingDark);
  ctx.fillStyle = wing;
  ctx.strokeStyle = rgba(skin.dark, 0.8);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -5);
  ctx.bezierCurveTo(-w * 0.28, -22 + flap * 7, -w * 0.65, -8 + flap * 15, -w * 0.52, 27);
  ctx.bezierCurveTo(-w * 0.3, 41, -w * 0.1, 32, 0, 18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = rgba(skin.light, 0.26);
  ctx.lineWidth = 1;
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    ctx.moveTo(-w * 0.05, 4 + i * 4);
    ctx.quadraticCurveTo(-w * 0.24, 3 + flap * 8 + i * 4, -w * 0.4, 14 + i * 3);
    ctx.stroke();
  }
  ctx.restore();

  // Feet
  ctx.strokeStyle = skin.beak;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-w * 0.18, 95);
  ctx.lineTo(-w * 0.2, 105);
  ctx.moveTo(w * 0.1, 96);
  ctx.lineTo(w * 0.12, 106);
  ctx.stroke();

  // Head
  const headX = w * 0.26;
  const headY = 12;
  const head = ctx.createRadialGradient(headX - 6, headY - 9, 3, headX, headY, 32);
  head.addColorStop(0, skin.light);
  head.addColorStop(0.62, skin.body);
  head.addColorStop(1, skin.dark);
  ctx.fillStyle = head;
  ctx.strokeStyle = rgba(skin.dark, 0.9);
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(headX, headY, 28, 0, TAU);
  ctx.fill();
  ctx.stroke();

  // Crest
  ctx.fillStyle = skin.body;
  ctx.strokeStyle = rgba(skin.dark, 0.8);
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) {
    const a = -1.2 + i * 0.24;
    const bx = headX - 5 + i * 7;
    const by = headY - 23;
    ctx.beginPath();
    ctx.moveTo(bx - 4, by + 4);
    ctx.quadraticCurveTo(bx + Math.cos(a) * 13, by - 10, bx + Math.cos(a) * 6 + 2, by - 18 - i * 2);
    ctx.quadraticCurveTo(bx + Math.cos(a) * 3, by - 5, bx + 4, by + 3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Beak
  ctx.fillStyle = skin.beak;
  ctx.strokeStyle = rgba(skin.dark, 0.55);
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(headX + 20, headY + 2);
  ctx.lineTo(headX + 44, headY + 10);
  ctx.lineTo(headX + 20, headY + 17);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = rgba(skin.dark, 0.35);
  ctx.beginPath();
  ctx.moveTo(headX + 22, headY + 10);
  ctx.lineTo(headX + 40, headY + 10);
  ctx.stroke();

  // Eye
  const eyeX = headX + 10;
  const eyeY = headY - 4;
  if (blink) {
    ctx.strokeStyle = "#392c33";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 6, 0.1, Math.PI - 0.1);
    ctx.stroke();
  } else {
    ctx.fillStyle = "#fff8e7";
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, 7.4, 8.2, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#3b2b35";
    ctx.beginPath();
    ctx.arc(eyeX + 2, eyeY + 0.5, 3.4, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.beginPath();
    ctx.arc(eyeX + 0.6, eyeY - 2.2, 1.5, 0, TAU);
    ctx.fill();
  }

  // Cheek blush
  ctx.globalAlpha = 0.23;
  ctx.fillStyle = skin.saddle;
  ctx.beginPath();
  ctx.ellipse(headX + 14, headY + 12, 8, 4, 0.2, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Saddle blanket
  const saddleW = w * 0.55;
  const saddle = ctx.createLinearGradient(0, -7, 0, 13);
  saddle.addColorStop(0, skin.saddle);
  saddle.addColorStop(1, skin.saddleDark);
  ctx.fillStyle = saddle;
  ctx.strokeStyle = rgba(skin.saddleDark, 0.95);
  ctx.lineWidth = 1.8;
  roundRect(ctx, -saddleW / 2, -5, saddleW, 15, 6);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = rgba(skin.light, 0.45);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-saddleW / 2 + 7, -1);
  ctx.lineTo(saddleW / 2 - 7, -1);
  ctx.stroke();
  ctx.fillStyle = skin.saddle;
  for (let i = 0; i < 5; i++) {
    const tx = -saddleW / 2 + 10 + i * ((saddleW - 20) / 4);
    ctx.beginPath();
    ctx.moveTo(tx - 2, 9);
    ctx.lineTo(tx + 2, 9);
    ctx.lineTo(tx + 1, 16);
    ctx.lineTo(tx - 1, 16);
    ctx.closePath();
    ctx.fill();
  }
  ctx.strokeStyle = rgba(skin.light, 0.65);
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-saddleW / 2 + 5, -5.5);
  ctx.lineTo(saddleW / 2 - 5, -5.5);
  ctx.stroke();

  // Small sparkle at the saddle edge
  ctx.globalAlpha = 0.45 + Math.sin(t * 2.4 + bird.x) * 0.2;
  ctx.fillStyle = "#fff4cf";
  ctx.beginPath();
  ctx.arc(-saddleW / 2 + 3, -5, 1.8, 0, TAU);
  ctx.arc(saddleW / 2 - 3, -5, 1.8, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.restore();
}

export function drawFish(ctx, x, y, t, scale = 1, phase = 0) {
  const bob = Math.sin(t * 2.2 + phase + x * 0.01) * 4;
  const tilt = Math.sin(t * 1.6 + phase) * 0.1;
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.rotate(tilt);
  ctx.scale(scale, scale);

  ctx.globalAlpha = 0.22 + Math.sin(t * 2.4 + phase) * 0.06;
  ctx.fillStyle = "#ffd580";
  ctx.beginPath();
  ctx.arc(0, 0, 27, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 1;

  const body = ctx.createLinearGradient(-12, -8, 12, 9);
  body.addColorStop(0, "#ffe4a1");
  body.addColorStop(0.55, "#ffc05e");
  body.addColorStop(1, "#f08d5c");
  ctx.fillStyle = body;
  ctx.strokeStyle = "#ad5c3d";
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 8.5, 0.05, 0, TAU);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#ff9d68";
  ctx.beginPath();
  ctx.moveTo(-11, 0);
  ctx.lineTo(-22, -8);
  ctx.lineTo(-19, 0);
  ctx.lineTo(-22, 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.beginPath();
  ctx.ellipse(-1, -3.5, 7, 2.7, -0.1, 0, TAU);
  ctx.fill();

  ctx.fillStyle = "#44302f";
  ctx.beginPath();
  ctx.arc(6, -1.5, 1.8, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#fff8ea";
  ctx.beginPath();
  ctx.arc(5.4, -2.1, 0.65, 0, TAU);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,245,212,0.9)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(11, -4);
  ctx.lineTo(16, -7);
  ctx.moveTo(12, 0);
  ctx.lineTo(17, -1);
  ctx.stroke();

  ctx.globalAlpha = 0.7 + Math.sin(t * 4 + phase) * 0.3;
  ctx.fillStyle = "#fff4c6";
  ctx.beginPath();
  ctx.moveTo(18, -12);
  ctx.lineTo(19.5, -8.5);
  ctx.lineTo(23, -7);
  ctx.lineTo(19.5, -5.5);
  ctx.lineTo(18, -2);
  ctx.lineTo(16.5, -5.5);
  ctx.lineTo(13, -7);
  ctx.lineTo(16.5, -8.5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawThorn(ctx, thorn, level, t) {
  const pal = level.palette;
  const { x, y, w } = thorn;
  ctx.save();
  ctx.translate(x + w / 2, y + 2);
  ctx.strokeStyle = "#332c3f";
  ctx.fillStyle = "#433b4d";
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    const off = -w * 0.38 + i * (w * 0.25);
    const h = 24 + (i % 3) * 8;
    ctx.beginPath();
    ctx.moveTo(off - 3, 0);
    ctx.quadraticCurveTo(off - 9, -h * 0.6, off + 2, -h);
    ctx.quadraticCurveTo(off + 9, -h * 0.5, off + 4, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#7b8c57";
    for (let s = 0; s < 3; s++) {
      const sy = -6 - s * (h / 3.4);
      ctx.beginPath();
      ctx.moveTo(off, sy);
      ctx.lineTo(off - 6, sy - 4);
      ctx.lineTo(off + 1, sy - 3);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(off + 1, sy - 1);
      ctx.lineTo(off + 7, sy - 5);
      ctx.lineTo(off + 2, sy - 4);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = "#433b4d";
    ctx.beginPath();
    ctx.arc(off + 2, -h + 2, 3.2, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#e56b75";
    ctx.beginPath();
    ctx.arc(off + 2, -h + 2, 1.6, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 0.18 + Math.sin(t * 2.2) * 0.05;
  ctx.fillStyle = "#ff7f87";
  ctx.beginPath();
  ctx.ellipse(0, -12, w * 0.62, 22, 0, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
}

export function drawCheckpoint(ctx, cp, level, active, t) {
  const pal = level.palette;
  ctx.save();
  ctx.translate(cp.x, cp.y);
  if (active) {
    const glow = ctx.createRadialGradient(0, -64, 4, 0, -64, 80);
    glow.addColorStop(0, "rgba(255,218,140,0.45)");
    glow.addColorStop(1, "rgba(255,218,140,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, -64, 80, 0, TAU);
    ctx.fill();
  }
  ctx.strokeStyle = "#4b3b49";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-2, -32, 2, -73);
  ctx.stroke();
  ctx.strokeStyle = rgba(pal.grassLight, 0.55);
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-1, -8);
  ctx.quadraticCurveTo(-9, -13, -11, -20);
  ctx.moveTo(1, -24);
  ctx.quadraticCurveTo(9, -30, 12, -38);
  ctx.stroke();
  ctx.fillStyle = rgba(pal.grass, 0.8);
  ctx.beginPath();
  ctx.ellipse(-8, -15, 5, 2.4, -0.5, 0, TAU);
  ctx.ellipse(9, -33, 5, 2.4, 0.5, 0, TAU);
  ctx.fill();

  ctx.strokeStyle = "#3d3040";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -70);
  ctx.lineTo(0, -84);
  ctx.stroke();
  ctx.fillStyle = active ? "#ffd681" : "rgba(255,245,220,0.22)";
  ctx.strokeStyle = active ? "#b87937" : "rgba(60,45,62,0.55)";
  ctx.lineWidth = 2;
  roundRect(ctx, -10, -77, 20, 24, 6);
  ctx.fill();
  ctx.stroke();
  if (active) {
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = "#fff5ca";
    ctx.beginPath();
    ctx.arc(0, -66, 5 + Math.sin(t * 3.2) * 0.7, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "rgba(255,242,190,0.55)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-6, -77);
    ctx.lineTo(6, -77);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawGoal(ctx, goal, level, t) {
  const pal = level.palette;
  const x = goal.x;
  const y = goal.y;
  ctx.save();
  ctx.translate(x, y);

  const aura = ctx.createRadialGradient(0, -66, 8, 0, -66, 165);
  aura.addColorStop(0, "rgba(255,214,143,0.3)");
  aura.addColorStop(0.5, "rgba(255,196,126,0.08)");
  aura.addColorStop(1, "rgba(255,196,126,0)");
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(0, -66, 165, 0, TAU);
  ctx.fill();

  // path stones
  ctx.fillStyle = rgba(pal.rockDark, 0.7);
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.ellipse(-48 + i * 24, -2 + (i % 2) * 1.5, 9 - i, 3.2, 0, 0, TAU);
    ctx.fill();
  }

  // Cottage body
  const wall = ctx.createLinearGradient(0, -96, 0, 0);
  wall.addColorStop(0, "#a97b68");
  wall.addColorStop(1, "#795259");
  ctx.fillStyle = wall;
  ctx.strokeStyle = "#4c354a";
  ctx.lineWidth = 2.4;
  roundRect(ctx, -58, -92, 116, 92, 4);
  ctx.fill();
  ctx.stroke();

  // Roof
  ctx.fillStyle = "#3e344f";
  ctx.strokeStyle = "#2b243b";
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-76, -88);
  ctx.lineTo(0, -146);
  ctx.lineTo(76, -88);
  ctx.lineTo(56, -80);
  ctx.lineTo(0, -128);
  ctx.lineTo(-56, -80);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,205,142,0.16)";
  ctx.lineWidth = 1.5;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 14, -128 + Math.abs(i) * 12);
    ctx.lineTo(i * 27, -86 + Math.abs(i) * 3);
    ctx.stroke();
  }

  // Chimney
  ctx.fillStyle = "#604553";
  ctx.strokeStyle = "#3d2c40";
  ctx.lineWidth = 2;
  roundRect(ctx, 35, -140, 17, 38, 3);
  ctx.fill();
  ctx.stroke();
  for (let i = 0; i < 3; i++) {
    const smokeT = (t * 0.22 + i * 0.34) % 1;
    ctx.globalAlpha = (1 - smokeT) * 0.23;
    ctx.fillStyle = "#e9e3ef";
    ctx.beginPath();
    ctx.arc(45 + Math.sin(smokeT * 6 + i) * 7, -146 - smokeT * 40, 5 + smokeT * 8, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Window glow
  const glow = ctx.createRadialGradient(-18, -62, 2, -18, -62, 36);
  glow.addColorStop(0, "rgba(255,223,151,0.8)");
  glow.addColorStop(1, "rgba(255,223,151,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(-18, -62, 36, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#ffd98d";
  ctx.strokeStyle = "#56394a";
  ctx.lineWidth = 2;
  roundRect(ctx, -31, -73, 27, 23, 3);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "#a66b4b";
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(-17.5, -73);
  ctx.lineTo(-17.5, -50);
  ctx.moveTo(-31, -61.5);
  ctx.lineTo(-4, -61.5);
  ctx.stroke();

  // Door
  ctx.fillStyle = "#563c4d";
  ctx.strokeStyle = "#34283d";
  ctx.lineWidth = 2;
  roundRect(ctx, 11, -62, 28, 62, 12);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#e6b76d";
  ctx.beginPath();
  ctx.arc(32, -30, 2, 0, TAU);
  ctx.fill();

  // String lights
  ctx.strokeStyle = "rgba(68,50,67,0.9)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-65, -84);
  ctx.quadraticCurveTo(0, -70, 65, -84);
  ctx.stroke();
  for (let i = 0; i < 7; i++) {
    const lx = -58 + i * 19;
    const ly = -82 + Math.sin((i / 6) * Math.PI) * 9;
    const pulse = 0.65 + Math.sin(t * 3 + i * 1.7) * 0.35;
    ctx.globalAlpha = pulse;
    ctx.fillStyle = i % 2 ? "#ffd98c" : "#ff9f9d";
    ctx.beginPath();
    ctx.arc(lx, ly + 3, 2.4, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 0.14 * pulse;
    ctx.beginPath();
    ctx.arc(lx, ly + 3, 8, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Sign
  ctx.fillStyle = "#4d3748";
  ctx.strokeStyle = "#2f2439";
  ctx.lineWidth = 1.5;
  roundRect(ctx, -31, -116, 62, 18, 5);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#ffe2a4";
  ctx.font = '700 10px "Baloo 2", sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("HOME", 0, -106.5);

  // Little flowers by the door
  for (let i = 0; i < 4; i++) {
    const fx = -54 + i * 8;
    ctx.strokeStyle = pal.grassDark;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(fx, 0);
    ctx.lineTo(fx + Math.sin(t + i) * 1.5, -9);
    ctx.stroke();
    ctx.fillStyle = i % 2 ? pal.accent : "#ffe3a3";
    ctx.beginPath();
    ctx.arc(fx + Math.sin(t + i) * 1.5, -10, 2.2, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

export function drawParticles(ctx, particles) {
  for (const p of particles) {
    const a = Math.max(0, p.life / p.max);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot || 0);
    ctx.fillStyle = p.color;
    if (p.type === "star") {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const ang = (i / 5) * TAU - Math.PI / 2;
        const outer = p.size;
        const inner = p.size * 0.42;
        ctx.lineTo(Math.cos(ang) * outer, Math.sin(ang) * outer);
        ctx.lineTo(Math.cos(ang + TAU / 10) * inner, Math.sin(ang + TAU / 10) * inner);
      }
      ctx.closePath();
      ctx.fill();
    } else if (p.type === "feather") {
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.42, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.45)";
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(-p.size * 0.8, 0);
      ctx.lineTo(p.size * 0.8, 0);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }
}

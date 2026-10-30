import { TAU, rgba } from "./art.js";

function limb(ctx, x1, y1, x2, y2, cat, width = 7) {
  ctx.lineCap = "round";
  ctx.strokeStyle = cat.furDark;
  ctx.lineWidth = width + 2.5;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.strokeStyle = cat.fur;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function ear(ctx, cat, x1, y1, x2, y2, x3, y3, tilt = 0) {
  ctx.save();
  ctx.translate(tilt, 0);
  ctx.fillStyle = cat.fur;
  ctx.strokeStyle = cat.furDark;
  ctx.lineWidth = 2.2;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = cat.innerEar;
  ctx.beginPath();
  ctx.moveTo(x1 * 0.82 + x3 * 0.18, y1 * 0.84 + y3 * 0.16);
  ctx.lineTo(x2 * 0.76 + x3 * 0.24, y2 * 0.78 + y3 * 0.22);
  ctx.lineTo(x3 * 0.82 + x1 * 0.18, y3 * 0.82 + y1 * 0.18);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawCat(ctx, x, feetY, scale, cat, pose, t, opts = {}) {
  const dir = opts.dir === -1 ? -1 : 1;
  const phase = opts.phase || 0;
  const blink = opts.blink ?? (Math.sin(t * 0.7 + phase) > 0.985 ? 1 : 0);
  const isRun = pose === "run";
  const isJump = pose === "jump";
  const isFall = pose === "fall";
  const isHurt = pose === "hurt";

  const run = isRun ? t * 15 + phase : 0;
  const breathe = Math.sin(t * 2.1 + phase) * 0.7;
  const bob = isRun ? -Math.abs(Math.sin(run)) * 1.8 : isJump ? -2 : isFall ? 1 : breathe * 0.5;
  const tilt = isJump ? -0.11 : isFall ? 0.08 : isHurt ? -0.3 : 0;

  ctx.save();
  if (opts.shadow !== false) {
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = "#1b1029";
    ctx.beginPath();
    ctx.ellipse(x, feetY + 2.5 * scale, 19 * scale, 4.6 * scale, 0, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  ctx.translate(x, feetY + bob * scale);
  ctx.rotate(tilt);
  ctx.scale(dir * scale, scale);

  const furGrad = ctx.createLinearGradient(0, -64, 0, 0);
  furGrad.addColorStop(0, cat.furLight);
  furGrad.addColorStop(0.45, cat.fur);
  furGrad.addColorStop(1, cat.furDark);

  // Tail
  const wag = Math.sin(t * 2.3 + phase) * 6;
  const tailLift = isJump ? -15 : isFall ? -5 : 0;
  ctx.lineCap = "round";
  ctx.strokeStyle = cat.furDark;
  ctx.lineWidth = 9.5;
  ctx.beginPath();
  ctx.moveTo(-9, -20);
  ctx.bezierCurveTo(-27, -23 + wag * 0.35, -31, -44 + wag + tailLift, -16, -50 + wag * 0.5 + tailLift);
  ctx.stroke();
  ctx.strokeStyle = cat.fur;
  ctx.lineWidth = 6.5;
  ctx.beginPath();
  ctx.moveTo(-9, -20);
  ctx.bezierCurveTo(-27, -23 + wag * 0.35, -31, -44 + wag + tailLift, -16, -50 + wag * 0.5 + tailLift);
  ctx.stroke();
  ctx.strokeStyle = cat.furLight;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(-27, -41 + wag * 0.65 + tailLift);
  ctx.quadraticCurveTo(-25, -47 + wag * 0.5 + tailLift, -18, -49 + wag * 0.45 + tailLift);
  ctx.stroke();

  // Back legs
  if (isJump) {
    limb(ctx, -7, -16, -13, -8, cat, 6.5);
    limb(ctx, 7, -16, 4, -7, cat, 6.5);
  } else if (isFall) {
    limb(ctx, -7, -17, -15, -4, cat, 6.5);
    limb(ctx, 7, -17, 14, -2, cat, 6.5);
  } else {
    const swing = isRun ? Math.sin(run) * 8 : 0;
    const swing2 = isRun ? Math.sin(run + Math.PI) * 8 : 0;
    limb(ctx, -6, -16, -8 + swing2, -2 + Math.abs(swing2) * 0.12, cat, 6.4);
    limb(ctx, 6, -16, 7 + swing, -2 + Math.abs(swing) * 0.12, cat, 6.4);
  }

  // Body
  ctx.fillStyle = furGrad;
  ctx.strokeStyle = cat.furDark;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(0, -25, 15.5, 19.5, isRun ? 0.06 : 0, 0, TAU);
  ctx.fill();
  ctx.stroke();

  // Belly
  ctx.globalAlpha = 0.94;
  ctx.fillStyle = cat.patch;
  ctx.beginPath();
  ctx.ellipse(6.5, -23, 8.5, 12.5, -0.08, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 1;

  if (cat.stripes) {
    ctx.strokeStyle = rgba(cat.stripe, 0.72);
    ctx.lineWidth = 2.1;
    ctx.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(-5 + i * 4, -38 + i * 6, 7.5, -1.8, -0.6);
      ctx.stroke();
    }
  }

  // Front legs
  if (isJump) {
    limb(ctx, 8, -17, 14, -11, cat, 6.2);
    limb(ctx, 5, -16, 10, -8, cat, 6.2);
  } else if (isFall) {
    limb(ctx, 8, -17, 17, -9, cat, 6.2);
    limb(ctx, 5, -16, 13, -6, cat, 6.2);
  } else {
    const swing = isRun ? Math.sin(run + 1.1) * 7 : 0;
    const swing2 = isRun ? Math.sin(run + Math.PI + 1.1) * 7 : 0;
    limb(ctx, 7, -16, 8 + swing2, -2 + Math.abs(swing2) * 0.1, cat, 6.2);
    limb(ctx, 4, -16, 5 + swing, -2 + Math.abs(swing) * 0.1, cat, 6.2);
  }

  // Scarf band
  ctx.fillStyle = cat.scarf;
  ctx.strokeStyle = cat.scarfDark;
  ctx.lineWidth = 1.7;
  ctx.beginPath();
  ctx.ellipse(4, -35, 11.5, 4.7, -0.08, 0, TAU);
  ctx.fill();
  ctx.stroke();

  // Scarf tail
  const scarfWave = Math.sin(t * 3.3 + phase) * 2.5 + (isJump ? -4 : 0);
  ctx.fillStyle = cat.scarf;
  ctx.beginPath();
  ctx.moveTo(-4, -34);
  ctx.quadraticCurveTo(-15, -31 + scarfWave, -20, -38 + scarfWave);
  ctx.quadraticCurveTo(-15, -27 + scarfWave, -3, -30);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = cat.scarfDark;
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // Ears
  const earTwitch = Math.sin(t * 2.8 + phase) * 1.2;
  ear(ctx, cat, -1, -58, -8, -71 + earTwitch, 6, -63, isFall ? 2 : 0);
  ear(ctx, cat, 10, -62, 18, -74 - earTwitch, 23, -58, isFall ? -2 : 0);

  // Head
  const headGrad = ctx.createLinearGradient(2, -64, 10, -34);
  headGrad.addColorStop(0, cat.furLight);
  headGrad.addColorStop(0.55, cat.fur);
  headGrad.addColorStop(1, cat.furDark);
  ctx.fillStyle = headGrad;
  ctx.strokeStyle = cat.furDark;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(7, -48, 15.5, 14.5, 0.04, 0, TAU);
  ctx.fill();
  ctx.stroke();

  if (cat.stripes) {
    ctx.strokeStyle = rgba(cat.stripe, 0.75);
    ctx.lineWidth = 1.8;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(2, -61);
    ctx.lineTo(4, -57);
    ctx.moveTo(8, -62);
    ctx.lineTo(9, -58);
    ctx.stroke();
  }

  // Muzzle
  ctx.fillStyle = cat.patch;
  ctx.globalAlpha = 0.92;
  ctx.beginPath();
  ctx.ellipse(13.2, -42.5, 8.5, 6.4, -0.05, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Eyes
  const eyeY = -50.5;
  const eyeX = [2.7, 11.7];
  for (let i = 0; i < 2; i++) {
    if (blink) {
      ctx.strokeStyle = cat.eye;
      ctx.lineWidth = 1.8;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(eyeX[i] + 0.5, eyeY, 3.4, 0.15, Math.PI - 0.15);
      ctx.stroke();
    } else {
      ctx.fillStyle = cat.eye;
      ctx.beginPath();
      ctx.ellipse(eyeX[i], eyeY, 3.15, 4.2, 0.02, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.88)";
      ctx.beginPath();
      ctx.arc(eyeX[i] - 0.9, eyeY - 1.6, 1.15, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.42)";
      ctx.beginPath();
      ctx.arc(eyeX[i] + 1.1, eyeY + 1.4, 0.65, 0, TAU);
      ctx.fill();
    }
  }

  // Nose + mouth
  ctx.fillStyle = "#e27a83";
  ctx.beginPath();
  ctx.moveTo(12.3, -44.7);
  ctx.lineTo(15.2, -44.9);
  ctx.lineTo(13.8, -42.8);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = rgba(cat.eye, 0.75);
  ctx.lineWidth = 1.15;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(13.8, -42.8);
  ctx.quadraticCurveTo(13.4, -40.5, 11.5, -41.2);
  ctx.moveTo(13.8, -42.8);
  ctx.quadraticCurveTo(14.3, -40.4, 16.1, -41.2);
  ctx.stroke();

  // Whiskers
  ctx.strokeStyle = rgba(cat.furLight, 0.75);
  ctx.lineWidth = 0.9;
  ctx.lineCap = "round";
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(17, -43.5 + i * 2.2);
    ctx.quadraticCurveTo(23, -45 + i * 2.7, 27, -44 + i * 3.1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(8.5, -41.5 + i * 1.8);
    ctx.quadraticCurveTo(3.5, -43 + i * 2.1, 0, -42 + i * 2.5);
    ctx.stroke();
  }

  // Collar bell
  ctx.fillStyle = "#ffd56d";
  ctx.strokeStyle = "#bd7b31";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(12.5, -33.4, 2.5, 0, TAU);
  ctx.fill();
  ctx.stroke();

  // Cheek highlight
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(16, -45, 4, 2.2, -0.3, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.restore();
}

export function drawPortrait(canvas, cat, t) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.save();
  const s = w / 105;
  drawCat(ctx, w * 0.51, h * 0.9, s, cat, "idle", t, {
    phase: cat.id.length * 0.8,
    shadow: true
  });
  ctx.restore();
}

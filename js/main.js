import { CATS, CAT_ORDER, LEVELS } from "./levels.js";
import { clamp, drawBackground } from "./art.js";
import { drawCat, drawPortrait } from "./cat.js";
import {
  drawIsland,
  drawBird,
  drawFish,
  drawThorn,
  drawCheckpoint,
  drawGoal,
  drawParticles
} from "./world-sprites.js";
import { Sound } from "./audio.js";

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const TAU = Math.PI * 2;

const canvas = $("#game");
const ctx = canvas.getContext("2d", { alpha: false });
const hud = $("#hud");
const menu = $("#menu");
const pauseOverlay = $("#pauseOverlay");
const resultOverlay = $("#resultOverlay");
const gameoverOverlay = $("#gameoverOverlay");
const toastEl = $("#toast");
const bannerEl = $("#levelBanner");
const tiltBadge = $("#tiltBadge");
const heartsEl = $("#hearts");
const fishCountEl = $("#fishCount");
const fishTotalEl = $("#fishTotal");
const progressFill = $("#progressFill");
const progressPaw = $("#progressPaw");
const levelKicker = $("#levelKicker");
const levelNameEl = $("#levelName");
const pauseFish = $("#pauseFish");
const pauseTime = $("#pauseTime");
const pauseLives = $("#pauseLives");
const resultKicker = $("#resultKicker");
const resultTitle = $("#resultTitle");
const resultCopy = $("#resultCopy");
const resultFish = $("#resultFish");
const resultTime = $("#resultTime");
const resultBest = $("#resultBest");
const starRow = $("#starRow");
const nextBtn = $("#nextBtn");
const replayBtn = $("#replayBtn");
const menuBtn = $("#menuBtn");
const bestTimeMeta = $("#bestTimeMeta");
const muteBtn = $("#muteBtn");
const soundBtnMenu = $("#soundBtnMenu");
const pauseTiltBtn = $("#pauseTiltBtn");
const tiltBtnMenu = $("#tiltBtnMenu");

const SAVE_KEY = "skybound-tails-v1";
const MAX_HEARTS = 5;

const defaultSave = {
  cat: "mochi",
  muted: false,
  best: {},
  fish: {}
};

function loadSave() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SAVE_KEY) || "{}");
    return {
      ...defaultSave,
      ...parsed,
      best: parsed.best || {},
      fish: parsed.fish || {}
    };
  } catch {
    return { ...defaultSave, best: {}, fish: {} };
  }
}

let save = loadSave();
if (!CATS[save.cat]) save.cat = "mochi";

function persist() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch {
    /* storage can be unavailable in private contexts */
  }
}

const view = {
  w: 1280,
  h: 720,
  cssW: 1280,
  cssH: 720,
  scale: 1,
  dpr: 1
};

let state = "menu";
let levelIndex = 0;
let level = LEVELS[0];
let selectedCat = save.cat;
let player = null;
let platforms = [];
let fish = [];
let thorns = [];
let checkpoints = [];
let goal = null;
let particles = [];
let camera = { x: 0, y: 0, shake: 0 };
let elapsed = 0;
let fishCount = 0;
let hearts = MAX_HEARTS;
let checkpointIndex = -1;
let invuln = 0;
let jumpBuffer = 0;
let flash = 0;
let time = 0;
let lastFrame = performance.now();
let toastTimer = 0;
let bannerTimer = 0;
let menuPortraitCtx = null;
let tiltEnabled = false;
let tiltAxis = 0;
let tiltZero = null;
let tiltSeen = false;
let tiltTimer = 0;
let menuLeaving = false;
let transitionTimer = 0;

const input = {
  left: false,
  right: false,
  jump: false,
  pointerLeft: 0,
  pointerRight: 0,
  pointerJump: 0
};

const sound = new Sound();
sound.muted = save.muted;

function resize() {
  const cssW = window.innerWidth;
  const cssH = window.innerHeight;
  const portrait = cssW / cssH < 0.82;
  const zoom = portrait ? 0.9 : 1;
  view.cssW = cssW;
  view.cssH = cssH;
  view.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  view.scale = (cssH / 720) * zoom;
  view.w = cssW / view.scale;
  view.h = cssH / view.scale;
  canvas.width = Math.max(1, Math.round(cssW * view.dpr));
  canvas.height = Math.max(1, Math.round(cssH * view.dpr));
  canvas.style.width = `${cssW}px`;
  canvas.style.height = `${cssH}px`;
  ctx.imageSmoothingEnabled = true;
  if (player) clampCamera(true);
}

function setState(next) {
  state = next;
  document.body.dataset.state = next;
  if (tiltBadge) tiltBadge.classList.toggle("is-hidden", !(tiltEnabled && next === "playing"));
  if (hud) hud.classList.toggle("is-hidden", next === "menu");
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "—:—";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function buildHearts() {
  heartsEl.innerHTML = Array.from({ length: MAX_HEARTS }, () => `
    <span class="heart">
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M16 28.1S4.6 20.8 4.6 12.8a6.5 6.5 0 0 1 11.4-4.3 6.5 6.5 0 0 1 11.4 4.3c0 8-11.4 15.3-11.4 15.3Z"/>
      </svg>
    </span>`).join("");
  updateHearts();
}

function updateHearts(lostIndex = -1) {
  const nodes = $$(".heart", heartsEl);
  nodes.forEach((node, index) => {
    node.classList.toggle("is-empty", index >= hearts);
    if (index === lostIndex) {
      node.classList.remove("is-hit");
      void node.offsetWidth;
      node.classList.add("is-hit");
    }
  });
}

function updateFishHud() {
  fishCountEl.textContent = String(fishCount);
  fishTotalEl.textContent = `/ ${fish.length || 12}`;
}

function updateProgress() {
  if (!player || !goal) return;
  const start = level.start.x;
  const total = Math.max(1, goal.x - start);
  const pct = clamp((player.x - start) / total, 0, 1);
  progressFill.style.width = `${(pct * 100).toFixed(2)}%`;
  progressPaw.style.left = `${(pct * 100).toFixed(2)}%`;
}

function toast(message, duration = 2200) {
  clearTimeout(toastTimer);
  toastEl.textContent = message;
  toastEl.classList.add("is-visible");
  toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), duration);
}

function showBanner(levelData) {
  clearTimeout(bannerTimer);
  $("#bannerKicker").textContent = `LEVEL ${levelIndex + 1}`;
  $("#bannerName").textContent = levelData.name;
  $("#bannerHint").textContent = levelData.hint;
  bannerEl.classList.remove("is-visible");
  void bannerEl.offsetWidth;
  bannerEl.classList.add("is-visible");
  bannerTimer = setTimeout(() => bannerEl.classList.remove("is-visible"), 3400);
}

function updateMenuMeta() {
  let total = 0;
  let any = false;
  for (const lvl of LEVELS) {
    if (Number.isFinite(save.best[lvl.id])) {
      total += save.best[lvl.id];
      any = true;
    }
  }
  bestTimeMeta.textContent = any ? `Best ${formatTime(total)}` : "Best —:—";
}

function updateSoundUi() {
  document.body.classList.toggle("is-muted", save.muted);
  muteBtn.setAttribute("aria-label", save.muted ? "Unmute sound" : "Mute sound");
  soundBtnMenu.setAttribute("aria-pressed", String(!save.muted));
  muteBtn.setAttribute("aria-pressed", String(!save.muted));
  sound.setMuted(save.muted);
}

function toggleSound() {
  save.muted = !save.muted;
  persist();
  updateSoundUi();
  if (!save.muted) {
    sound.init();
    sound.ui();
  }
}

function updateTiltUi() {
  tiltBtnMenu.setAttribute("aria-pressed", String(tiltEnabled));
  pauseTiltBtn.setAttribute("aria-pressed", String(tiltEnabled));
  tiltBadge.classList.toggle("is-hidden", !(tiltEnabled && state === "playing"));
}

function startLevel(index, opts = {}) {
  levelIndex = clamp(Number(index) || 0, 0, LEVELS.length - 1);
  level = LEVELS[levelIndex];
  platforms = level.platforms.map((p) => ({
    ...p,
    baseX: p.x,
    baseY: p.y,
    prevX: p.x,
    prevY: p.y,
    phase: p.motion?.phase || 0
  }));
  fish = level.fish.map(([x, y], i) => ({ x, y, phase: i * 1.37, taken: false }));
  thorns = level.thorns.map((t) => ({ ...t }));
  checkpoints = level.checkpoints.map((cp) => ({ ...cp, active: false }));
  goal = { ...level.goal };
  particles = [];
  elapsed = 0;
  fishCount = 0;
  hearts = MAX_HEARTS;
  checkpointIndex = -1;
  invuln = 1.3;
  flash = 0;
  camera.shake = 0;
  jumpBuffer = 0;
  player = {
    x: level.start.x,
    y: level.start.y - 29,
    w: 42,
    h: 58,
    vx: 0,
    vy: 0,
    facing: 1,
    onGround: false,
    platform: null,
    coyote: 0.1,
    airJumps: 1,
    anim: 0,
    blink: 2.4,
    jumpCut: false,
    minJump: 0
  };
  camera.x = clamp(player.x - view.w * 0.35, 0, Math.max(0, level.width - view.w));
  camera.y = 0;
  updateHearts();
  updateFishHud();
  updateProgress();
  levelKicker.textContent = `LEVEL ${levelIndex + 1}`;
  levelNameEl.textContent = level.name;
  fishTotalEl.textContent = `/ ${fish.length}`;
  pauseOverlay.classList.add("is-hidden");
  resultOverlay.classList.add("is-hidden");
  gameoverOverlay.classList.add("is-hidden");
  setState("playing");
  if (!opts.silent) showBanner(level);
  if (!opts.silent) sound.startMusic();
  lastFrame = performance.now();
}

function spawnAt(x, topY) {
  player.x = x;
  player.y = topY - player.h / 2;
  player.vx = 0;
  player.vy = 0;
  player.onGround = true;
  player.platform = null;
  player.coyote = 0.1;
  player.airJumps = 1;
  player.jumpCut = false;
  player.minJump = 0;
  invuln = 1.8;
  camera.x = clamp(player.x - view.w * 0.35, 0, Math.max(0, level.width - view.w));
}

function clampCamera(immediate = false) {
  if (!player) return;
  const max = Math.max(0, level.width - view.w);
  const target = clamp(player.x - view.w * 0.36 + player.vx * 0.1, 0, max);
  if (immediate) camera.x = target;
}

function addParticle(p) {
  particles.push({
    x: p.x,
    y: p.y,
    vx: p.vx || 0,
    vy: p.vy || 0,
    life: p.life || 0.8,
    max: p.life || 0.8,
    size: p.size || 3,
    color: p.color || "#ffe6a6",
    gravity: p.gravity ?? 420,
    drag: p.drag ?? 0.5,
    type: p.type || "dot",
    rot: p.rot || 0,
    spin: p.spin || 0
  });
}

function burst(x, y, colors, count = 12, power = 220, type = "dot") {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * TAU;
    const speed = power * (0.25 + Math.random() * 0.75);
    addParticle({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - power * 0.22,
      life: 0.45 + Math.random() * 0.65,
      size: 1.6 + Math.random() * 3.4,
      color: colors[Math.floor(Math.random() * colors.length)],
      gravity: type === "feather" ? 180 : 520,
      drag: 0.9,
      type,
      rot: Math.random() * TAU,
      spin: (Math.random() - 0.5) * 9
    });
  }
}

function spawnDust(x, y, amount = 8) {
  for (let i = 0; i < amount; i++) {
    addParticle({
      x: x + (Math.random() - 0.5) * 24,
      y: y - Math.random() * 6,
      vx: (Math.random() - 0.5) * 110,
      vy: -20 - Math.random() * 50,
      life: 0.32 + Math.random() * 0.34,
      size: 2 + Math.random() * 3.4,
      color: i % 2 ? "rgba(255,238,205,0.8)" : "rgba(194,155,131,0.65)",
      gravity: -20,
      drag: 0.4
    });
  }
}

function spawnSparkle(x, y, colors = ["#ffe39a", "#fff6cf", "#ffc06e"]) {
  burst(x, y, colors, 14, 160, "star");
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life -= dt;
    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }
    p.vy += p.gravity * dt;
    const drag = Math.pow(1 - clamp(p.drag, 0, 0.99), dt);
    p.vx *= drag;
    p.vy *= drag;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.rot += p.spin * dt;
  }
}

function handleOrientation(event) {
  let raw = null;
  const angle = (screen.orientation && screen.orientation.angle) || window.orientation || 0;
  if (Math.abs(angle) === 90) {
    raw = angle === 90 ? event.beta : -event.beta;
  } else {
    raw = (event.gamma || 0) * (angle === 180 ? -1 : 1);
  }
  if (!Number.isFinite(raw)) return;
  tiltSeen = true;
  if (tiltZero == null) tiltZero = raw;
  const delta = raw - tiltZero;
  let value = clamp(delta / 19, -1, 1);
  if (Math.abs(value) < 0.09) value = 0;
  tiltAxis = value;
}

async function toggleTilt() {
  if (tiltEnabled) {
    tiltEnabled = false;
    tiltAxis = 0;
    window.removeEventListener("deviceorientation", handleOrientation, true);
    updateTiltUi();
    toast("Tilt steering off. Touch controls are always ready.", 2000);
    return;
  }

  if (!("DeviceOrientationEvent" in window)) {
    toast("Tilt is not available on this device. Touch controls still work.", 2600);
    return;
  }

  try {
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      const permission = await DeviceOrientationEvent.requestPermission();
      if (permission !== "granted") {
        toast("Motion access was not granted. You can still use the touch buttons.", 3000);
        return;
      }
    }
    window.addEventListener("deviceorientation", handleOrientation, true);
    tiltEnabled = true;
    tiltZero = null;
    tiltSeen = false;
    updateTiltUi();
    toast("Tilt steering on — hold your phone level.", 2600);
    clearTimeout(tiltTimer);
    tiltTimer = setTimeout(() => {
      if (tiltEnabled && !tiltSeen) {
        toast("No motion sensor detected. Touch controls still work.", 2800);
      }
    }, 1700);
  } catch {
    toast("Motion access is unavailable. Touch controls still work.", 2800);
  }
}

function pressJump() {
  input.jump = true;
  jumpBuffer = 0.15;
}

function releaseJump() {
  input.jump = false;
}

function jump(second) {
  const cat = CATS[selectedCat];
  if (second) {
    player.vy = -cat.jump * 0.86;
    player.airJumps -= 1;
    player.jumpCut = true;
    player.minJump = 0.1;
    sound.doubleJump();
    spawnSparkle(player.x, player.y + 10, ["#ffe9a8", "#ffb6cf", "#9fe6df"]);
  } else {
    player.vy = -cat.jump;
    player.jumpCut = true;
    player.minJump = 0.14;
    sound.jump();
    spawnDust(player.x, player.y + player.h / 2, 7);
  }
  player.onGround = false;
  player.platform = null;
  player.coyote = 0;
  player.anim = 0;
  jumpBuffer = 0;
}

function hurtPlayer(sourceX) {
  if (invuln > 0 || state !== "playing") return;
  hearts -= 1;
  updateHearts(hearts);
  invuln = 1.7;
  flash = 0.3;
  camera.shake = 0.35;
  sound.hurt();
  burst(player.x, player.y, ["#ff8c8f", "#ffd0a0", "#fff2d4"], 16, 250, "star");
  if (hearts <= 0) {
    gameOver();
    return;
  }
  const direction = player.x < sourceX ? -1 : 1;
  player.vx = direction * 270;
  player.vy = -390;
  player.onGround = false;
  player.platform = null;
  toast("Bramble! Shake it off, little cat.", 1700);
}

function loseLife() {
  hearts -= 1;
  updateHearts(hearts);
  sound.hurt();
  flash = 0.4;
  camera.shake = 0.55;
  if (hearts <= 0) {
    gameOver();
    return;
  }
  const cp = checkpointIndex >= 0 ? checkpoints[checkpointIndex] : null;
  spawnAt(cp ? cp.x : level.start.x, cp ? cp.y : level.start.y);
  toast(cp ? "The lantern brings you back." : "The flock catches you. Try again.", 2000);
}

function gameOver() {
  setState("gameover");
  sound.stopMusic();
  gameoverOverlay.classList.remove("is-hidden");
  player.vx = 0;
  player.vy = 0;
}

function update(dt) {
  elapsed += dt;
  invuln = Math.max(0, invuln - dt);
  flash = Math.max(0, flash - dt * 2.2);
  camera.shake = Math.max(0, camera.shake - dt * 1.7);

  player.blinkTimer -= dt;
  if (player.blinkTimer <= 0) {
    player.blinkPulse = 0.12;
    player.blinkTimer = 2.4 + Math.random() * 3.2;
  }
  player.blinkPulse = Math.max(0, player.blinkPulse - dt);
  player.anim += dt * (2.4 + Math.abs(player.vx) / 38);

  for (const p of platforms) {
    p.prevX = p.x;
    p.prevY = p.y;
    if (p.motion) {
      const offset = Math.sin(time * p.motion.speed + p.motion.phase) * p.motion.amp;
      if (p.motion.axis === "x") p.x = p.baseX + offset;
      else p.y = p.baseY + offset;
    }
  }

  if (player.platform) {
    player.x += player.platform.x - player.platform.prevX;
    player.y += player.platform.y - player.platform.prevY;
  }

  let axis = 0;
  if (input.left) axis -= 1;
  if (input.right) axis += 1;
  if (!input.left && !input.right && tiltEnabled) {
    if (Math.abs(tiltAxis) > 0.08) axis = tiltAxis;
  }

  const cat = CATS[selectedCat];
  const accel = player.onGround ? 2500 : 1750;
  if (axis !== 0) {
    player.vx += axis * accel * dt;
    player.vx = clamp(player.vx, -cat.speed, cat.speed);
    player.facing = axis > 0 ? 1 : -1;
  } else {
    const drag = Math.pow(player.onGround ? 0.0008 : 0.2, dt);
    player.vx *= drag;
    if (Math.abs(player.vx) < 4) player.vx = 0;
  }

  if (player.onGround) player.coyote = 0.1;
  else player.coyote = Math.max(0, player.coyote - dt);
  player.minJump = Math.max(0, player.minJump - dt);
  jumpBuffer = Math.max(0, jumpBuffer - dt);

  if (jumpBuffer > 0) {
    if (player.onGround || player.coyote > 0) {
      jump(false);
    } else if (player.airJumps > 0) {
      jump(true);
    }
  }

  player.vy += 1950 * dt;
  player.vy = Math.min(player.vy, 1250);
  if (!input.jump && player.vy < -220 && player.jumpCut && player.minJump <= 0) {
    player.vy *= 0.54;
    player.jumpCut = false;
  }

  const wasOnGround = player.onGround;
  const prevBottom = player.y + player.h / 2;
  player.x = clamp(player.x + player.vx * dt, 24, level.width - 24);
  player.y += player.vy * dt;

  let landed = null;
  const bottom = player.y + player.h / 2;
  if (player.vy >= 0) {
    for (const p of platforms) {
      const overlap = player.x + 14 > p.x && player.x - 14 < p.x + p.w;
      if (!overlap) continue;
      if (prevBottom <= p.y + 13 && bottom >= p.y) {
        if (!landed || p.y < landed.y) landed = p;
      }
    }
  }

  if (landed) {
    player.y = landed.y - player.h / 2;
    if (player.vy > 480) {
      spawnDust(player.x, landed.y, 10);
      sound.land();
      camera.shake = Math.max(camera.shake, 0.12);
    }
    player.vy = 0;
    player.onGround = true;
    player.platform = landed;
    player.coyote = 0.1;
    player.airJumps = 1;
    player.jumpCut = false;
  } else {
    player.onGround = false;
    player.platform = null;
  }

  for (const t of thorns) {
    if (invuln > 0) break;
    const feet = player.y + player.h / 2;
    if (player.x + 12 > t.x && player.x - 12 < t.x + t.w && feet > t.y - 30 && feet < t.y + 8) {
      hurtPlayer(t.x + t.w / 2);
      break;
    }
  }

  for (const f of fish) {
    if (f.taken) continue;
    const dx = player.x - f.x;
    const dy = player.y - f.y;
    if (dx * dx + dy * dy < 32 * 32) {
      f.taken = true;
      fishCount += 1;
      updateFishHud();
      save.fish[level.id] = Math.max(save.fish[level.id] || 0, fishCount);
      persist();
      sound.collect();
      spawnSparkle(f.x, f.y, ["#ffe9a8", "#fff6d4", "#ffb56e"]);
    }
  }

  for (const cp of checkpoints) {
    if (!cp.active && player.x >= cp.x) {
      cp.active = true;
      checkpointIndex = checkpoints.indexOf(cp);
      spawnSparkle(cp.x, cp.y - 60, ["#ffe6a3", "#fff5cd", "#ffb97a"]);
      sound.checkpoint();
      toast("Lantern lit — checkpoint saved.", 1900);
    }
  }

  updateProgress();

  if (player.x + player.w / 2 > goal.x && player.y > goal.y - 150) {
    completeLevel();
    return;
  }

  if (player.y > 930) {
    loseLife();
    return;
  }

  const maxCamera = Math.max(0, level.width - view.w);
  const target = clamp(player.x - view.w * 0.36 + player.vx * 0.1, 0, maxCamera);
  camera.x += (target - camera.x) * (1 - Math.pow(0.0015, dt));

  if (!wasOnGround && player.onGround && player.vy === 0) {
    // landing effects are handled above; this branch keeps state tidy
  }
}

function completeLevel() {
  if (state !== "playing") return;
  setState("complete");
  sound.stopMusic();
  sound.win();
  flash = 0.2;

  const previousBest = save.best[level.id];
  const isNewBest = !Number.isFinite(previousBest) || elapsed < previousBest;
  if (isNewBest) save.best[level.id] = elapsed;
  save.fish[level.id] = Math.max(save.fish[level.id] || 0, fishCount);
  persist();
  updateMenuMeta();

  const ratio = fish.length ? fishCount / fish.length : 1;
  const stars = ratio >= 1 ? 3 : ratio >= 0.66 ? 2 : 1;
  const isFinal = levelIndex >= LEVELS.length - 1;

  resultKicker.textContent = isFinal ? "Journey complete" : "Trail complete";
  resultTitle.textContent = isFinal ? "Home at last" : level.name;
  resultCopy.textContent = isFinal
    ? "Three trails, one very brave cat, and a whole flock of new friends."
    : stars === 3
      ? "Every fish. Every feather. A thoroughly purrfect climb."
      : stars === 2
        ? "A fine climb. A few fish got away, but the birds are impressed."
        : "You made it home. The fish can wait until next time.";
  resultFish.textContent = `${fishCount}/${fish.length}`;
  resultTime.textContent = formatTime(elapsed);
  resultBest.textContent = formatTime(save.best[level.id]);

  const starsEls = $$(".star", starRow);
  starsEls.forEach((star) => star.classList.remove("is-earned"));
  starsEls.forEach((star, i) => {
    if (i < stars) {
      setTimeout(() => star.classList.add("is-earned"), 220 + i * 180);
    }
  });

  nextBtn.classList.toggle("is-hidden", isFinal);
  nextBtn.querySelector("span").textContent = "Next trail";
  resultOverlay.classList.remove("is-hidden");

  burst(player.x, player.y - 24, ["#ffd27d", "#ff8f9d", "#7de3c5", "#9bb7ff", "#fff2c4"], 54, 420);
}

function pauseGame() {
  if (state !== "playing") return;
  setState("paused");
  sound.stopMusic();
  pauseFish.textContent = String(fishCount);
  pauseTime.textContent = formatTime(elapsed);
  pauseLives.textContent = String(hearts);
  pauseOverlay.classList.remove("is-hidden");
}

function resumeGame() {
  if (state !== "paused") return;
  pauseOverlay.classList.add("is-hidden");
  setState("playing");
  sound.startMusic();
  lastFrame = performance.now();
}

function restartLevel() {
  pauseOverlay.classList.add("is-hidden");
  resultOverlay.classList.add("is-hidden");
  gameoverOverlay.classList.add("is-hidden");
  startLevel(levelIndex, { silent: false });
}

function showMenu() {
  clearTimeout(transitionTimer);
  menuLeaving = false;
  pauseOverlay.classList.add("is-hidden");
  resultOverlay.classList.add("is-hidden");
  gameoverOverlay.classList.add("is-hidden");
  menu.classList.remove("is-hidden", "is-leaving");
  setState("menu");
  sound.stopMusic();
  updateMenuMeta();
  lastFrame = performance.now();
}

function startGame() {
  if (menuLeaving) return;
  sound.init();
  sound.setMuted(save.muted);
  sound.startMusic();
  menuLeaving = true;
  menu.classList.add("is-leaving");
  clearTimeout(transitionTimer);
  transitionTimer = setTimeout(() => {
    menu.classList.add("is-hidden");
    menuLeaving = false;
  }, 520);
  startLevel(0);
  if (window.innerWidth > 900) {
    setTimeout(() => {
      if (state === "playing") toast("Arrow keys or A / D to move · Space to jump", 2600);
    }, 1500);
  }
}

function drawDistantBirds(t) {
  const birds = [
    [0.78, 0.19, 0.85, 0.34],
    [0.87, 0.27, 0.6, 0.6],
    [0.7, 0.31, 0.52, 1.3],
    [0.14, 0.11, 0.58, 2.1]
  ];
  ctx.save();
  ctx.strokeStyle = "rgba(255, 236, 214, 0.24)";
  ctx.lineWidth = 1.3;
  ctx.lineCap = "round";
  for (const [x, y, s, phase] of birds) {
    const bx = view.w * x + Math.sin(t * 0.16 + phase) * 12;
    const by = view.h * y + Math.cos(t * 0.24 + phase) * 5;
    const size = 9 * s;
    const flap = Math.sin(t * 1.4 + phase) * 0.3;
    ctx.beginPath();
    ctx.moveTo(bx - size, by);
    ctx.quadraticCurveTo(bx - size * 0.5, by - size * (0.5 + flap), bx, by);
    ctx.quadraticCurveTo(bx + size * 0.5, by - size * (0.5 + flap), bx + size, by);
    ctx.stroke();
  }
  ctx.restore();
}

function drawMenuScene() {
  const menuLevel = LEVELS[0];
  const camX = 28 + Math.sin(time * 0.035) * 18;
  drawBackground(ctx, view, menuLevel, camX, time);
  drawDistantBirds(time);

  const mobile = view.w < 720;
  const birdW = mobile ? 112 : clamp(view.w * 0.205, 188, 285);
  const birdX = mobile ? view.w * 0.69 - birdW / 2 : view.w * 0.665 - birdW / 2;
  const birdY = mobile ? view.h * 0.108 + Math.sin(time * 1.15) * 5 : view.h * 0.585 + Math.sin(time * 1.15) * 7;
  const catScale = mobile ? 0.82 : clamp(view.w * 0.00155, 1.2, 1.85);

  drawBird(ctx, { x: birdX, y: birdY, w: birdW, skin: 0, motion: { phase: 0.5 } }, menuLevel, time);
  drawCat(ctx, birdX + birdW / 2, birdY, catScale, CATS[selectedCat], "idle", time, {
    phase: 1.4,
    dir: 1,
    blink: Math.sin(time * 0.7) > 0.985
  });

  drawFish(ctx, birdX + birdW * 1.24, birdY - 30, time, mobile ? 0.7 : 0.95, 2);
  drawFish(ctx, birdX + birdW * 1.48, birdY - 72, time, mobile ? 0.5 : 0.68, 4.1);

  updateMenuPortraits(time);
}

const portraitCanvases = $$("[data-portrait]").map((canvasEl) => ({
  el: canvasEl,
  cat: CATS[canvasEl.dataset.portrait]
}));

function updateMenuPortraits(t) {
  if (state !== "menu") return;
  for (const entry of portraitCanvases) {
    if (entry.cat) drawPortrait(entry.el, entry.cat, t);
  }
}

function drawGameScene() {
  const shakeX = camera.shake > 0 ? Math.sin(time * 73) * camera.shake * 22 : 0;
  const shakeY = camera.shake > 0 ? Math.cos(time * 61) * camera.shake * 15 : 0;
  drawBackground(ctx, view, level, camera.x, time);
  drawDistantBirds(time);

  ctx.save();
  ctx.translate(-camera.x + shakeX, -camera.y + shakeY);

  if (goal) drawGoal(ctx, goal, level, time);
  for (const cp of checkpoints) {
    if (cp.x > camera.x - 160 && cp.x < camera.x + view.w + 160) {
      drawCheckpoint(ctx, cp, level, cp.active, time);
    }
  }

  const visiblePlatforms = platforms
    .filter((p) => p.x + p.w > camera.x - 260 && p.x < camera.x + view.w + 260)
    .sort((a, b) => a.y - b.y);

  for (const p of visiblePlatforms) {
    if (p.type === "bird") drawBird(ctx, p, level, time);
    else drawIsland(ctx, p, level, time);
  }

  for (const t of thorns) {
    if (t.x + t.w > camera.x - 80 && t.x < camera.x + view.w + 80) drawThorn(ctx, t, level, time);
  }

  for (const f of fish) {
    if (!f.taken && f.x > camera.x - 80 && f.x < camera.x + view.w + 80) {
      drawFish(ctx, f.x, f.y, time, 1, f.phase);
    }
  }

  if (player) {
    const feet = player.y + player.h / 2;
    let pose = "idle";
    if (!player.onGround) pose = player.vy < -30 ? "jump" : "fall";
    else if (Math.abs(player.vx) > 22) pose = "run";
    ctx.save();
    if (invuln > 0 && Math.floor(time * 15) % 2 === 0) ctx.globalAlpha = 0.35;
    drawCat(ctx, player.x, feet, 0.93, CATS[selectedCat], pose, time, {
      dir: player.facing,
      phase: player.anim,
      blink: player.blinkPulse > 0
    });
    ctx.restore();
  }

  drawParticles(ctx, particles);
  ctx.restore();

  if (flash > 0) {
    ctx.fillStyle = `rgba(255, 235, 206, ${clamp(flash, 0, 0.55)})`;
    ctx.fillRect(0, 0, view.w, view.h);
  }

  const bottomShade = ctx.createLinearGradient(0, view.h - 110, 0, view.h);
  bottomShade.addColorStop(0, "rgba(10, 7, 24, 0)");
  bottomShade.addColorStop(1, "rgba(10, 7, 24, 0.24)");
  ctx.fillStyle = bottomShade;
  ctx.fillRect(0, view.h - 110, view.w, 110);
}

function render() {
  ctx.setTransform(view.dpr * view.scale, 0, 0, view.dpr * view.scale, 0, 0);
  ctx.clearRect(0, 0, view.w, view.h);
  if (state === "menu") drawMenuScene();
  else drawGameScene();
}

function bindHoldButton(button, action) {
  if (!button) return;
  const pointers = new Set();
  const setHeld = (held) => {
    button.classList.toggle("is-held", held);
    if (action === "jump") {
      if (held) pressJump();
      else releaseJump();
    } else {
      input[action] = held;
    }
  };

  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    sound.init();
    pointers.add(event.pointerId);
    try {
      button.setPointerCapture(event.pointerId);
    } catch {
      /* pointer capture can fail on older browsers */
    }
    setHeld(true);
  });

  const end = (event) => {
    pointers.delete(event.pointerId);
    if (pointers.size === 0) setHeld(false);
  };
  button.addEventListener("pointerup", end);
  button.addEventListener("pointercancel", end);
  button.addEventListener("lostpointercapture", end);
  button.addEventListener("contextmenu", (event) => event.preventDefault());
}

function bindInputs() {
  window.addEventListener("keydown", (event) => {
    if (event.code === "ArrowLeft" || event.code === "KeyA") {
      input.left = true;
      event.preventDefault();
    }
    if (event.code === "ArrowRight" || event.code === "KeyD") {
      input.right = true;
      event.preventDefault();
    }
    if (event.code === "Space" || event.code === "ArrowUp" || event.code === "KeyW") {
      event.preventDefault();
      if (event.repeat) return;
      if (state === "menu") {
        startGame();
        return;
      }
      if (state === "playing") {
        pressJump();
        return;
      }
      if (state === "paused") {
        resumeGame();
        return;
      }
    }
    if ((event.code === "Escape" || event.code === "KeyP") && !event.repeat) {
      if (state === "playing") pauseGame();
      else if (state === "paused") resumeGame();
    }
    if (event.code === "Enter" && !event.repeat) {
      if (state === "menu") startGame();
      else if (state === "complete" && !nextBtn.classList.contains("is-hidden")) {
        startLevel(levelIndex + 1);
      } else if (state === "gameover") {
        restartLevel();
      }
    }
  });

  window.addEventListener("keyup", (event) => {
    if (event.code === "ArrowLeft" || event.code === "KeyA") input.left = false;
    if (event.code === "ArrowRight" || event.code === "KeyD") input.right = false;
    if (event.code === "Space" || event.code === "ArrowUp" || event.code === "KeyW") releaseJump();
  });

  window.addEventListener("blur", () => {
    input.left = false;
    input.right = false;
    releaseJump();
  });

  $$(".control-btn").forEach((button) => bindHoldButton(button, button.dataset.action));

  $("#playBtn").addEventListener("click", startGame);
  $$(".cat-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.dataset.cat;
      if (!CATS[id]) return;
      selectedCat = id;
      save.cat = id;
      persist();
      $$(".cat-card").forEach((c) => {
        const selected = c.dataset.cat === id;
        c.classList.toggle("is-selected", selected);
        c.setAttribute("aria-pressed", String(selected));
      });
      sound.init();
      sound.ui();
    });
  });

  $("#pauseBtn").addEventListener("click", pauseGame);
  $("#resumeBtn").addEventListener("click", resumeGame);
  $("#restartBtn").addEventListener("click", restartLevel);
  $("#quitBtn").addEventListener("click", showMenu);
  $("#replayBtn").addEventListener("click", restartLevel);
  $("#menuBtn").addEventListener("click", showMenu);
  $("#retryBtn").addEventListener("click", restartLevel);
  $("#gameoverMenuBtn").addEventListener("click", showMenu);
  nextBtn.addEventListener("click", () => {
    if (levelIndex < LEVELS.length - 1) startLevel(levelIndex + 1);
  });

  muteBtn.addEventListener("click", toggleSound);
  soundBtnMenu.addEventListener("click", toggleSound);
  tiltBtnMenu.addEventListener("click", toggleTilt);
  pauseTiltBtn.addEventListener("click", toggleTilt);

  window.addEventListener("resize", resize);
  window.addEventListener("orientationchange", () => {
    tiltZero = null;
    setTimeout(resize, 120);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && state === "playing") pauseGame();
  });
}

window.__skybound = {
  get state() {
    return state;
  },
  get levelIndex() {
    return levelIndex;
  },
  get player() {
    return player;
  },
  get hearts() {
    return hearts;
  },
  get fishCount() {
    return fishCount;
  },
  start: startGame,
  startLevel,
  pause: pauseGame,
  resume: resumeGame,
  win: completeLevel,
  collectAll() {
    fish.forEach((f) => { f.taken = true; });
    fishCount = fish.length;
    updateFishHud();
  },
  teleport(x, y) {
    if (!player) return;
    player.x = x;
    player.y = y;
    player.vx = 0;
    player.vy = 0;
  }
};

function frame(now) {
  const dt = clamp((now - lastFrame) / 1000, 0, 0.033);
  lastFrame = now;
  time += dt;

  if (state === "playing") {
    update(dt);
    updateParticles(dt);
  } else if (state === "complete") {
    updateParticles(dt);
  }

  render();
  requestAnimationFrame(frame);
}

function init() {
  resize();
  buildHearts();
  updateFishHud();
  updateSoundUi();
  updateTiltUi();
  updateMenuMeta();
  bindInputs();
  setState("menu");
  requestAnimationFrame(frame);
}

init();

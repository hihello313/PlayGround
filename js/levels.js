export const CATS = {
  mochi: {
    id: "mochi",
    name: "Mochi",
    role: "Balanced",
    blurb: "A calm head and a very fluffy tail.",
    speed: 308,
    jump: 664,
    fur: "#f1d3a6",
    furDark: "#c9975f",
    furLight: "#fff0d2",
    patch: "#fff7e6",
    stripe: "#d6a26a",
    scarf: "#ff6b76",
    scarfDark: "#c3445b",
    eye: "#3d302c",
    innerEar: "#f3a7a0",
    stripes: false
  },
  pepper: {
    id: "pepper",
    name: "Pepper",
    role: "Quickpaw",
    blurb: "Built for tight landings and quick exits.",
    speed: 350,
    jump: 628,
    fur: "#64647a",
    furDark: "#3d3c54",
    furLight: "#a6a6bf",
    patch: "#d9d9e9",
    stripe: "#4a4961",
    scarf: "#6ce5c8",
    scarfDark: "#2e9e91",
    eye: "#ffd965",
    innerEar: "#c58d9c",
    stripes: false
  },
  marmalade: {
    id: "marmalade",
    name: "Marmalade",
    role: "Highflier",
    blurb: "Gets a little more hang time. Uses it wisely.",
    speed: 286,
    jump: 708,
    fur: "#ec9b4e",
    furDark: "#c4692c",
    furLight: "#ffd19a",
    patch: "#ffe7c5",
    stripe: "#b95b25",
    scarf: "#74a9ff",
    scarfDark: "#3c6dcc",
    eye: "#35452e",
    innerEar: "#e89b91",
    stripes: true
  }
};

export const CAT_ORDER = ["mochi", "pepper", "marmalade"];

const birdSkinsMeadow = [
  { body: "#eec174", light: "#ffe6b4", dark: "#c98b51", wing: "#e5a660", wingDark: "#b97547", beak: "#ff8b5f", saddle: "#df6e76", saddleDark: "#9e3d53" },
  { body: "#dc9e9d", light: "#ffd8c8", dark: "#b36d79", wing: "#cd8490", wingDark: "#9a526b", beak: "#ffc06e", saddle: "#74bca1", saddleDark: "#3e876f" },
  { body: "#a9a2d8", light: "#ded9ff", dark: "#7971ad", wing: "#948bc9", wingDark: "#655b9d", beak: "#ffb76f", saddle: "#efc86f", saddleDark: "#b3873b" }
];

const birdSkinsCoast = [
  { body: "#f3aa7f", light: "#ffd8b0", dark: "#ca765d", wing: "#e28b76", wingDark: "#a7565d", beak: "#ffd06d", saddle: "#5fc7bc", saddleDark: "#2c8b8a" },
  { body: "#81cbb5", light: "#c8f5dd", dark: "#4e998d", wing: "#64b4a6", wingDark: "#347d7d", beak: "#ffbd67", saddle: "#f08e81", saddleDark: "#b14f59" },
  { body: "#e8cf83", light: "#fff2b9", dark: "#bca65e", wing: "#d5b76b", wingDark: "#9a8049", beak: "#ff9868", saddle: "#7f9ee2", saddleDark: "#4d65ad" }
];

const birdSkinsMoon = [
  { body: "#8e9bdb", light: "#ccd6ff", dark: "#5d639c", wing: "#7584c8", wingDark: "#4a508e", beak: "#ffc783", saddle: "#dc85a8", saddleDark: "#954b75" },
  { body: "#79c6c7", light: "#c4f4ec", dark: "#468b98", wing: "#61aab4", wingDark: "#356f86", beak: "#ffd07d", saddle: "#c09aec", saddleDark: "#7652ac" },
  { body: "#c58bbd", light: "#f4c9ec", dark: "#8d568e", wing: "#ae73a8", wingDark: "#754377", beak: "#ffc98b", saddle: "#82b8df", saddleDark: "#4779a6" }
];

export const LEVELS = [
  {
    id: "meadow",
    name: "Meadow Drift",
    hint: "Ride the birds. Chase the fish.",
    width: 4700,
    seed: 17,
    start: { x: 130, y: 560 },
    goal: { x: 4480, y: 555 },
    palette: {
      sky: ["#282a61", "#6e5a94", "#e28e86", "#ffd5a0"],
      sun: "#ffe9bd",
      sunGlow: "rgba(255, 195, 135, 0.55)",
      sunX: 0.76,
      sunY: 0.25,
      stars: 0.3,
      cloud: "rgba(255, 232, 213, 0.19)",
      cloudShade: "rgba(210, 151, 158, 0.13)",
      mountainFar: "#8a76a3",
      mountainMid: "#615b83",
      mountainNear: "#3d4864",
      haze: "rgba(255, 191, 158, 0.2)",
      grass: "#75b87c",
      grassDark: "#4a8962",
      grassLight: "#9ed189",
      rock: "#77544d",
      rockDark: "#503943",
      rockLight: "#a16d5d",
      accent: "#ffb36b",
      firefly: "#ffe7a4",
      water: null,
      aurora: false
    },
    birdSkins: birdSkinsMeadow,
    platforms: [
      { type: "island", x: 0, y: 560, w: 830, seed: 1 },
      { type: "bird", x: 250, y: 490, w: 170, skin: 2, motion: { axis: "y", amp: 7, speed: 0.85, phase: 1.7 } },
      { type: "bird", x: 855, y: 515, w: 205, skin: 0, motion: { axis: "x", amp: 28, speed: 0.68, phase: 0.4 } },
      { type: "bird", x: 1120, y: 470, w: 180, skin: 1, motion: { axis: "y", amp: 17, speed: 1.1, phase: 1.2 } },
      { type: "island", x: 1345, y: 530, w: 320, seed: 2 },
      { type: "bird", x: 1715, y: 490, w: 205, skin: 2, motion: { axis: "x", amp: 40, speed: 0.56, phase: 2.1 } },
      { type: "bird", x: 1980, y: 440, w: 185, skin: 0, motion: { axis: "y", amp: 22, speed: 0.92, phase: 0.8 } },
      { type: "island", x: 2215, y: 545, w: 350, seed: 3 },
      { type: "bird", x: 2620, y: 500, w: 210, skin: 1, motion: { axis: "x", amp: 44, speed: 0.62, phase: 3.1 } },
      { type: "bird", x: 2890, y: 450, w: 180, skin: 2, motion: { axis: "y", amp: 20, speed: 1.05, phase: 2.2 } },
      { type: "island", x: 3120, y: 525, w: 310, seed: 4 },
      { type: "bird", x: 3485, y: 480, w: 200, skin: 0, motion: { axis: "x", amp: 34, speed: 0.72, phase: 1.4 } },
      { type: "bird", x: 3740, y: 430, w: 185, skin: 1, motion: { axis: "y", amp: 24, speed: 0.98, phase: 0.3 } },
      { type: "island", x: 3975, y: 555, w: 725, seed: 5 }
    ],
    fish: [
      [420, 500], [330, 444], [985, 452], [1240, 402], [1515, 470],
      [1840, 438], [2080, 386], [2390, 482], [2760, 442], [3020, 392],
      [3305, 466], [3640, 424]
    ],
    thorns: [
      { x: 2460, y: 545, w: 64 },
      { x: 3380, y: 525, w: 52 }
    ],
    checkpoints: [
      { x: 1450, y: 530 },
      { x: 3220, y: 525 }
    ]
  },
  {
    id: "coast",
    name: "Coral Coast",
    hint: "The wind is warmer out here.",
    width: 5300,
    seed: 41,
    start: { x: 130, y: 565 },
    goal: { x: 5100, y: 552 },
    palette: {
      sky: ["#193554", "#2e737f", "#e3897a", "#ffd39b"],
      sun: "#ffdda2",
      sunGlow: "rgba(255, 174, 115, 0.6)",
      sunX: 0.24,
      sunY: 0.27,
      stars: 0,
      cloud: "rgba(255, 226, 203, 0.18)",
      cloudShade: "rgba(194, 129, 137, 0.12)",
      mountainFar: "#4e8291",
      mountainMid: "#356672",
      mountainNear: "#274b5d",
      haze: "rgba(255, 173, 133, 0.24)",
      grass: "#78cfa0",
      grassDark: "#3f9879",
      grassLight: "#b7edbd",
      rock: "#6b514e",
      rockDark: "#443b45",
      rockLight: "#98705c",
      accent: "#ffb36b",
      firefly: "#ffe4a0",
      water: true,
      aurora: false
    },
    birdSkins: birdSkinsCoast,
    platforms: [
      { type: "island", x: 0, y: 565, w: 650, seed: 11 },
      { type: "bird", x: 255, y: 500, w: 160, skin: 1, motion: { axis: "y", amp: 6, speed: 0.9, phase: 1.9 } },
      { type: "bird", x: 690, y: 520, w: 195, skin: 0, motion: { axis: "x", amp: 38, speed: 0.7, phase: 0.2 } },
      { type: "bird", x: 960, y: 468, w: 175, skin: 1, motion: { axis: "y", amp: 20, speed: 1.0, phase: 1.4 } },
      { type: "island", x: 1200, y: 540, w: 250, seed: 12 },
      { type: "bird", x: 1500, y: 498, w: 190, skin: 2, motion: { axis: "x", amp: 52, speed: 0.58, phase: 2.2 } },
      { type: "bird", x: 1765, y: 452, w: 175, skin: 0, motion: { axis: "y", amp: 22, speed: 0.9, phase: 0.7 } },
      { type: "island", x: 2005, y: 525, w: 300, seed: 13 },
      { type: "bird", x: 2360, y: 480, w: 200, skin: 1, motion: { axis: "y", amp: 28, speed: 0.82, phase: 2.7 } },
      { type: "bird", x: 2625, y: 432, w: 180, skin: 2, motion: { axis: "x", amp: 40, speed: 0.66, phase: 1.1 } },
      { type: "island", x: 2870, y: 548, w: 260, seed: 14 },
      { type: "bird", x: 3190, y: 500, w: 195, skin: 0, motion: { axis: "x", amp: 58, speed: 0.62, phase: 3.0 } },
      { type: "bird", x: 3455, y: 450, w: 180, skin: 1, motion: { axis: "y", amp: 26, speed: 0.96, phase: 1.8 } },
      { type: "bird", x: 3715, y: 505, w: 175, skin: 2, motion: { axis: "x", amp: 30, speed: 0.76, phase: 0.5 } },
      { type: "island", x: 3955, y: 558, w: 330, seed: 15 },
      { type: "bird", x: 4340, y: 508, w: 200, skin: 0, motion: { axis: "y", amp: 22, speed: 0.86, phase: 2.4 } },
      { type: "island", x: 4590, y: 552, w: 710, seed: 16 }
    ],
    fish: [
      [350, 452], [760, 455], [1040, 404], [1300, 474], [1580, 434],
      [1830, 388], [2110, 460], [2440, 424], [2710, 376], [2960, 484],
      [3280, 436], [3550, 388]
    ],
    thorns: [
      { x: 2160, y: 525, w: 58 },
      { x: 4070, y: 558, w: 50 }
    ],
    checkpoints: [
      { x: 1320, y: 540 },
      { x: 2980, y: 548 },
      { x: 4075, y: 558 }
    ]
  },
  {
    id: "moon",
    name: "Moonlit Spires",
    hint: "The last trail home. Mind the wind.",
    width: 5600,
    seed: 73,
    start: { x: 125, y: 570 },
    goal: { x: 5380, y: 560 },
    palette: {
      sky: ["#0b1030", "#1b2854", "#4a3d79", "#c17d93"],
      sun: "#fff1c8",
      sunGlow: "rgba(194, 203, 255, 0.35)",
      sunX: 0.79,
      sunY: 0.18,
      stars: 1,
      cloud: "rgba(179, 191, 236, 0.14)",
      cloudShade: "rgba(92, 82, 139, 0.16)",
      mountainFar: "#383b71",
      mountainMid: "#282d5d",
      mountainNear: "#192144",
      haze: "rgba(133, 155, 213, 0.18)",
      grass: "#75b9b0",
      grassDark: "#397e82",
      grassLight: "#b0e4d5",
      rock: "#514b6e",
      rockDark: "#343149",
      rockLight: "#7a6e91",
      accent: "#d7a6ff",
      firefly: "#c8e6ff",
      water: false,
      aurora: true
    },
    birdSkins: birdSkinsMoon,
    platforms: [
      { type: "island", x: 0, y: 570, w: 560, seed: 21 },
      { type: "bird", x: 240, y: 500, w: 155, skin: 0, motion: { axis: "y", amp: 7, speed: 0.92, phase: 2.4 } },
      { type: "bird", x: 610, y: 520, w: 175, skin: 0, motion: { axis: "y", amp: 22, speed: 0.98, phase: 0.2 } },
      { type: "bird", x: 850, y: 455, w: 165, skin: 1, motion: { axis: "x", amp: 50, speed: 0.62, phase: 1.2 } },
      { type: "bird", x: 1080, y: 505, w: 165, skin: 2, motion: { axis: "y", amp: 28, speed: 1.05, phase: 2.5 } },
      { type: "island", x: 1310, y: 530, w: 220, seed: 22 },
      { type: "bird", x: 1595, y: 480, w: 180, skin: 0, motion: { axis: "x", amp: 70, speed: 0.55, phase: 0.9 } },
      { type: "bird", x: 1855, y: 420, w: 165, skin: 1, motion: { axis: "y", amp: 24, speed: 0.9, phase: 2.0 } },
      { type: "island", x: 2080, y: 500, w: 210, seed: 23 },
      { type: "bird", x: 2350, y: 455, w: 175, skin: 2, motion: { axis: "y", amp: 30, speed: 0.84, phase: 1.7 } },
      { type: "bird", x: 2580, y: 510, w: 165, skin: 0, motion: { axis: "x", amp: 62, speed: 0.6, phase: 3.2 } },
      { type: "bird", x: 2810, y: 460, w: 175, skin: 1, motion: { axis: "y", amp: 26, speed: 0.94, phase: 0.5 } },
      { type: "island", x: 3040, y: 540, w: 230, seed: 24 },
      { type: "bird", x: 3330, y: 490, w: 185, skin: 2, motion: { axis: "x", amp: 52, speed: 0.66, phase: 2.8 } },
      { type: "bird", x: 3585, y: 435, w: 165, skin: 0, motion: { axis: "y", amp: 24, speed: 0.92, phase: 1.3 } },
      { type: "bird", x: 3815, y: 495, w: 175, skin: 1, motion: { axis: "y", amp: 20, speed: 1.1, phase: 2.3 } },
      { type: "island", x: 4055, y: 525, w: 220, seed: 25 },
      { type: "bird", x: 4350, y: 475, w: 180, skin: 2, motion: { axis: "x", amp: 64, speed: 0.58, phase: 0.4 } },
      { type: "bird", x: 4605, y: 420, w: 170, skin: 0, motion: { axis: "y", amp: 26, speed: 0.86, phase: 1.9 } },
      { type: "island", x: 4835, y: 560, w: 765, seed: 26 }
    ],
    fish: [
      [325, 452], [660, 460], [900, 394], [1140, 444], [1400, 470],
      [1660, 418], [1920, 358], [2160, 438], [2430, 394], [2660, 448],
      [2890, 398], [3400, 428]
    ],
    thorns: [
      { x: 2200, y: 500, w: 55 },
      { x: 4140, y: 525, w: 50 }
    ],
    checkpoints: [
      { x: 1420, y: 530 },
      { x: 3160, y: 540 },
      { x: 4170, y: 525 }
    ]
  }
];

export function getLevel(index) {
  return LEVELS[clampIndex(index)];
}

function clampIndex(index) {
  return Math.max(0, Math.min(LEVELS.length - 1, Number(index) || 0));
}

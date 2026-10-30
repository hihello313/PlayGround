# Skybound Tails

A hand-drawn, mobile-first side-scrolling platformer about small cats and very large birds.

Leap across drifting flocks, collect lost fish, light lantern checkpoints, and find your way home across three handcrafted trails.

## Play

```bash
./start.sh
```

Then open the local URL printed by the server (the development setup uses port `3002`).

No build step or dependencies are required. The game is plain HTML, CSS, Canvas 2D, and ES modules.

## Controls

- **Move:** Arrow keys / `A` `D`, or the on-screen left and right buttons.
- **Jump:** `Space`, `W`, `ArrowUp`, or the on-screen jump button. Tap jump again in the air for a double jump.
- **Tilt steering:** Enable it from the menu or pause screen. On iOS, motion access is requested from that button press.
- **Pause:** `Escape` / `P`, the pause button, or switching away from the tab.

## Trails

1. **Meadow Drift** — a warm introduction to the flock.
2. **Coral Coast** — longer gaps and a warmer wind.
3. **Moonlit Spires** — the final climb home.

Each trail hides 12 fish. Best times and fish totals are saved in `localStorage` under `skybound-tails-v1`.

## Project layout

- `index.html` — game shell, HUD, menus, and overlays.
- `styles.css` — responsive visual system and touch controls.
- `js/main.js` — game loop, physics, input, camera, and UI.
- `js/levels.js` — cat stats and level layouts.
- `js/art.js` — parallax skies, mountains, stars, sea, and particles.
- `js/cat.js` — vector cat rendering and menu portraits.
- `js/world-sprites.js` — birds, islands, fish, thorns, checkpoints, and goal cabin.
- `js/audio.js` — procedural WebAudio music and sound effects.

## Verification

`capture.sh` runs the project's screenshot capture entrypoint. The game also exposes `window.__skybound` in development for quick state checks:

```js
window.__skybound.start();
window.__skybound.startLevel(1);
window.__skybound.collectAll();
window.__skybound.win();
```

---

<!-- omgithub:readme:start -->
## 🚀 Build, play, and remix with OMGithub

**Created using [OMGithub.com](https://omgithub.com).**

[![OMGithub](https://img.shields.io/badge/OMGithub-Open%20project-orange?style=for-the-badge)](https://omgithub.com/hihello313/PlayGround)
[![GitHub](https://img.shields.io/badge/GitHub-Source-181717?logo=github&style=for-the-badge)](https://github.com/hihello313/PlayGround)

- 🎮 [Open the project](https://omgithub.com/hihello313/PlayGround).
- ✨ [Remix this project](https://omgithub.com/?remix=hihello313%2FPlayGround).
- 💻 [Explore the source](https://github.com/hihello313/PlayGround).
- 🛠️ [Check build runs](https://github.com/hihello313/PlayGround/actions).
- 🐛 [Report an issue](https://github.com/hihello313/PlayGround/issues).
- 👤 [Explore the creator's projects](https://omgithub.com/hihello313).
- 🌍 [Create with OMGithub](https://omgithub.com).
<!-- omgithub:readme:end -->

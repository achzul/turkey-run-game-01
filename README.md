![Live rank](https://make.fun/badge/turkey-run-game-01/achzul/turkey-run-game-01/rank.svg)
![Live reward](https://make.fun/badge/turkey-run-game-01/achzul/turkey-run-game-01/reward.svg)
![make.fun bounty badge](https://make.fun/badge/turkey-run-game-01.svg)

Entry for the make.fun bounty: [Make the best turkey escape game](https://make.fun/bounty/turkey-run-game-01)

# Gobble Dash — A Turkey's Great Escape

Thanksgiving is coming — and YOU are the main course. You are a turkey
with one job: outrun the farmer, dodge the oven and the carving knives,
and reach the woods 1200 m away before you become dinner.

## How to play

- **SPACE / ↑ / click** — jump
- **↓ / S** — duck, and hide inside a haystack when the farmer closes in
- **R** — restart · **M** — mute

Run through three stages that get harder as you go: **The Farmyard**,
**The Barnyard**, and **The Kitchen**. Jump the fences and the glowing
oven, dodge the falling and swinging carving knives, grab corn for +50
points each, and slip into a haystack to make the farmer lose your trail.
Every obstacle dodged is +10, escaping at 1200 m is +500. You have 3
lives — get hit and the farmer lunges closer; let him reach you and it
is over.

## What is in this repo

- `game/` — the whole game as static files, playable offline in desktop
  Chrome. All art is drawn on canvas and all sounds are synthesized
  with WebAudio; nothing is loaded from the network.
  - `index.html` — page and canvas
  - `style.css` — page styling
  - `js/game.js` — states, physics, collisions, scoring, HUD, menus
  - `js/art.js` — all the original canvas art (turkey, farmer, farm, kitchen)
  - `js/entities.js` — obstacles, corn and the farmer chase
  - `js/audio.js` — synthesized sound effects
  - `js/input.js` — keyboard and mouse input
- `screenshots/` — four real renders of the game: title, mid-run, caught,
  escaped
- `main.ts` — the entry program: copies `game/` and `screenshots/` to
  `/output` and writes `dossier.json`
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged

## Play it locally

Serve `game/` with any static server and open `index.html`, for example:

```sh
cd game && python3 -m http.server 8123
```

Then open http://localhost:8123/index.html — no build step, no network.

Add `?scene=title`, `?scene=play`, `?scene=end` or `?scene=escaped`
to the URL to open a specific screen (handy for screenshots; `play`
runs a self-playing demo turkey).

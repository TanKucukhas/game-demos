# iso-village

A live **isometric village** rendered on a 2D canvas. You steer the hero around a
10×10 tile map; a goblin, a slime, two villagers and a cat wander on their own.
Characters walk **behind** buildings and trees (depth-sorted), stay out of the pond,
and never overlap.

Every sprite here — characters, walk cycles, terrain tiles, buildings, props — was
**AI-generated with [PixelLab](https://pixellab.ai) over MCP** and **composited with
Aseprite over MCP**. No sprite was hand-drawn. This README documents that pipeline
end to end so it can be reproduced.

## Run

```bash
python3 -m http.server 8000
# open http://localhost:8000/iso-village/
```

Any static server works (sprites load as plain `assets/**.png` — no bundler, no CDN).

- **↑ ← ↓ →** or **WASD** — move the hero (each key steps along one iso axis, so motion is diagonal on screen)
- **⏸ Pause** — freeze / resume the sim
- Everyone else roams autonomously

## How it was made

Three stages: **generate** the art (PixelLab MCP) → **composite** frames and sheets
(Aseprite MCP) → **drive** it (this engine). The whole pack cost **33 + 7 = 40
PixelLab trial generations**.

### 1. Generate the sprites — PixelLab MCP

All calls are async: the tool returns an id, you poll until `completed`, then download.
Downloads of tiles / map-objects / character rotations are **public URLs** (plain
`curl`, no auth); only the bundled `/download` zip needs the bearer token.

| Asset | Tool | Notes |
|---|---|---|
| Characters (hero, goblin, slime, villager) | `create_character` | `view: "high top-down"`, 4 directions, `single color black outline`. 1 gen each. |
| Cat | `create_character` | `body_type: "quadruped"`, `template: "cat"` → 8 directions. |
| Walk cycles (hero, goblin) | `animate_character` | `template_animation_id: "walk"` → 6 frames × 4 directions. **1 gen per direction** (a 4-dir walk = 4 gens). |
| Terrain tiles (grass, water, sand, cobblestone, dirt, stone-wall, snow) | `create_isometric_tile` | `tile_shape: "block"`, 48px. True 2:1 iso diamonds. |
| Buildings (house, tower, well, market-stall) | `create_map_object` | `view: "high top-down"`, transparent background. |
| Props (tree, rock, barrel, chest, campfire, fence, signpost, lamppost, flower-bush, hay-bale, crate) | `create_map_object` | same. `outline: "single color outline"` (map-objects don't take the `black` variant). |

**Gotchas learned the hard way**
- **Rate limit ≈ 3–4 concurrent jobs.** Fire generations in small waves or you get
  `rate limit exceeded`. Batch, poll, download, repeat.
- **Map objects auto-delete after 8 hours** — download them immediately.
- Character `view` options are `low top-down / high top-down / side / oblique`; there is
  no literal "isometric" for characters. **high top-down sprites sit convincingly on
  true-iso ground** — that mismatch is the standard iso-RPG look (think Diablo).

### 2. Composite — Aseprite MCP (`run_lua`)

PixelLab returns walk animations as **individual frame PNGs** (`east/0.png…5.png`).
Aseprite's Lua API turns those into usable game assets:

- **`walk.gif`** — load the 6 frames into a sprite, set per-frame duration, `saveAs` gif.
- **`walk_sheet.png`** — a 4-row × 6-column sheet (`row = direction`, `col = frame`),
  built by blitting each frame with `image:drawImage(frame, Point(col*fw, row*fh))`.
  The engine samples this sheet with a source-rect `drawImage` — one image, every frame.
- **A static diorama** (`scene.png`, in the source pack) was assembled the same way to
  prototype placement before writing the live engine.

The Aseprite binary is driven headless in CLI batch mode; the MCP wraps
`aseprite -b --script`.

### 3. Drive it — `src/engine.js`

Pure 2D canvas, no dependencies. The interesting parts:

**Isometric projection.** Tile `(r,c)` → screen
`sx = OX + (c − r)·24`, `sy = OY + (c + r)·12` (a 2:1 diamond grid). An object standing
on a tile is anchored **bottom-center** to that tile's top-face center
`(sx + 24, sy + 12)`.

**Depth sorting = correct occlusion.** Every frame, terrain is drawn back-to-front once
(pre-rendered to an offscreen canvas), then **objects and characters are merged into one
list and sorted by `r + c`** (painter's algorithm). A character with a larger depth than
the house draws after it → walks in front; smaller depth → hidden behind it. Characters
get a tiny `+0.003` bias so they render just ahead of the prop sharing their tile.

**Wander AI.** Each NPC, when idle, shuffles its four neighbours and steps onto the first
that is `walkable` (in-bounds, not water, not a building) and not targeted by another
character, then pauses a random beat. Simple, but it reads as purposeful village life.

**Player control.** The hero ignores the wander logic; held arrow/WASD keys map to the
four iso axes. Movement is **tile-by-tile** (one step animates to completion before the
next begins), so the walk-sheet animation always plays a clean cycle. Into a wall, the
hero just turns to face without moving.

**Animation.** hero & goblin cycle their 6-frame `walk_sheet` while moving. slime,
villager and cat have no walk sheet, so they swap their directional **idle** sprite and
add a 2px vertical bob — cheap, but enough to sell motion.

## Asset inventory

```
assets/
  terrain/     grass water sand cobblestone dirt-path stone-wall snow   (7 iso tiles)
  buildings/   house tower well market-stall                            (4)
  props/       tree rock barrel chest campfire fence signpost           (11)
               lamppost flower-bush hay-bale crate
  characters/
    hero/      idle_{s,e,n,w} + walk_sheet + walk.gif    (green knight, playable)
    goblin/    idle_{s,e,n,w} + walk_sheet + walk.gif    (enemy)
    slime/     idle_{s,e,n,w}
    villager/  idle_{s,e,n,w}
    cat/       idle_{s,e,n,w}
```

## Tools

- **PixelLab** — AI pixel-art generation (characters, animations, iso tiles, map objects), via MCP
- **Aseprite** — frame/sheet/gif compositing via a custom Lua-over-MCP server
- Vanilla HTML5 Canvas for the runtime — zero dependencies

# APPROVED REALITY — Preserved Engine & Systems

Everything below is carried over verbatim from the ALCOVE prototype
(`unpersoned/alkov-seviye4.html`). The scenario, world, and scene content will
be rebuilt for *Approved Reality*; these systems are the contract we keep.

Reference implementation: `unpersoned/alkov-seviye4.html` (single file, no deps)
Run: any static server (currently `python3 -m http.server 8485` in `unpersoned/`)

---

## 1 · Rendering — "level 4" pixel pipeline

Canvas 192×108, integer-pixel `fillRect` only, upscaled with
`image-rendering: pixelated`. CSS scanlines + vignette overlays on top.

**Material buffer.** The scene is not drawn as colors. `kurSahne()` writes two
per-pixel arrays: `mat` (material id) and `base` (base brightness level,
float 0–4). Helpers:
- `put(x,y,w,h,mat,level)` — fill a rect
- `tex(x,y,w,h,s,amt)` — texture = level variation on a `(i+j)%s` checker,
  never a separate color
- `shadow(x,y,w,h,amt)` — contact shadow; edges skip every other pixel so the
  shadow melts into the floor

**Tone ramps with hue shift.** Every material is a 5-step ramp
(`RAMP.WALL/FLOOR/METAL/SCREEN/PAPER/RED/WOOD/WAX/NIGHT/BLDG/GLASS`).
Shadow ends drift toward blue/purple, light ends toward warm. Lighting never
leaves the palette — light means climbing the ramp.

**Light map.** Per-pixel distance attenuation to each source is precomputed
once (`cAtt` candle, `sAtt` screen, `wAtt` window). Per frame only intensity
scalars change (candle flicker table + sine, screen glow sine). Materials have
a light response factor (`resp`): glass ≈ 0.15–0.35 so night sky doesn't light
up. Final level = `base + resp·Σ(source·intensity)`, quantized to the ramp
through a 2×2 Bayer threshold — bands dissolve into dither rings. Output goes
through one `putImageData`; overlays draw on top with plain canvas calls.

**Debug mode.** Mode 3 renders the light contribution alone on a gray ramp —
invaluable when tuning sources.

**Overlay details (manual, per object):**
- hand-placed anti-aliasing pixels on high-contrast curves (the eye's almond)
- material language: glass gets a hard 1px sparkle + window-reflection streak
  + color bleed onto the surface below; cloth stays low-contrast; metal gets a
  2-step bevel
- rim light: single light column on the actor's lit edge (head + cool torso)

## 2 · Animation — deterministic, 11 fps

Frame loop: `setTimeout(frame, 90)` — **not** rAF (rAF never fires in
background tabs; timers still throttle to 1 Hz there, which is acceptable).
No `Math.random` anywhere in the level-4 path; everything derives from the
frame counter `t`.

- **Flame:** 4 hand-drawn grid-string frames (lean L → tall → lean R →
  crouch), cycled `(t>>1)%4`; light pool intensity from an 8-entry table ×
  sine. Extinguish plays a 14-frame one-shot smoke; a red ember blinks after.
- **Breathing (seated):** 20-frame hold-heavy cycle — 14 frames still,
  brief 1px shoulder rise. Writing hand micro-moves on a 2-frame cycle.
- **Walk:** 4 poses (contact / pass / reverse contact / pass), pose advances
  every 3px of distance traveled (speed-independent stride), 1px bob on pass
  frames, arms counter-swing. Footstep SFX fire on contact frames.
- **Telescreen eye:** pupil is a *tracker* — 120 frames it follows the actor's
  x (mapped to ±3.5px around iris center), 60 frames it sweeps the room on a
  sine. Position eases (`pos += (target-pos)·0.2`) and renders subpixel: the
  fractional edge columns get mid-tone colors instead of moving a whole pixel.
  Blink every 137 frames (6-frame eyelid). Iris flashes red on a breach.
- **Rain:** two deterministic streak layers (different speed/tone, slight
  slant) clipped to the window; pyramid window lights blink on prime periods.
- **Storm flash:** when thunder/lightning SFX trigger, the window brightens
  for 3 frames with decaying alpha — audio and visual share the same frame.
- **Caught flash:** red vignette with a decaying 8-frame counter.

Prime-number scheduling (`t%443`, `t%977`, `t%137`, `t%180`) keeps overlapping
cycles from ever feeling memorized.

## 3 · Point & click adventure layer

- **Hotspots** (`SPOT`): rects with id + display name, small objects listed
  before large so they win overlap. The YOU hotspot re-anchors to the actor
  every frame (seated rect at the desk, else the standing sprite's bounds).
- **Hover:** pointer cursor, amber corner ticks (no box), `▸ NAME` in the
  strip.
- **Look interactions** (`LOOK` table): per id → sound (+ optional volume
  override) and an array of rotating lines — repeat clicks give new text,
  adventure style. Adding an object = one rect + one table row.
- **Walk-to-interact:** every hotspot has an approach point (`YAKLAS`,
  x + optional y). Clicking far away walks the actor there first
  (`bekleyen` interaction fires on arrival); desk targets end in sitting.
  Clicking yourself resolves instantly.
- **Movement:** 2D within the floor band (feet y 78–92), straight vector at
  2px/frame. Furniture clamp: in the desk zone (x<62) feet stay ≥84 so the
  actor never stands "on" furniture (no depth sorting needed).
- **Bare-floor click** = walk only; click point is where the feet land.
- **Strip UI:** bottom 12px — message/hover line left, persistent counter
  right (`BREACH n/3`). Messages are data, max ~37 chars.
- **Game state (`G`):** message, progress, candle on/off, breach count, flash
  timers. The one-scene loop (write 2+2=4 while unwatched; dark blocks
  writing; watched = breach; 3rd breach resets the page) shows the pattern:
  *the scene's animation state doubles as the rule set* — keep that principle.

**Bitmap font:** 3×5 glyphs in pipe-strings. Full A–Z incl. W and Q (added
late — check glyph coverage whenever new text appears), digits, punctuation,
Turkish diacritics (can be dropped for an English-only game).

## 4 · Audio

**Generation** — `unpersoned/tools/gen_ses.py` (ElevenLabs; key read from
`1984/.env`):
- TTS `eleven_multilingual_v2` — announcer voice Matilda (`XrExE9…`), cold
  and institutional; English VO confirmed working (`vo_stop`)
- SFX endpoint `/v1/sound-generation` with duration + prompt-influence
- Idempotent: existing files are skipped; `--force` regenerates; prefix args
  select subsets
- Prompt lesson: the word "footstep" produces a boomy impact — ask for
  "soft scuff… no impact, no thump" instead. Same for rain: request
  "heard from indoors through a closed window, no individual drops".

**Normalization** (ffmpeg loudnorm, originals kept in `audio/raw/`):
- SFX −18 LUFS · VO −16 · ambient beds −20…−24 · footsteps −23, TP −1.5/−2
- Very short clips undershoot single-pass loudnorm → second pass with
  measured `volume=XdB` + `alimiter`. Dense noise bursts (static crackle)
  hit the limiter ceiling — compensate in code volume instead.
- Footsteps additionally: `highpass=180`, 20/60 ms edge fades.

**Playback:**
- One-shots: cached `new Audio('audio/x.mp3?v=N')` (bump `?v=` after any
  file change — plain http.server sends no cache headers).
- Ambient bed: **WebAudio** `BufferSource` loops (`hum` 0.05, `amb_room`
  0.04, `amb_rain` 0.12) with `loopStart/loopEnd` trimmed 0.15s inside the
  file — mp3 encoder padding makes HTMLAudio loops gap; this is the fix.
- Scheduler: distant thunder `t%443===200`, sharp lightning `t%977===650`,
  both drive the window flash.
- Every interaction has a sound (look sounds live in the LOOK table;
  candle/diary/sit/stand/steps/caught are wired in code).

**Music** — Suno (browser flow, account tankucukhas):
- Create dialog → More Options → Lyrics: Instrumental; style prompt in the
  Styles box; **one generation job at a time** (extra Creates fail silently);
  daily credit cap ≈ 3 jobs.
- Download via CDN: `https://cdn1.suno.ai/<song-id>.mp3` (ids from
  `/song/<uuid>` links).
- 6 instrumental tracks in `unpersoned/audio/tema/`: iron-march a/b (soviet
  orchestral march), midnight-blue a/b (noir waltz), red-silence a/b (cold-war
  main title). Free-tier tracks are non-commercial.

## 5 · Environment gotchas (hard-won)

- **Background tabs:** rAF never fires; `setTimeout` clamps to 1 Hz (worse
  after 5 min). Game logic must tolerate it; testing needs the tab visible.
- `python3 -m http.server` sends no cache headers and no Range — fine for the
  prototype, but the 1984 project's `serve.py` (threading + Range +
  `no-store` + live reload) is the better base for real work.
- Screenshot coordinates from automation tools are display-scaled; trust
  element rects, not pixels.

## 6 · What gets rebuilt for Approved Reality

Story, world, scenes, characters, rules, and all in-game text (English).
The items above — render pipeline, animation discipline, adventure layer,
audio/music pipelines — are reused as-is or ported unchanged.

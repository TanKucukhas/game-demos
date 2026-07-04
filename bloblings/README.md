# bloblings

Procedurally generated toon critters in Three.js, rendered with an **SDF blend-shell**:
ordinary capsule/cone meshes merged into one draw call, whose vertices a vertex shader
snaps onto the smooth-min SDF surface of all shapes combined. Where shapes overlap, their
meshes converge onto the same blended skin — the seams simply cease to exist. No
raymarching, no skinning: cost is per-vertex, so it runs on phones.

## Run

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

(Any static server works. Three.js loads from the jsdelivr CDN via an import map.)

- **✨ new blobling** — generate a random critter from JSON
- Click a critter — see the ~15-line JSON that *is* the character
- Click the ground — everyone looks
- `?lineup=1&cam=0,1.6,7.5,0,0.8,0` — frozen inspection lineup / camera override

## How it works

**Rendering** (`src/shaders.js`, `src/geometry.js`, `src/character.js`)
- Each character is ≤24 *parts* (round cones: two endpoints + two radii + color + blend
  radius `k`), uploaded as uniform arrays. Template meshes are rigidly placed by per-part
  bone matrices, then Newton-projected onto the smooth-min iso-surface (3 steps of
  4-tap tetrahedron sampling: gradient + value per step).
- Normals come from the SDF gradient → lighting flows continuously across joints.
- Albedo blends per-vertex by SDF proximity → free soft gradients at every join.
- Outlines re-project onto the **+offset** SDF surface (back-face pass) instead of
  inflating along normals — no artifacts in concave joints.
- Buried geometry targets a slightly negative iso ("tucks under the skin"), thin parts
  (antennae) cap their `k` so they don't dissolve into the body.
- Eyes are crisp sticker meshes glued to the surface via a CPU copy of the SDF.

**Animation** (`src/locomotion.js`) — 100% procedural, zero clips
- Legged (2/4/6): reactive stepping — a foot lifts when it drifts past a threshold and
  its opposite gait group is grounded (one rule = biped walk / trot / tripod), 2-bone IK,
  body bob, acceleration lean, arm swing coupled to opposite foot.
- Hopper: idle → crouch (squash) → launch (stretch) → ballistic air → landing squash,
  applied as a root scale about the ground plane.
- Flyer: hover bob, banks into turns, lagged two-segment wing flap, dangling feet.
- Tails / ears / antennae: verlet ropes with shape-memory stiffness whose segments are
  SDF parts too — seamlessly fused while they flop.

**A character is its JSON** (`src/critters.js`): archetype + a handful of proportions +
one hue (palette derives from it). `randomSpec()` stands in for an LLM writing specs.

**Juice** (`src/world.js`): dust on footfalls and landings, confetti + chirp on spawn,
squash-pop spawn-in, blinks, breathing, blob shadows, WebAudio synth boops (🔊 to enable).

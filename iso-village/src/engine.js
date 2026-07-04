// Isometric village — a live scene rendered on a 2D canvas.
// Sprites are pixel-art generated with PixelLab and composited with Aseprite
// (see ../README.md). This engine only draws + moves them: an iso tilemap,
// depth-sorted rendering, a keyboard-driven hero, and autonomous wanderers.

// ---- iso projection constants -------------------------------------------------
const TW = 48, HX = 24, HY = 12;   // tile width; iso half-step (x,y)
const N  = 10;                     // grid is N×N
const OX = 330, OY = 140;          // screen origin (top-left of tile 0,0)
const CANVAS_W = 720, CANVAS_H = 470;
const DIRROW = { south: 0, east: 1, north: 2, west: 3 }; // rows in a walk_sheet

// ---- terrain map --------------------------------------------------------------
const ground = Array.from({ length: N }, () => Array(N).fill("grass"));
const put = (r, c, v) => { if (r >= 0 && r < N && c >= 0 && c < N) ground[r][c] = v; };
// farm plot (dirt) top-left
for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) put(r, c, "dirt-path");
// roads
for (const [r, c] of [[3,4],[6,4],[7,4],[6,5],[7,5],[3,5]]) put(r, c, "dirt-path");
// central plaza (cobblestone)
put(4,4,"cobblestone"); put(4,5,"cobblestone"); put(5,4,"cobblestone"); put(5,5,"cobblestone");
// pond + beach (bottom-right)
for (const [r,c] of [[8,8],[8,9],[9,8],[9,9],[9,7],[7,9]]) put(r,c,"water");
for (const [r,c] of [[7,8],[8,7],[9,6],[6,9]]) put(r,c,"sand");
// rocky mountain corner (top-right)
put(0,8,"stone-wall"); put(1,8,"stone-wall"); put(0,9,"snow"); put(1,9,"snow");

// ---- static objects (r, c, assetKey) -----------------------------------------
const statics = [
  // buildings
  [2,2,"obj/house"], [6,1,"obj/house"], [2,6,"obj/tower"],
  [4,4,"obj/well"],  [5,5,"obj/market-stall"],
  // trees
  [0,5,"obj/tree"], [1,6,"obj/tree"], [0,7,"obj/tree"], [8,2,"obj/tree"],
  [9,4,"obj/tree"], [3,8,"obj/tree"], [7,3,"obj/tree"],
  // rocks
  [9,0,"obj/rock"], [1,9,"obj/rock"],
  // farm fence (L around the dirt plot)
  [3,0,"obj/fence"], [3,1,"obj/fence"], [3,2,"obj/fence"],
  [0,3,"obj/fence"], [1,3,"obj/fence"], [2,3,"obj/fence"],
  // farm goods
  [0,0,"obj/hay-bale"], [1,1,"obj/hay-bale"],
  // village dressing
  [4,3,"obj/signpost"], [3,5,"obj/lamppost"], [6,4,"obj/lamppost"],
  [5,3,"obj/chest"], [5,6,"obj/barrel"], [6,6,"obj/campfire"],
  [6,5,"obj/crate"], [4,6,"obj/crate"],
  [1,7,"obj/flower-bush"], [7,7,"obj/flower-bush"],
  [8,6,"obj/flower-bush"], [6,8,"obj/flower-bush"],
];
const blocked = new Set(statics.map(([r, c]) => r + "," + c));
const isWater  = (r, c) => ground[r] && ground[r][c] === "water";
const walkable = (r, c) => r >= 0 && r < N && c >= 0 && c < N && !isWater(r, c) && !blocked.has(r + "," + c);

// ---- characters ---------------------------------------------------------------
// hero + goblin have a 4-dir × 6-frame walk_sheet; the rest animate by swapping
// their directional idle sprite (with a little bob) — still reads as "walking".
const chars = [
  { name: "hero",     r: 4, c: 2, sheet: "hero/sheet",   hasWalk: true, player: true },
  { name: "goblin",   r: 7, c: 5, sheet: "goblin/sheet", hasWalk: true },
  { name: "slime",    r: 6, c: 7, hasWalk: false },
  { name: "villager", r: 3, c: 4, hasWalk: false },
  { name: "villager", r: 6, c: 3, hasWalk: false },
  { name: "cat",      r: 5, c: 2, hasWalk: false },
];
for (const ch of chars) {
  ch.dir = "south"; ch.moving = false; ch.animT = Math.random() * 2;
  ch.pause = 0.3 + Math.random() * 1.4; ch.prog = 0;
  ch.sr = ch.r; ch.sc = ch.c; ch.tr = ch.r; ch.tc = ch.c;
}

// ---- asset manifest + loading -------------------------------------------------
const IMG = {};
const manifest = [];
for (const t of ["grass","water","sand","cobblestone","dirt-path","stone-wall","snow"])
  manifest.push(["ter/" + t, `assets/terrain/${t}.png`]);
const objFolder = { house:"buildings", tower:"buildings", well:"buildings", "market-stall":"buildings" };
for (const o of ["house","tower","well","market-stall","tree","rock","barrel","chest","campfire",
                 "fence","signpost","lamppost","flower-bush","hay-bale","crate"])
  manifest.push(["obj/" + o, `assets/${objFolder[o] || "props"}/${o}.png`]);
for (const name of ["hero","goblin","slime","villager","cat"])
  for (const d of ["south","east","north","west"])
    manifest.push([`${name}/idle_${d}`, `assets/characters/${name}/idle_${d}.png`]);
for (const name of ["hero","goblin"])
  manifest.push([`${name}/sheet`, `assets/characters/${name}/walk_sheet.png`]);

function loadAll() {
  return Promise.all(manifest.map(([key, path]) => new Promise((res) => {
    const im = new Image();
    im.onload = () => { IMG[key] = im; res(); };
    im.onerror = () => { console.warn("missing asset", path); res(); };
    im.src = path;
  })));
}

// ---- rendering ----------------------------------------------------------------
const cv = document.getElementById("cv");
const ctx = cv.getContext("2d");
ctx.imageSmoothingEnabled = false;
let bg = null;

const tileCenter = (r, c) => [OX + (c - r) * HX + TW / 2, OY + (c + r) * HY + HY];

function prerenderGround() {
  bg = document.createElement("canvas");
  bg.width = CANVAS_W; bg.height = CANVAS_H;
  const g = bg.getContext("2d"); g.imageSmoothingEnabled = false;
  for (let s = 0; s <= 2 * (N - 1); s++)         // back-to-front by (r+c)
    for (let r = 0; r < N; r++) {
      const c = s - r;
      if (c < 0 || c >= N) continue;
      const im = IMG["ter/" + ground[r][c]];
      if (im) g.drawImage(im, OX + (c - r) * HX, OY + (c + r) * HY);
    }
}

function drawStatic([r, c, k]) {
  const im = IMG[k]; if (!im) return;
  const [cx, cy] = tileCenter(r, c);
  ctx.drawImage(im, Math.round(cx - im.width / 2), Math.round(cy - im.height + 4));
}
function drawChar(ch) {
  const [cx, cy] = tileCenter(ch.r, ch.c);
  if (ch.hasWalk && ch.moving) {
    const sh = IMG[ch.sheet], fw = sh.width / 6, fh = sh.height / 4;
    const fr = Math.floor(ch.animT * 9) % 6, row = DIRROW[ch.dir];
    ctx.drawImage(sh, fr * fw, row * fh, fw, fh,
      Math.round(cx - fw / 2), Math.round(cy - fh + 4), fw, fh);
  } else {
    const im = IMG[ch.name + "/idle_" + ch.dir]; if (!im) return;
    const bob = (!ch.hasWalk && ch.moving) ? Math.abs(Math.sin(ch.animT * 11)) * 2 : 0;
    ctx.drawImage(im, Math.round(cx - im.width / 2), Math.round(cy - im.height + 4 - bob));
  }
}

function render() {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.drawImage(bg, 0, 0);
  const ents = [];
  for (const s of statics) ents.push({ d: s[0] + s[1], f: () => drawStatic(s) });
  for (const ch of chars)  ents.push({ d: ch.r + ch.c + 0.003, f: () => drawChar(ch) });
  ents.sort((a, b) => a.d - b.d);      // painter's algorithm = correct occlusion
  for (const e of ents) e.f();
}

// ---- input (isometric axis mapping) ------------------------------------------
const held = new Set();
const KEYDIR = {
  ArrowUp: "north", KeyW: "north", ArrowDown: "south", KeyS: "south",
  ArrowLeft: "west", KeyA: "west", ArrowRight: "east", KeyD: "east",
};
addEventListener("keydown", (e) => { if (KEYDIR[e.code]) { held.add(e.code); e.preventDefault(); } });
addEventListener("keyup",   (e) => { held.delete(e.code); });
const DIRDELTA = { north: [-1, 0], south: [1, 0], west: [0, -1], east: [0, 1] };

// ---- movement -----------------------------------------------------------------
const startStep = (ch, nr, nc, dir) => {
  ch.sr = ch.r; ch.sc = ch.c; ch.tr = nr; ch.tc = nc; ch.dir = dir; ch.prog = 0; ch.moving = true;
};
function occupiedByOther(self, r, c) {
  for (const o of chars) {
    if (o === self) continue;
    if (Math.round(o.r) === r && Math.round(o.c) === c) return true;
    if (o.moving && o.tr === r && o.tc === c) return true;
  }
  return false;
}
function pickTarget(ch) {                          // wander: random walkable neighbour
  const opts = [[1,0,"south"],[-1,0,"north"],[0,1,"east"],[0,-1,"west"]];
  for (let i = opts.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [opts[i], opts[j]] = [opts[j], opts[i]]; }
  for (const [dr, dc, dir] of opts) {
    const nr = ch.r + dr, nc = ch.c + dc;
    if (walkable(nr, nc) && !occupiedByOther(ch, nr, nc)) { startStep(ch, nr, nc, dir); return; }
  }
  ch.pause = 0.3 + Math.random() * 0.8;            // boxed in → wait
}
function playerControl(ch) {                        // hero: last held key wins
  let dir = null;
  for (const code of held) dir = KEYDIR[code];
  if (!dir) return;
  ch.dir = dir;                                     // face even if blocked
  const [dr, dc] = DIRDELTA[dir], nr = ch.r + dr, nc = ch.c + dc;
  if (walkable(nr, nc) && !occupiedByOther(ch, nr, nc)) startStep(ch, nr, nc, dir);
}
const TILE_TIME = 0.42, NPC_TILE_TIME = 0.78;
function update(ch, dt) {
  ch.animT += dt;
  const step = ch.player ? TILE_TIME : NPC_TILE_TIME;
  if (ch.moving) {
    ch.prog += dt / step;
    if (ch.prog >= 1) {
      ch.r = ch.tr; ch.c = ch.tc; ch.sr = ch.tr; ch.sc = ch.tc; ch.moving = false;
      ch.pause = ch.player ? 0 : 0.4 + Math.random() * 1.6;
    } else {
      ch.r = ch.sr + (ch.tr - ch.sr) * ch.prog;
      ch.c = ch.sc + (ch.tc - ch.sc) * ch.prog;
    }
  } else if (ch.player) playerControl(ch);
  else { ch.pause -= dt; if (ch.pause <= 0) pickTarget(ch); }
}

// ---- loop ---------------------------------------------------------------------
let paused = false, last = 0, fpsT = 0, fpsN = 0;
const fpsEl = document.getElementById("fps");
const pauseBtn = document.getElementById("pause");
pauseBtn.onclick = () => {
  paused = !paused;
  pauseBtn.textContent = paused ? "▶ Resume" : "⏸ Pause";
  if (!paused) { last = performance.now(); requestAnimationFrame(loop); }
};
function loop(now) {
  if (paused) return;
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  for (const ch of chars) update(ch, dt);
  render();
  fpsT += dt; fpsN++;
  if (fpsT >= 0.5) { fpsEl.textContent = Math.round(fpsN / fpsT); fpsT = 0; fpsN = 0; }
  requestAnimationFrame(loop);
}

loadAll().then(() => { prerenderGround(); last = performance.now(); requestAnimationFrame(loop); });

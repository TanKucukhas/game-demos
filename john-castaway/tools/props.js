// Island props & effect sprites — original ADA artwork.
// Small items are hand-drawn ASCII pixel maps; palm/rock are procedural.
import { Sprite, fromMap } from "./sprite.js";

// ---- hand-drawn maps ----------------------------------------------------
const MAPS = {
  coconut: `
cc
cc`,
  bottle: `
.u.
.u.
uuu
ulu
uuu
uKu`,
  boot: `
.dd.
.dd.
.dd.
ddddD
DDDDD`,
  chair: `
d.....d
d.....d
ddddddd
d.....d
d.dddd.
d.d..d.
d.d..d.`,
  crab_0: `
.x.xx.x.
..xxxx..
.xXxxXx.
X..XX..X`,
  crab_1: `
.x.xx.x.
..xxxx..
.xXxxXx.
.X.XX.X.`,
  seagull_0: `
u......u
.uu..uu.
..uuuu..
...uK...`,
  seagull_1: `
........
uu....uu
.uuuuuu.
...uK...`,
  fire_0: `
...y...
..yy...
..yyY..
.yYYy..
.YYZY..
.ZYZZ..
dDdDdD.`,
  fire_1: `
....y..
..y.y..
..yYy..
..YYYy.
.yYZYY.
.ZZYZ..
dDdDdD.`,
  fire_2: `
..y....
..yy...
.yYy...
.YYYy..
.YZYYy.
.ZYZZ..
dDdDdD.`,
  ship: `
.......u........
.......h.h......
....hhhh.h......
....hhhh.h......
HHHHHHHHHHHHHHHH
.HHHHHHHHHHHHHH.
..HHHHHHHHHHHH..`,
  wreck: `
...........dd
........ddddd
.....dddddddd
..ddddddddddd
dddddddddddDD
dDddDddDddDDD
DDDDDDDDDDDDD`,
  message_bubble: `
uuuuu
u...u
uuuuu
.u...
u....`,
  plank: `
..................dd
..............dddddd
..........dddddd..DD
......dddddd..DD....
..dddddd..DD........
dddd..DD............
DDDD................`,
  rope: `
.tttt.
tTttTt
tT..Tt
tTttTt
.tttt.
..tt..`,
  bucket: `
rRRRRr
.R..R.
.r..r.
.r..r.
.rrrr.
.RRRR.`,
};

// ---- raft stages (0..3) -------------------------------------------------
function raft(stage) {
  const s = new Sprite(26, 12);
  const logs = stage + 1; // 1..4 logs
  for (let i = 0; i < logs; i++) {
    const y = 10 - i * 3;
    s.rect(1, y, 24, 2, i % 2 ? "d" : "D");
    s.px(0, y, "D"); s.px(25, y + 1, "D");
  }
  if (stage >= 2) { s.vline(4, 10 - (logs - 1) * 3, logs * 3, "T"); s.vline(21, 10 - (logs - 1) * 3, logs * 3, "T"); }
  if (stage >= 3) { s.vline(12, 0, 4, "t"); s.rect(10, 0, 6, 2, "w"); }
  return s;
}

// ---- palm (two sway frames) ----------------------------------------------
function palm(sway) {
  const s = new Sprite(56, 64);
  const bx = 34, by = 62;
  // curved trunk, leaning left
  const seg = [[0, 0], [-3, -13], [-7, -26], [-12, -39], [-17, -50]];
  for (let i = 0; i < seg.length - 1; i++) {
    const t = i / (seg.length - 1);
    const sw = sway * t;
    const x1 = bx + seg[i][0] + sway * (i / 4), y1 = by + seg[i][1];
    const x2 = bx + seg[i + 1][0] + sway * ((i + 1) / 4), y2 = by + seg[i + 1][1];
    const steps = Math.max(Math.abs(y2 - y1), 1);
    for (let j = 0; j <= steps; j++) {
      const x = Math.round(x1 + ((x2 - x1) * j) / steps);
      const y = Math.round(y1 + ((y2 - y1) * j) / steps);
      const wgt = 3 - Math.round(t * 1.5);
      s.rect(x, y, wgt, 1, i < 2 ? "T" : "t");
      if (wgt > 1) s.px(x, y, "T");
    }
  }
  // ring marks
  for (let i = 0; i < 4; i++) s.px(bx - 1 - i * 3, by - 4 - i * 11, "T");
  // crown
  const tx = bx - 17 + sway, ty = by - 51;
  const fronds = [
    [-15, -4], [-11, -10], [-3, -13], [6, -10], [13, -3], [10, 5], [-7, 7],
  ];
  for (const [fx, fy] of fronds) {
    const steps = Math.max(Math.abs(fx), Math.abs(fy));
    for (let j = 0; j <= steps; j++) {
      const t = j / steps;
      // slight droop curve
      const x = Math.round(tx + fx * t);
      const y = Math.round(ty + fy * t * (1 - t * 0.25) + t * t * 3);
      s.px(x, y, t < 0.5 ? "g" : "L");
      if (j % 3 === 1) s.px(x, y + 1, "L");
      if (j % 4 === 2 && t > 0.3) s.px(x, y - 1, "l");
    }
  }
  // coconuts at crown
  s.rect(tx - 2, ty + 1, 2, 2, "c");
  s.rect(tx + 2, ty + 2, 2, 2, "c");
  return s;
}

// ---- basalt rock formation (two-tier) ------------------------------------
function rock() {
  const s = new Sprite(30, 26);
  s.rect(2, 8, 26, 16, "q");
  s.rect(4, 4, 18, 8, "R");
  s.rect(6, 0, 10, 6, "R");
  s.rect(7, 1, 6, 3, "r");
  s.rect(3, 20, 24, 2, "R");
  // cracks
  s.vline(12, 8, 8, "q"); s.px(13, 12, "q"); s.hline(16, 15, 5, "q");
  return s;
}

export function buildProps() {
  const out = [];
  for (const [name, map] of Object.entries(MAPS)) out.push({ name, spr: fromMap(map) });
  for (let i = 0; i < 4; i++) out.push({ name: `raft_${i}`, spr: raft(i) });
  out.push({ name: "palm_0", spr: palm(0) });
  out.push({ name: "palm_1", spr: palm(2) });
  out.push({ name: "rock", spr: rock() });
  return out;
}

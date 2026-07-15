// Kazım — the ADA castaway. Parameterized pixel-art pose renderer.
// Original character: orange bandana, scruffy beard, torn cream shirt,
// brown shorts, barefoot. Faces LEFT in all source frames (game flips for right).
// Frame: 32x48, ground line y=46, character center cx=15.
import { Sprite } from "./sprite.js";

const FW = 32, FH = 48, GROUND = 46, CX = 15;

// ---- body part painters -------------------------------------------------
function head(s, cx, hy, { blink = false, down = 0 } = {}) {
  hy += down;
  // bandana
  s.rect(cx - 4, hy, 8, 1, "o");
  s.rect(cx - 5, hy + 1, 10, 1, "o");
  s.px(cx + 3, hy, "O"); s.px(cx + 4, hy + 1, "O");
  // knot tail (back of head = right side)
  s.px(cx + 5, hy + 1, "O"); s.px(cx + 6, hy + 2, "O"); s.px(cx + 6, hy + 3, "o");
  // face
  s.rect(cx - 5, hy + 2, 10, 4, "s");
  s.rect(cx + 3, hy + 2, 2, 4, "S");
  // nose (sticks out front-left)
  s.px(cx - 6, hy + 4, "s");
  // eye
  if (blink) s.px(cx - 3, hy + 4, "S");
  else s.px(cx - 3, hy + 3, "K");
  // beard — scruffy, overhangs the jaw and chin
  s.rect(cx - 6, hy + 6, 11, 1, "b");
  s.rect(cx - 4, hy + 7, 8, 1, "b");
  s.rect(cx - 3, hy + 8, 5, 1, "B");
  s.px(cx + 3, hy + 6, "B"); s.px(cx + 2, hy + 7, "B");
}

function torso(s, cx, ty, { lean = 0 } = {}) {
  // shirt, torn hem
  s.rect(cx - 5 + lean, ty, 10, 8, "w");
  s.rect(cx + 3 + lean, ty, 2, 8, "W");
  // torn hem: jagged bottom row
  for (let i = 0; i < 10; i += 2) s.px(cx - 5 + lean + i, ty + 8, "w");
  s.px(cx + 3 + lean, ty + 8, "W");
  // neck
  s.rect(cx - 1 + lean, ty - 1, 3, 1, "S");
}

function shorts(s, cx, y, { lean = 0 } = {}) {
  s.rect(cx - 4 + lean, y, 8, 3, "p");
  s.rect(cx + 2 + lean, y, 2, 3, "P");
}

function leg(s, x, topY, footDx = 0, lift = 0) {
  const footY = GROUND - lift;
  const kneeY = Math.round((topY + footY) / 2);
  s.limb(x, topY, x + Math.round(footDx / 2), kneeY, "s");
  s.limb(x + Math.round(footDx / 2), kneeY, x + footDx, footY - 1, "S");
  // foot
  s.rect(x + footDx - 1, footY - 1, 3, 1, "s");
}

function arm(s, sx, sy, hx, hy, shade = "s") {
  s.limb(sx, sy, hx, hy, shade);
  s.px(hx, hy, shade); s.px(hx + 1, hy, shade); // hand
}

// ---- frame compositor ---------------------------------------------------
// opts: {legs, armF, armB, bob, blink, headDown, lean, jump, tool}
function frame(opts = {}) {
  const s = new Sprite(FW, FH);
  const bob = opts.bob || 0;
  const jump = opts.jump || 0;
  const lean = opts.lean || 0;
  const drop = opts.legs === "sit" ? 5 : 0;

  const hy = 12 + bob + drop - jump;       // head top
  const ty = hy + 8;                        // torso top
  const hipY = ty + 9;                      // shorts top

  // ---- legs
  if (opts.legs === "sit") {
    // thighs forward, shins down
    s.rect(CX - 8, hipY + 2, 6, 2, "s");
    s.vline(CX - 8, hipY + 3, GROUND - hipY - 3, "S");
    s.vline(CX - 5, hipY + 4, GROUND - hipY - 4, "s");
    s.rect(CX - 9, GROUND - 1, 3, 1, "s");
    s.rect(CX - 6, GROUND - 1, 3, 1, "s");
  } else if (opts.legs === "tuck") {
    leg(s, CX - 4, hipY + 2 - jump, 0, 3 + jump);
    leg(s, CX + 2, hipY + 2 - jump, 0, 3 + jump);
  } else if (Array.isArray(opts.legs)) {
    // walk cycle: [frontDx, frontLift, backDx, backLift]
    const [fdx, fl, bdx, bl] = opts.legs;
    leg(s, CX - 4, hipY + 2, fdx, fl);
    leg(s, CX + 2, hipY + 2, bdx, bl);
  } else {
    leg(s, CX - 4, hipY + 2, 0, 0);
    leg(s, CX + 2, hipY + 2, 0, 0);
  }

  shorts(s, CX, hipY, { lean });
  torso(s, CX, ty, { lean });

  // ---- arms (front = left/screen-front, back = right)
  const fS = [CX - 5 + lean, ty + 1]; // front shoulder
  const bS = [CX + 4 + lean, ty + 1]; // back shoulder
  const A = {
    down:    ([sx, sy]) => arm(s, sx, sy, sx, sy + 7, "s"),
    downB:   ([sx, sy]) => arm(s, sx, sy, sx, sy + 7, "S"),
    swingF:  ([sx, sy]) => arm(s, sx, sy, sx - 3, sy + 6, "s"),
    swingB:  ([sx, sy]) => arm(s, sx, sy, sx + 3, sy + 6, "S"),
    up:      ([sx, sy]) => arm(s, sx, sy, sx - 2, sy - 9, "s"),
    upB:     ([sx, sy]) => arm(s, sx, sy, sx + 1, sy - 9, "S"),
    forward: ([sx, sy]) => arm(s, sx, sy, sx - 6, sy + 2, "s"),
    forwardB:([sx, sy]) => arm(s, sx, sy, sx - 5, sy + 3, "S"),
    out:     ([sx, sy]) => arm(s, sx, sy, sx - 6, sy - 2, "s"),
    outB:    ([sx, sy]) => arm(s, sx, sy, sx + 6, sy - 2, "S"),
    chin:    ([sx, sy]) => { arm(s, sx, sy, sx - 1, sy + 4, "s"); s.px(CX - 4, hy + 6, "s"); },
    hammerUp:([sx, sy]) => {
      arm(s, sx, sy, sx - 3, sy - 7, "s");
      s.vline(sx - 3, sy - 10, 3, "T"); s.rect(sx - 5, sy - 11, 5, 2, "r");
    },
    hammerDn:([sx, sy]) => {
      arm(s, sx, sy, sx - 7, sy + 4, "s");
      s.vline(sx - 7, sy + 2, 3, "T"); s.rect(sx - 9, sy + 5, 5, 2, "r");
    },
    rod:     ([sx, sy]) => {
      arm(s, sx, sy, sx - 5, sy + 3, "s");
      // rod: from hand forward-up; line+bobber drawn by the game
      s.limb(sx - 5, sy + 3, sx - 12, sy - 4, "T");
    },
  };
  (A[opts.armB || "downB"] || A.downB)(bS);
  head(s, CX + lean, hy, { blink: opts.blink, down: opts.headDown || 0 });
  (A[opts.armF || "down"] || A.down)(fS);

  return s;
}

// lying down is its own composition (horizontal)
function lieFrame({ blink = false } = {}) {
  const s = new Sprite(FW, FH);
  const y = GROUND - 4;
  // legs to the right
  s.rect(CX + 2, y, 8, 2, "s");
  s.rect(CX + 9, y - 1, 3, 1, "s");
  // shorts
  s.rect(CX - 1, y - 1, 5, 3, "p");
  // torso
  s.rect(CX - 8, y - 2, 8, 4, "w");
  s.px(CX - 8, y + 2, "W");
  // arms folded behind head
  s.rect(CX - 11, y - 3, 3, 2, "s");
  // head (facing up-left)
  s.rect(CX - 14, y - 4, 6, 4, "s");
  s.rect(CX - 14, y - 5, 6, 2, "o");   // bandana
  s.rect(CX - 14, y, 6, 1, "b");        // beard
  s.px(CX - 13, y - 3, blink ? "S" : "K"); // eye looking up
  return s;
}

// ---- animation table ----------------------------------------------------
export function buildKazim() {
  const frames = [];
  const anims = {};
  const add = (name, spr) => { frames.push({ name, spr }); return name; };
  const anim = (name, list, durations) => { anims[name] = { frames: list, durations }; };

  anim("idle", [
    add("idle_0", frame({})),
    add("idle_1", frame({ bob: 1 })),
    add("idle_2", frame({ bob: 1, blink: true })),
    add("idle_3", frame({})),
  ], [420, 420, 160, 420]);

  anim("walk", [
    add("walk_0", frame({ legs: [-3, 0, 3, 0], armF: "swingB", armB: "downB" })),
    add("walk_1", frame({ legs: [-1, 1, 1, 0], armF: "down", armB: "downB", bob: 1 })),
    add("walk_2", frame({ legs: [0, 0, 0, 1], armF: "swingF", armB: "downB" })),
    add("walk_3", frame({ legs: [3, 0, -3, 0], armF: "swingF", armB: "downB" })),
    add("walk_4", frame({ legs: [1, 0, -1, 1], armF: "down", armB: "downB", bob: 1 })),
    add("walk_5", frame({ legs: [0, 1, 0, 0], armF: "swingB", armB: "downB" })),
  ], [110, 110, 110, 110, 110, 110]);

  anim("sit", [
    add("sit_0", frame({ legs: "sit", armF: "forward", armB: "forwardB" })),
    add("sit_1", frame({ legs: "sit", armF: "forward", armB: "forwardB", blink: true })),
  ], [2200, 180]);

  anim("fish", [
    add("fish_0", frame({ legs: "sit", armF: "rod", armB: "forwardB" })),
    add("fish_1", frame({ legs: "sit", armF: "rod", armB: "forwardB", bob: 1 })),
    add("fish_2", frame({ legs: "sit", armF: "rod", armB: "forwardB", blink: true })),
    add("fish_3", frame({ legs: "sit", armF: "rod", armB: "forwardB" })),
  ], [700, 700, 160, 700]);

  anim("work", [
    add("work_0", frame({ armF: "hammerUp", armB: "downB" })),
    add("work_1", frame({ armF: "hammerDn", armB: "downB", lean: -1, bob: 1 })),
    add("work_2", frame({ armF: "hammerDn", armB: "downB", lean: -1 })),
    add("work_3", frame({ armF: "hammerUp", armB: "downB", bob: 1 })),
  ], [260, 140, 200, 260]);

  anim("reach", [
    add("reach_0", frame({ armF: "up", armB: "upB" })),
    add("reach_1", frame({ armF: "up", armB: "upB", legs: [0, 1, 0, 1], bob: -1 })),
  ], [340, 340]);

  anim("lie", [
    add("lie_0", lieFrame({})),
    add("lie_1", lieFrame({ blink: true })),
  ], [2600, 180]);

  anim("happy", [
    add("happy_0", frame({ armF: "up", armB: "upB" })),
    add("happy_1", frame({ armF: "up", armB: "upB", legs: "tuck", jump: 3 })),
  ], [200, 200]);

  anim("sad", [
    add("sad_0", frame({ headDown: 2, armF: "down", armB: "downB", lean: -1 })),
    add("sad_1", frame({ headDown: 2, armF: "down", armB: "downB", lean: -1, bob: 1, blink: true })),
  ], [800, 800]);

  anim("think", [
    add("think_0", frame({ armF: "chin", armB: "downB" })),
    add("think_1", frame({ armF: "chin", armB: "downB", blink: true, bob: 1 })),
  ], [700, 300]);

  anim("shrug", [
    add("shrug_0", frame({ armF: "out", armB: "outB" })),
    add("shrug_1", frame({ armF: "out", armB: "outB", bob: -1 })),
  ], [420, 420]);

  return { frames, anims, fw: FW, fh: FH };
}

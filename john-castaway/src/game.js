/* =====================================================================
   ADA · M1 — sprite-based vignette engine
   Applies the design decisions from the project critique:
   - data-driven scenes (data/events.json) + BEHAVIORS code registry
   - Story Director: cond → cooldown → comedy pacing → morale weighting
   - suggestion mechanic: player suggests, Kazım accepts/misfires/refuses
   - two stats only: morale + island_attachment
   - all artwork from generated spritesheets (tools/spritegen.js)
   ===================================================================== */
"use strict";
import { createPuzzles } from "./puzzle.js";

/* ---------- helpers ---------- */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;

const cv = document.getElementById("cv");
const ctx = cv.getContext("2d");
const W = cv.width, H = cv.height;
const HORIZON = 140, GROUND = 176;

/* ---------- atlas loading ---------- */
async function loadAtlas(name) {
  const [meta, img] = await Promise.all([
    fetch(`assets/${name}.json`).then((r) => r.json()),
    new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = `assets/${name}.png`;
    }),
  ]);
  return { ...meta, img };
}

/* ---------- world layout ---------- */
const SPOTS = { shore: 210, fish: 176, raft: 200, palm: 276, fire: 242, sand: 224, rock: 308, lie: 230 };
const ISLAND = { x0: 158, x1: 352 };

/* ---------- time ---------- */
const SPEEDS = [{ k: 1, label: "Gerçek" }, { k: 60, label: "60×" }, { k: 600, label: "600×" }];
let speedIdx = 0;
let simMs = Date.now();
let lastReal = performance.now();
const hourFloat = () => { const d = new Date(simMs); return d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600; };

const SKY = [
  [0.0, [11, 21, 38], [22, 40, 61], [14, 47, 56], 0.12],
  [4.5, [11, 21, 38], [22, 40, 61], [14, 47, 56], 0.12],
  [6.0, [74, 95, 134], [242, 176, 106], [42, 106, 112], 0.55],
  [8.0, [143, 203, 224], [214, 240, 240], [46, 143, 138], 1.0],
  [17.0, [143, 203, 224], [214, 240, 240], [46, 143, 138], 1.0],
  [19.5, [106, 90, 140], [242, 149, 92], [37, 106, 114], 0.6],
  [21.0, [11, 21, 38], [22, 40, 61], [14, 47, 56], 0.12],
  [24.0, [11, 21, 38], [22, 40, 61], [14, 47, 56], 0.12],
];
function skyState(h) {
  let a = SKY[0], b = SKY[SKY.length - 1];
  for (let i = 0; i < SKY.length - 1; i++)
    if (h >= SKY[i][0] && h <= SKY[i + 1][0]) { a = SKY[i]; b = SKY[i + 1]; break; }
  const t = (h - a[0]) / Math.max(1e-4, b[0] - a[0]);
  const mix = (x, y) => [0, 1, 2].map((i) => Math.round(lerp(x[i], y[i], t)));
  return { top: mix(a[1], b[1]), bot: mix(a[2], b[2]), sea: mix(a[3], b[3]), light: lerp(a[4], b[4], t) };
}
const rgb = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;
const isNight = () => skyState(hourFloat()).light < 0.4;

/* ---------- persistent state ---------- */
const SAVE_KEY = "ada_save_v1";
const state = {
  coconuts: 0, fish: 0, boots: 0, raft: 0,
  morale: 60, attach: 5,
  seen: new Set(), epoch: Date.now(), chains: [], lastDay: 0,
  escapes: 0, chair: false, solved: [],
};
function save() {
  localStorage.setItem(SAVE_KEY, JSON.stringify({ ...state, seen: [...state.seen], simMs }));
}
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (!s) return;
    Object.assign(state, s, { seen: new Set(s.seen || []) });
    if (s.simMs && s.simMs > simMs) simMs = s.simMs;
  } catch { /* fresh start */ }
}
const simDay = () => Math.floor((simMs - state.epoch) / 86400e3) + 1;

/* ---------- ambient actors & fx ---------- */
const clouds = Array.from({ length: 4 }, (_, i) => ({ x: rand(0, W), y: 24 + i * 18 + rand(-5, 5), w: Math.round(rand(30, 52)), sp: rand(2.2, 4.4) * (REDUCED ? 0.35 : 1) }));
const stars = Array.from({ length: 60 }, () => ({ x: rand(4, W - 4), y: rand(4, HORIZON - 16), tw: rand(0, Math.PI * 2), s: Math.random() < 0.2 ? 2 : 1 }));
let shootingStar = null, ship = null, crab = null, seagull = null;
let coconutsFalling = [], splashes = [], bubbles = [], flyingBottle = null;
let palmShake = 0, fireOn = 0, sandcastle = 0, tide = 0;

function say(txt, x, y) { bubbles.push({ x: x ?? kaz.x, y: y ?? GROUND - 52, txt, t: 0 }); }
function splash(x, y) { splashes.push({ x, y, t: 0 }); }

/* ---------- Kazım actor ---------- */
const kaz = {
  x: 220, dir: -1, anim: "idle", frame: 0, ft: 0, queue: [], busy: null,
  setAnim(name) { if (this.anim !== name) { this.anim = name; this.frame = 0; this.ft = 0; } },
};
let ATLAS = null, PROPS = null, DATA = null;

function tickAnim(dts) {
  const a = ATLAS.animations[kaz.anim];
  if (!a) return;
  kaz.ft += dts * 1000;
  const dur = a.durations[kaz.frame % a.frames.length];
  if (kaz.ft >= dur) { kaz.ft = 0; kaz.frame = (kaz.frame + 1) % a.frames.length; }
}
function drawKaz(skyLight) {
  const a = ATLAS.animations[kaz.anim];
  const fname = a.frames[kaz.frame % a.frames.length];
  const f = ATLAS.frames[fname];
  const dx = Math.round(kaz.x - f.w / 2), dy = GROUND - 46 - (kaz.air || 0);
  ctx.save();
  if (kaz.dir > 0) { ctx.translate(Math.round(kaz.x) * 2, 0); ctx.scale(-1, 1); }
  ctx.drawImage(ATLAS.img, f.x, f.y, f.w, f.h, dx, dy, f.w, f.h);
  ctx.restore();
  // fishing line & bobber (game-side overlay, sprite holds the rod)
  if (kaz.anim === "fish") {
    const rx = kaz.x + kaz.dir * 15, ry = GROUND - 27;
    ctx.strokeStyle = "#cfd8dc"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx + kaz.dir * 8, HORIZON + 18); ctx.stroke();
    ctx.fillStyle = "#e05a4a"; ctx.fillRect(rx + kaz.dir * 8 - 1, HORIZON + 17, 2, 2);
  }
  if (skyLight < 0.66) { // night dim on character
    ctx.fillStyle = `rgba(8,14,24,${(0.66 - skyLight) * 0.4})`;
    ctx.fillRect(dx, dy, f.w, f.h);
  }
}
function prop(name, x, y, flip = false) {
  const f = PROPS.frames[name];
  if (!f) return;
  ctx.save();
  if (flip) { ctx.translate(x * 2 + f.w, 0); ctx.scale(-1, 1); }
  ctx.drawImage(PROPS.img, f.x, f.y, f.w, f.h, Math.round(x), Math.round(y), f.w, f.h);
  ctx.restore();
}

/* task queue: {type:'walk',x,speed} | {type:'anim',name,sec} | {type:'call',fn} */
function enqueue(...tasks) { kaz.queue.push(...tasks); }
function clearTasks() { kaz.queue.length = 0; kaz.busy = null; }
function tickTasks(dts) {
  if (!kaz.busy) kaz.busy = kaz.queue.shift() || null;
  const t = kaz.busy;
  if (!t) return false;
  if (t.type === "walk") {
    kaz.setAnim("walk");
    const sp = t.speed || 26;
    const d = Math.sign(t.x - kaz.x);
    kaz.dir = d || kaz.dir;
    kaz.x += sp * dts * d;
    if (Math.abs(kaz.x - t.x) < 2) { kaz.x = t.x; kaz.busy = null; }
  } else if (t.type === "anim") {
    if (!t._started) { t._started = true; t._left = t.sec; kaz.setAnim(t.name); if (t.dir) kaz.dir = t.dir; }
    t._left -= dts;
    if (t._left <= 0) kaz.busy = null;
  } else if (t.type === "call") {
    t.fn(); kaz.busy = null;
  }
  return true;
}

/* =====================================================================
   STORY DIRECTOR
   pick order: chain queue → eligibility (cond) → cooldown → no-repeat
   → comedy pacing (no two 'sad' moods back-to-back)
   → morale weighting (low morale boosts 'comfort' scenes)
   ===================================================================== */
const cool = {};
let lastSceneId = null, lastMood = "neutral";
let current = null; // {scene, until}

function eligible(s) {
  if (s.chainOnly) return false;
  if (s.cond === "night" && !isNight()) return false;
  if (s.cond === "day" && isNight()) return false;
  return true;
}
function weightOf(s) {
  let w = s.w;
  if (s.mood === "sad" && lastMood === "sad") w *= 0.15;          // comedy pacing
  if (s.mood === "comfort" && state.morale < 45) w *= 2.0;        // low morale → comfort
  if (s.mood === "sad" && state.morale < 35) w *= 0.3;            // don't kick him while he's down
  return w;
}
function dueChain() {
  const i = state.chains.findIndex((c) => simMs >= c.dueMs);
  if (i < 0) return null;
  const c = state.chains.splice(i, 1)[0];
  return DATA.scenes.find((s) => s.id === c.id) || null;
}
function pickScene(forcedId) {
  const now = performance.now();
  let chosen = forcedId ? DATA.scenes.find((s) => s.id === forcedId) : dueChain();
  if (!chosen) {
    let pool = DATA.scenes.filter((s) => eligible(s) && now >= (cool[s.id] || 0) && s.id !== lastSceneId);
    if (!pool.length) pool = DATA.scenes.filter(eligible);
    const total = pool.reduce((a, s) => a + weightOf(s), 0);
    let r = Math.random() * total;
    chosen = pool[0];
    for (const s of pool) { r -= weightOf(s); if (r <= 0) { chosen = s; break; } }
  }
  cool[chosen.id] = now + chosen.cd * 1000;
  lastSceneId = chosen.id;
  startScene(chosen);
}
function startScene(s) {
  chipScene.innerHTML = "sahne: <b>" + s.name + "</b>";
  const anchor = SPOTS[s.anchor] ?? SPOTS.shore;
  enqueue(
    { type: "walk", x: anchor },
    { type: "call", fn: () => {
      current = { scene: s, until: performance.now() + rand(s.min, s.max) * 1000 };
      lastMood = s.mood || "neutral";
      markSeen(s);
      kaz.setAnim(s.anim || "idle");
      BEHAVIORS[s.id]?.enter?.();
    } },
  );
}
function endScene() {
  const s = current?.scene;
  current = null;
  if (s) {
    BEHAVIORS[s.id]?.exit?.();
    if (s.chainNext && Math.random() < 0.8)
      state.chains.push({ id: s.chainNext.id, dueMs: simMs + s.chainNext.delayDays * 86400e3 });
  }
  kaz.setAnim("idle");
  save();
}

/* ---------- scene behaviors (code side of the data model) ---------- */
const BEHAVIORS = {
  izle: { enter() { kaz.dir = -1; } },
  yuru: {
    enter() { this._t = kaz.x < 230 ? 320 : 175; },
    update(dts) {
      kaz.setAnim("walk");
      const d = Math.sign(this._t - kaz.x);
      kaz.dir = d || kaz.dir; kaz.x += 20 * dts * d;
      if (Math.abs(kaz.x - this._t) < 3) this._t = this._t < 230 ? 320 : 175;
    },
  },
  kosu: {
    enter() { this._t = 320; say("spor şart"); },
    update(dts) {
      kaz.setAnim("walk");
      const d = Math.sign(this._t - kaz.x);
      kaz.dir = d || kaz.dir; kaz.x += 46 * dts * d;
      if (Math.abs(kaz.x - this._t) < 3) this._t = this._t > 230 ? 172 : 320;
    },
    exit() { adjMorale(+2); },
  },
  balik: {
    enter() { kaz.dir = -1; this._n = 0; },
    update(dts) {
      this._n += dts;
      if (this._n > 3.2) {
        this._n = 0;
        if (Math.random() < 0.38) { splash(kaz.x - 22, HORIZON + 18); state.fish++; say("🐟"); adjMorale(+2); refreshCounters(); }
      }
    },
  },
  ceviz: {
    enter() {
      kaz.dir = 1; palmShake = 1;
      this._timer = setTimeout(() => {
        palmShake = 0;
        coconutsFalling.push({
          x: 258 + rand(-3, 5), y: GROUND - 62, vx: rand(-4, 4), vy: 0,
          resolve: () => {
            if (Math.random() < 0.7) { state.coconuts++; say("🥥"); adjMorale(+1); }
            else { say("of!"); kaz.setAnim("sad"); adjMorale(-2); }
            refreshCounters();
          },
        });
      }, 1200);
    },
    exit() { palmShake = 0; clearTimeout(this._timer); },
  },
  sal: {
    enter() { kaz.dir = -1; this._n = 0; },
    update(dts) {
      state.raft = clamp(state.raft + 0.6 * dts, 0, 100);
      this._n += dts;
      if (this._n > 2.4) { this._n = 0; say("tok tok"); refreshCounters(); }
      if (state.raft >= 100 && !state.chains.some((c) => c.id === "kacis")) {
        state.chains.push({ id: "kacis", dueMs: simMs });
      }
    },
  },
  kum: {
    enter() { kaz.dir = -1; sandcastle = 0.01; },
    update(dts) { sandcastle = clamp(sandcastle + dts / 8, 0, 1); },
    exit() {
      // a foam wave takes it — Kazım is stoic about impermanence
      setTimeout(() => {
        if (sandcastle > 0.4) { splash(SPOTS.sand, GROUND - 4); sandcastle = 0; say("yine yaparım", SPOTS.sand); adjMorale(+1); }
      }, 4000);
    },
  },
  ates: {
    enter() { kaz.dir = -1; fireOn = 1; say("sıcacık"); adjMorale(+2); },
    exit() { setTimeout(() => { fireOn = 0; }, 8000); },
  },
  yildiz: {
    enter() {
      kaz.dir = -1;
      if (!REDUCED && Math.random() < 0.55)
        this._timer = setTimeout(() => { shootingStar = { x: rand(60, 300), y: rand(14, 50), t: 0 }; say("✦"); adjMorale(+2); }, rand(2000, 5000));
    },
    exit() { clearTimeout(this._timer); },
  },
  sise: {
    enter() {
      kaz.dir = -1; say("belki biri okur");
      this._timer = setTimeout(() => {
        flyingBottle = { x: kaz.x - 8, y: GROUND - 30, vx: -46, vy: -36, t: 0 };
      }, 2500);
    },
    exit() { clearTimeout(this._timer); },
  },
  sise_geri: {
    enter() {
      kaz.dir = -1;
      say("…bu benim yazım");
      adjMorale(-3);
      toast("Şişedeki mesaj bir gün sonra aynı kıyıya geri vurdu. Kazım etkilenmedi desek yalan olur.");
    },
  },
  gemi: {
    enter() { ship = { x: -46 }; kaz.dir = -1; this._sad = false; say("HEEEY!"); },
    update() {
      if (!ship) return;
      if (ship.x > 270 && !this._sad) { this._sad = true; kaz.setAnim("sad"); say("…"); adjMorale(-5); }
    },
    exit() { ship = null; state.attach = clamp(state.attach + 1, 0, 100); refreshMeters(); },
  },
  yengec: {
    enter() { crab = { x: 330 }; kaz.dir = 1; say("?"); },
    update(dts) {
      if (!crab) return;
      crab.x -= 15 * dts;
      if (kaz.x > crab.x - 16) { kaz.dir = -1; kaz.setAnim("walk"); kaz.x -= 20 * dts; }
      if (crab.x < 190) crab.x = 190;
    },
    exit() { crab = null; },
  },
  marti: {
    enter() {
      seagull = { x: -12, y: 60, phase: 0 };
      this._stole = false;
    },
    update(dts) {
      if (!seagull) return;
      seagull.phase += dts;
      seagull.x += 64 * dts;
      const diveT = clamp((seagull.x - (kaz.x - 60)) / 60, 0, 1);
      seagull.y = seagull.x < kaz.x ? lerp(60, GROUND - 40, diveT) : lerp(GROUND - 40, 40, clamp((seagull.x - kaz.x) / 80, 0, 1));
      if (!this._stole && Math.abs(seagull.x - kaz.x) < 6) {
        this._stole = true; say("hey!"); adjMorale(-3);
        if (state.fish > 0) { state.fish--; refreshCounters(); toast("Martı dalışa geçti ve Kazım'ın balığını kaptı. Ada kanunu."); }
      }
    },
    exit() { seagull = null; },
  },
  kacis: {
    enter() {
      say("bugün o gün!");
      toast("Sal tamam — Kazım kaçış denemesine başlıyor. Nefesini tut.");
      this._t = 0; this._stage = 0;
    },
    update(dts) {
      this._t += dts;
      if (this._stage === 0 && this._t > 3) { this._stage = 1; kaz.setAnim("happy"); say("elveda ada!"); }
      if (this._stage === 1 && this._t > 6) {
        this._stage = 2; splash(185, GROUND - 2); splash(178, GROUND); say("çat.", 190);
      }
      if (this._stage === 2 && this._t > 8) {
        this._stage = 3; kaz.setAnim("sad"); say("…sandalye olur bu");
        state.raft = 30; state.escapes++; state.chair = true;
        state.attach = clamp(state.attach + 10, 0, 100);
        adjMorale(-6);
        refreshCounters(); refreshMeters();
        toast("Sal, denize değdiği an ikiye ayrıldı. Kazım enkazdan kendine bir sandalye yaptı. Adaya bağlılık +10.");
      }
      if (this._stage === 3 && this._t > 12) { adjMorale(+4); say("yarın yenisi"); this._stage = 4; }
    },
  },
};

/* ---------- suggestions: advise, don't command ---------- */
let suggestBusy = false;
function runSuggestion(sg) {
  if (suggestBusy) return;
  suggestBusy = true;
  refreshSuggestBtns();
  if (current) { endScene(); }
  clearTasks();
  chipScene.innerHTML = "sahne: <b>öneri: " + sg.label.replace(/^\S+\s/, "") + "</b>";
  enqueue(
    { type: "walk", x: SPOTS[sg.spot] ?? SPOTS.shore },
    { type: "anim", name: "think", sec: 2.4 },
    { type: "call", fn: () => {
      const r = Math.random();
      if (r < sg.accept.p) {
        say(sg.accept.bubble);
        pickScene(sg.accept.scene);
      } else if (r < sg.accept.p + sg.misfire.p) {
        say(sg.misfire.bubble);
        applyMisfire(sg.misfire);
        enqueue({ type: "anim", name: "work", sec: 3 }, { type: "anim", name: "happy", sec: 1.4 });
        adjMorale(+2); // misfires are funny, and Kazım is proud of them
      } else {
        say(sg.refuse.bubble);
        enqueue({ type: "anim", name: "shrug", sec: 2 });
      }
      setTimeout(() => { suggestBusy = false; refreshSuggestBtns(); }, 9000);
    } },
  );
}
function applyMisfire(m) {
  if (m.effect === "chair") { state.chair = true; state.raft = clamp(state.raft - 6, 0, 100); }
  if (m.effect === "boot") { state.boots++; }
  if (m.effect === "roast_coconut") { if (state.coconuts > 0) state.coconuts--; fireOn = 1; setTimeout(() => { fireOn = 0; }, 6000); }
  refreshCounters();
  toast(m.toast);
}

/* ---------- stats ---------- */
function adjMorale(d) { state.morale = clamp(state.morale + d, 0, 100); refreshMeters(); }
function tickDaily() {
  const d = simDay();
  if (d !== state.lastDay) {
    const gained = Math.max(0, d - state.lastDay);
    state.lastDay = d;
    state.attach = clamp(state.attach + 2 * gained, 0, 100);
    chipDay.textContent = "gün " + d;
    refreshMeters();
    // holiday touch: last week of December
    const dt = new Date(simMs);
    if (dt.getMonth() === 11 && dt.getDate() >= 25) toast("Adada yılbaşı havası — palmiyeye flama asıldı. 🎉");
    save();
  }
}

/* ---------- rendering ---------- */
function drawSky(sky, at) {
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    const c = [0, 1, 2].map((k) => Math.round(lerp(sky.top[k], sky.bot[k], t)));
    ctx.fillStyle = rgb(c);
    ctx.fillRect(0, i * (HORIZON / 5), W, HORIZON / 5 + 1);
  }
  const starA = clamp(1 - sky.light * 1.7, 0, 1);
  if (starA > 0.02) {
    for (const s of stars) {
      ctx.globalAlpha = starA * (REDUCED ? 0.8 : 0.55 + 0.45 * Math.sin(at * 2 + s.tw));
      ctx.fillStyle = "#eaf2ff";
      ctx.fillRect(s.x, s.y, s.s, s.s);
    }
    ctx.globalAlpha = 1;
  }
  const h = hourFloat();
  const dT = (h - 6) / 12;
  if (dT > 0 && dT < 1) {
    const sx = lerp(50, 430, dT), sy = 130 - Math.sin(dT * Math.PI) * 96;
    ctx.fillStyle = "#ffd98a";
    ctx.fillRect(sx - 4, sy - 4, 8, 8); ctx.fillRect(sx - 2, sy - 6, 4, 12); ctx.fillRect(sx - 6, sy - 2, 12, 4);
    ctx.fillStyle = "#fff2c8"; ctx.fillRect(sx - 2, sy - 2, 4, 4);
  }
  const mT = (((h + 12) % 24) - 6) / 12;
  if (starA > 0.05 && mT > 0 && mT < 1) {
    const mx = lerp(50, 430, mT), my = 130 - Math.sin(mT * Math.PI) * 90;
    ctx.fillStyle = "#dfe8f2"; ctx.fillRect(mx - 4, my - 4, 8, 8);
    ctx.fillStyle = rgb(sky.top); ctx.fillRect(mx - 1, my - 4, 5, 5);
  }
  ctx.globalAlpha = lerp(0.25, 0.9, sky.light);
  for (const c of clouds) {
    ctx.fillStyle = sky.light > 0.5 ? "#f4f8f7" : "#5a6a83";
    ctx.fillRect(c.x, c.y, c.w, 4); ctx.fillRect(c.x + 5, c.y - 3, c.w - 12, 3); ctx.fillRect(c.x + 3, c.y + 4, c.w - 8, 2);
  }
  ctx.globalAlpha = 1;
}
function drawSea(sky, at) {
  ctx.fillStyle = rgb(sky.sea);
  ctx.fillRect(0, HORIZON, W, H - HORIZON);
  tide = Math.sin(at / 38);
  const rows = [5, 12, 21, 32, 46, 64, 86, 110];
  for (let i = 0; i < rows.length; i++) {
    const y = HORIZON + rows[i];
    if (y >= H) break;
    ctx.fillStyle = rgb([0, 1, 2].map((k) => clamp(sky.sea[k] + 24 + i * 3, 0, 255)));
    const off = (at * (7 + i * 2.6) * (REDUCED ? 0.4 : 1) + i * 13) % 30;
    for (let x = -30; x < W; x += 30) ctx.fillRect(Math.round(x + off), y, 11, 1);
  }
}
function drawIsland(sky, at) {
  // sand mound
  const SAND = { light: "#e8c98a", mid: "#d4a95f", dark: "#b3853f", wet: "#a8834e" };
  ctx.fillStyle = SAND.mid; ctx.fillRect(ISLAND.x0, GROUND - 8, ISLAND.x1 - ISLAND.x0, 22);
  ctx.fillStyle = SAND.mid; ctx.fillRect(ISLAND.x0 + 8, GROUND - 12, ISLAND.x1 - ISLAND.x0 - 16, 6);
  ctx.fillStyle = SAND.light; ctx.fillRect(ISLAND.x0 + 20, GROUND - 15, ISLAND.x1 - ISLAND.x0 - 48, 5);
  ctx.fillStyle = SAND.light; ctx.fillRect(ISLAND.x0 + 34, GROUND - 17, ISLAND.x1 - ISLAND.x0 - 82, 3);
  // waterline + foam
  const wl = GROUND + 10 + Math.round(tide * 2);
  ctx.fillStyle = SAND.wet; ctx.fillRect(ISLAND.x0 - 4, wl - 2, ISLAND.x1 - ISLAND.x0 + 8, 2);
  ctx.fillStyle = "#eaf6f4";
  for (let x = ISLAND.x0 - 6; x < ISLAND.x1 + 6; x += 5)
    if (((x >> 2) + Math.floor(at * 5)) % 3 !== 0) ctx.fillRect(x, wl, 2, 1);
  // reef tongue appears at low tide (left)
  if (tide < -0.25) {
    ctx.fillStyle = "#5d666d"; ctx.fillRect(126, GROUND + 8, 30, 3);
    ctx.fillStyle = "#7d8489"; ctx.fillRect(132, GROUND + 6, 9, 2); ctx.fillRect(146, GROUND + 7, 6, 2);
  }
  // props
  prop("rock", 300, GROUND - 26);
  prop("wreck", 330, GROUND - 11);
  prop(palmShake ? "palm_1" : (Math.sin(at * 1.3) > 0.5 && !REDUCED ? "palm_1" : "palm_0"), 248 - 34 + 10, GROUND - 62);
  const raftStage = clamp(Math.floor(state.raft / 25), 0, 3);
  if (state.raft > 1) prop(`raft_${raftStage}`, 186, GROUND - 8 - 4);
  if (state.chair) prop("chair", 174, GROUND - 7);
  if (fireOn) prop(`fire_${Math.floor(at * 8) % 3}`, SPOTS.fire - 3, GROUND - 7);
  if (sandcastle > 0.1) {
    ctx.fillStyle = SAND.light;
    const h2 = Math.round(sandcastle * 7);
    ctx.fillRect(SPOTS.sand - 6, GROUND - h2, 12, h2);
    if (sandcastle > 0.6) { ctx.fillRect(SPOTS.sand - 2, GROUND - h2 - 3, 4, 3); }
  }
  // holiday pennant (last week of December)
  const dt = new Date(simMs);
  if (dt.getMonth() === 11 && dt.getDate() >= 25) {
    ctx.fillStyle = "#e07a3f"; ctx.fillRect(236, GROUND - 58, 6, 4);
    ctx.fillStyle = "#efe6d2"; ctx.fillRect(236, GROUND - 54, 4, 2);
  }
  // night dim — full band below the horizon so there are no box seams
  const dark = clamp(1 - sky.light, 0, 1) * 0.28;
  if (dark > 0.01) { ctx.fillStyle = `rgba(8,14,24,${dark})`; ctx.fillRect(0, HORIZON, W, H - HORIZON); }
}
function drawActors(at) {
  if (ship) { prop("ship", ship.x, HORIZON - 14); }
  if (crab) { prop(`crab_${Math.floor(at * 9) % 2}`, crab.x, GROUND + 2); }
  if (seagull) { prop(`seagull_${Math.floor(at * 6) % 2}`, seagull.x, seagull.y); }
}
function drawFX(dts) {
  for (const c of coconutsFalling) {
    if (!c.done) {
      c.vy += 70 * dts; c.x += c.vx * dts; c.y += c.vy * dts;
      if (c.y >= GROUND - 2) { c.y = GROUND - 2; c.done = true; c.resolve(); }
    }
    prop("coconut", c.x, c.y);
  }
  coconutsFalling = coconutsFalling.filter((c) => { if (!c.done) return true; c.linger = (c.linger ?? 0.7) - dts; return c.linger > 0; });
  if (flyingBottle) {
    const b = flyingBottle;
    b.t += dts; b.vy += 46 * dts; b.x += b.vx * dts; b.y += b.vy * dts;
    prop("bottle", b.x, b.y);
    if (b.y > HORIZON + 24) { splash(b.x, b.y); flyingBottle = null; say("güle güle", kaz.x); }
  }
  for (const s of splashes) {
    s.t += dts;
    const r = Math.floor(s.t * 12);
    ctx.fillStyle = `rgba(234,246,244,${1 - s.t / 0.5})`;
    ctx.fillRect(s.x - r, s.y, 2, 1); ctx.fillRect(s.x + r, s.y, 2, 1); ctx.fillRect(s.x, s.y - r, 1, 2);
  }
  splashes = splashes.filter((s) => s.t < 0.5);
  if (shootingStar) {
    shootingStar.t += dts;
    const t = shootingStar.t, x = shootingStar.x + t * 110, y = shootingStar.y + t * 40;
    ctx.strokeStyle = `rgba(240,246,255,${1 - t / 0.8})`;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 12, y - 5); ctx.stroke();
    if (t > 0.8) shootingStar = null;
  }
  ctx.font = "8px monospace"; ctx.textBaseline = "top";
  for (const b of bubbles) {
    b.t += dts; b.y -= 7 * dts;
    const a = clamp(1 - b.t / 1.8, 0, 1);
    const w2 = ctx.measureText(b.txt).width + 8;
    ctx.globalAlpha = a;
    ctx.fillStyle = "rgba(20,26,32,.85)"; ctx.fillRect(b.x - w2 / 2, b.y - 11, w2, 12);
    ctx.fillStyle = "#f2ede2"; ctx.fillText(b.txt, b.x - w2 / 2 + 4, b.y - 9);
    ctx.globalAlpha = 1;
  }
  bubbles = bubbles.filter((b) => b.t < 1.8);
}

/* ---------- ambient updates ---------- */
function tickAmbient(dts) {
  for (const c of clouds) { c.x += c.sp * dts; if (c.x > W + 20) { c.x = -c.w - 10; c.y = 24 + rand(0, 60); } }
  if (ship) { ship.x += (W + 100) / 20 * dts; if (ship.x > W + 60) ship = null; }
}

/* ---------- UI ---------- */
const journalEl = document.getElementById("journal");
const jCount = document.getElementById("jCount");
const chipScene = document.getElementById("chipScene");
const chipClock = document.getElementById("chipClock");
const chipDay = document.getElementById("chipDay");
const toastEl = document.getElementById("toast");
let toastTimer = null;

function toast(html) {
  toastEl.innerHTML = html;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 5000);
}
function markSeen(s) {
  if (!state.seen.has(s.id)) {
    state.seen.add(s.id);
    toast("Yeni sahne keşfedildi: <b>" + s.name + "</b>");
    save();
  }
  renderJournal();
}
function renderJournal() {
  journalEl.innerHTML = "";
  for (const s of DATA.scenes) {
    const el = document.createElement("span");
    el.className = "jchip" + (state.seen.has(s.id) ? " seen" : "") + (current?.scene.id === s.id ? " live" : "");
    el.textContent = state.seen.has(s.id) ? s.name : "???";
    journalEl.appendChild(el);
  }
  jCount.textContent = state.seen.size + "/" + DATA.scenes.length;
}
function refreshCounters() {
  document.getElementById("cCoco").textContent = state.coconuts;
  document.getElementById("cFish").textContent = state.fish;
  document.getElementById("cBoot").textContent = state.boots;
  document.getElementById("cRaft").textContent = "%" + Math.floor(state.raft);
}
function refreshMeters() {
  document.querySelector("#barMorale i").style.width = state.morale + "%";
  document.querySelector("#barAttach i").style.width = state.attach + "%";
}
function refreshSuggestBtns() {
  document.querySelectorAll("button.suggest").forEach((b) => { b.disabled = suggestBusy; });
}
function buildSuggestButtons() {
  const holder = document.getElementById("suggestBtns");
  for (const sg of DATA.suggestions) {
    const b = document.createElement("button");
    b.className = "suggest"; b.type = "button"; b.textContent = sg.label;
    b.addEventListener("click", () => runSuggestion(sg));
    holder.appendChild(b);
  }
}

/* ---------- interactions on canvas ---------- */
cv.addEventListener("pointerdown", (e) => {
  const r = cv.getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width) * W, y = ((e.clientY - r.top) / r.height) * H;
  if (x > 230 && x < 290 && y > GROUND - 70 && y < GROUND) {
    palmShake = 1; setTimeout(() => (palmShake = 0), 500);
    coconutsFalling.push({ x: 258 + rand(-3, 5), y: GROUND - 62, vx: rand(-5, 5), vy: 0,
      resolve: () => { state.coconuts++; say("🥥", x, GROUND - 30); refreshCounters(); } });
  } else if (Math.abs(x - kaz.x) < 14 && y > GROUND - 50 && y < GROUND + 4) {
    say("selam!");
  }
});

/* ---------- controls ---------- */
document.getElementById("btnTime").addEventListener("click", (e) => {
  speedIdx = (speedIdx + 1) % SPEEDS.length;
  e.target.textContent = "Zaman: " + SPEEDS[speedIdx].label;
});
const pipBtn = document.getElementById("btnPip");
const pipVid = document.getElementById("pipVideo");
if (cv.captureStream && pipVid.requestPictureInPicture && document.pictureInPictureEnabled) {
  pipBtn.hidden = false;
  pipBtn.addEventListener("click", async () => {
    try {
      if (!pipVid.srcObject) pipVid.srcObject = cv.captureStream(30);
      await pipVid.play();
      await pipVid.requestPictureInPicture();
      toast("Ada artık küçük pencerede — başka işine dönebilirsin 🌊");
    } catch (err) { toast("PiP açılamadı: " + err.message); }
  });
}

/* ---------- idle catch-up ---------- */
let hiddenAt = null;
document.addEventListener("visibilitychange", () => {
  if (document.hidden) { hiddenAt = Date.now(); save(); }
  else if (hiddenAt) {
    const el = Date.now() - hiddenAt; hiddenAt = null;
    simMs += el * SPEEDS[speedIdx].k;
    lastReal = performance.now();
    const min = el / 60000;
    if (min > 0.25) {
      const c = Math.floor(min / 1.6), f = Math.floor(min / 2.6);
      const rGain = Math.min(100 - state.raft, min * 0.7);
      state.coconuts += c; state.fish += f; state.raft += rGain;
      refreshCounters();
      const parts = [];
      if (c) parts.push("🥥 +" + c);
      if (f) parts.push("🐟 +" + f);
      if (rGain > 0.5) parts.push("sal +%" + Math.floor(rGain));
      let msg = "<b>Sen yokken</b> (" + (min < 60 ? Math.round(min) + " dk" : (min / 60).toFixed(1) + " sa") + "): " + (parts.join(" · ") || "deniz sakindi");
      if (min > 3 && Math.random() < 0.5) msg += " · ufuktan bir gemi geçti, yetişemedin 🙃";
      toast(msg);
      save();
    }
  }
});

/* ---------- main loop ---------- */
let animClock = 0;
let puzzle = null; // set in boot
function frame(nowReal) {
  const dtReal = Math.min(100, nowReal - lastReal);
  lastReal = nowReal;
  const dts = dtReal / 1000;
  simMs += dtReal * SPEEDS[speedIdx].k;
  animClock += dts;

  if (puzzle?.isOpen()) {
    puzzle.tick(dts);
    if (!puzzle.isRunning()) kaz.setAnim("idle");
  } else {
    // director: tasks first (walking to scene / suggestion), then scene play
    const busyWithTasks = tickTasks(dts);
    if (!busyWithTasks && current) {
      BEHAVIORS[current.scene.id]?.update?.(dts, current);
      if (performance.now() > current.until) { endScene(); pickScene(); }
    } else if (!busyWithTasks && !current && !suggestBusy) {
      pickScene();
    }
  }
  tickAnim(dts);
  tickAmbient(dts);
  tickDaily();

  const sky = skyState(hourFloat());
  drawSky(sky, animClock);
  drawSea(sky, animClock);
  if (ship) drawActors(animClock); // ship behind island
  drawIsland(sky, animClock);
  if (!ship) drawActors(animClock);
  else { if (crab) prop(`crab_${Math.floor(animClock * 9) % 2}`, crab.x, GROUND + 2); if (seagull) prop(`seagull_${Math.floor(animClock * 6) % 2}`, seagull.x, seagull.y); }
  drawKaz(sky.light);
  drawFX(dts);
  puzzle?.draw(ctx);

  requestAnimationFrame(frame);
}

/* ---------- boot ---------- */
(async function boot() {
  let PUZZLES;
  [ATLAS, PROPS, DATA, PUZZLES] = await Promise.all([
    loadAtlas("kazim"),
    loadAtlas("props"),
    fetch("data/events.json").then((r) => r.json()),
    fetch("data/puzzles.json").then((r) => r.json()),
  ]);
  load();
  if (!Array.isArray(state.solved)) state.solved = [];
  puzzle = createPuzzles({
    prop, say, splash, toast, kaz, GROUND,
    setFire: (v) => { fireOn = v ? 1 : 0; },
    setShip: () => { ship = { x: -46 }; },
    setPalmShake: (v) => { palmShake = v; },
    adjMorale,
    adjAttach: (d) => { state.attach = clamp(state.attach + d, 0, 100); refreshMeters(); },
    addCounters: (r) => {
      if (r.coconuts) state.coconuts += r.coconuts;
      if (r.boots) state.boots += r.boots;
      if (r.fish) state.fish += r.fish;
      refreshCounters();
    },
    state, save,
    interrupt: () => { if (current) endScene(); clearTasks(); chipScene.innerHTML = "sahne: <b>🧩 düzenek</b>"; },
    setBusy: (v) => { suggestBusy = v; refreshSuggestBtns(); },
  }, PUZZLES);
  document.getElementById("btnPuzzle").addEventListener("click", () => puzzle.open());
  // QA: ?pz=kozceviz&parts=plank auto-runs a puzzle outcome
  const qp = new URLSearchParams(location.search);
  if (qp.get("pz")) setTimeout(() => puzzle.debugRun(qp.get("pz"), (qp.get("parts") || "").split(",")), 800);
  // debug: ?h=13 forces the sim clock to a given hour (art/QA sessions)
  const hParam = new URLSearchParams(location.search).get("h");
  if (hParam !== null) simMs = new Date().setHours(+hParam, 0, 0, 0);
  state.lastDay = simDay();
  chipDay.textContent = "gün " + simDay();
  buildSuggestButtons();
  renderJournal(); refreshCounters(); refreshMeters();
  setInterval(() => {
    const d = new Date(simMs);
    chipClock.textContent = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0") + (SPEEDS[speedIdx].k > 1 ? " ⏩" : "");
    renderJournal();
  }, 250);
  setInterval(save, 15000);
  requestAnimationFrame((t) => { lastReal = t; frame(t); });
})();

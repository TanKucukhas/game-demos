// Before the Thaw — The First Hunt (vertical slice)
// Core loop: observe → interpret → plan → command → execute → adapt → teach → recover
import '@fontsource/cormorant-garamond/400.css';
import '@fontsource/cormorant-garamond/400-italic.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/600.css';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { createWorld } from './world.js';
import { buildBear, buildSeal, animateGait, tryUpgradeModel } from './creatures.js';
import { makeCubs } from './cubs.js';
import { GameAudio } from './audio.js';
import { NPCBear } from './rivals.js';

// ---------- setup ----------
const app = document.getElementById('app');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.62;
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 700);

const composer = new EffectComposer(renderer);
const world = createWorld(scene, renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.07, 0.4, 1.05);
composer.addPass(bloom);
composer.addPass(new OutputPass());

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  composer.setSize(innerWidth, innerHeight);
});
const audio = new GameAudio();

// ---------- actors ----------
const mother = buildBear({ scale: 1 });
scene.add(mother);
const cubs = makeCubs(scene, world);

const seal = buildSeal();
scene.add(seal);

// Generated models auto-upgrade if present. Rigged+animated versions
// (_anim.glb, e.g. from Anything World) take priority over static Meshy ones.
(async () => {
  if (!await tryUpgradeModel(mother, '/models/polar_bear_mother_anim.glb', 1.6)) {
    tryUpgradeModel(mother, '/models/polar_bear_mother.glb', 1.6);
  }
})();
cubs.forEach(async (c) => {
  if (!await tryUpgradeModel(c.mesh, '/models/polar_bear_cub_anim.glb', 0.7)) {
    tryUpgradeModel(c.mesh, '/models/polar_bear_cub.glb', 0.7);
  }
});
(async () => {
  if (!await tryUpgradeModel(seal, '/models/ringed_seal_anim.glb', 0.55)) {
    tryUpgradeModel(seal, '/models/ringed_seal.glb', 0.55);
  }
})();

// NPC bears: one rival male (kill-scent driven) + two whale-carcass scavengers
const rival = new NPCBear(scene, world, { aggression: 0.55, name: 'rival male' });
const scavengers = [
  new NPCBear(scene, world, { aggression: 0.68, scale: 1.2, name: 'big scavenger' }),
  new NPCBear(scene, world, { aggression: 0.45, scale: 1.05, name: 'lean scavenger' }),
];

// ---------- game state ----------
const G = {
  running: false,
  over: false,
  t: 0,
  // mother
  pos: new THREE.Vector3(0, 0, -66),
  heading: Math.PI / 2, // facing +Z (north, toward sea ice)
  vel: 0,
  energy: 0.5,
  stalking: false,
  inWater: false,
  waterT: 0,
  // wind (unit vector the wind blows TOWARD)
  wind: new THREE.Vector2(0, -1), // blowing south → approach from north is UPwind (bad); from south is downwind... see scent calc
  windTimer: 20,
  // seal
  sealAlert: 0,          // 0 calm .. 1 flees
  sealState: 'hauled',   // hauled | diving | gone | dead
  sealResurface: 0,
  killPos: null,
  carcass: 0,            // meat remaining 0..1
  // storm
  stormTotal: 360,       // 6 minutes
  stormLeft: 360,
  stormIntensity: 0,
  // extended systems
  rivalTimer: -1,        // countdown to rival arriving after a kill
  rivalsDriven: 0,
  whale: 1.0,            // whale carcass meat pool
  whaleAte: 0,
  resting: false,
  bond: 0,               // grows through play; boosts obedience
  playT: 0,
  chapter: 0,
  // stats for the debrief
  kills: 0,
  cubRescues: 0,
  msgQ: [],
  msgT: 0,
};

// ---------- input ----------
const keys = {};
addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (!G.running || G.over) return;
  if (e.code === 'KeyC') { G.stalking = !G.stalking; }
  if (e.code === 'KeyQ') doCall();
  if (e.code === 'KeyE') doStayFollow();
  if (e.code === 'Space') { e.preventDefault(); doPounce(); }
  if (e.code === 'KeyF') doNurse();
  if (e.code === 'KeyR') doRest();
  if (e.code === 'KeyG') doPlay();
  if (['KeyW','KeyA','KeyS','KeyD'].includes(e.code)) stopResting();
});
addEventListener('keyup', (e) => { keys[e.code] = false; });

// ---------- HUD refs ----------
const $ = (id) => document.getElementById(id);
const hud = $('hud');

function showMsg(text, dur = 4, urgent = false) {
  if (urgent) { G.msgQ.length = 0; G.msgT = 0; }
  G.msgQ.push({ text, dur });
}
function pumpMsg(dt) {
  const el = $('msg');
  if (G.msgT > 0) {
    G.msgT -= dt;
    if (G.msgT <= 0) el.classList.remove('show');
    return;
  }
  const m = G.msgQ.shift();
  if (m) {
    el.textContent = m.text;
    el.classList.add('show');
    G.msgT = m.dur;
  }
}

// ---------- commands ----------
let stayMode = false;
function doCall() {
  audio.play('motherCall');
  let heard = 0;
  for (const c of cubs) if (c.command('call', mother.position)) heard++;
  if (heard < cubs.length) showMsg('One cub ignores your call. Siku is still learning to listen.', 3);
}
function doStayFollow() {
  stayMode = !stayMode;
  audio.play('motherCall', { volume: 0.3 });
  for (const c of cubs) c.command(stayMode ? 'stay' : 'follow', mother.position);
  showMsg(stayMode
    ? 'You signal the cubs to stay. Cubs left behind are safe from the hunt — but learn nothing from it.'
    : 'You signal the cubs to follow.', 3.5);
}
function doNurse() {
  if (G.over) return;
  const near = cubs.filter((c) => c.alive && c.pos.distanceTo(G.pos) < 4);
  if (!near.length) { showMsg('Your cubs are not close enough to nurse.', 2.5); return; }
  if (G.energy < 0.08) { showMsg('You are too starved to produce milk. You need to eat.', 3); return; }
  const cost = 0.04 * near.length;
  G.energy = Math.max(0, G.energy - cost);
  for (const c of near) c.feed(0.12);
  audio.play('eat', { volume: 0.35 });
  showMsg('You nurse the cubs. Your own reserves burn away — milk is made of you.', 3.5);
}

function doRest() {
  if (G.resting) { stopResting(); return; }
  G.resting = true;
  const sheltered = world.nearShelter(G.pos.x, G.pos.z);
  showMsg(sheltered
    ? 'You settle in the lee of the pressure ridge. The wind passes over you. The cubs press into your fur.'
    : 'You lie down on the open ice to rest. Without a ridge to break the wind, the storm will still find you.', 4.5);
  for (const c of cubs) if (c.alive && c.pos.distanceTo(G.pos) < 12) c.stateLabel = 'sleeping against you';
}
function stopResting() {
  if (G.resting) G.resting = false;
}
function doPlay() {
  if (G.playT > 0) return;
  const near = cubs.filter((c) => c.alive && c.pos.distanceTo(G.pos) < 6 && !c.inWater);
  if (!near.length) { showMsg('The cubs are not close enough to play.', 2.5); return; }
  G.playT = 7;
  G.bond = Math.min(0.3, G.bond + 0.1);
  for (const c of near) {
    c.playUntil = c.animT + 7;
    c.obedience = Math.min(0.98, c.obedience + 0.07);
  }
  audio.play('cubCall', { volume: 0.5 });
  showMsg('You drop your head and shove a cub into a snowdrift. For a few minutes, the Arctic is just a playground. (Their trust in you grows.)', 5);
}

// ---------- hunt ----------
function scentStrength() {
  // scent carries downwind from the seal, but at close range you smell it
  // regardless — the wind only decides how far the scent cone reaches.
  if (G.sealState === 'dead' || G.sealState === 'gone') return 0;
  const toBear = new THREE.Vector2(G.pos.x - world.holePos.x, G.pos.z - world.holePos.z);
  const dist = toBear.length();
  if (dist > 150) return 0;
  const dirFromSeal = toBear.clone().normalize();
  const alignment = Math.max(0, dirFromSeal.dot(G.wind));
  const downwindScent = Math.pow(alignment, 0.6) * Math.max(0, 1 - dist / 150);
  const nearScent = Math.max(0, 1 - dist / 45) * 0.7; // omni-directional at close range
  return Math.max(downwindScent, nearScent);
}

// hint pump: as the scent band changes, tell the player in words
let lastScentBand = 0, scentHintCooldown = 0;
function scentHints(dt) {
  scentHintCooldown = Math.max(0, scentHintCooldown - dt);
  const s = scentStrength();
  const band = s > 0.5 ? 3 : s > 0.2 ? 2 : s > 0.05 ? 1 : 0;
  if (band !== lastScentBand && scentHintCooldown <= 0) {
    const toHole = new THREE.Vector2(world.holePos.x - G.pos.x, world.holePos.z - G.pos.z);
    const compass = ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'][
      Math.round(((Math.atan2(toHole.x, toHole.y) * 180 / Math.PI + 360) % 360) / 45) % 8];
    if (band > lastScentBand) {
      if (band === 1) showMsg(`A thread of scent on the wind — seal, somewhere to the ${compass}. Birds circle where seals breathe.`, 4);
      if (band === 2) showMsg(`The scent is getting STRONGER. The breathing hole is ${compass} of you.`, 3.5);
      if (band === 3) showMsg('The scent is thick — you are close. Stalk now (C), and stay downwind.', 4);
    } else if (band === 0 && lastScentBand >= 2) {
      showMsg('The scent thins out. You are moving away, or the wind has turned.', 3);
    }
    scentHintCooldown = 6;
    lastScentBand = band;
  } else if (band === lastScentBand) {
    lastScentBand = band;
  }
}

function sealCanSmellBear() {
  const toSeal = new THREE.Vector2(world.holePos.x - G.pos.x, world.holePos.z - G.pos.z);
  const dist = toSeal.length();
  if (dist > 55) return 0;
  const dirFromBear = toSeal.clone().normalize();
  const alignment = dirFromBear.dot(G.wind); // 1 = seal is downwind of bear → smells you
  return Math.max(0, alignment) * Math.max(0, 1 - dist / 55);
}

function doPounce() {
  const distHole = G.pos.distanceTo(world.holePos);
  // face off against a male bear
  for (const npc of [rival, ...scavengers]) {
    if (npc.state !== 'dormant' && npc.state !== 'flee' && npc.pos.distanceTo(G.pos) < 8) {
      audio.play('pounce');
      const won = npc.contest(G.energy);
      G.energy = Math.max(0, G.energy - 0.04);
      if (won) {
        G.rivalsDriven++;
        let watched = 0;
        for (const c of cubs) if (c.alive && c.pos.distanceTo(G.pos) < 25) { watched++; c.obedience = Math.min(0.98, c.obedience + 0.05); }
        showMsg(`You rise to your full height and ROAR. The ${npc.name} weighs the fight — and backs away.${watched ? ' Your cubs watched you stand your ground.' : ''}`, 5);
      } else {
        G.energy = Math.max(0, G.energy - 0.08);
        const knock = G.pos.clone().sub(npc.pos).setY(0).normalize();
        G.pos.addScaledVector(knock, 4);
        showMsg(`The ${npc.name} does not move. He swats you aside — you are giving away two hundred pounds. Take the cubs and go.`, 5);
      }
      return;
    }
  }
  // rescue takes priority: pull a cub from the water
  for (const c of cubs) {
    if (c.inWater && c.pos.distanceTo(G.pos) < 5) {
      c.pos.copy(G.pos).add(new THREE.Vector3(1.5, 0, 0));
      c.waterTimer = 0; c.inWater = false; c.state = 'follow';
      c.stateLabel = 'pulled from the water — trembling';
      G.cubRescues++;
      G.energy = Math.max(0, G.energy - 0.04);
      audio.play('splash');
      showMsg(`You haul ${c.name} out of the sea by the scruff. The cold has taken something, but not the cub.`, 4);
      return;
    }
  }
  if (G.sealState === 'hauled' && distHole < 8) {
    audio.play('pounce');
    // success depends on preparation: stalking + seal calm + close
    const stealthBonus = G.stalking ? 0.35 : 0;
    const calmBonus = (1 - G.sealAlert) * 0.5;
    const closeBonus = distHole < 5 ? 0.25 : 0.1;
    const odds = stealthBonus + calmBonus + closeBonus; // well-planned ≈ 1.0, sloppy ≈ 0.3
    if (Math.random() < odds) {
      G.sealState = 'dead';
      G.kills++;
      G.carcass = 1;
      G.killPos = world.holePos.clone();
      seal.position.copy(world.holePos).add(new THREE.Vector3(2.5, 0.1, 0));
      seal.rotation.z = 0.4;
      showMsg('THE KILL. Months of hunger end in three seconds of violence. The ice is red.', 5, true);
      G.rivalTimer = 30 + Math.random() * 20; // blood on the wind travels
      // teaching moment — cubs that can see this learn
      let watched = 0;
      for (const c of cubs) if (c.alive && c.observeKill(c.pos.distanceTo(G.pos))) watched++;
      if (watched) setTimeout(() => showMsg(
        watched === 2 ? 'Both cubs watched everything. This is how hunting is passed down.'
                      : 'One cub watched the kill and learned. The other saw nothing.', 5), 5200);
    } else {
      G.sealState = 'diving';
      G.sealResurface = 25 + Math.random() * 15;
      G.sealAlert = 1;
      audio.play('splash');
      showMsg('MISSED. The seal is gone into the dark water. It will be warier now — if it returns at all.', 4.5);
      G.energy = Math.max(0, G.energy - 0.03);
    }
  }
}

// ---------- eat / feed at carcass ----------
function updateCarcass(dt) {
  if (G.sealState !== 'dead' || G.carcass <= 0) return;
  const d = G.pos.distanceTo(seal.position);
  if (d < 3.5 && keys['KeyF']) {
    const bite = dt * 0.08;
    G.carcass = Math.max(0, G.carcass - bite);
    G.energy = Math.min(1, G.energy + bite * 1.4);
    audio.play('eat', { volume: 0.15 });
  }
  // cubs eat automatically at the carcass if they've learned enough boldness
  for (const c of cubs) {
    if (c.alive && c.pos.distanceTo(seal.position) < 3 && G.carcass > 0) {
      const bite = dt * 0.03;
      G.carcass = Math.max(0, G.carcass - bite);
      c.fed = Math.min(1, c.fed + bite * 2.2);
      if (c.fed > 0.9) c.stateLabel = 'belly full, blood on its muzzle';
      else c.stateLabel = 'eating at the carcass';
    }
  }
}

// ---------- prompt ----------
function updatePrompt() {
  const el = $('prompt');
  let text = '';
  for (const c of cubs) {
    if (c.inWater && c.pos.distanceTo(G.pos) < 5) text = `<b>SPACE</b> — pull ${c.name} from the water!`;
  }
  if (!text && G.sealState === 'hauled' && G.pos.distanceTo(world.holePos) < 8) {
    text = '<b>SPACE</b> — pounce!';
  }
  if (!text && G.sealState === 'dead' && G.carcass > 0 && G.pos.distanceTo(seal.position) < 3.5) {
    text = '<b>hold F</b> — feed';
  }
  if (!text) {
    for (const npc of [rival, ...scavengers]) {
      if (npc.state === 'threat' && npc.pos.distanceTo(G.pos) < 9) {
        text = `<b>SPACE</b> — stand your ground against the ${npc.name}`;
      }
    }
  }
  if (!text && G.pos.distanceTo(world.whalePos) < 5 && G.whale > 0) {
    text = '<b>hold F</b> — feed on the whale';
  }
  if (!text && cubs.some((c) => c.alive && c.pos.distanceTo(G.pos) < 4 && c.fed < 0.5) && G.sealState !== 'dead') {
    text = '<b>F</b> — nurse cubs (costs your energy)';
  }
  if (!text && G.stormIntensity > 0.15 && world.nearShelter(G.pos.x, G.pos.z) && !G.resting) {
    text = '<b>R</b> — shelter behind the ridge';
  }
  el.innerHTML = text;
  el.classList.toggle('show', !!text);
}

// ---------- mother movement ----------
function updateMother(dt) {
  if (G.resting) {
    // resting: no movement, no drain (sheltered) or reduced drain (open)
    const sheltered = world.nearShelter(G.pos.x, G.pos.z);
    const drain = sheltered ? 0 : G.stormIntensity * 0.0009;
    G.energy = Math.max(0, G.energy - drain * dt);
    animateGait(mother, 0, G.t, false);
    // sleeping cubs stop burning fat
    for (const c of cubs) if (c.alive && c.pos.distanceTo(G.pos) < 6) c.fed = Math.min(1, c.fed + dt * 0.0004);
    return;
  }
  const fwd = new THREE.Vector3();
  if (keys['KeyW']) fwd.z += 1;
  if (keys['KeyS']) fwd.z -= 1;
  let turn = 0;
  if (keys['KeyA']) turn += 1;
  if (keys['KeyD']) turn -= 1;
  G.heading += turn * dt * 2.2;

  const running = keys['ShiftLeft'] || keys['ShiftRight'];
  const base = G.stalking ? 1.6 : running ? 7.5 : 4.0;
  const starving = G.energy < 0.12 ? 0.55 : 1;
  const want = fwd.z > 0 ? base * starving : fwd.z < 0 ? -1.5 : 0;
  G.vel = THREE.MathUtils.lerp(G.vel, want, dt * 4);

  const dir = new THREE.Vector3(Math.sin(G.heading), 0, Math.cos(G.heading));
  G.pos.addScaledVector(dir, G.vel * dt);
  G.pos.x = THREE.MathUtils.clamp(G.pos.x, -110, 110);
  G.pos.z = THREE.MathUtils.clamp(G.pos.z, -110, 110);

  // energy drain per second: walking is nearly free, sprinting is expensive
  const drain = 0.0003 + Math.abs(G.vel) * (running ? 0.0009 : 0.00006) + G.stormIntensity * 0.0006;
  G.energy = Math.max(0, G.energy - drain * dt);

  // thin ice: mother is heavy → breaks through
  G.inWater = false;
  if (world.inLead(G.pos.x, G.pos.z)) {
    G.inWater = true;
    G.pos.z += world.lead.current * dt; // the current drags the family south
  }
  for (const p of world.thinIce) {
    const d = Math.hypot(G.pos.x - p.x, G.pos.z - p.z);
    if (d < p.r) {
      if (!p.broken) {
        p.broken = true;
        p.mesh.material = p.mesh.material.clone();
        p.mesh.material.color.set(0x0d2536);
        audio.play('iceCrack');
        showMsg('The ice SHATTERS under your weight. This crossing is gone — for everyone, for the rest of the season.', 4.5, true);
      }
      G.inWater = true;
    }
  }
  if (G.inWater) {
    G.waterT += dt;
    G.vel *= 0.5;
    G.energy = Math.max(0, G.energy - dt * 0.008);
  } else G.waterT = 0;

  const gy = world.groundHeight(G.pos.x, G.pos.z);
  G.pos.y = G.inWater ? gy - 0.5 : gy;

  // breadcrumb trail: cubs follow this with a personal delay
  if (!mother.userData.trail) mother.userData.trail = [];
  G.trailT = (G.trailT ?? 0) - dt;
  if (G.trailT <= 0) {
    mother.userData.trail.push({ p: G.pos.clone(), t: G.t });
    if (mother.userData.trail.length > 90) mother.userData.trail.shift();
    G.trailT = 0.12;
  }

  mother.position.copy(G.pos);
  mother.userData.baseY = G.pos.y;
  mother.rotation.y = G.heading - Math.PI / 2;
  animateGait(mother, Math.abs(G.vel) / 7.5, G.t, G.stalking);

  // tracks in the snow
  G.printDist = (G.printDist || 0) + Math.abs(G.vel) * dt;
  if (G.printDist > 0.85 && !G.inWater) {
    G.printSide = -(G.printSide || 1);
    world.addFootprint(G.pos.x, G.pos.z, G.heading, G.printSide, 1);
    G.printDist = 0;
  }
  // breath vapor in the cold
  G.breathT = (G.breathT || 0) - dt;
  if (G.breathT <= 0 && !G.inWater) {
    const head = G.pos.clone().add(new THREE.Vector3(Math.sin(G.heading) * 1.5, 1.35 - (G.stalking ? 0.4 : 0), Math.cos(G.heading) * 1.5));
    world.emitBreath(head, new THREE.Vector3(Math.sin(G.heading) * 0.6, 0.1, Math.cos(G.heading) * 0.6));
    G.breathT = Math.abs(G.vel) > 5 ? 1.1 : 2.4; // pants when running
  }

  // sound of movement alerts the seal
  if (G.sealState === 'hauled') {
    const d = G.pos.distanceTo(world.holePos);
    const noise = Math.abs(G.vel) * (G.stalking ? 0.15 : running ? 1.6 : 0.7);
    const heard = Math.max(0, noise * (1 - d / 45));
    const smelled = sealCanSmellBear() * 1.2;
    G.sealAlert = THREE.MathUtils.clamp(G.sealAlert + (heard + smelled) * dt * 0.25 - dt * 0.02, 0, 1);
    if (G.sealAlert >= 1) {
      G.sealState = 'diving';
      G.sealResurface = 30 + Math.random() * 20;
      audio.play('splash');
      showMsg(d < 25
        ? 'The seal caught your scent on the wind and is gone. Approach from DOWNWIND — check the compass.'
        : 'Something spooked the seal. It slipped into the hole.', 4.5);
    }
  }
}

// ---------- seal ----------
function updateSeal(dt) {
  if (G.sealState === 'hauled') {
    seal.position.copy(world.holePos).add(new THREE.Vector3(1.8, 0.05, 0.5));
    seal.rotation.y = Math.sin(G.t * 0.3) * 0.3;
    // nervous animation when alert
    seal.position.y += Math.abs(Math.sin(G.t * (2 + G.sealAlert * 8))) * 0.05 * G.sealAlert;
  } else if (G.sealState === 'diving') {
    seal.position.y = THREE.MathUtils.lerp(seal.position.y, world.holePos.y - 2, dt * 3);
    G.sealResurface -= dt;
    if (G.sealResurface <= 0) {
      if (G.pos.distanceTo(world.holePos) > 20) {
        G.sealState = 'hauled';
        G.sealAlert = 0.4; // returns warier
        showMsg('The seal hauls out again. It is nervous now. You will not get a second mistake.', 4);
      } else {
        G.sealResurface = 8; // waits until bear moves off
      }
    }
  }
}

// ---------- wind & storm ----------
function updateWeather(dt) {
  G.windTimer -= dt;
  if (G.windTimer <= 0) {
    G.windTimer = 35 + Math.random() * 30;
    const a = Math.random() * Math.PI * 2;
    G.wind.set(Math.sin(a), Math.cos(a));
    showMsg('The wind shifts. Everything you knew about the approach just changed.', 3.5);
  }
  // wind arrow: shows direction wind blows toward, in screen/world terms
  const deg = Math.atan2(G.wind.x, -G.wind.y) * 180 / Math.PI;
  $('windArrow').style.transform = `rotate(${deg}deg)`;

  // storm ramps over final 90s
  G.stormLeft = Math.max(0, G.stormLeft - dt);
  G.stormIntensity = THREE.MathUtils.clamp((90 - G.stormLeft) / 90, 0, 1);
  if (G.stormIntensity > 0) {
    scene.fog.near = THREE.MathUtils.lerp(70, 8, G.stormIntensity);
    scene.fog.far = THREE.MathUtils.lerp(230, 32, G.stormIntensity);
    document.getElementById('vignette').style.opacity = G.stormIntensity * 0.9;
    audio.setStorm(G.stormIntensity);
  }
  world.updateSnow(dt, G.pos, camera.position, G.wind, G.stormIntensity, G.t);
}

// ---------- NPC bears ----------
let scavengersSpawned = false;
function updateNPCs(dt) {
  // rival male arrives downwind of the kill
  if (G.rivalTimer > 0) {
    G.rivalTimer -= dt;
    if (G.rivalTimer <= 0 && G.sealState === 'dead' && G.carcass > 0.1) {
      const dir = new THREE.Vector2(G.wind.x, G.wind.y).normalize();
      rival.spawn(world.holePos.x + dir.x * 55, world.holePos.z + dir.y * 55, seal.position);
      showMsg('Movement on the wind-side ridge. A male — twice your weight — has smelled the kill. Decide: defend the carcass, or take the cubs and go.', 6, true);
      audio.play('motherCall', { volume: 0.4 });
    }
  }
  rival.update(dt, mother.position, G.sealState === 'dead' ? seal.position : null,
    (d) => { G.carcass = Math.max(0, G.carcass - d * 0.05); });

  // scavengers guard the whale from the start
  if (!scavengersSpawned && G.running) {
    scavengersSpawned = true;
    scavengers[0].spawn(world.whalePos.x + 4, world.whalePos.z + 2, world.whalePos);
    scavengers[1].spawn(world.whalePos.x - 5, world.whalePos.z - 3, world.whalePos);
  }
  for (const sc of scavengers) {
    sc.update(dt, mother.position, world.whalePos, (d) => { G.whale = Math.max(0, G.whale - d * 0.012); });
  }
  // publish danger positions for cub AI
  world.dangers = [rival, ...scavengers].filter((n) => n.state !== 'dormant' && n.state !== 'flee').map((n) => n.pos);
}

// ---------- whale carcass ----------
let whaleIntro = false;
function updateWhale(dt) {
  const d = G.pos.distanceTo(world.whalePos);
  if (!whaleIntro && d < 45) {
    whaleIntro = true;
    showMsg('A dead whale, half-eaten, guarded by two males. A month of food — if you can reach it. Charge them, or circle downwind and steal from the far side.', 7, true);
  }
  if (d < 5 && G.whale > 0 && keys['KeyF']) {
    const guards = scavengers.filter((sc) => sc.state !== 'dormant' && sc.state !== 'flee');
    const alerted = guards.some((sc) => sc.pos.distanceTo(G.pos) < 12);
    if (!alerted || guards.length === 0) {
      const bite = dt * 0.06;
      G.whale = Math.max(0, G.whale - bite);
      G.whaleAte += bite;
      G.energy = Math.min(1, G.energy + bite * 1.3);
      audio.play('eat', { volume: 0.12 });
      for (const c of cubs) {
        if (c.alive && c.pos.distanceTo(world.whalePos) < 7) c.fed = Math.min(1, c.fed + bite * 1.5);
      }
    }
  }
}

// ---------- chapters ----------
function updateChapters() {
  if (G.chapter === 0 && G.t > 2) { G.chapter = 1; showChapter('ACT I', 'The Den'); }
  else if (G.chapter === 1 && G.pos.z > 15) { G.chapter = 2; showChapter('ACT II', 'The Sea Ice'); }
  else if (G.chapter === 2 && G.stormLeft < 90) { G.chapter = 3; showChapter('ACT III', 'The Storm'); }
}
function showChapter(act, title) {
  const el = $('chapter');
  el.innerHTML = `<div class="act">${act}</div><div class="ctitle">${title}</div>`;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3600);
}

// ---------- HUD ----------
function updateHUD() {
  $('energyBar').style.width = `${G.energy * 100}%`;
  $('energyVal').textContent = `${Math.round(G.energy * 100)}%`;
  const [siku, nukka] = cubs;
  $('sikuBar').style.width = `${siku.fed * 100}%`;
  $('sikuVal').textContent = `${Math.round(siku.fed * 100)}%`;
  $('sikuState').textContent = siku.alive ? siku.stateLabel : '✝ lost';
  $('nukkaBar').style.width = `${nukka.fed * 100}%`;
  $('nukkaVal').textContent = `${Math.round(nukka.fed * 100)}%`;
  $('nukkaState').textContent = nukka.alive ? nukka.stateLabel : '✝ lost';

  const s = scentStrength();
  const scentEl = $('scent');
  const v = $('scentVal');
  if (s > 0.5) { v.textContent = 'STRONG'; scentEl.className = 'hot'; }
  else if (s > 0.2) { v.textContent = 'clear'; scentEl.className = 'warm'; }
  else if (s > 0.05) { v.textContent = 'faint'; scentEl.className = 'warm'; }
  else { v.textContent = '—'; scentEl.className = 'cold'; }
  // scent arrow points toward the source, relative to the camera view
  const arrow = $('scentArrow');
  if (s > 0.05) {
    const worldAngle = Math.atan2(world.holePos.x - G.pos.x, world.holePos.z - G.pos.z);
    const camAngle = Math.atan2(camera.position.x - G.pos.x, camera.position.z - G.pos.z) + Math.PI;
    const rel = (worldAngle - camAngle) * 180 / Math.PI;
    arrow.style.transform = `rotate(${rel}deg)`;
    arrow.style.opacity = 0.4 + s * 0.6;
  } else {
    arrow.style.opacity = 0.15;
  }

  const m = Math.floor(G.stormLeft / 60), sec = Math.floor(G.stormLeft % 60);
  $('stormT').textContent = `${m}:${String(sec).padStart(2, '0')}`;
  $('storm').classList.toggle('urgent', G.stormLeft < 60);

  const st = $('stance');
  st.textContent = G.resting ? 'Resting' : G.inWater ? 'Swimming' : G.stalking ? 'Stalking' : 'Walking';
  st.classList.toggle('stalking', G.stalking);
}

// ---------- camera ----------
const camOffset = new THREE.Vector3();
function updateCamera(dt) {
  const behind = new THREE.Vector3(Math.sin(G.heading), 0, Math.cos(G.heading)).multiplyScalar(-9);
  camOffset.lerp(behind, 1 - Math.exp(-3 * dt));
  const target = G.pos.clone().add(camOffset).add(new THREE.Vector3(0, 5.2 - (G.stalking ? 1.5 : 0), 0));
  camera.position.lerp(target, 1 - Math.exp(-4 * dt));
  camera.lookAt(G.pos.x, G.pos.y + 1.6, G.pos.z);
}

// ---------- fail / win ----------
function checkEnd() {
  if (G.over) return;
  // cub drown check: 20s in water
  for (const c of cubs) {
    if (c.alive && c.waterTimer > 20) {
      c.alive = false;
      c.mesh.visible = false;
      endGame(false, `${c.name} slipped beneath the ice while you were too far away. The Arctic does not give second chances it hasn't announced. You were warned by every dark patch of ice.`);
      return;
    }
  }
  if (G.energy <= 0) {
    endGame(false, 'Your reserves are gone. A mother who starves feeds no one. The cubs press against your flanks as the snow begins to cover all three of you.');
    return;
  }
  if (G.stormLeft <= 0) {
    const fedCubs = cubs.filter((c) => c.alive && c.fed > 0.5).length;
    const learned = cubs.filter((c) => c.alive && c.hunting > 0.3).length;
    if (fedCubs === 2 && G.energy > 0.3) {
      endGame(true, `The storm swallows the ice — but it does not matter. Both cubs are fed, your reserves are rebuilt, and you know where the seals breathe. ${learned === 2 ? 'Both cubs watched you kill. In two winters, they will do it themselves.' : learned === 1 ? 'One cub watched the kill and will remember. The other has more to learn.' : 'Neither cub saw the hunt. They are fed — but they learned nothing today.'}`);
    } else if (fedCubs >= 1) {
      endGame(true, 'You survive the storm huddled behind a pressure ridge — alive, but the hunger is not finished with this family. Tomorrow the hunt begins again, with less ice than today.');
    } else {
      endGame(false, 'The storm arrives and the cubs are still empty. They are too weak to hold their body heat through the night. You did everything the Arctic allowed — it was not enough.');
    }
  }
}

function endGame(won, body) {
  G.over = true;
  const [siku, nukka] = cubs;
  $('endTitle').textContent = won ? 'The Family Endures' : 'The Thaw Takes Its Toll';
  $('endBody').textContent = body;
  const lessons = [];
  lessons.push(`Hunts: ${G.kills} kill${G.kills === 1 ? '' : 's'}`);
  lessons.push(`Siku — fed ${Math.round(siku.fed * 100)}%, hunting knowledge ${Math.round(siku.hunting * 100)}%`);
  lessons.push(`Nukka — fed ${Math.round(nukka.fed * 100)}%, hunting knowledge ${Math.round(nukka.hunting * 100)}%`);
  if (G.cubRescues) lessons.push(`Cubs pulled from the water: ${G.cubRescues}`);
  const broken = world.thinIce.filter((p) => p.broken).length;
  if (broken) lessons.push(`Ice crossings destroyed forever: ${broken}`);
  if (G.rivalsDriven) lessons.push(`Male bears faced down: ${G.rivalsDriven}`);
  if (G.whaleAte > 0.05) lessons.push(`Fed from the whale carcass`);
  if (G.bond > 0) lessons.push(`Bond built through play: ${Math.round(G.bond * 333)}%`);
  if (LEGACY.gen > 1) lessons.push(`Generation ${LEGACY.gen} of the bloodline`);
  $('endLessons').innerHTML = lessons.map((l) => `• ${l}`).join('<br/>');
  $('endScreen').classList.remove('hidden');
  offerLegacy(won);
  audio.play(won ? 'narratorWin' : 'narratorLoss', { volume: 0.8 });
}

// ---------- generations (Survival Legacy) ----------
const LEGACY = (() => { try { return JSON.parse(localStorage.getItem('btt_legacy')); } catch { return null; } })() || { gen: 1, hunting: 0, bond: 0 };

function offerLegacy(won) {
  const survivor = cubs.find((c) => c.alive);
  const btn = $('legacyBtn');
  if (!survivor) { btn.style.display = 'none'; return; }
  btn.style.display = '';
  btn.textContent = `Continue the line — ${survivor.name}, Winter ${['I','II','III','IV','V','VI','VII'][LEGACY.gen] ?? LEGACY.gen + 1}`;
  btn.onclick = () => {
    localStorage.setItem('btt_legacy', JSON.stringify({
      gen: LEGACY.gen + 1,
      hunting: Math.max(...cubs.filter((c) => c.alive).map((c) => c.hunting)),
      bond: G.bond,
    }));
    location.reload();
  };
}

// ---------- opening beats ----------
function openingScript() {
  showMsg('Four months in the den. You have eaten nothing. Your body made milk out of itself.', 5);
  setTimeout(() => showMsg('North, across the ice: a seal scent on the wind. Follow it — but watch the compass. Approach from downwind.', 6), 5500);
  setTimeout(() => showMsg('Your cubs will follow you everywhere. What they watch you do, they learn. What they never see, they never learn.', 6), 12500);
}

// ---------- boot ----------
function reset() {
  G.running = true; G.over = false;
  G.pos.set(0, 0, -66); G.heading = 0; G.energy = 0.5;
  G.stormLeft = G.stormTotal; G.sealState = 'hauled'; G.sealAlert = 0;
  G.carcass = 0; G.kills = 0; G.cubRescues = 0; G.stalking = false;
  cubs[0].place(-2.5, -68); cubs[1].place(2.5, -68);
  for (const c of cubs) {
    c.alive = true; c.mesh.visible = true; c.fed = 0.15; c.state = 'follow';
    // inherited instinct: knowledge passes down the mother line
    c.hunting = LEGACY.hunting * 0.4;
    c.obedience = Math.min(0.95, c.obedience + LEGACY.bond * 0.5 + (LEGACY.gen - 1) * 0.03);
    c.stamina = 1; c.playUntil = 0;
  }
  rival.despawn(); for (const sc of scavengers) sc.despawn();
  scavengersSpawned = false; whaleIntro = false;
  G.whale = 1; G.whaleAte = 0; G.rivalTimer = -1; G.rivalsDriven = 0;
  G.bond = 0; G.playT = 0; G.chapter = 0; G.resting = false;
  if (LEGACY.gen > 1) showMsg(`Winter ${['','','II','III','IV','V','VI'][LEGACY.gen] ?? LEGACY.gen} of this bloodline. The instincts of the mothers before you stir in the cubs.`, 6);
  for (const p of world.thinIce) { p.broken = false; }
  scene.fog.near = 70; scene.fog.far = 230;
  document.getElementById('vignette').style.opacity = 0;
  openingScript();
}

$('startBtn').addEventListener('click', async () => {
  $('titleScreen').classList.add('hidden');
  hud.style.display = 'block';
  await audio.start();
  audio.play('narratorIntro', { volume: 0.9 });
  reset();
});
$('retryBtn').addEventListener('click', () => {
  $('endScreen').classList.add('hidden');
  reset();
});

// dev console handle (vite dev only)
if (import.meta.env.DEV) window.__dev = { G, world, cubs, doPounce };

// ---------- loop ----------
const clock = new THREE.Clock();
function tick() {
  requestAnimationFrame(tick);
  const dt = Math.min(clock.getDelta(), 0.05);
  G.t += dt;
  if (G.running && !G.over) {
    updateMother(dt);
    for (const c of cubs) c.update(dt, mother, cubs, G.stormIntensity);
    updateSeal(dt);
    updateNPCs(dt);
    updateWhale(dt);
    updateChapters();
    G.playT = Math.max(0, G.playT - dt);
    updateWeather(dt);
    world.updateAmbient(dt, G.t, G.sealState === 'hauled' || G.sealState === 'diving');
    scentHints(dt);
    updateCarcass(dt);
    updatePrompt();
    updateHUD();
    pumpMsg(dt);
    checkEnd();
  }
  updateCamera(dt);
  composer.render();
}
tick();

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
});
addEventListener('keyup', (e) => { keys[e.code] = false; });

// ---------- HUD refs ----------
const $ = (id) => document.getElementById(id);
const hud = $('hud');

function showMsg(text, dur = 4) {
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
      showMsg('THE KILL. Months of hunger end in three seconds of violence. The ice is red.', 5);
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
  if (!text && cubs.some((c) => c.alive && c.pos.distanceTo(G.pos) < 4 && c.fed < 0.5) && G.sealState !== 'dead') {
    text = '<b>F</b> — nurse cubs (costs your energy)';
  }
  el.innerHTML = text;
  el.classList.toggle('show', !!text);
}

// ---------- mother movement ----------
function updateMother(dt) {
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
  for (const p of world.thinIce) {
    const d = Math.hypot(G.pos.x - p.x, G.pos.z - p.z);
    if (d < p.r) {
      if (!p.broken) {
        p.broken = true;
        p.mesh.material = p.mesh.material.clone();
        p.mesh.material.color.set(0x0d2536);
        audio.play('iceCrack');
        showMsg('The ice SHATTERS under your weight. This crossing is gone — for everyone, for the rest of the season.', 4.5);
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
  st.textContent = G.inWater ? 'Swimming' : G.stalking ? 'Stalking' : 'Walking';
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
  $('endLessons').innerHTML = lessons.map((l) => `• ${l}`).join('<br/>');
  $('endScreen').classList.remove('hidden');
  audio.play(won ? 'narratorWin' : 'narratorLoss', { volume: 0.8 });
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
  for (const c of cubs) { c.alive = true; c.mesh.visible = true; c.fed = 0.15; c.hunting = 0; c.state = 'follow'; }
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

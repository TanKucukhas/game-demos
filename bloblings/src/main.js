import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Character } from './character.js';
import { World } from './world.js';
import { PRESETS, hydrate, randomSpec, propSpecs } from './critters.js';

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(46, innerWidth / innerHeight, 0.1, 150);
camera.position.set(7, 4.6, 9);

const qs = new URLSearchParams(location.search);
if (qs.get('cam')) {
  const [x, y, z, tx, ty, tz] = qs.get('cam').split(',').map(Number);
  camera.position.set(x, y, z);
  var camTarget = new THREE.Vector3(tx || 0, ty || 0.7, tz || 0);
}

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(typeof camTarget !== 'undefined' ? camTarget : new THREE.Vector3(0, 0.7, 0));
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.maxPolarAngle = 1.45;
controls.minDistance = 3;
controls.maxDistance = 20;
controls.autoRotate = !qs.get('cam');
controls.autoRotateSpeed = 0.35;
controls.addEventListener('start', () => { controls.autoRotate = false; });

// uniform value-objects shared by every material; update once per frame
const globals = {
  uLightDir: { value: new THREE.Vector3() },              // view space
  uUpDir: { value: new THREE.Vector3() },
  uLightWorld: { value: new THREE.Vector3(0.5, 0.8, 0.35).normalize() },
  uFogColor: { value: new THREE.Color(0.78, 0.86, 0.95) },
  uFogRange: { value: new THREE.Vector2(20, 46) },
};

const world = new World(scene, globals);
const critters = [];
const MAX_CRITTERS = 12;

function spawn(rawSpec, x, z, celebrate = true) {
  const spec = rawSpec.archetype === 'prop' ? rawSpec : hydrate(rawSpec);
  const char = new Character(spec, globals, scene);
  char.rawSpec = rawSpec;
  char.root.position.set(x, 0, z);
  char.update(0.016, world);
  if (rawSpec.archetype !== 'prop') {
    critters.push(char);
    if (celebrate) {
      world.confetti(char.root.position, rawSpec.hue ?? 0.5);
      showJSON(char);
    }
    while (critters.length > MAX_CRITTERS) {
      const old = critters.shift();
      world.dustPool.burst(old.root.position.clone().setY(0.4), 10, 1, 0xffffff);
      old.dispose();
    }
  }
  return char;
}

const props = [];
for (const p of propSpecs()) props.push(spawn(p, p.pos[0], p.pos[1], false));

PRESETS.forEach((p, i) => {
  const a = (i / PRESETS.length) * Math.PI * 2 + 0.6;
  const char = qs.get('lineup')
    ? spawn(p, (i - (PRESETS.length - 1) / 2) * 1.9, 0, false)
    : spawn(p, Math.cos(a) * 3.2, Math.sin(a) * 3.2, false);
  char.pop = 1;
  if (qs.get('lineup')) { char.rig.brain.freeze = true; char.yaw = 0; }
});

// ------------------------------------------------------------------- UI
const jsonCard = document.getElementById('json-card');
function showJSON(char) {
  document.getElementById('json-name').textContent =
    `${char.rawSpec.name} · ${char.rawSpec.archetype}`;
  document.getElementById('json-body').textContent = JSON.stringify(char.rawSpec, null, 1);
  jsonCard.style.display = 'block';
  char.selectedPulse = 1;
}

document.getElementById('btn-new').onclick = () => {
  const a = Math.random() * Math.PI * 2, r = 1.5 + Math.random() * 4;
  spawn(randomSpec(), Math.cos(a) * r, Math.sin(a) * r);
};
document.getElementById('btn-sound').onclick = (e) => {
  e.target.textContent = world.audio.toggle() ? '🔊' : '🔇';
};
const info = document.getElementById('info');
document.getElementById('btn-info').onclick = () => { info.style.display = 'block'; };
document.getElementById('btn-info-x').onclick = () => { info.style.display = 'none'; };

// drag & drop critters; tap to select, tap ground to poke
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
let downAt = null, held = null;

function castRay(e) {
  ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(ndc, camera);
}
function pickCritter() {
  let best = null, bestT = 1e9;
  const sph = new THREE.Sphere(), hit = new THREE.Vector3();
  for (const c of critters) {
    sph.set(c.root.position.clone().setY(c.root.position.y + c.unit * 0.7), c.unit * 0.95);
    if (ray.ray.intersectSphere(sph, hit)) {
      const t = hit.distanceTo(camera.position);
      if (t < bestT) { bestT = t; best = c; }
    }
  }
  return best;
}
function holdHeight(c) { return c.unit * 0.9 + 0.3; }

renderer.domElement.addEventListener('pointerdown', (e) => {
  downAt = [e.clientX, e.clientY];
  castRay(e);
  const c = pickCritter();
  if (c) {
    held = c;
    c.held = true;
    c.fallV = 0;
    c.dragX = c.root.position.x;
    c.dragZ = c.root.position.z;
    if (c.rig.brain) c.rig.brain.freeze = true;
    controls.enabled = false;
    renderer.domElement.style.cursor = 'grabbing';
    world.audio.poke();
  }
});

addEventListener('pointermove', (e) => {
  if (!held) {
    castRay(e);
    renderer.domElement.style.cursor = pickCritter() ? 'grab' : '';
    return;
  }
  castRay(e);
  // slide along the plane at hold height so the critter stays under the cursor
  const t = (holdHeight(held) - ray.ray.origin.y) / ray.ray.direction.y;
  if (t > 0) {
    const p = ray.ray.origin.clone().addScaledVector(ray.ray.direction, t);
    held.dragX = THREE.MathUtils.clamp(p.x, -9, 9);
    held.dragZ = THREE.MathUtils.clamp(p.z, -9, 9);
  }
});

addEventListener('pointerup', (e) => {
  const wasHeld = held;
  if (held) {
    held.held = false;
    if (held.rig.brain) held.rig.brain.freeze = false;
    controls.enabled = true;
    renderer.domElement.style.cursor = '';
    held = null;
  }
  const tap = downAt && Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) <= 6;
  downAt = null;
  if (!tap) return;
  if (wasHeld) { showJSON(wasHeld); return; }
  castRay(e);
  if (ray.ray.direction.y < -0.02) {                    // poke the ground
    const t = -ray.ray.origin.y / ray.ray.direction.y;
    world.poke.pos.copy(ray.ray.origin).addScaledVector(ray.ray.direction, t);
    world.poke.timer = 2.2;
    world.dustPool.burst(world.poke.pos, 4, 0.5, 0xffffff);
    world.audio.poke();
  }
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// ------------------------------------------------------------------- loop
const stats = document.getElementById('stats');
const clock = new THREE.Clock();
let fpsAcc = 0, fpsN = 0, fps = 60;

function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), 0.033);
  fpsAcc += dt; fpsN++;
  if (fpsAcc > 0.5) { fps = Math.round(fpsN / fpsAcc); fpsAcc = 0; fpsN = 0; }

  world.update(dt);
  for (const c of critters) {
    const pos = c.root.position;
    if (c.held) {
      const k = 1 - Math.exp(-12 * dt);
      pos.x += (c.dragX - pos.x) * k;
      pos.z += (c.dragZ - pos.z) * k;
      pos.y += (holdHeight(c) - pos.y) * (1 - Math.exp(-9 * dt));
    } else if (pos.y > 0.001) {
      c.fallV = (c.fallV ?? 0) - 22 * dt;
      pos.y += c.fallV * dt;
      if (pos.y <= 0) {
        pos.y = 0;
        world.land(pos, Math.min(-c.fallV / 6, 1.2), c);
        c.selectedPulse = 0.9;
        c.fallV = 0;
      }
    }
    c.update(dt, world);
  }
  for (const p of props) p.update(dt, world);

  globals.uLightDir.value.copy(globals.uLightWorld.value).transformDirection(camera.matrixWorldInverse);
  globals.uUpDir.value.set(0, 1, 0).transformDirection(camera.matrixWorldInverse);

  controls.update();
  renderer.render(scene, camera);
  stats.textContent = `${critters.length} bloblings · ${fps} fps\nclick a critter · click the ground · drag to orbit`;
}
frame();

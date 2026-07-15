// Procedural creature models. If Meshy-generated GLBs exist in /models/,
// they are loaded instead (see tryLoadGLB). The procedural versions keep the
// game fully playable with zero external assets.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();

const FUR_WHITE = 0xf2efe6;
const FUR_CREAM = 0xe8e2d0;
const NOSE_DARK = 0x1a1a1a;

function furMat(color) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.95, metalness: 0 });
}

// Build a stylized low-poly bear out of primitives. scale ~1 = adult mother.
export function buildBear({ scale = 1, color = FUR_WHITE } = {}) {
  const g = new THREE.Group();
  const fur = furMat(color);
  const dark = furMat(NOSE_DARK);

  // torso
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.55, 1.1, 6, 12), fur);
  torso.rotation.z = Math.PI / 2;
  torso.position.y = 0.85;
  torso.scale.set(1, 1.05, 1.15);
  g.add(torso);

  // haunches
  const rump = new THREE.Mesh(new THREE.SphereGeometry(0.62, 12, 10), fur);
  rump.position.set(-0.75, 0.88, 0);
  rump.scale.set(1, 1, 1.05);
  g.add(rump);

  // shoulders/neck
  const neck = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.5, 6, 10), fur);
  neck.position.set(0.85, 1.15, 0);
  neck.rotation.z = -0.7;
  g.add(neck);

  // head
  const head = new THREE.Group();
  head.position.set(1.22, 1.42, 0);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 10), fur);
  skull.scale.set(1.15, 0.95, 0.9);
  head.add(skull);
  const muzzle = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.22, 6, 8), fur);
  muzzle.rotation.z = Math.PI / 2;
  muzzle.position.set(0.32, -0.06, 0);
  head.add(muzzle);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), dark);
  nose.position.set(0.48, -0.04, 0);
  head.add(nose);
  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.085, 8, 6), fur);
    ear.position.set(-0.05, 0.26, s * 0.2);
    head.add(ear);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), dark);
    eye.position.set(0.24, 0.08, s * 0.14);
    head.add(eye);
  }
  g.add(head);
  g.userData.head = head;

  // legs
  const legs = [];
  const legPos = [
    [0.6, 0.28], [0.6, -0.28],   // front
    [-0.72, 0.3], [-0.72, -0.3], // back
  ];
  for (const [x, z] of legPos) {
    const leg = new THREE.Group();
    leg.position.set(x, 0.75, z);
    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.55, 5, 8), fur);
    upper.position.y = -0.35;
    leg.add(upper);
    const paw = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 6), fur);
    paw.position.y = -0.72;
    paw.scale.set(1.25, 0.6, 1.1);
    leg.add(paw);
    g.add(leg);
    legs.push(leg);
  }
  g.userData.legs = legs;

  // stubby tail
  const tail = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), fur);
  tail.position.set(-1.32, 1.0, 0);
  g.add(tail);

  g.scale.setScalar(scale);
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; } });
  g.userData.baseY = 0;
  return g;
}

export function buildCub(color = FUR_CREAM) {
  const cub = buildBear({ scale: 0.42, color });
  // cubs are rounder
  cub.userData.head.scale.setScalar(1.25);
  return cub;
}

export function buildSeal() {
  const g = new THREE.Group();
  const body = furMat(0x5b6470);
  const belly = furMat(0x8b93a0);

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.9, 6, 12), body);
  torso.rotation.z = Math.PI / 2;
  torso.position.y = 0.3;
  torso.scale.set(1, 0.85, 1);
  g.add(torso);

  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), belly);
  chest.position.set(0.35, 0.26, 0);
  chest.scale.set(1.1, 0.8, 0.95);
  g.add(chest);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.19, 10, 8), body);
  head.position.set(0.75, 0.42, 0);
  g.add(head);
  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), body);
  snout.position.set(0.92, 0.38, 0);
  g.add(snout);
  for (const s of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 5), furMat(0x111111));
    eye.position.set(0.86, 0.48, s * 0.09);
    g.add(eye);
    const flipper = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), body);
    flipper.position.set(0.25, 0.12, s * 0.3);
    flipper.scale.set(1.4, 0.35, 0.7);
    flipper.rotation.y = s * 0.5;
    g.add(flipper);
  }
  const tailFlipper = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), body);
  tailFlipper.position.set(-0.62, 0.22, 0);
  tailFlipper.scale.set(1.3, 0.35, 1.0);
  g.add(tailFlipper);

  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return g;
}

// If Meshy-generated model exists, swap it in. Silent no-op on 404.
export async function tryUpgradeModel(group, url, targetHeight) {
  try {
    const head = await fetch(url, { method: 'HEAD' });
    if (!head.ok) return false;
    const type = head.headers.get('content-type') || '';
    if (type.includes('text/html')) return false; // dev-server SPA fallback, file absent
    const gltf = await loader.loadAsync(url);
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const s = targetHeight / Math.max(size.y, 0.001);
    model.scale.setScalar(s);
    box.setFromObject(model);
    model.position.y -= box.min.y;
    model.rotation.y = Math.PI / 2; // Meshy models face +Z; our rigs face +X
    model.traverse((o) => {
      if (o.isMesh) { o.castShadow = true; if (o.isSkinnedMesh) o.frustumCulled = false; }
    });
    // hide procedural parts; wrap model in a pivot for gait animation
    for (const child of [...group.children]) child.visible = false;
    const pivot = new THREE.Group();
    pivot.add(model);
    group.add(pivot);
    group.userData.upgraded = true;
    group.userData.pivot = pivot;
    // real skeletal animation (e.g. Anything World auto-rigged walk cycle)
    if (gltf.animations?.length) {
      const mixer = new THREE.AnimationMixer(model);
      const walk = gltf.animations.find((a) => /walk/i.test(a.name)) ?? gltf.animations[0];
      const action = mixer.clipAction(walk);
      action.play();
      group.userData.mixer = mixer;
      group.userData.walkAction = action;
    }
    return true;
  } catch { return false; }
}

// Simple procedural quadruped gait.
export function animateGait(bear, speed, t, stalking = false) {
  const legs = bear.userData.legs;
  if (bear.userData.upgraded) {
    const sp = Math.min(speed, 1);
    const dt = Math.min(Math.max(t - (bear.userData.lastT ?? t), 0), 0.05);
    bear.userData.lastT = t;
    const pivot = bear.userData.pivot;
    if (bear.userData.mixer) {
      // real rigged walk cycle: speed drives playback, idle fades it out
      const action = bear.userData.walkAction;
      action.timeScale = 0.4 + sp * 1.3;
      action.setEffectiveWeight(THREE.MathUtils.lerp(action.getEffectiveWeight(), sp > 0.04 ? 1 : 0.05, 0.12));
      bear.userData.mixer.update(dt);
      pivot.position.y = -(stalking ? 0.1 : 0);
      const breathe = 1 + Math.sin(t * 1.6) * 0.01 * (1 - sp);
      pivot.scale.set(1, breathe, 1);
      return;
    }
    // procedural gait for static Meshy models: trot bob + pitch sway + breathing
    const freq = stalking ? 5 : 9;
    pivot.position.y = Math.abs(Math.sin(t * freq)) * 0.09 * sp - (stalking ? 0.12 : 0);
    pivot.rotation.z = Math.sin(t * freq) * 0.045 * sp;          // pitch (forward is +X)
    pivot.rotation.x = Math.sin(t * freq * 0.5) * 0.06 * sp;     // body roll
    const breathe = 1 + Math.sin(t * 1.6) * 0.012 * (1 - sp);
    pivot.scale.set(1, breathe, 1);
    return;
  }
  if (!legs) return;
  const amp = stalking ? 0.25 : 0.55;
  const freq = stalking ? 5 : 8;
  const phaseOrder = [0, Math.PI, Math.PI, 0]; // diagonal pairs
  legs.forEach((leg, i) => {
    leg.rotation.z = Math.sin(t * freq + phaseOrder[i]) * amp * Math.min(speed, 1);
  });
  const head = bear.userData.head;
  if (head) {
    head.position.y = 1.42 + (stalking ? -0.35 : 0) + Math.sin(t * freq * 2) * 0.02 * speed;
    head.rotation.z = stalking ? 0.15 : 0;
  }
  bear.position.y = bear.userData.baseY + Math.abs(Math.sin(t * freq)) * 0.025 * Math.min(speed, 1)
    - (stalking ? 0.18 * bear.scale.x : 0);
}

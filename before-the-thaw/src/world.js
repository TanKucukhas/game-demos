// Arctic world: physical sky, low polar sun, snow terrain, thin-ice patches,
// breathing hole with circling birds, aurora, distant icebergs, snowfall.
import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';

export const WORLD_SIZE = 240;

export function createWorld(scene, renderer) {
  // --- physical sky + low arctic sun ---
  const sky = new Sky();
  sky.scale.setScalar(350);
  scene.add(sky);
  const sunDir = new THREE.Vector3().setFromSphericalCoords(
    1, THREE.MathUtils.degToRad(90 - 11), THREE.MathUtils.degToRad(205));
  const u = sky.material.uniforms;
  u.sunPosition.value.copy(sunDir);
  u.turbidity.value = 3.2;
  u.rayleigh.value = 1.7;
  u.mieCoefficient.value = 0.004;
  u.mieDirectionalG.value = 0.9;

  // environment reflections from the sky
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  const envSky = new Sky();
  envSky.scale.setScalar(350);
  Object.entries(u).forEach(([k, v]) => {
    if (envSky.material.uniforms[k]) {
      const val = v.value;
      envSky.material.uniforms[k].value = val.clone ? val.clone() : val;
    }
  });
  envScene.add(envSky);
  scene.environment = pmrem.fromScene(envScene, 0.02).texture;

  scene.fog = new THREE.Fog(0xc3d5e5, 70, 230);

  const hemi = new THREE.HemisphereLight(0xcfe2f5, 0x9fb4c9, 0.45);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0dd, 1.55); // warm low sun
  sun.position.copy(sunDir).multiplyScalar(140);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -90; sun.shadow.camera.right = 90;
  sun.shadow.camera.top = 90; sun.shadow.camera.bottom = -90;
  sun.shadow.camera.far = 400;
  sun.shadow.bias = -0.0004;
  scene.add(sun);

  // --- terrain: gently rolling snow ---
  const seg = 128;
  const geo = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, seg, seg);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const heightAt = (x, z) =>
    Math.sin(x * 0.045) * Math.cos(z * 0.05) * 1.4 +
    Math.sin(x * 0.11 + 3) * Math.sin(z * 0.09) * 0.6 +
    Math.sin(x * 0.31) * Math.cos(z * 0.27) * 0.18;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const shelf = THREE.MathUtils.smoothstep(z, -20, 20); // z>20 → flat sea ice
    pos.setY(i, heightAt(x, z) * (1 - shelf * 0.85));
  }
  geo.computeVertexNormals();
  // faint blue in the hollows (compacted ice showing through snow)
  const colors = new Float32Array(pos.count * 3);
  const cWhite = new THREE.Color(0xf7fafc), cBlue = new THREE.Color(0xd9e8f4);
  for (let i = 0; i < pos.count; i++) {
    const h = pos.getY(i);
    const t = THREE.MathUtils.clamp(0.5 - h * 0.4, 0, 1);
    const c = cWhite.clone().lerp(cBlue, t);
    colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const snowMat = new THREE.MeshStandardMaterial({
    vertexColors: true, roughness: 0.82, metalness: 0.02, envMapIntensity: 0.5,
  });
  const terrain = new THREE.Mesh(geo, snowMat);
  terrain.receiveShadow = true;
  scene.add(terrain);

  const groundHeight = (x, z) => {
    const shelf = THREE.MathUtils.smoothstep(z, -20, 20);
    return heightAt(x, z) * (1 - shelf * 0.85);
  };

  // --- snow sparkle (sun glinting off crystals) ---
  const SPARK_N = 700;
  const sparkGeo = new THREE.BufferGeometry();
  const spArr = new Float32Array(SPARK_N * 3);
  for (let i = 0; i < SPARK_N; i++) {
    const x = (Math.random() - 0.5) * WORLD_SIZE * 0.9;
    const z = (Math.random() - 0.5) * WORLD_SIZE * 0.9;
    spArr[i * 3] = x; spArr[i * 3 + 1] = groundHeight(x, z) + 0.05; spArr[i * 3 + 2] = z;
  }
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(spArr, 3));
  const sparkMat = new THREE.PointsMaterial({
    color: 0xfff6e0, size: 0.09, transparent: true, opacity: 0.8,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  scene.add(new THREE.Points(sparkGeo, sparkMat));

  // --- thin ice patches (dark, will not hold mother's weight) ---
  const thinIce = [];
  const thinMat = new THREE.MeshPhysicalMaterial({
    color: 0x3a6480, roughness: 0.15, metalness: 0, clearcoat: 1,
    clearcoatRoughness: 0.15, transparent: true, opacity: 0.8, envMapIntensity: 1.0,
  });
  const patchDefs = [
    { x: -8, z: 52, r: 7 }, { x: 14, z: 68, r: 9 }, { x: -22, z: 78, r: 6 },
    { x: 4, z: 88, r: 8 }, { x: 26, z: 46, r: 5 },
  ];
  for (const p of patchDefs) {
    const m = new THREE.Mesh(new THREE.CircleGeometry(p.r, 28), thinMat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(p.x, groundHeight(p.x, p.z) + 0.03, p.z);
    scene.add(m);
    thinIce.push({ ...p, mesh: m, broken: false });
  }

  // --- breathing hole (seal hunt site) ---
  const holePos = new THREE.Vector3(10, 0, 95);
  holePos.y = groundHeight(holePos.x, holePos.z);
  const hole = new THREE.Mesh(
    new THREE.CircleGeometry(2.2, 32),
    new THREE.MeshPhysicalMaterial({ color: 0x081c2c, roughness: 0.05, clearcoat: 1, envMapIntensity: 1.5 }));
  hole.rotation.x = -Math.PI / 2;
  hole.position.copy(holePos).add(new THREE.Vector3(0, 0.04, 0));
  scene.add(hole);
  const rim = new THREE.Mesh(
    new THREE.RingGeometry(2.2, 3.0, 32),
    new THREE.MeshStandardMaterial({ color: 0xe4f0fb, roughness: 0.35, envMapIntensity: 0.8 }));
  rim.rotation.x = -Math.PI / 2;
  rim.position.copy(holePos).add(new THREE.Vector3(0, 0.05, 0));
  scene.add(rim);

  // --- circling birds above the hole: the documentary "food here" signal ---
  const birds = new THREE.Group();
  const birdMat = new THREE.MeshBasicMaterial({ color: 0x2b3540, side: THREE.DoubleSide });
  for (let i = 0; i < 5; i++) {
    const wing = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.22), birdMat);
    wing.userData.phase = Math.random() * Math.PI * 2;
    wing.userData.r = 6 + Math.random() * 5;
    wing.userData.h = 10 + Math.random() * 5;
    wing.userData.speed = 0.4 + Math.random() * 0.3;
    birds.add(wing);
  }
  scene.add(birds);

  // --- pressure ridges / ice blocks for cover ---
  const iceMat = new THREE.MeshPhysicalMaterial({
    color: 0xd9e9f6, roughness: 0.35, metalness: 0, clearcoat: 0.6,
    clearcoatRoughness: 0.4, envMapIntensity: 1.0,
  });
  const ridges = [];
  const ridgeDefs = [
    { x: -14, z: 60, s: 3.2, ry: 0.4 }, { x: 2, z: 72, s: 2.4, ry: 1.2 },
    { x: 20, z: 84, s: 3.8, ry: 0.9 }, { x: -4, z: 40, s: 2.0, ry: 2.1 },
    { x: 30, z: 65, s: 2.8, ry: 0.2 }, { x: -30, z: 50, s: 3.5, ry: 1.7 },
    { x: -18, z: -10, s: 2.5, ry: 0.6 }, { x: 22, z: -18, s: 3.0, ry: 1.4 },
    { x: 40, z: 20, s: 2.2, ry: 0.8 }, { x: -42, z: 15, s: 2.9, ry: 2.4 },
  ];
  for (const r of ridgeDefs) {
    const block = new THREE.Mesh(new THREE.DodecahedronGeometry(r.s, 0), iceMat);
    const y = groundHeight(r.x, r.z);
    block.position.set(r.x, y + r.s * 0.35, r.z);
    block.rotation.set(Math.random() * 0.3, r.ry, Math.random() * 0.3);
    block.scale.y = 0.6;
    block.castShadow = true; block.receiveShadow = true;
    scene.add(block);
    ridges.push({ x: r.x, z: r.z, r: r.s * 0.9 });
  }

  // --- distant icebergs on the horizon ---
  const bergMat = new THREE.MeshStandardMaterial({ color: 0xafc8dc, roughness: 0.9, flatShading: true, fog: true });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + Math.random() * 0.4;
    const R = 190 + Math.random() * 90;
    const s = 10 + Math.random() * 20;
    const berg = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), bergMat);
    berg.position.set(Math.cos(a) * R, -s * 0.35, Math.sin(a) * R);
    berg.rotation.set(Math.random() * 0.5, Math.random() * Math.PI, Math.random() * 0.4);
    berg.scale.set(1 + Math.random(), 0.55 + Math.random() * 0.5, 1);
    scene.add(berg);
  }

  // --- aurora (subtle, adds to the arctic identity even in daylight haze) ---
  const auroraGeo = new THREE.PlaneGeometry(260, 60, 60, 1);
  const auroraMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uT: { value: 0 } },
    vertexShader: `
      varying vec2 vUv; uniform float uT;
      void main() {
        vUv = uv;
        vec3 p = position;
        p.y += sin(uv.x * 12.0 + uT * 0.4) * 4.0;
        p.z += sin(uv.x * 7.0 - uT * 0.25) * 6.0;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: `
      varying vec2 vUv; uniform float uT;
      void main() {
        float band = sin(vUv.x * 18.0 + uT * 0.5) * 0.5 + 0.5;
        float fade = smoothstep(0.0, 0.25, vUv.y) * (1.0 - smoothstep(0.55, 1.0, vUv.y));
        vec3 col = mix(vec3(0.15, 0.9, 0.55), vec3(0.45, 0.3, 0.9), vUv.y + band * 0.3);
        gl_FragColor = vec4(col, band * fade * 0.09);
      }`,
  });
  const aurora = new THREE.Mesh(auroraGeo, auroraMat);
  aurora.position.set(0, 55, 160);
  aurora.rotation.x = 0.25;
  scene.add(aurora);

  // --- den mouth (start point, south hills) ---
  const den = new THREE.Mesh(
    new THREE.SphereGeometry(3.4, 12, 8, 0, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0xe9eef4, roughness: 0.9, side: THREE.DoubleSide }));
  den.rotation.y = Math.PI / 2;
  den.position.set(0, groundHeight(0, -70) + 0.4, -72);
  scene.add(den);

  // --- snowfall: two layers (far field + big flakes near the camera) ---
  function snowTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 32;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.5, 'rgba(255,255,255,0.55)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 32, 32);
    return new THREE.CanvasTexture(c);
  }
  const flakeTex = snowTexture();

  function makeSnowLayer(count, radius, size, opacity) {
    const g = new THREE.BufferGeometry();
    const arr = new Float32Array(count * 3);
    const meta = new Float32Array(count * 2); // fall speed, sway phase
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * radius * 2;
      arr[i * 3 + 1] = Math.random() * 34;
      arr[i * 3 + 2] = (Math.random() - 0.5) * radius * 2;
      meta[i * 2] = 0.9 + Math.random() * 2.4;
      meta[i * 2 + 1] = Math.random() * Math.PI * 2;
    }
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    const m = new THREE.PointsMaterial({
      map: flakeTex, color: 0xffffff, size, transparent: true, opacity,
      depthWrite: false, sizeAttenuation: true,
    });
    const pts = new THREE.Points(g, m);
    scene.add(pts);
    return { g, m, meta, count, radius, baseSize: size, baseOpacity: opacity };
  }
  const farSnow = makeSnowLayer(3400, 85, 0.16, 0.65);
  const nearSnow = makeSnowLayer(1800, 22, 0.34, 0.9);

  function updateSnow(dt, center, camPos, windDir, intensity, t) {
    for (const L of [farSnow, nearSnow]) {
      const c = L === nearSnow ? camPos : center;
      const a = L.g.attributes.position.array;
      const gust = 2.5 + intensity * 17;
      for (let i = 0; i < L.count; i++) {
        const spd = L.meta[i * 2], ph = L.meta[i * 2 + 1];
        // wind push + per-flake sway (turbulent drift, not straight rain)
        a[i * 3] += windDir.x * dt * gust + Math.sin(t * 1.4 + ph) * dt * 0.9;
        a[i * 3 + 1] -= spd * dt * (1 + intensity * 1.7);
        a[i * 3 + 2] += windDir.y * dt * gust + Math.cos(t * 1.15 + ph * 1.3) * dt * 0.9;
        const dx = a[i * 3] - c.x, dz = a[i * 3 + 2] - c.z;
        if (a[i * 3 + 1] < 0 || dx * dx + dz * dz > L.radius * L.radius * 2.6) {
          a[i * 3] = c.x + (Math.random() - 0.5) * L.radius * 2;
          a[i * 3 + 1] = 6 + Math.random() * 28;
          a[i * 3 + 2] = c.z + (Math.random() - 0.5) * L.radius * 2;
        }
      }
      L.g.attributes.position.needsUpdate = true;
      L.m.size = L.baseSize * (1 + intensity * 0.7);
      L.m.opacity = L.baseOpacity * (0.85 + intensity * 0.15);
    }
  }

  // --- footprints in the snow (ring buffer, one draw call) ---
  const MAX_PRINTS = 180;
  const printMesh = new THREE.InstancedMesh(
    new THREE.CircleGeometry(0.17, 10),
    new THREE.MeshBasicMaterial({ color: 0xb9cbdb, transparent: true, opacity: 0.5, depthWrite: false }),
    MAX_PRINTS);
  const hideM = new THREE.Matrix4().makeTranslation(0, -50, 0);
  for (let i = 0; i < MAX_PRINTS; i++) printMesh.setMatrixAt(i, hideM);
  scene.add(printMesh);
  let printIdx = 0;
  const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3();
  function addFootprint(x, z, heading, side, scale = 1) {
    const px = x + Math.cos(heading) * side * 0.34;
    const pz = z - Math.sin(heading) * side * 0.34;
    _e.set(-Math.PI / 2, 0, -heading);
    _q.setFromEuler(_e);
    _s.set(0.8 * scale, 1.35 * scale, 1);
    _m4.compose(new THREE.Vector3(px, groundHeight(px, pz) + 0.02, pz), _q, _s);
    printMesh.setMatrixAt(printIdx % MAX_PRINTS, _m4);
    printMesh.instanceMatrix.needsUpdate = true;
    printIdx++;
  }

  // --- breath vapor in the cold air ---
  const puffMat0 = new THREE.SpriteMaterial({ map: flakeTex, color: 0xe8f2fa, transparent: true, opacity: 0, depthWrite: false });
  const puffs = [];
  for (let i = 0; i < 10; i++) {
    const s = new THREE.Sprite(puffMat0.clone());
    s.visible = false;
    s.userData = { life: -1, dir: new THREE.Vector3() };
    scene.add(s);
    puffs.push(s);
  }
  let puffCursor = 0;
  function emitBreath(pos, dir) {
    const p = puffs[puffCursor++ % puffs.length];
    p.position.copy(pos);
    p.userData.dir.copy(dir);
    p.userData.life = 0;
    p.visible = true;
  }
  function updatePuffs(dt) {
    for (const p of puffs) {
      if (p.userData.life < 0) continue;
      p.userData.life += dt;
      const l = p.userData.life;
      if (l > 1.5) { p.visible = false; p.userData.life = -1; continue; }
      p.position.addScaledVector(p.userData.dir, dt * 0.5);
      p.position.y += dt * 0.22;
      const k = l / 1.5;
      p.scale.setScalar(0.25 + k * 0.9);
      p.material.opacity = 0.3 * (1 - k) * (k * 6 < 1 ? k * 6 : 1);
    }
  }

  // birds, aurora, sparkle, breath — ambient life
  function updateAmbient(dt, t, sealPresent) {
    auroraMat.uniforms.uT.value = t;
    sparkMat.opacity = 0.45 + Math.sin(t * 2.3) * 0.25;
    updatePuffs(dt);
    birds.visible = sealPresent;
    for (const b of birds.children) {
      const { phase, r, h, speed } = b.userData;
      const a = t * speed + phase;
      b.position.set(holePos.x + Math.cos(a) * r, holePos.y + h + Math.sin(a * 1.7) * 0.8, holePos.z + Math.sin(a) * r);
      b.rotation.set(Math.sin(a * 6) * 0.5, -a + Math.PI / 2, 0); // wing flap + face travel dir
    }
  }

  return { groundHeight, thinIce, holePos, ridges, updateSnow, updateAmbient, addFootprint, emitBreath, sun, hemi, scene };
}

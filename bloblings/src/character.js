// Character = a list of SDF parts (round cones) + one blend-shell mesh + one
// outline shell + sticker eyes + a procedural locomotion rig. One body draw call.

import * as THREE from 'three';
import { MAX_SHAPES, blendShellVertex, blendShellFragment, outlineFragment } from './shaders.js';
import { buildMergedGeometry, sdfProject } from './geometry.js';
import { makeRig } from './locomotion.js';

const _axis = new THREE.Vector3(), _q = new THREE.Quaternion(), _sc = new THREE.Vector3();
const _m = new THREE.Matrix4(), _Y = new THREE.Vector3(0, 1, 0);
const _v = new THREE.Vector3(), _n = new THREE.Vector3(), _side = new THREE.Vector3();
const _Z = new THREE.Vector3(0, 0, 1);

let eyeGeo = null, eyeMatBlack = null, eyeMatWhite = null;

export class Character {
  constructor(spec, globals, scene) {
    this.spec = spec;
    this.unit = spec.size ?? 1;
    this.parts = [];
    this.ropes = [];
    this.root = new THREE.Group();
    this.squash = 1;          // <1 squashes toward the ground, radii bulge via scale
    this.pop = 0;             // spawn pop-in 0..1
    this.blinkT = 1.5 + Math.random() * 3;
    this.blink = 1;
    this.selectedPulse = 0;
    this.dead = false;

    this.rig = makeRig(this, spec);   // populates parts, ropes, anchors

    // --- GPU state ---
    this.bones = new Float32Array(MAX_SHAPES * 16);
    this.shapeA = new Float32Array(MAX_SHAPES * 4);
    this.shapeB = new Float32Array(MAX_SHAPES * 4);
    this.shapeC = new Float32Array(MAX_SHAPES * 4);
    for (let i = 0; i < MAX_SHAPES; i++) _m.identity().toArray(this.bones, i * 16);

    const geo = buildMergedGeometry(this.parts, this.unit);
    const shared = {
      uShapeA: { value: this.shapeA }, uShapeB: { value: this.shapeB },
      uShapeC: { value: this.shapeC }, uBones: { value: this.bones },
      uCount: { value: this.parts.length }, uUnit: { value: this.unit },
      uFogColor: globals.uFogColor, uFogRange: globals.uFogRange,
    };
    this.bodyMat = new THREE.ShaderMaterial({
      vertexShader: blendShellVertex, fragmentShader: blendShellFragment,
      uniforms: { ...shared, uIso: { value: 0 }, uLightDir: globals.uLightDir, uUpDir: globals.uUpDir },
    });
    this.outlineMat = new THREE.ShaderMaterial({
      vertexShader: blendShellVertex, fragmentShader: outlineFragment,
      uniforms: { ...shared, uIso: { value: 0.021 * this.unit }, uOutlineColor: { value: spec.dark.clone() } },
      side: THREE.BackSide,
    });
    this.bodyMesh = new THREE.Mesh(geo, this.bodyMat);
    this.outlineMesh = new THREE.Mesh(geo, this.outlineMat);
    this.bodyMesh.frustumCulled = this.outlineMesh.frustumCulled = false;
    this.root.add(this.bodyMesh, this.outlineMesh);

    // --- eyes: crisp sticker meshes glued to the SDF surface on the CPU ---
    if (!eyeGeo) {
      eyeGeo = new THREE.SphereGeometry(1, 12, 8);
      eyeMatBlack = new THREE.MeshBasicMaterial({ color: 0x1c1c28 });
      eyeMatWhite = new THREE.MeshBasicMaterial({ color: 0xffffff });
    }
    this.eyes = [];
    if (spec.eyes) {
      for (let s = -1; s <= 1; s += 2) {
        const eye = new THREE.Mesh(eyeGeo, eyeMatBlack);
        const glint = new THREE.Mesh(eyeGeo, eyeMatWhite);
        glint.position.set(0.32, 0.35, 0.55);
        glint.scale.setScalar(0.32);
        eye.add(glint);
        eye.userData.side = s;
        this.eyes.push(eye);
        this.root.add(eye);
      }
    }

    // --- blob shadow (not a child: it must not squash or tilt) ---
    this.shadow = new THREE.Mesh(globals.shadowGeo, globals.shadowMat);
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.renderOrder = 1;
    scene.add(this.root, this.shadow);
    this.scene = scene;
    this.invRoot = new THREE.Matrix4();
  }

  // Register one SDF part. len is the rest A->B distance (0 => sphere).
  addPart(rA, rB, len, color, k) {
    const p = {
      a: new THREE.Vector3(), b: new THREE.Vector3(0, len, 0),
      rA, rB, rA0: Math.max(rA, 1e-3), rB0: Math.max(rB, 1e-3), len0: len,
      color, k,
    };
    this.parts.push(p);
    return p;
  }

  update(dt, world) {
    this.worldTime = world.time;
    this.pop = Math.min(1, this.pop + dt * 2.6);
    this.blinkT -= dt;
    if (this.blinkT < 0) { this.blinkT = 1.5 + Math.random() * 3.5; }
    this.blink = this.blinkT < 0.12 ? 0.12 : 1;
    this.selectedPulse = Math.max(0, this.selectedPulse - dt * 3);

    this.rig.update(dt, world);

    // root transform: locomotion sets position + quaternion; we add squash + pop
    const popS = 1 - Math.pow(1 - this.pop, 3);
    const wob = this.selectedPulse * Math.sin(this.selectedPulse * 18) * 0.06;
    const sy = this.squash * popS * (1 + wob);
    const sxz = popS * (1 + wob * -0.7) / Math.sqrt(Math.max(this.squash, 0.05));
    this.root.scale.set(sxz, Math.max(sy, 0.01), sxz);
    this.root.updateMatrixWorld(true);
    this.invRoot.copy(this.root.matrixWorld).invert();

    for (const rope of this.ropes) rope.update(dt, this);

    this.writeUniforms();
    this.updateEyes();

    const h = (this.rig.bodyY ?? this.unit * 0.5) + this.root.position.y;
    const sr = (this.rig.shadowR ?? this.unit * 0.55) / (1 + h * 0.55);
    this.shadow.position.set(this.root.position.x, 0.012, this.root.position.z);
    this.shadow.scale.setScalar(Math.max(sr * popS, 0.001));
  }

  writeUniforms() {
    const n = Math.min(this.parts.length, MAX_SHAPES);
    for (let i = 0; i < n; i++) {
      const p = this.parts[i], o = i * 4;
      this.shapeA[o] = p.a.x; this.shapeA[o + 1] = p.a.y; this.shapeA[o + 2] = p.a.z; this.shapeA[o + 3] = p.rA;
      this.shapeB[o] = p.b.x; this.shapeB[o + 1] = p.b.y; this.shapeB[o + 2] = p.b.z; this.shapeB[o + 3] = p.rB;
      this.shapeC[o] = p.color.r; this.shapeC[o + 1] = p.color.g; this.shapeC[o + 2] = p.color.b; this.shapeC[o + 3] = p.k;

      _axis.subVectors(p.b, p.a);
      const len = _axis.length();
      if (len > 1e-6) _q.setFromUnitVectors(_Y, _axis.divideScalar(len));
      else _q.identity();
      const sr = (p.rA / p.rA0 + p.rB / p.rB0) * 0.5;
      const sy = p.len0 > 1e-6 ? len / p.len0 : sr;
      _m.compose(p.a, _q, _sc.set(sr, sy, sr));
      _m.toArray(this.bones, i * 16);
    }
    this.bodyMat.uniforms.uCount.value = n;
  }

  updateEyes() {
    if (!this.eyes.length) return;
    const rig = this.rig, e = this.spec.eyes;
    const head = rig.headPart, look = rig.lookDir;
    const headR = head.rA;
    _side.crossVectors(_Y, look).normalize();
    for (const eye of this.eyes) {
      _v.copy(head.a)
        .addScaledVector(look, headR * (0.45 + e.fwd * 0.4))
        .addScaledVector(_side, eye.userData.side * headR * e.spread)
        .addScaledVector(_Y, headR * e.up);
      sdfProject(this.parts, _v, 0.004 * this.unit, _n, this.unit);
      eye.position.copy(_v);
      eye.quaternion.setFromUnitVectors(_Z, _n);
      const r = e.r * this.unit;
      eye.scale.set(r, r * this.blink, r * 0.42);
    }
  }

  dispose() {
    this.dead = true;
    this.scene.remove(this.root, this.shadow);
    this.bodyMesh.geometry.dispose();
    this.bodyMat.dispose();
    this.outlineMat.dispose();
  }
}

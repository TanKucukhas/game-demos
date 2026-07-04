// Procedural animation. No clips: feet step reactively with 2-bone IK (2/4/6
// legs share one system), hoppers squash-and-stretch through a state machine,
// flyers hover and bank, and tails/ears are verlet ropes whose segments are SDF
// parts — so they stay seamlessly fused to the body while they flop.

import * as THREE from 'three';

const V3 = THREE.Vector3;
const _a = new V3(), _b = new V3(), _c = new V3(), _d = new V3(), _e = new V3();
const _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion();
const _eu = new THREE.Euler();

const lerp = (a, b, t) => a + (b - a) * t;
const damp = (a, b, l, dt) => lerp(a, b, 1 - Math.exp(-l * dt));
function dampAngle(a, b, l, dt) {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * (1 - Math.exp(-l * dt));
}

// ---------------------------------------------------------------- brain
class Brain {
  constructor(range = 7.5) {
    this.range = range;
    this.state = 'idle';
    this.idleT = 0.5 + Math.random() * 1.5;
    this.target = new V3(0, 0, 0);
    this.vel = new V3();
    this.look = new V3(0, 0.6, 4);
    this.lookT = 0;
  }
  update(dt, char, world, maxSpeed, accel = 6) {
    if (this.freeze) { this.state = 'idle'; this.idleT = 9; }
    const pos = char.root.position;
    if (world.poke.timer > 0) { this.look.copy(world.poke.pos); this.lookT = 0.6; }
    else {
      this.lookT -= dt;
      if (this.lookT < 0) {
        this.lookT = 1.2 + Math.random() * 3;
        _a.set(Math.sin(char.yaw ?? 0), 0, Math.cos(char.yaw ?? 0));
        this.look.copy(pos).addScaledVector(_a, 3)
          .add(_b.set((Math.random() - 0.5) * 5, 0.3 + Math.random() * 1.2, (Math.random() - 0.5) * 5));
      }
    }
    if (this.state === 'idle') {
      this.idleT -= dt;
      if (this.idleT < 0) {
        const ang = Math.random() * Math.PI * 2, rad = 1.5 + Math.random() * (this.range - 1.5);
        this.target.set(Math.cos(ang) * rad, 0, Math.sin(ang) * rad);
        this.state = 'go';
      }
    } else if (_a.subVectors(this.target, pos).setY(0).length() < 0.4) {
      this.state = 'idle';
      this.idleT = 0.8 + Math.random() * 2.6;
    }
    _a.subVectors(this.target, pos).setY(0);
    const dist = _a.length();
    const want = this.state === 'go'
      ? _a.normalize().multiplyScalar(maxSpeed * Math.min(1, dist / 1.2))
      : _a.set(0, 0, 0);
    this.vel.x = damp(this.vel.x, want.x, accel, dt);
    this.vel.z = damp(this.vel.z, want.z, accel, dt);
    return this.vel;
  }
}

// ---------------------------------------------------------------- ropes
export class Rope {
  // opts: segs, segLen, r0, r1, colors[], k, gravity, stiff, damping, anchor(local V3), restDir(local V3)
  constructor(char, opts) {
    this.o = opts;
    this.anchor = opts.anchor.clone();
    this.restDir = opts.restDir.clone().normalize();
    this.phase = Math.random() * 9;
    this.parts = [];
    for (let i = 0; i < opts.segs; i++) {
      const t0 = i / opts.segs, t1 = (i + 1) / opts.segs;
      this.parts.push(char.addPart(
        lerp(opts.r0, opts.r1, t0), lerp(opts.r0, opts.r1, t1), opts.segLen,
        opts.colors[Math.min(i, opts.colors.length - 1)], opts.k));
    }
    this.pts = null;
    char.ropes.push(this);
  }
  update(dt, char) {
    const o = this.o, m = char.root.matrixWorld;
    _a.copy(this.anchor).applyMatrix4(m);           // pinned root, world space
    _d.copy(this.restDir).applyQuaternion(char.root.quaternion);
    if (!this.pts) {
      this.pts = [];
      for (let i = 0; i <= o.segs; i++) {
        const p = _b.copy(_a).addScaledVector(_d, i * o.segLen).clone();
        this.pts.push({ p, pp: p.clone() });
      }
    }
    this.pts[0].p.copy(_a);
    this.pts[0].pp.copy(_a);
    const steps = 2, h = Math.min(dt, 0.033) / steps;
    const stiff = 1 - Math.pow(1 - o.stiff, h * 60);
    for (let s = 0; s < steps; s++) {
      for (let i = 1; i < this.pts.length; i++) {
        const pt = this.pts[i];
        _b.subVectors(pt.p, pt.pp).multiplyScalar(o.damping);
        pt.pp.copy(pt.p);
        pt.p.add(_b);
        pt.p.y -= o.gravity * h * h;
        pt.p.x += Math.sin(char.worldTime * 2.6 + this.phase + i) * 0.028 * o.segLen;
      }
      for (let it = 0; it < 2; it++) {
        for (let i = 1; i < this.pts.length; i++) {
          const prev = this.pts[i - 1].p, pt = this.pts[i];
          _b.copy(prev).addScaledVector(_d, o.segLen);     // shape memory
          pt.p.lerp(_b, stiff);
          _c.subVectors(pt.p, prev);
          const l = _c.length() || 1e-5;
          pt.p.copy(prev).addScaledVector(_c, o.segLen / l);
        }
      }
    }
    for (let i = 0; i < o.segs; i++) {                // write back as local SDF parts
      this.parts[i].a.copy(this.pts[i].p).applyMatrix4(char.invRoot);
      this.parts[i].b.copy(this.pts[i + 1].p).applyMatrix4(char.invRoot);
    }
  }
}

// shared feature builders ------------------------------------------------
function addEars(char, spec, u, anchorFn) {
  if (!spec.ears) return [];
  const e = spec.ears, ropes = [];
  const tip = spec.base.clone().lerp(spec.belly, 0.4);
  for (let s = -1; s <= 1; s += 2) {
    ropes.push({
      side: s,
      rope: new Rope(char, {
        segs: 2, segLen: e.len * u * 0.5, r0: e.r * u, r1: e.r * u * 0.6,
        colors: [spec.base, tip], k: Math.min(e.r * u * 0.9, 0.05 * u),
        gravity: 3.5, stiff: 0.30, damping: 0.9,
        anchor: new V3(), restDir: new V3(s * 0.6, 1, -0.15),
      }),
    });
  }
  char._earUpd = () => { for (const { side, rope } of ropes) anchorFn(rope.anchor, side); };
  return ropes;
}

function addTail(char, spec, u, anchor, restDir, segs = 3) {
  if (!spec.tail) return null;
  const t = spec.tail;
  return new Rope(char, {
    segs, segLen: t.len * u / segs, r0: t.r * u, r1: t.r * u * 0.55,
    colors: [spec.base, spec.base, spec.accent], k: Math.min(t.r * u, 0.07 * u),
    gravity: 5, stiff: 0.14, damping: 0.92, anchor, restDir,
  });
}

// ---------------------------------------------------------------- legged
class LeggedRig {
  constructor(char, spec) {
    this.char = char; this.spec = spec;
    const u = char.unit, kind = spec.archetype;
    this.u = u; this.kind = kind;
    const L = spec.legs.len * u, lr = spec.legs.r * u;
    const bl = spec.body.len * u, br = spec.body.r * u;
    this.legLen = L; this.standH = L * 0.94;
    this.brain = new Brain();
    this.speed = (kind === 'quad' ? 1.5 : kind === 'hexa' ? 1.15 : 0.95) * u;
    this.stepDist = L * (kind === 'hexa' ? 0.4 : 0.55);
    this.stepDur = kind === 'hexa' ? 0.14 : 0.16 + L * 0.12;
    char.yaw = Math.random() * Math.PI * 2;
    this.phase = Math.random() * 9;
    this.bob = 0; this.pitch = 0; this.roll = 0; this.prevSpeed = 0;
    this.lookDir = new V3(0, 0, 1);

    const kBody = Math.min(br * 0.75, 0.14 * u);
    const kLimb = Math.min(lr * 1.4, 0.08 * u);

    // torso + head layout per archetype ---------------------------------
    if (kind === 'biped') {
      this.bodyBase = this.standH + br * 0.55;
      this.body = char.addPart(br, br * 0.7, bl, spec.base, kBody);
      this.belly = char.addPart(br * 0.72, br * 0.5, bl * 0.8, spec.belly, kBody * 0.7);
      this.headBase = new V3(0, this.bodyBase + bl + br * 0.55 + spec.head.r * u * 0.5, 0);
      this.hips = [new V3(-br * 0.5, this.standH, 0), new V3(br * 0.5, this.standH, 0)];
      this.groups = [0, 1];
      this.shadowR = br * 2.1;
    } else {
      this.bodyBase = this.standH + br * 0.3;
      this.body = char.addPart(br * 0.88, br, bl, spec.base, kBody);   // horizontal, A=rear
      this.belly = char.addPart(br * 0.62, br * 0.68, bl * 0.85, spec.belly, kBody * 0.7);
      this.headBase = new V3(0, this.bodyBase + br * 0.75 + spec.head.r * u * 0.35, bl * 0.62 + spec.head.r * u * 0.4);
      this.hips = []; this.groups = [];
      const rows = kind === 'quad' ? [-0.42, 0.42] : [-0.45, 0, 0.45];
      rows.forEach((rz, ri) => {
        for (let s = -1; s <= 1; s += 2) {
          this.hips.push(new V3(s * br * 0.72, this.standH, rz * bl * (kind === 'hexa' ? 1.5 : 1.35)));
          this.groups.push((ri + (s > 0 ? 1 : 0)) % 2);   // trot / tripod phasing
        }
      });
      if (kind === 'hexa') this.abdomen = char.addPart(br * 1.05, br * 1.05, 0, spec.accent, kBody);
      this.shadowR = Math.max(bl, br * 2) * 1.25;
    }
    this.headPart = char.addPart(spec.head.r * u, spec.head.r * u * (0.55 + spec.head.snout * 0.2), spec.head.r * u * spec.head.snout, spec.base, Math.min(spec.head.r * u * 0.8, 0.12 * u));

    // legs ---------------------------------------------------------------
    this.feet = this.hips.map((hip, i) => ({
      hip, group: this.groups[i], side: Math.sign(hip.x) || 1,
      home: new V3(hip.x * 1.25, 0, hip.z),
      foot: new V3(), from: new V3(), to: new V3(), sw: -1,
      parts: {
        upper: char.addPart(lr, lr * 0.9, L * 0.55, spec.base, kLimb),
        lower: char.addPart(lr * 0.85, lr * 0.7, L * 0.55, spec.base, kLimb),
        paw: kind === 'hexa' ? null : char.addPart(lr * 1.35, lr * 1.35, 0, spec.belly, kLimb),
      },
    }));
    for (const f of this.feet) {
      const c = Math.cos(char.yaw), s = Math.sin(char.yaw);
      f.foot.set(c * f.home.x + s * f.home.z, 0, -s * f.home.x + c * f.home.z).add(char.root.position);
    }

    // arms (bipeds) -------------------------------------------------------
    this.arms = [];
    if (spec.arms) {
      const ar = spec.arms.r * u, al = spec.arms.len * u;
      for (let s = -1; s <= 1; s += 2) {
        this.arms.push({
          side: s, al,
          upper: char.addPart(ar, ar * 0.85, al * 0.5, spec.base, kLimb),
          fore: char.addPart(ar * 0.8, ar * 0.7, al * 0.5, spec.base, kLimb),
          hand: char.addPart(ar * 1.25, ar * 1.25, 0, spec.belly, kLimb),
        });
      }
    }

    // floppy bits ----------------------------------------------------------
    addEars(char, spec, u, (out, side) => {
      out.copy(this.headPart.a).add(_e.set(side * spec.head.r * u * 0.68, spec.head.r * u * 0.72, -spec.head.r * u * 0.1));
    });
    if (kind === 'biped') addTail(char, spec, u, new V3(0, this.bodyBase + br * 0.2, -br * 0.8), new V3(0, -0.4, -1), 2);
    else addTail(char, spec, u, new V3(0, this.bodyBase + br * 0.4, -bl * 0.62), new V3(0, 0.5, -1), 3);
    if (spec.antennae) {
      const an = spec.antennae;
      for (let s = -1; s <= 1; s += 2) {
        new Rope(char, {
          segs: 2, segLen: an.len * u * 0.5, r0: an.r * u, r1: an.r * u * 1.6,
          colors: [spec.dark, spec.accent], k: 0.018 * u,     // capped: stays crisp, never dissolves
          gravity: 1, stiff: 0.55, damping: 0.88,
          anchor: new V3(s * spec.head.r * u * 0.4, 0, 0), restDir: new V3(s * 0.35, 1, 0.35),
        });
      }
      this._antRopes = char.ropes.slice(-2);
    }
  }

  update(dt, world) {
    const char = this.char, pos = char.root.position, u = this.u;
    const vel = this.brain.update(dt, char, world, this.speed);
    const speed = vel.length();
    pos.x += vel.x * dt; pos.z += vel.z * dt;

    if (speed > 0.15 * u) char.yaw = dampAngle(char.yaw, Math.atan2(vel.x, vel.z), 6, dt);
    const accel = (speed - this.prevSpeed) / Math.max(dt, 1e-4);
    this.prevSpeed = speed;
    this.pitch = damp(this.pitch, THREE.MathUtils.clamp(-accel * 0.02, -0.13, 0.13), 5, dt);
    this.roll = damp(this.roll, 0, 5, dt);
    _eu.set(this.pitch, char.yaw, this.roll, 'YXZ');
    char.root.quaternion.setFromEuler(_eu);

    // reactive stepping: a foot lifts when it drifts too far from home and its
    // opposite gait group is grounded — the same rule does biped/trot/tripod
    const cy = Math.cos(char.yaw), sy = Math.sin(char.yaw);
    const l2w = (out, l) => out.set(cy * l.x + sy * l.z, l.y, -sy * l.x + cy * l.z).add(pos);
    const w2l = (out, w) => { const dx = w.x - pos.x, dz = w.z - pos.z; return out.set(cy * dx - sy * dz, w.y - pos.y, sy * dx + cy * dz); };

    let bobT = 0;
    for (const f of this.feet) {
      l2w(_a, f.home).setY(0);
      if (f.sw < 0) {
        const err = f.foot.distanceTo(_a);
        const otherAir = this.feet.some(o => o.sw >= 0 && o.group !== f.group);
        if ((err > this.stepDist && !otherAir) || err > this.stepDist * 2.2) {
          f.sw = 0;
          f.from.copy(f.foot);
          f.to.copy(_a).addScaledVector(vel, this.stepDur * 1.25);
        }
      }
      if (f.sw >= 0) {
        f.sw += dt / this.stepDur;
        const t = Math.min(f.sw, 1), te = t * t * (3 - 2 * t);
        f.foot.lerpVectors(f.from, f.to, te);
        f.foot.y = Math.sin(t * Math.PI) * this.legLen * (0.22 + Math.min(speed / this.speed, 1) * 0.16);
        bobT += Math.sin(t * Math.PI);
        if (f.sw >= 1) { f.sw = -1; f.foot.y = 0; world.footfall(f.foot, speed, char); }
      }
    }
    this.bob = damp(this.bob, bobT * this.legLen * 0.05, 12, dt);
    const breathe = Math.sin(world.time * 2.2 + this.phase) * 0.02;
    this.body.rA = this.body.rA0 * (1 + breathe);

    // torso + head --------------------------------------------------------
    const bodyY = this.bodyBase + this.bob;
    const bl = this.spec.body.len * u;
    if (this.kind === 'biped') {
      this.body.a.set(0, bodyY, 0); this.body.b.set(0, bodyY + bl, 0);
      this.belly.a.set(0, bodyY - bl * 0.02, this.spec.body.r * u * 0.32);
      this.belly.b.set(0, bodyY + bl * 0.8, this.spec.body.r * u * 0.28);
    } else {
      this.body.a.set(0, bodyY, -bl * 0.55); this.body.b.set(0, bodyY, bl * 0.55);
      this.belly.a.set(0, bodyY - this.spec.body.r * u * 0.3, -bl * 0.45);
      this.belly.b.set(0, bodyY - this.spec.body.r * u * 0.28, bl * 0.45);
      if (this.abdomen) {
        this.abdomen.a.set(0, bodyY + u * 0.02, -bl * 0.95);
        this.abdomen.b.copy(this.abdomen.a);
      }
    }
    w2l(_b, this.brain.look);
    _b.sub(_c.copy(this.headBase).setY(this.headBase.y + this.bob));
    _b.y = THREE.MathUtils.clamp(_b.y * 0.35, -0.3, 0.45);
    _b.z = Math.max(_b.z, 0.45);
    this.lookDir.lerp(_b.normalize(), 1 - Math.exp(-7 * dt)).normalize();
    this.headPart.a.copy(this.headBase); this.headPart.a.y += this.bob;
    this.headPart.b.copy(this.headPart.a).addScaledVector(this.lookDir, this.headPart.len0 || 0.001);

    // leg IK ---------------------------------------------------------------
    const L1 = this.legLen * 0.55;
    for (const f of this.feet) {
      _a.copy(f.hip); _a.y += this.bob * 0.5;
      w2l(_b, f.foot);
      _c.subVectors(_b, _a);
      const d = THREE.MathUtils.clamp(_c.length(), 0.02, L1 * 1.94);
      _c.normalize();
      _d.set(f.side * (this.kind === 'hexa' ? 1 : 0.3), 0, this.kind === 'hexa' ? 0.25 : 1);
      _d.addScaledVector(_c, -_d.dot(_c));
      if (_d.lengthSq() < 1e-6) _d.set(0, 0, 1);
      _d.normalize();
      const ko = Math.sqrt(Math.max(L1 * L1 - d * d * 0.25, 1e-6));
      _e.copy(_a).addScaledVector(_c, d * 0.5).addScaledVector(_d, ko);
      f.parts.upper.a.copy(_a); f.parts.upper.b.copy(_e);
      f.parts.lower.a.copy(_e);
      f.parts.lower.b.set(_b.x, Math.max(_b.y, 0) + f.parts.lower.rB * 0.8, _b.z);
      if (f.parts.paw) { f.parts.paw.a.copy(f.parts.lower.b); f.parts.paw.b.copy(f.parts.lower.b); }
    }

    // arms swing opposite the feet ------------------------------------------
    if (this.arms.length) {
      const fz = w2l(_a, this.feet[0].foot).z - w2l(_b, this.feet[1].foot).z;
      for (const arm of this.arms) {
        const sw = THREE.MathUtils.clamp(fz * arm.side * 2.2, -0.9, 0.9);
        const sh = _c.set(arm.side * this.spec.body.r * u * 0.95, this.bodyBase + bl * 0.82, 0);
        _d.set(arm.side * 0.5, -1, sw + 0.2).normalize();
        arm.upper.a.copy(sh); arm.upper.b.copy(sh).addScaledVector(_d, arm.al * 0.5);
        _e.set(arm.side * 0.2, -1, sw * 1.7 + 0.3).normalize();
        arm.fore.a.copy(arm.upper.b);
        arm.fore.b.copy(arm.upper.b).addScaledVector(_e, arm.al * 0.5);
        arm.hand.a.copy(arm.fore.b); arm.hand.b.copy(arm.fore.b);
      }
    }

    if (char._earUpd) char._earUpd();
    if (this._antRopes) for (let i = 0; i < 2; i++) {
      this._antRopes[i].anchor.copy(this.headPart.a).add(_e.set((i ? 1 : -1) * this.headPart.rA * 0.4, this.headPart.rA * 0.85, this.headPart.rA * 0.15));
    }
    this.bodyY = bodyY;
  }
}

// ---------------------------------------------------------------- hopper
class HopperRig {
  constructor(char, spec) {
    this.char = char; this.spec = spec;
    const u = char.unit, br = spec.body.r * u, bl = spec.body.len * u;
    this.br = br; this.bl = bl;
    this.brain = new Brain();
    this.state = 'idle'; this.t = 0; this.h = 0; this.vy = 0;
    this.vxz = new V3(); this.lookDir = new V3(0, 0, 1);
    char.yaw = Math.random() * Math.PI * 2;
    const k = Math.min(br * 0.8, 0.14 * u);
    this.body = char.addPart(br, br * 0.74, bl, spec.base, k);
    this.belly = char.addPart(br * 0.74, br * 0.5, bl * 0.9, spec.belly, k * 0.7);
    this.headPart = char.addPart(spec.head.r * u, spec.head.r * u * 0.6, spec.head.r * u * spec.head.snout, spec.base, Math.min(spec.head.r * u * 0.8, 0.1 * u));
    this.feet = [
      char.addPart(br * 0.34, br * 0.34, 0, spec.belly, k * 0.5),
      char.addPart(br * 0.34, br * 0.34, 0, spec.belly, k * 0.5),
    ];
    this.armsP = spec.arms ? [
      char.addPart(spec.arms.r * u, spec.arms.r * u * 0.8, spec.arms.len * u, spec.base, k * 0.5),
      char.addPart(spec.arms.r * u, spec.arms.r * u * 0.8, spec.arms.len * u, spec.base, k * 0.5),
    ] : [];
    addEars(char, spec, u, (out, side) => {
      out.copy(this.headPart.a).add(_e.set(side * spec.head.r * u * 0.5, spec.head.r * u * 0.8, -spec.head.r * u * 0.15));
    });
    this.tailRope = addTail(char, spec, u, new V3(0, br * 0.8, -br * 0.85), new V3(0, 0.3, -1), 2);
    this.shadowR = br * 2.2;
    this.jumpV = 3.1 * Math.sqrt(u);
    this.g = 12;
  }

  update(dt, world) {
    const char = this.char, pos = char.root.position;
    this.brain.update(dt, char, world, 0);         // target/look only; we move ballistically
    const toTarget = _a.subVectors(this.brain.target, pos).setY(0);
    const dist = toTarget.length();
    this.t += dt;

    switch (this.state) {
      case 'idle':
        char.squash = damp(char.squash, 1 + Math.sin(world.time * 3 + this.br) * 0.02, 8, dt);
        if (this.brain.state === 'go' && dist > 0.4 && this.t > 0.12) { this.state = 'crouch'; this.t = 0; }
        break;
      case 'crouch':
        char.squash = damp(char.squash, 0.72, 18, dt);
        if (this.t > 0.15) {
          this.state = 'air'; this.t = 0;
          this.vy = this.jumpV;
          const airT = 2 * this.vy / this.g;
          const hop = Math.min(dist, 1.6 * char.unit);
          this.vxz.copy(toTarget).normalize().multiplyScalar(hop / airT);
          char.yaw = Math.atan2(this.vxz.x, this.vxz.z);
          world.audio.hop(char.unit);
        }
        break;
      case 'air':
        this.h += this.vy * dt; this.vy -= this.g * dt;
        pos.x += this.vxz.x * dt; pos.z += this.vxz.z * dt;
        char.squash = damp(char.squash, 1 + Math.min(Math.abs(this.vy) * 0.055, 0.3), 10, dt);
        if (this.h <= 0 && this.vy < 0) {
          this.h = 0; this.state = 'land'; this.t = 0;
          this.impact = Math.min(Math.abs(this.vy) / this.jumpV, 1.3);
          world.land(pos, this.impact, char);
        }
        break;
      case 'land':
        char.squash = damp(char.squash, this.t < 0.09 ? 1 - 0.26 * this.impact : 1.05, 20, dt);
        if (this.t > 0.24) { this.state = 'idle'; this.t = 0; char.squash = Math.min(char.squash, 1.02); }
        break;
    }
    _eu.set(THREE.MathUtils.clamp(-this.vy * 0.03, -0.25, 0.25) * (this.state === 'air' ? 1 : 0), char.yaw, 0, 'YXZ');
    char.root.quaternion.slerp(_q.setFromEuler(_eu), 1 - Math.exp(-14 * dt));

    // layout (local, lifted by hop height h) --------------------------------
    const u = char.unit, br = this.br, y = this.h + br * 0.92;
    this.body.a.set(0, y, 0); this.body.b.set(0, y + this.bl, 0);
    this.belly.a.set(0, y - this.bl * 0.05, br * 0.4);
    this.belly.b.set(0, y + this.bl * 0.75, br * 0.32);
    const hy = y + this.bl + this.spec.head.r * u * 0.55;

    const cy = Math.cos(char.yaw), sy = Math.sin(char.yaw);
    _b.copy(this.brain.look).sub(pos);
    _c.set(cy * _b.x - sy * _b.z, _b.y - hy, sy * _b.x + cy * _b.z);
    _c.y = THREE.MathUtils.clamp(_c.y * 0.3, -0.25, 0.4); _c.z = Math.max(_c.z, 0.45);
    this.lookDir.lerp(_c.normalize(), 1 - Math.exp(-7 * dt)).normalize();
    this.headPart.a.set(0, hy, br * 0.12);
    this.headPart.b.copy(this.headPart.a).addScaledVector(this.lookDir, this.headPart.len0 || 0.001);

    const spread = this.state === 'air' ? 0.42 : 0.55;
    for (let i = 0; i < 2; i++) {
      const s = i ? 1 : -1;
      this.feet[i].a.set(s * br * spread, this.h + this.feet[i].rA * 0.85, br * 0.3 + (this.state === 'air' ? -0.12 * br : 0));
      this.feet[i].b.copy(this.feet[i].a);
    }
    for (let i = 0; i < this.armsP.length; i++) {
      const s = i ? 1 : -1, up = this.state === 'air' ? 0.7 : -0.5;
      this.armsP[i].a.set(s * br * 0.88, y + this.bl * 0.72, br * 0.25);
      _d.set(s * 0.6, up, 0.5).normalize();
      this.armsP[i].b.copy(this.armsP[i].a).addScaledVector(_d, this.armsP[i].len0);
    }
    if (char._earUpd) char._earUpd();
    if (this.tailRope) this.tailRope.anchor.set(0, this.h + br * 0.8, -br * 0.85);
    this.bodyY = y;
  }
}

// ---------------------------------------------------------------- flyer
class FlyerRig {
  constructor(char, spec) {
    this.char = char; this.spec = spec;
    const u = char.unit, br = spec.body.r * u, bl = spec.body.len * u;
    this.br = br; this.bl = bl;
    this.brain = new Brain(6.5);
    this.alt = 1.1 * u; this.altT = this.alt;
    this.altTimer = 0; this.prevYaw = 0;
    char.yaw = Math.random() * Math.PI * 2;
    this.lookDir = new V3(0, 0, 1);
    const k = Math.min(br * 0.8, 0.12 * u);
    this.body = char.addPart(br * 0.8, br, bl, spec.base, k);
    this.belly = char.addPart(br * 0.55, br * 0.66, bl * 0.85, spec.belly, k * 0.7);
    this.headPart = char.addPart(spec.head.r * u, spec.head.r * u * 0.6, spec.head.r * u * spec.head.snout, spec.base, Math.min(spec.head.r * u * 0.8, 0.1 * u));
    this.crest = char.addPart(br * 0.22, br * 0.06, br * 0.5, spec.accent, 0.03 * u);
    const w = spec.wings, wk = Math.min(w.r * u * 1.2, 0.05 * u);
    this.wings = [];
    for (let s = -1; s <= 1; s += 2) {
      this.wings.push({
        side: s,
        inner: char.addPart(w.r * u, w.r * u * 0.8, w.span * u * 0.5, spec.base, wk),
        outer: char.addPart(w.r * u * 0.8, w.r * u * 0.45, w.span * u * 0.5, spec.accent, wk),
      });
      new Rope(char, {          // dangly little feet
        segs: 1, segLen: 0.22 * u, r0: 0.05 * u, r1: 0.07 * u,
        colors: [spec.belly], k: 0.035 * u, gravity: 5, stiff: 0.12, damping: 0.9,
        anchor: new V3(s * br * 0.4, 0, 0.1 * u), restDir: new V3(0, -1, 0),
      });
    }
    this.footRopes = char.ropes.slice(-2);
    this.tailRope = addTail(char, spec, u, new V3(), new V3(0, -0.3, -1), 3);
    this.shadowR = br * 1.9;
  }

  update(dt, world) {
    const char = this.char, pos = char.root.position, u = char.unit;
    const vel = this.brain.update(dt, char, world, 1.9 * u, 3.5);
    pos.x += vel.x * dt; pos.z += vel.z * dt;
    this.altTimer -= dt;
    if (this.altTimer < 0) { this.altTimer = 2 + Math.random() * 3; this.altT = (0.95 + Math.random() * 1.1) * u; }
    this.alt = damp(this.alt, this.altT, 1.5, dt) ;
    const y = this.alt + Math.sin(world.time * 2.1) * 0.07 * u;

    const speed = vel.length();
    if (speed > 0.1 * u) char.yaw = dampAngle(char.yaw, Math.atan2(vel.x, vel.z), 4, dt);
    const yawRate = (char.yaw - this.prevYaw) / Math.max(dt, 1e-4);
    this.prevYaw = char.yaw;
    _eu.set(
      THREE.MathUtils.clamp(speed * 0.12 / u, 0, 0.3) - 0.05,
      char.yaw,
      THREE.MathUtils.clamp(-yawRate * 0.25, -0.5, 0.5),
      'YXZ');
    char.root.quaternion.slerp(_q.setFromEuler(_eu), 1 - Math.exp(-8 * dt));

    const br = this.br, bl = this.bl;
    this.body.a.set(0, y, -bl * 0.5); this.body.b.set(0, y, bl * 0.5);
    this.belly.a.set(0, y - br * 0.25, -bl * 0.4); this.belly.b.set(0, y - br * 0.22, bl * 0.42);
    const hy = y + br * 0.35, hz = bl * 0.62 + this.spec.head.r * u * 0.35;

    _b.copy(this.brain.look).sub(pos);
    const cy = Math.cos(char.yaw), sy = Math.sin(char.yaw);
    _c.set(cy * _b.x - sy * _b.z, _b.y - hy, sy * _b.x + cy * _b.z);
    _c.y = THREE.MathUtils.clamp(_c.y * 0.3, -0.35, 0.35); _c.z = Math.max(_c.z, 0.45);
    this.lookDir.lerp(_c.normalize(), 1 - Math.exp(-6 * dt)).normalize();
    this.headPart.a.set(0, hy, hz);
    this.headPart.b.copy(this.headPart.a).addScaledVector(this.lookDir, this.headPart.len0 || 0.001);
    this.crest.a.set(0, hy + this.headPart.rA * 0.8, hz - this.headPart.rA * 0.2);
    this.crest.b.copy(this.crest.a).add(_e.set(0, this.headPart.rA * 0.8, -this.headPart.rA * 0.5));

    // wings: sinusoid flap, outer segment lags -> whippy cartoon wings
    const flapW = 8 + Math.min(speed / u, 2) * 2;
    const amp = 0.55 + Math.min(speed / u, 2) * 0.12;
    const th = Math.sin(world.time * flapW) * amp - 0.1;
    const th2 = Math.sin(world.time * flapW - 0.9) * amp * 1.25;
    const wl = this.spec.wings.span * u * 0.5;
    for (const wing of this.wings) {
      const s = wing.side;
      _a.set(s * br * 0.8, y + br * 0.4, 0);
      _d.set(s * Math.cos(th), Math.sin(th), -0.15).normalize();
      wing.inner.a.copy(_a); wing.inner.b.copy(_a).addScaledVector(_d, wl);
      _e.set(s * Math.cos(th2), Math.sin(th2), -0.3).normalize();
      wing.outer.a.copy(wing.inner.b);
      wing.outer.b.copy(wing.inner.b).addScaledVector(_e, wl);
    }
    for (let i = 0; i < 2; i++) this.footRopes[i].anchor.set((i ? 1 : -1) * br * 0.4, y - br * 0.55, 0.1 * u);
    if (this.tailRope) this.tailRope.anchor.set(0, y, -bl * 0.55);
    this.bodyY = y;
  }
}

// ---------------------------------------------------------------- props
class PropRig {
  constructor(char, spec) {
    this.char = char; this.spec = spec;
    this.parts = spec.blobs.map(b => {
      const p = char.addPart(b[6], b[7], _a.set(b[3] - b[0], b[4] - b[1], b[5] - b[2]).length(), b[8], b[9]);
      p.a.set(b[0], b[1], b[2]); p.b.set(b[3], b[4], b[5]);
      p.base = { a: p.a.clone(), b: p.b.clone() };
      return p;
    });
    this.phase = Math.random() * 9;
    this.shadowR = spec.shadowR ?? 0.6;
    this.bodyY = 0.2;
    this.lookDir = new V3(0, 0, 1);
  }
  update(dt, world) {
    if (!this.spec.sway) return;
    for (const p of this.parts) {
      const wx = Math.sin(world.time * 0.9 + this.phase + p.base.a.y) * 0.03;
      p.a.x = p.base.a.x + wx * p.base.a.y; p.a.z = p.base.a.z + wx * p.base.a.y * 0.6;
      p.b.x = p.base.b.x + wx * p.base.b.y; p.b.z = p.base.b.z + wx * p.base.b.y * 0.6;
    }
  }
}

export function makeRig(char, spec) {
  switch (spec.archetype) {
    case 'hopper': return new HopperRig(char, spec);
    case 'flyer': return new FlyerRig(char, spec);
    case 'prop': return new PropRig(char, spec);
    default: return new LeggedRig(char, spec);
  }
}

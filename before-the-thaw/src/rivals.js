// NPC bears: the rival male drawn by kill scent, and the scavengers
// guarding the whale carcass. Same state machine, different parameters.
import * as THREE from 'three';
import { buildBear, animateGait, tryUpgradeModel } from './creatures.js';

export class NPCBear {
  constructor(scene, world, { tint = 0xe8dcc0, scale = 1.14, aggression = 0.55, name = 'male bear' } = {}) {
    this.world = world;
    this.name = name;
    this.aggression = aggression;
    this.mesh = buildBear({ scale, color: tint });
    this.mesh.visible = false;
    scene.add(this.mesh);
    tryUpgradeModel(this.mesh, '/models/polar_bear_mother_anim.glb', 1.6 * scale).then((ok) => {
      if (ok) {
        this.mesh.traverse((o) => {
          if (o.isMesh && o.material?.color) { o.material = o.material.clone(); o.material.color.multiplyScalar(0.93); }
        });
      }
    });
    this.pos = new THREE.Vector3();
    this.state = 'dormant'; // dormant | approach | eat | threat | flee
    this.target = null;
    this.speed = 3.6;
    this.vel = 0;
    this.animT = Math.random() * 10;
    this.heading = 0;
    this.drivenOff = false;
  }

  spawn(x, z, target) {
    this.pos.set(x, this.world.groundHeight(x, z), z);
    this.target = target.clone();
    this.state = 'approach';
    this.drivenOff = false;
    this.mesh.visible = true;
  }

  despawn() { this.state = 'dormant'; this.mesh.visible = false; }

  // returns true if he backs down
  contest(motherEnergy, cubsWatching) {
    const motherScore = 0.35 + motherEnergy * 0.55 + Math.random() * 0.25;
    const rivalScore = this.aggression + Math.random() * 0.3;
    if (motherScore > rivalScore) {
      this.state = 'flee';
      this.drivenOff = true;
      return true;
    }
    return false;
  }

  update(dt, motherPos, carcassPos, eatFn) {
    if (this.state === 'dormant') return;
    this.animT += dt;
    const distM = this.pos.distanceTo(motherPos);
    let tgt = null, want = 0;

    if (this.state === 'approach') {
      tgt = this.target;
      want = this.speed;
      if (carcassPos && this.pos.distanceTo(carcassPos) < 3.5) this.state = 'eat';
      else if (!carcassPos && this.pos.distanceTo(this.target) < 3) this.state = 'threat';
    } else if (this.state === 'eat') {
      if (eatFn) eatFn(dt);
      if (distM < 9) this.state = 'threat';
    } else if (this.state === 'threat') {
      // square up to the mother, push forward slowly
      tgt = motherPos;
      want = distM > 5 ? this.speed * 0.5 : 0;
      if (distM > 14 && carcassPos) this.state = 'eat';
      if (distM > 20 && !carcassPos) { this.state = 'approach'; }
    } else if (this.state === 'flee') {
      const away = this.pos.clone().sub(motherPos).setY(0).normalize();
      tgt = this.pos.clone().addScaledVector(away, 30);
      want = this.speed * 1.5;
      if (distM > 55) this.despawn();
    }

    if (tgt) {
      const dir = tgt.clone().sub(this.pos).setY(0);
      if (dir.lengthSq() > 0.04) {
        dir.normalize();
        this.vel = THREE.MathUtils.lerp(this.vel, want, dt * 2.5);
        this.pos.addScaledVector(dir, this.vel * dt);
        const targetRot = Math.atan2(dir.x, dir.z) - Math.PI / 2;
        let d = targetRot - this.mesh.rotation.y;
        while (d > Math.PI) d -= Math.PI * 2;
        while (d < -Math.PI) d += Math.PI * 2;
        this.mesh.rotation.y += d * Math.min(1, 5 * dt);
      } else this.vel = THREE.MathUtils.lerp(this.vel, 0, dt * 4);
    } else this.vel = THREE.MathUtils.lerp(this.vel, 0, dt * 4);

    this.pos.y = this.world.groundHeight(this.pos.x, this.pos.z);
    this.mesh.position.copy(this.pos);
    this.mesh.userData.baseY = this.pos.y;
    animateGait(this.mesh, this.vel / this.speed, this.animT);
  }
}

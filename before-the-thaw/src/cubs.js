// Cub AI. Rule 1: cub mistakes must be readable (they announce intent).
// Rule 2: commands must be dependable. Rule 4: cubs learn by watching.
import * as THREE from 'three';
import { buildCub, animateGait } from './creatures.js';

const STATES = { FOLLOW: 'follow', STAY: 'stay', WANDER: 'wander', OBSERVE: 'observe', DISTRESS: 'distress' };

export class Cub {
  constructor(name, opts, scene, world) {
    this.name = name;
    this.scene = scene;
    this.world = world;
    // temperament
    this.curiosity = opts.curiosity;       // chance to wander
    this.obedience = opts.obedience;       // how reliably commands land
    this.speed = opts.speed;
    // organic-follow personality
    this.followDelay = opts.followDelay;   // seconds behind mother's trail
    this.lateral = opts.lateral;           // preferred side offset from the trail
    this.swayPhase = Math.random() * Math.PI * 2;
    this.swayFreq = 0.6 + Math.random() * 0.7;
    this.dawdleT = 4 + Math.random() * 7;  // countdown to a spontaneous pause
    this.pauseT = 0;
    this.mesh = buildCub(opts.color);
    scene.add(this.mesh);

    this.state = STATES.FOLLOW;
    this.fed = 0.15;          // 0..1
    this.hunting = 0;         // learned hunting skill 0..1 (grows by observing)
    this.wanderTarget = null;
    this.wanderTimer = 5 + Math.random() * 8;
    this.stateLabel = 'close to you';
    this.pos = new THREE.Vector3();
    this.vel = 0;
    this.animT = Math.random() * 10;
    this.inWater = false;
    this.waterTimer = 0;
    this.stamina = 1;         // swim endurance 0..1
    this.playUntil = 0;       // bonding play window
    this.alive = true;
  }

  place(x, z) {
    this.pos.set(x, 0, z);
    this.pos.y = this.world.groundHeight(x, z);
    this.mesh.position.copy(this.pos);
  }

  command(cmd, motherPos) {
    // obedience check — trained/obedient cubs respond reliably
    const listens = Math.random() < this.obedience + this.hunting * 0.3;
    if (cmd === 'call') {
      if (listens || this.state === STATES.WANDER) {
        this.state = STATES.FOLLOW;
        this.wanderTarget = null;
        this.stateLabel = 'returning to you';
        return true;
      }
      this.stateLabel = 'ignoring your call…';
      return false;
    }
    if (cmd === 'stay') {
      if (listens) { this.state = STATES.STAY; this.stayPos = this.pos.clone(); this.stateLabel = 'staying put'; return true; }
      this.stateLabel = 'won\'t stay still';
      return false;
    }
    if (cmd === 'follow') { this.state = STATES.FOLLOW; this.stateLabel = 'following'; return true; }
    return false;
  }

  // Called when the mother makes a kill within sight of this cub.
  observeKill(dist) {
    if (dist < 25 && this.state !== STATES.DISTRESS) {
      this.hunting = Math.min(1, this.hunting + 0.4);
      this.stateLabel = 'watched the hunt — learning!';
      return true;
    }
    return false;
  }

  feed(amount) {
    this.fed = Math.min(1, this.fed + amount);
    this.stateLabel = 'fed and content';
  }

  update(dt, mother, siblings, stormIntensity) {
    if (!this.alive) return;
    this.animT += dt;
    const g = this.world.groundHeight(this.pos.x, this.pos.z);

    // water check: broken thin ice or the open lead. Cubs can swim while
    // their stamina lasts; when it runs out the clock starts.
    this.inWater = false;
    for (const p of this.world.thinIce) {
      if (p.broken && this.pos.distanceTo(new THREE.Vector3(p.x, this.pos.y, p.z)) < p.r) {
        this.inWater = true;
      }
    }
    if (this.world.inLead?.(this.pos.x, this.pos.z)) this.inWater = true;
    if (this.inWater) {
      this.stamina = Math.max(0, this.stamina - dt / 11);
      if (this.stamina <= 0) {
        this.waterTimer += dt;
        this.state = STATES.DISTRESS;
        this.stateLabel = '❗ EXHAUSTED IN THE WATER — help!';
      } else if (this.state !== STATES.DISTRESS) {
        this.stateLabel = this.stamina < 0.35 ? 'tiring in the water…' : 'swimming behind you';
      }
    } else {
      this.stamina = Math.min(1, this.stamina + dt / 6);
      this.waterTimer = Math.max(0, this.waterTimer - dt * 0.5);
      if (this.state === STATES.DISTRESS) { this.state = STATES.FOLLOW; this.stateLabel = 'shaken but safe'; }
    }

    // flee from adult males
    for (const d of (this.world.dangers || [])) {
      if (this.pos.distanceTo(d) < 10 && !this.inWater) {
        this.state = STATES.FOLLOW;
        this.fleeing = 1.2;
        this.stateLabel = '❗ fleeing the male bear!';
      }
    }
    this.fleeing = Math.max(0, (this.fleeing || 0) - dt);

    const toMother = mother.position.clone().sub(this.pos);
    toMother.y = 0;
    const distM = toMother.length();

    // wander impulse (curiosity), suppressed by storms and obedience training
    if (this.state === STATES.FOLLOW && !this.inWater) {
      this.wanderTimer -= dt * (1 + stormIntensity * -0.8);
      if (this.wanderTimer <= 0) {
        if (Math.random() < this.curiosity * (1 - this.hunting * 0.5)) {
          // wander toward the most interesting nearby thing: thin ice or a ridge
          const targets = [...this.world.thinIce.map(p => new THREE.Vector3(p.x, 0, p.z)),
                           ...this.world.ridges.map(r => new THREE.Vector3(r.x, 0, r.z))];
          targets.sort((a, b) => a.distanceTo(this.pos) - b.distanceTo(this.pos));
          this.wanderTarget = targets[0]?.clone();
          if (this.wanderTarget) {
            this.state = STATES.WANDER;
            this.stateLabel = '⚠ wandering off to investigate…';
          }
        }
        this.wanderTimer = 6 + Math.random() * 10;
      }
    }

    // movement
    let target = null, wantSpeed = 0;
    if (this.state === STATES.FOLLOW) {
      // spontaneous dawdling: stop to sniff/play, then trot to catch up
      if (this.pauseT > 0) {
        this.pauseT -= dt;
      } else {
        if (distM < 8) {
          this.dawdleT -= dt;
          if (this.dawdleT <= 0) {
            this.dawdleT = 5 + Math.random() * 9;
            if (Math.random() < 0.55) {
              this.pauseT = 0.6 + Math.random() * 1.3;
              this.stateLabel = ['sniffing the snow…', 'batting at a snowflake', 'shaking off snow', 'looking back at the trail'][Math.floor(Math.random() * 4)];
            }
          }
        }
        // follow the mother's TRAIL a few seconds behind, offset to one side —
        // not her live position. This is what makes the follow look organic.
        let tgt = mother.position;
        const trail = mother.userData.trail;
        if (trail?.length > 1 && distM < 25) {
          const now = trail[trail.length - 1].t;
          for (let i = trail.length - 1; i >= 0; i--) {
            if (now - trail[i].t >= this.followDelay) { tgt = trail[i].p; break; }
          }
        }
        const perp = new THREE.Vector3(tgt.z - this.pos.z, 0, -(tgt.x - this.pos.x));
        if (perp.lengthSq() > 0.01) perp.normalize();
        const goal = tgt.clone().addScaledVector(perp, this.lateral);
        const dGoal = this.pos.distanceTo(goal);
        if (dGoal > 1.6) {
          target = goal;
          wantSpeed = distM > 12 ? this.speed * 1.6 : dGoal > 5 ? this.speed : this.speed * 0.75;
        }
      }
    } else if (this.state === STATES.WANDER && this.wanderTarget) {
      target = this.wanderTarget;
      wantSpeed = this.speed * 0.7;
      if (this.pos.distanceTo(this.wanderTarget) < 2.5) {
        this.state = STATES.FOLLOW;
        this.wanderTarget = null;
        this.stateLabel = 'satisfied its curiosity';
      }
      // wandered too far → distress squeak, stops
      if (distM > 40) { this.state = STATES.DISTRESS; this.stateLabel = '❗ lost — calling for you'; }
    } else if (this.state === STATES.DISTRESS && !this.inWater) {
      if (distM < 12) { this.state = STATES.FOLLOW; this.stateLabel = 'found you again'; }
    } else if (this.state === STATES.STAY) {
      if (distM > 45) { this.state = STATES.FOLLOW; this.stateLabel = 'too scared to stay — following'; }
    }

    if (this.inWater) {
      // swim after the mother (slow when exhausted)
      target = mother.position;
      wantSpeed = this.stamina > 0 ? this.speed * 0.55 : this.speed * 0.22;
    }
    if (this.fleeing > 0) {
      target = mother.position; wantSpeed = this.speed * 1.7;
    }
    if (this.playUntil > this.animT && !this.inWater) {
      // romp in circles around the mother
      const a = this.animT * 2.2 + this.swayPhase;
      target = mother.position.clone().add(new THREE.Vector3(Math.cos(a) * 3, 0, Math.sin(a) * 3));
      wantSpeed = this.speed * 1.2;
      this.stateLabel = ['play-fighting!', 'romping in the snow', 'pouncing on the sibling', 'tumbling'][Math.floor(this.animT / 2) % 4];
    }

    if (target) {
      const dir = target.clone().sub(this.pos); dir.y = 0;
      if (dir.lengthSq() > 0.01) {
        dir.normalize();
        // meandering sway — cubs never walk a straight line
        if (this.state === STATES.FOLLOW && !this.inWater) {
          const sway = Math.sin(this.animT * this.swayFreq + this.swayPhase) * 0.4 *
            Math.max(0, 1 - this.pos.distanceTo(target) / 18);
          const cos = Math.cos(sway), sin = Math.sin(sway);
          dir.set(dir.x * cos - dir.z * sin, 0, dir.x * sin + dir.z * cos);
        }
        // avoid siblings clumping
        for (const s of siblings) {
          if (s === this || !s.alive) continue;
          const d = this.pos.clone().sub(s.pos); d.y = 0;
          if (d.length() < 1.4) dir.add(d.normalize().multiplyScalar(0.6));
        }
        dir.normalize();
        this.vel = THREE.MathUtils.lerp(this.vel, wantSpeed, dt * 2.2);
        this.pos.addScaledVector(dir, this.vel * dt);
        // bear model faces +X
        this.mesh.rotation.y = lerpAngle(this.mesh.rotation.y, Math.atan2(dir.x, dir.z) - Math.PI / 2, 5 * dt);
      }
    } else {
      this.vel = THREE.MathUtils.lerp(this.vel, 0, dt * 5);
    }

    this.pos.y = this.inWater ? g - 0.35 : g;
    this.mesh.position.set(this.pos.x, this.pos.y, this.pos.z);
    this.mesh.userData.baseY = this.pos.y;
    animateGait(this.mesh, this.vel / this.speed, this.animT);

    // hunger drains slowly
    this.fed = Math.max(0, this.fed - dt * 0.0022);
  }
}

function lerpAngle(a, b, t) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * Math.min(1, t);
}

export function makeCubs(scene, world) {
  const siku = new Cub('Siku', {
    curiosity: 0.75, obedience: 0.35, speed: 3.4, color: 0xefe9d8,
    followDelay: 1.1, lateral: 1.0,
  }, scene, world);
  const nukka = new Cub('Nukka', {
    curiosity: 0.15, obedience: 0.9, speed: 2.9, color: 0xe4ddcf,
    followDelay: 2.3, lateral: -1.0,
  }, scene, world);
  return [siku, nukka];
}

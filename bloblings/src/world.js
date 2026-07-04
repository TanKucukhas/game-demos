// Environment + juice: gradient sky dome, painted ground, pooled dust puffs,
// shared blob-shadow assets, and a tiny WebAudio synth for boops and chirps.

import * as THREE from 'three';

const _v = new THREE.Vector3();

export class World {
  constructor(scene, globals) {
    this.scene = scene;
    this.globals = globals;
    this.time = 0;
    this.poke = { pos: new THREE.Vector3(), timer: 0 };
    this.audio = new Bloops();
    this._lastStep = 0;

    scene.add(makeSky(globals), makeGround());

    // shared blob shadow assets
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(64, 64, 8, 64, 64, 62);
    grad.addColorStop(0, 'rgba(30,36,70,0.42)');
    grad.addColorStop(0.7, 'rgba(30,36,70,0.25)');
    grad.addColorStop(1, 'rgba(30,36,70,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    globals.shadowMat = new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false,
    });
    globals.shadowGeo = new THREE.PlaneGeometry(2, 2);

    this.dustPool = new Dust(scene);
  }

  update(dt) {
    this.time += dt;
    this.poke.timer -= dt;
    this.dustPool.update(dt);
  }

  footfall(pos, speed, char) {
    if (speed > 0.35 * char.unit) this.dustPool.burst(pos, 2, 0.35, 0xcfc4a8);
    if (this.time - this._lastStep > 0.09) {
      this._lastStep = this.time;
      this.audio.step(char.unit);
    }
  }

  land(pos, power, char) {
    this.dustPool.burst(_v.copy(pos).setY(0.05), 6 + power * 6, 0.6 + power * 0.5, 0xd8cdb4);
    this.audio.land(char.unit, power);
  }

  confetti(pos, hue) {
    for (let i = 0; i < 22; i++) {
      const c = new THREE.Color().setHSL((hue + Math.random() * 0.25) % 1, 0.75, 0.62);
      this.dustPool.burst(_v.copy(pos).setY(pos.y + 0.5), 1, 1.6, c.getHex(), true);
    }
    this.audio.chirp();
  }
}

// ---------------------------------------------------------------- sky/ground
function makeSky(globals) {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: { uLightWorld: globals.uLightWorld },
    vertexShader: `varying vec3 vDir; void main(){ vDir = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `varying vec3 vDir; uniform vec3 uLightWorld;
      void main(){
        vec3 d = normalize(vDir);
        vec3 col = mix(vec3(0.98,0.93,0.82), vec3(0.55,0.78,0.98), smoothstep(-0.05,0.45,d.y));
        float sun = smoothstep(0.986,0.999,dot(d, normalize(uLightWorld)));
        col += sun * vec3(1.0,0.9,0.6) * 0.55;
        gl_FragColor = vec4(col,1.0);
      }`,
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(70, 24, 12), mat);
  sky.frustumCulled = false;
  return sky;
}

function makeGround() {
  const c = document.createElement('canvas');
  c.width = c.height = 1024;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(512, 512, 60, 512, 512, 512);
  grad.addColorStop(0, '#a8d977');
  grad.addColorStop(0.65, '#93cc68');
  grad.addColorStop(1, '#7cba5e');
  g.fillStyle = grad;
  g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 420; i++) {                       // freckles + grass ticks
    const x = Math.random() * 1024, y = Math.random() * 1024;
    if (Math.random() < 0.5) {
      g.fillStyle = `rgba(255,255,255,${0.05 + Math.random() * 0.08})`;
      g.beginPath(); g.arc(x, y, 2 + Math.random() * 5, 0, 7); g.fill();
    } else {
      g.strokeStyle = `rgba(52,120,60,${0.15 + Math.random() * 0.2})`;
      g.lineWidth = 2.5;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + (Math.random() - 0.5) * 6, y - 5 - Math.random() * 7); g.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(34, 48),
    new THREE.MeshBasicMaterial({ map: tex, fog: false }));
  ground.rotation.x = -Math.PI / 2;
  return ground;
}

// ---------------------------------------------------------------- dust
class Dust {
  constructor(scene) {
    this.N = 256;
    this.items = [];
    const pos = new Float32Array(this.N * 3);
    const col = new Float32Array(this.N * 3);
    const size = new Float32Array(this.N);
    for (let i = 0; i < this.N; i++) {
      this.items.push({ p: new THREE.Vector3(0, -99, 0), v: new THREE.Vector3(), life: 0, max: 1, s: 0.1 });
      pos[i * 3 + 1] = -99;
    }
    this.geo = new THREE.BufferGeometry();
    this.geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.geo.setAttribute('aCol', new THREE.BufferAttribute(col, 3));
    this.geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    const cv = document.createElement('canvas');
    cv.width = cv.height = 64;
    const g = cv.getContext('2d');
    const grad = g.createRadialGradient(32, 32, 4, 32, 32, 30);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.6, 'rgba(255,255,255,0.85)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad; g.fillRect(0, 0, 64, 64);
    this.mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { uTex: { value: new THREE.CanvasTexture(cv) } },
      vertexShader: `attribute vec3 aCol; attribute float aSize;
        varying vec3 vC; varying float vA;
        void main(){ vC = aCol; vA = min(aSize*4.0, 1.0);
          vec4 mv = modelViewMatrix * vec4(position,1.0);
          gl_PointSize = aSize * 340.0 / max(-mv.z, 0.1);
          gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform sampler2D uTex; varying vec3 vC; varying float vA;
        void main(){ vec4 t = texture2D(uTex, gl_PointCoord);
          gl_FragColor = vec4(vC, t.a * vA * 0.85); }`,
    });
    this.points = new THREE.Points(this.geo, this.mat);
    this.points.frustumCulled = false;
    this.cursor = 0;
    scene.add(this.points);
    this._c = new THREE.Color();
  }
  burst(pos, n, power, hex, confetti = false) {
    this._c.setHex(hex);
    for (let i = 0; i < n; i++) {
      const it = this.items[this.cursor];
      this.cursor = (this.cursor + 1) % this.N;
      const a = Math.random() * Math.PI * 2;
      it.p.set(pos.x + Math.cos(a) * 0.08, pos.y + 0.04, pos.z + Math.sin(a) * 0.08);
      it.v.set(Math.cos(a) * (0.4 + Math.random() * 0.8), (confetti ? 1.8 : 0.5) + Math.random() * power, Math.sin(a) * (0.4 + Math.random() * 0.8));
      it.v.multiplyScalar(power * 0.7);
      it.life = it.max = (confetti ? 0.9 : 0.45) + Math.random() * 0.3;
      it.s = (confetti ? 0.05 : 0.09) + Math.random() * 0.08 * power;
      it.col = [this._c.r, this._c.g, this._c.b];
      it.confetti = confetti;
    }
  }
  update(dt) {
    const pos = this.geo.attributes.position.array;
    const col = this.geo.attributes.aCol.array;
    const size = this.geo.attributes.aSize.array;
    this.items.forEach((it, i) => {
      if (it.life <= 0) { size[i] = 0; pos[i * 3 + 1] = -99; return; }
      it.life -= dt;
      it.v.y -= (it.confetti ? 4.5 : 1.2) * dt;
      it.v.multiplyScalar(1 - 2.2 * dt);
      it.p.addScaledVector(it.v, dt);
      if (it.p.y < 0.02) it.p.y = 0.02;
      const t = Math.max(it.life / it.max, 0);
      pos[i * 3] = it.p.x; pos[i * 3 + 1] = it.p.y; pos[i * 3 + 2] = it.p.z;
      size[i] = it.s * (it.confetti ? t : (1.6 - t * 0.9)) * Math.min(t * 5, 1);
      col[i * 3] = it.col[0]; col[i * 3 + 1] = it.col[1]; col[i * 3 + 2] = it.col[2];
    });
    this.geo.attributes.position.needsUpdate = true;
    this.geo.attributes.aCol.needsUpdate = true;
    this.geo.attributes.aSize.needsUpdate = true;
  }
}

// ---------------------------------------------------------------- audio
class Bloops {
  constructor() { this.enabled = false; this.ctx = null; }
  toggle() {
    this.enabled = !this.enabled;
    if (this.enabled && !this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    return this.enabled;
  }
  tone(f0, f1, dur, type, vol) {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.ctx.destination);
    o.start(t); o.stop(t + dur + 0.02);
  }
  step(size) { this.tone(90 / size, 60 / size, 0.06, 'triangle', 0.035); }
  hop(size) { this.tone(180 / size, 320 / size, 0.12, 'sine', 0.08); }
  land(size, power) { this.tone(150 / size, 55 / size, 0.14, 'sine', 0.07 + power * 0.05); }
  chirp() {
    this.tone(520, 780, 0.09, 'sine', 0.09);
    setTimeout(() => this.tone(720, 1050, 0.11, 'sine', 0.08), 90);
  }
  poke() { this.tone(300, 420, 0.07, 'sine', 0.05); }
}

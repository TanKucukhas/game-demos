// Template meshes for blend-shell parts + a CPU copy of the SDF (used to glue
// eyes onto the blended surface). Templates are canonical round cones: end A at
// the origin, axis +Y, so a per-part bone matrix places them each frame.

import * as THREE from 'three';

// Lat-long style round cone (r top can differ from bottom; len 0 => sphere).
// No normals/uvs — the shader derives everything from the SDF.
export function makeRoundCone(rA, rB, len, radial, capSegs, sideSegs) {
  const rows = [];
  for (let j = 0; j <= capSegs; j++) {          // bottom hemisphere around A
    const phi = -Math.PI / 2 + (j / capSegs) * (Math.PI / 2);
    rows.push([Math.cos(phi) * rA, Math.sin(phi) * rA]);
  }
  for (let k = 1; k < sideSegs; k++) {          // tapered side
    const t = k / sideSegs;
    rows.push([rA + (rB - rA) * t, t * len]);
  }
  for (let j = 0; j <= capSegs; j++) {          // top hemisphere around B
    const phi = (j / capSegs) * (Math.PI / 2);
    rows.push([Math.cos(phi) * rB, len + Math.sin(phi) * rB]);
  }
  const pos = [];
  for (const [r, y] of rows) {
    for (let c = 0; c < radial; c++) {
      const a = (c / radial) * Math.PI * 2;
      pos.push(Math.cos(a) * r, y, Math.sin(a) * r);
    }
  }
  const idx = [];
  for (let r = 0; r < rows.length - 1; r++) {
    for (let c = 0; c < radial; c++) {
      const c1 = (c + 1) % radial;
      const a = r * radial + c, b = r * radial + c1;
      const d = (r + 1) * radial + c, e = (r + 1) * radial + c1;
      idx.push(a, d, b, b, d, e);
    }
  }
  return { pos, idx };
}

function segmentsFor(r) {
  if (r > 0.16) return [14, 3, 4];
  if (r > 0.08) return [10, 2, 3];
  return [8, 2, 2];
}

// Merge all part templates into ONE BufferGeometry; aShape holds the part index.
export function buildMergedGeometry(parts, unit) {
  const pos = [], shape = [], idx = [];
  parts.forEach((part, i) => {
    const [radial, capSegs, sideSegs] = segmentsFor(Math.max(part.rA0, part.rB0));
    const g = makeRoundCone(part.rA0, part.rB0, part.len0, radial, capSegs, sideSegs);
    const base = pos.length / 3;
    for (let v = 0; v < g.pos.length; v += 3) {
      pos.push(g.pos[v], g.pos[v + 1], g.pos[v + 2]);
      shape.push(i);
    }
    for (const ii of g.idx) idx.push(base + ii);
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('aShape', new THREE.Float32BufferAttribute(shape, 1));
  geo.setIndex(idx);
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, unit, 0), unit * 4);
  return geo;
}

// ---- CPU SDF (mirrors the GLSL) ----

const _ba = new THREE.Vector3(), _pa = new THREE.Vector3(), _xv = new THREE.Vector3();

function sdShape(p, part) {
  _ba.subVectors(part.b, part.a);
  const l2 = _ba.lengthSq();
  if (l2 < 1e-9) return p.distanceTo(part.a) - part.rA;
  const rr = part.rA - part.rB;
  const a2 = l2 - rr * rr;
  const il2 = 1 / l2;
  _pa.subVectors(p, part.a);
  const y = _pa.dot(_ba);
  const z = y - l2;
  _xv.copy(_pa).multiplyScalar(l2).addScaledVector(_ba, -y);
  const x2 = _xv.lengthSq();
  const y2 = y * y * l2, z2 = z * z * l2;
  const k = Math.sign(rr) * rr * rr * x2;
  if (Math.sign(z) * a2 * z2 > k) return Math.sqrt(x2 + z2) * il2 - part.rB;
  if (Math.sign(y) * a2 * y2 < k) return Math.sqrt(x2 + y2) * il2 - part.rA;
  return (Math.sqrt(x2 * a2 * il2) + y * rr) * il2 - part.rA;
}

export function sdfEval(parts, p) {
  let d = 1e6;
  for (const part of parts) {
    const di = sdShape(p, part);
    const k = Math.max(part.k, 1e-4);
    const h = Math.min(Math.max(0.5 + 0.5 * (di - d) / k, 0), 1);
    d = di + (d - di) * h - k * h * (1 - h);
  }
  return d;
}

const _s = new THREE.Vector3();

// Project point onto the iso surface, write the surface normal into outNormal.
export function sdfProject(parts, p, iso, outNormal, unit) {
  const e = 0.015 * unit;
  for (let it = 0; it < 3; it++) {
    const s1 = sdfEval(parts, _s.set(p.x + e, p.y - e, p.z - e));
    const s2 = sdfEval(parts, _s.set(p.x - e, p.y - e, p.z + e));
    const s3 = sdfEval(parts, _s.set(p.x - e, p.y + e, p.z - e));
    const s4 = sdfEval(parts, _s.set(p.x + e, p.y + e, p.z + e));
    const val = 0.25 * (s1 + s2 + s3 + s4);
    outNormal.set(s1 - s2 - s3 + s4, -s1 - s2 + s3 + s4, -s1 + s2 - s3 + s4);
    if (outNormal.lengthSq() < 1e-10) outNormal.set(0, 1, 0);
    outNormal.normalize();
    p.addScaledVector(outNormal, -(val - iso));
  }
  return p;
}

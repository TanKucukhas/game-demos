// A character IS its JSON. Palette colors derive from a single hue, so an AI
// (or the random generator below) only has to pick an archetype and proportions.

import * as THREE from 'three';

export function hydrate(spec) {
  const s = JSON.parse(JSON.stringify(spec));
  s.base = new THREE.Color().setHSL(s.hue, 0.62, 0.60);
  s.belly = new THREE.Color().setHSL((s.hue + 0.07) % 1, 0.55, 0.80);
  s.accent = new THREE.Color().setHSL((s.hue + 0.92) % 1, 0.68, 0.55);
  s.dark = new THREE.Color().setHSL(s.hue, 0.45, 0.16);
  return s;
}

export const PRESETS = [
  {
    name: 'Pip', archetype: 'biped', size: 0.9, hue: 0.56,
    body: { len: 0.34, r: 0.30 },
    head: { r: 0.26, snout: 0.35 },
    legs: { len: 0.34, r: 0.075 },
    arms: { len: 0.30, r: 0.06 },
    ears: { len: 0.26, r: 0.08 },
    tail: { len: 0.22, r: 0.09 },
    eyes: { r: 0.055, spread: 0.42, fwd: 0.7, up: 0.25 },
  },
  {
    name: 'Waffles', archetype: 'quad', size: 1.0, hue: 0.07,
    body: { len: 0.62, r: 0.26 },
    head: { r: 0.22, snout: 0.9 },
    legs: { len: 0.38, r: 0.075 },
    ears: { len: 0.28, r: 0.075 },
    tail: { len: 0.45, r: 0.085 },
    eyes: { r: 0.05, spread: 0.5, fwd: 0.55, up: 0.35 },
  },
  {
    name: 'Skitter', archetype: 'hexa', size: 0.75, hue: 0.34,
    body: { len: 0.55, r: 0.20 },
    head: { r: 0.19, snout: 0.3 },
    legs: { len: 0.34, r: 0.045 },
    antennae: { len: 0.30, r: 0.022 },
    eyes: { r: 0.055, spread: 0.55, fwd: 0.6, up: 0.3 },
  },
  {
    name: 'Boba', archetype: 'hopper', size: 0.9, hue: 0.87,
    body: { len: 0.30, r: 0.34 },
    head: { r: 0.24, snout: 0.3 },
    arms: { len: 0.18, r: 0.06 },
    ears: { len: 0.42, r: 0.09 },
    tail: { len: 0.18, r: 0.11 },
    eyes: { r: 0.06, spread: 0.45, fwd: 0.7, up: 0.2 },
  },
  {
    name: 'Zuzu', archetype: 'flyer', size: 0.85, hue: 0.13,
    body: { len: 0.42, r: 0.22 },
    head: { r: 0.19, snout: 0.45 },
    wings: { span: 0.75, r: 0.07 },
    tail: { len: 0.4, r: 0.06 },
    eyes: { r: 0.05, spread: 0.45, fwd: 0.65, up: 0.25 },
  },
];

// ---- random blobling generator (stand-in for an LLM writing specs) ----

const SYL = ['bo', 'pip', 'zu', 'mo', 'ki', 'wa', 'lu', 'ta', 'fi', 'nug', 'do', 'mip', 'ka', 'yo'];
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const maybe = (p, v) => (Math.random() < p ? v : undefined);
const R = (x) => Math.round(x * 1000) / 1000;

export function randomSpec() {
  const archetype = pick(['biped', 'quad', 'hexa', 'hopper', 'flyer']);
  const name = pick(SYL) + pick(SYL) + (Math.random() < 0.3 ? pick(SYL) : '');
  const s = {
    name: name[0].toUpperCase() + name.slice(1),
    archetype,
    size: R(rnd(0.65, 1.15)),
    hue: R(Math.random()),
    body: { len: R(rnd(0.3, 0.7)), r: R(rnd(0.2, 0.36)) },
    head: { r: R(rnd(0.17, 0.28)), snout: R(rnd(0.2, 1.0)) },
    eyes: { r: R(rnd(0.04, 0.07)), spread: R(rnd(0.35, 0.6)), fwd: R(rnd(0.5, 0.8)), up: R(rnd(0.15, 0.4)) },
  };
  if (archetype === 'biped' || archetype === 'quad' || archetype === 'hexa') {
    s.legs = { len: R(rnd(0.26, 0.48)), r: R(archetype === 'hexa' ? rnd(0.035, 0.055) : rnd(0.06, 0.1)) };
    if (archetype === 'biped') s.body.len = R(rnd(0.25, 0.45));
  }
  if (archetype === 'biped') s.arms = { len: R(rnd(0.24, 0.36)), r: R(rnd(0.05, 0.075)) };
  if (archetype === 'hopper') {
    s.body = { len: R(rnd(0.24, 0.38)), r: R(rnd(0.28, 0.4)) };
    s.arms = maybe(0.8, { len: R(rnd(0.14, 0.22)), r: R(rnd(0.05, 0.07)) });
    s.ears = { len: R(rnd(0.3, 0.55)), r: R(rnd(0.07, 0.11)) };
  } else if (archetype === 'hexa') {
    s.antennae = { len: R(rnd(0.22, 0.4)), r: R(rnd(0.018, 0.028)) };
  } else {
    s.ears = maybe(0.7, { len: R(rnd(0.2, 0.4)), r: R(rnd(0.06, 0.1)) });
  }
  if (archetype === 'flyer') {
    s.wings = { span: R(rnd(0.6, 0.95)), r: R(rnd(0.06, 0.09)) };
    s.tail = { len: R(rnd(0.3, 0.5)), r: R(rnd(0.05, 0.08)) };
  } else if (archetype !== 'hexa') {
    s.tail = maybe(0.85, { len: R(rnd(0.18, 0.5)), r: R(rnd(0.07, 0.12)) });
  }
  return s;
}

// ---- scenery, same rendering system: trunks + canopy blobs as SDF parts ----

function col(h, s, l) { return new THREE.Color().setHSL(h, s, l); }

export function propSpecs() {
  const props = [];
  const tree = (x, z, sc, hue) => ({
    archetype: 'prop', sway: 1, shadowR: 1.1 * sc, pos: [x, z], name: 'tree',
    dark: col(hue, 0.5, 0.14),
    blobs: [
      [0, 0, 0, 0, 1.1 * sc, 0, 0.16 * sc, 0.1 * sc, col(0.07, 0.4, 0.4), 0.05],
      [0, 1.15 * sc, 0, 0, 1.5 * sc, 0, 0.42 * sc, 0.36 * sc, col(hue, 0.5, 0.45), 0.12],
      [-0.3 * sc, 1.0 * sc, 0.1 * sc, -0.38 * sc, 1.15 * sc, 0.1 * sc, 0.26 * sc, 0.22 * sc, col(hue, 0.55, 0.52), 0.12],
      [0.32 * sc, 1.05 * sc, -0.05 * sc, 0.4 * sc, 1.2 * sc, -0.05 * sc, 0.24 * sc, 0.2 * sc, col(hue, 0.5, 0.4), 0.12],
    ],
  });
  const rock = (x, z, sc) => ({
    archetype: 'prop', sway: 0, shadowR: 0.55 * sc, pos: [x, z], name: 'rock',
    dark: col(0.6, 0.15, 0.12),
    blobs: [
      [0, 0.14 * sc, 0, 0, 0.14 * sc, 0, 0.3 * sc, 0.3 * sc, col(0.6, 0.12, 0.55), 0.1],
      [0.22 * sc, 0.1 * sc, 0.12 * sc, 0.22 * sc, 0.1 * sc, 0.12 * sc, 0.18 * sc, 0.18 * sc, col(0.6, 0.1, 0.62), 0.1],
      [-0.2 * sc, 0.08 * sc, -0.1 * sc, -0.2 * sc, 0.08 * sc, -0.1 * sc, 0.15 * sc, 0.15 * sc, col(0.62, 0.14, 0.48), 0.1],
    ],
  });
  const bush = (x, z, sc, hue) => ({
    archetype: 'prop', sway: 1, shadowR: 0.6 * sc, pos: [x, z], name: 'bush',
    dark: col(hue, 0.5, 0.13),
    blobs: [
      [0, 0.2 * sc, 0, 0, 0.28 * sc, 0, 0.3 * sc, 0.26 * sc, col(hue, 0.5, 0.42), 0.14],
      [0.25 * sc, 0.16 * sc, 0.05 * sc, 0.25 * sc, 0.2 * sc, 0.05 * sc, 0.2 * sc, 0.18 * sc, col(hue, 0.55, 0.5), 0.14],
      [-0.24 * sc, 0.15 * sc, -0.04 * sc, -0.24 * sc, 0.18 * sc, -0.04 * sc, 0.19 * sc, 0.17 * sc, col(hue, 0.48, 0.46), 0.14],
      [0, 0.42 * sc, 0, 0, 0.46 * sc, 0, 0.14 * sc, 0.12 * sc, col((hue + 0.9) % 1, 0.6, 0.6), 0.06],
    ],
  });
  props.push(tree(-5.5, -3.5, 1.5, 0.36), tree(6.2, 2.8, 1.2, 0.30), tree(2.5, -6.5, 1.0, 0.4));
  props.push(rock(-3, 5.5, 1.1), rock(5, -4.5, 0.8));
  props.push(bush(-6, 1.5, 1.0, 0.33), bush(1.5, 6.3, 1.2, 0.38), bush(-1.5, -5.8, 0.9, 0.35));
  return props;
}

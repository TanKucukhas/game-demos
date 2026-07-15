// ADA palette — 28 colors, locked. All sprite art must index into this.
// Original artwork for the ADA project; no Johnny Castaway assets involved.
export const PALETTE = {
  // transparent
  _: null,
  // outline / ink
  K: "#1a1410", // near-black warm outline
  // skin
  s: "#d9a06b", S: "#b57e4e", // skin light / shadow
  // hair & beard
  b: "#4a3524", B: "#33241a",
  // clothing
  o: "#e07a3f", O: "#b35a26", // bandana orange / shadow
  w: "#efe6d2", W: "#c9bda1", // shirt cream / shadow
  p: "#6e4a2f", P: "#523620", // shorts / shadow
  // wood
  t: "#8a5a33", T: "#6e4526", // trunk
  d: "#7a5a36", D: "#5c4227", // driftwood / dark
  // foliage
  l: "#5a9c63", L: "#3f7d4e", g: "#2c5c3a", // leaf light/mid/dark
  // coconut
  c: "#5c3d22",
  // rock
  r: "#868b93", R: "#6b6f76", q: "#4b4f57",
  // sand
  n: "#e8c98a", N: "#d4a95f", m: "#b3853f",
  // sea/foam accents
  f: "#eaf6f4",
  // fauna
  x: "#c4453a", X: "#8f2f27", // crab
  // fire
  y: "#ffd35c", Y: "#ff8c3b", Z: "#d94f2b",
  // misc
  h: "#2b3a49", H: "#1c2733", // ship hull
  e: "#e05a4a", // bobber / accent red
  u: "#dfe8f2", // pale (moon, eyes highlight, smoke)
};

export function hexToRGBA(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
    255,
  ];
}

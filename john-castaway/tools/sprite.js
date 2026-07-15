// Indexed-color sprite surface + drawing ops + ASCII pixel-map parser.
import { PALETTE, hexToRGBA } from "./palette.js";

export class Sprite {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.data = new Array(w * h).fill("_");
  }
  px(x, y, k) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    this.data[y * this.w + x] = k;
  }
  rect(x, y, w, h, k) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.px(x + i, y + j, k);
  }
  hline(x, y, w, k) { this.rect(x, y, w, 1, k); }
  vline(x, y, h, k) { this.rect(x, y, 1, h, k); }
  // 2px-thick line for limbs
  limb(x1, y1, x2, y2, k) {
    const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1), 1);
    for (let i = 0; i <= steps; i++) {
      const x = x1 + ((x2 - x1) * i) / steps;
      const y = y1 + ((y2 - y1) * i) / steps;
      this.px(x, y, k); this.px(x + 1, y, k);
    }
  }
  blit(other, dx, dy) {
    for (let y = 0; y < other.h; y++)
      for (let x = 0; x < other.w; x++) {
        const k = other.data[y * other.w + x];
        if (k !== "_") this.px(dx + x, dy + y, k);
      }
  }
  toRGBA() {
    const out = new Uint8Array(this.w * this.h * 4);
    const cache = {};
    for (let i = 0; i < this.data.length; i++) {
      const k = this.data[i];
      const hex = PALETTE[k];
      if (!hex) continue; // transparent
      const c = (cache[k] ||= hexToRGBA(hex));
      out.set(c, i * 4);
    }
    return out;
  }
}

/** Parse an ASCII pixel map (lines of palette keys, '.' or '_' = transparent). */
export function fromMap(str) {
  const lines = str.replace(/^\n+|\s+$/g, "").split("\n").map((l) => l.replace(/\r/g, ""));
  const w = Math.max(...lines.map((l) => l.length));
  const spr = new Sprite(w, lines.length);
  lines.forEach((line, y) => {
    for (let x = 0; x < line.length; x++) {
      const ch = line[x];
      if (ch !== "." && ch !== "_" && ch !== " ") spr.px(x, y, ch);
    }
  });
  return spr;
}

#!/usr/bin/env node
// ADA spritesheet generator — renders all original artwork into
// assets/*.png atlases + *.json metadata (Aseprite-style frames/animations).
// Usage: node tools/spritegen.js [outDir]
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Sprite } from "./sprite.js";
import { encodePNG } from "./png.js";
import { buildKazim } from "./kazim.js";
import { buildProps } from "./props.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = process.argv[2] || join(ROOT, "assets");
mkdirSync(OUT, { recursive: true });

function writeSheet(name, sheet, frames, extra = {}) {
  writeFileSync(join(OUT, `${name}.png`), encodePNG(sheet.w, sheet.h, sheet.toRGBA()));
  writeFileSync(join(OUT, `${name}.json`), JSON.stringify({ meta: { image: `${name}.png`, size: { w: sheet.w, h: sheet.h } }, frames, ...extra }, null, 1));
  console.log(`  ${name}.png  ${sheet.w}x${sheet.h}  (${Object.keys(frames).length} frames)`);
}

// ---- character: fixed grid ----------------------------------------------
export function generateKazim() {
  const { frames, anims, fw, fh } = buildKazim();
  const cols = 6, rows = Math.ceil(frames.length / cols);
  const sheet = new Sprite(cols * fw, rows * fh);
  const meta = {};
  frames.forEach((f, i) => {
    const x = (i % cols) * fw, y = Math.floor(i / cols) * fh;
    sheet.blit(f.spr, x, y);
    meta[f.name] = { x, y, w: fw, h: fh };
  });
  writeSheet("kazim", sheet, meta, { animations: anims });
  return { frames: Object.keys(meta), animations: Object.keys(anims) };
}

// ---- props: shelf packer -------------------------------------------------
export function generateProps() {
  const items = buildProps().sort((a, b) => b.spr.h - a.spr.h);
  const MAXW = 128;
  let x = 0, y = 0, rowH = 0;
  const placed = [];
  for (const it of items) {
    if (x + it.spr.w > MAXW) { x = 0; y += rowH + 1; rowH = 0; }
    placed.push({ ...it, x, y });
    x += it.spr.w + 1;
    rowH = Math.max(rowH, it.spr.h);
  }
  const sheet = new Sprite(MAXW, y + rowH);
  const meta = {};
  for (const p of placed) {
    sheet.blit(p.spr, p.x, p.y);
    meta[p.name] = { x: p.x, y: p.y, w: p.spr.w, h: p.spr.h };
  }
  writeSheet("props", sheet, meta);
  return { frames: Object.keys(meta) };
}

export function generateAll() {
  console.log("ADA spritegen →", OUT);
  const k = generateKazim();
  const p = generateProps();
  return { kazim: k, props: p };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) generateAll();

#!/usr/bin/env node
// Anything World auto-rig + animate pipeline.
// Uploads a GLB, waits for the AI rig/animation, downloads the animated result
// and saves it as public/models/<base>_anim.glb (converting FBX if needed).
//
// Usage: node tools/rig-models.mjs <model.glb> <name> <type> [outBase]
//   e.g. node tools/rig-models.mjs public/models/polar_bear_mother.glb mother_bear bear polar_bear_mother
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

try {
  const env = readFileSync(resolve(ROOT, '.env'), 'utf8');
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"#\n]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
} catch {}

const KEY = process.env.ANYTHING_WORLD_API_KEY;
if (!KEY) { console.error('ANYTHING_WORLD_API_KEY missing in .env'); process.exit(1); }

const [,, modelPath, name, type, outBase] = process.argv;
if (!modelPath || !name || !type) {
  console.error('usage: node tools/rig-models.mjs <model.glb> <name> <type> [outBase]');
  process.exit(1);
}
const base = outBase || basename(modelPath).replace(/\.glb$/i, '');
const OUT_DIR = resolve(ROOT, 'public/models');
const TMP = resolve(ROOT, '.aw-tmp');
mkdirSync(TMP, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function upload() {
  const fd = new FormData();
  fd.append('key', KEY);
  fd.append('model_name', name);
  if (type === 'auto') fd.append('auto_classify', 'true');
  else fd.append('model_type', type);
  fd.append('symmetry', 'true');
  fd.append('auto_rotate', 'true');
  fd.append('can_use_for_internal_improvements', 'false');
  fd.append('files', new Blob([readFileSync(resolve(ROOT, modelPath))], { type: 'model/gltf-binary' }), basename(modelPath));
  const res = await fetch('https://api.anything.world/animate', { method: 'POST', body: fd });
  const text = await res.text();
  if (!res.ok) throw new Error(`animate → ${res.status}: ${text}`);
  const json = JSON.parse(text);
  const id = json.model_id ?? json.id ?? json.result?.model_id;
  if (!id) throw new Error('no model_id in response: ' + text);
  return id;
}

function collectUrls(obj, path = '', found = []) {
  if (typeof obj === 'string') {
    if (/^https?:\/\//.test(obj)) found.push({ path, url: obj });
  } else if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) collectUrls(v, path ? `${path}.${k}` : k, found);
  }
  return found;
}

async function poll(id) {
  for (let i = 0; i < 90; i++) { // up to 45 min
    await sleep(30_000);
    const res = await fetch(`https://api.anything.world/user-processed-model?key=${KEY}&id=${id}`);
    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch { json = null; }
    const stage = json?.model?.stage ?? json?.stage ?? json?.status ?? res.status;
    process.stdout.write(`\r  poll ${i + 1}: ${stage}                    `);
    if (res.ok && json) {
      const urls = collectUrls(json);
      const done = urls.some((u) => /rig/i.test(u.path) && /\.(glb|fbx)/i.test(u.url));
      if (done) {
        writeFileSync(resolve(TMP, `${base}_result.json`), JSON.stringify(json, null, 2));
        return json;
      }
    }
    if (res.status === 403 || res.status === 404) continue; // still processing
  }
  throw new Error('timed out waiting for rig');
}

async function download(json) {
  const urls = collectUrls(json);
  console.log('\n  available outputs:');
  for (const u of urls) console.log(`    ${u.path}`);
  // prefer an animated walk GLB, then rigged GLB, then walk FBX (convert), then rig FBX
  const pick =
    urls.find((u) => /walk/i.test(u.path) && /glb/i.test(u.path)) ||
    urls.find((u) => /rig\.glb|rig.*\.glb/i.test(u.path) || (/rig/i.test(u.path) && /glb/i.test(u.path))) ||
    urls.find((u) => /walk/i.test(u.path) && /fbx/i.test(u.path)) ||
    urls.find((u) => /rig/i.test(u.path) && /fbx/i.test(u.path));
  if (!pick) throw new Error('no downloadable rig/animation URL found');
  console.log(`  downloading: ${pick.path}`);
  const res = await fetch(pick.url);
  if (!res.ok) throw new Error(`download → ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const isFbx = /fbx/i.test(pick.path) || /\.fbx/i.test(pick.url);
  const outGlb = resolve(OUT_DIR, `${base}_anim.glb`);
  if (!isFbx) {
    writeFileSync(outGlb, buf);
  } else {
    const tmpFbx = resolve(TMP, `${base}.fbx`);
    writeFileSync(tmpFbx, buf);
    const convert = require('fbx2gltf');
    await convert(tmpFbx, outGlb, ['--embed', '--binary']);
  }
  console.log(`  ✓ saved ${outGlb}`);
}

console.log(`▸ uploading ${modelPath} as "${name}" (${type})…`);
const id = await upload();
console.log(`  model_id: ${id}\n  waiting for AI rig + animation (~10 min)…`);
const json = await poll(id);
await download(json);
console.log('Done. Reload the game — it prefers *_anim.glb automatically.');

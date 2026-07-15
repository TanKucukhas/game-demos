#!/usr/bin/env node
// Asset pipeline: Meshy text-to-3D → public/models/*.glb
//                 ElevenLabs SFX + narration → public/audio/*.mp3
// Usage:  npm run assets            (everything)
//         npm run assets:models     (Meshy only)
//         npm run assets:audio      (ElevenLabs only)
// Keys are read from .env (MESHY_API_KEY, ELEVENLABS_API_KEY) or the environment.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// --- tiny .env loader (no dependency) ---
try {
  const env = readFileSync(resolve(ROOT, '.env'), 'utf8');
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"#\n]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
} catch { /* no .env yet */ }

const MESHY_KEY = process.env.MESHY_API_KEY;
const ELEVEN_KEY = process.env.ELEVENLABS_API_KEY || process.env.ELEVEN_API_KEY;
const argv = process.argv.slice(2);
const modelsOnly = argv.includes('--models-only');
const audioOnly = argv.includes('--audio-only');

const MODELS_DIR = resolve(ROOT, 'public/models');
const AUDIO_DIR = resolve(ROOT, 'public/audio');
mkdirSync(MODELS_DIR, { recursive: true });
mkdirSync(AUDIO_DIR, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ============================================================
// MESHY — text-to-3D (preview → refine → download GLB)
// ============================================================
const MESHY_MODELS = [
  {
    file: 'polar_bear_mother.glb',
    prompt: 'adult female polar bear standing perfectly still in a neutral rest pose, all four legs straight and vertical like table legs, feet shoulder-width apart, head facing straight forward, tail relaxed, symmetrical body, mouth closed, realistic proportions, thick white fur, clean topology suitable for auto-rigging and animation, game-ready',
  },
  {
    file: 'polar_bear_cub.glb',
    prompt: 'polar bear cub, three months old, fluffy cream-white fur, round body, big paws, cute but realistic, standing on all fours, game-ready low poly',
  },
  {
    file: 'ringed_seal.glb',
    prompt: 'ringed seal lying on arctic ice, grey mottled skin, plump body, small head, realistic, game-ready low poly',
  },
];

async function meshyRequest(path, opts = {}) {
  const res = await fetch(`https://api.meshy.ai${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${MESHY_KEY}`,
      'Content-Type': 'application/json',
      ...opts.headers,
    },
  });
  if (!res.ok) throw new Error(`Meshy ${path} → ${res.status}: ${await res.text()}`);
  return res.json();
}

async function meshyWait(taskId) {
  for (let i = 0; i < 240; i++) { // up to ~20 min
    const task = await meshyRequest(`/openapi/v2/text-to-3d/${taskId}`);
    if (task.status === 'SUCCEEDED') return task;
    if (task.status === 'FAILED' || task.status === 'CANCELED') {
      throw new Error(`Meshy task ${taskId} ${task.status}: ${task.task_error?.message ?? ''}`);
    }
    process.stdout.write(`\r    ${task.status} ${task.progress ?? 0}%   `);
    await sleep(5000);
  }
  throw new Error(`Meshy task ${taskId} timed out`);
}

async function generateModel({ file, prompt }) {
  const out = resolve(MODELS_DIR, file);
  if (existsSync(out)) { console.log(`  ✓ ${file} already exists — skipping`); return; }
  console.log(`  ▸ ${file}`);
  console.log(`    preview stage…`);
  const preview = await meshyRequest('/openapi/v2/text-to-3d', {
    method: 'POST',
    body: JSON.stringify({ mode: 'preview', prompt, art_style: 'realistic', should_remesh: true, topology: 'triangle', target_polycount: 15000 }),
  });
  const previewTask = await meshyWait(preview.result);
  console.log('\n    refine stage (textures)…');
  const refine = await meshyRequest('/openapi/v2/text-to-3d', {
    method: 'POST',
    body: JSON.stringify({ mode: 'refine', preview_task_id: previewTask.id, enable_pbr: false }),
  });
  const refineTask = await meshyWait(refine.result);
  const glbUrl = refineTask.model_urls?.glb;
  if (!glbUrl) throw new Error('No GLB url in refine result');
  console.log('\n    downloading…');
  const glb = await fetch(glbUrl);
  writeFileSync(out, Buffer.from(await glb.arrayBuffer()));
  console.log(`    ✓ saved ${file}`);
}

// ============================================================
// ELEVENLABS — sound effects + narration
// ============================================================
const SFX = [
  { file: 'wind_loop.mp3', text: 'cold arctic wind blowing across open ice, steady loopable ambience, no music', duration: 10, loop: true },
  { file: 'cub_call.mp3', text: 'small bear cub distress call, short high-pitched bleat', duration: 2 },
  { file: 'mother_call.mp3', text: 'adult female polar bear low chuffing call to her cubs, deep breathy huff', duration: 2.5 },
  { file: 'ice_crack.mp3', text: 'thick lake ice cracking and shattering, deep booming fracture', duration: 3 },
  { file: 'splash.mp3', text: 'large animal splashing into freezing sea water', duration: 2.5 },
  { file: 'pounce_roar.mp3', text: 'polar bear aggressive roar and heavy impact on ice', duration: 3 },
  { file: 'eating.mp3', text: 'large animal eating, wet chewing and tearing', duration: 3 },
];

const NARRATION = [
  { file: 'narrator_intro.mp3', text: 'Four months without food. She has turned her own body into milk. Now, somewhere out on the ice, a seal is breathing — and two small lives depend on whether she can find it.' },
  { file: 'narrator_win.mp3', text: 'The storm can come now. It no longer matters. Tonight, for the first time since the den, this family sleeps with full bellies.' },
  { file: 'narrator_loss.mp3', text: 'The Arctic keeps its own ledger. Today, the ice took more than it gave. But as long as the mother breathes, the ledger is not closed.' },
];

// "Antoni" is a good documentary voice; override with ELEVENLABS_VOICE_ID
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'ErXwobaYiN019PkySvjV';

async function elevenSfx({ file, text, duration, loop }) {
  const out = resolve(AUDIO_DIR, file);
  if (existsSync(out)) { console.log(`  ✓ ${file} already exists — skipping`); return; }
  console.log(`  ▸ ${file}`);
  const res = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
    method: 'POST',
    headers: { 'xi-api-key': ELEVEN_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, duration_seconds: duration, prompt_influence: 0.4, ...(loop ? { loop: true } : {}) }),
  });
  if (!res.ok) throw new Error(`ElevenLabs SFX ${file} → ${res.status}: ${await res.text()}`);
  writeFileSync(out, Buffer.from(await res.arrayBuffer()));
  console.log(`    ✓ saved ${file}`);
}

async function elevenTts({ file, text }) {
  const out = resolve(AUDIO_DIR, file);
  if (existsSync(out)) { console.log(`  ✓ ${file} already exists — skipping`); return; }
  console.log(`  ▸ ${file}`);
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': ELEVEN_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.6, similarity_boost: 0.8, style: 0.35 },
    }),
  });
  if (!res.ok) throw new Error(`ElevenLabs TTS ${file} → ${res.status}: ${await res.text()}`);
  writeFileSync(out, Buffer.from(await res.arrayBuffer()));
  console.log(`    ✓ saved ${file}`);
}

// ============================================================
async function main() {
  let failed = false;

  if (!audioOnly) {
    console.log('\n=== Meshy: 3D models ===');
    if (!MESHY_KEY) {
      console.log('  ⚠ MESHY_API_KEY not set — skipping models (game uses procedural bears).');
    } else {
      for (const m of MESHY_MODELS) {
        try { await generateModel(m); }
        catch (e) { failed = true; console.error(`  ✗ ${m.file}: ${e.message}`); }
      }
    }
  }

  if (!modelsOnly) {
    console.log('\n=== ElevenLabs: audio ===');
    if (!ELEVEN_KEY) {
      console.log('  ⚠ ELEVENLABS_API_KEY not set — skipping audio (game uses synth fallback).');
    } else {
      for (const s of SFX) {
        try { await elevenSfx(s); }
        catch (e) { failed = true; console.error(`  ✗ ${s.file}: ${e.message}`); }
      }
      for (const n of NARRATION) {
        try { await elevenTts(n); }
        catch (e) { failed = true; console.error(`  ✗ ${n.file}: ${e.message}`); }
      }
    }
  }

  console.log('\nDone. Assets land in public/models and public/audio — the game picks them up automatically on next reload.');
  if (failed) process.exitCode = 1;
}

main().catch((e) => { console.error(e); process.exit(1); });

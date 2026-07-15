// Audio: prefers ElevenLabs-generated files in /audio/, falls back to
// WebAudio synthesis so the game is never silent.
const FILES = {
  wind: '/audio/wind_loop.mp3',
  cubCall: '/audio/cub_call.mp3',
  motherCall: '/audio/mother_call.mp3',
  iceCrack: '/audio/ice_crack.mp3',
  splash: '/audio/splash.mp3',
  pounce: '/audio/pounce_roar.mp3',
  eat: '/audio/eating.mp3',
  narratorIntro: '/audio/narrator_intro.mp3',
  narratorWin: '/audio/narrator_win.mp3',
  narratorLoss: '/audio/narrator_loss.mp3',
};

export class GameAudio {
  constructor() {
    this.ctx = null;
    this.buffers = {};
    this.windGain = null;
    this.started = false;
  }

  async start() {
    if (this.started) return;
    this.started = true;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    // try to load generated files (missing files are fine)
    await Promise.all(Object.entries(FILES).map(async ([key, url]) => {
      try {
        const res = await fetch(url);
        if (!res.ok) return;
        const buf = await res.arrayBuffer();
        this.buffers[key] = await this.ctx.decodeAudioData(buf);
      } catch { /* fallback synth will cover it */ }
    }));
    this.#startWind();
  }

  #startWind() {
    const ctx = this.ctx;
    this.windGain = ctx.createGain();
    this.windGain.gain.value = 0.12;
    this.windGain.connect(ctx.destination);

    if (this.buffers.wind) {
      const src = ctx.createBufferSource();
      src.buffer = this.buffers.wind;
      src.loop = true;
      src.connect(this.windGain);
      src.start();
      return;
    }
    // synth wind: filtered noise
    const len = ctx.sampleRate * 4;
    const noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf; src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass'; filter.frequency.value = 320; filter.Q.value = 0.6;
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.13; lfoGain.gain.value = 140;
    lfo.connect(lfoGain); lfoGain.connect(filter.frequency);
    src.connect(filter); filter.connect(this.windGain);
    src.start(); lfo.start();
  }

  setStorm(intensity) {
    if (this.windGain) {
      this.windGain.gain.setTargetAtTime(0.12 + intensity * 0.5, this.ctx.currentTime, 1.5);
    }
  }

  play(key, { volume = 0.6 } = {}) {
    if (!this.ctx) return;
    if (this.buffers[key]) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.buffers[key];
      const g = this.ctx.createGain();
      g.gain.value = volume;
      src.connect(g); g.connect(this.ctx.destination);
      src.start();
      return;
    }
    this.#synth(key, volume);
  }

  #synth(key, volume) {
    const ctx = this.ctx, t = ctx.currentTime;
    const g = ctx.createGain();
    g.connect(ctx.destination);
    const beep = (freq0, freq1, dur, type = 'sine', vol = volume) => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.setValueAtTime(freq0, t);
      o.frequency.exponentialRampToValueAtTime(Math.max(freq1, 1), t + dur);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g); o.start(t); o.stop(t + dur);
    };
    const noiseBurst = (dur, freq, vol = volume) => {
      const len = ctx.sampleRate * dur;
      const b = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = b.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const s = ctx.createBufferSource(); s.buffer = b;
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = freq;
      g.gain.setValueAtTime(vol, t);
      s.connect(f); f.connect(g); s.start(t);
    };
    switch (key) {
      case 'cubCall': beep(680, 420, 0.28, 'triangle', volume * 0.7); break;
      case 'motherCall': beep(190, 90, 0.6, 'sawtooth', volume * 0.5); break;
      case 'iceCrack': noiseBurst(0.45, 900, volume); beep(120, 40, 0.4, 'square', volume * 0.3); break;
      case 'splash': noiseBurst(0.7, 500, volume * 0.8); break;
      case 'pounce': beep(160, 60, 0.5, 'sawtooth', volume * 0.8); noiseBurst(0.3, 700, volume * 0.5); break;
      case 'eat': noiseBurst(0.25, 350, volume * 0.4); break;
      default: break;
    }
  }
}

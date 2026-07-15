/* =====================================================================
   ADA · Kaçış Düzenekleri — contraption puzzle mode
   The Incredible Machine DNA: assign parts to slots, RUN, watch the
   chain succeed or fail in a *specific, authored, comic* way.
   Fails are content, not punishment.
   Data: data/puzzles.json · executed by the step-runner below.
   ===================================================================== */
"use strict";

export function createPuzzles(api, DATA) {
  // api: { prop, say, splash, toast, kaz, setFire, setShip, setPalmShake,
  //        adjMorale, adjAttach, addCounters, state, save, refreshAll,
  //        interrupt, setBusy, GROUND }
  const P = {
    open: false,          // panel visible
    level: null,          // level being played
    assign: {},           // slotId -> partId
    running: false,
    steps: [], stepIdx: 0, step: null,
    placed: [],           // [{name,x,y}] props on stage (y relative to GROUND)
    outcome: null,
  };

  /* ---------- outcome matching ---------- */
  function matchOutcome(level) {
    const key = level.slots.map((s) => P.assign[s.id] || "-").join(",");
    for (const [pat, out] of Object.entries(level.outcomes)) {
      const parts = pat.split(",");
      if (parts.length === level.slots.length &&
          parts.every((p, i) => p === "*" || p === key.split(",")[i])) return out;
    }
    return level.default || null;
  }

  /* ---------- step runner ---------- */
  function startRun() {
    const out = matchOutcome(P.level);
    if (!out) return;
    P.outcome = out;
    P.running = true;
    P.steps = out.steps; P.stepIdx = 0; P.step = null;
    P.placed = [];
    api.interrupt();          // stop ambient scene/tasks
    renderPanel();
  }
  function finishRun() {
    P.running = false;
    const out = P.outcome;
    api.toast((out.success ? "✅ " : "🙃 ") + out.result);
    const r = out.reward || {};
    if (r.morale) api.adjMorale(r.morale);
    if (r.attach) api.adjAttach(r.attach);
    api.addCounters(r);
    if (out.success && !api.state.solved.includes(P.level.id)) {
      api.state.solved.push(P.level.id);
      api.say("✔", api.kaz.x);
    }
    api.state.puzzleTries = (api.state.puzzleTries || 0) + 1;
    api.save();
    api.setFire(false);
    setTimeout(() => { P.placed = []; renderPanel(); }, 2500);
  }

  function tick(dts) {
    if (!P.running) return;
    if (!P.step) {
      if (P.stepIdx >= P.steps.length) { finishRun(); return; }
      P.step = { ...P.steps[P.stepIdx++], t: 0 };
      beginStep(P.step);
    }
    const s = P.step;
    s.t += dts;
    switch (s.op) {
      case "walk": {
        api.kaz.setAnim("walk");
        const d = Math.sign(s.x - api.kaz.x);
        api.kaz.dir = d || api.kaz.dir;
        api.kaz.x += 30 * dts * d;
        if (Math.abs(api.kaz.x - s.x) < 2) { api.kaz.x = s.x; api.kaz.setAnim("idle"); P.step = null; }
        break;
      }
      case "anim": if (s.t >= s.sec) P.step = null; break;
      case "wait": if (s.t >= s.sec) P.step = null; break;
      case "move": {
        const pr = P.placed.find((p) => p.name === s.name);
        if (!pr) { P.step = null; break; }
        const k = Math.min(1, s.t / s.sec);
        pr.x = s._fx + (s.toX - s._fx) * k;
        pr.y = s._fy + (s.toY - s._fy) * k;
        if (k >= 1) P.step = null;
        break;
      }
      case "arc": {
        const pr = P.placed.find((p) => p.name === s.name);
        if (!pr) { P.step = null; break; }
        const k = Math.min(1, s.t / s.sec);
        pr.x = s.fromX + (s.toX - s.fromX) * k;
        pr.y = s.fromY + (s.toY - s.fromY) * k - Math.sin(k * Math.PI) * 14;
        if (k >= 1) { pr.y = s.toY; P.step = null; }
        break;
      }
      case "kazArc": {
        const k = Math.min(1, s.t / s.sec);
        api.kaz.setAnim("happy");
        api.kaz.x = s._fx + (s.toX - s._fx) * k;
        api.kaz.air = Math.sin(k * Math.PI) * (s.peak || 50);
        if (k >= 1) { api.kaz.air = 0; api.splash(s.toX, 164); P.step = null; }
        break;
      }
      case "swimBack": {
        const k = Math.min(1, s.t / s.sec);
        api.kaz.setAnim("walk");
        api.kaz.dir = 1;
        api.kaz.x = s._fx + (s.toX - s._fx) * k;
        if (Math.floor(s.t * 4) !== Math.floor((s.t - dts) * 4)) api.splash(api.kaz.x - 6, 168);
        if (k >= 1) P.step = null;
        break;
      }
      default: P.step = null; // instantaneous ops handled in beginStep
    }
  }
  function beginStep(s) {
    switch (s.op) {
      case "bubble": api.say(s.txt, s.x ?? api.kaz.x); s.op = "wait"; s.sec = 0.9; break;
      case "prop": P.placed.push({ name: s.name, x: s.x, y: s.y }); s.op = "wait"; s.sec = 0.25; break;
      case "move": {
        const pr = P.placed.find((p) => p.name === s.name);
        if (pr) { s._fx = pr.x; s._fy = pr.y; }
        break;
      }
      case "arc": if (!P.placed.some((p) => p.name === s.name)) P.placed.push({ name: s.name, x: s.fromX, y: s.fromY }); break;
      case "kazArc": s._fx = api.kaz.x; break;
      case "swimBack": s._fx = api.kaz.x; break;
      case "anim": api.kaz.setAnim(s.name); if (s.dir) api.kaz.dir = s.dir; break;
      case "fire": api.setFire(s.on); s.op = "wait"; s.sec = 0.4; break;
      case "palm": api.setPalmShake(s.on ? 1 : 0); s.op = "wait"; s.sec = 0.3; break;
      case "ship": api.setShip(); s.op = "wait"; s.sec = 0.3; break;
      case "splash": api.splash(s.x, api.GROUND - (s.y ?? 0)); s.op = "wait"; s.sec = 0.2; break;
    }
  }

  /* ---------- canvas overlay ---------- */
  function draw(ctx) {
    if (!P.level) return;
    for (const pr of P.placed) api.prop(pr.name, pr.x, api.GROUND + pr.y);
    if (P.running) return;
    // slot markers while building
    ctx.save();
    ctx.strokeStyle = "rgba(224,122,63,.9)";
    ctx.setLineDash([3, 2]);
    ctx.font = "8px monospace"; ctx.textBaseline = "top";
    P.level.slots.forEach((sl) => {
      ctx.strokeRect(sl.x - 10, api.GROUND - 22, 20, 24);
      ctx.fillStyle = "rgba(224,122,63,.95)";
      ctx.fillText(sl.id, sl.x - 3, api.GROUND - 32);
      const part = P.assign[sl.id];
      if (part) {
        const meta = DATA.parts[part];
        api.prop(meta.prop, sl.x - 6, api.GROUND - 14);
      }
    });
    ctx.restore();
  }

  /* ---------- DOM panel ---------- */
  const panel = document.getElementById("puzzlePanel");
  function levelUnlocked(i) { return i === 0 || api.state.solved.includes(DATA.levels[i - 1].id); }

  function renderPanel() {
    if (!P.open) { panel.hidden = true; return; }
    panel.hidden = false;
    if (!P.level) {
      panel.innerHTML = `<div class="pz-head">🧩 Kaçış Düzenekleri</div>` +
        DATA.levels.map((lv, i) => {
          const solved = api.state.solved.includes(lv.id);
          const locked = !levelUnlocked(i);
          return `<button class="pz-level" data-id="${lv.id}" ${locked ? "disabled" : ""}>
            ${solved ? "✅" : locked ? "🔒" : "▶️"} ${lv.title}</button>`;
        }).join("") +
        `<button class="pz-close">kapat</button>`;
      panel.querySelectorAll(".pz-level").forEach((b) =>
        b.addEventListener("click", () => { openLevel(b.dataset.id); }));
      panel.querySelector(".pz-close").addEventListener("click", close);
      return;
    }
    const lv = P.level;
    const partLabel = (p) => (p ? DATA.parts[p].label : "—");
    const used = Object.values(P.assign);
    panel.innerHTML = `
      <div class="pz-head">🧩 ${lv.title}</div>
      <div class="pz-goal">${lv.goal}</div>
      <div class="pz-slots">${lv.slots.map((sl) => `
        <label>${sl.id} · ${sl.label}
          <select data-slot="${sl.id}" ${P.running ? "disabled" : ""}>
            <option value="">—</option>
            ${lv.parts.map((p) => `<option value="${p}" ${P.assign[sl.id] === p ? "selected" : ""}
              ${used.includes(p) && P.assign[sl.id] !== p ? "disabled" : ""}>${partLabel(p)}</option>`).join("")}
          </select>
        </label>`).join("")}
      </div>
      <div class="pz-actions">
        <button class="pz-run" ${P.running || lv.slots.some((s) => !P.assign[s.id]) ? "disabled" : ""}>
          ${P.running ? "çalışıyor…" : "▶ ÇALIŞTIR"}</button>
        <button class="pz-back" ${P.running ? "disabled" : ""}>← bölümler</button>
      </div>`;
    panel.querySelectorAll("select").forEach((sel) =>
      sel.addEventListener("change", () => {
        if (sel.value) P.assign[sel.dataset.slot] = sel.value;
        else delete P.assign[sel.dataset.slot];
        renderPanel();
      }));
    panel.querySelector(".pz-run").addEventListener("click", startRun);
    panel.querySelector(".pz-back").addEventListener("click", () => { P.level = null; P.placed = []; renderPanel(); });
  }

  function openLevel(id) {
    P.level = DATA.levels.find((l) => l.id === id);
    P.assign = {}; P.placed = []; P.running = false;
    renderPanel();
  }
  function open() {
    P.open = true;
    api.setBusy(true);
    api.interrupt();
    renderPanel();
  }
  function close() {
    P.open = false; P.level = null; P.placed = []; P.running = false;
    api.setBusy(false);
    api.setFire(false);
    renderPanel();
  }

  return {
    open, close, tick, draw,
    isOpen: () => P.open,
    isRunning: () => P.running,
    // QA hook: ?pz=<levelId>&parts=a,b,c auto-runs an outcome
    debugRun(levelId, parts) {
      open(); openLevel(levelId);
      P.level.slots.forEach((s, i) => { if (parts[i]) P.assign[s.id] = parts[i]; });
      renderPanel(); startRun();
    },
  };
}

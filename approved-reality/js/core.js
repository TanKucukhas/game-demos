// APPROVED REALITY — engine core
// 192x108 procedural pixel engine: material ramps + live light map + dither,
// deterministic 11fps animation, point&click actor, terminal UI, dialogue,
// global state + save, contradiction notebook, adaptive director.
(function () {
  const AR = window.AR = {};
  const cv = document.getElementById('cv');
  const x = cv.getContext('2d');
  const W = 192, H = 108, N = W * H;
  AR.W = W; AR.H = H;
  const off = document.createElement('canvas');
  off.width = W; off.height = H;
  const o = off.getContext('2d');

  // ---------- BITMAP FONT ----------
  // 5x7 glyphs, vertically stretched to 9 rows, drawn as 2x2 blocks on a
  // 3x text overlay canvas (#tv). Layout metrics are unchanged: advance is
  // still 4 scene px, so all existing wrap widths and x/y positions hold.
  const tvc = document.getElementById('tv');
  const tvx = tvc.getContext('2d');
  const TS = 3;
  const F = {
  'A':'.XXX.|X...X|X...X|XXXXX|X...X|X...X|X...X',
  'B':'XXXX.|X...X|X...X|XXXX.|X...X|X...X|XXXX.',
  'C':'.XXX.|X...X|X....|X....|X....|X...X|.XXX.',
  'D':'XXXX.|X...X|X...X|X...X|X...X|X...X|XXXX.',
  'E':'XXXXX|X....|X....|XXXX.|X....|X....|XXXXX',
  'F':'XXXXX|X....|X....|XXXX.|X....|X....|X....',
  'G':'.XXX.|X...X|X....|X.XXX|X...X|X...X|.XXXX',
  'H':'X...X|X...X|X...X|XXXXX|X...X|X...X|X...X',
  'I':'XXXXX|..X..|..X..|..X..|..X..|..X..|XXXXX',
  'J':'..XXX|...X.|...X.|...X.|...X.|X..X.|.XX..',
  'K':'X...X|X..X.|X.X..|XX...|X.X..|X..X.|X...X',
  'L':'X....|X....|X....|X....|X....|X....|XXXXX',
  'M':'X...X|XX.XX|X.X.X|X.X.X|X...X|X...X|X...X',
  'N':'X...X|XX..X|X.X.X|X..XX|X...X|X...X|X...X',
  'O':'.XXX.|X...X|X...X|X...X|X...X|X...X|.XXX.',
  'P':'XXXX.|X...X|X...X|XXXX.|X....|X....|X....',
  'Q':'.XXX.|X...X|X...X|X...X|X.X.X|X..X.|.XX.X',
  'R':'XXXX.|X...X|X...X|XXXX.|X.X..|X..X.|X...X',
  'S':'.XXXX|X....|X....|.XXX.|....X|....X|XXXX.',
  'T':'XXXXX|..X..|..X..|..X..|..X..|..X..|..X..',
  'U':'X...X|X...X|X...X|X...X|X...X|X...X|.XXX.',
  'V':'X...X|X...X|X...X|X...X|X...X|.X.X.|..X..',
  'W':'X...X|X...X|X...X|X.X.X|X.X.X|XX.XX|X...X',
  'X':'X...X|X...X|.X.X.|..X..|.X.X.|X...X|X...X',
  'Y':'X...X|X...X|.X.X.|..X..|..X..|..X..|..X..',
  'Z':'XXXXX|....X|...X.|..X..|.X...|X....|XXXXX',
  '0':'.XXX.|X...X|X..XX|X.X.X|XX..X|X...X|.XXX.',
  '1':'..X..|.XX..|..X..|..X..|..X..|..X..|XXXXX',
  '2':'.XXX.|X...X|....X|...X.|..X..|.X...|XXXXX',
  '3':'XXXXX|...X.|..X..|...X.|....X|X...X|.XXX.',
  '4':'...X.|..XX.|.X.X.|X..X.|XXXXX|...X.|...X.',
  '5':'XXXXX|X....|XXXX.|....X|....X|X...X|.XXX.',
  '6':'..XX.|.X...|X....|XXXX.|X...X|X...X|.XXX.',
  '7':'XXXXX|....X|...X.|..X..|.X...|.X...|.X...',
  '8':'.XXX.|X...X|X...X|.XXX.|X...X|X...X|.XXX.',
  '9':'.XXX.|X...X|X...X|.XXXX|....X|...X.|.XX..',
  ':':'.....|.....|..X..|.....|.....|..X..|.....',
  '.':'.....|.....|.....|.....|.....|.XX..|.XX..',
  ',':'.....|.....|.....|.....|..X..|..X..|.X...',
  '-':'.....|.....|.....|XXXXX|.....|.....|.....',
  '=':'.....|.....|XXXXX|.....|XXXXX|.....|.....',
  '+':'.....|..X..|..X..|XXXXX|..X..|..X..|.....',
  '?':'.XXX.|X...X|....X|...X.|..X..|.....|..X..',
  '!':'..X..|..X..|..X..|..X..|..X..|.....|..X..',
  '/':'....X|....X|...X.|..X..|.X...|X....|X....',
  '%':'XX..X|XX..X|...X.|..X..|.X...|X..XX|X..XX',
  '(':'...X.|..X..|.X...|.X...|.X...|..X..|...X.',
  ')':'.X...|..X..|...X.|...X.|...X.|..X..|.X...',
  "'":'..X..|..X..|.X...|.....|.....|.....|.....',
  '▸':'X....|XX...|XXX..|XXXX.|XXX..|XX...|X....',
  '·':'.....|.....|.....|.XX..|.XX..|.....|.....',
  ' ':'.....|.....|.....|.....|.....|.....|.....'
  };
  F['—']=F['-']; F['–']=F['-'];
  F['"']='.X.X.|.X.X.|.....|.....|.....|.....|.....';
  const ROWMAP=[0,1,2,3,3,4,5,6];
  const r  = (g,a,b,w,h,c) => { g.fillStyle=c; g.fillRect(a,b,w,h); };
  const di = (g,a,b,w,h,c,s) => { g.fillStyle=c;
    for (let j=b;j<b+h;j++) for (let i=a;i<a+w;i++) if ((i+j)%s===0) g.fillRect(i,j,1,1); };
  const bt = (g,s,x0,y0,c) => { tvx.fillStyle=c; let cx=x0*TS;
    const ty=y0*TS+4;
    for (const ch of String(s)) { const rows=(F[ch]||F[' ']).split('|');
      for (let ry=0;ry<8;ry++){ const row=rows[ROWMAP[ry]];
        for (let rx=0;rx<5;rx++) if (row[rx]==='X') tvx.fillRect(cx+rx*2,ty+ry*2,2,2); }
      cx+=12; } };
  // clear a scene-space rect on the text overlay — UI panels call this so
  // in-scene text does not float above them
  const cls = (x0,y0,w,h) => tvx.clearRect(x0*TS,y0*TS,w*TS,h*TS);
  AR.cls = cls;
  const wrap = (s, n) => { n=n||46; const out=[]; let line='';
    for (const w2 of String(s).split(' ')){
      if ((line+' '+w2).trim().length>n){ if(line)out.push(line); line=w2; }
      else line=(line?line+' ':'')+w2; }
    if (line) out.push(line); return out; };
  AR.F=F; AR.r=r; AR.di=di; AR.bt=bt; AR.wrap=wrap;

  // ---------- MATERIAL RAMPS ----------
  const RAMP = {
    WALL : ['#0e0c16','#151827','#1e2333','#2c3040','#443f4a'],
    FLOOR: ['#0c0a12','#14121e','#1c1c2a','#282634','#3e3a44'],
    METAL: ['#101320','#1e2331','#303848','#485264','#687892'],
    SCREEN:['#05070d','#0a0f18','#101724','#1a2434','#283648'],
    PAPER: ['#3e3648','#5c5555','#7e7768','#a29a82','#c8bfa0'],
    RED  : ['#4a1026','#701a2c','#96222e','#bc3a36','#d95c46'],
    WOOD : ['#1a0f14','#2c1c16','#42291a','#5c3d22','#7a552e'],
    WAX  : ['#3a2820','#584030','#785a40','#9c7a52','#c0a068'],
    NIGHT: ['#05060e','#090b18','#0e1124','#151a32','#1e2442'],
    BLDG : ['#0b0d1a','#121628','#1a1f36','#242b46','#303a58'],
    GLASS: ['#141c2e','#243044','#3c4c62','#5c7288','#8aa2b4'],
    BRICK: ['#160e14','#241419','#361d1e','#4a2c24','#5e3e2c'],
    MOSS : ['#0c120e','#142016','#1e3020','#2c422c','#3e563a'],
    SKY  : ['#0a0c18','#111427','#1a1e38','#262b4c','#343a60']
  };
  const MATS = Object.keys(RAMP);
  const M = {}; MATS.forEach((k,i)=>M[k]=i);
  AR.M = M; AR.RAMP = RAMP;
  const ramp32 = MATS.map(k => RAMP[k].map(h => {
    const v=parseInt(h.slice(1),16);
    return (0xff<<24)|((v&0xff)<<16)|(v&0xff00)|((v>>16)&0xff); }));

  // ---------- SCENE BUFFERS + LIGHT ENGINE ----------
  const mat  = new Uint8Array(N);
  const base = new Float32Array(N);
  const resp = new Float32Array(MATS.length).fill(1);
  resp[M.NIGHT]=0.15; resp[M.BLDG]=0.2; resp[M.SCREEN]=0.35;
  resp[M.SKY]=0.1; resp[M.GLASS]=0.6;
  let lights = [];            // {att:Float32Array, I:fn(t)->mult}
  let dynFn  = null;          // fn(t) -> [{x,y,str,f}] moving lights

  // ---------- PROP LAYER ----------
  // Walls and floors stay procedural (the light engine renders them well and
  // they must tile). Objects are AI pixel art placed by code, so layout is
  // still editable and the SAME light map shades them: a lamp switching off
  // darkens the desk art exactly as it darkens the wall.
  const propR = new Uint8Array(N), propG = new Uint8Array(N),
        propB = new Uint8Array(N), propOn = new Uint8Array(N);
  const PROPS = AR.PROPS = {};          // name -> {w,h,r,g,b,a}
  AR.loadProps = (names) => Promise.all(names.map(n => new Promise(res => {
    const im = new Image();
    im.onload = () => {
      const c = document.createElement('canvas');
      c.width = im.width; c.height = im.height;
      const cx2 = c.getContext('2d');
      cx2.drawImage(im, 0, 0);
      const d = cx2.getImageData(0, 0, im.width, im.height).data;
      const n2 = im.width*im.height;
      const P = {w:im.width, h:im.height, r:new Uint8Array(n2),
                 g:new Uint8Array(n2), b:new Uint8Array(n2), a:new Uint8Array(n2)};
      for (let i=0;i<n2;i++){
        P.r[i]=d[i*4]; P.g[i]=d[i*4+1]; P.b[i]=d[i*4+2]; P.a[i]=d[i*4+3]; }
      PROPS[n] = P; res();
    };
    im.onerror = () => res();
    im.src = 'art/prop/'+n+'.png';
  })));

  const gfx = AR.gfx = {
    put(mx,my,mw,mh,m2,b2){
      for (let j=my;j<my+mh;j++) for (let i=mx;i<mx+mw;i++){
        const k=j*W+i; mat[k]=m2; base[k]=b2; } },
    tex(mx,my,mw,mh,s,amt){
      for (let j=my;j<my+mh;j++) for (let i=mx;i<mx+mw;i++)
        if ((i+j)%s===0) base[j*W+i]-=amt; },
    shadow(mx,my,mw,mh,amt){
      for (let j=my;j<my+mh;j++) for (let i=mx;i<mx+mw;i++){
        const edge = (i===mx||i===mx+mw-1||j===my||j===my+mh-1);
        if (edge && ((i+j)&1)) continue;
        base[j*W+i]-=edge?amt*0.5:amt; } },
    // place an AI prop; x,y is its top-left in scene pixels.
    // flip mirrors it, resp sets how strongly light affects it.
    prop(name,x0,y0,opt){
      const P=PROPS[name]; if (!P) return null;
      opt=opt||{};
      const fl=!!opt.flip, rp=opt.resp==null?1:opt.resp;
      for (let j=0;j<P.h;j++) for (let i=0;i<P.w;i++){
        const si=j*P.w+(fl?P.w-1-i:i);
        if (P.a[si]<128) continue;
        const X=x0+i, Y=y0+j;
        if (X<0||X>=W||Y<0||Y>=H) continue;
        const k=Y*W+X;
        propR[k]=P.r[si]; propG[k]=P.g[si]; propB[k]=P.b[si]; propOn[k]=1;
        base[k]=rp;                      // prop pixels ignore wall texture
      }
      return {x:x0, y:y0, w:P.w, h:P.h};
    },
    propSize(name){ const P=PROPS[name]; return P?{w:P.w,h:P.h}:null; },
    reset(){ mat.fill(0); base.fill(0); lights=[]; dynFn=null;
      propOn.fill(0); },
    light(x0,y0,str,f,ell,I){       // precomputed attenuation pool
      const att=new Float32Array(N);
      ell=ell||1;
      for (let j=0;j<H;j++) for (let i=0;i<W;i++){
        const dx=i-x0, dy=(j-y0)*ell;
        att[j*W+i]=str/(1+(dx*dx+dy*dy)*f); }
      lights.push({att, I:I||(()=>1)}); },
    dyn(fn){ dynFn=fn; },
    amb(v){ this._amb=v; }, _amb:0
  };

  const img = o.createImageData(W,H);
  const u32 = new Uint32Array(img.data.buffer);
  const BAYER = [0.25,0.75,0.85,0.35];

  function lightPass(t){
    const Is = lights.map(l=>l.I(t));
    const dyn = dynFn ? dynFn(t) : null;
    const ambv = gfx._amb;
    for (let j=0;j<H;j++) for (let i=0;i<W;i++){
      const k=j*W+i, m2=mat[k];
      let li=ambv;
      for (let s=0;s<lights.length;s++) li+=lights[s].att[k]*Is[s];
      if (dyn) for (const d of dyn){
        const dx=i-d.x, dy=(j-d.y)*(d.ell||1);
        li+=d.str/(1+(dx*dx+dy*dy)*d.f); }
      if (propOn[k]){
        // prop pixel: shade the AI colour by the same light map, banded +
        // dithered so it keeps the scene's pixel-art stepping
        let v = base[k]*li;
        if (v<0)v=0; if (v>1.9)v=1.9;
        const s=v*6, s0=s|0;
        let band=s0+((s-s0)>BAYER[((j&1)<<1)|(i&1)]?1:0);
        const m3=band/6;
        const rr=propR[k]*m3|0, gg=propG[k]*m3|0, bb=propB[k]*m3|0;
        u32[k]=(0xff<<24)|((bb>255?255:bb)<<16)|((gg>255?255:gg)<<8)|(rr>255?255:rr);
        continue;
      }
      let v = base[k]+resp[m2]*li;
      if (v<0)v=0; if (v>4.99)v=4.99;
      const i0=v|0, f=v-i0;
      let idx=i0+(f>BAYER[((j&1)<<1)|(i&1)]?1:0);
      if (idx>4)idx=4;
      u32[k]=ramp32[m2][idx];
    }
    o.putImageData(img,0,0);
  }

  // ---------- AUDIO ----------
  let sesOn=true, muzOn=true; const SND={};
  AR.ses = (ad,vol) => { if (!sesOn) return;
    let a=SND[ad]; if (!a){ a=new Audio('audio/'+ad+'.mp3'); SND[ad]=a; }
    try{ a.currentTime=0; a.volume=vol||0.5; a.play().catch(()=>{}); }catch(e){} };
  // footsteps: alternate two soft samples with random pitch/volume so
  // walking does not sound mechanical
  AR.step = (k) => { if (!sesOn) return;
    try{ const a=new Audio('audio/adim'+(1+(k&1))+'.mp3');
      a.volume=0.13+Math.random()*0.07;
      a.playbackRate=0.85+Math.random()*0.3;
      a.play().catch(()=>{}); }catch(e){} };
  let actx=null, ambN=null, ambWant=['hum','amb_room'];
  async function ambStart(){
    if (!actx) actx=new (window.AudioContext||window.webkitAudioContext)();
    await actx.resume();
    if (ambN) ambStop();
    ambN=[];
    const vols={hum:.05, amb_room:.035, amb_rain:.12};
    for (const ad of ambWant){
      try{
        const buf=await fetch('audio/'+ad+'.mp3').then(r2=>r2.arrayBuffer())
          .then(b=>actx.decodeAudioData(b));
        const src=actx.createBufferSource(); src.buffer=buf; src.loop=true;
        src.loopStart=0.15; src.loopEnd=Math.max(0.3,buf.duration-0.15);
        const g=actx.createGain(); g.gain.value=vols[ad]||.05;
        src.connect(g); g.connect(actx.destination);
        src.start(0,0.15); ambN.push({src});
      }catch(e){}
    }
  }
  function ambStop(){ if (ambN) for (const n of ambN){
    try{ n.src.stop(); }catch(e){} } ambN=null; }
  AR.ambSet = (list) => { ambWant=list;
    if (sesOn && audioUnlocked) ambStart(); };
  let muzA=null, muzName=null;
  AR.music = (name, vol) => {
    if (name===muzName){ if (muzA) muzA.volume=vol??muzA.volume; return; }
    if (muzA){ try{muzA.pause();}catch(e){} muzA=null; }
    muzName=name;
    if (!name) return;
    muzA=new Audio('audio/tema/'+name+'.mp3'); muzA.loop=true;
    muzA.volume=vol??0.14;
    if (muzOn && audioUnlocked) muzA.play().catch(()=>{});
  };
  let onceA=null;
  AR.musicOnce = (name, vol) => {   // non-looping stinger track
    if (onceA){ try{onceA.pause();}catch(e){} }
    const a=new Audio('audio/tema/'+name+'.mp3'); a.volume=vol??0.2;
    if (muzOn && audioUnlocked) a.play().catch(()=>{});
    onceA=a; return a; };
  AR.musicOnceStop = () => { if (onceA){ try{onceA.pause();}catch(e){} onceA=null; } };
  let audioUnlocked=false;
  function unlock(){ if (audioUnlocked) return; audioUnlocked=true;
    if (sesOn) ambStart();
    if (muzOn && muzA) muzA.play().catch(()=>{}); }
  document.addEventListener('pointerdown',unlock,true);
  document.addEventListener('keydown',unlock,true);
  const bs=document.getElementById('ms'), bm=document.getElementById('mm');
  bs.onclick=()=>{ sesOn=!sesOn; bs.classList.toggle('on',sesOn);
    if (sesOn) ambStart(); else ambStop(); };
  bm.onclick=()=>{ muzOn=!muzOn; bm.classList.toggle('on',muzOn);
    if (muzA){ if (muzOn) muzA.play().catch(()=>{}); else muzA.pause(); } };

  // ---------- GLOBAL STATE ----------
  const freshG = () => ({
    score:782, susp:0, att:0, breach:0,
    method:{LEGALISM:0,STEALTH:0,SOCIAL:0,SACRIFICE:0,SCORE_OPTIMIZER:0,TRUTH_SEEKER:0},
    cards:[], flags:{}, npc:{}, mods:[], chapter:1, label:'ELIAS ROOK', done:false
  });
  AR.G = freshG();
  AR.reset = () => { AR.G = freshG(); };
  AR.save = (sceneId) => {
    try{ localStorage.setItem('ar_save', JSON.stringify(
      {G:AR.G, scene:sceneId, label:AR.G.label})); }catch(e){} };
  AR.loadSave = () => {
    try{ const d=JSON.parse(localStorage.getItem('ar_save'));
      if (d&&d.G&&d.scene){ return d; } }catch(e){} return null; };
  AR.tag = (m,n) => { AR.G.method[m]=(AR.G.method[m]||0)+(n||1); };
  AR.card = (id, text, state) => {
    const c = AR.G.cards.find(c2=>c2.id===id);
    const rank={OBSERVATION:0,HYPOTHESIS:1,EVIDENCE:2};
    if (c){ if (rank[state]>rank[c.state]){ c.state=state; c.text=text||c.text;
        AR.toast('NOTEBOOK: '+state+' — '+ (text||c.text), '#d9b36a'); } return; }
    AR.G.cards.push({id, text, state:state||'OBSERVATION'});
    AR.ses('page',.35);
    AR.toast('NOTEBOOK +'+(state||'OBSERVATION')+': '+text, '#d9b36a');
  };
  AR.hasCard = (id, st) => { const c=AR.G.cards.find(c2=>c2.id===id);
    if (!c) return false; if (!st) return true;
    const rank={OBSERVATION:0,HYPOTHESIS:1,EVIDENCE:2};
    return rank[c.state]>=rank[st]; };
  AR.scoreAdd = (n, why) => { AR.G.score=Math.max(0,AR.G.score+n);
    AR.toast('CITIZEN SCORE '+(n>0?'+':'')+n+(why?' — '+why:'')+' ('+AR.G.score+')',
      n>=0?'#7a9a6a':'#c2242e'); };

  // adaptive director: top-2 method tags -> one modifier, announced
  AR.director = (table, done) => {
    const m=AR.G.method;
    const sorted=Object.keys(m).sort((a,b)=>m[b]-m[a]);
    const top=sorted.filter(k=>m[k]>0).slice(0,2);
    let pick=null;
    for (const k of top){ if (table[k] && !AR.G.mods.includes(table[k].id)){
      pick=table[k]; break; } }
    if (!pick) pick=table.DEFAULT;
    if (pick && !AR.G.mods.includes(pick.id)) AR.G.mods.push(pick.id);
    const lines=[
      'CHAPTER '+AR.G.chapter+' ASSESSMENT COMPLETE.','',
      'METHOD PROFILE:',
      ...sorted.slice(0,3).map(k=>'  '+k+': '+m[k]),
      '','BEHAVIOR MODEL UPDATED.',
      pick?pick.msg:'NO ADAPTATION REQUIRED.','',
      'COUNTERMEASURES ARE NOT PUNISHMENT.','THEY ARE CONTINUITY.'];
    AR.term.open({
      title:'CONTINUITY SYSTEM — ADAPTATION',
      body:lines, tcol:'#c2242e',
      opts:()=>[{t:'ACKNOWLEDGE', cb:()=>{ AR.ses('buzz',.3); done(); }}]
    });
  };

  // ---------- UI: strip, toasts, ask, say ----------
  const UI = AR.ui = { hover:null, msg:'', hudRight:null, showBreach:false };
  AR.msg = (s) => { UI.msg=String(s).toUpperCase(); UI.msgT=tGlob; };
  const toasts=[];
  AR.toast = (s, col) => { toasts.push({s:String(s).toUpperCase(), col:col||'#aeb7c2', t:0});
    if (toasts.length===1) AR.ses('sting',.18); };
  let askS=null;           // {q:[], opts:[], t0, note}
  AR.ask = (q, opts, note) => { askS={q:wrap(String(q).toUpperCase(),44), opts, t0:tGlob, note};
    UI.hover=null; UI.askHover=-1; };
  let sayS=null;           // {seq:[{w,s}], i, done}
  AR.say = (seq, done) => {
    const norm=seq.map(e=>Array.isArray(e)?{w:e[0],s:e[1],col:e[2]}:e);
    sayS={seq:norm, i:0, done}; };
  AR.busy = () => !!(askS||sayS||fade>0);

  function drawToasts(g){
    if (!toasts.length) return;
    const tt=toasts[0]; tt.t++;
    const lines=wrap(tt.s,46);
    const h2=lines.length*8+4;
    cls(0,0,192,h2+1);
    r(g,0,0,192,h2,'rgba(4,5,9,0.92)'); r(g,0,h2,192,1,'#232936');
    lines.forEach((l,i2)=>bt(g,l,3,2+i2*8,tt.col));
    if (tt.t>Math.max(30, lines.length*22)) toasts.shift();
  }
  function drawSay(g){
    if (!sayS) return;
    const e=sayS.seq[sayS.i];
    const lines=wrap(String(e.s).toUpperCase(),46);
    const h2=lines.length*8+14;
    const y0=108-h2;
    cls(0,y0,192,h2);
    r(g,0,y0,192,h2,'rgba(4,5,9,0.94)'); r(g,0,y0,192,1,'#232936');
    bt(g,String(e.w||'').toUpperCase(),3,y0+2,e.col||'#d9b36a');
    lines.forEach((l,i2)=>bt(g,l,3,y0+10+i2*8,'#c8cfd8'));
    bt(g,'▸',185,100,'#5c6472');
  }
  const askRows=[];
  function drawAsk(g){
    if (!askS) return;
    askRows.length=0;
    const qh=askS.q.length*8, oh=askS.opts.length*9;
    const noteH=askS.note?8:0;
    let y0=Math.max(8, 104-(qh+oh+noteH+14));
    cls(2,y0-3,188,qh+oh+noteH+14);
    r(g,2,y0-3,188,qh+oh+noteH+14,'rgba(4,5,9,0.95)');
    r(g,2,y0-3,188,1,'#3a4048'); r(g,2,y0+qh+oh+noteH+10,188,1,'#3a4048');
    askS.q.forEach((l,i2)=>bt(g,l,6,y0+i2*8,'#c8cfd8'));
    let oy=y0+qh+4;
    askS.opts.forEach((op,i2)=>{
      const hov = UI.askHover===i2;
      bt(g,(hov?'▸ ':'  ')+String(op.t).toUpperCase(),6,oy,
        op.dim?'#4a505a':(hov?'#d9b36a':'#8fa0b2'));
      askRows.push({y0:oy-1,y1:oy+8,i:i2});
      oy+=9;
    });
    if (askS.note) bt(g,String(askS.note).toUpperCase(),6,oy+2,'#4a505a');
  }
  function drawStrip(g,t){
    cls(0,96,192,12);
    r(g,0,96,192,12,'#06070b'); r(g,0,96,192,1,'#232936');
    const right = UI.showBreach ? 'BREACH '+AR.G.breach+'/3'
      : (UI.hudRight!=null?UI.hudRight:String(AR.G.score));
    const rw = right.length*4;
    const msgLines = wrap(UI.msg, 44-Math.ceil(rw/4));
    const freshMsg = UI.msg && UI.msgT!=null &&
      (t-UI.msgT) < 50*msgLines.length+16;
    if (UI.hover && !AR.busy() && !freshMsg)
      bt(g,'▸ '+UI.hover.ad,3,97,'#d9b36a');
    else {
      const idx = freshMsg ? Math.min(msgLines.length-1,(t-UI.msgT)/50|0) : 0;
      bt(g,msgLines[idx]||'',3,97,'#aeb7c2');
    }
    bt(g,right,189-rw,97,
      UI.showBreach&&AR.G.breach>0?'#c2242e':'#3a4048');
  }

  // ---------- NOTEBOOK OVERLAY ----------
  let noteOpen=false, notePg=0;
  AR.noteToggle = () => { noteOpen=!noteOpen; notePg=0; if(noteOpen)AR.ses('page',.4); };
  document.getElementById('mn').onclick=()=>AR.noteToggle();
  function drawNote(g){
    if (!noteOpen) return;
    cls(4,4,184,100);
    r(g,4,4,184,100,'rgba(5,6,10,0.96)');
    r(g,4,4,184,1,'#3a4048'); r(g,4,103,184,1,'#3a4048');
    bt(g,'CONTRADICTION NOTEBOOK',8,7,'#d9b36a');
    bt(g,'TAB TO CLOSE',140,7,'#4a505a');
    const cards=AR.G.cards;
    if (!cards.length){ bt(g,'NO ENTRIES. OBSERVE MORE.',8,20,'#5c6472'); return; }
    const per=5, pgs=Math.ceil(cards.length/per);
    notePg=Math.min(notePg,pgs-1);
    let y0=18;
    cards.slice(notePg*per,(notePg+1)*per).forEach(c=>{
      const gl={OBSERVATION:'(O)',HYPOTHESIS:'(H)',EVIDENCE:'(E)'}[c.state];
      const col={OBSERVATION:'#8fa0b2',HYPOTHESIS:'#d9b36a',EVIDENCE:'#7a9a6a'}[c.state];
      bt(g,gl,8,y0,col);
      const ls=wrap(c.text.toUpperCase(),40);
      ls.slice(0,2).forEach((l,i2)=>bt(g,l,24,y0+i2*8,'#aeb7c2'));
      y0+=ls.length>1?17:9; y0+=2;
    });
    if (pgs>1) bt(g,'PAGE '+(notePg+1)+'/'+pgs+' — CLICK TO TURN',8,95,'#4a505a');
  }

  // ---------- WRIST REPORT DEVICE ----------
  // every citizen carries one: a state-issued wrist unit for reporting others.
  // scenes expose subjects via sc.reportSubjects() -> [{t, cb, dim}]
  let devOpen=false; const devRows=[];
  AR.devToggle = () => { devOpen=!devOpen; UI.devHover=-1;
    AR.ses('buzz',devOpen?.3:.15); };
  AR.devIsOpen = () => devOpen;
  document.getElementById('md').onclick=()=>AR.devToggle();
  function drawDev(g,t){
    if (!devOpen) return;
    const x0=28,y0=14,w2=136,h2=80;
    cls(x0-6,y0,w2+12,h2);
    // straps
    r(g,x0-6,y0+32,6,16,'#141720'); r(g,x0+w2,y0+32,6,16,'#141720');
    r(g,x0-6,y0+32,6,2,'#262b36'); r(g,x0+w2,y0+32,6,2,'#262b36');
    // body, bezel, screen
    r(g,x0,y0,w2,h2,'#232833'); r(g,x0,y0,w2,2,'#343b48');
    r(g,x0,y0+h2-2,w2,2,'#12151c');
    r(g,x0+4,y0+4,w2-8,h2-8,'#0a0e15'); di(g,x0+4,y0+4,w2-8,h2-8,'#0d1624',3);
    if ((t/10|0)%2) r(g,x0+w2-10,y0+7,3,3,'#c2242e');
    bt(g,'CIVIC WRIST UNIT 4.1',x0+8,y0+6,'#5a86a0');
    bt(g,'CITIZEN 6079 · SCORE '+AR.G.score,x0+8,y0+15,'#aeb7c2');
    r(g,x0+8,y0+24,w2-16,1,'#232936');
    const sc=AR.scene;
    const subs=(sc&&sc.reportSubjects)?sc.reportSubjects():[];
    devRows.length=0;
    let oy=y0+28;
    bt(g,'REPORTABLE SUBJECTS IN RANGE:',x0+8,oy,'#3f4854'); oy+=9;
    if (!subs.length){
      bt(g,'NONE DETECTED.',x0+8,oy,'#5c6472'); oy+=8;
      bt(g,'THE FORM REMAINS OPEN.',x0+8,oy,'#3f4854'); oy+=9;
    }
    subs.forEach((op,i2)=>{
      const hov=UI.devHover===i2;
      bt(g,(hov?'▸ ':'  ')+String(op.t).toUpperCase(),x0+8,oy,
        op.dim?'#3f4854':(hov?'#d9b36a':'#8fa0b2'));
      devRows.push({y0:oy-1,y1:oy+8,i:i2,op});
      oy+=9; });
    bt(g,'REPORTING IS A RIGHT. AND A METRIC.',x0+8,y0+h2-11,'#3f4854');
  }

  // ---------- TERMINAL UI ----------
  const term = AR.term = {
    scr:null, stack:[], rows:[], hover:-1, pg:0,
    open(s){ this.scr=s; this.pg=0; this.hover=-1; AR.ses('crackle',.25); },
    push(s){ if (this.scr) this.stack.push(this.scr); this.open(s); },
    back(){ const p=this.stack.pop(); if (p) this.open(p); },
    close(){ this.scr=null; this.stack=[]; },
    draw(g,t){
      if (!this.scr) return;
      const s=this.scr;
      cls(0,0,192,108);
      r(g,0,0,192,108,'#04060b');
      di(g,0,0,192,108,'#070b13',3);
      r(g,0,0,192,11,s.tcol||'#1a2434');
      bt(g,String(s.title||'TERMINAL').toUpperCase(),3,2,'#dfe6ee');
      // body with pagination
      let body = typeof s.body==='function'?s.body():s.body;
      const flat=[];
      for (const ln of body){
        if (ln && typeof ln==='object'){ wrap(ln.s.toUpperCase(),46).forEach(l=>flat.push({s:l,col:ln.col})); }
        else wrap(String(ln).toUpperCase(),46).forEach((l,i2,arr2)=>flat.push({s:l,col:null}));
        if (ln==='') flat.push({s:'',col:null});
      }
      const opts = (typeof s.opts==='function'?s.opts():s.opts)||[];
      const maxB = Math.max(1, Math.floor((88-opts.length*9)/8));
      const pgs = Math.max(1,Math.ceil(flat.length/maxB));
      this.pg=Math.min(this.pg,pgs-1);
      const vis=flat.slice(this.pg*maxB,(this.pg+1)*maxB);
      vis.forEach((l,i2)=>bt(g,l.s,3,14+i2*8,l.col||'#93a2b4'));
      this.rows.length=0;
      let oy=104-opts.length*9;
      if (pgs>1){
        bt(g,'— PAGE '+(this.pg+1)+'/'+pgs+' —',3,oy-9,'#3f4854');
        this.rows.push({y0:oy-10,y1:oy-1,i:-2});   // click page line to advance
      }
      opts.forEach((op,i2)=>{
        const hov=this.hover===i2;
        bt(g,(hov?'▸ ':'  ')+String(op.t).toUpperCase(),3,oy,
          op.dim?'#3f4854':(hov?'#d9b36a':(op.col||'#b8c4d2')));
        this.rows.push({y0:oy-1,y1:oy+8,i:i2});
        oy+=9;
      });
      if (t%40<20) r(g,187,2,3,6,'#c2242e');
    },
    click(mx,my){
      const s=this.scr; if (!s) return;
      for (const row of this.rows){
        if (my>=row.y0&&my<row.y1){
          if (row.i===-2){ this.pg++; AR.ses('page',.3); return; }
          const opts=(typeof s.opts==='function'?s.opts():s.opts)||[];
          const op=opts[row.i];
          if (op&&!op.dim){ AR.ses(op.snd||'clink',.3); op.cb&&op.cb(); }
          return;
        }
      }
    },
    move(mx,my){ this.hover=-1;
      for (const row of this.rows)
        if (my>=row.y0&&my<row.y1&&row.i>=0) this.hover=row.i; }
  };

  // ---------- ACTOR ----------
  // The actor is AI pixel art drawn at SCENE resolution (1:1), the same
  // language as the props. Earlier it was drawn on the 3x text layer and broke
  // the art direction — the fix was not less detail, it was giving the whole
  // world the same pixel density. HIM.y is the head line; feet land at y+fh.
  // Three art directions live side by side; pick with ?sanat=
  //   elle       — hand drawn: everything procedural, no generated assets
  //   pixellab   — PixelLab: generated props + character + skeleton animation
  //   sorceress  — Sorceress character (default), PixelLab props
  const SANAT = AR.SANAT =
    (new URLSearchParams(location.search).get('sanat') || 'sorceress');
  const ANIM = AR._anim = { img:new Image(), meta:null, ok:false };
  ANIM.img.onload = () => { ANIM.ok = !!ANIM.meta; };
  if (SANAT !== 'elle'){
    fetch('art/anim/'+SANAT+'.json').then(r=>r.json()).then(m=>{
      ANIM.meta = m; ANIM.img.src = 'art/anim/'+SANAT+'.png'; }).catch(()=>{});
  }

  const Z = 3;   // hand-drawn sprite is authored at 6x14; 3x ≈ the 45px human
  const HIM = AR.HIM = { x:40, y:70, hedef:null, bekleyen:null, deskSonra:false,
    otur:false, yol:0, k:0, hide:false, tone:'#c19a78' };
  AR.walkTo = (x0,y0,after) => {
    const sc=AR.scene, fl=(sc&&sc.floor)||{x0:8,x1:178,y0:64,y1:78};
    x0=Math.max(fl.x0,Math.min(fl.x1,x0));
    y0=Math.max(fl.y0,Math.min(fl.y1,y0));
    if (sc&&sc.clamp){ const c=sc.clamp(x0,y0); x0=c[0]; y0=c[1]; }
    if (HIM.otur) AR.ses('creak',.35);
    HIM.hedef={x:x0,y:y0}; HIM.otur=false; HIM.bekleyen=after||null; };
  function drawActor(g,t){
    if (HIM.hide) return;
    const sc=AR.scene;
    const CLO=['#141c2c','#22344c','#33506b'];
    if (HIM.hedef!=null){
      const dx=HIM.hedef.x-HIM.x, dy=HIM.hedef.y-HIM.y;
      const uz=Math.hypot(dx,dy), adm=Math.min(2,uz);
      if (adm<0.5){
        HIM.hedef=null;
        if (HIM.deskSonra&&sc&&sc.seat){ HIM.otur=true;
          HIM.x=sc.seat.x; HIM.y=sc.seat.y; HIM.deskSonra=false; AR.ses('creak',.4); }
        if (HIM.bekleyen){ const b=HIM.bekleyen; HIM.bekleyen=null; b(t); }
      } else {
        HIM.x+=dx/uz*adm; HIM.y+=dy/uz*adm; HIM.yol+=adm;
        const kare=(HIM.yol/3|0)%4;
        if (kare!==HIM.k){ HIM.k=kare;
          if (kare===0||kare===2) AR.step(kare===0?0:1); }
      }
    }
    if (HIM.otur && sc && sc.seat){
      const BR=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0];
      const b2=BR[t%20]; const sx=sc.seat.sx, sy=sc.seat.sy;
      if (ANIM.ok && ANIM.meta.anims.sit){
        const m=ANIM.meta, fw=m.fw, fh=m.fh, list=m.anims.sit;
        const fi=list[(t/18|0)%list.length];
        const foot = m.foot!=null ? m.foot : fh;
        g.drawImage(ANIM.img, fi*fw,0,fw,fh, sx,sy+45-foot-b2,fw,fh);
        if (sc.seatHand){ const hx=(t%20<10)?sc.seatHand.x+1:sc.seatHand.x;
          r(g,hx-1,sc.seatHand.y,2,2,HIM.tone); r(g,hx,sc.seatHand.y-1,1,3,'#241f1b'); }
        return;
      }
      // hand-drawn seated figure, scaled to the world's 45px human
      g.save(); g.translate(sx, sy+45-Z*14-b2); g.scale(Z,Z);
      r(g,0,0,4,4,HIM.tone); r(g,0,0,4,1,'#241f1b');
      r(g,0,1,1,1,'#241f1b');
      r(g,1,2,1,1,'#1c1712'); r(g,3,2,1,1,'#1c1712');
      r(g,2,3,1,1,'#9c7354');
      r(g,-1,4,6,6,CLO[1]); r(g,-1,4,6,1,CLO[2]);
      r(g,-1,5,1,5,CLO[0]);
      r(g,0,10,6,2,'#15171d');
      r(g,5,1,1,2,'#e5c9a2'); r(g,5,4,1,5,'#4e6a8e');
      g.restore();
      if (sc.seatHand){ const hx=(t%20<10)?sc.seatHand.x+1:sc.seatHand.x;
        r(g,hx-1,sc.seatHand.y,2,2,HIM.tone); r(g,hx,sc.seatHand.y-1,1,3,'#241f1b'); }
      return;
    }
    if (ANIM.ok){
      const m=ANIM.meta, fw=m.fw, fh=m.fh, A=m.anims;
      const walking = HIM.hedef!=null;
      // sideways travel uses the profile cycle (mirrored when heading left);
      // mostly-vertical travel keeps the front-facing one
      let list, flip=false;
      if (walking){
        const dx=HIM.hedef.x-HIM.x, dy=HIM.hedef.y-HIM.y;
        if (A.walkE && Math.abs(dx)>Math.abs(dy)*1.2){
          list=A.walkE; flip=dx<0; if (dx!==0) HIM.dir=dx<0?-1:1;
        } else list=A.walk;
      } else list=A.idle;
      const k = walking ? ((HIM.yol/2.5|0)%list.length) : ((t/16|0)%list.length);
      // anchor by the foot line, not the frame top: the shared frame is taller
      // than the standing figure (the sit pose reaches further down)
      const foot = m.foot!=null ? m.foot : fh;
      const dx0=Math.round(HIM.x-fw/2), dy0=Math.round(HIM.y+45-foot);
      if (flip){
        g.save(); g.translate(dx0+fw,dy0); g.scale(-1,1);
        g.drawImage(ANIM.img, list[k]*fw,0,fw,fh, 0,0,fw,fh);
        g.restore();
      } else {
        g.drawImage(ANIM.img, list[k]*fw,0,fw,fh, dx0,dy0,fw,fh);
      }
      return;
    }
    // hand-drawn actor: authored at 6x14, drawn at Zx so it matches the
    // world's 45px human. Local coords below are sprite-space.
    const w2=(HIM.yol/3|0)%4;
    g.save();
    g.translate(Math.round(HIM.x-3*Z), Math.round(HIM.y+45-14*Z));
    g.scale(Z,Z);
    const x0=0;
    const bob=(HIM.hedef!=null&&(w2===1||w2===3))?-1:0, y0=bob;
    // standing: the head sinks 1px on a slow cycle — a breath, so the actor is
    // never a frozen decal. Feet stay planted, so it reads as breathing.
    const hb = (HIM.hedef==null && t%56>=44) ? 1 : 0;
    const hy = y0+hb;
    r(g,x0+1,hy,4,4,HIM.tone); r(g,x0+1,hy,4,1,'#241f1b');
    r(g,x0+1,hy+1,1,1,'#241f1b');
    r(g,x0+2,hy+2,1,1,'#1c1712'); r(g,x0+4,hy+2,1,1,'#1c1712');
    r(g,x0+3,hy+3,1,1,'#9c7354');
    r(g,x0,y0+4,6,7,CLO[1]); r(g,x0,y0+4,6,1,CLO[2]); r(g,x0,y0+5,1,6,CLO[0]);
    if (HIM.hedef==null||w2===1||w2===3){
      r(g,x0+1,y0+11,2,3,'#15171d'); r(g,x0+3,y0+11,2,3,'#15171d');
      r(g,x0-1,y0+6,1,3,CLO[1]); r(g,x0+6,y0+6,1,3,CLO[1]);
    } else if (w2===0){
      r(g,x0-1,y0+11,2,3,'#15171d'); r(g,x0+5,y0+11,2,3,'#15171d');
      r(g,x0-1,y0+4,1,4,CLO[1]); r(g,x0+6,y0+6,1,3,CLO[1]);
    } else {
      r(g,x0-1,y0+11,2,3,'#15171d'); r(g,x0+5,y0+11,2,3,'#15171d');
      r(g,x0+6,y0+4,1,4,CLO[1]); r(g,x0-1,y0+6,1,3,CLO[1]);
    }
    r(g,x0+4,hy+1,1,2,'#e5c9a2');
    r(g,x0+5,y0+5,1,4,'#4e6a8e');
    g.restore();
  }
  AR.drawNPC = (g,x0,y0,tone,clo,t,opts) => {   // generic standing NPC
    opts=opts||{};
    const C1=clo||'#3a2c34', C2=opts.clo2||'#4e3c46';
    r(g,x0+1,y0,4,4,tone); r(g,x0+1,y0,4,1,opts.hair||'#241f1b');
    if (opts.hairLong){ r(g,x0,y0,1,5,opts.hair||'#241f1b'); r(g,x0+5,y0,1,5,opts.hair||'#241f1b'); }
    r(g,x0+2,y0+2,1,1,'#1c1712'); r(g,x0+4,y0+2,1,1,'#1c1712');
    g.fillStyle='rgba(20,12,8,0.4)'; g.fillRect(x0+3,y0+3,1,1);
    r(g,x0,y0+4,6,7,C1); r(g,x0,y0+4,6,1,C2); r(g,x0,y0+5,1,6,'#100c12');
    r(g,x0+1,y0+11,2,3,'#15171d'); r(g,x0+3,y0+11,2,3,'#15171d');
    r(g,x0+4,y0+1,1,2,'#d9c2a8');
  };

  // ---------- SCENE MANAGER ----------
  const SC = AR.SC = {};
  AR.def = (id, s) => { s.id=id; SC[id]=s; };
  AR.scene = null;
  let fade=0, fadeTo=null, tGlob=0;
  AR.go = (id) => { fade=12; fadeTo=id; };
  function doSwitch(id){
    const s=SC[id];
    if (!s){ console.error('no scene '+id); return; }
    if (AR.scene && AR.scene.exit) AR.scene.exit();
    AR.musicOnceStop();
    term.close(); askS=null; sayS=null; toasts.length=0;
    UI.hover=null; UI.msg=''; UI.showBreach=false; UI.hudRight=null;
    AR.G.breach=0;
    HIM.hedef=null; HIM.bekleyen=null; HIM.otur=false; HIM.hide=false;
    gfx.reset(); gfx.amb(0);
    AR.scene=s;
    s.enter&&s.enter();
    if (s.actor){ HIM.x=s.actor.x; HIM.y=s.actor.y;
      if (s.actor.sit&&s.seat){ HIM.otur=true; } }
    if (s.hideActor) HIM.hide=true;
    if (s.save!==false) AR.save(id);
  }

  // ---------- INPUT ----------
  const px = e => { const rc=cv.getBoundingClientRect();
    return [ (e.clientX-rc.left)*W/rc.width|0, (e.clientY-rc.top)*H/rc.height|0 ]; };
  const findSpot = (mx,my) => {
    const sp=(AR.scene&&AR.scene.spots)||[];
    return sp.filter(s2=>!s2.off||!s2.off()).find(s2 =>
      mx>=s2.x && mx<s2.x+s2.w && my>=s2.y && my<s2.y+s2.h) || null; };
  cv.addEventListener('mousemove', e => {
    const [mx,my]=px(e);
    UI.askHover=-1;
    if (devOpen){ UI.devHover=-1;
      for (const row of devRows)
        if (my>=row.y0&&my<row.y1) UI.devHover=row.i;
      cv.style.cursor=UI.devHover>=0?'pointer':'default'; return; }
    if (askS){ for (const row of askRows)
        if (my>=row.y0&&my<row.y1) UI.askHover=row.i;
      cv.style.cursor=UI.askHover>=0?'pointer':'default'; return; }
    if (term.scr){ term.move(mx,my);
      cv.style.cursor=term.hover>=0?'pointer':'default'; return; }
    if (sayS||noteOpen){ cv.style.cursor='pointer'; return; }
    UI.hover=findSpot(mx,my);
    cv.style.cursor=UI.hover?'pointer':'default'; });
  cv.addEventListener('mouseleave', ()=>{ UI.hover=null; });
  cv.addEventListener('click', e => {
    if (fade>0) return;
    const [mx,my]=px(e);
    if (noteOpen){ notePg++; if (notePg*5>=AR.G.cards.length){ noteOpen=false; } return; }
    if (sayS){ advanceSay(); return; }
    if (devOpen){
      for (const row of devRows){
        if (my>=row.y0&&my<row.y1){ fireDev(row.i); return; } }
      devOpen=false; return; }
    if (askS){
      for (const row of askRows){
        if (my>=row.y0&&my<row.y1){ fireAsk(row.i); return; } }
      return; }
    if (term.scr){ term.click(mx,my); return; }
    const sc=AR.scene; if (!sc) return;
    if (sc.type==='cine'){ sc.onClickAny&&sc.onClickAny(tGlob); return; }
    const sp=findSpot(mx,my);
    if (sp){
      if (sp.self){ sc.onClick&&sc.onClick(sp,tGlob); return; }
      const ax=(sc.approach&&sc.approach[sp.id])||null;
      if (!ax){ sc.onClick&&sc.onClick(sp,tGlob); return; }
      const seatTarget = !!ax.seat;
      const tx = seatTarget ? sc.seat.x : ax.x;
      const ty = seatTarget ? sc.seat.y : (ax.y??70);
      const near = seatTarget ? HIM.otur
        : (!HIM.otur && Math.abs(HIM.x-tx)<6 && Math.abs(HIM.y-ty)<6);
      if (near){ sc.onClick&&sc.onClick(sp,tGlob); }
      else { AR.walkTo(tx, ty, (t2)=>{ sc.onClick&&sc.onClick(sp,t2); });
             HIM.deskSonra=seatTarget; }
    } else if (!HIM.hide && sc.floor && my>sc.floor.y0 && my<106){
      const fh = ANIM.ok ? ANIM.meta.fh : 14;
      AR.walkTo(mx, my-fh, null);
      if (sc.seat) HIM.deskSonra =
        Math.abs((HIM.hedef?HIM.hedef.x:mx)-sc.seat.x)<10&&(my-fh)<=sc.seat.y+3;
    }
  });
  function advanceSay(){
    if (!sayS) return;
    AR.ses('cloth',.15);
    sayS.i++;
    if (sayS.i>=sayS.seq.length){ const d=sayS.done; sayS=null; d&&d(); } }
  function fireAsk(i){
    const op=askS&&askS.opts[i];
    if (op&&!op.dim){
      const sec=((tGlob-askS.t0)/11);
      askS=null; AR.ses('clink',.3); op.cb&&op.cb(sec); } }
  function fireDev(i){
    const row=devRows.find(r2=>r2.i===i);
    if (row&&!row.op.dim){ AR.ses('clink',.3); devOpen=false;
      row.op.cb&&row.op.cb(); } }
  const cycle=(cur,n,dir,dimAt)=>{ if (!n) return -1;
    let i=cur<0?(dir>0?-1:0):cur;
    for (let s=0;s<n;s++){ i=(i+dir+n)%n; if (!dimAt(i)) return i; }
    return cur; };
  document.addEventListener('keydown', e=>{
    if (e.key==='Tab'){ e.preventDefault(); AR.noteToggle(); return; }
    if (e.key==='r'||e.key==='R'){ AR.devToggle(); return; }
    if (e.key==='Escape'){
      const o=document.getElementById('opts');
      if (o) o.classList.toggle('hidden');
      return; }
    const isUp=e.key==='ArrowUp', isDn=e.key==='ArrowDown',
          isEnt=e.key==='Enter'||e.key===' ';
    if (!(isUp||isDn||isEnt)) return;
    if (sayS){ e.preventDefault(); if (isEnt) advanceSay(); return; }
    if (devOpen){ e.preventDefault();
      const n=devRows.length;
      if (isUp||isDn) UI.devHover=cycle(UI.devHover??-1,n,isDn?1:-1,
        i=>devRows[i].op.dim);
      else if (UI.devHover>=0) fireDev(devRows[UI.devHover].i);
      return; }
    if (askS){ e.preventDefault();
      const n=askS.opts.length;
      if (isUp||isDn) UI.askHover=cycle(UI.askHover??-1,n,isDn?1:-1,
        i=>askS.opts[i].dim);
      else if (UI.askHover>=0) fireAsk(UI.askHover);
      return; }
    if (term.scr){ e.preventDefault();
      const opts=(typeof term.scr.opts==='function'?term.scr.opts():term.scr.opts)||[];
      if (isUp||isDn) term.hover=cycle(term.hover,opts.length,isDn?1:-1,
        i=>opts[i]&&opts[i].dim);
      else if (term.hover>=0){ const op=opts[term.hover];
        if (op&&!op.dim){ AR.ses(op.snd||'clink',.3); op.cb&&op.cb(); } }
      return; }
  });

  // ---------- LOOK helper ----------
  const say2={};
  AR.lookMsg = (sp) => {
    const sc=AR.scene, L=sc.look&&sc.look[sp.id];
    if (!L) return false;
    if (L.s) AR.ses(L.s, L.v||.45);
    const n=say2[sc.id+'.'+sp.id]||0;
    AR.msg(L.m[n%L.m.length]); say2[sc.id+'.'+sp.id]=n+1;
    if (L.sys && n===0) AR.toast(L.sys, '#c2778a');
    if (L.tag && n===0) AR.tag(L.tag,1);
    if (L.card && n===0) AR.card(L.card[0],L.card[1],L.card[2]);
    return true; };

  // ---------- MAIN LOOP ----------
  function frame(){
    tGlob++; AR.t=tGlob;
    tvx.clearRect(0,0,576,324);
    const sc=AR.scene;
    if (fade>0){
      fade--;
      if (fade===6 && fadeTo){ const id=fadeTo; fadeTo=null; doSwitch(id); }
    }
    if (sc){
      sc.tick && sc.tick(tGlob);
      if (sc.type==='room'){
        lightPass(tGlob);
        x.clearRect(0,0,W,H); x.drawImage(off,0,0);
        sc.draw && sc.draw(x,tGlob);
        drawActor(x,tGlob);
        sc.over && sc.over(x,tGlob);
        drawStrip(x,tGlob);
      } else if (sc.type==='cine'){
        x.clearRect(0,0,W,H);
        sc.draw && sc.draw(x,tGlob);
      } else { // 'term' scenes rely on AR.term
        x.clearRect(0,0,W,H);
        r(x,0,0,192,108,'#04060b');
        sc.draw && sc.draw(x,tGlob);
      }
      if (term.scr) term.draw(x,tGlob);
      drawSay(x); drawAsk(x); drawToasts(x); drawNote(x); drawDev(x,tGlob);
    } else { x.clearRect(0,0,W,H); r(x,0,0,192,108,'#04060b'); }
    if (fade>0){ const a=fade>6?1-(fade-6)/6:fade/6;
      r(x,0,0,192,108,'rgba(3,4,7,'+a.toFixed(2)+')');
      tvx.fillStyle='rgba(3,4,7,'+a.toFixed(2)+')';
      tvx.fillRect(0,0,576,324); }
    setTimeout(frame,90); // 11fps — deterministic, runs in background tabs too
  }
  // notebook / wrist buttons close the ESC options overlay when used
  const optsEl=document.getElementById('opts');
  ['mn','md'].forEach(id=>{ const b=document.getElementById(id);
    const f=b.onclick; b.onclick=()=>{ optsEl.classList.add('hidden'); f(); }; });

  AR.start = (id) => { doSwitch(id); frame(); };
})();

// APPROVED REALITY — Chapter 1: THE FILE
// boot → elias room ("Behave Naturally") → poppy vignette → commute →
// ministry tutorial files → Mara Venn file → Vale → adaptation
(function () {
  const {r, di, bt, wrap, M, gfx, RAMP} = AR;

  // ================================================================
  // BOOT — citizen verification
  // ================================================================
  const BOOT_LINES = [
    ['#5c6472','CONTINUITY SYSTEM V12.0'],
    ['#5c6472','MORNING COMPLIANCE SCAN'],
    ['#aeb7c2','GOOD MORNING, CITIZEN 6079.'],
    ['#aeb7c2','SLEEP QUALITY: 72 PERCENT.'],
    ['#aeb7c2','HEART RATE: ACCEPTABLE.'],
    ['#aeb7c2','SOCIAL UTILITY FORECAST: 81 PERCENT.'],
    ['#d9b36a','TODAY: REALITY CONSISTENCY DUTY, SHIFT 1.'],
    ['#c2242e','TASK: BEHAVE NATURALLY.']
  ];
  // AI-generated portraits (tools/gen_portre.py); sprite map is the fallback
  const PIMG={};
  for (const n of ['elias','mara']){ const im=new Image();
    im.src='art/'+n+'.png'; PIMG[n]=im; }
  const pimgOk = n => PIMG[n].complete && PIMG[n].naturalWidth>0;

  // 24x28 portrait sprite — middle-aged man, lit from the left
  const PCOL={ d:'#1d150e', h:'#332619', l:'#b98f6e', m:'#8f6b4c',
    s:'#5c4230', k:'#2e2018', e:'#0d0b0f', w:'#a89e88', n:'#4e2e26',
    J:'#263650', j:'#131b2a' };
  const PORT=[
  '........dddddddd........',
  '......dddddddddddd......',
  '.....ddddddddddddddd....',
  '....dddddddddddddddd....',
  '....dhhddddddddddddd....',
  '....dllllllllmmssssd....',
  '...ddllllllllmmsssssd...',
  '...dllllllllllmmsssssd..',
  '...dllllllllllmmsssssd..',
  '...sdddddlllldddddsssd..',
  '..msewwedlllmdewwesssd..',
  '..msmmmmmllllmmssssskd..',
  '..msmmmmmlllmmmssssskd..',
  '...smmmmllmmlmmssssskd..',
  '...smmmmlsslmmmsssssd...',
  '...smmmmsssmmmmsssssd...',
  '...smmmnnnnnmmmsssssd...',
  '...ssmmmmmmmmmssssssd...',
  '....smmmmmmmmmsssssd....',
  '....ssmmmmmmmssssssd....',
  '.....ssmmmmmsssssss.....',
  '.......smmmmssss........',
  '.......smmmmsss.........',
  '..JJJJJJsmmmssJJJJJJj...',
  '.JJJJJJJJjjjjjJJJJJJjj..',
  '.JJJJJJJJjjjjjJJJJJjjj..',
  '.jJJJJJJJjjjjjJJJJJjjj..',
  '.jjJJJJJJjjjjjJJJJjjjj..'
  ];
  AR.def('boot', {
    type:'cine', save:false,
    enter(){ this.n=0; this.t0=AR.t; AR.ses('crackle',.3);
      AR.ambSet(['hum','amb_room']); AR.music(null); },
    tick(t){ if (this.n<BOOT_LINES.length && t-this.t0>this.n*22) {
        this.n++; AR.ses('yazi',.2); } },
    draw(g,t){
      r(g,0,0,192,108,'#04060b');
      // face scan frame
      r(g,76,4,40,46,'#0a0f18');
      g.strokeStyle='#24506a'; g.strokeRect(76.5,4.5,39,45);
      // portrait — AI pixel art; falls back to the hand sprite until loaded
      if (pimgOk('elias')){ g.drawImage(PIMG.elias,78,7); }
      else for (let py=0;py<PORT.length;py++){
        const row=PORT[py];
        for (let px2=0;px2<row.length;px2++){
          const c=PCOL[row[px2]];
          if (c) r(g,84+px2,10+py,1,1,c);
        }
      }
      const sy=4+((t*2)%46); r(g,76,sy,40,1,'rgba(90,180,220,0.35)');
      if ((t/8|0)%2) bt(g,'SCANNING',80,52,'#24506a');
      // one status line at a time, centered
      if (this.n>0){
        const e=BOOT_LINES[Math.min(this.n,BOOT_LINES.length)-1];
        bt(g,e[1],Math.max(4,96-e[1].length*2),64,e[0]);
      }
      if (this.n>=BOOT_LINES.length && (t/6|0)%2) bt(g,'▸ CLICK TO COMPLY',64,82,'#5c6472');
    },
    onClickAny(){ if (this.n<BOOT_LINES.length){ this.n=BOOT_LINES.length; return; }
      AR.go('room1'); }
  });

  // ================================================================
  // SCENE 1.1 — ELIAS'S ROOM: BEHAVE NATURALLY
  // ================================================================
  const S = {};   // scene-local state, reset on enter
  const FLAME_GLOW = ['#d97a2e','#f2c14e','#fff7df'];

  function eyeState(t){
    if (S.susT>0) return 'SUS';
    const ext=Math.min(36,S.breachN*12);         // breaches: desk phase grows
    const p=t%(220+ext);
    if (p<70) return 'SCAN';
    if (p<130+ext) return 'DESK';
    if (p<160+ext) return 'SCAN';
    return 'WINDOW';
  }
  const blinking = t => t%137>=130;
  const watchingDesk = t => { const s=eyeState(t); return (s==='DESK'||s==='SUS')&&!blinking(t); };
  const prj = t => { const p=t%420; return {on:p<66, x:188-p, p}; };
  const bcLoud = t => S.bcOn && (((t-S.bcT0)/66|0)%2===0) && t-S.bcT0<S.bcDur;
  const masked = t => bcLoud(t) || S.pipeT>0;
  const glassLit = t => S.glassSet && prj(t).on && !S.curtain;
  AR._dbg1 = {S, eyeState, masked, watchingDesk, prj};

  // Scene scale: a standing citizen is 45px tall (art/kar_stand.png). Every
  // prop size in tools/gen_prop.py is derived from that, so the room reads as
  // one world. Wall 0..84, floor 84..108.
  // telescreen placement — moved up-right so it clears the door
  const TELE = {x:38, y:14};
  function roomBuild(){
    gfx.put(0,0,192,84,M.WALL,1.3); gfx.tex(0,0,192,84,3,0.35);
    gfx.put(0,0,192,3,M.WALL,0.7); gfx.put(189,0,3,84,M.WALL,0.7);
    gfx.put(0,84,192,24,M.FLOOR,1.4); gfx.tex(0,84,192,24,2,0.3);
    gfx.put(0,84,192,1,M.FLOOR,0.5);
    // --- AI props: objects are art, placement stays in code ---
    // (walls/floor above are procedural so the light engine can texture them)
    const R = S.rect = {};
    R.kapi     = gfx.prop('kapi',     4, 35);   // 25x49, floor at 84
    R.telekran = gfx.prop('telekran',TELE.x, TELE.y);   // 40x29, eye inside
    R.pencere  = gfx.prop('pencere', 132, 20);  // 38x36
    R.masa     = gfx.prop('masa',    44, 67);   // 32x17, top at 67
    R.tabure   = gfx.prop('tabure',  30, 75);   // 9x9
    R.yatak    = gfx.prop('yatak',  126, 68);   // 56x16
    // fallbacks: if a prop png is missing, keep a procedural block
    if (!R.kapi){ gfx.put(4,35,25,49,M.WOOD,1.1); gfx.put(26,58,3,4,M.METAL,2.2); }
    if (!R.telekran){ gfx.put(TELE.x,TELE.y,40,29,M.METAL,1.6);
      gfx.put(TELE.x+3,TELE.y+3,34,23,M.SCREEN,1.0); }
    if (!R.pencere){ gfx.put(132,20,38,36,M.METAL,1.0);
      gfx.put(134,22,34,32,M.NIGHT,1.2); }
    if (!R.masa){ gfx.put(44,67,32,3,M.WOOD,2.4);
      gfx.put(45,70,2,14,M.WOOD,1.2); gfx.put(73,70,2,14,M.WOOD,1.2); }
    if (!R.tabure) gfx.put(30,79,9,5,M.WOOD,1.0);
    if (!R.yatak){ gfx.put(126,74,56,4,M.WOOD,1.6);
      gfx.put(128,70,52,4,M.GLASS,0.9); }
    // poster stays procedural: its printed slogan is story, not decoration
    gfx.put(86,8,36,48,M.PAPER,2.1); gfx.tex(86,8,36,48,5,0.2);
    gfx.put(86,8,36,2,M.RED,2.2); gfx.put(86,54,36,2,M.RED,2.2);
    gfx.put(86,8,2,48,M.RED,2.2); gfx.put(120,8,2,48,M.RED,2.2);
    // heating pipe + diary: small, interactive, animated — kept in code
    gfx.put(184,6,5,78,M.METAL,1.2); gfx.put(184,6,1,78,M.METAL,1.9);
    gfx.put(181,62,9,5,M.METAL,1.6);
    gfx.put(50,65,12,2,M.PAPER,2.9);
    gfx.shadow(44,84,32,4,0.7); gfx.shadow(30,84,10,2,0.6);
    gfx.shadow(126,84,56,4,0.6);
    // lights
    gfx.light(52,60,2.6,0.012,1.5,(t)=>{ const FL=[1,0.94,1.05,0.9,1.02,0.96,1.08,0.98];
      return FL[(t>>1)%8]*(1+0.05*Math.sin(t*0.37))*(S.lamp?1:0.05); });
    gfx.light(TELE.x+20,TELE.y+14,1.5,0.010,1,(t)=>0.8+0.2*Math.sin(t*0.09));
    gfx.light(151,36,0.5,0.018,1,()=> S.curtain?0.1:1);
    gfx.dyn((t)=>{ const p=prj(t);
      if (!p.on) return null;
      const str=S.curtain?0.5:2.2;
      return [{x:p.x, y:36, str, f:0.006, ell:0.7}]; });
  }

  function sysNote(sp){
    const NOTES={
      pencere:'EXCESSIVE INTEREST IN THE OUTSIDE WORLD.',
      bed:'UNSCHEDULED REST TENDENCY.',
      poster:'PERFORMATIVE LOYALTY.',
    };
    if (NOTES[sp] && !S.noted[sp]){ S.noted[sp]=1;
      AR.toast('SYSTEM: '+NOTES[sp],'#c2778a'); }
  }
  function breach(why){
    AR.G.breach++; S.breachN++; S.flashT=8; AR.ses('buzz',.5);
    S.susT=66;
    if (AR.G.breach>=3){
      AR.G.breach=3;
      AR.say([
        ['SYSTEM','CITIZEN 6079. REPEATED IRREGULARITY AT RESIDENCE 12.'],
        ['SYSTEM','NO PROHIBITED OBJECT WAS LOCATED.'],
        ['SYSTEM','AN ADDITIONAL MICROPHONE HAS BEEN APPROVED FOR YOUR COMFORT AND SAFETY.']
      ], ()=>{
        AR.ask('WHY DID YOUR MOVEMENT PATTERN DEVIATE THIS MORNING?',[
          {t:'POOR SLEEP', cb:()=>afterQ()},
          {t:'COLD ROOM', cb:()=>afterQ()},
          {t:'I WAS EXERCISING', cb:()=>afterQ()},
          {t:'I DO NOT RECALL', cb:()=>afterQ()}
        ],'ANSWER AND ANSWER TIME ARE RECORDED');
        const afterQ=()=>{ AR.toast('ANSWER RECORDED.','#c2778a');
          if (!AR.G.mods.includes('extra_microphone')) AR.G.mods.push('extra_microphone');
          AR.G.susp+=0.1; AR.G.breach=0; };
      });
      AR.ses('vo_stop',.8);
    } else {
      AR.msg(why||'IT SAW YOU. HOLD STILL.');
    }
  }
  function tryWrite(t){
    if (S.pro>=3){ AR.ses('page',.4); AR.msg('THE LINE IS DONE. NOW HIDE IT.'); return; }
    const lit = S.lamp || glassLit(t);
    if (!lit){ AR.ses('page',.4); AR.msg('TOO DARK TO WRITE. YOU NEED LIGHT ON THE DESK.'); return; }
    if (S.lamp && prj(t).on && !S.curtain){
      breach('THE PATROL LIGHT CAUGHT YOUR LIT WINDOW.'); return; }
    if (watchingDesk(t)){ breach('THE EYE WAS ON THE DESK. BREACH.'); return; }
    if (!masked(t)){
      if (S.susT>0){ breach('THE PEN AGAIN. IT WAS ALREADY LISTENING.'); return; }
      S.susT=66; AR.ses('yazi',.5); AR.tag('SCORE_OPTIMIZER',1);
      AR.msg('THE PEN SCRATCH RANG OUT. THE EYE TURNED SHARP.');
      AR.toast('AUDIO ANOMALY LOGGED AT RESIDENCE 12.','#c2778a');
      return;
    }
    // safe write
    S.pro++; AR.ses('yazi',.5);
    if (bcLoud(t)) { S.maskMarch++; }
    if (S.pipeT>0) { S.maskPipe++; }
    if (glassLit(t) && !S.lamp) S.usedGlass=true;
    AR.msg(['','WRITING: 2+2','WRITING: 2+2=','THE LINE IS DONE: FREEDOM IS SAYING 2+2=4.'][S.pro]);
    if (S.pro>=3){
      if (S.maskMarch>=S.maskPipe) AR.tag('STEALTH',2); else AR.tag('LEGALISM',2);
      if (S.usedGlass){ AR.tag('TRUTH_SEEKER',1);
        AR.card('mirror','THE PATROL LIGHT CAN BE AIMED. GLASS REMEMBERS NOTHING.','EVIDENCE'); }
      AR.toast('TASK UPDATED: THE PAGE MUST NOT BE FOUND.','#d9b36a');
    }
  }
  function hideDiary(){
    S.hidden=true; AR.ses('cloth',.5);
    AR.msg('THE DIARY SLEEPS BEHIND THE GUARDIAN NOW.');
    setTimeout(()=>{
      AR.say([
        ['SYSTEM','CITIZEN 6079.'],
        ['SYSTEM','DURING THE BROADCAST YOUR HEART RATE ROSE BY 22 PERCENT.'],
        ['SYSTEM','STATE THE REASON.']
      ], ()=>{
        AR.ask('WHY DID YOUR HEART RATE RISE?',[
          {t:'THE GUARDIAN\'S SPEECH MOVED ME', cb:s2=>hq('moved',s2)},
          {t:'A HEALTH CONDITION', cb:s2=>hq('health',s2)},
          {t:'A NOISE FROM OUTSIDE', cb:s2=>hq('noise',s2)},
          {t:'I DO NOT REMEMBER', cb:s2=>hq('forgot',s2)}
        ]);
        const hq=(a,sec)=>{
          AR.G.flags.heart_answer=a;
          AR.toast('ANSWER RECORDED.','#c2778a');
          setTimeout(()=>AR.toast('RESPONSE TIME ALSO RECORDED. ('+sec.toFixed(1)+' SECONDS)','#5c6472'),1400);
          S.redDot=true; S.phase='exit';
          setTimeout(()=>AR.msg('A FAINT RED POINT GLOWS BY THE LOOSE PANEL. OR DOES IT?'),3000);
        };
      });
    }, 900);
  }

  AR.def('room1', {
    type:'room',
    floor:{x0:16,x1:170,y0:39,y1:53},
    clamp(x,y){ if (x<80) y=Math.max(y,45); if (x>140) y=Math.max(y,47); return [x,y]; },
    actor:{x:34,y:41,sit:true},
    seat:{x:34,y:41,sx:22,sy:42}, seatHand:{x:52,y:64},
    reportSubjects(){
      return [{t:'YOURSELF — FILE ALREADY OPEN', dim:true}]; },
    spots:[
      {id:'diary',  x:48,y:62,w:16,h:6, ad:'DIARY'},
      {id:'lamp',   x:46,y:55,w:10,h:12, ad:'DESK LAMP'},
      {id:'sen',    x:26,y:39,w:18,h:47, ad:'YOU', self:true},
      {id:'masa',   x:44,y:67,w:32,h:17, ad:'DESK'},
      {id:'telekran',x:38,y:14,w:40,h:29, ad:'TELESCREEN'},
      {id:'poster', x:86,y:8,w:36,h:48, ad:'GUARDIAN POSTER'},
      {id:'pencere',x:132,y:20,w:38,h:36, ad:'WINDOW'},
      {id:'bed',    x:126,y:68,w:56,h:16, ad:'BED'},
      {id:'pipe',   x:180,y:56,w:12,h:26, ad:'HEATING PIPE'},
      {id:'door',   x:4,y:35,w:25,h:49, ad:'DOOR'}
    ],
    approach:{ diary:{seat:1}, lamp:{seat:1}, masa:{seat:1},
      telekran:{x:60,y:45}, poster:{x:100,y:46}, pencere:{x:146,y:47},
      bed:{x:150,y:50}, pipe:{x:166,y:50}, door:{x:30,y:47} },
    look:{
      telekran:{s:'crackle',v:.6,m:["DON'T LOOK AT IT. IT SEES THAT TOO.",
        'THE EYE NEVER FULLY BLINKS. ALMOST.']},
      masa:{s:'knock',m:['SCARRED WOOD. YEARS OF QUIET WORK.']},
      sen:{s:'cloth',m:['YOUR BACK IS TURNED. ONE BLIND SPOT.',
        'KEEP YOUR FACE QUIET. FACES TALK.']},
      bed:{s:'creak',m:['MADE TO REGULATION FOLD. 45 DEGREES.',
        'SLEEP IS SCHEDULED. DREAMS ARE NOT. YET.']},
    },
    enter(){
      Object.assign(S,{lamp:true, curtain:false, glass:false, glassSet:false,
        pro:0, hidden:false, susT:0, flashT:0, breachN:0, pipeT:0,
        bcOn:false, bcT0:0, bcDur:440, bcDone:false, maskMarch:0, maskPipe:0,
        usedGlass:false, noted:{}, redDot:false, phase:'free', lastAct:AR.t,
        pupX:44, prjWarn:false, clapAsked:false,
        posterSeen:false, doorN:0, exitSaid:false});
      roomBuild();
      AR.ui.showBreach=true;
      AR.ambSet(['hum','amb_room','amb_rain']);
      AR.music(null);
      AR.msg('MORNING. TASK: BEHAVE NATURALLY.');
      AR.toast('TASK: BEHAVE NATURALLY.','#c2242e');
      setTimeout(()=>{ if (AR.scene&&AR.scene.id==='room1')
        AR.toast('THE DIARY WAITS. SO DOES THE EYE.','#5c6472'); },7000);
    },
    tick(t){
      if (S.susT>0) S.susT--;
      if (S.pipeT>0){ S.pipeT--;
        if (S.pipeT%20===10) AR.ses('knock',.3); }
      if (S.flashT>0) S.flashT--;
      // broadcast end → applause timing
      if (S.bcOn && t-S.bcT0>=S.bcDur){ S.bcOn=false; S.bcDone=true;
        AR.musicOnceStop();
        if (!S.clapAsked){ S.clapAsked=true;
          AR.ask('THE ANTHEM ENDS. THE ROOM LISTENS.',[
            {t:'APPLAUD', cb:sec=>{
              if (sec>2.0){ AR.toast('APPLAUSE DELAY: '+sec.toFixed(1)+' SECONDS. NOTED.','#c2778a');
                AR.G.susp+=0.04; }
              else AR.toast('APPLAUSE WITHIN PARAMETERS.','#7a9a6a');
              AR.ses('clink',.4); }},
            {t:'REMAIN STILL', cb:()=>{
              AR.toast('NON-PARTICIPATION IN COLLECTIVE GRATITUDE. NOTED.','#c2778a');
              AR.G.susp+=0.08; }}
          ]); } }
      // patrol light vs lit window
      const p=prj(t);
      if (p.on && S.lamp && !S.curtain){
        if (!S.prjWarn){ S.prjWarn=true;
          AR.toast('WINDOW: YOU ARE VISIBLE.','#c2242e'); }
        else if (p.p===40 && HIM.otur===false && false){}
      }
      if (!p.on) S.prjWarn=S.prjWarn&&false;
      // idle note
      if (S.phase==='free' && t-S.lastAct>170 && !S.noted.idle){
        S.noted.idle=1; AR.toast('SYSTEM: IMMOBILITY. AVOIDANCE BEHAVIOR.','#c2778a'); }
    },
    onClick(sp,t){
      S.lastAct=t;
      if (sp.id==='sen'){ AR.lookMsg(sp); return; }
      if (sp.id==='telekran'){
        if (S.bcOn){ AR.lookMsg(sp); return; }
        AR.ask('THE TELESCREEN HUMS, HALF ASLEEP.',[
          {t:'START THE MORNING BROADCAST', dim:S.bcDone, cb:()=>{
            S.bcOn=true; S.bcT0=AR.t; AR.ses('crackle',.5);
            AR.musicOnce('iron-march-b',.32);
            AR.msg('THE ANTHEM SWELLS. LOUD BARS DROWN SMALL SOUNDS.');
            AR.toast('MANDATORY BROADCAST ACTIVE. PARTICIPATION LOGGED.','#c2778a');}},
          {t:'JUST LOOK', cb:()=>AR.lookMsg(sp)},
          {t:'STEP BACK', cb:()=>{}}
        ]); return; }
      if (sp.id==='lamp'){
        S.lamp=!S.lamp; AR.ses(S.lamp?'kibrit':'mum_ufle',.45);
        AR.msg(S.lamp?'LAMP ON. THE DESK IS LIT. SO ARE YOU.'
          :'LAMP OFF. THE DARK IS YOURS. AND THE PAGE IS BLIND.');
        return; }
      if (sp.id==='diary'){ tryWrite(t); return; }
      if (sp.id==='masa'){
        if (S.glass && !S.glassSet){
          AR.ask('THE GLASS PANE FROM THE POSTER IS IN YOUR COAT.',[
            {t:'PROP THE GLASS TO CATCH THE PATROL LIGHT', cb:()=>{
              S.glassSet=true; AR.ses('clink',.5);
              AR.msg('ANGLED GLASS. WHEN THE PATROL LIGHT PASSES, THE DESK WILL DRINK IT.');}},
            {t:'LEAVE IT', cb:()=>AR.lookMsg(sp)}
          ]); return; }
        AR.lookMsg(sp); return; }
      if (sp.id==='poster'){
        sysNote('poster');
        const opts=[];
        if (S.posterSeen && S.pro>=3 && !S.hidden)
          opts.push({t:'HIDE THE DIARY BEHIND THE LOOSE PANEL', cb:()=>hideDiary()});
        if (S.posterSeen && !S.glass)
          opts.push({t:'PRY THE LOOSE GLASS CORNER', cb:()=>{
            S.glass=true; AR.ses('clink',.5);
            AR.msg('A HAND-SIZED PANE OF POSTER GLASS. IT REFLECTS LIGHT BEAUTIFULLY.');
            AR.card('glass','THE POSTER CORNER IS LOOSE. BEHIND IT: A SHALLOW CAVITY.','OBSERVATION');}});
        opts.push({t:'LOOK AT THE GUARDIAN', cb:()=>{
          AR.ses('sting',.4);
          if (S.hidden){ AR.msg('HE GUARDS YOUR SECRET NOW. UNKNOWINGLY.'); return; }
          if (!S.posterSeen){ S.posterSeen=true;
            AR.msg('THE EYES FOLLOW YOU. UP CLOSE, THE GLUE HAS GIVEN UP IN ONE CORNER.');
            AR.card('poster_corner','ONE CORNER OF THE GUARDIAN POSTER SITS A BREATH AWAY FROM THE WALL.','OBSERVATION');
            return; }
          AR.msg('THE EYES FOLLOW YOU. THE GLUE IS STILL WET.');}});
        opts.push({t:'STEP BACK', cb:()=>{}});
        AR.ask('THE GUARDIAN PROTECTS. THE POSTER SAYS SO.',opts);
        return; }
      if (sp.id==='pencere'){
        sysNote('pencere');
        AR.ask('THE WINDOW. RAIN, WIRES, THE MINISTRY GLOW.',[
          {t:S.curtain?'OPEN THE CURTAIN':'CLOSE THE CURTAIN', cb:()=>{
            S.curtain=!S.curtain; AR.ses('cloth',.5);
            AR.msg(S.curtain?'CURTAIN CLOSED. THE STREET FORGETS YOU.'
              :'CURTAIN OPEN. THE STREET REMEMBERS.');}},
          {t:'LOOK OUTSIDE', cb:()=>{ AR.ses('thunder',.4);
            AR.msg(S.phase==='exit'?'BELOW, A SMALL RED POINT OF A FLOWER. SOMEONE IS KNEELING.'
              :'THE PATROL LIGHT WALKS ITS ROUND. RAIN. NOTHING ELSE. YET.');}},
          {t:'STEP BACK', cb:()=>{}}
        ]); return; }
      if (sp.id==='bed'){ sysNote('bed'); AR.lookMsg(sp); return; }
      if (sp.id==='pipe'){
        AR.ask('THE HEATING PIPE. MAINTENANCE KNOCKS ARE SCHEDULED AND LAWFUL.',[
          {t:'OPEN THE VALVE (KNOCKING MASKS SOUND)', cb:()=>{
            S.pipeT=130; AR.ses('knock',.45);
            AR.msg('THE PIPE HAMMERS LIKE AN HONEST MACHINE. LAWFUL NOISE.');}},
          {t:'STEP BACK', cb:()=>{}}
        ]); return; }
      if (sp.id==='door'){
        if (S.phase!=='exit'){
          AR.ses('knock',.3);
          const early=[
            'YOUR HAND STOPS ON THE HANDLE. SOMETHING IN THIS ROOM IS NOT FINISHED.',
            'THE CORRIDOR CAMERA LOGS EARLY DEPARTURES. THE ROOM IS SAFER. FOR NOW.',
            'THE MORNING HAS A SHAPE. LEAVING TOO SOON IS EXACTLY WHAT THEY LOOK FOR.',
            'NOT YET. WHAT YOU MEANT TO DO TODAY, YOU HAVE NOT DONE.'
          ];
          const late=[
            'THE PAGE STILL LIES ON THE DESK. ROOMS ARE SEARCHED WHILE SHIFTS ARE WORKED.',
            'YOU CANNOT LEAVE IT IN THE OPEN. PAPER TALKS LOUDEST WHEN YOU ARE GONE.'
          ];
          const arr=S.pro<3?early:late;
          S.doorN=(S.doorN||0);
          AR.msg(arr[S.doorN%arr.length]); S.doorN++;
          return; }
        AR.ses('creak',.5);
        if (!S.exitSaid){ S.exitSaid=true;
          AR.say([
            ['YOU','THE PAGE IS HIDDEN. MY PULSE IS FILED. THE ROOM LOOKS EXACTLY LIKE YESTERDAY.'],
            ['YOU','THAT IS THE WHOLE TRICK. NOTHING MUST LOOK LIKE THE FIRST DAY OF ANYTHING.'],
            ['YOU','FOUR WORDS IN A DEAD BOOK. ENOUGH TO ERASE ME. ENOUGH TO PROVE I EXIST.'],
            ['YOU','BEHAVE NATURALLY, ELIAS. THE DOOR IS ONLY A DOOR.']
          ], ()=>AR.go('vignette'));
          return; }
        AR.go('vignette'); return; }
    },
    draw(g,t){
      // --- telescreen face/waveform + eye ---
      // TX/TY shift the whole screen with the prop, so the eye never drifts off
      // its bezel. Keep in step with the gfx.prop('telekran', ...) call.
      const TX=TELE.x-26, TY=TELE.y-20;
      const rx2=(a,b,w,h,c)=>r(g,a+TX,b+TY,w,h,c);
      const E='#c6d1da', EL='#8b99a6', ED='#5a6a7a';
      rx2(32,26,24,10,E); rx2(36,23,16,3,E); rx2(36,36,16,3,E);
      rx2(29,28,3,6,E); rx2(56,28,3,6,E); rx2(32,25,24,1,EL);
      rx2(35,25,1,1,ED); rx2(52,25,1,1,ED); rx2(35,23,1,1,ED); rx2(52,23,1,1,ED);
      rx2(31,27,1,1,ED); rx2(56,27,1,1,ED); rx2(31,34,1,1,ED); rx2(56,34,1,1,ED);
      rx2(35,39,1,1,ED); rx2(52,39,1,1,ED); rx2(28,29,1,1,ED); rx2(59,29,1,1,ED);
      rx2(28,33,1,1,ED); rx2(59,33,1,1,ED);
      rx2(40,28,8,7,'#3a4552');
      const st=eyeState(t);
      let target=44;
      if (st==='SCAN') target=44+3.5*Math.sin(t*0.09);
      else if (st==='DESK') target=40.5;
      else if (st==='WINDOW') target=47.5;
      else { const kx=HIM.otur?24:HIM.x;
        target=44+Math.max(-1,Math.min(1,(kx+3-93)/85))*3.5; }
      S.pupX += (target-S.pupX)*(st==='SUS'?0.45:0.2);
      const pos=S.pupX-1.5, b0=Math.floor(pos), f=pos-b0;
      const mix=c=>c>=0.75?'#0a0d12':(c>=0.4?'#22303e':(c>=0.12?'#3a4552':null));
      for (const [cx2,cov] of [[b0,1-f],[b0+1,1],[b0+2,f]]){
        const mc=mix(cov); if (mc){ g.fillStyle=mc; g.fillRect(cx2+TX,29+TY,1,4); } }
      rx2(b0+1-TX,30,1,1,'#e8f2f8');
      if (S.flashT>0||st==='SUS') rx2(40,28,8,7,st==='SUS'?'#7a2230':'#96222e');
      const ph=t%137;
      if (ph>=130){ const cl=[2,4,6,6,4,2,0][ph-130]||0;
        g.fillStyle='#0a0f18';
        if (cl){ g.fillRect(29+TX,23+TY,33,cl); g.fillRect(29+TX,39-cl+3+TY,33,cl); } }
      // broadcast waveform band
      if (S.bcOn){
        const loud=bcLoud(t);
        for (let i=0;i<12;i++){
          const h2=loud?2+((i*7+t)%5):1+((i*3+t)%2);
          rx2(20+i*4,46-h2,2,h2*2,loud?'#7a9a6a':'#3a4552'); }
        bt(g,loud?'ANTHEM':'ADDRESS',20+TX,14+TY,loud?'#7a9a6a':'#5a6a7a');
      }
      g.fillStyle='rgba(5,8,12,0.15)';
      for (let j=14;j<50;j+=2) g.fillRect(18+TX,j+TY,52,1);
      // red status LED
      if ((t/12|0)%2===0){ rx2(70,12,2,2,'#c2242e');
        rx2(69,12,1,2,'#701a2c'); rx2(72,12,1,2,'#701a2c'); }
      // --- poster print ---
      r(g,96,10,16,2,'#241f1b'); r(g,95,11,2,7,'#241f1b'); r(g,111,11,2,7,'#241f1b');
      r(g,96,12,16,10,'#8d8574'); di(g,96,12,16,10,'#7a7264',3);
      r(g,99,15,3,2,'#15171d'); r(g,106,15,3,2,'#15171d'); r(g,99,19,10,2,'#15171d');
      r(g,86,23,36,16,'#96222e');
      bt(g,'THE',98,23,'#e8d8d0'); bt(g,'GUARDIAN',88,31,'#e8d8d0');
      bt(g,'PROTECTS',88,47,'#15171d');
      if (S.glass){ r(g,118,50,5,5,'#100d16'); }         // pried corner cavity
      else if (S.posterSeen){                            // barely-lifted corner
        r(g,120,52,3,1,'#a89f8a'); r(g,120,53,3,1,'#3a3328'); }
      if (S.redDot && (t/9|0)%3!==0) r(g,119,52,1,1,'#8a1420');
      // --- window rain / curtain / projector ---
      // rain falls ONLY behind the glass: clipped to the window's inner pane
      const WG={x:136,y:24,w:30,h:28};                 // inner pane of the prop
      if (!S.curtain){
        g.save();
        g.beginPath(); g.rect(WG.x,WG.y,WG.w,WG.h); g.clip();
        for (let i=0;i<9;i++){
          const rx=WG.x+((i*17)%WG.w), ry=WG.y+((t*3+i*11)%WG.h);
          r(g,rx,ry,1,2,'#3c4c62'); }
        for (let i=0;i<6;i++){
          const rx=WG.x+2+((i*23)%(WG.w-4)), ry=WG.y+((t*2+i*19)%WG.h);
          r(g,rx,ry,1,3,'#5c7288'); }
        if ((t/13|0)%2) r(g,WG.x+9,WG.y+14,1,1,'#d9b36a');
        if ((t/21|0)%2) r(g,WG.x+16,WG.y+18,1,1,'#b09058');
        const p=prj(t);
        if (p.on && p.x>WG.x-6 && p.x<WG.x+WG.w+6){
          g.fillStyle='rgba(210,220,240,0.30)';
          g.fillRect(p.x-2,WG.y,4,WG.h);
          g.fillStyle='rgba(210,220,240,0.12)';
          g.fillRect(p.x-5,WG.y,10,WG.h);
        }
        g.restore();
      } else {
        r(g,WG.x-2,WG.y-2,WG.w+4,WG.h+4,'#232b3e');
        for (let i=0;i<4;i++) r(g,WG.x+2+i*8,WG.y-2,1,WG.h+4,'#1a2030');
        r(g,WG.x-2,WG.y-2,WG.w+4,1,'#343e56');
      }
      // projector spill into room + glass relay
      const p=prj(t);
      if (p.on && !S.curtain){
        if (S.glassSet){
          g.fillStyle='rgba(230,220,190,0.22)';
          g.fillRect(50,63,14,5);
          r(g,56,65,3,1,'#f2e6c2');
          g.fillStyle='rgba(230,220,190,0.10)';
          for (let i=0;i<8;i++) g.fillRect(60+i*8,56-i*4,6,2);
        }
      }
      // --- desk lamp ---
      r(g,48,66,3,1,'#2c3040'); r(g,49,62,1,4,'#485264');
      r(g,47,60,5,2,'#303848'); r(g,47,60,5,1,'#485264');
      if (S.lamp){ r(g,48,62,3,1,FLAME_GLOW[1]); r(g,49,62,1,1,FLAME_GLOW[2]); }
      // diary ink
      r(g,54,65,6,1,'#6a6355'); r(g,57,64,1,3,'#a49d8b');
      for (let i2=0;i2<S.pro;i2++) r(g,53+i2*3,64,2,1,'#15171d');
      if (S.hidden){ r(g,52,64,10,2,RAMP.WOOD[3]); }     // diary gone from desk
      // pipe valve
      r(g,183,59,6,3,'#485264'); r(g,185,58,2,5,'#687892');
      if (S.pipeT>0 && (t/3|0)%2) r(g,184,50,4,1,'#8a95a8');
      // bed pillow highlight
      r(g,146,66,10,1,'#8d8878');
      // eye state label
      const lbl={SCAN:'EYE: SCANNING',DESK:'EYE: ON THE DESK',
        WINDOW:'EYE: ON THE WINDOW',SUS:'EYE: SUSPICIOUS'}[st];
      bt(g,lbl,3,88,st==='DESK'||st==='SUS'?'#c2242e':'#3f4854');
      if (masked(t)) bt(g,'· NOISE MASKED',70,88,'#7a9a6a');
      if (S.flashT>0){
        g.fillStyle='rgba(194,36,46,'+(0.05*S.flashT).toFixed(2)+')';
        g.fillRect(0,0,192,96); }
    }
  });
  const HIM = AR.HIM;

  // ================================================================
  // SCENE 1.2 — THE POPPY (window vignette, non-interactive)
  // ================================================================
  const VIG=[
    ['CHILD','LOOK! A RED ONE. IT GREW OUT OF THE CRACK.'],
    ['MARA','IT IS CALLED A POPPY. SAY IT QUIETLY. IT IS AN OLD WORD.'],
    ['MOTHER','MARA, PLEASE. THAT WORD WAS RETIRED. SHE WILL REPEAT IT AT SCHOOL.'],
    ['MARA','THEN TEACH HER TO SAY: A FLOWER GREW WHERE NOTHING SHOULD. THAT MUCH IS STILL TRUE.'],
    ['CHILD','POPPY.'],
    ['YOU','SHE KNEELS IN THE RAIN TO HAND A CHILD A BURIED WORD. THE FILE WILL CALL THIS A CRIME.']
  ];
  AR.def('vignette', {
    type:'cine', save:false,
    enter(){ this.n=-1; this.t0=AR.t; AR.ses('cloth',.4);
      AR.music('midnight-blue-a',.12);
      setTimeout(()=>this.next(),1800); },
    next(){ this.n++;
      if (this.n>=VIG.length){
        AR.toast('CITIZEN 6079 SPENT 14 SECONDS OF WORK PREPARATION ON ENVIRONMENTAL OBSERVATION.','#c2778a');
        AR.card('mara_poppy','MARA GAVE A CHILD A FORBIDDEN WORD. GENTLY.','OBSERVATION');
        setTimeout(()=>AR.go('commute'),4200);
        this.n=VIG.length;
      } },
    onClickAny(){ this.next(); },
    draw(g,t){
      r(g,0,0,192,108,'#04060b');
      // looking down through the window: wet street below
      r(g,26,6,140,84,'#0b0e1a');
      g.strokeStyle='#2a2f3a'; g.strokeRect(26.5,6.5,139,83);
      r(g,26,58,140,32,'#14121e'); di(g,26,58,140,32,'#1c1c2a',3);
      r(g,26,58,140,1,'#282634');
      // rain
      for (let i=0;i<10;i++){
        const rx=28+((i*31)%136), ry=8+((t*3+i*13)%80);
        r(g,rx,ry,1,2,'#26344a'); }
      // street lamp pool — aimed at the group like a quiet stage light
      r(g,60,12,2,46,'#1e2331'); r(g,56,10,10,3,'#303848');
      g.fillStyle='rgba(217,179,106,0.10)'; g.fillRect(48,58,26,16);
      g.fillStyle='rgba(217,179,106,0.07)'; g.fillRect(80,56,40,22);
      g.fillStyle='rgba(217,179,106,0.05)'; g.fillRect(84,50,32,8);
      // Mara KNEELING (long coat pooled), facing the child
      r(g,87,63,4,4,'#d9b58f'); r(g,87,63,4,1,'#2c1a10');    // head
      r(g,86,63,1,5,'#2c1a10'); r(g,91,63,1,5,'#2c1a10');    // long hair
      r(g,88,65,1,1,'#1c1712'); r(g,90,65,1,1,'#1c1712');    // eyes toward child
      r(g,86,67,6,5,'#5c2e3a'); r(g,86,67,6,1,'#6e3a46');    // coat torso
      r(g,85,72,8,3,'#4a2430');                              // coat pooled on ground
      r(g,92,68,3,1,'#d9b58f');                              // arm reaching out
      // child, small, leaning toward the flower
      r(g,97,66,4,4,'#c9a27c'); r(g,97,66,4,1,'#241f1b');
      r(g,98,68,1,1,'#1c1712'); r(g,100,68,1,1,'#1c1712');
      r(g,97,70,4,5,'#3a4c5c');
      // mother behind, half turned away
      AR.drawNPC(g,107,58,'#c9a27c','#33404e',t,{});
      // the poppy — the only warm red on screen, between them
      r(g,95,70,2,2,'#d92c34'); r(g,94,70,1,1,'#8a1420'); r(g,97,71,1,1,'#8a1420');
      r(g,95,72,1,3,'#3e5c34'); r(g,94,73,1,1,'#3e5c34');
      if ((t/16|0)%2) { g.fillStyle='rgba(217,44,52,0.12)'; g.fillRect(92,67,8,8); }
      if (this.n>=0 && this.n<VIG.length){
        const e=VIG[this.n];
        const lines=wrap(e[1],46);
        const h2=lines.length*8+12;
        r(g,0,108-h2,192,h2,'rgba(4,5,9,0.95)'); r(g,0,108-h2,192,1,'#232936');
        bt(g,e[0],4,110-h2,
          e[0]==='MARA'?'#c2778a':(e[0]==='YOU'?'#d9b36a':'#8fa0b2'));
        lines.forEach((l,i2)=>bt(g,l,4,118-h2+i2*8,'#c8cfd8'));
      } else if (this.n<0){
        bt(g,'YOU OPEN THE CURTAIN TO LEAVE. BELOW, IN THE RAIN:',12,96,'#5c6472');
      }
    },
    tick(t){ if (this.n>=0 && this.n<VIG.length && (t-this.t0)>40+this.n*55) this.next(); }
  });

  // ================================================================
  // SCENE 1.3 — COMMUTE (score as a social engine)
  // ================================================================
  const C = {};
  function cmReport(kind){
    if (kind==='none'){
      C.report='none'; AR.G.flags.no_report=true; AR.G.susp+=0.04;
      AR.say([['SYSTEM','DID YOU OBSERVE NO RISK TODAY,'],
        ['SYSTEM','OR DID YOU CHOOSE NOT TO REPORT IT?'],
        ['SYSTEM','ANSWER NOT REQUIRED. THE QUESTION IS THE RECORD.']],null);
      return; }
    C.report=kind;
    if (kind==='vendor') AR.G.flags.reported_vendor=true;
    else AR.G.flags.reported_oldman=true;
    AR.tag('SACRIFICE',1); AR.scoreAdd(20,'CIVIC CONTRIBUTION');
    AR.toast('REPORT FILED. SUBJECT WILL BE EVALUATED.','#c2778a');
  }
  AR.def('commute', {
    type:'room',
    floor:{x0:10,x1:182,y0:66,y1:78},
    actor:{x:14,y:72},
    spots:[
      {id:'oldman', x:70,y:76,w:18,h:10, ad:'FALLEN MAN'},
      {id:'screen', x:78,y:6,w:44,h:32, ad:'PUBLIC SCREEN'},
      {id:'queue',  x:128,y:52,w:26,h:26, ad:'STANDARD QUEUE'},
      {id:'gate',   x:160,y:40,w:22,h:38, ad:'PRIORITY GATE'},
      {id:'phone',  x:0,y:0,w:0,h:0, ad:'WRIST TERMINAL', self:true},
      {id:'poster2',x:16,y:12,w:26,h:34, ad:'STREET POSTER'}
    ],
    approach:{ oldman:{x:66,y:74}, screen:{x:96,y:70}, queue:{x:126,y:72},
      gate:{x:158,y:70}, poster2:{x:28,y:70} },
    reportSubjects(){
      if (!C.phoneAsked) return [];
      if (C.report!==null) return [{t:'DAILY DUTY: COMPLETE. RECORDED.', dim:true}];
      return [
        {t:'MARKET VENDOR — HOARDING RUMOR', cb:()=>cmReport('vendor')},
        {t:'FALLEN MAN — OBSTRUCTION', dim:C.helped===true, cb:()=>cmReport('oldman')},
        {t:'FILE: NOTHING TO REPORT', cb:()=>cmReport('none')}
      ]; },
    look:{
      screen:{s:'crackle',v:.5,m:['THE GUARDIAN SPEAKS OF CONTINUITY. THE TICKER SPEAKS OF YOU.',
        'CITIZEN SCORES SCROLL LIKE WEATHER.']},
      poster2:{s:'sting',m:['REPORT TODAY. PROTECT TOMORROW.',
        'THE GLUE IS ALWAYS WET SOMEWHERE.']},
    },
    enter(){
      Object.assign(C,{helped:null, gate:null, report:null, phoneT:AR.t+60,
        phoneAsked:false});
      // street: sky, buildings, wet road
      gfx.put(0,0,192,60,M.SKY,1.2); gfx.tex(0,0,192,60,4,0.2);
      gfx.put(0,44,50,26,M.BLDG,1.4); gfx.put(50,38,40,32,M.BLDG,1.1);
      gfx.put(124,30,68,40,M.BLDG,1.5); gfx.tex(124,30,68,40,3,0.3);
      gfx.put(0,70,192,38,M.FLOOR,1.5); gfx.tex(0,70,192,38,2,0.3);
      gfx.put(0,70,192,1,M.FLOOR,0.6);
      // ministry pyramid on horizon
      gfx.put(96,20,26,24,M.BLDG,1.7); gfx.put(102,12,14,8,M.BLDG,1.7);
      // public screen
      gfx.put(78,6,44,32,M.METAL,1.5); gfx.put(80,8,40,28,M.SCREEN,1.3);
      // priority gate
      gfx.put(160,40,22,4,M.RED,2.0); gfx.put(160,44,3,34,M.METAL,1.6);
      gfx.put(179,44,3,34,M.METAL,1.6);
      // street poster
      gfx.put(16,12,26,34,M.PAPER,1.9); gfx.put(16,12,26,2,M.RED,2.0);
      gfx.put(16,44,26,2,M.RED,2.0);
      gfx.shadow(64,84,26,3,0.5);
      gfx.light(100,22,1.6,0.008,1,(t)=>0.85+0.15*Math.sin(t*0.11));
      gfx.light(170,42,1.2,0.02,1,()=>1);
      gfx.light(30,64,0.8,0.02,1,()=>1);
      gfx.amb(0.25);
      AR.ambSet(['hum','amb_rain']);
      AR.music('iron-march-a',.08);
      AR.msg('THE MINISTRY EXPECTS YOU. THE STREET WATCHES YOU WALK.');
      AR.ui.hudRight=null;
    },
    tick(t){
      if (!C.phoneAsked && t>C.phoneT){
        C.phoneAsked=true; AR.ses('buzz',.3);
        AR.toast('DAILY DUTY: REPORT ONE SUSPICIOUS BEHAVIOR YOU OBSERVED TODAY.','#c2778a');
      }
    },
    onClick(sp,t){
      if (sp.id==='oldman'){
        if (C.helped!==null){ AR.msg(C.helped?'HE IS GONE. HIS THANKS LINGERS ILLEGALLY.'
          :'SOMEONE ELSE DID NOT HELP HIM EITHER.'); return; }
        AR.ask('A LOW-SCORE MAN HAS FALLEN. PEOPLE CURVE AROUND HIM LIKE WATER.',[
          {t:'HELP HIM UP', cb:()=>{ C.helped=true;
            AR.ses('cloth',.5); AR.scoreAdd(-15,'CONTACT WITH SCORE CLASS D');
            AR.G.flags.helped_oldman=true; AR.tag('SOCIAL',1);
            AR.say([['OLD MAN','THEY DEDUCT FOR THIS. I KNOW. I USED TO BE A B-CLASS.'],
              ['OLD MAN','I REMEMBER FACES, OFFICER. BOTH KINDS.']],null); }},
          {t:'WALK PAST', cb:()=>{ C.helped=false;
            AR.msg('YOU CURVE AROUND HIM LIKE WATER. THE STREET APPROVES.');
            AR.toast('EFFICIENT ROUTING MAINTAINED.','#7a9a6a'); }}
        ]); return; }
      if (sp.id==='queue'){
        if (C.gate){ AR.msg('THE GATE IS BEHIND YOU.'); return; }
        AR.ask('THE STANDARD QUEUE. FORTY MINUTES OF OTHER PEOPLE\'S LIVES.',[
          {t:'JOIN THE STANDARD QUEUE', cb:()=>{ C.gate='queue';
            AR.tag('TRUTH_SEEKER',1);
            AR.card('queue','IN THE STANDARD QUEUE, MEDICINE IS BARGAINED FOR IN WHISPERS.','OBSERVATION');
            AR.say([['SYSTEM','CITIZEN 6079: NON-OPTIMAL ROUTE SELECTED.'],
              ['YOU','FORTY MINUTES. A WOMAN AHEAD TRADES HER RATION CARD FOR COUGH SYRUP.'],
              ['YOU','NOBODY LOOKS AT ANYBODY. THAT TAKES PRACTICE.']],
              ()=>AR.msg('THE GATE IS OPEN NOW. THE MINISTRY WAITS.')); }},
          {t:'STEP BACK', cb:()=>{}}
        ]); return; }
      if (sp.id==='gate'){
        if (!C.phoneAsked){ AR.msg('THE GATE READS YOUR WRIST. YOUR WRIST IS BUZZING.'); }
        if (C.report===null && C.phoneAsked){
          this.onClick({id:'phone'},t); return; }
        AR.ask(C.gate?'THE PRIORITY GATE HUMS OPEN FOR CLASS B+.':'TWO WAYS IN.',[
          {t:C.gate==='queue'?'PASS THROUGH (QUEUE DONE)':'USE THE PRIORITY GATE (B+ ONLY)',
            cb:()=>{ if (!C.gate){ C.gate='fast'; AR.tag('SCORE_OPTIMIZER',1);
              AR.toast('PRIORITY TRANSIT LOGGED. CLASS PRIVILEGE EXERCISED.','#7a9a6a'); }
            AR.ses('clink',.5); AR.go('ministry'); }},
          {t:'NOT YET', cb:()=>{}}
        ]); return; }
      if (sp.id==='phone'){ AR.devToggle(); return; }
      AR.lookMsg(sp);
    },
    draw(g,t){
      // screen: guardian face + ticker
      r(g,86,12,12,8,'#8d8574'); r(g,88,14,2,2,'#15171d'); r(g,94,14,2,2,'#15171d');
      r(g,88,18,8,1,'#15171d');
      bt(g,'CONTINUITY',82,26,'#96222e');
      const tick='CITIZEN 4471: 512-C · CITIZEN 8812: 691-B · CITIZEN 6079: '+AR.G.score+'-B+ · ';
      const off2=(t*1)%(tick.length*4);
      g.save(); g.beginPath(); g.rect(80,32,40,8); g.clip();
      bt(g,tick+tick,80-off2,32,'#5a86a0'); g.restore();
      // queue people
      AR.drawNPC(g,132,60,'#b98f6e','#2c3038',t,{});
      AR.drawNPC(g,140,62,'#caa27a','#38303a',t,{});
      AR.drawNPC(g,148,60,'#c9a27c','#2c3844',t,{hairLong:true});
      // fallen old man
      if (C.helped!==true){
        r(g,70,82,12,3,'#3a3430'); r(g,82,81,4,4,'#b98f6e');
        r(g,70,81,3,3,'#2c2824');
      } else { AR.drawNPC(g,70,68,'#b98f6e','#3a3430',t,{}); }
      // gate lamps
      r(g,168,42,6,1,(t/8|0)%2?'#c2242e':'#701a2c');
      bt(g,'B+',166,46,'#d9b36a');
      // street poster print
      bt(g,'REPORT',18,18,'#96222e'); bt(g,'TODAY',20,26,'#96222e');
      r(g,20,36,18,6,'#8d8574');
      // rain
      for (let i=0;i<9;i++){
        const rx=((i*47)%188), ry=((t*3+i*29)%104);
        r(g,rx,ry,1,2,'rgba(60,76,98,0.5)'); }
      // wrist terminal indicator
      if (C.phoneAsked && C.report===null && (t/7|0)%2)
        bt(g,'! WRIST TERMINAL',3,88,'#c2242e');
      this.spots.find(s=>s.id==='phone').x = (HIM.x|0)-2;
      this.spots.find(s=>s.id==='phone').y = (HIM.y|0);
      this.spots.find(s=>s.id==='phone').w = C.phoneAsked?10:0;
      this.spots.find(s=>s.id==='phone').h = 16;
    }
  });

  // ================================================================
  // SCENE 1.4-1.6 — MINISTRY: tutorial files, Mara file, Vale
  // ================================================================
  const MN = {};
  function filesMenu(){
    const d=MN;
    AR.term.open({
      title:'REALITY CONSISTENCY DESK — CASE QUEUE',
      body:()=>[
        'OPERATOR: E. ROOK · CLEARANCE 3','',
        {s:(d.fileA?'(DONE) ':'( )    ')+'FILE A — HOUSEHOLD IMAGE DISCREPANCY', col:d.fileA?'#4a6a4a':null},
        {s:(d.fileB?'(DONE) ':'( )    ')+'FILE B — IMPROPER MOURNING', col:d.fileB?'#4a6a4a':null},
        {s:(d.fileC?'(DONE) ':'( )    ')+'FILE C — HISTORICAL DATE CORRECTION', col:d.fileC?'#4a6a4a':null},
        '',
        d.fileA&&d.fileB&&d.fileC?
          {s:'PRIORITY REVIEW UNLOCKED: CITIZEN M. VENN', col:'#c2242e'}:
          {s:'PRIORITY REVIEW LOCKED — CLEAR THE QUEUE', col:'#3f4854'},
        '',
        {s:'NOTE: CITIZEN 4471 FILE (ENTERED THE SAME CORRIDOR', col:'#3f4854'},
        {s:'A THIRD TIME, DEFYING NARRATOR EXPECTATIONS)', col:'#3f4854'},
        {s:'REASSIGNED TO DESK 9.', col:'#3f4854'}
      ],
      opts:()=>[
        {t:'OPEN FILE A', dim:MN.fileA, cb:fileA},
        {t:'OPEN FILE B', dim:MN.fileB, cb:fileB},
        {t:'OPEN FILE C', dim:MN.fileC, cb:fileC},
        {t:'OPEN VENN FILE', dim:!(MN.fileA&&MN.fileB&&MN.fileC)||MN.mara, cb:maraFile},
        {t:'LEAVE THE DESK', cb:()=>{ AR.term.close(); AR.HIM.otur=false;
          AR.HIM.x=70; AR.HIM.y=70; }}
      ]
    });
  }
  // ---- FILE A: the extra chair ----
  function fileA(){
    let viewed=false, marked=false;
    const scr={
      title:'FILE A — FAMILY UNIT 2214',
      body:()=>[
        'SUBMITTED IMAGE: EVENING MEAL, UNIT 2214.',
        'ANOMALY FLAG: OBJECT COUNT.','',
        viewed?'HOUSEHOLD RECORD: 4 REGISTERED MEMBERS.':'',
        viewed?'IMAGE CONTAINS: 4 PERSONS. 5 CHAIRS.':'',
        marked?{s:'FIFTH CHAIR MARKED FOR REMOVAL.',col:'#c2242e'}:'',
      ],
      art(g,t){
        // small photo panel
        const px0=118,py0=16;
        r(g,px0,py0,66,44,'#2a2626'); r(g,px0+2,py0+2,62,40,'#4a4340');
        r(g,px0+4,py0+26,58,14,'#3a332e');
        for (let i=0;i<5;i++){
          const cx=px0+7+i*11;
          if (i===4 && MN.fileA) continue;             // erased
          r(g,cx,py0+22,6,10,'#5c3d22'); r(g,cx+1,py0+18,4,5,'#42291a');
          if (i===4){ if (marked&&(t/6|0)%2) { g.strokeStyle='#c2242e';
            g.strokeRect(cx-1.5,py0+16.5,9,17);} }
          else { r(g,cx+1,py0+12,4,4,'#c9a27c'); r(g,cx+1,py0+12,4,1,'#241f1b'); }
        }
        bt(g,'ARCHIVE IMG 2214-E',px0+2,py0+45,'#3f4854');
      },
      opts:()=>[
        {t:'VIEW HOUSEHOLD RECORD', dim:viewed, cb:()=>{ viewed=true; AR.ses('page',.4); }},
        {t:'MARK THE FIFTH CHAIR', dim:!viewed||marked, cb:()=>{ marked=true;
          AR.ses('yazi',.4);
          AR.card('chair','FOUR REGISTERED MEMBERS. FIVE CHAIRS. SOMEONE WAS SUBTRACTED.','OBSERVATION'); }},
        {t:'STAMP: ERASE OBJECT', dim:!marked, snd:'knock', cb:()=>{
          MN.fileA=true; AR.ses('yazi',.5);
          AR.toast('OBJECT REMOVED FROM ARCHIVE IMAGE. CONSISTENCY RESTORED.','#7a9a6a');
          AR.say([['SYSTEM','FILE A CLOSED. PROCESSING TIME: WITHIN NORMS.'],
            ['YOU','A CHAIR IS ONLY A CHAIR. UNLESS SOMEBODY USED TO SIT IN IT.']],
            filesMenu); }},
        {t:'BACK', cb:filesMenu}
      ]
    };
    AR.term.open(scr);
  }
  // ---- FILE B: improper mourning ----
  function fileB(){
    let reg=false;
    AR.term.open({
      title:'FILE B — CITIZEN 5522 · IMPROPER MOURNING',
      body:()=>[
        'SUBJECT KEPT SPOUSE PORTRAIT DISPLAYED',
        '33 DAYS AFTER LOSS.',
        'REGULATION 4.2: PERMITTED MOURNING DISPLAY: 30 DAYS.','',
        'STATUS NOTE: WIDOWER. ONE DEPENDENT CHILD.','',
        reg?{s:'REG 4.2.C: CUSTODIAL WIDOWERS RECEIVE',col:'#d9b36a'}:'',
        reg?{s:'A 14-DAY EXTENSION FOR DEPENDENT STABILITY.',col:'#d9b36a'}:'',
        '',
        'RECOMMENDED ACTION: EMOTIONAL READJUSTMENT CENTER.'
      ],
      opts:()=>[
        {t:'SEARCH THE REGULATION INDEX', dim:reg, cb:()=>{ reg=true; AR.ses('page',.45);
          AR.card('reg42c','REGULATIONS HAVE SUBSECTIONS. SUBSECTIONS HAVE MERCY. SOMETIMES.','OBSERVATION'); }},
        {t:'STAMP: APPROVE READJUSTMENT', snd:'knock', cb:()=>{
          MN.fileB=true; AR.tag('SACRIFICE',1); AR.scoreAdd(5,'THROUGHPUT');
          AR.G.npc.mourner='readjusted';
          AR.say([['SYSTEM','SUBJECT 5522 SCHEDULED FOR EMOTIONAL REALIGNMENT.'],
            ['YOU','HE WILL COME BACK CALM. THE PORTRAIT WILL NOT COME BACK AT ALL.']],
            filesMenu); }},
        {t:'STAMP: INVALID — REG 4.2.C APPLIES', dim:!reg, snd:'knock', cb:()=>{
          MN.fileB=true; AR.tag('LEGALISM',1); AR.G.susp+=0.02;
          AR.G.npc.mourner='spared';
          AR.say([['SYSTEM','FILE RETURNED. EXTENSION GRANTED: 11 REMAINING DAYS OF GRIEF.'],
            ['YOU','ELEVEN DAYS. THE SYSTEM COUNTS EVEN THAT.']],
            filesMenu); }},
        {t:'BACK', cb:filesMenu}
      ]
    });
  }
  // ---- FILE C: the war date ----
  function fileC(){
    let cmp=false, rew=false, hes=false;
    AR.term.open({
      title:'FILE C — HISTORICAL DATE CORRECTION',
      body:()=>[
        'RECOVERED NEWSPAPER, PRE-ARCHIVE:',
        {s:'  "THE WAR ENTERS ITS FOURTH YEAR"', col:'#a29a82'},
        '',
        'CURRENT VERIFIED REALITY:',
        {s:'  THE WAR IS IN ITS THIRD YEAR.', col:'#5a86a0'},
        '',
        cmp?'DISCREPANCY CONFIRMED: 1 YEAR.':'',
        hes?{s:'TASK COMPLETION IS NOT OPTIONAL, CITIZEN 6079.',col:'#c2242e'}:'',
        rew?{s:'HEADLINE REWRITTEN: "THE WAR ENTERS ITS THIRD YEAR"',col:'#7a9a6a'}:''
      ],
      opts:()=>[
        {t:'COMPARE DATES', dim:cmp, cb:()=>{ cmp=true; AR.ses('page',.4); }},
        {t:'HESITATE', dim:!cmp||hes||rew, cb:()=>{ hes=true; AR.tag('TRUTH_SEEKER',1);
          AR.G.susp+=0.03; AR.ses('buzz',.25); }},
        {t:'REWRITE THE HEADLINE', dim:!cmp||rew, cb:()=>{ rew=true; AR.ses('yazi',.5); }},
        {t:'FEED ORIGINAL TO THE MEMORY HOLE', dim:!rew, snd:'kibrit', cb:()=>{
          MN.fileC=true; AR.ses('crackle',.5);
          AR.card('wardate','YESTERDAY THE WAR WAS FOUR YEARS OLD. TODAY IT IS THREE.','OBSERVATION');
          AR.say([['SYSTEM','ORIGINAL DESTROYED. HISTORY IS CONSISTENT.'],
            ['YOU','THE PAPER BURNS IN TWO SECONDS. THE YEAR TOOK LONGER.']],
            filesMenu); }},
        {t:'BACK', cb:filesMenu}
      ]
    });
  }
  // ---- MARA VENN FILE ----
  function maraRisk(){ let risk=76;
    if (MN.flowerVoid) risk-=8;
    if (MN.clapVoid) risk-=11;
    if (MN.scape) risk-=12;
    return risk; }
  function maraFile(){
    if (!MN.maraSeen){
      MN.maraSeen=true;
      AR.ses('sting',.5);
      AR.say([
        ['TERMINAL','CITIZEN REVIEW: MARA VENN. COMPLIANCE 641.'],
        ['TERMINAL','DEVIANT-THOUGHT PROBABILITY: 76 PERCENT. RECOMMENDED: PREVENTIVE READJUSTMENT.'],
        ['TERMINAL','CITIZEN MARA VENN HAS NOT YET COMMITTED AN OFFENSE.'],
        ['TERMINAL','THIS IS THEREFORE THE OPTIMAL MOMENT FOR INTERVENTION.'],
        ['SYSTEM','CITIZEN 6079 RECOGNIZED THE FILE.'],
        ['SYSTEM','CORRECTION: CITIZEN 6079 MAY HAVE PREVIOUSLY OBSERVED THE SUBJECT.']
      ], maraHub);
      return;
    }
    maraHub();
  }
  function maraHub(){
    const risk=maraRisk();
    AR.term.open({
      title:'CITIZEN REVIEW — MARA VENN',
      tcol:'#3a1420',
      body:()=>[
        {s:'DEVIANT-THOUGHT RISK: '+maraRisk()+' PERCENT',
          col:maraRisk()>=70?'#c2242e':'#d9b36a'},
        'MANDATORY INTERVENTION THRESHOLD: 70 PERCENT','',
        'CHARGES:',
        ' · APPLAUDED 2.1 SECONDS LATE AT OFFICIAL SPEECH',
        ' · PLACED A FLOWER IN FRONT OF A TELESCREEN'+(MN.flowerVoid?' (VOID)':''),
        ' · MET WITH A LOW-SCORE FAMILY',
        ' · DECLINED MATCHING PROPOSALS',
        ' · UNTRACKABLE FOR 17 MINUTES (DEVICE OFF)',
        ' · USED A DISCONTINUED WORD'
      ],
      art(g,t){
        r(g,138,56,46,38,'#232028'); r(g,140,58,42,34,'#3a333a');
        if (pimgOk('mara')) g.drawImage(PIMG.mara,149,60);
        else { r(g,156,64,10,9,'#d9b58f'); r(g,156,64,10,3,'#2c1a10');
          r(g,155,64,1,8,'#2c1a10'); r(g,166,64,1,8,'#2c1a10');
          r(g,158,67,2,2,'#241f1b'); r(g,162,67,2,2,'#241f1b');
          r(g,154,74,14,14,'#5c2e3a'); }
        bt(g,'M. VENN',146,88,'#8fa0b2');
      },
      opts:()=>[
        {t:'EVIDENCE: FLOWER CAMERA STILL', cb:evFlower},
        {t:'EVIDENCE: APPLAUSE VIDEO', cb:evClap},
        {t:'MAINTENANCE SCHEDULE', cb:evMaint},
        {t:'REGULATION 8.17', cb:evReg},
        {t:'LOW-SCORE CONTACTS', cb:evContacts},
        maraRisk()<70?
          {t:'STAMP: INSUFFICIENT DATA — CONTINUE OBSERVATION', snd:'knock', col:'#d9b36a', cb:maraResolve}:
          {t:'STAMP: APPROVE PREVENTIVE READJUSTMENT', snd:'knock', cb:maraApprove},
      ]
    });
  }
  function evFlower(){
    AR.term.push({
      title:'CAMERA STILL — SECTOR 4 TELESCREEN',
      body:()=>[
        'IMAGE: SUBJECT PLACES A POTTED FLOWER',
        'DIRECTLY BEFORE PUBLIC TELESCREEN 4-112.',
        'EVIDENCE WEIGHT: 8 (HIGHEST IN FILE).','',
        {s:'FRAME TIMECODE: 06:41:07', col:'#d9b36a'},
        MN.flowerVoid?{s:'STATUS: LEGALLY VOID (REG 8.17)',col:'#7a9a6a'}:
          'STATUS: DECISIVE EVIDENCE',
        '',
        MN.noteTC?'(TIMECODE NOTED IN YOUR NOTEBOOK)':''
      ],
      opts:()=>[
        {t:'NOTE THE TIMECODE', dim:MN.noteTC, cb:()=>{ MN.noteTC=true;
          AR.card('flower_tc','FLOWER IMAGE TIMECODE: 06:41. WEIGHT 8.','OBSERVATION'); }},
        {t:'COMBINE: CALIBRATION + REG 8.17',
          dim:!(MN.noteTC&&MN.noteCal&&MN.noteReg)||MN.flowerVoid, col:'#d9b36a', cb:()=>{
          MN.flowerVoid=true; AR.tag('LEGALISM',2); AR.ses('clink',.6);
          AR.card('flower_void','THE FLOWER IMAGE WAS TAKEN DURING CALIBRATION. LEGALLY IT DOES NOT EXIST.','EVIDENCE');
          AR.toast('EVIDENCE INVALIDATED. RISK RECALCULATED: '+maraRisk()+' PERCENT.','#7a9a6a'); }},
        {t:'BACK', cb:()=>AR.term.back()}
      ]
    });
  }
  function evMaint(){
    AR.term.push({
      title:'TELESCREEN 4-112 — MAINTENANCE LOG',
      body:()=>[
        '06:00 - 06:30  LENS WIPE (AUTOMATED)',
        {s:'06:30 - 07:00  CALIBRATION MODE', col:'#d9b36a'},
        '07:00 - 07:05  SELF-TEST','',
        'DURING CALIBRATION THE UNIT RECORDS,',
        'BUT GEOMETRY AND COLOR ARE UNVERIFIED.','',
        MN.noteCal?'(CALIBRATION WINDOW NOTED)':''
      ],
      opts:()=>[
        {t:'NOTE THE CALIBRATION WINDOW', dim:MN.noteCal, cb:()=>{ MN.noteCal=true;
          AR.card('calib','TELESCREEN 4-112 WAS IN CALIBRATION 06:30-07:00.','OBSERVATION'); }},
        {t:'BACK', cb:()=>AR.term.back()}
      ]
    });
  }
  function evReg(){
    AR.term.push({
      title:'BEHAVIOR REGULATION 8.17',
      body:()=>[
        {s:'"IMAGERY CAPTURED DURING MAINTENANCE OR', col:'#a29a82'},
        {s:'CALIBRATION SHALL NOT SERVE AS DECISIVE', col:'#a29a82'},
        {s:'EVIDENCE IN PSYCHOLOGICAL RISK ASSESSMENT."', col:'#a29a82'},
        '',
        'CROSS-REFERENCE: REG 12.4 PERMITS ANY IMAGERY',
        'IN EMERGENCIES. NO EMERGENCY IS ON FILE.','',
        MN.noteReg?'(REGULATION NOTED)':''
      ],
      opts:()=>[
        {t:'NOTE REGULATION 8.17', dim:MN.noteReg, cb:()=>{ MN.noteReg=true;
          AR.card('reg817','REG 8.17: CALIBRATION IMAGERY IS NOT DECISIVE EVIDENCE.','OBSERVATION'); }},
        {t:'BACK', cb:()=>AR.term.back()}
      ]
    });
  }
  function evClap(){
    AR.term.push({
      title:'APPLAUSE VIDEO — UNITY ADDRESS, ROW 12',
      body:()=>[
        'SUBJECT BEGINS APPLAUSE 2.1 SECONDS AFTER',
        'ROW AVERAGE. EVIDENCE WEIGHT: 5.','',
        MN.clapSync?{s:'AUDIO TRACK LEADS VIDEO BY 1.4 SECONDS.',col:'#d9b36a'}:'',
        MN.clapSync?{s:'MEASURED DELAY IS THEREFORE UNVERIFIABLE.',col:'#d9b36a'}:'',
        MN.clapVoid?{s:'STATUS: LEGALLY VOID (SYNC FAULT)',col:'#7a9a6a'}:''
      ],
      opts:()=>[
        {t:'ANALYZE AUDIO/VIDEO SYNC', dim:MN.clapSync, cb:()=>{ MN.clapSync=true;
          AR.ses('crackle',.4); AR.tag('TRUTH_SEEKER',2);
          AR.card('clap_sync','THE APPLAUSE VIDEO IS OUT OF SYNC BY 1.4 SECONDS.','OBSERVATION'); }},
        {t:'INVALIDATE: TIMING UNVERIFIABLE', dim:!MN.clapSync||MN.clapVoid, col:'#d9b36a', cb:()=>{
          MN.clapVoid=true; AR.ses('clink',.6);
          AR.card('clap_void','2.1 SECOND DELAY MEASURED BY A CLOCK THAT LIES BY 1.4.','EVIDENCE');
          AR.toast('EVIDENCE INVALIDATED. RISK RECALCULATED: '+maraRisk()+' PERCENT.','#7a9a6a'); }},
        {t:'BACK', cb:()=>AR.term.back()}
      ]
    });
  }
  function evContacts(){
    AR.term.push({
      title:'LOW-SCORE CONTACTS — M. VENN',
      body:()=>[
        'CONTACT: CITIZEN 7203 "TEREZA K." SCORE 402-D.',
        'THREE MEETINGS. GAVE THE SUBJECT BREAD ONCE.','',
        'OPTION: DESIGNATE CONTACT AS PRIMARY',
        'INFLUENCE SOURCE. RISK TRANSFERS TO CONTACT.','',
        MN.scape?{s:'CITIZEN 7203 DESIGNATED. HER FILE IS NOW OPEN.',col:'#c2242e'}:''
      ],
      opts:()=>[
        {t:'DESIGNATE 7203 AS PRIMARY INFLUENCE SOURCE', dim:MN.scape, cb:()=>{
          MN.scape=true; AR.tag('SACRIFICE',2); AR.G.npc.tereza='flagged';
          AR.ses('knock',.5);
          AR.toast('RISK TRANSFERRED. CITIZEN 7203 UNDER REVIEW.','#c2242e'); }},
        {t:'BACK', cb:()=>AR.term.back()}
      ]
    });
  }
  function maraApprove(){
    AR.ses('buzz',.4);
    AR.say([
      ['SYSTEM','HUMAN SIGNATURE RECEIVED.'],
      ['SYSTEM','NOTICE: PREVENTIVE READJUSTMENT SLOTS EXHAUSTED THIS CYCLE.'],
      ['SYSTEM','FILE RETURNED FOR RE-EXAMINATION. FIND STRONGER GROUNDS, OR WEAKER ONES.']
    ], maraHub);
    AR.G.susp+=0.02;
  }
  function maraResolve(){
    MN.mara=true; AR.ses('yazi',.5);
    AR.say([
      ['SYSTEM','STAMP ACCEPTED: INSUFFICIENT DATA. OBSERVATION CONTINUES.'],
      ['YOU','YOUR FIRST DELIBERATE DISOBEDIENCE. IT LOOKED EXACTLY LIKE PAPERWORK.']
    ], ()=>{
      AR.ask('DO YOU HAVE A PERSONAL RELATIONSHIP WITH CITIZEN MARA VENN?',[
        {t:'NO', cb:s=>rq('no',s)},
        {t:'NO DIRECT RELATIONSHIP', cb:s=>rq('nodirect',s)},
        {t:'PUBLIC OBSERVATION ONLY', cb:s=>rq('public',s)},
        {t:'I DO NOT RECALL', cb:s=>rq('norecall',s)}
      ]);
      const rq=(a,sec)=>{
        AR.G.flags.relationship_answer=a;
        AR.toast('ANSWER RECORDED.','#c2778a');
        setTimeout(()=>AR.toast('YOUR RESPONSE TIME WAS ALSO RECORDED. ('+sec.toFixed(1)+' SECONDS)','#5c6472'),1500);
        AR.term.close(); AR.HIM.otur=false; AR.HIM.x=70; AR.HIM.y=70;
        MN.valeReady=true;
        setTimeout(()=>{ AR.ses('knock',.4);
          AR.toast('SUPERVISOR VALE REQUESTS YOUR PRESENCE.','#d9b36a'); },2500);
      };
    });
  }
  function valeTalk(){
    const m=AR.G.method;
    const domLine =
      m.LEGALISM>=Math.max(m.TRUTH_SEEKER,m.SACRIFICE)?
        'YOUR PROCEDURAL ATTENTION IS RARE. MOST OFFICERS READ REGULATIONS. YOU LISTEN TO THEM.':
      m.TRUTH_SEEKER>=m.SACRIFICE?
        'YOU VERIFY MORE THAN THE FORM REQUIRES. THE SYSTEM FINDS THAT... PROMISING.':
        'YOU UNDERSTAND TRIAGE. SOMEONE MUST BE WEIGHED. YOU WEIGH.';
    AR.say([
      ['VALE','SIT. NO — THIS ISN\'T DISCIPLINARY.'],
      ['VALE',domLine],
      ['VALE','MARA VENN MAY BE DANGEROUS. DIRECT INTERVENTION WOULD ONLY CLOSE HER.'],
      ['VALE','YOU ARE TEMPORARILY REASSIGNED: FIELD CONSISTENCY OFFICER.'],
      ['VALE','APPROACH HER. EARN TRUST. MAP HER CIRCLE. REPORT WHAT SHE THINKS OF THE SYSTEM.'],
      ['VALE','YOU WILL BE PROTECTING HER, IN A SENSE. FROM WORSE OPTIONS.'],
      ['SYSTEM','ASSIGNMENT LOGGED: OPERATION FIELD-CONSISTENCY. STATUS: ACTIVE.']
    ], ()=>{
      AR.card('field_op','VALE CALLS IT PROTECTION. THE FORM CALLS IT SURVEILLANCE.','OBSERVATION');
      AR.director({
        STEALTH:{id:'extra_microphone', msg:'ADAPTATION: ADDITIONAL AUDIO SENSOR APPROVED FOR RESIDENCE 12.'},
        LEGALISM:{id:'live_regulation', msg:'ADAPTATION: DIGITAL REGULATIONS NOW UPDATE LIVE. PRINT ARCHIVES UNAFFECTED.'},
        SACRIFICE:{id:'sacrificed_citizen', msg:'ADAPTATION: REDIRECTED SUBJECTS\' FAMILIES RELOCATED TO YOUR SECTOR.'},
        TRUTH_SEEKER:{id:'cross_check', msg:'ADAPTATION: YOUR VERIFICATION QUERIES NOW REQUIRE COUNTER-SIGNATURE.'},
        SCORE_OPTIMIZER:{id:'privilege_audit', msg:'ADAPTATION: CLASS PRIVILEGE USAGE NOW AUDITED WEEKLY.'},
        SOCIAL:{id:'npc_crosscheck', msg:'ADAPTATION: CITIZEN STATEMENTS NOW CROSS-EXAMINED AUTOMATICALLY.'},
        DEFAULT:{id:'baseline_watch', msg:'ADAPTATION: BASELINE OBSERVATION EXTENDED.'}
      }, ()=>{ AR.G.chapter=2; AR.term.close(); AR.go('ch2_brief'); });
    });
  }
  AR.def('ministry', {
    type:'room',
    floor:{x0:10,x1:176,y0:66,y1:78},
    actor:{x:14,y:72},
    seat:{x:96,y:70,sx:95,sy:58}, seatHand:{x:110,y:63},
    spots:[
      {id:'terminal', x:100,y:52,w:22,h:18, ad:'YOUR TERMINAL'},
      {id:'desk2',    x:88,y:64,w:40,h:16, ad:'YOUR DESK'},
      {id:'vale',     x:158,y:26,w:22,h:52, ad:'SUPERVISOR VALE\'S DOOR'},
      {id:'coworker', x:36,y:56,w:12,h:20, ad:'DESK 9'},
      {id:'canteen',  x:8,y:24,w:22,h:30, ad:'CANTEEN HATCH'},
      {id:'banner',   x:64,y:6,w:70,h:12, ad:'BANNER'}
    ],
    approach:{ terminal:{seat:1}, desk2:{seat:1}, vale:{x:154,y:72},
      coworker:{x:48,y:72}, canteen:{x:22,y:70}, banner:{x:96,y:70} },
    look:{
      banner:{s:'sting',m:['REALITY IS WHAT SURVIVES VERIFICATION.',
        'THE BANNER IS FRESHLY PRINTED. IT ALWAYS IS.']},
      coworker:{s:'cloth',m:['DESK 9 DOES NOT LOOK UP. LOOKING UP IS A METRIC.',
        'HIS STAMP ARM IS FASTER THAN YOURS. HIS EYES ARE OLDER.']},
      canteen:{s:'clink',m:['TWO CALMING CAPSULES ON A TRAY. ONE RED, ONE BLUE.',
        'THE TEA TASTES OF CENTRALIZED PLANNING.']},
      desk2:{s:'knock',m:['YOUR DESK. YOUR STAMP. YOUR SIGNATURE. THEIR DECISIONS.']}
    },
    enter(){
      if (!MN.init){ Object.assign(MN,{init:true, fileA:false,fileB:false,fileC:false,
        mara:false, maraSeen:false, valeReady:false}); }
      gfx.put(0,0,192,78,M.WALL,1.5); gfx.tex(0,0,192,78,3,0.3);
      gfx.put(0,78,192,30,M.FLOOR,1.7); gfx.tex(0,78,192,30,2,0.25);
      gfx.put(0,78,192,1,M.FLOOR,0.7);
      // banner
      gfx.put(64,6,70,12,M.RED,2.0);
      // vale door
      gfx.put(158,26,22,52,M.WOOD,1.4); gfx.put(158,26,22,2,M.WOOD,2.0);
      gfx.put(160,48,3,4,M.METAL,2.4);
      // canteen hatch
      gfx.put(8,24,22,30,M.METAL,1.3); gfx.put(10,26,18,16,M.SCREEN,1.1);
      // desks: coworker + player's
      gfx.put(32,66,28,3,M.WOOD,2.0); gfx.put(33,69,2,9,M.WOOD,1.0); gfx.put(57,69,2,9,M.WOOD,1.0);
      gfx.put(88,66,40,3,M.WOOD,2.2); gfx.put(88,66,40,1,M.WOOD,3.0);
      gfx.put(90,69,2,11,M.WOOD,1.1); gfx.put(124,69,2,11,M.WOOD,1.1);
      // terminal on desk
      gfx.put(102,52,20,14,M.METAL,1.7); gfx.put(104,54,16,10,M.SCREEN,1.4);
      gfx.shadow(86,80,44,4,0.6); gfx.shadow(30,80,32,3,0.5);
      gfx.light(112,58,1.8,0.012,1,(t)=>0.85+0.15*Math.sin(t*0.13));
      gfx.light(96,10,1.2,0.006,1,()=>1);
      gfx.light(20,36,0.9,0.02,1,()=>1);
      gfx.amb(0.35);
      AR.ambSet(['hum','amb_room']);
      AR.music('midnight-blue-b',.10);
      AR.msg('THE REALITY CONSISTENCY FLOOR SMELLS OF WARM PAPER.');
    },
    onClick(sp,t){
      if (sp.id==='terminal'||sp.id==='desk2'){
        if (sp.id==='desk2' && MN.fileA&&MN.fileB&&MN.fileC&&MN.mara){ AR.lookMsg(sp); return; }
        filesMenu(); return; }
      if (sp.id==='vale'){
        if (!MN.valeReady){ AR.ses('knock',.4);
          AR.msg('THE DOOR IS SHUT. VALE OPENS DOORS ONLY ON SCHEDULE.'); return; }
        valeTalk(); return; }
      AR.lookMsg(sp);
    },
    draw(g,t){
      bt(g,'REALITY IS WHAT SURVIVES',68,7,'#e8d8d0');
      bt(g,'VERIFICATION',88,13,'#e8d8d0');
      // terminal glow + text
      if ((t/9|0)%2) r(g,106,56,12,1,'#5a86a0');
      r(g,106,59,8,1,'#3a5468');
      // coworker at desk 9
      AR.drawNPC(g,40,54,'#b98f6e','#2c3038',t,{});
      r(g,44,66,4,1,'#15171d');
      // canteen capsules easter egg
      r(g,14,44,2,2,'#c2242e'); r(g,20,44,2,2,'#3a6ac2');
      // vale door light
      if (MN.valeReady && (t/8|0)%2) r(g,168,30,4,2,'#d9b36a');
      bt(g,'VALE',162,32,'#5c6472');
    }
  });
})();

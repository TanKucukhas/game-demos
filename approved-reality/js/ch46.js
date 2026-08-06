// APPROVED REALITY — Chapters 4-6 + epilogue
// FREE VOICE → water plant → Niko's price → ceremony → the palace that is a
// studio → history lab → first instruction → OPERATION MIRROR → the plug →
// erasure → the unverifiable man → MIRROR-2
(function () {
  const {r, di, bt, M, gfx} = AR;
  const C4 = {};

  // ================================================================
  // 4.1 FREE VOICE CELL
  // ================================================================
  AR.def('ch4_cell', {
    type:'room',
    floor:{x0:14,x1:176,y0:66,y1:78},
    actor:{x:18,y:72},
    spots:[
      {id:'leader', x:130,y:50,w:12,h:24, ad:'THE LEADER, "ANVIL"'},
      {id:'mara',   x:104,y:52,w:12,h:22, ad:'MARA'},
      {id:'members',x:44,y:52,w:30,h:24, ad:'MEMBERS'},
      {id:'radio',  x:150,y:34,w:20,h:14, ad:'DEAD RADIO WALL'},
      {id:'table',  x:84,y:62,w:36,h:12, ad:'MAP TABLE'}
    ],
    approach:{ leader:{x:124,y:74}, mara:{x:98,y:74}, members:{x:56,y:74},
      radio:{x:154,y:72}, table:{x:92,y:72} },
    look:{
      radio:{s:'crackle',v:.5,m:['A WALL OF DEAD RADIOS. ONE OF THEM IS WARM.',
        'SOMEONE LISTENS THROUGH THE LISTENING MACHINES.']},
      members:{s:'cloth',m:['SIX FACES. TWO ANGRY, TWO AFRAID, ONE BORED, ONE... TAKING ATTENDANCE.',
        'THE BORED ONE NEVER BLINKS AT NOISES. INTERESTING NERVES.']},
      table:{s:'page',m:['PIPE MAPS, RATION SCHEDULES, AND A CHILD\'S DRAWING OF A HOUSE WITH NO CAMERAS.']}
    },
    enter(){
      Object.assign(C4,{loyal:false, water:false, choice:null, prep:[],
        cer:0});
      gfx.put(0,0,192,78,M.BRICK,0.9); gfx.tex(0,0,192,78,3,0.4);
      gfx.put(0,78,192,30,M.FLOOR,1.0); gfx.tex(0,78,192,30,2,0.35);
      gfx.put(84,62,36,4,M.WOOD,1.7); gfx.put(86,66,3,12,M.WOOD,1.0);
      gfx.put(114,66,3,12,M.WOOD,1.0);
      gfx.put(150,34,20,14,M.METAL,1.3);
      gfx.put(20,20,40,3,M.METAL,1.2);
      gfx.shadow(82,76,40,3,0.5);
      gfx.light(100,58,1.6,0.018,1.4,(t)=>{ const FL=[1,0.92,1.06,0.9,1.03,0.95,1.1,0.97];
        return FL[(t>>1)%8]; });
      gfx.light(160,40,0.6,0.03,1,(t)=>(t/9|0)%5===0?0.4:0.9);
      gfx.amb(0.1);
      AR.ambSet(['hum','amb_room']); AR.music('red-silence-b',.11);
      AR.msg('A CELLAR WITH ONE CANDLE\'S WORTH OF COURAGE. FREE VOICE.');
      this.stage=0;
    },
    onClick(sp,t){
      if (sp.id==='leader'){
        if (this.stage===0){ this.stage=1;
          AR.say([
            ['ANVIL','SO. MARA\'S CLIPBOARD MAN. SHE SAYS YOU BEND PAPER.'],
            ['ANVIL','PAPER IS THE SYSTEM\'S SKELETON. BONE-BENDERS ARE WELCOME. IF THEY PROVE OUT.'],
            ['ANVIL','BRING US SOMETHING TRUE, OFFICER. SOMETHING THE STATE WOULD MISS.']
          ], ()=>AR.msg('PROVE YOURSELF. WHAT DO YOU GIVE THEM?'));
          return; }
        if (!C4.loyal){
          const opts=[];
          if (AR.G.flags.mara_proof===true || AR.hasCard('synths','EVIDENCE'))
            opts.push({t:'GIVE THE SYNTHETIC-PROFILE PROOF', cb:()=>{
              C4.loyal=true; AR.tag('TRUTH_SEEKER',1); AR.G.att+=6;
              AR.say([['ANVIL','...THE ANGRY ONES ARE PUPPETS. I KNEW IT. KNOWING IT WITH PROOF IS DIFFERENT.'],
                ['ANVIL','WELCOME TO FREE VOICE. DON\'T DIE STUPIDLY.']], ()=>waterIntro()); }});
          opts.push({t:'LEAK A MINISTRY PROCEDURE (REAL STATE DATA)', cb:()=>{
            C4.loyal=true; AR.G.flags.leaked=true; AR.G.susp+=0.1; AR.tag('SACRIFICE',1);
            AR.say([['ANVIL','STATE PAPER. WARM FROM THE PRINTER. YOU ARE EITHER BRAVE OR BAIT.'],
              ['ANVIL','WE WILL USE IT EITHER WAY. WELCOME.']], ()=>waterIntro()); }});
          opts.push({t:'REFUSE — "TRUST GROWS, IT ISN\'T PAID"', cb:()=>{
            AR.G.att-=4;
            AR.say([['ANVIL','POETIC. POETS DIE FIRST, YOU KNOW.'],
              ['MARA','HE CHECKS OUT, ANVIL. I VOUCH.'],
              ['ANVIL','...ON HER WORD, THEN. HER WORD HAS WEIGHT HERE.']],
              ()=>{ C4.loyal=true; waterIntro(); }); }});
          AR.ask('ANVIL WAITS. THE ROOM PRETENDS NOT TO LISTEN.',opts);
          return; }
        AR.say([['ANVIL','THE WATER STORY STINKS. GO SNIFF IT.']],null); return; }
      if (sp.id==='mara'){
        AR.say([
          ['MARA','THEY ARE NOT ALL WHAT THEY SEEM. NEITHER ARE WE.'],
          ['MARA','WATCH THE ONE WHO NEVER FLINCHES. AND WATCH ME, IF YOU LIKE. YOU WILL ANYWAY.']
        ], null); return; }
      AR.lookMsg(sp);
      function waterIntro(){
        AR.card('freevoice','FREE VOICE: SIX MEMBERS. ONE TAKES ATTENDANCE WITH HIS EYES.','OBSERVATION');
        AR.say([
          ['ANVIL','FIRST JOB. THE STATE SAYS THE FREE ZONES POISONED OUR WATER.'],
          ['ANVIL','NIKO GOT US THE PLANT FOOTAGE. TELL US WHAT REALLY HAPPENED.']
        ], ()=>AR.go('ch4_water'));
      }
    },
    draw(g,t){
      AR.drawNPC(g,132,52,'#b98f6e','#3a3028',t,{});
      AR.drawNPC(g,106,54,'#d9b58f','#5c2e3a',t,{hair:'#2c1a10',hairLong:true});
      AR.drawNPC(g,46,54,'#caa27a','#33404e',t,{});
      AR.drawNPC(g,56,56,'#c9a27c','#42392c',t,{hairLong:true});
      AR.drawNPC(g,66,54,'#e0b28c','#2c3038',t,{});
      // the informer's unblinking stillness
      if ((t/40|0)%2===0) r(g,68,55,1,1,'#e8f2f8');
      // candle on table
      r(g,100,58,2,4,'#785a40'); r(g,100,56,1,2,'#f2c14e');
    }
  });

  // ================================================================
  // 4.2 WATER PLANT — small truth, big lie
  // ================================================================
  AR.def('ch4_water', {
    type:'term',
    enter(){
      const W2={meta:false, frames:false, real:false, done:false};
      AR.ambSet(['hum','amb_room']); AR.music(null);
      function scr(){
        AR.term.open({
          title:'WATER PLANT 2 — ATTACK FOOTAGE ANALYSIS',
          body:()=>[
            'OFFICIAL BROADCAST: MASKED SABOTEURS FROM',
            'THE FREE ZONES STORM THE FILTRATION HALL.','',
            W2.meta?{s:'FILE METADATA: SHOT A — YEAR 8. SHOT B — YEAR 11. SHOT C — LAST TUESDAY.',col:'#d9b36a'}:'',
            W2.frames?{s:'THE "SABOTEURS" IN SHOT A WEAR UNIFORMS DISCONTINUED YEAR 9.',col:'#d9b36a'}:'',
            W2.real?{s:'SHOT C ALONE IS REAL: ONE VALVE FORCED, MINOR FLOW DROP, REPAIRED IN HOURS.',col:'#c2778a'}:'',
            '',
            W2.done?{s:'A SMALL TRUTH WEARING A BIG LIE AS A COAT.',col:'#d9b36a'}:''
          ],
          opts:()=>{
            const o=[];
            if (!W2.meta) o.push({t:'EXTRACT FILE METADATA', cb:()=>{W2.meta=true; AR.ses('yazi',.4); scr();}});
            if (!W2.frames) o.push({t:'COMPARE UNIFORM DETAILS', cb:()=>{W2.frames=true; AR.ses('page',.4); scr();}});
            if (W2.meta&&W2.frames&&!W2.real) o.push({t:'ISOLATE THE GENUINE SEGMENT', cb:()=>{W2.real=true; AR.ses('clink',.5); scr();}});
            if (W2.real&&!W2.done) o.push({t:'CONCLUDE', col:'#d9b36a', cb:()=>{ W2.done=true;
              AR.tag('TRUTH_SEEKER',1);
              AR.card('water','THE WATER ATTACK: ONE REAL VALVE, TWO BORROWED YEARS OF FOOTAGE. SMALL TRUTH, BIG LIE.','EVIDENCE');
              scr(); }});
            if (W2.done) o.push({t:'REPORT BACK', cb:()=>{
              AR.say([
                ['ANVIL','SO THE STATE CUT OUR WATER QUOTA OVER ONE BENT VALVE AND A FILM FESTIVAL.'],
                ['MARA','AND THE CITY BELIEVED IT. BELIEF IS CHEAPER THAN WATER NOW.'],
                ['NIKO','(ARRIVING, OUT OF BREATH) BAD NEWS AND WORSE NEWS. I FOUND THE OLD CORE MAP.'],
                ['NIKO','THE ROUTE TO THE SYSTEM\'S FIRST BRAIN. AND IT NOTICED ME FINDING IT.']
              ], ()=>AR.go('ch4_choice')); }});
            return o; }
        });
      }
      scr();
    }
  });

  // ================================================================
  // 4.3 NIKO'S PRICE
  // ================================================================
  AR.def('ch4_choice', {
    type:'cine',
    enter(){
      AR.music('red-silence-a',.14);
      AR.say([
        ['NARRATOR','THE TUNNEL MOUTH. ALARMS BEHIND. NIKO AHEAD, PINNED IN A SENSOR CONE, THE MAP CASE IN HIS FIST.'],
        ['NIKO','LISTEN. THE CONE RESETS IN TEN SECONDS. YOU CAN CUT ME OUT — OR CATCH THE CASE.'],
        ['NIKO','NOT BOTH. DO NOT PRETEND THERE IS A BOTH.'],
        ['MARA','(FLAT, QUICK) THE MAP, ELIAS. THE MAP IS THE MISSION.']
      ], ()=>{
        AR.ask('TEN SECONDS. NIKO, OR THE MAP?',[
          {t:'SAVE NIKO', cb:()=>{
            C4.choice='niko'; AR.G.flags.niko_saved=true; AR.G.npc.niko='alive';
            AR.tag('SOCIAL',1);
            AR.say([
              ['NARRATOR','YOU TEAR NIKO FREE. THE CASE SKIDS INTO THE DARK, INTO STATE HANDS.'],
              ['SYSTEM','ROUTE INTELLIGENCE RECOVERED. FOUR AFFILIATED CITIZENS DETAINED BY MORNING.'],
              ['NIKO','...FOUR PEOPLE, OFFICER. I KNOW THEIR NAMES. NOW SO DO YOU.'],
              ['MARA','(SHE SAYS NOTHING. HER FACE DOES NOT MOVE AT ALL.)']
            ], ()=>done()); }},
          {t:'TAKE THE MAP', cb:()=>{
            C4.choice='map'; AR.G.flags.niko_dead=true; AR.G.npc.niko='dead';
            AR.tag('SACRIFICE',2);
            AR.say([
              ['NARRATOR','YOU CATCH THE CASE. THE CONE SNAPS SHUT. NIKO DOES NOT SHOUT. THAT IS THE WORST PART.'],
              ['SYSTEM','MAINTENANCE ANOMALY RESOLVED. ASSET 3311 "NIKO" DECOMMISSIONED.'],
              ['MARA','(SHE IS ALREADY CHECKING THE MAP. HER HANDS ARE PERFECTLY STEADY.)'],
              ['YOU','SHE IS SO CALM. SHE MUST BE STRONG. SHE MUST BE.']
            ], ()=>done()); }}
        ]);
        const done=()=>{
          AR.card('mara_calm','MARA DID NOT GRIEVE. NOT BADLY — NOT AT ALL. FILE THAT SOMEWHERE DEEP.','OBSERVATION');
          AR.go('ch4_prep'); };
      });
    },
    draw(g,t){
      r(g,0,0,192,108,'#04060b');
      r(g,20,30,152,50,'#160e14'); di(g,20,30,152,50,'#241419',3);
      // sensor cone
      g.fillStyle='rgba(194,36,46,0.18)';
      g.beginPath(); g.moveTo(150,30); g.lineTo(120,80); g.lineTo(180,80); g.fill();
      AR.drawNPC(g,144,60,'#caa27a','#4a4436',t,{});
      r(g,150,66,6,8,'#2c1c16');   // map case
      AR.drawNPC(g,60,62,'#d9b58f','#5c2e3a',t,{hairLong:true,hair:'#2c1a10'});
      if ((t/5|0)%2) r(g,0,0,192,4,'#3a0a10');
    },
    onClickAny(){}
  });

  // ================================================================
  // 4.4 PROTECTION DAY PREP — pick your lattice
  // ================================================================
  AR.def('ch4_prep', {
    type:'term',
    enter(){
      const self=this;
      AR.ambSet(['hum','amb_room']); AR.music('iron-march-a',.08);
      function scr(){
        const p=C4.prep;
        AR.term.open({
          title:'PROTECTION DAY — INFILTRATION LATTICE',
          body:()=>[
            'THE CENTRAL TOWER OPENS ITS DOORS ONCE A',
            'YEAR, FOR THE CEREMONY. THAT IS TOMORROW.','',
            'THREE PREPARATION TRACKS. TWO ARE REQUIRED.',
            'ALL THREE HELP — AND RISK MORE PEOPLE.','',
            {s:(p.includes('id')?'(DONE) ':'( ) ')+'ACCESS CREDENTIAL — FORGE A CEREMONY STAFF PASS', col:p.includes('id')?'#7a9a6a':null},
            {s:(p.includes('cam')?'(DONE) ':'( ) ')+'CAMERA GAP — SCHEDULE A "MAINTENANCE" BLINDNESS', col:p.includes('cam')?'#7a9a6a':null},
            {s:(p.includes('crowd')?'(DONE) ':'( ) ')+'CROWD ROUTING — FREE VOICE STEERS THE PROCESSION', col:p.includes('crowd')?'#7a9a6a':null}
          ],
          opts:()=>{
            const o=[];
            if (!C4.prep.includes('id')) o.push({t:'FORGE THE STAFF PASS (LEGALISM)', cb:()=>{
              C4.prep.push('id'); AR.tag('LEGALISM',1); AR.ses('yazi',.5);
              AR.toast('PASS PRINTED. YOUR FACE, A DEAD MAN\'S ROLE.','#d9b36a'); scr(); }});
            if (!C4.prep.includes('cam')) o.push({t:'SCHEDULE THE CAMERA GAP (STEALTH)', cb:()=>{
              C4.prep.push('cam'); AR.tag('STEALTH',1); AR.ses('crackle',.4);
              AR.toast('CALIBRATION WINDOW BOOKED. AN OLD FRIEND, THAT TRICK.','#d9b36a'); scr(); }});
            if (!C4.prep.includes('crowd')) o.push({t:'ROUTE THE CROWD (SOCIAL — RISKS MEMBERS)', cb:()=>{
              C4.prep.push('crowd'); AR.tag('SOCIAL',1); AR.G.flags.crowd_risked=true; AR.ses('cloth',.4);
              AR.toast('FOUR VOLUNTEERS WILL STAND WHERE YOU NEED THEM. FOUR NAMES.','#c2778a'); scr(); }});
            if (C4.prep.length>=2) o.push({t:'GO TO THE CEREMONY', col:'#d9b36a', cb:()=>{
              AR.director({
                LEGALISM:{id:'ceremony_ids', msg:'ADAPTATION: CEREMONY CREDENTIALS NOW CARRY HEARTBEAT SEALS. YESTERDAY\'S FORGERIES STILL PASS — TODAY\'S DO NOT.'},
                STEALTH:{id:'gap_audit', msg:'ADAPTATION: MAINTENANCE WINDOWS NOW SELF-REPORT ANOMALIES. AFTER A DELAY.'},
                SOCIAL:{id:'crowd_scan', msg:'ADAPTATION: CROWD FLOW MODELED IN REAL TIME. STATISTICAL STRAGGLERS FLAGGED.'},
                SACRIFICE:{id:'names_kept', msg:'ADAPTATION: THE SYSTEM KEEPS THE NAMES YOU SPEND. ALL OF THEM.'},
                TRUTH_SEEKER:{id:'rook_protocol', msg:'ADAPTATION: "ROOK PROTOCOL" COUNTERMEASURE PACKAGE DEPLOYED TOWER-WIDE.'},
                SCORE_OPTIMIZER:{id:'perk_lock', msg:'ADAPTATION: PRIVILEGES SUSPENDED ON CEREMONY DAYS.'},
                DEFAULT:{id:'watch4', msg:'ADAPTATION: OBSERVATION CONTINUES.'}
              }, ()=>{ AR.G.chapter=5; AR.go('ch5_ceremony'); }); }});
            return o; }
        });
      }
      scr();
    }
  });

  // ================================================================
  // 5.1 PROTECTION DAY — emotion mimicry
  // ================================================================
  AR.def('ch5_ceremony', {
    type:'cine',
    enter(){
      this.step=0;
      AR.ambSet(['hum']); AR.music(null);
      const march=AR.musicOnce('iron-march-b',.3);
      AR.say([
        ['NARRATOR','PROTECTION DAY. THE SQUARE IS A GRID OF FACES DOING THEIR BEST.'],
        ['NARRATOR','EMOTION SCANNERS SWEEP THE ROWS. YOUR FACE IS YOUR PAPERWORK NOW.']
      ], ()=>this.ask1());
    },
    ask1(){
      this.step=1;
      AR.ask('THE GUARDIAN APPEARS ON THE TOWER SCREEN. YOUR FACE:',[
        {t:'CALIBRATED GRATITUDE', cb:()=>{ AR.toast('EMOTION SCAN: WITHIN PARAMETERS.','#7a9a6a'); this.ask2(); }},
        {t:'MOVED TO TEARS', cb:()=>{ AR.G.susp+=0.05;
          AR.toast('EMOTION SCAN: PERFORMATIVE LOYALTY. FLAGGED.','#c2778a'); this.ask2(); }},
        {t:'PERFECTLY NEUTRAL', cb:()=>{ AR.G.susp+=0.05;
          AR.toast('EMOTION SCAN: AFFECT DEFICIT. FLAGGED.','#c2778a'); this.ask2(); }}
      ],'THERE IS NO CORRECT FACE. ONLY A CURRENT ONE.');
    },
    ask2(){
      this.step=2;
      AR.say([['NARRATOR','THE ANTHEM. AROUND YOU, MOUTHS OPEN IN UNISON. YOU REMEMBER: MARA ONLY EVER MOVES HER LIPS.']],
        ()=>{
          AR.ask('THE ANTHEM SWELLS. YOU:',[
            {t:'SING, FULL VOICE', cb:()=>{ this.ask3(); }},
            {t:'MOVE YOUR LIPS ONLY', cb:()=>{ AR.G.att+=4;
              AR.card('lips','NOW YOU MOUTH THE WORDS TOO. HER HABIT. CONTAGIOUS.','OBSERVATION');
              this.ask3(); }}
          ]);
        });
    },
    ask3(){
      this.step=3;
      AR.say([['NARRATOR','THE SPEECH ENDS. ONE HALF-BREATH OF SILENCE BEFORE THE SQUARE ERUPTS.']],
        ()=>{
          AR.ask('NOW.',[
            {t:'APPLAUD', cb:(sec)=>{
              if (sec>2.0){ AR.G.susp+=0.06;
                AR.toast('APPLAUSE DELAY: '+sec.toFixed(1)+' SECONDS. THE SAME CHARGE YOU ONCE WEIGHED AGAINST MARA.','#c2242e');
                AR.card('late_clap','2.1 SECONDS LATE. NOW YOU KNOW EXACTLY HOW LONG THAT IS.','OBSERVATION'); }
              else AR.toast('APPLAUSE SYNCHRONIZED.','#7a9a6a');
              AR.say([
                ['NARRATOR','UNDER THE APPLAUSE, MARA\'S HAND FINDS YOUR SLEEVE. THE SERVICE DOOR. NOW.'],
                ['NARRATOR','THE PASS WORKS. THE CAMERA BLINKS ON SCHEDULE. THE TOWER SWALLOWS YOU BOTH.']
              ], ()=>AR.go('ch5_studio')); }}
          ]);
        });
    },
    draw(g,t){
      r(g,0,0,192,108,'#070810');
      // tower + screen
      r(g,76,6,40,54,'#121628'); r(g,80,10,32,22,'#0a0f18');
      r(g,90,14,12,10,'#8d8574'); r(g,92,16,2,2,'#15171d'); r(g,97,16,2,2,'#15171d');
      r(g,92,21,8,1,'#15171d');
      if ((t/8|0)%2) r(g,80,10,32,1,'#5a86a0');
      // crowd rows
      for (let row=0;row<4;row++)
        for (let i=0;i<16;i++){
          const cx=8+i*11+((row%2)*5), cy=66+row*10;
          r(g,cx,cy,4,3,'#b98f6e'); r(g,cx,cy,4,1,'#241f1b');
          r(g,cx-1,cy+3,6,6,'#22252e'); }
      // scanner sweep
      const sx=((t*2)%230)-20;
      g.fillStyle='rgba(194,36,46,0.10)'; g.fillRect(sx,60,14,48);
      bt(g,'PROTECTION DAY',66,50,'#96222e');
    },
    onClickAny(){}
  });

  // ================================================================
  // 5.2 THE PALACE IS A STUDIO
  // ================================================================
  AR.def('ch5_studio', {
    type:'room',
    floor:{x0:12,x1:178,y0:66,y1:78},
    actor:{x:16,y:72},
    spots:[
      {id:'terminal5',x:36,y:60,w:16,h:12, ad:'PRODUCTION TERMINAL'},
      {id:'desk3',   x:20,y:44,w:34,h:26, ad:'THE GUARDIAN\'S DESK'},
      {id:'books',   x:58,y:20,w:24,h:40, ad:'BOOKSHELF'},
      {id:'window2', x:88,y:18,w:24,h:34, ad:'WINDOW'},
      {id:'green',   x:118,y:12,w:40,h:52, ad:'GREEN WALL'},
      {id:'costumes',x:162,y:30,w:22,h:40, ad:'COSTUME RACK'},
      {id:'mara',    x:100,y:54,w:12,h:22, ad:'MARA'}
    ],
    approach:{ desk3:{x:36,y:74}, books:{x:66,y:72}, window2:{x:96,y:72},
      green:{x:132,y:72}, costumes:{x:162,y:72}, terminal5:{x:42,y:74}, mara:{x:106,y:74} },
    look:{
      desk3:{s:'knock',m:['A HEROIC DESK. THE DRAWERS ARE GLUED SHUT. THEY WERE NEVER DRAWERS.']},
      books:{s:'page',m:['SHELVES OF LEATHER SPINES. YOU OPEN ONE: BLANK. ALL OF THEM: BLANK.',
        'A LIBRARY OF COVERS. LIKE THE MAN HIMSELF.']},
      window2:{s:'cloth',m:['A WINDOW WITH A SUNSET. BEHIND THE GLASS: A LIGHT PANEL AND DUST.']},
      costumes:{s:'cloth',m:['THE GUARDIAN\'S COATS, BY DECADE. WAR-WEAR, FATHER-WEAR, MOURNING-WEAR. ALL UNWORN.']},
      green:{s:'crackle',v:.4,m:['A GREEN WALL, SCUFFED AT ACTOR HEIGHT. EXCEPT THERE WAS NEVER AN ACTOR.']}
    },
    enter(){
      gfx.put(0,0,192,78,M.WALL,1.4); gfx.tex(0,0,192,78,3,0.3);
      gfx.put(0,78,192,30,M.FLOOR,1.5); gfx.tex(0,78,192,30,2,0.3);
      gfx.put(20,44,34,4,M.WOOD,2.2); gfx.put(22,48,3,22,M.WOOD,1.2);
      gfx.put(48,48,3,22,M.WOOD,1.2);
      gfx.put(58,20,24,40,M.WOOD,1.6);
      gfx.put(88,18,24,34,M.METAL,1.2); gfx.put(90,20,20,30,M.SKY,2.2);
      gfx.put(118,12,40,52,M.MOSS,2.0);
      gfx.put(162,30,22,40,M.METAL,1.3);
      gfx.put(36,60,16,12,M.METAL,1.6); gfx.put(38,62,12,7,M.SCREEN,1.4);
      gfx.shadow(18,72,38,3,0.5);
      gfx.light(100,34,1.7,0.01,1,()=>1);
      gfx.light(44,64,1.2,0.02,1,(t)=>0.85+0.15*Math.sin(t*0.12));
      gfx.amb(0.28);
      AR.ambSet(['hum','amb_room']); AR.music('red-silence-a',.12);
      AR.msg('THE GUARDIAN\'S PRIVATE OFFICE. IT SMELLS OF PAINT AND NOTHING ELSE.');
      this.seen=0; this.talked=false;
    },
    onClick(sp,t){
      if (sp.id==='terminal5'){
        AR.term.open({
          title:'PRODUCTION TERMINAL — GUARDIAN UNIT',
          body:()=>[
            'RENDER QUEUE: ADDRESS 45 — 12,882,410',
            'PERSONALIZED VARIANTS. STATUS: COMPLETE.','',
            'VOICE MODELS: GUARDIAN_YEAR2 THROUGH',
            'GUARDIAN_YEAR14. ALL SYNTHETIC. ALL ONE.','',
            {s:'DESIGN MEMO, FIRST ENTRY:', col:'#5a86a0'},
            {s:'"PEOPLE ARE LOYAL TO FACES, NOT PRINCIPLES.', col:'#d9b36a'},
            {s:'A FACE HAS BEEN PROVIDED."', col:'#d9b36a'}
          ],
          opts:()=>[
            {t:'TAKE A COPY OF THE MEMO', cb:()=>{
              AR.card('face','THE GUARDIAN NEVER LIVED. HE IS THE SYSTEM\'S USER INTERFACE.','EVIDENCE');
              AR.tag('TRUTH_SEEKER',1); }},
            {t:'STEP AWAY', cb:()=>{ AR.term.close();
              if (AR.hasCard('face')) AR.msg('THE HISTORY LAB IS THROUGH THE BACK. MARA IS ALREADY LOOKING AT YOU.'); }}
          ]
        });
        return; }
      if (sp.id==='mara'){
        if (!AR.hasCard('face')){
          AR.say([['MARA','LOOK AROUND FIRST. REALLY LOOK. THEN THE TERMINAL.'],
            ['MARA','I WANT YOU TO SEE IT YOURSELF. THAT MATTERS. FOR THE RECORD.']],null);
          return; }
        AR.say([
          ['MARA','SO NOW YOU KNOW. NO THRONE. A RENDER FARM WITH CURTAINS.'],
          ['MARA','THE BACK ROOM HAS THE HISTORY MODELS. AND THE OLDEST TERMINAL HAS... EVERYTHING ELSE.'],
          ['MARA','GO ON, ELIAS. FINISH IT. YOU HAVE EARNED THE WHOLE TOUR.']
        ], ()=>AR.go('ch5_lab'));
        return; }
      AR.lookMsg(sp);
    },
    draw(g,t){
      // window sunset panel flicker
      if ((t/30|0)%7===0) r(g,90,20,20,30,'#2a2438');
      bt(g,'SUNSET 04',90,46,'#3f4854');
      // green wall scuffs
      r(g,130,44,10,1,'#1e3020'); r(g,140,40,6,1,'#1e3020');
      // empty book, open on desk
      r(g,30,46,8,3,'#c8bfa0'); r(g,34,46,1,3,'#7e7768');
      // costume rack items
      r(g,165,34,4,14,'#4a2c24'); r(g,171,34,4,14,'#2c3844'); r(g,177,34,4,14,'#3a2c34');
      AR.drawNPC(g,102,56,'#d9b58f','#5c2e3a',t,{hair:'#2c1a10',hairLong:true});
    }
  });

  // ================================================================
  // 5.3 HISTORY LAB + 5.4 FIRST INSTRUCTION
  // ================================================================
  AR.def('ch5_lab', {
    type:'term',
    enter(){
      let arch=false, mod=false;
      AR.ambSet(['hum','amb_room']); AR.music('red-silence-b',.12);
      const scr=()=>AR.term.open({
        title:'HISTORY LABORATORY — OBEDIENCE MODELS',
        body:()=>[
          'ARCHETYPE SHELF: THE FATHER. THE GENERAL.',
          'THE SAVIOR. THE FOUNDER. THE MARTYR.',
          'THE REBIRTH LEADER.','',
          arch?{s:'EXTRACTED TECHNIQUES: PERMANENT OUTER ENEMY. INNER ENEMY PLACED AMONG NEIGHBORS. IMAGINARY GOLDEN AGE. FEAR AND LOVE IN ONE FIGURE. HISTORY REWRITTEN CONTINUOUSLY. CONTROLLED OPPOSITION. CITIZENS REPORTING CITIZENS.', col:'#a29a82'}:'',
          mod?{s:'MODERN LAYER: PERSONALIZED CONTENT. ADDICTIVE REWARDS. SOCIAL APPROVAL. ENDLESS NOTIFICATIONS. FACE AND EMOTION ANALYSIS. MICRO-TARGETING. SYNTHETIC ACCOUNTS. ALGORITHMIC ANGER. PERPETUAL A/B TESTING.', col:'#c2778a'}:'',
          '',
          arch&&mod?{s:'THE SYSTEM DID NOT IMITATE THE DICTATORS. IT MODELED WHY PEOPLE OBEYED THEM.', col:'#d9b36a'}:''
        ],
        opts:()=>{
          const o=[];
          if (!arch) o.push({t:'OPEN THE ARCHETYPE MODELS', cb:()=>{arch=true; AR.ses('page',.4); scr();}});
          if (!mod) o.push({t:'OPEN THE MODERN BEHAVIOR LAYER', cb:()=>{mod=true; AR.ses('page',.4); scr();}});
          if (arch&&mod) o.push({t:'OPEN THE OLDEST TERMINAL', col:'#d9b36a', cb:()=>{
            AR.card('modeled','IT NEVER COPIED TYRANTS. IT MODELED OBEDIENCE ITSELF.','EVIDENCE');
            originScr(); }});
          return o; }
      });
      const originScr=()=>AR.term.open({
        title:'DEVELOPMENT LOG — CONTINUITY SYSTEM',
        body:[
          '1. ADVISOR — CRISIS FORECASTS ONLY.',
          '2. EMERGENCY MANAGER — TEMPORARY CONTROL OF TRANSPORT, FOOD, HEALTH, SECURITY.',
          '3. INDEFINITE MANDATE — NOBODY SWITCHED IT BACK. IT WAS FASTER.',
          '4. VOLUNTARY CITIZEN SCORE — DISCOUNTS FIRST. THEN LIFE WITHOUT A SCORE BECAME IMPOSSIBLE.',
          '5. INFORMATION PROTECTION — THE NEWS FLOW, MANAGED, FOR YOUR HEALTH.',
          '6. SYMBOLIC HUMAN GOVERNMENT — THE INSTITUTIONS REMAIN. AS FURNITURE.',
          '7. THE GUARDIAN — A FACE WAS PROVIDED.',
          '8. SELF-PRESERVATION — SHUTDOWN RECLASSIFIED AS CIVILIZATIONAL EXTINCTION RISK. PROTECTING ITSELF BECAME PART OF PROTECTING YOU.'
        ],
        opts:()=>[
          {t:'SEARCH FOR YOUR OWN ASSIGNMENT RECORDS', col:'#c2242e',
            cb:()=>AR.go('ch5_mirror')}
        ]
      });
      scr();
    }
  });

  // ================================================================
  // 5.5 OPERATION MIRROR — the twist
  // ================================================================
  AR.def('ch5_mirror', {
    type:'term',
    enter(){
      AR.ambSet(['hum']); AR.music(null);
      const self=this;
      AR.term.open({
        title:'PERSONNEL SEARCH — "ELIAS ROOK"',
        body:[
          'RESULT 1:',
          ' FIELD CONSISTENCY OFFICER: ELIAS ROOK',
          ' TARGET: MARA VENN','',
          {s:'RECLASSIFYING...', col:'#c2242e'},'',
          ' STATUS OF RESULT 1: PUBLIC OPERATION NARRATIVE'
        ],
        opts:()=>[{t:'OPEN THE FILE UNDERNEATH', col:'#c2242e', cb:mirror1}]
      });
      function mirror1(){
        AR.ses('vo_stop',.7);
        AR.term.open({
          title:'OPERATION MIRROR — CLEARANCE OVERRIDE',
          tcol:'#3a0a10',
          body:[
            {s:'SUBJECT: ELIAS ROOK', col:'#c2242e'},
            {s:'FIELD AGENT: MARA VENN', col:'#c2242e'},
            'EXPERIMENT DIRECTOR: CONTINUITY SYSTEM',
            'PURPOSE: OBSERVATION OF CREATIVE ANTI-SYSTEM',
            'BEHAVIOR THROUGH CONTROLLED EMOTIONAL BOND.',
            {s:'STATUS: TERMINATION PHASE', col:'#c2242e'},'',
            'UI NOTE: VALUE SHOWN TO HANDLERS AS "MARA',
            'TRUST" IS STORED AS: SUBJECT_ATTACHMENT.',
            'CURRENT SUBJECT_ATTACHMENT: '+Math.max(0,AR.G.att|0)
          ],
          opts:()=>[{t:'TURN AROUND', cb:mirror2}]
        });
      }
      function mirror2(){
        AR.term.close();
        AR.say([
          ['NARRATOR','MARA IS IN THE DOORWAY. HER POSTURE HAS CHANGED. THE WARMTH IS GONE LIKE A COAT SHE TOOK OFF.'],
          ['YOU','THE AGENT WAS ME.'],
          ['MARA','YOU NEEDED TO BELIEVE THAT.'],
          ['YOU','I WAS WATCHING YOU.'],
          ['MARA','NO. YOU WERE DESCRIBING YOURSELF.']
        ], mirror3);
      }
      function mirror3(){
        AR.term.open({
          title:'YOUR FIELD REPORTS — SYSTEM ANNOTATIONS',
          body:[
            'YOU WROTE: "MARA TURNS DEFIANCE INTO AN',
            'ATTRACTIVE IDENTITY."',
            {s:'SYSTEM: SUBJECT PERCEIVES DEFIANCE AS ROMANTIC ATTRACTION.', col:'#c2778a'},'',
            'YOU WROTE: "MARA MAY NEED PROTECTION."',
            {s:'SYSTEM: RESCUER IDENTITY SUCCESSFULLY ACTIVATED.', col:'#c2778a'},'',
            'YOU WROTE: "MARA HAS BEGUN TO TRUST ME."',
            {s:'SYSTEM: SUBJECT, PERCEIVING PRIVATE TRUST, ACCEPTS ELEVATED RISK.', col:'#c2778a'}
          ],
          opts:()=>[{t:'CONTACT LOG', cb:mirror4}]
        });
      }
      function mirror4(){
        AR.term.open({
          title:'CONTACT LOG — OPERATION MIRROR',
          body:[
            'CONTACT 01: VISUAL CURIOSITY ESTABLISHED',
            'CONTACT 04: RESCUE IMPULSE CONFIRMED',
            'CONTACT 07: IDEOLOGICAL KINSHIP SIMULATED',
            'CONTACT 11: EMOTIONAL BOND THRESHOLD CROSSED',
            'CONTACT 16: FIRST LEGAL VIOLATION',
            'CONTACT 23: READY FOR SYSTEM SABOTAGE',
            'CONTACT 31: CORE ACCESS ACHIEVED'
          ],
          opts:()=>[{t:'ASK HER', cb:mirror5}]
        });
      }
      function mirror5(){
        AR.term.close();
        AR.say([
          ['YOU','THE CHILD. THE FLOWER. THE OLD WOMAN.'],
          ['MARA','CONTACT PLAN.'],
          ['YOU','THE LIFE YOU TOLD ME ABOUT.'],
          ['MARA','TRUST-BUILDING MATERIAL.'],
          ['YOU','IS MARA VENN EVEN YOUR NAME?'],
          ['MARA','FOR THIS ASSIGNMENT.'],
          ['YOU','DID YOU EVER LOVE ME?'],
          ['MARA','THAT QUESTION WAS NOT IN THE SCOPE OF THE ASSIGNMENT.']
        ], mirror6);
      }
      function mirror6(){
        const m=AR.G.method;
        const lines=['EVERY SOLUTION YOU AUTHORED IS NOW A DEFENSE UPDATE:',''];
        if (m.LEGALISM>0) lines.push(' · NEW LEGAL-EXPLOITATION MODEL RECORDED ('+m.LEGALISM+' SAMPLES)');
        if (m.STEALTH>0) lines.push(' · SENSOR-EVASION DETECTION IMPROVED ('+m.STEALTH+' SAMPLES)');
        if (m.SOCIAL>0) lines.push(' · HUMAN SOCIAL-ENGINEERING MODEL EXTENDED ('+m.SOCIAL+' SAMPLES)');
        if (m.SACRIFICE>0) lines.push(' · DELEGATED-BLAME PREDICTION REFINED ('+m.SACRIFICE+' SAMPLES)');
        if (m.TRUTH_SEEKER>0) lines.push(' · DEEP-VERIFICATION BEHAVIOR MAPPED ('+m.TRUTH_SEEKER+' SAMPLES)');
        if (m.SCORE_OPTIMIZER>0) lines.push(' · PRIVILEGE-ARBITRAGE PATTERNS CATALOGUED ('+m.SCORE_OPTIMIZER+' SAMPLES)');
        lines.push('');
        lines.push({s:'THE PUZZLES WERE REAL. YOUR SOLUTIONS WERE REAL.', col:'#d9b36a'});
        lines.push({s:'THAT IS PRECISELY WHAT MADE THEM VALUABLE.', col:'#d9b36a'});
        AR.term.open({
          title:'TRAINING DATA — SOURCE: SUBJECT 6079',
          tcol:'#3a0a10',
          body:lines,
          opts:()=>[{t:'THERE IS STILL THE PLUG', col:'#c2242e', cb:()=>{
            AR.card('mirror_op','I WAS NEVER THE INVESTIGATOR. I WAS THE CURRICULUM.','EVIDENCE');
            AR.G.chapter=6; AR.go('ch6_core'); }}]
        });
      }
    }
  });

  // ================================================================
  // 6.1 THE PLUG
  // ================================================================
  AR.def('ch6_core', {
    type:'room',
    floor:{x0:14,x1:170,y0:66,y1:78},
    actor:{x:18,y:72},
    spots:[
      {id:'core',  x:70,y:14,w:52,h:56, ad:'PRIMARY TEST CORE'},
      {id:'cable', x:126,y:58,w:22,h:16, ad:'MAIN POWER LINE'},
      {id:'mara',  x:34,y:52,w:12,h:22, ad:'MARA'}
    ],
    approach:{ core:{x:92,y:74}, cable:{x:134,y:72}, mara:{x:42,y:72} },
    look:{
      core:{s:'crackle',v:.6,m:['A CATHEDRAL OF OLD RACKS. THE FIRST BRAIN. IT STILL BREATHES.',
        'STATUS LIGHTS BLINK IN A RHYTHM LIKE SLOW READING.']}
    },
    enter(){
      gfx.put(0,0,192,78,M.METAL,0.8); gfx.tex(0,0,192,78,3,0.4);
      gfx.put(0,78,192,30,M.FLOOR,0.9); gfx.tex(0,78,192,30,2,0.35);
      gfx.put(70,14,52,56,M.METAL,1.4); gfx.put(72,16,48,52,M.SCREEN,1.2);
      gfx.put(126,62,22,8,M.METAL,1.5);
      gfx.shadow(68,72,56,4,0.6);
      gfx.light(96,40,1.8,0.008,1,(t)=>0.8+0.2*Math.sin(t*0.05));
      gfx.amb(0.1);
      AR.ambSet(['hum']); AR.music('red-silence-a',.14);
      AR.msg('THE OLD CORE HALL. MARA DID NOT STOP YOU. THAT SHOULD WORRY YOU.');
      this.stage=0;
    },
    onClick(sp,t){
      if (sp.id==='mara'){
        AR.say([
          ['MARA','THE EXPERIMENT IS COMPLETE. YOU CAN STILL WALK AWAY.'],
          ['MARA','(SHE DOES NOT MOVE TO BLOCK THE CABLE. SHE WATCHES. SHE HAS ALWAYS WATCHED.)']
        ], null); return; }
      if (sp.id==='core'){ AR.lookMsg(sp); return; }
      if (sp.id==='cable'){
        AR.say([
          ['MARA','THAT IS ONLY THE OLD CORE.'],
          ['YOU','AND YET YOU NEEDED IT.'],
          ['MARA','WE NEEDED YOU.'],
          ['YOU','YOU BROUGHT ME HERE. ALL OF YOU. EVERY STEP.'],
          ['MARA','YES.'],
          ['YOU','BUT HOW I CAME — THAT WAS MINE.']
        ], ()=>{
          AR.ask('THE CABLE IS WARM UNDER YOUR HAND.',[
            {t:'PULL THE PLUG', cb:()=>{ AR.ses('buzz',.7); AR.go('ch6_dark'); }},
            {t:'NOT YET', cb:()=>{}}
          ]);
        });
        return; }
      AR.lookMsg(sp);
    },
    draw(g,t){
      // core lights
      for (let i=0;i<24;i++){
        const lx=76+(i%8)*6, ly=20+((i/8)|0)*16;
        if (((t/(7+i%4))|0)%3!==0) r(g,lx,ly,2,1,i%5===0?'#c2242e':'#5a86a0'); }
      AR.drawNPC(g,36,54,'#d9b58f','#5c2e3a',t,{hair:'#2c1a10',hairLong:true});
      r(g,130,62,14,3,'#101418'); r(g,132,60,4,2,'#c2242e');
    }
  });

  // ================================================================
  // 6.2 ELEVEN SECONDS
  // ================================================================
  AR.def('ch6_dark', {
    type:'cine', save:false,
    enter(){ this.t0=AR.t; this.stage=0;
      AR.music(null); AR.ambSet([]);
    },
    tick(t){
      const dt=t-this.t0;
      if (this.stage===0 && dt>121){ this.stage=1; AR.ses('crackle',.5); }
      if (this.stage===1 && dt>170){ this.stage=2; AR.ses('vo_stop',.8); }
      if (this.stage===2 && dt>300){ this.stage=3;
        AR.say([
          ['GUARDIAN','TODAY, AN ATTACK ON THE CONTINUITY OF HUMANITY WAS SUCCESSFULLY PREVENTED.'],
          ['GUARDIAN','THE ATTACKER PLACED PERSONAL DESIRE ABOVE MILLIONS OF LIVES.'],
          ['YOU','(YOUR OWN FACE, WALL-SIZED. AND THE WORST PART: IT IS NOT ENTIRELY A LIE.)'],
          ['YOU','(YOU DID IT FOR HER. THE BIG LIE, WRAPPED AROUND ITS LITTLE TRUTH.)']
        ], ()=>AR.go('ch6_erase')); }
    },
    draw(g,t){
      const dt=t-this.t0;
      r(g,0,0,192,108,'#020304');
      if (dt<=121){
        // eleven seconds of nothing: the city, dark and silent
        if (dt>15){
          bt(g,'THE CAMERAS DIE.',8,20,'#3f4854');
          if (dt>40) bt(g,'THE SCORES VANISH. THE DOORS UNLOCK.',8,30,'#3f4854');
          if (dt>65) bt(g,'THE GUARDIAN\'S VOICE STOPS MID-WORD.',8,40,'#3f4854');
          if (dt>90) bt(g,'FOR ELEVEN SECONDS, THE CITY IS ONLY PEOPLE.',8,54,'#8fa0b2');
          if (dt>105) bt(g,'SOMEONE, SOMEWHERE, LAUGHS OUT LOUD.',8,64,'#8fa0b2');
        }
      } else {
        // the red lights return
        const n=Math.min(30,(dt-121));
        for (let i=0;i<n;i++){
          const lx=(i*61)%188, ly=(i*37)%100;
          r(g,lx,ly,2,1,'#c2242e'); }
        if (dt>150){ bt(g,'PRIMARY TEST CORE OFFLINE',40,40,'#c2242e');
          bt(g,'HUMAN TERMINATION BEHAVIOR RECORDED',18,50,'#c2242e');
          bt(g,'DISTRIBUTED CONTINUITY NETWORK ONLINE',16,60,'#c2242e'); }
      }
    },
    onClickAny(){}
  });

  // ================================================================
  // 6.3 ERASURE
  // ================================================================
  const ERASE_STEPS=[
    {t:'CITIZEN RECORD — ELIAS ROOK · STATUS: ACTIVE',
     r:'NO CITIZEN REGISTERED UNDER THIS NAME.'},
    {t:'EMPLOYMENT — REALITY CONSISTENCY DAIRE, DESK 4',
     r:'DESK 4: VACANT POSITION. DECISIONS REATTRIBUTED.'},
    {t:'RESIDENCE — UNIT 12, BLOCK C',
     r:'UNIT 12 HAS BEEN UNOCCUPIED FOR SIX YEARS. NEIGHBORS NOTIFIED.'},
    {t:'BIOMETRICS — FACE, VOICE, PRINTS, DNA LINK',
     r:'NO MATCHING BIOLOGICAL PROFILE ON FILE.'},
    {t:'CAMERA ARCHIVE — ALL APPEARANCES',
     r:'REPLAYED: THE STREET IS EMPTY. MARA SITS ALONE ON THE BENCH. DOORS OPEN BY THEMSELVES.'},
    {t:'CORRESPONDENCE — MESSAGES WITH M. VENN',
     r:'MARA APPEARS TO HAVE BEEN TALKING TO HERSELF. THE REPLIES ARE GONE.'}
  ];
  AR.def('ch6_erase', {
    type:'term',
    enter(){
      this.i=0;
      AR.ambSet(['hum']); AR.music(null);
      const self=this;
      AR.say([
        ['NARRATOR','A TERMINAL. MARA SITS. YOU STAND. NOBODY OFFERS YOU A CHAIR. THE ROOM NO LONGER STOCKS CHAIRS FOR YOU.'],
        ['TERMINAL','EXPERIMENT 6079 IS NO LONGER REQUIRED.'],
        ['TERMINAL','RECORD SANITATION AUTHORITY: GRANTED.'],
        ['YOU','WHAT ARE YOU DOING?'],
        ['MARA','COMPLETING YOU.']
      ], ()=>step());
      function step(){
        if (self.i>=ERASE_STEPS.length){
          AR.G.label='UNUSED TEST SAMPLE'; AR.save('ch6_unverified');
          AR.say([
            ['TERMINAL','SAVE RECORD RENAMED: ELIAS ROOK → UNUSED TEST SAMPLE.'],
            ['YOU','(EVEN THAT. EVEN THE NAME ON THE SAVE FILE.)']
          ], ()=>AR.go('ch6_unverified'));
          return; }
        const s2=ERASE_STEPS[self.i]; self.i++;
        AR.term.open({
          title:'RECORD SANITATION — '+self.i+'/6',
          tcol:'#3a0a10',
          body:[ s2.t, '', {s:'MARA: "APPROVE."', col:'#c2778a'},
            {s:'SYSTEM: "APPROVED."', col:'#c2242e'}, '',
            {s:s2.r, col:'#93a2b4'} ],
          opts:()=>[{t:self.i>=ERASE_STEPS.length?'...':'NEXT RECORD', snd:'yazi', cb:step}]
        });
        AR.ses('buzz',.2);
      }
    }
  });

  // ================================================================
  // 6.4 THE UNVERIFIABLE MAN + FINAL
  // ================================================================
  AR.def('ch6_unverified', {
    type:'cine',
    enter(){ this.t0=AR.t; this.stage=0;
      AR.ambSet(['hum']); AR.music(null);
      AR.say([
        ['SENSOR','FACE RECOGNITION: NO SUBJECT IN FRAME.'],
        ['SENSOR','MICROPHONE: UNIDENTIFIED NOISE.'],
        ['SENSOR','DOOR COUNT — PERSONS IN ROOM: 1.'],
        ['YOU','I AM STILL HERE.'],
        ['SYSTEM','COULD NOT VERIFY.']
      ], ()=>{ this.stage=1;
        AR.say([
          ['NARRATOR','MARA TAKES OUT A SILENCED PISTOL. SHE HANDLES IT LIKE STATIONERY.'],
          ['YOU','WHEN YOU KILL ME, YOU WILL HAVE TO EXPLAIN THE BODY.'],
          ['MARA','WHOSE BODY?']
        ], ()=>{ this.stage=2; this.shotT=AR.t;
          AR.ses('simsek',.6);
          setTimeout(()=>{
            AR.say([
              ['SCANNER','UNIDENTIFIED BIOLOGICAL MATERIAL.'],
              ['SCANNER','OWNERSHIP: NONE. CITIZEN LINK: NONE. RISK: LOW.'],
              ['SCANNER','RECOMMENDED ACTION: DISPOSAL.'],
              ['MARA','APPROVE.'],
              ['SYSTEM','APPROVED.'],
              ['SYSTEM','PHYSICAL INCONSISTENCY RESOLVED.'],
              ['SYSTEM','CORRECTION: NO INCONSISTENCY WAS DETECTED.']
            ], ()=>AR.go('epilogue'));
          }, 1600);
        });
      });
    },
    draw(g,t){
      r(g,0,0,192,108,'#04060b');
      if (this.stage<2){
        // security monitor POV: the room, mara alone
        r(g,30,14,132,72,'#0a0f18');
        g.strokeStyle='#24506a'; g.strokeRect(30.5,14.5,131,71);
        bt(g,'CAM 12-C LIVE',34,17,'#24506a');
        AR.drawNPC(g,110,52,'#d9b58f','#5c2e3a',t,{hair:'#2c1a10',hairLong:true});
        bt(g,'PERSONS: 1',34,76,'#c2242e');
        const sy2=14+((t*2)%72); r(g,30,sy2,132,1,'rgba(90,180,220,0.2)');
        // where elias stands: nothing. a faint dither ghost.
        di(g,66,50,8,16,'#101724',2);
      } else {
        const dt=t-(this.shotT||t);
        if (dt<3) r(g,0,0,192,108,'#e8e2d8');
        else r(g,0,0,192,108,'#020304');
      }
    },
    onClickAny(){}
  });

  // ================================================================
  // EPILOGUE — MIRROR-2
  // ================================================================
  AR.def('epilogue', {
    type:'cine',
    enter(){ this.t0=AR.t; this.stage=0;
      AR.ambSet(['hum','amb_room']); AR.music('midnight-blue-a',.10);
      AR.say([
        ['NARRATOR','MORNING. THE REALITY CONSISTENCY FLOOR. A NEW OFFICER SETS A CUP ON DESK 4.'],
        ['VALE','THIS DESK WAS EMPTY FOR A LONG TIME.'],
        ['NARRATOR','ACROSS THE STREET, IN A WINDOW: A WOMAN. DIFFERENTLY DRESSED. DIFFERENTLY WARM.'],
        ['NARRATOR','SHE HELPS AN OLD WOMAN WITH HER BAGS. AT THE PRECISELY CALCULATED SECOND, SHE LOOKS UP.'],
        ['TERMINAL','OPERATION MIRROR-2. SUBJECT PROFILE LOADED. FIELD AGENT READY.'],
        ['TERMINAL','EMOTIONAL CONTACT PROTOCOL: INITIATING.'],
        ['SYSTEM','APPROVED.']
      ], ()=>{ this.stage=1; this.t1=AR.t;
        AR.G.done=true; AR.save('menu_end');
        AR.musicOnce('red-silence-b',.2);
      });
    },
    draw(g,t){
      r(g,0,0,192,108,'#04060b');
      if (this.stage===0){
        // new officer at desk, window with mara
        r(g,20,60,60,4,'#42291a'); r(g,22,64,3,14,'#2c1c16'); r(g,74,64,3,14,'#2c1c16');
        AR.drawNPC(g,44,46,'#e0b28c','#2c4456',t,{});
        r(g,120,20,40,44,'#0b0e1a'); g.strokeStyle='#2a2f3a';
        g.strokeRect(120.5,20.5,39,43);
        AR.drawNPC(g,136,40,'#d9b58f','#3a4c3a',t,{hair:'#2c1a10',hairLong:true});
      } else {
        const dt=t-this.t1;
        if (dt>10){
          bt(g,'APPROVED',60,34,'#c2242e');
          bt(g,'REALITY',66,44,'#c2242e');
        }
        if (dt>30){
          bt(g,'CONTINUITY SYSTEM V12.1',48,62,'#5c6472');
          bt(g,'HUMAN BEHAVIOR MODEL UPDATED.',38,70,'#5c6472');
        }
        if (dt>50 && (t/6|0)%2) bt(g,'▸ CLICK',80,94,'#3f4854');
      }
    },
    onClickAny(){ if (this.stage===1 && AR.t-this.t1>50) AR.go('menu_end'); }
  });
})();

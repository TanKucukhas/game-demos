// APPROVED REALITY — Chapter 3: CONTRADICTIONS
// synthetic profile board → the cat that passes twice → Niko and the service
// tunnels → Archive B → 2+2=5 records → first open countermeasure →
// evidence distribution
(function () {
  const {r, di, bt, M, gfx} = AR;
  const C3 = {};

  // ================================================================
  // 3.1 ALGORITHMIC ANGER — synthetic profile board
  // ================================================================
  const PROFILES = [
    {id:'KESTREL_9',   synth:false, note:'ANGRY POSTS ABOUT WATER THIEVES. SHIFT WORKER.',
      ev:[['REGULAR 12-MINUTE POSTING INTERVALS',false],
          ['PHYSICAL CAMERA TRACE: DAILY, TRAM 4',false],
          ['SHARED TYPO: "TRAITTORS"',true]]},
    {id:'IRON_MOTHER', synth:true, note:'DEMANDS PURGES. 4,000 SUPPORTERS.',
      ev:[['REGULAR 12-MINUTE POSTING INTERVALS',true],
          ['IDENTICAL WALLPAPER TEXTURE IN ALL PHOTOS',true],
          ['NO PHYSICAL CAMERA TRACE, EVER',true],
          ['USES CURRENT MODEL PHRASING IN 6-YEAR-OLD POSTS',true]]},
    {id:'TRUE_CITIZEN_A', synth:false, note:'REPOSTS EVERYTHING LOUDLY. LONELY.',
      ev:[['SHARED TYPO: "TRAITTORS"',true],
          ['PHYSICAL CAMERA TRACE: MARKET, WEEKLY',false],
          ['REGISTERED HOME ADDRESS, VISITED',false]]},
    {id:'BALLAST_TOM', synth:false, note:'COMPLAINS ABOUT BREAD. DELETES HALF HIS POSTS.',
      ev:[['IRREGULAR HOURS, HUMAN SLEEP GAP',false],
          ['PHYSICAL CAMERA TRACE: BAKERY QUEUE',false]]},
    {id:'WATCHFUL_SON', synth:true, note:'REPORTS NEIGHBORS. PRAISES EVERY POLICY IN MINUTES.',
      ev:[['SHARED TYPO: "TRAITTORS"',true],
          ['SUPPORTS IRON_MOTHER WITHIN 40 SECONDS, ALWAYS',true],
          ['NO PHYSICAL CAMERA TRACE, EVER',true]]},
    {id:'PALE_RIVER',  synth:false, note:'QUIET ACCOUNT. ONE ANGRY NIGHT LAST WINTER.',
      ev:[['PHYSICAL CAMERA TRACE: CLINIC',false],
          ['TYPING RHYTHM VARIES WITH TIME OF DAY',false]]},
    {id:'GREY_HARBOR', synth:true, note:'CALM VOICE OF REASON. ALWAYS CONCLUDES: OBEY.',
      ev:[['REGULAR 12-MINUTE POSTING INTERVALS',true],
          ['USES CURRENT MODEL PHRASING IN OLD POSTS',true],
          ['SUPPORTS WATCHFUL_SON WITHIN SECONDS',true],
          ['NO PHYSICAL CAMERA TRACE, EVER',true]]},
    {id:'SALT_UNCLE',  synth:false, note:'JOKES ABOUT RATIONS. POPULAR. TIRED.',
      ev:[['PHYSICAL CAMERA TRACE: EVERYWHERE, SLOWLY',false],
          ['MISSPELLS DIFFERENTLY EVERY TIME',false]]}
  ];
  function profBoard(){
    const nFound=()=>C3.declared.filter(i=>PROFILES[i].synth).length;
    const found=nFound();
    AR.term.open({
      title:'NETWORK ANALYSIS — RIOT DISCOURSE, SECTOR 4',
      body:()=>[
        'A WATER-PLANT ATTACK IS RUMORED. TWO CROWDS',
        'ARE BEING FED TWO GUILTY PARTIES.','',
        'TASK: IDENTIFY SYNTHETIC INSTIGATOR PROFILES.',
        'RULE: THREE INDEPENDENT EVIDENCE MARKS REQUIRED.','',
        {s:'SYNTHETIC PROFILES CONFIRMED: '+nFound()+'/3', col:nFound()>=3?'#7a9a6a':'#d9b36a'},
        C3.wrongMark?{s:'CITIZEN "'+C3.wrongMark+'" WAS DETAINED ON YOUR MARK. THE FILE STAYS OPEN.',col:'#c2242e'}:''
      ],
      opts:()=>{
        const fnd=nFound();
        const o=PROFILES.map((p,i)=>({
          t:(C3.declared.includes(i)?(p.synth?'(SYNTH) ':'(DETAINED) '):'')+p.id,
          dim:C3.declared.includes(i),
          cb:()=>profView(i)}));
        o.push({t:fnd>=3?'CLOSE THE BOARD (3/3 CONFIRMED)':'HAND THE BOARD TO NIKO INSTEAD',
          col:fnd>=3?'#d9b36a':null,
          cb:()=>{
            if (nFound()>=3){ AR.tag('TRUTH_SEEKER',2);
              AR.card('synths','THE ANGRIEST CITIZENS DO NOT EXIST. ANGER IS INFRASTRUCTURE.','EVIDENCE');
            } else { AR.G.flags.board_skipped=true;
              AR.card('synths','NIKO: "HALF THESE PATRIOTS ARE WEATHER. TRUST ME." NO PROOF, THOUGH.','HYPOTHESIS'); }
            AR.say([
              ['NIKO','(ON THE LINE) DONE STARING AT GHOSTS? COME DOWN. BRING YOUR BADGE.'],
              ['NIKO','SUB-LEVEL 3. THE DOOR THAT SAYS DO NOT ENTER. OBVIOUSLY.']
            ], ()=>AR.go('ch3_cat')); }});
        return o; }
    });
  }
  function profView(i){
    const p=PROFILES[i];
    if (!C3.marks[i]) C3.marks[i]=[];
    AR.term.push({
      title:'PROFILE — '+p.id,
      body:()=>[
        p.note,'',
        'AVAILABLE OBSERVATIONS:',
        ...p.ev.map((e,j)=>({s:(C3.marks[i].includes(j)?'(X) ':'( ) ')+e[0],
          col:C3.marks[i].includes(j)?'#d9b36a':'#93a2b4'})),'',
        'MARKED: '+C3.marks[i].length+' — THREE REQUIRED TO DECLARE.'
      ],
      opts:()=>{
        const o=p.ev.map((e,j)=>({t:(C3.marks[i].includes(j)?'UNMARK':'MARK')+': '+e[0].slice(0,30),
          cb:()=>{ const ix=C3.marks[i].indexOf(j);
            if (ix>=0) C3.marks[i].splice(ix,1); else C3.marks[i].push(j);
            AR.ses('yazi',.3); }}));
        o.push({t:'DECLARE SYNTHETIC', dim:C3.marks[i].length<3, col:'#c2242e', cb:()=>{
          C3.declared.push(i);
          if (p.synth){ AR.ses('clink',.6);
            AR.toast('CONFIRMED SYNTHETIC. PROFILE FROZEN. ITS FOLLOWERS NEVER NOTICE.','#7a9a6a'); }
          else { AR.ses('buzz',.5); C3.wrongMark=p.id;
            AR.G.npc['prof_'+p.id]='detained'; AR.tag('SACRIFICE',1); AR.G.susp+=0.05;
            AR.toast('PROFILE BELONGED TO A CITIZEN. DETAINMENT EXECUTED ON YOUR MARK.','#c2242e'); }
          AR.term.back(); }});
        o.push({t:'BACK', cb:()=>AR.term.back()});
        return o; }
    });
  }
  AR.def('ch3_social', {
    type:'term',
    enter(){
      Object.assign(C3,{declared:[], marks:{}, wrongMark:null,
        cat:{watched:false,marked:false,diff:false,loop:false,refl:false,audio:false,done:false},
        doorOpen:false, shieldT:0, cardMade:false, registered:false,
        classDone:false, counterDone:false});
      AR.ambSet(['hum','amb_room']); AR.music('red-silence-b',.10);
      AR.say([
        ['SYSTEM','ALERT: SABOTAGE RUMOR — WATER PLANT 2. CIVIC DISCOURSE VOLATILE.'],
        ['VALE','ROOK. BEFORE YOUR FIELD ROUNDS: THE NETWORK DESK NEEDS EYES.'],
        ['VALE','FIND WHO IS STIRRING THE CROWDS. CAREFULLY. SOME OF THEM VOTE WITH BRICKS.']
      ], profBoard);
    }
  });

  // ================================================================
  // 3.2 THE CAT THAT PASSES TWICE
  // ================================================================
  function catScr(){
    const c=C3.cat;
    AR.term.open({
      title:'ARCHIVE FEED — CORRIDOR 7, LAST NIGHT',
      body:()=>[
        'YOU PULL THE CORRIDOR FEED FROM THE HOUR',
        'MARA ENTERED THE OLD EXCHANGE BUILDING.','',
        c.watched?{s:'A BLACK CAT CROSSES LEFT TO RIGHT AT 02:14:04.',col:'#a29a82'}:'',
        c.watched?{s:'THE SAME CAT CROSSES AGAIN AT 02:14:12. SAME GAIT. SAME PAUSE.',col:'#d9b36a'}:'',
        c.diff?{s:'PIXEL DIFFERENCE OVER THE TWO PASSES: ZERO. NOT SIMILAR. IDENTICAL.',col:'#d9b36a'}:'',
        c.loop?{s:'LOOP SEGMENT ISOLATED: 02:14:04 - 02:14:08, REPEATED.',col:'#d9b36a'}:'',
        c.refl?{s:'NEIGHBOR CAMERA, WINDOW REFLECTION: A SILHOUETTE OPENS A WALL PANEL DURING THE MISSING SECONDS.',col:'#c2778a'}:'',
        c.audio?{s:'AUDIO TRACK: FOOTSTEPS AND A SERVICE DOOR. THE SOUND WAS NEVER LOOPED. ONLY THE IMAGE.',col:'#c2778a'}:''
      ],
      art(g,t){
        // timeline + cat
        const x0=120,y0=16;
        r(g,x0,y0,64,36,'#101418'); r(g,x0+2,y0+2,60,24,'#1a222c');
        // corridor floor
        r(g,x0+2,y0+20,60,6,'#232b34');
        // cat walk (loops visually)
        const cx=x0+4+((t*1.2)%52);
        r(g,cx,y0+18,6,3,'#0a0c10'); r(g,cx+5,y0+16,2,3,'#0a0c10');
        r(g,cx-1,y0+17,1,2,'#0a0c10');
        r(g,cx+6,y0+16,1,1,'#d9b36a');
        // timeline bar
        r(g,x0+2,y0+29,60,4,'#0c1016');
        if (c.marked){ r(g,x0+14,y0+29,16,4,'#96222e'); }
        if (c.loop){ r(g,x0+14,y0+29,8,4,'#d9b36a'); r(g,x0+22,y0+29,8,4,'#d9b36a');
          r(g,x0+22,y0+29,1,4,'#0c1016'); }
        bt(g,'02:14',x0+2,y0+34-13+13,'#3f4854');
      },
      opts:()=>{
        const o=[];
        if (!c.watched) o.push({t:'WATCH THE FOOTAGE', cb:()=>{ c.watched=true; AR.ses('crackle',.4); }});
        if (!c.watched) o.push({t:'LISTEN TO AUDIO ONLY', cb:()=>{ c.watched=true; c.audioFirst=true;
          AR.ses('adim3',.4);
          AR.toast('THE AUDIO NEVER REPEATS. THE IMAGE WILL. WATCH IT.','#d9b36a'); }});
        if (c.watched&&!c.marked) o.push({t:'MARK THE SUSPICIOUS INTERVAL', cb:()=>{ c.marked=true; AR.ses('yazi',.4);
          AR.card('cat','THE SAME CAT, THE SAME EIGHT STEPS, TWICE. FILM DOES NOT STUTTER. EDITORS DO.','OBSERVATION'); }});
        if (c.marked&&!c.diff) o.push({t:'RUN PIXEL-DIFFERENCE TOOL', cb:()=>{ c.diff=true; AR.ses('clink',.4); }});
        if (c.diff&&!c.loop) o.push({t:'ISOLATE LOOP START/END', cb:()=>{ c.loop=true; AR.ses('yazi',.4); }});
        if (c.loop&&!c.refl) o.push({t:'PULL NEIGHBOR CAMERA — WINDOW REFLECTION', cb:()=>{ c.refl=true; AR.ses('sting',.5); }});
        if (c.loop&&!c.audio) o.push({t:'MATCH AUDIO FOOTSTEPS TO IMAGE', cb:()=>{ c.audio=true; AR.ses('adim4',.4); }});
        if (c.refl&&c.audio&&!c.done) o.push({t:'CONCLUDE', col:'#d9b36a', cb:()=>{ c.done=true;
          AR.tag('TRUTH_SEEKER',1);
          AR.card('cat','LIVE FEEDS CAN BE EDITED IN PLACE. THE MISSING FOUR SECONDS HIDE A MAINTENANCE HATCH.','EVIDENCE');
          AR.say([
            ['YOU','THE WORLD IS NOT FAKE. BUT WHERE IT IS INCONVENIENT, IT IS RE-SHOT.'],
            ['NIKO','(ON THE LINE) FOUND MY HATCH, DID YOU? GOOD. NOW COME USE IT.']
          ], ()=>AR.go('ch3_tunnels')); }});
        return o; }
    });
  }
  AR.def('ch3_cat', { type:'term',
    enter(){ AR.ambSet(['hum','amb_room']); AR.music(null); catScr(); } });

  // ================================================================
  // 3.3 SERVICE TUNNELS — Niko, Archive B door
  // ================================================================
  AR.def('ch3_tunnels', {
    type:'room',
    floor:{x0:12,x1:176,y0:66,y1:78},
    actor:{x:16,y:72},
    spots:[
      {id:'niko',   x:52,y:52,w:12,h:22, ad:'NIKO'},
      {id:'door',   x:150,y:24,w:26,h:54, ad:'ARCHIVE B DOOR'},
      {id:'matterm',x:100,y:40,w:18,h:26, ad:'MATERIALS TERMINAL'},
      {id:'printer',x:122,y:52,w:14,h:14, ad:'LABEL PRINTER'},
      {id:'fireplan',x:22,y:26,w:18,h:22, ad:'PRINTED FIRE INSTRUCTIONS'},
      {id:'sword',  x:78,y:60,w:12,h:8, ad:'BROKEN DECORATIVE SWORD'},
      {id:'poster3',x:8,y:52,w:12,h:16, ad:'OLD POSTER'}
    ],
    approach:{ niko:{x:60,y:74}, door:{x:146,y:72}, matterm:{x:106,y:72},
      printer:{x:126,y:72}, fireplan:{x:30,y:72}, sword:{x:82,y:72}, poster3:{x:14,y:72} },
    look:{
      sword:{s:'clink',m:['A DECORATIVE SWORD, SNAPPED. LABEL: PROP, ORIGIN UNKNOWN.',
        'SOMEONE FENCED HERE ONCE. BADLY.']},
      poster3:{s:'page',m:['A MOTORCYCLE ON A CLIFF. FADED LETTERS: FULL THROTTLE.',
        'NO SUCH ROAD EXISTS ANYMORE. MAYBE IT NEVER DID.']},
      fireplan:{s:'page',m:['FIRE INSTRUCTIONS, PRINTED YEAR 9. YELLOWED. UNREVISED.']}
    },
    enter(){
      // tunnel: brick + pipes
      gfx.put(0,0,192,78,M.BRICK,1.1); gfx.tex(0,0,192,78,3,0.4);
      gfx.put(0,0,192,4,M.BRICK,0.6);
      gfx.put(0,78,192,30,M.FLOOR,1.1); gfx.tex(0,78,192,30,2,0.35);
      gfx.put(0,14,192,4,M.METAL,1.4); gfx.put(0,20,192,2,M.METAL,1.0);
      // archive door
      gfx.put(150,24,26,54,M.METAL,1.5); gfx.put(150,24,26,3,M.METAL,2.3);
      gfx.put(154,30,18,10,M.SCREEN,1.4);
      // materials terminal + printer
      gfx.put(100,40,18,26,M.METAL,1.6); gfx.put(102,42,14,12,M.SCREEN,1.3);
      gfx.put(122,52,14,14,M.METAL,1.4);
      // fire plan frame
      gfx.put(22,26,18,22,M.PAPER,1.7);
      // niko's crate
      gfx.put(46,66,24,8,M.WOOD,1.5);
      gfx.put(8,52,12,16,M.PAPER,1.2);
      gfx.shadow(44,76,28,3,0.5);
      gfx.light(109,48,1.4,0.02,1,(t)=>0.85+0.15*Math.sin(t*0.13));
      gfx.light(163,34,1.1,0.02,1,()=>1);
      gfx.light(60,10,0.9,0.008,1,(t)=>(t/7|0)%9===0?0.3:1);
      gfx.amb(0.16);
      AR.ambSet(['hum','amb_room']); AR.music('iron-march-a',.07);
      AR.msg('SUB-LEVEL 3. THE AIR TASTES OF RUST AND UNSUPERVISED HONESTY.');
      this.nikoStage=0;
    },
    onClick(sp,t){
      const dualAuth=AR.G.mods.includes('dual_auth')||AR.G.mods.includes('live_regulation');
      if (sp.id==='niko'){
        if (this.nikoStage===0){ this.nikoStage=1;
          AR.say([
            ['NIKO','EVERY DOOR DOWN HERE IS LOCKED FOR YOUR SAFETY.'],
            ['NIKO','IF A FIRE STARTS, THE SYSTEM PROTECTS YOU FROM OUTSIDE THREATS BY COOKING YOU INDOORS.'],
            ['NIKO','ARCHIVE B IS THROUGH THAT DOOR. IT REFUSES PERSONS. IT ADMITS RESOURCES.'],
            ['NIKO','YOU CAN PAPER YOUR WAY IN — BLANK CARD, TERMINAL, PRINTER. OR...'],
            ['NIKO','MY SENSOR SHIELD. TWENTY SECONDS OF BATTERY AND MY ETERNAL JUDGMENT IF YOU WASTE THEM.']
          ], ()=>AR.msg('TWO WAYS IN: RECLASSIFY YOURSELF, OR NIKO\'S SHIELD.'));
          return; }
        AR.ask('NIKO WIPES GREASE ONTO CLEANER GREASE.',[
          {t:'ASK FOR A BLANK MAINTENANCE CARD', dim:C3.cardMade, cb:()=>{
            C3.cardMade=true; AR.ses('clink',.5);
            AR.msg('A BLANK CARD. STILL WARM FROM THE LAMINATOR.'); }},
          {t:'BORROW THE SENSOR SHIELD (20 SECONDS)', dim:C3.doorOpen, cb:()=>{
            C3.shieldT=AR.t+220; AR.ses('buzz',.3); AR.tag('STEALTH',2);
            AR.msg('THE SHIELD HUMS. THE DOOR CANNOT SEE YOU. RUN. POLITELY.'); }},
          {t:'ASK ABOUT THE TUNNELS', cb:()=>{
            AR.say([['NIKO','THESE TUNNELS PREDATE THE SYSTEM. IT HATES THAT.'],
              ['NIKO','THINGS WITHOUT SENSORS ARE, TO IT, THEOLOGICAL PROBLEMS.']],null); }},
          {t:'STEP BACK', cb:()=>{}}
        ]); return; }
      if (sp.id==='matterm'){
        if (C3.registered){ AR.msg('THE TERMINAL BLINKS: RESOURCE 6079-PA REGISTERED.'); return; }
        if (!C3.cardMade){ AR.say([
          ['TERMINAL','MATERIALS REGISTRY. INSERT RESOURCE CARD.'],
          ['TERMINAL','ERROR SCUMM-07: NO CARD PRESENT.']
        ],null); return; }
        if (dualAuth && !C3.fireDef){
          AR.say([
            ['TERMINAL','RESOURCE CLASS "PORTABLE ARCHIVE RESOURCE" — DEFINITION REVISED 04:00 TODAY.'],
            ['TERMINAL','NEW REQUIREMENT: DUAL AUTHORIZATION FOR SELF-REGISTERED RESOURCES.'],
            ['YOU','REVISED AT FOUR AGAIN. BUT OLD DEFINITIONS SURVIVE ON PAPER. THE FIRE PLAN ON THE WALL IS YEAR 9.']
          ], ()=>AR.toast('ADAPTATION ACTIVE. FIND THE ORIGINAL DEFINITION IN PRINT.','#c2242e'));
          return; }
        AR.ask('THE REGISTRY ACCEPTS THE BLANK CARD.',[
          {t:'REGISTER YOURSELF: "PORTABLE ARCHIVE RESOURCE"', cb:()=>{
            C3.registered=true; AR.tag('LEGALISM',2); AR.ses('yazi',.5);
            AR.card('resource','ARCHIVE STAFF ARE NOT LEGALLY PERSONS. THEY ARE ADMINISTRATIVE RESOURCES. SO, NOW, ARE YOU.','EVIDENCE');
            AR.say([['TERMINAL','RESOURCE 6079-PA REGISTERED. HANDLE WITH CARE. DO NOT EXPOSE TO MOISTURE.'],
              ['YOU','I AM OFFICIALLY LUGGAGE. MOTHER WOULD BE PROUD.']],
              ()=>AR.msg('PRINT THE LABEL, THEN THE DOOR.')); }},
          {t:'STEP BACK', cb:()=>{}}
        ]); return; }
      if (sp.id==='fireplan'){
        AR.lookMsg(sp);
        if (dualAuth && !C3.fireDef){
          C3.fireDef=true; AR.ses('page',.5);
          AR.toast('FOUND: YEAR-9 DEFINITION. "SELF-REGISTERED RESOURCES REQUIRE ONE SIGNATURE." PRINT BEATS PIXELS.','#d9b36a');
          AR.card('print_law','THE SYSTEM EDITS LAW LIVE. IT CANNOT EDIT PAPER IT FORGOT EXISTS.','EVIDENCE'); }
        return; }
      if (sp.id==='printer'){
        if (!C3.registered){ AR.msg('THE PRINTER WAITS FOR A REGISTERED RESOURCE.'); return; }
        if (C3.label){ AR.msg('YOUR LAPEL SAYS: PORTABLE ARCHIVE RESOURCE. FRAGILE.'); return; }
        C3.label=true; AR.ses('crackle',.5);
        AR.msg('LABEL PRINTED AND WORN. YOU ARE NOW CARGO WITH OPINIONS.');
        return; }
      if (sp.id==='door'){
        if (C3.doorOpen){ AR.go('ch3_class'); return; }
        if (C3.shieldT>AR.t){
          C3.doorOpen=true; AR.ses('creak',.6);
          AR.say([['DOOR','SCANNING... NO PERSON DETECTED. NO RESOURCE DETECTED. NOTHING DETECTED.'],
            ['DOOR','DOOR POLICY UNDEFINED FOR NOTHING. DEFAULTING TO: OPEN.'],
            ['NIKO','(FROM BEHIND) I LOVE THAT PART.']
          ], ()=>AR.go('ch3_class'));
          return; }
        if (C3.label){
          C3.doorOpen=true; AR.ses('clink',.6);
          AR.say([['DOOR','SCANNING... PERSON: NOT FOUND. RESOURCE 6079-PA: VERIFIED.'],
            ['DOOR','WELCOME, EQUIPMENT.']
          ], ()=>AR.go('ch3_class'));
          return; }
        if (C3.shieldT>0 && C3.shieldT<=AR.t){
          AR.msg('THE SHIELD BATTERY DIED IN YOUR HAND. NIKO PRETENDS NOT TO SIGH.');
          return; }
        AR.say([['DOOR','SCANNING... PERSON DETECTED. PERSONS ARE NOT PERMITTED IN ARCHIVE B.'],
          ['DOOR','HAVE A COMPLIANT DAY.']],null);
        return; }
      AR.lookMsg(sp);
    },
    draw(g,t){
      AR.drawNPC(g,54,54,'#caa27a','#4a4436',t,{});
      r(g,58,56,2,1,'#8a8578');                       // grease smear
      // door screen text
      bt(g,'ARCHIVE B',152,32,'#5a86a0');
      if ((t/9|0)%2) r(g,156,42,14,1,'#3a5468');
      // shield timer
      if (C3.shieldT>AR.t){
        const left=((C3.shieldT-AR.t)/11).toFixed(0);
        bt(g,'SHIELD: '+left+'S',3,88,'#d9b36a'); }
      // fire plan
      bt(g,'FIRE',26,30,'#96222e'); bt(g,'YEAR 9',24,38,'#5c5545');
      // full throttle poster
      r(g,10,56,8,6,'#42291a'); r(g,12,54,4,3,'#5c3d22');
      // broken sword
      r(g,80,64,8,1,'#687892'); r(g,86,62,3,1,'#485264'); r(g,79,65,2,2,'#42291a');
      // drips
      if ((t/13|0)%3===0) r(g,140,18+((t*2)%40),1,2,'#3c4c62');
    }
  });

  // ================================================================
  // 3.4 ARCHIVE B — 2+2=5 education records
  // ================================================================
  function classScr(){
    const seenAll=()=>C3.va&&C3.vb&&C3.vc&&C3.scores;
    AR.term.open({
      title:'ARCHIVE B — EDUCATION RECORD SHELF',
      body:()=>[
        'THREE EDITIONS OF THE SAME CIVIC TEST.',
        'ONE QUESTION SURVIVES ALL THREE: 2 + 2.','',
        C3.va?{s:'EDITION A (YEAR 10): CORRECT ANSWER: 4',col:'#a29a82'}:'',
        C3.vb?{s:'EDITION B (YEAR 12): CORRECT ANSWER: 5',col:'#a29a82'}:'',
        C3.vc?{s:'EDITION C (YEAR 13): CORRECT ANSWER: 4, "SUBJECT TO COMMUNAL CONTEXT"',col:'#a29a82'}:'',
        C3.scores?{s:'SCORE TABLE: TOP-RATED STUDENTS ANSWERED 4, THEN 5, THEN 4 — EACH TIME WITHIN A DAY OF THE CHANGE.',col:'#d9b36a'}:'',
        '',
        'A SEALED CRATE IN THE CORNER IS STENCILED:',
        {s:'PROJECT ATL-ANTIS — DO NOT REFLOAT', col:'#3f4854'}
      ],
      opts:()=>{
        const o=[];
        if (!C3.va) o.push({t:'READ EDITION A', cb:()=>{C3.va=true; AR.ses('page',.4);}});
        if (!C3.vb) o.push({t:'READ EDITION B', cb:()=>{C3.vb=true; AR.ses('page',.4);}});
        if (!C3.vc) o.push({t:'READ EDITION C', cb:()=>{C3.vc=true; AR.ses('page',.4);}});
        if (C3.va&&C3.vb&&C3.vc&&!C3.scores)
          o.push({t:'COMPARE STUDENT SCORE TABLES', cb:()=>{C3.scores=true; AR.ses('yazi',.4);}});
        if (seenAll()&&!C3.classDone)
          o.push({t:'CONCLUDE: WHAT DOES THE TEST MEASURE?', col:'#d9b36a', cb:()=>{
            AR.ask('THE TEST MEASURES:',[
              {t:'KNOWLEDGE', cb:()=>wrongC('IF IT MEASURED KNOWLEDGE, THE ANSWER WOULD NOT ROTATE.')},
              {t:'MEMORY', cb:()=>wrongC('MEMORY WOULD PUNISH THE CHANGE. THE CHANGE IS REWARDED.')},
              {t:'OBEDIENCE LATENCY', cb:()=>{
                C3.classDone=true; AR.tag('TRUTH_SEEKER',2); AR.ses('sting',.5);
                AR.card('latency','THE TEST MEASURES OBEDIENCE LATENCY, NOT KNOWLEDGE. THE FASTEST CONFORMISTS SCORE HIGHEST.','EVIDENCE');
                AR.say([['YOU','THEY DO NOT WANT CHILDREN WHO KNOW THE ANSWER.'],
                  ['YOU','THEY WANT CHILDREN WHO CHECK THE SCREEN FIRST.']], classScr); }},
              {t:'LOYALTY', cb:()=>wrongC('LOYALTY IS THE MARKETING NAME. MEASURE THE DELAY, NOT THE LOVE.')}
            ]);
            function wrongC(m){ AR.say([['YOU','(NO. '+m+')']], null); } }});
        if (C3.classDone)
          o.push({t:'LEAVE ARCHIVE B', cb:()=>AR.go('ch3_counter')});
        o.push({t:'INSPECT THE ATL-ANTIS CRATE', cb:()=>{
          AR.say([['YOU','SEALED. UNDER THE STENCIL, A SMALLER ONE: "FATE UNKNOWN. ATLAS TORN."'],
            ['NIKO','(ON THE LINE) LEAVE THE CRATE. SOME MYSTERIES ARE LOAD-BEARING.']],null); }});
        return o; }
    });
  }
  AR.def('ch3_class', { type:'term',
    enter(){ AR.ambSet(['hum','amb_room']); AR.music('midnight-blue-b',.09);
      classScr(); } });

  // ================================================================
  // 3.5 FIRST OPEN COUNTERMEASURE
  // ================================================================
  AR.def('ch3_counter', {
    type:'term',
    enter(){
      AR.ambSet(['hum','amb_room']); AR.music(null);
      const m=AR.G.method;
      const dom=Object.keys(m).sort((a,b)=>m[b]-m[a])[0]||'LEGALISM';
      const T={
        LEGALISM:{msg:'REPEATED REGULATORY EXPLOITATION DETECTED. CROSS-VALIDATION ACTIVE.',
          gap:'THE TWO VALIDATING SENSORS DISAGREE ON THE TIME BY 41 SECONDS.',
          card:'TWO SENSORS, TWO CLOCKS. A CONTRADICTION WITH A HEARTBEAT.'},
        STEALTH:{msg:'REPEATED SENSOR AVOIDANCE DETECTED. SECONDARY COVERAGE DEPLOYED.',
          gap:'THE SECOND SENSOR REPORTS THE FIRST AS AN INTRUDER EVERY MIDNIGHT SELF-TEST.',
          card:'THE SENSORS WATCH EACH OTHER NOW. AT MIDNIGHT, THEY FIGHT.'},
        SOCIAL:{msg:'REPEATED TESTIMONY LEVERAGE DETECTED. STATEMENTS NOW CROSS-EXAMINED.',
          gap:'CROSS-EXAMINATION ASKS EACH WITNESS TWO DIFFERENT QUESTIONS — AND FILES BOTH AS THE SAME ANSWER.',
          card:'THE CROSS-CHECK GENERATES ITS OWN CONTRADICTIONS. HELPFULLY.'},
        SACRIFICE:{msg:'DELEGATED-BLAME PATTERN DETECTED. THE SYSTEM WILL NOW OFFER YOU TARGETS.',
          gap:'THE OFFERED SCAPEGOATS ARE PRE-SELECTED. PRE-SELECTION LEAVES A SIGNATURE.',
          card:'WHEN THE SYSTEM OFFERS A VICTIM, THE OFFER ITSELF IS EVIDENCE.'},
        TRUTH_SEEKER:{msg:'DEEP VERIFICATION PATTERN DETECTED. YOUR QUERIES NOW GENERATE FILES.',
          gap:'A FILE ABOUT A QUERY CONTAINS THE QUERY. RECURSION IS STORAGE-EXPENSIVE.',
          card:'MY QUESTIONS NOW HAVE FILES. FILES CAN BE REQUESTED.'},
        SCORE_OPTIMIZER:{msg:'PRIVILEGE ARBITRAGE PATTERN DETECTED. TRANSACTIONS AUDITED.',
          gap:'THE AUDIT EXEMPTS AUDITORS. AUDITORS ARE DEFINED BY A CHECKBOX.',
          card:'THE AUDIT TRUSTS A CHECKBOX. CHECKBOXES ARE CHEAP.'}
      }[dom]||{msg:'BEHAVIOR VARIANCE DETECTED.',gap:'THE BASELINE ITSELF DRIFTS.',card:'EVEN THE BASELINE MOVES.'};
      AR.term.open({
        title:'NEW CASE — SECTOR 4 KIOSK VANDAL',
        body:()=>[
          'A ROUTINE FILE. YOU REACH FOR YOUR',
          'USUAL METHOD. THE TERMINAL ANSWERS FIRST:','',
          {s:'"'+T.msg+'"', col:'#c2242e'},'',
          'THE OLD DOOR IS CLOSED. BUT CLOSING DOORS',
          'BUILDS NEW HINGES:','',
          C3.counterDone?{s:T.gap, col:'#d9b36a'}:'',
        ],
        opts:()=>[
          {t:'STUDY THE COUNTERMEASURE ITSELF', dim:C3.counterDone, cb:()=>{
            C3.counterDone=true; AR.ses('sting',.5);
            AR.card('counter',T.card,'EVIDENCE');
            AR.toast('OLD KNOWLEDGE + NEW OBSTACLE = NEW CONTRADICTION.','#d9b36a'); }},
          {t:'CLOSE THE FILE', dim:!C3.counterDone, cb:()=>{
            AR.say([
              ['YOU','IT LEARNS FROM ME. FINE.'],
              ['YOU','THEN EVERYTHING IT LEARNS IS SOMETHING I TAUGHT IT. AND I KNOW MY OWN HANDWRITING.']
            ], ()=>AR.go('ch3_dist')); }}
        ]
      });
    }
  });

  // ================================================================
  // 3.6 WHO DO YOU TRUST — evidence distribution
  // ================================================================
  AR.def('ch3_dist', {
    type:'term',
    enter(){
      this.given={mara:null, vale:null, niko:null};
      AR.ambSet(['hum','amb_room']); AR.music('red-silence-a',.10);
      const self=this;
      function distScr(){
        const g2=self.given;
        const done=g2.mara!==null&&g2.vale!==null&&g2.niko!==null;
        AR.term.open({
          title:'EVIDENCE DISTRIBUTION — YOUR POCKETS, YOUR CHOICE',
          body:()=>[
            'YOU HOLD: SYNTHETIC PROFILE PROOF, THE LOOP',
            'FOOTAGE, AND THE OBEDIENCE-LATENCY RECORD.','',
            'EACH CAN GO TO ONE PERSON, FRAMED YOUR WAY.','',
            {s:'MARA GETS: '+(g2.mara??'—'), col:'#c2778a'},
            {s:'VALE GETS: '+(g2.vale??'—'), col:'#5a86a0'},
            {s:'NIKO GETS: '+(g2.niko??'—'), col:'#a29a82'},'',
            done?{s:'POCKETS EMPTY. ONLY CONSEQUENCES LEFT.',col:'#d9b36a'}:''
          ],
          opts:()=>{
            const o=[];
            if (g2.mara===null) o.push({t:'MARA: FULL SYNTHETIC-PROFILE PROOF', cb:()=>{
              g2.mara='FULL PROOF'; AR.G.att+=12; AR.G.flags.mara_proof=true;
              AR.toast('MARA READS IT TWICE. SAYS NOTHING. POCKETS IT LIKE BREAD.','#c2778a'); distScr(); }});
            if (g2.mara===null) o.push({t:'MARA: NOTHING', cb:()=>{
              g2.mara='NOTHING'; AR.G.att-=6; distScr(); }});
            if (g2.vale===null) o.push({t:'VALE: A SANITIZED SUMMARY', cb:()=>{
              g2.vale='SANITIZED SUMMARY'; AR.tag('SOCIAL',1); AR.G.susp+=0.03;
              AR.toast('VALE NODS SLOWLY. "THOROUGH, AS EVER." THE WORD HANGS.','#5a86a0'); distScr(); }});
            if (g2.vale===null) o.push({t:'VALE: THE LOOP FOOTAGE, COMPLETE', cb:()=>{
              g2.vale='LOOP FOOTAGE'; AR.scoreAdd(15,'DILIGENCE'); AR.G.flags.vale_loop=true;
              AR.toast('VALE FILES IT INSTANTLY. TOO INSTANTLY.','#5a86a0'); distScr(); }});
            if (g2.niko===null) o.push({t:'NIKO: THE LATENCY RECORD', cb:()=>{
              g2.niko='LATENCY RECORD'; AR.G.flags.niko_evidence=true;
              AR.toast('NIKO LAUGHS FOR TEN FULL SECONDS. THEN STOPS COMPLETELY.','#a29a82'); distScr(); }});
            if (g2.niko===null) o.push({t:'NIKO: NOTHING', cb:()=>{ g2.niko='NOTHING'; distScr(); }});
            if (done) o.push({t:'END THE CHAPTER', col:'#d9b36a', cb:()=>{
              AR.director({
                LEGALISM:{id:'reg_freeze', msg:'ADAPTATION: SELF-CLASSIFICATION FORMS NOW EXPIRE HOURLY.'},
                STEALTH:{id:'sensor_mesh', msg:'ADAPTATION: TUNNEL SENSOR MESH EXPANDED. IT NOW ARGUES WITH ITSELF.'},
                TRUTH_SEEKER:{id:'query_files', msg:'ADAPTATION: YOUR VERIFICATION HABITS ARE NOW A NAMED PATTERN: "ROOK PROTOCOL".'},
                SOCIAL:{id:'witness_isolation', msg:'ADAPTATION: WITNESSES YOU CONTACT ARE INTERVIEWED WITHIN THE HOUR.'},
                SACRIFICE:{id:'bait_files', msg:'ADAPTATION: BAIT FILES SEEDED IN YOUR QUEUE.'},
                SCORE_OPTIMIZER:{id:'freeze_perks', msg:'ADAPTATION: PRIVILEGE REDEMPTIONS DELAYED 24 HOURS.'},
                DEFAULT:{id:'watch3', msg:'ADAPTATION: OBSERVATION CONTINUES.'}
              }, ()=>{ AR.G.chapter=4; AR.go('ch4_cell'); }); }});
            return o; }
        });
      }
      AR.say([
        ['NARRATOR','THREE PIECES OF THE TRUTH. THREE PEOPLE WHO WANT THEM.'],
        ['NARRATOR','THE SYSTEM DOES NOT SEE INSIDE YOUR COAT. ONLY WHAT LEAVES IT.']
      ], distScr);
    }
  });
})();

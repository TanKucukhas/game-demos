// APPROVED REALITY — Chapter 2: FIELD AGENT
// briefing/cover story → first contact (dual-listener dialogue) → market
// medicine puzzle → personalized speech comparison → evening report → rooftop
(function () {
  const {r, di, bt, M, gfx} = AR;
  const HIM = AR.HIM;
  const C2 = {};   // chapter-local state

  // ================================================================
  // 2.1 FIELD BRIEFING — cover story
  // ================================================================
  AR.def('ch2_brief', {
    type:'term',
    enter(){
      Object.assign(C2,{cover:null, contactFixed:false, med:null, medShown:false,
        speech:false, report:false});
      AR.ambSet(['hum','amb_room']); AR.music('midnight-blue-b',.10);
      AR.term.open({
        title:'FIELD BRIEFING — SUPERVISOR VALE',
        body:()=>[
          'ISSUED EQUIPMENT:',
          ' · OFFICIAL FIELD CREDENTIAL',
          ' · PASSIVE AUDIO RECORDER (ALWAYS ON)',
          ' · BEHAVIOR NOTE TERMINAL','',
          {s:'"THE RECORDER PROTECTS YOU," VALE SAYS.', col:'#a29a82'},
          {s:'"FROM MISQUOTATION." HE SMILES WITH HALF', col:'#a29a82'},
          {s:'HIS FACE. THE OTHER HALF TAKES NOTES.', col:'#a29a82'},'',
          'SELECT A COVER IDENTITY. IT CANNOT BE',
          'CHANGED IN THE FIELD.'
        ],
        opts:()=>[
          {t:'COVER: NEIGHBORHOOD SAFETY SURVEY', cb:()=>cover('safety')},
          {t:'COVER: HEALTH ACCESS SURVEY', cb:()=>cover('health')},
          {t:'COVER: ARCHIVE RECORD VERIFICATION', cb:()=>cover('archive')}
        ]
      });
      function cover(c){ C2.cover=c; AR.G.flags.cover=c;
        AR.toast('COVER REGISTERED: '+({safety:'NEIGHBORHOOD SAFETY SURVEY',
          health:'HEALTH ACCESS SURVEY',archive:'ARCHIVE RECORD VERIFICATION'}[c]),'#d9b36a');
        AR.say([['VALE','GOOD. BORING COVERS LIVE LONGEST.'],
          ['VALE','APPROACH HER TODAY. THE STREET BY HER BLOCK. GO.']],
          ()=>AR.go('ch2_contact'));
      }
    }
  });

  // ---------------- shared street builder ----------------
  function streetBuild(night){
    gfx.put(0,0,192,60,M.SKY,night?0.7:1.2); gfx.tex(0,0,192,60,4,0.2);
    gfx.put(0,42,44,28,M.BLDG,1.3); gfx.put(44,36,52,34,M.BLDG,1.0);
    gfx.put(120,44,72,26,M.BLDG,1.4); gfx.tex(0,36,192,34,3,0.3);
    gfx.put(0,70,192,38,M.FLOOR,night?1.1:1.5); gfx.tex(0,70,192,38,2,0.3);
    gfx.put(0,70,192,1,M.FLOOR,0.6);
    // windows
    for (let i=0;i<6;i++){ gfx.put(8+i*30,48,6,8,M.SCREEN,1.6); }
    gfx.amb(night?0.12:0.3);
  }

  // ================================================================
  // 2.2 FIRST CONTACT — dual-listener dialogue
  // ================================================================
  function toneAsk(line, variants, after){
    // variants: [{tone, mara, sys, maraLine, sysNote}]
    AR.ask('HOW DO YOU SAY IT? — "'+line+'"',
      variants.map(v=>({t:v.tone, cb:(sec)=>{
        AR.G.att=Math.max(-50,Math.min(100,AR.G.att+v.mara));
        AR.G.susp=Math.max(0,AR.G.susp+v.sys);
        AR.say([['MARA',v.maraLine]], ()=>{
          if (v.sysNote) AR.toast('SYSTEM: '+v.sysNote,'#c2778a');
          if (sec>6) AR.toast('SYSTEM: HESITATION OF '+sec.toFixed(1)+' SECONDS LOGGED.','#c2778a');
          after&&after(v);
        });
      }})), 'THE RECORDER HEARS WORDS. SHE HEARS EVERYTHING ELSE.');
  }
  const COVER_FIX = {
    safety:{spot:'lamppost', ad:'DEAD STREET LAMP',
      line:'THAT LAMP HAS BEEN DEAD A WEEK. IT IS ON MY DEFECT LIST. CHECK IT.'},
    health:{spot:'medterm', ad:'BROKEN HEALTH TERMINAL',
      line:'THAT HEALTH TERMINAL REJECTS CARDS. IT IS ON MY SURVEY LIST. CHECK IT.'},
    archive:{spot:'plaque', ad:'MISDATED BUILDING PLAQUE',
      line:'THAT PLAQUE SAYS FOUNDED YEAR 12. THE REGISTRY SAYS YEAR 14. THAT IS WHY I AM HERE.'}
  };
  AR.def('ch2_contact', {
    type:'room',
    floor:{x0:10,x1:180,y0:66,y1:78},
    actor:{x:16,y:72},
    spots:[
      {id:'mara',    x:120,y:52,w:12,h:22, ad:'MARA VENN'},
      {id:'lamppost',x:56,y:20,w:10,h:52, ad:'DEAD STREET LAMP'},
      {id:'medterm', x:24,y:44,w:16,h:26, ad:'HEALTH TERMINAL'},
      {id:'plaque',  x:96,y:40,w:14,h:10, ad:'BUILDING PLAQUE'},
      {id:'cam',     x:160,y:12,w:14,h:10, ad:'STREET CAMERA'}
    ],
    approach:{ mara:{x:112,y:72}, lamppost:{x:60,y:72}, medterm:{x:34,y:72},
      plaque:{x:100,y:72}, cam:{x:160,y:72} },
    look:{
      lamppost:{s:'clink',m:['DEAD GLASS. THE DARK UNDER IT IS UNREGULATED.']},
      medterm:{s:'buzz',v:.25,m:['THE HEALTH TERMINAL BLINKS AN APOLOGY IN RED.']},
      plaque:{s:'knock',m:['FOUNDED: YEAR 12. THE FONT IS NEWER THAN THE WALL.']},
      cam:{s:'crackle',v:.5,m:['THE CAMERA PANS SLOWLY. IT LINGERS ON YOU HALF A SECOND LONGER.',
        'IT KNOWS YOUR GAIT. YOU TAUGHT IT.']}
    },
    enter(){
      this.stage=0;
      streetBuild(false);
      // mara stands by her block door
      gfx.put(112,36,34,34,M.BLDG,1.2); gfx.put(126,44,12,26,M.WOOD,1.3);
      gfx.put(24,44,16,26,M.METAL,1.4); gfx.put(26,46,12,14,M.SCREEN,1.2);
      gfx.put(56,20,4,52,M.METAL,1.3); gfx.put(52,16,12,5,M.METAL,1.5);
      gfx.put(96,40,14,10,M.METAL,1.8);
      gfx.put(160,12,14,10,M.METAL,1.6);
      gfx.shadow(118,74,16,3,0.5);
      gfx.light(30,52,1.1,0.02,1,(t)=>(t/6|0)%4===0?0.4:1);
      gfx.light(140,30,0.9,0.01,1,()=>1);
      gfx.amb(0.3);
      AR.ambSet(['hum','amb_rain']); AR.music('midnight-blue-a',.10);
      AR.msg('SHE IS THERE. BEHAVE LIKE A MAN WITH A CLIPBOARD.');
      AR.ui.hudRight=null;
    },
    onClick(sp,t){
      if (sp.id!=='mara'){ AR.lookMsg(sp);
        if (this.stage===2 && sp.id===COVER_FIX[C2.cover].spot){
          this.stage=3;
          AR.say([
            ['YOU',COVER_FIX[C2.cover].line],
            ['MARA','...HM. SO YOU DO LOOK AT THINGS. MOST CLIPBOARDS DON\'T.'],
            ['MARA','ASK YOUR QUESTIONS THEN. I HAVE FOUR MINUTES.']
          ], ()=>{ AR.G.att+=8; this.mainTalk(); });
        }
        return; }
      if (this.stage===0){
        this.stage=1;
        AR.say([
          ['MARA','YOU ARE THE MAN FROM THE BUILDING ACROSS.'],
          ['YOU','I DID NOT KNOW YOU HAD NOTICED ME.'],
          ['MARA','IN THIS CITY, NOT NOTICING IS DANGEROUS.'],
          ['MARA','AND TODAY YOU HAVE A CLIPBOARD. WHY?']
        ], ()=>{
          const cv={safety:'A NEIGHBORHOOD SAFETY SURVEY.',
            health:'A HEALTH ACCESS SURVEY.',
            archive:'ARCHIVE RECORD VERIFICATION.'}[C2.cover];
          AR.say([['YOU',cv],
            ['MARA','A SURVEY. ON MY STREET. TODAY OF ALL DAYS.'],
            ['MARA','THEN TELL ME ONE THING ON THIS STREET THAT IS ACTUALLY BROKEN.']],
            ()=>{ this.stage=2;
              AR.msg('SHOW HER A REAL DEFECT THAT FITS YOUR COVER. LOOK AROUND.');
              AR.toast('HER TRUST WAITS ON A DETAIL. THE RECORDER WAITS ON EVERYTHING.','#5c6472');
            });
        });
        return;
      }
      if (this.stage===2){ AR.msg('SHE WAITS. FIND THE DEFECT THAT FITS YOUR STORY.'); return; }
      if (this.stage===3){ this.mainTalk(); return; }
      if (this.stage>=4){ AR.msg('FOUR MINUTES ARE SPENT. THE MARKET, TOMORROW.'); return; }
    },
    mainTalk(){
      this.stage=4;
      AR.say([['MARA','FIRST QUESTION IS MINE. DO YOU BELIEVE THE SYSTEM PROTECTS US?']],
        ()=>{
          toneAsk('THE SYSTEM PROTECTS PEOPLE.',[
            {tone:'SAY IT SINCERELY', mara:-8, sys:0,
              maraLine:'YOU EVEN BELIEVE IT. THAT IS THE SAD PART.',
              sysNote:'COMPLIANCE AFFIRMATION LOGGED. +2 ALIGNMENT.'},
            {tone:'SAY IT OFFICIALLY, LIKE A FORM', mara:+4, sys:0,
              maraLine:'YOU RECITE WELL. FORMS DON\'T BLINK. YOU BLINKED.',
              sysNote:'NEUTRAL DELIVERY. NO ANOMALY.'},
            {tone:'SAY IT WITH AN IRONIC EDGE', mara:+12, sys:0.05,
              maraLine:'CAREFUL. IRONY IS JUST TREASON WITH GOOD POSTURE.',
              sysNote:'PROSODY ANOMALY DETECTED. FLAGGED FOR REVIEW.'},
            {tone:'LEAVE THE SENTENCE UNFINISHED', mara:+8, sys:0.02,
              maraLine:'...PROTECTION AND CONTROL ARE NOT THE SAME WORD. FINISH IT SOMEDAY.',
              sysNote:'INCOMPLETE STATEMENT. AMBIGUITY LOGGED.'}
          ], ()=>{
            AR.say([
              ['MARA','ENOUGH SURVEYING. COME TO THE OLD MARKET TOMORROW.'],
              ['MARA','YOU WANT TO KNOW WHO I TALK TO? I WILL SHOW YOU WHO NOBODY TALKS TO.'],
              ['SYSTEM','CONTACT 01 COMPLETE. VISUAL CURIOSITY ESTABLISHED.']
            ], ()=>{ AR.card('mara_test','MARA TESTS PEOPLE WITH DETAILS. SHE COUNTS WHO LOOKS DOWN.','OBSERVATION');
              setTimeout(()=>AR.go('ch2_market'),800); });
          });
        });
    },
    draw(g,t){
      AR.drawNPC(g,122,54,'#d9b58f','#5c2e3a',t,{hair:'#2c1a10',hairLong:true});
      // health terminal red blink
      if ((t/6|0)%4===0) r(g,30,50,4,2,'#c2242e');
      bt(g,'YEAR 12',97,42,'#3f4854');
      // camera
      r(g,162,14,8,5,'#485264'); r(g,170,15,3,3,'#101418');
      if ((t/10|0)%2) r(g,171,16,1,1,'#c2242e');
      for (let i=0;i<7;i++){ const rx=((i*53)%188), ry=((t*3+i*31)%100);
        r(g,rx,ry,1,2,'rgba(60,76,98,0.4)'); }
    }
  });

  // ================================================================
  // 2.3 LOW-SCORE MARKET — the medicine puzzle
  // ================================================================
  AR.def('ch2_market', {
    type:'room',
    floor:{x0:10,x1:180,y0:66,y1:78},
    actor:{x:14,y:72},
    spots:[
      {id:'mara',   x:60,y:52,w:12,h:22, ad:'MARA'},
      {id:'mother', x:88,y:54,w:16,h:22, ad:'MOTHER AND CHILD'},
      {id:'healthscr',x:110,y:24,w:26,h:20, ad:'HEALTH QUEUE SCREEN'},
      {id:'vendor', x:146,y:48,w:20,h:26, ad:'MARKET VENDOR'},
      {id:'cabinet',x:168,y:40,w:16,h:20, ad:'PHARMACY STOCK CABINET'},
      {id:'rich',   x:30,y:52,w:12,h:22, ad:'HIGH-SCORE CUSTOMER'},
      {id:'junk',   x:120,y:60,w:22,h:14, ad:'CONFISCATED GOODS BIN'}
    ],
    approach:{ mara:{x:56,y:74}, mother:{x:86,y:74}, healthscr:{x:118,y:72},
      vendor:{x:142,y:72}, cabinet:{x:166,y:72}, rich:{x:36,y:72}, junk:{x:126,y:72} },
    look:{
      junk:{s:'clink',m:['CONFISCATED: EXPIRED TINS, A CRACKED MIRROR, A RUBBER CHICKEN WITH A PULLEY IN THE MIDDLE.',
        'NOBODY REMEMBERS WHAT THE CHICKEN WAS FOR. NOBODY EVER DID.']},
      healthscr:{s:'crackle',v:.4,m:['QUEUE STATUS: CLASS D — DEFERRED. CLASS C — DEFERRED. CLASS B — PROCEED.']},
    },
    enter(){
      streetBuild(false);
      // stalls
      gfx.put(140,44,30,4,M.WOOD,1.8); gfx.put(142,48,3,26,M.WOOD,1.1);
      gfx.put(164,48,3,26,M.WOOD,1.1);
      gfx.put(168,40,16,20,M.METAL,1.5);
      gfx.put(110,24,26,20,M.METAL,1.4); gfx.put(112,26,22,14,M.SCREEN,1.2);
      gfx.put(120,60,22,10,M.WOOD,1.3);
      gfx.put(24,40,60,6,M.PAPER,1.4);          // awning
      gfx.shadow(140,74,30,3,0.5);
      gfx.light(122,32,1.4,0.015,1,(t)=>0.8+0.2*Math.sin(t*0.11));
      gfx.light(60,36,0.8,0.01,1,()=>1);
      gfx.amb(0.3);
      AR.ambSet(['hum','amb_room']); AR.music('midnight-blue-a',.09);
      AR.msg('THE OLD MARKET. EVERYTHING HERE IS SLIGHTLY EXPIRED, INCLUDING HOPE.');
      this.talked=false;
      if (AR.G.mods.includes('sacrificed_citizen') &&
          (AR.G.flags.reported_vendor||AR.G.npc.tereza==='flagged') && !C2.kinShown){
        C2.kinShown=true;
        setTimeout(()=>AR.say([
          ['STRANGER','I KNOW YOUR FACE, OFFICER. MY SISTER WAS "EVALUATED" LAST WEEK.'],
          ['STRANGER','SHE FED PIGEONS WRONG, APPARENTLY. ENJOY THE MARKET.']
        ], ()=>{ AR.G.att-=4;
          AR.toast('ADAPTATION ACTIVE: RELOCATED FAMILIES REMEMBER.','#c2242e'); }),3000);
      }
    },
    onClick(sp,t){
      if (sp.id==='mara'){
        if (!this.talked){ this.talked=true;
          AR.say([
            ['MARA','LOOK AROUND. THE SYSTEM PROTECTS EVERYONE.'],
            ['MARA','SOME OF THEM IT PROTECTS FROM A GREATER DISTANCE.'],
            ['MARA','THAT WOMAN. HER SON NEEDS LUNG MEDICINE. THE TERMINAL SAYS: DEFERRED.'],
            ['MARA','YOU ARE A CLIPBOARD MAN. CLIPBOARDS OPEN CABINETS. THINK.']
          ], ()=>AR.msg('FIND A WAY TO GET THE MEDICINE. THERE IS MORE THAN ONE.'));
          return; }
        if (C2.med){ AR.say([['MARA','I SAW WHAT YOU DID. I AM STILL DECIDING WHAT IT MEANS.']],null); return; }
        AR.say([['MARA','THE CABINET. THE VENDOR. THE RICH MAN. THE RULES. PICK YOUR TOOL.']],null);
        return; }
      if (sp.id==='mother'){
        AR.say([
          ['MOTHER','DON\'T WRITE US UP. PLEASE. HE JUST COUGHS AT NIGHT.'],
          ['CHILD','(A SMALL WET COUGH, PERFECTLY TIMED.)']
        ], ()=>AR.card('deferred','CLASS D CHILDREN ARE NOT REFUSED CARE. THEY ARE DEFERRED. FOREVER.','OBSERVATION'));
        return; }
      if (sp.id==='healthscr'){
        if (C2.med && !C2.medShown){ C2.medShown=true;
          const out={coupon:'CHILD 8841: TREATMENT COMPLETE. SPONSOR: CITIZEN 6079 PRIORITY TRANSFER.',
            reclass:'SAMPLE 22-C LOGGED AS CONTAMINANT. INCINERATION CANCELLED: SAMPLE MISSING.',
            report:'CHILD 8841: TREATMENT COMPLETE. SOURCE STOCK: SEIZED GOODS.',
            social:'CHILD 8841: TREATMENT COMPLETE. FUNDED BY CIVIC GENEROSITY CREDIT 4471.'}[C2.med];
          AR.ses('crackle',.4); AR.toast(out,'#7a9a6a');
          AR.msg('THE SCREEN BLINKS ONCE. SOMEWHERE, A CHILD BREATHES EASIER.');
          return; }
        AR.lookMsg(sp); return; }
      if (sp.id==='vendor'){
        if (C2.med==='report'){ AR.msg('THE STALL IS SHUT. A CHALK MARK ON THE BOARD: EVALUATED.'); return; }
        if (C2.med){ AR.say([['VENDOR','WHATEVER YOU DID, CLIPBOARD, DO IT SOMEWHERE ELSE NEXT TIME.']],null); return; }
        AR.ask('THE VENDOR SELLS EVERYTHING AND ADMITS NOTHING.',[
          {t:'REPORT HIM FOR HOARDING (CABINET OPENS)', cb:()=>{
            C2.med='report'; AR.G.npc.vendor='detained';
            AR.tag('SACRIFICE',2); AR.scoreAdd(20,'ENFORCEMENT ASSIST');
            AR.G.att=Math.max(-50,AR.G.att-12);
            AR.say([
              ['SYSTEM','REPORT ACCEPTED. STOCK SEIZED. MEDICINE RELEASED TO QUEUE.'],
              ['MARA','THE BOY BREATHES. THE VENDOR DISAPPEARS. IS THAT A TRADE, OFFICER?']
            ], ()=>AR.msg('CHECK THE HEALTH SCREEN.')); }},
          {t:'ASK ABOUT MEDICINE, QUIETLY', cb:()=>{
            AR.say([['VENDOR','MEDICINE? I SELL TINS. THE CABINET BELONGS TO THE STATE.'],
              ['VENDOR','AND THE STATE BELONGS TO NOBODY, WHICH IS THE PROBLEM.']],null); }},
          {t:'STEP BACK', cb:()=>{}}
        ]); return; }
      if (sp.id==='cabinet'){
        if (C2.med){ AR.lookMsg(sp)||AR.msg('THE CABINET IS QUIET NOW.'); return; }
        const liveReg=AR.G.mods.includes('live_regulation');
        const opts=[
          {t:'USE YOUR OWN HEALTH PRIORITY COUPON', cb:()=>{
            C2.med='coupon'; AR.scoreAdd(-35,'PRIORITY TRANSFER TO CLASS D');
            AR.G.att=Math.min(100,AR.G.att+15);
            AR.say([
              ['SYSTEM','PRIORITY TRANSFER LOGGED. YOUR NEXT MEDICAL REQUEST: STANDARD QUEUE.'],
              ['MARA','...YOU DID NOT HAVE TO DO IT THAT WAY. THAT IS WHY IT COUNTS.']
            ], ()=>AR.msg('CHECK THE HEALTH SCREEN.')); }},
        ];
        if (liveReg && !C2.printFound){
          opts.push({t:'RECLASSIFY AS CONTAMINATION SAMPLE', dim:true, cb:()=>{}});
        } else {
          opts.push({t:'RECLASSIFY AS CONTAMINATION SAMPLE (REG 9.3)', cb:()=>{
            C2.med='reclass'; AR.tag('LEGALISM',2); AR.G.susp+=0.08;
            AR.say([
              ['YOU','FIELD SAMPLE 22-C. SUSPECTED CONTAMINANT. CUSTODY: FIELD OFFICER.'],
              ['SYSTEM','RECLASSIFICATION ACCEPTED. SAMPLE RELEASED FOR TRANSPORT.'],
              ['MARA','YOU JUST STOLE MEDICINE WITH A FORM. I HAVE NEVER SEEN THAT BEFORE.']
            ], ()=>AR.msg('CHECK THE HEALTH SCREEN.')); }});
        }
        opts.push({t:'STEP BACK', cb:()=>{}});
        if (liveReg && !C2.printFound){
          AR.say([['TERMINAL','REG 9.3 (FIELD SAMPLES) — REVISED 04:00 TODAY: DUAL AUTHORIZATION REQUIRED.'],
            ['YOU','REVISED AT FOUR IN THE MORNING. SOMEONE IS LEARNING MY TRICKS.'],
            ['YOU','...PAPER REGULATIONS DO NOT UPDATE. THE VENDOR KEEPS OLD POSTINGS ON HIS BOARD.']],
            ()=>{ C2.printHint=true;
              AR.toast('ADAPTATION ACTIVE: LIVE REGULATION UPDATES. FIND A PRINTED COPY.','#c2242e');
              AR.ask('THE CABINET TERMINAL WAITS.',opts); });
          return; }
        AR.ask('THE CABINET TERMINAL WAITS.',opts);
        return; }
      if (sp.id==='junk'){
        AR.lookMsg(sp);
        if (C2.printHint && !C2.printFound){
          C2.printFound=true; AR.ses('page',.5);
          AR.toast('FOUND: PRINTED REG 9.3, LAST YEAR\'S EDITION. SINGLE AUTHORIZATION SUFFICES.','#d9b36a');
          AR.card('print_reg','DIGITAL LAW CHANGES AT 04:00. PAPER LAW SLEEPS IN A JUNK BIN.','EVIDENCE');
        }
        return; }
      if (sp.id==='rich'){
        if (C2.med){ AR.say([['CUSTOMER','YES? I GAVE ALREADY. IT IS LOGGED.']],null); return; }
        AR.ask('A B-CLASS CUSTOMER INSPECTS SYNTHETIC PEACHES.',[
          {t:'PERSUADE: "SPONSORING CARE EARNS CIVIC CREDIT"', cb:()=>{
            C2.med='social'; AR.tag('SOCIAL',2);
            AR.say([
              ['CUSTOMER','CREDIT? VISIBLE ON MY PROFILE? ...WELL. FOR THE CHILDREN, OBVIOUSLY.'],
              ['SYSTEM','CIVIC GENEROSITY EVENT LOGGED. SPONSOR PROFILE UPDATED.'],
              ['MARA','YOU MADE VANITY DO CHARITY\'S JOB. EFFICIENT. SLIGHTLY TERRIFYING.']
            ], ()=>AR.msg('CHECK THE HEALTH SCREEN.')); }},
          {t:'APPEAL TO CONSCIENCE', cb:()=>{
            AR.say([['CUSTOMER','CONSCIENCE? IS THAT THE NEW WELLNESS METRIC?'],
              ['YOU','(WRONG TOOL. VANITY, MAYBE. THE PROFILE. THE VISIBLE CREDIT.)']],null); }},
          {t:'STEP BACK', cb:()=>{}}
        ]); return; }
      AR.lookMsg(sp);
    },
    tick(t){
      if (C2.med && !this.exitSet){ this.exitSet=true;
        setTimeout(()=>{ if (AR.scene&&AR.scene.id==='ch2_market')
          AR.say([
            ['MARA','ENOUGH FOR TODAY. TONIGHT THE GUARDIAN SPEAKS. WATCH IT AT MY PLACE.'],
            ['MARA','I WANT A WITNESS. YOU WILL SEE WHY.']
          ], ()=>AR.go('ch2_speech')); }, 14000); }
    },
    draw(g,t){
      AR.drawNPC(g,62,54,'#d9b58f','#5c2e3a',t,{hair:'#2c1a10',hairLong:true});
      AR.drawNPC(g,90,56,'#c9a27c','#3a3430',t,{hairLong:true});
      r(g,98,64,4,3,'#c9a27c'); r(g,98,67,4,5,'#33404e'); r(g,99,64,2,1,'#241f1b');
      if (C2.med!=='report') AR.drawNPC(g,150,52,'#b98f6e','#42392c',t,{});
      else { bt(g,'EVALUATED',144,54,'#c2242e'); }
      AR.drawNPC(g,32,54,'#e0b28c','#2c4456',t,{});
      // health screen content
      bt(g,'CLASS D',114,28,'#c2242e'); bt(g,'DEFER',114,34,'#c2242e');
      // cabinet cross
      r(g,172,44,8,2,'#7a9a6a'); r(g,175,41,2,8,'#7a9a6a');
      // rubber chicken beak, barely
      r(g,128,62,2,1,'#d9b36a');
    }
  });

  // ================================================================
  // 2.4 THE SPEECH — two versions of one broadcast
  // ================================================================
  const SPD = {marks:0, cls:{}, done:false};
  function speechScr(){
    const L1=['"ORDER IS A BURDEN CARRIED','BY RESPONSIBLE MEN."','"THE CITY ENDURES BECAUSE','YOU CARRY IT."'];
    const L2=['"SAFETY IS THE RIGHT','OF THE FEARLESS."','"THE CITY ENDURES BECAUSE','YOU DESERVE IT."'];
    AR.term.open({
      title:'CACHE COMPARISON — UNITY ADDRESS 44',
      body:()=>{
        const b=[{s:'YOUR DEVICE CACHE:',col:'#5a86a0'}];
        L1.forEach((l,i)=>b.push({s:' '+l,
          col:(SPD.marks>i&&(i===0||i===1||i===3))?'#d9b36a':'#93a2b4'}));
        b.push('');
        b.push({s:'MARA\'S DEVICE CACHE:',col:'#c2778a'});
        L2.forEach((l,i)=>b.push({s:' '+l,
          col:(SPD.marks>i&&(i===0||i===1||i===3))?'#d9b36a':'#93a2b4'}));
        b.push('');
        b.push('DIFFERENCES MARKED: '+SPD.marks+'/4');
        if (SPD.marks>=4) b.push({s:'SAME TIMECODES. SAME FACE. DIFFERENT WORDS.',col:'#d9b36a'});
        return b; },
      opts:()=>[
        {t:'MARK NEXT DIFFERENCE', dim:SPD.marks>=4, cb:()=>{ SPD.marks++; AR.ses('yazi',.4);
          if (SPD.marks===4) AR.ses('sting',.5); }},
        {t:'CLASSIFY TARGETING PROFILES', dim:SPD.marks<4||SPD.done, cb:classify},
        {t:'STEP AWAY FROM THE DEVICES', dim:!SPD.done, cb:()=>AR.go('ch2_report')}
      ]
    });
  }
  function classify(){
    AR.ask('YOUR VERSION SPEAKS OF BURDEN AND RESPONSIBILITY. IT TARGETS:',[
      {t:'STATUS AND DUTY', cb:()=>{
        AR.say([['MARA','YES. YOU LIKE FEELING NECESSARY. IT KNOWS.']], classify2); }},
      {t:'FEAR AND SECURITY', cb:()=>{
        AR.say([['MARA','NO — THAT IS MINE. YOURS FLATTERS. THINK ABOUT WHAT THAT MEANS.']], classify2); }},
      {t:'FAMILY AND CHILDREN', cb:()=>{
        AR.say([['MARA','DO YOU SEE A CHILD IN YOUR VERSION? NO. IT KNOWS YOU BETTER.']], classify2); }}
    ]);
    function classify2(){
      AR.ask('MARA\'S VERSION SPEAKS OF SAFETY AND DESERVING. IT TARGETS:',[
        {t:'FEAR, DRESSED AS COURAGE', cb:()=>done(true)},
        {t:'STATUS AND DUTY', cb:()=>{
          AR.say([['MARA','NO. IT TELLS ME I AM BRAVE SO I WILL STOP BEING BRAVE.']],()=>done(true)); }},
        {t:'ANGER AT ENEMIES', cb:()=>{
          AR.say([['MARA','NOT ME. ANGER GOES TO OTHER SCREENS. MINE GETS REASSURANCE.']],()=>done(true)); }}
      ]);
    }
    function done(){
      if (SPD.done) return; SPD.done=true;
      AR.tag('TRUTH_SEEKER',1);
      AR.card('speech','SAME FACE, DIFFERENT PROMISE. THE SPEECH IS PERSONAL ADVERTISING.','EVIDENCE');
      AR.say([
        ['SYSTEM','NOTICE: PERSONAL PERCEPTION DIFFERENCES ARE NORMAL.'],
        ['MARA','IT ANSWERED BEFORE WE ASKED. REMEMBER THAT.'],
        ['MARA','GO HOME. WRITE YOUR LITTLE REPORT ABOUT ME. CHOOSE YOUR WORDS... KINDLY.']
      ], speechScr);
    }
  }
  AR.def('ch2_speech', {
    type:'term',
    enter(){ SPD.marks=0; SPD.done=false;
      AR.ambSet(['hum','amb_room']); AR.music('red-silence-a',.10);
      AR.say([
        ['NARRATOR','MARA\'S ROOM. ONE CUP, THEN TWO. THE GUARDIAN SPEAKS ON THE WALL.'],
        ['MARA','TELL ME WHAT HE JUST SAID. WORD FOR WORD.'],
        ['YOU','"ORDER IS A BURDEN CARRIED BY RESPONSIBLE MEN."'],
        ['MARA','NO. HE SAID: "SAFETY IS THE RIGHT OF THE FEARLESS."'],
        ['MARA','SAME BROADCAST. SAME SECOND. PULL YOUR CACHE. I WILL PULL MINE.']
      ], speechScr);
    }
  });

  // ================================================================
  // 2.5 EVENING REPORT — plausible framing
  // ================================================================
  const REP={i:0, sus:0};
  const EVENTS=[
    {what:'MARA CALLED THE SCORE SYSTEM UNJUST.',
     opts:[
      {t:'EXACT QUOTE', eff:()=>{ AR.G.att-=8;
        AR.toast('VALE: NOTED. SUBJECT ESCALATES. GOOD WORK, OFFICER.','#7a9a6a'); }},
      {t:'FRAME: "LOCAL IMPLEMENTATION ERRORS REDUCE TRUST"', eff:()=>{ AR.tag('SOCIAL',1);
        AR.toast('REPORT ACCEPTED. SUBJECT READS AS REFORM-MINDED, NOT DEVIANT.','#7a9a6a'); }},
      {t:'LIE: "SCORES WERE NOT DISCUSSED"', eff:()=>{ REP.sus++; AR.G.susp+=0.06;
        AR.toast('TELEMETRY CONFLICT: YOUR PULSE ROSE DURING A SCORE CONVERSATION.','#c2242e'); }}]},
    {what:'A CHILD RECEIVED MEDICINE OUTSIDE PROTOCOL.',
     opts:[
      {t:'FULL PROCEDURAL DETAIL', eff:()=>{
        AR.toast('REPORT LOGGED. YOUR METHOD IS NOW PART OF YOUR PROFILE.','#c2778a');
        AR.G.susp+=0.03; }},
      {t:'FRAME: "A QUEUE ANOMALY RESOLVED ITSELF"', eff:()=>{ AR.tag('SOCIAL',1);
        AR.toast('REPORT ACCEPTED. ANOMALY CLOSED.','#7a9a6a'); }},
      {t:'OMIT THE EVENT ENTIRELY', eff:()=>{ REP.sus++; AR.G.susp+=0.05;
        AR.toast('CROSS-REFERENCE: MARKET CAMERA LOGGED YOUR PRESENCE. GAP FLAGGED.','#c2242e'); }}]},
    {what:'MARA ASKED WHAT YOU ACTUALLY DO AT THE MINISTRY.',
     opts:[
      {t:'REPORT HER CURIOSITY AS PROBING', eff:()=>{ AR.G.att-=6;
        AR.toast('SUBJECT MARKED: COUNTER-SURVEILLANT TENDENCY.','#7a9a6a'); }},
      {t:'FRAME: "POLITE SMALL TALK"', eff:()=>{ AR.tag('SOCIAL',1);
        AR.toast('REPORT ACCEPTED.','#7a9a6a'); }},
      {t:'DID NOT COME UP', eff:()=>{ REP.sus++; AR.G.susp+=0.05;
        AR.toast('AUDIO RECORDER DISAGREES. DISCREPANCY LOGGED.','#c2242e'); }}]}
  ];
  function repNext(){
    if (REP.i>=EVENTS.length){
      const extraMic=AR.G.mods.includes('extra_microphone');
      AR.say([
        ['SYSTEM','FIELD REPORT 01 FILED.'],
        extraMic?['SYSTEM','RESIDENCE AUDIO CONFIRMS YOU REHEARSED SENTENCES ALOUD. THIS IS COMMON. IT IS STILL LOGGED.']
          :['SYSTEM','REPORT CONSISTENCY: '+(REP.sus===0?'HIGH':'UNDER REVIEW')+'.'],
        ['YOU','THE TRICK IS NOT LYING. THE TRICK IS CHOOSING WHICH TRUTH IS LOUDEST.']
      ], ()=>AR.go('ch2_roof'));
      return;
    }
    const ev=EVENTS[REP.i]; REP.i++;
    AR.term.open({
      title:'EVENING FIELD REPORT — ENTRY '+REP.i+'/3',
      body:()=>[
        'EVENT (PRIVATE MEMORY):',
        {s:' '+ev.what, col:'#a29a82'},'',
        'THE SYSTEM ALREADY HOLDS: LOCATION, PULSE,',
        'AUDIO SPECTRUM, PUPIL DILATION.','',
        'CHOOSE THE OFFICIAL SENTENCE.'
      ],
      opts:()=>ev.opts.map(o=>({t:o.t, snd:'yazi', cb:()=>{ o.eff(); repNext(); }}))
    });
  }
  AR.def('ch2_report', {
    type:'term',
    enter(){ REP.i=0; REP.sus=0;
      AR.ambSet(['hum','amb_room','amb_rain']); AR.music(null);
      repNext(); }
  });

  // ================================================================
  // 2.6 ROOFTOP — first real closeness
  // ================================================================
  AR.def('ch2_roof', {
    type:'room',
    floor:{x0:14,x1:150,y0:68,y1:78},
    actor:{x:20,y:72},
    spots:[
      {id:'mara', x:118,y:50,w:12,h:24, ad:'MARA'},
      {id:'edge', x:0,y:56,w:192,h:8, ad:'ROOF EDGE'},
      {id:'city', x:20,y:8,w:150,h:40, ad:'THE CITY'}
    ],
    approach:{ mara:{x:110,y:72}, edge:{x:80,y:70}, city:{x:80,y:70} },
    look:{
      city:{s:'thunder',m:['LIT WINDOWS IN GRIDS. EACH ONE A FILE.',
        'THE MINISTRY PYRAMID GLOWS LIKE A PATIENT ANIMAL.']},
      edge:{s:'cloth',m:['NO RAILING. THE SYSTEM ASSUMES NOBODY FALLS UNSCHEDULED.']}
    },
    enter(){
      gfx.put(0,0,192,64,M.SKY,0.8); gfx.tex(0,0,192,64,4,0.2);
      for (let i=0;i<8;i++){ gfx.put(6+i*24,26+((i*7)%18),14,38,M.BLDG,0.9+((i%3)*0.2)); }
      gfx.put(96,10,22,30,M.BLDG,1.5);
      gfx.put(0,64,192,44,M.FLOOR,1.0); gfx.tex(0,64,192,44,2,0.3);
      gfx.put(0,64,192,1,M.FLOOR,0.5);
      gfx.put(150,44,10,22,M.METAL,1.2);       // vent
      gfx.light(107,18,1.1,0.008,1,(t)=>0.85+0.15*Math.sin(t*0.07));
      gfx.light(60,80,0.7,0.02,1,()=>1);
      gfx.amb(0.12);
      AR.ambSet(['hum','amb_rain']); AR.music('midnight-blue-b',.12);
      AR.msg('THE ROOF OF HER BLOCK. RAIN HAS PAUSED, POLITELY.');
      this.stage=0;
    },
    onClick(sp,t){
      if (sp.id!=='mara'){ AR.lookMsg(sp); return; }
      if (this.stage===0){
        this.stage=1;
        AR.say([
          ['MARA','A FILE CROSSED MY FRIEND\'S DESK AT THE HOUSING OFFICE. MINE.'],
          ['MARA','IT WAS DELAYED. STAMPED: INSUFFICIENT DATA. CONTINUE OBSERVATION.'],
          ['MARA','SOMEBODY BOUGHT ME TIME. WAS IT YOU?']
        ], ()=>{
          AR.ask('WAS IT YOU?',[
            {t:'TELL THE TRUTH: YES', cb:()=>{ AR.G.att+=14; AR.G.susp+=0.06;
              AR.G.flags.roof_truth=true;
              AR.say([['MARA','...THAT WAS STUPID. AND KIND. THE TWO USUALLY TRAVEL TOGETHER.'],
                ['MARA','DO NOT DO IT AGAIN. UNLESS YOU MUST.']], end); }},
            {t:'HALF-TRUTH: "FILES GET DELAYED SOMETIMES"', cb:()=>{ AR.G.att+=4;
              AR.say([['MARA','FILES GET DELAYED. RAIN FALLS. NOBODY DOES ANYTHING. OF COURSE.'],
                ['MARA','YOU ARE CAREFUL. I CAN WORK WITH CAREFUL.']], end); }},
            {t:'LIE: NO', cb:()=>{ AR.G.flags.roof_lied=true;
              AR.say([['MARA','NO. OF COURSE NOT.'],
                ['MARA','(SHE MEASURES YOUR LIE LIKE A JEWELER. FILES THE WEIGHT AWAY.)']], end); }}
          ]);
          const end=()=>{
            AR.say([
              ['MARA','EVERYTHING IN THIS CITY IS A TEST. REMEMBER THAT.'],
              ['YOU','(YOU TAKE IT AS PHILOSOPHY. SHE MEANT IT AS PAPERWORK.)']
            ], ()=>{
              AR.card('city_test','MARA: "EVERYTHING IN THIS CITY IS A TEST." SHE DID NOT SMILE.','OBSERVATION');
              AR.director({
                LEGALISM:{id:'dual_auth', msg:'ADAPTATION: FIELD RECLASSIFICATIONS NOW REQUIRE DUAL AUTHORIZATION.'},
                SOCIAL:{id:'npc_crosscheck2', msg:'ADAPTATION: CITIZEN STATEMENTS NOW CROSS-EXAMINED. CONTRADICTIONS BECOME EVIDENCE — FOR BOTH SIDES.'},
                SACRIFICE:{id:'blame_bait', msg:'ADAPTATION: THE SYSTEM WILL NOW OFFER YOU SCAPEGOATS, TO SEE IF YOU TAKE THEM.'},
                STEALTH:{id:'second_sensor', msg:'ADAPTATION: SECONDARY SENSORS DEPLOYED AT KNOWN LOCATIONS.'},
                TRUTH_SEEKER:{id:'query_watch', msg:'ADAPTATION: DEEP-VERIFICATION QUERIES NOW GENERATE THEIR OWN FILES.'},
                SCORE_OPTIMIZER:{id:'privilege_audit2', msg:'ADAPTATION: PRIVILEGE TRANSACTIONS FLAGGED FOR PATTERN ANALYSIS.'},
                DEFAULT:{id:'baseline2', msg:'ADAPTATION: OBSERVATION DENSITY INCREASED.'}
              }, ()=>{ AR.G.chapter=3; AR.go('ch3_social'); });
            });
          };
        });
        return;
      }
      AR.say([['MARA','GO HOME, OFFICER. THE CITY GETS JEALOUS.']],null);
    },
    draw(g,t){
      AR.drawNPC(g,120,52,'#d9b58f','#5c2e3a',t,{hair:'#2c1a10',hairLong:true});
      // city windows
      for (let i=0;i<22;i++){
        const wx=10+((i*37)%170), wy=30+((i*13)%30);
        if (((t/(11+i%5))|0)%3!==0) r(g,wx,wy,1,1,'#d9b36a'); }
      r(g,104,14,6,4,'#96222e');
      // stars, few
      r(g,30,6,1,1,'#5c7288'); r(g,88,4,1,1,'#5c7288'); r(g,150,9,1,1,'#5c7288');
    }
  });
})();

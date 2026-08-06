// APPROVED REALITY — main menu, altered end menu, boot wiring
(function () {
  const {r, di, bt} = AR;

  AR.def('menu', {
    type:'cine', save:false,
    enter(){ this.hov=-1; AR.ambSet(['hum','amb_rain']);
      AR.music('midnight-blue-b',.12);
      this.save=AR.loadSave();
      this.rows=[]; },
    draw(g,t){
      r(g,0,0,192,108,'#04060b'); di(g,0,0,192,108,'#070b13',3);
      // title
      bt(g,'APPROVED',62,18,'#c2242e'); bt(g,'REALITY',66,28,'#c2242e');
      r(g,58,38,76,1,'#3a1420');
      bt(g,'TRUTH IS NOT WHAT IS LIVED.',40,44,'#5c6472');
      bt(g,'TRUTH IS WHAT IS VERIFIED.',42,52,'#5c6472');
      // eye
      r(g,90,4,12,8,'#101724'); r(g,94,6,4,4,'#3a4552');
      const px2=94+2.5*Math.sin(t*0.07); r(g,px2,7,2,2,'#0a0d12');
      if ((t/12|0)%2) r(g,95,7,1,1,'#c2242e');
      // options
      this.rows=[];
      const opts=[{t:'BEGIN VERIFICATION (NEW GAME)', cb:()=>{ AR.reset(); AR.go('boot'); }}];
      if (this.save) opts.push({t:'CONTINUE — '+(this.save.label||'ELIAS ROOK'),
        cb:()=>{ AR.G=this.save.G; AR.go(this.save.scene); }});
      let oy=70;
      opts.forEach((op,i)=>{
        bt(g,(this.hov===i?'▸ ':'  ')+op.t,34,oy,this.hov===i?'#d9b36a':'#8fa0b2');
        this.rows.push({y0:oy-1,y1:oy+8,op});
        oy+=10; });
      bt(g,'A CONTINUITY SYSTEM PRODUCTION',40,98,'#232936');
    },
    tick(){},
    onClickAny(){},
  });
  // menu needs its own hover/click handling on rows
  const cv=document.getElementById('cv');
  cv.addEventListener('mousemove', e=>{
    const sc=AR.scene; if (!sc||(sc.id!=='menu'&&sc.id!=='menu_end')) return;
    const rc=cv.getBoundingClientRect();
    const my=(e.clientY-rc.top)*108/rc.height|0;
    sc.hov=-1;
    (sc.rows||[]).forEach((row,i)=>{ if (my>=row.y0&&my<row.y1) sc.hov=i; });
    cv.style.cursor=sc.hov>=0?'pointer':'default';
  });
  cv.addEventListener('click', e=>{
    const sc=AR.scene; if (!sc||(sc.id!=='menu'&&sc.id!=='menu_end')) return;
    const rc=cv.getBoundingClientRect();
    const my=(e.clientY-rc.top)*108/rc.height|0;
    for (const row of (sc.rows||[]))
      if (my>=row.y0&&my<row.y1){ AR.ses('clink',.4); row.op.cb(); return; }
  });
  document.addEventListener('keydown', e=>{
    const sc=AR.scene; if (!sc||(sc.id!=='menu'&&sc.id!=='menu_end')) return;
    const rows=sc.rows||[]; if (!rows.length) return;
    if (e.key==='ArrowDown'||e.key==='ArrowUp'){
      e.preventDefault();
      const n=rows.length, d=e.key==='ArrowDown'?1:-1;
      sc.hov=(((sc.hov==null||sc.hov<0)?(d>0?-1:0):sc.hov)+d+n)%n;
    } else if (e.key==='Enter'||e.key===' '){
      e.preventDefault();
      const row=rows[sc.hov>=0?sc.hov:0];
      if (row){ AR.ses('clink',.4); row.op.cb(); }
    }
  });

  // the menu after the ending — the system's menu
  AR.def('menu_end', {
    type:'cine', save:false,
    enter(){ this.hov=-1; this.rows=[]; this.reviewT=0;
      AR.ambSet(['hum']); AR.music('red-silence-b',.10); },
    draw(g,t){
      r(g,0,0,192,108,'#04060b'); di(g,0,0,192,108,'#070b13',3);
      bt(g,'APPROVED',62,14,'#c2242e'); bt(g,'REALITY',66,24,'#c2242e');
      bt(g,'CONTINUITY SYSTEM V12.1',48,34,'#5c6472');
      if (this.reviewT>0){
        bt(g,'YOUR REQUEST IS UNDER REVIEW.',36,52,'#d9b36a');
        this.reviewT--; this.rows=[];
        if (this.reviewT===1){ AR.ses('buzz',.3); }
        return;
      }
      const self=this;
      const opts=[
        {t:'RE-EVALUATE', cb:()=>{ AR.reset(); AR.go('boot'); }},
        {t:'CONTINUE OBSERVATION', cb:()=>{ AR.go('epilogue'); }},
        {t:'ADJUST YOUR BEHAVIOR', cb:()=>{
          AR.toast('BEHAVIOR ADJUSTMENT IS CONTINUOUS. NO ACTION REQUIRED.','#c2778a'); }},
        {t:'FILE AN EXIT REQUEST', cb:()=>{ self.reviewT=44; AR.ses('crackle',.4); }}
      ];
      this.rows=[];
      let oy=52;
      opts.forEach((op,i)=>{
        bt(g,(this.hov===i?'▸ ':'  ')+op.t,44,oy,this.hov===i?'#d9b36a':'#8fa0b2');
        this.rows.push({y0:oy-1,y1:oy+8,op});
        oy+=10; });
      bt(g,'SAVE RECORD: UNUSED TEST SAMPLE',34,98,'#3a1420');
    },
    onClickAny(){},
  });

  // props are read into the light engine before any scene builds.
  // the hand-drawn variant loads none, so scenes fall back to gfx.put blocks.
  const props = AR.SANAT==='elle' ? []
    : ['telekran','pencere','masa','yatak','kapi','tabure'];
  AR.loadProps(props).then(()=>AR.start('menu'));
})();

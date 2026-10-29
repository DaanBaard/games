/* ---------- world state ---------- */
let state='boot';
let R=null,P=null,room=null,boss=null;
let G=[],ORBS=[],DROPS=[],FX=[],TXT=[],HZ=[],FIREF=[],BURSTS=[],BOMBQ=[];
let freezeT=0,slowT=0,shakeA=0,shX=0,shY=0,camX=500,camY=300,flashA=0,flashC='255,255,255';
let banner=null,trans=null,hint=null,gtime=0;
const KEY={};const mouse={x:0,y:0,last:-1e9};const stick={on:false,id:null,ox:0,oy:0,x:0,y:0,dx:0,dy:0};
let touchMode=false,wantDash=false;
const L=id=>(R&&R.ab[id])||0;
const xpNeed=l=>3+l*3+Math.floor(l*l*.3);

function calcStats(){
  const sh=S.shop;
  P.beamLen=232*(1+.08*sh.range)*(1+.15*L('long'));
  P.beamAng=.36*(1+.18*L('wide'));
  P.dps=16*(1+.12*sh.power)*(1+.18*L('bright'));
  P.pw=P.dps/16;
  P.speed=212*(1+.06*sh.speed)*(1+.09*L('boots'));
  P.magnet=72*(1+.25*sh.magnet)*(1+.45*L('magnet'));
  P.dashCdMax=1.35*Math.pow(.82,L('dashcd'));
  P.maxH=3+sh.hearts+L('heart');
  P.candyMul=(1+.1*sh.bonus)*(1+.15*L('lucky'));
  const n=L('fire');while(FIREF.length<n)FIREF.push({x:P.x,y:P.y});FIREF.length=n;
}
function hpMul(){if(R.mode==='story')return 1+R.ch*.36+(room.n-1)*.05;const n=room.n;return 1+n*.1+Math.pow(n/10,2)*.8}
function spdMul(){return R.mode==='story'?1+R.ch*.06+(room.n-1)*.012:1+Math.min(.4,room.n*.012)}
function chap(){return room?room.c:0}

/* ---------- run flow ---------- */
function startRun(mode,ch){
  R={mode,ch,room:0,lvl:1,xp:0,need:xpNeed(1),candy:0,earned:0,pops:0,combo:0,comboT:0,maxCombo:0,comboTier:-1,ab:{},
    rerolls:1+S.shop.reroll,adReroll:true,revived:false,angelUsed:false,dd:1,hitsRoom:0,dashes:0,time:0,golden:0,bossKills:0,
    pendingCards:0,cardBoost:0,wantCards:false,strobeT:2.5,candleT:3,flawlessBoss:true,doubled:false,tut:(mode==='story'&&ch===0&&S.tut<1)?1:0,tutMoved:0,tutMv:false,tutPop:false,tutCandyT:0,dashHinted:false,newRecord:false,
    hist:{rt:[],lay:[],tw:[]},names:[],kinds:{},drain:0,lamp:1,ambT:rand(4,9),lastShrine:-9};
  P={x:500,y:550,vx:0,vy:0,r:14,aim:-Math.PI/2,hearts:3,inv:0,dash:0,dashCd:0,dvx:0,dvy:0,t:0,mv:false,saltT:0};
  FIREF=[];calcStats();P.hearts=P.maxH;
  S.st.runs++;save();
  G=[];ORBS=[];DROPS=[];FX=[];TXT=[];HZ=[];BURSTS=[];BOMBQ=[];
  MUS.mode='calm';MUS.ch=mode==='story'?ch:0;
  measure('run',runKey(),'start');if(R.tut){measure('tutorial','intro','start')}
  if(S.st.runs<=10)measure('milestone','run'+S.st.runs,'reached');
  nextRoom(null);
}
function runKey(){return R.mode==='story'?'ch'+(R.ch+1):'night'}
function lvKey(){return R.mode==='story'?'ch'+(R.ch+1)+'-r'+R.room:'night-r'+Math.min(R.room,60)}
function rtKey(){return room.type!=='normal'?room.type:room.rt}
function roomEv(a){measure('level',lvKey(),a);measure('roomtype',rtKey(),a);if(room.tw)measure('twist',room.tw,a)}
function roomInfo(n){
  if(R.mode==='story')return{c:R.ch,vis:R.ch,type:n===10?'boss':n===5?'mini':'normal',final:n===10,total:10,pre:n===4||n===9};
  return{c:Math.min(4,Math.floor((n-1)/6)),vis:Math.floor((n-1)/5)%5,type:n%10===0?'boss':n%5===0?'mini':'normal',final:false,total:0,pre:n%5===4};
}

/* ---------- room generation ---------- */
function makeRoom(n,info,opt){
  opt=opt||{};const ch=CH[info.vis];const rnd=Math.random;
  let lay=opt.lay;
  if(!lay){
    if(info.type!=='normal')lay=pick(['ring','pillars']);
    else if(opt.rt==='shrine')lay='open';
    else if(opt.rt==='poltergeist')lay=pick(['scatter','cluttered','centerpiece']);
    else{const h=(R&&R.hist)?R.hist.lay.slice(-2):[];let o=ch.lay.filter(l=>!h.includes(l));if(n===1)o=o.filter(l=>!['cluttered','corridor','open'].includes(l));lay=pick(o.length?o:['scatter'])}
  }
  const LD=LAY[lay];ROOM_W=Math.round(LD.w*(.96+rnd()*.08)/10)*10;ROOM_H=Math.round(LD.h*(.96+rnd()*.08)/10)*10;
  const rm={n,...info,ch,lay,rt:opt.rt||(info.type==='normal'?'waves':info.type),tw:opt.tw||null,furn:[],candles:[],rugs:[],decals:[],doors:[],
    doorXs:info.pre?[ROOM_W/2]:(lay==='corridor'?[ROOM_W*.16,ROOM_W*.84]:[ROOM_W*.28,ROOM_W*.72]),phase:'fight',waves:[],wave:0,waveDelay:n===1?.6:1.1,waveClock:0,
    seed:(rnd()*1e9)|0,golden:false,goldenT:rand(5,14),clearT:0,dark:ch.dark,windows:[],frames:[],bossSpawned:false,bossT:1.2,lastPat:null,candyMul:1,light:0};
  if(info.final&&!opt.demo)rm.doorXs=[];
  if(rm.tw==='dark')rm.dark=.975;
  if(R&&R.tut&&n===1&&!opt.demo)rm.dark=.8;
  const r=srng(rm.seed);
  // wall decoration
  for(let x=110;x<ROOM_W-80;x+=200+r()*60){if(rm.doorXs.some(d=>Math.abs(d-x)<100))continue;const k=r();
    if(k<.38)rm.windows.push(x);else if(k<.7||rm.tw==='dark')rm.frames.push(x);else rm.candles.push({x,y:4,ph:r()*6,wall:true})}
  // furniture
  const gapDef=lay==='cluttered'?24:38;
  const place=(type,cx,cy,force,gap)=>{const [w,h]=FURN[type];const x=Math.round(cx-w/2),y=Math.round(cy-h/2);gap=gap==null?gapDef:gap;
    if(x<14||y<14||x+w>ROOM_W-14||y+h>ROOM_H-14)return false;
    if(Math.abs(cx-ROOM_W/2)<w/2+56&&y+h>ROOM_H*.52)return false;
    if(opt.rt==='shrine'&&Math.hypot(cx-ROOM_W/2,cy-ROOM_H*.42)<w/2+110)return false;
    if(rm.doorXs.some(d=>Math.abs(cx-d)<w/2+64)&&y<140)return false;
    if(!force&&rm.furn.some(o=>x<o.x+o.w+gap&&x+w+gap>o.x&&y<o.y+o.h+gap&&y+h+gap>o.y))return false;
    rm.furn.push({type,x,y,w,h,ph:r()*6});return true};
  const scatter=(n2,list,gap)=>{let t2=0,k=0;while(k<n2&&t2++<160){const tp=list[Math.floor(r()*list.length)];const [w,h]=FURN[tp];if(place(tp,w/2+30+r()*(ROOM_W-w-60),h/2+40+r()*(ROOM_H-h-90),false,gap))k++}};
  switch(lay){
    case 'scatter':scatter(3+Math.floor(r()*3),ch.small.concat(ch.big));break;
    case 'open':scatter(1+Math.floor(r()*2),ch.small);break;
    case 'cluttered':scatter(7+Math.floor(r()*4),ch.small,24);break;
    case 'pillars':{const cols=r()<.5?3:4;for(let i=0;i<cols;i++)for(const fy of[.32,.66])place(ch.pillar,ROOM_W*(i+1)/(cols+1),ROOM_H*fy,true);scatter(1+Math.floor(r()*2),ch.small);break}
    case 'aisles':{const tp=ch.aisle,[w]=FURN[tp];const rows=[.3,.56];rows.forEach((fy,ri)=>{const gaps=[ROOM_W*(.2+r()*.2),ROOM_W*(.6+r()*.2)];if(ri)gaps[0]=ROOM_W*(.32+r()*.1);
      for(let x=60;x+w<ROOM_W-50;x+=w+6){const cx=x+w/2;if(gaps.some(g=>Math.abs(cx-g)<w/2+64)||Math.abs(cx-ROOM_W/2)<w/2+40&&ri===1)continue;const t2=tp==='cratesrow'?['crate','crate','boxes','trunk'][Math.floor(r()*4)]:tp;place(t2,cx,ROOM_H*fy+(tp==='cratesrow'?(r()-.5)*14:0),true)}});scatter(1,ch.small);break}
    case 'centerpiece':{const tp=pick(ch.center);place(tp,ROOM_W/2,ROOM_H*.44,true);scatter(2+Math.floor(r()*3),ch.small);if(r()<.6)rm.chand={x:ROOM_W/2,y:ROOM_H*.44};break}
    case 'ring':{const pts=[[.12,.2],[.88,.2],[.1,.55],[.9,.55],[.2,.85],[.8,.85],[.5,.16]];for(const [fx,fy] of pts)if(r()<.75){const tp=ch.small[Math.floor(r()*ch.small.length)];place(tp,ROOM_W*fx,ROOM_H*fy,false)}break}
    case 'corridor':{let x=160;let top=true;while(x<ROOM_W-160){const tp=r()<.5?ch.aisle:ch.small[Math.floor(r()*ch.small.length)];const [w,h]=FURN[tp];place(tp,x,top?h/2+26:ROOM_H-h/2-26,false,20);x+=w+90+r()*90;top=!top}break}
  }
  if(lay==='pillars'&&(info.vis===0||info.vis===3)&&r()<.5)rm.chand={x:ROOM_W/2,y:ROOM_H*.48};
  // candles on furniture
  if(rm.tw!=='dark'){for(const f of rm.furn){
    if(f.type==='candelabra')rm.candles.push({x:f.x+f.w*.25,y:f.y+f.h*.5,ph:r()*6},{x:f.x+f.w*.75,y:f.y+f.h*.5,ph:r()*6});
    else if(f.type==='longtable')rm.candles.push({x:f.x+f.w*.33,y:f.y+f.h*.42,ph:r()*6},{x:f.x+f.w*.66,y:f.y+f.h*.42,ph:r()*6});
    else if(r()<.4&&['table','dresser','tomb','sarcophagus','workbench','cabinet','trunk','crate','bench','coffin'].includes(f.type))rm.candles.push({x:f.x+f.w*(.2+r()*.6),y:f.y+Math.min(f.h*.4,22),ph:r()*6})}
    let tries=0;while(rm.candles.filter(c=>!c.wall).length<(lay==='open'?1:2)&&tries++<40){const x=60+r()*(ROOM_W-120),y=70+r()*(ROOM_H-160);if(rm.furn.some(f=>x>f.x-14&&x<f.x+f.w+14&&y>f.y-14&&y<f.y+f.h+14))continue;rm.candles.push({x,y,ph:r()*6})}}
  else rm.candles=[];
  // rugs & decals
  if(info.vis===0&&r()<.8){const round=r()<.3;rm.rugs.push({x:ROOM_W/2+(r()-.5)*120,y:ROOM_H*.55,w:round?260:300+r()*120,h:round?200:170+r()*60,round,col:pick(['#4a1a1e','#1e2a44','#3a2a14'])})}
  if(info.vis===1&&r()<.5)rm.rugs.push({x:ROOM_W*(.3+r()*.4),y:ROOM_H*(.4+r()*.3),w:200,h:120,round:false,col:'#3a3428'});
  const dk=[['dirt','paper','glass'],['dirt','paper','dirt'],['puddle','dirt','bones'],['oil','dirt','paper'],['leaf','petal','puddle']][info.vis];
  for(let i=0;i<14+Math.floor(r()*10);i++){const k2=dk[Math.floor(r()*dk.length)];rm.decals.push({k:k2,x:30+r()*(ROOM_W-60),y:30+r()*(ROOM_H-60),a:r()*TAU,s:k2==='dirt'?30+r()*50:k2==='puddle'?14+r()*22:k2==='oil'?10+r()*16:6+r()*8})}
  rm.res=0;
  return rm;
}
function roomName(rm){if(rm.type!=='normal')return null;const n=CH[rm.vis].rooms||6;const used=R?R.names:[];let opts=[];for(let i=0;i<6;i++)if(!used.includes(rm.vis+'_'+i))opts.push(i);if(!opts.length){if(R)R.names=[];opts=[0,1,2,3,4,5]}const i=pick(opts);if(R)R.names.push(rm.vis+'_'+i);return 'rn'+rm.vis+'_'+i}

/* ---------- waves ---------- */
function poolFor(rm){const pool=[];const n=rm.n,c=rm.c;
  const addPool=ci=>{for(const k in CH[ci].pool){if((k==='flitter'||k==='mote')&&ci===0&&n<3&&R.mode==='story')continue;const e=pool.find(p=>p[0]===k);if(e)e[1]+=CH[ci].pool[k]*.5;else pool.push([k,CH[ci].pool[k]])}};
  if(R.mode==='story')addPool(c);else for(let i=0;i<=c;i++)addPool(i);return pool}
function buildWaves(rm,swarm){
  const n=rm.n,c=rm.c;
  if(R.tut&&n===1){rm.waves=[{pat:'front',e:[{tp:'wisp',slow:true}]},{pat:'edges',e:[{tp:'wisp',slow:true},{tp:'wisp',slow:true},{tp:'wisp',slow:true},{tp:'wisp',slow:true},{tp:'wisp',slow:true}]}];rm.waveDelay=.3;rm.tut=true;return}
  let budget=R.mode==='story'?(6+n*1.7+c*2.8)*R.dd:(7+n*1.5+Math.pow(n,1.25)*.4)*R.dd*(1+n*.025);
  let pool=poolFor(rm);
  if(swarm){pool=[['mote',6],['flitter',3],['wisp',2]];budget*=1.12}
  const nw=swarm?4:n<3?2:(n<7&&R.mode==='story')?2:3;
  const waves=[];for(let i=0;i<nw;i++)waves.push({e:[],pat:null});
  let eliteP=(R.mode==='story'?c*.035+n*.004:Math.min(.25,n*.008))+(rm.tw==='haunt'?.3:0);
  const theme=swarm||n<3?'mixed':wpick([['mixed',58],['mono',24],['elite',18]]);
  const monoTp=wpick(pool.filter(p=>p[0]!=='mote'));
  if(theme==='mono')budget*=1.1;
  let i=0;
  if(theme==='elite'){const strong=pool.filter(p=>GT[p[0]].cost>=2);const tp=strong.length?wpick(strong):'sheet';waves[nw-1].e.push({tp,elite:true});budget-=GT[tp].cost*2.4}
  while(budget>0&&i<70){const tp=theme==='mono'&&Math.random()<.85?monoTp:wpick(pool);waves[i%nw].e.push({tp,elite:Math.random()<eliteP});budget-=GT[tp].cost;i++}
  if(n===1)budget*=.85;
  const pats=n<=2?['edges','doors','line']:rm.lay==='corridor'?['line','line','doors','edges']:['edges','surround','doors','furniture','floor','line'];
  let last=null;for(const w of waves){let p;do{p=pick(pats)}while(p===last&&pats.length>1);if(n<2&&p==='surround')p='edges';w.pat=p;last=p}
  rm.waves=waves.filter(w=>w.e.length);
}
function nextRoomOpts(exclude){
  const n=R.room+1;const story=R.mode==='story';
  const h=R.hist.rt.slice(-2);
  const list=[];for(const k in RT){const d=RT[k];if(n<d.from)continue;if(k===exclude)continue;let w=d.w;
    if(h.includes(k))w*=k==='waves'?.35:.12;if(k==='shrine'&&R.room-R.lastShrine<5)continue;if(k==='hunt'&&h[h.length-1]==='hunt')continue;list.push([k,w])}
  const rt=wpick(list);
  let tw=null;if(rt!=='shrine'&&rt!=='hunt'&&n>=3&&Math.random()<(story?.3+R.ch*.05:.45)){const lt=R.hist.tw.slice(-1)[0];const o=TWISTS.filter(x=>x!==lt&&!(x==='cold'&&(rt==='survive'||rt==='ritual')));tw=pick(o)}
  let rw;if(rt==='shrine')rw='shrine';else rw=wpick([['card',40],['candy',25],['heart',P.hearts<P.maxH?22:5],['chest',14],['mystery',11]]);
  return{rt,tw,rw};
}
function setupDoors(){
  if(room.pre){room.doors=[{x:room.doorXs[0],rw:'boss',rt:'boss'}];return}
  const a=nextRoomOpts();let b=nextRoomOpts(a.rt),n=0;while(b.rw===a.rw&&b.rt===a.rt&&n++<10)b=nextRoomOpts(a.rt);
  room.doors=[{x:room.doorXs[0],...a},{x:room.doorXs[1],...b}];
}
function nextRoom(d){
  if(R.room>0){
    if(R.hitsRoom===0){R.dd=Math.min(1.25,R.dd+.035);mProg('clean',1)}else if(R.hitsRoom>=2)R.dd=Math.max(.85,R.dd-.05);
  }
  R.room++;R.hitsRoom=0;
  G=[];ORBS=[];DROPS=[];HZ=[];BURSTS=[];BOMBQ=[];boss=null;
  const info=roomInfo(R.room);
  const opt=d&&d.rt&&d.rt!=='boss'?{rt:d.rt,tw:d.tw}:{};
  room=makeRoom(R.room,info,opt);
  R.hist.rt.push(room.rt);R.hist.lay.push(room.lay);if(room.tw)R.hist.tw.push(room.tw);
  room.name=roomName(room);
  setupRoomType(room);
  P.x=ROOM_W/2;P.y=ROOM_H-48;P.vx=P.vy=0;P.aim=-Math.PI/2;P.inv=Math.max(P.inv,.8);P.dash=0;
  updCam(0,true);
  mProg('room',R.room,'max');
  if(R.mode==='night'){if(R.room>S.nightBest){S.nightBest=R.room;if(R.room>1)R.newRecord=true}}
  else if(R.room>S.best[R.ch]){if(S.best[R.ch]>0)R.newRecord=true;S.best[R.ch]=R.room}
  if(room.type!=='normal'){R.flawlessBoss=true}
  MUS.ch=room.vis;
  if(room.type==='normal'){
    const lbl=R.mode==='story'?t('roomOf',{n:R.room,m:10}):t('room',{n:R.room});
    let sub=room.rt!=='waves'?t('rt_'+room.rt):lbl;if(room.tw)sub+=' · '+t('tw_'+room.tw);
    showBanner(R.room===1?(R.mode==='story'?t('ch'+R.ch):t('nightmare')):t(room.name),sub,1.8,'#efe6d2');
    if(room.rt!=='waves'||room.tw)hint={text:objHint(),t:0,dur:4}
  }else showBanner(room.type==='boss'?t('bossTitle'):t('miniTitle'),R.mode==='story'?t('roomOf',{n:R.room,m:10}):t('room',{n:R.room}),1.4,'#e0a070');
  if(d&&d.rw&&d.rw!=='shrine')applyReward(d.rw);
  if(d&&d.rw)measure('door',d.rw,'picked');
  roomEv('start');
  save();
}
function objHint(){const k={ritual:'hRitual',survive:'hSurvive',hunt:'hHunt',poltergeist:'hPolter',shrine:'hShrine',swarm:'hSwarm'}[room.rt];
  let s=k?t(k):'';if(room.tw)s=(s?s+' · ':'')+t('twd_'+room.tw);return s}
function setupRoomType(rm){
  const c=rm.c;
  switch(rm.rt){
    case 'waves':buildWaves(rm,false);break;
    case 'swarm':buildWaves(rm,true);break;
    case 'ritual':{const n=c>=2||rm.n>8?5:4;rm.ritual=[];const cx=ROOM_W/2,cy=ROOM_H*.5;let a0=Math.random()*TAU;
      for(let i=0;i<n;i++){let best=null;for(let k=0;k<20;k++){const a=a0+i*TAU/n+(Math.random()-.5)*.5,rx=ROOM_W*(.34+Math.random()*.08),ry=ROOM_H*(.3+Math.random()*.08);const x=clamp(cx+Math.cos(a)*rx,60,ROOM_W-60),y=clamp(cy+Math.sin(a)*ry,90,ROOM_H-80);
        if(!rm.furn.some(f=>x>f.x-34&&x<f.x+f.w+34&&y>f.y-34&&y<f.y+f.h+34)){best={x,y};break}}if(best)rm.ritual.push({...best,p:0,lit:false,ph:Math.random()*6})}
      rm.trickleT=1.4;break}
    case 'survive':rm.survMax=rm.survT=24+Math.min(10,c*2.5);rm.trickleT=1;break;
    case 'hunt':rm.huntN=3+(c>=2?1:0);rm.huntLeft=rm.huntN;rm.huntCaught=0;rm.huntT=1.2;rm.waves=[{pat:'floor',e:[{tp:'wisp'},{tp:'wisp'},{tp:'wisp'}].concat(c>1?[{tp:'flitter'}]:[])}];break;
    case 'poltergeist':{const ok=rm.furn.filter(f=>!['pillar','post','ironcol','fountain','biggear','bellframe','candelabra','urn'].includes(f.type));
      ok.sort(()=>Math.random()-.5);const n=Math.min(ok.length,2+(c>=2?1:0));for(let i=0;i<n;i++){const f=ok[i];f.poss={fear:0,hp:(55+Math.min(f.w,f.h)*.4)*Math.sqrt(hpMul()),throwT:rand(1.4,2.6),done:false}}
      rm.possN=n;rm.waves=[{pat:'furniture',e:[{tp:'wisp'},{tp:'wisp'}].concat(c>0?[{tp:'flitter'},{tp:'wisp'}]:[])}];if(!n)rm.rt='waves',buildWaves(rm,false);break}
    case 'shrine':rm.altar={x:ROOM_W/2,y:ROOM_H*.42,used:false};rm.phase='shrine';break;
  }
}
function applyReward(rw){
  const px=P.x,py=P.y-60;
  switch(rw){
    case 'card':R.pendingCards++;R.cardBoost=.4;R.wantCards=true;break;
    case 'candy':{const n=10+R.room*2;for(let i=0;i<n;i++)addDrop(Math.random()<.15?'big':'candy',px,py,Math.random()<.15?5:1);floatText(px,py-20,t('gotCandy',{n:'~'+(n+Math.round(n*.6))}),'#e8c870',24);SFX.jackpot();break}
    case 'heart':if(P.hearts<P.maxH){P.hearts++;floatText(px,py,t('gotHeart'),'#d8505a',24)}else{for(let i=0;i<12;i++)addDrop('candy',px,py,1)}SFX.pick();break;
    case 'chest':room.chest={x:ROOM_W/2,y:ROOM_H-170,open:false,t:0,boost:.6};break;
    case 'mystery':{const r=wpick([['candy',30],['heart',18],['card',25],['chest',22],['jackpot',5]]);
      floatText(px,py-30,'?','#c8a0e8',30);
      if(r==='jackpot'){for(let i=0;i<30;i++)addDrop('big',px,py,5);showBanner(t('jackpot'),'',1.2,'#e8c870');SFX.jackpot();confetti(px,py,50)}
      else applyReward(r);break}
    case 'boss':if(P.hearts<P.maxH)P.hearts++;floatText(px,py,t('rest'),'#a8d8c0',20);SFX.pick();break;
  }
}

/* ---------- entities ---------- */
function mkGhost(tp,x,y,o){
  const d=GT[tp],hm=R&&room?hpMul():1;o=o||{};
  const g={tp,look:tp,x,y,vx:0,vy:0,r:d.r,hp:d.hp*hm,fear:0,spd:d.spd*(R&&room?spdMul():1)*(o.slow?.6:1),xp:d.xp,candy:d.candy,eye:d.eye,col:d.col,elite:!!o.elite,
    spawnT:o.spawnT!=null?o.spawnT:.9,spawnMax:o.spawnT!=null?Math.max(o.spawnT,.01):.9,alpha:0,ph:rand(0,TAU),lit:false,litT:0,seenLit:false,dead:false,hitT:0,
    shotT:rand(1.6,3),tele:0,dashT:0,dashCd:rand(2,4),dvx:0,dvy:0,tpT:rand(2.5,4),life:0,boss:null,charging:false,slowT:0,tr:[],trT:0,wailCd:rand(1.5,3),wailT:0};
  if(g.elite){g.r*=1.3;g.hp*=2.4;g.xp*=3;g.candy*=3}
  return g;
}
function spawnGhost(tp,x,y,o){const g=mkGhost(tp,x,y,o);G.push(g);if(g.spawnT>0)puff(x,y,g.r,'#2a2438',8);return g}
function inFurn(x,y,m){for(const f of room.furn)if(x>f.x-m&&x<f.x+f.w+m&&y>f.y-m&&y<f.y+f.h+m)return true;return false}
function spawnPoint(minD){
  for(let i=0;i<50;i++){const side=Math.floor(Math.random()*4);let x,y;
    if(side===0){x=rand(60,ROOM_W-60);y=rand(50,140)}else if(side===1){x=rand(60,ROOM_W-60);y=rand(ROOM_H-140,ROOM_H-50)}else if(side===2){x=rand(50,150);y=rand(60,ROOM_H-60)}else{x=rand(ROOM_W-150,ROOM_W-50);y=rand(60,ROOM_H-60)}
    if(Math.hypot(x-P.x,y-P.y)>=minD&&(i>30||!inFurn(x,y,10)))return{x,y}}
  return{x:P.x<ROOM_W/2?ROOM_W-80:80,y:rand(80,ROOM_H-80)}
}
function patPoint(pat,i,n,ctx){
  let p=null;
  switch(pat){
    case 'surround':{const a=ctx.a0+i*TAU/n,d=290+Math.random()*40;p={x:P.x+Math.cos(a)*d,y:P.y+Math.sin(a)*d*.85};break}
    case 'doors':{const xs=room.doorXs.length?room.doorXs:[ROOM_W/2];const k=i%(xs.length+2);if(k<xs.length)p={x:xs[k]+rand(-30,30),y:rand(24,60)};else p={x:k===xs.length?30:ROOM_W-30,y:ROOM_H*.45+rand(-60,60)};break}
    case 'furniture':{if(room.furn.length){const f=pick(room.furn);p={x:f.x+f.w/2+rand(-f.w/2,f.w/2),y:f.y+f.h/2+rand(-f.h/2,f.h/2)}}break}
    case 'floor':for(let k=0;k<20;k++){const q={x:rand(50,ROOM_W-50),y:rand(50,ROOM_H-50)};if(Math.hypot(q.x-P.x,q.y-P.y)>230){p=q;break}}break;
    case 'line':{const s=ctx.side;if(s===0)p={x:30,y:60+(ROOM_H-120)*(i+.5)/n};else if(s===1)p={x:ROOM_W-30,y:60+(ROOM_H-120)*(i+.5)/n};else p={x:60+(ROOM_W-120)*(i+.5)/n,y:30};break}
  }
  if(p){p.x=clamp(p.x,30,ROOM_W-30);p.y=clamp(p.y,30,ROOM_H-30);if(Math.hypot(p.x-P.x,p.y-P.y)<200)p=null}
  return p||spawnPoint(240);
}
function spawnWave(w){
  const pat=w.pat||'edges',ctx={a0:rand(0,TAU),side:P.x<ROOM_W*.35?1:P.x>ROOM_W*.65?0:(Math.random()<.5?0:1)};if(pat==='line'&&Math.random()<.3)ctx.side=2;
  let delay=0;const n=w.e.length;
  w.e.forEach((e,i)=>{
    if(e.tp==='mimic'){const p=patPoint('floor',i,n,ctx);const g=spawnGhost('mimic',p.x,p.y,{elite:e.elite,spawnT:0});g.hidden=true;g.alpha=1;g.hideT=0;g.litAcc=0;return}
    const p=pat==='front'?{x:P.x+rand(-20,20),y:Math.max(60,P.y-170)}:patPoint(pat,i,n,ctx);
    const grp=GT[e.tp].group||1;
    for(let j=0;j<grp;j++){spawnGhost(e.tp,clamp(p.x+(grp>1?rand(-26,26):0),20,ROOM_W-20),clamp(p.y+(grp>1?rand(-26,26):0),20,ROOM_H-20),{elite:e.elite&&grp===1,slow:e.slow,spawnT:(pat==='front'?.5:.9)+delay});delay+=grp>1?.03:.07}
  });
  SFX.tele();
}
function spawnTrickle(cnt){const pool=poolFor(room);for(let i=0;i<cnt;i++){const tp=wpick(pool);if(tp==='mimic')continue;const p=Math.random()<.5?spawnPoint(250):patPoint('floor',0,1,{});const grp=GT[tp].group||1;for(let j=0;j<grp;j++)spawnGhost(tp,clamp(p.x+rand(-20,20),20,ROOM_W-20),clamp(p.y+rand(-20,20),20,ROOM_H-20),{spawnT:.8,elite:Math.random()<.06+room.c*.02})}}
function spawnGolden(hunt){const p=spawnPoint(200);const g=spawnGhost('golden',p.x,p.y,{spawnT:.4});g.life=0;if(hunt){g.hunt=true;g.spd*=.9}else{floatText(P.x,P.y-60,t('goldenSpot'),'#e8c870',20);SFX.jackpot()}return g}
function addDrop(kind,x,y,val){const a=rand(0,TAU),sp=rand(70,190);DROPS.push({kind,x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,z:4,vz:rand(140,240),val:val||1,t:0,mag:false,col:pick(CANDYCOLS),rot:rand(0,TAU)})}
function fireOrb(x,y,a,sp,kind){ORBS.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,t:0,near:false,hp:.4,kind:kind||'goo',rot:rand(0,6)});SFX.shot()}
function floatText(x,y,text,col,size){TXT.push({x,y,text,col:col||'#efe6d2',t:0,dur:1.1,size:size||18})}
function showBanner(text,sub,dur,col){banner={text,sub:sub||'',t:0,dur:dur||1.4,col:col||'#efe6d2'}}
function shake(a){if(S.shake)shakeA=Math.max(shakeA,a)}
function flash(r,g,b,a){flashC=r+','+g+','+b;flashA=Math.max(flashA,a)}
function puff(x,y,r,col,n){for(let i=0;i<n;i++){const a=rand(0,TAU),s=rand(20,70);FX.push({x:x+Math.cos(a)*r*.5,y:y+Math.sin(a)*r*.5,vx:Math.cos(a)*s,vy:Math.sin(a)*s-10,t:0,dur:rand(.6,1.1),sz:rand(6,13),col,k:'mist'})}}
function sparks(x,y,col,n,sp){for(let i=0;i<n;i++){const a=rand(0,TAU),s=rand(60,sp||260);FX.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,t:0,dur:rand(.3,.7),sz:rand(1.6,3.4),col,k:'spark',glow:true})}}
function wisps(x,y,col,n){for(let i=0;i<n;i++){FX.push({x:x+rand(-12,12),y:y+rand(-12,12),vx:rand(-30,30),vy:rand(-90,-40),t:0,dur:rand(.6,1.2),sz:rand(3,6),col,k:'wisp',glow:true,ph:rand(0,6)})}}
function confetti(x,y,n){for(let i=0;i<n;i++){const a=rand(-Math.PI,0),s=rand(120,360);FX.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,t:0,dur:rand(.9,1.6),sz:rand(1.5,3),col:'#f0d48a',k:'spark',glow:true,grav:420})}}

/* ---------- line of sight (furniture blocks light) ---------- */
function segRect(x1,y1,x2,y2,f){const m=4,minX=f.x+m,maxX=f.x+f.w-m,minY=f.y+m,maxY=f.y+f.h-m;let t0=0,t1=1;const dx=x2-x1,dy=y2-y1;
  const p=[-dx,dx,-dy,dy],q=[x1-minX,maxX-x1,y1-minY,maxY-y1];
  for(let i=0;i<4;i++){if(p[i]===0){if(q[i]<0)return false}else{const r=q[i]/p[i];if(p[i]<0){if(r>t1)return false;if(r>t0)t0=r}else{if(r<t0)return false;if(r<t1)t1=r}}}return true}
function losClear(x1,y1,x2,y2){for(const f of room.furn)if(segRect(x1,y1,x2,y2,f))return false;return true}
function seesGhost(g){const dx=g.x-P.x,dy=g.y-P.y,d=Math.hypot(dx,dy)||1,k=Math.max(0,d-g.r*.8)/d;return losClear(P.x,P.y,P.x+dx*k,P.y+dy*k)}

/* ---------- player ---------- */
function moveInput(){let mx=0,my=0;
  if(KEY.KeyA||KEY.ArrowLeft||KEY.KeyQ)mx--;if(KEY.KeyD||KEY.ArrowRight)mx++;if(KEY.KeyW||KEY.ArrowUp||KEY.KeyZ)my--;if(KEY.KeyS||KEY.ArrowDown)my++;
  if(stick.on){mx=stick.dx;my=stick.dy}
  const m=Math.hypot(mx,my);if(m>1){mx/=m;my/=m}return[mx,my,Math.min(1,m)]}
function doDash(){
  if(P.dashCd>0||P.dash>0)return;
  let [mx,my,m]=moveInput();if(m<.2){mx=Math.cos(P.aim);my=Math.sin(P.aim)}else{const k=Math.hypot(mx,my);mx/=k;my/=k}
  P.dash=.19;P.dashCd=P.dashCdMax;P.dvx=mx*P.speed*3.3;P.dvy=my*P.speed*3.3;P.inv=Math.max(P.inv,.28);
  R.dashes++;mProg('dash',1);SFX.dash();puff(P.x,P.y+8,10,'#6a6070',6);
}
function collideRect(o,f){
  const cx=clamp(o.x,f.x,f.x+f.w),cy=clamp(o.y,f.y+4,f.y+f.h);const dx=o.x-cx,dy=o.y-cy,d2=dx*dx+dy*dy;
  if(d2>=o.r*o.r)return;
  if(d2>0){const d=Math.sqrt(d2);o.x=cx+dx/d*o.r;o.y=cy+dy/d*o.r}
  else{const l=o.x-f.x,r=f.x+f.w-o.x,u=o.y-f.y,b=f.y+f.h-o.y,m=Math.min(l,r,u,b);if(m===l)o.x=f.x-o.r;else if(m===r)o.x=f.x+f.w+o.r;else if(m===u)o.y=f.y-o.r;else o.y=f.y+f.h+o.r}
}
function updPlayer(dt){
  const [mx,my,m]=moveInput();
  P.mv=m>.1||P.dash>0;
  if(R&&R.tut&&!R.tutMv&&m>.1){R.tutMoved+=dt;if(R.tutMoved>.7){R.tutMv=true;measure('tutorial','move','complete');measure('tutorial','move-after',R.time<3?'s0-3':R.time<8?'s3-8':R.time<20?'s8-20':'s20+')}}
  const sug=(L('sugar')&&R.combo>=5)?1+.1*L('sugar'):1;
  if(P.dash>0){P.dash-=dt;P.x+=P.dvx*dt;P.y+=P.dvy*dt;
    if(L('salt')){P.saltT-=dt;if(P.saltT<=0){P.saltT=.025;HZ.push({k:'salt',x:P.x+rand(-6,6),y:P.y+8+rand(-4,4),t:0,dur:2.6,dps:(10+6*L('salt'))*P.pw})}}
    if(Math.random()<.6)FX.push({x:P.x,y:P.y,vx:0,vy:0,t:0,dur:.25,sz:14,col:'rgba(160,150,190,.25)',k:'ghostimg'});
  }else{const sp=P.speed*sug;const k=1-Math.exp(-(room.tw==='cold'?3.2:16)*dt);P.vx=lerp(P.vx,mx*sp,k);P.vy=lerp(P.vy,my*sp,k);P.x+=P.vx*dt;P.y+=P.vy*dt}
  for(const f of room.furn)collideRect(P,f);
  P.x=clamp(P.x,P.r,ROOM_W-P.r);
  let minY=P.r;
  if(room.phase==='clear')for(const d of room.doors)if(Math.abs(P.x-d.x)<40)minY=-40;
  P.y=clamp(P.y,minY,ROOM_H-P.r);
  P.dashCd-=dt;P.inv-=dt;P.t+=dt*(P.mv?1:.5);
  if(room.tw==='cold'&&Math.random()<dt*1.2)FX.push({x:P.x+Math.cos(P.aim)*6,y:P.y-16,vx:Math.cos(P.aim)*20,vy:-12,t:0,dur:1,sz:5,col:'#c8d8e8',k:'mist'});
  // aim
  let target=null;
  if(!touchMode&&performance.now()-mouse.last<2600){const w=screenToWorld(mouse.x,mouse.y);target=Math.atan2(w.y-P.y,w.x-P.x)}
  else{let best=null,bs=1e9;
    for(const g of G){if(g.dead||g.spawnT>0||g.hidden||(g.tp==='peeker'&&!g.lit&&dist2(g.x,g.y,P.x,P.y)>250*250))continue;
      const dx=g.x-P.x,dy=g.y-P.y,d=Math.hypot(dx,dy);if(d>P.beamLen*1.45)continue;
      const ad=Math.abs(angDiff(Math.atan2(dy,dx),P.aim));let sc=d*(1+ad*.55)-(g.boss?60:0)-(g.tp==='golden'?120:0)-(g.tele>0||g.wailT>0?80:0)-(g.tp==='drinker'?50:0);if(!seesGhost(g))sc+=400;if(sc<bs){bs=sc;best=g}}
    if(!best&&room.poss!==false)for(const f of room.furn)if(f.poss&&!f.poss.done){const fx=f.x+f.w/2,fy=f.y+f.h/2,d=Math.hypot(fx-P.x,fy-P.y);if(d<P.beamLen*1.3&&d<bs){bs=d;best={x:fx,y:fy}}}
    if(best)target=Math.atan2(best.y-P.y,best.x-P.x);else if(m>.1)target=Math.atan2(my,mx)}
  if(target!=null){const d=angDiff(target,P.aim),mt=(touchMode?8:11)*dt;P.aim+=clamp(d,-mt,mt)}
}
function hurtPlayer(){
  if(P.inv>0||P.dash>0||state!=='run')return;
  P.hearts--;P.inv=1.3;R.hitsRoom++;if(room.type!=='normal')R.flawlessBoss=false;
  shake(10);freezeT=Math.max(freezeT,.08);flash(160,20,30,.35);SFX.hurt();
  if(R.combo>=5)floatText(P.x,P.y-40,'×'+R.combo,'#8a8094',16);R.combo=0;R.comboT=0;
  for(const g of G){if(g.dead||g.boss||g.hidden)continue;const dx=g.x-P.x,dy=g.y-P.y,d=Math.hypot(dx,dy)||1;if(d<130){g.x+=dx/d*70;g.y+=dy/d*70;g.vx=dx/d*120;g.vy=dy/d*120}}
  if(room.tut&&P.hearts<1)P.hearts=1;
  if(P.hearts<=0)faint();
}
function faint(){
  if(L('angel')&&!R.angelUsed){R.angelUsed=true;measure('perk','angel','used');P.hearts=2;P.inv=2.2;scareAll(260,.9);showBanner(t('revived'),'',1.6,'#a8d8c0');SFX.level();return}
  state='dying';R.deathT=1.3;slowT=1.3;SFX.lose();gpStop();
  roomEv('fail');measure('run',runKey(),'fail');if(room.tut)measure('tutorial','intro','fail');
  measure('death',runKey(),'r'+R.room+'-'+(room.type!=='normal'?room.type:'w'+room.wave));
}
function scareAll(rad,f){BURSTS.push({x:P.x,y:P.y,r:rad,t:0,dur:.6,col:'255,250,235'});flash(255,250,235,.45);
  for(const g of G){if(g.dead||g.spawnT>0)continue;if(g.hidden){g.hidden=false}if(dist2(g.x,g.y,P.x,P.y)<rad*rad)hurtGhost(g,g.boss?g.hp*.08:g.hp*f+1)}
  for(const o of ORBS)o.dead=true}

/* ---------- light ---------- */
function getBeams(){
  let lm=R.lamp*(1-.38*R.drain)*(room.tw==='fog'?.84:1),dm=R.lamp*(1-.3*R.drain);
  const b=[{a:P.aim,len:P.beamLen*lm,ang:P.beamAng,dps:P.dps*dm,main:true}];
  if(L('twin'))b.push({a:P.aim+Math.PI,len:P.beamLen*(.5+.12*L('twin'))*lm,ang:P.beamAng*.8,dps:P.dps*(.45+.15*L('twin'))*dm});
  if(L('prism')){const off=P.beamAng*2+.14;for(const s of[-1,1])b.push({a:P.aim+s*off,len:P.beamLen*.82*lm,ang:P.beamAng*.6,dps:P.dps*(.35+.15*L('prism'))*dm})}
  return b}
function inBeam(b,x,y,r){if(b.len<=1)return 0;const dx=x-P.x,dy=y-P.y,d=Math.hypot(dx,dy);if(d>b.len+r)return 0;if(d<r)return 1;
  const half=b.ang+Math.asin(Math.min(1,r/d));return Math.abs(angDiff(Math.atan2(dy,dx),b.a))<half?(1+.5*(1-Math.min(1,d/b.len))):0}
function auraR(){return L('aura')?52+14*L('aura'):0}
function applyLight(dt){
  const beams=getBeams();R.beams=beams;
  const sug=(L('sugar')&&R.combo>=5)?1+.12*L('sugar'):1;
  const ar=auraR(),ad=(4+3*L('aura'))*P.pw,fd=(8+4*L('fire'))*P.pw;
  const rit=room.ritual?room.ritual.filter(rc=>rc.lit):[];const rdps=10*Math.sqrt(hpMul());
  for(const g of G){
    if(g.dead||g.spawnT>0)continue;
    let dmg=0,lit=false,vis=null;
    for(const b of beams){const k=inBeam(b,g.x,g.y,g.r*.9);if(k){if(vis===null)vis=seesGhost(g);if(vis){dmg+=b.dps*k;lit=true}}}
    if(ar&&dist2(g.x,g.y,P.x,P.y)<(ar+g.r)*(ar+g.r)){dmg+=ad;lit=true}
    for(const f of FIREF)if(dist2(f.x,f.y,g.x,g.y)<(g.r+13)*(g.r+13)){dmg+=fd;lit=true}
    for(const h of HZ){if(h.k==='candle'){if(dist2(h.x,h.y,g.x,g.y)<(h.r+g.r)*(h.r+g.r)){dmg+=h.dps;lit=true}}
      else if(h.k==='salt'&&dist2(h.x,h.y,g.x,g.y)<(16+g.r)*(16+g.r)){dmg+=h.dps*.1;g.slowT=.35}}
    for(const rc of rit)if(dist2(rc.x,rc.y,g.x,g.y)<(85+g.r)*(85+g.r)){dmg+=rdps;lit=true}
    if(g.hidden){if(lit)g.litAcc+=dt;continue}
    if(lit){g.litT=.12;if(!g.lit&&!g.seenLit&&L('jump')&&!g.boss){g.seenLit=true;hurtGhost(g,g.hp*.12*L('jump'));floatText(g.x,g.y-g.r-10,t('boo'),'#e8c870',14);SFX.boo()}g.seenLit=true;g.lit=true}
    else{g.litT-=dt;if(g.litT<=0)g.lit=false;g.fear=Math.max(0,g.fear-g.hp*.035*dt)}
    if(dmg>0&&!g.dead)hurtGhost(g,dmg*dt*sug,true);
  }
  for(const o of ORBS){if(o.dead||o.kind!=='goo')continue;for(const b of beams)if(inBeam(b,o.x,o.y,8)){o.hp-=dt*(b.main?1:.6);if(o.hp<=0){o.dead=true;sparks(o.x,o.y,'#b6ffcf',6,120);SFX.fizz()}break}}
  // possessed furniture
  for(const f of room.furn){if(!f.poss||f.poss.done)continue;const fx=f.x+f.w/2,fy=f.y+f.h/2,rr2=Math.min(f.w,f.h)/2;f.poss.lit=false;
    for(const b of beams){const k=inBeam(b,fx,fy,rr2);if(k){f.poss.fear+=b.dps*k*dt*.8*sug;f.poss.lit=true}}
    if(f.poss.fear>=f.poss.hp)exorcise(f)}
}
function exorcise(f){f.poss.done=true;const fx=f.x+f.w/2,fy=f.y+f.h/2;room.possDone=(room.possDone||0)+1;
  const tp=room.c>=2?pick(['sheet','moaner','wailer']):'sheet';const g=spawnGhost(tp,clamp(fx,30,ROOM_W-30),clamp(fy-f.h/2-14,30,ROOM_H-30),{spawnT:.15});g.fear=g.hp*.45;
  BURSTS.push({x:fx,y:fy,r:200,t:0,dur:.5,col:'200,180,255'});shake(6);SFX.exorcise();wisps(fx,fy,'#c8b8ff',14);floatText(fx,fy-30,t('freed'),'#c8b8ff',18)}
function hurtGhost(g,a,cont){
  if(g.dead)return;g.fear+=a;if(!cont)g.hitT=.08;
  if(g.fear>=g.hp)popGhost(g);
}
function popGhost(g){
  g.dead=true;
  if(g.boss){bossDefeated(g);return}
  if(g.tp==='golden'){goldenCaught(g);return}
  R.pops++;S.st.pops++;S.popped[g.tp]=(S.popped[g.tp]||0)+1;mProg('pop',1);
  if(!R.kinds[g.tp]){R.kinds[g.tp]=1;mProg('kinds',Object.keys(R.kinds).length,'max')}
  R.combo++;R.comboT=2.3;if(R.combo>R.maxCombo){R.maxCombo=R.combo;if(R.combo>S.st.maxCombo)S.st.maxCombo=R.combo}mProg('combo',R.combo,'max');
  const tiers=[5,10,20,35,50],ti=tiers.filter(x=>R.combo>=x).length-1;
  if(ti>R.comboTier&&ti>=0){R.comboTier=ti;measure1('combo','x'+tiers[ti],'reached');floatText(P.x,P.y-56,t('cw'+ti),['#a8d8c0','#a8c0e0','#c8a0e8','#e0a070','#f0d48a'][ti],20+ti*2);SFX.combo(ti);if(ti>=2)shake(4+ti)}
  if(R.tut&&!R.tutPop){R.tutPop=true;R.tutCandyT=2.6;measure('tutorial','first-pop','complete');measure('tutorial','first-pop-after',R.time<3?'s0-3':R.time<8?'s3-8':R.time<20?'s8-20':'s20+')}
  const big=g.r>20||g.elite;
  freezeT=Math.max(freezeT,big?.07:.03);shake(big?5:2);
  BURSTS.push({x:g.x,y:g.y,r:g.r*3.5+40,t:0,dur:.4,col:hexRgb(g.eye).join(',')});
  sparks(g.x,g.y,g.eye,big?12:7,big?280:200);wisps(g.x,g.y-g.r*.3,'#e8eef8',big?10:6);puff(g.x,g.y,g.r,'#9a96a8',4);
  SFX.pop(R.combo);
  for(let i=0;i<g.xp;i++)addDrop('soul',g.x,g.y,1);
  const cm=(1+Math.min(2,Math.floor(R.combo/10)*.5))*(room.tw==='haunt'?1.5:1);
  let cn=g.candy;const n=Math.floor(cn)+(Math.random()<cn%1?1:0);
  for(let i=0;i<n;i++){if(Math.random()<.07)addDrop('big',g.x,g.y,5*cm);else addDrop('candy',g.x,g.y,cm)}
  if(P.hearts<P.maxH&&Math.random()<.02)addDrop('heart',g.x,g.y,1);
  if(g.tp==='pumpkin')for(const s of[-1,1]){const m=spawnGhost('mini',g.x+s*14,g.y,{spawnT:.25});m.vx=s*160}
  if(L('bomb'))BOMBQ.push({x:g.x,y:g.y,r:58+16*L('bomb'),dmg:(7+6*L('bomb'))*P.pw*Math.sqrt(hpMul()),t:.05});
}
function goldenCaught(g){
  R.golden++;S.st.golden++;mProg('golden',1);S.popped.golden=(S.popped.golden||0)+1;
  freezeT=.1;shake(7);flash(255,220,140,.3);BURSTS.push({x:g.x,y:g.y,r:220,t:0,dur:.6,col:'255,215,120'});
  const n=g.hunt?randi(7,11)+R.room:randi(14,26);for(let i=0;i<n;i++)addDrop(i%3?'candy':'big',g.x,g.y,i%3?2:6);
  confetti(g.x,g.y,40);SFX.jackpot();
  if(g.hunt){room.huntCaught++;floatText(g.x,g.y-30,room.huntCaught+'/'+room.huntN,'#f0d48a',22)}else showBanner(t('jackpot'),t('gh_golden'),1.4,'#f0d48a');
}
function bossDefeated(g){
  boss=null;freezeT=.2;slowT=.9;shake(18);flash(255,250,235,.6);SFX.bigpop();
  BURSTS.push({x:g.x,y:g.y,r:520,t:0,dur:1,col:hexRgb(g.eye).join(',')});
  sparks(g.x,g.y,g.eye,40,480);wisps(g.x,g.y,'#e8eef8',40);confetti(g.x,g.y,60);
  S.st.bosses++;mProg('boss',1);R.bossKills++;if(R.flawlessBoss)S.st.flawless=1;
  const n=g.boss==='boss'?34:18;for(let i=0;i<n;i++)addDrop(i%3?'candy':'big',g.x,g.y,i%3?2:6);for(let i=0;i<10;i++)addDrop('soul',g.x,g.y,2);
  for(const o of G)if(!o.dead&&o!==g&&!o.clone){o.fear=o.hp;popGhost(o)}else if(o.clone)o.dead=true;
  ORBS.length=0;MUS.mode='calm';R.dark=0;
  if(g.boss==='mini')room.chest={x:clamp(g.x,120,ROOM_W-120),y:clamp(g.y,140,ROOM_H-120),open:false,t:0,boost:.8};
}

/* ---------- ghosts AI ---------- */
function updGhost(g,dt){
  if(g.spawnT>0){g.spawnT-=dt;g.alpha=clamp(1-g.spawnT/g.spawnMax,0,1);if(g.spawnT<=0){g.alpha=1;if(!S.seen[g.tp]&&BOOK.includes(g.tp))S.seen[g.tp]=1}return}
  g.life+=dt;g.hitT-=dt;
  g.trT-=dt;if(g.trT<=0){g.trT=.06;g.tr.push([g.x,g.y]);if(g.tr.length>5)g.tr.shift()}
  if(g.boss){updBoss(g,dt);return}
  const dx=P.x-g.x,dy=P.y-g.y,d=Math.hypot(dx,dy)||1,nx=dx/d,ny=dy/d;
  if(g.hidden){g.hideT+=dt;if(d<110||g.litAcc>.35||g.hideT>14){g.hidden=false;g.lit=true;g.vx=nx*320;g.vy=ny*320;S.seen.mimic=1;SFX.shriek();shake(4);floatText(g.x,g.y-30,t('boo'),'#e0a070',16);puff(g.x,g.y,g.r,'#d8c8a0',8)}return}
  let sp=g.spd;if(g.lit)sp*=Math.max(.25,1-.35-.15*L('chill'));if(g.slowT>0){g.slowT-=dt;sp*=.5}
  let tx=nx,ty=ny;
  const brave=room.phase==='fight'&&room.wave>=room.waves.length&&room.waveClock>22;
  if(brave)sp*=1.15;
  switch(g.tp){
    case 'flitter':{const s=Math.sin(g.life*5+g.ph)*1.3;tx=nx-ny*s;ty=ny+nx*s;break}
    case 'mote':{const s=Math.sin(g.life*9+g.ph)*1.6+Math.sin(g.life*3.3)*0.6;tx=nx-ny*s;ty=ny+nx*s;break}
    case 'moaner':{if(brave){break}if(d<160){tx=-nx;ty=-ny}else if(d<245){const sd=(g.ph>3?1:-1);tx=-ny*sd;ty=nx*sd}
      g.shotT-=dt;g.charging=g.shotT<.55;if(g.shotT<=0&&d<520){fireOrb(g.x,g.y,Math.atan2(dy,dx),165);g.shotT=rand(2.4,3.3)}break}
    case 'wailer':{if(g.wailT>0){sp=0;g.wailT-=dt;if(g.fear-g.wailF>g.hp*.25){g.wailT=0;g.wailCd=2.4;floatText(g.x,g.y-g.r-14,t('hushed'),'#a8c0e0',14);break}
        if(g.wailT<=0){HZ.push({k:'wail',x:g.x,y:g.y,r:g.r,max:330,spd:250,t:0,dur:1.4,hit:false});SFX.wail();shake(3);g.wailCd=rand(3.6,5)}break}
      g.wailCd-=dt;if(d<230&&!brave){tx=-ny*.6;ty=nx*.6;sp*=.5}if(g.wailCd<=0&&d<300){g.wailT=1;g.wailF=g.fear;SFX.tele()}break}
    case 'drinker':{if(d<190)R.drain=Math.max(R.drain,1-d/190);break}
    case 'peeker':{g.tpT-=dt;if(!brave&&g.tpT<=0&&d>170){const a=rand(0,TAU);g.x=clamp(P.x+Math.cos(a)*185,40,ROOM_W-40);g.y=clamp(P.y+Math.sin(a)*185,40,ROOM_H-40);g.tpT=rand(3,4.5);g.spawnT=g.spawnMax=.55;g.alpha=0;g.tr.length=0;puff(g.x,g.y,g.r,'#3a4a44',6);return}break}
    case 'shade':{g.dashCd-=dt;
      if(g.dashT>0){g.dashT-=dt;g.x+=g.dvx*dt;g.y+=g.dvy*dt;g.x=clamp(g.x,g.r,ROOM_W-g.r);g.y=clamp(g.y,g.r,ROOM_H-g.r);if(d<g.r*.8+P.r*.8)hurtPlayer();return}
      if(g.tele>0){g.tele-=dt;sp=0;if(g.tele<=0){g.dashT=.5;g.dvx=g.ax*440;g.dvy=g.ay*440}}
      else if(g.dashCd<=0&&d<340){g.tele=.75;g.ax=nx;g.ay=ny;g.dashCd=rand(3,4.5);SFX.tele()}break}
    case 'golden':{tx=-nx;ty=-ny;const cxd=ROOM_W/2-g.x,cyd=ROOM_H/2-g.y;if(g.x<120||g.x>ROOM_W-120||g.y<110||g.y>ROOM_H-110){tx+=cxd/300;ty+=cyd/300}
      if(g.life>(g.hunt?9.5:8.5)){g.alpha-=dt*2;if(g.alpha<=0){g.dead=true;floatText(g.x,g.y,t('escaped'),'#e8c870',16);if(g.hunt)room.huntEsc=(room.huntEsc||0)+1}}
      if(Math.random()<.3)FX.push({x:g.x+rand(-8,8),y:g.y+rand(-8,8),vx:0,vy:-20,t:0,dur:.6,sz:2,col:'#ffe27a',k:'spark',glow:true});break}
  }
  for(const o of G){if(o===g||o.dead||o.spawnT>0||o.hidden)continue;const ox=g.x-o.x,oy=g.y-o.y,od=ox*ox+oy*oy,mr=(g.r+o.r)*.85;if(od<mr*mr&&od>.01){const k=(mr-Math.sqrt(od))/mr;tx+=ox/Math.sqrt(od)*k*1.5;ty+=oy/Math.sqrt(od)*k*1.5}}
  const tl=Math.hypot(tx,ty)||1;tx/=tl;ty/=tl;
  const k=1-Math.exp(-3.5*dt);g.vx=lerp(g.vx,tx*sp,k);g.vy=lerp(g.vy,ty*sp,k);
  g.x+=g.vx*dt;g.y+=g.vy*dt;g.x=clamp(g.x,g.r,ROOM_W-g.r);g.y=clamp(g.y,g.r,ROOM_H-g.r);
  if(d<g.r*.78+P.r*.78){if(g.tp==='golden'){g.fear=g.hp;popGhost(g)}else hurtPlayer()}
}
function spawnBoss(kind){
  const def=kind==='boss'?room.ch.boss:room.ch.mini;
  const g=mkGhost('sheet',ROOM_W/2,ROOM_H/2-70,{spawnT:1.3});
  const base=kind==='boss'?560:250;
  g.hp=base*(R.mode==='story'?1+R.ch*.62:1+room.n*.07)*(.9+.1*R.dd);g.boss=kind;g.look=def.look;g.name=def.name;g.col=def.col;g.eye=def.eye;
  g.r=kind==='boss'?50:40;g.spd=kind==='boss'?46:54;g.pats=def.pat.slice();g.patT=2.4;g.pi=0;g.act=null;g.phase2=false;
  G.push(g);boss=g;puff(g.x,g.y,60,'#2a2438',20);
  showBanner(def.name,t(kind==='boss'?'bossTitle':'miniTitle'),1.8,'#e0a070');SFX.boss();MUS.mode='boss';
}
function updBoss(g,dt){
  const dx=P.x-g.x,dy=P.y-g.y,d=Math.hypot(dx,dy)||1;
  const enr=g.fear>g.hp*.5?1.35:1,c=room.vis;
  if(enr>1&&!g.phase2){g.phase2=true;showBanner(t('enraged'),g.name,1.2,'#e0a070');SFX.boss();g.pats.sort(()=>Math.random()-.5)}
  if(!g.act){
    const sp=g.spd*(g.lit?.7:1)*(d>280?1.8:1);const k=1-Math.exp(-2*dt);g.vx=lerp(g.vx,dx/d*sp,k);g.vy=lerp(g.vy,dy/d*sp,k);g.x+=g.vx*dt;g.y+=g.vy*dt;
    g.patT-=dt*enr;if(g.patT<=0){g.act={p:g.pats[g.pi++%g.pats.length],t:0,n:0};if(g.act.p==='charge'){g.ax=dx/d;g.ay=dy/d}SFX.tele()}
  }else{
    const a=g.act;a.t+=dt;
    switch(a.p){
      case 'ring':if(a.t>.7&&a.n===0||(enr>1&&a.t>1.25&&a.n===1)){a.n++;const n=10+2*c,off=rand(0,TAU);for(let i=0;i<n;i++)fireOrb(g.x,g.y,off+i*TAU/n,150+c*8);shake(4)}if(a.t>1.6)g.act=null;break;
      case 'spiral':if(a.t>.4){a.acc=(a.acc||0)+dt;while(a.acc>.11){a.acc-=.11;a.n++;const an=a.n*.38;fireOrb(g.x,g.y,an,140+c*6);fireOrb(g.x,g.y,an+Math.PI,140+c*6)}}if(a.t>2.2)g.act=null;break;
      case 'summon':if(a.t>.6&&a.n===0){a.n=1;const cnt=Math.min(3+Math.min(3,c),20-G.filter(o=>!o.dead).length);const pool=Object.keys(room.ch.pool).filter(k=>k!=='peeker'&&k!=='mimic');for(let i=0;i<cnt;i++){const an=i*TAU/cnt;const tp=pick(pool);const grp=GT[tp].group||1;for(let j=0;j<grp;j++)spawnGhost(tp,clamp(g.x+Math.cos(an)*90+rand(-10,10),40,ROOM_W-40),clamp(g.y+Math.sin(an)*90+rand(-10,10),40,ROOM_H-40),{spawnT:.7})}}if(a.t>1.1)g.act=null;break;
      case 'charge':if(a.t<.8){g.ax=lerp(g.ax,dx/d,.04);g.ay=lerp(g.ay,dy/d,.04);const l=Math.hypot(g.ax,g.ay)||1;g.ax/=l;g.ay/=l}else if(a.t<1.4){g.x+=g.ax*520*dt;g.y+=g.ay*520*dt;if(Math.random()<.5)puff(g.x,g.y,g.r,'#5a5068',1)}else g.act=null;break;
      case 'teleport':if(a.t<.45)g.alpha=1-a.t/.45*.9;else if(a.n===0){a.n=1;const an=rand(0,TAU),rd=rand(170,240);g.x=clamp(P.x+Math.cos(an)*rd,90,ROOM_W-90);g.y=clamp(P.y+Math.sin(an)*rd,90,ROOM_H-90);g.tr.length=0;puff(g.x,g.y,g.r,'#2a2438',12)}else{g.alpha=Math.min(1,.1+(a.t-.45)/.4);if(a.t>.9){g.alpha=1;g.act=null}}break;
      case 'wail':if(a.t>.9&&a.n===0){a.n=1;HZ.push({k:'wail',x:g.x,y:g.y,r:g.r,max:420,spd:260,t:0,dur:1.8,hit:false});SFX.wail();shake(6)}g.wailT=a.t<.9?1:0;if(a.t>1.3)g.act=null;break;
      case 'dark':if(a.n===0){a.n=1;R.dark=3.2;SFX.dark()}if(a.t>.6)g.act=null;break;
      case 'clones':if(a.t>.5&&a.n===0){a.n=1;for(const s of[-1,1]){const cl=spawnGhost('sheet',clamp(g.x+s*120,60,ROOM_W-60),g.y,{spawnT:.4});cl.look=g.look;cl.col=g.col;cl.eye=g.eye;cl.r=g.r*.8;cl.hp=g.hp*.06;cl.clone=true;cl.candy=0;cl.xp=1;cl.spd=70}}if(a.t>1)g.act=null;break;
    }
    if(!g.act)g.patT=rand(1.5,2.3);
  }
  g.x=clamp(g.x,g.r,ROOM_W-g.r);g.y=clamp(g.y,g.r,ROOM_H-g.r);
  if(d<g.r*.78+P.r*.78&&g.alpha>.5)hurtPlayer();
}

/* ---------- room-type logic ---------- */
function updRoomType(dt){
  const live=G.filter(g=>!g.dead&&g.tp!=='golden').length;
  const c=room.c;
  switch(room.rt){
    case 'waves':case 'swarm':case 'hunt':case 'poltergeist':{
      if(room.wave<room.waves.length){
        if(room.wave===0){room.waveDelay-=dt;if(room.waveDelay<=0){spawnWave(room.waves[0]);room.wave=1;room.waveClock=0;measure('wave',lvKey(),'w1')}}
        else{room.waveClock+=dt;const prev=room.waves[room.wave-1].e.length*(GT[room.waves[room.wave-1].e[0].tp].group||1);if(room.tut&&!R.tutPop&&room.waveClock<8){}else if(live<=Math.max(room.tut?0:1,Math.floor(prev*.3))||room.waveClock>13){spawnWave(room.waves[room.wave]);room.wave++;room.waveClock=0;measure('wave',lvKey(),'w'+room.wave);
          if(room.tut)measure('tutorial','wave'+room.wave,'reached');
          if(R.room===2&&R.ch===0&&R.mode==='story'&&!R.dashHinted&&room.wave===2){R.dashHinted=true;hint={text:t('tutDash'),t:0,dur:4.5}}}}
      }else room.waveClock+=dt;
      if(room.rt==='waves'&&!room.golden&&room.wave>0){room.goldenT-=dt;if(room.goldenT<=0){room.golden=true;if(Math.random()<.07+.03*L('lucky')+(R.room===3&&S.st.golden===0?.4:0))spawnGolden()}}
      if(room.wave>=room.waves.length&&room.waveClock>40)for(const g of G)if(!g.dead&&g.spawnT<=0&&g.tp!=='golden'){g.hidden=false;hurtGhost(g,g.hp*.05*dt,true)}
      let done=room.wave>=room.waves.length&&!G.some(g=>!g.dead&&g.tp!=='golden');
      if(room.rt==='hunt'){const runner=G.some(g=>g.hunt&&!g.dead);if(!runner&&room.huntLeft>0){room.huntT-=dt;if(room.huntT<=0){room.huntLeft--;spawnGolden(true);room.huntT=1.1;SFX.chime()}}done=done&&room.huntLeft===0&&!runner}
      if(room.rt==='poltergeist'){for(const f of room.furn){const p=f.poss;if(!p||p.done)continue;if(room.waveClock>25){p.fear+=p.hp*.025*dt;if(p.fear>=p.hp){exorcise(f);continue}}p.throwT-=dt*(p.lit?.5:1);if(p.throwT<=0){const fx=f.x+f.w/2,fy=f.y+f.h/2;fireOrb(fx,fy,Math.atan2(P.y-fy,P.x-fx)+rand(-.12,.12),210+c*12,pick(['book','plate','book']));p.throwT=rand(1.9,3)/(1+c*.08);SFX.whoosh()}}
        done=done&&room.furn.every(f=>!f.poss||f.poss.done)}
      if(done)roomCleared();break}
    case 'ritual':{const rc=room.ritual;let litN=0;
      for(const c2 of rc){if(c2.lit){litN++;continue}const d=Math.hypot(P.x-c2.x,P.y-c2.y);room.ritT=(room.ritT||0)+dt;if(d<52){c2.p+=dt/(room.ritT>60?.6:1.15);if(Math.random()<dt*8)sparks(c2.x,c2.y-20,'#ffb050',1,40);if(c2.p>=1){c2.lit=true;litN++;room.candles.push({x:c2.x,y:c2.y-22,ph:c2.ph,noHolder:true,ritual:true});BURSTS.push({x:c2.x,y:c2.y,r:150,t:0,dur:.5,col:'255,190,110'});SFX.ignite();floatText(c2.x,c2.y-44,litN+'/'+rc.length,'#f0c890',18);measure('ritual',lvKey(),'candle'+litN)}}else c2.p=Math.max(0,c2.p-dt*.15)}
      room.trickleT-=dt;if(room.trickleT<=0&&live<9+c*2){spawnTrickle(Math.random()<.35+c*.08?2:1);room.trickleT=Math.max(1.1,2.7-c*.25-litN*.12)}
      if(litN===rc.length){mProg('ritual',1);for(const g of G)if(!g.dead&&g.tp!=='golden'){g.hidden=false;g.spawnT=0;g.fear=g.hp;popGhost(g)}flash(255,200,140,.5);shake(10);showBanner(t('ritualDone'),'',1.4,'#f0c890');SFX.bigpop();roomCleared()}
      break}
    case 'survive':{if(!room.halfEv&&room.survT<room.survMax/2){room.halfEv=1;measure('survive',lvKey(),'half')}room.survT-=dt;room.trickleT-=dt;const k=1-room.survT/room.survMax;
      if(room.trickleT<=0&&live<12+c*2){spawnTrickle(1+(Math.random()<.4+k*.4?1:0)+(k>.7&&Math.random()<.3?1:0));room.trickleT=Math.max(.7,1.5-c*.12-k*.4)}
      if(room.survT<=0){for(const g of G)if(!g.dead&&g.tp!=='golden'){g.hidden=false;g.spawnT=0;g.fear=g.hp;popGhost(g)}flash(255,236,200,.6);showBanner(t('dawn'),'',1.4,'#f0d48a');SFX.bell();roomCleared()}break}
    case 'shrine':break;
  }
}
function updTwist(dt){
  R.lamp=1;
  if(R.dark>0){R.dark-=dt;R.lamp=R.dark>2.6?(Math.random()<.5?0:1):(R.dark>.3?.0:1-(R.dark/.3))}
  if(room.tw==='flicker'&&room.phase!=='clear'){room.flk=(room.flk==null?rand(4,6):room.flk)-dt;
    if(room.flk<0){R.lamp=0;if(room.flk<-1.3){room.flk=rand(5,8);SFX.click()}}else if(room.flk<.7)R.lamp=Math.random()<.5?.15:1}
  if(room.tw==='storm'){room.storm=(room.storm==null?rand(3,6):room.storm)-dt;if(room.storm<=0){room.storm=rand(6,11);room.light=.5;flash(200,210,255,.35);
      for(const g of G)if(!g.dead&&!g.boss&&g.spawnT<=0){hurtGhost(g,g.hp*.12);if(g.hidden)g.litAcc+=1}
      setTimeout(()=>SFX.thunder(),300+Math.random()*700)}}
  if(room.light>0)room.light=Math.max(0,room.light-dt*(room.light>.3?1.4:.6));
}

/* ---------- main update ---------- */
function update(dt){
  if(freezeT>0){freezeT-=dt;return}
  if(slowT>0){slowT-=dt;dt*=.35}
  gtime+=dt;const pt=R.time;R.time+=dt;R.drain=0;for(const q of [60,120,180,300,420,600,900])if(pt<q&&R.time>=q)measure('runtime',runKey(),'s'+q);
  updTwist(dt);
  updPlayer(dt);
  if(wantDash){wantDash=false;doDash()}
  if(L('strobe')){R.strobeT-=dt;if(R.strobeT<=0){R.strobeT=4.4-.55*L('strobe');const rad=150+22*L('strobe');BURSTS.push({x:P.x,y:P.y,r:rad,t:0,dur:.4,col:'255,250,230'});SFX.strobe();
    for(const g of G)if(!g.dead&&g.spawnT<=0&&dist2(g.x,g.y,P.x,P.y)<rad*rad){if(g.hidden)g.litAcc+=1;else hurtGhost(g,(12+8*L('strobe'))*P.pw*Math.sqrt(hpMul())*(g.boss?.5:1))}}}
  if(L('candle')){R.candleT-=dt;if(R.candleT<=0){R.candleT=6.5-1.2*L('candle');HZ.push({k:'candle',x:P.x,y:P.y+6,t:0,dur:7,r:70,dps:(7+4*L('candle'))*P.pw,ph:rand(0,6)})}}
  for(let i=0;i<FIREF.length;i++){const a=R.time*2.5+i*TAU/FIREF.length,rd=72+FIREF.length*4;FIREF[i].x=P.x+Math.cos(a)*rd;FIREF[i].y=P.y-4+Math.sin(a)*rd*.85}
  if(room.phase==='fight'){
    if(room.type==='normal')updRoomType(dt);
    else{
      if(!room.bossSpawned){room.bossT-=dt;if(room.bossT<=0){room.bossSpawned=true;spawnBoss(room.type)}}
      else if(!G.some(g=>!g.dead&&g.tp!=='golden'&&!g.clone))roomCleared();
    }
  }
  if(room.phase==='shrine'&&room.altar&&!room.altar.used&&Math.hypot(P.x-room.altar.x,P.y-room.altar.y)<54&&!trans){room.altar.used=true;openShrine();return}
  if(room.phase==='clear'){room.clearT+=dt;
    if(room.final&&room.clearT>2.2&&state==='run'){chapterWin();return}
    if(!room.final)for(const d of room.doors)if(Math.abs(P.x-d.x)<40&&P.y<-6&&!trans){enterDoor(d);break}
    if(room.tut&&!room.final&&room.clearT>6&&!trans&&!R.wantCards&&room.doors.length){const d=nearestDoor();measure('tutorial','door','auto');enterDoor(d)}
  }
  for(const g of G)updGhost(g,dt);
  applyLight(dt);
  for(const b of BOMBQ){b.t-=dt;if(b.t<=0&&!b.done){b.done=true;BURSTS.push({x:b.x,y:b.y,r:b.r,t:0,dur:.3,col:'255,190,210'});sparks(b.x,b.y,'#ff9ad5',6,200);
    for(const g of G)if(!g.dead&&g.spawnT<=0&&!g.hidden&&dist2(g.x,g.y,b.x,b.y)<(b.r+g.r)*(b.r+g.r))hurtGhost(g,g.boss?b.dmg*.4:b.dmg)}}
  BOMBQ=BOMBQ.filter(b=>!b.done);
  G=G.filter(g=>!g.dead);
  for(const o of ORBS){if(o.dead)continue;o.t+=dt;o.x+=o.vx*dt;o.y+=o.vy*dt;o.rot+=dt*(o.kind==='goo'?0:9);
    if(o.t>7||o.x<-30||o.x>ROOM_W+30||o.y<-30||o.y>ROOM_H+30){o.dead=true;continue}
    if(o.kind!=='goo'&&o.t>.15&&inFurn(o.x,o.y,0)){o.dead=true;puff(o.x,o.y,6,'#8a8070',4);SFX.thud();continue}
    const d=Math.hypot(o.x-P.x,o.y-P.y);
    if(d<8+P.r*.7&&P.inv<=0&&P.dash<=0){o.dead=true;hurtPlayer();continue}
    if(d<8+P.r+18)o.near=true;else if(o.near&&d>8+P.r+34&&!o.nearDone){o.nearDone=true;if(state==='run'){floatText(P.x,P.y-36,t('close'),'#b8d8e8',14);R.comboT=Math.max(R.comboT,1.2);SFX.near()}}}
  ORBS=ORBS.filter(o=>!o.dead);
  for(const d of DROPS){d.t+=dt;d.rot+=dt*3;
    if(!d.mag){d.x+=d.vx*dt;d.y+=d.vy*dt;const k=Math.exp(-3.2*dt);d.vx*=k;d.vy*=k;d.vz-=620*dt;d.z+=d.vz*dt;if(d.z<0){d.z=0;d.vz=-d.vz*.42}
      d.x=clamp(d.x,8,ROOM_W-8);d.y=clamp(d.y,8,ROOM_H-8);
      if(d.t>.35&&(room.phase==='clear'||dist2(d.x,d.y,P.x,P.y)<P.magnet*P.magnet||(d.kind==='soul'&&d.t>2.5)))d.mag=true}
    else{const dx=P.x-d.x,dy=P.y-d.y,dd=Math.hypot(dx,dy)||1;const sp=Math.min(900,240+d.t*500);d.x+=dx/dd*sp*dt;d.y+=dy/dd*sp*dt;d.z=Math.max(0,d.z-dt*60);
      if(dd<P.r+10){d.dead=true;collect(d)}}}
  DROPS=DROPS.filter(d=>!d.dead);
  if(room.chest){const c=room.chest;c.t+=dt;if(!c.open&&dist2(c.x,c.y,P.x,P.y)<40*40){c.open=true;c.ot=0}
    if(c.open&&!c.done){c.ot+=dt;if(Math.floor(c.ot*10)!==Math.floor((c.ot-dt)*10))SFX.chest(Math.floor(c.ot*10));if(c.ot>.75){c.done=true;openChest(c)}}}
  for(const h of HZ){h.t+=dt;if(h.k==='wail'){h.r+=h.spd*dt;const d=Math.hypot(P.x-h.x,P.y-h.y);if(!h.hit&&h.r<h.max&&Math.abs(d-h.r)<12+P.r*.5){h.hit=true;hurtPlayer()}}}
  HZ=HZ.filter(h=>h.t<h.dur&&!(h.k==='wail'&&h.r>h.max));
  for(const f of FX){f.t+=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;if(f.grav)f.vy+=f.grav*dt;else{f.vx*=.94;f.vy*=.94}}FX=FX.filter(f=>f.t<f.dur);
  if(FX.length>600)FX.splice(0,FX.length-600);
  for(const b of BURSTS)b.t+=dt;BURSTS=BURSTS.filter(b=>b.t<b.dur);
  for(const x of TXT){x.t+=dt;x.y-=dt*30}TXT=TXT.filter(x=>x.t<x.dur);
  if(R.comboT>0){R.comboT-=dt;if(R.comboT<=0){if(R.combo>=8){floatText(P.x,P.y-50,t('bestCombo')+' ×'+R.combo,'#8a8094',14)}R.combo=0;R.comboTier=-1}}
  if(R.candyChainT>0){R.candyChainT-=dt;if(R.candyChainT<=0)R.candyChain=0}
  if(R.tutCandyT>0)R.tutCandyT-=dt;
  R.ambT-=dt;if(R.ambT<=0){R.ambT=rand(6,14);SFX.amb(room.ch.amb)}
  updCam(dt);
  if(R.wantCards&&state==='run'&&!trans){R.wantCards=false;if(R.pendingCards>0)openCards()}
}
function collect(d){
  switch(d.kind){
    case 'soul':SFX.soul();gainXP(d.val);break;
    case 'candy':case 'big':{const v=d.val;R.candy+=v;mProg('candy',v);R.candyChain=(R.candyChain||0)+1;R.candyChainT=.35;SFX.candy(R.candyChain);if(d.kind==='big')floatText(P.x,P.y-30,'+'+Math.round(v),'#e8c870',14);break}
    case 'heart':if(P.hearts<P.maxH){P.hearts++;floatText(P.x,P.y-30,t('gotHeart'),'#d8505a',16)}SFX.pick();break;
  }
}
function gainXP(v){R.xp+=v;while(R.xp>=R.need){R.xp-=R.need;R.lvl++;R.need=xpNeed(R.lvl);R.pendingCards++;R.wantCards=true;SFX.level();BURSTS.push({x:P.x,y:P.y,r:130,t:0,dur:.45,col:'170,230,210'})}}
function openChest(c){
  sparks(c.x,c.y,'#f0d48a',20,280);BURSTS.push({x:c.x,y:c.y,r:160,t:0,dur:.5,col:'255,215,120'});shake(5);
  const r=wpick([['card',45],['candy',35],['heart',15],['jackpot',5]]);
  if(r==='card'){R.pendingCards++;R.cardBoost=c.boost;R.wantCards=true;SFX.level()}
  else if(r==='candy'){const n=randi(16,30);for(let i=0;i<n;i++)addDrop(i%4?'candy':'big',c.x,c.y,i%4?1:5);SFX.jackpot()}
  else if(r==='heart'){addDrop('heart',c.x,c.y,1);for(let i=0;i<10;i++)addDrop('candy',c.x,c.y,1);SFX.pick()}
  else{for(let i=0;i<28;i++)addDrop('big',c.x,c.y,5);confetti(c.x,c.y,60);showBanner(t('jackpot'),'',1.2,'#f0d48a');SFX.jackpot()}
}
function roomCleared(){
  room.phase='clear';room.clearT=0;SFX.clear();if(room.tut)room.light=.35;roomEv('complete');if(!R.hitsRoom)measure('flawless',rtKey(),'reached');
  S.st.rtypes=S.st.rtypes||{};if(room.type==='normal')S.st.rtypes[room.rt]=1;
  if(!room.final){setupDoors();showBanner(t('roomClear'),R.room===1&&R.ch===0&&R.mode==='story'?t('chooseDoor'):(room.pre?t('bossAhead'):''),1.5,'#a8d8c0')}
  else showBanner(t('chClear'),'',2,'#f0d48a');
  if(room.tut){S.tut=1;R.tut=0;save();measure('tutorial','intro','complete')}
  for(const o of ORBS)o.dead=true;
  checkTrophies();
}
function nearestDoor(){let b=null,bd=1e9;for(const d of room.doors){const dd=Math.abs(P.x-d.x)+P.y*.2;if(dd<bd){bd=dd;b=d}}return b}
function enterDoor(d){if(room.tut)measure('tutorial','door','complete');SFX.door();trans={t:0,dur:.7,mid:()=>nextRoom(d),fired:false}}
function chapterWin(){
  state='over';gpStop();MUS.mode='calm';
  const first=!S.clear[R.ch];S.clear[R.ch]=1;
  if(R.ch+2>S.unlocked&&R.ch<4){S.unlocked=R.ch+2}
  SFX.win();measure('run',runKey(),'complete');if(first)measure('milestone','clear-ch'+(R.ch+1),'reached');
  showOver(true,first);
}
function updCam(dt,snap){
  const vw=W/k,vh=H/k;let tx=P.x+Math.cos(P.aim)*24,ty=P.y+Math.sin(P.aim)*18;
  const minX=-WALL+vw/2,maxX=ROOM_W+WALL-vw/2,minY=-WALLT+vh/2,maxY=ROOM_H+WALL-vh/2;
  tx=minX>maxX?ROOM_W/2:clamp(tx,minX,maxX);ty=minY>maxY?(ROOM_H-WALLT+WALL)/2:clamp(ty,minY,maxY);
  if(snap){camX=tx;camY=ty}else{const kk=1-Math.exp(-7*dt);camX=lerp(camX,tx,kk);camY=lerp(camY,ty,kk)}
}

/* ---------- home demo (attract mode behind the menu) ---------- */
let demo=null;
function setupDemo(ch){
  const info={c:ch,vis:ch,type:'normal',final:false,total:10,pre:false};
  room=makeRoom(0,info,{demo:true,lay:ch===2?'pillars':ch===4?'aisles':'centerpiece'});room.phase='demo';
  P={x:ROOM_W/2,y:ROOM_H/2+70,vx:0,vy:0,r:14,aim:-Math.PI/2,hearts:3,inv:0,dash:0,dashCd:0,t:0,mv:false,beamLen:270,beamAng:.38,dps:30,pw:1,maxH:3,magnet:70};
  room.furn=room.furn.filter(f=>Math.hypot(f.x+f.w/2-P.x,f.y+f.h/2-P.y)>90);
  G=[];ORBS=[];DROPS=[];FX=[];TXT=[];HZ=[];BURSTS=[];FIREF=[];boss=null;
  demo={ch,t:0,spawnT:0};
  const tps=Object.keys(CH[ch].pool).filter(k=>k!=='mimic');for(let i=0;i<5;i++)demoSpawn(tps);
  camX=ROOM_W/2;camY=ROOM_H/2-20;
}
function demoSpawn(tps){const a=rand(0,TAU),d=rand(220,380);const g=mkGhost(pick(tps||Object.keys(CH[demo.ch].pool).filter(k=>k!=='mimic')),clamp(P.x+Math.cos(a)*d,50,ROOM_W-50),clamp(P.y+Math.sin(a)*d*.7,50,ROOM_H-50),{spawnT:.8});g.hp=30;g.spd*=.6;g.wa=rand(0,TAU);G.push(g)}
function updDemo(dt){
  gtime+=dt;demo.t+=dt;camX=ROOM_W/2;camY=ROOM_H/2-20;
  P.aim=-Math.PI/2+Math.sin(demo.t*.55)*1.5+Math.sin(demo.t*1.3)*.25;P.t+=dt*.5;
  const beams=[{a:P.aim,len:P.beamLen,ang:P.beamAng,dps:24,main:true}];R={beams,ab:{},combo:0,lamp:1,drain:0};
  for(const g of G){
    if(g.spawnT>0){g.spawnT-=dt;g.alpha=clamp(1-g.spawnT/g.spawnMax,0,1);continue}
    g.life+=dt;g.trT-=dt;if(g.trT<=0){g.trT=.06;g.tr.push([g.x,g.y]);if(g.tr.length>5)g.tr.shift()}
    const k=inBeam(beams[0],g.x,g.y,g.r)&&seesGhost(g);g.lit=!!k;
    if(k){g.fear+=24*dt;const dx=g.x-P.x,dy=g.y-P.y,d=Math.hypot(dx,dy)||1;g.vx=lerp(g.vx,dx/d*120,.1);g.vy=lerp(g.vy,dy/d*120,.1)}
    else{g.fear=Math.max(0,g.fear-6*dt);g.wa+=rand(-1,1)*dt*2;const dx=P.x-g.x,dy=P.y-g.y,d=Math.hypot(dx,dy)||1;const pull=d>260?.6:-.2;g.vx=lerp(g.vx,Math.cos(g.wa)*40+dx/d*40*pull,.05);g.vy=lerp(g.vy,Math.sin(g.wa)*40+dy/d*40*pull,.05)}
    g.x=clamp(g.x+g.vx*dt,40,ROOM_W-40);g.y=clamp(g.y+g.vy*dt,40,ROOM_H-40);
    if(g.fear>=g.hp){g.dead=true;sparks(g.x,g.y,g.eye,8,200);wisps(g.x,g.y,'#e8eef8',6);BURSTS.push({x:g.x,y:g.y,r:110,t:0,dur:.4,col:hexRgb(g.eye).join(',')});for(let i=0;i<3;i++)DROPS.push({kind:'candy',x:g.x,y:g.y,vx:rand(-90,90),vy:rand(-90,90),z:4,vz:rand(120,200),val:1,t:0,mag:false,col:pick(CANDYCOLS),rot:rand(0,6)})}
  }
  G=G.filter(g=>!g.dead);demo.spawnT-=dt;if(G.length<5&&demo.spawnT<=0){demoSpawn();demo.spawnT=1.2}
  for(const d of DROPS){d.t+=dt;d.x+=d.vx*dt;d.y+=d.vy*dt;d.vx*=.95;d.vy*=.95;d.vz-=600*dt;d.z=Math.max(0,d.z+d.vz*dt);if(d.z===0)d.vz=-d.vz*.4;if(d.t>2.2)d.dead=true}DROPS=DROPS.filter(d=>!d.dead);
  for(const f of FX){f.t+=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.vx*=.94;f.vy*=.94}FX=FX.filter(f=>f.t<f.dur);
  for(const b of BURSTS)b.t+=dt;BURSTS=BURSTS.filter(b=>b.t<b.dur);
}

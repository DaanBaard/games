/* ---------- world state ---------- */
let state='boot';
let R=null,P=null,room=null,boss=null;
let G=[],ORBS=[],DROPS=[],FX=[],TXT=[],HZ=[],FIREF=[],BURSTS=[],BOMBQ=[];
let freezeT=0,slowT=0,shakeA=0,shX=0,shY=0,camX=ROOM_W/2,camY=ROOM_H/2,flashA=0,flashC='255,255,255';
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
function hpMul(){if(R.mode==='story')return 1+R.ch*.42+(room.n-1)*.05;const n=room.n;return 1+n*.1+Math.pow(n/10,2)*.8}
function spdMul(){return R.mode==='story'?1+R.ch*.06+(room.n-1)*.012:1+Math.min(.4,room.n*.012)}

/* ---------- run flow ---------- */
function startRun(mode,ch){
  R={mode,ch,room:0,lvl:1,xp:0,need:xpNeed(1),candy:0,earned:0,pops:0,combo:0,comboT:0,maxCombo:0,comboTier:-1,ab:{},
    rerolls:1+S.shop.reroll,adReroll:true,revived:false,angelUsed:false,dd:1,hitsRoom:0,dashes:0,time:0,golden:0,bossKills:0,
    pendingCards:0,cardBoost:0,wantCards:false,strobeT:2.5,candleT:3,flawlessBoss:true,doubled:false,tut:(mode==='story'&&ch===0&&S.tut<1)?1:0,tutMoved:0,dashHinted:false,newRecord:false};
  P={x:ROOM_W/2,y:ROOM_H-50,vx:0,vy:0,r:14,aim:-Math.PI/2,hearts:3,inv:0,dash:0,dashCd:0,dvx:0,dvy:0,t:0,mv:false,saltT:0};
  FIREF=[];calcStats();P.hearts=P.maxH;
  S.st.runs++;save();
  G=[];ORBS=[];DROPS=[];FX=[];TXT=[];HZ=[];BURSTS=[];BOMBQ=[];
  MUS.mode='calm';
  nextRoom(null);
  measure('run','start',mode==='story'?'ch'+(ch+1):'night');
}
function roomInfo(n){
  if(R.mode==='story')return{c:R.ch,vis:R.ch,type:n===10?'boss':n===5?'mini':'normal',final:n===10,total:10,pre:n===4||n===9};
  return{c:Math.min(4,Math.floor((n-1)/6)),vis:Math.floor((n-1)/5)%5,type:n%10===0?'boss':n%5===0?'mini':'normal',final:false,total:0,pre:n%5===4};
}
function makeRoom(n,info,demo){
  const ch=CH[info.vis];
  const rm={n,...info,ch,furn:[],candles:[],doors:[],doorXs:info.pre?[ROOM_W/2]:[ROOM_W*.3,ROOM_W*.7],phase:'fight',waves:[],wave:0,waveDelay:1.1,waveClock:0,
    seed:(Math.random()*1e9)|0,golden:false,goldenT:rand(5,14),clearT:0,dark:ch.dark,windows:[],frames:[],bossSpawned:false,bossT:1.2,winT:-1};
  if(info.final&&!demo)rm.doorXs=[];
  const r=srng(rm.seed);
  // wall decoration avoiding doors
  for(const x of[120,880,500]){if(rm.doorXs.some(d=>Math.abs(d-x)<90))continue;(r()<.5?rm.windows:rm.frames).push(x)}
  // furniture
  const want=info.type==='normal'?2+Math.floor(r()*3):1+Math.floor(r()*2);
  let tries=0;
  while(rm.furn.length<want&&tries++<80){
    const type=ch.furn[Math.floor(r()*ch.furn.length)],[w,h]=FURN[type];
    const x=60+r()*(ROOM_W-120-w),y=70+r()*(ROOM_H-140-h);
    const f={type,x,y,w,h,ph:r()*6};
    const cx=x+w/2,cy=y+h/2;
    if(Math.hypot(cx-ROOM_W/2,cy-(ROOM_H-50))<170)continue;
    if(info.type!=='normal'&&Math.hypot(cx-ROOM_W/2,cy-ROOM_H/2)<200)continue;
    if(rm.doorXs.some(d=>Math.abs(cx-d)<w/2+70)&&y<150)continue;
    if(rm.furn.some(o=>x<o.x+o.w+40&&x+w+40>o.x&&y<o.y+o.h+40&&y+h+40>o.y))continue;
    rm.furn.push(f);
  }
  for(const f of rm.furn){
    if(f.type==='candelabra'){rm.candles.push({x:f.x+f.w*.3,y:f.y+f.h*.45,ph:r()*6},{x:f.x+f.w*.7,y:f.y+f.h*.45,ph:r()*6})}
    else if(r()<.45&&['table','dresser','tomb','bench','trunk','crate','piano','bookcase'].includes(f.type))rm.candles.push({x:f.x+f.w*(.2+r()*.6),y:f.y+f.h*.4,ph:r()*6});
  }
  while(rm.candles.length<2){const x=80+r()*(ROOM_W-160),y=90+r()*(ROOM_H-200);if(rm.furn.some(f=>x>f.x-10&&x<f.x+f.w+10&&y>f.y-10&&y<f.y+f.h+10))continue;rm.candles.push({x,y,ph:r()*6})}
  rm.res=0;
  return rm;
}
function buildWaves(rm){
  const n=rm.n,c=rm.c;
  if(R.tut&&n===1){rm.waves=[[{tp:'wisp',slow:true},{tp:'wisp',slow:true},{tp:'wisp',slow:true}],[{tp:'wisp'},{tp:'wisp'},{tp:'wisp'},{tp:'wisp'}],[{tp:'wisp'},{tp:'sheet'},{tp:'wisp'},{tp:'wisp'},{tp:'wisp'}]];rm.tut=true;return}
  let budget=R.mode==='story'?(6+n*1.7+c*3.2)*R.dd:(7+n*1.5+Math.pow(n,1.25)*.4)*R.dd*(1+n*.025);
  const pool=[];
  const addPool=ci=>{for(const k in CH[ci].pool){if(k==='flitter'&&ci===0&&n<3&&R.mode==='story')continue;const e=pool.find(p=>p[0]===k);if(e)e[1]+=CH[ci].pool[k]*.5;else pool.push([k,CH[ci].pool[k]])}};
  if(R.mode==='story')addPool(c);else for(let i=0;i<=c;i++)addPool(i);
  const nw=n<3?2:(n<7&&R.mode==='story')?2:3;
  const waves=[];for(let i=0;i<nw;i++)waves.push([]);
  const eliteP=R.mode==='story'?c*.035+n*.004:Math.min(.25,n*.008);
  let i=0;while(budget>0&&i<60){const tp=wpick(pool);waves[i%nw].push({tp,elite:Math.random()<eliteP});budget-=GT[tp].cost;i++}
  rm.waves=waves.filter(w=>w.length);
}
function nextRoom(rw){
  if(R.room>0){
    if(R.hitsRoom===0){R.dd=Math.min(1.25,R.dd+.035);mProg('clean',1)}else if(R.hitsRoom>=2)R.dd=Math.max(.85,R.dd-.05);
  }
  R.room++;R.hitsRoom=0;
  G=[];ORBS=[];DROPS=[];HZ=[];BURSTS=[];BOMBQ=[];boss=null;
  room=makeRoom(R.room,roomInfo(R.room));
  if(room.type==='normal')buildWaves(room);
  P.x=ROOM_W/2;P.y=ROOM_H-48;P.vx=P.vy=0;P.aim=-Math.PI/2;P.inv=Math.max(P.inv,.8);P.dash=0;
  updCam(0,true);
  mProg('room',R.room,'max');
  if(R.mode==='night'){if(R.room>S.nightBest){S.nightBest=R.room;if(R.room>1)R.newRecord=true}}
  else if(R.room>S.best[R.ch]){if(S.best[R.ch]>0)R.newRecord=true;S.best[R.ch]=R.room}
  if(room.type!=='normal'){R.flawlessBoss=true}
  const lbl=R.mode==='story'?t('roomOf',{n:R.room,m:10}):t('room',{n:R.room});
  showBanner(room.type==='boss'?t('bossTitle'):room.type==='mini'?t('miniTitle'):lbl,room.type!=='normal'?lbl:(R.room===1?t('ch'+R.ch)&&(R.mode==='story'?t('ch'+R.ch):t('nightmare')):''),1.4,room.type!=='normal'?'#ff9d5c':'#ffffff');
  if(rw)applyReward(rw);
  measure('room',String(R.room),R.mode==='story'?'ch'+(R.ch+1):'night');
  save();
}
function applyReward(rw){
  const px=P.x,py=P.y-60;
  switch(rw){
    case 'card':R.pendingCards++;R.cardBoost=.4;R.wantCards=true;break;
    case 'candy':{const n=10+R.room*2;for(let i=0;i<n;i++)addDrop(Math.random()<.15?'big':'candy',px,py,Math.random()<.15?5:1);floatText(px,py-20,t('gotCandy',{n:'~'+(n+Math.round(n*.6))}),'#ffcf3a',26);SFX.jackpot();break}
    case 'heart':if(P.hearts<P.maxH){P.hearts++;floatText(px,py,t('gotHeart'),'#ff5d8f',26)}else{for(let i=0;i<12;i++)addDrop('candy',px,py,1)}SFX.pick();break;
    case 'chest':room.chest={x:ROOM_W/2,y:ROOM_H-170,open:false,t:0,boost:.6};break;
    case 'mystery':{const r=wpick([['candy',30],['heart',18],['card',25],['chest',22],['jackpot',5]]);
      floatText(px,py-30,'?!','#c56bff',34);
      if(r==='jackpot'){for(let i=0;i<30;i++)addDrop('big',px,py,5);showBanner(t('jackpot'),'',1.2,'#ffcf3a');SFX.jackpot();confetti(px,py,50)}
      else applyReward(r);break}
    case 'boss':if(P.hearts<P.maxH)P.hearts++;floatText(px,py,t('rest'),'#5ef2c2',22);SFX.pick();break;
  }
}

/* ---------- entities ---------- */
function mkGhost(tp,x,y,o){
  const d=GT[tp],hm=R?hpMul():1;o=o||{};
  const g={tp,look:tp,x,y,vx:0,vy:0,r:d.r,hp:d.hp*hm,fear:0,spd:d.spd*(R?spdMul():1)*(o.slow?.6:1),xp:d.xp,candy:d.candy,eye:d.eye,col:d.col,elite:!!o.elite,
    spawnT:o.spawnT!=null?o.spawnT:.9,spawnMax:o.spawnT!=null?Math.max(o.spawnT,.01):.9,alpha:0,ph:rand(0,TAU),lit:false,litT:0,seenLit:false,dead:false,hitT:0,
    shotT:rand(1.6,3),tele:0,dashT:0,dashCd:rand(2,4),dvx:0,dvy:0,tpT:rand(2.5,4),life:0,boss:null,charging:false,slowT:0};
  if(g.elite){g.r*=1.3;g.hp*=2.4;g.xp*=3;g.candy*=3}
  return g;
}
function spawnGhost(tp,x,y,o){const g=mkGhost(tp,x,y,o);G.push(g);if(g.spawnT>0)puff(x,y,g.r,'#8a5cff',8);return g}
function spawnPoint(minD){
  for(let i=0;i<40;i++){const side=Math.floor(Math.random()*4);let x,y;
    if(side===0){x=rand(60,ROOM_W-60);y=rand(50,140)}else if(side===1){x=rand(60,ROOM_W-60);y=rand(ROOM_H-140,ROOM_H-50)}else if(side===2){x=rand(50,150);y=rand(60,ROOM_H-60)}else{x=rand(ROOM_W-150,ROOM_W-50);y=rand(60,ROOM_H-60)}
    if(Math.hypot(x-P.x,y-P.y)>=minD)return{x,y}}
  return{x:P.x<ROOM_W/2?ROOM_W-80:80,y:rand(80,ROOM_H-80)}
}
function spawnWave(w){
  let delay=0;for(const e of w){const p=spawnPoint(240);const g=spawnGhost(e.tp,p.x,p.y,{elite:e.elite,slow:e.slow,spawnT:.9+delay});delay+=.07}
  SFX.tele();
}
function spawnGolden(){const p=spawnPoint(200);const g=spawnGhost('golden',p.x,p.y,{spawnT:.4});g.life=0;floatText(P.x,P.y-60,t('goldenSpot'),'#ffcf3a',22);SFX.jackpot()}
function addDrop(kind,x,y,val){const a=rand(0,TAU),sp=rand(70,190);DROPS.push({kind,x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,z:4,vz:rand(140,240),val:val||1,t:0,mag:false,col:pick(CANDYCOLS),rot:rand(0,TAU)})}
function fireOrb(x,y,a,sp){ORBS.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,t:0,near:false,hp:.4});SFX.shot()}
function floatText(x,y,text,col,size){TXT.push({x,y,text,col:col||'#fff',t:0,dur:1.1,size:size||20})}
function showBanner(text,sub,dur,col){banner={text,sub:sub||'',t:0,dur:dur||1.4,col:col||'#fff'}}
function shake(a){if(S.shake)shakeA=Math.max(shakeA,a)}
function flash(r,g,b,a){flashC=r+','+g+','+b;flashA=Math.max(flashA,a)}
function puff(x,y,r,col,n){for(let i=0;i<n;i++){const a=rand(0,TAU),s=rand(20,70);FX.push({x:x+Math.cos(a)*r*.5,y:y+Math.sin(a)*r*.5,vx:Math.cos(a)*s,vy:Math.sin(a)*s-10,t:0,dur:rand(.5,.9),sz:rand(5,11),col,k:'mist'})}}
function sparks(x,y,col,n,sp){for(let i=0;i<n;i++){const a=rand(0,TAU),s=rand(60,sp||260);FX.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,t:0,dur:rand(.3,.7),sz:rand(2,4.5),col,k:'spark',glow:true})}}
function confetti(x,y,n){for(let i=0;i<n;i++){const a=rand(-Math.PI,0),s=rand(150,420);FX.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,t:0,dur:rand(.9,1.6),sz:rand(4,7),col:pick(CANDYCOLS),k:'conf',rot:rand(0,6),grav:600})}}

/* ---------- player ---------- */
function moveInput(){let mx=0,my=0;
  if(KEY.KeyA||KEY.ArrowLeft||KEY.KeyQ)mx--;if(KEY.KeyD||KEY.ArrowRight)mx++;if(KEY.KeyW||KEY.ArrowUp||KEY.KeyZ)my--;if(KEY.KeyS||KEY.ArrowDown)my++;
  if(stick.on){mx=stick.dx;my=stick.dy}
  const m=Math.hypot(mx,my);if(m>1){mx/=m;my/=m}return[mx,my,Math.min(1,m)]}
function doDash(){
  if(P.dashCd>0||P.dash>0)return;
  let [mx,my,m]=moveInput();if(m<.2){mx=Math.cos(P.aim);my=Math.sin(P.aim)}else{const k=Math.hypot(mx,my);mx/=k;my/=k}
  P.dash=.19;P.dashCd=P.dashCdMax;P.dvx=mx*P.speed*3.3;P.dvy=my*P.speed*3.3;P.inv=Math.max(P.inv,.28);
  R.dashes++;mProg('dash',1);SFX.dash();puff(P.x,P.y+8,10,'#bfb3ff',6);
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
  if(R&&R.tut===1&&m>.1){R.tutMoved+=dt;if(R.tutMoved>.7){R.tut=2}}
  const sug=(L('sugar')&&R.combo>=5)?1+.1*L('sugar'):1;
  if(P.dash>0){P.dash-=dt;P.x+=P.dvx*dt;P.y+=P.dvy*dt;
    if(L('salt')){P.saltT-=dt;if(P.saltT<=0){P.saltT=.025;HZ.push({k:'salt',x:P.x+rand(-6,6),y:P.y+8+rand(-4,4),t:0,dur:2.6,dps:(10+6*L('salt'))*P.pw})}}
    if(Math.random()<.6)FX.push({x:P.x,y:P.y,vx:0,vy:0,t:0,dur:.25,sz:14,col:'rgba(190,170,255,.35)',k:'ghostimg'});
  }else{const sp=P.speed*sug;const k=1-Math.exp(-16*dt);P.vx=lerp(P.vx,mx*sp,k);P.vy=lerp(P.vy,my*sp,k);P.x+=P.vx*dt;P.y+=P.vy*dt}
  for(const f of room.furn)collideRect(P,f);
  P.x=clamp(P.x,P.r,ROOM_W-P.r);
  let minY=P.r;
  if(room.phase==='clear')for(const d of room.doors)if(Math.abs(P.x-d.x)<40)minY=-40;
  P.y=clamp(P.y,minY,ROOM_H-P.r);
  P.dashCd-=dt;P.inv-=dt;P.t+=dt*(P.mv?1:.5);
  // aim
  let target=null;
  if(!touchMode&&performance.now()-mouse.last<2600){const w=screenToWorld(mouse.x,mouse.y);target=Math.atan2(w.y-P.y,w.x-P.x)}
  else{let best=null,bs=1e9;
    for(const g of G){if(g.dead||g.spawnT>0||(g.tp==='peeker'&&!g.lit&&dist2(g.x,g.y,P.x,P.y)>250*250))continue;
      const dx=g.x-P.x,dy=g.y-P.y,d=Math.hypot(dx,dy);if(d>P.beamLen*1.45)continue;
      const ad=Math.abs(angDiff(Math.atan2(dy,dx),P.aim));const sc=d*(1+ad*.55)-(g.boss?60:0)-(g.tp==='golden'?120:0)-(g.tele>0?80:0);if(sc<bs){bs=sc;best=g}}
    if(best)target=Math.atan2(best.y-P.y,best.x-P.x);else if(m>.1)target=Math.atan2(my,mx)}
  if(target!=null){const d=angDiff(target,P.aim),mt=(touchMode?8:11)*dt;P.aim+=clamp(d,-mt,mt)}
}
function hurtPlayer(){
  if(P.inv>0||P.dash>0||state!=='run')return;
  P.hearts--;P.inv=1.3;R.hitsRoom++;if(room.type!=='normal')R.flawlessBoss=false;
  shake(10);freezeT=Math.max(freezeT,.08);flash(255,70,120,.32);SFX.hurt();
  if(R.combo>=5)floatText(P.x,P.y-40,'x'+R.combo,'#a99cc9',18);R.combo=0;R.comboT=0;
  for(const g of G){if(g.dead||g.boss)continue;const dx=g.x-P.x,dy=g.y-P.y,d=Math.hypot(dx,dy)||1;if(d<130){g.x+=dx/d*70;g.y+=dy/d*70;g.vx=dx/d*120;g.vy=dy/d*120}}
  if(P.hearts<=0)faint();
}
function faint(){
  if(L('angel')&&!R.angelUsed){R.angelUsed=true;P.hearts=2;P.inv=2.2;scareAll(260,.9);showBanner(t('revived'),'',1.6,'#5ef2c2');SFX.level();return}
  state='dying';R.deathT=1.3;slowT=1.3;SFX.lose();gpStop();
  measure('run','faint','room'+R.room);
}
function scareAll(rad,f){BURSTS.push({x:P.x,y:P.y,r:rad,t:0,dur:.6,col:'255,255,255'});flash(255,255,255,.5);
  for(const g of G){if(g.dead||g.spawnT>0)continue;if(dist2(g.x,g.y,P.x,P.y)<rad*rad)hurtGhost(g,g.boss?g.hp*.08:g.hp*f+1)}
  for(const o of ORBS)o.dead=true}

/* ---------- light ---------- */
function getBeams(){
  const b=[{a:P.aim,len:P.beamLen,ang:P.beamAng,dps:P.dps,main:true}];
  if(L('twin'))b.push({a:P.aim+Math.PI,len:P.beamLen*(.5+.12*L('twin')),ang:P.beamAng*.8,dps:P.dps*(.45+.15*L('twin'))});
  if(L('prism')){const off=P.beamAng*2+.14;for(const s of[-1,1])b.push({a:P.aim+s*off,len:P.beamLen*.82,ang:P.beamAng*.6,dps:P.dps*(.35+.15*L('prism'))})}
  return b}
function inBeam(b,x,y,r){const dx=x-P.x,dy=y-P.y,d=Math.hypot(dx,dy);if(d>b.len+r)return 0;if(d<r)return 1;
  const half=b.ang+Math.asin(Math.min(1,r/d));return Math.abs(angDiff(Math.atan2(dy,dx),b.a))<half?(1+.5*(1-Math.min(1,d/b.len))):0}
function auraR(){return L('aura')?52+14*L('aura'):0}
function applyLight(dt){
  const beams=getBeams();R.beams=beams;
  const sug=(L('sugar')&&R.combo>=5)?1+.12*L('sugar'):1;
  const ar=auraR(),ad=(4+3*L('aura'))*P.pw,fd=(8+4*L('fire'))*P.pw;
  for(const g of G){
    if(g.dead||g.spawnT>0)continue;
    let dmg=0,lit=false;
    for(const b of beams){const k=inBeam(b,g.x,g.y,g.r*.9);if(k){dmg+=b.dps*k;lit=true}}
    if(ar&&dist2(g.x,g.y,P.x,P.y)<(ar+g.r)*(ar+g.r)){dmg+=ad;lit=true}
    for(const f of FIREF)if(dist2(f.x,f.y,g.x,g.y)<(g.r+13)*(g.r+13)){dmg+=fd;lit=true}
    for(const h of HZ){if(h.k==='candle'){if(dist2(h.x,h.y,g.x,g.y)<(h.r+g.r)*(h.r+g.r)){dmg+=h.dps;lit=true}}
      else if(h.k==='salt'&&dist2(h.x,h.y,g.x,g.y)<(16+g.r)*(16+g.r)){dmg+=h.dps*.1;g.slowT=.35}}
    if(lit){g.litT=.12;if(!g.lit&&!g.seenLit&&L('jump')&&!g.boss){g.seenLit=true;hurtGhost(g,g.hp*.12*L('jump'));floatText(g.x,g.y-g.r-10,t('boo'),'#ffd23f',16);SFX.boo()}g.seenLit=true;g.lit=true}
    else{g.litT-=dt;if(g.litT<=0)g.lit=false;g.fear=Math.max(0,g.fear-g.hp*.035*dt)}
    if(dmg>0&&!g.dead)hurtGhost(g,dmg*dt*sug,true);
  }
  // light melts goo orbs
  for(const o of ORBS){if(o.dead)continue;for(const b of beams)if(inBeam(b,o.x,o.y,8)){o.hp-=dt*(b.main?1:.6);if(o.hp<=0){o.dead=true;sparks(o.x,o.y,'#b6ffcf',6,120);SFX.fizz()}break}}
}
function hurtGhost(g,a,cont){
  if(g.dead)return;g.fear+=a;if(!cont)g.hitT=.08;
  if(g.fear>=g.hp)popGhost(g);
}
function popGhost(g){
  g.dead=true;
  if(g.boss){bossDefeated(g);return}
  if(g.tp==='golden'){goldenCaught(g);return}
  R.pops++;S.st.pops++;S.popped[g.tp]=(S.popped[g.tp]||0)+1;mProg('pop',1);
  R.combo++;R.comboT=2.3;if(R.combo>R.maxCombo){R.maxCombo=R.combo;if(R.combo>S.st.maxCombo)S.st.maxCombo=R.combo}mProg('combo',R.combo,'max');
  const tiers=[5,10,20,35,50],ti=tiers.filter(x=>R.combo>=x).length-1;
  if(ti>R.comboTier&&ti>=0){R.comboTier=ti;floatText(P.x,P.y-56,t('cw'+ti),['#5ef2c2','#7fb8ff','#c56bff','#ff8a2a','#ffcf3a'][ti],22+ti*3);SFX.combo(ti);if(ti>=2)shake(4+ti)}
  if(R.tut===2){R.tut=3;R.tutT=3.2}
  const big=g.r>20||g.elite;
  freezeT=Math.max(freezeT,big?.07:.03);shake(big?5:2.2);
  BURSTS.push({x:g.x,y:g.y,r:g.r*3.5+40,t:0,dur:.35,col:hexRgb(g.eye).join(',')});
  sparks(g.x,g.y,g.eye,big?16:10,big?320:240);puff(g.x,g.y,g.r,'#ffffff',5);
  SFX.pop(R.combo);
  for(let i=0;i<g.xp;i++)addDrop('soul',g.x,g.y,1);
  const cm=1+Math.min(2,Math.floor(R.combo/10)*.5);
  let cn=g.candy;const n=Math.floor(cn)+(Math.random()<cn%1?1:0);
  for(let i=0;i<n;i++){if(Math.random()<.07)addDrop('big',g.x,g.y,5*cm);else addDrop('candy',g.x,g.y,cm)}
  if(P.hearts<P.maxH&&Math.random()<.02)addDrop('heart',g.x,g.y,1);
  if(g.tp==='pumpkin')for(const s of[-1,1]){const m=spawnGhost('mini',g.x+s*14,g.y,{spawnT:.25});m.vx=s*160}
  if(L('bomb'))BOMBQ.push({x:g.x,y:g.y,r:58+16*L('bomb'),dmg:(7+6*L('bomb'))*P.pw*Math.sqrt(hpMul()),t:.05});
}
function goldenCaught(g){
  R.golden++;S.st.golden++;mProg('golden',1);S.popped.golden=(S.popped.golden||0)+1;
  freezeT=.12;shake(8);flash(255,220,120,.35);BURSTS.push({x:g.x,y:g.y,r:220,t:0,dur:.6,col:'255,215,90'});
  const n=randi(14,26);for(let i=0;i<n;i++)addDrop(i%3?'candy':'big',g.x,g.y,i%3?2:6);
  confetti(g.x,g.y,60);showBanner(t('jackpot'),t('gh_golden'),1.4,'#ffcf3a');SFX.jackpot();
}
function bossDefeated(g){
  boss=null;freezeT=.2;slowT=.9;shake(18);flash(255,255,255,.6);SFX.bigpop();
  BURSTS.push({x:g.x,y:g.y,r:520,t:0,dur:1,col:hexRgb(g.eye).join(',')});
  sparks(g.x,g.y,g.eye,50,520);confetti(g.x,g.y,80);
  S.st.bosses++;mProg('boss',1);R.bossKills++;if(R.flawlessBoss)S.st.flawless=1;
  const n=g.boss==='boss'?34:18;for(let i=0;i<n;i++)addDrop(i%3?'candy':'big',g.x,g.y,i%3?2:6);for(let i=0;i<10;i++)addDrop('soul',g.x,g.y,2);
  for(const o of G)if(!o.dead&&o!==g){o.fear=o.hp;popGhost(o)}
  ORBS.length=0;MUS.mode='calm';
  if(g.boss==='mini')room.chest={x:clamp(g.x,120,ROOM_W-120),y:clamp(g.y,140,ROOM_H-120),open:false,t:0,boost:.8};
}

/* ---------- ghosts AI ---------- */
function updGhost(g,dt){
  if(g.spawnT>0){g.spawnT-=dt;g.alpha=clamp(1-g.spawnT/g.spawnMax,0,1);if(g.spawnT<=0){g.alpha=1;if(!S.seen[g.tp]&&BOOK.includes(g.tp))S.seen[g.tp]=1}return}
  g.life+=dt;g.hitT-=dt;
  if(g.boss){updBoss(g,dt);return}
  const dx=P.x-g.x,dy=P.y-g.y,d=Math.hypot(dx,dy)||1,nx=dx/d,ny=dy/d;
  let sp=g.spd;if(g.lit)sp*=Math.max(.25,1-.35-.15*L('chill'));if(g.slowT>0){g.slowT-=dt;sp*=.5}
  let tx=nx,ty=ny;
  const brave=room.phase==='fight'&&room.wave>=room.waves.length&&room.waveClock>22;
  if(brave)sp*=1.15;
  switch(g.tp){
    case 'flitter':{const s=Math.sin(g.life*5+g.ph)*1.3;tx=nx-ny*s;ty=ny+nx*s;break}
    case 'moaner':{if(brave){break}if(d<160){tx=-nx;ty=-ny}else if(d<245){const sd=(g.ph>3?1:-1);tx=-ny*sd;ty=nx*sd}
      g.shotT-=dt;g.charging=g.shotT<.55;if(g.shotT<=0&&d<520){fireOrb(g.x,g.y,Math.atan2(dy,dx),165);g.shotT=rand(2.4,3.3)}break}
    case 'peeker':{g.tpT-=dt;if(!brave&&g.tpT<=0&&d>170){const a=rand(0,TAU);g.x=clamp(P.x+Math.cos(a)*185,40,ROOM_W-40);g.y=clamp(P.y+Math.sin(a)*185,40,ROOM_H-40);g.tpT=rand(3,4.5);g.spawnT=g.spawnMax=.55;g.alpha=0;puff(g.x,g.y,g.r,'#7dffcf',6);return}break}
    case 'shade':{g.dashCd-=dt;
      if(g.dashT>0){g.dashT-=dt;g.x+=g.dvx*dt;g.y+=g.dvy*dt;g.x=clamp(g.x,g.r,ROOM_W-g.r);g.y=clamp(g.y,g.r,ROOM_H-g.r);if(d<g.r*.8+P.r*.8)hurtPlayer();return}
      if(g.tele>0){g.tele-=dt;sp=0;if(g.tele<=0){g.dashT=.5;g.dvx=g.ax*440;g.dvy=g.ay*440}}
      else if(g.dashCd<=0&&d<340){g.tele=.75;g.ax=nx;g.ay=ny;g.dashCd=rand(3,4.5);SFX.tele()}break}
    case 'golden':{tx=-nx;ty=-ny;const cxd=ROOM_W/2-g.x,cyd=ROOM_H/2-g.y;if(g.x<120||g.x>ROOM_W-120||g.y<110||g.y>ROOM_H-110){tx+=cxd/300;ty+=cyd/300}
      if(g.life>8.5){g.alpha-=dt*2;if(g.alpha<=0){g.dead=true;floatText(g.x,g.y,t('escaped'),'#ffcf3a',18)}}
      if(Math.random()<.3)FX.push({x:g.x+rand(-8,8),y:g.y+rand(-8,8),vx:0,vy:-20,t:0,dur:.6,sz:3,col:'#ffe27a',k:'spark',glow:true});break}
  }
  // separation
  for(const o of G){if(o===g||o.dead||o.spawnT>0)continue;const ox=g.x-o.x,oy=g.y-o.y,od=ox*ox+oy*oy,mr=(g.r+o.r)*.85;if(od<mr*mr&&od>.01){const k=(mr-Math.sqrt(od))/mr;tx+=ox/Math.sqrt(od)*k*1.5;ty+=oy/Math.sqrt(od)*k*1.5}}
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
  g.r=kind==='boss'?50:40;g.spd=kind==='boss'?46:54;g.pats=def.pat;g.patT=2.4;g.pi=0;g.act=null;
  G.push(g);boss=g;puff(g.x,g.y,60,'#8a5cff',20);
  showBanner(def.name,t(kind==='boss'?'bossTitle':'miniTitle'),1.8,'#ff9d5c');SFX.boss();MUS.mode='boss';
}
function updBoss(g,dt){
  const dx=P.x-g.x,dy=P.y-g.y,d=Math.hypot(dx,dy)||1;
  const enr=g.fear>g.hp*.5?1.35:1,c=room.vis;
  if(!g.act){
    const sp=g.spd*(g.lit?.7:1)*(d>280?1.8:1);const k=1-Math.exp(-2*dt);g.vx=lerp(g.vx,dx/d*sp,k);g.vy=lerp(g.vy,dy/d*sp,k);g.x+=g.vx*dt;g.y+=g.vy*dt;
    g.patT-=dt*enr;if(g.patT<=0){g.act={p:g.pats[g.pi++%g.pats.length],t:0,n:0};if(g.act.p==='charge'){g.ax=dx/d;g.ay=dy/d}SFX.tele()}
  }else{
    const a=g.act;a.t+=dt;
    switch(a.p){
      case 'ring':if(a.t>.7&&a.n===0||(enr>1&&a.t>1.25&&a.n===1)){a.n++;const n=10+2*c,off=rand(0,TAU);for(let i=0;i<n;i++)fireOrb(g.x,g.y,off+i*TAU/n,150+c*8);shake(4)}if(a.t>1.6)g.act=null;break;
      case 'spiral':if(a.t>.4){a.acc=(a.acc||0)+dt;while(a.acc>.11){a.acc-=.11;a.n++;const an=a.n*.38;fireOrb(g.x,g.y,an,140+c*6);fireOrb(g.x,g.y,an+Math.PI,140+c*6)}}if(a.t>2.2)g.act=null;break;
      case 'summon':if(a.t>.6&&a.n===0){a.n=1;const cnt=Math.min(3+Math.min(3,c),20-G.filter(o=>!o.dead).length);const pool=Object.keys(room.ch.pool).filter(k=>k!=='peeker');for(let i=0;i<cnt;i++){const an=i*TAU/cnt;spawnGhost(pick(pool),clamp(g.x+Math.cos(an)*90,40,ROOM_W-40),clamp(g.y+Math.sin(an)*90,40,ROOM_H-40),{spawnT:.7})}}if(a.t>1.1)g.act=null;break;
      case 'charge':if(a.t<.8){g.ax=lerp(g.ax,dx/d,.04);g.ay=lerp(g.ay,dy/d,.04);const l=Math.hypot(g.ax,g.ay)||1;g.ax/=l;g.ay/=l}else if(a.t<1.4){g.x+=g.ax*520*dt;g.y+=g.ay*520*dt;if(Math.random()<.5)puff(g.x,g.y,g.r,'#b9a6ff',1)}else g.act=null;break;
      case 'teleport':if(a.t<.45)g.alpha=1-a.t/.45*.9;else if(a.n===0){a.n=1;const an=rand(0,TAU),rd=rand(170,240);g.x=clamp(P.x+Math.cos(an)*rd,90,ROOM_W-90);g.y=clamp(P.y+Math.sin(an)*rd,90,ROOM_H-90);puff(g.x,g.y,g.r,'#8a5cff',12)}else{g.alpha=Math.min(1,.1+(a.t-.45)/.4);if(a.t>.9){g.alpha=1;g.act=null}}break;
    }
    if(!g.act)g.patT=rand(1.5,2.3);
  }
  g.x=clamp(g.x,g.r,ROOM_W-g.r);g.y=clamp(g.y,g.r,ROOM_H-g.r);
  if(d<g.r*.78+P.r*.78&&g.alpha>.5)hurtPlayer();
}

/* ---------- main update ---------- */
function update(dt){
  if(freezeT>0){freezeT-=dt;return}
  if(slowT>0){slowT-=dt;dt*=.35}
  gtime+=dt;R.time+=dt;
  updPlayer(dt);
  if(wantDash){wantDash=false;doDash()}
  // abilities
  if(L('strobe')){R.strobeT-=dt;if(R.strobeT<=0){R.strobeT=4.4-.55*L('strobe');const rad=150+22*L('strobe');BURSTS.push({x:P.x,y:P.y,r:rad,t:0,dur:.4,col:'255,250,220'});SFX.strobe();
    for(const g of G)if(!g.dead&&g.spawnT<=0&&dist2(g.x,g.y,P.x,P.y)<rad*rad)hurtGhost(g,(12+8*L('strobe'))*P.pw*Math.sqrt(hpMul())*(g.boss?.5:1))}}
  if(L('candle')){R.candleT-=dt;if(R.candleT<=0){R.candleT=6.5-1.2*L('candle');HZ.push({k:'candle',x:P.x,y:P.y+6,t:0,dur:7,r:70,dps:(7+4*L('candle'))*P.pw,ph:rand(0,6)})}}
  for(let i=0;i<FIREF.length;i++){const a=R.time*2.5+i*TAU/FIREF.length,rd=72+FIREF.length*4;FIREF[i].x=P.x+Math.cos(a)*rd;FIREF[i].y=P.y-4+Math.sin(a)*rd*.85}
  // spawning
  if(room.phase==='fight'){
    if(room.type==='normal'){
      const live=G.filter(g=>!g.dead&&g.tp!=='golden').length;
      if(room.wave<room.waves.length){
        if(room.wave===0){room.waveDelay-=dt;if(room.waveDelay<=0){spawnWave(room.waves[0]);room.wave=1;room.waveClock=0}}
        else{room.waveClock+=dt;const prev=room.waves[room.wave-1].length;if(live<=Math.max(1,Math.floor(prev*.3))||room.waveClock>13){spawnWave(room.waves[room.wave]);room.wave++;room.waveClock=0;
          if(R.room===1&&R.ch===0&&R.mode==='story'&&!R.dashHinted&&room.wave===3){R.dashHinted=true;hint={text:t('tutDash'),t:0,dur:4.5}}}}
      }
      if(!room.golden&&room.wave>0){room.goldenT-=dt;if(room.goldenT<=0){room.golden=true;if(Math.random()<.07+.03*L('lucky')+(R.room===3&&S.st.golden===0?.4:0))spawnGolden()}}
      if(room.wave>=room.waves.length&&live===0)roomCleared();
    }else{
      if(!room.bossSpawned){room.bossT-=dt;if(room.bossT<=0){room.bossSpawned=true;spawnBoss(room.type)}}
      else if(!G.some(g=>!g.dead&&g.tp!=='golden'))roomCleared();
    }
  }
  if(room.phase==='clear'){room.clearT+=dt;
    if(room.final&&room.clearT>2.2&&state==='run'){chapterWin();return}
    if(!room.final)for(const d of room.doors)if(Math.abs(P.x-d.x)<40&&P.y<-6&&!trans){enterDoor(d);break}
  }
  for(const g of G)updGhost(g,dt);
  applyLight(dt);
  // bombs (deferred so chains feel like ripples)
  for(const b of BOMBQ){b.t-=dt;if(b.t<=0&&!b.done){b.done=true;BURSTS.push({x:b.x,y:b.y,r:b.r,t:0,dur:.3,col:'255,170,210'});sparks(b.x,b.y,'#ff9ad5',6,200);
    for(const g of G)if(!g.dead&&g.spawnT<=0&&dist2(g.x,g.y,b.x,b.y)<(b.r+g.r)*(b.r+g.r))hurtGhost(g,g.boss?b.dmg*.4:b.dmg)}}
  BOMBQ=BOMBQ.filter(b=>!b.done);
  G=G.filter(g=>!g.dead);
  // orbs
  for(const o of ORBS){if(o.dead)continue;o.t+=dt;o.x+=o.vx*dt;o.y+=o.vy*dt;
    if(o.t>7||o.x<-30||o.x>ROOM_W+30||o.y<-30||o.y>ROOM_H+30){o.dead=true;continue}
    const d=Math.hypot(o.x-P.x,o.y-P.y);
    if(d<8+P.r*.7&&P.inv<=0&&P.dash<=0){o.dead=true;hurtPlayer();continue}
    if(d<8+P.r+18)o.near=true;else if(o.near&&d>8+P.r+34&&!o.nearDone){o.nearDone=true;if(state==='run'){floatText(P.x,P.y-36,t('close'),'#b6f3ff',15);R.comboT=Math.max(R.comboT,1.2);SFX.near()}}}
  ORBS=ORBS.filter(o=>!o.dead);
  // drops
  for(const d of DROPS){d.t+=dt;d.rot+=dt*3;
    if(!d.mag){d.x+=d.vx*dt;d.y+=d.vy*dt;const k=Math.exp(-3.2*dt);d.vx*=k;d.vy*=k;d.vz-=620*dt;d.z+=d.vz*dt;if(d.z<0){d.z=0;d.vz=-d.vz*.42}
      d.x=clamp(d.x,8,ROOM_W-8);d.y=clamp(d.y,8,ROOM_H-8);
      if(d.t>.35&&(room.phase==='clear'||dist2(d.x,d.y,P.x,P.y)<P.magnet*P.magnet||(d.kind==='soul'&&d.t>2.5)))d.mag=true}
    else{const dx=P.x-d.x,dy=P.y-d.y,dd=Math.hypot(dx,dy)||1;const sp=Math.min(900,240+d.t*500);d.x+=dx/dd*sp*dt;d.y+=dy/dd*sp*dt;d.z=Math.max(0,d.z-dt*60);
      if(dd<P.r+10){d.dead=true;collect(d)}}}
  DROPS=DROPS.filter(d=>!d.dead);
  // chest
  if(room.chest){const c=room.chest;c.t+=dt;if(!c.open&&dist2(c.x,c.y,P.x,P.y)<40*40){c.open=true;c.ot=0}
    if(c.open&&!c.done){c.ot+=dt;if(Math.floor(c.ot*10)!==Math.floor((c.ot-dt)*10))SFX.chest(Math.floor(c.ot*10));if(c.ot>.75){c.done=true;openChest(c)}}}
  // hazards
  for(const h of HZ)h.t+=dt;HZ=HZ.filter(h=>h.t<h.dur);
  // fx
  for(const f of FX){f.t+=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;if(f.grav)f.vy+=f.grav*dt;else{f.vx*=.94;f.vy*=.94}}FX=FX.filter(f=>f.t<f.dur);
  if(FX.length>600)FX.splice(0,FX.length-600);
  for(const b of BURSTS)b.t+=dt;BURSTS=BURSTS.filter(b=>b.t<b.dur);
  for(const x of TXT){x.t+=dt;x.y-=dt*34}TXT=TXT.filter(x=>x.t<x.dur);
  // combo
  if(R.comboT>0){R.comboT-=dt;if(R.comboT<=0){if(R.combo>=8){floatText(P.x,P.y-50,t('bestCombo')+' x'+R.combo,'#a99cc9',16)}R.combo=0;R.comboTier=-1}}
  if(R.candyChainT>0){R.candyChainT-=dt;if(R.candyChainT<=0)R.candyChain=0}
  if(R.tut===3){R.tutT-=dt;if(R.tutT<=0)R.tut=4}
  updCam(dt);
  if(R.wantCards&&state==='run'&&!trans){R.wantCards=false;if(R.pendingCards>0)openCards()}
}
function collect(d){
  switch(d.kind){
    case 'soul':SFX.soul();gainXP(d.val);break;
    case 'candy':case 'big':{const v=d.val;R.candy+=v;mProg('candy',v);R.candyChain=(R.candyChain||0)+1;R.candyChainT=.35;SFX.candy(R.candyChain);if(d.kind==='big')floatText(P.x,P.y-30,'+'+Math.round(v),'#ffcf3a',16);break}
    case 'heart':if(P.hearts<P.maxH){P.hearts++;floatText(P.x,P.y-30,t('gotHeart'),'#ff5d8f',18)}SFX.pick();break;
  }
}
function gainXP(v){R.xp+=v;while(R.xp>=R.need){R.xp-=R.need;R.lvl++;R.need=xpNeed(R.lvl);R.pendingCards++;R.wantCards=true;SFX.level();BURSTS.push({x:P.x,y:P.y,r:130,t:0,dur:.45,col:'120,255,210'})}}
function openChest(c){
  sparks(c.x,c.y,'#ffcf3a',24,300);BURSTS.push({x:c.x,y:c.y,r:160,t:0,dur:.5,col:'255,215,90'});shake(5);
  const r=wpick([['card',45],['candy',35],['heart',15],['jackpot',5]]);
  if(r==='card'){R.pendingCards++;R.cardBoost=c.boost;R.wantCards=true;SFX.level()}
  else if(r==='candy'){const n=randi(16,30);for(let i=0;i<n;i++)addDrop(i%4?'candy':'big',c.x,c.y,i%4?1:5);SFX.jackpot()}
  else if(r==='heart'){addDrop('heart',c.x,c.y,1);for(let i=0;i<10;i++)addDrop('candy',c.x,c.y,1);SFX.pick()}
  else{for(let i=0;i<28;i++)addDrop('big',c.x,c.y,5);confetti(c.x,c.y,60);showBanner(t('jackpot'),'',1.2,'#ffcf3a');SFX.jackpot()}
}
function roomCleared(){
  room.phase='clear';room.clearT=0;SFX.clear();
  if(!room.final){setupDoors();showBanner(t('roomClear'),R.room===1&&R.ch===0&&R.mode==='story'?t('chooseDoor'):(room.pre?t('bossAhead'):''),1.5,'#5ef2c2')}
  else showBanner(t('chClear'),'',2,'#ffcf3a');
  if(room.tut){S.tut=1;R.tut=0;save()}
  for(const o of ORBS)o.dead=true;
}
function setupDoors(){
  if(room.pre){room.doors=[{x:ROOM_W/2,rw:'boss'}];return}
  const pool=[['card',40],['candy',25],['heart',P.hearts<P.maxH?22:5],['chest',14],['mystery',11]];
  const a=wpick(pool);let b=a;let n=0;while(b===a&&n++<20)b=wpick(pool);
  room.doors=[{x:room.doorXs[0],rw:a},{x:room.doorXs[1],rw:b}];
}
function enterDoor(d){SFX.door();trans={t:0,dur:.6,mid:()=>nextRoom(d.rw),fired:false}}
function chapterWin(){
  state='over';gpStop();MUS.mode='calm';
  const first=!S.clear[R.ch];S.clear[R.ch]=1;
  if(R.ch+2>S.unlocked&&R.ch<4){S.unlocked=R.ch+2}
  SFX.win();measure('run','win','ch'+(R.ch+1));
  showOver(true,first);
}
function updCam(dt,snap){
  const vw=W/k,vh=H/k;let tx=P.x+Math.cos(P.aim)*24,ty=P.y+Math.sin(P.aim)*18;
  const minX=-WALL+vw/2,maxX=ROOM_W+WALL-vw/2,minY=-WALL-58+vh/2,maxY=ROOM_H+WALL-vh/2;
  tx=minX>maxX?ROOM_W/2:clamp(tx,minX,maxX);ty=minY>maxY?ROOM_H/2-6:clamp(ty,minY,maxY);
  if(snap){camX=tx;camY=ty}else{const kk=1-Math.exp(-7*dt);camX=lerp(camX,tx,kk);camY=lerp(camY,ty,kk)}
}

/* ---------- home demo (attract mode behind the menu) ---------- */
let demo=null;
function setupDemo(ch){
  const info={c:ch,vis:ch,type:'normal',final:false,total:10,pre:false};
  room=makeRoom(0,info,true);room.doorXs=[ROOM_W*.3,ROOM_W*.7];room.phase='demo';
  P={x:ROOM_W/2,y:ROOM_H/2+40,vx:0,vy:0,r:14,aim:-Math.PI/2,hearts:3,inv:0,dash:0,dashCd:0,t:0,mv:false,beamLen:250,beamAng:.4,dps:30,pw:1,maxH:3,magnet:70};
  G=[];ORBS=[];DROPS=[];FX=[];TXT=[];HZ=[];BURSTS=[];FIREF=[];boss=null;
  demo={ch,t:0,spawnT:0};
  const tps=Object.keys(CH[ch].pool);for(let i=0;i<5;i++)demoSpawn(tps);
  camX=ROOM_W/2;camY=ROOM_H/2;
}
function demoSpawn(tps){const a=rand(0,TAU),d=rand(220,380);const g=mkGhost(pick(tps||Object.keys(CH[demo.ch].pool)),clamp(P.x+Math.cos(a)*d,50,ROOM_W-50),clamp(P.y+Math.sin(a)*d*.7,50,ROOM_H-50),{spawnT:.8});g.hp=30;g.spd*=.6;g.wa=rand(0,TAU);G.push(g)}
function updDemo(dt){
  gtime+=dt;demo.t+=dt;
  P.aim=-Math.PI/2+Math.sin(demo.t*.55)*1.5+Math.sin(demo.t*1.3)*.25;P.t+=dt*.5;
  const beams=[{a:P.aim,len:P.beamLen,ang:P.beamAng,dps:24,main:true}];R={beams,ab:{},combo:0};
  for(const g of G){
    if(g.spawnT>0){g.spawnT-=dt;g.alpha=clamp(1-g.spawnT/g.spawnMax,0,1);continue}
    g.life+=dt;const k=inBeam(beams[0],g.x,g.y,g.r);g.lit=!!k;
    if(k){g.fear+=24*dt;const dx=g.x-P.x,dy=g.y-P.y,d=Math.hypot(dx,dy)||1;g.vx=lerp(g.vx,dx/d*120,.1);g.vy=lerp(g.vy,dy/d*120,.1)}
    else{g.fear=Math.max(0,g.fear-6*dt);g.wa+=rand(-1,1)*dt*2;const dx=P.x-g.x,dy=P.y-g.y,d=Math.hypot(dx,dy)||1;const pull=d>260?.6:-.2;g.vx=lerp(g.vx,Math.cos(g.wa)*40+dx/d*40*pull,.05);g.vy=lerp(g.vy,Math.sin(g.wa)*40+dy/d*40*pull,.05)}
    g.x=clamp(g.x+g.vx*dt,40,ROOM_W-40);g.y=clamp(g.y+g.vy*dt,40,ROOM_H-40);
    if(g.fear>=g.hp){g.dead=true;sparks(g.x,g.y,g.eye,12,220);BURSTS.push({x:g.x,y:g.y,r:110,t:0,dur:.35,col:hexRgb(g.eye).join(',')});for(let i=0;i<3;i++)DROPS.push({kind:'candy',x:g.x,y:g.y,vx:rand(-90,90),vy:rand(-90,90),z:4,vz:rand(120,200),val:1,t:0,mag:false,col:pick(CANDYCOLS),rot:rand(0,6)})}
  }
  G=G.filter(g=>!g.dead);demo.spawnT-=dt;if(G.length<5&&demo.spawnT<=0){demoSpawn();demo.spawnT=1.2}
  for(const d of DROPS){d.t+=dt;d.x+=d.vx*dt;d.y+=d.vy*dt;d.vx*=.95;d.vy*=.95;d.vz-=600*dt;d.z=Math.max(0,d.z+d.vz*dt);if(d.z===0)d.vz=-d.vz*.4;if(d.t>2.2)d.dead=true}DROPS=DROPS.filter(d=>!d.dead);
  for(const f of FX){f.t+=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.vx*=.94;f.vy*=.94}FX=FX.filter(f=>f.t<f.dur);
  for(const b of BURSTS)b.t+=dt;BURSTS=BURSTS.filter(b=>b.t<b.dur);
}

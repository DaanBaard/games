/* ---------- rendering ---------- */
const cv=$('c'),ctx=cv.getContext('2d');
const dk=document.createElement('canvas'),dctx=dk.getContext('2d');
const lk=document.createElement('canvas'),lctx=lk.getContext('2d');
const gk=document.createElement('canvas'),gctx=gk.getContext('2d');
let vig=null;
let W=960,H=540,DPR=1,k=1;
const DS=.5;
const MOTES=[];for(let i=0;i<70;i++)MOTES.push({x:Math.random(),y:Math.random(),z:Math.random(),ph:Math.random()*6});
function resize(){
  W=innerWidth;H=innerHeight;DPR=Math.min(window.LOWQ?1:2,window.devicePixelRatio||1);
  cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);
  for(const c of[dk,lk,gk]){c.width=Math.max(1,Math.round(W*DPR*DS));c.height=Math.max(1,Math.round(H*DPR*DS))}
  k=Math.max(Math.min(W,H)/560,H>W?H/900:0);
  vig=[];const vw=Math.max(1,Math.round(W/2)),vh=Math.max(1,Math.round(H/2));
  for(let n=0;n<3;n++){const v=document.createElement('canvas');v.width=vw;v.height=vh;const vc=v.getContext('2d');
    const g=vc.createRadialGradient(vw/2,vh/2,Math.min(vw,vh)*.3,vw/2,vh/2,Math.hypot(vw,vh)*.55);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.7,'rgba(0,0,0,.28)');g.addColorStop(1,'rgba(0,0,0,.78)');vc.fillStyle=g;vc.fillRect(0,0,vw,vh);
    try{const id=vc.getImageData(0,0,vw,vh),d=id.data;for(let i=0;i<d.length;i+=4){d[i]=d[i+1]=d[i+2]=0;d[i+3]=Math.max(0,Math.min(255,d[i+3]+(Math.random()-.5)*34))}vc.putImageData(id,0,0)}catch(e){}
    vig.push(v)}
}
function screenToWorld(sx,sy){return{x:(sx-W/2)/k+camX,y:(sy-H/2)/k+camY}}
function worldXf(c,scale){const s=k*scale;c.setTransform(s,0,0,s,W*scale/2-(camX+shX)*s,H*scale/2-(camY+shY)*s)}

function shadowPoly(c,lx,ly,f){
  if(lx>f.x&&lx<f.x+f.w&&ly>f.y&&ly<f.y+f.h)return;
  const cs=[[f.x,f.y],[f.x+f.w,f.y],[f.x+f.w,f.y+f.h],[f.x,f.y+f.h]];const base=Math.atan2(f.y+f.h/2-ly,f.x+f.w/2-lx);
  let mn=null,mx=null,amn=1e9,amx=-1e9;for(const p of cs){const a=angDiff(Math.atan2(p[1]-ly,p[0]-lx),base);if(a<amn){amn=a;mn=p}if(a>amx){amx=a;mx=p}}
  const F=2400,e=(p)=>{const dx=p[0]-lx,dy=p[1]-ly,d=Math.hypot(dx,dy)||1;return[p[0]+dx/d*F,p[1]+dy/d*F]};const a=e(mn),b=e(mx);
  c.beginPath();c.moveTo(mn[0],mn[1]);c.lineTo(mx[0],mx[1]);c.lineTo(b[0],b[1]);c.lineTo(a[0],a[1]);c.closePath();c.fill();
}
function beamWedge(c,b,alpha,col,m){const L2=b.len*(m||1);const g=c.createRadialGradient(P.x,P.y,0,P.x,P.y,L2);g.addColorStop(0,col+alpha+')');g.addColorStop(.7,col+alpha*.8+')');g.addColorStop(1,col+'0)');
  c.fillStyle=g;c.beginPath();c.moveTo(P.x,P.y);c.arc(P.x,P.y,L2,b.a-b.ang*(m?1.3:1),b.a+b.ang*(m?1.3:1));c.closePath();c.fill()}

function render(dt){
  shakeA=Math.max(0,shakeA-dt*28);shX=shakeA?(Math.random()-.5)*shakeA:0;shY=shakeA?(Math.random()-.5)*shakeA:0;
  flashA=Math.max(0,flashA-dt*1.8);
  ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#050407';ctx.fillRect(0,0,cv.width,cv.height);
  if(!room)return;
  const need=Math.min(2.4,k*DPR);
  if(!room.cv||Math.abs(room.res-need)/need>.2)renderRoomStatic(room,need);
  worldXf(ctx,DPR);
  ctx.drawImage(room.cv,-WALL,-WALLT,ROOM_W+WALL*2,ROOM_H+WALL+WALLT);
  const tt=gtime;
  // open doorways
  if(room.phase==='clear')for(const d of room.doors){const w=86,h=WALLT-10,y=-WALLT+8;ctx.fillStyle=lin(ctx,0,y,0,y+h,[[0,'#020203'],[1,'#0e0b10']]);ctx.fillRect(d.x-w/2,y+2,w,h-2);
    ctx.fillStyle=woodP(ctx,'dark');ctx.save();ctx.translate(d.x-w/2,y+2);ctx.transform(1,0,.0,1,0,0);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-18,6);ctx.lineTo(-18,h+4);ctx.lineTo(0,h-2);ctx.closePath();ctx.fill();ctx.restore();
    ctx.save();ctx.translate(d.x+w/2,y+2);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(18,6);ctx.lineTo(18,h+4);ctx.lineTo(0,h-2);ctx.closePath();ctx.fill();ctx.restore();
    ctx.fillStyle=lin(ctx,0,-14,0,40,[[0,'rgba(0,0,0,.6)'],[1,'rgba(0,0,0,0)']]);ctx.fillRect(d.x-w/2,0,w,40)}
  // floor-level dynamics
  for(const h of HZ){if(h.k==='salt'){ctx.fillStyle='rgba(235,238,245,'+(1-h.t/h.dur)*.8+')';ctx.fillRect(h.x-1.5,h.y-1.5,3,3)}else if(h.k==='candle'){const a=Math.min(1,(h.dur-h.t)*2);ctx.globalAlpha=a;drawCandleObj(ctx,h.x,h.y,tt,h.ph,.9);ctx.globalAlpha=1}}
  if(room.ritual)for(const rc of room.ritual)drawRitualCandle(ctx,rc,tt);
  if(room.altar)drawAltar(ctx,room.altar,tt);
  for(const d of DROPS){softShadow(ctx,d.x,d.y+5,7,2.6,.45);
    if(d.kind==='soul')drawSoul(ctx,d.x,d.y-d.z,tt+d.rot);else if(d.kind==='big')drawLolly(ctx,d.x,d.y-d.z-4,.9,tt*3);else if(d.kind==='heart')drawHeart(ctx,d.x,d.y-d.z,16,'#d8505a');else drawCandy(ctx,d.x,d.y-d.z,d.col,.85,d.rot)}
  if(room.chest){const c=room.chest;const w=c.open&&!c.done?Math.sin(c.ot*60)*c.ot*6:0;ctx.save();ctx.translate(c.x,c.y);ctx.rotate(w*.02);drawChest(ctx,0,0,1.25,c.done,tt);ctx.restore()}
  const actors=G.slice();if(P)actors.push(P);
  actors.sort((a,b)=>a.y-b.y);
  for(const a of actors){if(a===P){if(state!=='home'&&P.inv>0&&P.dash<=0&&Math.floor(P.inv*14)%2)continue;drawLumi(ctx,P.x,P.y,P.aim,P.t,S.skin,P.mv,1,0)}else drawGhostBody(ctx,a,tt)}
  for(const f of FX)if(!f.glow)drawFx(ctx,f);
  // darkness + shadows
  renderDark(tt);
  ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(dk,0,0,cv.width,cv.height);
  // volumetric beam (shadowed)
  if(P&&R&&R.beams&&state!=='over'){renderGlow(tt);ctx.globalCompositeOperation='lighter';ctx.drawImage(gk,0,0,cv.width,cv.height);ctx.globalCompositeOperation='source-over'}
  worldXf(ctx,DPR);
  ctx.globalCompositeOperation='lighter';
  for(const cd of room.candles){const g=ctx.createRadialGradient(cd.x,cd.y-12,2,cd.x,cd.y-12,80);g.addColorStop(0,'rgba(255,150,60,.18)');g.addColorStop(1,'rgba(255,150,60,0)');ctx.fillStyle=g;ctx.fillRect(cd.x-80,cd.y-92,160,160)}
  for(const b of BURSTS){const p=b.t/b.dur,a=(1-p)*.38;const r2=b.r*(.4+.6*p);const g=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,r2);g.addColorStop(0,'rgba('+b.col+','+a+')');g.addColorStop(1,'rgba('+b.col+',0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(b.x,b.y,r2,0,TAU);ctx.fill()}
  for(const f of FX)if(f.glow)drawFx(ctx,f);
  // dust motes drifting through the beam
  if(R&&R.beams&&P){const vw=W/k,vh=H/k;for(const m of MOTES){m.ph+=dt*.4;const x=camX-vw/2+((m.x*vw+Math.sin(m.ph)*20+tt*4*m.z)%vw+vw)%vw,y=camY-vh/2+((m.y*vh+tt*(3+m.z*5))%vh+vh)%vh;
    let b=0;for(const bb of R.beams){const q=inBeam(bb,x,y,0);if(q)b=Math.max(b,q*(1-Math.hypot(x-P.x,y-P.y)/bb.len))}if(b>0){circ(ctx,x,y,.7+m.z*1.1,'rgba(255,240,210,'+(b*.55)+')')}}}
  ctx.globalCompositeOperation='source-over';
  // above the dark
  for(const cd of room.candles)drawFlame(ctx,cd.x,cd.y-(cd.wall?30:14),tt,cd.ph,cd.wall?.8:1);
  for(const h of HZ)if(h.k==='candle')drawFlame(ctx,h.x,h.y-13,tt,h.ph,.9);
  for(const f of FIREF){ctx.globalCompositeOperation='lighter';ctx.fillStyle=rad(ctx,f.x,f.y,0,14,[[0,'rgba(220,255,150,.5)'],[1,'rgba(220,255,150,0)']]);ctx.beginPath();ctx.arc(f.x,f.y,14,0,TAU);ctx.fill();ctx.globalCompositeOperation='source-over';circ(ctx,f.x,f.y,2.2,'#f4ffd0')}
  for(const f of room.furn)if(f.poss&&!f.poss.done)drawPossessed(ctx,f,tt);
  for(const g of G){
    let vis=1;
    if(g.tp==='peeker'&&!g.lit){const d=Math.hypot(g.x-P.x,g.y-P.y);vis=clamp((270-d)/80,0,1)}
    if(g.spawnT>0){spawnSwirl(ctx,g,tt);vis*=g.alpha}
    drawGhostEyes(ctx,g,tt,vis*(room.tw==='dark'?1.3:1));
    if(g.tp==='shade'&&g.tele>0){ctx.strokeStyle='rgba(255,70,60,'+(.25+.3*Math.sin(tt*30))+')';ctx.lineWidth=2;ctx.setLineDash([8,8]);ctx.beginPath();ctx.moveTo(g.x,g.y);ctx.lineTo(g.x+g.ax*240,g.y+g.ay*240);ctx.stroke();ctx.setLineDash([])}
    if(g.wailT>0){ctx.strokeStyle='rgba(200,230,255,'+(.15+.25*(1-g.wailT))+')';ctx.lineWidth=2;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(g.x,g.y-g.r*.3,g.r*(1.2+i*.4)+(1-g.wailT)*20,0,TAU);ctx.stroke()}}
    if(g.boss&&g.act&&g.act.p==='charge'&&g.act.t<.8){ctx.strokeStyle='rgba(224,160,112,'+(.25+.3*Math.sin(tt*30))+')';ctx.lineWidth=g.r*.9;ctx.globalAlpha=.3;ctx.beginPath();ctx.moveTo(g.x,g.y);ctx.lineTo(g.x+g.ax*400,g.y+g.ay*400);ctx.stroke();ctx.globalAlpha=1}
    if(g.boss&&g.act&&(g.act.p==='ring'||g.act.p==='summon')&&g.act.t<.7){ctx.strokeStyle='rgba(224,160,112,'+(.5-g.act.t*.6)+')';ctx.lineWidth=3;ctx.beginPath();ctx.arc(g.x,g.y,g.r+10+g.act.t*60,0,TAU);ctx.stroke()}
  }
  for(const h of HZ)if(h.k==='wail'){const a=(1-h.r/h.max);ctx.strokeStyle='rgba(200,230,255,'+(.55*a)+')';ctx.lineWidth=10;ctx.beginPath();ctx.arc(h.x,h.y,h.r,0,TAU);ctx.stroke();ctx.strokeStyle='rgba(255,255,255,'+(.5*a)+')';ctx.lineWidth=2;ctx.stroke()}
  for(const o of ORBS)drawOrb(ctx,o,tt);
  if(room.chand)drawChandelier(ctx,room.chand,tt);
  // door plaques
  if(room.phase==='clear')for(const d of room.doors)drawPlaque(ctx,d,tt);
  // floating texts
  ctx.textAlign='center';ctx.textBaseline='middle';
  for(const x of TXT){const p=x.t/x.dur,s=p<.15?.7+p/.15*.35:p<.3?1.05-(p-.15)/.15*.05:1;ctx.globalAlpha=p>.7?1-(p-.7)/.3:1;
    ctx.font='italic 700 '+(x.size*s)+'px Georgia,"Times New Roman",serif';ctx.lineWidth=4;ctx.strokeStyle='rgba(6,4,8,.85)';ctx.strokeText(x.text,x.x,x.y);ctx.fillStyle=x.col;ctx.fillText(x.text,x.x,x.y)}
  ctx.globalAlpha=1;
  // post
  ctx.setTransform(DPR,0,0,DPR,0,0);
  ctx.fillStyle=room.ch.tint;ctx.fillRect(0,0,W,H);
  if(room.tw==='cold'){const g=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.hypot(W,H)*.55);g.addColorStop(0,'rgba(180,220,255,0)');g.addColorStop(1,'rgba(190,225,255,.28)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H)}
  if(vig&&vig.length)ctx.drawImage(vig[(Math.floor(tt*24))%vig.length],0,0,W,H);
  if(flashA>0){ctx.fillStyle='rgba('+flashC+','+flashA+')';ctx.fillRect(0,0,W,H)}
  if(state==='run'||state==='cards'||state==='pause'||state==='dying')drawHUD(tt,dt);
  if(trans){const p=trans.t/trans.dur,a=p<.5?p*2:2-p*2;ctx.fillStyle='rgba(4,3,6,'+a+')';ctx.fillRect(0,0,W,H)}
  if(state==='dying'){ctx.fillStyle='rgba(20,0,4,'+(1-R.deathT/1.3)*.6+')';ctx.fillRect(0,0,W,H)}
}
function drawFx(c,f){const p=f.t/f.dur;c.globalAlpha=1-p;
  if(f.k==='mist'){c.fillStyle=rad(c,f.x,f.y,0,f.sz*(1+p*1.5),[[0,hexA(f.col.length===7?f.col:'#9a96a8',.35)],[1,hexA(f.col.length===7?f.col:'#9a96a8',0)]]);c.beginPath();c.arc(f.x,f.y,f.sz*(1+p*1.5),0,TAU);c.fill()}
  else if(f.k==='ghostimg'){c.fillStyle=f.col;c.beginPath();c.ellipse(f.x,f.y-4,11,16,0,0,TAU);c.fill()}
  else if(f.k==='wisp'){c.strokeStyle=hexA(f.col,.6*(1-p));c.lineWidth=f.sz*(1-p*.5);c.beginPath();c.moveTo(f.x,f.y);c.quadraticCurveTo(f.x+Math.sin(f.ph+f.t*6)*8,f.y+10,f.x+Math.sin(f.ph)*4,f.y+22);c.stroke()}
  else{c.fillStyle=f.col.length===7?hexA(f.col,1):f.col;c.beginPath();c.arc(f.x,f.y,f.sz*(1-p*.5),0,TAU);c.fill()}
  c.globalAlpha=1}
function spawnSwirl(c,g,tt){const a=1-g.spawnT/g.spawnMax;c.save();c.translate(g.x,g.y);
  c.fillStyle=rad(c,0,g.r*.6,0,g.r*1.8,[[0,'rgba(10,8,16,'+(.55*(1-a*.5))+')'],[1,'rgba(10,8,16,0)']]);c.beginPath();c.ellipse(0,g.r*.6,g.r*1.8,g.r*.7,0,0,TAU);c.fill();
  c.rotate(tt*3);c.strokeStyle='rgba(170,160,200,'+(.12+.25*(1-a))+')';c.lineWidth=1.5;for(let i=0;i<3;i++){c.beginPath();c.arc(0,0,g.r*(1.7-a*.7)+i*6,i*2,i*2+1.6);c.stroke()}c.restore()}
function drawOrb(c,o,tt){
  if(o.kind==='goo'){c.globalCompositeOperation='lighter';c.fillStyle=rad(c,o.x,o.y,0,16,[[0,'rgba(150,255,170,.45)'],[1,'rgba(150,255,170,0)']]);c.beginPath();c.arc(o.x,o.y,16,0,TAU);c.fill();c.globalCompositeOperation='source-over';
    const sp=Math.hypot(o.vx,o.vy)||1;c.fillStyle=lin(c,o.x-o.vx/sp*18,o.y-o.vy/sp*18,o.x,o.y,[[0,'rgba(140,240,160,0)'],[1,'rgba(140,240,160,.5)']]);c.beginPath();c.moveTo(o.x-o.vx/sp*20,o.y-o.vy/sp*20);c.lineTo(o.x-o.vy/sp*6,o.y+o.vx/sp*6);c.lineTo(o.x+o.vy/sp*6,o.y-o.vx/sp*6);c.closePath();c.fill();
    c.fillStyle=rad(c,o.x,o.y,0,7,[[0,'#f0fff0'],[.5,'#8ef0a8'],[1,'#3a9a5a']],-2,-2);c.beginPath();c.arc(o.x,o.y,7,0,TAU);c.fill();return}
  softShadow(c,o.x,o.y+14,10,4,.4);c.save();c.translate(o.x,o.y);c.rotate(o.rot);
  if(o.kind==='book'){c.fillStyle=lin(c,-9,-6,9,6,[[0,'#5a2a24'],[1,'#2a100c']]);rr(c,-9,-6.5,18,13,1.5);c.fill();c.fillStyle='#e8dcc0';c.fillRect(-8,-5,1.6,10);c.fillStyle='rgba(200,170,100,.6)';c.fillRect(-4,-1,10,1.2)}
  else{c.fillStyle=rad(c,0,0,1,9,[[0,'#f4f0e8'],[.7,'#d8d0c0'],[1,'#8a8070']],-2,-2);c.beginPath();c.arc(0,0,8.5,0,TAU);c.fill();c.strokeStyle='rgba(60,80,140,.5)';c.lineWidth=1;c.beginPath();c.arc(0,0,6,0,TAU);c.stroke()}
  c.restore();c.strokeStyle='rgba(200,180,255,.35)';c.lineWidth=1;c.beginPath();c.arc(o.x,o.y,12+Math.sin(tt*10)*2,0,TAU);c.stroke()}
function drawPossessed(c,f,tt){const p=f.poss,fx=f.x+f.w/2,fy=f.y+f.h/2,sh=p.throwT<.6?(Math.random()-.5)*4:0;
  c.save();c.globalCompositeOperation='lighter';c.strokeStyle='rgba(180,150,255,'+(.25+.15*Math.sin(tt*6))+')';c.lineWidth=3;rr(c,f.x-4+sh,f.y-4,f.w+8,f.h+8,8);c.stroke();
  c.fillStyle=rad(c,fx,fy,0,Math.max(f.w,f.h)*.8,[[0,'rgba(150,120,255,.12)'],[1,'rgba(150,120,255,0)']]);c.fillRect(f.x-f.w*.4,f.y-f.h*.4,f.w*1.8,f.h*1.8);c.globalCompositeOperation='source-over';
  const fr=clamp(p.fear/p.hp,0,1);c.fillStyle='rgba(10,8,14,.7)';rr(c,fx-26,f.y-16,52,6,3);c.fill();c.fillStyle='#c8b8ff';rr(c,fx-26,f.y-16,52*fr,6,3);c.fill();
  if(Math.random()<.15)FX.push({x:fx+rand(-f.w/2,f.w/2),y:fy+rand(-f.h/2,f.h/2),vx:0,vy:-25,t:0,dur:.8,sz:2,col:'#c8b8ff',k:'spark',glow:true});c.restore()}
function drawAltar(c,a,tt){c.save();c.translate(a.x,a.y);softShadow(c,0,24,60,16,.55);
  c.fillStyle=stoneP(c,'alt',[120,118,116]);rr(c,-52,-6,104,34,4);c.fill();c.fillStyle='rgba(0,0,0,.35)';c.fillRect(-52,18,104,10);c.fillStyle=stoneP(c,'alt',[140,138,136]);rr(c,-38,-24,76,22,3);c.fill();bevel(c,-38,-24,76,22,3);
  for(const sx of[-28,0,28]){drawCandleObj(c,sx,-14,tt,sx,.8)}c.restore();
  if(!a.used)for(const sx of[-28,0,28])drawFlame(c,a.x+sx,a.y-27,tt,sx,.8);
  if(!a.used){c.strokeStyle='rgba(240,210,150,'+(.25+.2*Math.sin(tt*3))+')';c.lineWidth=2;c.beginPath();c.ellipse(a.x,a.y+10,70,26,0,0,TAU);c.stroke()}}
function drawChandelier(c,ch,tt){const x=ch.x+Math.sin(tt*.6)*10,y=ch.y-60+Math.cos(tt*.6)*3;c.save();
  c.globalAlpha=.85;c.strokeStyle='#120e0a';c.lineWidth=5;c.beginPath();c.ellipse(x,y,64,22,0,0,TAU);c.stroke();c.lineWidth=3;for(let i=0;i<6;i++){const a=i*TAU/6;c.beginPath();c.moveTo(x,y-30);c.lineTo(x+Math.cos(a)*64,y+Math.sin(a)*22);c.stroke()}
  c.beginPath();c.moveTo(x,y-30);c.lineTo(x,y-200);c.stroke();c.globalAlpha=1;
  for(let i=0;i<6;i++){const a=i*TAU/6;drawFlame(c,x+Math.cos(a)*64,y+Math.sin(a)*22-6,tt,i,.8)}c.restore()}
function drawPlaque(c,d,tt){const py=64+Math.sin(tt*2.4+d.x)*2,boss=d.rw==='boss',col=boss?'#e0a070':'#d8c8a0';c.save();c.translate(d.x,py);
  c.fillStyle='rgba(8,6,10,.82)';rr(c,-48,-30,96,62,6);c.fill();c.strokeStyle=hexA(col,.7);c.lineWidth=1.2;rr(c,-45,-27,90,56,4);c.stroke();
  c.save();c.translate(-34,-24);c.scale(.3,.3);drawIcon(c,boss?'rt_boss':'rt_'+(d.rt||'waves'));c.restore();
  if(!boss){c.save();c.translate(6,-24);c.scale(.3,.3);drawIcon(c,'rw_'+d.rw);c.restore()}
  c.font='700 11px Georgia,"Times New Roman",serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle=col;
  c.fillText(boss?t('rw_boss'):t('rt_'+(d.rt||'waves')),0,13);
  if(d.tw){c.font='italic 10px Georgia,serif';c.fillStyle='#b8a8d8';c.fillText(t('tw_'+d.tw),0,24)}else if(!boss){c.font='italic 10px Georgia,serif';c.fillStyle='#9a9080';c.fillText(t('rw_'+d.rw),0,24)}
  c.restore()}

function renderDark(tt){
  const c=dctx;c.globalCompositeOperation='source-over';c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,dk.width,dk.height);
  let dark=room.dark;
  if(room.phase==='clear')dark=lerp(dark,.55,Math.min(1,room.clearT/1.2));
  if(state==='home')dark=Math.min(dark,.88);
  dark=Math.max(0,dark-room.light);
  c.fillStyle='rgba(3,2,7,'+dark+')';c.fillRect(0,0,dk.width,dk.height);
  // player light into light layer, then furniture shadows
  if(P){const l=lctx;l.setTransform(1,0,0,1,0,0);l.globalCompositeOperation='source-over';l.clearRect(0,0,lk.width,lk.height);worldXf(l,DPR*DS);
    const pr=100+(R?auraR():0);l.fillStyle=rad(l,P.x,P.y,0,pr,[[0,'rgba(0,0,0,1)'],[.5,'rgba(0,0,0,.65)'],[1,'rgba(0,0,0,0)']]);l.beginPath();l.arc(P.x,P.y,pr,0,TAU);l.fill();
    const beams=(R&&R.beams)||[];for(const b of beams){beamWedge(l,b,.35,'rgba(0,0,0,',1.06);beamWedge(l,b,1,'rgba(0,0,0,')}
    l.globalCompositeOperation='destination-out';l.fillStyle='#000';for(const f of room.furn)shadowPoly(l,P.x,P.y,f);
    c.globalCompositeOperation='destination-out';c.drawImage(lk,0,0)}
  worldXf(c,DPR*DS);
  c.globalCompositeOperation='destination-out';
  const cut=(x,y,r,a)=>{if(r<=0)return;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(0,0,0,'+a+')');g.addColorStop(.5,'rgba(0,0,0,'+a*.6+')');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,TAU);c.fill()};
  for(const cd of room.candles)cut(cd.x,cd.y-(cd.wall?24:10),(cd.wall?100:88)+Math.sin(tt*9+cd.ph)*5,.82);
  for(const w of room.windows){c.fillStyle=lin(c,0,0,0,220,[[0,'rgba(0,0,0,.35)'],[1,'rgba(0,0,0,0)']]);c.beginPath();c.moveTo(w-30,0);c.lineTo(w+30,0);c.lineTo(w+110,220);c.lineTo(w+20,220);c.closePath();c.fill()}
  if(room.ch.wallf==='glass'){c.fillStyle=lin(c,0,0,0,ROOM_H*.6,[[0,'rgba(0,0,0,.28)'],[1,'rgba(0,0,0,0)']]);c.fillRect(-WALL,-WALLT,ROOM_W+WALL*2,ROOM_H*.6+WALLT)}
  c.fillStyle='rgba(0,0,0,.25)';c.fillRect(-WALL,-WALLT,ROOM_W+WALL*2,WALLT*.5);
  for(const h of HZ)if(h.k==='candle')cut(h.x,h.y-8,h.r+10,.9);
  if(room.ritual)for(const rc of room.ritual)cut(rc.x,rc.y-10,rc.lit?110:40,rc.lit?.9:.25);
  if(room.altar)cut(room.altar.x,room.altar.y-20,room.altar.used?60:140,.85);
  if(room.chand){const x=room.chand.x+Math.sin(tt*.6)*10;cut(x,room.chand.y-40,230,.75)}
  for(const f of FIREF)cut(f.x,f.y,48,.8);
  for(const o of ORBS)if(o.kind==='goo')cut(o.x,o.y,28,.5);
  for(const b of BURSTS){const p=b.t/b.dur;cut(b.x,b.y,b.r*(.5+.5*p),.9*(1-p))}
  if(room.phase==='clear')for(const d of room.doors)cut(d.x,30,110,.8);
  if(room.chest)cut(room.chest.x,room.chest.y,70,.7);
  for(const g of G){if(g.tp==='golden')cut(g.x,g.y,60,.75);else if(g.hidden)cut(g.x,g.y-10,80,.8);else if(g.tp==='pumpkin')cut(g.x,g.y-g.r*.4,g.r*2.2,.45)}
  for(const d of DROPS)if(d.kind==='big'||d.kind==='soul')cut(d.x,d.y,20,.35);
  c.globalCompositeOperation='source-over';
  if(room.tw==='fog'||room.vis===2){c.globalAlpha=room.tw==='fog'?.16:.07;const fp=pat(c,fogTex(),3);if(fp.setTransform){try{fp.setTransform(new DOMMatrix([3,0,0,3,(tt*14)%768,(tt*5)%768]))}catch(e){}}c.fillStyle=fp;c.fillRect(-WALL,-WALLT,ROOM_W+WALL*2,ROOM_H+WALL+WALLT);c.globalAlpha=1}
}
function renderGlow(tt){
  const c=gctx;c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='source-over';c.clearRect(0,0,gk.width,gk.height);worldXf(c,DPR*DS);
  const bc=beamCol(),col='rgba('+bc[0]+','+bc[1]+','+bc[2]+',';
  for(const b of R.beams)beamWedge(c,b,b.main?.32:.2,col);
  c.fillStyle=rad(c,P.x+Math.cos(P.aim)*16,P.y-2+Math.sin(P.aim)*12,0,22,[[0,col+'.55)'],[1,col+'0)']]);c.beginPath();c.arc(P.x+Math.cos(P.aim)*16,P.y-2+Math.sin(P.aim)*12,22,0,TAU);c.fill();
  c.globalCompositeOperation='destination-out';c.globalAlpha=.55;const fp=pat(c,fogTex(),1.4);if(fp.setTransform){try{fp.setTransform(new DOMMatrix([1.4,0,0,1.4,(tt*10)%358,(tt*4)%358]))}catch(e){}}c.fillStyle=fp;c.fillRect(P.x-400,P.y-400,800,800);c.globalAlpha=1;
  const fogA=room.tw==='fog'?.7:room.vis===2?.35:room.vis===4?.25:.15;
  c.globalCompositeOperation='source-atop';c.globalAlpha=fogA;const fp2=pat(c,fogTex(),2.2);if(fp2.setTransform){try{fp2.setTransform(new DOMMatrix([2.2,0,0,2.2,(tt*12)%563,(tt*5)%563]))}catch(e){}}c.fillStyle=fp2;c.fillRect(P.x-420,P.y-420,840,840);c.globalAlpha=1;
  c.globalCompositeOperation='destination-out';c.fillStyle='#000';for(const f of room.furn)shadowPoly(c,P.x,P.y,f);
  c.globalCompositeOperation='source-over';
}

function drawHUD(tt,dt){
  const c=ctx;c.textBaseline='middle';const SERIF='Georgia,"Times New Roman",serif';
  const hs=Math.min(24,W/24);
  for(let i=0;i<P.maxH;i++){const x=16+hs*.55+i*hs*1.12,y=22+hs*.15;const full=i<P.hearts;const pulse=full&&P.hearts===1?1+.1*Math.sin(tt*9):1;drawHeart(c,x,y,hs*pulse,'#8e1a28',!full)}
  const bx=16,by=24+hs*.9,bw=Math.min(220,W*.32),bh=4;
  c.fillStyle='rgba(0,0,0,.55)';c.fillRect(bx,by,bw,bh);c.fillStyle=lin(c,bx,0,bx+bw,0,[[0,'#7aa894'],[1,'#d8ead8']]);c.fillRect(bx,by,bw*clamp(R.xp/R.need,0,1),bh);
  c.font='italic 12px '+SERIF;c.fillStyle='#cfc4ac';c.textAlign='left';c.fillText(t('lv',{n:R.lvl}),bx+bw+8,by+2);
  c.textAlign='center';
  const narrow=W<640;
  if(R.mode==='story'){const pw=Math.min(20,W/26),cx=W/2,y=narrow?by+30:24;
    for(let i=1;i<=10;i++){const x=cx+(i-5.5)*pw;const done=i<R.room||(i===R.room&&room.phase==='clear'),cur=i===R.room;
      if(i===5||i===10){c.save();c.translate(x,y);const s=i===10?.9:.75;c.scale(s,s);c.fillStyle=done?'#d8b868':cur?'#e0a070':'rgba(220,210,190,.25)';specterPath(c,6,1,tt,i,4,.4);c.fill();c.restore()}
      else{circ(c,x,y,cur?4.5:3.2,done?'#a8c8b0':cur?'#efe6d2':'rgba(220,210,190,.22)');if(cur){c.strokeStyle='rgba(239,230,210,.4)';c.lineWidth=1;c.beginPath();c.arc(x,y,8+Math.sin(tt*4),0,TAU);c.stroke()}}}
    if(!narrow&&room.name){c.font='italic 13px '+SERIF;c.fillStyle='rgba(225,215,195,.75)';c.fillText(t(room.name),cx,y+18)}}
  else{const y0=narrow?by+28:24;c.font='700 16px '+SERIF;c.fillStyle='#efe6d2';c.fillText(t('room',{n:R.room}),W/2,y0);c.font='italic 12px '+SERIF;c.fillStyle='rgba(225,215,195,.6)';c.fillText(t('nightBest',{n:Math.max(S.nightBest,R.room)}),W/2,y0+17)}
  // objective
  const ob=objectiveText();if(ob){const y=narrow?by+70:62;c.font='italic 600 '+(narrow?13:15)+'px '+SERIF;const w=c.measureText(ob.t).width+30;c.fillStyle='rgba(8,6,10,.7)';c.fillRect(W/2-w/2,y-12,w,24);c.strokeStyle='rgba(216,200,160,.4)';c.lineWidth=1;c.strokeRect(W/2-w/2+.5,y-11.5,w-1,23);
    if(ob.p!=null){c.fillStyle='rgba(216,184,104,.25)';c.fillRect(W/2-w/2,y-12,w*ob.p,24)}c.fillStyle='#efe6d2';c.fillText(ob.t,W/2,y+1)}
  const tot=Math.floor(R.earned+R.candy);c.font='700 19px '+SERIF;c.textAlign='right';
  const tx=W-112;c.lineWidth=4;c.strokeStyle='rgba(0,0,0,.6)';c.strokeText(String(tot),tx,30);c.fillStyle='#e8c870';c.fillText(String(tot),tx,30);
  const tw=c.measureText(String(tot)).width;drawCandy(c,tx-tw-16,30,'#b8324a',1,-.4);
  if(R.combo>=3){const s=1+Math.max(0,R.comboT-1.9)*1.2;c.save();c.translate(W-24,H*.26);c.scale(s,s);c.textAlign='right';
    c.font='italic 700 '+(24+Math.min(18,R.combo*.4))+'px '+SERIF;c.lineWidth=5;c.strokeStyle='rgba(0,0,0,.7)';c.strokeText('×'+R.combo,0,0);c.fillStyle=R.combo>=20?'#f0d48a':R.combo>=10?'#c8a0e8':'#a8d8c0';c.fillText('×'+R.combo,0,0);
    c.fillStyle='rgba(255,255,255,.18)';c.fillRect(-80,18,80,3);c.fillStyle='#efe6d2';c.fillRect(-80*clamp(R.comboT/2.3,0,1),18,80*clamp(R.comboT/2.3,0,1),3);
    const cm=1+Math.min(2,Math.floor(R.combo/10)*.5);if(cm>1){c.font='italic 12px '+SERIF;c.fillStyle='#e8c870';c.fillText(t('rw_candy')+' ×'+cm,0,34)}c.restore()}
  if(boss&&boss.spawnT<=0){const bw2=Math.min(480,W*.6),x=W/2-bw2/2,y=H-30;c.fillStyle='rgba(0,0,0,.65)';c.fillRect(x-3,y-3,bw2+6,12);
    const f=1-clamp(boss.fear/boss.hp,0,1);c.fillStyle=lin(c,x,0,x+bw2,0,[[0,'#6a1018'],[1,'#c8504a']]);c.fillRect(x,y,bw2*f,6);c.strokeStyle='rgba(216,200,160,.45)';c.lineWidth=1;c.strokeRect(x-3.5,y-3.5,bw2+7,13);
    c.font='700 14px '+SERIF;c.textAlign='center';c.fillStyle='#efe6d2';c.lineWidth=4;c.strokeStyle='rgba(0,0,0,.8)';c.strokeText(up(boss.name),W/2,y-14);c.fillText(up(boss.name),W/2,y-14)}
  if(room.phase==='clear'&&room.doors.length&&state==='run'){for(const d of room.doors){const sx=(d.x-camX)*k+W/2,sy=(64-camY)*k+H/2;
    if(sy<(narrow?by+90:96)){const x=clamp(sx,40,W-40),y=(narrow?by+86:92)+Math.sin(tt*6)*4;c.save();c.translate(x,y);c.fillStyle='#d8c8a0';c.beginPath();c.moveTo(0,-22);c.lineTo(10,-10);c.lineTo(-10,-10);c.closePath();c.fill();
      c.fillStyle='rgba(8,6,10,.85)';c.fillRect(-20,-8,40,34);c.strokeStyle='rgba(216,200,160,.6)';c.strokeRect(-19.5,-7.5,39,33);c.translate(-15,-5);c.scale(.31,.31);drawIcon(c,d.rw==='boss'?'rt_boss':'rt_'+(d.rt||'waves'));c.restore()}}}
  if(touchMode){
    if(stick.on){c.strokeStyle='rgba(239,230,210,.22)';c.lineWidth=1.5;c.beginPath();c.arc(stick.ox,stick.oy,56,0,TAU);c.stroke();circ(c,stick.ox+stick.dx*44,stick.oy+stick.dy*44,22,'rgba(239,230,210,.22)')}
    const db=dashBtn();const rdy=P.dashCd<=0;circ(c,db.x,db.y,db.r,rdy?'rgba(168,216,192,.18)':'rgba(255,255,255,.05)');c.strokeStyle=rdy?'rgba(168,216,192,.8)':'rgba(255,255,255,.25)';c.lineWidth=1.5;c.beginPath();c.arc(db.x,db.y,db.r,0,TAU);c.stroke();
    if(!rdy){c.strokeStyle='#a8d8c0';c.lineWidth=3;c.beginPath();c.arc(db.x,db.y,db.r-5,-Math.PI/2,-Math.PI/2+TAU*(1-P.dashCd/P.dashCdMax));c.stroke()}
    c.font='700 13px '+SERIF;c.textAlign='center';c.fillStyle='#efe6d2';c.fillText(t('dash'),db.x,db.y)}
  let ht=null;if(R.tut===1)ht=t('tutMove');else if(R.tut===2)ht=t('tutLight');else if(R.tut===3)ht=t('tutCandy');
  if(hint){hint.t+=dt;if(hint.t>hint.dur)hint=null;else if(!ht)ht=hint.text}
  if(ht){c.font='italic '+Math.min(17,W/32)+'px '+SERIF;c.textAlign='center';const w=c.measureText(ht).width+34,y=H*.8;
    c.fillStyle='rgba(8,6,10,.78)';c.fillRect(W/2-w/2,y-17,w,34);c.strokeStyle='rgba(216,200,160,.45)';c.lineWidth=1;c.strokeRect(W/2-w/2+.5,y-16.5,w-1,33);c.fillStyle='#efe6d2';c.fillText(ht,W/2,y+1)}
  if(banner&&state==='cards')banner=null;
  if(banner){banner.t+=dt;const p=banner.t/banner.dur;if(p>=1)banner=null;else{const a=p<.15?p/.15:p>.75?1-(p-.75)/.25:1,s=1+.04*(1-Math.min(1,p*3));
    c.save();c.globalAlpha=a;c.translate(W/2,H*.36);c.scale(s,s);c.textAlign='center';
    const fs=Math.min(48,W/13);c.font='700 '+fs+'px '+SERIF;try{c.letterSpacing=Math.round(fs*.08)+'px'}catch(e){}
    c.shadowColor='rgba(0,0,0,.9)';c.shadowBlur=18;c.fillStyle=banner.col;c.fillText(up(banner.text),0,0);c.shadowBlur=0;
    c.strokeStyle=hexA('#d8c8a0',.5);c.lineWidth=1;const lw=Math.min(W*.4,260);c.beginPath();c.moveTo(-lw/2,fs*.62);c.lineTo(lw/2,fs*.62);c.stroke();
    if(banner.sub){try{c.letterSpacing='1px'}catch(e){}c.font='italic '+Math.min(18,W/28)+'px '+SERIF;c.fillStyle='rgba(239,230,210,.85)';c.fillText(banner.sub,0,fs*.62+Math.min(22,W/22))}c.restore();try{c.letterSpacing='0px'}catch(e){}}}
}
function objectiveText(){if(!room||room.type!=='normal')return null;
  switch(room.rt){
    case 'ritual':{const n=room.ritual.filter(r=>r.lit).length;return room.phase==='fight'?{t:t('obRitual',{a:n,b:room.ritual.length}),p:n/room.ritual.length}:null}
    case 'survive':return room.phase==='fight'?{t:t('obSurvive',{s:Math.ceil(Math.max(0,room.survT))}),p:1-room.survT/room.survMax}:null;
    case 'hunt':return room.phase==='fight'?{t:t('obHunt',{a:room.huntCaught,b:room.huntN}),p:room.huntCaught/room.huntN}:null;
    case 'poltergeist':return room.phase==='fight'?{t:t('obPolter',{a:room.possDone||0,b:room.possN}),p:(room.possDone||0)/room.possN}:null;
    case 'shrine':return room.phase==='shrine'?{t:t('obShrine')}:null;
  }return null}
function dashBtn(){const r=Math.max(34,Math.min(46,Math.min(W,H)*.085));return{x:W-r-26,y:H-r-30,r}}

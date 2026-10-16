/* ---------- rendering ---------- */
const cv=$('c'),ctx=cv.getContext('2d');
const dk=document.createElement('canvas'),dctx=dk.getContext('2d');
let W=960,H=540,DPR=1,k=1;
const DS=.5;
function resize(){
  W=innerWidth;H=innerHeight;DPR=Math.min(2,window.devicePixelRatio||1);
  cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);
  dk.width=Math.max(1,Math.round(W*DPR*DS));dk.height=Math.max(1,Math.round(H*DPR*DS));
  k=Math.max(Math.min(W/(ROOM_W+WALL*2),H/(ROOM_H+WALL*2+10)),Math.min(W,H)/560,H>W?H/900:0);
  if(state==='home'&&room)camX=ROOM_W/2;
}
function screenToWorld(sx,sy){return{x:(sx-W/2)/k+camX,y:(sy-H/2)/k+camY}}
function worldXf(c,scale){const s=k*scale;c.setTransform(s,0,0,s,W*scale/2-(camX+shX)*s,H*scale/2-(camY+shY)*s)}

function render(dt){
  shakeA=Math.max(0,shakeA-dt*28);shX=shakeA?(Math.random()-.5)*shakeA:0;shY=shakeA?(Math.random()-.5)*shakeA:0;
  flashA=Math.max(0,flashA-dt*1.8);
  ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#07050d';ctx.fillRect(0,0,cv.width,cv.height);
  if(!room)return;
  const need=Math.min(2.5,k*DPR);
  if(!room.cv||Math.abs(room.res-need)/need>.2)renderRoomStatic(room,need);
  worldXf(ctx,DPR);
  ctx.drawImage(room.cv,-WALL,-WALL,ROOM_W+WALL*2,ROOM_H+WALL*2);
  const tt=gtime;
  // open doors
  if(room.phase==='clear')for(const d of room.doors){const g=ctx.createLinearGradient(0,-WALL,0,0);g.addColorStop(0,'#000');g.addColorStop(1,'#1a1030');ctx.fillStyle=g;rr(ctx,d.x-42,-WALL+2,84,WALL+6,8);ctx.fill();
    ctx.fillStyle='rgba(94,242,194,'+(.25+.15*Math.sin(tt*4))+')';ctx.fillRect(d.x-40,-6,80,8)}
  // hazards
  for(const h of HZ){if(h.k==='salt'){ctx.fillStyle='rgba(240,244,255,'+(1-h.t/h.dur)*.85+')';ctx.fillRect(h.x-2,h.y-2,4,4)}else{const a=Math.min(1,(h.dur-h.t)*2);ctx.globalAlpha=a;drawCandleObj(ctx,h.x,h.y,tt,h.ph,.9);ctx.globalAlpha=1}}
  // drops
  for(const d of DROPS){ell(ctx,d.x,d.y+5,6,2.5,'rgba(0,0,0,.3)');
    if(d.kind==='soul')drawSoul(ctx,d.x,d.y-d.z,tt+d.rot);else if(d.kind==='big')drawLolly(ctx,d.x,d.y-d.z-4,.9,tt*3);else if(d.kind==='heart')drawHeart(ctx,d.x,d.y-d.z,18,'#ff5d8f');else drawCandy(ctx,d.x,d.y-d.z,d.col,.9,d.rot)}
  if(room.chest){const c=room.chest;const w=c.open&&!c.done?Math.sin(c.ot*60)*c.ot*6:0;ctx.save();ctx.translate(c.x,c.y);ctx.rotate(w*.02);drawChest(ctx,0,0,1.25,c.done,tt);ctx.restore()}
  // actors sorted by y
  const actors=G.slice();if(P)actors.push(P);
  actors.sort((a,b)=>a.y-b.y);
  for(const a of actors){if(a===P){if(state!=='home'&&P.inv>0&&P.dash<=0&&Math.floor(P.inv*14)%2)continue;drawLumi(ctx,P.x,P.y,P.aim,P.t,S.skin,P.mv,1,0)}else drawGhostBody(ctx,a,tt)}
  for(const f of FX)if(!f.glow)drawFx(ctx,f);
  // darkness
  renderDark(tt);
  ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(dk,0,0,cv.width,cv.height);
  worldXf(ctx,DPR);
  // additive glow
  ctx.globalCompositeOperation='lighter';
  const bc=beamCol();
  if(R&&R.beams&&state!=='over')for(const b of R.beams){const g=ctx.createRadialGradient(P.x,P.y,8,P.x,P.y,b.len);g.addColorStop(0,'rgba('+bc+','+(b.main?.28:.18)+')');g.addColorStop(1,'rgba('+bc+',0)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(P.x,P.y);ctx.arc(P.x,P.y,b.len,b.a-b.ang,b.a+b.ang);ctx.closePath();ctx.fill()}
  for(const cd of room.candles){const g=ctx.createRadialGradient(cd.x,cd.y-12,2,cd.x,cd.y-12,70);g.addColorStop(0,'rgba(255,160,60,.22)');g.addColorStop(1,'rgba(255,160,60,0)');ctx.fillStyle=g;ctx.fillRect(cd.x-70,cd.y-82,140,140)}
  for(const b of BURSTS){const p=b.t/b.dur,a=(1-p)*.45;const g=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r*(.4+.6*p));g.addColorStop(0,'rgba('+b.col+','+a+')');g.addColorStop(1,'rgba('+b.col+',0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(b.x,b.y,b.r*(.4+.6*p),0,TAU);ctx.fill()}
  for(const f of FX)if(f.glow)drawFx(ctx,f);
  ctx.globalCompositeOperation='source-over';
  // above the dark
  for(const cd of room.candles)drawFlame(ctx,cd.x,cd.y-14,tt,cd.ph,1);
  for(const h of HZ)if(h.k==='candle')drawFlame(ctx,h.x,h.y-13,tt,h.ph,.9);
  for(const f of FIREF){circ(ctx,f.x,f.y,7,'rgba(220,255,140,.35)');circ(ctx,f.x,f.y,3.5,'#f2ffb0')}
  for(const g of G){
    let vis=1;
    if(g.tp==='peeker'&&!g.lit){const d=Math.hypot(g.x-P.x,g.y-P.y);vis=clamp((270-d)/80,0,1)}
    if(g.spawnT>0){spawnSwirl(ctx,g,tt);vis*=g.alpha}
    drawGhostEyes(ctx,g,tt,vis);
    if(g.tp==='shade'&&g.tele>0){ctx.strokeStyle='rgba(255,123,242,'+(.3+.4*Math.sin(tt*30))+')';ctx.lineWidth=3;ctx.setLineDash([10,8]);ctx.beginPath();ctx.moveTo(g.x,g.y);ctx.lineTo(g.x+g.ax*240,g.y+g.ay*240);ctx.stroke();ctx.setLineDash([])}
    if(g.boss&&g.act&&g.act.p==='charge'&&g.act.t<.8){ctx.strokeStyle='rgba(255,157,92,'+(.35+.4*Math.sin(tt*30))+')';ctx.lineWidth=g.r*.9;ctx.globalAlpha=.35;ctx.beginPath();ctx.moveTo(g.x,g.y);ctx.lineTo(g.x+g.ax*400,g.y+g.ay*400);ctx.stroke();ctx.globalAlpha=1}
    if(g.boss&&g.act&&(g.act.p==='ring'||g.act.p==='summon')&&g.act.t<.7){ctx.strokeStyle='rgba(255,157,92,'+(.6-g.act.t*.6)+')';ctx.lineWidth=4;ctx.beginPath();ctx.arc(g.x,g.y,g.r+10+g.act.t*60,0,TAU);ctx.stroke()}
    if(g.tp==='golden'){for(let i=0;i<3;i++){const a=tt*4+i*2.1;circ(ctx,g.x+Math.cos(a)*g.r*1.3,g.y+Math.sin(a)*g.r*1.3,2.5,'#fff3b0')}}
  }
  for(const o of ORBS){const p=.9+.1*Math.sin(tt*20+o.t*9);circ(ctx,o.x,o.y,14,'rgba(140,255,170,.18)');circ(ctx,o.x,o.y,8*p,'#7dffa8');circ(ctx,o.x-2,o.y-2,3,'#eafff0')}
  // door plaques (on the floor in front of each door)
  if(room.phase==='clear')for(const d of room.doors){const bob=Math.sin(tt*3+d.x)*3,py=58+bob,col=d.rw==='boss'?'#ff9d5c':'#5ef2c2';ctx.save();ctx.translate(d.x,py);
    ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(0,-44);ctx.lineTo(12,-30);ctx.lineTo(-12,-30);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(20,12,38,.9)';rr(ctx,-32,-28,64,56,12);ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=3;rr(ctx,-32,-28,64,56,12);ctx.stroke();
    ctx.save();ctx.scale(.42,.42);ctx.translate(-48,-48);drawIcon(ctx,'rw_'+d.rw);ctx.restore();ctx.restore();
    ctx.font='900 15px "Trebuchet MS",Verdana,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=4;ctx.strokeStyle='rgba(20,10,40,.9)';ctx.strokeText(t('rw_'+d.rw),d.x,py+42);ctx.fillStyle='#fff';ctx.fillText(t('rw_'+d.rw),d.x,py+42)}
  // floating texts
  ctx.textAlign='center';ctx.textBaseline='middle';
  for(const x of TXT){const p=x.t/x.dur,s=p<.15?.6+p/.15*.5:p<.3?1.1-(p-.15)/.15*.1:1;ctx.globalAlpha=p>.7?1-(p-.7)/.3:1;
    ctx.font='900 '+(x.size*s)+'px "Arial Black","Trebuchet MS",sans-serif';ctx.lineWidth=4;ctx.strokeStyle='rgba(20,10,40,.85)';ctx.strokeText(x.text,x.x,x.y);ctx.fillStyle=x.col;ctx.fillText(x.text,x.x,x.y)}
  ctx.globalAlpha=1;
  // screen space
  ctx.setTransform(DPR,0,0,DPR,0,0);
  if(flashA>0){ctx.fillStyle='rgba('+flashC+','+flashA+')';ctx.fillRect(0,0,W,H)}
  if(state==='run'||state==='cards'||state==='pause'||state==='dying')drawHUD(tt,dt);
  if(trans){const p=trans.t/trans.dur,a=p<.5?p*2:2-p*2;ctx.fillStyle='rgba(7,5,13,'+a+')';ctx.fillRect(0,0,W,H)}
  if(state==='dying'){ctx.fillStyle='rgba(7,5,13,'+(1-R.deathT/1.3)*.6+')';ctx.fillRect(0,0,W,H)}
}
function drawFx(c,f){const p=f.t/f.dur;c.globalAlpha=1-p;
  if(f.k==='mist'){circ(c,f.x,f.y,f.sz*(1+p),hexA(f.col.length===7?f.col:'#ffffff',.35))}
  else if(f.k==='conf'){c.save();c.translate(f.x,f.y);c.rotate(f.rot+f.t*8);c.fillStyle=f.col;c.fillRect(-f.sz/2,-f.sz/4,f.sz,f.sz/2);c.restore()}
  else if(f.k==='ghostimg'){c.fillStyle=f.col;c.beginPath();c.ellipse(f.x,f.y-4,12,16,0,0,TAU);c.fill()}
  else{circ(c,f.x,f.y,f.sz*(1-p*.5),f.col)}
  c.globalAlpha=1}
function spawnSwirl(c,g,tt){const a=1-g.spawnT/g.spawnMax;c.save();c.translate(g.x,g.y);c.rotate(tt*5);c.strokeStyle='rgba(170,120,255,'+(.25+.5*(1-a))+')';c.lineWidth=3;
  for(let i=0;i<3;i++){c.beginPath();c.arc(0,0,g.r*(1.6-a*.6)+i*5,i*2,i*2+2.2);c.stroke()}c.restore()}

function renderDark(tt){
  const c=dctx;c.globalCompositeOperation='source-over';c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,dk.width,dk.height);
  let dark=room.dark;
  if(room.phase==='clear')dark=lerp(dark,.5,Math.min(1,room.clearT/1.2));
  if(state==='home')dark=Math.min(dark,.86);
  c.fillStyle='rgba(6,4,16,'+dark+')';c.fillRect(0,0,dk.width,dk.height);
  worldXf(c,DPR*DS);
  c.globalCompositeOperation='destination-out';
  const cut=(x,y,r,a)=>{if(r<=0)return;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(0,0,0,'+a+')');g.addColorStop(.55,'rgba(0,0,0,'+a*.7+')');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,TAU);c.fill()};
  if(P){cut(P.x,P.y,95+(R?auraR():0),1);
    const beams=(R&&R.beams)||[];
    for(const b of beams){for(const [m,al] of[[1.35,.35],[1,.95]]){const g=c.createRadialGradient(P.x,P.y,0,P.x,P.y,b.len*(m>1?1.06:1));g.addColorStop(0,'rgba(0,0,0,'+al+')');g.addColorStop(.75,'rgba(0,0,0,'+al*.85+')');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.beginPath();c.moveTo(P.x,P.y);c.arc(P.x,P.y,b.len*(m>1?1.06:1),b.a-b.ang*m,b.a+b.ang*m);c.closePath();c.fill()}}}
  for(const cd of room.candles)cut(cd.x,cd.y-10,82+Math.sin(tt*9+cd.ph)*5,.85);
  for(const w of room.windows){c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.moveTo(w-30,0);c.lineTo(w+30,0);c.lineTo(w+90,170);c.lineTo(w+10,170);c.closePath();c.fill()}
  for(const h of HZ)if(h.k==='candle')cut(h.x,h.y-8,h.r+10,.9);
  for(const f of FIREF)cut(f.x,f.y,44,.8);
  for(const o of ORBS)cut(o.x,o.y,26,.5);
  for(const b of BURSTS){const p=b.t/b.dur;cut(b.x,b.y,b.r*(.5+.5*p),.95*(1-p))}
  if(room.phase==='clear')for(const d of room.doors)cut(d.x,10,90,.8);
  if(room.chest)cut(room.chest.x,room.chest.y,70,.7);
  for(const g of G)if(g.tp==='golden')cut(g.x,g.y,55,.7);
  for(const d of DROPS)if(d.kind==='big')cut(d.x,d.y,22,.5);
  c.globalCompositeOperation='source-over';
}

function drawHUD(tt,dt){
  const c=ctx;c.textBaseline='middle';
  // hearts
  const hs=Math.min(28,W/22);
  for(let i=0;i<P.maxH;i++){const x=16+hs*.55+i*hs*1.08,y=22+hs*.15;const full=i<P.hearts;const pulse=full&&P.hearts===1?1+.12*Math.sin(tt*10):1;drawHeart(c,x,y,hs*pulse,'#ff5d8f',!full)}
  // xp bar
  const bx=16,by=26+hs*.85,bw=Math.min(260,W*.36),bh=10;
  c.fillStyle='rgba(20,12,38,.8)';rr(c,bx,by,bw,bh,5);c.fill();
  const g=c.createLinearGradient(bx,0,bx+bw,0);g.addColorStop(0,'#5ef2c2');g.addColorStop(1,'#b8ffe9');c.fillStyle=g;rr(c,bx,by,Math.max(bh,bw*clamp(R.xp/R.need,0,1)),bh,5);c.fill();
  c.font='900 12px "Trebuchet MS",Verdana,sans-serif';c.fillStyle='#fff';c.textAlign='left';c.fillText(t('lv',{n:R.lvl}),bx+bw+8,by+bh/2);
  // room pips
  c.textAlign='center';
  const narrow=W<640;
  if(R.mode==='story'){const pw=Math.min(22,W/26),cx=W/2,y=narrow?by+34:30;
    for(let i=1;i<=10;i++){const x=cx+(i-5.5)*pw;const done=i<R.room||(i===R.room&&room.phase==='clear'),cur=i===R.room;
      if(i===5||i===10){c.save();c.translate(x,y);const s=i===10?1:.8;c.scale(s,s);c.fillStyle=done?'#ffcf3a':cur?'#ff9d5c':'rgba(255,255,255,.25)';sheetPath(c,7,6,tt,i,3);c.fill();if(cur){c.strokeStyle='#fff';c.lineWidth=2;c.stroke()}c.restore()}
      else{circ(c,x,y,cur?6:4.5,done?'#5ef2c2':cur?'#ffffff':'rgba(255,255,255,.22)');if(cur){c.strokeStyle='rgba(255,255,255,.5)';c.lineWidth=2;c.beginPath();c.arc(x,y,9+Math.sin(tt*5),0,TAU);c.stroke()}}}
    if(!narrow){c.font='900 12px "Trebuchet MS",Verdana,sans-serif';c.fillStyle='rgba(255,255,255,.75)';c.fillText(t('ch'+R.ch),cx,y+18)}}
  else{const y0=narrow?by+30:26;c.font='900 17px "Arial Black","Trebuchet MS",sans-serif';c.fillStyle='#fff';c.fillText(t('room',{n:R.room}),W/2,y0);c.font='900 12px "Trebuchet MS",sans-serif';c.fillStyle='rgba(255,255,255,.6)';c.fillText(t('nightBest',{n:Math.max(S.nightBest,R.room)}),W/2,y0+18)}
  // candy
  const tot=Math.floor(R.earned+R.candy);c.font='900 20px "Arial Black","Trebuchet MS",sans-serif';c.textAlign='right';
  const tx=W-118;c.lineWidth=4;c.strokeStyle='rgba(20,10,40,.8)';c.strokeText(String(tot),tx,30);c.fillStyle='#ffcf3a';c.fillText(String(tot),tx,30);
  const tw=c.measureText(String(tot)).width;drawCandy(c,tx-tw-18,30,'#ff5d8f',1.1,-.4);
  // combo
  if(R.combo>=3){const s=1+Math.max(0,R.comboT-1.9)*1.2;c.save();c.translate(W-24,H*.26);c.scale(s,s);c.textAlign='right';
    c.font='900 '+(26+Math.min(20,R.combo*.4))+'px "Arial Black","Trebuchet MS",sans-serif';c.lineWidth=5;c.strokeStyle='rgba(20,10,40,.85)';c.strokeText('x'+R.combo,0,0);c.fillStyle=R.combo>=20?'#ffcf3a':R.combo>=10?'#c56bff':'#5ef2c2';c.fillText('x'+R.combo,0,0);
    c.fillStyle='rgba(255,255,255,.25)';c.fillRect(-90,20,90,5);c.fillStyle='#fff';c.fillRect(-90*clamp(R.comboT/2.3,0,1),20,90*clamp(R.comboT/2.3,0,1),5);
    const cm=1+Math.min(2,Math.floor(R.combo/10)*.5);if(cm>1){c.font='900 13px "Trebuchet MS",sans-serif';c.fillStyle='#ffcf3a';c.fillText(t('rw_candy')+' x'+cm,0,38)}c.restore()}
  // boss bar
  if(boss&&boss.spawnT<=0){const bw2=Math.min(520,W*.62),x=W/2-bw2/2,y=H-34;c.fillStyle='rgba(20,12,38,.85)';rr(c,x-4,y-4,bw2+8,22,9);c.fill();
    const f=1-clamp(boss.fear/boss.hp,0,1);const gg=c.createLinearGradient(x,0,x+bw2,0);gg.addColorStop(0,'#ff9d5c');gg.addColorStop(1,'#ff5d8f');c.fillStyle=gg;rr(c,x,y,Math.max(8,bw2*f),14,7);c.fill();
    c.font='900 14px "Arial Black","Trebuchet MS",sans-serif';c.textAlign='center';c.fillStyle='#fff';c.lineWidth=4;c.strokeStyle='rgba(20,10,40,.85)';c.strokeText(boss.name,W/2,y-14);c.fillText(boss.name,W/2,y-14)}
  // door indicators when doors are off-screen
  if(room.phase==='clear'&&room.doors.length&&state==='run'){for(const d of room.doors){const sx=(d.x-camX)*k+W/2,sy=(58-camY)*k+H/2;
    if(sy<(narrow?by+80:90)){const x=clamp(sx,40,W-40),y=(narrow?by+64:72)+Math.sin(tt*6)*5;c.save();c.translate(x,y);c.fillStyle=d.rw==='boss'?'#ff9d5c':'#5ef2c2';c.beginPath();c.moveTo(0,-22);c.lineTo(14,-6);c.lineTo(-14,-6);c.closePath();c.fill();
      c.fillStyle='rgba(20,12,38,.9)';rr(c,-20,-4,40,36,10);c.fill();c.strokeStyle=c.fillStyle=d.rw==='boss'?'#ff9d5c':'#5ef2c2';c.lineWidth=2;rr(c,-20,-4,40,36,10);c.stroke();
      c.translate(-15,-1);c.scale(.31,.31);drawIcon(c,'rw_'+d.rw);c.restore()}}}
  // touch controls
  if(touchMode){
    if(stick.on){circ(c,stick.ox,stick.oy,56,'rgba(255,255,255,.08)');c.strokeStyle='rgba(255,255,255,.25)';c.lineWidth=2;c.beginPath();c.arc(stick.ox,stick.oy,56,0,TAU);c.stroke();circ(c,stick.ox+stick.dx*44,stick.oy+stick.dy*44,24,'rgba(255,255,255,.35)')}
    const db=dashBtn();const rdy=P.dashCd<=0;circ(c,db.x,db.y,db.r,rdy?'rgba(94,242,194,.32)':'rgba(255,255,255,.1)');c.strokeStyle=rdy?'#5ef2c2':'rgba(255,255,255,.3)';c.lineWidth=3;c.beginPath();c.arc(db.x,db.y,db.r,0,TAU);c.stroke();
    if(!rdy){c.strokeStyle='#5ef2c2';c.lineWidth=5;c.beginPath();c.arc(db.x,db.y,db.r-6,-Math.PI/2,-Math.PI/2+TAU*(1-P.dashCd/P.dashCdMax));c.stroke()}
    c.font='900 14px "Arial Black","Trebuchet MS",sans-serif';c.textAlign='center';c.fillStyle='#fff';c.fillText(t('dash'),db.x,db.y)}
  // tutorial hints
  let ht=null;if(R.tut===1)ht=t('tutMove');else if(R.tut===2)ht=t('tutLight');else if(R.tut===3)ht=t('tutCandy');
  if(hint){hint.t+=dt;if(hint.t>hint.dur)hint=null;else ht=hint.text}
  if(ht){c.font='900 '+Math.min(20,W/30)+'px "Trebuchet MS",Verdana,sans-serif';c.textAlign='center';const w=c.measureText(ht).width+30,y=H*.78+Math.sin(tt*3)*3;
    c.fillStyle='rgba(20,12,38,.82)';rr(c,W/2-w/2,y-18,w,36,18);c.fill();c.strokeStyle='rgba(94,242,194,.6)';c.lineWidth=2;rr(c,W/2-w/2,y-18,w,36,18);c.stroke();c.fillStyle='#fff';c.fillText(ht,W/2,y+1)}
  // banner
  if(banner){banner.t+=dt;const p=banner.t/banner.dur;if(p>=1)banner=null;else{const s=p<.12?.5+p/.12*.6:p<.2?1.1-(p-.12)/.08*.1:1,a=p>.8?1-(p-.8)/.2:1;
    c.save();c.globalAlpha=a;c.translate(W/2,H*.38);c.scale(s,s);c.textAlign='center';c.font='900 '+Math.min(54,W/12)+'px "Arial Black","Segoe UI Black",Impact,sans-serif';c.lineWidth=8;c.strokeStyle='rgba(20,10,40,.9)';c.strokeText(banner.text,0,0);c.fillStyle=banner.col;c.fillText(banner.text,0,0);
    if(banner.sub){c.font='900 '+Math.min(20,W/26)+'px "Trebuchet MS",Verdana,sans-serif';c.lineWidth=5;c.strokeText(banner.sub,0,Math.min(44,W/16));c.fillStyle='#fff';c.fillText(banner.sub,0,Math.min(44,W/16))}c.restore()}}
}
function dashBtn(){const r=Math.max(34,Math.min(48,Math.min(W,H)*.09));return{x:W-r-26,y:H-r-30,r}}

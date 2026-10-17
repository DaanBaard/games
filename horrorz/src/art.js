/* ---------- procedural art (everything is drawn in code) ---------- */
function rr(c,x,y,w,h,r){r=Math.max(0,Math.min(r,w/2,h/2));c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function hexRgb(h){const n=parseInt(h.slice(1),16);return[n>>16,n>>8&255,n&255]}
function mix(a,b,t){const A=hexRgb(a),B=hexRgb(b);const h=v=>('0'+Math.max(0,Math.min(255,v|0)).toString(16)).slice(-2);return'#'+h(A[0]+(B[0]-A[0])*t)+h(A[1]+(B[1]-A[1])*t)+h(A[2]+(B[2]-A[2])*t)}
function shade(h,a){return a<0?mix(h,'#000000',-a):mix(h,'#ffffff',a)}
function rgba(h,a){const c=hexRgb(h);return'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')'}
const _hexA={};function hexA(h,a){const k=h+a;if(_hexA[k])return _hexA[k];return _hexA[k]=rgba(h,a)}
function ell(c,x,y,rx,ry,col){c.fillStyle=col;c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,TAU);c.fill()}
function circ(c,x,y,r,col){c.fillStyle=col;c.beginPath();c.arc(x,y,Math.max(.1,r),0,TAU);c.fill()}
function softShadow(c,x,y,rx,ry,a){const g=c.createRadialGradient(x,y,0,x,y,rx);g.addColorStop(0,'rgba(0,0,0,'+a+')');g.addColorStop(.6,'rgba(0,0,0,'+a*.55+')');g.addColorStop(1,'rgba(0,0,0,0)');c.save();c.translate(x,y);c.scale(1,ry/rx);c.translate(-x,-y);c.fillStyle=g;c.beginPath();c.arc(x,y,rx,0,TAU);c.fill();c.restore()}
function heartPath(c,x,y,s){c.beginPath();c.moveTo(x,y+s*.35);c.bezierCurveTo(x,y,x-s*.5,y-s*.05,x-s*.5,y+s*.32);c.bezierCurveTo(x-s*.5,y+s*.62,x-s*.1,y+s*.78,x,y+s*.95);c.bezierCurveTo(x+s*.1,y+s*.78,x+s*.5,y+s*.62,x+s*.5,y+s*.32);c.bezierCurveTo(x+s*.5,y-s*.05,x,y,x,y+s*.35);c.closePath()}
function starPath(c,x,y,r){c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr2=i%2?r*.45:r;c.lineTo(x+Math.cos(a)*rr2,y+Math.sin(a)*rr2)}c.closePath()}
function gearPath(c,r,n){c.beginPath();for(let i=0;i<n*2;i++){const a=i*Math.PI/n,rr2=i%2?r*.8:r;c.lineTo(Math.cos(a-.13)*rr2,Math.sin(a-.13)*rr2);c.lineTo(Math.cos(a+.13)*rr2,Math.sin(a+.13)*rr2)}c.closePath()}
function lin(c,x0,y0,x1,y1,stops){const g=c.createLinearGradient(x0,y0,x1,y1);for(const s of stops)g.addColorStop(s[0],s[1]);return g}
function rad(c,x,y,r0,r1,stops,ox,oy){const g=c.createRadialGradient(x+(ox||0),y+(oy||0),r0,x,y,r1);for(const s of stops)g.addColorStop(s[0],s[1]);return g}

/* ================= Lumi ================= */
function drawLumi(c,x,y,aim,t,skinId,mv,s,flash){
  const sk=SKIN[skinId]||SKINS[0];s=s||1;
  c.save();c.translate(x,y);c.scale(s,s);c.lineCap='round';c.lineJoin='round';
  const step=mv?Math.sin(t*11):0,bob=mv?Math.abs(step)*1.1:Math.sin(t*2.4)*.35;
  softShadow(c,0,12,14,5,.6);
  const ax=Math.cos(aim),ay=Math.sin(aim),up=ay<-.4;
  // legs + boots
  for(const sd of[-1,1]){const lo=step*sd;c.fillStyle='#24222b';rr(c,sd*4.3-2.6,3.5+lo*.6-bob,5.2,8.5,2.2);c.fill();
    ell(c,sd*4.3,12.2+lo*1.2,3.5,2.4,'#2a1c14');ell(c,sd*4.3-.8,11.6+lo*1.2,1.3,.7,'rgba(255,230,200,.18)')}
  c.translate(0,-bob);
  if(sk.id==='vamp'){c.fillStyle=lin(c,0,-10,0,14,[[0,'#1a1220'],[1,'#0c0810']]);c.beginPath();c.moveTo(-10,-9);c.quadraticCurveTo(-17,6,-15,15);c.quadraticCurveTo(0,18,15,15);c.quadraticCurveTo(17,6,10,-9);c.closePath();c.fill()}
  if(up)lumiArm(c,sk,ax,ay);
  // coat
  c.beginPath();c.moveTo(-8.6,-9);c.quadraticCurveTo(-11,-7,-11,-3);c.lineTo(-12,8);c.quadraticCurveTo(0,11,12,8);c.lineTo(11,-3);c.quadraticCurveTo(11,-7,8.6,-9);c.quadraticCurveTo(0,-11,-8.6,-9);c.closePath();
  c.fillStyle=lin(c,-12,0,12,0,[[0,shade(sk.coat,.18)],[.45,sk.coat],[1,shade(sk.coat,-.42)]]);c.fill();
  c.fillStyle=lin(c,0,-10,0,10,[[0,'rgba(255,255,255,.10)'],[.6,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,.35)']]);c.fill();
  c.save();c.clip();
  c.fillStyle=shade(sk.coat,-.25);c.fillRect(-13,6.5,26,4);
  if(sk.id==='skelly'){c.strokeStyle='rgba(225,220,205,.8)';c.lineWidth=1.3;for(let i=0;i<3;i++){c.beginPath();c.moveTo(-7,-4+i*3.4);c.quadraticCurveTo(0,-2+i*3.4,7,-4+i*3.4);c.stroke()}c.beginPath();c.moveTo(0,-7);c.lineTo(0,7);c.stroke()}
  if(sk.id==='astro'){c.fillStyle='#7d8798';rr(c,-5,-3,10,6,1.5);c.fill();circ(c,-2.4,0,1,'#c33');circ(c,.6,0,1,'#3a6');circ(c,3,0,1,'#dc3')}
  if(!up&&sk.id!=='astro'&&sk.id!=='skelly'){c.strokeStyle=shade(sk.coat,-.5);c.lineWidth=.8;c.beginPath();c.moveTo(.4,-8);c.lineTo(.8,9);c.stroke();
    for(const yy of[-4,0,4])circ(c,2.2,yy,.9,shade(sk.trim,-.2));c.beginPath();c.moveTo(-8,3);c.lineTo(-4,3.4);c.stroke()}
  c.restore();
  // head
  const hx=ax*.8,hy=-15;
  if(sk.id==='vamp'){c.fillStyle='#5a1020';c.beginPath();c.moveTo(-9,-10);c.lineTo(-11,-19);c.lineTo(-4,-12);c.closePath();c.fill();c.beginPath();c.moveTo(9,-10);c.lineTo(11,-19);c.lineTo(4,-12);c.closePath();c.fill()}
  const hoodCol=sk.id==='skelly'?'#1c1c22':sk.coat;
  const noHood=['pumpkin','witch','astro','vamp'].includes(sk.id);
  if(!noHood){c.fillStyle=rad(c,hx,hy,1,9.5,[[0,shade(hoodCol,.15)],[.75,hoodCol],[1,shade(hoodCol,-.45)]],-3,-3);c.beginPath();c.arc(hx,hy,9,0,TAU);c.fill()}
  else{c.fillStyle=rad(c,hx,hy+1,1,8,[[0,'#e2bb9c'],[1,'#a77a5e']],-2,-2);c.beginPath();c.arc(hx,hy+1,7.4,0,TAU);c.fill();
    c.fillStyle=sk.id==='vamp'?'#141016':'#4a2e1e';c.beginPath();c.arc(hx,hy,7.8,Math.PI*1.02,Math.PI*1.98);c.quadraticCurveTo(hx+3,hy-1,hx-1,hy-.5);c.closePath();c.fill()}
  if(!up){const fx=hx+ax*1.8,fy=hy+1+ay*.9;
    if(!noHood){c.fillStyle='#0e0b0e';c.beginPath();c.ellipse(fx,fy,6,6.3,0,0,TAU);c.fill()}
    c.fillStyle=rad(c,fx,fy+1,.5,6,[[0,'#ecc8aa'],[.8,'#c4977a'],[1,'#7a5848']],-1,-2);c.beginPath();c.ellipse(fx,fy+.6,4.7,5,0,0,TAU);c.fill();
    if(!noHood){c.fillStyle='#3a2418';c.beginPath();c.ellipse(fx,fy-3.4,4.6,2,0,Math.PI,TAU);c.fill();c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(fx,fy-2.6,5,2.2,0,Math.PI,TAU);c.fill()}
    const ex=ax*1.1,ey=ay*.6;for(const sd of[-1,1]){ell(c,fx+sd*1.9+ex,fy+.2+ey,.95,1.15,'#1b1512');circ(c,fx+sd*1.9+ex+.35,fy-.2+ey,.32,'rgba(255,255,255,.8)')}
    c.strokeStyle='rgba(120,60,50,.5)';c.lineWidth=.6;c.beginPath();c.moveTo(fx-1+ax,fy+3+ey);c.lineTo(fx+1+ax,fy+3+ey);c.stroke()}
  else if(!noHood){c.strokeStyle=shade(hoodCol,-.4);c.lineWidth=.8;c.beginPath();c.moveTo(hx,hy-8);c.quadraticCurveTo(hx+.5,hy,hx,hy+7);c.stroke()}
  lumiHat(c,sk,hx,hy,t);
  if(!up)lumiArm(c,sk,ax,ay);
  if(flash){c.globalAlpha=flash;c.fillStyle='#fff';rr(c,-13,-26,26,40,10);c.fill();c.globalAlpha=1}
  c.restore();
}
function lumiArm(c,sk,ax,ay){
  const sd=ax>=0?1:-1,sx=sd*8.4,sy=-6,hx=sx+ax*7.5,hy=sy+ay*5+2.5;
  c.strokeStyle=shade(sk.coat,-.2);c.lineWidth=4.6;c.beginPath();c.moveTo(sx,sy);c.lineTo(hx,hy);c.stroke();
  c.strokeStyle=shade(sk.coat,.08);c.lineWidth=1.4;c.beginPath();c.moveTo(sx-.6,sy-1.2);c.lineTo(hx-.6,hy-1.2);c.stroke();
  c.save();c.translate(hx,hy);c.rotate(Math.atan2(ay,ax));
  c.fillStyle=lin(c,0,-2.4,0,2.4,[[0,'#8d929e'],[.35,'#d8dbe2'],[.6,'#5a5f6c'],[1,'#2a2d36']]);rr(c,-1,-2.2,12,4.4,1.4);c.fill();
  c.fillStyle=lin(c,0,-3.2,0,3.2,[[0,'#6e7380'],[.4,'#c4c8d0'],[1,'#22252c']]);rr(c,10.5,-3.2,4.4,6.4,1.2);c.fill();
  c.fillStyle='#fff8dc';c.beginPath();c.ellipse(15,0,1.1,2.6,0,0,TAU);c.fill();
  c.fillStyle='#d8a888';c.beginPath();c.arc(1.5,0,2.4,0,TAU);c.fill();c.restore();
}
function lumiHat(c,sk,hx,hy,t){
  switch(sk.id){
    case 'pumpkin':c.fillStyle=lin(c,0,hy-14,0,hy-3,[[0,'#d07a38'],[1,'#7a3a12']]);c.beginPath();c.ellipse(hx,hy-5,8.6,7.4,0,Math.PI,TAU);c.lineTo(hx+8.6,hy-3);c.lineTo(hx-8.6,hy-3);c.closePath();c.fill();
      c.strokeStyle='rgba(60,25,8,.45)';c.lineWidth=.7;for(let i=-3;i<=3;i++){c.beginPath();c.moveTo(hx+i*2.2,hy-3);c.lineTo(hx+i*2,hy-10);c.stroke()}
      c.fillStyle='#5e2a0c';c.fillRect(hx-8.8,hy-4.2,17.6,2.4);circ(c,hx,hy-12.6,2.6,'#e8a86a');break;
    case 'witch':c.fillStyle=rad(c,hx,hy-4,1,14,[[0,'#3a3046'],[1,'#141018']]);c.beginPath();c.ellipse(hx,hy-4,13,4.6,0,0,TAU);c.fill();
      c.fillStyle=lin(c,hx-6,0,hx+6,0,[[0,'#3a3046'],[1,'#120e16']]);c.beginPath();c.moveTo(hx-6.5,hy-5);c.quadraticCurveTo(hx-2,hy-16,hx+5,hy-27);c.quadraticCurveTo(hx+3,hy-15,hx+6.5,hy-5);c.closePath();c.fill();
      c.fillStyle='#6a4a2a';c.fillRect(hx-6.5,hy-8,13,2.2);break;
    case 'astro':c.fillStyle=rad(c,hx,hy,2,11,[[0,'#f2f4f8'],[.8,'#c4c8d2'],[1,'#7c8494']],-3,-4);c.beginPath();c.arc(hx,hy,10.6,0,TAU);c.fill();
      c.fillStyle=lin(c,hx-6,hy-5,hx+6,hy+5,[[0,'#3a4a66'],[.5,'#10141e'],[1,'#26324a']]);c.beginPath();c.ellipse(hx,hy+1,7.2,6,0,0,TAU);c.fill();
      c.fillStyle='rgba(255,255,255,.55)';c.beginPath();c.ellipse(hx-3,hy-2,2.4,1.2,-.6,0,TAU);c.fill();break;
    case 'dino':c.fillStyle='#8aa850';for(let i=-2;i<=2;i++){const a=-Math.PI/2+i*.42,x=hx+Math.cos(a)*8.6,y=hy+Math.sin(a)*8.6;c.beginPath();c.moveTo(x-2.6*Math.sin(a),y+2.6*Math.cos(a));c.lineTo(x+Math.cos(a)*4.4,y+Math.sin(a)*4.4);c.lineTo(x+2.6*Math.sin(a),y-2.6*Math.cos(a));c.closePath();c.fill()}break;
    case 'skelly':c.fillStyle='rgba(225,220,205,.85)';c.beginPath();c.ellipse(hx,hy-6,3.6,2.8,0,0,TAU);c.fill();circ(c,hx-1.3,hy-6.2,.8,'#1c1c22');circ(c,hx+1.3,hy-6.2,.8,'#1c1c22');break;
    case 'golden':c.fillStyle=lin(c,0,hy-16,0,hy-8,[[0,'#ffe9a0'],[1,'#a87818']]);c.beginPath();c.moveTo(hx-6,hy-8);c.lineTo(hx-6,hy-14);c.lineTo(hx-3,hy-11);c.lineTo(hx,hy-16);c.lineTo(hx+3,hy-11);c.lineTo(hx+6,hy-14);c.lineTo(hx+6,hy-8);c.closePath();c.fill();break;
  }
}

/* ================= ghosts ================= */
function sheetPath(c,r,h,t,ph,n,sharp){
  c.beginPath();c.moveTo(-r,0);c.arc(0,0,r,Math.PI,0);c.lineTo(r,h);
  for(let i=0;i<n;i++){const x1=r-(i+.5)*(2*r/n),x2=r-(i+1)*(2*r/n),w=Math.sin(t*6+ph+i*1.7)*r*.12;
    if(sharp){c.lineTo(x1,h+r*.4+w);c.lineTo(x2,h)}else c.quadraticCurveTo(x1,h+r*.36+w,x2,h)}
  c.closePath()}
function wispPath(c,r,t,ph){const sw=Math.sin(t*4+ph)*r*.55;c.beginPath();c.moveTo(-r,0);c.arc(0,0,r,Math.PI,0);
  c.quadraticCurveTo(r*.95,r*1.05,sw,r*2.1);c.quadraticCurveTo(-r*.95,r*1.05,-r,0);c.closePath()}
function specterPath(c,r,hl,t,ph,n,rag,wide){
  wide=wide||1.08;const H=hl*r;c.beginPath();c.moveTo(-r,0);c.arc(0,0,r,Math.PI,0);
  c.bezierCurveTo(r*1.02,r*.7,r*wide+Math.sin(t*2+ph)*r*.08,H*.7,r*wide*.98,H);
  for(let i=0;i<n;i++){const x=r*wide-(i+.5)*(2*wide*r/n),x2=r*wide-(i+1)*(2*wide*r/n),w=Math.sin(t*3.1+ph+i*1.9)*r*.16,len=r*rag*(.55+.45*Math.abs(Math.sin(i*2.3+ph)));
    c.quadraticCurveTo(x+w*.4+r*.08,H+len*.6,x+w,H+len);c.quadraticCurveTo(x+w*.2-r*.06,H+len*.5,x2,H+Math.sin(t*2+i)*r*.05)}
  c.bezierCurveTo(-r*wide-Math.sin(t*2+ph+1)*r*.08,H*.7,-r*1.02,r*.7,-r,0);c.closePath()}
function ghostShape(c,g,t){const r=g.r,lk=g.look||g.tp;
  if(lk==='wisp'||lk==='mini'||lk==='golden'||lk==='mote')wispPath(c,r,t,g.ph);
  else if(lk==='shade')specterPath(c,r*.8,1.5,t,g.ph,5,.5,.9);
  else if(lk==='wailer')specterPath(c,r*.85,2.1,t,g.ph,6,.6,1);
  else if(lk==='moaner')specterPath(c,r,1.3,t,g.ph,5,.45,1.25);
  else specterPath(c,r,g.boss?1.2:1.1,t,g.ph,g.boss?8:6,.5)}
function ghostScale(g){const F=clamp(g.fear/g.hp,0,1);return{F,sc:(1-F*(g.boss?.1:.22))*(g.spawnT>0?.5+.5*(1-g.spawnT/(g.spawnMax||.9)):1)}}
function socket(c,x,y,rx,ry,a){c.fillStyle=rad(c,x,y,0,Math.max(rx,ry),[[0,'rgba(4,4,10,'+a+')'],[.65,'rgba(4,4,10,'+a*.75+')'],[1,'rgba(4,4,10,0)']]);c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill()}
function ghostFace(c,g,r,F,t){
  const lk=g.look||g.tp,a=.85;
  if(lk==='shade'||lk==='drinker')return;
  const ey=-r*.12,ex=r*.33,sx=r*.17*(1+F*.25),sy=r*.23*(1+F*.35);
  if(lk==='peeker'){socket(c,ex,ey,sx,sy,a);}
  else{socket(c,-ex,ey,sx,sy,a);socket(c,ex,ey,sx,sy,a)}
  const scream=F+(g.charging||g.wailT>0?.6:0);
  socket(c,0,r*.36,r*(.1+scream*.06),r*(.1+Math.min(1,scream)*.3),.8);
}
function drawTrail(c,g){if(!g.tr||g.tr.length<2)return;const col=g.col;for(let i=0;i<g.tr.length;i++){const p=g.tr[i],a=(i+1)/g.tr.length*.12*g.alpha;c.fillStyle=hexA(col,a.toFixed(3));c.beginPath();c.ellipse(p[0],p[1]-g.r*.2,g.r*.8,g.r*1.1,0,0,TAU);c.fill()}}
function drawGhostBody(c,g,t){
  if(g.hidden){drawCandleObj(c,g.x,g.y+6,t,g.ph,1);return}
  const {F,sc}=ghostScale(g);const r=g.r,lk=g.look||g.tp;
  drawTrail(c,g);
  const bob=Math.sin(t*2.6+g.ph)*r*.12,sh=g.lit?(Math.random()-.5)*r*.1:0;
  c.save();c.translate(g.x,g.y);
  softShadow(c,0,r*1.5,r*.9*sc,r*.28*sc,.35*g.alpha);
  c.translate(sh,bob-r*.25);c.scale(sc*(1-F*.06),sc*(1+F*.12));
  const al=g.alpha*(g.lit?.9:.7),col=g.elite?mix(g.col,'#e8c060',.25):g.col;
  const body=g.hitT>0?'#ffffff':mix(col,'#f4f6ff',F*.6);
  c.globalAlpha=1;
  switch(lk){
    case 'drinker':{for(let i=0;i<7;i++){const a=t*.8+i*.9+g.ph,d=r*(.35+.25*Math.sin(t*1.7+i)),x=Math.cos(a)*d,y=Math.sin(a)*d*.8;c.fillStyle=rad(c,x,y,0,r*.9,[[0,'rgba(8,6,12,'+(.75*al)+')'],[1,'rgba(8,6,12,0)']]);c.beginPath();c.arc(x,y,r*.9,0,TAU);c.fill()}
      c.strokeStyle='rgba(10,8,14,'+(.6*al)+')';c.lineWidth=2;for(let i=0;i<5;i++){const a=i*1.3+t;c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(Math.cos(a)*r*1.2,Math.sin(a)*r*1.2+r*.4,Math.cos(a+.6)*r*1.7,Math.sin(a+.6)*r*1.5+r*.8);c.stroke()}break}
    case 'shade':{c.fillStyle=lin(c,0,-r,0,r*1.9,[[0,'rgba(18,14,24,'+(.95*g.alpha)+')'],[.7,'rgba(18,14,24,'+(.8*g.alpha)+')'],[1,'rgba(18,14,24,0)']]);ghostShape(c,g,t);c.fill();
      c.fillStyle='rgba(18,14,24,'+(.95*g.alpha)+')';c.beginPath();c.arc(0,-r*.95,r*.42,0,TAU);c.fill();
      c.strokeStyle='rgba(140,110,190,'+(.25*g.alpha)+')';c.lineWidth=1.4;ghostShape(c,g,t);c.stroke();break}
    case 'pumpkin':{c.fillStyle=lin(c,0,0,0,r*1.8,[[0,'rgba(30,24,22,'+(.9*g.alpha)+')'],[1,'rgba(30,24,22,0)']]);specterPath(c,r*.85,1,t,g.ph,6,.6,1.1);c.fill();
      c.save();c.translate(0,-r*.35);for(let i=-2;i<=2;i++){c.fillStyle=lin(c,i*r*.3-r*.4,0,i*r*.3+r*.4,0,[[0,'#6a2c0c'],[.5,i===0?'#d8762a':'#b85e20'],[1,'#5a240a']]);c.beginPath();c.ellipse(i*r*.3,0,r*.42,r*.78,0,0,TAU);c.fill()}
      c.fillStyle='rgba(255,220,150,.12)';c.beginPath();c.ellipse(-r*.3,-r*.35,r*.25,r*.14,-.4,0,TAU);c.fill();c.fillStyle='#3a4a1a';rr(c,-r*.08,-r*1.02,r*.16,r*.3,2);c.fill();
      c.fillStyle='#1a0a02';for(const sd of[-1,1]){c.beginPath();c.moveTo(sd*r*.52,-r*.04);c.lineTo(sd*r*.18,-r*.04);c.lineTo(sd*r*.35,-r*(.36+F*.1));c.closePath();c.fill()}
      c.beginPath();c.moveTo(-r*.5,r*.2);c.lineTo(-r*.28,r*.34);c.lineTo(-r*.12,r*.22);c.lineTo(0,r*.36);c.lineTo(r*.12,r*.22);c.lineTo(r*.28,r*.34);c.lineTo(r*.5,r*.2);c.quadraticCurveTo(0,r*(.62+F*.15),-r*.5,r*.2);c.fill();c.restore();break}
    case 'mimic':{c.fillStyle=lin(c,0,-r,0,r*1.8,[[0,rgba('#efe4c8',al)],[.7,rgba('#d8c8a0',al*.8)],[1,'rgba(216,200,160,0)']]);specterPath(c,r,1,t,g.ph,6,.7,1.05);c.fill();
      c.fillStyle=rgba('#f6eed8',.7*al);for(let i=0;i<4;i++){const x=-r*.7+i*r*.45;rr(c,x,-r*.2,r*.14,r*(.6+.3*Math.sin(i*2.1)),r*.07);c.fill()}
      ghostFace(c,g,r,F,t);break}
    case 'flitter':case 'mote':{const fl=Math.sin(t*(lk==='mote'?30:22)+g.ph);c.fillStyle=rgba('#e8dcd0',.45*al);c.strokeStyle=rgba('#ffffff',.25*al);c.lineWidth=.7;
      for(const sd of[-1,1]){c.beginPath();c.moveTo(sd*r*.3,-r*.1);c.bezierCurveTo(sd*r*1.3,-r*(1.1+fl*.5),sd*r*2.1,-r*(.4+fl*.4),sd*r*1.4,r*.35);c.quadraticCurveTo(sd*r*.9,r*.5,sd*r*.3,r*.2);c.closePath();c.fill();c.stroke();
        c.beginPath();c.moveTo(sd*r*.4,0);c.lineTo(sd*r*1.4,-r*(.6+fl*.4));c.moveTo(sd*r*.4,r*.1);c.lineTo(sd*r*1.5,r*.1);c.stroke()}
      c.fillStyle=lin(c,0,-r,0,r*2,[[0,rgba(body,al)],[1,'rgba(230,220,230,0)']]);wispPath(c,r*.7,t,g.ph);c.fill();if(lk==='flitter')ghostFace(c,g,r*.7,F,t);break}
    default:{
      if(lk==='moth'){c.fillStyle=rgba('#a89276',.7*al);for(const sd of[-1,1]){c.beginPath();c.ellipse(sd*r*1.05,-r*.1,r*.8,r*.58+Math.sin(t*5)*r*.05,sd*.5,0,TAU);c.fill();c.fillStyle=rgba('#4a3a5a',.7*al);c.beginPath();c.arc(sd*r*1.15,-r*.15,r*.18,0,TAU);c.fill();c.fillStyle=rgba('#a89276',.7*al)}}
      const H=r*2.2;
      c.fillStyle=lin(c,0,-r,0,H,[[0,rgba(body,.92*al)],[.45,rgba(body,.75*al)],[1,rgba(body,0)]]);ghostShape(c,g,t);c.fill();
      c.fillStyle=rad(c,0,-r*.3,0,r*1.1,[[0,'rgba(255,255,255,'+(.22*al)+')'],[1,'rgba(255,255,255,0)']]);c.beginPath();c.arc(0,-r*.3,r*1.1,0,TAU);c.fill();
      if(lk==='sheet'||g.boss){c.save();ghostShape(c,g,t);c.clip();c.lineWidth=r*.12;for(let i=-2;i<=2;i++){const x=i*r*.42+Math.sin(t*1.5+i)*r*.05;c.strokeStyle=lin(c,0,0,0,H,[[0,'rgba(0,0,0,0)'],[.4,'rgba(40,40,60,'+(.12*al)+')'],[1,'rgba(40,40,60,0)']]);c.beginPath();c.moveTo(x*.4,r*.3);c.quadraticCurveTo(x*.9,H*.5,x*1.1,H);c.stroke()}c.restore()}
      if(lk==='peeker'||lk==='widow'){c.fillStyle='rgba(10,8,12,'+(.88*al)+')';c.beginPath();c.moveTo(-r*.98,-r*.1);c.arc(0,-r*.1,r*.98,Math.PI,0);
        c.quadraticCurveTo(r*1.05,r*.6,r*(1+Math.sin(t*2+g.ph)*.05),r*1.35);for(let i=0;i<4;i++){c.lineTo(r*(.92-i*.14),r*(1.15+((i%2)?.18:0)))}c.lineTo(r*.32,r*.9);c.quadraticCurveTo(r*.36,r*.1,r*.3,-r*.42);
        c.quadraticCurveTo(0,-r*.62,-r*.3,-r*.42);c.quadraticCurveTo(-r*.36,r*.1,-r*.32,r*.9);for(let i=0;i<4;i++){c.lineTo(-r*(.46+i*.14),r*(1.15+((i%2)?0:.18)))}c.lineTo(-r*(1+Math.sin(t*2+g.ph+1)*.05),r*1.35);c.quadraticCurveTo(-r*1.05,r*.6,-r*.98,-r*.1);c.fill();
        c.strokeStyle='rgba(60,56,70,'+(.4*al)+')';c.lineWidth=.8;for(let i=-3;i<=3;i++){if(Math.abs(i)<2)continue;c.beginPath();c.moveTo(i*r*.2,-r*.9);c.quadraticCurveTo(i*r*.3,r*.2,i*r*.28,r*1.1);c.stroke()}}
      if(lk==='wailer'){c.lineWidth=1.6;for(let i=0;i<14;i++){const u=i/13-.5,x0=u*r*1.6;c.strokeStyle='rgba(200,215,230,'+(.35*al)+')';c.beginPath();c.moveTo(x0*.5,-r*.95);c.quadraticCurveTo(x0*1.2,-r*1.6,x0*1.6+Math.sin(t*4+i)*r*.2,-r*(2.1+Math.abs(u)));c.stroke()}}
      if(lk==='moaner'){c.strokeStyle=rgba('#a8e08a',.45*al);c.lineWidth=2;for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(i*r*.06,r*.45);c.quadraticCurveTo(i*r*.15,r*.8,i*r*.1,r*(1+.2*Math.sin(t*3+i)));c.stroke()}}
      ghostFace(c,g,r,F,t);
      bossDress(c,g,r,t,al);
    }
  }
  if(g.elite){c.strokeStyle='rgba(230,190,90,'+(.35*g.alpha)+')';c.lineWidth=2;ghostShape(c,g,t);c.stroke()}
  c.restore();
}
function bossDress(c,g,r,t,al){
  switch(g.look){
    case 'butler':c.fillStyle=rgba('#141018',.85*al);c.beginPath();c.moveTo(-r*.95,r*.4);c.lineTo(-r*.25,r*.25);c.lineTo(0,r*.75);c.lineTo(r*.25,r*.25);c.lineTo(r*.95,r*.4);c.lineTo(r*.9,r*1.4);c.lineTo(-r*.9,r*1.4);c.closePath();c.fill();
      c.fillStyle=rgba('#e8e4dc',.8*al);c.beginPath();c.moveTo(-r*.22,r*.27);c.lineTo(0,r*.72);c.lineTo(r*.22,r*.27);c.closePath();c.fill();c.fillStyle='#1a1418';c.beginPath();c.moveTo(0,r*.36);c.lineTo(-r*.14,r*.28);c.lineTo(-r*.14,r*.44);c.closePath();c.fill();c.beginPath();c.moveTo(0,r*.36);c.lineTo(r*.14,r*.28);c.lineTo(r*.14,r*.44);c.closePath();c.fill();
      circ(c,-r*1.05,r*.9,r*.13,rgba('#eeeae0',.8*al));circ(c,r*1.05,r*.9,r*.13,rgba('#eeeae0',.8*al));break;
    case 'mama':case 'countess':c.fillStyle=lin(c,0,-r,0,r*1.6,[[0,rgba('#f4f0ff',.35*al)],[1,'rgba(244,240,255,0)']]);c.beginPath();c.moveTo(-r*.8,-r*.7);c.quadraticCurveTo(0,-r*1.3,r*.8,-r*.7);c.lineTo(r*1.3,r*1.5);c.lineTo(-r*1.3,r*1.5);c.closePath();c.fill();
      if(g.look==='countess'){c.fillStyle=rgba('#c8ccd8',.9*al);for(let i=-2;i<=2;i++){c.beginPath();c.moveTo(i*r*.16-r*.06,-r*.9);c.lineTo(i*r*.16,-r*(1.12+(i===0?.1:0)));c.lineTo(i*r*.16+r*.06,-r*.9);c.fill()}}break;
    case 'mossy':for(const [x,y,s] of[[-.5,-.4,.28],[.4,.5,.32],[.1,-.85,.2],[-.6,.8,.25]]){c.fillStyle=rad(c,x*r,y*r,0,s*r,[[0,'rgba(70,110,60,'+(.7*al)+')'],[1,'rgba(70,110,60,0)']]);c.beginPath();c.arc(x*r,y*r,s*r,0,TAU);c.fill()}break;
    case 'grumble':c.fillStyle=lin(c,0,r*.4,0,r*1.4,[[0,rgba('#c8d0dc',.7*al)],[1,'rgba(200,208,220,0)']]);c.beginPath();c.moveTo(-r*.5,r*.42);c.quadraticCurveTo(0,r*1.5,r*.5,r*.42);c.quadraticCurveTo(0,r*.65,-r*.5,r*.42);c.fill();
      c.strokeStyle='rgba(20,20,30,'+(.6*al)+')';c.lineWidth=r*.1;c.beginPath();c.moveTo(-r*.55,-r*.42);c.lineTo(-r*.15,-r*.32);c.moveTo(r*.55,-r*.42);c.lineTo(r*.15,-r*.32);c.stroke();break;
    case 'cog':c.save();c.translate(0,r*.7);c.rotate(t);c.fillStyle=rad(c,0,0,0,r*.4,[[0,'#d8b468'],[1,'#7a5a20']]);gearPath(c,r*.38,9);c.fill();circ(c,0,0,r*.1,'#3a2a10');c.restore();break;
    case 'clock':c.fillStyle=rad(c,0,r*.65,0,r*.35,[[0,'#f2ead2'],[1,'#a89878']]);c.beginPath();c.arc(0,r*.65,r*.33,0,TAU);c.fill();c.strokeStyle='#3a3040';c.lineWidth=r*.04;c.stroke();
      for(let i=0;i<12;i++){const a=i*TAU/12;c.beginPath();c.moveTo(Math.cos(a)*r*.27,r*.65+Math.sin(a)*r*.27);c.lineTo(Math.cos(a)*r*.31,r*.65+Math.sin(a)*r*.31);c.stroke()}
      c.beginPath();c.moveTo(0,r*.65);c.lineTo(Math.cos(t*2)*r*.24,r*.65+Math.sin(t*2)*r*.24);c.moveTo(0,r*.65);c.lineTo(Math.cos(t*.3)*r*.16,r*.65+Math.sin(t*.3)*r*.16);c.stroke();break;
    case 'lily':for(let i=0;i<7;i++){const a=-Math.PI+i*Math.PI/6;c.fillStyle=rgba('#f2e2ea',.85*al);c.beginPath();c.ellipse(Math.cos(a)*r*.8,-r*.2+Math.sin(a)*r*.8,r*.13,r*.08,a,0,TAU);c.fill()}break;
    case 'widow':c.fillStyle=lin(c,0,-r,0,r*1.6,[[0,'rgba(10,8,14,'+(.7*al)+')'],[1,'rgba(10,8,14,0)']]);c.beginPath();c.moveTo(-r*.9,-r*.6);c.quadraticCurveTo(0,-r*1.4,r*.9,-r*.6);c.lineTo(r*1.2,r*1.6);c.lineTo(-r*1.2,r*1.6);c.closePath();c.fill();break;
  }
}
function drawGhostEyes(c,g,t,vis){
  if(vis<=.02)return;
  const {F,sc}=ghostScale(g);const r=g.r,lk=g.look||g.tp;
  if(g.hidden){drawFlame(c,g.x,g.y-8,t,g.ph,1);return}
  const bob=Math.sin(t*2.6+g.ph)*r*.12;
  c.save();c.translate(g.x,g.y+bob-r*.25);c.scale(sc*(1-F*.06),sc*(1+F*.12));c.globalAlpha=vis*g.alpha;
  const blink=((t*.37+g.ph)%4)>3.88?.1:1;const lit=g.lit;
  const pin=(x,y,s)=>{c.fillStyle=rad(c,x,y,0,s*4,[[0,hexA(g.eye,lit?.25:.5)],[1,hexA(g.eye,0)]]);c.beginPath();c.arc(x,y,s*4,0,TAU);c.fill();
    c.fillStyle=hexA(g.eye,lit?.7:1);c.beginPath();c.ellipse(x,y,s,s*blink,0,0,TAU);c.fill();c.fillStyle='rgba(255,255,255,'+(lit?.6:.9)+')';c.beginPath();c.arc(x,y,s*.45,0,TAU);c.fill()};
  if(lk==='pumpkin'){const fl=.75+.25*Math.sin(t*17+g.ph)*Math.sin(t*7);c.translate(0,-r*.35);c.globalCompositeOperation='lighter';
    c.fillStyle=rad(c,0,0,0,r*1.1,[[0,'rgba(255,150,40,'+(.3*fl)+')'],[1,'rgba(255,150,40,0)']]);c.beginPath();c.arc(0,0,r*1.1,0,TAU);c.fill();
    c.fillStyle='rgba(255,'+(180+fl*50|0)+',80,'+(.85*fl)+')';for(const sd of[-1,1]){c.beginPath();c.moveTo(sd*r*.48,-r*.06);c.lineTo(sd*r*.22,-r*.06);c.lineTo(sd*r*.35,-r*(.32+F*.1));c.closePath();c.fill()}
    c.beginPath();c.moveTo(-r*.46,r*.22);c.lineTo(-r*.28,r*.34);c.lineTo(-r*.12,r*.24);c.lineTo(0,r*.36);c.lineTo(r*.12,r*.24);c.lineTo(r*.28,r*.34);c.lineTo(r*.46,r*.22);c.quadraticCurveTo(0,r*(.58+F*.15),-r*.46,r*.22);c.fill();c.globalCompositeOperation='source-over'}
  else if(lk==='mimic'){drawFlame(c,0,-r*1.05,t,g.ph,1.2);pin(-r*.33,-r*.12,r*.07);pin(r*.33,-r*.12,r*.07)}
  else if(lk==='mote'){c.globalCompositeOperation='lighter';c.fillStyle=rad(c,0,0,0,r*1.8,[[0,'rgba(255,240,180,.55)'],[1,'rgba(255,240,180,0)']]);c.beginPath();c.arc(0,0,r*1.8,0,TAU);c.fill();circ(c,0,0,r*.25,'#fff8d8');c.globalCompositeOperation='source-over'}
  else if(lk==='golden'){c.globalCompositeOperation='lighter';c.fillStyle=rad(c,0,0,0,r*2.4,[[0,'rgba(255,210,110,.6)'],[1,'rgba(255,210,110,0)']]);c.beginPath();c.arc(0,0,r*2.4,0,TAU);c.fill();c.globalCompositeOperation='source-over';
    c.fillStyle=lin(c,0,-r,0,r*2,[[0,'rgba(255,236,170,.95)'],[1,'rgba(255,200,90,0)']]);wispPath(c,r,t,g.ph);c.fill();pin(-r*.3,-r*.1,r*.08);pin(r*.3,-r*.1,r*.08)}
  else if(lk==='shade'){pin(-r*.2,-r*.98,r*.06);pin(r*.2,-r*.98,r*.06)}
  else if(lk==='drinker'){pin(-r*.28,-r*.1,r*.07);pin(r*.28,-r*.1,r*.07)}
  else if(lk==='peeker'){pin(r*.33,-r*.12,r*.08)}
  else{const s=r*(lk==='flitter'?.06:.075)*(g.boss?.8:1),k=lk==='flitter'?.7:1;pin(-r*.33*k,-r*.12*k,s);pin(r*.33*k,-r*.12*k,s)}
  // faint outline so threats read in the dark
  if(!lit&&lk!=='mote'&&lk!=='golden'&&lk!=='mimic'){c.globalAlpha=vis*g.alpha*.1;c.strokeStyle=g.eye;c.lineWidth=1.5;ghostShape(c,g,t);c.stroke()}
  c.restore();
}

/* ================= pickups & props ================= */
function drawCandy(c,x,y,col,s,rot){c.save();c.translate(x,y);c.rotate(rot||0);c.scale(s,s);
  for(const sd of[-1,1]){c.fillStyle=lin(c,0,-5,0,5,[[0,shade(col,.25)],[.5,col],[1,shade(col,-.45)]]);c.beginPath();c.moveTo(sd*5.5,0);c.lineTo(sd*10.5,-4.6);c.lineTo(sd*9.5,0);c.lineTo(sd*10.5,4.6);c.closePath();c.fill();
    c.strokeStyle='rgba(0,0,0,.25)';c.lineWidth=.6;c.beginPath();c.moveTo(sd*6,0);c.lineTo(sd*10,-3);c.moveTo(sd*6,0);c.lineTo(sd*10,3);c.stroke()}
  c.fillStyle=rad(c,0,0,.5,7,[[0,shade(col,.35)],[.6,col],[1,shade(col,-.5)]],-2,-2);c.beginPath();c.ellipse(0,0,6.6,5.2,0,0,TAU);c.fill();
  c.fillStyle='rgba(255,255,255,.55)';c.beginPath();c.ellipse(-2,-2.2,2.6,1.1,-.3,0,TAU);c.fill();c.restore()}
function drawLolly(c,x,y,s,t){c.save();c.translate(x,y);c.scale(s,s);c.fillStyle=lin(c,-1,0,1,0,[[0,'#d8d0c0'],[1,'#8a8070']]);c.fillRect(-1,5,2,12);
  c.fillStyle=rad(c,0,0,1,8,[[0,'#e86a7a'],[.7,'#a8283c'],[1,'#5a1020']],-2,-2);c.beginPath();c.arc(0,0,8,0,TAU);c.fill();
  c.strokeStyle='rgba(255,230,230,.55)';c.lineWidth=1.4;c.beginPath();for(let a=0;a<TAU*2.1;a+=.25){const r2=a*.55;c.lineTo(Math.cos(a+t)*r2,Math.sin(a+t)*r2)}c.stroke();
  c.fillStyle='rgba(255,255,255,.45)';c.beginPath();c.ellipse(-3,-3,2.4,1.2,-.6,0,TAU);c.fill();c.restore()}
function drawSoul(c,x,y,t){const f=Math.sin(t*14)*1.2;c.fillStyle=rad(c,x,y,0,9,[[0,'rgba(170,230,255,.4)'],[1,'rgba(170,230,255,0)']]);c.beginPath();c.arc(x,y,9,0,TAU);c.fill();
  c.fillStyle=lin(c,x,y-8,x,y+4,[[0,'rgba(220,245,255,0)'],[1,'rgba(220,245,255,.9)']]);c.beginPath();c.moveTo(x,y-8-f);c.quadraticCurveTo(x+4,y-1,x+2.6,y+2.6);c.arc(x,y+2,2.8,0,Math.PI);c.quadraticCurveTo(x-4,y-1,x,y-8-f);c.fill();circ(c,x,y+2,1.4,'#fff')}
function drawHeart(c,x,y,s,col,empty){heartPath(c,x,y-s*.45,s);
  if(empty){c.fillStyle='rgba(0,0,0,.35)';c.fill();c.strokeStyle='rgba(200,170,160,.35)';c.lineWidth=Math.max(1,s*.05);c.stroke();return}
  c.fillStyle=rad(c,x,y-s*.1,s*.05,s*.7,[[0,'#d8505a'],[.6,'#8e1a28'],[1,'#3e0810']],-s*.15,-s*.2);c.fill();c.strokeStyle='rgba(30,0,6,.7)';c.lineWidth=Math.max(1,s*.05);c.stroke();
  c.fillStyle='rgba(255,220,220,.45)';c.beginPath();c.ellipse(x-s*.22,y-s*.2,s*.1,s*.06,-.6,0,TAU);c.fill()}
function drawChest(c,x,y,s,open,t){c.save();c.translate(x,y);c.scale(s,s);softShadow(c,0,16,26,7,.5);
  const wd=lin(c,-20,0,20,0,[[0,'#3a2414'],[.5,'#6a4426'],[1,'#2a180c']]);
  c.fillStyle=wd;rr(c,-20,-6,40,22,3);c.fill();c.fillStyle=lin(c,0,-6,0,16,[[0,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,.4)']]);rr(c,-20,-6,40,22,3);c.fill();
  c.fillStyle='#2a2a30';c.fillRect(-20,3,40,3);c.fillRect(-14,-6,3,22);c.fillRect(11,-6,3,22);
  c.save();if(open){c.translate(0,-6);c.rotate(-.95);c.translate(0,6)}
  c.fillStyle=lin(c,0,-18,0,-4,[[0,'#7a5030'],[1,'#3e2614']]);rr(c,-21,-18,42,14,5);c.fill();c.fillStyle='#2a2a30';c.fillRect(-14,-18,3,14);c.fillRect(11,-18,3,14);c.restore();
  if(open){c.fillStyle=rad(c,0,-6,0,18,[[0,'rgba(255,220,140,.9)'],[1,'rgba(255,200,100,0)']]);c.beginPath();c.ellipse(0,-6,18,6,0,0,TAU);c.fill()}
  else{c.fillStyle=lin(c,-3,0,3,0,[[0,'#8a6a20'],[.5,'#e8c870'],[1,'#7a5a18']]);rr(c,-3.5,-6,7,8,1.5);c.fill();circ(c,0,-2,1,'#2a1a08')}c.restore()}
function drawCandleObj(c,x,y,t,ph,s){s=s||1;c.save();c.translate(x,y);c.scale(s,s);softShadow(c,0,4,9,3.5,.45);
  c.fillStyle=lin(c,-6,0,6,0,[[0,'#6a5420'],[.5,'#d8b458'],[1,'#5a4418']]);c.beginPath();c.ellipse(0,3,6.5,2.6,0,0,TAU);c.fill();
  c.fillStyle=lin(c,-3.5,0,3.5,0,[[0,'#c8bca0'],[.4,'#f4ecd8'],[1,'#9a8e74']]);rr(c,-3.4,-13,6.8,16,1.8);c.fill();
  c.fillStyle='rgba(250,245,230,.9)';c.beginPath();c.moveTo(-3.4,-12);c.quadraticCurveTo(-4,-7,-3.2,-5);c.lineTo(-2.4,-11);c.fill();c.fillStyle='#2a2018';c.fillRect(-.4,-15,.8,2.4);c.restore()}
function drawFlame(c,x,y,t,ph,s){s=s||1;const f=Math.sin(t*13+ph)*.15+Math.sin(t*7.3+ph*2)*.1;c.save();c.translate(x,y);c.scale(s,s*(1+f));
  c.globalCompositeOperation='lighter';c.fillStyle=rad(c,0,-3,0,12,[[0,'rgba(255,170,70,.45)'],[1,'rgba(255,140,40,0)']]);c.beginPath();c.arc(0,-3,12,0,TAU);c.fill();c.globalCompositeOperation='source-over';
  c.fillStyle=lin(c,0,-11,0,0,[[0,'rgba(255,170,60,0)'],[.4,'#ffa43a'],[1,'#ff7a20']]);c.beginPath();c.moveTo(0,-11);c.quadraticCurveTo(4,-3,0,0);c.quadraticCurveTo(-4,-3,0,-11);c.fill();
  c.fillStyle='#fff4c8';c.beginPath();c.moveTo(0,-7);c.quadraticCurveTo(1.8,-2.5,0,-.6);c.quadraticCurveTo(-1.8,-2.5,0,-7);c.fill();circ(c,0,-.4,.9,'rgba(80,120,255,.6)');c.restore()}
function drawRitualCandle(c,rc,t){c.save();c.translate(rc.x,rc.y);softShadow(c,0,6,20,7,.5);
  c.strokeStyle='rgba(180,40,30,'+(rc.lit?.25:.55)+')';c.lineWidth=2;c.beginPath();c.arc(0,4,18,0,TAU);c.stroke();
  for(let i=0;i<5;i++){const a=-Math.PI/2+i*TAU/5;c.beginPath();c.moveTo(Math.cos(a)*18,4+Math.sin(a)*18*.45);c.lineTo(Math.cos(a+TAU*2/5)*18,4+Math.sin(a+TAU*2/5)*18*.45);c.stroke()}
  c.fillStyle=lin(c,-5,0,5,0,[[0,'#2a2224'],[.4,'#4a3c3e'],[1,'#1a1416']]);rr(c,-4.6,-20,9.2,24,2);c.fill();c.fillStyle='#120c0c';c.fillRect(-.5,-23,1,3);
  if(!rc.lit&&rc.p>0){c.strokeStyle='rgba(255,190,90,.9)';c.lineWidth=3;c.beginPath();c.arc(0,-6,26,-Math.PI/2,-Math.PI/2+TAU*rc.p);c.stroke()}
  c.restore()}

/* ================= furniture ================= */
const WOOD={dark:[56,34,22],mid:[96,62,38],pale:[132,104,72],grey:[100,92,82],red:[90,40,30]};
function woodP(c,k){return pat(c,woodGrain(k,WOOD[k]),.5)}
function stoneP(c,k,b){return pat(c,stoneGrain(k,b),.6)}
function bevel(c,x,y,w,h,r,a){c.save();rr(c,x,y,w,h,r);c.clip();c.strokeStyle='rgba(255,235,210,'+(a||.14)+')';c.lineWidth=2;c.beginPath();c.moveTo(x,y+h);c.lineTo(x,y);c.lineTo(x+w,y);c.stroke();c.strokeStyle='rgba(0,0,0,'+((a||.14)*2.5)+')';c.beginPath();c.moveTo(x+w,y);c.lineTo(x+w,y+h);c.lineTo(x,y+h);c.stroke();c.restore()}
function boxTop(c,x,y,w,h,fill,front,r){const fh=Math.min(h*.32,22);c.fillStyle=front;rr(c,x,y+h-fh-2,w,fh+2,r||3);c.fill();c.fillStyle='rgba(0,0,0,.35)';rr(c,x,y+h-fh-2,w,fh+2,r||3);c.fill();
  c.fillStyle=fill;rr(c,x,y,w,h-fh,r||3);c.fill();bevel(c,x,y,w,h-fh,r||3);return h-fh}
function sheetCloth(c,x,y,w,h,t){const g=lin(c,x,y,x+w,y+h,[[0,'#cfc8ba'],[.5,'#b0a898'],[1,'#7e7668']]);c.fillStyle='rgba(0,0,0,.25)';rr(c,x-4,y+h*.6,w+8,h*.48,10);c.fill();
  c.fillStyle=g;c.beginPath();c.moveTo(x+8,y);c.quadraticCurveTo(x+w/2,y-4,x+w-8,y);c.quadraticCurveTo(x+w+4,y+h*.5,x+w+3,y+h);
  for(let i=0;i<6;i++){const xx=x+w+3-(i+1)*(w+6)/6;c.quadraticCurveTo(xx+(w+6)/12,y+h+(i%2?5:1),xx,y+h+(i%2?0:3))}c.quadraticCurveTo(x-4,y+h*.5,x+8,y);c.closePath();c.fill();
  c.save();c.clip();c.lineWidth=5;for(let i=0;i<5;i++){const xx=x+w*(.15+.18*i);c.strokeStyle='rgba(60,54,46,.18)';c.beginPath();c.moveTo(xx,y+2);c.quadraticCurveTo(xx+(i%2?8:-8),y+h*.5,xx+(i%2?3:-3),y+h+4);c.stroke();c.strokeStyle='rgba(255,252,240,.14)';c.lineWidth=2;c.beginPath();c.moveTo(xx+4,y+2);c.quadraticCurveTo(xx+(i%2?12:-4),y+h*.5,xx+(i%2?7:1),y+h+4);c.stroke();c.lineWidth=5}
  c.fillStyle='rgba(120,110,95,.25)';c.beginPath();c.ellipse(x+w*.6,y+h*.3,w*.25,h*.12,.3,0,TAU);c.fill();c.restore()}
function books(c,x,y,w,h,seed){const r=srng(seed);let xx=x;const cols=['#5a2a24','#2a3a4a','#4a3a20','#2c4030','#5a4a3a','#3a2440','#6a5a40'];
  while(xx<x+w-3){const bw=3+r()*5,bh=h*(.7+r()*.3);c.fillStyle=cols[Math.floor(r()*cols.length)];c.fillRect(xx,y+h-bh,bw,bh);c.fillStyle='rgba(255,230,180,.15)';c.fillRect(xx,y+h-bh,1,bh);c.fillStyle='rgba(220,190,120,.35)';c.fillRect(xx,y+h-bh*.7,bw,1);xx+=bw+.6;if(r()<.08){c.save();c.translate(xx+4,y+h);c.rotate(-.35);c.fillStyle=cols[2];c.fillRect(0,-bh*.8,4,bh*.8);c.restore();xx+=8}}}
function drawFurn(c,f){
  const {x,y,w,h,type}=f;const r=srng(Math.floor(f.ph*1000)+7);c.save();
  c.shadowColor='rgba(0,0,0,.65)';c.shadowBlur=14*(c.getTransform().a||1);c.shadowOffsetY=4*(c.getTransform().a||1);
  // the shadow-casting base shape
  const base=(path)=>{c.fillStyle='rgba(0,0,0,.6)';path();c.fill();c.shadowColor='transparent'};
  switch(type){
    case 'table':case 'longtable':case 'workbench':{base(()=>rr(c,x,y,w,h,6));
      if(type==='longtable')for(let i=0;i<Math.floor(w/56);i++){for(const sd of[-1,1]){const cx2=x+28+i*56,cy2=sd<0?y-6:y+h+2;c.fillStyle=woodP(c,'dark');rr(c,cx2-12,cy2-6,24,14,3);c.fill();c.fillStyle='rgba(0,0,0,.35)';c.fillRect(cx2-12,sd<0?cy2-6:cy2+4,24,4)}}
      const top=boxTop(c,x,y,w,h,woodP(c,type==='workbench'?'grey':'mid'),'#2a180c',5);
      if(type==='longtable'){c.fillStyle=lin(c,0,y,0,y+top,[[0,'#d8d2c4'],[1,'#a8a090']]);c.fillRect(x+10,y+top*.3,w-20,top*.4);for(let i=0;i<Math.floor(w/56);i++){const px=x+28+i*56;for(const py of[y+top*.18,y+top*.82]){circ(c,px,py,6,'#e8e4dc');circ(c,px,py,4,'#cfc8ba')}}}
      else if(type==='workbench'){c.fillStyle='#4a4a4e';rr(c,x+12,y+10,22,8,2);c.fill();c.save();c.translate(x+w*.6,y+top*.5);c.fillStyle='#7a6a3a';gearPath(c,9,8);c.fill();circ(c,0,0,3,'#3a3020');c.restore();c.fillStyle='#8a2a1a';rr(c,x+w-30,y+8,12,16,3);c.fill()}
      else{c.fillStyle='rgba(230,225,210,.75)';rr(c,x+w*.18,y+top*.25,w*.64,top*.5,2);c.fill();c.strokeStyle='rgba(120,110,95,.4)';c.lineWidth=1;rr(c,x+w*.2,y+top*.3,w*.6,top*.4,2);c.stroke();
        c.fillStyle='#3a2a20';rr(c,x+w*.62,y+top*.2,w*.18,top*.3,1);c.fill();circ(c,x+w*.3,y+top*.5,5,'#d8d4c8')}
      break}
    case 'armchair':case 'rocking':{base(()=>rr(c,x,y,w,h,12));const vel=type==='armchair'?['#5a1a24','#2a0a10']:['#5a3a24','#2a1a0c'];
      if(type==='rocking'){c.strokeStyle='#2a180c';c.lineWidth=4;for(const sd of[0,1]){c.beginPath();c.moveTo(x-4+sd*0,y+h-2);c.quadraticCurveTo(x+w/2,y+h+6,x+w+4,y+h-2);c.stroke()}}
      c.fillStyle=lin(c,x,y,x+w,y+h,[[0,vel[0]],[1,vel[1]]]);rr(c,x,y,w,h-4,12);c.fill();
      c.fillStyle=rad(c,x+w/2,y+h*.55,2,w*.4,[[0,shade(vel[0],.12)],[1,vel[0]]]);rr(c,x+9,y+15,w-18,h-26,8);c.fill();
      c.fillStyle='rgba(0,0,0,.35)';rr(c,x+3,y+3,w-6,12,6);c.fill();if(type==='armchair'){for(let i=0;i<3;i++)circ(c,x+w*(.3+i*.2),y+9,1.2,'rgba(255,220,200,.3)')}
      bevel(c,x,y,w,h-4,12,.1);break}
    case 'sheetchair':case 'sheetsofa':base(()=>rr(c,x,y,w,h,14));sheetCloth(c,x,y,w,h-6,0);break;
    case 'bookcase':{base(()=>rr(c,x,y,w,h,3));c.fillStyle=woodP(c,'dark');rr(c,x,y,w,h,3);c.fill();c.fillStyle='#120a06';c.fillRect(x+5,y+8,w-10,h-12);
      books(c,x+6,y+9,w-12,(h-14)/2-1,f.ph*99);c.fillStyle=woodP(c,'dark');c.fillRect(x+4,y+8+(h-12)/2-1,w-8,3);books(c,x+6,y+10+(h-12)/2,w-12,(h-14)/2-2,f.ph*77);bevel(c,x,y,w,h,3);break}
    case 'piano':{base(()=>{c.beginPath();c.moveTo(x,y+h);c.lineTo(x,y+10);c.quadraticCurveTo(x+w*.1,y,x+w*.4,y);c.bezierCurveTo(x+w,y,x+w,y+h*.6,x+w,y+h);c.closePath()});
      c.fillStyle=lin(c,x,y,x+w,y+h,[[0,'#2a2a30'],[.4,'#0c0c10'],[.55,'#3a3a44'],[.7,'#08080c'],[1,'#141418']]);c.beginPath();c.moveTo(x,y+h);c.lineTo(x,y+10);c.quadraticCurveTo(x+w*.1,y,x+w*.4,y);c.bezierCurveTo(x+w,y,x+w,y+h*.6,x+w,y+h);c.closePath();c.fill();
      c.fillStyle='#e8e2d4';c.fillRect(x+4,y+h-16,w-8,12);c.fillStyle='#0c0c10';for(let i=0;i<w/7;i++)if(i%7!==2&&i%7!==6)c.fillRect(x+8+i*6.6,y+h-16,3.4,7);
      c.strokeStyle='rgba(255,255,255,.18)';c.lineWidth=1.5;c.beginPath();c.moveTo(x+w*.2,y+6);c.quadraticCurveTo(x+w*.6,y+3,x+w*.8,y+h*.4);c.stroke();break}
    case 'grandclock':case 'cabinet':case 'dresser':{base(()=>rr(c,x,y,w,h,3));const top=boxTop(c,x,y,w,h,woodP(c,type==='dresser'?'red':'dark'),'#1a0e08',3);
      if(type==='grandclock'){circ(c,x+w/2,y+top/2,Math.min(w,top)*.38,'#d8cfb4');c.strokeStyle='#3a2a18';c.lineWidth=1.4;c.beginPath();c.arc(x+w/2,y+top/2,Math.min(w,top)*.38,0,TAU);c.stroke();
        c.beginPath();c.moveTo(x+w/2,y+top/2);c.lineTo(x+w/2+4,y+top/2-6);c.moveTo(x+w/2,y+top/2);c.lineTo(x+w/2-6,y+top/2+1);c.stroke()}
      else{const n=type==='dresser'?3:2;for(let i=0;i<n;i++){const dx=x+6+i*(w-12)/n;c.fillStyle='rgba(0,0,0,.18)';c.fillRect(dx+1,y+5,(w-12)/n-3,top-10);c.strokeStyle='rgba(255,230,200,.1)';c.strokeRect(dx+1,y+5,(w-12)/n-3,top-10);circ(c,dx+(w-12)/n/2,y+h-10,2.2,'#b89848')}}
      break}
    case 'crate':case 'cratesrow':{base(()=>rr(c,x,y,w,h,2));const top=boxTop(c,x,y,w,h,woodP(c,'pale'),'#4a3420',2);
      c.strokeStyle='rgba(40,26,14,.7)';c.lineWidth=3;c.strokeRect(x+3,y+3,w-6,top-6);c.beginPath();c.moveTo(x+4,y+4);c.lineTo(x+w-4,y+top-4);c.stroke();
      for(const [nx,ny] of[[6,6],[w-6,6],[6,top-6],[w-6,top-6]])circ(c,x+nx,y+ny,1.2,'#2a2a2a');break}
    case 'boxes':{base(()=>rr(c,x,y,w,h,2));for(const [bx,by,bw,bh] of[[x,y+h*.25,w*.62,h*.75],[x+w*.45,y,w*.55,h*.7]]){const top=boxTop(c,bx,by,bw,bh,lin(c,bx,by,bx+bw,by+bh,[[0,'#a88a62'],[1,'#7a5e3e']]),'#5a4428',2);
      c.fillStyle='rgba(200,190,160,.5)';c.fillRect(bx+bw/2-3,by,6,top);c.fillStyle='rgba(60,40,20,.25)';c.fillRect(bx+4,by+4,bw*.3,2)}break}
    case 'trunk':{base(()=>rr(c,x,y,w,h,8));const top=boxTop(c,x,y,w,h,lin(c,x,y,x,y+h,[[0,'#6a3a24'],[1,'#3a1e10']]),'#2a140a',8);
      c.fillStyle=lin(c,0,y,0,y+top,[[0,'#c8a858'],[1,'#7a5a20']]);for(const fx of[x+w*.2,x+w*.75])c.fillRect(fx,y,6,h);rr(c,x+w/2-5,y+top-8,10,10,2);c.fill();break}
    case 'mirror':{base(()=>rr(c,x,y,w,h,8));c.fillStyle=woodP(c,'dark');rr(c,x,y,w,h,8);c.fill();
      c.fillStyle=lin(c,x,y,x+w,y+h,[[0,'#3a4450'],[.4,'#8a98a8'],[.5,'#c8d4e0'],[.6,'#6a7888'],[1,'#2a3038']]);rr(c,x+5,y+4,w-10,h-8,5);c.fill();
      c.strokeStyle='rgba(255,255,255,.5)';c.lineWidth=.8;c.beginPath();c.moveTo(x+w*.6,y+5);c.lineTo(x+w*.45,y+h*.5);c.lineTo(x+w*.55,y+h-5);c.moveTo(x+w*.45,y+h*.5);c.lineTo(x+w*.25,y+h*.6);c.stroke();break}
    case 'post':case 'pillar':case 'ironcol':{const cx2=x+w/2,cy2=y+h/2,R=w/2;base(()=>{c.beginPath();c.arc(cx2,cy2,R,0,TAU)});
      if(type==='post'){c.fillStyle=woodP(c,'mid');rr(c,x,y,w,h,3);c.fill();c.fillStyle=lin(c,x,0,x+w,0,[[0,'rgba(255,230,200,.15)'],[1,'rgba(0,0,0,.4)']]);rr(c,x,y,w,h,3);c.fill();bevel(c,x,y,w,h,3)}
      else{const st=type==='pillar';c.fillStyle=st?stoneP(c,'pil',[150,150,148]):'#2a2c30';c.beginPath();c.arc(cx2,cy2,R,0,TAU);c.fill();
        c.fillStyle=rad(c,cx2,cy2,1,R,[[0,'rgba(255,255,255,.18)'],[.7,'rgba(0,0,0,.05)'],[1,'rgba(0,0,0,.55)']],-R*.35,-R*.35);c.beginPath();c.arc(cx2,cy2,R,0,TAU);c.fill();
        c.strokeStyle=st?'rgba(30,30,30,.35)':'rgba(160,160,170,.3)';c.lineWidth=1.5;c.beginPath();c.arc(cx2,cy2,R*.72,0,TAU);c.stroke();
        if(st)for(let i=0;i<12;i++){const a=i*TAU/12;c.beginPath();c.moveTo(cx2+Math.cos(a)*R*.74,cy2+Math.sin(a)*R*.74);c.lineTo(cx2+Math.cos(a)*R*.95,cy2+Math.sin(a)*R*.95);c.stroke()}
        else for(let i=0;i<8;i++){const a=i*TAU/8;circ(c,cx2+Math.cos(a)*R*.85,cy2+Math.sin(a)*R*.85,1.4,'#6a6c74')}}break}
    case 'tomb':case 'sarcophagus':case 'coffin':case 'pew':case 'bench':{
      if(type==='coffin'){const p=()=>{c.beginPath();c.moveTo(x+w*.3,y);c.lineTo(x+w*.7,y);c.lineTo(x+w,y+h*.25);c.lineTo(x+w*.78,y+h);c.lineTo(x+w*.22,y+h);c.lineTo(x,y+h*.25);c.closePath()};base(p);
        c.fillStyle=woodP(c,'dark');p();c.fill();c.fillStyle=lin(c,x,0,x+w,0,[[0,'rgba(255,220,190,.12)'],[.5,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,.45)']]);p();c.fill();
        c.strokeStyle='rgba(0,0,0,.5)';c.lineWidth=1.5;c.beginPath();c.moveTo(x+w*.15,y+h*.25);c.lineTo(x+w*.85,y+h*.25);c.stroke();for(const sy of[.4,.6,.8]){circ(c,x+2,y+h*sy,2,'#8a7440');circ(c,x+w-2,y+h*sy,2,'#8a7440')}break}
      if(type==='pew'||type==='bench'){base(()=>rr(c,x,y,w,h,3));c.fillStyle=woodP(c,type==='pew'?'dark':'mid');rr(c,x,y+h*.35,w,h*.65,3);c.fill();c.fillStyle=woodP(c,'dark');rr(c,x,y,w,h*.32,3);c.fill();c.fillStyle='rgba(0,0,0,.4)';c.fillRect(x,y+h*.32,w,3);
        c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=1;for(let i=1;i<3;i++){c.beginPath();c.moveTo(x,y+h*.35+i*h*.2);c.lineTo(x+w,y+h*.35+i*h*.2);c.stroke()}bevel(c,x,y,w,h,3);break}
      base(()=>rr(c,x,y,w,h,4));const top=boxTop(c,x,y,w,h,stoneP(c,'tomb',[120,122,126]),'#3a3c40',4);
      c.strokeStyle='rgba(20,20,24,.45)';c.lineWidth=1.5;rr(c,x+7,y+6,w-14,top-12,3);c.stroke();
      if(type==='sarcophagus'){c.fillStyle='rgba(255,255,255,.08)';c.beginPath();c.ellipse(x+w*.25,y+top/2,top*.24,top*.22,0,0,TAU);c.fill();c.beginPath();c.ellipse(x+w*.6,y+top/2,w*.28,top*.26,0,0,TAU);c.fill();c.strokeStyle='rgba(0,0,0,.25)';c.stroke()}
      else{c.beginPath();c.moveTo(x+w/2,y+10);c.lineTo(x+w/2,y+top-10);c.moveTo(x+w/2-10,y+top*.38);c.lineTo(x+w/2+10,y+top*.38);c.stroke()}
      c.fillStyle='rgba(70,100,60,.35)';c.beginPath();c.ellipse(x+w*.15,y+top*.8,10,5,0,0,TAU);c.fill();break}
    case 'urn':case 'statue':{const cx2=x+w/2,cy2=y+h/2;base(()=>{c.beginPath();c.arc(cx2,cy2,w/2,0,TAU)});
      if(type==='statue'){c.fillStyle=stoneP(c,'stat',[150,150,152]);rr(c,x,y,w,h,4);c.fill();bevel(c,x,y,w,h,4);c.fillStyle=rad(c,cx2,cy2,2,w*.4,[[0,'#d8d8d8'],[1,'#7a7a7c']],-4,-4);c.beginPath();c.ellipse(cx2,cy2,w*.3,h*.24,0,0,TAU);c.fill();
        for(const sd of[-1,1]){c.fillStyle=rad(c,cx2+sd*w*.25,cy2-2,1,w*.3,[[0,'#cacaca'],[1,'#6a6a6c']]);c.beginPath();c.ellipse(cx2+sd*w*.26,cy2-3,w*.18,h*.3,sd*.4,0,TAU);c.fill()}circ(c,cx2,cy2-h*.12,w*.12,'#bcbcbc');break}
      c.fillStyle=rad(c,cx2,cy2,1,w/2,[[0,'#8a8c90'],[.8,'#4a4c52'],[1,'#26282c']],-5,-5);c.beginPath();c.arc(cx2,cy2,w/2,0,TAU);c.fill();c.fillStyle='#121214';c.beginPath();c.arc(cx2,cy2,w*.26,0,TAU);c.fill();
      c.strokeStyle='rgba(120,90,60,.8)';c.lineWidth=1;for(let i=0;i<4;i++){c.beginPath();c.moveTo(cx2,cy2);c.lineTo(cx2+Math.cos(i*1.7)*w*.3,cy2+Math.sin(i*1.7)*w*.3-4);c.stroke()}break}
    case 'candelabra':{const cx2=x+w/2,cy2=y+h/2;base(()=>{c.beginPath();c.arc(cx2,cy2,w/2-2,0,TAU)});c.fillStyle=rad(c,cx2,cy2,1,w/2,[[0,'#6a5a30'],[1,'#2a2010']]);c.beginPath();c.arc(cx2,cy2,w/2-2,0,TAU);c.fill();
      c.strokeStyle='#3a3018';c.lineWidth=2.5;c.beginPath();c.moveTo(x+w*.25,cy2);c.lineTo(x+w*.75,cy2);c.stroke();break}
    case 'gear':case 'biggear':case 'pendulum':{const cx2=x+w/2,cy2=y+h/2,R=w/2;base(()=>{c.beginPath();c.arc(cx2,cy2,R,0,TAU)});
      c.save();c.translate(cx2,cy2);c.rotate(f.ph);if(type==='pendulum'){c.fillStyle=rad(c,0,0,1,R,[[0,'#e8c878'],[.7,'#9a7a30'],[1,'#4a3810']],-R*.3,-R*.3);c.beginPath();c.arc(0,0,R,0,TAU);c.fill();c.strokeStyle='rgba(60,40,10,.5)';c.lineWidth=2;c.beginPath();c.arc(0,0,R*.7,0,TAU);c.stroke()}
      else{c.fillStyle=rad(c,0,0,R*.2,R,[[0,'#c8a860'],[.75,'#8a6a28'],[1,'#4a3410']],-R*.3,-R*.3);gearPath(c,R,type==='biggear'?18:10);c.fill();c.fillStyle='rgba(10,8,6,.85)';
        for(let i=0;i<5;i++){const a=i*TAU/5;c.beginPath();c.arc(Math.cos(a)*R*.5,Math.sin(a)*R*.5,R*.15,0,TAU);c.fill()}circ(c,0,0,R*.16,'#3a2a10');circ(c,0,0,R*.07,'#a88848')}c.restore();break}
    case 'bellframe':{base(()=>rr(c,x,y,w,h,4));c.fillStyle=woodP(c,'dark');for(const [bx,by,bw,bh] of[[x,y,w,12],[x,y+h-12,w,12],[x,y,12,h],[x+w-12,y,12,h]]){c.fillRect(bx,by,bw,bh)}
      const cx2=x+w/2,cy2=y+h/2;c.fillStyle=rad(c,cx2,cy2,2,w*.36,[[0,'#d8b070'],[.6,'#8a6430'],[1,'#3a2610']],-8,-8);c.beginPath();c.arc(cx2,cy2,w*.34,0,TAU);c.fill();circ(c,cx2,cy2,w*.12,'#2a1a0a');break}
    case 'planter':case 'planterrow':{base(()=>rr(c,x,y,w,h,6));c.fillStyle=stoneP(c,'plnt',[120,104,92]);rr(c,x,y,w,h,6);c.fill();bevel(c,x,y,w,h,6);c.fillStyle='#2a1c12';rr(c,x+7,y+7,w-14,h-14,4);c.fill();
      for(let i=0;i<w*h/90;i++){const lx=x+10+r()*(w-20),ly=y+10+r()*(h-20),a=r()*TAU,ls=7+r()*9;c.save();c.translate(lx,ly);c.rotate(a);c.fillStyle=lin(c,-ls,0,ls,0,[[0,'#1a3a1c'],[.5,['#2f5a2c','#3a6a32','#24482a'][i%3]],[1,'#14301a']]);c.beginPath();c.ellipse(0,0,ls,ls*.38,0,0,TAU);c.fill();c.strokeStyle='rgba(160,200,140,.25)';c.lineWidth=.7;c.beginPath();c.moveTo(-ls,0);c.lineTo(ls,0);c.stroke();c.restore()}break}
    case 'fountain':{const cx2=x+w/2,cy2=y+h/2,R=w/2;base(()=>{c.beginPath();c.arc(cx2,cy2,R,0,TAU)});c.fillStyle=stoneP(c,'fount',[130,132,134]);c.beginPath();c.arc(cx2,cy2,R,0,TAU);c.fill();
      c.fillStyle=rad(c,cx2,cy2,4,R*.82,[[0,'#2a4a5a'],[.7,'#1a3442'],[1,'#0e1e28']]);c.beginPath();c.arc(cx2,cy2,R*.82,0,TAU);c.fill();c.strokeStyle='rgba(180,220,240,.12)';c.lineWidth=1.5;for(let i=1;i<4;i++){c.beginPath();c.arc(cx2,cy2,R*.2*i+4,0,TAU);c.stroke()}
      c.fillStyle=stoneP(c,'fount',[130,132,134]);c.beginPath();c.arc(cx2,cy2,R*.2,0,TAU);c.fill();c.fillStyle=rad(c,cx2,cy2,1,R*.2,[[0,'rgba(255,255,255,.2)'],[1,'rgba(0,0,0,.4)']],-4,-4);c.beginPath();c.arc(cx2,cy2,R*.2,0,TAU);c.fill();break}
    case 'pumpkins':{base(()=>{c.beginPath();c.ellipse(x+w/2,y+h/2,w/2,h/2,0,0,TAU)});for(const [px,py,pr] of[[.3,.6,.3],[.68,.52,.36],[.5,.3,.24]]){const cx2=x+w*px,cy2=y+h*py,R=h*pr+6;
      c.fillStyle=rad(c,cx2,cy2,R*.1,R*1.1,[[0,'#d8823a'],[.6,'#a8521a'],[1,'#4a1e06']],-R*.3,-R*.35);c.beginPath();c.ellipse(cx2,cy2,R*1.1,R*.9,0,0,TAU);c.fill();
      c.strokeStyle='rgba(60,22,4,.45)';c.lineWidth=1.4;for(const k of[-.6,-.25,.25,.6]){c.beginPath();c.ellipse(cx2,cy2,R*1.1*Math.abs(k),R*.88,0,-Math.PI/2,Math.PI/2,k<0);c.stroke()}
      c.fillStyle='rgba(255,220,170,.18)';c.beginPath();c.ellipse(cx2-R*.35,cy2-R*.35,R*.3,R*.15,-.5,0,TAU);c.fill();c.fillStyle='#3a4a1a';rr(c,cx2-2,cy2-R*.95,4,7,2);c.fill()}break}
    default:base(()=>rr(c,x,y,w,h,4));c.fillStyle='#444';rr(c,x,y,w,h,4);c.fill();
  }
  c.restore();
}

/* ================= room static layer ================= */
function drawRug(c,rg,ch){c.save();c.translate(rg.x,rg.y);const w=rg.w,h=rg.h,col=rg.col;
  c.fillStyle='rgba(0,0,0,.3)';rr(c,-w/2+3,-h/2+4,w,h,4);c.fill();
  if(rg.round){c.scale(1,h/w);c.fillStyle=col;c.beginPath();c.arc(0,0,w/2,0,TAU);c.fill();c.strokeStyle='rgba(220,180,120,.3)';c.lineWidth=6;c.beginPath();c.arc(0,0,w/2-10,0,TAU);c.stroke();c.lineWidth=2;c.beginPath();c.arc(0,0,w/4,0,TAU);c.stroke()}
  else{c.fillStyle=col;c.fillRect(-w/2,-h/2,w,h);c.strokeStyle='rgba(210,170,110,.35)';c.lineWidth=7;c.strokeRect(-w/2+10,-h/2+10,w-20,h-20);c.lineWidth=2;c.strokeStyle='rgba(20,10,10,.35)';c.strokeRect(-w/2+20,-h/2+20,w-40,h-40);
    c.fillStyle='rgba(210,170,110,.18)';c.beginPath();c.moveTo(0,-h*.3);c.lineTo(w*.18,0);c.lineTo(0,h*.3);c.lineTo(-w*.18,0);c.closePath();c.fill();
    c.strokeStyle='rgba(220,210,190,.35)';c.lineWidth=1;for(let xx=-w/2;xx<w/2;xx+=4){c.beginPath();c.moveTo(xx,-h/2);c.lineTo(xx,-h/2-5);c.moveTo(xx,h/2);c.lineTo(xx,h/2+5);c.stroke()}}
  const g=c.createRadialGradient(0,0,0,0,0,Math.max(w,h)/2);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.35)');c.fillStyle=g;if(rg.round){c.beginPath();c.arc(0,0,w/2,0,TAU);c.fill()}else c.fillRect(-w/2,-h/2,w,h);
  c.restore()}
function drawDecal(c,d){c.save();c.translate(d.x,d.y);c.rotate(d.a||0);
  switch(d.k){
    case 'dirt':{const g=c.createRadialGradient(0,0,0,0,0,d.s);g.addColorStop(0,'rgba(20,14,8,.35)');g.addColorStop(1,'rgba(20,14,8,0)');c.fillStyle=g;c.beginPath();c.ellipse(0,0,d.s,d.s*.6,0,0,TAU);c.fill();break}
    case 'paper':c.fillStyle='rgba(210,200,170,.75)';c.fillRect(-7,-9,14,18);c.strokeStyle='rgba(60,50,40,.4)';c.lineWidth=.6;for(let i=0;i<5;i++){c.beginPath();c.moveTo(-5,-6+i*3);c.lineTo(4,-6+i*3);c.stroke()}break;
    case 'leaf':c.fillStyle=pick2(Math.floor(d.s),['rgba(120,70,30,.8)','rgba(150,90,30,.8)','rgba(90,50,20,.8)']);c.beginPath();c.ellipse(0,0,d.s*.6,d.s*.25,0,0,TAU);c.fill();break;
    case 'puddle':{c.fillStyle='rgba(20,30,40,.55)';c.beginPath();c.ellipse(0,0,d.s,d.s*.5,0,0,TAU);c.fill();c.strokeStyle='rgba(160,190,210,.18)';c.lineWidth=1;c.beginPath();c.ellipse(-d.s*.2,-d.s*.1,d.s*.5,d.s*.2,0,0,TAU);c.stroke();break}
    case 'glass':c.fillStyle='rgba(200,220,230,.5)';for(let i=0;i<6;i++){c.beginPath();c.moveTo(i*3-8,i%2*4);c.lineTo(i*3-6,i%2*4-3);c.lineTo(i*3-4,i%2*4+1);c.fill()}break;
    case 'petal':c.fillStyle='rgba(230,190,210,.7)';c.beginPath();c.ellipse(0,0,3,1.6,0,0,TAU);c.fill();break;
    case 'bones':c.strokeStyle='rgba(210,204,190,.7)';c.lineWidth=2;c.beginPath();c.moveTo(-8,0);c.lineTo(8,0);c.stroke();circ(c,-8,-1.5,1.6,'rgba(210,204,190,.7)');circ(c,-8,1.5,1.6,'rgba(210,204,190,.7)');circ(c,8,-1.5,1.6,'rgba(210,204,190,.7)');circ(c,8,1.5,1.6,'rgba(210,204,190,.7)');break;
    case 'oil':c.fillStyle='rgba(10,10,10,.45)';c.beginPath();c.ellipse(0,0,d.s,d.s*.55,0,0,TAU);c.fill();break;
  }c.restore()}
function pick2(i,a){return a[((i*7+3)%a.length+a.length)%a.length]}
function drawWindow(c,x,ch){const w=64,h=WALLT-40,y=-WALLT+12;
  c.fillStyle='#0a0f1a';c.fillRect(x-w/2,y,w,h);const g=c.createLinearGradient(0,y,0,y+h);g.addColorStop(0,'#1a2a44');g.addColorStop(1,'#0a1220');c.fillStyle=g;c.fillRect(x-w/2+4,y+4,w-8,h-8);
  circ(c,x+12,y+18,7,'rgba(240,240,220,.9)');c.fillStyle=rad(c,x+12,y+18,6,24,[[0,'rgba(220,230,255,.25)'],[1,'rgba(220,230,255,0)']]);c.beginPath();c.arc(x+12,y+18,24,0,TAU);c.fill();
  c.fillStyle='rgba(10,14,20,.95)';for(let i=0;i<3;i++){c.beginPath();c.moveTo(x-w/2+4+i*20,y+h-4);c.lineTo(x-w/2+12+i*20,y+h-26-i*6);c.lineTo(x-w/2+20+i*20,y+h-4);c.fill()}
  c.strokeStyle='#2a2018';c.lineWidth=3;c.beginPath();c.moveTo(x,y);c.lineTo(x,y+h);c.moveTo(x-w/2,y+h/2);c.lineTo(x+w/2,y+h/2);c.stroke();
  c.strokeStyle=ch.wallf==='glass'?'#1c2226':'#3a2616';c.lineWidth=6;c.strokeRect(x-w/2,y,w,h);c.fillStyle='#2a1a10';c.fillRect(x-w/2-6,y+h,w+12,6);
  if(ch.wallf==='damask'){for(const sd of[-1,1]){c.fillStyle=lin(c,x+sd*w/2,0,x+sd*(w/2+18),0,[[0,'#3a0c14'],[.5,'#6a1a26'],[1,'#2a080e']]);c.beginPath();c.moveTo(x+sd*(w/2-6),y-8);c.lineTo(x+sd*(w/2+16),y-8);c.lineTo(x+sd*(w/2+20),y+h+8);c.quadraticCurveTo(x+sd*(w/2+2),y+h+12,x+sd*(w/2-2),y+h+4);c.closePath();c.fill()}}}
function drawFrame(c,x,r){const w=40+r()*14,h=34+r()*10,y=-WALLT+18+r()*8;c.save();c.translate(x,y+h/2);c.rotate((r()-.5)*.08);
  c.fillStyle='rgba(0,0,0,.4)';c.fillRect(-w/2+3,-h/2+4,w,h);c.fillStyle=lin(c,-w/2,-h/2,w/2,h/2,[[0,'#8a6a2a'],[.5,'#d8b860'],[1,'#5a4214']]);c.fillRect(-w/2,-h/2,w,h);
  c.fillStyle=lin(c,0,-h/2,0,h/2,[[0,'#2a2a22'],[1,'#141410']]);c.fillRect(-w/2+5,-h/2+5,w-10,h-10);
  c.fillStyle='rgba(180,160,130,.35)';c.beginPath();c.ellipse(0,-h*.08,w*.12,h*.17,0,0,TAU);c.fill();c.beginPath();c.ellipse(0,h*.3,w*.26,h*.2,0,Math.PI,TAU);c.fill();c.restore()}
function drawDoorClosed(c,dx){const w=86,h=WALLT-10,y=-WALLT+8;
  c.fillStyle='#1a0e08';c.fillRect(dx-w/2-8,y-6,w+16,h+8);c.fillStyle=lin(c,dx-w/2-8,0,dx+w/2+8,0,[[0,'#3a2414'],[.5,'#5a3a22'],[1,'#2a180c']]);c.fillRect(dx-w/2-8,y-6,8,h+8);c.fillRect(dx+w/2,y-6,8,h+8);c.fillRect(dx-w/2-8,y-6,w+16,8);
  c.fillStyle=woodP(c,'dark');c.fillRect(dx-w/2,y+2,w,h-2);c.fillStyle='rgba(0,0,0,.4)';c.fillRect(dx-1,y+2,2,h-2);
  for(const sd of[-1,1])for(const py of[.12,.55]){c.strokeStyle='rgba(0,0,0,.45)';c.lineWidth=2;c.strokeRect(dx+sd*w*.25-w*.17,y+h*py,w*.34,h*.35);c.strokeStyle='rgba(255,220,180,.08)';c.lineWidth=1;c.strokeRect(dx+sd*w*.25-w*.17+2,y+h*py+2,w*.34-4,h*.35-4)}
  for(const sd of[-1,1])circ(c,dx+sd*8,y+h*.52,2.6,'#b89848')}
function renderRoomStatic(rm,res){
  const TW=ROOM_W+WALL*2,TH=ROOM_H+WALL+WALLT;
  const cw=Math.ceil(TW*res),chh=Math.ceil(TH*res);
  const cv=rm.cv||document.createElement('canvas');cv.width=cw;cv.height=chh;rm.cv=cv;rm.res=res;
  const c=cv.getContext('2d');c.setTransform(res,0,0,res,WALL*res,WALLT*res);
  const ch=rm.ch,r=srng(rm.seed);
  // floor
  c.fillStyle=pat(c,floorTex(ch.floor),.5);c.fillRect(0,0,ROOM_W,ROOM_H);
  // floor grime
  for(let i=0;i<8;i++){const x=r()*ROOM_W,y=r()*ROOM_H,s=60+r()*140;c.fillStyle=rad(c,x,y,0,s,[[0,'rgba(10,8,6,.22)'],[1,'rgba(10,8,6,0)']]);c.beginPath();c.arc(x,y,s,0,TAU);c.fill()}
  for(const rg of rm.rugs)drawRug(c,rg,ch);
  for(const d of rm.decals)drawDecal(c,d);
  // ambient occlusion along walls
  const ao=(x0,y0,x1,y1,x,y,w,h)=>{c.fillStyle=lin(c,x0,y0,x1,y1,[[0,'rgba(0,0,0,.6)'],[1,'rgba(0,0,0,0)']]);c.fillRect(x,y,w,h)};
  ao(0,0,0,60,0,0,ROOM_W,60);ao(0,0,46,0,0,0,46,ROOM_H);ao(ROOM_W,0,ROOM_W-46,0,ROOM_W-46,0,46,ROOM_H);ao(0,ROOM_H,0,ROOM_H-36,0,ROOM_H-36,ROOM_W,36);
  // top wall face
  c.fillStyle=pat(c,wallTex(ch.wallf,ch),1);c.save();c.translate(0,-WALLT);c.fillRect(-WALL,0,ROOM_W+WALL*2,WALLT);c.restore();
  c.fillStyle=lin(c,0,-WALLT,0,0,[[0,'rgba(0,0,0,.55)'],[.35,'rgba(0,0,0,.05)'],[1,'rgba(0,0,0,.2)']]);c.fillRect(-WALL,-WALLT,ROOM_W+WALL*2,WALLT);
  for(const wx of rm.windows)drawWindow(c,wx,ch);
  const fr=srng(rm.seed+3);for(const fx of rm.frames)drawFrame(c,fx,fr);
  for(const dx of rm.doorXs)drawDoorClosed(c,dx);
  // side & bottom wall caps
  c.fillStyle=pat(c,capTex(ch),1);c.fillRect(-WALL,-WALLT,WALL,ROOM_H+WALLT+WALL);c.fillRect(ROOM_W,-WALLT,WALL,ROOM_H+WALLT+WALL);c.fillRect(-WALL,ROOM_H,ROOM_W+WALL*2,WALL);
  c.fillStyle='rgba(255,240,220,.07)';c.fillRect(-3,-WALLT,3,ROOM_H+WALLT);c.fillRect(ROOM_W,-WALLT,3,ROOM_H+WALLT);c.fillRect(0,ROOM_H,ROOM_W,3);
  c.fillStyle='rgba(0,0,0,.5)';c.fillRect(-WALL,-WALLT,ROOM_W+WALL*2,4);
  for(const f of rm.furn)drawFurn(c,f);
  for(const cd of rm.candles)if(!cd.wall&&!cd.noHolder)drawCandleObj(c,cd.x,cd.y,0,0,1);
  for(const cd of rm.candles)if(cd.wall){c.fillStyle=lin(c,cd.x-6,0,cd.x+6,0,[[0,'#5a4418'],[.5,'#c8a450'],[1,'#4a3410']]);c.fillRect(cd.x-7,cd.y-WALLT*.0-4,14,4);c.fillRect(cd.x-1.5,cd.y-16,3,14);drawCandleObj(c,cd.x,cd.y-14,0,0,.8)}
}

/* ================= icons for the HTML UI ================= */
const ICON_CACHE={};
function iconURL(kind,size){size=size||96;const k=kind+'@'+size;if(ICON_CACHE[k])return ICON_CACHE[k];
  const cv=document.createElement('canvas');cv.width=cv.height=size;const c=cv.getContext('2d');c.scale(size/96,size/96);
  try{drawIcon(c,kind)}catch(e){}
  const keep=/^(sk_|bm_|gh_|ghx_|candy|heart|rw_candy|rw_heart)/.test(kind)?.85:.35;
  try{const id=c.getImageData(0,0,size,size),d=id.data;for(let i=0;i<d.length;i+=4){if(!d[i+3])continue;const l=(d[i]*.3+d[i+1]*.59+d[i+2]*.11)/255;
    const tr=30+l*215,tg=24+l*196,tb=20+l*160;d[i]=d[i]*keep+tr*(1-keep);d[i+1]=d[i+1]*keep+tg*(1-keep);d[i+2]=d[i+2]*keep+tb*(1-keep)}c.putImageData(id,0,0)}catch(e){}
  try{return ICON_CACHE[k]=cv.toDataURL()}catch(e){return ''}}
function drawIcon(c,k){
  const Y='#d9b04a',O='#c4642a',M='#7fbfa0',Pk='#b8324a',V='#7a5a9a',B='#6a8ab0',W='#ece4d0',D='#1c1612';
  c.lineCap='round';c.lineJoin='round';
  const wedge=(a,ang,len,col,x,y)=>{x=x||48;y=y||48;const g=c.createRadialGradient(x,y,2,x,y,len);g.addColorStop(0,col);g.addColorStop(1,'rgba(255,230,150,0)');c.fillStyle=g;c.beginPath();c.moveTo(x,y);c.arc(x,y,len,a-ang,a+ang);c.closePath();c.fill()};
  const lampAt=(x,y,a)=>{c.save();c.translate(x,y);c.rotate(a);c.fillStyle=lin(c,0,-7,0,7,[[0,'#8d929e'],[.4,'#d8dbe2'],[1,'#2a2d36']]);rr(c,-16,-7,28,14,4);c.fill();c.fillStyle='#565d7a';rr(c,8,-10,8,20,3);c.fill();ell(c,16,0,3,8,'#fff8d0');c.restore()};
  const mini=(x,y,s,col)=>{c.save();c.translate(x,y);c.scale(s,s);c.fillStyle=lin(c,0,-14,0,20,[[0,col||W],[1,'rgba(236,228,208,0)']]);specterPath(c,13,1,0,0,5,.5);c.fill();socket(c,-4.5,-2,2.6,3.4,.9);socket(c,4.5,-2,2.6,3.4,.9);c.restore()};
  const rune=(t)=>{c.fillStyle=W;c.font='700 46px Georgia,serif';c.textAlign='center';c.textBaseline='middle';c.fillText(t,48,52)};
  switch(k){
    case 'candy':drawCandy(c,48,48,Pk,3.4,-.4);break;
    case 'heart':drawHeart(c,48,52,64,Pk);break;
    case 'soul':c.save();c.translate(48,52);c.scale(4,4);drawSoul(c,0,0,0);c.restore();break;
    case 'coin':c.fillStyle=rad(c,48,48,4,32,[[0,'#f0d080'],[.8,'#a88030'],[1,'#5a4010']],-8,-8);c.beginPath();c.arc(48,48,32,0,TAU);c.fill();c.strokeStyle='rgba(60,40,10,.6)';c.lineWidth=3;c.beginPath();c.arc(48,48,24,0,TAU);c.stroke();c.fillStyle='#6a4a14';starPath(c,48,48,13);c.fill();break;
    case 'trophy':c.fillStyle=lin(c,24,0,72,0,[[0,'#8a6a20'],[.4,'#f0d080'],[1,'#6a4a10']]);c.beginPath();c.moveTo(24,18);c.lineTo(72,18);c.quadraticCurveTo(72,56,48,60);c.quadraticCurveTo(24,56,24,18);c.fill();c.strokeStyle='#a88030';c.lineWidth=6;c.beginPath();c.arc(24,32,10,Math.PI*.5,Math.PI*1.5);c.arc(72,32,10,-Math.PI*.5,Math.PI*.5);c.stroke();c.fillStyle='#a88030';c.fillRect(42,58,12,14);c.fillStyle='#3a2a18';rr(c,30,72,36,10,2);c.fill();break;
    case 'lock':c.strokeStyle='#8a8e9a';c.lineWidth=8;c.beginPath();c.arc(48,40,14,Math.PI,0);c.stroke();c.fillStyle=lin(c,26,40,70,74,[[0,'#c8a858'],[1,'#6a4a14']]);rr(c,26,40,44,34,4);c.fill();circ(c,48,54,5,'#2a1a08');break;
    case 'chest':drawChest(c,48,50,1.8,false,0);break;
    case 'cart':drawCandy(c,36,40,Pk,2,-.4);drawCandy(c,60,56,Y,2,.5);c.fillStyle=W;c.font='700 30px Georgia,serif';c.textAlign='center';c.fillText('+',70,30);break;
    case 'shirt':c.save();c.translate(48,62);c.scale(2.4,2.4);drawLumi(c,0,0,.4,0,'lumi',false,1);c.restore();break;
    case 'scroll':c.fillStyle=lin(c,22,16,74,80,[[0,'#e8dcc0'],[1,'#a89878']]);rr(c,22,16,52,64,3);c.fill();c.fillStyle='#8a7858';rr(c,18,12,60,10,5);c.fill();rr(c,18,74,60,10,5);c.fill();c.strokeStyle='rgba(60,40,20,.6)';c.lineWidth=3;for(let i=0;i<4;i++){c.beginPath();c.moveTo(32,32+i*11);c.lineTo(64-(i%2)*10,32+i*11);c.stroke()}break;
    case 'gift':c.fillStyle=lin(c,20,38,76,78,[[0,'#6a2a34'],[1,'#2a0a10']]);rr(c,20,38,56,40,3);c.fill();c.fillStyle='#4a1a22';rr(c,16,30,64,12,3);c.fill();c.fillStyle=Y;c.fillRect(44,30,8,48);c.strokeStyle=Y;c.lineWidth=5;c.beginPath();c.ellipse(38,24,10,6,-.5,0,TAU);c.ellipse(58,24,10,6,.5,0,TAU);c.stroke();break;
    case 'book':c.fillStyle=lin(c,20,14,76,82,[[0,'#4a2a3a'],[1,'#1a0a14']]);rr(c,20,14,56,68,4);c.fill();c.fillStyle='#d8ccb0';c.fillRect(66,18,6,60);mini(46,46,1.3);break;
    case 'crown':c.fillStyle=lin(c,0,22,0,70,[[0,'#f0d080'],[1,'#7a5a14']]);c.beginPath();c.moveTo(16,70);c.lineTo(16,30);c.lineTo(32,48);c.lineTo(48,22);c.lineTo(64,48);c.lineTo(80,30);c.lineTo(80,70);c.closePath();c.fill();circ(c,48,58,6,Pk);break;
    case 'star':c.fillStyle=Y;starPath(c,48,48,34);c.fill();break;
    case 'reroll':c.strokeStyle=M;c.lineWidth=9;c.beginPath();c.arc(48,48,24,-.4,Math.PI*1.4);c.stroke();c.fillStyle=M;c.beginPath();c.moveTo(72,30);c.lineTo(76,52);c.lineTo(56,44);c.closePath();c.fill();break;
    case 'rw_card':c.save();c.translate(48,48);c.rotate(-.12);c.fillStyle=lin(c,-22,-30,22,30,[[0,'#2a2230'],[1,'#120e16']]);rr(c,-22,-30,44,60,4);c.fill();c.strokeStyle='#b89858';c.lineWidth=2.5;rr(c,-18,-26,36,52,2);c.stroke();c.fillStyle='#d8b868';starPath(c,0,0,11);c.fill();c.restore();break;
    case 'rw_candy':drawCandy(c,36,56,Pk,2.2,-.5);drawCandy(c,60,44,M,2.2,.4);drawCandy(c,50,66,Y,2,.1);break;
    case 'rw_heart':drawHeart(c,48,52,58,Pk);break;
    case 'rw_chest':drawChest(c,48,52,1.7,false,0);break;
    case 'rw_mystery':rune('?');break;
    case 'rw_boss':case 'rt_boss':mini(48,50,2.4,'#d6d2cc');break;
    case 'rw_shrine':case 'rt_shrine':c.fillStyle=lin(c,0,40,0,84,[[0,'#8a8c90'],[1,'#3a3c40']]);rr(c,22,56,52,24,3);c.fill();rr(c,30,44,36,14,3);c.fill();c.save();c.translate(48,30);c.scale(1.6,1.6);drawFlame(c,0,0,0,0,1.4);c.restore();break;
    case 'rt_waves':mini(30,52,1.2);mini(52,46,1.4);mini(72,54,1.1);break;
    case 'rt_swarm':for(let i=0;i<9;i++){const a=i*2.4,d=8+i*3.6;c.fillStyle=rad(c,48+Math.cos(a)*d,48+Math.sin(a)*d,0,6,[[0,'rgba(255,240,180,.95)'],[1,'rgba(255,240,180,0)']]);c.beginPath();c.arc(48+Math.cos(a)*d,48+Math.sin(a)*d,6,0,TAU);c.fill()}break;
    case 'rt_ritual':c.strokeStyle='#a8302a';c.lineWidth=3;c.beginPath();c.arc(48,56,30,0,TAU);c.stroke();for(let i=0;i<5;i++){const a=-Math.PI/2+i*TAU/5;c.beginPath();c.moveTo(48+Math.cos(a)*30,56+Math.sin(a)*30);c.lineTo(48+Math.cos(a+TAU*2/5)*30,56+Math.sin(a+TAU*2/5)*30);c.stroke()}
      for(let i=0;i<5;i++){const a=-Math.PI/2+i*TAU/5;c.fillStyle='#d8ccb0';c.fillRect(48+Math.cos(a)*30-2.5,56+Math.sin(a)*30-10,5,10);drawFlame(c,48+Math.cos(a)*30,56+Math.sin(a)*30-11,0,i,.6)}break;
    case 'rt_survive':c.strokeStyle=W;c.lineWidth=5;c.beginPath();c.moveTo(30,16);c.lineTo(66,16);c.moveTo(30,80);c.lineTo(66,80);c.stroke();c.fillStyle='rgba(236,228,208,.85)';c.beginPath();c.moveTo(32,20);c.lineTo(64,20);c.lineTo(50,48);c.lineTo(64,76);c.lineTo(32,76);c.lineTo(46,48);c.closePath();c.fill();c.fillStyle=Y;c.beginPath();c.moveTo(38,70);c.lineTo(58,70);c.lineTo(48,60);c.fill();break;
    case 'rt_hunt':c.fillStyle=rad(c,48,48,2,34,[[0,'rgba(255,220,130,.9)'],[1,'rgba(255,220,130,0)']]);c.beginPath();c.arc(48,48,34,0,TAU);c.fill();c.fillStyle='#f0d890';wispPath(c,14,0,0);c.save();c.translate(48,40);c.fillStyle='#f6e2a0';wispPath(c,14,0,0);c.fill();c.restore();break;
    case 'rt_poltergeist':c.save();c.translate(48,56);c.rotate(-.18);c.fillStyle=woodP(c,'mid');rr(c,-26,-14,52,28,3);c.fill();c.restore();c.fillStyle='#d8ccb0';c.save();c.translate(64,26);c.rotate(.5);c.fillRect(-8,-11,16,22);c.restore();c.strokeStyle=W;c.lineWidth=3;for(let i=0;i<3;i++){c.beginPath();c.arc(48,56,34+i*6,-2.6,-1.9);c.stroke()}break;
    case 'tw_fog':for(let i=0;i<4;i++){c.fillStyle='rgba(200,206,216,.55)';c.beginPath();c.ellipse(28+i*14,40+i%2*16,22,9,0,0,TAU);c.fill()}break;
    case 'tw_flicker':lampAt(30,60,-.6);c.strokeStyle=Y;c.lineWidth=4;c.beginPath();c.moveTo(52,40);c.lineTo(62,30);c.lineTo(58,46);c.lineTo(72,36);c.stroke();break;
    case 'tw_storm':c.fillStyle='#5a6070';c.beginPath();c.ellipse(48,32,30,14,0,0,TAU);c.fill();c.fillStyle='#e8e4c8';c.beginPath();c.moveTo(50,40);c.lineTo(40,62);c.lineTo(50,60);c.lineTo(44,82);c.lineTo(62,54);c.lineTo(52,56);c.lineTo(58,40);c.closePath();c.fill();break;
    case 'tw_haunt':mini(48,50,2.2,'#e8c870');break;
    case 'tw_cold':c.strokeStyle='#cfe8f4';c.lineWidth=5;for(let i=0;i<3;i++){const a=i*Math.PI/3;c.beginPath();c.moveTo(48+Math.cos(a)*32,48+Math.sin(a)*32);c.lineTo(48-Math.cos(a)*32,48-Math.sin(a)*32);c.stroke()}break;
    case 'tw_dark':c.fillStyle='#08060c';c.beginPath();c.arc(48,48,32,0,TAU);c.fill();circ(c,38,46,3,'#9fd8ff');circ(c,58,46,3,'#9fd8ff');break;
    case 'of_power':c.save();c.translate(48,48);c.fillStyle=lin(c,-20,-28,20,28,[[0,'#3a2a44'],[1,'#120a18']]);rr(c,-20,-28,40,56,4);c.fill();c.strokeStyle='#c8a0e8';c.lineWidth=2;rr(c,-16,-24,32,48,2);c.stroke();c.fillStyle='#c8a0e8';starPath(c,0,0,10);c.fill();c.restore();drawHeart(c,74,76,22,Pk,true);break;
    case 'of_heal':drawHeart(c,48,52,58,Pk);c.fillStyle=W;c.fillRect(44,38,8,24);c.fillRect(36,46,24,8);break;
    case 'of_candy':drawCandy(c,34,40,Pk,2,-.4);drawCandy(c,58,52,Y,2,.3);drawCandy(c,42,66,M,2,.1);break;
    case 'of_luck':c.save();c.translate(48,48);c.fillStyle=rad(c,0,0,4,30,[[0,'#f0d080'],[1,'#7a5a14']],-6,-6);c.beginPath();c.arc(0,0,28,0,TAU);c.fill();c.restore();c.strokeStyle='#3a2a10';c.lineWidth=5;c.beginPath();c.arc(48,48,14,-.4,Math.PI*1.4);c.stroke();break;
    /* abilities */
    case 'wide':wedge(-Math.PI/2,.75,62,'rgba(255,230,170,.95)',48,80);lampAt(48,82,-Math.PI/2);break;
    case 'long':wedge(-Math.PI/4,.22,90,'rgba(255,230,170,.95)',16,80);lampAt(16,80,-Math.PI/4);break;
    case 'bright':c.fillStyle=rad(c,48,40,4,34,[[0,'rgba(255,240,190,.95)'],[1,'rgba(255,220,140,0)']]);c.beginPath();c.arc(48,40,34,0,TAU);c.fill();c.fillStyle=rad(c,48,38,2,16,[[0,'#fffbe8'],[1,'#e8d090']],-4,-4);c.beginPath();c.arc(48,38,15,0,TAU);c.fill();c.fillStyle='#7a7e88';rr(c,40,52,16,14,3);c.fill();break;
    case 'boots':c.fillStyle=lin(c,22,30,78,72,[[0,'#5a3a24'],[1,'#2a180c']]);c.beginPath();c.moveTo(24,22);c.lineTo(46,22);c.lineTo(48,50);c.lineTo(76,56);c.quadraticCurveTo(82,72,70,72);c.lineTo(24,72);c.closePath();c.fill();c.fillStyle='#1a0e08';c.fillRect(22,66,58,8);c.strokeStyle='#c8b090';c.lineWidth=2;for(let i=0;i<4;i++){c.beginPath();c.moveTo(30,30+i*6);c.lineTo(44,30+i*6);c.stroke()}break;
    case 'magnet':c.strokeStyle='#8a2a28';c.lineWidth=16;c.beginPath();c.arc(48,44,20,Math.PI,0);c.stroke();c.fillStyle='#8a2a28';c.fillRect(20,44,16,16);c.fillRect(60,44,16,16);c.fillStyle='#b8bcc6';c.fillRect(20,60,16,10);c.fillRect(60,60,16,10);drawCandy(c,48,84,Y,1.3,0);break;
    case 'dashcd':c.strokeStyle=M;c.lineWidth=5;for(let i=0;i<3;i++){c.beginPath();c.moveTo(14,36+i*14);c.lineTo(40,36+i*14);c.stroke()}c.fillStyle=W;c.beginPath();c.moveTo(46,22);c.lineTo(82,48);c.lineTo(46,74);c.lineTo(56,48);c.closePath();c.fill();break;
    case 'jump':mini(48,48,2.2);c.fillStyle=Y;c.font='700 40px Georgia,serif';c.textAlign='center';c.fillText('!',80,34);break;
    case 'strobe':for(let i=0;i<12;i++){const a=i*TAU/12;c.strokeStyle=i%2?Y:W;c.lineWidth=4;c.beginPath();c.moveTo(48+Math.cos(a)*14,48+Math.sin(a)*14);c.lineTo(48+Math.cos(a)*(i%2?30:40),48+Math.sin(a)*(i%2?30:40));c.stroke()}circ(c,48,48,12,W);break;
    case 'aura':{c.fillStyle=rad(c,48,48,6,44,[[0,'rgba(255,240,190,1)'],[1,'rgba(255,200,120,0)']]);c.beginPath();c.arc(48,48,44,0,TAU);c.fill();c.save();c.translate(48,60);c.scale(1.5,1.5);drawLumi(c,0,0,0,0,'lumi',false,1);c.restore();break}
    case 'fire':for(let i=0;i<3;i++){const a=i*TAU/3-.5,x=48+Math.cos(a)*24,y=48+Math.sin(a)*24;c.fillStyle=rad(c,x,y,0,14,[[0,'rgba(230,255,150,.9)'],[1,'rgba(200,255,120,0)']]);c.beginPath();c.arc(x,y,14,0,TAU);c.fill();circ(c,x,y,3,'#fff')}break;
    case 'chill':c.strokeStyle='#cfe8f4';c.lineWidth=5;for(let i=0;i<3;i++){const a=i*Math.PI/3;c.beginPath();c.moveTo(48+Math.cos(a)*34,48+Math.sin(a)*34);c.lineTo(48-Math.cos(a)*34,48-Math.sin(a)*34);c.stroke()}for(let i=0;i<6;i++){const a=i*Math.PI/3,x=48+Math.cos(a)*22,y=48+Math.sin(a)*22;c.beginPath();c.moveTo(x+Math.cos(a+.8)*8,y+Math.sin(a+.8)*8);c.lineTo(x,y);c.lineTo(x+Math.cos(a-.8)*8,y+Math.sin(a-.8)*8);c.stroke()}break;
    case 'bomb':for(let i=0;i<8;i++){const a=i*TAU/8;c.strokeStyle=CANDYCOLS[i%6];c.lineWidth=6;c.beginPath();c.moveTo(48+Math.cos(a)*22,48+Math.sin(a)*22);c.lineTo(48+Math.cos(a)*40,48+Math.sin(a)*40);c.stroke()}drawCandy(c,48,48,Pk,2.2,.3);break;
    case 'candle':c.fillStyle=rad(c,48,34,2,30,[[0,'rgba(255,190,100,.6)'],[1,'rgba(255,190,100,0)']]);c.beginPath();c.arc(48,34,30,0,TAU);c.fill();c.save();c.translate(48,72);c.scale(2.6,2.6);drawCandleObj(c,0,0,0,0,1);drawFlame(c,0,-14,0,0,1);c.restore();break;
    case 'salt':c.fillStyle=lin(c,30,28,66,76,[[0,'#e8ecf2'],[1,'#9aa2b0']]);rr(c,30,28,36,48,6);c.fill();c.fillStyle='#6a7280';rr(c,32,16,32,16,4);c.fill();c.fillStyle=W;for(let i=0;i<10;i++)c.fillRect(14+i*7,84-(i%3)*3,3,3);break;
    case 'sugar':c.fillStyle=Y;c.beginPath();c.moveTo(56,8);c.lineTo(24,54);c.lineTo(46,54);c.lineTo(38,88);c.lineTo(74,38);c.lineTo(52,38);c.closePath();c.fill();break;
    case 'lucky':c.save();c.translate(48,48);for(let i=0;i<4;i++){c.rotate(Math.PI/2);c.fillStyle='#4a7a3a';c.beginPath();c.ellipse(0,-14,10,14,0,0,TAU);c.fill()}c.restore();c.strokeStyle='#3a5a2a';c.lineWidth=4;c.beginPath();c.moveTo(48,48);c.quadraticCurveTo(56,70,50,86);c.stroke();break;
    case 'twin':wedge(-Math.PI/2,.35,44,'rgba(255,230,170,.95)');wedge(Math.PI/2,.35,44,'rgba(255,230,170,.95)');circ(c,48,48,9,W);break;
    case 'prism':wedge(0,.12,46,'rgba(255,240,190,.95)',4,48);c.fillStyle='rgba(200,230,255,.75)';c.beginPath();c.moveTo(48,26);c.lineTo(66,66);c.lineTo(30,66);c.closePath();c.fill();
      for(const [a,col] of[[-.45,'rgba(255,120,160,.9)'],[0,'rgba(120,255,200,.9)'],[.45,'rgba(140,170,255,.9)']]){c.strokeStyle=col;c.lineWidth=6;c.beginPath();c.moveTo(60,52);c.lineTo(60+Math.cos(a)*34,52+Math.sin(a)*34);c.stroke()}break;
    case 'angel':c.strokeStyle=Y;c.lineWidth=4;c.beginPath();c.ellipse(48,18,16,5,0,0,TAU);c.stroke();mini(48,50,2);break;
    case 'snack':c.fillStyle=lin(c,26,30,70,82,[[0,'#a87a4a'],[1,'#5a3a1a']]);c.beginPath();c.moveTo(26,30);c.lineTo(70,30);c.lineTo(76,82);c.lineTo(20,82);c.closePath();c.fill();drawCandy(c,48,56,Pk,1.8,.2);break;
    default:
      if(k.startsWith('sk_')){c.save();c.translate(48,62);c.scale(2.4,2.4);drawLumi(c,0,0,.4,0,k.slice(3),false,1);c.restore()}
      else if(k.startsWith('bm_')){const b=BEAMS.find(x=>x.id===k.slice(3))||BEAMS[0];wedge(-Math.PI/2,.5,70,'rgba('+b.c.join(',')+',1)',48,86);lampAt(48,86,-Math.PI/2)}
      else if(k.startsWith('gh_')){const tp=k.slice(3);const g=demoGhostFor(tp);c.fillStyle='#14101a';c.fillRect(0,0,96,96);c.save();c.translate(48,48);c.scale(1.5,1.5);c.translate(-g.x,-g.y);drawGhostBody(c,g,.5);drawGhostEyes(c,g,.5,1);c.restore()}
      else if(k.startsWith('ghx_')){const g=demoGhostFor(k.slice(4));c.save();c.translate(48,48);c.scale(1.5,1.5);c.translate(-g.x,-g.y);c.fillStyle='#0c0a10';ghostShape(c,g,.5);c.fill();c.restore()}
  }
}
function demoGhostFor(tp){const d=GT[tp]||GT.wisp;return{tp,look:tp,x:0,y:0,r:Math.min(d.r,20)*(tp==='mote'?1.6:1),hp:1,fear:0,alpha:1,ph:0,lit:true,col:d.col,eye:d.eye,spawnT:0,hitT:0,tr:null}}

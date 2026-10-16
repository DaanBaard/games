/* ---------- procedural art (everything is drawn in code) ---------- */
function rr(c,x,y,w,h,r){r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function hexRgb(h){const n=parseInt(h.slice(1),16);return[n>>16,n>>8&255,n&255]}
function mix(a,b,t){const A=hexRgb(a),B=hexRgb(b);return'rgb('+((A[0]+(B[0]-A[0])*t)|0)+','+((A[1]+(B[1]-A[1])*t)|0)+','+((A[2]+(B[2]-A[2])*t)|0)+')'}
function shade(h,a){return a<0?mix(h,'#000000',-a):mix(h,'#ffffff',a)}
function ell(c,x,y,rx,ry,col){c.fillStyle=col;c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,TAU);c.fill()}
function circ(c,x,y,r,col){c.fillStyle=col;c.beginPath();c.arc(x,y,Math.max(.1,r),0,TAU);c.fill()}
function heartPath(c,x,y,s){c.beginPath();c.moveTo(x,y+s*.35);c.bezierCurveTo(x,y,x-s*.5,y-s*.05,x-s*.5,y+s*.32);c.bezierCurveTo(x-s*.5,y+s*.62,x-s*.1,y+s*.78,x,y+s*.95);c.bezierCurveTo(x+s*.1,y+s*.78,x+s*.5,y+s*.62,x+s*.5,y+s*.32);c.bezierCurveTo(x+s*.5,y-s*.05,x,y,x,y+s*.35);c.closePath()}

/* ---- Lumi, the hero ---- */
function drawLumi(c,x,y,aim,t,skinId,mv,s,flash){
  const sk=SKIN[skinId]||SKINS[0];s=s||1;
  c.save();c.translate(x,y);c.scale(s,s);
  const bob=mv?Math.abs(Math.sin(t*12))*2.2:Math.sin(t*3)*.7;
  ell(c,0,15,15,5.5,'rgba(0,0,0,.35)');
  const lp=mv?Math.sin(t*12)*3.5:0;
  ell(c,-6,12+lp*.4,4.5,4,'#241c33');ell(c,6,12-lp*.4,4.5,4,'#241c33');
  const ax=Math.cos(aim),ay=Math.sin(aim);
  const lamp=()=>{c.save();c.translate(ax*9,ay*5-1-bob);c.rotate(aim);
    c.fillStyle='#2f3346';rr(c,-2,-4.5,20,9,3.5);c.fill();c.fillStyle='#9aa0bb';rr(c,1,-3.2,14,2.6,1.3);c.fill();
    c.fillStyle='#454b64';rr(c,15,-6,5,12,2);c.fill();ell(c,20.5,0,2.4,5,'#fff8d0');c.restore();
    ell(c,ax*8,ay*5+1-bob,3.6,3.6,'#ffdcc2')};
  if(sk.id==='vamp'){c.fillStyle='#160f22';c.beginPath();c.moveTo(-12,-7-bob);c.lineTo(-17,14);c.quadraticCurveTo(0,18,17,14);c.lineTo(12,-7-bob);c.closePath();c.fill()}
  if(ay<-.2)lamp();
  c.translate(0,-bob);
  c.fillStyle=sk.coat;rr(c,-12,-7,24,21,9);c.fill();
  c.save();rr(c,-12,-7,24,21,9);c.clip();c.fillStyle=sk.trim;c.fillRect(-12,9,24,6);
  if(sk.id==='skelly'){c.strokeStyle=sk.trim;c.lineWidth=2;for(let i=0;i<3;i++){c.beginPath();c.moveTo(-7,-1+i*4);c.lineTo(7,-1+i*4);c.stroke()}c.beginPath();c.moveTo(0,-4);c.lineTo(0,9);c.stroke()}
  if(sk.id==='dino')ell(c,0,4,7,7,shade(sk.coat,.35));
  if(sk.id==='astro'){c.fillStyle='#9fb3d9';rr(c,-6,-2,12,8,2);c.fill();circ(c,-3,2,1.4,'#ff5d8f');circ(c,1,2,1.4,'#5ef2c2')}
  if(sk.id==='witch'){c.fillStyle='#ffcf3a';starPath(c,5,2,3.2);c.fill()}
  if(sk.id==='golden'){c.fillStyle='rgba(255,255,255,.5)';c.fillRect(-9,-5,3,12)}
  c.restore();
  if(sk.id!=='skelly'&&sk.id!=='astro'){circ(c,0,-1,1.6,sk.trim);circ(c,0,4,1.6,sk.trim)}
  if(sk.id==='vamp'){c.fillStyle=sk.trim;c.beginPath();c.moveTo(-10,-8);c.lineTo(-4,-3);c.lineTo(-11,-1);c.closePath();c.fill();c.beginPath();c.moveTo(10,-8);c.lineTo(4,-3);c.lineTo(11,-1);c.closePath();c.fill()}
  // head
  circ(c,0,-15,10.5,'#ffdcc2');
  const ex=ax*2.3,ey=ay*1.7;
  ell(c,-3.7+ex,-15+ey,1.8,2.4,'#231a33');ell(c,3.7+ex,-15+ey,1.8,2.4,'#231a33');
  circ(c,-3.2+ex,-15.8+ey,.6,'#fff');circ(c,4.2+ex,-15.8+ey,.6,'#fff');
  c.globalAlpha=.35;circ(c,-6.5,-11.5,2,'#ff7a9a');circ(c,6.5,-11.5,2,'#ff7a9a');c.globalAlpha=1;
  drawHat(c,sk,t);
  if(ay>=-.2)lamp();
  if(flash){c.globalAlpha=flash;c.fillStyle='#fff';rr(c,-13,-27,26,42,10);c.fill();c.globalAlpha=1}
  c.restore();
}
function starPath(c,x,y,r){c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr2=i%2?r*.45:r;c.lineTo(x+Math.cos(a)*rr2,y+Math.sin(a)*rr2)}c.closePath()}
function drawHat(c,sk,t){
  const hair='#5b3a2a';
  switch(sk.id){
    case 'lumi':
      c.fillStyle=sk.coat;c.beginPath();c.arc(0,-15,12.5,Math.PI*.82,Math.PI*2.18);c.arc(0,-16,9,Math.PI*2.1,Math.PI*.9,true);c.closePath();c.fill();
      c.fillStyle=hair;c.beginPath();c.arc(0,-17,8.6,Math.PI*1.05,Math.PI*1.95);c.quadraticCurveTo(2,-19,-1,-17.5);c.closePath();c.fill();break;
    case 'pumpkin':
      c.fillStyle=hair;c.beginPath();c.arc(0,-16,10.4,Math.PI,0);c.closePath();c.fill();
      ell(c,0,-26,10,7,'#ff8a2a');c.strokeStyle='#c4570f';c.lineWidth=1.5;c.beginPath();c.ellipse(0,-26,4,7,0,0,TAU);c.stroke();
      c.fillStyle='#4caf50';c.fillRect(-1.5,-35,3,5);break;
    case 'witch':
      c.fillStyle=hair;c.beginPath();c.arc(0,-16,10.4,Math.PI,0);c.closePath();c.fill();
      ell(c,0,-22,15,4,'#3b2272');c.fillStyle='#3b2272';c.beginPath();c.moveTo(-9,-22);c.quadraticCurveTo(-2,-34,6,-44);c.quadraticCurveTo(3,-32,9,-22);c.closePath();c.fill();
      c.fillStyle='#ffcf3a';c.fillRect(-8.5,-25,17,3);break;
    case 'dino':
      c.fillStyle=sk.coat;c.beginPath();c.arc(0,-15,12.5,Math.PI*.82,Math.PI*2.18);c.arc(0,-16,9,Math.PI*2.1,Math.PI*.9,true);c.closePath();c.fill();
      c.fillStyle='#ffe066';for(let i=-2;i<=2;i++){const a=-Math.PI/2+i*.42,x=Math.cos(a)*12.5,y=-15+Math.sin(a)*12.5;c.beginPath();c.moveTo(x-3*Math.sin(a),y+3*Math.cos(a));c.lineTo(x+Math.cos(a)*6,y+Math.sin(a)*6);c.lineTo(x+3*Math.sin(a),y-3*Math.cos(a));c.closePath();c.fill()}break;
    case 'astro':
      c.fillStyle=hair;c.beginPath();c.arc(0,-16,10.4,Math.PI,0);c.closePath();c.fill();
      c.strokeStyle='rgba(220,235,255,.9)';c.lineWidth=2.5;c.beginPath();c.arc(0,-15,14,0,TAU);c.stroke();
      c.fillStyle='rgba(180,220,255,.18)';c.beginPath();c.arc(0,-15,13,0,TAU);c.fill();
      c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=2;c.beginPath();c.arc(0,-15,10,-2.6,-1.9);c.stroke();break;
    case 'vamp':
      c.fillStyle='#171021';c.beginPath();c.arc(0,-16,10.6,Math.PI,0);c.lineTo(3,-20);c.lineTo(0,-16.5);c.lineTo(-3,-20);c.closePath();c.fill();break;
    case 'skelly':
      c.fillStyle=sk.coat;c.beginPath();c.arc(0,-15,12.5,Math.PI*.82,Math.PI*2.18);c.arc(0,-16,9,Math.PI*2.1,Math.PI*.9,true);c.closePath();c.fill();
      ell(c,0,-25.5,5,4,'#f1efe6');circ(c,-1.8,-26,1.1,'#2b2b3a');circ(c,1.8,-26,1.1,'#2b2b3a');break;
    case 'golden':
      c.fillStyle='#e6a800';c.beginPath();c.arc(0,-16,10.4,Math.PI,0);c.closePath();c.fill();
      c.fillStyle='#ffd84a';c.beginPath();c.moveTo(-8,-24);c.lineTo(-8,-31);c.lineTo(-4,-27);c.lineTo(0,-33);c.lineTo(4,-27);c.lineTo(8,-31);c.lineTo(8,-24);c.closePath();c.fill();
      circ(c,0,-27,1.4,'#ff5d8f');break;
    default:
      c.fillStyle=hair;c.beginPath();c.arc(0,-16,10.4,Math.PI,0);c.closePath();c.fill();
  }
}

/* ---- ghosts ---- */
function sheetPath(c,r,h,t,ph,n,sharp){
  c.beginPath();c.moveTo(-r,0);c.arc(0,0,r,Math.PI,0);c.lineTo(r,h);
  for(let i=0;i<n;i++){const x1=r-(i+.5)*(2*r/n),x2=r-(i+1)*(2*r/n),w=Math.sin(t*6+ph+i*1.7)*r*.12;
    if(sharp){c.lineTo(x1,h+r*.4+w);c.lineTo(x2,h)}else c.quadraticCurveTo(x1,h+r*.36+w,x2,h)}
  c.closePath()}
function wispPath(c,r,t,ph){const sw=Math.sin(t*4+ph)*r*.55;c.beginPath();c.moveTo(-r,0);c.arc(0,0,r,Math.PI,0);
  c.quadraticCurveTo(r*.95,r*1.05,sw,r*2.1);c.quadraticCurveTo(-r*.95,r*1.05,-r,0);c.closePath()}
function ghostShape(c,g,t){
  const r=g.r,lk=g.look||g.tp;
  if(lk==='wisp'||lk==='mini'||lk==='golden')wispPath(c,r,t,g.ph);
  else if(lk==='shade')sheetPath(c,r,r*.95,t,g.ph,6,true);
  else if(lk==='moaner')sheetPath(c,r,r*1.45,t,g.ph,4);
  else if(lk==='pumpkin')sheetPath(c,r*.82,r*.9,t,g.ph,4);
  else sheetPath(c,r,r*(g.boss?1.05:.95),t,g.ph,g.boss?6:4);
}
function ghostFeatures(c,g,t,F){
  const r=g.r,lk=g.look||g.tp,dark='#2a1d3d';
  // mouth
  if(lk!=='pumpkin'){
    if(F>.04||g.lit){ell(c,0,r*.36,r*.12*(1+F*.6),r*.17*(1+F*.9),dark)}
    else{c.strokeStyle=dark;c.lineWidth=Math.max(1.5,r*.08);c.lineCap='round';c.beginPath();c.arc(0,r*.22,r*.16,.2*Math.PI,.8*Math.PI);c.stroke()}
  }
  if(lk==='moaner'){ell(c,0,r*.5,r*.18,r*.34*(g.charging?1.3:1),g.charging?'#ffb347':dark)}
  if(lk==='peeker'){ell(c,-r*.5,r*.18,r*.2,r*.15,shade(g.col,-.08));ell(c,r*.5,r*.18,r*.2,r*.15,shade(g.col,-.08))}
  if(F>.4){c.fillStyle='rgba(150,210,255,.9)';c.beginPath();c.moveTo(r*.72,-r*.62);c.quadraticCurveTo(r*.92,-r*.3,r*.72,-r*.24);c.quadraticCurveTo(r*.52,-r*.3,r*.72,-r*.62);c.fill()}
  // boss accessories
  switch(lk){
    case 'butler':c.fillStyle='#3a2160';c.beginPath();c.moveTo(0,r*.72);c.lineTo(-r*.32,r*.56);c.lineTo(-r*.32,r*.9);c.closePath();c.fill();c.beginPath();c.moveTo(0,r*.72);c.lineTo(r*.32,r*.56);c.lineTo(r*.32,r*.9);c.closePath();c.fill();circ(c,0,r*.72,r*.07,'#5a3590');
      c.fillStyle='#4a3a5a';c.beginPath();c.moveTo(-r*.05,r*.16);c.quadraticCurveTo(-r*.35,r*.06,-r*.42,r*.24);c.quadraticCurveTo(-r*.2,r*.2,0,r*.22);c.quadraticCurveTo(r*.2,r*.2,r*.42,r*.24);c.quadraticCurveTo(r*.35,r*.06,r*.05,r*.16);c.fill();break;
    case 'mama':c.fillStyle='#ff6fa5';c.beginPath();c.ellipse(-r*.28,-r*.95,r*.3,r*.18,-.4,0,TAU);c.ellipse(r*.28,-r*.95,r*.3,r*.18,.4,0,TAU);c.fill();circ(c,0,-r*.92,r*.12,'#ff3d8a');break;
    case 'countess':case 'cog':case 'widow':{const col=lk==='cog'?'#c8a24a':lk==='widow'?'#cfe9ff':'#d9c2ff';c.fillStyle=col;
      if(lk==='widow'){c.beginPath();c.arc(0,-r*1.05,r*.32,Math.PI*.15,Math.PI*1.85);c.arc(r*.12,-r*1.05,r*.26,Math.PI*1.75,Math.PI*.25,true);c.fill();c.fillStyle='rgba(30,20,60,.35)';c.beginPath();c.arc(0,-r*.1,r*1.02,Math.PI*1.05,Math.PI*1.95);c.lineTo(r*.9,r*.2);c.quadraticCurveTo(0,-r*.2,-r*.9,r*.2);c.fill()}
      else if(lk==='cog'){c.save();c.translate(0,-r*.95);c.rotate(t);gearPath(c,r*.32,8);c.fill();circ(c,0,0,r*.1,'#6a5020');c.restore()}
      else{c.beginPath();c.moveTo(-r*.4,-r*.82);c.lineTo(-r*.4,-r*1.12);c.lineTo(-r*.2,-r*.95);c.lineTo(0,-r*1.2);c.lineTo(r*.2,-r*.95);c.lineTo(r*.4,-r*1.12);c.lineTo(r*.4,-r*.82);c.closePath();c.fill()}break}
    case 'mossy':c.fillStyle='rgba(80,170,90,.7)';ell(c,-r*.5,-r*.5,r*.25,r*.16,'rgba(80,170,90,.7)');ell(c,r*.4,r*.6,r*.3,r*.15,'rgba(80,170,90,.7)');ell(c,r*.1,-r*.85,r*.2,r*.12,'rgba(100,190,100,.8)');break;
    case 'grumble':c.fillStyle='#b9c0d6';c.beginPath();c.moveTo(-r*.45,r*.42);c.quadraticCurveTo(0,r*1.2,r*.45,r*.42);c.quadraticCurveTo(0,r*.62,-r*.45,r*.42);c.fill();
      c.strokeStyle='#59607a';c.lineWidth=r*.09;c.beginPath();c.moveTo(-r*.52,-r*.4);c.lineTo(-r*.14,-r*.3);c.moveTo(r*.52,-r*.4);c.lineTo(r*.14,-r*.3);c.stroke();break;
    case 'clock':circ(c,0,r*.62,r*.3,'#fff6dc');c.strokeStyle='#5a4a70';c.lineWidth=r*.05;c.beginPath();c.arc(0,r*.62,r*.3,0,TAU);c.stroke();
      c.beginPath();c.moveTo(0,r*.62);c.lineTo(Math.cos(t*2)*r*.22,r*.62+Math.sin(t*2)*r*.22);c.moveTo(0,r*.62);c.lineTo(Math.cos(t*.3)*r*.15,r*.62+Math.sin(t*.3)*r*.15);c.stroke();break;
    case 'lily':for(let i=0;i<5;i++){const a=i*TAU/5-Math.PI/2;ell(c,Math.cos(a)*r*.18,-r*.98+Math.sin(a)*r*.18,r*.14,r*.14,'#ff9ad5')}circ(c,0,-r*.98,r*.1,'#ffe066');break;
  }
}
function gearPath(c,r,n){c.beginPath();for(let i=0;i<n*2;i++){const a=i*Math.PI/n,rr2=i%2?r*.78:r;c.lineTo(Math.cos(a-.12)*rr2,Math.sin(a-.12)*rr2);c.lineTo(Math.cos(a+.12)*rr2,Math.sin(a+.12)*rr2)}c.closePath()}
function ghostScale(g){const F=clamp(g.fear/g.hp,0,1);return{F,sc:(1-F*(g.boss?.12:.32))*(g.spawnT>0?.4+.6*(1-g.spawnT/(g.spawnMax||.9)):1)}}
function drawGhostBody(c,g,t){
  const {F,sc}=ghostScale(g);const r=g.r,lk=g.look||g.tp;
  const bob=Math.sin(t*2.6+g.ph)*r*.12;
  const sh=g.lit?(Math.random()-.5)*r*.12:0;
  c.save();c.translate(g.x,g.y);
  ell(c,0,r*1.55,r*.8*sc,r*.25*sc,'rgba(0,0,0,'+(.22*g.alpha)+')');
  c.translate(sh,bob-r*.2);c.scale(sc,sc);c.globalAlpha=g.alpha*(lk==='peeker'?.82:1);
  if(lk==='flitter'){const fl=Math.sin(t*22+g.ph);c.fillStyle=shade(g.col,-.18);for(const sd of[-1,1]){c.beginPath();c.moveTo(sd*r*.6,-r*.1);c.lineTo(sd*r*1.7,-r*(.6+fl*.5));c.lineTo(sd*r*1.25,r*.25);c.closePath();c.fill()}}
  if(lk==='moth'){c.fillStyle='#c9b39a';for(const sd of[-1,1]){c.beginPath();c.ellipse(sd*r*1.05,-r*.1,r*.75,r*.55+Math.sin(t*5)*r*.05,sd*.5,0,TAU);c.fill();circ(c,sd*r*1.15,-r*.15,r*.2,'#7a5a9a');circ(c,sd*r*1.15,-r*.15,r*.09,'#ffd36b')}}
  const col=g.elite?mix(g.col,'#ffd36b',.25):g.col;
  c.fillStyle=g.hitT>0?'#ffffff':mix(col,'#ffffff',F*.7);
  if(lk==='pumpkin'){sheetPath(c,r*.82,r*.9,t,g.ph,4);c.fill();
    ell(c,0,-r*.18,r*1.02,r*.82,'#ff8a2a');c.strokeStyle='#c4570f';c.lineWidth=r*.07;c.beginPath();c.ellipse(0,-r*.18,r*.42,r*.82,0,0,TAU);c.stroke();c.beginPath();c.moveTo(0,-r);c.lineTo(0,r*.64);c.stroke();
    c.fillStyle='#4caf50';c.fillRect(-r*.08,-r*1.22,r*.16,r*.3)}
  else{ghostShape(c,g,t);c.fill();c.strokeStyle='rgba(60,40,100,.35)';c.lineWidth=2;c.stroke()}
  if(g.elite){c.strokeStyle='rgba(255,210,90,.9)';c.lineWidth=3;ghostShape(c,g,t);c.stroke()}
  ghostFeatures(c,g,t,F);
  c.restore();
}
function drawGhostEyes(c,g,t,vis){
  if(vis<=.02)return;
  const {F,sc}=ghostScale(g);const r=g.r,lk=g.look||g.tp;
  const bob=Math.sin(t*2.6+g.ph)*r*.12;
  c.save();c.translate(g.x,g.y+bob-r*.2);c.scale(sc,sc);c.globalAlpha=vis*g.alpha;
  // faint rim so threats read in the dark
  if(!g.lit){c.globalAlpha=vis*g.alpha*.14;c.strokeStyle=g.eye;c.lineWidth=2;ghostShape(c,g,t);c.stroke();c.globalAlpha=vis*g.alpha}
  const ex=r*.33,ey=-r*.12;
  const blink=((t*.37+g.ph)%4)>3.85?.15:1;
  if(lk==='pumpkin'){
    c.fillStyle='rgba(255,190,60,.25)';circ(c,0,-r*.1,r*.9,'rgba(255,170,40,.16)');
    c.fillStyle=F>.2?'#fff6c8':g.eye;
    for(const sd of[-1,1]){c.beginPath();c.moveTo(sd*r*.5,-r*.05);c.lineTo(sd*r*.2,-r*.05);c.lineTo(sd*r*.35,-r*(.42+F*.15));c.closePath();c.fill()}
    c.beginPath();c.moveTo(-r*.45,r*.18);c.lineTo(-r*.25,r*.32);c.lineTo(-r*.1,r*.2);c.lineTo(0,r*.34);c.lineTo(r*.1,r*.2);c.lineTo(r*.25,r*.32);c.lineTo(r*.45,r*.18);c.quadraticCurveTo(0,r*(.6+F*.2),-r*.45,r*.18);c.fill();
  }else{
    circ(c,-ex,ey,r*.36,hexA(g.eye,.18));circ(c,ex,ey,r*.36,hexA(g.eye,.18));
    if(F>.12||g.lit){const er=r*.19*(1+F*.45);
      ell(c,-ex,ey,er,er*blink,'#ffffff');ell(c,ex,ey,er,er*blink,'#ffffff');
      const px=clamp((P?P.x-g.x:0)*.02,-1,1)*er*.4,py=clamp((P?P.y-g.y:0)*.02,-1,1)*er*.4;
      circ(c,-ex+px,ey+py,er*.38,'#2a1d3d');circ(c,ex+px,ey+py,er*.38,'#2a1d3d');
    }else{
      c.fillStyle=g.eye;c.save();c.translate(-ex,ey);c.rotate(.25);c.beginPath();c.ellipse(0,0,r*.13,r*.2*blink,0,0,TAU);c.fill();c.restore();
      c.save();c.translate(ex,ey);c.rotate(-.25);c.beginPath();c.ellipse(0,0,r*.13,r*.2*blink,0,0,TAU);c.fill();c.restore();
      circ(c,-ex+r*.03,ey-r*.06,r*.045,'#fff');circ(c,ex+r*.03,ey-r*.06,r*.045,'#fff');
    }
  }
  c.restore();
}
const _hexA={};function hexA(h,a){const k=h+a;if(_hexA[k])return _hexA[k];const c=hexRgb(h);return _hexA[k]='rgba('+c[0]+','+c[1]+','+c[2]+','+a+')'}

/* ---- pickups ---- */
function drawCandy(c,x,y,col,s,rot){c.save();c.translate(x,y);c.rotate(rot||0);c.scale(s,s);
  c.fillStyle=shade(col,-.15);c.beginPath();c.moveTo(-6,0);c.lineTo(-11,-5);c.lineTo(-11,5);c.closePath();c.fill();c.beginPath();c.moveTo(6,0);c.lineTo(11,-5);c.lineTo(11,5);c.closePath();c.fill();
  ell(c,0,0,7,5.5,col);c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=1.6;c.beginPath();c.moveTo(-3,-4.5);c.lineTo(1,4.5);c.moveTo(1,-5);c.lineTo(5,3.5);c.stroke();
  ell(c,-2,-2,2,1.2,'rgba(255,255,255,.6)');c.restore()}
function drawLolly(c,x,y,s,t){c.save();c.translate(x,y);c.scale(s,s);c.fillStyle='#f4ead8';c.fillRect(-1.2,4,2.4,12);
  circ(c,0,0,8,'#ff5d8f');c.strokeStyle='#fff';c.lineWidth=2;c.beginPath();for(let a=0;a<TAU*2.2;a+=.3){const rr2=a*.55;c.lineTo(Math.cos(a+t)*rr2,Math.sin(a+t)*rr2)}c.stroke();c.restore()}
function drawSoul(c,x,y,t){const f=Math.sin(t*14)*1.2;c.fillStyle='rgba(120,255,210,.35)';c.beginPath();c.arc(x,y,7,0,TAU);c.fill();
  c.fillStyle='#8dffd9';c.beginPath();c.moveTo(x,y-7-f);c.quadraticCurveTo(x+4.5,y-1,x+3,y+3);c.arc(x,y+2,3.2,0,Math.PI);c.quadraticCurveTo(x-4.5,y-1,x,y-7-f);c.fill();circ(c,x,y+2,1.6,'#fff')}
function drawHeart(c,x,y,s,col,empty){heartPath(c,x,y-s*.45,s);if(empty){c.fillStyle='rgba(255,255,255,.08)';c.fill();c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=2;c.stroke()}
  else{c.fillStyle=col||'#ff5d8f';c.fill();c.strokeStyle='#8a1f45';c.lineWidth=Math.max(1.5,s*.07);c.stroke();ell(c,x-s*.2,y-s*.18,s*.1,s*.07,'rgba(255,255,255,.7)')}}
function drawChest(c,x,y,s,open,t){c.save();c.translate(x,y);c.scale(s,s);ell(c,0,16,22,6,'rgba(0,0,0,.35)');
  c.fillStyle='#7a4a24';rr(c,-20,-6,40,22,4);c.fill();c.fillStyle='#ffcf3a';c.fillRect(-20,2,40,3);c.fillRect(-3,-6,6,22);
  c.save();if(open){c.translate(0,-6);c.rotate(-.9);c.translate(0,6)}c.fillStyle='#93582b';rr(c,-21,-18,42,14,6);c.fill();c.fillStyle='#ffcf3a';c.fillRect(-3,-18,6,14);c.restore();
  if(!open){circ(c,0,-3,3.4,'#fff1a8');}c.restore()}
function drawCandleObj(c,x,y,t,ph,s){s=s||1;c.save();c.translate(x,y);c.scale(s,s);ell(c,0,4,7,3,'rgba(0,0,0,.3)');c.fillStyle='#f3ead6';rr(c,-4,-14,8,18,2);c.fill();c.fillStyle='#d9ccb0';c.fillRect(-4,-1,8,5);c.restore()}
function drawFlame(c,x,y,t,ph,s){s=s||1;const f=Math.sin(t*13+ph)*.15+Math.sin(t*7.3+ph*2)*.1;c.save();c.translate(x,y);c.scale(s,s*(1+f));
  c.fillStyle='rgba(255,170,60,.35)';c.beginPath();c.arc(0,-3,7,0,TAU);c.fill();
  c.fillStyle='#ffb43a';c.beginPath();c.moveTo(0,-11);c.quadraticCurveTo(4.5,-3,0,0);c.quadraticCurveTo(-4.5,-3,0,-11);c.fill();
  c.fillStyle='#fff3c0';c.beginPath();c.moveTo(0,-7);c.quadraticCurveTo(2,-2.5,0,-.5);c.quadraticCurveTo(-2,-2.5,0,-7);c.fill();c.restore()}

/* ---- furniture ---- */
function drawFurn(c,f){
  const {x,y,w,h,type}=f;c.save();
  ell(c,x+w/2,y+h+3,w*.52,8,'rgba(0,0,0,.28)');
  const box=(col,top,r)=>{c.fillStyle=shade(col,-.3);rr(c,x,y+6,w,h-6,r||6);c.fill();c.fillStyle=col;rr(c,x,y,w,h-8,r||6);c.fill();if(top){c.fillStyle=top;rr(c,x+5,y+4,w-10,h-18,(r||6)-2);c.fill()}};
  switch(type){
    case 'table':box('#6b4226','#7d5030',10);ell(c,x+w*.3,y+h*.35,9,6,'#e9e2d0');c.fillStyle='#3d6db5';c.fillRect(x+w*.6,y+h*.25,22,14);c.fillStyle='#e6dcc0';c.fillRect(x+w*.6+2,y+h*.25+2,18,2);break;
    case 'armchair':c.fillStyle='#4a1d3a';rr(c,x,y,w,h,14);c.fill();c.fillStyle='#7a2f5f';rr(c,x+8,y+14,w-16,h-20,10);c.fill();c.fillStyle='#5c2448';rr(c,x,y+10,12,h-12,6);c.fill();rr(c,x+w-12,y+10,12,h-12,6);c.fill();break;
    case 'bookcase':box('#4a2f1e',null,4);for(let i=0;i<9;i++){c.fillStyle=pick2(i,['#b83b5e','#3d6db5','#e0a030','#3f9a63','#8b5cf6']);c.fillRect(x+8+i*13,y+6,10,h-20)}break;
    case 'piano':box('#1c1724','#262033',8);c.fillStyle='#f2efe6';c.fillRect(x+10,y+h-26,w-20,12);c.fillStyle='#1c1724';for(let i=0;i<14;i++)if(i%7!==2&&i%7!==6)c.fillRect(x+16+i*8.4,y+h-26,4,7);break;
    case 'clock':box('#5a3a22',null,6);circ(c,x+w/2,y+h/2-4,w*.34,'#f3ead6');c.strokeStyle='#2a1d3d';c.lineWidth=2;c.beginPath();c.moveTo(x+w/2,y+h/2-4);c.lineTo(x+w/2,y+h/2-14);c.moveTo(x+w/2,y+h/2-4);c.lineTo(x+w/2+7,y+h/2-4);c.stroke();break;
    case 'crate':case 'boxes':{const col=type==='crate'?'#8a5a2e':'#b58a55';box(col,shade(col,.12),4);c.strokeStyle=shade(col,-.35);c.lineWidth=3;
      if(type==='crate'){c.beginPath();c.moveTo(x+6,y+6);c.lineTo(x+w-6,y+h-14);c.moveTo(x+w-6,y+6);c.lineTo(x+6,y+h-14);c.stroke()}else{c.fillStyle='#d9c08a';c.fillRect(x+w/2-4,y+3,8,h-14);c.strokeRect(x+4,y+h*.45,w-8,1)}break}
    case 'trunk':box('#6a3f22','#7a4a2a',8);c.fillStyle='#c9a24a';c.fillRect(x+w*.25,y,6,h-8);c.fillRect(x+w*.7,y,6,h-8);circ(c,x+w/2,y+h/2-4,4,'#e8c66a');break;
    case 'rocking':c.fillStyle='#6b4226';rr(c,x,y,w,h-6,10);c.fill();c.fillStyle='#8a5a34';rr(c,x+8,y+8,w-16,h-24,8);c.fill();c.strokeStyle='#4a2c18';c.lineWidth=4;c.beginPath();c.moveTo(x-4,y+h-4);c.quadraticCurveTo(x+w/2,y+h+6,x+w+4,y+h-4);c.stroke();break;
    case 'dresser':box('#5e3b25',null,6);for(let i=0;i<3;i++){c.fillStyle='#6f4830';c.fillRect(x+6+i*(w-12)/3,y+6,(w-12)/3-4,h-20);circ(c,x+6+i*(w-12)/3+((w-12)/3-4)/2,y+h/2-4,2.5,'#e8c66a')}break;
    case 'tomb':box('#6a6f7c','#7a808e',6);c.strokeStyle='#4e5360';c.lineWidth=2;c.beginPath();c.arc(x+w/2,y+h/2-4,10,0,Math.PI*1.6);c.stroke();ell(c,x+w*.2,y+h*.3,10,5,'rgba(90,170,100,.5)');break;
    case 'urn':circ(c,x+w/2,y+h/2,w/2,'#5a6274');circ(c,x+w/2,y+h/2-3,w/2-5,'#6c7488');circ(c,x+w/2,y+h/2-3,w/2-12,'#2a2f3a');break;
    case 'pillar':circ(c,x+w/2,y+h/2,w/2,'#585e6c');circ(c,x+w/2,y+h/2-4,w/2-3,'#767d8c');c.strokeStyle='#5d6372';c.lineWidth=2;c.beginPath();c.arc(x+w/2,y+h/2-4,w/2-10,0,TAU);c.stroke();break;
    case 'candelabra':circ(c,x+w/2,y+h/2,w/2-4,'#8a7440');circ(c,x+w/2,y+h/2,w/2-10,'#b89a50');break;
    case 'bench':box('#6b4a2e','#7d5838',6);c.strokeStyle='#553820';c.lineWidth=2;for(let i=1;i<4;i++){c.beginPath();c.moveTo(x+i*w/4,y+4);c.lineTo(x+i*w/4,y+h-12);c.stroke()}break;
    case 'gear':c.save();c.translate(x+w/2,y+h/2);c.rotate(f.ph||0);c.fillStyle='#8a6a2a';gearPath(c,w/2,10);c.fill();circ(c,0,0,w*.3,'#a8843a');circ(c,0,0,w*.1,'#5a4418');c.restore();break;
    case 'pendulum':circ(c,x+w/2,y+h/2,w/2,'#a8843a');circ(c,x+w/2,y+h/2,w/2-6,'#c9a24a');circ(c,x+w/2,y+h/2,6,'#6a5020');break;
    case 'planter':box('#7a4a2e',null,8);for(let i=0;i<6;i++)circ(c,x+w*(.25+.5*((i*37)%10)/10),y+h*(.22+.4*((i*53)%10)/10),14,i%2?'#3f8f4f':'#4caf62');break;
    case 'fountain':circ(c,x+w/2,y+h/2,w/2,'#5d6b74');circ(c,x+w/2,y+h/2,w/2-8,'#3a7ea0');circ(c,x+w/2,y+h/2,w/2-18,'#4a9cc0');circ(c,x+w/2,y+h/2,9,'#8aa0aa');break;
    case 'pumpkins':for(const [px,py,pr] of[[.3,.55,.28],[.68,.5,.33],[.5,.3,.22]]){const cx=x+w*px,cy=y+h*py,R=h*pr+6;ell(c,cx,cy,R*1.15,R,'#ff8a2a');c.strokeStyle='#c4570f';c.lineWidth=2;c.beginPath();c.ellipse(cx,cy,R*.45,R,0,0,TAU);c.stroke();c.fillStyle='#4caf50';c.fillRect(cx-2,cy-R-4,4,6)}break;
    default:box('#555',null,6);
  }
  c.restore();
}
function pick2(i,a){return a[(i*7+3)%a.length]}

/* ---- room static layer ---- */
function renderRoomStatic(rm,res){
  const cw=Math.ceil((ROOM_W+WALL*2)*res),chh=Math.ceil((ROOM_H+WALL*2)*res);
  const cv=rm.cv||document.createElement('canvas');cv.width=cw;cv.height=chh;rm.cv=cv;rm.res=res;
  const c=cv.getContext('2d');c.setTransform(res,0,0,res,WALL*res,WALL*res);
  const ch=rm.ch;const r=srng(rm.seed);
  c.fillStyle=ch.wall;c.fillRect(-WALL,-WALL,ROOM_W+WALL*2,ROOM_H+WALL*2);
  // floor
  c.fillStyle=ch.fa;c.fillRect(0,0,ROOM_W,ROOM_H);
  if(ch.floor==='wood'||ch.floor==='boards'||ch.floor==='brass'){
    const bh=ch.floor==='boards'?34:26;
    for(let yy=0,i=0;yy<ROOM_H;yy+=bh,i++){c.fillStyle=i%2?ch.fa:ch.fb;c.fillRect(0,yy,ROOM_W,bh);c.fillStyle='rgba(0,0,0,.25)';c.fillRect(0,yy+bh-2,ROOM_W,2);
      let xx=-(i*67)%160;while(xx<ROOM_W){c.fillRect(xx,yy,2,bh);xx+=120+r()*90}}
    if(ch.floor==='brass'){c.strokeStyle='rgba(220,180,90,.25)';c.lineWidth=3;for(let i=0;i<5;i++){c.beginPath();c.arc(r()*ROOM_W,r()*ROOM_H,30+r()*60,0,TAU);c.stroke()}}
  }else{
    const ts=ch.floor==='stone'?60:50;
    for(let yy=0,j=0;yy<ROOM_H;yy+=ts,j++)for(let xx=0,i=0;xx<ROOM_W;xx+=ts,i++){c.fillStyle=(i+j)%2?ch.fa:ch.fb;c.fillRect(xx,yy,ts,ts);c.fillStyle='rgba(255,255,255,'+(r()*.04)+')';c.fillRect(xx+3,yy+3,ts-6,ts-6)}
    c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=2;for(let xx=0;xx<=ROOM_W;xx+=ts){c.beginPath();c.moveTo(xx,0);c.lineTo(xx,ROOM_H);c.stroke()}for(let yy=0;yy<=ROOM_H;yy+=ts){c.beginPath();c.moveTo(0,yy);c.lineTo(ROOM_W,yy);c.stroke()}
    if(ch.floor==='stone'){c.fillStyle='rgba(90,170,100,.18)';for(let i=0;i<8;i++){c.beginPath();c.ellipse(r()*ROOM_W,r()*ROOM_H,10+r()*25,6+r()*12,r()*3,0,TAU);c.fill()}}
  }
  // rug
  c.save();c.globalAlpha=.85;c.fillStyle=ch.rug;rr(c,ROOM_W/2-210,ROOM_H/2-120,420,240,30);c.fill();c.strokeStyle='rgba(255,210,120,.35)';c.lineWidth=4;rr(c,ROOM_W/2-195,ROOM_H/2-105,390,210,22);c.stroke();
  c.strokeStyle='rgba(255,210,120,.2)';c.lineWidth=2;c.beginPath();c.ellipse(ROOM_W/2,ROOM_H/2,90,50,0,0,TAU);c.stroke();c.restore();
  // cobwebs in corners
  c.strokeStyle='rgba(220,220,240,.18)';c.lineWidth=1;for(const [cx,cy,sx,sy] of[[0,0,1,1],[ROOM_W,0,-1,1]]){for(let i=1;i<=3;i++){c.beginPath();c.moveTo(cx+sx*i*18,cy);c.quadraticCurveTo(cx+sx*i*12,cy+sy*i*12,cx,cy+sy*i*18);c.stroke()}c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+sx*60,cy+sy*60);c.stroke()}
  // walls
  c.fillStyle=ch.paper;c.fillRect(-WALL,-WALL,ROOM_W+WALL*2,WALL);
  c.fillStyle=ch.stripe;for(let xx=-WALL;xx<ROOM_W+WALL;xx+=28)c.fillRect(xx,-WALL,10,WALL);
  c.fillStyle='rgba(0,0,0,.4)';c.fillRect(-WALL,-6,ROOM_W+WALL*2,6);
  c.fillStyle=shade(ch.wall,-.25);c.fillRect(-WALL,0,WALL,ROOM_H+WALL);c.fillRect(ROOM_W,0,WALL,ROOM_H+WALL);c.fillRect(-WALL,ROOM_H,ROOM_W+WALL*2,WALL);
  c.fillStyle='rgba(255,255,255,.05)';c.fillRect(-6,0,6,ROOM_H);c.fillRect(ROOM_W,0,6,ROOM_H);
  // windows & frames on top wall
  for(const wx of rm.windows){c.fillStyle='#0d1530';rr(c,wx-26,-WALL+6,52,WALL-12,6);c.fill();circ(c,wx+10,-WALL+18,7,'#fff6c8');circ(c,wx+13,-WALL+16,6,'#0d1530');c.strokeStyle='#5a4630';c.lineWidth=4;rr(c,wx-26,-WALL+6,52,WALL-12,6);c.stroke();c.beginPath();c.moveTo(wx,-WALL+6);c.lineTo(wx,-6);c.stroke()}
  for(const fx of rm.frames){c.fillStyle='#c9a24a';rr(c,fx-18,-WALL+8,36,28,3);c.fill();c.fillStyle='#2a3a3a';c.fillRect(fx-13,-WALL+12,26,20);c.fillStyle='#dfe9ff';c.beginPath();c.arc(fx,-WALL+21,6,Math.PI,0);c.lineTo(fx+6,-WALL+29);c.lineTo(fx-6,-WALL+29);c.fill()}
  // door frames
  for(const dx of rm.doorXs){c.fillStyle='#3a2416';rr(c,dx-52,-WALL-2,104,WALL+6,8);c.fill();c.fillStyle='#5a3a22';rr(c,dx-44,-WALL+4,88,WALL,6);c.fill();c.fillStyle='#4a2e1a';c.fillRect(dx-2,-WALL+4,4,WALL);circ(c,dx+12,-WALL/2+2,3,'#e8c66a');circ(c,dx-12,-WALL/2+2,3,'#e8c66a')}
  for(const f of rm.furn)drawFurn(c,f);
  for(const cd of rm.candles)drawCandleObj(c,cd.x,cd.y,0,0,1);
}

/* ---- icons for the HTML UI ---- */
const ICON_CACHE={};
function iconURL(kind,size){size=size||96;const k=kind+'@'+size;if(ICON_CACHE[k])return ICON_CACHE[k];
  const cv=document.createElement('canvas');cv.width=cv.height=size;const c=cv.getContext('2d');c.scale(size/96,size/96);drawIcon(c,kind);
  try{return ICON_CACHE[k]=cv.toDataURL()}catch(e){return ''}}
function drawIcon(c,k){
  const Y='#ffd23f',O='#ff8a2a',M='#5ef2c2',Pk='#ff5d8f',V='#c56bff',B='#7fb8ff',W='#f4efff',D='#2a1d3d';
  c.lineCap='round';c.lineJoin='round';
  const wedge=(a,ang,len,col,x,y)=>{x=x||48;y=y||48;const g=c.createRadialGradient(x,y,2,x,y,len);g.addColorStop(0,col);g.addColorStop(1,'rgba(255,230,150,0)');c.fillStyle=g;c.beginPath();c.moveTo(x,y);c.arc(x,y,len,a-ang,a+ang);c.closePath();c.fill()};
  const lampAt=(x,y,a)=>{c.save();c.translate(x,y);c.rotate(a);c.fillStyle='#3b3f58';rr(c,-16,-7,28,14,5);c.fill();c.fillStyle='#565d7a';rr(c,8,-10,8,20,3);c.fill();ell(c,16,0,3,8,'#fff8d0');c.restore()};
  const mini=(x,y,s,col)=>{c.save();c.translate(x,y);c.scale(s,s);c.fillStyle=col||W;sheetPath(c,14,12,0,0,4);c.fill();ell(c,-5,-2,2.4,3.4,D);ell(c,5,-2,2.4,3.4,D);c.restore()};
  switch(k){
    case 'candy':drawCandy(c,48,48,Pk,3.4,-.4);break;
    case 'heart':drawHeart(c,48,52,64,Pk);break;
    case 'soul':c.save();c.translate(48,52);c.scale(4,4);drawSoul(c,0,0,0);c.restore();break;
    case 'coin':circ(c,48,48,32,'#e0a800');circ(c,48,48,26,Y);c.fillStyle='#e0a800';starPath(c,48,48,15);c.fill();break;
    case 'trophy':c.fillStyle=Y;c.beginPath();c.moveTo(24,18);c.lineTo(72,18);c.quadraticCurveTo(72,56,48,60);c.quadraticCurveTo(24,56,24,18);c.fill();c.strokeStyle=Y;c.lineWidth=6;c.beginPath();c.arc(24,32,10,Math.PI*.5,Math.PI*1.5);c.arc(72,32,10,-Math.PI*.5,Math.PI*.5);c.stroke();c.fillRect(42,58,12,14);c.fillStyle='#e0a800';rr(c,30,72,36,10,3);c.fill();c.fillStyle='rgba(255,255,255,.5)';c.fillRect(34,24,6,22);break;
    case 'lock':c.strokeStyle='#9aa0bb';c.lineWidth=8;c.beginPath();c.arc(48,40,14,Math.PI,0);c.stroke();c.fillStyle='#c9cbe0';rr(c,26,40,44,34,8);c.fill();circ(c,48,54,5,'#555b75');break;
    case 'chest':drawChest(c,48,50,1.8,false,0);break;
    case 'cart':c.fillStyle=O;rr(c,18,26,60,36,8);c.fill();c.fillStyle='#ffd9b0';for(let i=0;i<3;i++)c.fillRect(26+i*16,34,10,20);circ(c,32,72,7,W);circ(c,64,72,7,W);c.strokeStyle=W;c.lineWidth=5;c.beginPath();c.moveTo(8,18);c.lineTo(18,26);c.stroke();break;
    case 'shirt':c.fillStyle=Y;c.beginPath();c.moveTo(30,18);c.lineTo(14,30);c.lineTo(22,42);c.lineTo(30,38);c.lineTo(30,78);c.lineTo(66,78);c.lineTo(66,38);c.lineTo(74,42);c.lineTo(82,30);c.lineTo(66,18);c.quadraticCurveTo(48,30,30,18);c.fill();circ(c,48,46,3,'#d99a14');circ(c,48,58,3,'#d99a14');break;
    case 'scroll':c.fillStyle='#f3e6c4';rr(c,22,16,52,64,6);c.fill();c.fillStyle='#d8c494';rr(c,18,12,60,10,5);c.fill();rr(c,18,74,60,10,5);c.fill();c.strokeStyle='#8a7350';c.lineWidth=4;for(let i=0;i<4;i++){c.beginPath();c.moveTo(32,32+i*11);c.lineTo(64-(i%2)*10,32+i*11);c.stroke()}c.strokeStyle='#3fbf5a';c.lineWidth=5;c.beginPath();c.moveTo(56,62);c.lineTo(62,68);c.lineTo(74,52);c.stroke();break;
    case 'gift':c.fillStyle=V;rr(c,20,38,56,40,6);c.fill();c.fillStyle='#d79bff';rr(c,16,30,64,12,4);c.fill();c.fillStyle=Y;c.fillRect(44,30,8,48);c.strokeStyle=Y;c.lineWidth=6;c.beginPath();c.ellipse(38,24,10,6,-.5,0,TAU);c.ellipse(58,24,10,6,.5,0,TAU);c.stroke();break;
    case 'book':c.fillStyle='#6b3fa0';rr(c,20,14,56,68,6);c.fill();c.fillStyle='#e9dcff';c.fillRect(66,18,6,60);mini(46,48,1.3);break;
    case 'crown':c.fillStyle=Y;c.beginPath();c.moveTo(16,70);c.lineTo(16,30);c.lineTo(32,48);c.lineTo(48,22);c.lineTo(64,48);c.lineTo(80,30);c.lineTo(80,70);c.closePath();c.fill();circ(c,48,58,6,Pk);break;
    case 'star':c.fillStyle=Y;starPath(c,48,48,34);c.fill();break;
    case 'reroll':c.strokeStyle=M;c.lineWidth=9;c.beginPath();c.arc(48,48,24,-.4,Math.PI*1.4);c.stroke();c.fillStyle=M;c.beginPath();c.moveTo(72,30);c.lineTo(76,52);c.lineTo(56,44);c.closePath();c.fill();break;
    case 'rw_card':c.save();c.translate(48,48);c.rotate(-.15);c.fillStyle='#2a2045';rr(c,-22,-30,44,60,7);c.fill();c.strokeStyle=B;c.lineWidth=4;rr(c,-22,-30,44,60,7);c.stroke();c.fillStyle=Y;starPath(c,0,0,13);c.fill();c.restore();break;
    case 'rw_candy':drawCandy(c,36,56,Pk,2.2,-.5);drawCandy(c,60,44,M,2.2,.4);drawCandy(c,50,66,Y,2,.1);break;
    case 'rw_heart':drawHeart(c,48,52,58,Pk);break;
    case 'rw_chest':drawChest(c,48,52,1.7,false,0);break;
    case 'rw_mystery':c.fillStyle=V;rr(c,18,18,60,60,14);c.fill();c.fillStyle=W;c.font='900 50px Arial Black,Impact,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('?',48,52);break;
    case 'rw_boss':mini(48,50,2.4,'#e8e2ff');c.fillStyle='#ff9d5c';ell(c,36,45,5,7,'#ff9d5c');ell(c,60,45,5,7,'#ff9d5c');break;
    /* abilities */
    case 'wide':wedge(-Math.PI/2,.75,62,'rgba(255,230,150,.95)',48,80);lampAt(48,82,-Math.PI/2);break;
    case 'long':wedge(-Math.PI/4,.22,90,'rgba(255,230,150,.95)',16,80);lampAt(16,80,-Math.PI/4);break;
    case 'bright':circ(c,48,40,30,'rgba(255,230,120,.25)');circ(c,48,40,20,'#fff2a8');c.fillStyle='#9aa0bb';rr(c,38,58,20,16,4);c.fill();c.strokeStyle='#ffd23f';c.lineWidth=4;for(let i=0;i<8;i++){const a=i*TAU/8;c.beginPath();c.moveTo(48+Math.cos(a)*26,40+Math.sin(a)*26);c.lineTo(48+Math.cos(a)*36,40+Math.sin(a)*36);c.stroke()}break;
    case 'boots':c.fillStyle=Pk;c.beginPath();c.moveTo(22,30);c.lineTo(44,30);c.lineTo(48,52);c.lineTo(78,58);c.quadraticCurveTo(82,72,70,72);c.lineTo(22,72);c.closePath();c.fill();c.fillStyle=W;c.fillRect(20,66,60,8);c.strokeStyle=W;c.lineWidth=3;for(let i=0;i<3;i++){c.beginPath();c.moveTo(30+i*6,40+i*5);c.lineTo(42+i*4,38+i*5);c.stroke()}c.strokeStyle=M;c.lineWidth=4;for(let i=0;i<3;i++){c.beginPath();c.moveTo(4,40+i*12);c.lineTo(14,40+i*12);c.stroke()}break;
    case 'magnet':c.strokeStyle='#ff5d5d';c.lineWidth=16;c.beginPath();c.arc(48,44,20,Math.PI,0);c.stroke();c.fillStyle='#ff5d5d';c.fillRect(20,44,16,16);c.fillRect(60,44,16,16);c.fillStyle=W;c.fillRect(20,60,16,10);c.fillRect(60,60,16,10);drawCandy(c,48,82,Y,1.4,0);break;
    case 'dashcd':c.strokeStyle=M;c.lineWidth=6;for(let i=0;i<3;i++){c.beginPath();c.moveTo(14,36+i*14);c.lineTo(40,36+i*14);c.stroke()}c.fillStyle=W;c.beginPath();c.moveTo(46,22);c.lineTo(82,48);c.lineTo(46,74);c.lineTo(56,48);c.closePath();c.fill();break;
    case 'jump':c.fillStyle=Y;starPath(c,48,48,40);c.fill();c.fillStyle=D;c.font='900 46px Arial Black,Impact,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('!',48,52);break;
    case 'strobe':for(let i=0;i<12;i++){const a=i*TAU/12;c.strokeStyle=i%2?Y:W;c.lineWidth=5;c.beginPath();c.moveTo(48+Math.cos(a)*14,48+Math.sin(a)*14);c.lineTo(48+Math.cos(a)*(i%2?32:42),48+Math.sin(a)*(i%2?32:42));c.stroke()}circ(c,48,48,12,W);break;
    case 'aura':{const g=c.createRadialGradient(48,48,6,48,48,44);g.addColorStop(0,'rgba(255,240,180,1)');g.addColorStop(1,'rgba(255,200,100,0)');c.fillStyle=g;c.beginPath();c.arc(48,48,44,0,TAU);c.fill();c.save();c.translate(48,58);c.scale(1.4,1.4);drawLumi(c,0,0,0,0,'lumi',false,1);c.restore();break}
    case 'fire':for(let i=0;i<3;i++){const a=i*TAU/3-.5,x=48+Math.cos(a)*24,y=48+Math.sin(a)*24;circ(c,x,y,14,'rgba(200,255,120,.3)');circ(c,x,y,7,'#e6ff8a');circ(c,x,y,3,'#fff')}c.strokeStyle='rgba(230,255,140,.4)';c.lineWidth=2;c.beginPath();c.arc(48,48,24,0,TAU);c.stroke();break;
    case 'chill':c.strokeStyle='#b6f3ff';c.lineWidth=5;for(let i=0;i<3;i++){const a=i*Math.PI/3;c.beginPath();c.moveTo(48+Math.cos(a)*34,48+Math.sin(a)*34);c.lineTo(48-Math.cos(a)*34,48-Math.sin(a)*34);c.stroke()}for(let i=0;i<6;i++){const a=i*Math.PI/3,x=48+Math.cos(a)*22,y=48+Math.sin(a)*22;c.beginPath();c.moveTo(x+Math.cos(a+.8)*8,y+Math.sin(a+.8)*8);c.lineTo(x,y);c.lineTo(x+Math.cos(a-.8)*8,y+Math.sin(a-.8)*8);c.stroke()}break;
    case 'bomb':for(let i=0;i<8;i++){const a=i*TAU/8;c.strokeStyle=CANDYCOLS[i%6];c.lineWidth=6;c.beginPath();c.moveTo(48+Math.cos(a)*22,48+Math.sin(a)*22);c.lineTo(48+Math.cos(a)*40,48+Math.sin(a)*40);c.stroke()}drawCandy(c,48,48,Pk,2.2,.3);break;
    case 'candle':circ(c,48,34,26,'rgba(255,180,80,.25)');c.save();c.translate(48,70);c.scale(2.6,2.6);drawCandleObj(c,0,0,0,0,1);drawFlame(c,0,-14,0,0,1);c.restore();break;
    case 'salt':c.fillStyle='#e8eef8';rr(c,30,28,36,48,8);c.fill();c.fillStyle='#9aa6bf';rr(c,32,16,32,16,6);c.fill();c.fillStyle='#5a6680';for(let i=0;i<3;i++)circ(c,40+i*8,22,2,'#5a6680');c.fillStyle=W;for(let i=0;i<10;i++)c.fillRect(14+i*7,84-(i%3)*3,3,3);break;
    case 'sugar':c.fillStyle=Y;c.beginPath();c.moveTo(56,8);c.lineTo(24,54);c.lineTo(46,54);c.lineTo(38,88);c.lineTo(74,38);c.lineTo(52,38);c.closePath();c.fill();c.strokeStyle=O;c.lineWidth=3;c.stroke();break;
    case 'lucky':c.fillStyle=M;c.beginPath();c.moveTo(34,12);c.lineTo(58,12);c.lineTo(58,56);c.quadraticCurveTo(80,58,78,74);c.quadraticCurveTo(76,86,56,84);c.lineTo(40,84);c.quadraticCurveTo(32,84,34,70);c.closePath();c.fill();c.fillStyle=W;c.fillRect(34,12,24,10);c.fillStyle=Pk;for(let i=0;i<3;i++)c.fillRect(34,30+i*10,24,4);c.fillStyle=Y;starPath(c,72,24,10);c.fill();break;
    case 'twin':wedge(-Math.PI/2,.35,44,'rgba(255,230,150,.95)');wedge(Math.PI/2,.35,44,'rgba(255,230,150,.95)');circ(c,48,48,9,W);break;
    case 'prism':wedge(0,.12,46,'rgba(255,240,180,.95)',4,48);c.fillStyle='rgba(200,230,255,.85)';c.beginPath();c.moveTo(48,26);c.lineTo(66,66);c.lineTo(30,66);c.closePath();c.fill();
      for(const [a,col] of[[-.45,'rgba(255,120,160,.9)'],[0,'rgba(120,255,200,.9)'],[.45,'rgba(140,170,255,.9)']]){c.strokeStyle=col;c.lineWidth=6;c.beginPath();c.moveTo(60,52);c.lineTo(60+Math.cos(a)*34,52+Math.sin(a)*34);c.stroke()}break;
    case 'angel':c.strokeStyle=Y;c.lineWidth=5;c.beginPath();c.ellipse(48,18,16,5,0,0,TAU);c.stroke();c.save();c.translate(48,44);c.scale(2.2,2.2);c.fillStyle='#e6fff6';wispPath(c,11,0,0);c.fill();ell(c,-4,-1,2,2.6,D);ell(c,4,-1,2,2.6,D);c.restore();break;
    case 'snack':c.fillStyle='#c98a4a';c.beginPath();c.moveTo(26,30);c.lineTo(70,30);c.lineTo(76,82);c.lineTo(20,82);c.closePath();c.fill();c.fillStyle='#a86c32';c.fillRect(26,26,44,8);drawCandy(c,48,56,Pk,1.8,.2);break;
    default:
      if(k.startsWith('sk_')){c.save();c.translate(48,62);c.scale(2.3,2.3);drawLumi(c,0,0,.4,0,k.slice(3),false,1);c.restore()}
      else if(k.startsWith('bm_')){const b=BEAMS.find(x=>x.id===k.slice(3))||BEAMS[0];wedge(-Math.PI/2,.5,70,'rgba('+b.c.join(',')+',1)',48,86);lampAt(48,86,-Math.PI/2)}
      else if(k.startsWith('gh_')){const tp=k.slice(3);const g=demoGhostFor(tp);c.save();c.translate(48,44);c.scale(1.6,1.6);c.translate(-g.x,-g.y);drawGhostBody(c,g,.5);drawGhostEyes(c,g,.5,1);c.restore()}
      else if(k.startsWith('ghx_')){const g=demoGhostFor(k.slice(4));c.save();c.translate(48,44);c.scale(1.6,1.6);c.translate(-g.x,-g.y);c.fillStyle='#120c20';ghostShape(c,g,.5);c.fill();c.restore()}
  }
}
function demoGhostFor(tp){const d=GT[tp]||GT.wisp;return{tp,look:tp,x:0,y:0,r:Math.min(d.r,20),hp:1,fear:0,alpha:1,ph:0,lit:false,col:d.col,eye:d.eye,spawnT:0,hitT:0}}

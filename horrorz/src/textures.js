/* ---------- procedural textures (generated once, cached) ---------- */
const NZP=(()=>{const r=srng(91731);const p=new Uint16Array(512);const a=[];for(let i=0;i<256;i++)a.push(i);for(let i=255;i>0;i--){const j=Math.floor(r()*(i+1));const tmp=a[i];a[i]=a[j];a[j]=tmp}for(let i=0;i<512;i++)p[i]=a[i&255];const v=new Float32Array(256);for(let i=0;i<256;i++)v[i]=r();return{p,v}})();
function hh(x,y){return NZP.v[NZP.p[(NZP.p[x&255]+(y&255))&511]&255]}
/* periodic value noise: cell size cs px, period per cells */
function vn(x,y,cs,per){const fx=x/cs,fy=y/cs,xi=Math.floor(fx),yi=Math.floor(fy),xf=fx-xi,yf=fy-yi;
  const u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);const pw=per||256;
  const x0=((xi%pw)+pw)%pw,x1=(x0+1)%pw,y0=((yi%pw)+pw)%pw,y1=(y0+1)%pw;
  const a=hh(x0,y0),b=hh(x1,y0),c=hh(x0,y1),d=hh(x1,y1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
function fbm(x,y,cs,S,oct){let s=0,a=.5,n=0;for(let o=0;o<(oct||4);o++){s+=vn(x,y,cs,S/cs)*a;n+=a;a*=.5;cs/=2;if(cs<1)break}return s/n}
function vn2(x,y,cx,cy,px,py){const fx=x/cx,fy=y/cy,xi=Math.floor(fx),yi=Math.floor(fy),xf=fx-xi,yf=fy-yi;
  const u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);const x0=((xi%px)+px)%px,x1=(x0+1)%px,y0=((yi%py)+py)%py,y1=(y0+1)%py;
  const a=hh(x0,y0),b=hh(x1,y0),c=hh(x0,y1),d=hh(x1,y1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
function fbmA(x,y,cx,cy,S,oct){let s=0,a=.5,n=0;for(let o=0;o<(oct||3);o++){s+=vn2(x,y,cx,cy,Math.max(1,Math.round(S/cx)),Math.max(1,Math.round(S/cy)))*a;n+=a;a*=.5;cx/=2;cy=Math.max(1,cy/2)}return s/n}
const TEX={};
function mkCanvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
function pixelTex(w,h,fn){const cv=mkCanvas(w,h),c=cv.getContext('2d'),id=c.createImageData(w,h),d=id.data;const o=[0,0,0,255];
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){fn(x,y,o);const i=(y*w+x)*4;d[i]=o[0];d[i+1]=o[1];d[i+2]=o[2];d[i+3]=o[3]}
  c.putImageData(id,0,0);return cv}
const cl8=v=>v<0?0:v>255?255:v;

/* rows of planks; returns per-row cut lists so the result tiles */
function plankRows(S,rowH,minL,maxL,seed){const r=srng(seed);const rows=[];for(let y=0;y<S;y+=rowH){const cuts=[];let x=Math.floor(r()*S);const st=x;let acc=0;
  while(acc<S){cuts.push(((x%S)+S)%S);const l=minL+r()*(maxL-minL);x+=l;acc+=l}rows.push({cuts:cuts.sort((a,b)=>a-b),tones:cuts.map(()=>r()),seeds:cuts.map(()=>r()*100)})}return rows}
function plankAt(row,x){let i=row.cuts.length-1;for(let j=0;j<row.cuts.length;j++){if(row.cuts[j]>x){i=j-1;break}}if(i<0)i=row.cuts.length-1;return i}

function woodTex(key,base,S,rowH,minL,maxL,opt){
  if(TEX[key])return TEX[key];opt=opt||{};
  const rows=plankRows(S,rowH,minL,maxL,hashStr(key));
  const knots=[];const kr=srng(hashStr(key+'k'));for(let i=0;i<(opt.knots||6);i++)knots.push([kr()*S,kr()*S,3+kr()*5]);
  TEX[key]=pixelTex(S,S,(x,y,o)=>{
    const ri=Math.floor(y/rowH)%rows.length,row=rows[ri],pi=plankAt(row,x);
    const tone=.78+row.tones[pi]*.36,sd=row.seeds[pi];
    const yy=y%rowH;
    const g=fbmA(x+sd*37,y,64,4,S,3);
    let grain=.5+.5*Math.sin((y*0.9+g*26+sd)*1.3);grain=.86+grain*.16;
    const fine=.95+vn2(x,y,2,8,S/2,S/8)*.1;
    const wear=fbm(x,y,128,S,3);
    let k=tone*grain*fine*(.9+wear*.2);
    for(const kn of knots){const dx=x-kn[0],dy=(y-kn[1])*2.4,dd=Math.sqrt(dx*dx+dy*dy);if(dd<kn[2]*2.2)k*=.72+.28*Math.abs(Math.sin(dd*1.4))}
    if(yy<1.2||yy>rowH-1.2)k*=opt.gap||.42;
    for(const c of row.cuts){const dx=Math.abs(x-c);if(dx<1.1)k*=opt.joint||.5}
    if(opt.nails){for(const c of row.cuts){if(Math.abs(x-c-5)<1.3&&(Math.abs(yy-rowH*.28)<1.3||Math.abs(yy-rowH*.72)<1.3))k*=.35}}
    const dust=opt.dust?Math.max(0,fbm(x+300,y,96,S,3)-.52)*opt.dust:0;
    o[0]=cl8(base[0]*k+dust*160);o[1]=cl8(base[1]*k+dust*150);o[2]=cl8(base[2]*k+dust*135);o[3]=255});
  return TEX[key];
}
function stoneTex(key,base,S,rowH,minW,maxW,opt){
  if(TEX[key])return TEX[key];opt=opt||{};
  const rows=plankRows(S,rowH,minW,maxW,hashStr(key));const mort=opt.mortar||3;
  TEX[key]=pixelTex(S,S,(x,y,o)=>{
    const ri=Math.floor(y/rowH)%rows.length,row=rows[ri],pi=plankAt(row,x);
    const tone=.8+row.tones[pi]*.32;const yy=y%rowH;
    let ex=1e9;for(const c of row.cuts){const d=Math.abs(x-c);if(d<ex)ex=d;const d2=Math.abs(x-c-S);if(d2<ex)ex=d2;const d3=Math.abs(x-c+S);if(d3<ex)ex=d3}
    const ey=Math.min(yy,rowH-yy),e=Math.min(ex,ey);
    const n=fbm(x,y,32,S,5),n2=fbm(x+90,y+40,8,S,3);
    let k=tone*(.78+n*.36)*(.92+n2*.14);
    if(e<mort){const m=opt.mortCol||[.42,.4,.38];const moss=opt.moss?Math.max(0,fbm(x+500,y,48,S,3)-.5)*opt.moss:0;
      o[0]=cl8(base[0]*m[0]*1.6*(.8+n*.4));o[1]=cl8(base[1]*m[1]*1.6*(.8+n*.4)+moss*90);o[2]=cl8(base[2]*m[2]*1.6*(.8+n*.4));o[3]=255;return}
    if(e<mort+3)k*=.78+.22*((e-mort)/3);
    if(ey>mort&&yy<mort+4)k*=1.08;
    const stain=Math.max(0,fbm(x+200,y+70,96,S,3)-.55)*1.4;k*=1-stain*.35;
    const moss=opt.moss?Math.max(0,fbm(x+700,y+30,64,S,4)-.6)*opt.moss:0;
    o[0]=cl8(base[0]*k-moss*30);o[1]=cl8(base[1]*k+moss*40);o[2]=cl8(base[2]*k-moss*20);o[3]=255});
  return TEX[key];
}
function addCracks(cv,n,seed,col){const c=cv.getContext('2d'),r=srng(seed);c.strokeStyle=col||'rgba(10,8,8,.55)';c.lineWidth=1;
  for(let i=0;i<n;i++){let x=r()*cv.width,y=r()*cv.height,a=r()*TAU;c.beginPath();c.moveTo(x,y);for(let j=0;j<6+r()*8;j++){a+=(r()-.5)*1.2;x+=Math.cos(a)*(4+r()*8);y+=Math.sin(a)*(4+r()*8);c.lineTo(x,y)}c.stroke()}return cv}
function ironTex(key){if(TEX[key])return TEX[key];const S=256,P=128;
  const cv=pixelTex(S,S,(x,y,o)=>{const px=x%P,py=y%P;const n=fbm(x,y,16,S,5);let k=.82+n*.3;
    const e=Math.min(px,py,P-px,P-py);if(e<2)k*=.35;else if(px<5||py<5)k*=1.25;else if(px>P-6||py>P-6)k*=.7;
    const dia=((x+y)%12<1.5||(x-y+600)%12<1.5)?.9:1;k*=dia;
    const rust=Math.max(0,fbm(x+40,y+90,48,S,4)-.55)*2;
    o[0]=cl8(64*k+rust*70);o[1]=cl8(62*k+rust*32);o[2]=cl8(60*k+rust*10);o[3]=255});
  const c=cv.getContext('2d');for(let gx=0;gx<S;gx+=P)for(let gy=0;gy<S;gy+=P)for(const [ox,oy] of[[8,8],[P-8,8],[8,P-8],[P-8,P-8]]){const g=c.createRadialGradient(gx+ox-1,gy+oy-1,0,gx+ox,gy+oy,4);g.addColorStop(0,'#a8a6a2');g.addColorStop(1,'#2a2826');c.fillStyle=g;c.beginPath();c.arc(gx+ox,gy+oy,3.4,0,TAU);c.fill()}
  return TEX[key]=cv}
function tileTex(key,base,S,ts,opt){if(TEX[key])return TEX[key];opt=opt||{};const r=srng(hashStr(key));const tones=[];for(let i=0;i<(S/ts)*(S/ts);i++)tones.push(r());
  const cv=pixelTex(S,S,(x,y,o)=>{const tx=Math.floor(x/ts),ty=Math.floor(y/ts),px=x%ts,py=y%ts,e=Math.min(px,py,ts-px,ts-py);const n=fbm(x,y,16,S,5);
    if(e<2.5){const moss=Math.max(0,fbm(x+50,y,32,S,3)-.45)*(opt.moss||0);o[0]=cl8(96+n*30-moss*30);o[1]=cl8(92+n*30+moss*60);o[2]=cl8(84+n*28-moss*20);o[3]=255;return}
    const tone=.82+tones[ty*(S/ts)+tx]*.3;let k=tone*(.82+n*.3);if(e<5)k*=.9;if(px<6&&py<6)k*=1.06;
    const wear=Math.max(0,fbm(x+300,y+300,64,S,3)-.5)*.8;
    o[0]=cl8(base[0]*k+wear*60);o[1]=cl8(base[1]*k+wear*50);o[2]=cl8(base[2]*k+wear*40);o[3]=255});
  return TEX[key]=addCracks(cv,opt.cracks||6,hashStr(key+'c'),'rgba(30,18,12,.5)')}

function floorTex(kind){
  switch(kind){
    case 'parquet':return woodTex('parquet',[112,70,40],512,32,260,520,{knots:5,dust:.6,gap:.62,joint:.62});
    case 'boards':return woodTex('boards',[104,86,66],512,46,320,700,{knots:9,gap:.3,nails:true,dust:1.1});
    case 'flagstone':return addCracks(stoneTex('flag',[92,94,98],512,64,64,150,{mortar:3,moss:.6}),6,77);
    case 'iron':return ironTex('iron');
    case 'terracotta':return tileTex('terra',[150,82,58],512,64,{moss:.5,cracks:10});
  }
}
/* small textures for furniture */
function woodGrain(key,base){return woodTex('wg_'+key,base,256,64,600,600,{knots:2,gap:1})}
function stoneGrain(key,base){if(TEX['sg_'+key])return TEX['sg_'+key];return TEX['sg_'+key]=pixelTex(256,256,(x,y,o)=>{const n=fbm(x,y,32,256,5),n2=fbm(x+70,y,8,256,3);const k=.8+n*.3+n2*.1;o[0]=cl8(base[0]*k);o[1]=cl8(base[1]*k);o[2]=cl8(base[2]*k);o[3]=255})}
function pat(c,cv,scale){const p=c.createPattern(cv,'repeat');if(scale&&p.setTransform){try{p.setTransform(new DOMMatrix([scale,0,0,scale,0,0]))}catch(e){}}return p}

/* wall faces (top wall), WALLT tall, tile 256 wide */
function wallTex(kind,ch){
  const key='wall_'+kind;if(TEX[key])return TEX[key];
  const S=256,H=WALLT;let cv;
  if(kind==='damask'){
    const pc=hexRgb(ch.paper),pc2=hexRgb(ch.paper2);
    cv=pixelTex(S,H,(x,y,o)=>{const n=fbm(x,y,32,S,4);const stain=Math.max(0,fbm(x*.5,y*.08+x*.02,64,S,3)-.45)*1.6;const k=(.86+n*.22)*(1-stain*.3);
      const v=Math.sin(x/S*TAU*8)*.5+.5;const m=pc.map((c,i)=>c+(pc2[i]-c)*v*.3);o[0]=cl8(m[0]*k);o[1]=cl8(m[1]*k);o[2]=cl8(m[2]*k);o[3]=255});
    const c=cv.getContext('2d');c.fillStyle='rgba(220,180,140,.07)';c.strokeStyle='rgba(230,190,150,.09)';c.lineWidth=1.2;
    for(let gx=0;gx<S+32;gx+=32)for(let gy=0,j=0;gy<H-40;gy+=36,j++){const x=gx+(j%2?16:0),y=gy+12;
      c.beginPath();c.moveTo(x,y-11);c.bezierCurveTo(x+9,y-6,x+9,y+4,x,y+11);c.bezierCurveTo(x-9,y+4,x-9,y-6,x,y-11);c.fill();c.beginPath();c.arc(x,y,4,0,TAU);c.stroke();
      c.beginPath();c.moveTo(x-8,y-8);c.quadraticCurveTo(x-14,y,x-8,y+8);c.moveTo(x+8,y-8);c.quadraticCurveTo(x+14,y,x+8,y+8);c.stroke()}
    // vertical water stains / peeling
    const r=srng(5);for(let i=0;i<5;i++){const x=r()*S,w=4+r()*10,l=20+r()*50;const g=c.createLinearGradient(0,0,0,l);g.addColorStop(0,'rgba(20,10,5,.25)');g.addColorStop(1,'rgba(20,10,5,0)');c.fillStyle=g;c.fillRect(x,0,w,l)}
    // wainscot
    const wy=H-46,wd=woodGrain('wain',[70,42,26]);c.fillStyle=pat(c,wd,.6);c.fillRect(0,wy,S,46);
    for(let x=6;x<S;x+=64){c.fillStyle='rgba(0,0,0,.28)';c.fillRect(x,wy+8,52,28);c.fillStyle='rgba(255,220,180,.08)';c.fillRect(x+2,wy+10,48,2);c.fillRect(x+2,wy+10,2,24);c.fillStyle='rgba(0,0,0,.25)';c.fillRect(x+2,wy+33,50,2)}
    c.fillStyle='#2a170d';c.fillRect(0,wy-4,S,5);c.fillStyle='rgba(255,220,180,.12)';c.fillRect(0,wy-4,S,1);
    c.fillStyle='#1a0e08';c.fillRect(0,H-7,S,7);
  }else if(kind==='timber'){
    cv=mkCanvas(S,H);const c=cv.getContext('2d');const wd=woodTex('timberv',[86,66,46],256,32,500,500,{knots:4,gap:.35});
    c.save();c.translate(S,0);c.rotate(Math.PI/2);c.fillStyle=pat(c,wd,1);c.fillRect(0,0,H,S);c.restore();
    c.fillStyle='rgba(0,0,0,.25)';c.fillRect(0,0,S,H);
    const bw=woodTex('beam',[60,44,30],256,40,600,600,{knots:2});c.fillStyle=pat(c,bw,1);c.fillRect(0,0,S,22);c.fillStyle='rgba(0,0,0,.45)';c.fillRect(0,22,S,4);
    c.fillStyle='rgba(220,220,230,.08)';for(let i=0;i<4;i++){c.beginPath();c.moveTo(i*64,26);c.quadraticCurveTo(i*64+20,40,i*64+40,26);c.lineWidth=1;c.strokeStyle='rgba(220,220,230,.12)';c.stroke()}
    c.fillStyle='#120c08';c.fillRect(0,H-6,S,6);
  }else if(kind==='stone'){
    const raw=stoneTex('wallstone',[78,82,90],256,30,50,110,{mortar:2.5,moss:.7});cv=(()=>{const o=mkCanvas(S,H),c=o.getContext('2d');c.drawImage(raw,0,0);
      const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(0,0,0,.35)');g.addColorStop(.6,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(10,30,20,.35)');c.fillStyle=g;c.fillRect(0,0,S,H);return o})();
  }else if(kind==='brick'){
    const raw=stoneTex('brick',[122,62,46],256,16,36,46,{mortar:2,mortCol:[.62,.62,.62]});cv=mkCanvas(S,H);const c=cv.getContext('2d');c.drawImage(raw,0,0);
    const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(5,3,2,.6)');g.addColorStop(.5,'rgba(5,3,2,.1)');g.addColorStop(1,'rgba(5,3,2,.3)');c.fillStyle=g;c.fillRect(0,0,S,H);
  }else{ // glass greenhouse wall
    cv=mkCanvas(S,H);const c=cv.getContext('2d');const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0c1626');g.addColorStop(.7,'#16263a');g.addColorStop(1,'#0a120e');c.fillStyle=g;c.fillRect(0,0,S,H);
    const r=srng(9);for(let i=0;i<30;i++){c.fillStyle='rgba(220,230,255,'+(.2+r()*.5)+')';c.fillRect(r()*S,r()*H*.5,1,1)}
    for(let i=0;i<14;i++){const x=r()*S,y=H*.62+r()*H*.3,rr2=10+r()*22;c.fillStyle='rgba(8,18,12,.95)';c.beginPath();c.arc(x,y,rr2,0,TAU);c.fill()}
    c.fillStyle='rgba(160,200,255,.05)';c.beginPath();c.moveTo(0,H);c.lineTo(60,0);c.lineTo(90,0);c.lineTo(30,H);c.fill();
    c.strokeStyle='#1c2226';c.lineWidth=5;for(let x=0;x<=S;x+=64){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke()}c.lineWidth=3;for(let y=30;y<H;y+=40){c.beginPath();c.moveTo(0,y);c.lineTo(S,y);c.stroke()}
    c.strokeStyle='rgba(180,200,210,.18)';c.lineWidth=1;for(let x=0;x<=S;x+=64){c.beginPath();c.moveTo(x-2,0);c.lineTo(x-2,H);c.stroke()}
    c.fillStyle='#262a2a';c.fillRect(0,H-14,S,14);c.fillStyle='rgba(255,255,255,.06)';c.fillRect(0,H-14,S,1);
  }
  return TEX[key]=cv;
}
function capTex(ch){const key='cap_'+ch.wallf;if(TEX[key])return TEX[key];const b=hexRgb(ch.trim);
  return TEX[key]=pixelTex(128,128,(x,y,o)=>{const n=fbm(x,y,16,128,4);const k=.8+n*.5;o[0]=cl8(b[0]*k+6);o[1]=cl8(b[1]*k+5);o[2]=cl8(b[2]*k+5);o[3]=255})}
function fogTex(){if(TEX.fog)return TEX.fog;return TEX.fog=pixelTex(256,256,(x,y,o)=>{const n=fbm(x,y,64,256,4);const v=Math.max(0,n-.35)/.65;o[0]=200;o[1]=205;o[2]=215;o[3]=cl8(v*v*255)})}
function grainTex(){if(TEX.grain)return TEX.grain;const r=srng(4);return TEX.grain=pixelTex(128,128,(x,y,o)=>{const v=r()*255;o[0]=v;o[1]=v;o[2]=v;o[3]=26})}
